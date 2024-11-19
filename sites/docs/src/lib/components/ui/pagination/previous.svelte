<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { ChevronLeft } from 'lucide-svelte';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet<[]>;
	}

	let { children, ...rest }: Props = $props();
</script>

<a {...rest} class="flex place-items-end flex-col group">
	<span class="text-muted-foreground text-sm group-hover:text-primary transition-all">
		Previous
	</span>
	<div class="flex place-items-center gap-1">
		<ChevronLeft class="size-5 text-muted-foreground group-hover:text-primary transition-all" />
		{@render children()}
	</div>
</a>
