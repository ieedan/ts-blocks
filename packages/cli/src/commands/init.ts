import fs from "node:fs";
import { cancel, confirm, isCancel, outro, spinner, text } from "@clack/prompts";
import color from "chalk";
import { Command } from "commander";
import * as v from "valibot";
import { context } from "..";
import { CONFIG_NAME, type Config, getConfig } from "../config";
import { intro } from "../utils/prompts";
import path from "node:path";

const schema = v.object({
	path: v.optional(v.string()),
	tests: v.optional(v.boolean()),
	repos: v.optional(v.array(v.string())),
	watermark: v.boolean(),
	cwd: v.string(),
});

type Options = v.InferInput<typeof schema>;

const init = new Command("init")
	.description("Initializes your project with a configuration file.")
	.option("--path <path>", "Path to install the blocks.")
	.option("--repos [repos...]", "Repository to install the blocks from.")
	.option("--no-watermark", "Will not add a watermark to each file upon adding it to your project.")
	.option("--tests", "Will include tests with the blocks.")
	.option("--cwd <path>", "The current working directory.", process.cwd())
	.action(async (opts) => {
		const options = v.parse(schema, opts);

		await _init(options);
	});

const _init = async (options: Options) => {
	intro(context.package.version);

	const initialConfig = getConfig(options.cwd);

	const loading = spinner();

	if (!options.path) {
		const result = await text({
			message: "Where should we add the blocks?",
			validate(value) {
				if (value.trim() === "") return "Please provide a value";
			},
			initialValue: initialConfig.isOk() ? initialConfig.unwrap().path : "src/blocks",
		});

		if (isCancel(result)) {
			cancel("Canceled!");
			process.exit(0);
		}

		options.path = result;
	}

	if (!options.repos) {
		options.repos = initialConfig.isOk() ? initialConfig.unwrap().repos : [];

		while (true) {
			const confirmResult = await confirm({
				message: `Add ${options.repos.length > 0 ? "another" : "a"} repo?`,
				initialValue: false,
			});

			if (isCancel(confirmResult)) {
				cancel("Canceled!");
				process.exit(0);
			}

			if (!confirmResult) break;

			const result = await text({
				message: "Where should we download the blocks from?",
				placeholder: "github/ieedan/std",
				validate: (val) => {
					if (!val.startsWith("https://github.com") && !val.startsWith("github/")) {
						return `Must be a ${color.bold("GitHub")} repository!`;
					}
				},
			});

			if (isCancel(result)) {
				cancel("Canceled!");
				process.exit(0);
			}

			options.repos.push(result);
		}
	}

	const config: Config = {
		$schema: `https://unpkg.com/jsrepo@${context.package.version}/schema.json`,
		repos: options.repos,
		path: options.path,
		includeTests:
			initialConfig.isOk() && options.tests === undefined
				? initialConfig.unwrap().includeTests
				: (options.tests ?? false),
		watermark: options.watermark,
	};

	loading.start(`Writing config to \`${CONFIG_NAME}\``);

	fs.writeFileSync(path.join(options.cwd, CONFIG_NAME), `${JSON.stringify(config, null, "\t")}\n`);

	fs.mkdirSync(path.join(options.cwd, config.path), { recursive: true });

	loading.stop(`Wrote config to \`${CONFIG_NAME}\`.`);

	outro(color.green("All done!"));
};

export { init };
