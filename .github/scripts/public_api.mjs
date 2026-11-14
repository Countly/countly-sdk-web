// Prints the public surface of a JavaScript SDK module as sorted "<path> <kind>" lines, so two versions can be compared.
// Usage: node public_api.mjs <module file> <name>=<expression> [<name>=<expression> ...]
// Each expression is evaluated with `sdk` bound to the module's export and is listed under its name, for example
// Countly=sdk or Instance='new sdk.CountlyClass({ app_key: "key", url: "https://example.invalid" })'.
import { writeSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const MAX_DEPTH = 4;

/**
 * Returns the kind printed for a value: its typeof, with null and arrays told apart.
 * @param {*} value the value to describe
 * @returns {string} "null", "array" or the typeof of the value
 */
function kindOf(value) {
    if (value === null) {
        return "null";
    }
    return Array.isArray(value) ? "array" : typeof value;
}

/**
 * Adds a line for the value at path and, for objects and functions, for each public member below it.
 * Names that start with an underscore are private by convention and skipped, and array elements are data.
 * @param {*} value the value to describe
 * @param {string} path the dotted path that reaches the value
 * @param {string[]} lines the lines collected so far
 * @param {WeakSet<object>} seen the objects already described, so cycles end
 * @param {number} depth how many members deep the value is
 */
function describe(value, path, lines, seen, depth) {
    const kind = kindOf(value);
    lines.push(`${path} ${kind}`);
    if ((kind !== "object" && kind !== "function") || depth >= MAX_DEPTH || seen.has(value)) {
        return;
    }
    seen.add(value);
    for (const key of Object.keys(value)) {
        if (!key.startsWith("_")) {
            describe(value[key], `${path}.${key}`, lines, seen, depth + 1);
        }
    }
    if (kind === "function" && value.prototype) {
        for (const key of Object.getOwnPropertyNames(value.prototype)) {
            if (key !== "constructor" && !key.startsWith("_")) {
                lines.push(`${path}.prototype.${key} ${kindOf(value.prototype[key])}`);
            }
        }
    }
}

const [modulePath, ...roots] = process.argv.slice(2);
if (!modulePath || roots.length === 0) {
    console.error("Usage: node public_api.mjs <module file> <name>=<expression> [...]");
    process.exit(2);
}
const loaded = await import(pathToFileURL(resolve(modulePath)).href);
const sdk = loaded.default ?? loaded;
const lines = [];
for (const root of roots) {
    const separator = root.indexOf("=");
    const name = root.slice(0, separator);
    const value = new Function("sdk", `return (${root.slice(separator + 1)});`)(sdk);
    describe(value, name, lines, new WeakSet(), 0);
}
// A synchronous write, because the exit below would cut off an asynchronous write to a pipe.
writeSync(1, [...new Set(lines)].sort().join("\n") + "\n");
// The SDK may have started timers (an instance's heartbeat, for example), so the process ends here.
process.exit(0);
