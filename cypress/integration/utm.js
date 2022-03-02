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
});
