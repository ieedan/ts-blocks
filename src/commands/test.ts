import fs from 'node:fs';
import path from 'node:path';
import { intro, outro, spinner, text } from '@clack/prompts';
import color from 'chalk';
import { Argument, Command, program } from 'commander';
import { execa } from 'execa';
import { resolveCommand } from 'package-manager-detector/commands';
import { detect } from 'package-manager-detector/detect';
import { Project } from 'ts-morph';
import { type InferInput, boolean, object, parse } from 'valibot';
import { blocks } from '../blocks';
import { getConfig } from '../config';

const schema = object({
	debug: boolean(),
});

type Options = InferInput<typeof schema>;

const test = new Command('test')
	.description('Tests blocks against most recent tests')
	.addArgument(
		new Argument('[blocks...]', 'Whichever block you want to add to your project.')
			.choices(Object.entries(blocks).map(([key]) => key))
			.argRequired()
	)
	.option('--debug', 'Leaves the temp test file around for debugging upon failure.', false)
	.action(async (blockNames, opts) => {
		const options = parse(schema, opts);

		await _test(blockNames, options);
	});

const _test = async (blockNames: string[], options: Options) => {
	intro(color.bgBlueBright('ts-blocks'));

	const config = getConfig();

	const tempTestFileName = `blocks-testing-temp-${Date.now()}.test.ts`;

	const cleanUp = () => {
		if (fs.existsSync(tempTestFileName)) {
			fs.rmSync(tempTestFileName);
		}
	};

	const registryDir = path.join(import.meta.url, '../../../blocks').replace(/^file:\\/, "");

	type TestInfo = {
		command: string;
		blockName: string;
		testFile: string;
	};

	let failedTestInfo: TestInfo | undefined = undefined;

	const loading = spinner();

	for (const blockName of blockNames) {
		const block = blocks[blockName];

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
		}

		loading.start(`Setting up test file for ${blockName}`);

		const registryTestFilePath = path.join(
			registryDir,
			`${block.category}/${blockName}.test.ts`
		);

		fs.copyFileSync(registryTestFilePath, tempTestFileName);

		let blockFilePath: string;
		let directory: string;

		if (config.addByCategory) {
			directory = path.join(config.path, block.category);
		} else {
			directory = config.path;
		}

		if (config.includeIndexFile) {
			blockFilePath = path.join(directory, 'index');
		} else {
			blockFilePath = path.join(directory, `${blockName}`);
		}

		blockFilePath = blockFilePath.replaceAll('\\', '/');

		const project = new Project();

		const tempFile = project.addSourceFileAtPath(tempTestFileName);

		for (const importDeclaration of tempFile.getImportDeclarations()) {
			const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

			if (moduleSpecifier.startsWith(`./${blockName}`)) {
				const newModuleSpecifier = moduleSpecifier.replace(`${blockName}`, blockFilePath);
				importDeclaration.setModuleSpecifier(newModuleSpecifier);
			}
		}

		project.saveSync();

		const pm = await detect({ cwd: process.cwd() });

		if (pm == null) {
			program.error(color.red('Could not detect package manager'));
		}

		const resolved = resolveCommand(pm.agent, 'execute', ['vitest', 'run', tempTestFileName]);

		if (resolved == null) {
			program.error(color.red(`Could not resolve add command for '${pm.agent}'.`));
		}

		const { command, args } = resolved;

		const testCommand = `${command} ${args.join(' ')}`;

		loading.stop(`Setup test files for ${blockName}`);

		const testingProcess = execa({
			cwd: process.cwd(),
			stdio: ['ignore', 'pipe', 'pipe'],
		})`${testCommand}`;

		const handler = (data: string) => console.info(data.toString());

		testingProcess.stdout.on('data', handler);
		testingProcess.stderr.on('data', handler);

		try {
			await testingProcess;
		} catch {
			failedTestInfo = { command: testCommand, blockName, testFile: tempTestFileName };
			break;
		}

		loading.stop(`All done with testing for ${color.cyan.bold(blockName)}`);
	}

	if (failedTestInfo !== undefined) {
		if (options.debug) {
			console.info(
				`${color.bold('--debug')} flag provided skipping cleanup. Run '${color.bold(
					failedTestInfo.command
				)}' to retry tests.\n`
			);
		} else {
			cleanUp();
		}

		program.error(color.red(`${color.bold(failedTestInfo.blockName)} Tests failed!`));
	} else {
		cleanUp();
		outro(color.green('All done!'));
	}
};

export { test };
