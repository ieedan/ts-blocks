import fs from 'node:fs';
import path from 'node:path';
import type { Config } from '../config';
import type { Block } from './build';

type InstalledBlock = {
	specifier: `${string}/${string}`;
	content: string;
	path: string;
};

/** Finds installed blocks and returns them as `<category>/<name>`
 *
 * @param blocks
 * @param config
 * @returns
 */
const getInstalledBlocks = (blocks: Map<string, Block>, config: Config): InstalledBlock[] => {
	const installedBlocks: InstalledBlock[] = [];

	for (const [_, block] of blocks) {
		const baseDir = path.join(config.path, block.category);

		const blockPath = path.join(baseDir, `${block.name}.ts`);

		if (fs.existsSync(blockPath))
			installedBlocks.push({
				specifier: `${block.category}/${block.name}`,
				content: fs.readFileSync(blockPath).toString(),
				path: blockPath,
			});
	}

	return installedBlocks;
};

export { getInstalledBlocks };
