# ts-blocks

Building blocks for TypeScript applications add code through the CLI and maintain full ownership.

```bash
npx ts-blocks init
```

## Setup

Run the `init` command to setup the path where the blocks will be added.

```bash
npx ts-blocks init
```

## Adding Blocks

```bash
npx ts-blocks add result

┌  ts-block
│
└  All done!
```

# Blocks

All blocks can be found under `./blocks` and are shipped well documented.

## Adding New Blocks

To add a new block add it under a category in the `./blocks` directory. Then make sure to go to `./src/blocks.ts` and update the `blocks` object.

```ts
const blocks: Record<string, Block> = {
	result: {
		category: "types",
	},
	"to-map": {
		category: "utilities",
	},
};
```
