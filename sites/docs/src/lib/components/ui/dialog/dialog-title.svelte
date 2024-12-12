<!--
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-12-2024
-->

<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	class={cn('text-lg font-semibold leading-none tracking-tight', className)}
	{...restProps}
/>
