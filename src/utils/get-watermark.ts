const getWatermark = (version: string, repoUrl: string): string => {
	return `/* 
	ts-blocks ${version} 
	Installed from ${repoUrl}
	${new Date().toLocaleDateString().replaceAll('/', '-')}
*/

`;
};

export { getWatermark };
