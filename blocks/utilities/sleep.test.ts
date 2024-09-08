import { expect, test } from "vitest";
import { sleep } from "./sleep";

// This test takes a bit and its a very simple function so feel free to take it out
test("Expect time elapsed", async () => {
    const start = Date.now();

    await sleep(1000);

    const end = Date.now();

	expect(end - start).toBeGreaterThanOrEqual(1000);
});
