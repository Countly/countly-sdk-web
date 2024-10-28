import { turnSearchStringToObject, check_commons } from "../support/helper";

var expectedRequests = 4;
const myEvent = {
    key: "buttonClick",
    segmentation: {
        id: "id"
    }
};

describe("Web Worker Request Intercepting Tests", () => {
    it("SDK able to send requests for most basic calls", () => {
        // create a worker
        const myWorker = new Worker("../../test_workers/worker.js", { type: "module" });

        // send an event to worker
        myWorker.postMessage({ data: myEvent, type: "event" });
        myWorker.postMessage({ data: "begin_session", type: "session" });
        myWorker.postMessage({ data: "end_session", type: "session" });
        myWorker.postMessage({ data: "home_page", type: "view" });

        // intercept requests
        cy.intercept("GET", "**/i?**", (req) => {
            const { url } = req;

            // check url starts with https://your.domain.count.ly/i?
            assert.isTrue(url.startsWith("https://your.domain.count.ly/i?"));

            // turn query string into object
            const paramsObject = turnSearchStringToObject(url.split("?")[1]);

            // check common params
            check_commons(paramsObject);

            // we expect 4 requests: begin_session, end_session, healthcheck, event(event includes view and buttonClick)
            if (paramsObject.hc) {
                // check hc params types, values can change
                assert.isTrue(typeof paramsObject.hc.el === "number");
                assert.isTrue(typeof paramsObject.hc.wl === "number");
                assert.isTrue(typeof paramsObject.hc.sc === "number");
                assert.isTrue(typeof paramsObject.hc.em === "string");
                expectedRequests--;
            }
            else if (paramsObject.events) {
                // check event params with accordance to event sent (myEvent above)
                for (const eventInRequest of paramsObject.events) {
                    if (eventInRequest.key === "[CLY]_view") { // view event
                        expect(eventInRequest.segmentation.name).to.equal("home_page");
                        expect(eventInRequest.segmentation.visit).to.equal(1);
                        expect(eventInRequest.segmentation.start).to.equal(1);
                        expect(eventInRequest.segmentation.view).to.equal("web_worker");
                        expect(eventInRequest.pvid).to.equal("");
                    }
                    else { // buttonClick event
                        expect(eventInRequest.key).to.equal(myEvent.key);
                        expect(eventInRequest.segmentation).to.deep.equal(myEvent.segmentation);
                        assert.isTrue(eventInRequest.cvid === "");
                    }
                    assert.isTrue(eventInRequest.count === 1);
                    expect(eventInRequest.id).to.be.ok;
                    expect(eventInRequest.id.toString().length).to.equal(21);
                    expect(eventInRequest.timestamp).to.be.ok;
                    expect(eventInRequest.timestamp.toString().length).to.equal(13);
                    expect(eventInRequest.hour).to.be.within(0, 23);
                    expect(eventInRequest.dow).to.be.within(0, 7);
                }
                expectedRequests--;
            }
            else if (paramsObject.begin_session === 1) { // check metrics
                expect(paramsObject.metrics._app_version).to.equal("0.0");
                expect(paramsObject.metrics._ua).to.equal("abcd");
                assert.isTrue(typeof paramsObject.metrics._locale === "string");
                expectedRequests--;
            }
            else if (paramsObject.end_session === 1) { // check metrics and session_duration
                expect(paramsObject.metrics._ua).to.equal("abcd");
                expect(paramsObject.session_duration).to.be.above(-1);
                expectedRequests--;
            }
            if (expectedRequests === 0) {
                myWorker.terminate(); // we checked everything, terminate worker
            }
        });
    });
});
