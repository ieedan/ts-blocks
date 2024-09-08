import { expect, test } from "vitest";
import { truncate } from "./truncate";

test("Correct forward", () => {
    const str = truncate('Hello World!', 5);

	expect(str).toBe('Hello');
});

test("Correct reverse", () => {
    const str = truncate('Hello World!', 6, { reverse: true });

	expect(str).toBe('World!');
});

test("Correct forward with ending", () => {
    const str = truncate('Hello World!', 5, { ending: '...' });

	expect(str).toBe('Hello...');
});

test("Correct reverse with ending", () => {
    const str = truncate('Hello World!', 6, { ending: '...', reverse: true });

	expect(str).toBe('...World!');
});
