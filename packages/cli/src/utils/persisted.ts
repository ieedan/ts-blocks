import Conf from 'conf';
import type { CLIContext } from './context';

const create = (context: CLIContext) => {
	return new Conf({ projectName: `${context.package.name}` });
};

export { create };
