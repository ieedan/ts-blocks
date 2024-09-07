import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	entries: ["src/index"],
	failOnWarn: false,
	declaration: true,
	clean: true,
});
