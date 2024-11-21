# jsrepo

## 1.2.2

### Patch Changes

- bb07833: No noteworthy changes.

## 1.2.1

### Patch Changes

- b1dee7f: Remove `npx jsrepo` from error message when no config is provided.

## 1.2.0

### Minor Changes

- dce42bb: Add `--cwd <path>` option to all CLI commands.

## 1.1.0

### Minor Changes

- 2ad43fe: fix `add` command issue where package sub dependencies weren't added.

### Patch Changes

- b0b8edb: Fixed an issuew where the tasks showed an incomplete specifier when saying `Added <x>`.

## 1.0.3

### Patch Changes

- 81842c1: `add` now gets blocks from remote specified source even if you have repo paths.
- 81842c1: `add` command now asks before installing code from remote repositories supplied in block specifiers.

## 1.0.2

### Patch Changes

- 3097380: `build` command can now add dependencies with complex paths such as `lucide-svelte/icons/moon`.

## 1.0.1

### Patch Changes

- f69a155: Change to monorepo structure.
- 39cf37b: - Update --help docs.
- 39cf37b: - Update output files to `jsrepo.json` and `jsrepo-manifest.json`.
