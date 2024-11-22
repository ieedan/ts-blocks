<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { page } from '$app/stores';
	import { categories, type Route } from '$lib/components/site/map';
	import * as Pagination from '$lib/components/ui/pagination';
	import { active, checkIsActive } from '$lib/ts/actions/active';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { onThisPage } from '$lib/ts/on-this-page';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

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

	const pageMap = onThisPage.init({ headings: new Map() });

	let top = $state(0);

	const isInView = (el: HTMLElement | undefined, scrolled: number): boolean => {
		if (el === undefined) return false;

		return el.offsetHeight + el.offsetTop <= scrolled;
	};

	onNavigate(() => ($pageMap.curr = undefined));

	const pageHeadings = $derived($pageMap.headings.get($page.url.pathname));

	// svelte-ignore state_referenced_locally its just an initial value
	let activeHeading = $state<string | undefined>(
		pageHeadings ? pageHeadings[0]?.el.innerText : undefined
	);

	$effect(() => {
		if (pageHeadings) {
			const observer = new IntersectionObserver((entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeHeading = (entry.target as HTMLHeadingElement).innerText;
					}
				}
			});
			
			pageHeadings.forEach((heading) => {
				observer.observe(heading.el);
			});
		}
	});

	let { children } = $props();
</script>

<svelte:window onscroll={(e) => (top = e.currentTarget.scrollY)} />

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
	<div class="relative xl:grid-cols-[1fr_300px] py-8 xl:grid xl:gap-10">
		<div
			class="flex flex-col gap-5 w-full justify-between flex-grow max-w-2xl"
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
		<div class="xl:flex flex-col hidden py-8 -mt-10 gap-3 sticky top-14 h-[calc(100vh-3.5rem)]">
			{#if ($pageMap.headings.get($page.url.pathname) ?? []).length > 0}
				{@const headings = $pageMap.headings.get($page.url.pathname) ?? []}
				{@const inView = top + window.innerHeight - 56}
				<p class="font-semibold text-sm">On This Page {activeHeading}</p>
				<div class="flex flex-col gap-1">
					{#each headings as heading, i}
						{@const headingInView = isInView(heading.el, inView)}
						{@const nextInView = isInView(headings[i + 1]?.el, inView)}
						<a
							href="#{heading.el.innerText}"
							class="text-muted-foreground text-sm hover:text-primary transition-all data-[active=true]:text-primary"
							data-active={activeHeading === heading.el.innerText}
						>
							{heading.el.innerText}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
