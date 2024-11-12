import fs from "node:fs";
import path from "node:path";
import color from "chalk";
import { program } from "commander";
import { Project } from "ts-morph";
import * as v from "valibot";
import { findDependencies } from "./dependencies";

export const blockSchema = v.object({
	name: v.string(),
	category: v.string(),
	localDependencies: v.array(v.string()),
	tests: v.boolean(),
	subdirectory: v.boolean(),
	files: v.array(v.string()),
});

export const categorySchema = v.object({
	name: v.string(),
	blocks: v.array(blockSchema),
});

export type Category = v.InferInput<typeof categorySchema>;

export type Block = v.InferInput<typeof blockSchema>;

/** Using the provided path to the blocks folder builds the blocks into categories and also resolves localDependencies
 *
 * @param blocksPath
 * @returns
 */
const buildBlocksDirectory = (blocksPath: string): Category[] => {
	let paths: string[];

	try {
		paths = fs.readdirSync(blocksPath);
	} catch {
		program.error(color.red(`Couldn't read ${color.bold("/blocks")} directory.`));
	}

	const categories: Category[] = [];

	const project = new Project();

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
				if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;

				const name = path.basename(file).replace(".ts", "");

				const hasTests = files.findIndex((f) => f === `${name}.test.ts`) !== -1;

				const localDeps = findDependencies(blockDir, categoryName, false, project);

				const block: Block = {
					name,
					category: categoryName,
					tests: hasTests,
					subdirectory: false,
					files: [file],
					localDependencies: localDeps,
				};

				if (block.tests) {
					block.files.push(`${name}.test.ts`);
				}

				category.blocks.push(block);
			} else {
				const blockName = file;

				const blockFiles = fs.readdirSync(blockDir);

				const hasTests = blockFiles.findIndex((f) => f.endsWith("test.ts")) !== -1;

				const localDepsSet = new Set<string>();

				// if it is a directory
				for (const f of blockFiles) {
					if (!f.endsWith(".ts") || f.endsWith(".test.ts")) continue;

					const localDeps = findDependencies(path.join(blockDir, f), categoryName, true, project);

					for (const dep of localDeps) {
						localDepsSet.add(dep);
					}
				}

				const block: Block = {
					name: blockName,
					category: categoryName,
					tests: hasTests,
					subdirectory: true,
					files: [...blockFiles],
					localDependencies: Array.from(localDepsSet.keys()),
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

export { buildBlocksDirectory, readCategories };
