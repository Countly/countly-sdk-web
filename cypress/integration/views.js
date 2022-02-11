/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1
    });
}

var pageNameOne = "test view page name1";
var pageNameTwo = "test view page name2";

describe('Views tests ', () => {
    it('Checks if recording page view works', () => {
        initMain();
        Countly.track_view(pageNameOne);
        cy.check_view_event(pageNameOne);
    });
    it('Checks if recording timed page views with same name works', () => {
        cy.clearLocalStorage();
        // Countly.halt();
        cy.wait(50).then(()=>{
            initMain();
            Countly.track_view(pageNameOne);
            cy.check_view_event(pageNameOne);
            cy.wait(4000).then(()=>{
                Countly.track_view(pageNameOne);
                cy.check_view_event(pageNameOne);
                cy.check_view_event(pageNameOne, 1, 4);
                cy.check_view_event(pageNameOne, 2);
            });
        });
    });
    it('Checks if recording timed page views with different name works', () => {
        cy.clearLocalStorage();
        // Countly.halt();
        cy.wait(50).then(()=>{
            initMain();
            Countly.track_view(pageNameOne);
            cy.check_view_event(pageNameOne);
            cy.wait(4000).then(()=>{
                Countly.track_view(pageNameTwo);
                cy.check_view_event(pageNameOne);
                cy.check_view_event(pageNameOne, 1, 4);
                cy.check_view_event(pageNameTwo, 2);
            });
        });
    });
});