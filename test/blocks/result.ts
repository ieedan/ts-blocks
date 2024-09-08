/** A result option that contains a tuple with val and err.
 *
 * `T` Value on success
 *
 * `E` Value on failure
 *
 * ## Examples
 * ```ts
 * const functionThatCanFail = (): Result<number, string> => {
 *      //...
 * }
 *
 * const [val, err] = functionThatCanFail();
 *
 * if (err == null) {
 *      // err is now `string` instead of `string | null`
 *      console.error(err);
 * }
 *
 * // val is now `number` instead of `number | null`
 * doSomethingWithVal(val);
 * ```
 *
 */
type Result<T, E> = [val: T, err: null] | [val: null, err: E];

/** A helper method for the `Result<T,E>` type to allow you to easily return a successful result from a function.
 *
 * @param val Success value
 * @returns
 */
const Ok = <T>(val: T): Result<T, never> => [val, null];

/** A helper method for the `Result<T,E>` type to allow you to easily return an error result from a function.
 *
 * @param err Error value
 * @returns
 */
const Err = <E>(err: E): Result<never, E> => [null, err];

export { type Result, Ok, Err };
