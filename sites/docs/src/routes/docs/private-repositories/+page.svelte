<script lang="ts">
	import {
		Blockquote,
		Code,
		DocHeader,
		Jsrepo,
		Link,
		SubHeading,
		CodeSpan
	} from '$lib/components/site/docs';
	import { Snippet } from '$lib/components/ui/snippet';
	import * as Accordion from '$lib/components/ui/accordion';

	let { data } = $props();
</script>

<DocHeader
	title="Private Repositories"
	description="Yes! jsrepo supports private repositories too."
/>
<p>
	Adding blocks from a private repository is as simple as providing <Jsrepo /> with an auth token.
</p>
<Snippet command="execute" args={['jsrepo', 'auth']} />
<Blockquote variant="primary">
	Your auth tokens are stored locally on your computer using
	<Link target="_blank" href="https://www.npmjs.com/package/conf">conf</Link>.
</Blockquote>
<Code
	showLines={false}
	showCopy={false}
	code={`┌   jsrepo  v${data.version} 
│
◇  Paste your token
│  ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
│
└  All done!`}
/>
<div>
	<SubHeading>FAQ</SubHeading>
	<Accordion.Root type="single">
		<Accordion.Item value="q-1">
			<Accordion.Trigger>What permissions does my token need?</Accordion.Trigger>
			<Accordion.Content>
				<p>
					For GitHub just create a fine grained token with access to the repositories you are using
					and make sure to change the access for <CodeSpan>Contents</CodeSpan> under
					<CodeSpan>Repository permissions</CodeSpan> to
					<CodeSpan>Read-only</CodeSpan>.
				</p>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
