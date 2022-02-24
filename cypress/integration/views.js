/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1,
        tests: true
    });
}

var pageNameOne = "test view page name1";
var pageNameTwo = "test view page name2";

describe('Views tests ', () => {
    it('Checks if recording page view works', () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_view_event(eq[0], pageNameOne);
            });
        });
    });
    it('Checks if recording timed page views with same name works', () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            cy.wait(3000).then(() => {
                Countly.track_view(pageNameOne);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne);
                    cy.check_view_event(eq[1], pageNameOne, 3);
                    cy.check_view_event(eq[2], pageNameOne);
                });
            });
        });
    });
    it('Checks if recording timed page views with different name works', () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            cy.wait(10000).then(() => {
                Countly.track_view(pageNameTwo);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne);
                    // this test is flaky we are expecting 3 and +1 (4) to make test more reliable 
                    cy.check_view_event(eq[1], pageNameOne, 10);
                    cy.check_view_event(eq[2], pageNameTwo);
                });
            });
        });
    });
});