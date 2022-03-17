/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMulti(appKey, searchQuery, utmStuff) {
    Countly.init({
        app_key: appKey,
        url: "https://try.count.ly",
        tests: true,
        max_events: -1,
        utm: utmStuff,
        getSearchQuery: function() {
            return searchQuery;
        }
    });
}


describe("UTM tests ", () => {
    it("Checks if a single default utm tag works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);
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
            initMulti("YOUR_APP_KEY", "?utm_source=hehe&utm_medium=hehe&utm_campaign=hehe&utm_term=hehe&utm_content=hehe", undefined);
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
            initMulti("YOUR_APP_KEY", "?utm_aa=hehe", { aa: true, bb: true });
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
            initMulti("YOUR_APP_KEY", "?utm_aa=hehe&utm_bb=hoho", { aa: true, bb: true });
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
            initMulti("Countly_2", "?utm_ss=hehe", { ss: true });

            // utm object provided with inappropriate query
            initMulti("Countly_4", "?utm_source=hehe", { ss: true });

            // utm object not provided with default query
            initMulti("Countly_3", "?utm_source=hehe", undefined);

            // utm object not provided with inappropriate query
            initMulti("Countly_5", "?utm_ss=hehe", undefined);

            // default (original) init with no custom tags and default query
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);

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
            cy.fetch_local_request_queue("Countly_2").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_ss).to.eq("hehe");
                expect(custom.utm_source).to.not.exist;
                expect(custom.utm_medium).to.not.exist;
                expect(custom.utm_campaign).to.not.exist;
                expect(custom.utm_term).to.not.exist;
                expect(custom.utm_content).to.not.exist;
            });
            // check if default utm tags works
            cy.fetch_local_request_queue("Countly_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                expect(custom.utm_source).to.eq("hehe");
                expect(custom.utm_medium).to.eq("");
                expect(custom.utm_campaign).to.eq("");
                expect(custom.utm_term).to.eq("");
                expect(custom.utm_content).to.eq("");
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue("Countly_4").then((rq) => {
                expect(rq.length).to.eq(0);
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue("Countly_5").then((rq) => {
                expect(rq.length).to.eq(0);
            });
        });
    });
});
