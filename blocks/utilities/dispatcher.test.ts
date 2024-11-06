import { describe, expect, it } from 'vitest';
import { newDispatcher } from './dispatcher';

describe('dispatcher', () => {
	it('Listen then un-listen', () => {
		const dispatcher = newDispatcher();

		let count = 0;

		const dispatcherId = dispatcher.addListener(() => {
			count += 2;
		});

		dispatcher.emit();

		expect(count).toBe(2);

		dispatcher.removeListener(dispatcherId);

		dispatcher.emit();

		expect(count).toBe(2);
	});

	it('All listen then un-listen', () => {
		const dispatcher = newDispatcher();

		let count = 0;

		dispatcher.addListener(() => {
			count += 2;
		});
		dispatcher.addListener(() => {
			count += 2;
		});

		dispatcher.emit();

		expect(count).toBe(4);

		dispatcher.removeAllListeners();

		dispatcher.emit();

		expect(count).toBe(4);
	});

	it('All listen then one un-listens', () => {
		const dispatcher = newDispatcher();

		let count = 0;

		const firstId = dispatcher.addListener(() => {
			count += 2;
		});
		dispatcher.addListener(() => {
			count += 5;
		});

		dispatcher.emit();

		expect(count).toBe(7);

		dispatcher.removeListener(firstId);

		dispatcher.emit();

		expect(count).toBe(12);
	});

	it('All listeners receive params', () => {
		const dispatcher = newDispatcher<{ currentCount: number }>();

		let count = 2;

		dispatcher.addListener((opts) => {
			if (opts === undefined) return;

			count = opts.currentCount + 2;
		});

		dispatcher.emit({ currentCount: count });

		expect(count).toBe(4);
	});
});
