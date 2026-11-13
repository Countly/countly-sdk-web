// The public API of the SDK as text: the functions an initialized SDK has, and one line for each declaration in its
// TypeScript definitions. api/countly-sdk-web.api keeps that text, and the API tests fail when the SDK no longer
// matches it. countly-sdk-web gets a copy of this file from npm run sync:web, as test/consumers/helpers/api-report.mjs.
import { appendFileSync } from "node:fs";
import ts from "typescript";

/**
 * The public functions of the SDK, nested ones as "object.function". The SDK is initialized first, because some
 * functions only exist after init, and halted afterwards.
 * @param {Object} Countly - the SDK, not initialized
 * @returns {string[]} names, sorted
 */
export function publicFunctions(Countly) {
    Countly.init({ app_key: "api-surface", url: "https://api-surface.example" });
    const names = [];
    for (const key of Object.keys(Countly)) {
        const value = Countly[key];
        if (key.charAt(0) === "_" || key === "CountlyClass" || key === "i") {
            continue;
        }
        if (typeof value === "function") {
            names.push(key);
        }
        else if (value && typeof value === "object" && !Array.isArray(value)) {
            Object.keys(value).filter((inner) => typeof value[inner] === "function").forEach((inner) => names.push(key + "." + inner));
        }
    }
    Countly.halt();
    return names.sort();
}

/**
 * One line for each declaration in TypeScript definitions: its qualified name, then the declaration without comments
 * on one line. Members of interfaces and enums get lines of their own, enum members with their position, which gives
 * a member without an initializer its value. The lines are sorted, so moving a declaration within its namespace does
 * not change them.
 * @param {string} source - content of a .d.ts file
 * @returns {string[]} lines, sorted
 */
export function declarationLines(source) {
    const file = ts.createSourceFile("definitions.d.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ removeComments: true });
    const print = (node) => printer.printNode(ts.EmitHint.Unspecified, node, file).replace(/\s+/g, " ").trim();
    const qualified = (path, name) => (path ? path + "." + name : name);
    const lines = [];
    const visit = (node, path) => {
        if (ts.isModuleDeclaration(node)) {
            const name = ts.isStringLiteral(node.name) ? JSON.stringify(node.name.text) : node.name.text;
            lines.push(qualified(path, name) + ": " + (ts.isStringLiteral(node.name) ? "module" : "namespace"));
            if (node.body && ts.isModuleBlock(node.body)) {
                node.body.statements.forEach((statement) => visit(statement, qualified(path, name)));
            }
        }
        else if (ts.isInterfaceDeclaration(node)) {
            const name = qualified(path, node.name.text);
            lines.push(name + ": " + print(ts.factory.updateInterfaceDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, [])));
            node.members.forEach((member) => lines.push(qualified(name, member.name ? member.name.getText(file) : "(signature)") + ": " + print(member)));
        }
        else if (ts.isEnumDeclaration(node)) {
            const name = qualified(path, node.name.text);
            lines.push(name + ": " + print(ts.factory.updateEnumDeclaration(node, node.modifiers, node.name, [])));
            node.members.forEach((member, index) => lines.push(qualified(name, member.name.getText(file)) + ": " + print(member) + " (position " + index + ")"));
        }
        else if (ts.isVariableStatement(node)) {
            lines.push(qualified(path, node.declarationList.declarations.map((d) => d.name.getText(file)).join(", ")) + ": " + print(node));
        }
        else {
            const name = node.name ? node.name.getText(file) : (ts.isExportAssignment(node) ? "default" : ts.SyntaxKind[node.kind]);
            lines.push(qualified(path, name) + ": " + print(node));
        }
    };
    file.statements.forEach((statement) => visit(statement, ""));
    return lines.sort();
}

/**
 * The content of api/countly-sdk-web.api for the SDK's public functions and its TypeScript definitions.
 * @param {string[]} functions - the SDK's public functions, as publicFunctions gives them
 * @param {string} definitions - content of the SDK's .d.ts file
 * @returns {string} file content
 */
export function apiReport(functions, definitions) {
    return [
        "// The public API of the Countly Web SDK. CI fails when the SDK no longer matches this file.",
        "// countly-sdk-js writes it with npm run api:update and copies it to countly-sdk-web with npm run sync:web.",
        "// A change here needs a CHANGELOG.md line that tells integrators what changed.",
        "",
        "// Functions of an initialized SDK",
        ...functions,
        "",
        "// Declarations in the TypeScript definitions",
        ...declarationLines(definitions),
        ""
    ].join("\n");
}

/**
 * The lines only one of two API texts has: "- line" for a line the committed file has and the SDK lacks, "+ line" for
 * the other way round.
 * @param {string} committed - content of the API file
 * @param {string} current - the API text of the SDK as it is
 * @returns {string[]} lines, the removed ones first
 */
export function apiDifference(committed, current) {
    const only = (lines, others) => {
        const left = new Map();
        others.forEach((line) => left.set(line, (left.get(line) || 0) + 1));
        return lines.filter((line) => {
            const count = left.get(line) || 0;
            left.set(line, count - 1);
            return count <= 0;
        });
    };
    const was = committed.replace(/\r\n/g, "\n").split("\n");
    const now = current.split("\n");
    return only(was, now).map((line) => "- " + line).concat(only(now, was).map((line) => "+ " + line));
}

/**
 * The difference apiDifference gives, for people: first the lines the SDK no longer has, which break integrators who
 * use them, then the lines only the SDK has, which are new or the new form of a changed line.
 * @param {string[]} difference - lines as apiDifference gives them
 * @returns {string} the report, empty when nothing differs
 */
export function differenceReport(difference) {
    const removed = difference.filter((line) => line.startsWith("- "));
    const added = difference.filter((line) => line.startsWith("+ "));
    const parts = [];
    if (removed.length) {
        parts.push("Removed or changed, which breaks integrators who use it (start the CHANGELOG.md line with \"! Minor Breaking Change !\"):", ...removed);
    }
    if (added.length) {
        parts.push("New, or the new form of a changed line:", ...added);
    }
    return parts.join("\n");
}

/**
 * Adds a section to the summary of the GitHub Actions job running this, which the pull request's checks show. Outside
 * GitHub Actions it does nothing.
 * @param {string} title - heading of the section
 * @param {string} text - lines to show as they are
 */
export function addToJobSummary(title, text) {
    const summary = process.env.GITHUB_STEP_SUMMARY;
    if (summary) {
        appendFileSync(summary, "### " + title + "\n```\n" + text + "\n```\n");
    }
}
