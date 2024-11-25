import Conf from 'conf';

const get = () => {
	return new Conf({ projectName: 'jsrepo' });
};

export { get };
