import color from "chalk"

const print = (str: string) => console.log(color.cyan(str));

export { print }