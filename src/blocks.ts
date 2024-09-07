export type Category = "types" | "utilities";

export type Block = {
	dependencies?: Record<string, string>;
	category: Category;
};

const blocks: Record<string, Block> = {
	result: {
		category: "types",
	},
	"to-map": {
		category: "utilities",
	},
};

export { blocks };
