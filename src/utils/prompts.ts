import { spinner } from '@clack/prompts';

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

		loading.stop(task.completedMessage);
	}
};

export { runTasks };
