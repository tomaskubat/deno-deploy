import { red, bold } from "fmt/colors.ts";
import { yellow } from "https://deno.land/std@0.92.0/fmt/colors.ts";


const aaa = 'Hello';
const bbb = 'World';
console.log(yellow(aaa) + ' ' + bold(red(bbb)));