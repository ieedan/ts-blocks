import fs from 'node:fs';
import { program } from 'commander';
import * as commands from './commands';

// get version from package.json
const { version, name, description } = JSON.parse(
	fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

program
	.name(name)
	.description(description)
	.version(version)
	.addCommand(commands.add)
	.addCommand(commands.init)
	.addCommand(commands.test);

program.parse();
