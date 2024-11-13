import fs from 'node:fs';
import color from 'chalk';
import { program } from 'commander';
import { boolean, literal, minLength, object, optional, parse, pipe, string, union } from 'valibot';

const CONFIG_NAME = 'blocks.json';

const schema = object({
	$schema: string(),
	repo: optional(string(), 'https://github.com/ieedan/ts-blocks'),
	trustRepo: optional(boolean(), false),
	includeIndexFile: boolean(),
	includeTests: boolean(),
	path: pipe(string(), minLength(1)),
	imports: optional(union([literal('deno'), literal('node')]), 'node'),
	watermark: optional(boolean(), true),
});

const getConfig = () => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(
			color.red(
				`Could not find your configuration file! Please run ${color.bold(`'ts-blocks init'`)}.`
			)
		);
	}

	const config = parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()), {
		message: color.red('Invalid config file!'),
	});

	return config;
};

type Config = ReturnType<typeof getConfig>;

export { type Config, CONFIG_NAME, getConfig, schema };
