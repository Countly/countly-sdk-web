// In each request scenario, lib/countly.js and lib/countly.min.js send the requests api/requests/<scenario>.json records,
// with the values that change from run to run masked. The SDK files and the records come from countly-sdk-js through its
// npm run sync:web, so a deliberate change is made there.
// Setup: npm ci --prefix test/consumers. Run: npm run test:consumers
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { packageDir, testsDir } from "./helpers/project.mjs";
import { apiDifference } from "./helpers/api-report.mjs";
import { SCENARIOS } from "./helpers/request-scenarios.mjs";

const helper = join(testsDir, "helpers", "request-scenarios.mjs");
const requestsDir = resolve(testsDir, "..", "..", "api", "requests");
const reports = {};

/**
 * The request records of every scenario for a bundle, worked out once in a separate Node process, because the SDK's
 * timers would keep this one running.
 * @param {string} bundle - file name in lib/
 * @returns {Object} file content by scenario name
 */
function reportsOf(bundle) {
    if (!reports[bundle]) {
        const code = "import { createRequire } from \"node:module\";\n" +
            "import { SCENARIOS, requestsReport, scenarioRequests } from " + JSON.stringify(pathToFileURL(helper).href) + ";\n" +
            "const exported = createRequire(" + JSON.stringify(helper) + ")(" + JSON.stringify(join(packageDir, "lib", bundle)) + ");\n" +
            "const C = exported.init ? exported : exported.default;\n" +
            "const reports = {};\n" +
            "for (const name of Object.keys(SCENARIOS)) {\n    reports[name] = requestsReport(await scenarioRequests(C, name));\n}\n" +
            "process.stdout.write(\"\\n\" + JSON.stringify(reports) + \"\\n\", () => process.exit(0));\n";
        const result = spawnSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8" });
        assert.equal(result.status, 0, result.stderr);
        reports[bundle] = JSON.parse(result.stdout.trim().split("\n").pop());
    }
    return reports[bundle];
}

for (const bundle of ["countly.js", "countly.min.js"]) {
    for (const name of Object.keys(SCENARIOS)) {
        test("lib/" + bundle + " sends the requests of the " + name + " scenario that api/requests/" + name + ".json records", () => {
            const file = join(requestsDir, name + ".json");
            const message = "the requests of the " + name + " scenario differ from api/requests/" + name + ".json. The SDK files and the records come from countly-sdk-js: " +
                "make the change there, run npm run api:update and npm run sync:web, and add a CHANGELOG.md line";
            assert.ok(existsSync(file), "no " + file + ", run npm run sync:web in countly-sdk-js");
            const current = reportsOf(bundle)[name];
            const committed = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
            assert.deepEqual(apiDifference(committed, current), [], message);
            assert.equal(current, committed, message);
        });
    }
}
