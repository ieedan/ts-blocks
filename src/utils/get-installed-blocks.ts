import type { Config } from '../config';
import { blocks } from '../blocks';
import path from 'node:path';
import fs from 'node:fs';

const getInstalledBlocks = (config: Config) => {
	const installedBlocks: string[] = [];

	for (const [key, block] of Object.entries(blocks)) {
		let baseDir: string;
		if (config.addByCategory) {
			baseDir = path.join(config.path, block.category);
		} else {
			baseDir = config.path;
		}

		const blockPath = path.join(baseDir, `${key}.ts`);

		if (fs.existsSync(blockPath)) installedBlocks.push(key);
	}

	return installedBlocks;
};

export { getInstalledBlocks };
