import { assert, describe, expect, it } from 'vitest';
import { Err, Ok, type Result } from './result';

const failingFunction = <E>(err: E): Result<boolean, E> => Err(err);

const passingFunction = <T>(val: T): Result<T, string> => Ok(val);

describe('Result', () => {
	// --- match ---

	it('Result.match: Expect pass value from match', () => {
		const expected = true;

		const res = passingFunction(expected).match(
			(val) => val,
			() => {
				throw new Error('This should not throw');
			}
		);

		expect(res).toBe(expected);
	});

	it('Result.match: Expect fail value from match', () => {
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

	it('Result.isOk / isErr: Expect correct `Ok` boolean assertions', () => {
		const result = passingFunction(undefined);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
	});

	it('Result.isOk / isErr: Expect correct `Err` boolean assertions', () => {
		const result = failingFunction(undefined);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
	});

	// --- unwrap ---

	it('Result.unwrap: Expect correct value', () => {
		const expected = 'Success';

		const result = passingFunction(expected);

		expect(result.unwrap()).toBe(expected);
	});

	it('Result.unwrap: Should throw if failed', () => {
		const result = failingFunction('oops!');

		assert.throws(result.unwrap);
	});

	// --- unwrapOr ---

	it('Result.unwrapOr: Expect correct value if err', () => {
		const expected = true;

		const result = failingFunction('oops!');

		expect(result.unwrapOr(expected)).toBe(expected);
	});

	it('Result.unwrapOr: Expect correct value is ok', () => {
		const expected = true;

		const result = passingFunction(expected);

		expect(result.unwrapOr(false)).toBe(expected);
	});

	// --- unwrapOrElse ---

	it('Result.unwrapOrElse: Expect correct value if err', () => {
		const expected = true;

		const result = failingFunction('oops!');

		expect(result.unwrapOrElse(() => expected)).toBe(expected);
	});

	it('Result.unwrapOrElse: Expect correct value is ok', () => {
		const expected = true;

		const result = passingFunction(expected);

		expect(result.unwrapOrElse(() => false)).toBe(expected);
	});

	// --- unwrapErr ---

	it('Result.unwrapErr: Expect correct error', () => {
		const expected = 'I failed!';

		const result = failingFunction(expected);

		expect(result.unwrapErr()).toBe(expected);
	});

	it('Result.unwrapErr: Should throw if passed', () => {
		const result = passingFunction(true);

		assert.throws(result.unwrapErr);
	});

	// --- unwrapErrOr ---

	it('Result.unwrapErrOr: Expect correct error', () => {
		const expected = 'I failed!';

		const result = passingFunction(expected);

		expect(result.unwrapErrOr(expected)).toBe(expected);
	});

	it('Result.unwrapErrOr: Expect correct error on fail', () => {
		const expected = 'I failed!';

		const result = failingFunction(expected);

		expect(result.unwrapErrOr(expected)).toBe(expected);
	});

	// --- unwrapErrOrElse ---

	it('Result.unwrapErrOrElse: Expect correct value on err', () => {
		const expected = 'I failed!';

		const result = failingFunction(expected);

		expect(result.unwrapErrOr('nope')).toBe(expected);
	});

	it('Result.unwrapErrOrElse: Expect correct error on fail', () => {
		const expected = 'I failed!';

		const result = passingFunction('nope');

		expect(result.unwrapErrOr(expected)).toBe(expected);
	});

	// --- expect ---

	it('Result.expect: Expect correct value', () => {
		const expected = 'Success';

		const result = passingFunction(expected);

		expect(result.expect('Oh no!')).toBe(expected);
	});

	it('Result.expect: Should throw if failed', () => {
		const result = failingFunction('oops!');

		assert.throws(() => result.expect('Oh no'), 'Oh no');
	});

	// --- expectErr ---

	it('Result.expectErr: Expect correct value', () => {
		const expected = 'Failure';

		const result = failingFunction(expected);

		expect(result.expectErr('Oh no!')).toBe(expected);
	});

	it('Result.expectErr: Should throw if ok', () => {
		const result = passingFunction('oops!');

		assert.throws(() => result.expectErr('Oh no'), 'Oh no');
	});

	// --- map ---

	it('Result.map: Should map correctly if ok', () => {
		const expected = 'Something';
		const result = passingFunction(expected);

		expect(result.map((val) => val.length).unwrap()).toBe(expected.length);
	});

	it('Result.map: Should map correctly if err', () => {
		const expected = 'Something';
		const result = failingFunction(expected);

		expect(result.map(() => 'foo'.length).unwrapErr()).toBe(expected);
	});

	// --- mapOr ---

	it('Result.mapOr: Should map correctly if ok', () => {
		const expected = 'Something';
		const result = passingFunction(expected);

		expect(result.mapOr(1, (val) => val.length)).toBe(expected.length);
	});

	it('Result.mapOr: Should map correctly if err', () => {
		const expected = 'Something';
		const result = failingFunction('error');

		expect(result.mapOr(expected.length, () => 1)).toBe(expected.length);
	});

	// --- mapOrElse ---

	it('Result.mapOrElse: Should map correctly if ok', () => {
		const expected = 'Something';
		const result = passingFunction(expected);

		expect(
			result.mapOrElse(
				() => 0,
				(val) => val.length
			)
		).toBe(expected.length);
	});

	it('Result.mapOrElse: Should map correctly if err', () => {
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

	it('Result.mapErr: Should map correctly if err', () => {
		const expected = 'Something';
		const result = failingFunction(expected);

		expect(result.mapErr((err) => err.length).unwrapErr()).toBe(expected.length);
	});

	it('Result.mapErr: Should map correctly if ok', () => {
		const expected = 'foo';
		const result = passingFunction(expected);

		expect(result.mapErr(() => expected).unwrap()).toBe(expected);
	});

	// --- mapErrOr ---

	it('Result.mapErrOr: Should map correctly if err', () => {
		const expected = 'Something';
		const result = failingFunction(expected);

		expect(result.mapErrOr(1, (val) => val.length)).toBe(expected.length);
	});

	it('Result.mapErrOr: Should map correctly if ok', () => {
		const expected = 'Something';
		const result = passingFunction('error');

		expect(result.mapErrOr(expected.length, () => 1)).toBe(expected.length);
	});

	// --- mapErrOrElse ---

	it('Result.mapErrOrElse: Should map correctly if err', () => {
		const expected = 'Something';
		const result = failingFunction(expected);

		expect(
			result.mapErrOrElse(
				() => 1,
				(val) => val.length
			)
		).toBe(expected.length);
	});

	it('Result.mapErrOrElse: Should map correctly if ok', () => {
		const expected = 'Something';
		const result = passingFunction('error');

		expect(
			result.mapErrOrElse(
				() => expected.length,
				() => 1
			)
		).toBe(expected.length);
	});
});
