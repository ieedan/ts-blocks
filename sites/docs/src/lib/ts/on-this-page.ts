import { context } from './context-provider';

type Heading = {
	rank: 2 | 3 | 4 | 5 | 6;
	el: HTMLHeadingElement;
	children: Heading[];
};

type PageMap = {
	/** Only used on mount */
	curr?: {
		path: string;
		headings: Heading[];
	};
	headings: Map<string, Heading[]>;
};

export const onThisPage = context<PageMap>('on-this-page');
