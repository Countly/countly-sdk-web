// lib/countly.js, lib/countly.min.js and lib/countly.d.ts have the public API that api/countly-sdk-web.api records.
// All of these files come from countly-sdk-js through its npm run sync:web, so a deliberate API change is made there.
// Setup: npm ci --prefix test/consumers. Run: npm run test:consumers
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { packageDir, testsDir } from "./helpers/project.mjs";
import { addToJobSummary, apiDifference, differenceReport } from "./helpers/api-report.mjs";

const helper = join(testsDir, "helpers", "api-report.mjs");
const apiPath = resolve(testsDir, "..", "..", "api", "countly-sdk-web.api");
const MESSAGE = "the public API differs from api/countly-sdk-web.api. The SDK files and the API file come from countly-sdk-js: " +
    "make the change there, run npm run api:update and npm run sync:web, and add a CHANGELOG.md line";

/**
 * The public API text of a bundle with the TypeScript definitions, worked out in a separate Node process, because the
 * SDK's timers would keep this one running.
 * @param {string} bundle - file name in lib/
 * @returns {string} API text
 */
function apiOf(bundle) {
    const code = "import { createRequire } from \"node:module\";\nimport { readFileSync } from \"node:fs\";\n" +
        "import { apiReport, publicFunctions } from " + JSON.stringify(pathToFileURL(helper).href) + ";\n" +
        "const exported = createRequire(" + JSON.stringify(helper) + ")(" + JSON.stringify(join(packageDir, "lib", bundle)) + ");\n" +
        "const C = exported.init ? exported : exported.default;\n" +
        "const report = apiReport(publicFunctions(C), readFileSync(" + JSON.stringify(join(packageDir, "lib", "countly.d.ts")) + ", \"utf8\"));\n" +
        "process.stdout.write(\"\\n\" + JSON.stringify(report) + \"\\n\", () => process.exit(0));\n";
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout.trim().split("\n").pop());
}

for (const bundle of ["countly.js", "countly.min.js"]) {
    test("lib/" + bundle + " and lib/countly.d.ts have the public API api/countly-sdk-web.api records", () => {
        assert.ok(existsSync(apiPath), "no " + apiPath + ", run npm run sync:web in countly-sdk-js");
        const current = apiOf(bundle);
        const committed = readFileSync(apiPath, "utf8").replace(/\r\n/g, "\n");
        const report = differenceReport(apiDifference(committed, current));
        if (report) {
            addToJobSummary("Public API changes of lib/" + bundle + " against api/countly-sdk-web.api", report);
            assert.fail(MESSAGE + "\n" + report);
        }
        assert.equal(current, committed, MESSAGE);
    });
}
