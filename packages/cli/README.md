[![jsrepo](https://jsrepo.dev/badges/jsrepo.svg)](https://jsrepo.dev)

# jsrepo

```bash
npx jsrepo init
```

CLI for [jsrepo](https://jsrepo.dev). Used to build and download code from registries that **YOU** own.

Kinda like [shadcn-ui](https://ui.shadcn.com/) but bring-your-own registry!

1. [Build your own registry](https://jsrepo.dev/docs/setup/registry)
2. [Download your blocks](https://jsrepo.dev/docs/setup/project)

```
Usage: jsrepo [options] [command]

A CLI to add shared code from remote repositories.

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  add [options] [blocks...]
  auth [options]                Provide a token for access to private repositories.
  init [options]                Initializes your project with a configuration file.
  test [options] [blocks...]    Tests local blocks against most recent remote tests.
  build [options]               Builds the provided --dirs in the project root into a `jsrepo-manifest.json` file.
  update [options] [blocks...]
  diff [options]                Compares local blocks to the blocks in the provided repository.
  help [command]                display help for command
```

## Example registries
- [github/ieedan/std](https://github.com/ieedan/std)
- [gitlab/ieedan/std](https://gitlab.com/ieedan/std)
- [bitbucket/ieedan/std](https://bitbucket.org/ieedan/std)