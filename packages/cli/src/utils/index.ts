import color from 'chalk';

export const OUTPUT_FILE = 'jsrepo-manifest.json';

const WARN = color.bgRgb(245, 149, 66).white('WARN');

const INFO = color.bgBlueBright.white('INFO');

const LEFT_BORDER = color.gray('│');

export { WARN, INFO, LEFT_BORDER };
