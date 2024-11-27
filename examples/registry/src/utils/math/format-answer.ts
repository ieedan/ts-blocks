import { print } from "../pretty-print/print"
import { add } from "."

const format = (answer: number) => `answer was ${print(answer.toString())}`;

const answerAdd = (a: number, b: number) => {
    format(add(a, b))
}

export { format, answerAdd }