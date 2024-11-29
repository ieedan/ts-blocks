import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	platform: 'node',
	target: 'es2022',
	outDir: 'dist',
	clean: true,
	minify: true,
	treeshake: true,
	splitting: true,
	dts: false,
	banner: {
		js: '#!/usr/bin/env node',
	},
});
