import { createHighlighter, type BundledLanguage } from 'shiki';
import light from '$lib/assets/themes/vercel-light';
import dark from '$lib/assets/themes/vercel-dark';

// We add the satisfies so it actually checks it before runtime
const LANGS = [
	'abap' satisfies BundledLanguage,
	'apex' satisfies BundledLanguage,
	'bat' satisfies BundledLanguage,
	'diff' satisfies BundledLanguage,
	'bicep' satisfies BundledLanguage,
	'clojure' satisfies BundledLanguage,
	'coffee' satisfies BundledLanguage,
	'cpp' satisfies BundledLanguage,
	'crystal' satisfies BundledLanguage,
	'c' satisfies BundledLanguage,
	'csharp' satisfies BundledLanguage,
	'css' satisfies BundledLanguage,
	'dart' satisfies BundledLanguage,
	'dockerfile' satisfies BundledLanguage,
	'fsharp' satisfies BundledLanguage,
	'go' satisfies BundledLanguage,
	'groovy' satisfies BundledLanguage,
	'handlebars' satisfies BundledLanguage,
	'haskell' satisfies BundledLanguage,
	'html' satisfies BundledLanguage,
	'ini' satisfies BundledLanguage,
	'java' satisfies BundledLanguage,
	'javascript' satisfies BundledLanguage,
	'json' satisfies BundledLanguage,
	'jsx' satisfies BundledLanguage,
	'julia' satisfies BundledLanguage,
	'kotlin' satisfies BundledLanguage,
	'latex' satisfies BundledLanguage,
	'less' satisfies BundledLanguage,
	'lisp' satisfies BundledLanguage,
	'lua' satisfies BundledLanguage,
	'makefile' satisfies BundledLanguage,
	'markdown' satisfies BundledLanguage,
	'objective-c' satisfies BundledLanguage,
	'pascal' satisfies BundledLanguage,
	'perl' satisfies BundledLanguage,
	'php' satisfies BundledLanguage,
	'pug' satisfies BundledLanguage,
	'python' satisfies BundledLanguage,
	'r' satisfies BundledLanguage,
	'raku' satisfies BundledLanguage,
	'razor' satisfies BundledLanguage,
	'ruby' satisfies BundledLanguage,
	'rust' satisfies BundledLanguage,
	'sas' satisfies BundledLanguage,
	'scala' satisfies BundledLanguage,
	'scss' satisfies BundledLanguage,
	'bash' satisfies BundledLanguage,
	'sql' satisfies BundledLanguage,
	'swift' satisfies BundledLanguage,
	'tcl' satisfies BundledLanguage,
	'twig' satisfies BundledLanguage,
	'typescript' satisfies BundledLanguage,
	'tsx' satisfies BundledLanguage,
	'vb' satisfies BundledLanguage,
	'xml' satisfies BundledLanguage,
	'yml' satisfies BundledLanguage,
	'yaml' satisfies BundledLanguage,
	'zig' satisfies BundledLanguage,
	'csv' satisfies BundledLanguage,
	'svelte' satisfies BundledLanguage,
	'ts' satisfies BundledLanguage,
	'tex' satisfies BundledLanguage,
	'js' satisfies BundledLanguage,
	'c#' satisfies BundledLanguage,
	'dotenv' satisfies BundledLanguage
] as const;

type Lang = (typeof LANGS)[number];

const THEMES: Record<string, string> = {
	light: 'vercel-light',
	dark: 'vercel-dark'
};

const highlighter = createHighlighter({
	themes: [dark, light],
	langs: [...LANGS]
});

export { highlighter, LANGS, type Lang, THEMES };
