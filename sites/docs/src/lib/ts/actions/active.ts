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
	/** Pass the `$page.url` store here */
	url: URL;
};

/** Sets the `data-active` attribute on an `<a/>` tag based on its 'active' state. */
export const active = (node: HTMLAnchorElement, opts: Options) => {
	node.setAttribute('data-active', checkIsActive(node.href, opts).toString());

	return {
		destroy: () => {},

		update: (opts: Options) => {
			node.setAttribute('data-active', checkIsActive(node.href, opts).toString());
		}
	};
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
