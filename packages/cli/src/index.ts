import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import * as commands from './commands';
import type { CLIContext } from './utils/context';

const resolveRelativeToRoot = (p: string): string => {
	const dirname = fileURLToPath(import.meta.url);
	return path.join(dirname, '../..', p);
};

// get version from package.json
const { version, name, description, repository } = JSON.parse(
	fs.readFileSync(resolveRelativeToRoot('package.json'), 'utf-8')
);

const context: CLIContext = {
	package: {
		name,
		description,
		version,
		repository,
	},
	resolveRelativeToRoot,
};

program
	.name(name)
	.description(description)
	.version(version)
	.addCommand(commands.add)
	.addCommand(commands.init)
	.addCommand(commands.test)
	.addCommand(commands.build)
	.addCommand(commands.update)
	.addCommand(commands.diff);

program.parse();

export { context };
