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

            // We will expect 4 requests: health check, begin_session, end_session, orientation
            hp.interceptAndCheckRequests("POST", undefined, undefined, "?hc=*", "hc", (requestParams) => {
                const params = JSON.parse(requestParams.get("hc"));
                assert.isTrue(typeof params.el === "number");
                assert.isTrue(typeof params.wl === "number");
                assert.isTrue(typeof params.sc === "number");
                assert.isTrue(typeof params.em === "string");
                expect(requestParams.get("rr")).to.equal(null);
            });
            cy.wait(1000).then(() => {
                // Create a session
                Countly.begin_session();
                hp.interceptAndCheckRequests("POST", undefined, undefined, "?begin_session=*", "begin_session", (requestParams) => {
                    expect(requestParams.get("begin_session")).to.equal("1");
                    expect(requestParams.get("rr")).to.equal("3");
                    expect(requestParams.get("av")).to.equal(av);
                });
                // End the session
                Countly.end_session(undefined, true);
                hp.interceptAndCheckRequests("POST", undefined, undefined, "?end_session=*", "end", (requestParams) => {
                    expect(requestParams.get("end_session")).to.equal("1");
                    expect(requestParams.get("rr")).to.equal("2");
                    expect(requestParams.get("av")).to.equal(av);
                });
                hp.interceptAndCheckRequests("POST", undefined, undefined, undefined, "orientation", (requestParams) => {
                    expect(JSON.parse(requestParams.get("events"))[0].key).to.equal("[CLY]_orientation");
                    expect(requestParams.get("rr")).to.equal("1");
                    expect(requestParams.get("av")).to.equal(av);
                });
                cy.wait(100).then(() => {
                    cy.fetch_local_request_queue().then((rq) => {
                        expect(rq.length).to.equal(0);
                    });
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
                // We expect 3 requests in queue: begin_session, end_session, orientation. health check was not in the queue
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
