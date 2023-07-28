/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(shouldStopRequests) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        // would prevent requests from being sent to the server if true
        test_mode: shouldStopRequests
    });
}

describe("Remaining requests tests ", () => {
    it("Checks the requests for rr", () => {
        hp.haltAndClearStorage(() => {
            initMain(false);

            // Create a session and end it
            Countly.begin_session();
            Countly.end_session(undefined, true);

            // We expect 3 requests: begin_session, end_session, orientation
            hp.interceptAndCheckRequests(undefined, undefined, undefined, undefined, "begin_session", (requestParams) => {
                expect(requestParams.get("begin_session")).to.equal("1");
                expect(requestParams.get("rr")).to.equal("3");
            });
            hp.interceptAndCheckRequests(undefined, undefined, undefined, undefined, "end_session", (requestParams) => {
                expect(requestParams.get("end_session")).to.equal("1");
                expect(requestParams.get("rr")).to.equal("2");
            });
            hp.interceptAndCheckRequests(undefined, undefined, undefined, undefined, "orientation", (requestParams) => {
                expect(JSON.parse(requestParams.get("events"))[0].key).to.equal("[CLY]_orientation");
                expect(requestParams.get("rr")).to.equal("1");
            });
            cy.wait(100).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
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
                // We expect 3 requests in queue: begin_session, end_session, orientation
                expect(rq.length).to.equal(3);
                expect(rq[0].rr).to.equal(3);
                expect(rq[1].rr).to.equal(undefined);
                expect(rq[2].rr).to.equal(undefined);

                // Change ID
                Countly.change_id("newID");
                cy.fetch_local_request_queue().then((rq2) => {
                    // We expect 4 requests in queue: begin_session, end_session, orientation and change ID
                    cy.log(rq2);
                    expect(rq2.length).to.equal(4);
                    expect(rq2[0].rr).to.equal(3); // still 3 as it was assigned at the time of the first request creation
                    expect(rq2[1].rr).to.equal(undefined);
                    expect(rq2[2].rr).to.equal(undefined);
                    expect(rq2[3].rr).to.equal(undefined);
                });
            });
        });
    });
});
