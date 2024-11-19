<script lang="ts">
	import { Code, CodeSpan, DocHeader, Jsrepo } from '$lib/components/site/docs';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data } = $props();
</script>

<DocHeader
	title="Project Setup"
	description="Setup your project to install blocks from a registry."
/>
<p>
	To install blocks from a registry you will need to create a <CodeSpan>jsrepo.json</CodeSpan> file.
</p>
<p>
	This file tells <Jsrepo /> where to get the blocks as well as where and how to install them.
</p>
<p>
	To setup the <CodeSpan>jsrepo.json</CodeSpan> file you can run the <CodeSpan>init</CodeSpan> command
	to take your through initial setup.
</p>
<Snippet command="execute" args={['jsrepo', 'init']} />
<Code
	showLines={false}
	showCopy={false}
	code={`┌   jsrepo  v${data.version}
│
◇  Where should we add the blocks?
│  src/blocks
│
◇  Where should we download the blocks from?
│  github/ieedan/std
│
◇  Add another repo?
│  No
│
◇  Wrote config to \`jsrepo.json\`.
│
└  All done!`}
/>
<p>
	Once you have run through the prompts your <CodeSpan>jsrepo.json</CodeSpan> file should look something
	like this:
</p>
<Code
	lang="json"
	code={`{
	"$schema": "https://unpkg.com/jsrepo@${data.version}/schema.json",
	"repos": ["github/ieedan/std"],
	"path": "src/blocks",
	"includeTests": false,
	"watermark": true
}`}
/>
<p>
	Now that you've created the <CodeSpan>jsrepo.json</CodeSpan> you can start adding blocks from repositories.
</p>
<Snippet command="execute" args={['jsrepo', 'add']} />
<p>
	If you need to update a block you just run <CodeSpan>add</CodeSpan> again and choose to overwrite it.
</p>
<p>
	You can use the <CodeSpan>diff</CodeSpan> command to check what changes will be made to your code when
	you run the <CodeSpan>add</CodeSpan> command.
</p>
<Snippet command="execute" args={['jsrepo', 'diff']} />
