import fs from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';
import color from 'chalk';
import { walk } from 'estree-walker';
import * as sv from 'svelte/compiler';
import { Project } from 'ts-morph';
import validatePackageName from 'validate-npm-package-name';
import { WARN } from '.';
import { Ok, type Result } from '../blocks/types/result';
import { findNearestPackageJson } from './package';
import { parsePackageName } from './parse-package-name';

export type ResolvedDependencies = {
	local: string[];
	devDependencies: string[];
	dependencies: string[];
};

export type Lang = {
	/** Matches the supported file types */
	matches: (fileName: string) => boolean;
	/** Reads the file and gets any dependencies from its imports */
	resolveDependencies: (
		filePath: string,
		category: string,
		isSubDir: boolean
	) => Result<ResolvedDependencies, string>;
	/** Returns a multiline comment containing the content */
	comment: (content: string) => string;
};

const typescript: Lang = {
	matches: (fileName) =>
		fileName.endsWith('.ts') ||
		fileName.endsWith('.js') ||
		fileName.endsWith('.tsx') ||
		fileName.endsWith('.jsx'),
	resolveDependencies: (filePath, category, isSubDir) => {
		const project = new Project();

		const blockFile = project.addSourceFileAtPath(filePath);

		const imports = blockFile.getImportDeclarations();

		const relativeImports = imports.filter((declaration) =>
			declaration.getModuleSpecifierValue().startsWith('.')
		);

		const localDeps = new Set<string>();

		for (const relativeImport of relativeImports) {
			const mod = relativeImport.getModuleSpecifierValue();

			const localDep = resolveLocalImport(mod, category, isSubDir);

			if (localDep) localDeps.add(localDep);
		}

		const deps = imports
			.filter((declaration) => !declaration.getModuleSpecifierValue().startsWith('.'))
			.map((declaration) => declaration.getModuleSpecifierValue());

		const { devDependencies, dependencies } = resolveRemoteDeps(Array.from(deps), filePath);

		return Ok({
			local: Array.from(localDeps),
			dependencies,
			devDependencies,
		} satisfies ResolvedDependencies);
	},
	comment: (content) => `/*\n${content}\n*/`,
};

const svelte: Lang = {
	matches: (fileName) => fileName.endsWith('.svelte'),
	resolveDependencies: (filePath, category, isSubDir) => {
		const sourceCode = fs.readFileSync(filePath).toString();

		const root = sv.parse(sourceCode, { modern: true });

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
							const localDep = resolveLocalImport(
								node.source.value,
								category,
								isSubDir
							);

							if (localDep) localDeps.add(localDep);
						} else {
							deps.add(node.source.value);
						}
					}
				}
			},
		});

		const { devDependencies, dependencies } = resolveRemoteDeps(Array.from(deps), filePath);

		return Ok({
			dependencies,
			devDependencies,
			local: Array.from(localDeps),
		} satisfies ResolvedDependencies);
	},
	comment: (content) => `<!--\n${content}\n-->`,
};

const resolveLocalImport = (
	mod: string,
	category: string,
	isSubDir: boolean
): string | undefined => {
	// do not add local deps that are within the same folder
	if (isSubDir && mod.startsWith('./')) return undefined;

	if (mod.startsWith('./')) {
		return `${category}/${path.parse(path.basename(mod)).name}`;
	}

	if (isSubDir && mod.startsWith('../') && !mod.startsWith('../.')) {
		return `${category}/${path.parse(path.basename(mod)).name}`;
	}

	const segments = mod.replaceAll('../', '').split('/');

	// invalid path
	if (segments.length !== 2) return undefined;

	return `${segments[0]}/${segments[1]}`;
};

/** Iterates over the dependency and resolves each one using the nearest package.json file.
 * Strips node APIs and pins the version of each dependency based on what is in the package.json.
 *
 * @param deps
 * @param filePath
 * @returns
 */
const resolveRemoteDeps = (deps: string[], filePath: string) => {
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
				// maybe we warn here
				console.warn(
					`${WARN} Skipped adding import \`${color.cyan(dep)}\`. Reason: Couldn't parse package name`
				);
				continue;
			}

			const depInfo = parsed.unwrap();

			if (!validatePackageName(depInfo.name).validForNewPackages) {
				// maybe we warn here
				console.warn(
					`${WARN} Skipped adding import \`${color.cyan(dep)}\`. Reason: Not a valid package name`
				);
				continue;
			}

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

const languages: Lang[] = [typescript, svelte];

export { typescript, languages };
