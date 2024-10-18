export type Category = 'types' | 'utilities';

export type Block = {
	dependencies?: Record<string, string>;
	category: Category;
};

const blocks: Record<string, Block> = {
	result: {
		category: 'types',
	},
	'array-to-map': {
		category: 'utilities',
	},
	'map-to-array': {
		category: 'utilities',
	},
	truncate: {
		category: 'utilities',
	},
	'array-sum': {
		category: 'utilities',
	},
	sleep: {
		category: 'utilities',
	},
	pad: {
		category: 'utilities',
	},
	stopwatch: {
		category: 'utilities',
	},
};

export { blocks };
