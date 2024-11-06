import { describe, expect, it } from 'vitest';
import { formatToString, parse, validate } from './ipv4-address';

describe('parse', () => {
	it(`Allows '.' separator.`, () => {
		const expected = [192, 168, 100, 10];

		expect(parse(expected.join('.')).unwrap()).toStrictEqual(expected);
	});

	it(`Allows '_' separator.`, () => {
		const expected = [192, 168, 100, 10];

		expect(parse(expected.join('_')).unwrap()).toStrictEqual(expected);
	});

	it(`Allows ' ' separator.`, () => {
		const expected = [192, 168, 100, 10];

		expect(parse(expected.join(' ')).unwrap()).toStrictEqual(expected);
	});

	it('Allows leading 0s', () => {
		expect(parse('001.001.001.001').unwrap()).toStrictEqual([1, 1, 1, 1]);
	});

	it('Returns error when invalid', () => {
		expect(parse('192.168.256.10').unwrapErr()).toStrictEqual({
			octet: 3,
			message: "'256' is out of range.",
		});
		expect(parse('192.168.0').unwrapErr()).toStrictEqual({
			message: "'192.168.0' is invalid as it doesn't contain 4 octets.",
		});
	});
});

describe('validate', () => {
	it('Returns true when valid', () => {
		expect(validate([192, 168, 100, 10])).toBe(true);
		expect(validate('192.168.100.10')).toBe(true);
		expect(validate('192_168_100_10')).toBe(true);
	});

	it('Returns false when invalid', () => {
		expect(validate([192, 168, 100, -10])).toBe(false);
		expect(validate([192, 168, 100, -56])).toBe(false);
		expect(validate('192.168.100.256')).toBe(false);
		expect(validate('192.168.100.-10')).toBe(false);
	});
});

describe('formatToString', () => {
	it('Returns the correct format', () => {
		expect(formatToString([192, 168, 100, 10]).unwrap()).toBe('192.168.100.10');
		expect(formatToString([192, 168, 100, 10], ' ').unwrap()).toBe('192 168 100 10');
		expect(formatToString([192, 168, 100, 10], '_').unwrap()).toBe('192_168_100_10');
	});
});
