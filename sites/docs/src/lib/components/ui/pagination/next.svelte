<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { ChevronRight } from 'lucide-svelte';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet<[]>;
	}

	let { children, ...rest }: Props = $props();
</script>

<a {...rest} class="flex place-items-start flex-col group">
	<span class="text-muted-foreground text-sm group-hover:text-primary transition-all"> Next </span>
	<div class="flex place-items-center gap-1">
		{@render children()}
		<ChevronRight class="size-5 text-muted-foreground group-hover:text-primary transition-all" />
	</div>
</a>
