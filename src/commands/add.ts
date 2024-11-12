import fs from "node:fs";
import path from "node:path";
import { cancel, confirm, intro, isCancel, multiselect, outro, spinner } from "@clack/prompts";
import color from "chalk";
import { Argument, Command, program } from "commander";
import { execa } from "execa";
import { resolveCommand } from "package-manager-detector/commands";
import { detect } from "package-manager-detector/detect";
import { Project, type SourceFile } from "ts-morph";
import { type InferInput, boolean, object, parse } from "valibot";
import { getConfig } from "../config";
import { getInstalledBlocks } from "../utils/get-installed-blocks";
import { getWatermark } from "../utils/get-watermark";
import { INFO, WARN } from "../utils/index";
import { type Task, runTasks } from "../utils/prompts";
import type { Block } from "../utils/build";
import { context } from "..";

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

const _add = async (blockNames: string[], options: Options) => {
	const verbose = (msg: string) => {
		if (options.verbose) {
			console.info(`${INFO} ${msg}`);
		}
	};

	verbose(`Attempting to add ${JSON.stringify(blockNames)}`);

	intro(color.bgBlueBright("ts-blocks"));

	const config = getConfig();

	const loading = spinner();

	const watermark = getWatermark(context.package.version);

	const installedBlocks = getInstalledBlocks(context.blocks, config);

	let installingBlockNames = blockNames;

	if (installingBlockNames.length === 0) {
		const promptResult = await multiselect({
			message: "Select which blocks to add.",
			options: Array.from(context.blocks.entries()).map(([key]) => {
				const blockExists = installedBlocks.findIndex((block) => block === key) !== -1;

				return {
					label: blockExists ? color.gray(key) : key,
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

	const installingBlocks: { name: string; subDependency: boolean; block: Block }[] = [];

	installingBlockNames.map((blockName) => {
		const block = context.blocks.get(blockName);

		if (!block) {
			program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
		}

		installingBlocks.push({ name: blockName, subDependency: false, block });

		if (block.localDependencies && block.localDependencies.length > 0) {
			for (const dep of block.localDependencies) {
				if (installingBlocks.find(({ name }) => name === dep)) continue;

				const block = context.blocks.get(dep);

				if (!block) {
					program.error(color.red(`Invalid block! ${color.bold(blockName)} does not exist!`));
				}

				installingBlocks.push({ name: dep, subDependency: true, block });
			}
		}
	});

	const tasks: Task[] = [];

	for (const { name: blockName, block } of installingBlocks) {
		verbose(`Attempting to add ${blockName}`);

		verbose(`Found block ${JSON.stringify(block)}`);

		const registryDir = path.join(import.meta.url, "../../blocks").replace(/^file:\\/, "");

		const registryFilePath = path.join(registryDir, `${block.category}/${blockName}.ts`);

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

		tasks.push({
			loadingMessage: `Adding ${blockName}`,
			completedMessage: `Added ${blockName}`,
			run: async () => {
				// in case the directory didn't already exist
				fs.mkdirSync(directory, { recursive: true });

				verbose(`Copying files from ${color.bold(registryFilePath)} to ${color.bold(newPath)}`);

				let registryFile = fs.readFileSync(registryFilePath).toString();

				if (config.watermark) {
					registryFile = `${watermark}${registryFile}`;
				}

				fs.writeFileSync(newPath, registryFile);

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

				if (config.includeTests) {
					verbose("Trying to include tests");

					const registryTestPath = path.join(registryDir, `${block.category}/${blockName}.test.ts`);

					if (fs.existsSync(registryTestPath)) {
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

						let registryTestFile = fs.readFileSync(registryTestPath).toString();

						if (config.watermark) {
							registryTestFile = `${watermark}${registryTestFile}`;
						}

						fs.writeFileSync(newPath, path.join(directory, `${blockName}.test.ts`));
					}
				}
			},
		});
	}

	await runTasks(tasks, { verbose: options.verbose });

	outro(color.green("All done!"));
};

export { add };
