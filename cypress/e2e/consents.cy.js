/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
// import * as Countly from "../../dist/countly_umd.js";
var hp = require("../support/helper.js");

function initMain(consent) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        require_consent: consent,
        device_id: "György Ligeti",
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}

/**
 * Checks a queue object for valid/correct values/limits during consent tests
 * @param {Array} eq - events queue 
 * @param {Array} eventArr - events array for the events to test
 * @param {boolean} custom - custom event check
 * @param {boolean} internalOnly - internal event check
 */
function consent_check(eq, eventArr, custom, internalOnly) {
    var i = 0;
    var b = i;
    var len = eventArr.length;
    if (custom) {
        len = 0;
    }
    if (internalOnly) {
        b = i + 1;
        len = eventArr.length - 1;
    }
    while (i < len) {
        expect(eq[i].key).to.equal(eventArr[b].key);
        expect(eq[i].count).to.equal(eventArr[b].count);
        expect(eq[i].segmentation[eventArr[b].count]).to.equal(eventArr[b].segmentation[eventArr[b].count]);
        i++;
        b++;
    }
}

// tests
describe("Consent tests", () => {
    it("Only custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["events"]);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                consent_check(eq, hp.eventArray, true);
            });
        });
    });
    it("All but custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback", "push", "clicks"]);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(6);
                consent_check(eq, hp.eventArray, false, true);
            });
        });
    });
    it("All consents given and all events should be recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback", "events", "push", "clicks"]);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(7);
                consent_check(eq, hp.eventArray, false, false);
            });
        });
    });
    it("No consent required and all events should be recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain(false);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(7);
                consent_check(eq, hp.eventArray, false, false);
            });
        });
    });
    it("Non-merge ID change should reset all consents", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback", "push", "clicks"]);
            Countly.change_id("Richard Wagner II", false);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Merge ID change should not reset consents", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback", "push", "clicks"]);
            Countly.change_id("Richard Wagner the second", true);
            hp.events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(6);
                consent_check(eq, hp.eventArray, false, true);
            });
        });
    });
});