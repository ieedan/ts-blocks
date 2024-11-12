import fs from "node:fs";
import { program } from "commander";
import * as commands from "./commands";
import type { CLIContext } from "./utils/context";
import path from "node:path";
import { fileURLToPath } from "node:url";

const resolveRelativeToRoot = (p: string): string => {
	const dirname = fileURLToPath(import.meta.url);
	return path.join(dirname, "../..", p);
};

// get version from package.json
const { version, name, description } = JSON.parse(fs.readFileSync(resolveRelativeToRoot("package.json"), "utf-8"));

const context: CLIContext = {
	package: {
		name,
		description,
		version,
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
	.addCommand(commands.build);

program.parse();

export { context };
