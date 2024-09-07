import fs from "node:fs";
import { program } from "commander";
import { add, init } from "./commands";

// get version from package.json
const { version, name, description } = JSON.parse(
	fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
);

program
	.name(name)
	.description(description)
	.version(version)
	.addCommand(add)
	.addCommand(init);

program.parse();
