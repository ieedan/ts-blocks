import fs from 'node:fs';
import path from 'pathe';

const findNearestPackageJson = (startDir: string, until: string): string | undefined => {
	const packagePath = path.join(startDir, 'package.json');

	if (fs.existsSync(packagePath)) return packagePath;

	if (startDir === until) return undefined;

	const segments = startDir.split(/[\/\\]/);

	return findNearestPackageJson(segments.slice(0, segments.length - 1).join('/'), until);
};

export { findNearestPackageJson };
