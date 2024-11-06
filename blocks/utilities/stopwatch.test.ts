import { describe, expect, it } from 'vitest';
import { stopwatch } from './stopwatch';

// we add this here so that we have a 0 dependency test
const sleep = async (durationMs: number): Promise<void> =>
	new Promise((res) => setTimeout(res, durationMs));

describe('stopwatch', () => {
	it('Correctly indicates the elapsed time', async () => {
		const w = stopwatch();

		w.start();

		await sleep(50);

		expect(w.elapsed()).toBeGreaterThanOrEqual(25);
	});

	it('Will error if `elapsed` is called before `.start()`', async () => {
		const w = stopwatch();

		expect(w.elapsed).toThrow();
	});

	it('Will reset when `.reset()` is called', async () => {
		const w = stopwatch();

		w.start();

		w.stop();

		w.elapsed();

		w.reset();

		expect(w.elapsed).toThrow();
	});
});
