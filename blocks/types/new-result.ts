// THIS IS A DRAFT

type _Result<T, E> = [val: T, err: null] | [val: null, err: E];

export class Result<T, E> {
	result: _Result<T, E>;

	constructor(result: _Result<T, E>) {
		this.result = result;
	}

	match<A, B = A>(success: (val: T) => A, failure: (err: E) => B): A | B {
		const [val, err] = this.result;

		if (err != null) {
			return failure(err);
		}

		// TS is unfortunately not smart enough to figure this out
		return success(val as T);
	}

	unwrap(): T {
		const [val, err] = this.result;

		if (err != null) throw new Error(err.toString());

		// TS is unfortunately not smart enough to figure this out
		return val as T;
	}

	isOk(): boolean {
		const [_, err] = this.result;

		if (err != null) return false;

		return true;
	}

	isErr(): boolean {
		const [_, err] = this.result;

		if (err == null) return true;

		return false;
	}

	expect(message: string): T {
		const [val, err] = this.result;

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

const functionThatCanFail = (): Result<number, string> => {
	return Ok(10);
};

const res = functionThatCanFail();

res.isOk();

const value = res.match(
	(val) => val,
	(_) => {
		throw new Error("oops");
	}
);

console.log(value);
