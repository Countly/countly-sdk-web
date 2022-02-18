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
        hp.haltAndClearStorage();
        initMain();
        Countly.track_view(pageNameOne);
        cy.fetch_local_event_queue().then((e) => {
            const queue = JSON.parse(e);
            expect(queue.length).to.equal(1);
            cy.check_view_event(queue[0], pageNameOne);
        });
    });
    it('Checks if recording timed page views with same name works', () => {
        hp.haltAndClearStorage();
        initMain();
        Countly.track_view(pageNameOne);
        cy.fixture('variables').then((ob) => {
            cy.wait(ob.mWait).then(() => {
                Countly.track_view(pageNameOne);
                cy.fetch_local_event_queue().then((e) => {
                    const queue = JSON.parse(e);
                    expect(queue.length).to.equal(3);
                    cy.check_view_event(queue[0], pageNameOne);
                    cy.check_view_event(queue[1], pageNameOne, 4);
                    cy.check_view_event(queue[2], pageNameOne);
                });
            });
        });
    });
    it('Checks if recording timed page views with different name works', () => {
        hp.haltAndClearStorage();
        initMain();
        Countly.track_view(pageNameOne);
        cy.fixture('variables').then((ob) => {
            cy.wait(ob.mWait).then(() => {
                Countly.track_view(pageNameTwo);
                cy.fetch_local_event_queue().then((e) => {
                    const queue = JSON.parse(e);
                    expect(queue.length).to.equal(3);
                    cy.check_view_event(queue[0], pageNameOne);
                    cy.check_view_event(queue[1], pageNameOne, 4);
                    cy.check_view_event(queue[2], pageNameTwo);
                });
            });
        });
    });
});