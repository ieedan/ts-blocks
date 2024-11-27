const getWatermark = (version: string, repoUrl: string): string => {
	return `jsrepo ${version}\nInstalled from ${repoUrl}\n${new Date()
		.toLocaleDateString()
		.replaceAll('/', '-')}`;
};

export { getWatermark };
