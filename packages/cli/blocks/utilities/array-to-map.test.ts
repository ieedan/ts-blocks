import { expect, test } from 'vitest';
import { arrayToMap } from './array-to-map';

test('Correct returned map', () => {
	const expected = new Map();
	expected.set(0, 1);
	expected.set(1, 2);
	expected.set(2, 3);

	const map = arrayToMap([1, 2, 3], (item, index) => [index, item]);

	expect(map).toStrictEqual(expected);
});

test('Expect empty map', () => {
	const expected = new Map();

	const map = arrayToMap([], (item, index) => [index, item]);

	expect(map).toStrictEqual(expected);
});
