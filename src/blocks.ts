export type Category = "types" | "utilities";

export type Block = {
	dependencies?: Record<string, string>;
	category: Category;
	exports: string[];
};

const blocks: Record<string, Block> = {
	result: {
		category: "types",
		exports: ["Result", "Ok", "Err"],
	},
	"array-to-map": {
		category: "utilities",
		exports: ["arrayToMap"],
	},
	"map-to-array": {
		category: "utilities",
		exports: ["mapToArray"],
	},
	truncate: {
		category: "utilities",
		exports: ["truncate"],
	},
	"array-sum": {
		category: "utilities",
		exports: ["arraySum"],
	},
	sleep: {
		category: "utilities",
		exports: ["sleep"],
	},
};

export { blocks };
