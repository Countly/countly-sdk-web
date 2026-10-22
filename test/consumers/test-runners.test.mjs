// What a site's own unit tests receive when they import the SDK under Jest (jsdom, babel-jest) or Vitest (happy-dom),
// with what each gives today.
// Setup: npm ci --prefix test/consumers. Run: npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { BOTH, ENTRIES, createProject, removeProject } from "./helpers/project.mjs";
import { viaJest, viaVitest } from "./helpers/tools.mjs";

let dir;
before(() => {
    dir = createProject("test-runners");
});
after(() => removeProject(dir));

describe("Jest 30 with jsdom and babel-jest", () => {
    test("default import", () => {
        assert.deepEqual(viaJest(dir, "default", ENTRIES.defaultImport), BOTH);
    });

    test("namespace import", () => {
        assert.deepEqual(viaJest(dir, "namespace", ENTRIES.namespaceImport), BOTH);
    });

    test("require()", () => {
        assert.deepEqual(viaJest(dir, "require", ENTRIES.require), BOTH);
    });
});

describe("Vitest 5 with happy-dom", () => {
    test("default import", () => {
        assert.deepEqual(viaVitest(dir, "vitest", ENTRIES.defaultImport), BOTH);
    });

    test("default import in a \"type\": \"module\" project, as create-vite sets up", () => {
        assert.deepEqual(viaVitest(dir, "type-module/vitest", ENTRIES.defaultImport), BOTH);
    });

    test("namespace import", () => {
        assert.deepEqual(viaVitest(dir, "vitest-namespace", ENTRIES.namespaceImport), BOTH);
    });
});
