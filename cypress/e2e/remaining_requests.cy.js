/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(shouldStopRequests) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        app_version: "1.0",
        // would prevent requests from being sent to the server if true
        test_mode: shouldStopRequests
    });
}
const av = "1.0";
describe("Remaining requests tests ", () => {
    it("Checks the requests for rr", () => {
        hp.haltAndClearStorage(() => {
            initMain(false);
            Countly.begin_session();
            Countly.end_session(undefined, true);

            cy.wait(1000).then(() => {
                var queues = Countly._internals.getLocalQueues();
                expect(queues.eventQ.length).to.equal(0);
                expect(queues.requestQ.length).to.equal(3);
                expect(queues.requestQ[0]["begin_session"]).to.equal(1);
                expect(queues.requestQ[1]["end_session"]).to.equal(1);
                expect(JSON.parse(queues.requestQ[2]["events"])[0].key).to.equal("[CLY]_orientation");

                var requests = Countly._internals.testingGetRequests();
                expect(requests.length).to.equal(3);
                expect(requests[0].params["rr"]).to.equal(undefined);
                expect(requests[1].params["rr"]).to.equal(undefined);
                expect(requests[2].params["rr"]).to.equal(3);
                expect(requests[2].params["av"]).to.equal(av);
            });
        });
    });
    it("No rr if no request was made to the server", () => {
        hp.haltAndClearStorage(() => {
            initMain(true);

            // Create a session and end it
            Countly.begin_session();
            Countly.end_session(undefined, true);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(3);
                expect(rq[0].rr).to.equal(undefined);
                expect(rq[1].rr).to.equal(undefined);
                expect(rq[2].rr).to.equal(undefined);

                // Change ID
                Countly.change_id("newID");
                cy.fetch_local_request_queue().then((rq2) => {
                    // We expect 4 requests in queue: begin_session, end_session, orientation and change ID
                    cy.log(rq2);
                    expect(rq2.length).to.equal(4);
                    expect(rq2[0].rr).to.equal(undefined);
                    expect(rq2[1].rr).to.equal(undefined);
                    expect(rq2[2].rr).to.equal(undefined);
                    expect(rq2[3].rr).to.equal(undefined);
                });
            });
        });
    });
});
