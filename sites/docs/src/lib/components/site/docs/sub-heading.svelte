<script lang="ts">
	import { page } from '$app/stores';
	import { onThisPage } from '$lib/ts/on-this-page';
	import { onMount, type Snippet } from 'svelte';
	import Page from '../../../../routes/+page.svelte';

	type Props = {
		children: Snippet<[]>;
	};

	const pageMap = onThisPage.get();

	let { children }: Props = $props();

	let ref = $state<HTMLHeadingElement>();

	onMount(() => {
		if (ref) {
			pageMap.update((val) => {
				const newVal = val;

				if (val.curr !== undefined) {
					if (val.curr.path !== $page.url.pathname) {
						newVal.curr = {
							headings: [{ children: [], el: ref!, rank: 2 }],
							path: $page.url.pathname
						};
					} else {
						newVal.curr = {
							headings: [...val.curr.headings, { children: [], el: ref!, rank: 2 }],
							path: $page.url.pathname
						};
					}
				} else {
					newVal.curr = {
						headings: [{ children: [], el: ref!, rank: 2 }],
						path: $page.url.pathname
					};
				}

				newVal.headings.set(newVal.curr.path, newVal.curr.headings);

				return newVal;
			});
		}
	});
</script>

<h2 id={ref?.innerText} bind:this={ref} class="border-b border-border py-2 text-2xl font-bold scroll-m-16">
	{@render children()}
</h2>
