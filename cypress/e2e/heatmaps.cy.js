// TODO: click and scrolls tests but scrolls first, with html files

/* eslint-disable require-jsdoc */
var hp = require("../support/helper");
const clickX = 20;
const clickY = 20;

function click_check(segmentation, offX, offY) {
    expect(segmentation.domain).to.be.ok;
    expect(segmentation.type).to.equal("click");
    expect(segmentation.height).to.be.ok;
    expect(segmentation.view).to.be.ok;
    expect(segmentation.width).to.be.ok;
    expect(segmentation.x).to.be.above(clickX + offX - 2);
    expect(segmentation.x).to.be.below(clickX + offX + 2);
    expect(segmentation.y).to.be.above(clickY + offY - 2);
    expect(segmentation.y).to.be.below(clickY + offY + 2);
}

describe("Browser heatmap tests, scrolls", () => {
    it("Check if scrolls are sent if page url changes, multi page", () => {
        cy.visit("./cypress/fixtures/scroll_test.html");
        cy.scrollTo("bottom");
        cy.visit("./cypress/fixtures/scroll_test_2.html");
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_request_queue(hp.appKey).then((rq) => {
                cy.log(rq);
                // There should be 4 requests: session -> event batch 1 -> session_duration -> event batch 2
                expect(rq.length).to.equal(4);
                const beginSessionReq = rq[0];
                const eventBatch1 = JSON.parse(rq[1].events);
                const sessionDurationReq = rq[2];
                const eventBatch2 = JSON.parse(rq[3].events);

                // 1st req
                cy.check_session(beginSessionReq, undefined, undefined, hp.appKey);

                // 2nd req
                expect(eventBatch1.length).to.equal(2);
                expect(eventBatch1[0].key).to.equal("[CLY]_orientation");
                expect(eventBatch1[0].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch1[1], "/cypress/fixtures/scroll_test.html", undefined, false); // start view

                // 3rd object of the req queue should be about session extension, also input the expected duration range, we expect 0 here so we enter a value lower than that but not deviated more than 1
                cy.check_session(sessionDurationReq, -0.5, undefined);

                // 4th object of the queue should be events in the queue, there must be 4 of them
                expect(eventBatch2.length).to.equal(4);
                cy.check_view_event(eventBatch2[0], "/cypress/fixtures/scroll_test.html", 0, false); // end view
                cy.check_scroll_event(eventBatch2[1]);
                expect(eventBatch2[2].key).to.equal("[CLY]_orientation");
                expect(eventBatch2[2].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch2[3], "/cypress/fixtures/scroll_test_2.html", undefined, false); // new page
            });
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
        // There should be 3 requests: session -> event batch 1 -> event batch 2
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_request_queue(hp.appKey).then((rq) => {
                expect(rq.length).to.equal(3);

                cy.check_session(rq[0], undefined, undefined, hp.appKey);

                const eventBatch1 = JSON.parse(rq[1].events); // 0 is orientation, 1 is view
                expect(eventBatch1[0].key).to.equal("[CLY]_orientation");
                expect(eventBatch1[0].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch1[1], "/cypress/fixtures/scroll_test_3.html", undefined, false);

                const eventBatch2 = JSON.parse(rq[2].events); // 0 is view, 1 is scroll, 2 is view, 3 is scroll
                cy.check_scroll_event(eventBatch2[0]);
                cy.check_view_event(eventBatch2[1], "/cypress/fixtures/scroll_test_3.html", 0, false);
                cy.check_view_event(eventBatch2[2], "v1", undefined, true);
                cy.check_scroll_event(eventBatch2[3]);
                cy.check_view_event(eventBatch2[4], "v1", 0, true);
                cy.check_view_event(eventBatch2[5], "v2", undefined, true);
            });
        });
    });
});
describe("Browser heatmap tests, clicks", () => {
    it("Check if the clicks are send", () => {
        cy.visit("./cypress/fixtures/click_test.html");
        cy.get("#click").click(clickX, clickY);
        // There should be 3 requests: session -> event batch 1 -> event batch 2
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_request_queue(hp.appKey).then((rq) => {
                cy.log(rq);
                expect(rq.length).to.equal(3);
                const beginSessionReq = rq[0];
                const eventBatch1 = JSON.parse(rq[1].events);
                const eventBatch2 = JSON.parse(rq[2].events);

                // 1st req
                cy.check_session(beginSessionReq, undefined, undefined, hp.appKey);

                // 2nd req
                expect(eventBatch1.length).to.equal(2);
                expect(eventBatch1[0].key).to.equal("[CLY]_orientation");
                expect(eventBatch1[0].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch1[1], "/cypress/fixtures/click_test.html", undefined, false); // start view

                // 3rd req
                expect(eventBatch2[0].key).to.equal("[CLY]_action");
                cy.check_commons(eventBatch2[0]);
                const seg = eventBatch2[0].segmentation;
                click_check(seg, 8, 8);
            });
        });
    });
    it("Check if the DOM restriction works if non targeted child clicked", () => {
        cy.visit("./cypress/fixtures/click_test.html?dom=click2");
        // this click must be ignored as it is not click2
        cy.get("#click").click(clickX, clickY);
        // There should be 2 requests: session -> event batch 1
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_request_queue(hp.appKey).then((rq) => {
                cy.log(rq);
                expect(rq.length).to.equal(2);
                const beginSessionReq = rq[0];
                const eventBatch1 = JSON.parse(rq[1].events);

                // 1st req
                cy.check_session(beginSessionReq, undefined, undefined, hp.appKey);

                // 2nd req
                expect(eventBatch1.length).to.equal(2);
                expect(eventBatch1[0].key).to.equal("[CLY]_orientation");
                expect(eventBatch1[0].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch1[1], "/cypress/fixtures/click_test.html", undefined, false); // start view
            });
        });
    });
    it("Check if the DOM restriction works only the child is clicked", () => {
        cy.visit("./cypress/fixtures/click_test.html?dom=click2");
        // only click2 must be perceived
        cy.get("#click").click(clickX, clickY);
        cy.get("#click2").click(clickX, clickY);
        cy.get("#click3").click(clickX, clickY);
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            // There should be 3 requests: session -> event batch 1 -> event batch 2
            cy.fetch_local_request_queue(hp.appKey).then((rq) => {
                cy.log(rq);
                expect(rq.length).to.equal(3);
                const beginSessionReq = rq[0];
                const eventBatch1 = JSON.parse(rq[1].events);
                const eventBatch2 = JSON.parse(rq[2].events);

                // 1st req
                cy.check_session(beginSessionReq, undefined, undefined, hp.appKey);

                // 2nd req
                expect(eventBatch1.length).to.equal(2);
                expect(eventBatch1[0].key).to.equal("[CLY]_orientation");
                expect(eventBatch1[0].segmentation.mode).to.be.ok;
                cy.check_view_event(eventBatch1[1], "/cypress/fixtures/click_test.html", undefined, false); // start view

                // 3rd req
                expect(eventBatch2[0].key).to.equal("[CLY]_action");
                cy.check_commons(eventBatch2[0]);
                const seg = eventBatch2[0].segmentation;
                click_check(seg, 80, 8);
            });
        });
    });
});