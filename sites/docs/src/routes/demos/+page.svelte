<script lang="ts">
	import { VideoPlayer } from '$lib/components/ui/video-player';
</script>

<svelte:head>
	<title>jsrepo ~ Demos</title>
	<meta
		name="description"
		content="jsrepo demos showing off the capabilities of the CLI."
	/>
</svelte:head>

<main class="flex justify-center px-4">
	<div class="max-w-2xl content-center w-full py-8 gap-5 flex justify-center flex-col">
		<h1 class="text-4xl font-bold text-center">Demos</h1>
		<VideoPlayer
			src="https://github.com/user-attachments/assets/a8505ace-7e37-4933-9b0a-f78d4cf116d4"
			loop
			autoplay
			muted
			aspectRatio="16:9"
		/>
	</div>
</main>
