<!--
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-10-2024
-->

<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import Copy from './copy.svelte';
	import { type BundledLanguage } from 'shiki';
	import { shikiContext } from '.';

	type Props = {
		lang?: BundledLanguage;
		code: string;
		class?: string;
		copyButtonContainerClass?: string;
		hideLines?: boolean;
		hideCopy?: boolean;
	};

	let {
		lang = 'diff',
		code,
		copyButtonContainerClass = undefined,
		class: className = undefined,
		hideLines = false,
		hideCopy = false
	}: Props = $props();

	const hl = shikiContext.get();

	const highlighted = $derived(
		$hl?.codeToHtml(code, {
			lang: lang,
			themes: {
				light: 'vercel-light',
				dark: 'vercel-dark'
			}
		}) ?? code
	);
</script>

<div class={cn('not-prose relative rounded-lg border border-border bg-background', className)}>
	<div
		class="scrollbar-hide flex max-h-full max-w-full place-items-start overflow-x-auto overflow-y-auto py-6"
	>
		<pre
			class="w-full flex-grow pl-6 text-sm"
			class:line-numbers={!hideLines}>{@html highlighted}</pre>
	</div>
	{#if !hideCopy}
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
