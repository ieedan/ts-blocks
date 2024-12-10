/*
	jsrepo 1.18.0
	Installed from github/ieedan/shadcn-svelte-extras
	12-10-2024
*/

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
