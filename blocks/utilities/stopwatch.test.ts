import { expect, test } from "vitest";
import { stopwatch } from "./stopwatch";

// we add this here so that we have a 0 dependency test
const sleep = async (durationMs: number): Promise<void> => new Promise((res) => setTimeout(res, durationMs));

test("Expect correct elapsed time", async () => {
	const w = stopwatch();

	w.start();

	await sleep(50);

	expect(w.elapsed()).toBeGreaterThanOrEqual(25);
});

test("Expect error while accessing before start", async () => {
	const w = stopwatch();

	expect(w.elapsed).toThrow();
});

test("Expect reset to reset", async () => {
	const w = stopwatch();

    w.start()

    w.stop()

    w.elapsed()

    w.reset()

	expect(w.elapsed).toThrow();
});
