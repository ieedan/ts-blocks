import fs from 'node:fs';
import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
import path from 'pathe';
import * as v from 'valibot';
import { Err, Ok, type Result } from './blocks/types/result';

const CONFIG_NAME = 'jsrepo.json';

const formatterSchema = v.union([v.literal('prettier'), v.literal('biome')]);

const pathsSchema = v.objectWithRest(
	{
		'*': v.string(),
	},
	v.string()
);

export type Paths = v.InferInput<typeof pathsSchema>;

v.includes('*');

const schema = v.object({
	$schema: v.string(),
	repos: v.optional(v.array(v.string()), []),
	includeTests: v.boolean(),
	paths: pathsSchema,
	watermark: v.optional(v.boolean(), true),
	formatter: v.optional(formatterSchema),
});

const getConfig = (cwd: string): Result<Config, string> => {
	if (!fs.existsSync(path.join(cwd, CONFIG_NAME))) {
		return Err('Could not find your configuration file! Please run `init`.');
	}

	const config = v.safeParse(
		schema,
		JSON.parse(fs.readFileSync(path.join(cwd, CONFIG_NAME)).toString())
	);

	if (!config.success) {
		return Err(`There was an error reading your \`${CONFIG_NAME}\` file!`);
	}

	return Ok(config.output);
};

export type Config = v.InferOutput<typeof schema>;

export type Formatter = v.InferOutput<typeof formatterSchema>;

/** Resolves the paths relative to the cwd */
const resolvePaths = (paths: Paths, cwd: string): Result<Paths, string> => {
	let config = getTsconfig(cwd, 'tsconfig.json');
	let matcher: ((specifier: string) => string[]) | null = null;

	if (!config) {
		// if we don't find the config at first check for a jsconfig
		config = getTsconfig(cwd, 'jsconfig.json');
	}

	if (config) {
		matcher = createPathsMatcher(config);
	}

	let newPaths: Paths;

	if (!paths['*'].startsWith('.')) {
		if (matcher === null) {
			return Err("Cannot resolve aliases because we couldn't find a tsconfig!");
		}

		newPaths = {
			'*': resolvePath(paths['*'], matcher, cwd),
		};
	} else {
		newPaths = {
			'*': paths['*'],
		};
	}

	for (const [category, p] of Object.entries(paths)) {
		if (category === '*') continue; // we already resolved this one

		if (p.startsWith('.')) {
			newPaths[category] = p;
			continue;
		}

		if (matcher === null) {
			return Err("Cannot resolve aliases because we couldn't find a tsconfig!");
		}

		newPaths[category] = resolvePath(p, matcher, cwd);
	}

	return Ok(newPaths);
};

const resolvePath = (
	unresolvedPath: string,
	matcher: (specifier: string) => string[],
	cwd: string
): string => {
	const paths = matcher(unresolvedPath);

	return path.relative(cwd, paths[0]);
};

export { CONFIG_NAME, getConfig, schema, formatterSchema, resolvePaths };
