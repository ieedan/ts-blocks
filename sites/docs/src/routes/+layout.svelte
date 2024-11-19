<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/poppins';
	import '../app.css';
	import { Header } from '$lib/components/site/header';
	import { pmContext } from '$lib/ts/context';

	pmContext.init("npm", { persistValue: true });

	let { children, data } = $props();
</script>

<ModeWatcher />
<Header {...data} />
{@render children()}
