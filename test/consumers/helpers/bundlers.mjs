// Builds consumer code the way bundlers and build tools do.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import webpack from "webpack";
import { rspack } from "@rspack/core";
import * as esbuild from "esbuild";
import { rollup } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { build as viteBuild, createServer as createViteServer } from "vite";
import { PROBE, errorLine, freePort, run, runFile, toolFile, write } from "./project.mjs";

/**
 * A folder name for an entry path.
 * @param {string} entry - entry, relative to the project
 * @returns {string} name without separators
 */
function safeName(entry) {
    return entry.replace(/[^a-z0-9]+/gi, "_");
}

/**
 * Bundle an entry with webpack or Rspack for the browser.
 * @param {Function} compiler - webpack or rspack
 * @param {string} name - the tool's name, for the output folder
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @param {Object} [options] - more options, such as externals
 * @returns {Promise<string>} the bundle
 */
function bundleWith(compiler, name, dir, entry, options) {
    const outDir = join(dir, "out", name, safeName(entry) + (options ? "_custom" : ""));
    const config = Object.assign({ mode: "none", target: "web", context: dir, entry: "./" + entry, devtool: false, output: { path: outDir, filename: "bundle.js", globalObject: "globalThis" }, infrastructureLogging: { level: "none" } }, options || {});
    return new Promise((resolveBundle, reject) => {
        compiler(config, (error, stats) => {
            if (error) {
                reject(error);
                return;
            }
            if (stats.hasErrors()) {
                reject(new Error(stats.toJson({ all: false, errors: true }).errors.map((e) => e.message).join("\n")));
                return;
            }
            resolveBundle(join(outDir, "bundle.js"));
        });
    });
}

/**
 * Bundle an entry with webpack for the browser.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @param {Object} [options] - more webpack options
 * @returns {Promise<string>} the bundle
 */
export function bundleWithWebpack(dir, entry, options) {
    return bundleWith(webpack, "webpack", dir, entry, options);
}

/**
 * Bundle an entry with esbuild for the browser.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<string>} the bundle
 */
export async function bundleWithEsbuild(dir, entry) {
    const outfile = join(dir, "out", "esbuild", safeName(entry), "bundle.js");
    try {
        await esbuild.build({ absWorkingDir: dir, entryPoints: [join(dir, entry)], bundle: true, platform: "browser", format: "iife", outfile, logLevel: "silent" });
    }
    catch (error) {
        throw new Error((error.errors && error.errors[0] && error.errors[0].text) || error.message);
    }
    return outfile;
}

/**
 * Bundle with a function that returns the bundle path, then run the bundle with Node.
 * @param {Function} bundle - returns a promise of the bundle path
 * @param {string} dir - the project folder
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
async function bundleAndRun(bundle, dir) {
    let file;
    try {
        file = await bundle();
    }
    catch (error) {
        return { error: errorLine(error.message) };
    }
    return runFile(dir, file);
}

/**
 * Bundle an entry with webpack and run it.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
export function viaWebpack(dir, entry) {
    return bundleAndRun(() => bundleWithWebpack(dir, entry), dir);
}

/**
 * Bundle an entry with Rspack and run it.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
export function viaRspack(dir, entry) {
    return bundleAndRun(() => bundleWith(rspack, "rspack", dir, entry), dir);
}

/**
 * Bundle an entry with esbuild and run it.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
export function viaEsbuild(dir, entry) {
    return bundleAndRun(() => bundleWithEsbuild(dir, entry), dir);
}

/**
 * Bundle an entry with Rollup, its node-resolve and commonjs plugins, and run it.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
export function viaRollup(dir, entry) {
    return bundleAndRun(async () => {
        const file = join(dir, "out", "rollup", safeName(entry), "bundle.js");
        const bundle = await rollup({ input: join(dir, entry), plugins: [nodeResolve({ browser: true, rootDir: dir }), commonjs()], onwarn: () => {} });
        await bundle.write({ file, format: "iife", name: "consumer" });
        await bundle.close();
        return file;
    }, dir);
}

/**
 * Bundle an entry with Bun's bundler for the browser, in its default ES module output, and run it.
 * Bun's iife output never calls an entry that uses require(), so it cannot show what such an entry receives.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @returns {Promise<Object>} what the bundle printed, or { error }
 */
export function viaBunBuild(dir, entry) {
    return bundleAndRun(async () => {
        const outfile = join(dir, "out", "bun", safeName(entry), "bundle.mjs");
        const result = run("bun", ["build", join(dir, entry), "--target=browser", "--format=esm", "--outfile=" + outfile], { cwd: dir, install: "CI installs it with oven-sh/setup-bun; locally see https://bun.sh." });
        if (result.status !== 0) {
            throw new Error(result.stderr || result.stdout);
        }
        return outfile;
    }, dir);
}

/**
 * Convert the package to an ES module the way jsDelivr's +esm URL does and import its default export.
 * Rollup's commonjs plugin with defaultIsModuleExports: true reproduces the file jsDelivr served for 26.8.0, whose
 * default export was the CommonJS exports object.
 * @param {string} dir - the project folder
 * @returns {Promise<Object>} what the importer got, or { error }
 */
export function viaJsdelivrEsm(dir) {
    return bundleAndRun(async () => {
        write(join(dir, "jsdelivr", "entry.mjs"), "export { default } from \"countly-sdk-web\";\n");
        const file = join(dir, "out", "jsdelivr", "plus-esm.mjs");
        const bundle = await rollup({ input: join(dir, "jsdelivr", "entry.mjs"), plugins: [nodeResolve({ browser: true, rootDir: dir }), commonjs({ defaultIsModuleExports: true })], onwarn: () => {} });
        await bundle.write({ file, format: "es" });
        await bundle.close();
        const importer = join(dir, "out", "jsdelivr", "importer.mjs");
        write(importer, "import C from \"./plus-esm.mjs\";\n" + PROBE);
        return importer;
    }, dir);
}

/**
 * Build an entry with Vite, as a browser build or as an SSR build that leaves dependencies to Node, and run the output.
 * The folder holding the entry is the Vite root, so a "type": "module" sub-project builds as its own project.
 * @param {string} dir - the project folder
 * @param {string} entry - entry, relative to the project
 * @param {boolean} ssr - SSR build
 * @returns {Promise<Object>} what the output printed, or { error }
 */
export function viaVite(dir, entry, ssr) {
    return bundleAndRun(async () => {
        const outDir = join(dir, "out", ssr ? "vite-ssr" : "vite", safeName(entry));
        const input = join(dir, entry);
        const build = { outDir, emptyOutDir: true, minify: false, copyPublicDir: false, write: true };
        if (ssr) {
            build.ssr = input;
            build.rolldownOptions = { output: { entryFileNames: "bundle.mjs" } };
        }
        else {
            build.rolldownOptions = { input, output: { format: "es", entryFileNames: "bundle.mjs" } };
        }
        await viteBuild({ configFile: false, root: dirname(input), logLevel: "silent", mode: "production", build });
        return join(outDir, "bundle.mjs");
    }, dir);
}

/**
 * Start Vite's dev server for a site folder, as `vite` does during development.
 * @param {string} root - the site folder, holding index.html
 * @returns {Promise<Object>} url, and close()
 */
export async function startViteDevServer(root) {
    const port = await freePort();
    const server = await createViteServer({ configFile: false, root, logLevel: "silent", server: { host: "127.0.0.1", port, strictPort: true } });
    await server.listen();
    return { url: "http://127.0.0.1:" + port, close: () => server.close() };
}

/**
 * Build a site with Parcel from its index.html, as `parcel build` does.
 * @param {string} appDir - the site folder, holding index.html
 * @returns {string} the folder with the built site
 */
export function buildWithParcel(appDir) {
    const distDir = join(appDir, "dist");
    const result = run(process.execPath, [toolFile("parcel/lib/bin.js"), "build", "index.html", "--dist-dir", distDir, "--cache-dir", join(appDir, ".parcel-cache"), "--no-cache", "--no-optimize", "--no-source-maps", "--public-url", "./"], { cwd: appDir, env: { PARCEL_WORKERS: "0" } });
    if (result.status !== 0) {
        throw new Error("parcel build failed: " + errorLine(result.stderr || result.stdout));
    }
    if (readdirSync(distDir).indexOf("index.html") === -1) {
        throw new Error("parcel build wrote no index.html");
    }
    return distDir;
}
