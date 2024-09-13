import { assert, expect, test } from "vitest";
import { Err, Ok, type Result } from "./result";

const failingFunction = <E>(err: E): Result<boolean, E> => Err(err);

const passingFunction = <T>(val: T): Result<T, string> => Ok(val);

test("match: Expect pass value from match", () => {
	const expected = true;

	const res = passingFunction(expected).match(
		(val) => val,
		() => {
			throw new Error("This should not throw");
		}
	);

	expect(res).toBe(expected);
});

test("match: Expect fail value from match", () => {
	const expected = true;

	const res = failingFunction(expected).match(
		() => {
			throw new Error("This should not throw");
		},
		(err) => err
	);

	expect(res).toBe(expected);
});

test("isOk: Expect correct `Ok` boolean assertions", () => {
	const result = passingFunction(undefined);

	expect(result.isOk()).toBe(true);
	expect(result.isErr()).toBe(false);
});

test("isErr: Expect correct `Err` boolean assertions", () => {
	const result = failingFunction(undefined);

	expect(result.isOk()).toBe(false);
	expect(result.isErr()).toBe(true);
});

test("unwrap: Expect correct value", () => {
	const expected = "Success";

	const result = passingFunction(expected);

	expect(result.unwrap()).toBe(expected);
});

test("unwrap: Should throw if failed", () => {
	const result = failingFunction("oops!");

	assert.throws(result.unwrap);
});

test("unwrapOr: Expect correct value", () => {
	const expected = true;

	const result = failingFunction("oops!");

	expect(result.unwrapOr(expected)).toBe(expected);
});

test("unwrapErr: Expect correct error", () => {
	const expected = "I failed!";

	const result = failingFunction(expected);

	expect(result.unwrapErr()).toBe(expected);
});

test("unwrapEr: Should throw if passed", () => {
	const result = passingFunction(true);

	assert.throws(result.unwrapErr);
});

test("unwrapErrOr: Expect correct error", () => {
	const expected = "I failed!";

	const result = passingFunction(expected);

	expect(result.unwrapErrOr(expected)).toBe(expected);
});

test("map: Should map correctly if ok", () => {
	const expected = "Something";
	const result = passingFunction(expected);

	expect(result.map((val) => val.length).unwrap()).toBe(expected.length);
});

test("map: Should map correctly if err", () => {
	const expected = "Something";
	const result = failingFunction(expected);

	expect(result.mapOr(expected.length, () => "foo".length)).toBe(expected.length);
});

test("mapOr: Should map correctly if ok", () => {
	const expected = "Something";
	const result = passingFunction(expected);

	expect(result.mapOr(1, (val) => val.length)).toBe(expected.length);
});

test("mapOr: Should map correctly if err", () => {
	const expected = "Something";
	const result = failingFunction("error");

	expect(result.mapOr(expected.length, () => 1)).toBe(expected.length);
});
