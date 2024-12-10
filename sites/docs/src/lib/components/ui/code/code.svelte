<!--
	jsrepo 1.18.0
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

	let lines = $derived(code.split('\n').length);

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
		{#if !hideLines}
			<div class="min-w-14 text-end text-sm leading-[19px]">
				{#each new Array(lines).fill(0) as _, index}
					<span class="text-end font-serif text-muted-foreground">{index + 1}</span>
					<br />
				{/each}
			</div>
		{/if}
		<div class="w-full flex-grow pl-6 text-sm">
			{@html highlighted}
		</div>
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
