import Conf from 'conf';

const create = () => {
	return new Conf({ projectName: 'jsrepo' });
};

export { create };
