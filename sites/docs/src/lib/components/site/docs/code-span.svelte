<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
	};

	let { children }: Props = $props();
</script>

<span class="bg-secondary p-1 rounded-md font-serif text-sm text-nowrap">
	{@render children()}
</span>
