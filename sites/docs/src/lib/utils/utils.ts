/*
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-10-2024
*/

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
