describe("Web Worker Local Queue Tests", () => {
    it("Verify queues for all features", () => {
        // create a worker
        const myWorker = new Worker("../../test_workers/worker_for_test.js");

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
        };
        cy.wait(3000).then(() => {
            // verify event queue
            expect(eventQueue.length).to.equal(2);
            cy.check_event(eventQueue[0], { key: "key" }, undefined, false);
            cy.check_view_event(eventQueue[1], "home_page", undefined, false);
    
            // verify request queue
            expect(requestQueue.length).to.equal(2);
            cy.check_session(requestQueue[0], undefined, false, false, true);
            cy.check_session(requestQueue[1], 0, false, false, false);
        });
    });
    it("Records the status and message of a failed request for the next health check", () => {
        let myWorker;
        let health;
        cy.intercept("POST", "https://your.domain.count.ly/i", { statusCode: 200, body: "{\"result\":\"Success\"}" });
        // the server configuration request at start fails
        cy.intercept("POST", "https://your.domain.count.ly/o/sdk", { statusCode: 503, body: "{\"result\":\"Service Unavailable\"}" }).as("serverConfig").then(() => {
            myWorker = new Worker("../../test_workers/worker_for_test.js");
            myWorker.onmessage = function(e) {
                health = e.data;
                myWorker.terminate();
            };
        });
        cy.wait("@serverConfig");
        cy.wait(1000).then(() => {
            myWorker.postMessage({ data: "health", type: "hc" });
        });
        cy.wait(1000).then(() => {
            expect(health).to.deep.equal({ sc: 503, em: "{\"result\":\"Service Unavailable\"}" });
        });
    });
});