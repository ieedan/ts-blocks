<script lang="ts">
	import { DocHeader, Jsrepo, SubHeading, Link, Blockquote } from '$lib/components/site/docs';
</script>

<DocHeader title="About" description="The origins and motivations behind jsrepo." />
<p>
	<Jsrepo /> was built by <Link target="_blank" href="https://github/ieedan">ieedan</Link> to make reusing
	your own code easier.
</p>
<SubHeading>Why?</SubHeading>
<p>
	<Jsrepo /> is a solution to a problem I've had since I started to code.
</p>
<Blockquote variant="primary" by="ieedan">
	I found myself writing the same functions multiple times or searching around all my repositories
	for that one function I had wrote in the past.
	<br />
	<br />
	None of it seems worth publishing an npm package for but it's still good code that you shouldn't have
	to throw away.
</Blockquote>
<p>
	<Jsrepo /> enables you to reuse code in a way you just couldn't before. Creating a registry is far
	easier to justify than publishing and maintaining a npm package.
</p>
<SubHeading>My insight</SubHeading>
<Blockquote variant="primary">
	Code has to change so wouldn't you rather change it in your own project.
</Blockquote>
<p>
	When I was working on
	<Link href="https://github.com/ieedan/geist-ui-svelte">geist-ui-svelte</Link> and using it in my projects
	I found myself crushed under the weight of my own creation.
</p>
<p>
	Every time I needed to change something I needed to publish a new release of this external package
	and take focus away from what I was actually working on.
</p>
<p>
	After than experience <Link target="_blank" href="https://ui.shadcn.com/">shadcn-ui</Link> was a revelation
	for me, reusing code but also owning the source in your project will likely be the only way I can enjoy
	a UI library again.
</p>
<p>
	But wouldn't it be nice to be able to reuse my own code and not just someone elses? And wouldn't
	it be nice for everyone else to be able to do the same?
</p>
<p>
	That's when I started changing this project from what it was in
	<Link target="_blank" href="https://www.npmjs.com/package/ts-blocks">ts-blocks</Link>
	to what it now is in <Jsrepo />.
</p>
