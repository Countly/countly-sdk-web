/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        tests: true,
        max_events: -1
    });
}
function initDeviation() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        tests: true,
        max_events: -1,
        utm: { aa: true, bb: true }
    });
}


describe("UTM tests ", () => {
    it("Checks if a single default utm tag works", () => {
        hp.haltAndClearStorage(() => {
            Countly.getSearchQuery = function() {
                return "?utm_source=hehe";
            };
            initMain();
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.eq("hehe");
                expect(custom.utm_medium).to.eq("");
                expect(custom.utm_campaign).to.eq("");
                expect(custom.utm_term).to.eq("");
                expect(custom.utm_content).to.eq("");
            });
        });
    });
    it("Checks if default utm tags works", () => {
        hp.haltAndClearStorage(() => {
            Countly.getSearchQuery = function() {
                return "?utm_source=hehe&utm_medium=hehe&utm_campaign=hehe&utm_term=hehe&utm_content=hehe";
            };
            initMain();
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.eq("hehe");
                expect(custom.utm_medium).to.eq("hehe");
                expect(custom.utm_campaign).to.eq("hehe");
                expect(custom.utm_term).to.eq("hehe");
                expect(custom.utm_content).to.eq("hehe");
            });
        });
    });
    it("Checks if a single custom utm tag works", () => {
        hp.haltAndClearStorage(() => {
            Countly.getSearchQuery = function() {
                return "?utm_aa=hehe";
            };
            initDeviation();
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.not.exist;
                expect(custom.utm_medium).to.not.exist;
                expect(custom.utm_campaign).to.not.exist;
                expect(custom.utm_term).to.not.exist;
                expect(custom.utm_content).to.not.exist;
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("");
            });
        });
    });
    it("Checks if custom utm tags works", () => {
        hp.haltAndClearStorage(() => {
            Countly.getSearchQuery = function() {
                return "?utm_aa=hehe&utm_bb=hoho";
            };
            initDeviation();
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.not.exist;
                expect(custom.utm_medium).to.not.exist;
                expect(custom.utm_campaign).to.not.exist;
                expect(custom.utm_term).to.not.exist;
                expect(custom.utm_content).to.not.exist;
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("hoho");
            });
        });
    });
    it("Checks if utm tag works in multi instancing", () => {
        hp.haltAndClearStorage(() => {
            // utm object provided with appropriate query
            Countly.init({
                app_key: "Countly_2",
                url: "https://try.count.ly",
                tests: true,
                max_events: -1,
                utm: { ss: true },
                getSearchQuery: function() {
                    return "?utm_ss=hehe";
                }
            });
            // utm object provided with inappropriate query
            Countly.init({
                app_key: "Countly_4",
                url: "https://try.count.ly",
                tests: true,
                max_events: -1,
                utm: { ss: true },
                getSearchQuery: function() {
                    return "?utm_source=hehe";
                }
            });
            // utm object not provided with default query
            Countly.init({
                app_key: "Countly_3",
                url: "https://try.count.ly",
                tests: true,
                max_events: -1,
                getSearchQuery: function() {
                    return "?utm_source=hehe";
                }
            });
            // utm object not provided with inappropriate query
            Countly.init({
                app_key: "Countly_5",
                url: "https://try.count.ly",
                tests: true,
                max_events: -1,
                getSearchQuery: function() {
                    return "?utm_ss=hehe";
                }
            });
            // default (original) init with no custom tags and default query
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://try.count.ly",
                tests: true,
                max_events: -1,
                getSearchQuery: function() {
                    return "?utm_source=hehe";
                }
            });
            // check original
            cy.fetch_local_request_queue().then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.eq("hehe");
                expect(custom.utm_medium).to.eq("");
                expect(custom.utm_campaign).to.eq("");
                expect(custom.utm_term).to.eq("");
                expect(custom.utm_content).to.eq("");
            });
            // check if custom utm tags works
            cy.fetch_local_request_queue_multi("Countly_2").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_ss).to.eq("hehe");
                expect(custom.utm_source).to.not.exist;
                expect(custom.utm_medium).to.not.exist;
                expect(custom.utm_campaign).to.not.exist;
                expect(custom.utm_term).to.not.exist;
                expect(custom.utm_content).to.not.exist;
            });
            // check if default utm tags works
            cy.fetch_local_request_queue_multi("Countly_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.eq("hehe");
                expect(custom.utm_medium).to.eq("");
                expect(custom.utm_campaign).to.eq("");
                expect(custom.utm_term).to.eq("");
                expect(custom.utm_content).to.eq("");
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue_multi("Countly_4").then((rq) => {
                expect(rq.length).to.eq(0);
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue_multi("Countly_5").then((rq) => {
                expect(rq.length).to.eq(0);
            });
        });
    });
});
