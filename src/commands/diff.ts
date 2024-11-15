import fs from "node:fs";
import { cancel, intro, isCancel, outro, spinner, confirm } from "@clack/prompts";
import color from "chalk";
import { Command, program } from "commander";
import * as v from "valibot";
import { context } from "..";
import { OUTPUT_FILE } from "../utils";
import { type Block, type Category, buildBlocksDirectory } from "../utils/build";
import { type Config, getConfig } from "../config";
import * as gitProviders from "../utils/git-providers";
import { getInstalledBlocks } from "../utils/get-installed-blocks";
import { diffLines, type Change } from "diff";
import * as lines from "../blocks/utilities/lines";
import path from "node:path";
import { arraySum } from "../blocks/utilities/array-sum";
import { leftPadMin } from "../blocks/utilities/pad";

const L = color.gray("│");

const schema = v.object({
	allow: v.boolean(),
	expand: v.boolean(),
	maxUnchanged: v.number(),
	hideUnchanged: v.boolean(),
});

type Options = v.InferInput<typeof schema>;

const diff = new Command("diff")
	.description("Compares local blocks to the blocks in the provided repository.")
	.option("-A, --allow", "Allow ts-blocks to download code from the provided repo.", false)
	.option("-E, --expand", "Expands the diff so you see everything.", false)
	.option("--hide-unchanged", "Won't show files that didn't change.", false)
	.option(
		"--max-unchanged <lines>",
		"Maximum unchanged lines that will show without being collapsed.",
		Number.parseInt,
		3
	)
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _diff(options);
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _diff = async (options: Options) => {
	intro(`${color.bgBlueBright(" ts-blocks ")}${color.gray(` v${context.package.version} `)}`);

	const loading = spinner();

	const config = getConfig().match(
		(val) => val,
		(err) => program.error(color.red(err))
	);

	const blocksMap: Map<string, RemoteBlock> = new Map();

	const repoPaths = config.repos;

	loading.start(`Fetching blocks from ${color.cyan(repoPaths.join(", "))}`);

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

	loading.stop(`Retrieved blocks from ${color.cyan(repoPaths.join(", "))}`);

	const installedBlocks = getInstalledBlocks(blocksMap, config);

	for (const blockSpecifier of installedBlocks) {
		let found = false;

		for (const repo of repoPaths) {
			// we unwrap because we already checked this
			const providerInfo = (await gitProviders.getProviderInfo(repo)).unwrap();

			const fullSpecifier = `${providerInfo.name}/${providerInfo.owner}/${providerInfo.repoName}/${blockSpecifier.specifier}`;

			const tempBlock = blocksMap.get(fullSpecifier);

			if (tempBlock === undefined) continue;

			process.stdout.write(`${L}\n`);

			found = true;

			const sourcePath = path.join(tempBlock.directory, `${tempBlock.name}.ts`);

			const rawUrl = await providerInfo.provider.resolveRaw(providerInfo, sourcePath);

			const response = await fetch(rawUrl);

			if (!response.ok) {
				program.error(color.red(`There was an error trying to get ${fullSpecifier}`));
			}

			const remoteContent = await response.text();

			const changes = diffLines(blockSpecifier.content, remoteContent);

			printDiff(fullSpecifier, blockSpecifier.path, changes, options, config);

			break;
		}

		if (!found) {
			program.error(color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`));
		}
	}

	outro(color.green("All done!"));
};

const printDiff = (specifier: string, localPath: string, changes: Change[], options: Options, config: Config) => {
	let finalChanges = changes;
	const length = arraySum(finalChanges, (change) => change.count ?? 0).toString().length + 1;

	let lineOffset = 0;
	
	// if theres a watermark we know that there will be a change every time so we just get rid of it
	if (config.watermark) {
		lineOffset = finalChanges[0].count ?? 0;
		finalChanges = finalChanges.slice(1);
	}

	if (finalChanges.length === 1 && !finalChanges[0].added && !finalChanges[0].removed) {
		if (!options.hideUnchanged) {
			process.stdout.write(
				`${L}  ${color.cyan(specifier)} → ${color.gray(localPath)} ${color.gray(
					"(unchanged)"
				)}\n`
			);
		}
		return;
	}

	process.stdout.write(`${L}\n${L}  ${color.cyan(specifier)} → ${color.gray(localPath)}\n${L}\n`);

	for (let i = 0; i < finalChanges.length; i++) {
		const change = finalChanges[i];

		const hasPreviousChange = finalChanges[i - 1]?.added || finalChanges[i - 1]?.removed;
		const hasNextChange = finalChanges[i + 1]?.added || finalChanges[i + 1]?.removed;

		if (!change.added && !change.removed) {
			// show collapsed
			if (!options.expand && change.count !== undefined && change.count > options.maxUnchanged) {
				const ls = lines.get(change.value.trim());

				let shownLines = 0;

				if (hasNextChange) shownLines += options.maxUnchanged;
				if (hasPreviousChange) shownLines += options.maxUnchanged;

				// just show all
				if (shownLines >= ls.length) {
					process.stdout.write(
						`${lines.join(ls, {
							prefix: (line) => color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `),
						})}\n`
					);
					lineOffset += change.count;
					continue;
				}

				if (hasPreviousChange) {
					process.stdout.write(
						`${lines.join(ls.slice(0, options.maxUnchanged), {
							prefix: (line) => color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `),
						})}\n`
					);
					lineOffset += options.maxUnchanged;
				}

				if (ls.length > shownLines) {
					const count = ls.length - shownLines;
					process.stdout.write(
						`${lines.join(lines.get(color.gray(`+ ${count} more unchanged`)), {
							prefix: () => `${L} ${leftPadMin("", length)} `,
						})}\n`
					);
				}

				if (hasNextChange) {
					lineOffset = lineOffset + ls.length - options.maxUnchanged
					process.stdout.write(
						`${lines.join(ls.slice(ls.length - options.maxUnchanged), {
							prefix: (line) => color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `),
						})}\n`
					);
				}
				
				lineOffset += change.count;
				continue;
			}

			process.stdout.write(
				`${lines.join(lines.get(change.value.trimEnd()), {
					prefix: (line) => color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `),
				})}\n`
			);
			lineOffset += change.count ?? 0;

			continue;
		}

		process.stdout.write(
			`${lines.join(lines.get(colorChange({ ...change, value: change.value.trimEnd() })), {
				prefix: (line) => color.gray(`│ ${leftPadMin(`${line + 1 + lineOffset} `, length)} `),
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
