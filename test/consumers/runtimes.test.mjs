// What server-side and script runtimes give code that imports or requires the SDK, with what each one gives today:
// Node, Deno (a project with package.json and node_modules) and Bun.
// Setup: npm ci --prefix test/consumers; Deno and Bun on PATH. Run: npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { BOTH, DEFAULT_ONLY, DIRECT_PROBE, ENTRIES, ONE_WORKING_COPY, PROBE, SAME_COPY_PROBE, createProject, removeProject, runFile, writeEntry } from "./helpers/project.mjs";
import { viaBun, viaDeno } from "./helpers/tools.mjs";

let dir;
before(() => {
    dir = createProject("runtimes");
});
after(() => removeProject(dir));

describe("Node", () => {
    test("default import from an ES module", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/default.mjs", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("namespace import from an ES module: the SDK is its default export", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/namespace.mjs", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test("named import from an ES module fails", () => {
        assert.match(runFile(dir, writeEntry(dir, "node/named.mjs", ENTRIES.namedImport + PROBE)).error, /Named export 'init' not found|does not provide an export named 'init'/);
    });

    test("require()", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/require.cjs", ENTRIES.require + PROBE)), BOTH);
    });

    test("require() of lib/countly.min.js", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/deep.cjs", ENTRIES.deepRequire + PROBE)), BOTH);
    });

    test("require() without the file extension", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/deep-no-extension.cjs", ENTRIES.deepRequireNoExtension + PROBE)), BOTH);
    });

    test("an ES module's import and a CommonJS dependency's require() share one copy", () => {
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/same-copy.mjs", SAME_COPY_PROBE)), ONE_WORKING_COPY);
    });

    test("the SDK object require() hands out, once initialized, can be passed to JSON.stringify", () => {
        const code = "const exported = require(\"countly-sdk-web\");\nconst C = exported.init ? exported : exported.default;\n" +
            "C.init({ app_key: \"NODE_APP_KEY\", url: \"https://node.example\", fake_request_handler: () => ({ status: 200, responseText: \"{\\\"result\\\":\\\"Success\\\"}\" }) });\n" +
            "let serializable = true;\ntry { JSON.stringify(C); } catch (e) { serializable = false; }\n" +
            "const result = { serializable, defaultListed: Object.keys(C).indexOf(\"default\") !== -1 };\nC.halt();\n" +
            "process.stdout.write(JSON.stringify(result) + \"\\n\", () => process.exit(0));\n";
        assert.deepEqual(runFile(dir, writeEntry(dir, "node/serialize.cjs", code)), { serializable: true, defaultListed: false });
    });
});

describe("Deno, in a project with package.json and node_modules", () => {
    test("default import", () => {
        assert.deepEqual(viaDeno(dir, writeEntry(dir, "deno/default.mjs", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("namespace import: the SDK is its default export", () => {
        assert.deepEqual(viaDeno(dir, writeEntry(dir, "deno/namespace.mjs", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test("require() from a CommonJS file", () => {
        assert.deepEqual(viaDeno(dir, writeEntry(dir, "deno/require.cjs", ENTRIES.require + PROBE)), BOTH);
    });
});

describe("Bun", () => {
    test("default import", () => {
        assert.deepEqual(viaBun(dir, writeEntry(dir, "bun/default.mjs", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("namespace import, passed on as an object", () => {
        assert.deepEqual(viaBun(dir, writeEntry(dir, "bun/namespace.mjs", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test("namespace import, its methods called on it directly", () => {
        assert.deepEqual(viaBun(dir, writeEntry(dir, "bun/namespace-direct.mjs", ENTRIES.namespaceImport + DIRECT_PROBE)), DEFAULT_ONLY);
    });

    test("require()", () => {
        assert.deepEqual(viaBun(dir, writeEntry(dir, "bun/require.cjs", ENTRIES.require + PROBE)), BOTH);
    });
});
