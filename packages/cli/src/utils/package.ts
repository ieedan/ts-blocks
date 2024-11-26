import fs from 'node:fs';
import path from 'pathe';
import { Err, Ok, type Result } from './blocks/types/result';

const findNearestPackageJson = (startDir: string, until: string): string | undefined => {
	const packagePath = path.join(startDir, 'package.json');

	if (fs.existsSync(packagePath)) return packagePath;

	if (startDir === until) return undefined;

	const segments = startDir.split(/[\/\\]/);

	return findNearestPackageJson(segments.slice(0, segments.length - 1).join('/'), until);
};

type PackageJson = {
	name: string;
	version: string;
	description: string;
	scripts: Record<string, string>;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
};

const getPackage = (path: string): Result<Partial<PackageJson>, string> => {
	if (!fs.existsSync(path)) return Err(`${path} doesn't exist`);

	const contents = fs.readFileSync(path).toString();

	return Ok(JSON.parse(contents));
};

const returnShouldInstall = (
	dependencies: Set<string>,
	devDependencies: Set<string>,
	{ cwd }: { cwd: string }
): { devDependencies: Set<string>; dependencies: Set<string> } => {
	// don't mutate originals
	const tempDeps = dependencies;
	const tempDevDeps = devDependencies;

	const packageResult = getPackage(path.join(cwd, 'package.json'));

	if (!packageResult.isErr()) {
		const pkg = packageResult.unwrap();

		if (pkg.dependencies) {
			for (const dep of tempDeps) {
				const [name, version] = dep.split('@');

				const foundDep = pkg.dependencies[name];

				// if the version isn't pinned then no need to delete
				if (version === undefined && foundDep) continue;

				// if the version installed is the same as the requested version remove the dep
				if (foundDep && foundDep === version) {
					tempDeps.delete(dep);
				}
			}
		}

		if (pkg.devDependencies) {
			for (const dep of tempDevDeps) {
				const [name, version] = dep.split('@');

				const foundDep = pkg.devDependencies[name];

				// if the version isn't pinned then no need to delete
				if (version === undefined && foundDep) continue;

				// if the version installed is the same as the requested version remove the dep
				if (foundDep && foundDep === version) {
					tempDevDeps.delete(dep);
				}
			}
		}
	}

	return { dependencies: tempDeps, devDependencies: tempDevDeps };
};

export { findNearestPackageJson, getPackage, returnShouldInstall };
