const getWatermark = (version: string): string => {
	return `/* 
	ts-blocks ${version} 
	https://github.com/ieedan/ts-blocks
*/

`;
};

export { getWatermark };
