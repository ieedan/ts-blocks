/** Allows you to time operations. */
export type Stopwatch = {
	/** Start the stopwatch.
	 *
	 * @returns
	 *
	 * # Usage
	 *
	 * ```ts
	 * const w = stopwatch();
	 *
	 * w.start(); // start counting
	 * ```
	 */
	start: () => void;
	/** Stop the stopwatch.
	 *
	 * @returns
	 *
	 * # Usage
	 *
	 * ```ts
	 * const w = stopwatch();
	 *
	 * w.start();
	 *
	 * await sleep(1000);
	 *
	 * w.stop(); // stop counting
	 *
	 * await sleep(1000);
	 *
	 * console.log(w.elapsed()); // 1000
	 * ```
	 */
	stop: () => void;
	/** Reset the stopwatch.
	 *
	 * @returns
	 *
	 * # Usage
	 *
	 * ```ts
	 * const w = stopwatch();
	 *
	 * w.start();
	 *
	 * w.stop();
	 *
	 * w.reset();
	 *
	 * w.elapsed(); // Error: "Call `.start()` first!"
	 * ```
	 */
	reset: () => void;
	/** Tries to get the elapsed ms. Throws if the Stopwatch has not been started.
	 *
	 * @returns
	 *
	 * # Usage
	 *
	 * ```ts
	 * const w = watch();
	 *
	 * w.start();
	 *
	 * await sleep(1000);
	 *
	 * // you don't have to call stop before accessing `.elapsed()`
	 * console.log(w.elapsed()); // 1000
	 * ```
	 */
	elapsed: () => number;
};

/** Creates a new stopwatch instance.
 *
 * @returns
 *
 * # Usage
 * ```ts
 * const w = stopwatch();
 *
 * w.start();
 *
 * await sleep(1000);
 *
 * console.log(w.elapsed()); // 1000
 * ```
 */
const stopwatch = (): Stopwatch => {
	let startedAt: number | undefined = undefined;
	let endedAt: number | undefined = undefined;

	return {
		start: () => {
			startedAt = Date.now();
		},
		stop: () => {
			endedAt = Date.now();
		},
		elapsed: () => {
			// if this hasn't been defined its always an error in the users code
			if (!startedAt) {
				throw new Error('Call `.start()` first!');
			}

			let tempEndedAt = endedAt;

			// if the user hasn't called stop just give them the current time
			if (!tempEndedAt) {
				tempEndedAt = Date.now();
			}

			return tempEndedAt - startedAt;
		},
		reset: () => {
			endedAt = undefined;
			startedAt = undefined;
		},
	};
};

export { stopwatch };
