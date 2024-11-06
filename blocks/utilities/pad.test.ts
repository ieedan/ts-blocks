import { describe, expect, it } from 'vitest';
import { leftPad, rightPad } from './pad';

describe('leftPad', () => {
	it('Correctly pads', () => {
		expect(leftPad('Hello', 3)).toBe('   Hello');
	});

	it('Correctly pads with the padding character `padWith`', () => {
		expect(leftPad('Hello', 3, '.')).toBe('...Hello');
	});

	it('Correctly pads with padding set to 0', () => {
		expect(leftPad('Hello', 0)).toBe('Hello');
	});
});

describe('rightPad', () => {
	it('Correctly pads', () => {
		expect(rightPad('Hello', 3)).toBe('Hello   ');
	});

	it('Correctly pads with the padding character `padWith`', () => {
		expect(rightPad('Hello', 3, '.')).toBe('Hello...');
	});

	it('Correctly pads with padding set to 0', () => {
		expect(rightPad('Hello', 0)).toBe('Hello');
	});
});
