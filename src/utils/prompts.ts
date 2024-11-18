import { spinner } from '@clack/prompts';
import color from 'chalk';
import { rightPad, rightPadMin } from '../blocks/utilities/pad';
import { stripAsni } from '../blocks/utilities/strip-ansi';

const VERTICAL_BORDER = color.gray('│');
const HORIZONTAL_BORDER = color.gray('─');
const TOP_RIGHT_CORNER = color.gray('┐');
const BOTTOM_RIGHT_CORNER = color.gray('┘');
const JUNCTION_RIGHT = color.gray('├');
// we may need these eventually
// const TOP_LEFT_CORNER = color.gray("┌");
// const BOTTOM_LEFT_CORNER = color.gray("└");

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

	let result = `${VERTICAL_BORDER}\n`;

	// top
	result += `${JUNCTION_RIGHT}  ${NEXT_STEPS} ${HORIZONTAL_BORDER.repeat(
		max - NEXT_STEPS.length - 1
	)}${TOP_RIGHT_CORNER}\n`;

	result += `${VERTICAL_BORDER} ${' '.repeat(max)} ${VERTICAL_BORDER}\n`;

	steps.map((step) => {
		result += `${VERTICAL_BORDER}  ${rightPadMin(step, max - 1)} ${VERTICAL_BORDER}\n`;
	});

	result += `${VERTICAL_BORDER} ${' '.repeat(max)} ${VERTICAL_BORDER}\n`;

	// bottom
	result += `${JUNCTION_RIGHT}${HORIZONTAL_BORDER.repeat(max + 2)}${BOTTOM_RIGHT_CORNER}\n`;

	return result;
};

export { runTasks, nextSteps };
