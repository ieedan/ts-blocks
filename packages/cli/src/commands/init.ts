import fs from 'node:fs';
import {
	cancel,
	confirm,
	isCancel,
	multiselect,
	outro,
	password,
	select,
	spinner,
	text,
} from '@clack/prompts';
import color from 'chalk';
import { Command, Option, program } from 'commander';
import { detect, resolveCommand } from 'package-manager-detector';
import path from 'pathe';
import * as v from 'valibot';
import { context } from '..';
import * as ascii from '../utils/ascii';
import {
	CONFIG_NAME,
	type Config,
	type Formatter,
	type Paths,
	formatterSchema,
	getConfig,
} from '../utils/config';
import { installDependencies } from '../utils/dependencies';
import { providers } from '../utils/git-providers';
import * as persisted from '../utils/persisted';
import { intro, nextSteps } from '../utils/prompts';

const schema = v.object({
	path: v.optional(v.string()),
	repos: v.optional(v.array(v.string())),
	watermark: v.boolean(),
	tests: v.optional(v.boolean()),
	formatter: v.optional(formatterSchema),
	project: v.optional(v.boolean()),
	registry: v.optional(v.boolean()),
	script: v.string(),
	yes: v.boolean(),
	cwd: v.string(),
});

type Options = v.InferInput<typeof schema>;

const init = new Command('init')
	.description('Initializes your project with a configuration file.')
	.option('--path <path>', 'Path to install the blocks / Path to build the blocks from.')
	.option('--repos [repos...]', 'Repository to install the blocks from.')
	.option(
		'--no-watermark',
		'Will not add a watermark to each file upon adding it to your project.'
	)
	.option('--tests', 'Will include tests with the blocks.')
	.addOption(
		new Option(
			'--formatter <formatter>',
			'What formatter to use when adding or updating blocks.'
		).choices(['prettier', 'biome'])
	)
	.option('-P, --project', 'Takes you through the steps to initialize a project.')
	.option('-R, --registry', 'Takes you through the steps to initialize a registry.')
	.option('--script <name>', 'The name of the build script. (For Registry setup)', 'build')
	.option('-y, --yes', 'Skip confirmation prompt.', false)
	.option('--cwd <path>', 'The current working directory.', process.cwd())
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		intro(context.package.version);

		if (options.registry !== undefined && options.project !== undefined) {
			program.error(
				color.red(
					`You cannot provide both ${color.bold('--project')} and ${color.bold('--registry')} at the same time.`
				)
			);
		}

		if (options.registry === undefined && options.project === undefined) {
			const response = await select({
				message: 'Initialize a project or registry?',
				options: [
					{ value: 'project', label: 'project' },
					{ value: 'registry', label: 'registry' },
				],
				initialValue: 'project',
			});

			if (isCancel(response)) {
				cancel('Canceled!');
				process.exit(0);
			}

			options.registry = response === 'registry';
		}

		if (options.registry) {
			await _initRegistry(options);
		} else {
			await _initProject(options);
		}

		outro(color.green('All done!'));
	});

const _initProject = async (options: Options) => {
	const storage = persisted.get();

	const initialConfig = getConfig(options.cwd);

	const loading = spinner();

	let paths: Paths;

	const defaultPathResult = await text({
		message: 'Please enter a default path to install the blocks',
		validate(value) {
			if (value.trim() === '') return 'Please provide a value';
		},
		initialValue: initialConfig.isOk() ? initialConfig.unwrap().paths['*'] : 'src/blocks',
	});

	if (isCancel(defaultPathResult)) {
		cancel('Canceled!');
		process.exit(0);
	}

	paths = { '*': defaultPathResult };

	if (!options.repos) {
		options.repos = initialConfig.isOk() ? initialConfig.unwrap().repos : [];

		while (true) {
			const confirmResult = await confirm({
				message: `Add ${options.repos.length > 0 ? 'another' : 'a'} repo?`,
				initialValue: options.repos.length === 0, // default to yes for first repo
			});

			if (isCancel(confirmResult)) {
				cancel('Canceled!');
				process.exit(0);
			}

			if (!confirmResult) break;

			const result = await text({
				message: 'Where should we download the blocks from?',
				placeholder: 'github/ieedan/std',
				validate: (val) => {
					if (val.trim().length === 0) return 'Please provide a value';

					if (!providers.find((provider) => provider.matches(val))) {
						return `Invalid provider! Valid providers (${providers.map((provider) => provider.name()).join(', ')})`;
					}
				},
			});

			if (isCancel(result)) {
				cancel('Canceled!');
				process.exit(0);
			}

			const provider = providers.find((p) => p.matches(result));

			if (!provider) {
				program.error(color.red('Invalid provider!'));
			}

			const tokenKey = `${provider.name()}-token`;

			const token = storage.get(tokenKey);

			if (!token) {
				const result = await confirm({
					message: 'Would you like to add an auth token?',
					initialValue: false,
				});

				if (isCancel(result)) {
					cancel('Canceled!');
					process.exit(0);
				}

				if (result) {
					const response = await password({
						message: 'Paste your token',
						validate(value) {
							if (value.trim() === '') return 'Please provide a value';
						},
					});

					if (isCancel(response)) {
						cancel('Canceled!');
						process.exit(0);
					}

					storage.set(tokenKey, response);
				}
			}

			loading.start(`Fetching categories from ${color.cyan(result)}`);

			const manifestResult = await provider.fetchManifest(result);

			loading.stop(`Fetched categories from ${color.cyan(result)}`);

			if (manifestResult.isErr()) {
				program.error(color.red(manifestResult.unwrapErr()));
			}

			const categories = manifestResult.unwrap();

			const configurePaths = await multiselect({
				message: 'Which category paths would you like to configure?',
				options: categories.map((cat) => ({ label: cat.name, value: cat.name })),
			});

			if (isCancel(configurePaths)) {
				cancel('Canceled!');
				process.exit(0);
			}

			if (configurePaths.length > 0) {
				for (const category of configurePaths) {
					const categoryPath = await text({
						message: `Where should ${category} be added in your project?`,
						validate(value) {
							if (value.trim() === '') return 'Please provide a value';
						},
						placeholder: `src/${category}`,
					});

					if (isCancel(categoryPath)) {
						cancel('Canceled!');
						process.exit(0);
					}

					paths[category] = categoryPath;
				}
			}

			options.repos.push(result);
		}
	}

	if (!options.formatter) {
		let defaultFormatter = initialConfig.isErr()
			? 'none'
			: (initialConfig.unwrap().formatter ?? 'none');

		if (fs.existsSync(path.join(options.cwd, '.prettierrc'))) {
			defaultFormatter = 'prettier';
		}

		if (fs.existsSync(path.join(options.cwd, 'biome.json'))) {
			defaultFormatter = 'biome';
		}

		const response = await select({
			message: 'What formatter would you like to use?',
			options: ['Prettier', 'Biome', 'None'].map((val) => ({
				value: val.toLowerCase(),
				label: val,
			})),
			initialValue: defaultFormatter,
		});

		if (isCancel(response)) {
			cancel('Canceled!');
			process.exit(0);
		}

		if (response !== 'none') {
			options.formatter = response as Formatter;
		}
	}

	const config: Config = {
		$schema: `https://unpkg.com/jsrepo@${context.package.version}/schema.json`,
		repos: options.repos,
		includeTests:
			initialConfig.isOk() && options.tests === undefined
				? initialConfig.unwrap().includeTests
				: (options.tests ?? false),
		watermark: options.watermark,
		formatter: options.formatter,
		paths,
	};

	loading.start(`Writing config to \`${CONFIG_NAME}\``);

	fs.writeFileSync(
		path.join(options.cwd, CONFIG_NAME),
		`${JSON.stringify(config, null, '\t')}\n`
	);

	loading.stop(`Wrote config to \`${CONFIG_NAME}\`.`);
};

const _initRegistry = async (options: Options) => {
	const loading = spinner();

	const packagePath = path.join(options.cwd, 'package.json');

	if (!fs.existsSync(packagePath)) {
		program.error(color.red(`Couldn't find your ${color.bold('package.json')}!`));
	}

	if (!options.path) {
		const response = await text({
			message: 'Where are your blocks located?',
			defaultValue: './blocks',
			initialValue: './blocks',
			placeholder: './blocks',
		});

		if (isCancel(response)) {
			cancel('Canceled!');
			process.exit(0);
		}

		options.path = response;
	}

	const pkg = JSON.parse(fs.readFileSync(packagePath).toString());

	const scriptAlreadyExists =
		pkg.scripts !== undefined && pkg.scripts[options.script] !== undefined;

	if (!options.yes && scriptAlreadyExists) {
		const response = await confirm({
			message: `The \`${color.cyan(options.script)}\` already exists overwrite?`,
			initialValue: false,
		});

		if (isCancel(response)) {
			cancel('Canceled!');
			process.exit(0);
		}

		if (!response) {
			const response = await text({
				message: 'What would you like to call the script?',
				defaultValue: 'build:registry',
				placeholder: 'build:registry',
				initialValue: 'build:registry',
				validate: (val) => {
					if (val.trim().length === 0) return 'Please provide a value!';
				},
			});

			if (isCancel(response)) {
				cancel('Canceled!');
				process.exit(0);
			}

			options.script = response;
		}
	}

	const alreadyInstalled = pkg.devDependencies && pkg.devDependencies.jsrepo !== undefined;

	let installAsDevDependency = options.yes || alreadyInstalled;

	if (!options.yes && !alreadyInstalled) {
		const response = await confirm({
			message: `Add ${ascii.JSREPO} as a dev dependency?`,
			initialValue: true,
		});

		if (isCancel(response)) {
			cancel('Canceled!');
			process.exit(0);
		}

		installAsDevDependency = response;
	}

	const pm = (await detect({ cwd: 'cwd' }))?.agent ?? 'npm';

	let buildScript = '';

	if (installAsDevDependency) {
		buildScript += 'jsrepo build ';
	} else {
		const command = resolveCommand(pm, 'execute', ['jsrepo', 'build']);

		if (!command) program.error(color.red(`Error resolving execute command for ${pm}`));

		buildScript += `${command.command} ${command.args.join(' ')} `;
	}

	if (options.path !== './build') {
		buildScript += `--dirs ${options.path}`;
	}

	if (pkg.scripts === undefined) {
		pkg.scripts = {};
	}

	pkg.scripts[options.script] = buildScript;

	loading.start(`Adding \`${color.cyan(options.script)}\` to scripts in package.json`);

	try {
		fs.writeFileSync(packagePath, JSON.stringify(pkg, null, '\t'));
	} catch (err) {
		program.error(color.red(`Error writing to \`${color.bold(packagePath)}\`. Error: ${err}`));
	}

	loading.stop(`Added \`${color.cyan(options.script)}\` to scripts in package.json`);

	let installed = alreadyInstalled;

	if (installAsDevDependency && !alreadyInstalled) {
		let shouldInstall = options.yes;
		if (!options.yes) {
			const response = await confirm({
				message: 'Install dependencies?',
				initialValue: true,
			});

			if (isCancel(response)) {
				cancel('Canceled!');
				process.exit(0);
			}

			shouldInstall = response;
		}

		if (shouldInstall) {
			loading.start(`Installing ${ascii.JSREPO}`);

			const installedResult = await installDependencies({
				pm,
				deps: ['jsrepo'],
				dev: true,
				cwd: options.cwd,
			});

			installedResult.match(
				() => loading.stop(`Installed ${ascii.JSREPO}.`),
				(err) => {
					loading.stop(`Failed to install ${ascii.JSREPO}.`);
					program.error(err);
				}
			);

			installed = true;
		}
	}

	let steps: string[] = [];

	if (!installed && installAsDevDependency) {
		const cmd = resolveCommand(pm, 'install', ['jsrepo', '-D']);

		steps.push(
			`Install ${ascii.JSREPO} as a dev dependency \`${color.cyan(`${cmd?.command} ${cmd?.args.join(' ')}`)}\``
		);
	}

	steps.push(`Add blocks to \`${color.cyan(options.path)}\`.`);

	const runScript = resolveCommand(pm, 'run', [options.script]);

	steps.push(
		`Run \`${color.cyan(`${runScript?.command} ${runScript?.args.join(' ')}`)}\` to build the registry.`
	);

	// put steps with numbers above here
	steps = steps.map((step, i) => `${i + 1}. ${step}`);

	const next = nextSteps(steps);

	process.stdout.write(next);
};

export { init };
