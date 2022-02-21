/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        require_consent: true,
        device_id: "György Ligeti",
        tests: true,
        max_events: -1,
        debug: true
    });
}

// gathered events to add
function events() {
    Countly.add_event({
        key: "a",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
    Countly.add_event({
        key: "[CLY]_view",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
    Countly.add_event({
        key: "[CLY]_nps",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
    Countly.add_event({
        key: "[CLY]_survey",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
    Countly.add_event({
        key: "[CLY]_star_rating",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
    Countly.add_event({
        key: "[CLY]_orientation",
        count: 1,
        segmentation: {
            "custom key": "custom value",
        },
    });
}
// tests
describe("Consent tests", () => {
    it("Only custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_consent(["events"]);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                expect(eq[0].key).to.equal("a");
            });
        });
    });
    it("All but custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback"]);
            Countly.track_pageview();
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(5);
                expect(eq[0].key).to.equal("[CLY]_view");
                expect(eq[1].key).to.equal("[CLY]_nps");
                expect(eq[2].key).to.equal("[CLY]_survey");
                expect(eq[3].key).to.equal("[CLY]_star_rating");
                expect(eq[4].key).to.equal("[CLY]_orientation");
            });
        });
    });
    it("Non-merge ID change should reset all consents", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback"]);
            Countly.change_id("Richard Wagner II", false);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Merge ID change should not reset consents", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback"]);
            Countly.change_id("Richard Wagner the second", true);
            Countly.track_pageview();
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(5);
                expect(eq[0].key).to.equal("[CLY]_view");
                expect(eq[1].key).to.equal("[CLY]_nps");
                expect(eq[2].key).to.equal("[CLY]_survey");
                expect(eq[3].key).to.equal("[CLY]_star_rating");
                expect(eq[4].key).to.equal("[CLY]_orientation");
            });
        });
    });
});