import { print } from "../pretty-print/print"

const format = (answer: number) => `answer was ${print(answer.toString())}`;

export { format }