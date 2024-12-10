<!--
	jsrepo 1.18.0
	Installed from github/ieedan/shadcn-svelte-extras
	12-10-2024
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { createHighlighter } from 'shiki';
	import dark from './dark';
	import light from './light';
	import { shikiContext } from '.';

	const shiki = shikiContext.init(undefined);

	let { children } = $props();

	onMount(() => {
		createHighlighter({
			themes: [dark, light],
			// make sure you setup any languages you are going to use here
			langs: [
				'typescript',
				'javascript',
				'svelte',
				'diff',
				'json',
				'yml',
				'yaml',
				'vue',
				'tsx',
				'jsx',
				'tsx',
				'bash'
			]
		}).then((highlighter) => shiki.set(highlighter));

		return () => $shiki?.dispose();
	});
</script>

{@render children()}

<!--
	Provides a shiki highlighter instance to use around your app. 

	## Usage
	`./src/routes/+layout.svelte`
	```
	<script lang="ts">
		import { ShikiProvider } from '$lib/components/ui/code';
	</script>

	<ShikiProvider>
		{@render children()}
	</ShikiProvider>
	```
 	@component
-->
