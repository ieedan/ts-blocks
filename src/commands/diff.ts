import fs from 'node:fs';
import path from 'node:path';
import { cancel, confirm, intro, isCancel, outro, spinner } from '@clack/prompts';
import color from 'chalk';
import { Command, program } from 'commander';
import { type Change, diffLines } from 'diff';
import * as v from 'valibot';
import { context } from '..';
import { arraySum } from '../blocks/utilities/array-sum';
import * as lines from '../blocks/utilities/lines';
import { leftPadMin } from '../blocks/utilities/pad';
import { getConfig } from '../config';
import { OUTPUT_FILE } from '../utils';
import type { Block } from '../utils/build';
import { getInstalledBlocks } from '../utils/get-installed-blocks';
import { getWatermark } from '../utils/get-watermark';
import * as gitProviders from '../utils/git-providers';

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
				if (!config.includeTests && file.endsWith('test.ts')) continue;

				process.stdout.write(`${L}\n`);

				const sourcePath = path.join(block.directory, file);

				const rawUrl = await providerInfo.provider.resolveRaw(providerInfo, sourcePath);

				const response = await fetch(rawUrl);

				if (!response.ok) {
					program.error(color.red(`There was an error trying to get ${fullSpecifier}`));
				}

				const watermark = getWatermark(context.package.version, repo);

				const remoteContent = await response.text();

				let localPath = path.join(config.path, block.category, file);
				if (block.subdirectory) {
					localPath = path.join(config.path, block.category, block.name, file);
				}

				let fileContent = '';
				if (fs.existsSync(localPath)) {
					fileContent = fs.readFileSync(localPath).toString();
				}

				const changes = diffLines(fileContent, `${watermark}${remoteContent}`);

				printDiff(
					path
						.join(
							`${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}`,
							sourcePath
						)
						.replaceAll('\\', '/'),
					localPath.replaceAll('\\', '/'),
					changes,
					options
				);
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

const printDiff = (specifier: string, localPath: string, changes: Change[], options: Options) => {
	const length = arraySum(changes, (change) => change.count ?? 0).toString().length + 1;

	let lineOffset = 0;

	if (changes.length === 1 && !changes[0].added && !changes[0].removed) {
		process.stdout.write(
			`${L}  ${color.cyan(specifier)} → ${color.gray(localPath)} ${color.gray('(unchanged)')}\n`
		);
		return;
	}

	const totalChanges = changes.filter((a) => a.added).length;

	process.stdout.write(
		`${L}  ${color.cyan(specifier)} → ${color.gray(localPath)} (${totalChanges} change${
			totalChanges === 1 ? '' : 's'
		})\n${L}\n`
	);

	/** Provides the line number prefix */
	const linePrefix = (line: number): string =>
		color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `);

	for (let i = 0; i < changes.length; i++) {
		const change = changes[i];

		const hasPreviousChange = changes[i - 1]?.added || changes[i - 1]?.removed;
		const hasNextChange = changes[i + 1]?.added || changes[i + 1]?.removed;

		if (!change.added && !change.removed) {
			// show collapsed
			if (
				!options.expand &&
				change.count !== undefined &&
				change.count > options.maxUnchanged
			) {
				const prevLineOffset = lineOffset;
				const ls = lines.get(change.value.trimEnd());

				let shownLines = 0;

				if (hasNextChange) shownLines += options.maxUnchanged;
				if (hasPreviousChange) shownLines += options.maxUnchanged;

				// just show all if we are going to show more than we have
				if (shownLines >= ls.length) {
					process.stdout.write(
						`${lines.join(ls, {
							prefix: linePrefix,
						})}\n`
					);
					lineOffset += ls.length;
					continue;
				}

				// this writes the top few lines
				if (hasPreviousChange) {
					process.stdout.write(
						`${lines.join(ls.slice(0, options.maxUnchanged), {
							prefix: linePrefix,
						})}\n`
					);
				}

				if (ls.length > shownLines) {
					const count = ls.length - shownLines;
					process.stdout.write(
						`${lines.join(
							lines.get(
								color.gray(
									`+ ${count} more unchanged (${color.italic('-E to expand')})`
								)
							),
							{
								prefix: () => `${L} ${leftPadMin('', length)} `,
							}
						)}\n`
					);
				}

				if (hasNextChange) {
					lineOffset = lineOffset + ls.length - options.maxUnchanged;
					process.stdout.write(
						`${lines.join(ls.slice(ls.length - options.maxUnchanged), {
							prefix: linePrefix,
						})}\n`
					);
				}

				// resets the line offset
				lineOffset = prevLineOffset + change.count;
				continue;
			}

			// show expanded

			process.stdout.write(
				`${lines.join(lines.get(change.value.trimEnd()), {
					prefix: linePrefix,
				})}\n`
			);
			lineOffset += change.count ?? 0;

			continue;
		}

		process.stdout.write(
			`${lines.join(lines.get(colorChange({ ...change, value: change.value.trimEnd() })), {
				prefix: linePrefix,
			})}\n`
		);

		if (!change.removed) {
			lineOffset += change.count ?? 0;
		}
	}
};

const colorChange = (change: Change) => {
	if (change.added) {
		return color.green(change.value);
	}

	return color.red(change.value);
};

export { diff };
