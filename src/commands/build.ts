import fs from 'node:fs';
import { intro, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Command } from 'commander';
import { type InferInput, array, boolean, object, parse, string } from 'valibot';
import { context } from '..';
import { type Category, buildBlocksDirectory } from '../utils/build';

export const OUTPUT_FILE = 'blocks-manifest.json';

const schema = object({
	verbose: boolean(),
	output: boolean(),
	dirs: array(string()),
});

type Options = InferInput<typeof schema>;

const build = new Command('build')
	.description('Builds the `/blocks` directory in the project root into a blocks.json file.')
	.option('--dirs [dirs...]', 'The directories containing the blocks.', ['./blocks'])
	.option('--no-output', `Do not output \`${OUTPUT_FILE}\` file.`)
	.option('--verbose', 'Include debug logs.', false)
	.action(async (opts) => {
		const options = parse(schema, opts);

		await _build(options);
	});

const _build = async (options: Options) => {
	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const loading = spinner();

	const categories: Category[] = [];

	for (const dir of options.dirs) {
		loading.start(`Building ${color.cyan(dir)}`);

		if (options.output && fs.existsSync(OUTPUT_FILE)) fs.rmSync(OUTPUT_FILE);

		categories.push(...buildBlocksDirectory(dir));

		loading.stop(`Built ${color.cyan(dir)}`);
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
		fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, '\t'));
	} else {
		loading.stop('Built successfully!');
	}

	outro(color.green('All done!'));
};

export { build };
