/** Adds the `padWith` (default `' '`) to the string the amount of times specified by the `space` argument
 *
 * @param str String to add padding to
 * @param space Whitespace to add
 * @param padWith Character to use to pad the string
 * @returns
 *
 * ## Usage
 * ```ts
 * const padded = leftPad("Hello", 3, ".");
 *
 * console.log(padded); // '...Hello'
 * ```
 */
const leftPad = (str: string, space: number, padWith = ' ') => {
	return padWith.repeat(space) + str;
};

/** Adds the `padWith` (default `' '`) to the string the amount of times specified by the `space` argument
 *
 * @param str String to add padding to
 * @param space Whitespace to add
 * @param padWith Character to use to pad the string
 * @returns
 *
 * ## Usage
 * ```ts
 * const padded = rightPad("Hello", 3, ".");
 *
 * console.log(padded); // 'Hello...'
 * ```
 */
const rightPad = (str: string, space: number, padWith = ' ') => {
	return str + padWith.repeat(space);
};

export { leftPad, rightPad };
