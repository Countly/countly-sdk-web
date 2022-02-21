/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        session_update: 3,
        tests: true
    });
}
const dummyQueue = [{ begin_session: 1, metrics: "{\"_app_version\":\"0.0\",\"_ua\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0\",\"_resolution\":\"1568x882\",\"_density\":1.2244897959183674,\"_locale\":\"en-US\"}", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909864950, hour: 10, dow: 2 }, { events: "[{\"key\":\"[CLY]_orientation\",\"count\":1,\"segmentation\":{\"mode\":\"portrait\"},\"timestamp\":1644909864949,\"hour\":10,\"dow\":2}]", app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909864958, hour: 10, dow: 2 }, { session_duration: 4, app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909868015, hour: 10, dow: 2 }, { end_session: 1, session_duration: 10, app_key: "YOUR_APP_KEY", device_id: "55669b9b-f9d7-4ed5-bc77-ec5ebb65ddd8", sdk_name: "javascript_native_web", sdk_version: "21.11.0", timestamp: 1644909869459, hour: 10, dow: 2 }];

describe('Session tests ', () => {
    it('Checks if session start, extension and ending works with a dummy queue', () => {
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
    it('Checks if session start, extension and ending works', () => {
        hp.haltAndClearStorage(() => {
        // initialize countly
            initMain();
            // begin session
            Countly.begin_session();
            // wait for session extension
            cy.wait(4000).then(() => {
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
