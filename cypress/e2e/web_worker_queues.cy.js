describe("Web Worker Local Queue Tests", () => {
    it("Verify queues for all features", () => {
        // create a worker
        const myWorker = new Worker("../../test_workers/worker_for_test.js", { type: "module" });

        // send an event to worker
        myWorker.postMessage({ data: { key: "key" }, type: "event" });
        myWorker.postMessage({ data: "begin_session", type: "session" });
        myWorker.postMessage({ data: "end_session", type: "session" });
        myWorker.postMessage({ data: "home_page", type: "view" });

        // ask for local queues
        myWorker.postMessage({ data: "queues", type: "get" });

        let requestQueue;
        let eventQueue;
        myWorker.onmessage = function(e) {
            requestQueue = e.data.requestQ; // Array of requests
            eventQueue = e.data.eventQ; // Array of events
            myWorker.terminate(); // terminate worker

            // verify event queue
            expect(eventQueue.length).to.equal(2);
            cy.check_event(eventQueue[0], { key: "key" }, undefined, false);
            cy.check_view_event(eventQueue[1], "home_page", undefined, false);

            // verify request queue
            expect(requestQueue.length).to.equal(2);
            cy.check_session(requestQueue[0], undefined, false, false, true);
            cy.check_session(requestQueue[1], 0, false, false, false);
        };
    });
});