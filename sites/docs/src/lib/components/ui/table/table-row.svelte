<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type Props = {
		active?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		active = false,
		children,
		...restProps
	}: Props & WithElementRef<HTMLAttributes<HTMLTableRowElement>> = $props();
</script>

<tr
	bind:this={ref}
	class={cn(
		'data-[state=selected]:bg-muted border-b transition-colors',
		{
			'hover:bg-muted/50': active
		},
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
