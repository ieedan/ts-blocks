export type Category = {
	name: string;
	routes: Route[];
};

export type Route = {
	name: string;
	href: string;
};

const categories: Category[] = [
	{
		name: 'routes',
		routes: [
			{
				name: 'Home',
				href: '/'
			},
			{
				name: 'Docs',
				href: '/docs'
			}
		]
	},
	{
		name: 'Getting Started',
		routes: [
			{
				name: 'Introduction',
				href: '/docs'
			},
			{
				name: 'Setup',
				href: '/docs/setup'
			},
			{
				name: 'CLI',
				href: '/docs/cli'
			}
		]
	}
];

export { categories };
