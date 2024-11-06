import { Ok, type Result } from "../types/result";

const parse = (address: string): Result<string, string> => {
	return Ok(address);
};

export { parse };
