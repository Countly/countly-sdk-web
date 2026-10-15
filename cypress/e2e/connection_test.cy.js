/* eslint-disable require-jsdoc */
var ct = require("../support/sdk-modules/ConnectionTest.js");
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

var ROW_ORDER = [
    "core", "core-write", "sc", "rc", "ab", "feedback", "feedback-widget",
    "feedback-submit", "content", "feedback-page", "feedback-assets", "content-page"
];

// Deliver the server config through the SDK's own request machinery, armed or not,
// exactly as a real sc response would arrive.
function initWithServerConfig(armed) {
    Countly.init({
        app_key: hp.appKey,
        url: "https://test.count.ly",
        test_mode: true,
        debug: true,
        fake_request_handler: function(req) {
            if (req.functionName === "server_config") {
                var config = { v: 2, t: 1786273877636, c: {} };
                if (armed) {
                    config.ct = 1;
                }
                return { status: 200, responseText: JSON.stringify(config) };
            }
            return { status: 200, responseText: '{"result":"Success"}' };
        }
    });
}

describe("Connection test URL building", () => {
    it("keeps the path prefix of a reverse-proxied server url", () => {
        expect(ct.buildProbeUrl("https://countly.example/countly", "/o/ping")).to.equal("https://countly.example/countly/o/ping");
    });

    it("strips a trailing slash from the server url", () => {
        expect(ct.buildProbeUrl("https://countly.example/countly/", "/o/ping")).to.equal("https://countly.example/countly/o/ping");
    });

    it("keeps the query string of a probe path", () => {
        expect(ct.buildProbeUrl("https://countly.example", "/o/sdk?method=rc")).to.equal("https://countly.example/o/sdk?method=rc");
    });
});

describe("Connection test grading", () => {
    it("grades a 2xx as reachable with no detail", () => {
        expect(ct.gradeProbe({ status: 200 })).to.deep.equal({ ok: true, st: 200 });
    });

    it("grades an application 400 as reachable, since the app answered", () => {
        expect(ct.gradeProbe({ status: 400 })).to.deep.equal({ ok: true, st: 400 });
    });

    it("grades a 403 as unreachable even though it is a 4xx", () => {
        expect(ct.gradeProbe({ status: 403 })).to.deep.equal({
            ok: false,
            st: 403,
            e: "Expected the Countly application to answer, but a proxy rejected the request with HTTP 403 before it got there."
        });
    });

    it("grades a 5xx as unreachable", () => {
        expect(ct.gradeProbe({ status: 502 })).to.deep.equal({
            ok: false,
            st: 502,
            e: "Expected the Countly application to answer, but the gateway or an upstream service failed with HTTP 502."
        });
    });

    it("grades a readable redirect status as unreachable", () => {
        expect(ct.gradeProbe({ status: 302 })).to.deep.equal({
            ok: false,
            st: 302,
            e: "Expected a direct answer from Countly, but the request was redirected away with HTTP 302."
        });
    });

    it("grades a rejected request as a transport error", () => {
        expect(ct.gradeProbe({ rejected: true })).to.deep.equal({
            ok: false,
            st: 0,
            e: "Expected the server to answer, but no readable answer arrived: the connection failed (DNS, TLS, certificate pinning), or a firewall or proxy blocked the request or answered without Countly's CORS headers."
        });
    });

    it("distinguishes a timeout from a generic transport error", () => {
        expect(ct.gradeProbe({ rejected: true, timedOut: true })).to.deep.equal({
            ok: false,
            st: 0,
            e: "Expected an answer within 10s, but the request never completed."
        });
    });

    it("grades an opaque-redirect response as redirected, not as a transport error", () => {
        expect(ct.gradeProbe({ redirected: true })).to.deep.equal({
            ok: false,
            st: 0,
            e: "Expected a direct answer from Countly, but the request was redirected away; the browser hides the redirect status."
        });
    });

    it("grades a resolved opaque response as reachable, flagged as header stripping", () => {
        expect(ct.gradeProbe({ opaque: true })).to.deep.equal({
            ok: true,
            st: 0,
            e: ct.CT_DETAIL.OPAQUE
        });
    });

    it("fails a strict-2xx row on a 404, so a ping answering DB Error is not green", () => {
        expect(ct.gradeProbe({ status: 404 }, { strict2xx: true })).to.deep.equal({
            ok: false,
            st: 404,
            e: "Expected a 2xx from this route, which has no legitimate 4xx, but got HTTP 404."
        });
    });

    it("passes a strict-2xx row on a real 2xx", () => {
        expect(ct.gradeProbe({ status: 200 }, { strict2xx: true })).to.deep.equal({ ok: true, st: 200 });
    });

    it("does not apply the strict-2xx rule to an opaque probe", () => {
        expect(ct.gradeProbe({ opaque: true }, { strict2xx: true })).to.deep.equal({
            ok: true,
            st: 0,
            e: ct.CT_DETAIL.OPAQUE
        });
    });

    it("keeps every explanation inside the 256 character field limit", () => {
        Object.keys(ct.CT_DETAIL).forEach((key) => {
            var detail = ct.CT_DETAIL[key];
            if (typeof detail === "string") {
                expect(detail.length, key).to.be.at.most(256);
            }
        });
    });
});

describe("Connection test multi-path rows", () => {
    it("reports the first status and the summed latency when every path answered", () => {
        var row = ct.combineRow([
            { ok: true, st: 400, ms: 10 },
            { ok: true, st: 404, ms: 20 },
            { ok: true, st: 400, ms: 30 }
        ]);
        expect(row).to.deep.equal({ ok: true, st: 400, ms: 60, n: 3 });
    });

    it("fails the whole row when one path is blocked, reporting that path's status", () => {
        var row = ct.combineRow([
            { ok: true, st: 400, ms: 10 },
            { ok: false, st: 403, ms: 20, e: "blocked" },
            { ok: true, st: 400, ms: 30 }
        ]);
        expect(row).to.deep.equal({ ok: false, st: 403, ms: 60, n: 3, e: "blocked" });
    });

    it("carries the opaque qualifier when every path was probed opaquely", () => {
        var row = ct.combineRow([
            { ok: true, st: 0, ms: 10, e: ct.CT_DETAIL.OPAQUE },
            { ok: true, st: 0, ms: 20, e: ct.CT_DETAIL.OPAQUE }
        ]);
        expect(row).to.deep.equal({ ok: true, st: 0, ms: 30, n: 2, e: ct.CT_DETAIL.OPAQUE });
    });

    it("keeps the opaque qualifier when only some paths were probed opaquely", () => {
        var row = ct.combineRow([
            { ok: true, st: 400, ms: 10 },
            { ok: true, st: 0, ms: 20, e: ct.CT_DETAIL.OPAQUE }
        ]);
        expect(row).to.deep.equal({ ok: true, st: 400, ms: 30, n: 2, e: ct.CT_DETAIL.OPAQUE });
    });

    it("prefers the failing path's reason over the opaque qualifier", () => {
        var row = ct.combineRow([
            { ok: true, st: 0, ms: 10, e: ct.CT_DETAIL.OPAQUE },
            { ok: false, st: 0, ms: 20, e: "dead" }
        ]);
        expect(row).to.deep.equal({ ok: false, st: 0, ms: 30, n: 2, e: "dead" });
    });
});

// A stub transport: the network is the one thing that cannot be exercised deterministically,
// so probes are answered from a table while every assertion below is on what the battery
// itself did — which URLs it built, in what order, and how it shaped the report.
function stubProbe(byPath, calls) {
    return function(url, opts) {
        var mode = opts && opts.mode;
        calls.push({ url: url, mode: mode });
        var outcome = { status: 400, ms: 5 };
        Object.keys(byPath).forEach((path) => {
            if (url.indexOf(path) !== -1) {
                outcome = byPath[path];
            }
        });
        // a table entry may answer differently per attempt mode, which is how the
        // CORS-first / opaque-fallback sequence is exercised
        if (typeof outcome === "function") {
            outcome = outcome(mode);
        }
        return Promise.resolve(outcome);
    };
}

function baseContext(overrides) {
    var ctx = {
        url: "https://countly.example/countly",
        sdkName: "javascript_native_web",
        sdkVersion: "1.2.3",
        sc: { status: 200, ms: 112 },
        tier2: "unsupported"
    };
    Object.keys(overrides || {}).forEach((k) => {
        ctx[k] = overrides[k];
    });
    return ctx;
}

describe("Connection test battery", () => {
    it("reports every row in table order", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 200, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then((report) => {
            expect(report.results.map((r) => r.f)).to.deep.equal([
                "core", "core-write", "sc", "rc", "ab", "feedback", "feedback-widget",
                "feedback-submit", "content", "feedback-page", "feedback-assets", "content-page"
            ]);
        });
    });

    it("identifies the SDK and stamps the device clock", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 200, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then((report) => {
            expect(report.sdk).to.deep.equal({ name: "javascript_native_web", version: "1.2.3" });
            expect(report.ts).to.be.a("number");
        });
    });

    it("reuses the sc fetch latency instead of issuing a request for row 3", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 200, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then((report) => {
            var sc = report.results.find((r) => r.f === "sc");
            expect(sc).to.deep.equal({ f: "sc", ok: true, st: 200, ms: 112 });
            expect(calls.map((c) => c.url).join(" ")).to.not.contain("method=sc");
        });
    });

    it("probes every Tier 1 path against the configured url, prefix included", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 200, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then(() => {
            expect(calls.length).to.equal(10);
            calls.forEach((c) => expect(c.url).to.contain("https://countly.example/countly/"));
            expect(calls.some((c) => c.url.indexOf("/countly/o/ping") !== -1)).to.be.true;
            expect(calls.some((c) => c.url.indexOf("/countly/o/surveys/nps/widget") !== -1)).to.be.true;
        });
    });

    it("skips Tier 2 as unsupported without probing it", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 200, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then((report) => {
            var page = report.results.find((r) => r.f === "feedback-page");
            expect(page).to.deep.equal({ f: "feedback-page", sk: "unsupported" });
            expect(calls.some((c) => c.url.indexOf("/feedback/nps") !== -1)).to.be.false;
        });
    });

    it("runs the probes sequentially", () => {
        var inFlight = 0;
        var maxInFlight = 0;
        var ctx = baseContext({
            probe: function() {
                inFlight++;
                maxInFlight = Math.max(maxInFlight, inFlight);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        inFlight--;
                        resolve({ status: 200, ms: 1 });
                    }, 1);
                });
            }
        });
        return ct.runConnectionTest(ctx).then(() => {
            expect(maxInFlight).to.equal(1);
        });
    });

    it("applies the strict-2xx rule to core, so a ping answering DB Error is red", () => {
        var calls = [];
        var ctx = baseContext({ probe: stubProbe({ "/o/ping": { status: 404, ms: 5 } }, calls) });
        return ct.runConnectionTest(ctx).then((report) => {
            var core = report.results.find((r) => r.f === "core");
            expect(core).to.deep.equal({
                f: "core",
                ok: false,
                st: 404,
                ms: 5,
                e: "Expected a 2xx from this route, which has no legitimate 4xx, but got HTTP 404."
            });
        });
    });

    it("caps the battery over attempted requests, not over rows", () => {
        expect(ct.batteryCapMs(16)).to.equal(190000);
        expect(ct.batteryCapMs(10)).to.equal(130000);
    });

    it("marks rows it never reached once the battery cap elapses", () => {
        var calls = [];
        var clock = 0;
        var ctx = baseContext({
            now: function() {
                return clock;
            },
            probe: function(url) {
                calls.push(url);
                clock = 999999; // the first probe alone blows the whole battery budget
                return Promise.resolve({ status: 200, ms: 5 });
            }
        });
        return ct.runConnectionTest(ctx).then((report) => {
            expect(calls.length).to.equal(1);
            var byKey = {};
            report.results.forEach((r) => {
                byKey[r.f] = r;
            });
            expect(byKey.core).to.deep.equal({ f: "core", ok: true, st: 200, ms: 5 });
            expect(byKey["core-write"]).to.deep.equal({ f: "core-write", ok: false, st: 0, e: ct.CT_DETAIL.NOT_RUN });
            expect(byKey.content).to.deep.equal({ f: "content", ok: false, st: 0, e: ct.CT_DETAIL.NOT_RUN });
        });
    });

    it("still reports the free rows after the cap, since neither costs a request", () => {
        var clock = 0;
        var ctx = baseContext({
            now: function() {
                return clock;
            },
            probe: function() {
                clock = 999999;
                return Promise.resolve({ status: 200, ms: 5 });
            }
        });
        return ct.runConnectionTest(ctx).then((report) => {
            var byKey = {};
            report.results.forEach((r) => {
                byKey[r.f] = r;
            });
            expect(byKey.sc).to.deep.equal({ f: "sc", ok: true, st: 200, ms: 112 });
            expect(byKey["feedback-page"]).to.deep.equal({ f: "feedback-page", sk: "unsupported" });
        });
    });

    it("folds a multi-path row that fell back on every path into one opaque verdict", () => {
        var calls = [];
        var strippedHeaders = (mode) => (mode === "cors" ? { rejected: true, ms: 2 } : { opaque: true, ms: 5 });
        var ctx = baseContext({
            tier2: "cors-first",
            probe: stubProbe({
                "/o/ping": { status: 200, ms: 5 },
                "/feedback/nps": strippedHeaders,
                "/feedback/survey": strippedHeaders,
                "/feedback/rating": strippedHeaders
            }, calls)
        });
        return ct.runConnectionTest(ctx).then((report) => {
            var page = report.results.filter((r) => r.f === "feedback-page")[0];
            // each path costs two attempts, so ms covers all six
            expect(page).to.deep.equal({ f: "feedback-page", ok: true, st: 0, ms: 21, n: 3, e: ct.CT_DETAIL.OPAQUE });
            expect(calls.filter((c) => c.url.indexOf("/countly/feedback/") !== -1).length).to.equal(6);
        });
    });
});

describe("Connection test integration", () => {
    beforeEach(() => {
        // the probes are real requests from the SDK, answered here the way a healthy
        // server answers a parameterless GET
        cy.intercept({ url: "https://test.count.ly/**" }, { statusCode: 400, body: { result: "Missing parameter" } });
        cy.intercept("GET", "https://test.count.ly/o/ping*", { statusCode: 200, body: { result: "Success" } });
    });

    it("runs the battery and queues a ct_results report when the server arms it", () => {
        hp.haltAndClearStorage(() => {
            initWithServerConfig(true);
            cy.wait(3000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    var reports = rq.filter((r) => r.ct_results);
                    expect(reports.length).to.equal(1);
                    var report = JSON.parse(reports[0].ct_results);
                    expect(report.results.map((r) => r.f)).to.deep.equal(ROW_ORDER);
                    expect(report.sdk.name).to.equal("javascript_native_web");
                    expect(report.ts).to.be.a("number");
                });
            });
        });
    });

    it("never persists ct into the cached config", () => {
        hp.haltAndClearStorage(() => {
            initWithServerConfig(true);
            cy.wait(3000).then(() => {
                cy.fetch_from_storage(hp.appKey, "cly_config").then((cached) => {
                    var config = typeof cached === "string" ? JSON.parse(cached) : cached;
                    expect(config).to.not.have.property("ct");
                    expect(config).to.have.property("v");
                });
            });
        });
    });

    it("does nothing at all when the server config is not armed", () => {
        hp.haltAndClearStorage(() => {
            initWithServerConfig(false);
            cy.wait(3000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.filter((r) => r.ct_results).length).to.equal(0);
                });
            });
        });
    });
});

describe("Connection test report caps", () => {
    function reportOf(results) {
        return { ts: 1, sdk: { name: "javascript_native_web", version: "1.2.3" }, results: results };
    }

    it("truncates a long detail to 256 characters", () => {
        var capped = ct.capReport(reportOf([{ f: "core", ok: false, st: 0, ms: 1, e: new Array(600).join("x") }]));
        expect(capped.results[0].e.length).to.equal(256);
    });

    it("never reports more than 32 rows", () => {
        var many = [];
        for (var i = 0; i < 40; i++) {
            many.push({ f: "row" + i, ok: true, st: 200, ms: 1 });
        }
        expect(ct.capReport(reportOf(many)).results.length).to.equal(32);
    });

    it("drops failure details to fit the size cap but keeps the opaque qualifier", () => {
        var rows = [];
        for (var i = 0; i < 32; i++) {
            rows.push({ f: "row" + i, ok: false, st: 500, ms: 1, e: new Array(257).join("y") });
        }
        rows[0] = { f: "opaque-row", ok: true, st: 0, ms: 1, e: ct.CT_DETAIL.OPAQUE };
        var capped = ct.capReport(reportOf(rows));
        expect(JSON.stringify(capped).length).to.be.at.most(8192);
        expect(capped.results[0].e).to.equal(ct.CT_DETAIL.OPAQUE);
        expect(capped.results[1]).to.not.have.property("e");
    });
});

describe("Connection test probe requests", () => {
    it("probes parameterlessly, marked and cache-busted", () => {
        var probes = [];
        cy.intercept({ url: "https://test.count.ly/**" }, (req) => {
            probes.push(req.url);
            req.reply({ statusCode: 400, body: { result: "Missing parameter" } });
        });
        hp.haltAndClearStorage(() => {
            initWithServerConfig(true);
            cy.wait(3000).then(() => {
                var ping = probes.filter((u) => u.indexOf("/o/ping") !== -1)[0];
                expect(ping, "the core probe should have been issued").to.be.a("string");
                expect(ping).to.contain("ct=1");
                expect(ping).to.match(/[?&]_=\d+/);
                probes.forEach((url) => {
                    expect(url, "probes carry no identity").to.not.contain("app_key");
                    expect(url, "probes carry no identity").to.not.contain("device_id");
                });
            });
        });
    });
});

describe("Connection test probe deadline", () => {
    it("settles a probe that never answers in a browser without AbortController", () => {
        var savedFetch = window.fetch;
        var savedAbortController = window.AbortController;
        window.fetch = () => new Promise(() => {});
        window.AbortController = undefined;
        var probe;
        try {
            probe = ct.probeViaFetch("https://test.count.ly/o/ping", { mode: "cors" });
        }
        finally {
            window.fetch = savedFetch;
            window.AbortController = savedAbortController;
        }
        cy.wrap(probe, { timeout: ct.CT_PROBE_TIMEOUT + 5000 }).then((outcome) => {
            expect(outcome.rejected).to.equal(true);
            expect(outcome.timedOut).to.equal(true);
            expect(outcome.ms).to.be.at.least(ct.CT_PROBE_TIMEOUT - 100);
        });
    });
});

describe("Connection test Tier 2 CORS-first policy", () => {
    function corsFirstContext(byPath, calls) {
        return baseContext({ tier2: "cors-first", probe: stubProbe(byPath, calls) });
    }

    function rowOf(report, key) {
        return report.results.filter((r) => r.f === key)[0];
    }

    it("counts a possible fallback retry toward the attempted request budget", () => {
        expect(ct.attemptedRequests("cors-first")).to.equal(22);
        expect(ct.attemptedRequests("probe")).to.equal(16);
        expect(ct.attemptedRequests("unsupported")).to.equal(10);
        expect(ct.batteryCapMs(22)).to.equal(250000);
    });

    it("attempts Tier 2 with CORS first, and grades a readable status like Tier 1", () => {
        var calls = [];
        return ct.runConnectionTest(corsFirstContext({
            "/feedback/nps": { status: 400, ms: 4 },
            "/feedback/survey": { status: 400, ms: 4 },
            "/feedback/rating": { status: 400, ms: 4 }
        }, calls)).then((report) => {
            expect(rowOf(report, "feedback-page")).to.deep.equal({
                f: "feedback-page", ok: true, st: 400, ms: 12, n: 3
            });
            var nps = calls.filter((c) => c.url.indexOf("/feedback/nps") !== -1);
            expect(nps.length, "no retry when the first attempt is readable").to.equal(1);
            expect(nps[0].mode).to.equal("cors");
        });
    });

    it("applies the strict-2xx rule to the asset row now that its status is readable", () => {
        var calls = [];
        return ct.runConnectionTest(corsFirstContext({
            "/surveys/images/ct-probe.png": { status: 404, ms: 5 },
            "/star-rating/images/ct-probe.png": { status: 200, ms: 5 }
        }, calls)).then((report) => {
            expect(rowOf(report, "feedback-assets")).to.deep.equal({
                f: "feedback-assets",
                ok: false,
                st: 404,
                ms: 10,
                n: 2,
                e: "Expected a 2xx from this route, which has no legitimate 4xx, but got HTTP 404."
            });
        });
    });

    it("retries once without CORS when the CORS attempt is rejected", () => {
        var calls = [];
        var byMode = (mode) => (mode === "cors" ? { rejected: true, ms: 3 } : { opaque: true, ms: 7 });
        return ct.runConnectionTest(corsFirstContext({
            "/_external/content/": byMode
        }, calls)).then((report) => {
            expect(rowOf(report, "content-page")).to.deep.equal({
                f: "content-page", ok: true, st: 0, ms: 10, e: ct.CT_DETAIL.OPAQUE
            });
            var attempts = calls.filter((c) => c.url.indexOf("/_external/content/") !== -1);
            expect(attempts.map((c) => c.mode)).to.deep.equal(["cors", "no-cors"]);
        });
    });

    it("reads the opaque fallback as middlebox interference, not a browser limitation", () => {
        expect(ct.CT_DETAIL.OPAQUE).to.equal("Reachable, but the answer could not be read: it arrived without Countly's CORS headers, so a firewall or proxy between the device and the server may be removing or rewriting them.");
    });

    it("names a firewall or proxy, not only DNS or TLS, when no readable answer arrived", () => {
        expect(ct.CT_DETAIL.TRANSPORT).to.contain("firewall or proxy");
        expect(ct.CT_DETAIL.TRANSPORT).to.contain("DNS");
    });

    it("reports a transport error when the fallback is rejected as well", () => {
        var calls = [];
        return ct.runConnectionTest(corsFirstContext({
            "/_external/content/": { rejected: true, ms: 6 }
        }, calls)).then((report) => {
            expect(rowOf(report, "content-page")).to.deep.equal({
                f: "content-page", ok: false, st: 0, ms: 12, e: ct.CT_DETAIL.TRANSPORT
            });
        });
    });

    it("never falls back on Tier 1, where CORS is guaranteed", () => {
        var calls = [];
        return ct.runConnectionTest(corsFirstContext({
            "/o/ping": { rejected: true, ms: 6 }
        }, calls)).then((report) => {
            var pings = calls.filter((c) => c.url.indexOf("/o/ping") !== -1);
            expect(pings.length, "a Tier 1 rejection is a real failure, not a CORS problem").to.equal(1);
            expect(rowOf(report, "core")).to.deep.equal({
                f: "core", ok: false, st: 0, ms: 6, e: ct.CT_DETAIL.TRANSPORT
            });
        });
    });
});

describe("Connection test custom headers", () => {
    var tier2Paths = ["/feedback/nps", "/feedback/survey", "/feedback/rating", "/surveys/images/", "/star-rating/images/", "/_external/content/"];

    function isTier2(url) {
        return tier2Paths.some((path) => url.indexOf("https://countly.example/countly" + path) === 0);
    }

    it("sends the init headers with the probes of the routes the SDK calls, not with page and image probes", () => {
        var seen = [];
        var probe = (url, opts) => {
            seen.push({ url: url, headers: opts && opts.headers });
            return Promise.resolve({ status: 400, ms: 1 });
        };
        return ct.runConnectionTest(baseContext({ tier2: "cors-first", headers: { "X-Gateway-Key": "k1" }, probe: probe })).then(() => {
            var apiProbes = seen.filter((c) => !isTier2(c.url));
            expect(apiProbes.length).to.equal(10);
            apiProbes.forEach((c) => expect(c.headers, c.url).to.deep.equal({ "X-Gateway-Key": "k1" }));
            seen.filter((c) => isTier2(c.url)).forEach((c) => expect(c.headers, c.url).to.equal(undefined));
        });
    });

    it("puts the given headers on a CORS probe and none on an opaque one", () => {
        var inits = [];
        var savedFetch = window.fetch;
        window.fetch = (url, init) => {
            inits.push(init);
            return Promise.resolve(new Response("{}", { status: 400 }));
        };
        var probes;
        try {
            probes = Promise.all([
                ct.probeViaFetch("https://test.count.ly/o/ping", { mode: "cors", headers: { "X-Gateway-Key": "k1" } }),
                ct.probeViaFetch("https://test.count.ly/feedback/nps", { mode: "no-cors" })
            ]);
        }
        finally {
            window.fetch = savedFetch;
        }
        return probes.then(() => {
            expect(inits[0].headers).to.deep.equal({ "X-Gateway-Key": "k1" });
            expect(inits[1].headers).to.equal(undefined);
        });
    });

    it("probes with the headers given at init", () => {
        var pingHeaders = [];
        cy.intercept("OPTIONS", "https://test.count.ly/**", { statusCode: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "x-gateway-key", "access-control-allow-methods": "GET, POST, OPTIONS" } });
        cy.intercept("GET", "https://test.count.ly/**", (req) => {
            if (req.url.indexOf("/o/ping") !== -1) {
                pingHeaders.push(req.headers["x-gateway-key"]);
            }
            req.reply({ statusCode: 400, headers: { "access-control-allow-origin": "*" }, body: { result: "Missing parameter" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                test_mode: true,
                debug: true,
                headers: { "X-Gateway-Key": "k1" },
                fake_request_handler: function(req) {
                    if (req.functionName === "server_config") {
                        return { status: 200, responseText: JSON.stringify({ v: 2, t: 1786273877636, c: {}, ct: 1 }) };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            cy.wait(3000).then(() => {
                expect(pingHeaders).to.deep.equal(["k1"]);
            });
        });
    });
});
