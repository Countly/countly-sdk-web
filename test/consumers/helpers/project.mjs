// The package under test, throwaway consumer projects around a copy of it, and running what those projects produce.
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";

/** The folder holding the consumer tests and their tools. */
export const testsDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The package under test: this repository, or the folder COUNTLY_PACKAGE_DIR names, such as a candidate build. */
export const packageDir = process.env.COUNTLY_PACKAGE_DIR ? resolve(process.env.COUNTLY_PACKAGE_DIR) : resolve(testsDir, "..", "..");

/** The init() settings the probes use: a request handler that answers without a network. */
const PROBE_CONFIG = "{ app_key: \"PROBE_APP_KEY\", url: \"https://probe.example\", fake_request_handler: function () { return { status: 200, responseText: \"{\\\"result\\\":\\\"Success\\\"}\" }; } }";

/**
 * The source of countlyProbe(C, runInit), which reports whether `Countly.init` and the `Countly.default.init`
 * workaround give a working SDK. With runInit it calls init() and checks add_event, a method init() adds, because some
 * bundlers copy a namespace import's keys once, before init() adds its methods.
 */
export const PROBE_FUNCTION = "function countlyProbe(C, runInit) {\n" +
    "    var config = " + PROBE_CONFIG + ";\n" +
    "    function works(S) {\n" +
    "        if (!S || typeof S.init !== \"function\") {\n" +
    "            return false;\n" +
    "        }\n" +
    "        if (!runInit) {\n" +
    "            return true;\n" +
    "        }\n" +
    "        S.init(config);\n" +
    "        return typeof S.add_event === \"function\";\n" +
    "    }\n" +
    "    return { init: works(C), viaDefault: works(C && C.default) };\n" +
    "}\n";

/**
 * Consumer code for Node, Deno, Bun and bundles that Node runs: prints the probe's report, then exits once it is
 * written, as the SDK's timers keep the process alive.
 */
export const PROBE = PROBE_FUNCTION + "process.stdout.write(JSON.stringify(countlyProbe(C, true)) + \"\\n\", function () { process.exit(0); });\n";

/** The same report for a page: it sets window.__countlyResult. */
export const PAGE_PROBE = PROBE_FUNCTION + "window.__countlyResult = countlyProbe(C, true);\n";

/** The same report for a worker: it posts it to the page. */
export const WORKER_PROBE = PROBE_FUNCTION + "postMessage(countlyProbe(C, true));\n";

/**
 * The same report for a namespace import whose methods are called on it directly, as `Countly.init();
 * Countly.add_event()` does. Some bundlers rewrite such calls into reads of the SDK object, so they can work where the
 * namespace object passed on to other code does not.
 */
const DIRECT_CALLS = "var config = " + PROBE_CONFIG + ";\n" +
    "var direct = typeof C.init === \"function\" ? (C.init(config), typeof C.add_event === \"function\") : false;\n" +
    "var viaDefault = C.default && typeof C.default.init === \"function\" ? (C.default.init(config), typeof C.default.add_event === \"function\") : false;\n";

/** DIRECT_CALLS for code that Node runs, printing the report and exiting once it is written. */
export const DIRECT_PROBE = DIRECT_CALLS + "process.stdout.write(JSON.stringify({ init: direct, viaDefault: viaDefault }) + \"\\n\", function () { process.exit(0); });\n";

/** DIRECT_CALLS for a page: it sets window.__countlyResult. */
export const DIRECT_PAGE_PROBE = DIRECT_CALLS + "window.__countlyResult = { init: direct, viaDefault: viaDefault };\n";

/** Only `Countly.default.init` works, as on a namespace import under Node's rules, where the SDK is the default export. */
export const DEFAULT_ONLY = { init: false, viaDefault: true };
/** Both `Countly.init` and `Countly.default.init` work. */
export const BOTH = { init: true, viaDefault: true };

/** Consumer code for each way of referring to the package. */
export const ENTRIES = {
    defaultImport: "import C from \"countly-sdk-web\";\n",
    namespaceImport: "import * as C from \"countly-sdk-web\";\n",
    namedImport: "import { init } from \"countly-sdk-web\";\nconst C = { init };\n",
    require: "const C = require(\"countly-sdk-web\");\n",
    deepImport: "import C from \"countly-sdk-web/lib/countly.min.js\";\n",
    deepImportNoExtension: "import C from \"countly-sdk-web/lib/countly.min\";\n",
    deepRequire: "const C = require(\"countly-sdk-web/lib/countly.min.js\");\n",
    deepRequireNoExtension: "const C = require(\"countly-sdk-web/lib/countly.min\");\n"
};

/**
 * Consumer code that reports whether the site's import and a CommonJS dependency's require() got the same SDK, and
 * whether that SDK works, so that two missing SDKs do not count as one copy.
 */
export const SAME_COPY_PROBE = "import C from \"countly-sdk-web\";\nimport W from \"countly-wrapper-cjs\";\n" +
    "const a = C && C.init ? C : C && C.default;\nconst b = W && W.init ? W : W && W.default;\n" +
    "console.log(JSON.stringify({ sameCopy: a === b, bothWork: typeof (a && a.init) === \"function\" && typeof (b && b.init) === \"function\" }));\n";

/** The one result SAME_COPY_PROBE gives when both get the same working SDK. */
export const ONE_WORKING_COPY = { sameCopy: true, bothWork: true };

/**
 * Write a file, creating its folder.
 * @param {string} file - path
 * @param {string} content - content
 */
export function write(file, content) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
}

/**
 * The line of an error output that says what went wrong.
 * @param {string} text - error output
 * @returns {string} that line
 */
export function errorLine(text) {
    const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return lines.find((line) => /error|ERR_|Could not|Can't resolve|not exported|not found|does not provide|Cannot find/i.test(line)) || lines[0] || "unknown error";
}

/**
 * Create a consumer project under test/consumers/.apps: the package in its node_modules, a CommonJS dependency that
 * requires the SDK too, and a "type": "module" sub-project. Tools that resolve their own plugins from the project
 * (Next.js, Parcel, Jest, Vitest) find them in test/consumers/node_modules, as in a workspace.
 * @param {string} name - a name for the folder
 * @returns {string} the project folder, to be removed with removeProject
 */
export function createProject(name) {
    mkdirSync(join(testsDir, ".apps"), { recursive: true });
    const dir = mkdtempSync(join(testsDir, ".apps", name + "-"));
    const pkg = join(dir, "node_modules", "countly-sdk-web");
    mkdirSync(pkg, { recursive: true });
    copyFileSync(join(packageDir, "package.json"), join(pkg, "package.json"));
    cpSync(join(packageDir, "lib"), join(pkg, "lib"), { recursive: true });
    cpSync(join(packageDir, "plugin"), join(pkg, "plugin"), { recursive: true });
    write(join(dir, "node_modules", "countly-wrapper-cjs", "package.json"), JSON.stringify({ name: "countly-wrapper-cjs", version: "1.0.0", main: "index.js" }));
    write(join(dir, "node_modules", "countly-wrapper-cjs", "index.js"), "module.exports = require(\"countly-sdk-web\");\n");
    write(join(dir, "package.json"), JSON.stringify({ name: "consumer-" + name, private: true }));
    write(join(dir, "type-module", "package.json"), JSON.stringify({ name: "consumer-" + name + "-type-module", private: true, type: "module" }));
    return dir;
}

/**
 * Remove a consumer project, if one was created.
 * @param {string} [dir] - the project folder
 */
export function removeProject(dir) {
    if (dir) {
        rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    }
}

/**
 * Write consumer code into a project.
 * @param {string} dir - the project folder
 * @param {string} entry - path relative to the project
 * @param {string} code - content
 * @returns {string} the entry, as given
 */
export function writeEntry(dir, entry, code) {
    write(join(dir, entry), code);
    return entry;
}

/**
 * The path of a tool's file in test/consumers/node_modules.
 * @param {string} file - path inside node_modules, such as next/dist/bin/next
 * @returns {string} absolute path
 */
export function toolFile(file) {
    return join(testsDir, "node_modules", file);
}

/**
 * Run a program to completion. A program that is not installed fails the test with what to install.
 * @param {string} command - program
 * @param {string[]} args - arguments
 * @param {Object} options - cwd, env (added to this process's), timeout in ms, install: how to get the program
 * @returns {Object} status, stdout and stderr
 */
export function run(command, args, options) {
    const result = spawnSync(command, args, { cwd: options.cwd, env: Object.assign({}, process.env, options.env || {}), encoding: "utf8", timeout: options.timeout || 180000, maxBuffer: 64 * 1024 * 1024 });
    if (result.error && result.error.code === "ENOENT") {
        throw new Error(command + " is not installed or not on PATH. " + (options.install || ""));
    }
    if (result.error) {
        throw result.error;
    }
    return { status: result.status, stdout: result.stdout || "", stderr: result.stderr || "" };
}

/**
 * The JSON a program printed on its last line, or { error } with the line that says why it failed.
 * @param {Object} result - what run() returned
 * @returns {Object} the parsed line, or { error }
 */
export function lastJson(result) {
    const line = result.stdout.trim().split(/\r?\n/).pop() || "";
    try {
        return JSON.parse(line);
    }
    catch (error) {
        return { error: errorLine(result.stderr || result.stdout) };
    }
}

/**
 * Run a file with Node and read the JSON line it prints last.
 * @param {string} cwd - working folder
 * @param {string} file - file to run
 * @param {string[]} [flags] - Node flags
 * @returns {Object} what the file printed, or { error }
 */
export function runFile(cwd, file, flags) {
    return lastJson(run(process.execPath, (flags || []).concat([file]), { cwd, timeout: 60000 }));
}

/**
 * Wait until a check returns something truthy.
 * @param {Function} check - returns the awaited value, or a falsy value to keep waiting
 * @param {number} timeout - give up after this many ms
 * @param {string} what - what is awaited, for the error
 * @returns {Promise<*>} the check's value
 */
export async function waitFor(check, timeout, what) {
    const end = Date.now() + timeout;
    let lastError = null;
    while (Date.now() < end) {
        try {
            const value = await check();
            if (value) {
                return value;
            }
        }
        catch (error) {
            lastError = error;
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    }
    throw new Error("timed out waiting for " + what + (lastError ? ": " + lastError.message : ""));
}

/**
 * A free TCP port on this machine.
 * @returns {Promise<number>} the port
 */
export function freePort() {
    return new Promise((resolvePort, reject) => {
        const server = createNetServer();
        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const port = server.address().port;
            server.close(() => resolvePort(port));
        });
    });
}

const CONTENT_TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".cjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".map": "application/json" };

/**
 * Serve a folder over HTTP on a free local port, as a site's web server does. Requests to the SDK's endpoints get an
 * empty successful answer.
 * @param {string} root - the folder
 * @returns {Promise<Object>} url, and close()
 */
export function serveFolder(root) {
    const base = resolve(root) + sep;
    const server = createServer((req, res) => {
        const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        if (path === "/favicon.ico") {
            res.writeHead(204);
            res.end();
            return;
        }
        if (path === "/i" || path.indexOf("/o/") === 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end("{\"result\":\"Success\"}");
            return;
        }
        const file = resolve(base, "." + (path.endsWith("/") ? path + "index.html" : path));
        if (file.indexOf(base) !== 0) {
            res.writeHead(403);
            res.end();
            return;
        }
        try {
            const body = readFileSync(file);
            res.writeHead(200, { "Content-Type": CONTENT_TYPES[extname(file)] || "application/octet-stream" });
            res.end(body);
        }
        catch (error) {
            res.writeHead(404);
            res.end();
        }
    });
    return new Promise((resolveServer) => {
        server.listen(0, "127.0.0.1", () => resolveServer({
            url: "http://127.0.0.1:" + server.address().port,
            close: () => new Promise((resolveClose) => {
                server.closeAllConnections();
                server.close(() => resolveClose());
            })
        }));
    });
}
