/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        session_update: 3,
        tests: true,
        max_events: -1
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
        // halt countly if it was initiated before
        if (Countly.device_id !== undefined) {
            Countly.halt();
        }
        initMain();
        Countly.add_event(eventObj);
        cy.wait(50).then(()=>{
            cy.fetch_local_event_queue().then((e)=>{
                let queue = JSON.parse(e);
                cy.check_event(queue[0], eventObj);
            });
        });
    });
    it('Checks if timed events works', () => {
        Countly.halt();
        initMain();
        // start the timer
        Countly.start_event("timed");
        // wait for a while
        cy.wait(4000).then(()=>{
            // end the event and check duration
            Countly.end_event(timedEventObj);
            cy.fetch_local_event_queue().then((e)=>{
                let queue = JSON.parse(e);
                cy.check_event(queue[0], timedEventObj, 4);
            });

        });
    });
});
