/** Calculates the sum of all elements in the array based on the provided function.
 *
 * @param arr Array of items to be summed.
 * @param fn Summing function
 * @returns
 *
 * ## Examples
 *
 * ```ts
 * const total = arraySum([1, 2, 3, 4, 5], (num) => num);
 *
 * console.log(total); // 15
 * ```
 */
const arraySum = <T>(arr: T[], fn: (item: T) => number): number => {
	let total = 0;

	for (const item of arr) {
		total = total + fn(item);
	}

	return total;
};

export { arraySum };
