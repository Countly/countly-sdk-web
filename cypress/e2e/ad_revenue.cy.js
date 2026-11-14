/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(extra) {
    var config = {
        app_key: hp.appKey,
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true
    };
    for (var key in extra) {
        config[key] = extra[key];
    }
    Countly.init(config);
}

function adRevenueEvents(eq) {
    return eq.filter((e) => e.key === "[CLY]_ad_revenue");
}

// the fields the server reads, without the ones every event gets (timestamp, hour, dow, id, cvid)
function payloadOf(e) {
    var out = { key: e.key, count: e.count, sum: e.sum };
    if (e.segmentation !== undefined) {
        out.segmentation = e.segmentation;
    }
    return out;
}

describe("Ad revenue tests", () => {
    it("Sends the exact event on /i", () => {
        hp.haltAndClearStorage(() => {
            const sentQueries = [];
            cy.intercept("https://your.domain.count.ly/i*", (req) => {
                sentQueries.push(req.method === "GET" ? req.url.split("?")[1] : req.body);
                req.reply({ statusCode: 200, body: { result: "Success" } });
            });
            initMain({ test_mode: false, test_mode_eq: false });
            Countly.recordAdRevenue(0.0042, { network: "applovin", placement: "level_end", format: "interstitial", currency: "USD", precision: "publisher_defined" });
            cy.wait(3000).then(() => {
                const events = [];
                sentQueries.filter((q) => typeof q === "string").forEach((q) => {
                    q.split("&").filter((part) => part.indexOf("events=") === 0).forEach((part) => {
                        JSON.parse(decodeURIComponent(part.substring("events=".length))).forEach((e) => events.push(e));
                    });
                });
                const sent = adRevenueEvents(events);
                expect(sent.length).to.equal(1);
                expect(payloadOf(sent[0])).to.deep.equal({
                    key: "[CLY]_ad_revenue",
                    count: 1,
                    sum: 0.0042,
                    segmentation: { network: "applovin", placement: "level_end", format: "interstitial", currency: "USD", precision: "publisher_defined" }
                });
            });
        });
    });
    it("Records one event per call, with only the segments given", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordAdRevenue(1.5, { network: "admob", format: "banner", placement: "", currency: null });
            Countly.recordAdRevenue(0.25);
            Countly.recordAdRevenue(2, { precision: 3 });
            cy.fetch_local_event_queue().then((eq) => {
                const sent = adRevenueEvents(eq).map(payloadOf);
                expect(sent).to.deep.equal([
                    { key: "[CLY]_ad_revenue", count: 1, sum: 1.5, segmentation: { network: "admob", format: "banner" } },
                    // an event with no segments has the empty segmentation every event has
                    { key: "[CLY]_ad_revenue", count: 1, sum: 0.25, segmentation: {} },
                    { key: "[CLY]_ad_revenue", count: 1, sum: 2, segmentation: { precision: "3" } }
                ]);
            });
        });
    });
    it("Takes a numeric string amount and records nothing for an amount that is not a number of zero or more", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordAdRevenue("0.75");
            Countly.recordAdRevenue(0);
            Countly.recordAdRevenue(-1);
            Countly.recordAdRevenue("abc");
            Countly.recordAdRevenue("");
            Countly.recordAdRevenue(NaN);
            Countly.recordAdRevenue(Infinity);
            Countly.recordAdRevenue(undefined);
            Countly.recordAdRevenue({ amount: 1 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(adRevenueEvents(eq).map((e) => e.sum)).to.deep.equal([0.75, 0]);
            });
        });
    });
    it("Needs the events consent", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true });
            Countly.add_consent(["attribution", "sessions", "users"]);
            Countly.recordAdRevenue(1);
            cy.fetch_local_event_queue().then((eq) => {
                expect(adRevenueEvents(eq).length).to.equal(0);
                Countly.add_consent("events");
                Countly.recordAdRevenue(2, { network: "admob" });
                cy.fetch_local_event_queue().then((eq2) => {
                    expect(adRevenueEvents(eq2).map(payloadOf)).to.deep.equal([
                        { key: "[CLY]_ad_revenue", count: 1, sum: 2, segmentation: { network: "admob" } }
                    ]);
                });
            });
        });
    });
    it("Keeps the event when the behavior settings filter the app's events", () => {
        hp.haltAndClearStorage(() => {
            initMain({ behavior_settings: { c: { eb: ["[CLY]_ad_revenue", "purchase"] } } });
            Countly.recordAdRevenue(1);
            Countly.add_event({ key: "purchase", count: 1 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(adRevenueEvents(eq).length).to.equal(1);
                expect(eq.filter((e) => e.key === "purchase").length).to.equal(0);
            });
        });
    });
});
