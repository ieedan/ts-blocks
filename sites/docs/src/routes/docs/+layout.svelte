<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { page } from '$app/stores';
	import { categories, type Route } from '$lib/components/site/map';
	import * as Pagination from '$lib/components/ui/pagination';
	import { active, checkIsActive } from '$lib/ts/actions/active';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';

	type CurrentDoc = {
		route: Route;
		next?: Route;
		previous?: Route;
	};

	const getCurrentDoc = (url: URL): CurrentDoc | undefined => {
		const routes: Route[] = [];
		categories.filter((a) => a.name !== 'routes').map((cat) => routes.push(...cat.routes));

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];

			if (
				checkIsActive(new URL(route.href, $page.url.origin).toString(), {
					activeForSubdirectories: route.activeForSubdirectories ?? false,
					url
				})
			) {
				return { route, next: routes[i + 1], previous: routes[i - 1] };
			}
		}
	};

	const currentDoc = $derived(getCurrentDoc($page.url));

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
						{#each routes as { name, href, activeForSubdirectories }}
							<a
								class="data-[active=true]:text-primary text-muted-foreground"
								{href}
								use:active={{
									url: $page.url,
									activeForSubdirectories: activeForSubdirectories ?? false
								}}
							>
								{name}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</ScrollArea>
	</aside>
	<div
		class="flex flex-col gap-5 py-8 w-full justify-between flex-grow max-w-2xl"
		style="min-height: calc(100svh - 56px)"
	>
		<div class="flex flex-col gap-5">
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/docs">Docs</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					{#if currentDoc}
						<Breadcrumb.Item>
							<Breadcrumb.Page>{currentDoc.route.name}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
			{@render children?.()}
		</div>
		{#if currentDoc}
			<div class="flex w-full justify-between place-items-center pt-9">
				<div>
					{#if currentDoc.previous}
						<Pagination.Previous href={currentDoc.previous.href}>
							{currentDoc.previous.name}
						</Pagination.Previous>
					{/if}
				</div>
				<div>
					{#if currentDoc.next}
						<Pagination.Next href={currentDoc.next.href}>
							{currentDoc.next.name}
						</Pagination.Next>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
