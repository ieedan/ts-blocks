import { cancel, isCancel, outro, password, select } from '@clack/prompts';
import color from 'chalk';
import { Command, Option } from 'commander';
import * as v from 'valibot';
import { context } from '..';
import { OUTPUT_FILE } from '../utils/context';
import { providers } from '../utils/git-providers';
import * as persisted from '../utils/persisted';
import { intro } from '../utils/prompts';

const schema = v.object({
	token: v.optional(v.string()),
	provider: v.optional(v.string()),
	cwd: v.string(),
});

type Options = v.InferInput<typeof schema>;

const auth = new Command('auth')
	.description(`Builds the provided --dirs in the project root into a \`${OUTPUT_FILE}\` file.`)
	.option('--token <token>', 'The token to use for authenticating to your provider.')
	.addOption(
		new Option('--provider <name>', 'The provider this token belongs to.').choices(
			providers.map((provider) => provider.name())
		)
	)
	.option('--cwd <path>', 'The current working directory.', process.cwd())
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		intro(context.package.version);

		await _auth(options);

		outro(color.green('All done!'));
	});

const _auth = async (options: Options) => {
	const storage = persisted.get();

	if (providers.length > 1) {
		const response = await select({
			message: 'Which provider is this token for?',
			options: providers.map((provider) => ({
				label: provider.name(),
				value: provider.name(),
			})),
			initialValue: providers[0].name(),
		});

		if (isCancel(response) || !response) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.provider = response;
	} else {
		options.provider = providers[0].name();
	}

	if (options.token === undefined) {
		const response = await password({
			message: 'Paste your token',
			validate(value) {
				if (value.trim() === '') return 'Please provide a value';
			},
		});

		if (isCancel(response) || !response) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.token = response;
	}

	storage.set(`${options.provider}-token`, options.token);
};

export { auth };
