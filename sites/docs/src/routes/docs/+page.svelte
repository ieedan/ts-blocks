<script lang="ts">
	import { CodeSpan, DocHeader, SubHeading } from '$lib/components/site/docs';
	import { Jsrepo, Link } from '$lib/components/site/docs';
</script>

<DocHeader
	title="Introduction"
	description="Share your code with less friction than ever before."
/>
<p>
	<Jsrepo /> was born from a desire to move away from an excessive amount of npm packages that both bloat
	your project and give up control.
</p>
<p>
	Taking inspiration from tools like <Link target="_blank" href="https://ui.shadcn.com/">
		shadcn-ui
	</Link>, <Jsrepo /> allows you to only bring in what you need while making it almost as easy as just
	installing an npm package.
</p>
<p>
	When using <Jsrepo /> you add individual
	<CodeSpan>blocks</CodeSpan> from a
	<CodeSpan>registry</CodeSpan> that is owned by yourself or someone else. These
	<CodeSpan>blocks</CodeSpan> are added directly into your project and unlike npm packages give you the
	ability to update the code to your own needs.
</p>
<SubHeading>What is a block?</SubHeading>
<p>
	A block is a file or directory of files containing code that can be added by the CLI. Blocks are
	normally referenced by <CodeSpan>{'<category>/<name>'}</CodeSpan>.
</p>
<SubHeading>What is a registry?</SubHeading>
<p>
	A registry is a repository containing blocks that can be added from the CLI. <Jsrepo /> allows you
	to create your own registry and download the blocks from the CLI.
</p>
<p>
	<Jsrepo /> builds your registry into a manifest that it can read to access the blocks. While doing
	this it will also resolve any inter-block dependencies as well as any remote dependencies in
	<Link href="/docs/language-support">supported file types</Link>.
</p>
