/** Maps the provided array into a map
 *
 * @param arr Array of items to be entered into a map
 * @param fn A mapping function to transform each item into a key value pair
 * @returns
 *
 * ## Example
 * ```ts
 * const map = arrayToMap([5, 4, 3, 2, 1], (item, i) => [i, item]);
 *
 * console.log(map); // Map(5) { 0 => 5, 1 => 4, 2 => 3, 3 => 2, 4 => 1 }
 * ```
 */
const arrayToMap = <T, K, V>(
	arr: T[],
	fn: (item: T, index: number) => [key: K, value: V]
): Map<K, V> => {
	const map = new Map<K, V>();

	for (let i = 0; i < arr.length; i++) {
		const [key, value] = fn(arr[i], i);

		map.set(key, value);
	}

	return map;
};

export { arrayToMap };
