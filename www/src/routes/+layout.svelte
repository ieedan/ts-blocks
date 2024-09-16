<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource/geist-mono';
	import '@fontsource/geist-sans';
	import '../app.css';
	import LightSwitch from '$lib/components/ui/light-switch/light-switch.svelte';
</script>

<ModeWatcher />

<header class="py-4 px-6 flex place-items-center justify-between border-b sticky">
	<strong>ts-blocks</strong>
	<LightSwitch/>
</header>
<div class="flex" style="height: calc(100svh - 73px);">
	<nav class="flex flex-col gap-4 border-border border-r w-64">

	</nav>
	<div class="flex grow flex-col h-full">
		<slot />
	</div>
</div>

