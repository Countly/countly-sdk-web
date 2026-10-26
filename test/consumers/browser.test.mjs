// What a page gets when it loads the SDK in a real browser without a bundler (script tags, the async snippet, module
// scripts, import maps, workers, an AMD loader) or through Vite's dev server, with what each one gives today.
// Setup: npm ci --prefix test/consumers; Google Chrome installed (or CHROME_PATH). Run: npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { BOTH, ENTRIES, PAGE_PROBE, WORKER_PROBE, createProject, removeProject, serveFolder, toolFile, write } from "./helpers/project.mjs";
import { bundleWithEsbuild, bundleWithWebpack, startViteDevServer } from "./helpers/bundlers.mjs";
import { startBrowser, stopBrowser, visit } from "./helpers/browser.mjs";

const SDK = "/node_modules/countly-sdk-web/lib/";
const REPORT_ERRORS = "<script>window.addEventListener(\"error\", function (e) { window.__countlyResult = { error: e.message }; });</script>\n";

let dir;
let server;
before(async () => {
    dir = createProject("browser");
    copyFileSync(toolFile("requirejs/require.js"), join(dir, "require.js"));
    await startBrowser();
    server = await serveFolder(dir);
});
after(async () => {
    try {
        if (server) {
            await server.close();
        }
        await stopBrowser();
    }
    finally {
        removeProject(dir);
    }
});

/**
 * Write a page into the project and open it.
 * @param {string} name - file name, such as script-tag.html
 * @param {string} body - the page's body
 * @returns {Promise<Object>} result and errors, as visit() gives them
 */
async function page(name, body) {
    write(join(dir, "pages", name), "<!doctype html>\n<html><head><meta charset=\"utf-8\"></head><body>\n" + body + "</body></html>\n");
    return visit(server.url + "/pages/" + name);
}

/**
 * The URL path the test server serves a project file at.
 * @param {string} file - absolute path inside the project
 * @returns {string} the path
 */
function urlPath(file) {
    return "/" + relative(dir, file).split(sep).join("/");
}

describe("classic script: a CDN script tag, a self-hosted copy", () => {
    for (const file of ["countly.js", "countly.min.js"]) {
        test(file + " defines the global Countly", async () => {
            const { result } = await page("script-tag-" + file + ".html", "<script src=\"" + SDK + file + "\"></script>\n<script>\nvar C = window.Countly;\n" +
                "var serializable = true;\ntry { JSON.stringify(C); } catch (e) { serializable = false; }\n" +
                "window.__countlyResult = { init: typeof C.init === \"function\", viaDefault: typeof (C.default && C.default.init) === \"function\", " +
                "esModuleFlag: C.__esModule === true, defaultListed: Object.keys(C).indexOf(\"default\") !== -1, serializable: serializable };\n</script>\n");
            assert.deepEqual(result, { init: true, viaDefault: true, esModuleFlag: true, defaultListed: false, serializable: true });
        });
    }

    test("the async snippet: its stub stays the global object, keeps its queue, and init() takes the stub's app_key", async () => {
        const { result } = await page("async-snippet.html", "<script>\nvar queue = [[\"add_event\", { key: \"queued_before_load\" }]];\n" +
            "var Countly = Countly || {};\nCountly.q = queue;\nCountly.app_key = \"PRESET_APP_KEY\";\nCountly.url = location.origin;\nvar stub = Countly;\n" +
            "(function () {\n    var cly = document.createElement(\"script\");\n    cly.type = \"text/javascript\";\n    cly.async = true;\n    cly.src = \"" + SDK + "countly.min.js\";\n" +
            "    cly.onload = function () {\n        var loaded = { sameObject: window.Countly === stub, sameQueue: window.Countly.q === queue, init: typeof Countly.init === \"function\" };\n" +
            "        Countly.init();\n        loaded.instances = Object.keys(Countly.i || {});\n        Countly.halt();\n        window.__countlyResult = loaded;\n    };\n" +
            "    var s = document.getElementsByTagName(\"script\")[0];\n    s.parentNode.insertBefore(cly, s);\n})();\n</script>\n");
        assert.deepEqual(result, { sameObject: true, sameQueue: true, init: true, instances: ["PRESET_APP_KEY"] });
    });

    test("the Boomerang APM plugin, loaded after the SDK, adds track_performance", async () => {
        const { result } = await page("boomerang.html", "<script src=\"" + SDK + "countly.min.js\"></script>\n" +
            "<script src=\"/node_modules/countly-sdk-web/plugin/boomerang/countly_boomerang.js\"></script>\n" +
            "<script>window.__countlyResult = { trackPerformance: typeof Countly.CountlyClass.prototype.track_performance === \"function\" };</script>\n");
        assert.deepEqual(result, { trackPerformance: true });
    });
});

describe("ES module in the browser, no bundler", () => {
    test("a module script cannot take a default export from lib/countly.js", async () => {
        const { result } = await page("module-default.html", REPORT_ERRORS + "<script type=\"module\">\nimport C from \"" + SDK + "countly.js\";\n" + PAGE_PROBE + "</script>\n");
        assert.match(result.error, /does not provide an export named 'default'/);
    });

    test("a module script that imports lib/countly.js for its side effect gets the global Countly", async () => {
        const { result } = await page("module-side-effect.html", REPORT_ERRORS + "<script type=\"module\">\nimport \"" + SDK + "countly.js\";\nconst C = window.Countly;\n" + PAGE_PROBE + "</script>\n");
        assert.deepEqual(result, BOTH);
    });

    const importMap = "<script type=\"importmap\">{ \"imports\": { \"countly-sdk-web\": \"" + SDK + "countly.js\" } }</script>\n";

    test("an import map naming countly-sdk-web: the default import fails", async () => {
        const { result } = await page("import-map-default.html", importMap + REPORT_ERRORS + "<script type=\"module\">\n" + ENTRIES.defaultImport + PAGE_PROBE + "</script>\n");
        assert.match(result.error, /does not provide an export named 'default'/);
    });

    test("an import map naming countly-sdk-web: importing it for its side effect gives the global Countly", async () => {
        const { result } = await page("import-map-side-effect.html", importMap + REPORT_ERRORS + "<script type=\"module\">\nimport \"countly-sdk-web\";\nconst C = window.Countly;\n" + PAGE_PROBE + "</script>\n");
        assert.deepEqual(result, BOTH);
    });
});

describe("web workers", () => {
    /**
     * Start a worker from a page and report the message it posts, or its error.
     * @param {string} name - the page's name
     * @param {string} workerFile - the worker script, relative to the project
     * @param {string} code - the worker's code
     * @param {boolean} module - start it as a module worker
     * @returns {Promise<Object>} what the page reported
     */
    async function worker(name, workerFile, code, module) {
        write(join(dir, workerFile), code);
        return (await page(name, "<script>\nvar w = new Worker(\"/" + workerFile + "\"" + (module ? ", { type: \"module\" }" : "") + ");\n" +
            "w.onmessage = function (e) { window.__countlyResult = e.data; };\nw.onerror = function (e) { window.__countlyResult = { error: e.message || \"worker failed to start\" }; };\n</script>\n")).result;
    }

    test("a classic worker loads lib/countly.min.js with importScripts and gets the global Countly", async () => {
        assert.deepEqual(await worker("classic-worker.html", "workers/classic.js", "importScripts(\"" + SDK + "countly.min.js\");\nvar C = self.Countly;\n" + WORKER_PROBE, false), BOTH);
    });

    test("a module worker that imports lib/countly.js for its side effect gets the global Countly", async () => {
        assert.deepEqual(await worker("module-worker-side-effect.html", "workers/module-side-effect.mjs", "import \"" + SDK + "countly.js\";\nconst C = self.Countly;\n" + WORKER_PROBE, true), BOTH);
    });

    test("a module worker cannot take a default export from lib/countly.js", async () => {
        const result = await worker("module-worker-default.html", "workers/module-default.mjs", "import C from \"" + SDK + "countly.js\";\n" + WORKER_PROBE, true);
        assert.deepEqual(Object.keys(result), ["error"]);
    });
});

describe("an AMD loader (RequireJS) on the page", () => {
    test("RequireJS loading the SDK as a module hands out the SDK, and no global Countly is created", async () => {
        const { result } = await page("requirejs-module.html", "<script src=\"/require.js\"></script>\n<script>\n" +
            "requirejs.onError = function (err) { window.__countlyResult = { error: err.requireType + \": \" + err.message }; };\n" +
            "requirejs.config({ paths: { countly: \"" + SDK + "countly\" } });\nrequire([\"countly\"], function (C) {\n" + PAGE_PROBE +
            "window.__countlyResult.globalCreated = typeof window.Countly !== \"undefined\";\n});\n</script>\n");
        assert.deepEqual(result, Object.assign({ globalCreated: false }, BOTH));
    });

    test("the async snippet on a page that has RequireJS: the SDK registers with RequireJS and never starts", async () => {
        const { result } = await page("requirejs-snippet.html", "<script src=\"/require.js\"></script>\n<script>\n" +
            "var Countly = Countly || {};\nCountly.q = [];\nCountly.app_key = \"PRESET_APP_KEY\";\nCountly.url = location.origin;\n" +
            "(function () {\n    var cly = document.createElement(\"script\");\n    cly.async = true;\n    cly.src = \"" + SDK + "countly.min.js\";\n" +
            "    cly.onload = function () {\n        var result = { initType: typeof Countly.init };\n        try { Countly.init(); } catch (e) { result.initError = e.message; }\n" +
            "        requirejs.onError = function (err) { result.requireError = err.requireType; window.__countlyResult = result; };\n" +
            "        require([], function () { setTimeout(function () { window.__countlyResult = window.__countlyResult || result; }, 100); });\n    };\n" +
            "    document.head.appendChild(cly);\n})();\n</script>\n");
        assert.deepEqual(result, { initType: "undefined", initError: "Countly.init is not a function", requireError: "mismatch" });
    });
});

describe("two copies of the SDK in one page", () => {
    test("a bundled copy that loads after a script tag copy attaches to the global object and replaces its functions", async () => {
        write(join(dir, "copies", "bundled.js"), ENTRIES.defaultImport + "window.__bundledCountly = C && C.init ? C : C && C.default;\n");
        const bundle = await bundleWithWebpack(dir, "copies/bundled.js");
        const { result } = await page("copies-script-then-bundle.html", "<script src=\"" + SDK + "countly.min.js\"></script>\n<script>window.__initBefore = window.Countly.init;</script>\n" +
            "<script src=\"" + urlPath(bundle) + "\"></script>\n<script>window.__countlyResult = { sameObject: window.__bundledCountly === window.Countly, initReplaced: window.Countly.init !== window.__initBefore };</script>\n");
        assert.deepEqual(result, { sameObject: true, initReplaced: true });
    });

    test("a bundled copy that finds an older copy's global, with a listed Countly.default, hides it", async () => {
        write(join(dir, "copies", "after-older.js"), ENTRIES.defaultImport + "window.__bundledCountly = C && C.init ? C : C && C.default;\n");
        const bundle = await bundleWithWebpack(dir, "copies/after-older.js");
        const { result } = await page("copies-after-older.html", "<script>var Countly = { q: [] };\nCountly.default = Countly;</script>\n<script src=\"" + urlPath(bundle) + "\"></script>\n" +
            "<script>\nvar C = window.Countly;\nvar serializable = true;\ntry { JSON.stringify(C); } catch (e) { serializable = false; }\n" +
            "window.__countlyResult = { sameObject: window.__bundledCountly === C, defaultListed: Object.keys(C).indexOf(\"default\") !== -1, serializable: serializable };\n</script>\n");
        assert.deepEqual(result, { sameObject: true, defaultListed: false, serializable: true });
    });

    test("two bundled copies, with no global Countly, stay separate and create no global", async () => {
        write(join(dir, "copies", "first.js"), ENTRIES.defaultImport + "window.__firstCopy = C && C.init ? C : C && C.default;\n");
        write(join(dir, "copies", "second.js"), ENTRIES.deepImport + "window.__secondCopy = C && C.init ? C : C && C.default;\n");
        const first = await bundleWithWebpack(dir, "copies/first.js");
        const second = await bundleWithEsbuild(dir, "copies/second.js");
        const { result } = await page("copies-two-bundles.html", "<script src=\"" + urlPath(first) + "\"></script>\n<script src=\"" + urlPath(second) + "\"></script>\n" +
            "<script>window.__countlyResult = { separate: window.__firstCopy !== window.__secondCopy, bothWork: typeof window.__firstCopy.init === \"function\" && typeof window.__secondCopy.init === \"function\", globalCreated: typeof window.Countly !== \"undefined\" };</script>\n");
        assert.deepEqual(result, { separate: true, bothWork: true, globalCreated: false });
    });

    test("the SDK as a webpack external: a script tag defines it and the bundle imports it", async () => {
        write(join(dir, "copies", "external.js"), ENTRIES.defaultImport + PAGE_PROBE);
        const bundle = await bundleWithWebpack(dir, "copies/external.js", { externals: { "countly-sdk-web": "Countly" } });
        const { result } = await page("copies-external.html", "<script src=\"" + SDK + "countly.min.js\"></script>\n<script src=\"" + urlPath(bundle) + "\"></script>\n");
        assert.deepEqual(result, BOTH);
    });
});

describe("Vite 8's dev server (npm run dev)", () => {
    /**
     * Run a site with Vite's dev server and report what its main.js set in the browser.
     * @param {string} site - the site folder, relative to the project
     * @returns {Promise<Object>} what the page reported
     */
    async function devSite(site) {
        write(join(dir, site, "index.html"), "<!doctype html><html><body><script type=\"module\" src=\"/main.js\"></script></body></html>\n");
        write(join(dir, site, "main.js"), ENTRIES.defaultImport + PAGE_PROBE);
        const dev = await startViteDevServer(join(dir, site));
        try {
            return (await visit(dev.url + "/")).result;
        }
        finally {
            await dev.close();
        }
    }

    test("default import", async () => {
        assert.deepEqual(await devSite("vite-dev"), BOTH);
    });

    test("default import in a \"type\": \"module\" project, as create-vite sets up", async () => {
        assert.deepEqual(await devSite("type-module/vite-dev"), BOTH);
    });
});
