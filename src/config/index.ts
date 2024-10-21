import fs from 'node:fs';
import color from 'chalk';
import { program } from 'commander';
import { boolean, literal, minLength, object, optional, parse, pipe, string, union } from 'valibot';

const CONFIG_NAME = 'blocks.json';

const schema = object({
	$schema: string(),
	addByCategory: boolean(),
	includeIndexFile: boolean(),
	includeTests: boolean(),
	path: pipe(string(), minLength(1)),
	imports: optional(union([literal('deno'), literal('node')])),
});

type Config = {
	$schema: string;
	addByCategory: boolean;
	includeIndexFile: boolean;
	includeTests: boolean;
	path: string;
	imports: 'deno' | 'node';
};

const getConfig = (): Config => {
	if (!fs.existsSync(CONFIG_NAME)) {
		program.error(
			color.red(
				`Could not find your configuration file! Please run ${color.bold(
					`'ts-blocks init'`
				)}.`
			)
		);
	}

	const config = parse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()), {
		message: color.red('Invalid config file!'),
	});

	// set defaults here

	if (config.imports === undefined) {
		config.imports = 'node';
	}

	return config as Config;
};

export { type Config, CONFIG_NAME, getConfig, schema };
