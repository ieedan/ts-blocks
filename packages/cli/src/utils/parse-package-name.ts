/**
 * Adapted from https://github.com/egoist/parse-package-name/blob/main/src/index.ts
 * @module
 */

import { Err, Ok } from './blocks/types/result';

// Parsed a scoped package name into name, version, and path.
const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
// Parsed a non-scoped package name into name, version, path
const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/;

const parsePackageName = (input: string) => {
	const m = RE_SCOPED.exec(input) || RE_NON_SCOPED.exec(input);

	if (!m) return Err(`invalid package name: ${input}`);

	return Ok({
		name: m[1] || '',
		version: m[2] || 'latest',
		path: m[3] || '',
	});
};

export { parsePackageName };
