import { intro, spinner } from '@clack/prompts';
import color from 'chalk';
import { rightPad, rightPadMin } from './blocks/utils/pad';
import { stripAsni } from './blocks/utils/strip-ansi';
import * as ascii from './ascii';

export type Task = {
	loadingMessage: string;
	completedMessage: string;
	run: () => Promise<void>;
};

const runTasks = async (tasks: Task[], { verbose = false }) => {
	const loading = spinner();

	for (const task of tasks) {
		// we don't want this to clear logs when in verbose mode
		if (!verbose) loading.start(task.loadingMessage);

		try {
			await task.run();
		} catch (err) {
			console.error(err);
		}

		if (!verbose) loading.stop(task.completedMessage);
	}
};

const nextSteps = (steps: string[]): string => {
	let max = 20;
	steps.map((val) => {
		const reset = rightPad(stripAsni(val), 4);

		if (reset.length > max) max = reset.length;
	});

	const NEXT_STEPS = 'Next Steps';

	let result = `${ascii.VERTICAL_LINE}\n`;

	// top
	result += `${ascii.JUNCTION_RIGHT}  ${NEXT_STEPS} ${ascii.HORIZONTAL_LINE.repeat(
		max - NEXT_STEPS.length - 1
	)}${ascii.TOP_RIGHT_CORNER}\n`;

	result += `${ascii.VERTICAL_LINE} ${' '.repeat(max)} ${ascii.VERTICAL_LINE}\n`;

	steps.map((step) => {
		result += `${ascii.VERTICAL_LINE}  ${rightPadMin(step, max - 1)} ${ascii.VERTICAL_LINE}\n`;
	});

	result += `${ascii.VERTICAL_LINE} ${' '.repeat(max)} ${ascii.VERTICAL_LINE}\n`;

	// bottom
	result += `${ascii.JUNCTION_RIGHT}${ascii.HORIZONTAL_LINE.repeat(max + 2)}${ascii.BOTTOM_RIGHT_CORNER}\n`;

	return result;
};

const _intro = (version: string) =>
	intro(`${color.bgHex('#f7df1e').black(' jsrepo ')}${color.gray(` v${version} `)}`);

export { runTasks, nextSteps, _intro as intro };
