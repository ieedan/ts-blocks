<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/poppins';
	import '../app.css';
	import { Header } from '$lib/components/site/header';
	import { pmContext } from '$lib/ts/context';
	import { Footer } from '$lib/components/site/footer';
	import { ShikiProvider } from '$lib/components/ui/code';

	pmContext.init('npm');

	let { children, data } = $props();
</script>

<ModeWatcher />
<ShikiProvider>
	<Header {...data} />
	{@render children()}
	<Footer {...data} />
</ShikiProvider>
