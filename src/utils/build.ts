import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { program } from 'commander';
import * as v from 'valibot';
import { WARN } from '.';
import { languages } from './language-support';

export const blockSchema = v.object({
	name: v.string(),
	category: v.string(),
	localDependencies: v.array(v.string()),
	dependencies: v.array(v.string()),
	devDependencies: v.array(v.string()),
	tests: v.boolean(),
	/** Where to find the block relative to root */
	directory: v.string(),
	subdirectory: v.boolean(),
	files: v.array(v.string()),
});

export const categorySchema = v.object({
	name: v.string(),
	blocks: v.array(blockSchema),
});

export type Category = v.InferInput<typeof categorySchema>;

export type Block = v.InferInput<typeof blockSchema>;

const TEST_SUFFIXES = ['.test.ts', '_test.ts', '.test.js', '_test.js'] as const;

const isTestFile = (file: string): boolean =>
	TEST_SUFFIXES.find((suffix) => file.endsWith(suffix)) !== undefined;

/** Using the provided path to the blocks folder builds the blocks into categories and also resolves dependencies
 *
 * @param blocksPath
 * @returns
 */
const buildBlocksDirectory = (blocksPath: string, cwd: string): Category[] => {
	let paths: string[];

	try {
		paths = fs.readdirSync(blocksPath);
	} catch {
		program.error(color.red(`Couldn't read the ${color.bold(blocksPath)} directory.`));
	}

	const categories: Category[] = [];

	for (const categoryPath of paths) {
		const categoryDir = path.join(blocksPath, categoryPath);

		if (fs.statSync(categoryDir).isFile()) continue;

		const categoryName = path.basename(categoryPath);

		const category: Category = {
			name: categoryName,
			blocks: [],
		};

		const files = fs.readdirSync(categoryDir);

		for (const file of files) {
			const blockDir = path.join(categoryDir, file);

			if (fs.statSync(blockDir).isFile()) {
				if (isTestFile(file)) continue;

				const lang = languages.find((resolver) => resolver.matches(file));

				if (!lang) {
					console.warn(
						`${WARN} Skipped \`${color.bold(blockDir)}\` \`${color.bold(
							path.parse(file).ext
						)}\` files are not currently supported!`
					);
					continue;
				}

				const name = path.parse(path.basename(file)).name;

				// tries to find a test file with the same name as the file
				const testsPath = files.find((f) =>
					TEST_SUFFIXES.find((suffix) => f === `${name}${suffix}`)
				);

				const { dependencies, devDependencies, local } = lang
					.resolveDependencies(blockDir, categoryName, false)
					.match(
						(val) => val,
						(err) => {
							program.error(color.red(err));
						}
					);

				const block: Block = {
					name,
					directory: path.relative(cwd, categoryDir),
					category: categoryName,
					tests: testsPath !== undefined,
					subdirectory: false,
					files: [file],
					localDependencies: local,
					dependencies,
					devDependencies,
				};

				if (testsPath !== undefined) {
					block.files.push(testsPath);
				}

				category.blocks.push(block);
			} else {
				const blockName = file;

				const blockFiles = fs.readdirSync(blockDir);

				const hasTests = blockFiles.findIndex((f) => isTestFile(f)) !== -1;

				const localDepsSet = new Set<string>();
				const depsSet = new Set<string>();
				const devDepsSet = new Set<string>();

				// if it is a directory
				for (const f of blockFiles) {
					if (isTestFile(f)) continue;

					const lang = languages.find((resolver) => resolver.matches(f));

					if (!lang) {
						console.warn(
							`${WARN} Skipped \`${color.bold(path.join(blockDir, f))}\` \`${color.bold(
								path.parse(file).ext
							)}\` files are not currently supported!`
						);
						continue;
					}

					const { local, dependencies, devDependencies } = lang
						.resolveDependencies(path.join(blockDir, f), categoryName, true)
						.match(
							(val) => val,
							(err) => {
								program.error(color.red(err));
							}
						);

					for (const dep of local) {
						localDepsSet.add(dep);
					}

					for (const dep of dependencies) {
						depsSet.add(dep);
					}

					for (const dep of devDependencies) {
						devDepsSet.add(dep);
					}
				}

				const block: Block = {
					name: blockName,
					directory: path.relative(cwd, blockDir),
					category: categoryName,
					tests: hasTests,
					subdirectory: true,
					files: [...blockFiles],
					localDependencies: Array.from(localDepsSet.keys()),
					dependencies: Array.from(depsSet.keys()),
					devDependencies: Array.from(devDepsSet.keys()),
				};

				category.blocks.push(block);
			}
		}

		categories.push(category);
	}

	return categories;
};

const readCategories = (outputFilePath: string): Category[] =>
	v.parse(v.array(categorySchema), JSON.parse(fs.readFileSync(outputFilePath).toString()));

export { buildBlocksDirectory, readCategories, isTestFile };
