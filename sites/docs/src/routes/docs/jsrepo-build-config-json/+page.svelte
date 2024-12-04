<script lang="ts">
	import { Code, CodeSpan, DocHeader, SubHeading } from '$lib/components/site/docs';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data } = $props();
</script>

<DocHeader title="jsrepo-build-config.json" description="Configuration for your registry." />
<p>
	<CodeSpan>jsrepo-build-config.json</CodeSpan> holds the configuration for your registry.
</p>
<p>
	You can create a <CodeSpan>jsrepo-build-config.json</CodeSpan> by running the init command with the
	<CodeSpan>--registry</CodeSpan> flag:
</p>
<Snippet command="execute" args={['jsrepo', 'init', '--registry']} />
<SubHeading>$schema</SubHeading>
<p>
	<CodeSpan>$schema</CodeSpan> is tracked with the cli so you can use a specific version using
	<CodeSpan>unpkg</CodeSpan>:
</p>
<Code
	lang="json"
	code={`{
    "$schema": "https://unpkg.com/jsrepo@${data.version}/schemas/registry-config.json"
}`}
/>
<SubHeading>dirs</SubHeading>
<p>
	<CodeSpan>dirs</CodeSpan> is a list of the directories that contain your block categories.
</p>
<Code
	lang="json"
	code={`{
    "dirs": [
        "./src",
        "./blocks"
    ]
}`}
/>
<SubHeading>doNotListBlocks</SubHeading>
<p>
	<CodeSpan>doNotListBlocks</CodeSpan> is a list of block names that shouldn't be listed when the user
	runs the <CodeSpan>add</CodeSpan> command.
</p>
<Code
	lang="json"
	code={`{
    "doNotListBlocks": [
        "utils"
    ]
}`}
/>
<SubHeading>doNotListCategories</SubHeading>
<p>
	<CodeSpan>doNotListCategories</CodeSpan> is a list of category names that shouldn't be listed when
	the user runs the <CodeSpan>add</CodeSpan> command.
</p>
<Code
	lang="json"
	code={`{
    "doNotListCategories": [
        "utils"
    ]
}`}
/>
<SubHeading>excludeDeps</SubHeading>
<p>
	<CodeSpan>excludeDeps</CodeSpan> allows you to prevent specified remote dependencies from being installed
	when the user adds/updates blocks. This is useful for framework specific API's like React or Svelte.
</p>
<Code
	lang="json"
	code={`{
    "excludeDeps": [
        "svelte",
        "react",
        "vue"
    ]
}`}
/>
<SubHeading>includeBlocks</SubHeading>
<p>
	<CodeSpan>includeBlocks</CodeSpan> allows you to only include specified blocks in the final manifest
	file. Keep in mind that if these blocks are referenced by other blocks that are included then your
	build will break.
</p>
<Code
	lang="json"
	code={`{
    "includeBlocks": [
        "ui",
        "hooks"
    ]
}`}
/>
<SubHeading>includeCategories</SubHeading>
<p>
	<CodeSpan>includeCategories</CodeSpan> allows you to only include specified categories in the final
	manifest file. Keep in mind that if these categories are referenced by other categories that are included
	then your build will break.
</p>
<Code
	lang="json"
	code={`{
    "includeCategories": [
        "components",
        "utils"
    ]
}`}
/>
<SubHeading>errorOnWarn</SubHeading>
<p>
	<CodeSpan>errorOnWarn</CodeSpan> will cause the build command to exit early and not create a manifest
	file if a warning is detected.
</p>
<Code
	lang="json"
	code={`{
    "errorOnWarn": false
}`}
/>
<SubHeading>output</SubHeading>
<p>
	<CodeSpan>output</CodeSpan> setting output to false will prevent an output file from being created.
</p>
<Code
	lang="json"
	code={`{
    "output": true
}`}
/>
