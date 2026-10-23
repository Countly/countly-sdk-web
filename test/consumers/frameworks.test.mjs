// What server-rendering frameworks give the SDK's importers on the server and in the browser, with what each one
// gives today: a Next.js app (App Router and Pages Router) built with Turbopack and with webpack, and Vite's SSR build.
// Setup: npm ci --prefix test/consumers; Google Chrome installed (or CHROME_PATH). Run: npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { BOTH, ENTRIES, ONE_WORKING_COPY, PROBE, SAME_COPY_PROBE, createProject, removeProject, writeEntry } from "./helpers/project.mjs";
import { viaVite } from "./helpers/bundlers.mjs";
import { serverHtml, startBrowser, stopBrowser, visit } from "./helpers/browser.mjs";
import { buildNextApp, serverProbe, startNextApp } from "./helpers/tools.mjs";

let dir;
before(async () => {
    dir = createProject("frameworks");
    await startBrowser();
});
after(async () => {
    try {
        await stopBrowser();
    }
    finally {
        removeProject(dir);
    }
});

for (const bundler of ["turbopack", "webpack"]) {
    describe("Next.js 16 built with " + bundler, () => {
        let next;
        before(async () => {
            next = await startNextApp(buildNextApp(dir, bundler));
        });
        after(async () => {
            if (next) {
                await next.stop();
            }
        });

        test("App Router, a server component's import, rendered on the server", async () => {
            assert.deepEqual(serverProbe(await serverHtml(next.url + "/")), BOTH);
        });

        test("App Router, a client component's import, in the browser", async () => {
            assert.deepEqual((await visit(next.url + "/")).result, BOTH);
        });

        test("Pages Router, a page's import, in getStaticProps on the server", async () => {
            assert.deepEqual(serverProbe(await serverHtml(next.url + "/legacy")), BOTH);
        });

        test("Pages Router, a page's import, in the browser", async () => {
            assert.deepEqual((await visit(next.url + "/legacy")).result, BOTH);
        });
    });
}

describe("Vite 8 SSR build run by Node (as Remix, Astro, SvelteKit and Nuxt run their servers)", () => {
    test("default import", async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite-ssr/default.js", ENTRIES.defaultImport + PROBE), true), BOTH);
    });

    test("the app's import and a CommonJS dependency's require() share one copy", async () => {
        assert.deepEqual(await viaVite(dir, writeEntry(dir, "vite-ssr/same-copy.js", SAME_COPY_PROBE), true), ONE_WORKING_COPY);
    });
});
