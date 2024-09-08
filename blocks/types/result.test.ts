import { expect, test } from 'vitest';
import { Err, Ok, type Result } from './result';

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
