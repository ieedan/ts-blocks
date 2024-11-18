import fs from 'node:fs';
import { cancel, confirm, intro, isCancel, outro, spinner, text } from '@clack/prompts';
import color from 'chalk';
import { Command } from 'commander';
import * as v from 'valibot';
import { context } from '..';
import { CONFIG_NAME, type Config, getConfig } from '../config';

const schema = v.object({
	path: v.optional(v.string()),
	tests: v.optional(v.boolean()),
	repos: v.optional(v.array(v.string())),
	watermark: v.boolean(),
});

type Options = v.InferInput<typeof schema>;

const init = new Command('init')
	.description('Initializes the configuration file')
	.option('--path <path>', 'Path to install the blocks')
	.option('--repos [repos...]', 'Repository to install the blocks from')
	.option(
		'--no-watermark',
		'Will not add a watermark to each file upon adding it to your project.'
	)
	.option('--tests', 'Will include tests along with the functions.')
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _init(options);
	});

const _init = async (options: Options) => {
	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const initialConfig = getConfig();

	const loading = spinner();

	if (!options.path) {
		const result = await text({
			message: 'Where should we add the blocks?',
			validate(value) {
				if (value.trim() === '') return 'Please provide a value';
			},
			initialValue: initialConfig.isOk() ? initialConfig.unwrap().path : 'src/blocks',
		});

		if (isCancel(result)) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.path = result;
	}

	if (!options.repos) {
		options.repos = initialConfig.isOk() ? initialConfig.unwrap().repos : [];

		while (true) {
			if (options.repos.length > 0) {
				const confirmResult = await confirm({
					message: 'Add another repo?',
					initialValue: false,
				});

				if (isCancel(confirmResult)) {
					cancel('Canceled!');
					process.exit(0);
				}

				if (!confirmResult) break;
			}

			const result = await text({
				message: 'Where should we download the blocks from?',
				placeholder: 'github/ieedan/std',
				validate: (val) => {
					if (!val.startsWith('https://github.com') && !val.startsWith('github/')) {
						return `Must be a ${color.bold('GitHub')} repository!`;
					}
				},
			});

			if (isCancel(result)) {
				cancel('Canceled!');
				process.exit(0);
			}

			options.repos.push(result);
		}
	}

	const config: Config = {
		$schema: `https://unpkg.com/ts-blocks@${context.package.version}/schema.json`,
		repos: options.repos,
		path: options.path,
		includeTests:
			initialConfig.isOk() && options.tests === undefined
				? initialConfig.unwrap().includeTests
				: (options.tests ?? false),
		watermark: options.watermark,
	};

	loading.start(`Writing config to \`${CONFIG_NAME}\``);

	fs.writeFileSync(CONFIG_NAME, `${JSON.stringify(config, null, '\t')}\n`);

	fs.mkdirSync(config.path, { recursive: true });

	loading.stop(`Wrote config to \`${CONFIG_NAME}\`.`);

	outro(color.green('All done!'));
};

export { init };
