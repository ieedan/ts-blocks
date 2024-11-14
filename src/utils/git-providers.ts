export type Info = {
	url: string;
	name: string;
	repoName: string;
	owner: string;
	branch: string;
	provider: Provider;
};

export interface Provider {
	/** Get the name of the provider
	 *
	 * @returns the name of the provider
	 */
	name: () => string;
	/** Returns a URL to the raw path of the resource provided in the resourcePath
	 *
	 * @param repoPath
	 * @param resourcePath
	 * @returns
	 */
	resolveRaw: (repoPath: string | Info, resourcePath: string) => URL;
	/** Parses the url and gives info about the repo
	 *
	 * @param repoPath
	 * @returns
	 */
	info: (repoPath: string) => Info;
	/** Returns true if this provider matches the provided url
	 *
	 * @param repoPath
	 * @returns
	 */
	matches: (repoPath: string) => boolean;
}

/** Valid paths
 *
 *  `https://github.com/<owner>/<repo>/[tree]/[branch]`
 *
 *  `github/<owner>/<repo>/[tree]/[branch]`
 */
const github: Provider = {
	name: () => 'github',
	resolveRaw: (repoPath, resourcePath) => {
		let info: Info;
		if (typeof repoPath === 'string') {
			info = github.info(repoPath);
		} else {
			info = repoPath;
		}

		return new URL(
			resourcePath,
			`https://raw.githubusercontent.com/${info.owner}/${info.repoName}/refs/heads/${info.branch}/`
		);
	},
	info: (repoPath) => {
		const repo = repoPath.replaceAll(/(https:\/\/github.com\/)|(github)/g, '');

		const [owner, repoName, ...rest] = repo.split('/');

		let branch = 'main';

		if (rest[0] === 'tree') {
			branch = rest[1];
		}

		return {
			url: repoPath,
			name: github.name(),
			repoName,
			owner,
			branch,
			provider: github,
		};
	},
	matches: (repoPath) =>
		repoPath.toLowerCase().startsWith('https://github.com') ||
		repoPath.toLowerCase().startsWith('github'),
};

export { github };
