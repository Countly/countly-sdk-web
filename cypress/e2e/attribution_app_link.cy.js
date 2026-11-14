/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

const APP_ID = "5f2b1c3d4e5f6a7b8c9d0e1f";

function initPage(searchQuery, extra) {
    var config = {
        app_key: hp.appKey,
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        getSearchQuery: function() {
            return searchQuery;
        }
    };
    for (var key in extra) {
        config[key] = extra[key];
    }
    Countly.init(config);
}

describe("Attribution app link tests", () => {
    it("Builds the smart link with this page's utm tags and allow-listed parameters", () => {
        hp.haltAndClearStorage(() => {
            initPage("?utm_source=news letter&utm_campaign=spring&ref=r1&foo=bar&cly_clk=k1&gclid=g1&utm_source=second", {
                attribution_link_host: "https://go.example.com",
                attribution_app_id: APP_ID,
                attribution_landing_params: ["ref"]
            });
            expect(Countly.attribution.appLink({ code: "spring_sale", path: "/product/42" }))
                .to.equal("https://go.example.com/at/" + APP_ID + "/spring_sale/product/42?utm_source=news%20letter&utm_campaign=spring&ref=r1");
        });
    });
    it("Uses the server URL as the link host when none is set, and keeps a host's path", () => {
        hp.haltAndClearStorage(() => {
            initPage("", { attribution_app_id: APP_ID });
            expect(Countly.attribution.appLink({ code: "c1" })).to.equal("https://your.domain.count.ly/at/" + APP_ID + "/c1");
            expect(Countly.attribution.appLink({ code: "c1", host: "https://example.com/countly/" })).to.equal("https://example.com/countly/at/" + APP_ID + "/c1");
        });
    });
    it("Adds the given parameters, which win over this page's, and encodes the path", () => {
        hp.haltAndClearStorage(() => {
            initPage("?utm_source=page&utm_medium=web", { attribution_link_host: "https://go.example.com", attribution_app_id: APP_ID });
            expect(Countly.attribution.appLink({
                code: "c1",
                path: "shop//a b/ü",
                params: { utm_source: "override", promo: "10%&more", skip: null, skip2: undefined }
            })).to.equal("https://go.example.com/at/" + APP_ID + "/c1/shop/a%20b/%C3%BC?utm_medium=web&utm_source=override&promo=10%25%26more");
        });
    });
    it("Carries qr=1 as an ordinary link parameter", () => {
        hp.haltAndClearStorage(() => {
            initPage("?utm_source=print", { attribution_link_host: "https://go.example.com", attribution_app_id: APP_ID });
            expect(Countly.attribution.appLink({ code: "Spring_Sale", params: { qr: 1 } }))
                .to.equal("https://go.example.com/at/" + APP_ID + "/Spring_Sale?utm_source=print&qr=1");
        });
    });
    it("Reads this page's query when it is called", () => {
        hp.haltAndClearStorage(() => {
            var query = "?utm_campaign=first";
            initPage("", { attribution_link_host: "https://go.example.com", attribution_app_id: APP_ID, getSearchQuery: () => query });
            query = "?utm_campaign=later";
            expect(Countly.attribution.appLink({ code: "c1" })).to.equal("https://go.example.com/at/" + APP_ID + "/c1?utm_campaign=later");
        });
    });
    it("Builds the intent:// form with the package and the browser fallback", () => {
        hp.haltAndClearStorage(() => {
            initPage("?utm_source=page", {
                attribution_link_host: "https://go.example.com",
                attribution_app_id: APP_ID,
                attribution_android_package: "com.example.shop"
            });
            const link = "https://go.example.com/at/" + APP_ID + "/c1/product/42?utm_source=page";
            expect(Countly.attribution.appLink({ code: "c1", path: "/product/42", android: "intent" }))
                .to.equal("intent://go.example.com/at/" + APP_ID + "/c1/product/42?utm_source=page#Intent;scheme=https;package=com.example.shop;S.browser_fallback_url=" + encodeURIComponent(link) + ";end");
            // the https form unless "intent" is asked for
            expect(Countly.attribution.appLink({ code: "c1", path: "/product/42", android: "https" })).to.equal(link);
        });
    });
    it("Leaves out a missing or invalid package in the intent:// form", () => {
        hp.haltAndClearStorage(() => {
            initPage("", { attribution_link_host: "http://localhost:6001", attribution_app_id: APP_ID });
            const link = "http://localhost:6001/at/" + APP_ID + "/c1";
            const intent = "intent://localhost:6001/at/" + APP_ID + "/c1#Intent;scheme=http;S.browser_fallback_url=" + encodeURIComponent(link) + ";end";
            expect(Countly.attribution.appLink({ code: "c1", android: "intent" })).to.equal(intent);
            expect(Countly.attribution.appLink({ code: "c1", android: "intent", androidPackage: "not a package" })).to.equal(intent);
        });
    });
    it("Builds the plain tracking link without a valid app id", () => {
        hp.haltAndClearStorage(() => {
            initPage("?utm_source=page", { attribution_link_host: "https://go.example.com" });
            expect(Countly.attribution.appLink({ code: "c1", path: "/p" })).to.equal("https://go.example.com/at/c1/p?utm_source=page");
            expect(Countly.attribution.appLink({ code: "c1", appId: "not-an-id" })).to.equal("https://go.example.com/at/c1?utm_source=page");
        });
    });
    it("Returns null for an unusable code or host", () => {
        hp.haltAndClearStorage(() => {
            initPage("", { attribution_app_id: APP_ID });
            expect(Countly.attribution.appLink({ code: "a/b" })).to.equal(null);
            expect(Countly.attribution.appLink({ code: "" })).to.equal(null);
            expect(Countly.attribution.appLink({})).to.equal(null);
            expect(Countly.attribution.appLink()).to.equal(null);
            expect(Countly.attribution.appLink({ code: "c1", host: "go.example.com" })).to.equal(null);
            expect(Countly.attribution.appLink({ code: "c1", host: "javascript:alert(1)//" })).to.equal(null);
        });
    });
    it("Sends nothing", () => {
        hp.haltAndClearStorage(() => {
            initPage("", { attribution_app_id: APP_ID });
            cy.fetch_local_request_queue().then((rq) => {
                cy.fetch_local_event_queue().then((eq) => {
                    Countly.attribution.appLink({ code: "c1", path: "/p" });
                    Countly.attribution.appLink({ code: "c1", android: "intent" });
                    cy.fetch_local_request_queue().then((rq2) => {
                        expect(rq2).to.deep.equal(rq);
                    });
                    cy.fetch_local_event_queue().then((eq2) => {
                        expect(eq2).to.deep.equal(eq);
                    });
                });
            });
        });
    });
});
