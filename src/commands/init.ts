import fs from "node:fs";
import { cancel, intro, isCancel, outro, text } from "@clack/prompts";
import color from "chalk";
import { Command } from "commander";
import {
	type InferInput,
	boolean,
	object,
	optional,
	parse,
	string,
} from "valibot";
import { CONFIG_NAME, type Config } from "../config";

const schema = object({
	path: optional(string()),
	addByCategory: boolean(),
});

type Options = InferInput<typeof schema>;

const init = new Command("init")
	.option("--path", "Path to install the blocks")
	.option(
		"--add-by-category",
		"Will create directories to contain each block by category.",
		false,
	)
	.action(async (opts) => {
		const options = parse(schema, opts);

		await _init(options);
	});

const _init = async (options: Options) => {
	intro(color.white.bgCyanBright("ts-block"));

	if (!options.path) {
		const result = await text({
			message: "Where should we add the blocks?",
			placeholder: "src/blocks",
			validate(value) {
				if (value.trim() === "") return "Please provide a value";
			},
		});

		if (isCancel(result)) {
			cancel("Canceled!");
			process.exit(0);
		}

		options.path = result;
	}

	const config: Config = {
		schema:
			"https://github.com/ieedan/ts-blocks/blob/main/src/config/schema.json",
		path: options.path,
		addByCategory: options.addByCategory,
	};

	fs.writeFileSync(CONFIG_NAME, `${JSON.stringify(config, null, "\t")}\n`);

	outro(color.green("All done!"));
};

export { init };
