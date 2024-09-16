import { expect, test } from 'vitest';
import { leftPad, rightPad } from './pad';

// leftPad

test('leftPad: Correct padding', () => {
	expect(leftPad('Hello', 3)).toBe('   Hello');
});

test('leftPad: Correct padding `padWith`', () => {
	expect(leftPad('Hello', 3, '.')).toBe('...Hello');
});

test('leftPad: Correct padding with 0', () => {
	expect(leftPad('Hello', 0)).toBe('Hello');
});

// rightPad

test('rightPad: Correct padding', () => {
	expect(rightPad('Hello', 3)).toBe('Hello   ');
});

test('rightPad: Correct padding `padWith`', () => {
	expect(rightPad('Hello', 3, '.')).toBe('Hello...');
});

test('rightPad: Correct padding with 0', () => {
	expect(rightPad('Hello', 0)).toBe('Hello');
});
