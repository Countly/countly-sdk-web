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
function validateDefaultUtmTags(aq, source, medium, campaign, term, content) {
    if (typeof source === "string") {
        expect(aq.utm_source).to.eq(source);
    }
    else {
        expect(aq.utm_source).to.not.exist;
    }
    if (typeof medium === "string") {
        expect(aq.utm_medium).to.eq(medium);
    }
    else {
        expect(aq.utm_medium).to.not.exist;
    }
    if (typeof campaign === "string") {
        expect(aq.utm_campaign).to.eq(campaign);
    }
    else {
        expect(aq.utm_campaign).to.not.exist;
    }
    if (typeof term === "string") {
        expect(aq.utm_term).to.eq(term);
    }
    else {
        expect(aq.utm_term).to.not.exist;
    }
    if (typeof content === "string") {
        expect(aq.utm_content).to.eq(content);
    }
    else {
        expect(aq.utm_content).to.not.exist;
    }
}

describe("UTM tests ", () => {
    it("Checks if a single default utm tag works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });
        });
    });
    it("Checks if default utm tags works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4", undefined);
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                validateDefaultUtmTags(custom, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
            });
        });
    });
    it("Checks if a single custom utm tag works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_aa=hehe", { aa: true, bb: true });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
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
                validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
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
                validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });
            // check if custom utm tags works
            cy.fetch_local_request_queue("Countly_2").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_ss).to.eq("hehe");
            });
            // check if default utm tags works
            cy.fetch_local_request_queue("Countly_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                validateDefaultUtmTags(custom, "hehe", "", "", "", "");
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
