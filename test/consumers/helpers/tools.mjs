// Runtimes, test runners and frameworks that load the package themselves: Deno, Bun, Jest, Vitest and Next.js.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { PROBE_FUNCTION, errorLine, freePort, lastJson, run, testsDir, toolFile, waitFor, write } from "./project.mjs";

const PROBE_TO_FILE = "require(\"node:fs\").writeFileSync(process.env.PROBE_OUT, JSON.stringify(countlyProbe(C, true)));\n";
const PROBE_TO_FILE_ESM = "writeFileSync(process.env.PROBE_OUT, JSON.stringify(countlyProbe(C, true)));\n";

/**
 * Run a file with Deno, the way a Deno project with a package.json and node_modules does.
 * @param {string} dir - the project folder
 * @param {string} file - file to run, relative to the project
 * @returns {Object} what the file printed, or { error }
 */
export function viaDeno(dir, file) {
    return lastJson(run("deno", ["run", "--quiet", "--allow-read", "--allow-env", "--node-modules-dir=manual", file], { cwd: dir, install: "CI installs it with denoland/setup-deno; locally see https://deno.com." }));
}

/**
 * Run a file with Bun.
 * @param {string} dir - the project folder
 * @param {string} file - file to run, relative to the project
 * @returns {Object} what the file printed, or { error }
 */
export function viaBun(dir, file) {
    return lastJson(run("bun", [file], { cwd: dir, install: "CI installs it with oven-sh/setup-bun; locally see https://bun.sh." }));
}

/**
 * Read what a test runner's probe test wrote, or the reason it wrote nothing.
 * @param {string} file - the probe's output file
 * @param {Object} result - what run() returned for the test runner
 * @returns {Object} the probe's report, or { error }
 */
function readProbe(file, result) {
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    }
    catch (error) {
        return { error: errorLine(result.stderr + "\n" + result.stdout) };
    }
}

/**
 * Run a Jest test in the browser-like jsdom environment, with Babel compiling it as babel-jest does by default.
 * @param {string} dir - the project folder
 * @param {string} name - test name
 * @param {string} imports - the test's import or require lines, which define C
 * @returns {Object} what the test saw, or { error }
 */
export function viaJest(dir, name, imports) {
    const testFile = join(dir, "jest", name + ".test.js");
    write(testFile, imports + PROBE_FUNCTION + "test(\"probe\", () => {\n" + PROBE_TO_FILE + "});\n");
    const out = join(dir, "jest", name + ".json");
    const config = {
        rootDir: join(dir, "jest"),
        testEnvironment: toolFile("jest-environment-jsdom"),
        transform: { "\\.[jt]sx?$": [toolFile("babel-jest"), { babelrc: false, configFile: false, plugins: [toolFile("@babel/plugin-transform-modules-commonjs")] }] },
        testMatch: ["**/" + name + ".test.js"],
        cacheDirectory: join(dir, "jest", ".cache")
    };
    const result = run(process.execPath, [toolFile("jest/bin/jest.js"), "--config", JSON.stringify(config), "--runInBand", "--ci", "--watchman=false", "--forceExit"], { cwd: dir, env: { PROBE_OUT: out } });
    return readProbe(out, result);
}

/**
 * Run a Vitest test in the browser-like happy-dom environment, as a Vite project does.
 * @param {string} dir - the project folder
 * @param {string} folder - the Vitest project folder inside the project, such as type-module/vitest
 * @param {string} imports - the test's import lines, which define C
 * @returns {Object} what the test saw, or { error }
 */
export function viaVitest(dir, folder, imports) {
    const root = join(dir, folder);
    write(join(root, "vitest.config.mjs"), "export default { test: { environment: \"happy-dom\", include: [\"probe.test.js\"] } };\n");
    write(join(root, "probe.test.js"), "import { writeFileSync } from \"node:fs\";\n" + imports + "import { test } from \"vitest\";\n" + PROBE_FUNCTION + "test(\"probe\", () => {\n" + PROBE_TO_FILE_ESM + "});\n");
    const out = join(root, "probe.json");
    const result = run(process.execPath, [toolFile("vitest/vitest.mjs"), "run", "--root", root, "--config", join(root, "vitest.config.mjs")], { cwd: root, env: { PROBE_OUT: out } });
    return readProbe(out, result);
}

/**
 * Write a Next.js app with the App Router and the Pages Router, each importing the SDK in server code and in browser
 * code, and build it.
 * @param {string} dir - the project folder
 * @param {string} bundler - "turbopack" (the default of next build) or "webpack"
 * @returns {string} the app folder
 */
export function buildNextApp(dir, bundler) {
    const app = join(dir, "next-" + bundler);
    write(join(app, "package.json"), JSON.stringify({ name: "next-" + bundler, private: true }));
    write(join(app, "next.config.mjs"), "export default " + JSON.stringify({ turbopack: { root: testsDir }, outputFileTracingRoot: testsDir }) + ";\n");
    write(join(app, "app", "layout.js"), "export default function RootLayout({ children }) {\n    return <html><body>{children}</body></html>;\n}\n");
    write(join(app, "app", "page.js"), "import Countly from \"countly-sdk-web\";\nimport ClientProbe from \"./client-probe\";\n" + PROBE_FUNCTION +
        "export default function Page() {\n    return <main><pre id=\"server-probe\">{JSON.stringify(countlyProbe(Countly, false))}</pre><ClientProbe /></main>;\n}\n");
    write(join(app, "app", "client-probe.js"), "\"use client\";\nimport Countly from \"countly-sdk-web\";\n" + PROBE_FUNCTION +
        "if (typeof window !== \"undefined\") {\n    window.__countlyResult = countlyProbe(Countly, true);\n}\nexport default function ClientProbe() {\n    return null;\n}\n");
    write(join(app, "pages", "legacy.js"), "import Countly from \"countly-sdk-web\";\n" + PROBE_FUNCTION +
        "if (typeof window !== \"undefined\") {\n    window.__countlyResult = countlyProbe(Countly, true);\n}\n" +
        "export async function getStaticProps() {\n    return { props: { serverProbe: JSON.stringify(countlyProbe(Countly, false)) } };\n}\n" +
        "export default function Legacy({ serverProbe }) {\n    return <pre id=\"server-probe\">{serverProbe}</pre>;\n}\n");
    const args = [toolFile("next/dist/bin/next"), "build"].concat(bundler === "webpack" ? ["--webpack"] : []);
    const result = run(process.execPath, args, { cwd: app, env: { NEXT_TELEMETRY_DISABLED: "1" }, timeout: 600000 });
    if (result.status !== 0) {
        throw new Error("next build (" + bundler + ") failed: " + (result.stderr + "\n" + result.stdout).trim().split(/\r?\n/).slice(-15).join("\n"));
    }
    const banner = result.stdout.split(/\r?\n/).find((line) => /Next\.js \d/.test(line)) || "";
    if (banner.toLowerCase().indexOf("(" + bundler + ")") === -1) {
        throw new Error("next build did not use " + bundler + ": " + (banner || "no Next.js banner in its output"));
    }
    return app;
}

/**
 * Start a built Next.js app with next start on a free port.
 * @param {string} app - the app folder
 * @returns {Promise<Object>} url, and stop()
 */
export async function startNextApp(app) {
    const port = await freePort();
    const child = spawn(process.execPath, [toolFile("next/dist/bin/next"), "start", "-p", String(port), "-H", "127.0.0.1"], { cwd: app, env: Object.assign({}, process.env, { NEXT_TELEMETRY_DISABLED: "1" }), stdio: "ignore" });
    const url = "http://127.0.0.1:" + port;
    const stop = () => new Promise((resolveStop) => {
        if (child.exitCode !== null) {
            resolveStop();
            return;
        }
        child.once("exit", () => resolveStop());
        child.kill();
    });
    try {
        await waitFor(async () => (await fetch(url + "/")).ok, 60000, "next start to answer");
    }
    catch (error) {
        await stop();
        throw error;
    }
    return { url, stop };
}

/**
 * The server probe a Next.js page rendered into its HTML, as the server sent it.
 * @param {string} html - the page's HTML
 * @returns {Object} the server probe, or { error }
 */
export function serverProbe(html) {
    const match = html.match(/<pre id="server-probe">([^<]*)<\/pre>/);
    if (!match) {
        return { error: "the page has no server probe" };
    }
    return JSON.parse(match[1].replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&amp;/g, "&"));
}
