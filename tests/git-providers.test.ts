import { describe, it, expect } from 'vitest';
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
