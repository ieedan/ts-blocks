import fs from 'node:fs';
import path from 'node:path';

const getMap = () => {
	const map = {};

	const root = './src/routes';

	const files = fs.readdirSync(root);

	map['/'] = { routes: [] };

	for (const file of files) {
		if (!file.endsWith('.ts') && !file.endsWith('.svelte')) {
			const directory = path.join(root, file);
			// must be a directory
			getRoutes(directory);
		}
	}
};

const getRoutes = (path) => {

};

getMap();

export { getMap };
