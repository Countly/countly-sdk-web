/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

const contactMe = true;
const platform = "platform";
const email = "email";
const app_version = "app_version";
const comment = "comment";
const CountlyWidgetData = { true: true };

function CountlyFeedbackWidgetMaker(a, b) {
    return { _id: a, type: b };
}

function widgetResponseMakerNpsRating(a) {
    return {
        contactMe: contactMe, // boolean
        rating: a, // number
        email: email,
        comment: comment // string
    };
}
function widgetResponseMakerSurvey(a, b, c, d) {
    return {
        a: b,
        c: d
    };
}

function ratingMaker(a, b) {
    return {
        widget_id: a, // string
        contactMe: contactMe, // boolean
        platform: platform, // string
        app_version: app_version, // string
        rating: b, // number
        comment: comment, // string
        email: email // string
    };
}
// num is 1 for ratings, 2 for nps, 3 for surveys
function common_rating_check(param, num) {
    // eslint-disable-next-line no-nested-ternary
    cy.expect(param[0].key).to.equal(num === 1 ? "[CLY]_star_rating" : num === 2 ? "[CLY]_nps" : "[CLY]_survey");
    cy.expect(param[0].segmentation.app_version).to.equal(app_version);
    cy.expect(param[0].segmentation.platform).to.equal(platform);
    if (num !== 3) {
        cy.expect(param[0].segmentation.comment).to.equal(comment);
        if (num === 1) {
            cy.expect(param[0].segmentation.contactMe).to.equal(contactMe);
            cy.expect(param[0].segmentation.email).to.equal(email);
        }
    }
}

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode_eq: true,
        test_mode: true,
        debug: true

    });
}
// TODO: Add more tests
describe("Manual Rating Widget recording tests, old call ", () => {
    it("Checks if a rating object is send correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID(ratingMaker("123", 1));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 1);
                common_rating_check(eq, 1);
                cy.expect(eq[0].segmentation.rating).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Checks if rating recording without id would be stopped", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID(ratingMaker(undefined, 1));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if rating recording without rating would be stopped", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID(ratingMaker("123", undefined));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if id and rating is enough", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID({ widget_id: "123", rating: 1 });
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 1);
                cy.expect(eq[0].segmentation.rating).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Check improper rating number in fixed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID({ widget_id: "123", rating: 11 });
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 1);
                cy.expect(eq[0].segmentation.rating).to.equal(5);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
});
describe("Manual nps recording tests ", () => {
    it("Checks if a nps is send correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(2));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 2);
                cy.expect(eq[0].segmentation.rating).to.equal(2);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Checks if nps would be omitted with no id", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker(undefined, "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(2));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if rating would be curbed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(11));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 2);
                cy.expect(eq[0].segmentation.rating).to.equal(10);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
});
describe("Manual survey recording tests ", () => {
    it("Checks if a survey is send correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "survey"), CountlyWidgetData, widgetResponseMakerSurvey("a", "b", "c", 7));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 3);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation.a).to.equal("b");
                cy.expect(eq[0].segmentation.c).to.equal(7);
            });
        });
    });
    it("Checks if null response would have closed flag", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "survey"), CountlyWidgetData, null);
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 3);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation.closed).to.equal(1);
            });
        });
    });
    it("Checks if no id would be rejected", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker(undefined, "survey"), CountlyWidgetData, widgetResponseMakerSurvey("a", "b", "c", 7));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
});
describe("Manual Rating widget recording tests, new call ", () => {
    it("Checks if a rating is send correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "rating"), CountlyWidgetData, widgetResponseMakerNpsRating(3));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation.rating).to.equal(3);
            });
        });
    });
    it("Checks if null response would have closed flag", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "rating"), CountlyWidgetData, null);
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation.closed).to.equal(1);
            });
        });
    });
    it("Checks if no id would be rejected", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker(undefined, "rating"), CountlyWidgetData, widgetResponseMakerNpsRating(3));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if rating would be curbed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "rating"), CountlyWidgetData, widgetResponseMakerNpsRating(6));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 1);
                cy.expect(eq[0].segmentation.rating).to.equal(5);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
});