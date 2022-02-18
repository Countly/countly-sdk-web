/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        session_update: 3,
        tests: true,
        max_events: -1,
        debug: true
    });
}
// an event object to use 
const eventObj = {
    key: "in_app_purchase",
    count: 3,
    sum: 2.97,
    dur: 1000,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti",
    },
};
// a timed event object
const timedEventObj = {
    key: "timed",
    count: 1,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti",
    },
};

describe('Events tests ', () => {
    it('Checks if adding events works', () => {
        hp.haltAndClearStorage();
        initMain();
        Countly.add_event(eventObj);
        cy.fetch_local_event_queue().then((e) => {
            const queue = JSON.parse(e);
            expect(queue.length).to.equal(1);
            cy.check_event(queue[0], eventObj);
        });
    });
    it('Checks if timed events works', () => {
        hp.haltAndClearStorage();
        initMain();
        // start the timer
        Countly.start_event("timed");
        // wait for a while
        cy.fixture('variables').then((ob) => {
            cy.wait(ob.mWait).then(() => {
                const dur = ob.mWait / 1000;
                // end the event and check duration
                Countly.end_event(timedEventObj);
                cy.fetch_local_event_queue().then((e) => {
                    const queue = JSON.parse(e);
                    expect(queue.length).to.equal(1);
                    cy.check_event(queue[0], timedEventObj, dur);
                });
            });
        });
    });
});
