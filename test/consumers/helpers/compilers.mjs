// Compiles consumer code the way TypeScript and Babel do for ts-jest, babel-jest and CommonJS builds, and type-checks it.
import { join } from "node:path";
import ts from "typescript";
import babel from "@babel/core";
import transformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import { runFile, write } from "./project.mjs";

/**
 * Compile consumer code to CommonJS with TypeScript and run it.
 * @param {string} dir - the project folder
 * @param {string} name - output name
 * @param {string} source - consumer code
 * @param {boolean} esModuleInterop - the compiler option
 * @returns {Object} what the code printed, or { error }
 */
export function viaTypeScript(dir, name, source, esModuleInterop) {
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop } }).outputText;
    const file = join(dir, "out", "typescript", name + ".cjs");
    write(file, output);
    return runFile(dir, file);
}

/**
 * Compile consumer code to CommonJS with Babel and run it.
 * @param {string} dir - the project folder
 * @param {string} name - output name
 * @param {string} source - consumer code
 * @returns {Object} what the code printed, or { error }
 */
export function viaBabel(dir, name, source) {
    const output = babel.transformSync(source, { babelrc: false, configFile: false, plugins: [transformModulesCommonjs] }).code;
    const file = join(dir, "out", "babel", name + ".cjs");
    write(file, output);
    return runFile(dir, file);
}

/**
 * Type-check consumer code against the package's declarations.
 * @param {string} dir - the project folder
 * @param {string} fileName - file name; .mts and .cts pick the module format under Node16 resolution
 * @param {string} source - consumer code
 * @param {Object} compilerOptions - TypeScript compiler options
 * @returns {string[]} the compiler's messages, empty when the code compiles
 */
export function typeCheck(dir, fileName, source, compilerOptions) {
    const file = join(dir, "types", fileName);
    write(file, source);
    const program = ts.createProgram([file], Object.assign({ noEmit: true, strict: true, types: [] }, compilerOptions));
    return ts.getPreEmitDiagnostics(program).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

export { ts };
