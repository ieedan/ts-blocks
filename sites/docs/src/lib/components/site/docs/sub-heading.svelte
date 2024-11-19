<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
	};

	let { children }: Props = $props();
</script>

<h2 class="border-b border-border py-2 text-2xl font-bold">
	{@render children()}
</h2>
