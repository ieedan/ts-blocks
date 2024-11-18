<script lang="ts">
	import type { Agent, Command } from 'package-manager-detector';
	import { resolveCommand } from 'package-manager-detector/commands';
	import CopyButton from './copy-button.svelte';

	type Props = {
		command: Command;
		args: string[];
	};

	let { command, args }: Props = $props();

	let pm = $state<Agent>('npm');

	const cmd = $derived(resolveCommand(pm, command, args));

	const text = $derived(`${cmd?.command} ${cmd?.args.join(' ')}`);
</script>

<div
	class="border border-border bg-card rounded-md px-4 py-3 min-w-[350px] font-serif text-muted-foreground relative"
>
	<span class="text-primary">{cmd?.command}</span>
	<span>{cmd?.args.join(' ')}</span>
	<CopyButton bind:pm {text} class="absolute right-2 top-1/2 -translate-y-1/2" />
</div>
