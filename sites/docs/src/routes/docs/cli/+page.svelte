<script lang="ts">
	import { Code, CodeSpan, DocHeader, Jsrepo, SubHeading } from '$lib/components/site/docs';
	import { Snippet } from '$lib/components/ui/snippet';
</script>

<DocHeader title="CLI" description="Add, update, diff, build and test with the jsrepo CLI." />
<SubHeading>init</SubHeading>
<p>
	The <CodeSpan>init</CodeSpan> command helps you initialize a project that will add blocks with <Jsrepo
	/>.
</p>
<Snippet command="execute" args={['jsrepo', 'init']} />
<Code
	showLines={false}
	showCopy={false}
	code={`Usage: jsrepo init [options]

Initializes your project with a configuration file.

Options:
  --path <path>       Path to install the blocks.
  --repos [repos...]  Repositories to install the blocks from.
  --no-watermark      Will not add a watermark to each file upon adding it to your project.
  --tests             Will include tests with the blocks.
  --cwd <path>        The current working directory. (default: ".")
  -h, --help          display help for command`}
/>
<SubHeading>add</SubHeading>
<p>
	The <CodeSpan>add</CodeSpan> command helps you add blocks to your project from remote repositories.
</p>
<Snippet command="execute" args={['jsrepo', 'add', '<category>/<name>']} />
<p>or</p>
<Snippet command="execute" args={['jsrepo', 'add', 'github/<owner>/<name>/<category>/<name>']} />
<Code
	showLines={false}
	showCopy={false}
	code={`Usage: jsrepo add [options] [blocks...]

Arguments:
  blocks         Names of the blocks you want to add to your project.

Options:
  -y, --yes      Skip confirmation prompt. (default: false)
  -A, --allow    Allow jsrepo to download code from the provided repo. (default: false)
  --repo <repo>  Repository to download the blocks from.
  --verbose      Include debug logs. (default: false)
  --cwd <path>   The current working directory. (default: ".")
  -h, --help     display help for command`}
/>
<SubHeading>build</SubHeading>
<p>
	The <CodeSpan>build</CodeSpan> command builds the specified directories into a
	<CodeSpan>jsrepo-manifest.json</CodeSpan> file.
</p>
<Snippet command="execute" args={['jsrepo', 'build']} />
<Code
	showLines={false}
	showCopy={false}
	code={`Usage: jsrepo build [options]

Builds the provided --dirs in the project root into a \`jsrepo-manifest.json\` file.

Options:
  --dirs [dirs...]  The directories containing the blocks. (default: ["./blocks"])
  --no-output       Do not output a \`jsrepo-manifest.json\` file.
  --verbose         Include debug logs. (default: false)
  --cwd <path>      The current working directory. (default: ".")
  -h, --help        display help for command`}
/>
<SubHeading>test</SubHeading>
<p>
	The <CodeSpan>test</CodeSpan> command allows you to run remote tests on your local code from the CLI.
</p>
<p>This ensures any changes to your code haven't caused any of the original tests to fail.</p>
<Snippet command="execute" args={['jsrepo', 'test']} />
<Code
	showLines={false}
	showCopy={false}
	code={`Usage: jsrepo test [options] [blocks...]

Tests local blocks against most recent remote tests.

Arguments:
  blocks         The blocks you want to test. (default: [])

Options:
  --verbose      Include debug logs. (default: false)
  -A, --allow    Allow jsrepo to download code from the provided repo. (default: false)
  --repo <repo>  Repository to download the blocks from
  --debug        Leaves the temp test file around for debugging upon failure. (default: false)
  --cwd <path>   The current working directory. (default: ".")
  -h, --help     display help for command`}
/>
<SubHeading>diff</SubHeading>
<p>
	The <CodeSpan>diff</CodeSpan> command allows you to check what changes would occur if you were to update
	the block from remote.
</p>
<Snippet command="execute" args={['jsrepo', 'diff']} />
<Code
	showLines={false}
	showCopy={false}
	code={`Usage: jsrepo diff [options]

Compares local blocks to the blocks in the provided repository.

Options:
  -A, --allow               Allow jsrepo to download code from the provided repo. (default: false)
  -E, --expand              Expands the diff so you see everything. (default: false)
  --repo <repo>             Repository to download the blocks from.
  --max-unchanged <number>  Maximum unchanged lines that will show without being collapsed. (default: 3)
  --cwd <path>              The current working directory. (default: ".")
  -h, --help                display help for command`}
/>
