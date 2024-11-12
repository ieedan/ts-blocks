import fs from "node:fs";
import path from "node:path";
import { cancel, confirm, intro, isCancel, multiselect, outro, spinner } from "@clack/prompts";
import color from "chalk";
import { Argument, Command, program } from "commander";
import { execa } from "execa";
import { resolveCommand } from "package-manager-detector/commands";
import { detect } from "package-manager-detector/detect";
import { Project, type SourceFile } from "ts-morph";
import { type InferInput, array, boolean, object, optional, parse, string } from "valibot";
import { context } from "..";
import { getConfig } from "../config";
import { Category, categorySchema, type Block } from "../utils/build";
import { getInstalledBlocks } from "../utils/get-installed-blocks";
import { getWatermark } from "../utils/get-watermark";
import { INFO, WARN } from "../utils/index";
import { type Task, runTasks } from "../utils/prompts";
import { OUTPUT_FILE } from "./build";
import * as gitProviders from "../utils/git-providers";

const schema = object({
	yes: boolean(),
	verbose: boolean(),
});

type Options = InferInput<typeof schema>;

const add = new Command("add")
	.addArgument(new Argument("[blocks...]", "Whichever block you want to add to your project."))
	.option("-y, --yes", "Add and install any required dependencies.", false)
	.option("--verbose", "Include debug logs.", false)
	.action(async (blockNames, opts) => {
		const options = parse(schema, opts);

		await _add(blockNames, options);
	});

type RemoteBlock = Block & { sourceRepo: gitProviders.Info };

const _add = async (blockNames: string[], options: Options) => {
	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${INFO} ${msg}`);
		}
	};

	verbose(`Attempting to add ${JSON.stringify(blockNames)}`);

	intro(`${color.bgBlueBright(" ts-blocks ")}${color.gray(` v${context.package.version} `)}`);

	const loading = spinner();

	const config = getConfig();

	const blocksMap: Map<string, (Block & { sourceRepo: undefined }) | RemoteBlock> = context.blocks as Map<
		string,
		Block & { sourceRepo: undefined }
	>;

	if (config.repoPath !== undefined) {
		const repoPath = config.repoPath;

		let rawUrl: URL;
		let providerInfo: gitProviders.Info;

		if (gitProviders.github.matches(repoPath)) {
			providerInfo = gitProviders.github.info(repoPath);

			rawUrl = gitProviders.github.resolveRaw(providerInfo, path.join(config.blocksPath, OUTPUT_FILE));
		} else {
			// if you want to support your provider open a PR!
			program.error(color.red("Only GitHub repositories are supported at this time!"));
		}

		loading.start(`Fetching ${color.cyan(rawUrl.href)}`);

		const response = await fetch(rawUrl);

		if (!response.ok) {
			loading.stop(`Error fetching ${color.cyan(rawUrl.href)}`);
			program.error(
				color.red(
					`There was an error reading the \`manifest.json\` from the repository ${config.repoPath} maybe you need to set the \`blocksPath\`?
					
${response.status} ${response.statusText}
${rawUrl.href}`
				)
			);
		}

		const categories = parse(array(categorySchema), await response.json());

		// clears local blocks if we don't want to list those
		if (!config.listLocal) {
			blocksMap.clear();
		}

		for (const category of categories) {
			for (const block of category.blocks) {
				// remote blocks will overwrite local blocks with the same name
				blocksMap.set(`${category.name}/${block.name}`, {
					...block,
					sourceRepo: providerInfo,
				});
			}
		}

		loading.stop(`Retrieved blocks from ${config.repoPath}`);
	}

	const installedBlocks = getInstalledBlocks(blocksMap, config);

	let installingBlockNames = blockNames;

	if (installingBlockNames.length === 0) {
		const promptResult = await multiselect({
			message: "Select which blocks to add.",
			options: Array.from(blocksMap.entries()).map(([key, value]) => {
				const blockExists = installedBlocks.findIndex((block) => block === key) !== -1;

				const [category, name] = key.split("/");

				let label: string;

				if (value.sourceRepo) {
					label = `${color.cyan(
						`${value.sourceRepo.name}/${value.sourceRepo.owner}/${value.sourceRepo.repoName}/${value.category}`
					)}/${name}`;
				} else {
					label = `${color.cyan(category)}/${name}`;
				}

				return {
					label: blockExists ? color.gray(label) : label,
					value: key,
					// show hint for `Installed` if block is already installed
					hint: blockExists ? "Installed" : undefined,
				};
			}),
			required: true,
		});

		if (isCancel(promptResult)) {
			cancel("Canceled!");
			process.exit(0);
		}

		installingBlockNames = promptResult as string[];
	}

	const installingBlocks: {
		name: string;
		subDependency: boolean;
		block: (Block & { sourceRepo: undefined }) | RemoteBlock;
	}[] = [];

	installingBlockNames.map((blockSpecifier) => {
		const block = blocksMap.get(blockSpecifier);

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`));
		}

		installingBlocks.push({ name: blockSpecifier, subDependency: false, block });

		if (block.localDependencies && block.localDependencies.length > 0) {
			for (const dep of block.localDependencies) {
				if (installingBlocks.find(({ name }) => name === dep)) continue;

				// this resolves remote blocks correctly as well because they will reference a local path
				// the blocks in the blocks map already know where they come from
				const block = blocksMap.get(dep);

				if (!block) {
					program.error(color.red(`Invalid block! ${color.bold(blockSpecifier)} does not exist!`));
				}

				installingBlocks.push({ name: dep, subDependency: true, block });
			}
		}
	});

	const tasks: Task[] = [];

	for (const { name: specifier, block } of installingBlocks) {
		const [_, blockName] = specifier.split("/");

		verbose(`Attempting to add ${specifier}`);

		verbose(`Found block ${JSON.stringify(block)}`);

		const directory = path.join(config.path, block.category);
		const newPath = path.join(directory, `${blockName}.ts`);

		verbose(`Creating directory ${color.bold(directory)}`);

		if (fs.existsSync(newPath) && !options.yes) {
			const result = await confirm({
				message: `${color.bold(blockName)} already exists in your project would you like to overwrite it?`,
				initialValue: false,
			});

			if (isCancel(result) || !result) {
				cancel("Canceled!");
				process.exit(0);
			}
		}

		let fullName: string;

		if (block.sourceRepo) {
			fullName = `${block.sourceRepo.name}/${block.sourceRepo.owner}/${block.sourceRepo.repoName}/${block.category}/${block.name}`;
		} else {
			fullName = `${block.category}/${block.name}`;
		}

		tasks.push({
			loadingMessage: `Adding ${fullName}`,
			completedMessage: `Added ${fullName}`,
			run: async () => {
				// in case the directory didn't already exist
				fs.mkdirSync(directory, { recursive: true });

				let blockFileContent: string;
				let testFileContents: string | undefined;

				if (block.sourceRepo) {
					// get from remote
					const blockUrl = block.sourceRepo.provider.resolveRaw(
						block.sourceRepo,
						path.join(config.blocksPath, `${specifier}.ts`)
					);

					// remote repo blocks
					let blockTestsURL: URL | undefined = undefined;
					if (block.tests && config.includeTests) {
						blockTestsURL = block.sourceRepo.provider.resolveRaw(
							block.sourceRepo,
							path.join(config.blocksPath, `${specifier}.test.ts`)
						);
					}

					[blockFileContent, testFileContents] = await Promise.all([
						(async () => {
							const response = await fetch(blockUrl);

							if (!response.ok) {
								loading.stop(`Error fetching ${color.cyan(blockUrl.href)}`);
								program.error(color.red(`There was an error trying to get ${fullName}`));
							}

							return await response.text();
						})(),
						(async () => {
							if (blockTestsURL === undefined) return undefined;
							const response = await fetch(blockTestsURL);

							if (!response.ok) {
								loading.stop(`Error fetching ${color.cyan(blockTestsURL.href)}`);
								program.error(color.red(`There was an error trying to get ${fullName} tests.`));
							}

							return await response.text();
						})(),
					]);
				} else {
					// get from local
					const registryDir = context.resolveRelativeToRoot("./blocks");

					const registryFilePath = path.join(registryDir, `${block.category}/${blockName}.ts`);

					blockFileContent = fs.readFileSync(registryFilePath).toString();

					if (config.includeTests) {
						const registryTestPath = path.join(registryDir, `${block.category}/${blockName}.test.ts`);

						testFileContents = fs.readFileSync(registryTestPath).toString();
					}
				}

				if (config.watermark) {
					const watermark = getWatermark(
						context.package.version,
						config.repoPath ?? context.package.repository.url.replaceAll("git+", "")
					);

					blockFileContent = `${watermark}${blockFileContent}`;

					if (testFileContents) {
						testFileContents = `${watermark}${testFileContents}`;
					}
				}

				fs.writeFileSync(newPath, blockFileContent);

				if (config.includeIndexFile) {
					verbose("Trying to include index file");

					const indexPath = path.join(directory, "index.ts");

					try {
						let index: SourceFile;

						const project = new Project();

						if (fs.existsSync(indexPath)) {
							index = project.addSourceFileAtPath(indexPath);
						} else {
							index = project.createSourceFile(indexPath);
						}

						if (config.imports === "node") {
							index.addExportDeclaration({
								moduleSpecifier: `./${blockName}`,
								isTypeOnly: false,
							});
						} else if (config.imports === "deno") {
							index.addExportDeclaration({
								moduleSpecifier: `./${blockName}.ts`,
								isTypeOnly: false,
							});
						}

						index.saveSync();
					} catch {
						console.warn(`${WARN} Failed to modify ${indexPath}!`);
					}
				}

				if (config.includeTests && testFileContents) {
					verbose("Trying to include tests");

					const { devDependencies } = JSON.parse(fs.readFileSync("package.json").toString());

					if (devDependencies.vitest === undefined) {
						loading.message(`Installing ${color.cyan("vitest")}`);

						const pm = await detect({ cwd: process.cwd() });

						if (pm == null) {
							program.error(color.red("Could not detect package manager"));
						}

						const resolved = resolveCommand(pm.agent, "install", ["vitest", "--save-dev"]);

						if (resolved == null) {
							program.error(color.red(`Could not resolve add command for '${pm.agent}'.`));
						}

						const { command, args } = resolved;

						const installCommand = `${command} ${args.join(" ")}`;

						try {
							await execa({ cwd: process.cwd() })`${installCommand}`;
						} catch {
							program.error(
								color.red(
									`Failed to install ${color.bold("vitest")}! Failed while running '${color.bold(
										installCommand
									)}'`
								)
							);
						}
					}

					fs.writeFileSync(newPath, testFileContents);
				}
			},
		});
	}

	await runTasks(tasks, { verbose: options.verbose });

	outro(color.green("All done!"));
};

export { add };
