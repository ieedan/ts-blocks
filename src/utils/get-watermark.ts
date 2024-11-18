const getWatermark = (version: string, repoUrl: string): string => {
	return `\tts-blocks ${version}\n\tInstalled from ${repoUrl}\n\t${new Date()
		.toLocaleDateString()
		.replaceAll('/', '-')}`;
};

export { getWatermark };
