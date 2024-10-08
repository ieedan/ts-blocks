# ts-blocks

**Well documented**, **tested**, **self owned** building blocks for TypeScript applications.

```bash
npx ts-blocks init
```

## Setup

Run the `init` command to setup the `blocks.json` file.

```bash
npx ts-blocks init
```

## Adding Blocks

### Single

```bash
npx ts-blocks add result

┌  ts-blocks
│
◇  Added result
│
└  All done!
```

### Multiple

```bash
npx ts-blocks add result array-sum

┌  ts-blocks
│
◇  Added result
│
◇  Added array-sum
│
└  All done!
```

# Blocks

All blocks can be found under `./blocks`.

## Documentation

Each block is well documented including examples of usage.

## Tests

Each block is tested using [vitest](https://vitest.dev/). By default we add these tests to your repository to disable this behavior configure `includeTests` in your `blocks.json` file.

> [!NOTE]
> If [vitest](https://vitest.dev/) isn't already installed in your project we will attempt to install it for you.

```jsonc
{
	"$schema": "https://unpkg.com/ts-blocks@0.1.0/schema.json",
	// ...
	"includeTests": false // disable including tests
}
```

## Testing CLI Command

```
npx ts-blocks test 
```

If you don't want to include the tests in your project source or simply want to keep your code up to date with the latest test cases you can run tests through the CLI.

### Test single

```bash
ts-blocks test result
```

### Test multiple

```bash
ts-blocks test result array-sum
```

# Development

## Adding New Blocks

To add a new block add it under a category in the `./blocks` directory. Then make sure to go to `./src/blocks.ts` and update the `blocks` object.

> [!NOTE]
> No blocks currently require dependencies.

```ts
const blocks: Record<string, Block> = {
	result: {
		category: "types",
	},
	// ++++++
	"to-map": {
		category: "utilities",
	},
	// ++++++
};
```
