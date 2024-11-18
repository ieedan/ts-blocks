import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, intro, isCancel, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Command, program } from 'commander';
import { diffLines } from 'diff';
import * as v from 'valibot';
import { context } from '..';
import { getConfig } from '../config';
import { OUTPUT_FILE } from '../utils';
import { type Block, isTestFile } from '../utils/build';
import { formatDiff } from '../utils/diff';
import { getInstalledBlocks } from '../utils/get-installed-blocks';
import { getWatermark } from '../utils/get-watermark';
import * as gitProviders from '../utils/git-providers';
import { languages } from '../utils/language-support';

const L = color.gray('│');

const schema = v.object({
	allow: v.boolean(),
	expand: v.boolean(),
	maxUnchanged: v.number(),
	repo: v.optional(v.string()),
});

type Options = v.InferInput<typeof schema>;

const diff = new Command('diff')
	.description('Compares local blocks to the blocks in the provided repository.')
	.option('-A, --allow', 'Allow ts-blocks to download code from the provided repo.', false)
	.option('-E, --expand', 'Expands the diff so you see everything.', false)
	.option('--repo <repo>', 'Repository to download the blocks from.')
	.option(
		'--max-unchanged <number>',
		'Maximum unchanged lines that will show without being collapsed.',
		(val) => Number.parseInt(val), // this is such a dumb api thing
		3
	)
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _diff(options);
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _diff = async (options: Options) => {
	intro(`${color.bgBlueBright(' ts-blocks ')}${color.gray(` v${context.package.version} `)}`);

	const loading = spinner();

	const config = getConfig().match(
		(val) => val,
		(err) => program.error(color.red(err))
	);

	const blocksMap: Map<string, RemoteBlock> = new Map();

	let repoPaths = config.repos;

	// we just want to override all others if supplied via the CLI
	if (options.repo) repoPaths = [options.repo];

	if (!options.allow && options.repo) {
		const result = await confirm({
			message: `Allow ${color.cyan('ts-blocks')} to download and run code from ${color.cyan(options.repo)}?`,
			initialValue: true,
		});

		if (isCancel(result) || !result) {
			cancel('Canceled!');
			process.exit(0);
		}
	}

	loading.start(`Fetching blocks from ${color.cyan(repoPaths.join(', '))}`);

	for (const repo of repoPaths) {
		const providerInfo: gitProviders.Info = (await gitProviders.getProviderInfo(repo)).match(
			(info) => info,
			(err) => program.error(color.red(err))
		);

		const manifestUrl = await providerInfo.provider.resolveRaw(providerInfo, OUTPUT_FILE);

		const categories = (await gitProviders.getManifest(manifestUrl)).match(
			(val) => val,
			(err) => program.error(color.red(err))
		);

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

	loading.stop(`Retrieved blocks from ${color.cyan(repoPaths.join(', '))}`);

	const installedBlocks = getInstalledBlocks(blocksMap, config);

	for (const blockSpecifier of installedBlocks) {
		let found = false;

		for (const repo of repoPaths) {
			// we unwrap because we already checked this
			const providerInfo = (await gitProviders.getProviderInfo(repo)).unwrap();

			const fullSpecifier = `${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}/${blockSpecifier.specifier}`;

			const block = blocksMap.get(fullSpecifier);

			if (block === undefined) continue;

			found = true;

			process.stdout.write(`${L}\n`);

			process.stdout.write(`${L}  ${fullSpecifier}\n`);

			fullSpecifier;

			for (const file of block.files) {
				// skip test files if not included
				if (!config.includeTests && isTestFile(file)) continue;

				process.stdout.write(`${L}\n`);

				const sourcePath = path.join(block.directory, file);

				const rawUrl = await providerInfo.provider.resolveRaw(providerInfo, sourcePath);

				const response = await fetch(rawUrl);

				if (!response.ok) {
					program.error(color.red(`There was an error trying to get ${fullSpecifier}`));
				}

				let remoteContent = await response.text();

				let localPath = path.join(config.path, block.category, file);
				if (block.subdirectory) {
					localPath = path.join(config.path, block.category, block.name, file);
				}

				let fileContent = '';
				if (fs.existsSync(localPath)) {
					fileContent = fs.readFileSync(localPath).toString();
				}

				if (config.watermark) {
					const lang = languages.find((lang) => lang.matches(sourcePath));

					if (lang) {
						const watermark = getWatermark(context.package.version, repo);

						const comment = lang.comment(watermark);

						remoteContent = `${comment}\n\n${remoteContent}`;
					}
				}

				const changes = diffLines(fileContent, remoteContent);

				const from = path
					.join(
						`${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}`,
						sourcePath
					)
					.replaceAll('\\', '/');

				const to = localPath.replaceAll('\\', '/');

				const formattedDiff = formatDiff({
					from,
					to,
					changes,
					expand: options.expand,
					maxUnchanged: options.maxUnchanged,
					colorAdded: color.greenBright,
					colorRemoved: color.redBright,
					prefix: () => `${L} `,
					onUnchanged: ({ from, to, prefix }) =>
						`${prefix?.() ?? ''} ${color.cyan(from)} → ${color.gray(to)} ${color.gray('(unchanged)')}\n`,
					intro: ({ from, to, changes, prefix }) => {
						const totalChanges = changes.filter((a) => a.added).length;

						return `${prefix?.() ?? ''} ${color.cyan(from)} → ${color.gray(to)} (${totalChanges} change${
							totalChanges === 1 ? '' : 's'
						})\n${prefix?.() ?? ''}\n`;
					},
				});

				process.stdout.write(formattedDiff);
			}

			break;
		}

		if (!found) {
			program.error(
				color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`)
			);
		}
	}

	outro(color.green('All done!'));
};

export { diff };
