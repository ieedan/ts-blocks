import fs from 'node:fs';
import color from 'chalk';
import { program } from 'commander';
import {
	type InferInput,
	boolean,
	literal,
	minLength,
	object,
	optional,
	parse,
	pipe,
	string,
	union,
} from 'valibot';

const CONFIG_NAME = 'blocks.json';

const schema = object({
	$schema: string(),
	addByCategory: boolean(),
	includeIndexFile: boolean(),
	includeTests: boolean(),
	path: pipe(string(), minLength(1)),
	imports: optional(union([literal('deno'), literal('node')])),
});

type Config = InferInput<typeof schema>;

const getConfig = () => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(
			color.red(
				`Could not find your configuration file! Please run ${color.bold(`'ts-blocks init'`)}.`
			)
		);
	}

	return parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()), {
		message: color.red('Invalid config file!'),
	});
};

export { getConfig, type Config, schema, CONFIG_NAME };
