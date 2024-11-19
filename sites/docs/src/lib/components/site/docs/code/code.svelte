<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount, type Snippet } from 'svelte';
	import Copy from './copy.svelte';
	import { highlighter, THEMES, type Lang } from './highlighter';
	import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';

	type Props = {
		lang?: Lang;
		code: string;
		class?: string;
		copyButtonContainerClass?: string;
		showLines?: boolean;
		showCopy?: boolean;
	};

	let {
		lang,
		code,
		copyButtonContainerClass,
		class: className,
		showLines = true,
		showCopy = true
	}: Props = $props();

	let lines = $derived(code.split('\n').length);

	let highlighted: string = $state(code);

	let hl: HighlighterGeneric<BundledLanguage, BundledTheme> | undefined = undefined;

	$effect(() => {
		if (hl !== undefined) {
			highlighted = hl.codeToHtml(code, { lang: lang ?? 'diff', themes: THEMES });
		}
	});

	onMount(async () => {
		hl = await highlighter;

		highlighted = hl.codeToHtml(code, { lang: lang ?? 'diff', themes: THEMES });
	});
</script>

<div class={cn('relative rounded-lg border border-border bg-background max-w-full overflow-x-auto', className)}>
	<div
		class="scrollbar-hide flex max-h-full max-w-full place-items-start overflow-x-auto overflow-y-auto py-6"
	>
		{#if showLines}
			<div class="min-w-14 text-end text-sm leading-[20px]">
				{#each new Array(lines).fill(0) as _, index}
					<span class="text-end font-serif text-muted-foreground">{index + 1}</span>
					<br />
				{/each}
			</div>
		{/if}
		<pre class="w-full flex-grow pl-6 text-sm">{@html highlighted}</pre>
	</div>
	{#if showCopy}
		<div
			class={cn(
				'absolute right-1 top-1 flex place-items-center justify-center',
				copyButtonContainerClass
			)}
		>
			<Copy {code} />
		</div>
	{/if}
</div>
