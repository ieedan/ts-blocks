# ts-blocks

```bash
npx ts-blocks@next init
```

A CLI to distribute shared TypeScript code without giving up ownership or adding bloated libraries.

## What is ts-blocks?

**ts-blocks** allows you to add code from a repository straight into your project almost like shadcn-ui for TypeScript. Unlike shadcn-ui you can bring your own registry to download your blocks from.

**ts-blocks** handles installing dependencies (including inter-block dependencies) and even testing, all from the CLI.

## Why?

npm dependencies come at a cost. Many times I find myself writing the same functions across different projects but creating a npm package is too much of a burden to justify. **ts-blocks** solves that problem. It makes the code easy to share and even easier to change.

## Bring Your Own Registry

In **ts-blocks** you can host your own registry out of a (for now just a) GitHub repository!

To use your repository as a registry you will need to run the `build` command to assemble all of your blocks into a manifest that can be understood from the **ts-blocks** CLI. 

The easiest way to do this is to create a `./blocks` directory in the root of your project. 

```
├── blocks-manifest.json
├── package.json
├── biome.json
├── ...
└── blocks
    └── <category>
		├── <block>.ts
        └── <block>
	 		├── ...
	 		└── <block>.ts

```

Within the blocks directory you can place your blocks directly as `.ts` files or create folders to contain them. Top level blocks will be added as a single file where as directories will be added as a directory of files.

Once you have created all your blocks you can run:
```
npx ts-blocks@next build --dirs ./blocks
```

This will output a `blocks-manifest.json` file that **ts-blocks** will search for when you add blocks.

### Adding blocks

Once you have committed your blocks to a repository you can access them by running:
```bash
# initialize config
npx ts-blocks@next init --repos https://github.com/<owner>/<repo>

# add blocks
npx ts-blocks@next add 
```

### Depending on other blocks

Blocks can depend on other blocks within the same repository. Simply import the block using a standard relative import i.e. `./<block>` and **ts-blocks** will resolve that dependency when building into the manifest. 

### Adding tests

One of the most powerful (and dangerous) features of **ts-blocks** is the ability to provide tests to consumers via the CLI. 

By writing tests along side your blocks ts-blocks can either add those tests to the users repository or (using the `test`) command run tests from your repository against their local blocks.

To add a test just add a file named the same as a block ending in `test.ts`:

```
├── blocks-manifest.json
├── package.json
├── biome.json
├── ...
└── blocks
    └── <category>
		├── <block>.ts
		+++
        └── <block>.test.ts
	 	+++

```

Now you can run:

```bash
npx ts-blocks@next test
```

This finds any currently installed blocks and tests them against the tests in the remote repository.

## blocks.json

**ts-blocks** needs a config file to know where to put your blocks as well as where to get them from.

```jsonc
{
	"$schema": "https://unpkg.com/ts-blocks@1.0.0-next.8/schema.json",
	// which repos to download blocks from
	"repos": [
		"https://github.com/ieedan/ts-blocks/tree/next"
	],
	// path where the blocks will be installed
	"path": "src/blocks",
	// include tests when installing the blocks
	"includeTests": false,
	// sets the `.ts` postfix for Deno environments
	"imports": "node",
	// whether or not to include meta data at the top of added blocks
	"watermark": true
}
```

You'll notice that you can list multiple repos to download your blocks from using the `repos` key.

## Best Practices

### Tags

If you are using a repository that you don't control it may be beneficial to point your repos to a tagged release:

```
github/ieedan/std/tree/v1.0.3
```

While not completely immutable pointing to a tag in a well maintained and non-malicious repository can prevent breaking changes to remote tests.