import fs from 'node:fs';
import { cancel, intro, isCancel, outro, spinner, confirm } from '@clack/prompts';
import color from 'chalk';
import { Command, program } from 'commander';
import * as v from 'valibot';
import { context } from '..';
import { OUTPUT_FILE } from '../utils';
import { type Block, type Category, buildBlocksDirectory } from '../utils/build';
import { getConfig } from '../config';
import * as gitProviders from '../utils/git-providers';
import { getInstalledBlocks } from '../utils/get-installed-blocks';
import { diffLines, type Change } from 'diff';
import path from 'node:path';

const schema = v.object({
	allow: v.boolean(),
	expand: v.boolean(),
	maxUnchanged: v.number(),
});

type Options = v.InferInput<typeof schema>;

const diff = new Command('diff')
	.description('Compares local blocks to the blocks in the provided repository.')
	.option('-A, --allow', 'Allow ts-blocks to download code from the provided repo.', false)
	.option('-E, --expand', 'Expands the diff so you see everything.', false)
	.option(
		'--max-unchanged <lines>',
		'Maximum unchanged lines that will show without being collapsed.',
		Number.parseInt,
		10
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

	const repoPaths = config.repos;

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
		for (const repo of repoPaths) {
			// we unwrap because we already checked this
			const providerInfo = (await gitProviders.getProviderInfo(repo)).unwrap();

			const fullSpecifier = `${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}/${blockSpecifier.specifier}`;

			const tempBlock = blocksMap.get(fullSpecifier);

			if (tempBlock === undefined) continue;

			const sourcePath = path.join(tempBlock.directory, `${tempBlock.name}.ts`);

			const rawUrl = await providerInfo.provider.resolveRaw(providerInfo, sourcePath);

			const response = await fetch(rawUrl);

			if (!response.ok) {
				program.error(color.red(`There was an error trying to get ${fullSpecifier}`));
			}

			const remoteContent = await response.text();

			const changes = diffLines(blockSpecifier.content, remoteContent);

			printDiff(fullSpecifier, blockSpecifier.path, changes, options);

			break;
		}
	}

	outro(color.green('All done!'));
};

const printDiff = (specifier: string, localPath: string, changes: Change[], options: Options) => {
	if (changes.length === 1 && !changes[0].added && !changes[0].removed) {
		process.stdout.write(
			`\n${color.cyan(specifier)} → ${color.gray(localPath)}\n\n${color.gray('no change')}\n\n`
		);
		return;
	}

    process.stdout.write(`\n${color.cyan(specifier)} → ${color.gray(localPath)}\n\n`);

	for (const change of changes) {
		if (!change.added && !change.removed) {
			// show collapsed
			if (
				!options.expand &&
				change.count !== undefined &&
				change.count > options.maxUnchanged
			) {
				process.stdout.write(color.gray(`\n⌃\n${change.count} more unchanged\n⌄\n\n`));
				continue;
			}

			process.stdout.write(change.value);

			continue;
		}

		process.stdout.write(colorChange(change));
	}
};

const colorChange = (change: Change) => {
	if (change.added) {
		return color.green(change.value);
	}

	return color.red(change.value);
};

export { diff };
