/** Await this to pause execution until the duration has passed.
 *
 * @param durationMs The duration in ms until the sleep in over
 * @returns
 *
 * ## Example
 * ```ts
 * console.log(Date.now()) // 1725739228744
 *
 * await sleep(1000);
 *
 * console.log(Date.now()) // 1725739229744
 * ```
 */
const sleep = async (durationMs: number): Promise<void> =>
	new Promise((res) => setTimeout(res, durationMs));

export { sleep };
