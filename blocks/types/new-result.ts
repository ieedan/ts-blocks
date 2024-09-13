type _Result<T, E> = [val: T, err: null] | [val: null, err: E];

/** Result allows you to show to a consumer that a function might throw and force them to handle it.
 * 
 *  `T` Value type
 * 
 *  `E` Error type
 * 
 * 	## Examples
 * 
 * ```ts
 * const functionThatMightThrow = (): Result<string, string> => Ok("Hello, World!");
 * 
 * const result = functionThatMightThrow();
 * 
 * console.log(result.unwrap()); // "Hello, World!"
 * ```
 */
class Result<T, E> {
	private _result: _Result<T, E>;

	constructor(result: _Result<T, E>) {
		this._result = result;
	}

	/** Allows you to run callbacks based on the result.
	 * 
	 * @param success callback to be run when result is success
	 * @param failure callback to be run when result is failure
	 * @returns 
	 * 
	 * ## Examples
	 * 
	 */
	match<A, B = A>(success: (val: T) => A, failure: (err: E) => B): A | B {
		const [val, err] = this._result;

		if (err != null) {
			return failure(err);
		}

		// TS is unfortunately not smart enough to figure this out
		return success(val as T);
	}
	map<A>(fn: (val: T) => A): Result<A, E> {
		return this.match(
			(val) => Ok(fn(val)),
			(err) => Err(err)
		);
	}

	mapOr<A>(defaultVal: A, fn: (val: T) => A): A {
		return this.match(
			(val) => fn(val),
			(_) => defaultVal
		);
	}

	mapErr<A>(fn: (err: E) => A): Result<T, A> {
		return this.match(
			(val) => Ok(val),
			(err) => Err(fn(err))
		);
	}

	mapErrOr<A>(defaultVal: A, fn: (err: E) => A): A {
		return this.match(
			(_) => defaultVal,
			(err) => fn(err)
		);
	}

	isOk(): boolean {
		const [_, err] = this._result;

		if (err != null) return false;

		return true;
	}

	isErr(): boolean {
		const [_, err] = this._result;

		if (err == null) return true;

		return false;
	}

	unwrap(): T {
		const [val, err] = this._result;

		if (err != null) throw new Error(err.toString());

		// TS is unfortunately not smart enough to figure this out
		return val as T;
	}

	unwrapOr(defaultVal: T): T {
		return this.match(
			(val) => val,
			(_) => defaultVal
		);
	}

	expectErr(message: string): E {
		const [_, err] = this._result;

		if (err == null) throw new Error(message);

		return err;
	}

	expect(message: string): T {
		const [val, err] = this._result;

		if (err != null) throw new Error(message);

		// TS is unfortunately not smart enough to figure this out
		return val as T;
	}
}

export const Ok = <T>(val: T): Result<T, never> => {
	return new Result<T, never>([val, null]);
};

export const Err = <E>(err: E): Result<never, E> => {
	return new Result<never, E>([null, err]);
};