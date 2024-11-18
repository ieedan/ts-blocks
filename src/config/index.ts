import fs from 'node:fs';
import * as v from 'valibot';
import { Err, Ok, type Result } from '../blocks/types/result';

const CONFIG_NAME = 'blocks.json';

const schema = v.object({
	$schema: v.string(),
	repos: v.optional(v.array(v.string()), []),
	includeTests: v.boolean(),
	path: v.pipe(v.string(), v.minLength(1)),
	watermark: v.optional(v.boolean(), true),
});

const getConfig = (): Result<Config, string> => {
	if (!fs.existsSync(CONFIG_NAME)) {
		return Err('Could not find your configuration file! Please run `npx jsrepo init`.');
	}

	const config = v.safeParse(schema, JSON.parse(fs.readFileSync(CONFIG_NAME).toString()));

	if (!config.success) {
		return Err('There was an error reading your `blocks.json` file!');
	}

	return Ok(config.output);
};

type Config = v.InferOutput<typeof schema>;

export { type Config, CONFIG_NAME, getConfig, schema };
