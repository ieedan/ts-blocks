import { expect, test } from 'vitest';
import { sleep } from './sleep';

test('Expect time elapsed', async () => {
	const start = Date.now();

	const duration = 50;

	await sleep(duration);

	const end = Date.now();

	expect(end - start).toBeGreaterThanOrEqual(duration);
});
