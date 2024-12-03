import fs from 'node:fs';
import color from 'chalk';
import { program } from 'commander';
import path from 'pathe';
import * as v from 'valibot';
import * as ascii from './ascii';
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
	_imports_: v.record(v.string(), v.string()),
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

type Options = {
	cwd: string;
	excludeDeps: string[];
	includeBlocks: string[];
	includeCategories: string[];
	errorOnWarn: boolean;
	dirs: string[];
};

/** Using the provided path to the blocks folder builds the blocks into categories and also resolves dependencies
 *
 * @param blocksPath
 * @returns
 */
const buildBlocksDirectory = (
	blocksPath: string,
	{ cwd, excludeDeps, includeBlocks, includeCategories, errorOnWarn, dirs }: Options
): Category[] => {
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

		// if includeCategories enabled and block is not part of includeCategories skip adding it
		if (
			includeCategories.length > 0 &&
			includeCategories.find((val) => val.trim() === categoryName.trim()) === undefined
		)
			continue;

		const category: Category = {
			name: categoryName,
			blocks: [],
		};

		const files = fs.readdirSync(categoryDir);

		for (const file of files) {
			const blockDir = path.join(categoryDir, file);

			if (fs.statSync(blockDir).isFile()) {
				if (isTestFile(file)) continue;

				const name = path.parse(path.basename(file)).name;

				// if includeBlocks enabled and block is not part of includeBlocks skip adding it
				if (
					includeBlocks.length > 0 &&
					includeBlocks.find((val) => val.trim() === name.trim()) === undefined
				)
					continue;

				const lang = languages.find((resolver) => resolver.matches(file));

				if (!lang) {
					const error = 'files are not currently supported!';

					if (errorOnWarn) {
						program.error(
							color.red(
								`Couldn't add \`${color.bold(blockDir)}\` \`*${color.bold(
									path.parse(file).ext
								)}\` ${error}`
							)
						);
					} else {
						console.warn(
							`${ascii.VERTICAL_LINE}  ${ascii.WARN} Skipped \`${color.bold(blockDir)}\` \`*${color.bold(
								path.parse(file).ext
							)}\` ${error}`
						);
					}

					continue;
				}

				// tries to find a test file with the same name as the file
				const testsPath = files.find((f) =>
					TEST_SUFFIXES.find((suffix) => f === `${name}${suffix}`)
				);

				const { dependencies, devDependencies, local, imports } = lang
					.resolveDependencies({
						filePath: blockDir,
						isSubDir: false,
						excludeDeps,
						cwd,
						dirs,
					})
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
					_imports_: imports,
					dependencies,
					devDependencies,
				};

				if (testsPath !== undefined) {
					block.files.push(testsPath);
				}

				category.blocks.push(block);
			} else {
				const blockName = file;

				// if includeBlocks enabled and block is not part of includeBlocks skip adding it
				if (
					includeBlocks.length > 0 &&
					includeBlocks.find((val) => val.trim() === blockName.trim()) === undefined
				)
					continue;

				const blockFiles = fs.readdirSync(blockDir);

				const hasTests = blockFiles.findIndex((f) => isTestFile(f)) !== -1;

				const localDepsSet = new Set<string>();
				const depsSet = new Set<string>();
				const devDepsSet = new Set<string>();
				const imports: Record<string, string> = {};

				// if it is a directory
				for (const f of blockFiles) {
					if (isTestFile(f)) continue;

					if (fs.statSync(path.join(blockDir, f)).isDirectory()) {
						const error = 'subdirectories are not currently supported!';

						if (errorOnWarn) {
							program.error(
								color.red(
									`Couldn't add \`${color.bold(path.join(blockDir, f))}\` ${error}`
								)
							);
						} else {
							console.warn(
								`${ascii.VERTICAL_LINE}  ${ascii.WARN} Skipped \`${color.bold(path.join(blockDir, f))}\` ${error}`
							);
						}
						continue;
					}

					const lang = languages.find((resolver) => resolver.matches(f));

					if (!lang) {
						const error = 'files are not currently supported!';

						if (errorOnWarn) {
							program.error(
								color.red(
									`Couldn't add \`${color.bold(path.join(blockDir, f))}\` \`*${color.bold(
										path.parse(f).ext
									)}\` ${error}`
								)
							);
						} else {
							console.warn(
								`${ascii.VERTICAL_LINE}  ${ascii.WARN} Skipped \`${path.join(blockDir, f)}\` \`*${color.bold(
									path.parse(f).ext
								)}\` ${error}`
							);
						}
						continue;
					}

					const {
						local,
						dependencies,
						devDependencies,
						imports: imps,
					} = lang
						.resolveDependencies({
							filePath: path.join(blockDir, f),
							isSubDir: true,
							excludeDeps,
							cwd,
							dirs,
						})
						.match(
							(val) => val,
							(err) => {
								program.error(color.red(err));
							}
						);

					for (const dep of local) {
						// don't add self
						if (dep === `${categoryName}/${blockName}`) continue;

						localDepsSet.add(dep);
					}

					for (const dep of dependencies) {
						depsSet.add(dep);
					}

					for (const dep of devDependencies) {
						devDepsSet.add(dep);
					}

					for (const [k, v] of Object.entries(imps)) {
						imports[k] = v;
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
					_imports_: imports,
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
