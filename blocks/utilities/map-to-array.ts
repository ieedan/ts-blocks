/** Maps the provided map into an array using the provided mapping function.
 *
 * @param map Map to be entered into an array
 * @param fn A mapping function to transform each pair into an item
 * @returns
 */
const mapToArray = <K, V, T>(map: Map<K, V>, fn: (key: K, value: V) => T): T[] => {
	const items: T[] = [];

	for (const [key, value] of map) {
		items.push(fn(key, value));
	}

	return items;
};

export { mapToArray };
