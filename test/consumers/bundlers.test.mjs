// What a site's code receives when a bundler or build tool hands it the SDK, with what each one gives today.
// A change to how the package is built or described shows up here as the cases whose result moved.
// Setup: npm ci --prefix test/consumers; Bun and Google Chrome on PATH. Run: npm run test:consumers
// Another build: COUNTLY_PACKAGE_DIR=<folder with package.json, lib/ and plugin/> npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { BOTH, DEFAULT_ONLY, DIRECT_PAGE_PROBE, DIRECT_PROBE, ENTRIES, ONE_WORKING_COPY, PAGE_PROBE, PROBE, SAME_COPY_PROBE, createProject, removeProject, serveFolder, write, writeEntry } from "./helpers/project.mjs";
import { buildWithParcel, viaBunBuild, viaEsbuild, viaJsdelivrEsm, viaRollup, viaRspack, viaVite, viaWebpack } from "./helpers/bundlers.mjs";
import { startBrowser, stopBrowser, visit } from "./helpers/browser.mjs";

const NAMESPACE_PASSED_ON = "namespace import, passed on as an object (as window.Countly = Countly does)";
const NAMESPACE_DIRECT = "namespace import, its methods called on it directly";

let dir;
before(() => {
    dir = createProject("bundlers");
});
after(() => removeProject(dir));

for (const [tool, via] of [["webpack", viaWebpack], ["Rspack", viaRspack]]) {
    describe("bundled for the browser with " + tool, () => {
        const folder = tool.toLowerCase();

        test("default import", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/default.js", ENTRIES.defaultImport + PROBE)), BOTH);
        });

        test("default import from a .mjs file", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/default.mjs", ENTRIES.defaultImport + PROBE)), BOTH);
        });

        test("default import in a \"type\": \"module\" project", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, "type-module/" + folder + "-default.js", ENTRIES.defaultImport + PROBE)), BOTH);
        });

        test(NAMESPACE_PASSED_ON, async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/namespace.js", ENTRIES.namespaceImport + PROBE)), BOTH);
        });

        test(NAMESPACE_DIRECT, async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/namespace-direct.js", ENTRIES.namespaceImport + DIRECT_PROBE)), BOTH);
        });

        test("require()", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/require.js", ENTRIES.require + PROBE)), BOTH);
        });

        test("deep import of lib/countly.min.js", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/deep.js", ENTRIES.deepImport + PROBE)), BOTH);
        });

        test("deep import without the file extension", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/deep-no-extension.js", ENTRIES.deepImportNoExtension + PROBE)), BOTH);
        });

        test("the site's import and a CommonJS dependency's require() share one copy", async () => {
            assert.deepEqual(await via(dir, writeEntry(dir, folder + "/same-copy.js", SAME_COPY_PROBE)), ONE_WORKING_COPY);
        });
    });
}

describe("bundled for the browser with esbuild", () => {
    test("default import", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/default.js", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("default import from a .mjs file", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/default.mjs", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("default import in a \"type\": \"module\" project", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "type-module/esbuild-default.js", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test(NAMESPACE_PASSED_ON, async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/namespace.js", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test(NAMESPACE_DIRECT, async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/namespace-direct.js", ENTRIES.namespaceImport + DIRECT_PROBE)), DEFAULT_ONLY);
    });

    test("require()", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/require.js", ENTRIES.require + PROBE)), BOTH);
    });

    test("deep import without the file extension", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/deep-no-extension.js", ENTRIES.deepImportNoExtension + PROBE)), BOTH);
    });

    test("the site's import and a CommonJS dependency's require() share one copy", async () => {
        assert.deepEqual(await viaEsbuild(dir, writeEntry(dir, "esbuild/same-copy.js", SAME_COPY_PROBE)), ONE_WORKING_COPY);
    });
});

describe("bundled for the browser with Bun's bundler", () => {
    test("default import", async () => {
        assert.deepEqual(await viaBunBuild(dir, writeEntry(dir, "bun-build/default.js", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test("default import in a \"type\": \"module\" project", async () => {
        assert.deepEqual(await viaBunBuild(dir, writeEntry(dir, "type-module/bun-build-default.js", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test(NAMESPACE_PASSED_ON, async () => {
        assert.deepEqual(await viaBunBuild(dir, writeEntry(dir, "bun-build/namespace.js", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test(NAMESPACE_DIRECT, async () => {
        assert.deepEqual(await viaBunBuild(dir, writeEntry(dir, "bun-build/namespace-direct.js", ENTRIES.namespaceImport + DIRECT_PROBE)), DEFAULT_ONLY);
    });

    test("require()", async () => {
        assert.deepEqual(await viaBunBuild(dir, writeEntry(dir, "bun-build/require.js", ENTRIES.require + PROBE)), BOTH);
    });
});

describe("bundled for the browser with Rollup (as Vite up to version 7 builds)", () => {
    test("default import", async () => {
        assert.deepEqual(await viaRollup(dir, writeEntry(dir, "rollup/default.js", ENTRIES.defaultImport + PROBE)), BOTH);
    });

    test(NAMESPACE_PASSED_ON, async () => {
        assert.deepEqual(await viaRollup(dir, writeEntry(dir, "rollup/namespace.js", ENTRIES.namespaceImport + PROBE)), DEFAULT_ONLY);
    });

    test(NAMESPACE_DIRECT, async () => {
        assert.deepEqual(await viaRollup(dir, writeEntry(dir, "rollup/namespace-direct.js", ENTRIES.namespaceImport + DIRECT_PROBE)), BOTH);
    });

    test("deep import without the file extension", async () => {
        assert.deepEqual(await viaRollup(dir, writeEntry(dir, "rollup/deep-no-extension.js", ENTRIES.deepImportNoExtension + PROBE)), BOTH);
    });

    test("the site's import and a CommonJS dependency's require() share one copy", async () => {
        assert.deepEqual(await viaRollup(dir, writeEntry(dir, "rollup/same-copy.js", SAME_COPY_PROBE)), ONE_WORKING_COPY);
    });
});

describe("built for the browser with Vite 8 (Rolldown)", () => {
    test("default import", async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite/default.js", ENTRIES.defaultImport + PROBE), false), BOTH);
    });

    test("default import in a \"type\": \"module\" project, as create-vite sets up", async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "type-module/vite-default.js", ENTRIES.defaultImport + PROBE), false), BOTH);
    });

    test(NAMESPACE_PASSED_ON, async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite/namespace.js", ENTRIES.namespaceImport + PROBE), false), DEFAULT_ONLY);
    });

    test(NAMESPACE_DIRECT, async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite/namespace-direct.js", ENTRIES.namespaceImport + DIRECT_PROBE), false), DEFAULT_ONLY);
    });

    test("the site's import and a CommonJS dependency's require() share one copy", async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite/same-copy.js", SAME_COPY_PROBE), false), ONE_WORKING_COPY);
    });
});

describe("built for the browser with Parcel, from the site's index.html", () => {
    let server;
    before(async () => {
        await startBrowser();
        server = await serveFolder(dir);
    });
    after(async () => {
        if (server) {
            await server.close();
        }
        await stopBrowser();
    });

    /**
     * Build a Parcel site whose main.js runs the given code, and report what it set in the browser.
     * @param {string} site - the site folder, relative to the project
     * @param {string} code - main.js
     * @returns {Promise<Object>} what the page reported
     */
    async function parcelSite(site, code) {
        write(join(dir, site, "index.html"), "<!doctype html><html><body><script type=\"module\" src=\"./main.js\"></script></body></html>\n");
        write(join(dir, site, "main.js"), code);
        buildWithParcel(join(dir, site));
        return (await visit(server.url + "/" + site + "/dist/index.html")).result;
    }

    test("default import", async () => {
        assert.deepEqual(await parcelSite("parcel-default", ENTRIES.defaultImport + PAGE_PROBE), BOTH);
    });

    test("default import in a \"type\": \"module\" project", async () => {
        assert.deepEqual(await parcelSite("type-module/parcel-default", ENTRIES.defaultImport + PAGE_PROBE), BOTH);
    });

    test(NAMESPACE_PASSED_ON, async () => {
        assert.deepEqual(await parcelSite("parcel-namespace", ENTRIES.namespaceImport + PAGE_PROBE), BOTH);
    });

    test(NAMESPACE_DIRECT, async () => {
        assert.deepEqual(await parcelSite("parcel-namespace-direct", ENTRIES.namespaceImport + DIRECT_PAGE_PROBE), BOTH);
    });

    test("require()", async () => {
        assert.deepEqual(await parcelSite("parcel-require", ENTRIES.require + PAGE_PROBE), BOTH);
    });
});

describe("ES module from a CDN, no bundler", () => {
    test("jsDelivr's +esm URL: the default export is the SDK", async () => {
        assert.deepEqual(await viaJsdelivrEsm(dir), BOTH);
    });
});
