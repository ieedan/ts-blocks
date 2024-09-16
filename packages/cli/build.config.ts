import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: [
		'src/index',
		'src/blocks',
		'src/commands/add',
		'src/commands/init',
		'src/commands/test',
		'src/commands/index',
		'src/config/index',
		'src/utils/index',
	],
	declaration: true,
	clean: true,
});
