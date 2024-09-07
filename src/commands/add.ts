import fs from "node:fs";
import path from "node:path";
import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import color from "chalk";
import { Command, program } from "commander";
import { type InferInput, boolean, object, parse } from "valibot";
import { blocks } from "../blocks";
import { getConfig } from "../config";

const schema = object({
	yes: boolean(),
});

type Options = InferInput<typeof schema>;

const add = new Command("add")
	.argument("block", "Whichever block you want to add to your project.")
	.option("-y, --yes", "Add and install any required dependencies.", false)
	.action(async (block, opts) => {
		const options = parse(schema, opts);

		await _add(block, options);
	});

const _add = async (blockName: string, options: Options) => {
	intro(color.white.bgCyanBright("ts-block"));

	const config = getConfig();

	// in the future maybe we add a registry but for now it can just be fs
	const block = blocks[blockName];

	if (!block) {
		program.error(
			color.red(`Invalid block! ${color.bold(blockName)} does not exist!`),
		);
	}

	const registryPath = path.join(
		import.meta.dirname,
		`../../blocks/${block.category}/${blockName}.ts`,
	);

	let newPath: string;
	let directory: string;

	if (config.addByCategory) {
		directory = path.join(config.path, block.category);
		newPath = path.join(directory, `${blockName}.ts`);
	} else {
		directory = config.path;
		newPath = path.join(directory, `${blockName}.ts`);
	}

	// in case the directory didn't already exist
	fs.mkdirSync(directory, { recursive: true });

	fs.copyFileSync(registryPath, newPath);

	if (block.dependencies) {
		if (!options.yes) {
			const result = await confirm({
				message: "Add and install dependencies?",
			});

			if (isCancel(result)) {
				cancel("Canceled!");
				process.exit(0);
			}

			options.yes = result;
		}

		if (options.yes) {
			// currently no functions require dependencies (lets try and keep it that way)
			throw new Error("NOT IMPLEMENTED");
		}
	}

	outro(color.green("All done!"));
};

export { add };
