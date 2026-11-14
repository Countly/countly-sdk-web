// What code compiled to CommonJS by TypeScript or Babel receives (as ts-jest, babel-jest and older builds run it), and
// whether the package's TypeScript declarations compile for typical use, with what each gives today.
// Setup: npm ci --prefix test/consumers. Run: npm run test:consumers
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { BOTH, ENTRIES, PROBE, createProject, removeProject } from "./helpers/project.mjs";
import { ts, typeCheck, viaBabel, viaTypeScript } from "./helpers/compilers.mjs";

const TYPED_USE = ENTRIES.defaultImport.replace(/\bC\b/, "Countly") +
    "Countly.init({ app_key: \"APP_KEY\", url: \"https://example.count.ly\" });\n" +
    "Countly.add_event({ key: \"purchase\", count: 1, segmentation: { plan: \"pro\" } });\n";

let dir;
before(() => {
    dir = createProject("compiled");
});
after(() => removeProject(dir));

describe("compiled to CommonJS", () => {
    test("TypeScript, default import with esModuleInterop", () => {
        assert.deepEqual(viaTypeScript(dir, "default-interop", ENTRIES.defaultImport + PROBE, true), BOTH);
    });

    test("TypeScript, default import without esModuleInterop", () => {
        assert.deepEqual(viaTypeScript(dir, "default-no-interop", ENTRIES.defaultImport + PROBE, false), BOTH);
    });

    test("TypeScript, namespace import with esModuleInterop", () => {
        assert.deepEqual(viaTypeScript(dir, "namespace-interop", ENTRIES.namespaceImport + PROBE, true), BOTH);
    });

    test("Babel, default import", () => {
        assert.deepEqual(viaBabel(dir, "default", ENTRIES.defaultImport + PROBE), BOTH);
    });

    test("Babel, namespace import", () => {
        assert.deepEqual(viaBabel(dir, "namespace", ENTRIES.namespaceImport + PROBE), BOTH);
    });
});

describe("TypeScript declarations compile for typical use", () => {
    test("moduleResolution node10, CommonJS output", () => {
        assert.deepEqual(typeCheck(dir, "node10.ts", TYPED_USE, { module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.Node10, esModuleInterop: true }), []);
    });

    test("moduleResolution bundler", () => {
        assert.deepEqual(typeCheck(dir, "bundler.ts", TYPED_USE, { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler }), []);
    });

    test("moduleResolution node16, from an ES module", () => {
        assert.deepEqual(typeCheck(dir, "node16.mts", TYPED_USE, { module: ts.ModuleKind.Node16, moduleResolution: ts.ModuleResolutionKind.Node16 }), []);
    });

    test("moduleResolution node16, from a CommonJS module", () => {
        assert.deepEqual(typeCheck(dir, "node16.cts", TYPED_USE, { module: ts.ModuleKind.Node16, moduleResolution: ts.ModuleResolutionKind.Node16 }), []);
    });

    test("the ad revenue and app link calls compile, and a wrong argument type is reported", () => {
        const use = TYPED_USE +
            "Countly.recordAdRevenue(0.0042, { network: \"applovin\", format: \"interstitial\", currency: \"USD\" });\n" +
            "Countly.recordAdRevenue(1);\n" +
            "const link: string | null = Countly.attribution.appLink({ code: \"spring\", path: \"/product/42\", params: { promo: \"a\" }, android: \"intent\" });\n";
        const options = { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler };
        assert.deepEqual(typeCheck(dir, "attribution.ts", use, options), []);
        const messages = typeCheck(dir, "attribution-typo.ts", use.replace("{ code: \"spring\",", "{ code: 42,"), options);
        assert.equal(messages.length, 1);
        assert.match(messages[0], /'number' is not assignable to type 'string'/);
    });

    test("a typo in an SDK method name is reported, so the declarations are really checked", () => {
        const messages = typeCheck(dir, "typo.ts", TYPED_USE.replace("Countly.add_event", "Countly.add_evnt"), { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler });
        assert.equal(messages.length, 1);
        assert.match(messages[0], /add_evnt/);
    });
});
