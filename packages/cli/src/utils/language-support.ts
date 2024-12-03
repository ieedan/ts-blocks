import fs from 'node:fs';
import { builtinModules } from 'node:module';
import { Biome, Distribution } from '@biomejs/js-api';
import type { PartialConfiguration } from '@biomejs/wasm-nodejs';
import * as v from '@vue/compiler-sfc';
import color from 'chalk';
import { walk } from 'estree-walker';
import { createPathsMatcher, getTsconfig } from 'get-tsconfig';
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
	/** Maps a literal import to a template import to be replaced during add/update */
	imports: Record<string, string>;
};

export type ResolveDependencyOptions = {
	filePath: string;
	isSubDir: boolean;
	excludeDeps: string[];
	cwd: string;
	dirs: string[];
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
	resolveDependencies: ({ filePath, isSubDir, excludeDeps, dirs, cwd }) => {
		const project = new Project();

		const blockFile = project.addSourceFileAtPath(filePath);

		const imports = blockFile
			.getImportDeclarations()
			.map((imp) => imp.getModuleSpecifierValue());

		const resolveResult = resolveImports({
			moduleSpecifiers: imports,
			filePath,
			isSubDir,
			dirs,
			cwd,
			doNotInstall: excludeDeps,
		});

		if (resolveResult.isErr()) {
			return Err(
				resolveResult
					.unwrapErr()
					.map((err) => formatError(err))
					.join('\n')
			);
		}

		return Ok(resolveResult.unwrap());
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
	resolveDependencies: ({ filePath, isSubDir, excludeDeps, dirs, cwd }) => {
		const sourceCode = fs.readFileSync(filePath).toString();

		const root = sv.parse(sourceCode, { modern: true, filename: filePath });

		// if no script tag then no dependencies
		if (!root.instance)
			return Ok({ dependencies: [], devDependencies: [], local: [], imports: {} });

		const imports: string[] = [];

		// biome-ignore lint/suspicious/noExplicitAny: The root instance is just missing the `id` prop
		walk(root.instance as any, {
			enter: (node) => {
				if (node.type === 'ImportDeclaration') {
					if (typeof node.source.value === 'string') {
						imports.push(node.source.value);
					}
				}
			},
		});

		const resolveResult = resolveImports({
			moduleSpecifiers: imports,
			filePath,
			isSubDir,
			dirs,
			cwd,
			doNotInstall: ['svelte', '@sveltejs/kit', ...excludeDeps],
		});

		if (resolveResult.isErr()) {
			return Err(
				resolveResult
					.unwrapErr()
					.map((err) => formatError(err))
					.join('\n')
			);
		}

		return Ok(resolveResult.unwrap());
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
	resolveDependencies: ({ filePath, isSubDir, excludeDeps, dirs, cwd }) => {
		const sourceCode = fs.readFileSync(filePath).toString();

		const parsed = v.parse(sourceCode, { filename: filePath });

		if (!parsed.descriptor.script?.content && !parsed.descriptor.scriptSetup?.content)
			return Ok({ dependencies: [], devDependencies: [], local: [], imports: {} });

		let compiled: v.SFCScriptBlock;
		try {
			compiled = v.compileScript(parsed.descriptor, { id: 'shut-it' }); // you need this id to remove a warning
		} catch (err) {
			return Err(`Compile error: ${err}`);
		}

		if (!compiled.imports)
			return Ok({ dependencies: [], devDependencies: [], local: [], imports: {} });

		const imports = Object.values(compiled.imports).map((imp) => imp.source);

		const resolveResult = resolveImports({
			moduleSpecifiers: imports,
			filePath,
			isSubDir,
			dirs,
			cwd,
			doNotInstall: ['vue', 'nuxt', ...excludeDeps],
		});

		if (resolveResult.isErr()) {
			return Err(
				resolveResult
					.unwrapErr()
					.map((err) => formatError(err))
					.join('\n')
			);
		}

		return Ok(resolveResult.unwrap());
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
	resolveDependencies: () =>
		Ok({ dependencies: [], local: [], devDependencies: [], imports: {} }),
	comment: (content: string) => lines.join(lines.get(content), { prefix: () => '# ' }),
	format: async (code, { formatter, prettierOptions }) => {
		if (!formatter) return code;

		if (formatter === 'prettier') {
			return await prettier.format(code, { parser: 'yaml', ...prettierOptions });
		}

		return code;
	},
};

const json: Lang = {
	matches: (fileName) => fileName.endsWith('.json'),
	resolveDependencies: () =>
		Ok({ dependencies: [], local: [], devDependencies: [], imports: {} }),
	// json doesn't support comments
	comment: (content: string) => content,
	format: async (code, { formatter, prettierOptions, biomeOptions, filePath }) => {
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

export type ResolveImportOptions = {
	moduleSpecifiers: string[];
	isSubDir: boolean;
	filePath: string;
	doNotInstall?: string[];
	dirs: string[];
	cwd: string;
};

const formatError = (err: string) => {
	return `${lines.join(lines.get(err), {
		prefix: (l) => {
			if (l === 0) return `${ascii.VERTICAL_LINE}  ${ascii.ERROR} `;

			return `${ascii.VERTICAL_LINE}  `;
		},
	})}`;
};

const resolveImports = ({
	moduleSpecifiers,
	isSubDir,
	filePath,
	doNotInstall,
	dirs,
	cwd,
}: ResolveImportOptions): Result<ResolvedDependencies, string[]> => {
	const errors: string[] = [];

	const deps = new Set<string>();
	const localDeps = new Set<string>();
	const imports: Record<string, string> = {};

	for (const specifier of moduleSpecifiers) {
		if (specifier.startsWith('.')) {
			const localDep = resolveLocalImport(specifier, isSubDir, {
				filePath,
				dirs,
				cwd,
			});

			if (localDep.isErr()) {
				errors.push(localDep.unwrapErr());
				continue;
			}

			const dep = localDep.unwrap();

			if (dep) {
				localDeps.add(dep.dependency);
				imports[specifier] = dep.template;
			}

			continue;
		}

		const localDep = tryResolveLocalAlias(specifier, isSubDir, {
			filePath,
			dirs,
			cwd,
		});

		if (localDep.isErr()) {
			errors.push(localDep.unwrapErr());
			continue;
		}

		const dep = localDep.unwrap();

		if (dep) {
			localDeps.add(dep.dependency);
			imports[specifier] = dep.template;
		} else {
			deps.add(specifier);
		}
	}

	if (errors.length > 0) {
		return Err(errors);
	}

	const { devDependencies, dependencies } = resolveRemoteDeps(Array.from(deps), filePath, {
		doNotInstall: doNotInstall ? doNotInstall : [],
	});

	return Ok({
		dependencies,
		devDependencies,
		local: Array.from(localDeps),
		imports,
	} satisfies ResolvedDependencies);
};

type ResolveLocalImportResult = {
	/** The local block that is a dependency */
	dependency: string;
	/** A template used to resolve the import during add/update */
	template: string;
};

const resolveLocalImport = (
	mod: string,
	isSubDir: boolean,
	{
		filePath,
		alias,
		dirs,
		cwd,
	}: { filePath: string; dirs: string[]; alias?: string; modIsFile?: boolean; cwd: string }
): Result<ResolveLocalImportResult | undefined, string> => {
	if (isSubDir && (mod.startsWith('./') || mod === '.')) return Ok(undefined);

	// get the path to the current category
	const categoryDir = isSubDir ? path.join(filePath, '../../') : path.join(filePath, '../');

	// get the actual path to the module
	const modPath = path.join(path.join(filePath, '../'), mod);

	// get the full path to the current category containing folder
	const fullDir = path.join(categoryDir, '../');

	// mod paths that reference outside of the current blocks directory are invalid unless it's an alias
	if (modPath.startsWith(fullDir)) {
		return Ok(parsePath(modPath.slice(fullDir.length)));
	}

	if (alias) {
		for (const dir of dirs) {
			const containingPath = path.resolve(path.join(cwd, dir));
			const absPath = path.resolve(modPath);
			if (absPath.startsWith(containingPath)) {
				return Ok(parsePath(absPath.slice(containingPath.length + 1)));
			}
		}

		return Err(
			`${filePath}:\n${alias} references code not contained in ${color.bold(dirs.join(', '))} and cannot be resolved.`
		);
	}

	return Err(
		`${filePath}:\n${mod} references code not contained in ${categoryDir} and cannot be resolved.`
	);
};

const parsePath = (localPath: string): ResolveLocalImportResult => {
	const [category, block, ...rest] = localPath.split('/');

	let trimmedBlock = block;

	// remove file extension
	if (trimmedBlock.includes('.')) {
		trimmedBlock = trimmedBlock.slice(
			0,
			trimmedBlock.length - path.parse(trimmedBlock).ext.length
		);
	}

	const blockSpecifier = `${category}/${trimmedBlock}`;

	let template = `{{${blockSpecifier}}}`;

	if (rest.length === 0) {
		if (trimmedBlock.length !== block.length) {
			// add extension to template
			template += path.parse(block).ext;
		}
	} else {
		template += `/${rest.join('/')}`;
	}

	return { dependency: blockSpecifier, template };
};

/** Tries to resolve the modules as an alias using the tsconfig. */
const tryResolveLocalAlias = (
	mod: string,
	isSubDir: boolean,
	{ filePath, dirs, cwd }: { filePath: string; dirs: string[]; cwd: string }
): Result<ResolveLocalImportResult | undefined, string> => {
	let config = getTsconfig(filePath, 'tsconfig.json');

	if (!config) {
		// if we don't find the config at first check for a jsconfig
		config = getTsconfig(filePath, 'jsconfig.json');

		if (!config) {
			return Ok(undefined);
		}
	}

	const matcher = createPathsMatcher(config);

	if (matcher) {
		// if the mod is actually remote the returns paths will be empty
		const paths = matcher(mod);

		for (const modPath of paths) {
			const foundMod = searchForModule(modPath);

			if (!foundMod) continue;

			const relativeSolved = path.relative(
				path.resolve(path.join(filePath, '../')),
				foundMod.path
			);

			const localDep = resolveLocalImport(relativeSolved, isSubDir, {
				filePath,
				alias: mod,
				dirs,
				cwd,
				modIsFile: foundMod.type === 'file',
			});

			if (localDep.isErr()) return Err(localDep.unwrapErr());

			if (localDep.unwrap()) return Ok(localDep.unwrap()!);

			break;
		}
	}

	return Ok(undefined);
};

/** Searches around for the module
 *
 * @param path
 */
const searchForModule = (
	modPath: string
): { path: string; type: 'file' | 'directory' } | undefined => {
	if (fs.existsSync(modPath)) {
		return { path: modPath, type: fs.statSync(modPath).isDirectory() ? 'directory' : 'file' };
	}

	const extension = path.parse(modPath).ext;

	// sometimes it will point to .js because it will resolve in prod but not for us
	if (extension === '.js') {
		const newPath = `${modPath.slice(0, modPath.length - 3)}.ts`;

		if (fs.existsSync(newPath)) return { path: modPath, type: 'file' };
	}

	const containing = path.join(modPath, '../');

	// open containing folder
	if (!fs.existsSync(containing)) return undefined;

	const files = fs.readdirSync(containing);

	for (const file of files) {
		const fileWithoutExtension = path.parse(file).name;

		// this way the extension doesn't matter
		if (fileWithoutExtension === path.basename(modPath)) {
			const filePath = path.join(containing, file);

			let normalizedFile = filePath;

			// in this case the .ts extension was obviously not intended
			if (normalizedFile.endsWith('.ts')) {
				normalizedFile = normalizedFile.slice(0, normalizedFile.length - 3);
			}

			return {
				path: normalizedFile,
				type: fs.statSync(filePath).isDirectory() ? 'directory' : 'file',
			};
		}
	}

	return undefined;
};

/** Iterates over the dependency and resolves each one using the nearest package.json file.
 * Strips node APIs and pins the version of each dependency based on what is in the package.json.
 *
 * @param deps
 * @param filePath
 * @returns
 */
const resolveRemoteDeps = (
	deps: string[],
	filePath: string,
	{ doNotInstall }: { doNotInstall: string[] } = {
		doNotInstall: [],
	}
) => {
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

const languages: Lang[] = [typescript, svelte, vue, yaml, json];

export { typescript, svelte, vue, yaml, json, languages };
