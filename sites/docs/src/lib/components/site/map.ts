export type Category = {
	name: string;
	routes: Route[];
};

export type Route = {
	name: string;
	href: string;
	activeForSubdirectories?: boolean;
	hide?: boolean;
	routes?: Route[];
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
			},
			{
				name: 'Demos',
				href: '/demos'
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
				href: '/docs/setup',
				activeForSubdirectories: true,
				routes: [
					{
						name: 'Project Setup',
						href: '/docs/setup/project'
					},
					{
						name: 'Registry Setup',
						href: '/docs/setup/registry'
					}
				]
			},
			{
				name: 'jsrepo.json',
				href: '/docs/jsrepo-json'
			},
			{
				name: 'CLI',
				href: '/docs/cli'
			},
			{
				name: 'Language Support',
				href: '/docs/language-support'
			},
			{
				name: 'Git Providers',
				href: '/docs/git-providers',
				activeForSubdirectories: true
			},
			{
				name: 'Private Repositories',
				href: '/docs/private-repositories'
			},
			{
				name: 'Badges',
				href: '/docs/badges'
			},
			{
				name: 'About',
				href: '/docs/about'
			}
		]
	}
];

export { categories };
