/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

const contactMe = true;
const platform = "platform";
const app_version = "app_version";
const comment = "comment";
const answers = [{ answer: "text", id: "1" }, { answer: 7, id: "2" }, { answer: "52,45", id: "3" }];

function ratingMaker(a, b) {
    return {
        widget_id: a, // string
        contactMe: contactMe, // boolean
        platform: platform, // string
        app_version: app_version, // string
        rating: b, // number
        comment: comment // string
    };
}
function npsMaker(a, b) {
    return {
        widget_id: a, // string
        platform: platform, // string
        app_version: app_version, // string
        rating: b, // number
        comment: comment // string
    };
}
function surveyMaker(a, b) {
    return {
        widget_id: a, // string
        platform: platform, // string
        app_version: app_version, // string
        answers: b

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
        }
    }
}

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1,
        test_mode: true,
        debug: true

    });
}

describe("Manual rating widget recording tests ", () => {
    it("Checks if a rating object is send correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID(ratingMaker("123", 1));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0]);
                common_rating_check(eq, 1);
                cy.expect(eq[0].segmentation.rating).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Checks if one of two rating recordings would be stopped", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordRatingWidgetWithID(ratingMaker("123", 1));
            Countly.recordRatingWidgetWithID(ratingMaker("321", 3));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0]);
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
                cy.check_commons(eq[0]);
                cy.expect(eq[0].key).to.equal("[CLY]_star_rating");
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
                cy.check_commons(eq[0]);
                cy.expect(eq[0].key).to.equal("[CLY]_star_rating");
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
            Countly.recordSurveyNpsWithID("nps", npsMaker("123", 1));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 2);
                cy.expect(eq[0].segmentation.rating).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Checks if an nps would be omitted if 2 sent", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("nps", npsMaker("123", 1));
            Countly.recordSurveyNpsWithID("nps", npsMaker("321", 2));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 2);
                cy.expect(eq[0].segmentation.rating).to.equal(1);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
            });
        });
    });
    it("Checks if nps would be omitted with no id", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("nps", npsMaker(undefined, 1));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if rating would be curbed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("nps", npsMaker("123", 11));
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
            Countly.recordSurveyNpsWithID("survey", surveyMaker("123", answers));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 3);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation["answ-1"]).to.equal("text");
                cy.expect(eq[0].segmentation["answ-2"]).to.equal(7);
                cy.expect(eq[0].segmentation["answ-3"]).to.equal("52,45");
            });
        });
    });
    it("Checks if a survey would be omitted if 2 sent", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("survey", surveyMaker("123", answers));
            Countly.recordSurveyNpsWithID("survey", surveyMaker("321", answers));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0], 3);
                cy.expect(eq[0].segmentation.widget_id).to.equal("123");
                cy.expect(eq[0].segmentation["answ-1"]).to.equal("text");
                cy.expect(eq[0].segmentation["answ-2"]).to.equal(7);
                cy.expect(eq[0].segmentation["answ-3"]).to.equal("52,45");
            });
        });
    });
    it("Checks if wrong answer array would be rejected", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("survey", surveyMaker("123", []));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Checks if no id would be rejected", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.recordSurveyNpsWithID("survey", surveyMaker(undefined, answers));
            cy.fetch_local_event_queue().then((eq) => {
                cy.log(eq);
                expect(eq.length).to.equal(0);
            });
        });
    });
});