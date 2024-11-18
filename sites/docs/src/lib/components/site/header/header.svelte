<script lang="ts">
	import * as Icons from '$lib/components/icons';
	import LightSwitch from '$lib/components/ui/light-switch/light-switch.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	type Props = {
		version: string;
	};

	let { version }: Props = $props();
</script>

<header class="py-2 px-6 flex place-items-center justify-between border-b border-border">
	<a href="/" class="flex place-items-center gap-2">
		<h1 class="bg-primary text-primary-foreground text-lg font-serif font-bold p-2 w-fit">
			jsrepo
		</h1>
		<span class="text-base font-serif text-muted-foreground">v{version}</span>
	</a>
	<div class="flex place-items-center gap-1">
		<Button href="https://github.com/ieedan/jsrepo" variant="ghost" size="icon">
			<Icons.GitHub />
		</Button>
		<LightSwitch />
	</div>
</header>
