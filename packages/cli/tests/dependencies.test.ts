import { describe, expect, it } from 'vitest';
import { resolveLocalDependencyTemplate } from '../src/utils/dependencies';

describe('resolveLocalDependencyTemplate', () => {
	it('Correctly replaces the template content', () => {
		const template = '{{utils/math}}/add';

		const resolved = resolveLocalDependencyTemplate({
			template,
			destPath: './src/lib/utils/print.ts',
			config: {
				paths: { '*': './src/blocks', utils: './src/lib/utils' },
				// biome-ignore lint/suspicious/noExplicitAny: only need paths
			} as any,
		});

		expect(resolved).toBe('./math/add');
	});

	it('Correctly replaces the template content for deep path', () => {
		const template = '{{utils/math}}/add';

		const resolved = resolveLocalDependencyTemplate({
			template,
			destPath: './src/lib/utils/test/print.ts',
			config: {
				paths: { '*': './src/blocks', utils: './src/lib/utils' },
				// biome-ignore lint/suspicious/noExplicitAny: only need paths
			} as any,
		});

		expect(resolved).toBe('../math/add');
	});

	it('Correctly replaces the template content for alias', () => {
		const template = '{{utils/math}}/add';

		const resolved = resolveLocalDependencyTemplate({
			template,
			destPath: './src/lib/utils/print.ts',
			config: {
				paths: { '*': './src/blocks', utils: '$lib/utils' },
				// biome-ignore lint/suspicious/noExplicitAny: only need paths
			} as any,
		});

		expect(resolved).toBe('$lib/utils/math/add');
	});
});
