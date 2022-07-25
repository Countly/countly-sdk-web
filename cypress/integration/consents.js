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
        test_mode: true,
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
            1: "1"
        }
    },
    // rest can be internal events
    {
        key: "[CLY]_view",
        count: 2,
        segmentation: {
            2: "2"
        }
    },
    {
        key: "[CLY]_nps",
        count: 3,
        segmentation: {
            3: "3"
        }
    },
    {
        key: "[CLY]_survey",
        count: 4,
        segmentation: {
            4: "4"
        }
    },
    {
        key: "[CLY]_star_rating",
        count: 5,
        segmentation: {
            5: "5"
        }
    },
    {
        key: "[CLY]_orientation",
        count: 6,
        segmentation: {
            6: "6"
        }
    }
];
// event adding loop
function events() {
    for (var i = 0, len = eventArray.length; i < len; i++) {
        Countly.add_event(eventArray[i]);
    }
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
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                consent_check(eq, eventArray, true);
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
                consent_check(eq, eventArray, false, true);
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
                consent_check(eq, eventArray, false, false);
            });
        });
    });
    it("No consent required and all events should be recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain(false);
            events();
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(6);
                consent_check(eq, eventArray, false, false);
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
                consent_check(eq, eventArray, false, true);
            });
        });
    });
});