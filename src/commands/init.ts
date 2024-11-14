import fs from 'node:fs';
import { cancel, confirm, intro, isCancel, outro, text } from '@clack/prompts';
import color from 'chalk';
import { Command } from 'commander';
import * as v from 'valibot';
import { context } from '..';
import { CONFIG_NAME, type Config } from '../config';

const schema = v.object({
	path: v.optional(v.string()),
	indexFile: v.boolean(),
	tests: v.boolean(),
	repos: v.optional(v.array(v.string())),
	watermark: v.boolean(),
});

type Options = v.InferInput<typeof schema>;

const init = new Command('init')
	.description('Initializes the configuration file')
	.option('--path <path>', 'Path to install the blocks')
	.option('--repos [repos...]', 'Repository to install the blocks from')
	.option(
		'--no-index-file',
		'Will create an index.ts file at the root of the folder to re-export functions from.'
	)
	.option(
		'--no-watermark',
		'Will not add a watermark to each file upon adding it to your project.'
	)
	.option('--tests', 'Will include tests along with the functions.', false)
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _init(options);
	});

const _init = async (options: Options) => {
	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const { version } = JSON.parse(
		fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
	);

	if (!options.path) {
		const result = await text({
			message: 'Where should we add the blocks?',
			validate(value) {
				if (value.trim() === '') return 'Please provide a value';
			},
			initialValue: 'src/blocks',
		});

		if (isCancel(result)) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.path = result;
	}

	if (!options.repos) {
		const result = await text({
			message: 'Where should we download the blocks from?',
			initialValue: 'https://github.com/ieedan/std',
			validate: (val) => {
				if (!val.startsWith('https://github.com')) {
					return `Must be a ${color.bold('GitHub')} repository!`;
				}
			},
		});

		if (isCancel(result)) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.repos = [result];
	}

	// checks if this is a Deno project
	let isDeno = fs.existsSync('deno.json');

	if (!isDeno && fs.existsSync('jsr.json')) {
		const result = await confirm({
			message: `${color.cyan('jsr.json')} detected. Are you using Deno?`,
			initialValue: true,
		});

		if (isCancel(result)) {
			cancel('Canceled!');
			process.exit(0);
		}

		isDeno = result;
	}

	const config: Config = {
		$schema: `https://unpkg.com/ts-blocks@${version}/schema.json`,
		repos: options.repos,
		path: options.path,
		includeTests: options.tests,
		imports: isDeno ? 'deno' : 'node',
		watermark: options.watermark,
	};

	fs.writeFileSync(CONFIG_NAME, `${JSON.stringify(config, null, '\t')}\n`);

	fs.mkdirSync(config.path, { recursive: true });

	outro(color.green('All done!'));
};

export { init };
