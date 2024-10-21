export type ListenerCallback<T = undefined> = T extends undefined ? () => void : (opts: T) => void;

/** Simplifies adding event listeners to your code.
 *
 * ## Examples
 *
 * ```ts
 * import { newDispatcher } from "./src/blocks/dispatcher";
 *
 * const dispatcher = newDispatcher();
 *
 * let count = 0;
 *
 * dispatcher.addListener(() => { count += 2; });
 *
 * dispatcher.emit();
 *
 * console.log(count); // 2
 *
 * dispatcher.addListener(() => { count += 4; });
 *
 * dispatcher.emit();
 *
 * console.log(count); // 8
 * ```
 *
 * ### Typed Options
 *
 * ```ts
 * import { newDispatcher } from "./src/blocks/dispatcher";
 *
 * const dispatcher = newDispatcher<string>();
 *
 * dispatcher.addListener((name) => { console.log(`Hello ${name}!`) });
 *
 * dispatcher.emit("John"); // 'Hello John!'
 * ```
 */
export type Dispatcher<T = undefined> = {
	/** Adds an event listener
	 *
	 * @param callback
	 * @returns
	 *
	 * ## Usage
	 *
	 * ```ts
	 * const listenerId = dispatcher.addListener(() => { ... });
	 * ```
	 */
	addListener: (callback: ListenerCallback<T>) => number;
	/** Removes an event listener
	 *
	 * @param id
	 * @returns
	 *
	 * ## Usage
	 *
	 * ```ts
	 * dispatcher.removeListener(listenerId);
	 * ```
	 */
	removeListener: (id: number) => void;
	/** Emits an event to all listeners with the provided options.
	 *
	 * @param opts Options to be passed to the listener
	 * @returns `void`
	 *
	 * ## Usage
	 *
	 * ```ts
	 * dispatcher.emit();
	 * ```
	 *
	 */
	emit: T extends undefined ? () => void : (opts: T) => void;
	/** Removes all event listeners from the dispatcher.
	 *
	 * @returns
	 *
	 * ## Usage
	 *
	 * ```ts
	 * dispatcher.removeAllListeners();
	 * ```
	 */
	removeAllListeners: () => void;
};

/** Create a new dispatcher instance.
 *
 * @returns
 *
 * ## Usage
 *
 * ```ts
 * const dispatcher = newDispatcher();
 * ```
 */
const newDispatcher = <T = undefined>(): Dispatcher<T> => {
	let nextListenerId = 0;
	const listeners = new Map<number, ListenerCallback<T>>();

	return {
		addListener: (callback) => {
			nextListenerId++;
			listeners.set(nextListenerId, callback);
			return nextListenerId;
		},
		removeListener: (listenerId: number) => listeners.delete(listenerId),
		emit: ((opts?: T) => {
			for (const [_, callback] of listeners) {
				if (opts === undefined) {
					(callback as ListenerCallback<undefined>)();
				} else {
					callback(opts);
				}
			}
		}) as Dispatcher<T>['emit'],
		removeAllListeners: () => {
			listeners.clear();
			nextListenerId = 0;
		},
	};
};

export { newDispatcher };
