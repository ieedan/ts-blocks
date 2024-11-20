<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLBlockquoteAttributes } from 'svelte/elements';
	import { tv, type VariantProps } from 'tailwind-variants';

	const style = tv({
		base: 'border-l-4 px-4 py-4 border-border bg-secondary/50 flex flex-col gap-2',
		variants: {
			variant: {
				default: 'border-border',
				primary: 'border-primary',
				secondary: 'border-secondary'
			}
		}
	});

	interface Props extends HTMLBlockquoteAttributes {
		class?: string;
		by?: string;
		variant?: VariantProps<typeof style>['variant'];
	}

	let { class: className, by, variant = 'default', children, ...rest }: Props = $props();
</script>

<div class={cn(style({ variant }))}>
	<blockquote class={cn('text-muted-foreground', className)} {...rest}>
		<p>{@render children?.()}</p>
	</blockquote>
	{#if by}
		<p>- {by}</p>
	{/if}
</div>
