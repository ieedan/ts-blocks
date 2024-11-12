import fs from 'node:fs';
import path from 'node:path';
import color from 'chalk';
import { program } from 'commander';
import { Project } from 'ts-morph';

export type Category = {
	name: string;
	blocks: Block[];
};

export type Block = {
	name: string;
	category: string;
	localDependencies?: string[];
	tests: boolean;
};

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
		program.error(color.red(`Couldn't read ${color.bold('/blocks')} directory.`));
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

		const project = new Project();

		for (const file of files) {
			if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;

			const name = path.basename(file).replace('.ts', '');

			const hasTests = files.findIndex((f) => f === `${name}.test.ts`) !== -1;

			const blockFile = project.addSourceFileAtPath(path.join(categoryDir, file));

			const imports = blockFile.getImportDeclarations();

			const relativeImports = imports.filter((declaration) =>
				declaration.getModuleSpecifierValue().startsWith('.')
			);

			const localDeps: string[] = [];

			const removeExtension = (p: string) => {
				const index = p.lastIndexOf('.');

				if (index === -1) return p;

				return p.slice(0, index + 1);
			};

			// Attempts to resolve local dependencies
			// Can only resolve dependencies that are within the blocks folder so `./` or `../` paths.

			for (const relativeImport of relativeImports) {
				const mod = relativeImport.getModuleSpecifierValue();

				if (mod.startsWith('./')) {
					localDeps.push(`${categoryName}/${removeExtension(path.basename(mod))}`);
					continue;
				}

				// path cannot be resolved
				if (!mod.startsWith('../') || mod.startsWith('../.')) continue;

				const segments = mod.replaceAll('../', '').split('/');

				// invalid path
				if (segments.length !== 2) continue;

				localDeps.push(`${segments[0]}/${segments[1]}`);
			}

			const block: Block = {
				name,
				category: categoryName,
				localDependencies: localDeps,
				tests: hasTests,
			};

			category.blocks.push(block);
		}

		categories.push(category);
	}

	return categories;
};

const readCategories = (outputFilePath: string): Category[] =>
	JSON.parse(fs.readFileSync(outputFilePath).toString());

export { buildBlocksDirectory, readCategories };
