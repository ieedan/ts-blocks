import fs from "node:fs";
import color from "chalk";
import { program } from "commander";
import * as v from "valibot";

const CONFIG_NAME = "blocks.json";

const schema = v.object({
	$schema: v.string(),
	repos: v.optional(v.array(v.string()), []),
	includeTests: v.boolean(),
	path: v.pipe(v.string(), v.minLength(1)),
	imports: v.optional(v.union([v.literal("deno"), v.literal("node")]), "node"),
	watermark: v.optional(v.boolean(), true),
});

const getConfig = () => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(
			color.red(`Could not find your configuration file! Please run ${color.bold(`'ts-blocks init'`)}.`)
		);
	}

	const config = v.parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()), {
		message: color.red("Invalid config file!"),
	});

	return config;
};

type Config = ReturnType<typeof getConfig>;

export { type Config, CONFIG_NAME, getConfig, schema };
