# ts-blocks

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
