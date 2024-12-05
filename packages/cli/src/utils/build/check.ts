import color from 'chalk';
import * as v from 'valibot';
import type { Block, Category } from '.';
import * as ascii from '../ascii';

const ruleLevelSchema = v.union([v.literal('off'), v.literal('warn'), v.literal('error')]);

export type RuleLevel = v.InferInput<typeof ruleLevelSchema>;

export type CheckOptions = {
	categories: Category[];
	options: (string | number)[];
};

export type Rule = {
	description: string;
	check: (block: Block, { categories }: CheckOptions) => string[] | undefined;
};

const rules = {
	'no-unpinned-dependency': {
		description: 'Require all dependencies to have a pinned version.',
		check: (block) => {
			const errors: string[] = [];

			for (const dep of [...block.dependencies, ...block.devDependencies]) {
				if (!dep.includes('@')) {
					errors.push(`Couldn't find a version to use for ${color.bold(dep)}`);
				}
			}

			return errors.length > 0 ? errors : undefined;
		},
	} satisfies Rule,
	'require-local-dependency-exists': {
		description: 'Require all local dependencies to exist.',
		check: (block, { categories }) => {
			const errors: string[] = [];

			for (const dep of block.localDependencies) {
				const [depCategoryName, depBlockName] = dep.split('/');

				const depCategory = categories.find(
					(cat) => cat.name.trim() === depCategoryName.trim()
				);

				const error = `${color.bold(`${block.category}/${block.name}`)} depends on local dependency ${color.bold(dep)} which doesn't exist`;

				if (!depCategory) {
					errors.push(error);
					continue;
				}

				if (depCategory.blocks.find((b) => b.name === depBlockName) === undefined) {
					errors.push(error);
				}
			}

			return errors.length > 0 ? errors : undefined;
		},
	} satisfies Rule,
	'no-category-index-file-dependency': {
		description: 'Disallow depending on the index file of a category.',
		check: (block, { categories }) => {
			const errors: string[] = [];

			for (const dep of block.localDependencies) {
				const [categoryName, name] = dep.split('/');

				if (name !== 'index') continue;

				const category = categories.find((cat) => cat.name === categoryName);

				if (!category) continue;

				const depBlock = category.blocks.find((b) => b.name === name);

				if (!depBlock) continue;

				errors.push(
					`${color.bold(`${block.category}/${block.name}`)} depends on ${color.bold(`${categoryName}/${name}`)}`
				);
			}

			return errors.length > 0 ? errors : undefined;
		},
	} satisfies Rule,
	'max-local-dependencies': {
		description: 'Enforces a limit on the amount of local dependencies a block can have.',
		check: (block, { options }) => {
			const errors: string[] = [];

			let limit: number;

			if (typeof options[0] !== 'number') {
				limit = 5;
			} else {
				limit = options[0];
			}

			if (block.localDependencies.length > limit) {
				errors.push(
					`${color.bold(`${block.category}/${block.name}`)} has too many local dependencies (${color.bold(block.localDependencies.length)}) limit (${color.bold(limit)})`
				);
			}

			return errors.length > 0 ? errors : undefined;
		},
	} satisfies Rule,
	'no-circular-dependency': {
		description: 'Disallow circular dependencies.',
		check: (block, { categories }) => {
			const errors: string[] = [];

			const searchForDep = (
				search: string,
				block: Block,
				chain: string[]
			): string[] | undefined => {
				const newChain = [...chain, `${block.category}/${block.name}`];

				for (const dep of block.localDependencies) {
					if (dep === search) return newChain;

					const [categoryName, blockName] = dep.split('/');

					const depBlock = categories
						.find((cat) => cat.name === categoryName)
						?.blocks.find((b) => b.name === blockName);

					if (!depBlock) continue;

					const found = searchForDep(search, depBlock, newChain);

					if (found) return [...found, search];
				}

				return undefined;
			};

			const specifier = `${block.category}/${block.name}`;

			const chain = searchForDep(specifier, block, []);

			if (chain) {
				errors.push(
					`There is a circular dependency in ${color.bold(specifier)}: ${color.bold(chain.join(' -> '))}`
				);
			}

			return errors.length > 0 ? errors : undefined;
		},
	} satisfies Rule,
} as const;

const ruleKeySchema = v.union([
	v.literal('no-category-index-file-dependency'),
	v.literal('no-unpinned-dependency'),
	v.literal('require-local-dependency-exists'),
	v.literal('max-local-dependencies'),
	v.literal('no-circular-dependency'),
]);

export type RuleKey = v.InferInput<typeof ruleKeySchema>;

const ruleConfigSchema = v.record(
	ruleKeySchema,
	v.union([
		ruleLevelSchema,
		v.tupleWithRest(
			[ruleLevelSchema, v.union([v.string(), v.number()])],
			v.union([v.string(), v.number()])
		),
	])
);

export type RuleConfig = v.InferInput<typeof ruleConfigSchema>;

const DEFAULT_CONFIG: RuleConfig = {
	'no-category-index-file-dependency': 'warn',
	'no-unpinned-dependency': 'warn',
	'require-local-dependency-exists': 'error',
	'max-local-dependencies': ['warn', 10],
	'no-circular-dependency': 'error',
} as const;

const runRules = (
	categories: Category[],
	config: RuleConfig = DEFAULT_CONFIG
): { warnings: string[]; errors: string[] } => {
	const warnings: string[] = [];
	const errors: string[] = [];

	for (const category of categories) {
		for (const block of category.blocks) {
			for (const [name, rule] of Object.entries(rules)) {
				const conf = config[name as RuleKey]!;

				let level: RuleLevel;
				const options: (string | number)[] = [];
				if (Array.isArray(conf)) {
					level = conf[0];
					options.push(...conf.slice(1));
				} else {
					level = conf;
				}

				if (level === 'off') continue;

				const ruleErrors = rule.check(block, { categories, options });

				if (!ruleErrors) continue;

				if (level === 'error') {
					errors.push(
						...ruleErrors.map(
							(err) =>
								`${ascii.VERTICAL_LINE}  ${ascii.ERROR} ${color.red(err)} ${color.gray(name)}`
						)
					);
					continue;
				}

				warnings.push(
					...ruleErrors.map(
						(err) => `${ascii.VERTICAL_LINE}  ${ascii.WARN} ${err} ${color.gray(name)}`
					)
				);
			}
		}
	}

	return { warnings, errors };
};

export { rules, runRules, DEFAULT_CONFIG, ruleLevelSchema, ruleConfigSchema, ruleKeySchema };
