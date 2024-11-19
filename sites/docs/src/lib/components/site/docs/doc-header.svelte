<script lang="ts">
	type Props = {
		title: string;
		description: string;
	};

	let { title, description }: Props = $props();
</script>

<svelte:head>
    <title>jsrepo | {title}</title>
    <meta name="description" content="description">
</svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-4xl font-bold">
		{title}
	</h1>
	<p class="text-lg text-muted-foreground">
		{description}
	</p>
</div>
