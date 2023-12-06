/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
// if you are testing on an app
const app_key = hp.appKey;
const waitTime = 4000;
const eventObj = {
    key: "buttonClick",
    count: 1,
    segmentation: {
        id: "id"
    }
};

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.countly",
        session_update: 3,
        test_mode: true
    });
}
const dummyQueue = [
    { begin_session: 1, metrics: "{\"_app_version\":\"0.0\",\"_ua\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0\",\"_resolution\":\"1568x882\",\"_density\":1.2244897959183674,\"_locale\":\"en-US\"}", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909864950, hour: 10, dow: 2, t: 1, rr: 0 },
    { events: "[{\"key\":\"[CLY]_orientation\",\"count\":1,\"segmentation\":{\"mode\":\"portrait\"},\"timestamp\":1644909864949,\"hour\":10,\"dow\":2}]", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909864958, hour: 10, dow: 2, t: 1, rr: 0 },
    { session_duration: 4, metrics: "{\"_ua\":\"hey\"}", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909868015, hour: 10, dow: 2, t: 1, rr: 0 },
    { end_session: 1, session_duration: 10, metrics: "{\"_ua\":\"hey\"}", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909869459, hour: 10, dow: 2, t: 1, rr: 0 }
];

describe("Session tests ", () => {
    it("Checks if session start, extension and ending works with a dummy queue", () => {
        hp.haltAndClearStorage(() => {
            // initialize countly
            initMain();
            // begin session
            Countly.begin_session();
            // wait for session extension
            cy.wait(3000).then(() => {
                // end the session
                Countly.end_session(10, true);
                var queue = dummyQueue;
                // first object of the queue should be about begin session
                cy.check_session(queue[0]);
                // third object of the queue should be about session extension, also input the expected duration
                cy.check_session(queue[2], 3);
                // fourth object of the queue should be about end session, input the parameters that were used during the end session call
                cy.check_session(queue[3], 10, true);
            });
        });
    });
    it("Checks if session start, extension and ending works", () => {
        hp.haltAndClearStorage(() => {
            // initialize countly
            initMain();
            // begin session
            Countly.begin_session();
            // wait for session extension
            cy.wait(4250).then(() => {
                // end the session
                Countly.end_session(10, true);
                // get the JSON string from local storage
                cy.fetch_local_request_queue().then((rq) => {
                    // 3 sessions and 1 orientation
                    expect(rq.length).to.equal(4);
                    // first object of the queue should be about begin session, second is orientation
                    cy.check_session(rq[0]);
                    // third object of the queue should be about session extension, also input the expected duration
                    cy.check_session(rq[2], 3);
                    // fourth object of the queue should be about end session, input the parameters that were used during the end session call
                    cy.check_session(rq[3], 10, true);
                });
            });
        });
    });
});

describe("Browser session tests, auto", () => {
    it("Single session test with auto sessions", () => {
        cy.visit("./cypress/fixtures/session_test_auto.html?use_session_cookie=true")
            .wait(waitTime);
        cy.contains("Event").click().wait(1000);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 5, 4);
        });
    });
});
describe("Browser session tests, manual 1", () => {
    it("Single sessions test with manual sessions", () => {
        cy.visit("./cypress/fixtures/session_test_manual_1.html?use_session_cookie=true");
        cy.contains("Start").click().wait(waitTime);
        cy.contains("Event").click().wait(500);
        cy.contains("End").click().wait(500);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 4, 4);
        });
    });
});
describe("Browser session tests, manual 2", () => {
    it("Single bounce test with manual sessions 2", () => {
        cy.visit("./cypress/fixtures/session_test_manual_2.html?use_session_cookie=true").wait(waitTime);
        cy.contains("Event").click().wait(500);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 4, 4);
        });
    });
});
describe("Browser session tests, auto, no cookie", () => {
    it("Single bounce test with auto sessions and no cookies", () => {
        cy.visit("./cypress/fixtures/session_test_auto.html")
            .wait(waitTime);
        cy.contains("Event").click().wait(500);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 5, 4);
        });
    });
});
describe("Browser session tests, manual 1, no cookie", () => {
    it("Single bounce test with manual sessions with no cookies", () => {
        cy.visit("./cypress/fixtures/session_test_manual_1.html");
        cy.contains("Start").click();
        cy.wait(waitTime);
        cy.contains("Event").click();
        cy.wait(500);
        cy.contains("End").click();
        cy.wait(500);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 5, 4);
        });
    });
});
describe("Browser session tests, manual 2, no cookie", () => {
    it("Single bounce test with manual sessions 2 and no cookies", () => {
        cy.visit("./cypress/fixtures/session_test_manual_2.html").wait(waitTime);
        cy.contains("Event").click().wait(500);
        cy.visit("./cypress/fixtures/base.html");
        cy.fetch_local_request_queue(app_key).then((rq) => {
            checkQueueForSessionTests(rq, 5, 4);
        });
    });
});

describe("Check request related functions", () => {
    it("Check if prepareRequest forms a proper request object", () => {
        hp.haltAndClearStorage(() => {
            // initialize countly
            initMain();
            let reqObject = {};
            Countly._internals.prepareRequest(reqObject);
            cy.check_commons(reqObject);
            cy.check_request_commons(reqObject);
        });
    });
    it("Check if prepareRequest forms a proper request object from a bad one ", () => {
        hp.haltAndClearStorage(() => {
            // initialize countly
            initMain();
            let reqObject = { app_key: null, device_id: null };
            Countly._internals.prepareRequest(reqObject);
            cy.check_commons(reqObject);
            cy.check_request_commons(reqObject);
        });
    });
    it("Check if prepareRequest forms a proper request object and not erase an extra value ", () => {
        hp.haltAndClearStorage(() => {
            // initialize countly
            initMain();
            let reqObject = { extraKey: "value" };
            Countly._internals.prepareRequest(reqObject);
            expect(reqObject.extraKey).to.equal("value");
            cy.check_commons(reqObject);
            cy.check_request_commons(reqObject);
        });
    });
});

/**
 * checks the queue for session tests
 * @param {*} queue - queue to check
 * @param {*} expectedLength - expected length of the queue
 * @param {*} sessionDuration - expected session duration
 */
function checkQueueForSessionTests(queue, expectedLength, sessionDuration) {
    expect(queue.length).to.be.within(expectedLength - 1, expectedLength + 1);
    let beginSes = 1;
    for (let i = 0; i < queue.length; i++) {
        const currentRequest = queue[i];
        if (currentRequest.begin_session) {
            cy.check_session(currentRequest, undefined, undefined, app_key);
            beginSes--;
        }
        else if (currentRequest.events) {
            const event = JSON.parse(currentRequest.events)[0];
            if (event.key === "buttonClick") {
                cy.check_event(event, eventObj, undefined, false);
            }
        }
        else if (currentRequest.session_duration) {
            cy.check_session(currentRequest, sessionDuration, undefined, app_key);
        }
        else if (currentRequest.end_session) {
            cy.check_session(currentRequest, 0, true, app_key);
        }
    }
    expect(beginSes).to.equal(0);
}