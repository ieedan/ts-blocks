import color from "chalk";
import { log } from "$logging/logger";

const print = (str: string) => log(color.cyan(str));

export { print };
