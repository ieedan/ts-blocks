import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	entries: [
		"src/index",
		"src/blocks",
		"src/commands/add",
		"src/commands/init",
		"src/commands/index",
		"src/config/index",
	],
	failOnWarn: false,
	declaration: true,
	clean: true,
});
