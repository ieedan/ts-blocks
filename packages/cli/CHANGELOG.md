# jsrepo

## 1.12.5

### Patch Changes

- 954a2a4: More logging for `--verbose` option on `add` command.

## 1.12.4

### Patch Changes

- 54e4721: `github` provider will now detect default branch if a branch is not supplied.

## 1.12.3

### Patch Changes

- b976ea0: Improved error message when failing to fetch manifest file with some troubleshooting steps.

## 1.12.2

### Patch Changes

- 5d14390: Fix issue where `build` could create circular dependencies.

## 1.12.1

### Patch Changes

- 9b4dafb: Fixes an issue where new files would not be created in update command.

## 1.12.0

### Minor Changes

- 8830cd9: Fixes issue with building files that reference a file from another block directory.

## 1.11.0

### Minor Changes

- 2f49635: Added `formatter` key to config to allow you to format `blocks` before adding them to your project.

### Patch Changes

- 7a760b0: Fix `*.(yml|yaml)` watermark to only have a single space between the `#` and comment content.
- 2f49635: Fix issue where vue compiler error would not show during build.

## 1.10.2

### Patch Changes

- 282b15c: Checks package.json for dependencies before trying to install the same dependency on `update` and `add`.

## 1.10.1

### Patch Changes

- 722dd80: Add no longer prompts for options for every block when using zero-config.
- 722dd80: Add `*.(yml|yaml)` support

## 1.10.0

### Minor Changes

- 2f5d566: BitBucket support 🎉

## 1.9.0

### Minor Changes

- 6d15a77: GitLab support 🎉

## 1.8.0

### Minor Changes

- 7b37835: Allow for zero-config adds where users will be prompted for the options necessary to install the `block`.

### Patch Changes

- 7b37835: Make `auth --logout` smarter so that it shows you if you were already logged out.

## 1.7.1

### Patch Changes

- 9cef7ca: Moves check for `package.json` to the top of `init --registry`

## 1.7.0

### Minor Changes

- 65216c4: Add `auth` command to allow you to supply a token for private repositories.
- 65216c4: Private repository support 🎉
- 65216c4: Add prompts to `init` to allow you to supply a token when setting up repositories.

## 1.6.0

### Minor Changes

- caff9cc: Add `--include-blocks` and `--include-categories` flags to `build` command. These allow you to only include the provided blocks or categories in the build.
- fd66b24: Add `error-on-warn` flag so that you can choose to error on warnings during build.
- e408c46: jsrepo now checks the manifest file before writing it to warn about potential issues.

## 1.5.0

### Minor Changes

- 5ac4967: Improves onboarding experience by adding a `registry` option when running `init`.

### Patch Changes

- 5ac4967: Fixed an issue where detect wasn't using the correct cwd in some cases.
- c3cd417: Fixed an issue where subdirectories of a subdirectory would give a unhelpful warning.

## 1.4.2

### Patch Changes

- fb39985: Bump deps.

## 1.4.1

### Patch Changes

- 5b83b5b: Use `pathe` instead of `node:path`.

## 1.4.0

### Minor Changes

- fb29892: **vue** support! 🎉
- 48a17aa: Add `--exclude-deps` flag to `build`. This allows you to prevent certain dependencies from being added during the build.

### Patch Changes

- 48a17aa: When `*.svelte` files import 'svelte' it will not longer result in `svelte` being added as a dependency.

## 1.3.1

### Patch Changes

- 6a531fc: Fix arg ordering for test command.

## 1.3.0

### Minor Changes

- 3d4d754: Add `update` command. `update` allows you to update components with a nice ui for seeing the differences.

## 1.2.4

### Patch Changes

- 31921ab: Fixes line numbers on `diff` command. Previously there were issues when there were changes that add or removed multiple lines of whitespace now they are fixed.
- 7bb7084: Adds different coloring for single line changes to make them more discernable in `diff`.

## 1.2.3

### Patch Changes

- 909d942: Fixed an issue where block subdeps would be added twice.

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
