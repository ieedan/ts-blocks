import { describe, expect, it } from 'vitest';
import { truncate } from './truncate';

describe('truncate', () => {
	it('Correctly truncates forward', () => {
		const str = truncate('Hello World!', 5);

		expect(str).toBe('Hello');
	});

	it('Correctly truncates reverse', () => {
		const str = truncate('Hello World!', 6, { reverse: true });

		expect(str).toBe('World!');
	});

	it('Adds ending to the end of forward truncated string', () => {
		const str = truncate('Hello World!', 5, { ending: '...' });

		expect(str).toBe('Hello...');
	});

	it('Adds ending to the start of a reverse truncated string', () => {
		const str = truncate('Hello World!', 6, { ending: '...', reverse: true });

		expect(str).toBe('...World!');
	});
});
