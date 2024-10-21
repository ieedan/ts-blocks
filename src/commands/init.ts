import fs from 'node:fs';
import { cancel, intro, isCancel, outro, text } from '@clack/prompts';
import color from 'chalk';
import { Command } from 'commander';
import { type InferInput, boolean, object, optional, parse, string } from 'valibot';
import { CONFIG_NAME, type Config } from '../config';

const schema = object({
	path: optional(string()),
	addByCategory: boolean(),
	indexFile: boolean(),
	tests: boolean(),
});

type Options = InferInput<typeof schema>;

const init = new Command('init')
	.description('Initializes the configuration file')
	.option('--path <path>', 'Path to install the blocks')
	.option(
		'--add-by-category',
		'Will create directories to contain each block by category.',
		false
	)
	.option(
		'--no-index-file',
		'Will create an index.ts file at the root of the folder to re-export functions from.'
	)
	.option('--tests', 'Will include tests along with the functions.', false)
	.action(async (opts) => {
		const options = parse(schema, opts);

		await _init(options);
	});

const _init = async (options: Options) => {
	intro(color.bgBlueBright('ts-blocks'));

	const { version } = JSON.parse(
		fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
	);

	if (!options.path) {
		const result = await text({
			message: 'Where should we add the blocks?',
			placeholder: 'src/blocks',
			validate(value) {
				if (value.trim() === '') return 'Please provide a value';
			},
		});

		if (isCancel(result)) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.path = result;
	}

	let isDeno = false;

	// very trivially tries to detect whether you are in a deno project
	try {
		fs.readFileSync('deno.json');
		isDeno = true;
	} catch {
		isDeno = false;
	}

	const config: Config = {
		$schema: `https://unpkg.com/ts-blocks@${version}/schema.json`,
		path: options.path,
		addByCategory: options.addByCategory,
		includeIndexFile: options.indexFile,
		includeTests: options.tests,
		imports: isDeno ? 'deno' : 'node',
	};

	fs.writeFileSync(CONFIG_NAME, `${JSON.stringify(config, null, '\t')}\n`);

	outro(color.green('All done!'));
};

export { init };
