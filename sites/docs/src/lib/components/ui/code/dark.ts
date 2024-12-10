/*
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-10-2024
*/

// Source: https://github.com/Railly/one-hunter-vscode/blob/main/themes/Vercel2024-Dark-color-theme.json
import type { ThemeInput } from 'shiki';

const dark: ThemeInput = {
	name: 'vercel-dark',
	type: 'dark',
	colors: {
		'editor.background': '#000000',
		'editor.foreground': '#EDEDED',
		'editor.hoverHighlightBackground': '#212121',
		'editor.lineHighlightBackground': '#0D0D0D',
		'editor.selectionBackground': '#EDEDED33',
		'editor.selectionHighlightBackground': '#EDEDED33',
		'editor.findMatchBackground': '#B38F00',
		'editor.findMatchHighlightBackground': '#B38F00cc',
		'editor.findRangeHighlightBackground': '#0D0D0D',
		'editor.inactiveSelectionBackground': '#171717',
		'editor.lineHighlightBorder': '#171717',
		'editor.rangeHighlightBackground': '#2B2B2B',
		'notifications.background': '#171717',
		'editorInlayHint.typeBackground': '#212121',
		'editorInlayHint.typeForeground': '#EDEDED',
		'editorWhitespace.foreground': '#2B2B2B',
		'editorIndentGuide.background1': '#212121',
		'editorHoverWidget.background': '#171717',
		'editorLineNumber.activeForeground': '#EDEDED',
		'editorLineNumber.foreground': '#2B2B2B',
		'editorGutter.background': '#000000',
		'editorGutter.modifiedBackground': '#4CC0BA',
		'editorGutter.addedBackground': '#00CA51',
		'editorGutter.deletedBackground': '#D14D41',
		'editorBracketMatch.background': '#171717',
		'editorBracketMatch.border': '#212121',
		'editorError.foreground': '#D14D41',
		'editorWarning.foreground': '#F27F35',
		'editorInfo.foreground': '#47A8FF',
		'diffEditor.insertedTextBackground': '#0F7E3255',
		'diffEditor.removedTextBackground': '#AF302955',
		'editorGroupHeader.tabsBackground': '#000000',
		'editorGroup.border': '#212121',
		'tab.activeBackground': '#000000',
		'tab.inactiveBackground': '#0D0D0D',
		'tab.inactiveForeground': '#A3A3A3',
		'tab.activeForeground': '#EDEDED',
		'tab.hoverBackground': '#212121',
		'tab.unfocusedHoverBackground': '#212121',
		'tab.border': '#212121',
		'tab.activeModifiedBorder': '#E5B800',
		'tab.inactiveModifiedBorder': '#47A8FF',
		'tab.unfocusedActiveModifiedBorder': '#B38F00',
		'tab.unfocusedInactiveModifiedBorder': '#0060F1',
		'editorWidget.background': '#0D0D0D',
		'editorWidget.border': '#212121',
		'editorSuggestWidget.background': '#000000',
		'editorSuggestWidget.border': '#212121',
		'editorSuggestWidget.foreground': '#EDEDED',
		'editorSuggestWidget.highlightForeground': '#A3A3A3',
		'editorSuggestWidget.selectedBackground': '#212121',
		'peekView.border': '#212121',
		'peekViewEditor.background': '#000000',
		'peekViewEditor.matchHighlightBackground': '#2B2B2B',
		'peekViewResult.background': '#0D0D0D',
		'peekViewResult.fileForeground': '#EDEDED',
		'peekViewResult.lineForeground': '#A3A3A3',
		'peekViewResult.matchHighlightBackground': '#2B2B2B',
		'peekViewResult.selectionBackground': '#171717',
		'peekViewResult.selectionForeground': '#8F8F8F',
		'peekViewTitle.background': '#212121',
		'peekViewTitleDescription.foreground': '#A3A3A3',
		'peekViewTitleLabel.foreground': '#EDEDED',
		'merge.currentHeaderBackground': '#00CA51',
		'merge.currentContentBackground': '#0F7E32',
		'merge.incomingHeaderBackground': '#4CC0BA',
		'merge.incomingContentBackground': '#1B9E97',
		'merge.border': '#212121',
		'merge.commonContentBackground': '#2B2B2B',
		'merge.commonHeaderBackground': '#212121',
		'panel.background': '#000000',
		'panel.border': '#212121',
		'panelTitle.activeBorder': '#2B2B2B',
		'panelTitle.activeForeground': '#EDEDED',
		'panelTitle.inactiveForeground': '#A3A3A3',
		'statusBar.background': '#000000',
		'statusBar.foreground': '#EDEDED',
		'statusBar.border': '#212121',
		'statusBar.debuggingBackground': '#D14D41',
		'statusBar.debuggingForeground': '#EDEDED',
		'statusBar.noFolderBackground': '#2B2B2B',
		'statusBar.noFolderForeground': '#8F8F8F',
		'titleBar.activeBackground': '#000000',
		'titleBar.activeForeground': '#EDEDED',
		'titleBar.inactiveBackground': '#0D0D0D',
		'titleBar.inactiveForeground': '#A3A3A3',
		'titleBar.border': '#212121',
		'menu.foreground': '#EDEDED',
		'menu.background': '#000000',
		'menu.selectionForeground': '#EDEDED',
		'menu.selectionBackground': '#212121',
		'menu.border': '#212121',
		'editorInlayHint.foreground': '#A3A3A3',
		'editorInlayHint.background': '#212121',
		'terminal.foreground': '#EDEDED',
		'terminal.background': '#000000',
		'terminalCursor.foreground': '#EDEDED',
		'terminalCursor.background': '#000000',
		'terminal.ansiRed': '#D14D41',
		'terminal.ansiGreen': '#00CA51',
		'terminal.ansiYellow': '#E5B800',
		'terminal.ansiBlue': '#47A8FF',
		'terminal.ansiMagenta': '#4CC0BA',
		'terminal.ansiCyan': '#4CC0BA',
		'activityBar.background': '#000000',
		'activityBar.foreground': '#EDEDED',
		'activityBar.inactiveForeground': '#A3A3A3',
		'activityBar.activeBorder': '#EDEDED',
		'activityBar.border': '#212121',
		'sideBar.background': '#000000',
		'sideBar.foreground': '#EDEDED',
		'sideBar.border': '#212121',
		'sideBarTitle.foreground': '#EDEDED',
		'sideBarSectionHeader.background': '#0D0D0D',
		'sideBarSectionHeader.foreground': '#EDEDED',
		'sideBarSectionHeader.border': '#212121',
		'sideBar.activeBackground': '#2B2B2B',
		'sideBar.activeForeground': '#EDEDED',
		'sideBar.hoverBackground': '#212121',
		'sideBar.hoverForeground': '#A3A3A3',
		'sideBar.folderIcon.foreground': '#00CA51',
		'sideBar.fileIcon.foreground': '#47A8FF',
		'list.warningForeground': '#F27F35',
		'list.errorForeground': '#D14D41',
		'list.inactiveSelectionBackground': '#212121',
		'list.activeSelectionBackground': '#2B2B2B',
		'list.inactiveSelectionForeground': '#EDEDED',
		'list.activeSelectionForeground': '#EDEDED',
		'list.hoverForeground': '#EDEDED',
		'list.hoverBackground': '#212121',
		'input.background': '#0D0D0D',
		'input.foreground': '#EDEDED',
		'input.border': '#212121',
		'input.placeholderForeground': '#A3A3A3',
		'inputOption.activeBorder': '#212121',
		'inputOption.activeBackground': '#171717',
		'inputOption.activeForeground': '#EDEDED',
		'inputValidation.infoBackground': '#47A8FF',
		'inputValidation.infoBorder': '#0060F1',
		'inputValidation.warningBackground': '#F27F35',
		'inputValidation.warningBorder': '#C55D17',
		'inputValidation.errorBackground': '#D14D41',
		'inputValidation.errorBorder': '#AF3029',
		'dropdown.background': '#0D0D0D',
		'dropdown.foreground': '#EDEDED',
		'dropdown.border': '#212121',
		'dropdown.listBackground': '#000000',
		'badge.background': '#47A8FF',
		'activityBarBadge.background': '#47A8FF',
		'button.background': '#47A8FF',
		'button.foreground': '#000000',
		'badge.foreground': '#000000',
		'activityBarBadge.foreground': '#000000'
	},
	tokenColors: [
		{
			name: 'plain',
			scope: ['source', 'support.type.property-name.css'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'classes',
			scope: ['entity.name.type.class'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'interfaces',
			scope: ['entity.name.type.interface', 'entity.name.type'],
			settings: {
				foreground: '#C372FC'
			}
		},
		{
			name: 'structs',
			scope: ['entity.name.type.struct'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'enums',
			scope: ['entity.name.type.enum'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'keys',
			scope: ['meta.object-literal.key'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'methods',
			scope: ['entity.name.function.method', 'meta.function.method'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'functions',
			scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
			settings: {
				foreground: '#C372FC'
			}
		},
		{
			name: 'variables',
			scope: [
				'variable',
				'meta.variable',
				'variable.other.object.property',
				'variable.other.readwrite.alias'
			],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'variablesOther',
			scope: ['variable.other.object'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'globalVariables',
			scope: ['variable.other.global', 'variable.language.this'],
			settings: {
				foreground: '#4CC0BA'
			}
		},
		{
			name: 'localVariables',
			scope: ['variable.other.local'],
			settings: {
				foreground: '#171717'
			}
		},
		{
			name: 'parameters',
			scope: ['variable.parameter', 'meta.parameter'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'properties',
			scope: ['variable.other.property', 'meta.property'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'strings',
			scope: ['string', 'string.other.link', 'markup.inline.raw.string.markdown'],
			settings: {
				foreground: '#00CA51'
			}
		},
		{
			name: 'stringEscapeSequences',
			scope: ['constant.character.escape', 'constant.other.placeholder'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'keywords',
			scope: ['keyword'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'keywordsControl',
			scope: ['keyword.control.import', 'keyword.control.from', 'keyword.import'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'storageModifiers',
			scope: ['storage.modifier', 'keyword.modifier', 'storage.type'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'comments',
			scope: ['comment', 'punctuation.definition.comment'],
			settings: {
				foreground: '#A3A3A3'
			}
		},
		{
			name: 'docComments',
			scope: ['comment.documentation', 'comment.line.documentation'],
			settings: {
				foreground: '#A3A3A3'
			}
		},
		{
			name: 'numbers',
			scope: ['constant.numeric'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'booleans',
			scope: ['constant.language.boolean', 'constant.language.json'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'operators',
			scope: ['keyword.operator'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'macros',
			scope: ['entity.name.function.preprocessor', 'meta.preprocessor'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'preprocessor',
			scope: ['meta.preprocessor'],
			settings: {
				foreground: '#4CC0BA'
			}
		},
		{
			name: 'urls',
			scope: ['markup.underline.link'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'tags',
			scope: ['entity.name.tag'],
			settings: {
				foreground: '#00CA51'
			}
		},
		{
			name: 'jsxTags',
			scope: ['support.class.component'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'attributes',
			scope: ['entity.other.attribute-name', 'meta.attribute'],
			settings: {
				foreground: '#C372FC'
			}
		},
		{
			name: 'types',
			scope: ['support.type'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'constants',
			scope: ['variable.other.constant', 'variable.readonly'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'labels',
			scope: ['entity.name.label', 'punctuation.definition.label'],
			settings: {
				foreground: '#4CC0BA'
			}
		},
		{
			name: 'namespaces',
			scope: ['entity.name.namespace', 'storage.modifier.namespace', 'markup.bold.markdown'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'modules',
			scope: ['entity.name.module', 'storage.modifier.module'],
			settings: {
				foreground: '#D14D41'
			}
		},
		{
			name: 'typeParameters',
			scope: ['variable.type.parameter', 'variable.parameter.type'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'exceptions',
			scope: ['keyword.control.exception', 'keyword.control.trycatch'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'decorators',
			scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'calls',
			scope: ['variable.function'],
			settings: {
				foreground: '#EDEDED'
			}
		},
		{
			name: 'punctuation',
			scope: [
				'punctuation',
				'punctuation.terminator',
				'punctuation.definition.tag',
				'punctuation.separator',
				'punctuation.definition.string',
				'punctuation.section.block'
			],
			settings: {
				foreground: '#EDEDED'
			}
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
				'entity.name.section.markdown'
			],
			settings: {
				foreground: '#E5B800'
			}
		},
		{
			name: 'green',
			scope: [],
			settings: {
				foreground: '#4CC0BA'
			}
		},
		{
			name: 'cyan',
			scope: [
				'markup.italic.markdown',
				'support.type.python',
				'variable.legacy.builtin.python',
				'support.constant.property-value.css',
				'storage.modifier.attribute.swift'
			],
			settings: {
				foreground: '#4CC0BA'
			}
		},
		{
			name: 'blue',
			scope: ['constant.language.boolean.json'],
			settings: {
				foreground: '#47A8FF'
			}
		},
		{
			name: 'purple',
			scope: ['keyword.channel.go', 'keyword.other.platform.os.swift'],
			settings: {
				foreground: '#C372FC'
			}
		},
		{
			name: 'magenta',
			scope: ['punctuation.definition.heading.markdown', 'support.type.property-name'],
			settings: {
				foreground: '#FF4C8D'
			}
		},
		{
			name: 'red',
			scope: [],
			settings: {
				foreground: '#D14D41'
			}
		},
		{
			name: 'orange',
			scope: [],
			settings: {
				foreground: '#F27F35'
			}
		}
	]
};

export default dark;
