import fs from 'node:fs';
import path from 'node:path';
import type { Config } from '../config';
import type { Block } from './build';

type InstalledBlock = {
	specifier: `${string}/${string}`;
	path: string;
};

/** Finds installed blocks and returns them as `<category>/<name>`
 *
 * @param blocks
 * @param config
 * @returns
 */
const getInstalledBlocks = (
	blocks: Map<string, Block>,
	config: Config,
	cwd: string
): InstalledBlock[] => {
	const installedBlocks: InstalledBlock[] = [];

	for (const [_, block] of blocks) {
		const baseDir = path.join(cwd, config.path, block.category);

		let blockPath = path.join(baseDir, block.files[0]);
		if (block.subdirectory) {
			blockPath = path.join(baseDir, block.name);
		}

		if (fs.existsSync(blockPath))
			installedBlocks.push({
				specifier: `${block.category}/${block.name}`,
				path: blockPath,
			});
	}

	return installedBlocks;
};

export { getInstalledBlocks };
