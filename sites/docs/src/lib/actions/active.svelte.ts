/*
	jsrepo 1.19.1
	Installed from github/ieedan/shadcn-svelte-extras
	12-12-2024
*/

import { get } from 'svelte/store';
import { page } from '$app/stores';

export type Options = {
	/** Determines if the route should be active for subdirectories.
	 *
	 * @default true
	 */
	activeForSubdirectories?: boolean;
	/** Determines if the href of the `<a/>` tag is a `#` route
	 *
	 *  @default false
	 */
	isHash?: boolean;
	url: URL;
};

/** Sets the `data-active` attribute on an `<a/>` tag based on its 'active' state. */
export const active = (node: HTMLAnchorElement, opts: Omit<Options, 'url'>) => {
	checkIsActive(node.href, { ...opts, url: get(page).url }).toString();

	page.subscribe((val) => {
		node.setAttribute(
			'data-active',
			checkIsActive(node.href, { ...opts, url: val.url }).toString()
		);
	});
};

export const checkIsActive = (
	nodeHref: string,
	{ activeForSubdirectories, url, isHash }: Options
): boolean => {
	let href: string = new URL(nodeHref).pathname;

	if (isHash) {
		href = new URL(nodeHref).hash;
	}

	const samePath = href === url.pathname;

	const isParentRoute: boolean =
		(activeForSubdirectories == undefined || activeForSubdirectories) &&
		url.pathname.startsWith(href ?? '');

	const isHashRoute: boolean =
		isHash == true && (url.hash == href || ((href == '#' || href == '#/') && url.hash == ''));

	return samePath || isParentRoute || isHashRoute;
};
