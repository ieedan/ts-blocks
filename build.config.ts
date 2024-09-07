import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	entries: [
		"src/index",
		"src/commands/add",
		"src/commands/init",
		"src/commands/index",
		"src/blocks",
		"src/config/index",
	],
	failOnWarn: false,
	declaration: true,
	clean: true,
});
