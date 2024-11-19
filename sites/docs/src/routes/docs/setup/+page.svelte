<script lang="ts">
	import { DocHeader, SubHeading } from '$lib/components/site/docs';

	const guides = [
		{
			name: 'New Registry',
            description: 'Host your own registry',
			href: '/docs/setup/registry'
		},
		{
			name: 'New Project',
            description: 'Use blocks from a registry in your project.',
			href: '/docs/setup/project'
		}
	];
</script>

<DocHeader title="Setup" description="Get started with jsrepo." />
<SubHeading>Guides</SubHeading>
<div class="grid md:grid-cols-2 grid-rows-2 gap-2">
	{#each guides as { name, href, description }}
		<a
			{href}
			class="bg-background border border-border rounded-lg p-4 flex place-items-center justify-center h-44 hover:bg-secondary transition-all"
		>
			<div class="flex flex-col place-items-center justify-center">
                <h3 class="text-xl font-bold text-center">{name}</h3>
                <p class="text-muted-foreground text-center">{description}</p>
            </div>
		</a>
	{/each}
</div>
