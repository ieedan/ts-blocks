import { describe, expect, it } from 'vitest';
import { isNumber } from './is-number';

describe('isNumber', () => {
	it('Returns true for numbers', () => {
		expect(isNumber('1')).toBe(true);
		expect(isNumber('1.11')).toBe(true);
		expect(isNumber('-1')).toBe(true);
		expect(isNumber('0xff')).toBe(true);
		expect(isNumber(1)).toBe(true);
		expect(isNumber(1.11)).toBe(true);
		expect(isNumber(-1)).toBe(true);
		expect(isNumber(0xff)).toBe(true);
	});

	it('Returns false for non-numbers', () => {
		expect(isNumber('one')).toBe(false);
		expect(isNumber('10 * 10')).toBe(false);
		expect(isNumber('test')).toBe(false);
		expect(isNumber({})).toBe(false);
		expect(isNumber({ two: 2 })).toBe(false);
		expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
	});
});
