import { stripTrailingSlash } from "./Utils.js";

/** Per-probe deadline. */
var CT_PROBE_TIMEOUT = 10000;

/** Server-side limits on the report. */
var CT_MAX_ROWS = 32;
var CT_MAX_BYTES = 8192;
var CT_MAX_DETAIL = 256;

/**
 * Resolve a probe path against the SDK's configured server URL.
 * The configured URL may carry a path prefix for reverse-proxied deployments,
 * so the path is appended to it rather than to the bare origin.
 * @param {String} baseUrl - the SDK's configured server URL
 * @param {String} path - probe path, always starting with a slash
 * @returns {String} absolute probe URL
 */
function buildProbeUrl(baseUrl, path) {
    return stripTrailingSlash(baseUrl) + path;
}

/**
 * Explanations carried in the report's `e` field. Each says what was expected and what
 * arrived instead, so an operator reading a single row does not have to know the grading
 * rules to understand the verdict.
 */
var CT_DETAIL = {
    TIMEOUT: "Expected an answer within " + (CT_PROBE_TIMEOUT / 1000) + "s, but the request never completed.",
    TRANSPORT: "Expected the server to answer, but no readable answer arrived: the connection failed (DNS, TLS, certificate pinning), or a firewall or proxy blocked the request or answered without Countly's CORS headers.",
    REDIRECTED_HIDDEN: "Expected a direct answer from Countly, but the request was redirected away; the browser hides the redirect status.",
    OPAQUE: "Reachable, but the answer could not be read: it arrived without Countly's CORS headers, so a firewall or proxy between the device and the server may be removing or rewriting them.",
    NOT_RUN: "Not run, because the battery deadline elapsed before this row was reached."
};

/**
 * Explain a failing status in terms of what was expected of it.
 * @param {Number} status - the HTTP status observed
 * @param {Boolean} strict2xx - whether this row has no legitimate 4xx
 * @returns {String} the explanation for the `e` field
 */
function detailForStatus(status, strict2xx) {
    if (status >= 300 && status < 400) {
        return "Expected a direct answer from Countly, but the request was redirected away with HTTP " + status + ".";
    }
    if (status === 403) {
        return "Expected the Countly application to answer, but a proxy rejected the request with HTTP " + status + " before it got there.";
    }
    if (status >= 500) {
        return "Expected the Countly application to answer, but the gateway or an upstream service failed with HTTP " + status + ".";
    }
    if (strict2xx) {
        return "Expected a 2xx from this route, which has no legitimate 4xx, but got HTTP " + status + ".";
    }
    return "Expected the Countly application to answer, but it returned HTTP " + status + ".";
}

/**
 * Grade a single probe outcome into a report row fragment.
 * The question is "did the Countly application answer", not "did it succeed", so an
 * application-level rejection counts as reachable while a proxy block does not.
 * @param {Object} outcome - what the transport observed: {status}, {rejected, timedOut},
 *                           {redirected} for an opaque redirect, {opaque} for a resolved
 *                           opaque response
 * @param {Object} [opts] - {strict2xx} for rows that have no legitimate 4xx
 * @returns {Object} {ok, st} plus {e} when there is a detail worth carrying
 */
function gradeProbe(outcome, opts) {
    opts = opts || {};

    if (outcome.rejected) {
        return { ok: false, st: 0, e: outcome.timedOut ? CT_DETAIL.TIMEOUT : CT_DETAIL.TRANSPORT };
    }
    if (outcome.redirected) {
        return { ok: false, st: 0, e: CT_DETAIL.REDIRECTED_HIDDEN };
    }
    // an opaque response cannot be inspected, so the strict-2xx rule cannot apply to it
    if (outcome.opaque) {
        return { ok: true, st: 0, e: CT_DETAIL.OPAQUE };
    }

    var status = outcome.status;
    if (status >= 200 && status < 300) {
        return { ok: true, st: status };
    }
    if (status >= 400 && status < 500 && status !== 403 && !opts.strict2xx) {
        return { ok: true, st: status };
    }
    return { ok: false, st: status, e: detailForStatus(status, opts.strict2xx) };
}

/**
 * Fold the probes of a multi-path row into the single row the report carries.
 * Each path is a separate nginx location that can be blocked on its own, so the row
 * is only reachable when every one of them answered, and it keeps the opaque qualifier
 * when any of them could only be reached opaquely.
 * @param {Array} results - graded probes, each {ok, st, ms} plus optional {e}
 * @returns {Object} combined row {ok, st, ms, n} plus optional {e}
 */
function combineRow(results) {
    var firstFailure = null;
    var total = 0;
    var anyOpaque = false;

    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        total += result.ms;
        if (!result.ok && !firstFailure) {
            firstFailure = result;
        }
        if (result.e === CT_DETAIL.OPAQUE) {
            anyOpaque = true;
        }
    }

    var row = {
        ok: !firstFailure,
        st: firstFailure ? firstFailure.st : results[0].st,
        ms: total,
        n: results.length
    };
    if (firstFailure) {
        row.e = firstFailure.e;
    }
    else if (anyOpaque) {
        row.e = CT_DETAIL.OPAQUE;
    }
    return row;
}

/**
 * The probe list lives here rather than on the wire, which is why the server's armed flag
 * never has to change when this list evolves. Rows with several paths hit separate nginx
 * locations that can be blocked independently.
 */
var CT_ROWS = [
    { f: "core", tier: 1, paths: ["/o/ping"], strict2xx: true },
    { f: "core-write", tier: 1, paths: ["/i"] },
    { f: "sc", tier: 1, paths: [] },
    { f: "rc", tier: 1, paths: ["/o/sdk?method=rc"] },
    { f: "ab", tier: 1, paths: ["/o/sdk?method=ab_fetch_variants"] },
    { f: "feedback", tier: 1, paths: ["/o/sdk?method=feedback"] },
    { f: "feedback-widget", tier: 1, paths: ["/o/surveys/nps/widget", "/o/surveys/survey/widget", "/o/feedback/widget"] },
    { f: "feedback-submit", tier: 1, paths: ["/i/feedback/inputs"] },
    { f: "content", tier: 1, paths: ["/o/sdk/content"] },
    { f: "feedback-page", tier: 2, paths: ["/feedback/nps", "/feedback/survey", "/feedback/rating"] },
    { f: "feedback-assets", tier: 2, paths: ["/surveys/images/ct-probe.png", "/star-rating/images/ct-probe.png"], strict2xx: true },
    { f: "content-page", tier: 2, paths: ["/_external/content/"] }
];

/**
 * How many probes the battery may issue. A Tier 2 path can cost two requests when the
 * CORS attempt is rejected and the opaque fallback runs, and the deadline has to allow
 * for the worst case rather than the happy path.
 * @param {String} tier2 - "cors-first" or "unsupported"
 * @returns {Number} worst-case request count
 */
function attemptedRequests(tier2) {
    return CT_ROWS.reduce((total, row) => {
        if (row.tier !== 2) {
            return total + row.paths.length;
        }
        if (tier2 === "unsupported") {
            return total;
        }
        return total + (row.paths.length * (tier2 === "cors-first" ? 2 : 1));
    }, 0);
}

/**
 * Deadline for the whole battery, measured over the requests actually attempted rather
 * than the rows in the table — a row with three paths costs three requests.
 * @param {Number} attemptedRequests - how many probes the battery intends to issue
 * @returns {Number} cap in milliseconds
 */
function batteryCapMs(attemptedRequests) {
    return (attemptedRequests * CT_PROBE_TIMEOUT) + 30000;
}

/**
 * Stamp a graded result with its feature key, in the field order the report documents,
 * so an operator reading the raw JSON sees which row it is before anything else.
 * @param {String} f - feature key
 * @param {Object} result - graded row body
 * @returns {Object} report row
 */
function toReportRow(f, result) {
    var row = { f: f };
    ["ok", "st", "ms", "n", "e", "sk"].forEach((key) => {
        if (typeof result[key] !== "undefined") {
            row[key] = result[key];
        }
    });
    return row;
}

/**
 * Probe a single path, falling back to an opaque attempt where that is meaningful.
 * @param {Object} ctx - battery context
 * @param {Object} row - row definition from CT_ROWS
 * @param {String} path - the path to probe
 * @returns {Promise} resolves to the outcome, with ms covering every attempt made
 */
function probePath(ctx, row, path) {
    var url = buildProbeUrl(ctx.url, path);
    var mayFallBack = row.tier === 2 && ctx.tier2 === "cors-first";
    // the SDK calls the Tier 1 routes itself, with its headers; the browser loads the Tier 2 pages and images without them
    var headers = row.tier === 1 ? ctx.headers : undefined;

    return ctx.probe(url, { mode: "cors", headers: headers }).then((first) => {
        if (!first.rejected || !mayFallBack) {
            return first;
        }
        // On Tier 1 a rejection is simply a failure. On Tier 2 it can also mean a middlebox
        // stripped the CORS headers in transit, so one opaque retry separates "unreachable"
        // from "reachable but tampered with".
        return ctx.probe(url, { mode: "no-cors" }).then((second) => {
            var merged = { ms: first.ms + second.ms };
            ["status", "rejected", "timedOut", "redirected", "opaque"].forEach((key) => {
                if (typeof second[key] !== "undefined") {
                    merged[key] = second[key];
                }
            });
            return merged;
        });
    });
}

/**
 * Probe one row's paths in sequence and fold them into a single report row.
 * @param {Object} ctx - battery context
 * @param {Object} row - row definition from CT_ROWS
 * @returns {Promise} resolves to the report row
 */
function runRow(ctx, row) {
    var graded = [];

    var chain = row.paths.reduce((previous, path) => {
        return previous.then(() => {
            return probePath(ctx, row, path).then((outcome) => {
                var result = gradeProbe(outcome, { strict2xx: row.strict2xx });
                result.ms = outcome.ms;
                graded.push(result);
            });
        });
    }, Promise.resolve());

    return chain.then(() => {
        return toReportRow(row.f, row.paths.length > 1 ? combineRow(graded) : graded[0]);
    });
}

/**
 * Run the connection test battery once and build the report.
 * Probes are sequential and carry no identity, so nothing here depends on consent
 * and nothing the server does with them can write.
 * @param {Object} ctx - {url, sdkName, sdkVersion, sc: {status, ms}, probe, tier2, now, headers}
 *                       where probe(url, opts) resolves to an outcome carrying its own ms,
 *                       headers are the init headers the SDK sends with its own requests,
 *                       tier2 is "cors-first" or "unsupported", and the optional now() replaces Date.now for the deadline
 * @returns {Promise} resolves to the ct_results report object
 */
function runConnectionTest(ctx) {
    var results = [];
    var now = ctx.now || Date.now;
    var deadline = now() + batteryCapMs(attemptedRequests(ctx.tier2));

    var chain = CT_ROWS.reduce((previous, row) => {
        return previous.then(() => {
            if (row.f === "sc") {
                var sc = gradeProbe({ status: ctx.sc.status });
                sc.ms = ctx.sc.ms;
                results.push(toReportRow(row.f, sc));
                return null;
            }
            if (row.tier === 2 && ctx.tier2 === "unsupported") {
                results.push({ f: row.f, sk: "unsupported" });
                return null;
            }
            // the cap only governs rows that would cost a request; the free rows above
            // are reported either way
            if (now() >= deadline) {
                results.push({ f: row.f, ok: false, st: 0, e: CT_DETAIL.NOT_RUN });
                return null;
            }
            return runRow(ctx, row).then((result) => {
                results.push(result);
            });
        });
    }, Promise.resolve());

    return chain.then(() => {
        return {
            ts: Date.now(),
            sdk: { name: ctx.sdkName, version: ctx.sdkVersion },
            results: results
        };
    });
}

/**
 * Bring a report inside the server's limits before it is queued.
 * The opaque qualifier survives every reduction: it is not diagnostic detail but the mark
 * that keeps a low-confidence green row from reading as authoritative.
 * @param {Object} report - the assembled report
 * @returns {Object} the same report, trimmed to at most 32 rows and 8 KB
 */
function capReport(report) {
    report.results = report.results.slice(0, CT_MAX_ROWS);
    report.results.forEach((row) => {
        if (typeof row.e === "string" && row.e.length > CT_MAX_DETAIL) {
            row.e = row.e.substring(0, CT_MAX_DETAIL);
        }
    });

    if (JSON.stringify(report).length > CT_MAX_BYTES) {
        report.results.forEach((row) => {
            if (row.e && row.e !== CT_DETAIL.OPAQUE) {
                delete row.e;
            }
        });
    }
    return report;
}

/**
 * Issue one probe: a bare GET carrying no app_key, no device_id and no payload, so the
 * server rejects it on its first validation check without ever reaching application work.
 * Only the given headers are set, so a probe meets the same gateway rules and preflight
 * as the SDK's own requests to that route.
 * @param {String} url - absolute probe URL
 * @param {Object} opts - {mode} "cors" for a readable status, "no-cors" for an opaque
 *                        fallback when the CORS attempt was rejected, and {headers} for a
 *                        CORS probe
 * @returns {Promise} resolves to an outcome object carrying its own ms
 */
function probeViaFetch(url, opts) {
    var start = Date.now();
    // ct=1 marks probe traffic in server logs; the cache-buster keeps a CDN or the browser
    // cache from answering on the origin's behalf and reporting a dead server as healthy
    var target = url + (url.indexOf("?") === -1 ? "?" : "&") + "ct=1&_=" + start;
    var timedOut = false;
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer;
    // without AbortController a hung request can never be cancelled, so the probe settles on its own deadline
    var deadline = new Promise((resolve) => {
        timer = setTimeout(() => {
            timedOut = true;
            if (controller) {
                controller.abort();
            }
            resolve({ rejected: true, timedOut: true, ms: Date.now() - start });
        }, CT_PROBE_TIMEOUT);
    });

    var init = {
        method: "GET",
        cache: "no-store",
        credentials: "omit"
    };
    if (controller) {
        init.signal = controller.signal;
    }
    if (opts && opts.mode === "no-cors") {
        // no-cors forbids any redirect mode but follow, and every response is opaque anyway
        init.mode = "no-cors";
    }
    else {
        init.mode = "cors";
        init.redirect = "manual";
        if (opts && opts.headers) {
            init.headers = opts.headers;
        }
    }

    var request = fetch(target, init).then((response) => {
        var ms = Date.now() - start;
        if (response.type === "opaqueredirect") {
            return { redirected: true, ms: ms };
        }
        if (response.type === "opaque") {
            return { opaque: true, ms: ms };
        }
        return { status: response.status, ms: ms };
    }).catch(() => {
        return { rejected: true, timedOut: timedOut, ms: Date.now() - start };
    });

    return Promise.race([request, deadline]).then((outcome) => {
        clearTimeout(timer);
        return outcome;
    });
}

export {
    buildProbeUrl,
    gradeProbe,
    combineRow,
    runConnectionTest,
    batteryCapMs,
    attemptedRequests,
    probeViaFetch,
    capReport,
    CT_DETAIL,
    CT_ROWS,
    CT_PROBE_TIMEOUT
};
