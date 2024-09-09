import color from 'chalk';
import { add } from './add';
import { init } from './init';

const WARN = color.bgRgb(245, 149, 66).white('WARN');

const INFO = color.bgBlueBright.white('INFO');

export { add, init, WARN, INFO };
