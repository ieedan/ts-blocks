import fs from 'node:fs';
import path from 'node:path';
import type { Config } from '../config';
import type { Block } from './build';

const getInstalledBlocks = (blocks: Map<string, Block>, config: Config): string[] => {
	const installedBlocks: string[] = [];

	for (const [_, block] of blocks) {
		const baseDir = path.join(config.path, block.category);

		const blockPath = path.join(baseDir, `${block.name}.ts`);

		if (fs.existsSync(blockPath)) installedBlocks.push(`${block.category}/${block.name}`);
	}

	return installedBlocks;
};

export { getInstalledBlocks };
