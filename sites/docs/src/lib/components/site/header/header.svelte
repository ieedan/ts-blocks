<script lang="ts">
	import * as Icons from '$lib/components/icons';
	import LightSwitch from '$lib/components/ui/light-switch/light-switch.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { categories } from '$lib/components/site/map';
	import { page } from '$app/stores';
	import { Menu } from 'lucide-svelte';
	import { active } from '$lib/ts/actions/active';

	type Props = {
		version: string;
	};

	let { version }: Props = $props();

	let open = $state(false);
</script>

<header
	class="py-2 px-6 flex place-items-center justify-center border-b border-border h-14 sticky top-0 bg-background z-40"
>
	<div class="flex place-items-center justify-between max-w-screen-2xl w-full">
		<div class="flex place-items-center gap-6">
			<Drawer.Root bind:open>
				<Drawer.Trigger class="lg:hidden">
					<span class="sr-only">Menu</span>
					<Menu class="size-5" />
				</Drawer.Trigger>
				<Drawer.Content class="p-6 flex flex-col gap-4 place-items-start">
					<div class="flex place-items-center gap-2">
						<Icons.Jsrepo class="h-8" />
						<span class="text-sm text-muted-foreground">v{version}</span>
					</div>
					{#each categories as { name, routes }}
						<div class="flex flex-col gap-1 w-full">
							{#if name !== 'routes'}
								<span class="text-sm font-semibold">{name}</span>
							{/if}
							<div class="flex flex-col">
								{#each routes as { name, href, activeForSubdirectories }}
									<a
										class="data-[active=true]:text-primary text-muted-foreground"
										onclick={() => (open = false)}
										{href}
										use:active={{
											activeForSubdirectories: activeForSubdirectories ?? false,
											url: $page.url
										}}
									>
										{name}
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</Drawer.Content>
			</Drawer.Root>
			<a href="/" class="lg:flex place-items-center gap-2 hidden">
				<h1 class="bg-primary text-primary-foreground text-lg font-serif font-bold p-1 w-fit">
					jsrepo
				</h1>
				<span class="text-base font-serif text-muted-foreground">v{version}</span>
			</a>
			<div class="place-items-center gap-4 hidden lg:flex">
				<a
					href="/"
					class="hover:text-primary text-muted-foreground transition-all data-[active=true]:text-primary"
					use:active={{
						activeForSubdirectories: false,
						url: $page.url
					}}
				>
					Home
				</a>
				<a
					href="/docs"
					class="hover:text-primary text-muted-foreground transition-all data-[active=true]:text-primary"
					use:active={{
						activeForSubdirectories: true,
						url: $page.url
					}}
				>
					Docs
				</a>
				<a
					href="/demos"
					class="hover:text-primary text-muted-foreground transition-all data-[active=true]:text-primary"
					use:active={{
						activeForSubdirectories: true,
						url: $page.url
					}}
				>
					Demos
				</a>
			</div>
		</div>
		<div class="flex place-items-center gap-1">
			<Button target="_blank" href="https://github.com/ieedan/jsrepo" variant="ghost" size="icon">
				<span class="sr-only">GitHub</span>
				<Icons.GitHub />
			</Button>
			<LightSwitch />
		</div>
	</div>
</header>
