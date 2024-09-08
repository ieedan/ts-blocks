import { assert, expect, test } from 'vitest';
import { Err, Ok, type Result, match, unwrap } from './result';

const failingFunction = <E>(err: E): Result<boolean, E> => Err(err);

const passingFunction = <T>(val: T): Result<T, string> => Ok(val);

test('Expect correct passed result', () => {
	const [val, err] = passingFunction(true);

	expect(val).toBe(true);
	expect(err).toBe(null);
});

test('Expect correct failed result', () => {
	const [val, err] = failingFunction('I failed!');

	expect(val).toBe(null);
	expect(err).toBe('I failed!');
});

test('Expect pass value from match', () => {
	const res = match(
		passingFunction(true),
		(val) => val,
		() => {
			throw new Error('This should not throw');
		}
	);

	expect(res).toBe(true);
});

test('Expect fail value from match', () => {
	const res = match(
		failingFunction('I failed!'),
		() => {
			throw new Error('This should have thrown');
		},
		(err) => err
	);

	expect(res).toBe('I failed!');
});

test('Expect pass value from unwrap', () => {
	const res = unwrap(passingFunction(true));

	expect(res).toBe(true);
});

test('Expect fail value from unwrap', () => {
	assert.throws(() => unwrap(failingFunction('I failed!')), 'I failed!');
});
