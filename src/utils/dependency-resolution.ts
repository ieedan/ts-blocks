import fs from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { Project } from "ts-morph";
import { findNearestPackageJson } from "./package";

export type ResolvedDependencies = {
	local: string[];
	devDependencies: string[];
	dependencies: string[];
};

export type Resolver = {
	/** Matches the supported file types */
	matches: (fileName: string) => boolean;
	/** Reads the file and gets any dependencies from its imports */
	resolve: (filePath: string, category: string, isSubDir: boolean) => ResolvedDependencies;
};

const typescript: Resolver = {
	matches: (fileName) => fileName.endsWith(".ts") || fileName.endsWith(".js"),
	resolve: (filePath, category, isSubDir) => {
		const project = new Project();

		const blockFile = project.addSourceFileAtPath(filePath);

		const imports = blockFile.getImportDeclarations();

		const relativeImports = imports.filter((declaration) => declaration.getModuleSpecifierValue().startsWith("."));

		const localDeps: string[] = [];

		const removeExtension = (p: string) => {
			const index = p.lastIndexOf(".");

			if (index === -1) return p;

			return p.slice(0, index + 1);
		};

		// Attempts to resolve local dependencies
		// Can only resolve dependencies that are within the blocks folder so `./` or `../` paths.

		for (const relativeImport of relativeImports) {
			const mod = relativeImport.getModuleSpecifierValue();

			// do not add local deps that are within the same folder
			if (isSubDir && mod.startsWith("./")) continue;

			if (mod.startsWith("./")) {
				localDeps.push(`${category}/${removeExtension(path.basename(mod))}`);
				continue;
			}

			if (isSubDir && mod.startsWith("../") && !mod.startsWith("../.")) {
				localDeps.push(`${category}/${removeExtension(path.basename(mod))}`);
				continue;
			}

			const segments = mod.replaceAll("../", "").split("/");

			// invalid path
			if (segments.length !== 2) continue;

			localDeps.push(`${segments[0]}/${segments[1]}`);
		}

		const remoteImports = imports.filter(
			(declaration) =>
				!declaration.getModuleSpecifierValue().startsWith(".") &&
				!builtinModules.includes(declaration.getModuleSpecifierValue()) &&
				!declaration.getModuleSpecifierValue().startsWith("node:")
		);

		const pkgPath = findNearestPackageJson(path.dirname(filePath), "");

		const dependencies: string[] = [];
		const devDependencies: string[] = [];

		if (pkgPath) {
			const { devDependencies: packageDevDependencies, dependencies: packageDependencies } = JSON.parse(
				fs.readFileSync(pkgPath, "utf-8")
			);

			for (const imp of remoteImports) {
				let version = packageDependencies[imp.getModuleSpecifierValue()];

				if (version !== undefined) {
					dependencies.push(`${imp.getModuleSpecifierValue()}@${version}`);
					continue;
				}

				version = packageDevDependencies[imp.getModuleSpecifierValue()];

				if (version !== undefined) {
					devDependencies.push(`${imp.getModuleSpecifierValue()}@${version}`);
					continue;
				}

				dependencies.push(imp.getModuleSpecifierValue());
			}
		}

		return { local: localDeps, dependencies, devDependencies };
	},
};

const resolvers: Resolver[] = [typescript];

export { typescript, resolvers };
