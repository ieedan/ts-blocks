import color from 'chalk';
import type { Change } from 'diff';
import { arraySum } from '../blocks/utilities/array-sum';
import * as lines from '../blocks/utilities/lines';
import { leftPadMin } from '../blocks/utilities/pad';

type Options = {
	/** The source file */
	from: string;
	/** The destination file */
	to: string;
	/** The changes to the file */
	changes: Change[];
	/** Expands all lines to show the entire file */
	expand: boolean;
	/** Maximum lines to show before collapsing */
	maxUnchanged: number;
	/** Color the removed lines */
	colorRemoved?: (line: string) => string;
	/** Color the added lines */
	colorAdded?: (line: string) => string;
	/** Prefixes each line with the string returned from this function. */
	prefix: () => string;
	intro: (options: Options) => string;
	onUnchanged: (options: Options) => string;
};

const formatDiff = ({
	from,
	to,
	changes,
	expand = false,
	maxUnchanged = 5,
	colorRemoved = color.red,
	colorAdded = color.green,
	prefix,
	onUnchanged,
	intro,
}: Options): string => {
	let result = '';

	const length = arraySum(changes, (change) => change.count ?? 0).toString().length + 1;

	let lineOffset = 0;

	if (changes.length === 1 && !changes[0].added && !changes[0].removed) {
		return onUnchanged({
			from,
			to,
			changes,
			expand,
			maxUnchanged,
			colorAdded,
			colorRemoved,
			prefix,
			onUnchanged,
			intro,
		});
	}

	result += intro({
		from,
		to,
		changes,
		expand,
		maxUnchanged,
		colorAdded,
		colorRemoved,
		prefix,
		onUnchanged,
		intro,
	});

	/** Provides the line number prefix */
	const linePrefix = (line: number): string =>
		color.gray(`${prefix?.() ?? ''}${leftPadMin(`${line + 1 + lineOffset} `, length)} `);

	for (let i = 0; i < changes.length; i++) {
		const change = changes[i];

		const hasPreviousChange = changes[i - 1]?.added || changes[i - 1]?.removed;
		const hasNextChange = changes[i + 1]?.added || changes[i + 1]?.removed;

		if (!change.added && !change.removed) {
			// show collapsed
			if (!expand && change.count !== undefined && change.count > maxUnchanged) {
				const prevLineOffset = lineOffset;
				const ls = lines.get(change.value.trimEnd());

				let shownLines = 0;

				if (hasNextChange) shownLines += maxUnchanged;
				if (hasPreviousChange) shownLines += maxUnchanged;

				// just show all if we are going to show more than we have
				if (shownLines >= ls.length) {
					result += `${lines.join(ls, {
						prefix: linePrefix,
					})}\n`;
					lineOffset += ls.length;
					continue;
				}

				// this writes the top few lines
				if (hasPreviousChange) {
					result += `${lines.join(ls.slice(0, maxUnchanged), {
						prefix: linePrefix,
					})}\n`;
				}

				if (ls.length > shownLines) {
					const count = ls.length - shownLines;
					result += `${lines.join(
						lines.get(
							color.gray(
								`+ ${count} more unchanged (${color.italic('-E to expand')})`
							)
						),
						{
							prefix: () => `${prefix?.() ?? ''}${leftPadMin(' ', length)} `,
						}
					)}\n`;
				}

				if (hasNextChange) {
					lineOffset = lineOffset + ls.length - maxUnchanged;
					result += `${lines.join(ls.slice(ls.length - maxUnchanged), {
						prefix: linePrefix,
					})}\n`;
				}

				// resets the line offset
				lineOffset = prevLineOffset + change.count;
				continue;
			}

			// show expanded

			result += `${lines.join(lines.get(change.value.trimEnd()), {
				prefix: linePrefix,
			})}\n`;
			lineOffset += change.count ?? 0;

			continue;
		}

		const colorChange = (change: Change) => {
			if (change.added) {
				return colorAdded(change.value.trimEnd());
			}

			return colorRemoved(change.value.trimEnd());
		};

		result += `${lines.join(lines.get(colorChange(change)), {
			prefix: linePrefix,
		})}\n`;

		if (!change.removed) {
			lineOffset += change.count ?? 0;
		}
	}

	return result;
};

export { formatDiff };
