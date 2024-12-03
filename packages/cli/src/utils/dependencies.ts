import color from 'chalk';
import { execa } from 'execa';
import { type Agent, type ResolvedCommand, resolveCommand } from 'package-manager-detector';
import { Err, Ok, type Result } from './blocks/types/result';
import type { Config } from './config';
import path from 'pathe';

export type Options = {
	pm: Agent;
	deps: string[];
	/** Install as devDependency */
	dev: boolean;
	cwd: string;
};

/** Installs the provided dependencies using the provided package manager
 *
 * @param param0
 * @returns
 */
const installDependencies = async ({
	pm,
	deps,
	dev,
	cwd,
}: Options): Promise<Result<string[], string>> => {
	let add: ResolvedCommand | null;
	if (dev) {
		add = resolveCommand(pm, 'install', [...deps, '-D']);
	} else {
		add = resolveCommand(pm, 'install', [...deps]);
	}

	if (add == null) return Err(color.red(`Could not resolve add command for '${pm}'.`));

	try {
		await execa(add.command, [...add.args], { cwd });

		return Ok(deps);
	} catch {
		return Err(
			color.red(
				`Failed to install ${color.bold(deps.join(', '))}! Failed while running '${color.bold(
					`${add.command} ${add.args.join(' ')}`
				)}'`
			)
		);
	}
};

const templatePattern = /\{\{([^\/]+)\/([^\}]+)\}\}/g;

export type ResolveOptions = {
	template: string;
	config: Config;
	destPath: string;
};

/** Takes a template and uses replaces it with an alias or relative path that resolves to the correct block
 *
 * @param param0
 * @returns
 */
const resolveLocalDependencyTemplate = ({ template, config, destPath }: ResolveOptions) => {
	const destDir = path.join(destPath, '../');

	return template.replace(templatePattern, (_, category, name) => {
		if (config.paths[category] === undefined) {
			// if relative make it relative
			if (config.paths['*'].startsWith('.')) {
				const relative = path.relative(
					destDir,
					path.join(config.paths['*'], category, name)
				);

				return relative.startsWith('.') ? relative : `./${relative}`;
			}

			return path.join(config.paths['*'], category, name);
		}

		// if relative make it relative
		if (config.paths[category].startsWith('.')) {
			const relative = path.relative(destDir, path.join(config.paths[category], name));

			return relative.startsWith('.') ? relative : `./${relative}`;
		}

		return path.join(config.paths[category], name);
	});
};

export { installDependencies, resolveLocalDependencyTemplate };
