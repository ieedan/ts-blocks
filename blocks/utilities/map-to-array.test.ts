import { expect, test } from "vitest";
import { mapToArray } from "./map-to-array";

test("Correct Sum Of All Elements", () => {
	const initialMap = new Map<number, number>();
	initialMap.set(0, 1);
	initialMap.set(1, 2);
	initialMap.set(2, 3);

	const arr = mapToArray(initialMap, (_, value) => value);

	expect(arr).toStrictEqual([1, 2, 3]);
});

test("Returns empty array", () => {
	const initialMap = new Map<number, number>();

	const arr = mapToArray(initialMap, (_, value) => value);

	expect(arr).toStrictEqual([]);
});
