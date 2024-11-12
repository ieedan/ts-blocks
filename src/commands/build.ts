import fs from "node:fs";
import path from "node:path";
import { intro, outro, spinner } from "@clack/prompts";
import color from "chalk";
import { Command } from "commander";
import { type InferInput, boolean, object, parse, string } from "valibot";
import { context } from "..";
import { buildBlocksDirectory } from "../utils/build";

export const OUTPUT_FILE = "manifest.json";

const schema = object({
	verbose: boolean(),
	output: boolean(),
	blocksDirectory: string(),
});

type Options = InferInput<typeof schema>;

const build = new Command("build")
	.description("Builds the `/blocks` directory in the project root into a blocks.json file.")
	.option("--blocks-directory", "The directory containing the blocks.", "blocks")
	.option("--no-output", `Do not output \`${OUTPUT_FILE}\` file.`)
	.option("--verbose", "Include debug logs.", false)
	.action(async (opts) => {
		const options = parse(schema, opts);

		await _build(options);
	});

const _build = async (options: Options) => {
	intro(color.bgBlueBright("ts-blocks"));

	const loading = spinner();

	loading.start("Building...");

	const blocksPath = context.resolveRelativeToRoot(options.blocksDirectory);

	const outputPath = path.join(blocksPath, OUTPUT_FILE);

	if (options.output && fs.existsSync(outputPath)) fs.rmSync(outputPath);

	const categories = buildBlocksDirectory(blocksPath);

	if (options.output) {
		fs.writeFileSync(outputPath, JSON.stringify(categories, null, "\t"));

		loading.stop(`Built and wrote output to ${color.cyan(outputPath)}!`);
	} else {
		loading.stop("Built successfully!");
	}

	outro(color.green("All done!"));
};

export { build };
