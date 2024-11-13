import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import * as commands from './commands';
import { OUTPUT_FILE } from './commands/build';
import { type Block, type Category, readCategories } from './utils/build';
import type { CLIContext } from './utils/context';

const resolveRelativeToRoot = (p: string): string => {
	const dirname = fileURLToPath(import.meta.url);
	return path.join(dirname, '../..', p);
};

// get version from package.json
const { version, name, description, repository } = JSON.parse(
	fs.readFileSync(resolveRelativeToRoot('package.json'), 'utf-8')
);

let categories: Category[];

try {
	categories = readCategories(resolveRelativeToRoot(`blocks/${OUTPUT_FILE}`));
} catch {
	categories = [];
}

const blocks: Map<string, Block> = new Map();

for (const category of categories) {
	for (const block of category.blocks) {
		blocks.set(`${category.name}/${block.name}`, block);
	}
}

const context: CLIContext = {
	package: {
		name,
		description,
		version,
		repository,
	},
	categories,
	blocks,
	resolveRelativeToRoot,
};

program
	.name(name)
	.description(description)
	.version(version)
	.addCommand(commands.add)
	.addCommand(commands.init)
	.addCommand(commands.test)
	.addCommand(commands.build);

program.parse();

export { context };
