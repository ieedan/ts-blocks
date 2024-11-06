import { Ok, type Result } from "../types/result";

type IPv4Address =
	| [number, number, number, number]
	| `${number}.${number}.${number}.${number}`
	| `${number} ${number} ${number} ${number}`
	| `${number}_${number}_${number}_${number}`;

const parse = (_address: string): Result<[number, number, number, number], string> => {
	return Ok([0, 0, 0, 0]);
};

const formatToString = (address: IPv4Address, separator: "." | "_" | " " = "."): string => {
	if (Array.isArray(address)) {
		return `${address[0]}${separator}${address[1]}${separator}${address[2]}${separator}${address[3]}`;
	}

	return formatToString(parse(address).expect("Invalid IPv4Address"));
};

export { parse, formatToString };
