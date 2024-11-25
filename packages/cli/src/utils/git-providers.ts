import { Octokit } from 'octokit';
import * as v from 'valibot';
import type { RemoteBlock } from './blocks';
import { Err, Ok, type Result } from './blocks/types/result';
import { type Category, categorySchema } from './build';
import { OUTPUT_FILE } from './context';
import * as persisted from './persisted';

const octokit = new Octokit({});

export type Info = {
	refs: 'tags' | 'heads';
	url: string;
	name: string;
	repoName: string;
	owner: string;
	ref: string;
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
	resolveRaw: (repoPath: string | Info, resourcePath: string) => Promise<URL>;
	/** Returns the content of the requested resource
	 *
	 * @param repoPath
	 * @param resourcePath
	 * @returns
	 */
	fetchRaw: (repoPath: string | Info, resourcePath: string) => Promise<Result<string, string>>;
	/** Returns the manifest for the provided repoPath
	 *
	 * @param repoPath
	 * @param resourcePath
	 * @returns
	 */
	fetchManifest: (repoPath: string | Info) => Promise<Result<Category[], string>>;
	/** Parses the url and gives info about the repo
	 *
	 * @param repoPath
	 * @returns
	 */
	info: (repoPath: string | Info) => Promise<Info>;
	/** Returns true if this provider matches the provided url
	 *
	 * @param repoPath
	 * @returns
	 */
	matches: (repoPath: string) => boolean;
}

/** Valid paths
 *
 *  `https://github.com/<owner>/<repo>/[tree]/[ref]`
 *
 *  `github/<owner>/<repo>/[tree]/[ref]`
 */
const github: Provider = {
	name: () => 'github',
	resolveRaw: async (repoPath, resourcePath) => {
		const info = await github.info(repoPath);

		return new URL(
			resourcePath,
			`https://raw.githubusercontent.com/${info.owner}/${info.repoName}/refs/${info.refs}/${info.ref}/`
		);
	},
	fetchRaw: async (repoPath, resourcePath) => {
		const url = await github.resolveRaw(repoPath, resourcePath);

		const errorMessage = (err: string) => {
			return Err(
				`There was an error fetching the \`${OUTPUT_FILE}\` from the repository \`${url.href}\` make sure the target repository has a \`${OUTPUT_FILE}\` in its root.\n Error: ${err}`
			);
		};

		try {
			const token = persisted.get().get(`${github.name()}-token`);

			const headers = new Headers();

			if (token !== undefined) {
				headers.append('Authorization', `token ${token}`);
			}

			const response = await fetch(url, { headers });

			if (!response.ok) {
				return errorMessage(`${response.status} ${response.text}`);
			}

			return Ok(await response.text());
		} catch (err) {
			return errorMessage(`${err}`);
		}
	},
	fetchManifest: async (repoPath) => {
		const manifest = await github.fetchRaw(repoPath, OUTPUT_FILE);

		if (manifest.isErr()) return Err(manifest.unwrapErr());

		const categories = v.parse(v.array(categorySchema), JSON.parse(manifest.unwrap()));

		return Ok(categories);
	},
	info: async (repoPath) => {
		if (typeof repoPath !== 'string') return repoPath;

		const repo = repoPath.replaceAll(/(https:\/\/github.com\/)|(github\/)/g, '');

		const [owner, repoName, ...rest] = repo.split('/');

		let ref = 'main';

		if (rest[0] === 'tree') {
			ref = rest[1];
		}

		// checks if the type of the ref is tags or heads
		let refs: 'heads' | 'tags' = 'heads';
		// no need to check if ref is main
		if (ref !== 'main') {
			try {
				const { data: tags } = await octokit.rest.git.listMatchingRefs({
					owner,
					repo: repoName,
					ref: 'tags',
				});

				if (tags.some((tag) => tag.ref === `refs/tags/${ref}`)) {
					refs = 'tags';
				}
			} catch {
				refs = 'heads';
			}
		}

		return {
			refs,
			url: repoPath,
			name: github.name(),
			repoName,
			owner,
			ref: ref,
			provider: github,
		};
	},
	matches: (repoPath) =>
		repoPath.toLowerCase().startsWith('https://github.com') ||
		repoPath.toLowerCase().startsWith('github'),
};

const providers = [github];

const getProviderInfo = async (repo: string): Promise<Result<Info, string>> => {
	const provider = providers.find((provider) => provider.matches(repo));
	if (provider) {
		return Ok(await provider.info(repo));
	}

	return Err('Only GitHub repositories are supported at this time!');
};

const fetchBlocks = async (
	...repos: string[]
): Promise<Result<Map<string, RemoteBlock>, { message: string; repo: string }>> => {
	const blocksMap = new Map<string, RemoteBlock>();
	for (const repo of repos) {
		const getProviderResult = await getProviderInfo(repo);

		if (getProviderResult.isErr()) return Err({ message: getProviderResult.unwrapErr(), repo });

		const providerInfo = getProviderResult.unwrap();

		const getManifestResult = await providerInfo.provider.fetchManifest(providerInfo);

		if (getManifestResult.isErr()) return Err({ message: getManifestResult.unwrapErr(), repo });

		const categories = getManifestResult.unwrap();

		for (const category of categories) {
			for (const block of category.blocks) {
				blocksMap.set(
					`${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}/${category.name}/${block.name}`,
					{
						...block,
						sourceRepo: providerInfo,
					}
				);
			}
		}
	}

	return Ok(blocksMap);
};

export { github, getProviderInfo, fetchBlocks, providers };
