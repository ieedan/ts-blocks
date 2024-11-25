<script lang="ts">
	import { Blockquote, Code, DocHeader, Jsrepo, Link } from '$lib/components/site/docs';
	import { Snippet } from '$lib/components/ui/snippet';

	let { data } = $props();
</script>

<DocHeader
	title="Private Repositories"
	description="Yes! jsrepo supports private repositories too."
/>
<p>
	Using private repositories is as simple as providing <Jsrepo /> with an auth token.
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
