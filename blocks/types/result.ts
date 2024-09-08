/** A result option that contains a tuple with val and err.
 *
 * `T` Value on success
 *
 * `E` Value on failure
 *
 * ## Examples
 * ```ts
 * const functionThatCanFail = (): Result<number, string> => {}
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

/** A helper method for the `Result<T, E>` type to allow you to pattern match on a Result and requires you to handle all cases.
 *
 * @param res The result
 * @param success Function to be called if the result is `Ok`
 * @param failure Function to be called if the result is `Err`
 * @returns
 *
 * ## Examples
 *
 * ```ts
 * const functionThatCanFail = (): Result<number, string> => {
 *  return Ok(10);
 * };
 *
 * const value = match(
 * 	functionThatCanFail(),
 * 	(val) => val,
 * 	(err) => {
 * 		throw new Error(err);
 * 	}
 * );
 *
 * console.log(value) // 10
 * ```
 */
const match = <T, V, E>(res: Result<V, E>, success: (val: V) => T, failure: (err: E) => T): T => {
	const [val, err] = res;

	if (err !== null) {
		return failure(err);
	}

	// we know this matches because of the typing of Result
	return success(val as V);
};

/** Tries to return the value if it can't it will throw.
 *
 * @param res The result
 * @returns
 *
 * ## Examples
 * ```ts
 * const functionThatCanFail = () => {
 *   return Ok(10);
 * }
 *
 * const value = unwrap(functionThatCanFail());
 *
 * console.log(value) // 10
 * ```
 */
const unwrap = <T, E>(res: Result<T, E>): T => {
	const [val, err] = res;

	if (err !== null) {
		throw new Error(JSON.stringify(err));
	}

	return val as T;
};

export { type Result, Ok, Err, match, unwrap };
