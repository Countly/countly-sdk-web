/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

// The Cypress test server (see cypress.config.js) answers /o/sdk/content with:
//   { html: "http://test/_external/content?id=111&uid=tester&app_id=222", geo: {...} }
// i.e. a full URL on a foreign origin/path, exactly like a server that doesn't know it is
// behind a reverse proxy. #displayContent must rebase it onto the SDK's configured url.

describe("Content proxy path rebasing", () => {
    afterEach(() => {
        cy.task("stopServer");
    });

    it("rebases the iframe src onto the SDK url and appends the encoded provided_url path", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "http://localhost:9000/countly", // proxied: Countly reached under a /countly prefix
                debug: true
            });
            Countly.content.enterContentZone();
            // enterContentZone waits ~4s after init before firing the first request
            cy.wait(6000).then(() => {
                var iframe = document.getElementById("cly-content-iframe");
                expect(iframe, "content iframe should be created").to.exist;
                // server returned http://test/_external/content?...; rebased onto this.url with
                // provided_url appended (path only, encoded) so the content page's assets resolve
                expect(iframe.getAttribute("src")).to.eq(
                    "http://localhost:9000/countly/_external/content?id=111&uid=tester&app_id=222&provided_url=%2Fcountly"
                );
            });
        });
    });
});

describe("parseUrlParts helper", () => {
    beforeEach(() => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", test_mode: true });
        });
    });

    it("splits an absolute URL into origin/path/query/hash", () => {
        var parts = Countly._internals.parseUrlParts("http://localhost:9000/reverse-proxy/countly/feedback/rating?a=1#frag");
        expect(parts.origin).to.eq("http://localhost:9000");
        expect(parts.pathname).to.eq("/reverse-proxy/countly/feedback/rating");
        expect(parts.search).to.eq("?a=1");
        expect(parts.hash).to.eq("#frag");
    });

    it("treats a scheme-less (relative) URL as an empty origin and a full path", () => {
        var parts = Countly._internals.parseUrlParts("/reverse-proxy/countly");
        expect(parts.origin).to.eq("");
        expect(parts.pathname).to.eq("/reverse-proxy/countly");
    });

    it("returns an empty path for an origin with no path", () => {
        var parts = Countly._internals.parseUrlParts("https://main.server.ly");
        expect(parts.origin).to.eq("https://main.server.ly");
        expect(parts.pathname).to.eq("");
    });

    it("is safe for non-string input", () => {
        var parts = Countly._internals.parseUrlParts(undefined);
        expect(parts).to.eql({ origin: "", pathname: "", search: "", hash: "" });
    });
});
