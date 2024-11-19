import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export type Context<T> = {
	init: (value: T) => Writable<T>;
	initWritable: (value: Writable<T>) => Writable<T>;
	get: () => Writable<T>;
};

export const context = <T>(key: string): Context<T> => {
	return {
		init: (value) => setContext(key, writable(value)),
		initWritable: (store) => setContext(key, store),
		get: () => getContext(key)
	};
};
