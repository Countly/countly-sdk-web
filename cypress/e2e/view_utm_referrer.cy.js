/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function init(appKey, searchQuery, utmStuff) {
    Countly.init({
        app_key: appKey,
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        utm: utmStuff, // utm object provided in init
        getSearchQuery: function() { // override default search query
            return searchQuery;
        }
    });
}

var pageNameOne = "test view page name1";
var pageNameTwo = "test view page name2";

describe("View with utm and referrer tests ", () => {
    // we check with no utm object if a default utm tag is recorded in the view event if it is in the query
    it("Checks if a single default utm tag is at view segmentation", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "?utm_source=hehe", undefined);
            Countly.track_view(pageNameOne); // first view
            // View event should have the utm tag
            cy.fetch_local_event_queue().then((eq) => {
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, "hehe", undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            // adding utm creates a user_details request
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });
        });
    });

    // we record 2 views and check if both have the same utm tag
    it("Checks if a single default utm tag is at view segmentation of both views", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "utm_source=hehe", undefined);
            Countly.track_view(pageNameOne); // first view
            Countly.track_view(pageNameTwo); // second view
            // View event should have the utm tag
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, "hehe", undefined, undefined, undefined, undefined);
                cy.check_view_event(eq[1], pageNameOne, 0, false); // end of view 1
                hp.validateDefaultUtmTags(eq[1].segmentation, undefined, undefined, undefined, undefined, undefined);
                cy.check_view_event(eq[2], pageNameTwo, undefined, true); // second view
                hp.validateDefaultUtmTags(eq[2].segmentation, "hehe", undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.referrer).to.eq(undefined);
                expect(eq[1].segmentation.referrer).to.eq(undefined);
                expect(eq[2].segmentation.referrer).to.eq(undefined);
            });
            // adding utm creates a user_details request
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
                expect(rq.length).to.eq(1);
            });
        });
    });

    // we check if multiple default utm tags are recorded in the view event if they are in the query
    // and no utm object is provided
    it("Checks if default utm tags appear in view", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "?utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4", undefined);
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
            });
        });
    });

    // we check if a single custom utm tag is recorded in the view event if it is in the utm object
    // and utm object includes more than one utm tags
    it("Checks if a single custom utm tag appears in view", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "?utm_aa=hehe", { aa: true, bb: true });
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, undefined, undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.utm_aa).to.eq("hehe");
                expect(eq[0].segmentation.utm_bb).to.eq(undefined);
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("");
            });
        });
    });

    // we check if multiple custom utm tags are recorded in the view event if they are in the utm object
    it("Checks if multiple custom utm tags appears in view", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "utm_aa=hehe&utm_bb=hoho", { aa: true, bb: true });
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, undefined, undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.utm_aa).to.eq("hehe");
                expect(eq[0].segmentation.utm_bb).to.eq("hoho");
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("hoho");
            });
        });
    });

    // we check if we add a custom utm tag that is not in the utm object
    // it is not recorded in the view event
    it("Checks if extra custom utm tags are ignored in view", () => {
        hp.haltAndClearStorage(() => {
            init("YOUR_APP_KEY", "?utm_aa=hehe&utm_bb=hoho&utm_cc=ignore", { aa: true, bb: true });
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, undefined, undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.utm_aa).to.eq("hehe");
                expect(eq[0].segmentation.utm_bb).to.eq("hoho");
                expect(eq[0].segmentation.utm_cc).to.eq(undefined);
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("hoho");
                expect(custom.utm_cc).to.eq(undefined);
            });
        });
    });

    // we create 2 instances of countly with different configurations
    // then we record the same view with both instances
    // then we check if the utm tags are recorded correctly
    // and no referrer is recorded (because localhost)
    it("Checks if utm tag appears in segmentation in multi instancing", () => {
        hp.haltAndClearStorage(() => {
            // default (original) init with no custom tags and default query
            var C1 = Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                test_mode_eq: true,
                utm: undefined, // utm object provided in init
                getSearchQuery: function() { // override default search query
                    return "?utm_source=hehe";
                }
            });
            C1.track_view(pageNameOne);

            // utm object provided with appropriate query
            var C2 = Countly.init({
                app_key: "Countly_2",
                url: "https://your.domain.count.ly",
                test_mode: true,
                test_mode_eq: true,
                utm: { ss: true }, // utm object provided in init
                getSearchQuery: function() { // override default search query
                    return "utm_ss=hehe2";
                }
            });
            C2.track_view(pageNameOne);

            // check original
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, "hehe", undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });

            // second instance
            cy.fetch_local_event_queue("Countly_2").then((eq) => {
                cy.log(eq);
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, undefined, undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.utm_ss).to.eq("hehe2");
                expect(eq[0].segmentation.referrer).to.eq(undefined);
            });
        });
    });

    // we use a custom html at fixtures folder ('referrer.html')
    // then we set the referrer to be 'http://www.baidu.com' here manually
    // then we check if the referrer is recorded correctly
    // also we verify utms are recorded properly too
    it("Check if referrer is recorded correctly", () => {
        cy.visit("./cypress/fixtures/referrer.html", {
            onBeforeLoad(win) {
                Object.defineProperty(win.document, "referrer", {
                    configurable: true,
                    get() {
                        return "http://www.baidu.com"; // set custom referrer
                    }
                });
            }
        });
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                cy.check_view_event(eq[0], "/cypress/fixtures/referrer.html", undefined, false);
                hp.validateDefaultUtmTags(eq[0].segmentation, undefined, undefined, undefined, undefined, undefined);
                expect(eq[0].segmentation.utm_aa).to.eq("hehe");
                expect(eq[0].segmentation.utm_bb).to.eq(undefined);
                expect(eq[0].segmentation.referrer).to.eq("http://www.baidu.com");
            });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq(undefined);
            });
        });
    });
});

describe("isReferrerUsable tests", () => {
    it("should return false if document.referrer is undefined", () => {
        const result = Countly._internals.isReferrerUsable(undefined);
        expect(result).to.eq(false);
    });

    it("should return false if document.referrer is null", () => {
        const result = Countly._internals.isReferrerUsable(null);
        expect(result).to.eq(false);
    });

    it("should return false if document.referrer is an empty string", () => {
        const result = Countly._internals.isReferrerUsable("");
        expect(result).to.eq(false);
    });

    it("should return false if the referrer is the same as the current hostname", () => {
        const result = Countly._internals.isReferrerUsable("http://localhost:3000");
        expect(result).to.eq(false);
    });

    it("should return false if the referrer is not a valid URL", () => {
        const result = Countly._internals.isReferrerUsable("invalid-url");
        expect(result).to.eq(false);
    });

    it("should return false if the referrer is in the ignore list", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                ignore_referrers: ["http://example.com"]
            });
            const result = Countly._internals.isReferrerUsable("http://example.com/something");
            expect(result).to.eq(false);
        });
    });

    it("should return true if the referrer is valid and not in the ignore list", () => {
        hp.haltAndClearStorage(() => {
            const result = Countly._internals.isReferrerUsable("http://example.com/path");
            expect(result).to.eq(true);
        });
    });
});