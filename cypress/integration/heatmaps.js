// TODO: click and scrolls tests but scrolls first, with html files

/* eslint-disable require-jsdoc */
var hp = require("../support/helper");

describe("Browser heatmap tests", () => {
    it("Check if scrolls are sent if page url changes", () => {
        cy.visit("./cypress/fixtures/scroll_test.html");
        cy.scrollTo("bottom");
        cy.visit("./cypress/fixtures/scroll_test_2.html");
        cy.fetch_local_request_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            // 2 session and 1 orientation 1 event
            expect(rq.length).to.equal(4);
            // first object of the queue should be about begin session, second is orientation
            cy.check_session(rq[0], undefined, undefined, hp.appKey);
            // third object of the queue should be about session extension, also input the expected duration range, we expect 0 here so we enter a value lower than that but not deviated more than 1
            cy.check_session(rq[2], -0.5, undefined);
            // fourth object of the queue should be events in the queue, there must be 4 of them
            cy.check_view_event(JSON.parse(rq[3].events)[0], "/cypress/fixtures/scroll_test.html", 0);
            cy.check_scroll_event(JSON.parse(rq[3].events)[1]);
            // number 3 is orientation
            cy.check_view_event(JSON.parse(rq[3].events)[3], "/cypress/fixtures/scroll_test_2.html");
        });
    });
    it("Check if scrolls are sent if for single page apps/sites", () => {
        cy.visit("./cypress/fixtures/scroll_test_3.html");
        // TODO: gave exact coordinates and check those exact coordinates are recorded or not for scrolls
        cy.scrollTo("bottom");
        // click button that triggers view change
        cy.get("#b1").click();
        cy.scrollTo("bottom");
        // click button that triggers view change
        cy.get("#b2").click();
        // 2 request with 1 session and 1 events
        cy.fetch_local_request_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(2);
            cy.check_session(rq[0], undefined, undefined, hp.appKey);
        });
        // 6 events with 4 views and 2 scrolls must be here
        cy.fetch_local_event_queue(hp.appKey).then((eq) => {
            cy.log(eq);
            cy.check_scroll_event(eq[0]);
            cy.check_view_event(eq[1], "/cypress/fixtures/scroll_test_3.html", 0);
            cy.check_view_event(eq[2], "v1");
            cy.check_scroll_event(eq[3]);
            cy.check_view_event(eq[4], "v1", 0);
            cy.check_view_event(eq[5], "v2");
        });
    });
});