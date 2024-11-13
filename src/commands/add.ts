import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, intro, isCancel, multiselect, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Argument, Command, program } from 'commander';
import { execa } from 'execa';
import type { ResolvedCommand } from 'package-manager-detector';
import { resolveCommand } from 'package-manager-detector/commands';
import { detect } from 'package-manager-detector/detect';
import { Project, type SourceFile } from 'ts-morph';
import { type InferInput, array, boolean, object, optional, parse, string } from 'valibot';
import { context } from '..';
import { getConfig } from '../config';
import { type Block, categorySchema } from '../utils/build';
import { getInstalledBlocks } from '../utils/get-installed-blocks';
import { getWatermark } from '../utils/get-watermark';
import * as gitProviders from '../utils/git-providers';
import { INFO, WARN } from '../utils/index';
import { type Task, runTasks } from '../utils/prompts';
import { OUTPUT_FILE } from './build';

const schema = object({
	yes: boolean(),
	verbose: boolean(),
	repo: optional(string()),
	allow: boolean(),
});

type Options = InferInput<typeof schema>;

const add = new Command('add')
	.addArgument(new Argument('[blocks...]', 'Whichever block you want to add to your project.'))
	.option('-y, --yes', 'Add and install any required dependencies.', false)
	.option('-A, --allow', 'Allow ts-blocks to download code from the provided repo.', false)
	.option('--repo <repo>', 'Repository to download the blocks from')
	.option('--verbose', 'Include debug logs.', false)
	.action(async (blockNames, opts) => {
		const options = parse(schema, opts);

		await _add(blockNames, options);
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _add = async (blockNames: string[], options: Options) => {
	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${INFO} ${msg}`);
		}
	};

	verbose(`Attempting to add ${JSON.stringify(blockNames)}`);

	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const loading = spinner();

	const config = getConfig();

	const blocksMap: Map<string, RemoteBlock> = new Map();

	let repoPaths = config.repos;

	// we just want to override all others if supplied via the CLI
	if (options.repo) repoPaths = [options.repo];

	if (!options.allow && options.repo) {
		const result = await confirm({
			message: `Allow ${color.cyan('ts-blocks')} to download the manifest and other files from ${color.cyan(
				options.repo
			)}?`,
			initialValue: true,
		});

		if (isCancel(result) || !result) {
			cancel('Canceled!');
			process.exit(0);
		}
	}

	loading.start(`Fetching blocks from ${color.cyan(repoPaths.join(', '))}`);

	for (const repo of repoPaths) {
		let manifestUrl: URL;
		let providerInfo: gitProviders.Info;

		if (gitProviders.github.matches(repo)) {
			providerInfo = gitProviders.github.info(repo);

			manifestUrl = gitProviders.github.resolveRaw(providerInfo, OUTPUT_FILE);
		} else {
			// if you want to support your provider open a PR!
			program.error(color.red('Only GitHub repositories are supported at this time!'));
		}

		const response = await fetch(manifestUrl);

		if (!response.ok) {
			loading.stop(`Error fetching ${color.cyan(manifestUrl.href)}`);
			program.error(
				color.red(
					`There was an error fetching the \`${OUTPUT_FILE}\` from the repository ${color.cyan(
						repo
					)} make sure the target repository has a \`${OUTPUT_FILE}\` in its root?`
				)
			);
		}

		const categories = parse(array(categorySchema), await response.json());

		for (const category of categories) {
			for (const block of category.blocks) {
				// blocks will override each other
				blocksMap.set(`${category.name}/${block.name}`, {
					...block,
					sourceRepo: providerInfo,
				});
			}
		}
	}

	loading.stop(`Retrieved blocks from ${color.cyan(repoPaths.join(','))}`);

	const installedBlocks = getInstalledBlocks(blocksMap, config);

	let installingBlockNames = blockNames;

	if (installingBlockNames.length === 0) {
		const promptResult = await multiselect({
			message: 'Select which blocks to add.',
			options: Array.from(blocksMap.entries()).map(([key, value]) => {
				const blockExists = installedBlocks.findIndex((block) => block === key) !== -1;

				const [category, name] = key.split('/');

				let label: string;

				// show the full repo if there are multiple repos
				if (repoPaths.length > 1) {
					label = `${color.cyan(
						`${value.sourceRepo.name}/${value.sourceRepo.owner}/${value.sourceRepo.repoName}/${category}`
					)}/${name}`;
				} else {
					label = `${color.cyan(category)}/${name}`;
				}

				return {
					label: blockExists ? color.gray(label) : label,
					value: key,
					// show hint for `Installed` if block is already installed
					hint: blockExists ? 'Installed' : undefined,
				};
			}),
			required: true,
		});

		if (isCancel(promptResult)) {
			cancel('Canceled!');
			process.exit(0);
		}

		installingBlockNames = promptResult as string[];
	}

	const installingBlocks: {
		name: string;
		subDependency: boolean;
		block: RemoteBlock;
	}[] = [];

	installingBlockNames.map((blockSpecifier) => {
		const block = blocksMap.get(blockSpecifier);

		if (!block) {
			program.error(
				color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`)
			);
		}

		installingBlocks.push({ name: blockSpecifier, subDependency: false, block });

		if (block.localDependencies && block.localDependencies.length > 0) {
			for (const dep of block.localDependencies) {
				if (installingBlocks.find(({ name }) => name === dep)) continue;

				// this resolves remote blocks correctly as well because they will reference a local path
				// the blocks in the blocks map already know where they come from
				const block = blocksMap.get(dep);

				if (!block) {
					program.error(
						color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`)
					);
				}

				installingBlocks.push({ name: dep, subDependency: true, block });
			}
		}
	});

	const pm = (await detect({ cwd: process.cwd() }))?.agent ?? 'npm';

	const tasks: Task[] = [];

	const devDeps: Set<string> = new Set<string>();
	const deps: Set<string> = new Set<string>();

	for (const { name: specifier, block } of installingBlocks) {
		const [_, blockName] = specifier.split('/');

		const watermark = getWatermark(context.package.version, block.sourceRepo.url);

		const providerInfo = block.sourceRepo;

		verbose(`Attempting to add ${specifier}`);

		const directory = path.join(config.path, block.category);

		verbose(`Creating directory ${color.bold(directory)}`);

		const blockExists =
			(!block.subdirectory && fs.existsSync(path.join(directory, `${blockName}.ts`))) ||
			(block.subdirectory && fs.existsSync(path.join(directory, blockName)));

		if (blockExists && !options.yes) {
			const result = await confirm({
				message: `${color.bold(blockName)} already exists in your project would you like to overwrite it?`,
				initialValue: false,
			});

			if (isCancel(result) || !result) {
				cancel('Canceled!');
				process.exit(0);
			}
		}

		tasks.push({
			loadingMessage: `Adding ${specifier}`,
			completedMessage: `Added ${specifier}`,
			run: async () => {
				// in case the directory didn't already exist
				fs.mkdirSync(directory, { recursive: true });

				const files: { content: string; destPath: string }[] = [];

				const getSourceFile = async (filePath: string) => {
					const rawUrl = providerInfo.provider.resolveRaw(providerInfo, filePath);

					const response = await fetch(rawUrl);

					if (!response.ok) {
						loading.stop(color.red(`Error fetching ${color.bold(rawUrl.href)}`));
						program.error(color.red(`There was an error trying to get ${specifier}`));
					}

					return await response.text();
				};

				for (const sourceFile of block.files) {
					if (!config.includeTests && sourceFile.endsWith('test.ts')) continue;

					const sourcePath = path.join(block.directory, sourceFile);

					let destPath: string;
					if (block.subdirectory) {
						destPath = path.join(config.path, block.category, block.name, sourceFile);
					} else {
						destPath = path.join(config.path, block.category, sourceFile);
					}

					const content = await getSourceFile(sourcePath);

					fs.mkdirSync(destPath.slice(0, destPath.length - sourceFile.length), {
						recursive: true,
					});

					files.push({ content, destPath });
				}

				for (const file of files) {
					let content: string = file.content;

					if (config.watermark) {
						content = `${watermark}${content}`;
					}

					fs.writeFileSync(file.destPath, content);
				}

				if (config.includeIndexFile) {
					verbose('Trying to include index file');

					const indexPath = path.join(directory, 'index.ts');

					try {
						let index: SourceFile;

						const project = new Project();

						if (fs.existsSync(indexPath)) {
							index = project.addSourceFileAtPath(indexPath);
						} else {
							index = project.createSourceFile(indexPath);
						}

						if (config.imports === 'node') {
							index.addExportDeclaration({
								moduleSpecifier: `./${blockName}`,
								isTypeOnly: false,
							});
						} else if (config.imports === 'deno') {
							index.addExportDeclaration({
								moduleSpecifier: `./${blockName}.ts`,
								isTypeOnly: false,
							});
						}

						index.saveSync();
					} catch {
						console.warn(`${WARN} Failed to modify ${indexPath}!`);
					}
				}

				if (config.includeTests) {
					verbose('Trying to include tests');

					const { devDependencies } = JSON.parse(
						fs.readFileSync('package.json').toString()
					);

					if (devDependencies.vitest === undefined) {
						devDeps.add('vitest');
					}
				}

				for (const dep of block.devDependencies) {
					devDeps.add(dep);
				}

				for (const dep of block.dependencies) {
					deps.add(dep);
				}
			},
		});
	}

	await runTasks(tasks, { verbose: options.verbose });

	const installDependencies = async (deps: string[], dev: boolean) => {
		loading.start(`Installing dependencies with ${color.cyan(pm)}`);

		let add: ResolvedCommand | null;
		if (dev) {
			add = resolveCommand(pm, 'install', [...deps, '-D']);
		} else {
			add = resolveCommand(pm, 'install', [...deps]);
		}

		if (add == null) {
			program.error(color.red(`Could not resolve add command for '${pm}'.`));
		}

		try {
			await execa(add.command, [...add.args], { cwd: process.cwd() });
		} catch {
			program.error(
				color.red(
					`Failed to install ${color.bold('vitest')}! Failed while running '${color.bold(
						`${add.command} ${add.args.join(' ')}`
					)}'`
				)
			);
		}

		loading.stop(`Installed ${color.cyan(deps.join(', '))}`);
	};

	const hasDependencies = deps.size > 0 || devDeps.size > 0;

	if (hasDependencies) {
		if (!options.yes) {
			const result = await confirm({
				message: 'Would you like to install dependencies?',
				initialValue: true,
			});

			if (isCancel(result) || !result) {
				cancel('Canceled!');
				process.exit(0);
			}
		}

		if (deps.size > 0) {
			await installDependencies(Array.from(deps), false);
		}

		if (devDeps.size > 0) {
			await installDependencies(Array.from(devDeps), true);
		}
	}

	outro(color.green('All done!'));
};

export { add };
