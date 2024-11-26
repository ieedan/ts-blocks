import { describe, expect, it } from 'vitest';
import * as gitProviders from '../src/utils/git-providers';

describe('github', () => {
	it('Handles long form urls', async () => {
		const url = 'https://github.com/ieedan/std/tree/main';

		const info = await gitProviders.github.info(url);

		expect(info.name).toBe('github');
		expect(info.owner).toBe('ieedan');
		expect(info.refs).toBe('heads');
		expect(info.ref).toBe('main');
		expect(info.url).toBe(url);
		expect(info.repoName).toBe('std');
	});

	it('Handles shorthand urls', async () => {
		const url = 'github/ieedan/std/tree/main';

		const info = await gitProviders.github.info(url);

		expect(info.name).toBe('github');
		expect(info.owner).toBe('ieedan');
		expect(info.refs).toBe('heads');
		expect(info.ref).toBe('main');
		expect(info.url).toBe(url);
		expect(info.repoName).toBe('std');
	});
});

describe('gitlab', () => {
	it('Fetches the manifest from a public repo', async () => {
		const repoURL = 'gitlab/ieedan/std';

		const info = await gitProviders.gitlab.info(repoURL);

		const content = await gitProviders.gitlab.fetchManifest(info);

		expect(content.isErr()).toBe(false);
	});

	it('Fetches the manifest from a public repo with a tag', async () => {
		const repoURL = 'https://gitlab.com/ieedan/std/-/tree/v1.6.0';

		const info = await gitProviders.gitlab.info(repoURL);

		const content = await gitProviders.gitlab.fetchRaw(info, 'jsrepo-manifest.json');

		expect(content.unwrap()).toBe(`[
	{
		"name": "types",
		"blocks": [
			{
				"name": "result",
				"directory": "src/types",
				"category": "types",
				"tests": true,
				"subdirectory": false,
				"files": ["result.ts", "result.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			}
		]
	},
	{
		"name": "utilities",
		"blocks": [
			{
				"name": "array-sum",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["array-sum.ts", "array-sum.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "array-to-map",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["array-to-map.ts", "array-to-map.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "dispatcher",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["dispatcher.ts", "dispatcher.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "ipv4-address",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["ipv4-address.ts", "ipv4-address.test.ts"],
				"localDependencies": ["types/result", "utilities/is-number"],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "is-number",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["is-number.ts", "is-number.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "lines",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["lines.ts", "lines.test.ts"],
				"localDependencies": ["utilities/pad"],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "map-to-array",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["map-to-array.ts", "map-to-array.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "math",
				"directory": "src/utilities/math",
				"category": "utilities",
				"tests": true,
				"subdirectory": true,
				"files": [
					"circle.test.ts",
					"circle.ts",
					"conversions.test.ts",
					"conversions.ts",
					"fractions.test.ts",
					"fractions.ts",
					"gcf.test.ts",
					"gcf.ts",
					"index.ts",
					"triangles.test.ts",
					"triangles.ts",
					"types.ts"
				],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "pad",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["pad.ts", "pad.test.ts"],
				"localDependencies": ["utilities/strip-ansi"],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "sleep",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["sleep.ts", "sleep.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "stopwatch",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["stopwatch.ts", "stopwatch.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			},
			{
				"name": "strip-ansi",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["strip-ansi.ts", "strip-ansi.test.ts"],
				"localDependencies": [],
				"dependencies": ["ansi-regex@^6.1.0"],
				"devDependencies": []
			},
			{
				"name": "truncate",
				"directory": "src/utilities",
				"category": "utilities",
				"tests": true,
				"subdirectory": false,
				"files": ["truncate.ts", "truncate.test.ts"],
				"localDependencies": [],
				"dependencies": [],
				"devDependencies": []
			}
		]
	}
]
`);
	});
});
