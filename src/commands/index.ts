import color from 'chalk';
import { add } from './add';
import { init } from './init';
import { test } from './test';

const WARN = color.bgRgb(245, 149, 66).white('WARN');

const INFO = color.bgBlueBright.white('INFO');

export { add, init, test, WARN, INFO };
