import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, isCancel, multiselect, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Command, program } from 'commander';
import { resolveCommand } from 'package-manager-detector/commands';
import { detect } from 'package-manager-detector/detect';
import * as v from 'valibot';
import { context } from '..';
import * as ascii from '../utils/ascii';
import { getInstalled, resolveTree } from '../utils/blocks';
import { type Block, isTestFile } from '../utils/build';
import { getConfig } from '../utils/config';
import { installDependencies } from '../utils/dependencies';
import { getWatermark } from '../utils/get-watermark';
import * as gitProviders from '../utils/git-providers';
import { languages } from '../utils/language-support';
import { type Task, intro, nextSteps, runTasks } from '../utils/prompts';

const schema = v.object({
	repo: v.optional(v.string()),
	allow: v.boolean(),
	yes: v.boolean(),
	verbose: v.boolean(),
	cwd: v.string(),
});

type Options = v.InferInput<typeof schema>;

const add = new Command('add')
	.argument(
		'[blocks...]',
		'Names of the blocks you want to add to your project. ex: (utils/math, github/ieedan/std/utils/math)'
	)
	.option('--repo <repo>', 'Repository to download the blocks from.')
	.option('-A, --allow', 'Allow jsrepo to download code from the provided repo.', false)
	.option('-y, --yes', 'Skip confirmation prompt.', false)
	.option('--verbose', 'Include debug logs.', false)
	.option('--cwd <path>', 'The current working directory.', process.cwd())
	.action(async (blockNames, opts) => {
		const options = v.parse(schema, opts);

		intro(context.package.version);

		await _add(blockNames, options);

		outro(color.green('All done!'));
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _add = async (blockNames: string[], options: Options) => {
	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${ascii.INFO} ${msg}`);
		}
	};

	verbose(`Attempting to add ${JSON.stringify(blockNames)}`);

	const loading = spinner();

	const config = getConfig(options.cwd).match(
		(val) => val,
		(err) => program.error(color.red(err))
	);

	let repoPaths = config.repos;

	// we just want to override all others if supplied via the CLI
	if (options.repo) repoPaths = [options.repo];

	// resolve repos for blocks
	for (const blockSpecifier of blockNames) {
		// we are only getting repos for blocks that specified repos
		if (!blockSpecifier.startsWith('github')) continue;

		const [providerName, owner, repoName, ...rest] = blockSpecifier.split('/');

		let repo: string;
		// if rest is greater than 2 it isn't the block specifier so it is part of the path
		if (rest.length > 2) {
			repo = `${providerName}/${owner}/${repoName}/${rest.join('/')}`;
		} else {
			repo = `${providerName}/${owner}/${repoName}`;
		}

		if (!repoPaths.find((repoPath) => repoPath === repo)) {
			if (!options.allow) {
				const result = await confirm({
					message: `Allow ${color.cyan('jsrepo')} to download and run code from ${color.cyan(repo)}?`,
					initialValue: true,
				});

				if (isCancel(result) || !result) {
					cancel('Canceled!');
					process.exit(0);
				}
			}

			repoPaths.push(repo);
		}
	}

	if (!options.allow && options.repo) {
		const result = await confirm({
			message: `Allow ${color.cyan('jsrepo')} to download and run code from ${color.cyan(options.repo)}?`,
			initialValue: true,
		});

		if (isCancel(result) || !result) {
			cancel('Canceled!');
			process.exit(0);
		}
	}

	verbose(`Fetching blocks from ${color.cyan(repoPaths.join(', '))}`);

	if (!options.verbose) loading.start(`Fetching blocks from ${color.cyan(repoPaths.join(', '))}`);

	const blocksMap: Map<string, RemoteBlock> = (
		await gitProviders.fetchBlocks(...repoPaths)
	).match(
		(val) => val,
		({ repo, message }) => {
			loading.stop(`Failed fetching blocks from ${color.cyan(repo)}`);
			program.error(color.red(message));
		}
	);

	if (!options.verbose) loading.stop(`Retrieved blocks from ${color.cyan(repoPaths.join(', '))}`);

	verbose(`Retrieved blocks from ${color.cyan(repoPaths.join(', '))}`);

	const installedBlocks = getInstalled(blocksMap, config, options.cwd).map(
		(val) => val.specifier
	);

	let installingBlockNames = blockNames;

	// if no blocks are provided prompt the user for what blocks they want
	if (installingBlockNames.length === 0) {
		const promptResult = await multiselect({
			message: 'Select which blocks to add.',
			options: Array.from(blocksMap.entries()).map(([key, value]) => {
				const shortName = `${value.category}/${value.name}`;

				const blockExists =
					installedBlocks.findIndex((block) => block === shortName) !== -1;

				let label: string;

				// show the full repo if there are multiple repos
				if (repoPaths.length > 1) {
					label = `${color.cyan(
						`${value.sourceRepo.name}/${value.sourceRepo.owner}/${value.sourceRepo.repoName}/${value.category}`
					)}/${value.name}`;
				} else {
					label = `${color.cyan(value.category)}/${value.name}`;
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

	verbose(`Installing blocks ${color.cyan(installingBlockNames.join(', '))}`);

	if (options.verbose) console.log('Blocks map: ', blocksMap);

	const installingBlocks = (await resolveTree(installingBlockNames, blocksMap, repoPaths)).match(
		(val) => val,
		program.error
	);

	const pm = (await detect({ cwd: process.cwd() }))?.agent ?? 'npm';

	const tasks: Task[] = [];

	const devDeps: Set<string> = new Set<string>();
	const deps: Set<string> = new Set<string>();

	for (const { block } of installingBlocks) {
		const fullSpecifier = `${block.sourceRepo.url}/${block.category}/${block.name}`;
		const watermark = getWatermark(context.package.version, block.sourceRepo.url);

		const providerInfo = block.sourceRepo;

		verbose(`Setting up ${fullSpecifier}`);

		const directory = path.join(options.cwd, config.path, block.category);

		const blockExists =
			(!block.subdirectory && fs.existsSync(path.join(directory, block.files[0]))) ||
			(block.subdirectory && fs.existsSync(path.join(directory, block.name)));

		if (blockExists && !options.yes) {
			const result = await confirm({
				message: `${color.bold(block.name)} already exists in your project would you like to overwrite it?`,
				initialValue: false,
			});

			if (isCancel(result) || !result) {
				cancel('Canceled!');
				process.exit(0);
			}
		}

		tasks.push({
			loadingMessage: `Adding ${fullSpecifier}`,
			completedMessage: `Added ${fullSpecifier}`,
			run: async () => {
				verbose(`Creating directory ${color.bold(directory)}`);
				// in case the directory didn't already exist
				fs.mkdirSync(directory, { recursive: true });

				const files: { content: string; destPath: string }[] = [];

				const getSourceFile = async (filePath: string) => {
					const rawUrl = await providerInfo.provider.resolveRaw(providerInfo, filePath);

					const response = await fetch(rawUrl);

					if (!response.ok) {
						loading.stop(color.red(`Error fetching ${color.bold(rawUrl.href)}`));
						program.error(
							color.red(`There was an error trying to get ${fullSpecifier}`)
						);
					}

					return await response.text();
				};

				for (const sourceFile of block.files) {
					if (!config.includeTests && isTestFile(sourceFile)) continue;

					const sourcePath = path.join(block.directory, sourceFile);

					let destPath: string;
					if (block.subdirectory) {
						destPath = path.join(directory, block.name, sourceFile);
					} else {
						destPath = path.join(directory, sourceFile);
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
						const lang = languages.find((lang) => lang.matches(file.destPath));

						if (lang) {
							const comment = lang.comment(watermark);

							content = `${comment}\n\n${content}`;
						}
					}

					fs.writeFileSync(file.destPath, content);
				}

				if (config.includeTests) {
					verbose('Trying to include tests');

					const { devDependencies } = JSON.parse(
						fs.readFileSync(path.join(options.cwd, 'package.json')).toString()
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

	await runTasks(tasks, { verbose: options.verbose ? verbose : undefined });

	const hasDependencies = deps.size > 0 || devDeps.size > 0;

	if (hasDependencies) {
		let install = options.yes;
		if (!options.yes) {
			const result = await confirm({
				message: 'Would you like to install dependencies?',
				initialValue: true,
			});

			if (isCancel(result)) {
				cancel('Canceled!');
				process.exit(0);
			}

			install = result;
		}

		if (install) {
			if (deps.size > 0) {
				if (!options.verbose)
					loading.start(`Installing dependencies with ${color.cyan(pm)}`);

				(
					await installDependencies({
						pm,
						deps: Array.from(deps),
						dev: false,
						cwd: options.cwd,
					})
				).match(
					(installed) => {
						if (!options.verbose)
							loading.stop(`Installed ${color.cyan(installed.join(', '))}`);
					},
					(err) => {
						if (!options.verbose) loading.stop('Failed to install dependencies');

						program.error(err);
					}
				);
			}

			if (devDeps.size > 0) {
				if (!options.verbose)
					loading.start(`Installing dependencies with ${color.cyan(pm)}`);

				(
					await installDependencies({
						pm,
						deps: Array.from(devDeps),
						dev: true,
						cwd: options.cwd,
					})
				).match(
					(installed) => {
						if (!options.verbose)
							loading.stop(`Installed ${color.cyan(installed.join(', '))}`);
					},
					(err) => {
						if (!options.verbose) loading.stop('Failed to install dev dependencies');

						program.error(err);
					}
				);
			}
		}

		// next steps if they didn't install dependencies
		let steps = [];

		if (!install) {
			if (deps.size > 0) {
				const cmd = resolveCommand(pm, 'install', [...deps]);

				steps.push(
					`Install dependencies \`${color.cyan(`${cmd?.command} ${cmd?.args.join(' ')}`)}\``
				);
			}

			if (devDeps.size > 0) {
				const cmd = resolveCommand(pm, 'install', [...devDeps, '-D']);

				steps.push(
					`Install dev dependencies \`${color.cyan(`${cmd?.command} ${cmd?.args.join(' ')}`)}\``
				);
			}
		}

		// put steps with numbers above here
		steps = steps.map((step, i) => `${i + 1}. ${step}`);

		if (!install) {
			steps.push('');
		}

		steps.push(`Import the blocks from \`${color.cyan(config.path)}\``);

		const next = nextSteps(steps);

		process.stdout.write(next);
	}
};

export { add };
