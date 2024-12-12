<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children: Snippet<[]>;
	};

	let { class: className, children }: Props = $props();
</script>

<kbd
	class={cn(
		'text-muted-foreground bg-secondary flex place-items-center justify-center text-sm p-0.5 rounded-md',
		className
	)}
>
	{@render children()}
</kbd>
