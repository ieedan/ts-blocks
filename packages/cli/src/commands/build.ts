import fs from 'node:fs';
import path from 'node:path';
import { outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Command } from 'commander';
import * as v from 'valibot';
import { context } from '..';
import { OUTPUT_FILE } from '../utils';
import { type Category, buildBlocksDirectory } from '../utils/build';
import { intro } from '../utils/prompts';

const schema = v.object({
	verbose: v.boolean(),
	output: v.boolean(),
	dirs: v.array(v.string()),
	cwd: v.string(),
});

type Options = v.InferInput<typeof schema>;

const build = new Command('build')
	.description(`Builds the provided --dirs in the project root into a \`${OUTPUT_FILE}\` file.`)
	.option('--dirs [dirs...]', 'The directories containing the blocks.', ['./blocks'])
	.option('--no-output', `Do not output a \`${OUTPUT_FILE}\` file.`)
	.option('--verbose', 'Include debug logs.', false)
	.option('--cwd <cwd>', 'The current working directory.', process.cwd())
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _build(options);
	});

const _build = async (options: Options) => {
	intro(context.package.version);

	const loading = spinner();

	const categories: Category[] = [];

	const outFile = path.join(options.cwd, OUTPUT_FILE);

	for (const dir of options.dirs) {
		const dirPath = path.join(options.cwd, dir);

		loading.start(`Building ${color.cyan(dirPath)}`);

		if (options.output && fs.existsSync(outFile)) fs.rmSync(outFile);

		categories.push(...buildBlocksDirectory(dirPath, options.cwd));

		loading.stop(`Built ${color.cyan(dirPath)}`);
	}

	const categoriesMap = new Map<string, Category>();

	for (const category of categories) {
		const cat = categoriesMap.get(category.name);

		if (!cat) {
			categoriesMap.set(category.name, category);
			continue;
		}

		// we aren't going to merge blocks hopefully people are smart enough not to overlap names
		cat.blocks = [...cat.blocks, ...category.blocks];

		categoriesMap.set(cat.name, cat);
	}

	if (options.output) {
		fs.writeFileSync(outFile, JSON.stringify(categories, null, '\t'));
	} else {
		loading.stop('Built successfully!');
	}

	outro(color.green('All done!'));
};

export { build };
