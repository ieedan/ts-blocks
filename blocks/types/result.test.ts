import { assert, expect, test } from 'vitest';
import { Err, Ok, type Result } from './result';

const failingFunction = <E>(err: E): Result<boolean, E> => Err(err);

const passingFunction = <T>(val: T): Result<T, string> => Ok(val);

// --- match ---

test('match: Expect pass value from match', () => {
	const expected = true;

	const res = passingFunction(expected).match(
		(val) => val,
		() => {
			throw new Error('This should not throw');
		}
	);

	expect(res).toBe(expected);
});

test('match: Expect fail value from match', () => {
	const expected = true;

	const res = failingFunction(expected).match(
		() => {
			throw new Error('This should not throw');
		},
		(err) => err
	);

	expect(res).toBe(expected);
});

// --- isOk / isErr ---

test('isOk / isErr: Expect correct `Ok` boolean assertions', () => {
	const result = passingFunction(undefined);

	expect(result.isOk()).toBe(true);
	expect(result.isErr()).toBe(false);
});

test('isOk / isErr: Expect correct `Err` boolean assertions', () => {
	const result = failingFunction(undefined);

	expect(result.isOk()).toBe(false);
	expect(result.isErr()).toBe(true);
});

// --- unwrap ---

test('unwrap: Expect correct value', () => {
	const expected = 'Success';

	const result = passingFunction(expected);

	expect(result.unwrap()).toBe(expected);
});

test('unwrap: Should throw if failed', () => {
	const result = failingFunction('oops!');

	assert.throws(result.unwrap);
});

// --- unwrapOr ---

test('unwrapOr: Expect correct value if err', () => {
	const expected = true;

	const result = failingFunction('oops!');

	expect(result.unwrapOr(expected)).toBe(expected);
});

test('unwrapOr: Expect correct value is ok', () => {
	const expected = true;

	const result = passingFunction(expected);

	expect(result.unwrapOr(false)).toBe(expected);
});

// --- unwrapOrElse ---

test('unwrapOrElse: Expect correct value if err', () => {
	const expected = true;

	const result = failingFunction('oops!');

	expect(result.unwrapOrElse(() => expected)).toBe(expected);
});

test('unwrapOrElse: Expect correct value is ok', () => {
	const expected = true;

	const result = passingFunction(expected);

	expect(result.unwrapOrElse(() => false)).toBe(expected);
});

// --- unwrapErr ---

test('unwrapErr: Expect correct error', () => {
	const expected = 'I failed!';

	const result = failingFunction(expected);

	expect(result.unwrapErr()).toBe(expected);
});

test('unwrapErr: Should throw if passed', () => {
	const result = passingFunction(true);

	assert.throws(result.unwrapErr);
});

// --- unwrapErrOr ---

test('unwrapErrOr: Expect correct error', () => {
	const expected = 'I failed!';

	const result = passingFunction(expected);

	expect(result.unwrapErrOr(expected)).toBe(expected);
});

test('unwrapErrOr: Expect correct error on fail', () => {
	const expected = 'I failed!';

	const result = failingFunction(expected);

	expect(result.unwrapErrOr(expected)).toBe(expected);
});

// --- unwrapErrOrElse ---

test('unwrapErrOrElse: Expect correct value on err', () => {
	const expected = 'I failed!';

	const result = failingFunction(expected);

	expect(result.unwrapErrOr('nope')).toBe(expected);
});

test('unwrapErrOrElse: Expect correct error on fail', () => {
	const expected = 'I failed!';

	const result = passingFunction('nope');

	expect(result.unwrapErrOr(expected)).toBe(expected);
});

// --- expect ---

test('expect: Expect correct value', () => {
	const expected = 'Success';

	const result = passingFunction(expected);

	expect(result.expect('Oh no!')).toBe(expected);
});

test('expect: Should throw if failed', () => {
	const result = failingFunction('oops!');

	assert.throws(() => result.expect('Oh no'), 'Oh no');
});

// --- expectErr ---

test('expectErr: Expect correct value', () => {
	const expected = 'Failure';

	const result = failingFunction(expected);

	expect(result.expectErr('Oh no!')).toBe(expected);
});

test('expectErr: Should throw if ok', () => {
	const result = passingFunction('oops!');

	assert.throws(() => result.expectErr('Oh no'), 'Oh no');
});

// --- map ---

test('map: Should map correctly if ok', () => {
	const expected = 'Something';
	const result = passingFunction(expected);

	expect(result.map((val) => val.length).unwrap()).toBe(expected.length);
});

test('map: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction(expected);

	expect(result.map(() => 'foo'.length).unwrapErr()).toBe(expected);
});

// --- mapOr ---

test('mapOr: Should map correctly if ok', () => {
	const expected = 'Something';
	const result = passingFunction(expected);

	expect(result.mapOr(1, (val) => val.length)).toBe(expected.length);
});

test('mapOr: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction('error');

	expect(result.mapOr(expected.length, () => 1)).toBe(expected.length);
});

// --- mapOrElse ---

test('mapOrElse: Should map correctly if ok', () => {
	const expected = 'Something';
	const result = passingFunction(expected);

	expect(
		result.mapOrElse(
			() => 0,
			(val) => val.length
		)
	).toBe(expected.length);
});

test('mapOrElse: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction('error');

	expect(
		result.mapOrElse(
			() => expected.length,
			() => 1
		)
	).toBe(expected.length);
});

// --- mapErr ---

test('mapErr: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction(expected);

	expect(result.mapErr((err) => err.length).unwrapErr()).toBe(expected.length);
});

test('mapErr: Should map correctly if ok', () => {
	const expected = 'foo';
	const result = passingFunction(expected);

	expect(result.mapErr(() => expected).unwrap()).toBe(expected);
});

// --- mapErrOr ---

test('mapErrOr: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction(expected);

	expect(result.mapErrOr(1, (val) => val.length)).toBe(expected.length);
});

test('mapErrOr: Should map correctly if ok', () => {
	const expected = 'Something';
	const result = passingFunction('error');

	expect(result.mapErrOr(expected.length, () => 1)).toBe(expected.length);
});

// --- mapErrOrElse ---

test('mapErrOrElse: Should map correctly if err', () => {
	const expected = 'Something';
	const result = failingFunction(expected);

	expect(
		result.mapErrOrElse(
			() => 1,
			(val) => val.length
		)
	).toBe(expected.length);
});

test('mapErrOrElse: Should map correctly if ok', () => {
	const expected = 'Something';
	const result = passingFunction('error');

	expect(
		result.mapErrOrElse(
			() => expected.length,
			() => 1
		)
	).toBe(expected.length);
});
