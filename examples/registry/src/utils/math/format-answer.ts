import { print } from "../pretty-print"

const format = (answer: number) => `answer was ${print(answer.toString())}`;

export { format }