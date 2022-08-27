// TODO: click and scrolls tests but scrolls first, with html files

/* eslint-disable require-jsdoc */
var hp = require("../support/helper");
const clickX = 20;
const clickY = 20;

describe("Browser heatmap tests, scrolls", () => {
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
describe("Browser heatmap tests, clicks", () => {
    it("Check if the clicks are send", () => {
        cy.visit("./cypress/fixtures/click_test.html");
        cy.get("#click").click(clickX, clickY);
        // its in event queue as we are checking directly after the click
        cy.fetch_local_event_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(1);
            expect(rq[0].key).to.equal("[CLY]_action");
            cy.check_commons(rq[0]);

            const seg = rq[0].segmentation;
            expect(seg.domain).to.be.ok;
            expect(seg.type).to.equal("click");
            expect(seg.height).to.be.ok;
            expect(seg.view).to.be.ok;
            expect(seg.width).to.be.ok;
            expect(seg.x).to.equal(clickX + 8);
            expect(seg.y).to.equal(clickY + 8);
        });
        cy.fetch_local_request_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(2);
        });
    });
    it("Check if the DOM restriction works if non targeted child clicked", () => {
        cy.visit("./cypress/fixtures/click_test.html?dom=click2");
        // this click must be ignored as it is not click2
        cy.get("#click").click(clickX, clickY);
        cy.fetch_local_event_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(0);
        });
        cy.fetch_local_request_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(2);
        });
    });
    it("Check if the DOM restriction works only the child is clicked", () => {
        cy.visit("./cypress/fixtures/click_test.html?dom=click2");
        // only click2 must be perceived
        cy.get("#click").click(clickX, clickY).wait(1000);
        cy.get("#click2").click(clickX, clickY).wait(1000);
        cy.get("#click3").click(clickX, clickY);
        cy.fetch_local_event_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            expect(rq.length).to.equal(0);
        });
        // as we waited the call is in request queue now
        cy.fetch_local_request_queue(hp.appKey).then((rq) => {
            cy.log(rq);
            // first 2 is session and orientation
            expect(rq.length).to.equal(3);
            const clickEv = JSON.parse(rq[2].events);
            // only single event must exist
            expect(clickEv.length).to.equal(1);
            expect(clickEv[0].key).to.equal("[CLY]_action");
            cy.check_commons(clickEv[0]);

            const seg = clickEv[0].segmentation;
            expect(seg.domain).to.be.ok;
            expect(seg.type).to.equal("click");
            expect(seg.height).to.be.ok;
            expect(seg.view).to.be.ok;
            expect(seg.width).to.be.ok;
            expect(seg.x).to.equal(clickX + 80);
            expect(seg.y).to.equal(clickY + 8);
        });
    });
});