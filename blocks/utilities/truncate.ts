type Options = {
	/** Reverses the truncate direction */
	reverse: boolean;
	/** A string appended to the end (forward) or beginning (reverse) */
	ending: string;
};

/** Truncates the provided string to fit in the max character length if it truncates it will add the `ending` to the start or end of the string
 *
 * @param str String to be truncated
 * @param maxLength Max length of the string
 * @param param2
 * @returns
 *
 * ## Examples
 * ```ts
 * const str = truncate('Hello World!', 5, { ending: '...' });
 *
 * console.log(str); // 'hello...'
 * ```
 *
 * ### Reverse
 * ```ts
 * const str = truncate('Hello World!', 6, { ending: '...', reverse: true });
 *
 * console.log(str); // '...World!'
 * ```
 */
const truncate = (
	str: string,
	maxLength: number,
	{ reverse = false, ending = '' }: Partial<Options> = { reverse: false, ending: '' }
) => {
	if (str.length <= maxLength) return str;

	if (reverse) {
		return `${ending}${str.slice(str.length - maxLength)}`;
	}

	return `${str.slice(0, maxLength)}${ending}`;
};

export { truncate };
