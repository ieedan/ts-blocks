import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, intro, isCancel, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Argument, Command, program } from 'commander';
import { Project, type SourceFile } from 'ts-morph';
import { type InferInput, boolean, object, parse } from 'valibot';
import { WARN } from '.';
import { blocks } from '../blocks';
import { getConfig } from '../config';

const schema = object({
	yes: boolean(),
});

type Options = InferInput<typeof schema>;

const add = new Command('add')
	.addArgument(
		new Argument('[blocks...]', 'Whichever block you want to add to your project.').choices(
			Object.entries(blocks).map(([key]) => key)
		)
	)
	.option('-y, --yes', 'Add and install any required dependencies.', false)
	.action(async (blockNames, opts) => {
		const options = parse(schema, opts);

		await _add(blockNames, options);
	});

const _add = async (blockNames: string[], options: Options) => {
	intro(color.white.bgCyanBright('ts-block'));

	const config = getConfig();

	const loading = spinner();

	for (const blockName of blockNames) {
		// in the future maybe we add a registry but for now it can just be fs
		const block = blocks[blockName];

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
		}

		loading.start(`Adding ${blockName}`);

		const registryPath = path.join(
			import.meta.dirname,
			`../../blocks/${block.category}/${blockName}.ts`
		);

		let newPath: string;
		let directory: string;

		if (config.addByCategory) {
			directory = path.join(config.path, block.category);
			newPath = path.join(directory, `${blockName}.ts`);
		} else {
			directory = config.path;
			newPath = path.join(directory, `${blockName}.ts`);
		}

		// in case the directory didn't already exist
		fs.mkdirSync(directory, { recursive: true });

		fs.copyFileSync(registryPath, newPath);

		if (config.includeIndexFile) {
			const indexPath = path.join(directory, 'index.ts');

			const project = new Project();

			try {
				let index: SourceFile;

				if (fs.existsSync(indexPath)) {
					index = project.addSourceFileAtPath(indexPath);
				} else {
					index = project.createSourceFile(indexPath);
				}

				index.addExportDeclaration({
					moduleSpecifier: `./${blockName}`,
					isTypeOnly: false,
				});

				index.saveSync();
			} catch {
				console.warn(`${WARN} Failed to modify ${indexPath}!`);
			}
		}

		if (block.dependencies) {
			if (!options.yes) {
				const result = await confirm({
					message: 'Add and install dependencies?',
				});

				if (isCancel(result)) {
					cancel('Canceled!');
					process.exit(0);
				}

				options.yes = result;
			}

			if (options.yes) {
				// currently no functions require dependencies (lets try and keep it that way)
				throw new Error('NOT IMPLEMENTED');
			}
		}

		loading.stop(`Added ${blockName}`);
	}

	outro(color.green('All done!'));
};

export { add };
