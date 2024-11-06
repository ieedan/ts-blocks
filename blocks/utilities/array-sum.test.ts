import { describe, expect, it } from 'vitest';
import { arraySum } from './array-sum';

describe('arraySum', () => {
	it('Correctly sums the array', () => {
		const total = arraySum([1, 2, 3, 4, 5], (num) => num);

		expect(total).toBe(15);
	});

	it('Correctly sums negative and positive numbers', () => {
		const total = arraySum([1, -1], (num) => num);

		expect(total).toBe(0);
	});

	it('Returns 0 when empty', () => {
		const total = arraySum([], (num) => num);

		expect(total).toBe(0);
	});
});
