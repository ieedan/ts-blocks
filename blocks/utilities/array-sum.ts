/** Calculates the sum of all elements in the array based on the provided function.
 *
 * @param arr Array of items to be summed.
 * @param fn Summing function
 * @returns
 */
const arraySum = <T>(arr: T[], fn: (item: T) => number): number => {
	let total = 0;

	for (const item of arr) {
		total = total + fn(item);
	}

	return total;
};

export { arraySum };
