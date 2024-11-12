import fs from 'node:fs';
import path from 'node:path';
import { intro, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Argument, Command, program } from 'commander';
import { execa } from 'execa';
import { resolveCommand } from 'package-manager-detector/commands';
import { detect } from 'package-manager-detector/detect';
import { Project } from 'ts-morph';
import { type InferInput, boolean, object, parse } from 'valibot';
import { context } from '..';
import { getConfig } from '../config';
import { INFO } from '../utils';

const schema = object({
	debug: boolean(),
	verbose: boolean(),
});

type Options = InferInput<typeof schema>;

const test = new Command('test')
	.description('Tests blocks against most recent tests')
	.addArgument(
		new Argument('[blocks...]', 'Whichever block you want to add to your project.').default([])
	)
	.option('--verbose', 'Include debug logs.', false)
	.option('--debug', 'Leaves the temp test file around for debugging upon failure.', false)
	.action(async (blockNames, opts) => {
		const options = parse(schema, opts);

		await _test(blockNames, options);
	});

const _test = async (blockNames: string[], options: Options) => {
	intro(`${color.bgBlueBright(" ts-blocks ")}${color.gray(` v${context.package.version} `)}`);

	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${INFO} ${msg}`);
		}
	};

	verbose(`Attempting to test ${JSON.stringify(blockNames)}`);

	const config = getConfig();

	const tempTestDirectory = `blocks-tests-temp-${Date.now()}`;

	verbose(`Trying to create the temp directory ${color.bold(tempTestDirectory)}.`);

	fs.mkdirSync(tempTestDirectory, { recursive: true });

	const cleanUp = () => {
		fs.rmSync(tempTestDirectory, { recursive: true, force: true });
	};

	const registryDir = path.join(import.meta.url, '../../blocks').replace(/^file:\\/, '');

	const loading = spinner();

	// in the case that we want to test all files
	if (blockNames.length === 0) {
		verbose('Locating blocks');

		if (!options.verbose) {
			loading.start('Locating blocks');
		}

		const files: string[] = [];

		const directories = fs
			.readdirSync(config.path)
			.filter((dir) => context.categories.find((cat) => cat.name === dir));

		for (const category of directories) {
			files.push(
				...fs
					.readdirSync(path.join(config.path, category))
					.filter((file) => file.endsWith('.ts') && !file.endsWith('test.ts'))
					.map((file) => `${category}/${file}`)
			);
		}

		for (const file of files) {
			if (file === 'index.ts') continue;

			const blockName = file.slice(0, file.length - 3).trim();

			if (context.blocks.get(blockName) !== undefined) {
				blockNames.push(blockName);
			}
		}

		loading.stop(blockNames.length > 0 ? 'Located blocks' : "Couldn't locate any blocks");
	}

	if (blockNames.length === 0) {
		cleanUp();
		program.error(color.red('There were no blocks found in your project!'));
	}

	const testingBlocks = blockNames.map((blockName) => {
		const block = context.blocks.get(blockName);

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
		}

		return { name: blockName, block };
	});

	for (const { name: specifier, block } of testingBlocks) {
		const [_, blockName] = specifier.split('/');

		if (!options.verbose) {
			loading.start(`Setting up test file for ${specifier}`);
		}

		const tempTestFileName = `${blockName}.test.ts`;

		const tempTestFilePath: string = path.join(tempTestDirectory, tempTestFileName);

		const registryTestFilePath = path.join(
			registryDir,
			`${block.category}/${blockName}.test.ts`
		);

		verbose(`Copying test files for ${specifier}`);

		try {
			fs.copyFileSync(registryTestFilePath, tempTestFilePath);
		} catch {
			loading.stop(`Couldn't find test file for ${color.cyan(specifier)} skipping.`);
			continue;
		}

		let blockFilePath: string;
		let directory: string;

		directory = path.join(config.path, block.category);

		if (config.includeIndexFile) {
			blockFilePath = path.join(directory, 'index');
		} else {
			blockFilePath = path.join(directory, `${blockName}`);
		}

		blockFilePath = blockFilePath.replaceAll('\\', '/');

		verbose(`${color.bold(specifier)} file path is ${color.bold(blockFilePath)}`);

		const project = new Project();

		verbose(`Opening test file ${tempTestFilePath}`);

		const tempFile = project.addSourceFileAtPath(tempTestFilePath);

		for (const importDeclaration of tempFile.getImportDeclarations()) {
			const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

			if (moduleSpecifier.startsWith(`./${blockName}`)) {
				const newModuleSpecifier = moduleSpecifier.replace(`${blockName}`, blockFilePath);
				importDeclaration.setModuleSpecifier(newModuleSpecifier);
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
