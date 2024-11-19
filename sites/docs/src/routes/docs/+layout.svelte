<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { page } from '$app/stores';
	import { categories } from '$lib/components/site/map';

	let { children } = $props();
</script>

<div class="container flex-1 items-start lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
	<aside
		class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 lg:sticky lg:block bg-background border-border border-r"
	>
		<ScrollArea class="h-full py-6 pr-6 lg:py-8">
			{#each categories.filter((a) => a.name !== 'routes') as { name, routes }}
				<div class="flex flex-col gap-1 w-full">
					<span class="text-sm font-semibold">{name}</span>
					<div class="flex flex-col gap-1">
						{#each routes as { name, href }}
							<a
								class="data-[active=true]:text-primary text-muted-foreground"
								{href}
								data-active={$page.url.pathname.endsWith(href)}
							>
								{name}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</ScrollArea>
	</aside>
	<div class="flex flex-col gap-5 py-8 w-full flex-grow max-w-2xl">
		{@render children?.()}
	</div>
</div>
