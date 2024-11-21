<script lang="ts">
	import { CodeSpan, DocHeader, Jsrepo } from '$lib/components/site/docs';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { Snippet } from 'svelte';
	import * as Icons from '$lib/components/icons';

	type Support = {
		logo?: (opts: { size: number }) => ReturnType<Snippet>;
		name: string;
		status: '✅' | '⌛️' | '🚫';
	};

	const support: Support[] = [
		{
			logo: typescript,
			name: '*.ts',
			status: '✅'
		},
		{
			logo: javascript,
			name: '*.js',
			status: '✅'
		},
		{
			logo: tsx,
			name: '*.tsx',
			status: '✅'
		},
		{
			logo: jsx,
			name: '*.jsx',
			status: '✅'
		},
		{
			logo: svelte,
			name: '*.svelte',
			status: '✅'
		},
		{
			logo: vue,
			name: '*.vue',
			status: '🚫'
		}
	];
</script>

<!-- icon snippets -->

{#snippet typescript({ size }: { size: number })}
	<Icons.TypeScript width={size} class="size-auto" />
{/snippet}

{#snippet javascript({ size }: { size: number })}
	<Icons.JavaScript width={size} class="size-auto" />
{/snippet}

{#snippet tsx({ size }: { size: number })}
	<Icons.React width={size} class="size-auto" />
{/snippet}

{#snippet jsx({ size }: { size: number })}
	<Icons.React width={size} class="size-auto text-[#f7df1e]" />
{/snippet}

{#snippet svelte({ size }: { size: number })}
	<Icons.Svelte width={size} class="size-auto" />
{/snippet}

{#snippet vue({ size }: { size: number })}
	<Icons.Vue width={size} class="size-auto" />
{/snippet}

<DocHeader
	title="Language Support"
	description="Languages that jsrepo supports in your registry."
/>
<p>
	<Jsrepo /> has to analyze your code to resolve any inter-block and remote dependencies. Because of
	this it needs to explicitly support languages for them to be used in your registry.
</p>
<div class="flex flex-col gap-1">
	<span>Legend:</span>
	<ul class="list-disc pl-5">
		<li>✅: Supported</li>
		<li>⌛️: In progress</li>
		<li>🚫: Not in progress</li>
	</ul>
</div>
<Table.Root class="w-fit">
	<Table.Caption><Jsrepo /> language support.</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Language</Table.Head>
			<Table.Head>Status</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each support as { name, logo, status }}
			<Table.Row>
				<Table.Cell>
					<div class="flex place-items-center gap-2">
						{#if logo}
							{@render logo({ size: 18 })}
						{/if}
						<CodeSpan>{name}</CodeSpan>
					</div>
				</Table.Cell>
				<Table.Cell>{status}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
