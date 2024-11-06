const categories = ['utilities', 'types'] as const;

export type Category = (typeof categories)[number];

type Blocks =
	| 'result'
	| 'array-to-map'
	| 'map-to-array'
	| 'truncate'
	| 'array-sum'
	| 'sleep'
	| 'pad'
	| 'stopwatch'
	| 'dispatcher'
	| 'is-number'
	| 'ipv4-address';

export type Block = {
	dependencies?: Record<string, string>;
	/** Other utilities this block depends on */
	localDependencies?: Blocks[];
	category: Category;
};

const blocks: Record<Blocks, Block> = {
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
	dispatcher: {
		category: 'utilities',
	},
	'is-number': {
		category: 'utilities',
	},
	'ipv4-address': {
		category: 'utilities',
		localDependencies: ['result', 'is-number'],
	},
} as const;

// this is so that we can index without a type error
const recordBlocks = blocks as Record<string, Block>;

export { recordBlocks as blocks, categories };
