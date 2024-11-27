import fs from 'node:fs';
import { builtinModules } from 'node:module';
import { Biome, Distribution } from '@biomejs/js-api';
import type { PartialConfiguration } from '@biomejs/wasm-nodejs';
import * as v from '@vue/compiler-sfc';
import color from 'chalk';
import { walk } from 'estree-walker';
import path from 'pathe';
import * as prettier from 'prettier';
import * as sv from 'svelte/compiler';
import { Project } from 'ts-morph';
import validatePackageName from 'validate-npm-package-name';
import * as ascii from './ascii';
import { Err, Ok, type Result } from './blocks/types/result';
import * as lines from './blocks/utils/lines';
import type { Formatter } from './config';
import { findNearestPackageJson } from './package';
import { parsePackageName } from './parse-package-name';

export type ResolvedDependencies = {
	local: string[];
	devDependencies: string[];
	dependencies: string[];
};

export type ResolveDependencyOptions = {
	filePath: string;
	isSubDir: boolean;
	excludeDeps: string[];
	cwd: string;
};

export type FormatOptions = {
	formatter?: Formatter;
	/** Can be used to infer the prettier parser */
	filePath: string;
	prettierOptions: prettier.Options | null;
	biomeOptions: PartialConfiguration | null;
};

export type Lang = {
	/** Matches the supported file types */
	matches: (fileName: string) => boolean;
	/** Reads the file and gets any dependencies from its imports */
	resolveDependencies: (opts: ResolveDependencyOptions) => Result<ResolvedDependencies, string>;
	/** Returns a multiline comment containing the content */
	comment: (content: string) => string;
	format: (code: string, opts: FormatOptions) => Promise<string>;
};

const typescript: Lang = {
	matches: (fileName) =>
		fileName.endsWith('.ts') ||
		fileName.endsWith('.js') ||
		fileName.endsWith('.tsx') ||
		fileName.endsWith('.jsx'),
	resolveDependencies: ({ filePath, isSubDir, excludeDeps }) => {
		const project = new Project();

		const blockFile = project.addSourceFileAtPath(filePath);

		const imports = blockFile.getImportDeclarations();

		const relativeImports = imports.filter((declaration) =>
			declaration.getModuleSpecifierValue().startsWith('.')
		);

		const localDeps = new Set<string>();

		for (const relativeImport of relativeImports) {
			const mod = relativeImport.getModuleSpecifierValue();

			const localDep = resolveLocalImport(mod, isSubDir, { filePath });

			if (localDep.isErr()) return Err(localDep.unwrapErr());

			if (localDep.unwrap()) localDeps.add(localDep.unwrap()!);
		}

		const deps = imports
			.filter((declaration) => !declaration.getModuleSpecifierValue().startsWith('.'))
			.map((declaration) => declaration.getModuleSpecifierValue());

		const { devDependencies, dependencies } = resolveRemoteDeps(
			Array.from(deps),
			filePath,
			excludeDeps
		);

		return Ok({
			local: Array.from(localDeps),
			dependencies,
			devDependencies,
		} satisfies ResolvedDependencies);
	},
	comment: (content) => `/*\n${lines.join(lines.get(content), { prefix: () => '\t' })}\n*/`,
	format: async (code, { formatter, filePath, prettierOptions, biomeOptions }) => {
		if (!formatter) return code;

		if (formatter === 'prettier') {
			return await prettier.format(code, { filepath: filePath, ...prettierOptions });
		}

		const biome = await Biome.create({
			distribution: Distribution.NODE,
		});

		if (biomeOptions) {
			biome.applyConfiguration(biomeOptions);
		}

		return biome.formatContent(code, { filePath }).content;
	},
};

const svelte: Lang = {
	matches: (fileName) => fileName.endsWith('.svelte'),
	resolveDependencies: ({ filePath, isSubDir, excludeDeps }) => {
		const sourceCode = fs.readFileSync(filePath).toString();

		const root = sv.parse(sourceCode, { modern: true, filename: filePath });

		// if no script tag then no dependencies
		if (!root.instance) return Ok({ dependencies: [], devDependencies: [], local: [] });

		const localDeps = new Set<string>();
		const deps = new Set<string>();

		// biome-ignore lint/suspicious/noExplicitAny: The root instance is just missing the `id` prop
		walk(root.instance as any, {
			enter: (node) => {
				if (node.type === 'ImportDeclaration') {
					if (typeof node.source.value === 'string') {
						if (node.source.value.startsWith('.')) {
							const localDep = resolveLocalImport(node.source.value, isSubDir, {
								filePath,
							});

							if (localDep.isErr()) return Err(localDep.unwrapErr());

							if (localDep.unwrap()) localDeps.add(localDep.unwrap()!);
						} else {
							deps.add(node.source.value);
						}
					}
				}
			},
		});

		const { devDependencies, dependencies } = resolveRemoteDeps(Array.from(deps), filePath, [
			'svelte',
			...excludeDeps,
		]);

		return Ok({
			dependencies,
			devDependencies,
			local: Array.from(localDeps),
		} satisfies ResolvedDependencies);
	},
	comment: (content) => `<!--\n${lines.join(lines.get(content), { prefix: () => '\t' })}\n-->`,
	format: async (code, { formatter, filePath, prettierOptions }) => {
		if (!formatter) return code;

		// only attempt to format if svelte plugin is included in the config.
		if (
			formatter === 'prettier' &&
			prettierOptions &&
			prettierOptions.plugins?.find((plugin) => plugin === 'prettier-plugin-svelte')
		) {
			return await prettier.format(code, { filepath: filePath, ...prettierOptions });
		}

		return code;
	},
};

const vue: Lang = {
	matches: (fileName) => fileName.endsWith('.vue'),
	resolveDependencies: ({ filePath, isSubDir, excludeDeps }) => {
		const sourceCode = fs.readFileSync(filePath).toString();

		const parsed = v.parse(sourceCode, { filename: filePath });

		if (!parsed.descriptor.script?.content && !parsed.descriptor.scriptSetup?.content)
			return Ok({ dependencies: [], devDependencies: [], local: [] });

		const localDeps = new Set<string>();
		const deps = new Set<string>();

		let compiled: v.SFCScriptBlock;
		try {
			compiled = v.compileScript(parsed.descriptor, { id: 'shut-it' }); // you need this id to remove a warning
		} catch (err) {
			return Err(`Compile error: ${err}`);
		}

		if (!compiled.imports) return Ok({ dependencies: [], devDependencies: [], local: [] });

		const imports = Object.values(compiled.imports);

		for (const imp of imports) {
			if (imp.source.startsWith('.')) {
				const localDep = resolveLocalImport(imp.source, isSubDir, {
					filePath,
				});

				if (localDep.isErr()) return Err(localDep.unwrapErr());

				if (localDep.unwrap()) localDeps.add(localDep.unwrap()!);
			} else {
				deps.add(imp.source);
			}
		}

		const { devDependencies, dependencies } = resolveRemoteDeps(Array.from(deps), filePath, [
			'vue',
			...excludeDeps,
		]);

		return Ok({
			dependencies,
			devDependencies,
			local: Array.from(localDeps),
		} satisfies ResolvedDependencies);
	},
	comment: (content) => `<!--\n${lines.join(lines.get(content), { prefix: () => '\t' })}\n-->`,
	format: async (code, { formatter, prettierOptions }) => {
		if (!formatter) return code;

		if (formatter === 'prettier') {
			return await prettier.format(code, { parser: 'vue', ...prettierOptions });
		}

		// biome has issues with vue support
		return code;
	},
};

const yaml: Lang = {
	matches: (fileName) => fileName.endsWith('.yml') || fileName.endsWith('.yaml'),
	resolveDependencies: () => Ok({ dependencies: [], local: [], devDependencies: [] }),
	comment: (content: string) => lines.join(lines.get(content), { prefix: () => '# ' }),
	format: async (code, { formatter, prettierOptions }) => {
		if (!formatter) return code;

		if (formatter === 'prettier') {
			return await prettier.format(code, { parser: 'yaml', ...prettierOptions });
		}

		return code;
	},
};

const resolveLocalImport = (
	mod: string,
	isSubDir: boolean,
	{ filePath }: { filePath: string }
): Result<string | undefined, string> => {
	if (isSubDir && (mod.startsWith('./') || mod === '.')) return Ok(undefined);

	// get the path to the current category
	const categoryDir = isSubDir ? path.join(filePath, '../../') : path.join(filePath, '../');

	// get the actual path to the module
	const modPath = path.join(path.join(filePath, '../'), mod);

	// get the full path to the current category
	const fullDir = path.join(categoryDir, '../');

	// mod paths that reference outside of the current blocks directory are invalid
	if (modPath.startsWith(fullDir)) {
		// only valid blocks can make it to here
		let [category, block] = modPath.slice(fullDir.length).split('/');

		// remove file extension
		if (block.includes('.')) {
			block = block.slice(0, block.length - path.parse(block).ext.length);
		}

		return Ok(`${category}/${block}`);
	}

	return Err(
		`${filePath}:\n${mod} references code not contained in ${categoryDir} and cannot be resolved.`
	);
};

/** Iterates over the dependency and resolves each one using the nearest package.json file.
 * Strips node APIs and pins the version of each dependency based on what is in the package.json.
 *
 * @param deps
 * @param filePath
 * @returns
 */
const resolveRemoteDeps = (deps: string[], filePath: string, doNotInstall: string[] = []) => {
	const exemptDeps = new Set(doNotInstall);

	const filteredDeps = deps.filter(
		(dep) => !builtinModules.includes(dep) && !dep.startsWith('node:')
	);

	const pkgPath = findNearestPackageJson(path.dirname(filePath), '');

	const dependencies = new Set<string>();
	const devDependencies = new Set<string>();

	if (pkgPath) {
		const { devDependencies: packageDevDependencies, dependencies: packageDependencies } =
			JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

		for (const dep of filteredDeps) {
			const parsed = parsePackageName(dep);

			if (parsed.isErr()) {
				console.warn(
					`${ascii.WARN} Skipped adding import \`${color.cyan(dep)}\`. Reason: Couldn't parse package name`
				);
				continue;
			}

			const depInfo = parsed.unwrap();

			if (!validatePackageName(depInfo.name).validForNewPackages) {
				console.warn(
					`${ascii.WARN} Skipped adding import \`${color.cyan(dep)}\`. Reason: Not a valid package name`
				);
				continue;
			}

			if (exemptDeps.has(depInfo.name)) continue;

			let version: string | undefined = undefined;
			if (packageDependencies !== undefined) {
				version = packageDependencies[depInfo.name];
			}

			if (version !== undefined) {
				dependencies.add(`${depInfo.name}@${version}`);
				continue;
			}

			if (packageDevDependencies !== undefined) {
				version = packageDevDependencies[depInfo.name];
			}

			if (version !== undefined) {
				devDependencies.add(`${depInfo.name}@${version}`);
				continue;
			}

			// if no version found just add it without a version
			dependencies.add(depInfo.name);
		}
	}

	return {
		dependencies: Array.from(dependencies),
		devDependencies: Array.from(devDependencies),
	};
};

const languages: Lang[] = [typescript, svelte, vue, yaml];

export { typescript, svelte, vue, yaml, languages };
