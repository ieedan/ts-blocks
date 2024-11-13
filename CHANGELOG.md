# ts-blocks

## 1.0.0-next.6

### Patch Changes

- f1631fd: `build` command now adds dependencies with a version based on the nearest package.json file.

## 1.0.0-next.5

### Patch Changes

- 7bcdaa5: Config repos are now always trusted.
- 7bcdaa5: Add the ability to supply multiple repositories to the config so that you can run tests and list all of them at once.

## 1.0.0-next.4

### Patch Changes

- 88925bc: Fixes --repo option of add command.

## 1.0.0-next.3

### Patch Changes

- 71ea68e: Add blocks from remote repositories.

## 0.11.0

### Minor Changes

- b9b4f34: Adds the ability for blocks to depend on other blocks.
- b9b4f34: Adds `ipv4-address` block with basic parsing, validation, and formatting.

### Patch Changes

- ced0696: Fixes issue where the `test` command wouldn't work if you were using `addByCategory` in your config.

## 0.10.2

### Patch Changes

- a5bc75d: Fixed error while adding blocks.

## 0.10.1

### Patch Changes

- bda0f15: Fixes issue with typedoc not generating docs.

## 0.10.0

### Minor Changes

- 52f9480: Add optional `watermark` that will show the version that the component was installed at as well as a link to documentation.
- 52f9480: Added multi-select prompt to add command so that you can browser which components to add/upgrade.

### Patch Changes

- 2eff64a: Improves tests with `describe` and `it` syntax.
- 52f9480: Fixed issue with init command not accepting default value.

## 0.9.0

### Minor Changes

- 5f120fd: Adds `isNumber` block.

## 0.8.0

### Minor Changes

- a02ab02: Changed default value for `includeTests` to be false because in practice I am normally turning it off to run remote tests anyways.
- a02ab02: Add `dispatcher` block
- a02ab02: Add `imports` option to config to allow you to configure the import style.

## 0.7.1

### Patch Changes

- 1ef78dc: Update README.md with typedoc generated github pages link.

## 0.7.0

### Minor Changes

- 69fc7cf: Add stopwatch utility.

### Patch Changes

- 69fc7cf: Now generates documentation with `typedoc` to be hosted on gh-pages.

## 0.6.0

### Minor Changes

- 7c7b82f: Add `pad` utility for left and right pad functions.

## 0.5.0

### Minor Changes

- 34965d3: You can now run tests on all detected blocks by leaving `blocks` blank when running the `test` command.

## 0.4.2

### Patch Changes

- 9e3e247: Fixed an issue with silent failures due to `import.meta.dirname` being undefined in `test` and `add` commands

## 0.4.1

### Patch Changes

- 2080dec: Changed internal result to be readonly

## 0.4.0

### Minor Changes

- e9204c1: Add `test` command so you can test blocks in your codebase against the most recent test cases.
- e9204c1: Update `result` to better match the rust `Result` api.

## 0.3.2

### Patch Changes

- 9f27c3b: Make `blocks` a required argument.
- 9f27c3b: Better verbose logs

## 0.3.1

### Patch Changes

- 7e23338: Add `--verbose` flag for debugging.

## 0.3.0

### Minor Changes

- 573ea90: Add `match` and `unwrap` methods to `result`.

## 0.2.1

### Patch Changes

- 72d4398: Fixed docs with jsonc

## 0.2.0

### Minor Changes

- 2dfdd4d: Fix `init` command in CLI to allow for fully automated use.
- 2dfdd4d: Add tests to code and optionally allow including them when adding blocks

## 0.1.0

### Minor Changes

- 60d49ab: Move schema to root of the package and initialize the `blocks.json` file with new `$schema` url.

## 0.0.2

### Patch Changes

- 09cbbfe: Initial release
