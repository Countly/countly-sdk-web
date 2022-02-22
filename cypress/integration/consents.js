/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(consent) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        require_consent: consent,
        device_id: "György Ligeti",
        tests: true,
        max_events: -1,
        debug: true
    });
}
// gathered events. count and segmentation key/values must be consistent
const eventArray = [
    // first event must be custom event
    {
        key: "a",
        count: 1,
        segmentation: {
            1: "1",
        },
    },
    // rest can be internal events
    {
        key: "[CLY]_view",
        count: 2,
        segmentation: {
            2: "2",
        },
    },
    {
        key: "[CLY]_nps",
        count: 3,
        segmentation: {
            3: "3",
        },
    },
    {
        key: "[CLY]_survey",
        count: 4,
        segmentation: {
            4: "4",
        },
    },
    {
        key: "[CLY]_star_rating",
        count: 5,
        segmentation: {
            5: "5",
        },
    },
    {
        key: "[CLY]_orientation",
        count: 6,
        segmentation: {
            6: "6",
        },
    }
];
// event adding loop
function events() {
    for (var i = 0, len = eventArray.length; i < len; i++) {
        Countly.add_event(eventArray[i]);
    }
}

// tests
describe("Consent tests", () => {
    it("Only custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["events"]);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.consent_check(eq, eventArray, true);
            });
        });
    });
    it("All but custom event should be sent to the queue", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback"]);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(5);
                cy.consent_check(eq, eventArray, false, true);
            });
        });
    });
    it("All consents given and all events should be recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback", "events"]);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(6);
                cy.consent_check(eq, eventArray, false, false);
            });
        });
    });
    it("No consent required and all events should be recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain(false);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(6);
                cy.consent_check(eq, eventArray, false, false);
            });
        });
    });
    it("Non-merge ID change should reset all consents", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);
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
            initMain(true);
            Countly.add_consent(["sessions", "views", "users", "star-rating", "apm", "feedback"]);
            Countly.change_id("Richard Wagner the second", true);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(5);
                cy.consent_check(eq, eventArray, false, true);
            });
        });
    });
});