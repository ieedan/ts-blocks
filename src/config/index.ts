import { InferInput, minLength, object, parse, pipe, string } from "valibot";
import fs from "node:fs";
import { program } from "commander";
import color from "chalk";

const CONFIG_NAME = 'blocks.json'

const schema = object({
    schema: string(),
	path: pipe(string(), minLength(1)),
});

type Config = InferInput<typeof schema>

const getConfig = () => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(color.red("Could not find your configuration file! Please run `ts-blocks init`."));
	}

	return parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()));
};

export { getConfig, Config, schema, CONFIG_NAME }
