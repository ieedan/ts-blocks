<script lang="ts">
	import type { Command } from 'package-manager-detector';
	import { resolveCommand } from 'package-manager-detector/commands';
	import CopyButton from './copy-button.svelte';
	import { cn } from '$lib/utils';
	import { pmContext } from '$lib/ts/context';

	type Props = {
		command: Command;
		args: string[];
		class?: string;
	};

	let { command, args, class: className }: Props = $props();

	const pm = pmContext.get();

	const cmd = $derived(resolveCommand($pm, command, args));

	const text = $derived(`${cmd?.command} ${cmd?.args.join(' ')}`);
</script>

<div
	class={cn(
		'border border-border bg-card rounded-md px-4 py-3 min-w-[350px] w-full max-w-[450px] font-serif text-muted-foreground relative',
		className
	)}
>
	<span class="text-primary">{cmd?.command}</span>
	<span>{cmd?.args.join(' ')}</span>
	<CopyButton bind:pm={$pm} {text} class="absolute right-2 top-1/2 -translate-y-1/2" />
</div>
