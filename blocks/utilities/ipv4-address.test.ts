import { describe, it, expect } from "vitest";
import { parse } from "./ipv4-address";

describe("parse", () => {
	it("Should return Ok", () => {
		parse("").unwrap();
	});
});
