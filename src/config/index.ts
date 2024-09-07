import fs from "node:fs";
import color from "chalk";
import { program } from "commander";
import { type InferInput, boolean, minLength, object, parse, pipe, string } from "valibot";

const CONFIG_NAME = "blocks.json";

const schema = object({
	schema: string(),
	addByCategory: boolean(),
	path: pipe(string(), minLength(1)),
});

type Config = InferInput<typeof schema>;

const getConfig = () => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(color.red(`Could not find your configuration file! Please run ${color.bold(`'ts-blocks init'`)}.`));
	}

	return parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()));
};

export { getConfig, type Config, schema, CONFIG_NAME };
