/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        use_session_cookie: false,
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}

// the page goes to the background, as when the visitor switches to another tab
function hidePage() {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
}

describe("Time the page spends in the background", () => {
    afterEach(() => {
        delete document.hidden;
    });

    it("is not counted in the session when the page is closed in the background", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_sessions();
            hidePage();
            cy.wait(3000).then(() => {
                Countly.end_session();
                var ends = Countly._internals.getLocalQueues().requestQ.filter((r) => r.end_session);
                expect(ends.length).to.equal(1);
                expect(ends[0].session_duration).to.be.below(2);
            });
        });
    });

    it("is not given to a view that starts in the background", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_sessions();
            Countly.track_pageview("first");
            cy.wait(3000).then(() => {
                hidePage();
                Countly.track_pageview("second");
                Countly.track_pageview("third");
                var ended = Countly._internals.getLocalQueues().eventQ.filter((e) => e.key === "[CLY]_view" && typeof e.dur !== "undefined");
                var first = ended.filter((e) => e.segmentation.name === "first");
                var second = ended.filter((e) => e.segmentation.name === "second");
                expect(first.length).to.equal(1);
                expect(first[0].dur).to.be.at.least(2);
                expect(second.length).to.equal(1);
                expect(second[0].dur).to.be.below(1);
            });
        });
    });
});
