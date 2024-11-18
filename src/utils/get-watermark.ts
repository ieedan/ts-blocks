const getWatermark = (version: string, repoUrl: string): string => {
	return `\tjsrepo ${version}\n\tInstalled from ${repoUrl}\n\t${new Date()
		.toLocaleDateString()
		.replaceAll('/', '-')}`;
};

export { getWatermark };
