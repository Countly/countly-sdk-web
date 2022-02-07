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
        initMain();
        Countly.add_event(eventObj);
        cy.check_event(eventObj);
    });
    it('Checks if timed events works', () => {
        initMain();
        Countly.start_event("timed");
        cy.wait(4000).then(()=>{
            Countly.end_event(timedEventObj);
            cy.check_event(timedEventObj, 4);
        });
    });
});
