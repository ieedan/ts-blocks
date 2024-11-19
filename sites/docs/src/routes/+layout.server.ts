import { Err, Ok, type Result } from '$lib/ts/types/result';

export const load = async () => {
	const version = (await tryGetVersion()).unwrapOr('1.0.0');

	return {
		version
	};
};

const tryGetVersion = async (): Promise<Result<string, string>> => {
	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/ieedan/jsrepo/refs/heads/main/packages/cli/package.json'
		);

		if (!response.ok) {
			return Err('Error getting version');
		}

		const { version } = await response.json();

		return Ok(version);
	} catch (err) {
		return Err(`Error getting version: ${err}`);
	}
};
