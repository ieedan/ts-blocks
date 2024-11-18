import type { Block, Category } from './build';

export interface CLIContext {
	/** The package.json of the CLI */
	package: {
		name: string;
		version: string;
		description: string;
		repository: {
			url: string;
		};
	};
	/** Resolves the path relative to the root of the application
	 *
	 * @param path
	 * @returns
	 */
	resolveRelativeToRoot: (path: string) => string;
}