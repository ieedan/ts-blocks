/** Await this to pause execution until the duration has passed.
 *
 * @param duration The duration in ms until the sleep in over
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
const sleep = async (duration: number): Promise<void> =>
	new Promise((res) => setTimeout(res, duration));

export { sleep };
