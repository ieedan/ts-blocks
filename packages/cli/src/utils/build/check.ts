import type { Block, Category } from '.';
import color from 'chalk';
import * as ascii from '../ascii';
import { program } from 'commander';

export type RuleLevel = 'off' | 'warn' | 'error';

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
	'require-dependency-exists': {
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
} as const;

export type RuleKey = keyof typeof rules;

export type RuleConfig = Record<
	keyof typeof rules,
	RuleLevel | [RuleLevel, ...(number | string)[]]
>;

const DEFAULT_CONFIG: RuleConfig = {
	'no-category-index-file-dependency': 'warn',
	'no-unpinned-dependency': 'warn',
	'require-dependency-exists': 'error',
	'max-local-dependencies': ['warn', 10],
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
				const conf = config[name as RuleKey];

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

export { rules, runRules, DEFAULT_CONFIG };
