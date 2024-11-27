<script lang="ts">
	import { DocHeader, Jsrepo, Link, SubHeading, Code, Blockquote } from '$lib/components/site/docs';
	import CodeSpan from '$lib/components/site/docs/code-span.svelte';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data } = $props();
</script>

<DocHeader title="GitLab" description="How to use GitLab as your jsrepo registry." />
<SubHeading>Branches and Tags</SubHeading>
<Blockquote variant="primary">
	The default branch is <CodeSpan>main</CodeSpan>.
</Blockquote>
<p>
	<Jsrepo /> supports <Link target="_blank" href="https://gitlab.com">GitLab</Link> so that you can just
	paste a link to the repo homepage and it will be handled correctly.
</p>
<p>Because of this all of the following paths work:</p>
<Code
	showLines={false}
	lang="bash"
	code={`https://gitlab.com/ieedan/std # main shorthand
https://gitlab.com/ieedan/std/tree/v1.5.0 # tag reference
https://gitlab.com/ieedan/std/tree/next # branch reference
`}
/>
<SubHeading>Using Tags for Versioning</SubHeading>
<p>
	Tags can be a great solution to ensuring remote tests and blocks stay on a consistent version.
</p>
<Code
	showLines={false}
	lang="json"
	code={`{
	"$schema": "https://unpkg.com/jsrepo@${data.version}/schema.json",
    // use a specific version tag
	"repos": ["https://gitlab.com/ieedan/std/tree/v1.5.0"],
	"path": "src/blocks",
	"includeTests": false,
	"watermark": true
}`}
/>
<p>
	Tags do not however work like npm packages. Tags are completely mutable meaning a malicious
	registry could publish over a tag with different code.
</p>
<p>This is why it's always important to make sure you trust the owner of the registry.</p>
<SubHeading><CodeSpan class="text-2xl">gitlab</CodeSpan> Shorthand</SubHeading>
<p>
	When referencing <Link target="_blank" href="https://gitlab.com">GitLab</Link> as the provider you
	can use the <CodeSpan>gitlab</CodeSpan> shorthand in place of
	<CodeSpan>https://gitlab.com</CodeSpan>.
</p>
<p>Example:</p>
<Snippet command="execute" args={['jsrepo', 'add', 'gitlab/ieedan/std/utils/math']} />
<p>
	In the <CodeSpan>jsrepo.json</CodeSpan>:
</p>
<Code
	lang="json"
	code={`{
	"$schema": "https://unpkg.com/jsrepo@${data.version}/schema.json",
    // use gitlab instead of https://gitlab.com
	"repos": ["gitlab/ieedan/std"],
	"path": "src/blocks",
	"includeTests": false,
	"watermark": true
}`}
/>
