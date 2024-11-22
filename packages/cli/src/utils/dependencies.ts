import color from 'chalk';
import { execa } from 'execa';
import { type Agent, type ResolvedCommand, resolveCommand } from 'package-manager-detector';
import { Err, Ok, type Result } from './blocks/types/result';

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

export { installDependencies };
