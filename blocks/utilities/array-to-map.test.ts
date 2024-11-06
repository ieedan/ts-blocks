import { describe, expect, it } from 'vitest';
import { arrayToMap } from './array-to-map';

describe('arrayToMap', () => {
	it('Maps array into map', () => {
		const expected = new Map();
		expected.set(0, 1);
		expected.set(1, 2);
		expected.set(2, 3);

		const map = arrayToMap([1, 2, 3], (item, index) => [index, item]);

		expect(map).toStrictEqual(expected);
	});

	it('Ignores duplicate values in map', () => {
		const expected = new Map();
		expected.set(1, 1);
		expected.set(2, 2);
		expected.set(3, 3);

		const map = arrayToMap([1, 2, 3, 3], (item) => [item, item]);

		expect(map).toStrictEqual(expected);
	});

	it('Returns empty when the map is empty', () => {
		const expected = new Map();

		const map = arrayToMap([], (item, index) => [index, item]);

		expect(map).toStrictEqual(expected);
	});
});
