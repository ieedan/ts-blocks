<!--
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-12-2024
-->

<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';

	let {
		shouldScaleBackground = true,
		open = $bindable(false),
		activeSnapPoint = $bindable(null),
		...restProps
	}: DrawerPrimitive.RootProps = $props();
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...restProps} />
