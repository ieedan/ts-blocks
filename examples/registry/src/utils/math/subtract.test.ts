import { describe, it, expect } from "vitest";
import { subtract } from "./subtract";

describe("subtract", () => {
	it("subtracts 2 numbers", () => {
		expect(subtract(2, 2)).toBe(0);
	});
});