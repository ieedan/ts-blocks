import { expect, test } from "vitest";
import { arraySum } from "./array-sum";

test("Correct Sum Of All Elements", () => {
	const total = arraySum([1, 2, 3, 4, 5], (num) => num);

	expect(total).toBe(15);
});

test("Expect 0 on empty", () => {
	const total = arraySum([], (num) => num);

	expect(total).toBe(0);
});