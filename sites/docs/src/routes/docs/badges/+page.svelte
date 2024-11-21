<script lang="ts">
	import { DocHeader, Link, CopyButton } from '$lib/components/site/docs';
	import * as Table from '$lib/components/ui/table';

	const badges = [
		{
			alt: 'jsrepo logo',
			href: 'https://jsrepo.dev/badges/jsrepo.svg'
		},
		{
			alt: 'jsrepo build passing',
			href: 'https://jsrepo.dev/badges/build/passing.svg'
		},
		{
			alt: 'jsrepo build failing',
			href: 'https://jsrepo.dev/badges/build/failing.svg'
		}
	];
</script>

<DocHeader title="Badges" description="jsrepo badges you can add to your README." />
<Table.Root class="w-fit">
	<Table.Header>
		<Table.Row>
			<Table.Head>Badge</Table.Head>
			<Table.Head>URL</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each badges as { alt, href }}
			<Table.Row>
				<Table.Cell>
					<div class="flex place-items-center gap-2">
						<!-- we slice off the domain so we just serve directly from static -->
						<img src={href.slice(18)} {alt} />
					</div>
				</Table.Cell>
				<Table.Cell>
					<div class="flex place-items-center gap-2">
						<Link {href}>{href}</Link>
						<CopyButton code={href} class="size-6" />
					</div>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
