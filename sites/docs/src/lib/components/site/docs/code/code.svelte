<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
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

<div
	class={cn(
		'relative rounded-lg border border-border bg-background max-w-full overflow-x-auto',
		className
	)}
>
	<div
		class="scrollbar-hide flex max-h-full max-w-full place-items-start overflow-x-auto overflow-y-auto py-6"
	>
		<pre class="w-full flex-grow pl-6 text-sm" class:line-numbers={showLines}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html highlighted}
		</pre>
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

<style lang="postcss">
	:global(pre.line-numbers) {
		counter-reset: step;
		counter-increment: step 0;
	}

	:global(pre.line-numbers .line::before) {
		content: counter(step);
		counter-increment: step;
		width: 1rem;
		margin-right: 1.5rem;
		display: inline-block;
		text-align: right;
	}

	:global(pre.line-numbers .line::before) {
		@apply text-muted-foreground;
	}
</style>
