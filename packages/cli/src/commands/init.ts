import fs from 'node:fs';
import { cancel, confirm, isCancel, outro, select, spinner, text } from '@clack/prompts';
import color from 'chalk';
import { Command, program } from 'commander';
import { detect, resolveCommand } from 'package-manager-detector';
import path from 'pathe';
import * as v from 'valibot';
import { context } from '..';
import * as ascii from '../utils/ascii';
import { CONFIG_NAME, type Config, getConfig } from '../utils/config';
import { installDependencies } from '../utils/dependencies';
import { intro, nextSteps } from '../utils/prompts';

const schema = v.object({
	path: v.optional(v.string()),
	repos: v.optional(v.array(v.string())),
	watermark: v.boolean(),
	tests: v.optional(v.boolean()),
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
	const initialConfig = getConfig(options.cwd);

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
		$schema: `https://unpkg.com/jsrepo@${context.package.version}/schema.json`,
		repos: options.repos,
		path: options.path,
		includeTests:
			initialConfig.isOk() && options.tests === undefined
				? initialConfig.unwrap().includeTests
				: (options.tests ?? false),
		watermark: options.watermark,
	};

	loading.start(`Writing config to \`${CONFIG_NAME}\``);

	fs.writeFileSync(
		path.join(options.cwd, CONFIG_NAME),
		`${JSON.stringify(config, null, '\t')}\n`
	);

	fs.mkdirSync(path.join(options.cwd, config.path), { recursive: true });

	loading.stop(`Wrote config to \`${CONFIG_NAME}\`.`);
};

const _initRegistry = async (options: Options) => {
	const loading = spinner();

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

	const packagePath = path.join(options.cwd, 'package.json');

	if (!fs.existsSync(packagePath)) {
		program.error(color.red(`Couldn't find your ${color.bold('package.json')}!`));
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
