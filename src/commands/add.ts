import { Command } from "commander";

const add = new Command("add").argument("block", "Whichever block you want to add to your project.");

export { add }