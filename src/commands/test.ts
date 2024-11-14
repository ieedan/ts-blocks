import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, intro, isCancel, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Argument, Command, program } from 'commander';
import { execa } from 'execa';
import { resolveCommand } from 'package-manager-detector/commands';
import { detect } from 'package-manager-detector/detect';
import { Project } from 'ts-morph';
import * as v from 'valibot';
import { context } from '..';
import { getConfig } from '../config';
import { INFO } from '../utils';
import { type Block, categorySchema } from '../utils/build';
import { getInstalledBlocks } from '../utils/get-installed-blocks';
import * as gitProviders from '../utils/git-providers';
import { OUTPUT_FILE } from './build';

const schema = v.object({
	debug: v.boolean(),
	verbose: v.boolean(),
	repo: v.optional(v.string()),
	allow: v.boolean(),
});

type Options = v.InferInput<typeof schema>;

const test = new Command('test')
	.description('Tests blocks against most recent tests')
	.addArgument(new Argument('[blocks...]', 'Whichever blocks you want to test.').default([]))
	.option('--verbose', 'Include debug logs.', false)
	.option('-A, --allow', 'Allow ts-blocks to download code from the provided repo.', false)
	.option('--repo <repo>', 'Repository to download the blocks from')
	.option('--debug', 'Leaves the temp test file around for debugging upon failure.', false)
	.action(async (blockNames, opts) => {
		const options = v.parse(schema, opts);

		await _test(blockNames, options);
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _test = async (blockNames: string[], options: Options) => {
	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${INFO} ${msg}`);
		}
	};

	verbose(`Attempting to test ${JSON.stringify(blockNames)}`);

	const config = getConfig();

	const loading = spinner();

	const blocksMap: Map<string, RemoteBlock> = new Map();

	let repoPaths = config.repos;

	// we just want to override all others if supplied via the CLI
	if (options.repo) repoPaths = [options.repo];

	if (!options.allow && options.repo) {
		const result = await confirm({
			message: `Allow ${color.cyan('ts-blocks')} to download and run code from ${color.cyan(options.repo)}?`,
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

		const categories = v.parse(v.array(categorySchema), await response.json());

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

	const tempTestDirectory = `blocks-tests-temp-${Date.now()}`;

	verbose(`Trying to create the temp directory ${color.bold(tempTestDirectory)}.`);

	fs.mkdirSync(tempTestDirectory, { recursive: true });

	const cleanUp = () => {
		fs.rmSync(tempTestDirectory, { recursive: true, force: true });
	};

	const installedBlocks = getInstalledBlocks(blocksMap, config);

	let testingBlocks = blockNames;

	// in the case that we want to test all files
	if (blockNames.length === 0) {
		testingBlocks = installedBlocks;
	}

	if (testingBlocks.length === 0) {
		cleanUp();
		program.error(color.red('There were no blocks found in your project!'));
	}

	const testingBlocksMapped = testingBlocks.map((blockName) => {
		const block = blocksMap.get(blockName);

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
		}

		return { name: blockName, block };
	});

	for (const { name: specifier, block } of testingBlocksMapped) {
		const [_, blockName] = specifier.split('/');

		const providerInfo = block.sourceRepo;

		if (!options.verbose) {
			loading.start(`Setting up test file for ${color.cyan(specifier)}`);
		}

		if (!block.tests) {
			loading.stop(`No tests found for ${color.cyan(specifier)}`);
			continue;
		}

		const getSourceFile = async (filePath: string) => {
			const rawUrl = providerInfo.provider.resolveRaw(providerInfo, filePath);

			const response = await fetch(rawUrl);

			if (!response.ok) {
				loading.stop(color.red(`Error fetching ${color.bold(rawUrl.href)}`));
				program.error(color.red(`There was an error trying to get ${specifier}`));
			}

			return await response.text();
		};

		verbose(`Downloading and copying test files for ${specifier}`);

		const testFiles: string[] = [];

		for (const testFile of block.files.filter((file) => file.endsWith('test.ts'))) {
			const content = await getSourceFile(path.join(block.directory, testFile));

			const destPath = path.join(tempTestDirectory, testFile);

			fs.writeFileSync(destPath, content);

			testFiles.push(destPath);
		}

		const directory = path.join(config.path, block.category);
		let blockFilePath = path.join(directory, `${blockName}`);

		blockFilePath = blockFilePath.replaceAll('\\', '/');

		verbose(`${color.bold(specifier)} file path is ${color.bold(blockFilePath)}`);

		const project = new Project();

		// resolve imports for the block
		for (const file of testFiles) {
			verbose(`Opening test file ${file}`);

			const tempFile = project.addSourceFileAtPath(file);

			for (const importDeclaration of tempFile.getImportDeclarations()) {
				const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

				if (moduleSpecifier.startsWith(`./${blockName}`)) {
					const newModuleSpecifier = moduleSpecifier.replace(
						`${blockName}`,
						blockFilePath
					);
					importDeclaration.setModuleSpecifier(newModuleSpecifier);
				}
			}
		}

		project.saveSync();

		verbose(`Completed ${color.cyan.bold(specifier)} test file`);

		if (!options.verbose) {
			loading.stop(`Completed setup for ${color.bold(specifier)}`);
		}
	}

	verbose('Beginning testing');

	const pm = await detect({ cwd: process.cwd() });

	if (pm == null) {
		program.error(color.red('Could not detect package manager'));
	}

	const resolved = resolveCommand(pm.agent, 'execute', ['vitest', 'run', tempTestDirectory]);

	if (resolved == null) {
		program.error(color.red(`Could not resolve add command for '${pm.agent}'.`));
	}

	const { command, args } = resolved;

	const testCommand = `${command} ${args.join(' ')}`;

	const testingProcess = execa({
		cwd: process.cwd(),
		stdio: ['ignore', 'pipe', 'pipe'],
	})`${testCommand}`;

	const handler = (data: string) => console.info(data.toString());

	testingProcess.stdout.on('data', handler);
	testingProcess.stderr.on('data', handler);

	try {
		await testingProcess;

		cleanUp();

		outro(color.green('All done!'));
	} catch {
		if (options.debug) {
			console.info(
				`${color.bold('--debug')} flag provided. Skipping cleanup. Run '${color.bold(
					testCommand
				)}' to retry tests.\n`
			);
		} else {
			cleanUp();
		}

		program.error(color.red('Tests failed!'));
	}
};

export { test };
