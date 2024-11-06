const categories = ['utilities', 'types'] as const;

export type Category = typeof categories[number];

export type Block = {
	dependencies?: Record<string, string>;
	/** Other utilities this block depends on */
	localDependencies?: string[];
	category: Category;
};

const blocks: Record<string, Block> = {
	result: {
		category: "types",
	},
	"array-to-map": {
		category: "utilities",
	},
	"map-to-array": {
		category: "utilities",
	},
	truncate: {
		category: "utilities",
	},
	"array-sum": {
		category: "utilities",
	},
	sleep: {
		category: "utilities",
	},
	pad: {
		category: "utilities",
	},
	stopwatch: {
		category: "utilities",
	},
	dispatcher: {
		category: "utilities",
	},
	"is-number": {
		category: "utilities",
	},
	"ipv4-address": {
		category: "utilities",
		localDependencies: ["result"],
	},
};

export { blocks, categories };
