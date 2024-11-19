// Source: https://github.com/Railly/one-hunter-vscode/blob/main/themes/Vercel2024-Light-color-theme.json
import type { ThemeInput } from 'shiki';

const light: ThemeInput = {
	name: 'vercel-light',
	type: 'light',
	colors: {
		'editor.background': '#FFFFFF',
		'editor.foreground': '#171717',
		'editor.hoverHighlightBackground': '#D8D8D8',
		'editor.lineHighlightBackground': '#EDEDED',
		'editor.selectionBackground': '#17171744',
		'editor.selectionHighlightBackground': '#17171744',
		'editor.findMatchBackground': '#E5B800',
		'editor.findMatchHighlightBackground': '#E5B800cc',
		'editor.findRangeHighlightBackground': '#EDEDED',
		'editor.inactiveSelectionBackground': '#EDEDED',
		'editor.lineHighlightBorder': '#EDEDED',
		'editor.rangeHighlightBackground': '#BDBDBD',
		'notifications.background': '#EDEDED',
		'editorInlayHint.typeBackground': '#D8D8D8',
		'editorInlayHint.typeForeground': '#171717',
		'editorWhitespace.foreground': '#BDBDBD',
		'editorIndentGuide.background1': '#D8D8D8',
		'editorHoverWidget.background': '#EDEDED',
		'editorLineNumber.activeForeground': '#171717',
		'editorLineNumber.foreground': '#BDBDBD',
		'editorGutter.background': '#FFFFFF',
		'editorGutter.modifiedBackground': '#1B9E97',
		'editorGutter.addedBackground': '#0F7E32',
		'editorGutter.deletedBackground': '#AF3029',
		'editorBracketMatch.background': '#EDEDED',
		'editorBracketMatch.border': '#D8D8D8',
		'editorError.foreground': '#AF3029',
		'editorWarning.foreground': '#C55D17',
		'editorInfo.foreground': '#0060F1',
		'diffEditor.insertedTextBackground': '#00CA5133',
		'diffEditor.removedTextBackground': '#D14D4133',
		'editorGroupHeader.tabsBackground': '#FFFFFF',
		'editorGroup.border': '#D8D8D8',
		'tab.activeBackground': '#FFFFFF',
		'tab.inactiveBackground': '#EDEDED',
		'tab.inactiveForeground': '#666666',
		'tab.activeForeground': '#171717',
		'tab.hoverBackground': '#D8D8D8',
		'tab.unfocusedHoverBackground': '#D8D8D8',
		'tab.border': '#D8D8D8',
		'tab.activeModifiedBorder': '#B38F00',
		'tab.inactiveModifiedBorder': '#0060F1',
		'tab.unfocusedActiveModifiedBorder': '#E5B800',
		'tab.unfocusedInactiveModifiedBorder': '#47A8FF',
		'editorWidget.background': '#EDEDED',
		'editorWidget.border': '#D8D8D8',
		'editorSuggestWidget.background': '#FFFFFF',
		'editorSuggestWidget.border': '#D8D8D8',
		'editorSuggestWidget.foreground': '#171717',
		'editorSuggestWidget.highlightForeground': '#666666',
		'editorSuggestWidget.selectedBackground': '#D8D8D8',
		'peekView.border': '#D8D8D8',
		'peekViewEditor.background': '#FFFFFF',
		'peekViewEditor.matchHighlightBackground': '#BDBDBD',
		'peekViewResult.background': '#EDEDED',
		'peekViewResult.fileForeground': '#171717',
		'peekViewResult.lineForeground': '#666666',
		'peekViewResult.matchHighlightBackground': '#BDBDBD',
		'peekViewResult.selectionBackground': '#EDEDED',
		'peekViewResult.selectionForeground': '#8F8F8F',
		'peekViewTitle.background': '#D8D8D8',
		'peekViewTitleDescription.foreground': '#666666',
		'peekViewTitleLabel.foreground': '#171717',
		'merge.currentHeaderBackground': '#0F7E32',
		'merge.currentContentBackground': '#00CA51',
		'merge.incomingHeaderBackground': '#1B9E97',
		'merge.incomingContentBackground': '#4CC0BA',
		'merge.border': '#D8D8D8',
		'merge.commonContentBackground': '#BDBDBD',
		'merge.commonHeaderBackground': '#D8D8D8',
		'panel.background': '#FFFFFF',
		'panel.border': '#D8D8D8',
		'panelTitle.activeBorder': '#BDBDBD',
		'panelTitle.activeForeground': '#171717',
		'panelTitle.inactiveForeground': '#666666',
		'statusBar.background': '#FFFFFF',
		'statusBar.foreground': '#171717',
		'statusBar.border': '#D8D8D8',
		'statusBar.debuggingBackground': '#AF3029',
		'statusBar.debuggingForeground': '#171717',
		'statusBar.noFolderBackground': '#BDBDBD',
		'statusBar.noFolderForeground': '#8F8F8F',
		'titleBar.activeBackground': '#FFFFFF',
		'titleBar.activeForeground': '#171717',
		'titleBar.inactiveBackground': '#EDEDED',
		'titleBar.inactiveForeground': '#666666',
		'titleBar.border': '#D8D8D8',
		'menu.foreground': '#171717',
		'menu.background': '#FFFFFF',
		'menu.selectionForeground': '#171717',
		'menu.selectionBackground': '#D8D8D8',
		'menu.border': '#D8D8D8',
		'editorInlayHint.foreground': '#666666',
		'editorInlayHint.background': '#D8D8D8',
		'terminal.foreground': '#171717',
		'terminal.background': '#FFFFFF',
		'terminalCursor.foreground': '#171717',
		'terminalCursor.background': '#FFFFFF',
		'terminal.ansiRed': '#AF3029',
		'terminal.ansiGreen': '#0F7E32',
		'terminal.ansiYellow': '#B38F00',
		'terminal.ansiBlue': '#0060F1',
		'terminal.ansiMagenta': '#1B9E97',
		'terminal.ansiCyan': '#1B9E97',
		'activityBar.background': '#FFFFFF',
		'activityBar.foreground': '#171717',
		'activityBar.inactiveForeground': '#666666',
		'activityBar.activeBorder': '#171717',
		'activityBar.border': '#D8D8D8',
		'sideBar.background': '#FFFFFF',
		'sideBar.foreground': '#171717',
		'sideBar.border': '#D8D8D8',
		'sideBarTitle.foreground': '#171717',
		'sideBarSectionHeader.background': '#EDEDED',
		'sideBarSectionHeader.foreground': '#171717',
		'sideBarSectionHeader.border': '#D8D8D8',
		'sideBar.activeBackground': '#BDBDBD',
		'sideBar.activeForeground': '#171717',
		'sideBar.hoverBackground': '#D8D8D8',
		'sideBar.hoverForeground': '#666666',
		'sideBar.folderIcon.foreground': '#0F7E32',
		'sideBar.fileIcon.foreground': '#0060F1',
		'list.warningForeground': '#C55D17',
		'list.errorForeground': '#AF3029',
		'list.inactiveSelectionBackground': '#D8D8D8',
		'list.activeSelectionBackground': '#BDBDBD',
		'list.inactiveSelectionForeground': '#171717',
		'list.activeSelectionForeground': '#171717',
		'list.hoverForeground': '#171717',
		'list.hoverBackground': '#D8D8D8',
		'input.background': '#EDEDED',
		'input.foreground': '#171717',
		'input.border': '#D8D8D8',
		'input.placeholderForeground': '#666666',
		'inputOption.activeBorder': '#D8D8D8',
		'inputOption.activeBackground': '#EDEDED',
		'inputOption.activeForeground': '#171717',
		'inputValidation.infoBackground': '#0060F1',
		'inputValidation.infoBorder': '#47A8FF',
		'inputValidation.warningBackground': '#C55D17',
		'inputValidation.warningBorder': '#F27F35',
		'inputValidation.errorBackground': '#AF3029',
		'inputValidation.errorBorder': '#D14D41',
		'dropdown.background': '#EDEDED',
		'dropdown.foreground': '#171717',
		'dropdown.border': '#D8D8D8',
		'dropdown.listBackground': '#FFFFFF',
		'badge.background': '#0060F1',
		'activityBarBadge.background': '#0060F1',
		'button.background': '#0060F1',
		'button.foreground': '#FFFFFF',
		'badge.foreground': '#FFFFFF',
		'activityBarBadge.foreground': '#FFFFFF',
	},
	tokenColors: [
		{
			name: 'plain',
			scope: ['source', 'support.type.property-name.css'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'classes',
			scope: ['entity.name.type.class'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'interfaces',
			scope: ['entity.name.type.interface', 'entity.name.type'],
			settings: {
				foreground: '#7D00CC',
			},
		},
		{
			name: 'structs',
			scope: ['entity.name.type.struct'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'enums',
			scope: ['entity.name.type.enum'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'keys',
			scope: ['meta.object-literal.key'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'methods',
			scope: ['entity.name.function.method', 'meta.function.method'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'functions',
			scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
			settings: {
				foreground: '#7D00CC',
			},
		},
		{
			name: 'variables',
			scope: [
				'variable',
				'meta.variable',
				'variable.other.object.property',
				'variable.other.readwrite.alias',
			],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'variablesOther',
			scope: ['variable.other.object'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'globalVariables',
			scope: ['variable.other.global', 'variable.language.this'],
			settings: {
				foreground: '#1B9E97',
			},
		},
		{
			name: 'localVariables',
			scope: ['variable.other.local'],
			settings: {
				foreground: '#EDEDED',
			},
		},
		{
			name: 'parameters',
			scope: ['variable.parameter', 'meta.parameter'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'properties',
			scope: ['variable.other.property', 'meta.property'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'strings',
			scope: ['string', 'string.other.link', 'markup.inline.raw.string.markdown'],
			settings: {
				foreground: '#0F7E32',
			},
		},
		{
			name: 'stringEscapeSequences',
			scope: ['constant.character.escape', 'constant.other.placeholder'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'keywords',
			scope: ['keyword'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'keywordsControl',
			scope: ['keyword.control.import', 'keyword.control.from', 'keyword.import'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'storageModifiers',
			scope: ['storage.modifier', 'keyword.modifier', 'storage.type'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'comments',
			scope: ['comment', 'punctuation.definition.comment'],
			settings: {
				foreground: '#666666',
			},
		},
		{
			name: 'docComments',
			scope: ['comment.documentation', 'comment.line.documentation'],
			settings: {
				foreground: '#666666',
			},
		},
		{
			name: 'numbers',
			scope: ['constant.numeric'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'booleans',
			scope: ['constant.language.boolean', 'constant.language.json'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'operators',
			scope: ['keyword.operator'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'macros',
			scope: ['entity.name.function.preprocessor', 'meta.preprocessor'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'preprocessor',
			scope: ['meta.preprocessor'],
			settings: {
				foreground: '#1B9E97',
			},
		},
		{
			name: 'urls',
			scope: ['markup.underline.link'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'tags',
			scope: ['entity.name.tag'],
			settings: {
				foreground: '#0F7E32',
			},
		},
		{
			name: 'jsxTags',
			scope: ['support.class.component'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'attributes',
			scope: ['entity.other.attribute-name', 'meta.attribute'],
			settings: {
				foreground: '#7D00CC',
			},
		},
		{
			name: 'types',
			scope: ['support.type'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'constants',
			scope: ['variable.other.constant', 'variable.readonly'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'labels',
			scope: ['entity.name.label', 'punctuation.definition.label'],
			settings: {
				foreground: '#1B9E97',
			},
		},
		{
			name: 'namespaces',
			scope: ['entity.name.namespace', 'storage.modifier.namespace', 'markup.bold.markdown'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'modules',
			scope: ['entity.name.module', 'storage.modifier.module'],
			settings: {
				foreground: '#AF3029',
			},
		},
		{
			name: 'typeParameters',
			scope: ['variable.type.parameter', 'variable.parameter.type'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'exceptions',
			scope: ['keyword.control.exception', 'keyword.control.trycatch'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'decorators',
			scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'calls',
			scope: ['variable.function'],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'punctuation',
			scope: [
				'punctuation',
				'punctuation.terminator',
				'punctuation.definition.tag',
				'punctuation.separator',
				'punctuation.definition.string',
				'punctuation.section.block',
			],
			settings: {
				foreground: '#171717',
			},
		},
		{
			name: 'yellow',
			scope: [
				'storage.type.numeric.go',
				'storage.type.byte.go',
				'storage.type.boolean.go',
				'storage.type.string.go',
				'storage.type.uintptr.go',
				'storage.type.error.go',
				'storage.type.rune.go',
				'constant.language.go',
				'support.class.dart',
				'keyword.other.documentation',
				'storage.modifier.import.java',
				'punctuation.definition.list.begin.markdown',
				'punctuation.definition.quote.begin.markdown',
				'meta.separator.markdown',
				'entity.name.section.markdown',
			],
			settings: {
				foreground: '#B38F00',
			},
		},
		{
			name: 'green',
			scope: [],
			settings: {
				foreground: '#1B9E97',
			},
		},
		{
			name: 'cyan',
			scope: [
				'markup.italic.markdown',
				'support.type.python',
				'variable.legacy.builtin.python',
				'support.constant.property-value.css',
				'storage.modifier.attribute.swift',
			],
			settings: {
				foreground: '#1B9E97',
			},
		},
		{
			name: 'blue',
			scope: ['constant.language.boolean.json'],
			settings: {
				foreground: '#0060F1',
			},
		},
		{
			name: 'purple',
			scope: ['keyword.channel.go', 'keyword.other.platform.os.swift'],
			settings: {
				foreground: '#7D00CC',
			},
		},
		{
			name: 'magenta',
			scope: ['punctuation.definition.heading.markdown', 'support.type.property-name'],
			settings: {
				foreground: '#C31562',
			},
		},
		{
			name: 'red',
			scope: [],
			settings: {
				foreground: '#AF3029',
			},
		},
		{
			name: 'orange',
			scope: [],
			settings: {
				foreground: '#C55D17',
			},
		},
	],
};

export default light;
