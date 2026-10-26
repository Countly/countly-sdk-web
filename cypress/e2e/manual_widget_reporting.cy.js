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
    it("Checks if an nps score of 0 is sent", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(0));
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.expect(eq[0].segmentation.rating).to.equal(0);
            });
        });
    });
    it("Checks if an nps without a score is omitted", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(undefined));
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(null));
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0);
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
describe("Manual widget reporting that records nothing", () => {
    it("Records nothing for a widget type the SDK does not know", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "poll"), CountlyWidgetData, widgetResponseMakerNpsRating(3));
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0);
            });
        });
    });
    it("Records nothing without the feedback consent", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode_eq: true,
                test_mode: true,
                require_consent: true
            });
            Countly.add_consent("events");
            Countly.reportFeedbackWidgetManually(CountlyFeedbackWidgetMaker("123", "nps"), CountlyWidgetData, widgetResponseMakerNpsRating(3));
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0);
            });
        });
    });
});
describe("Feedback widget data", () => {
    const widgetData = { _id: "widget-1", questions: [{ id: "q1", type: "rating" }] };

    /**
     * Starts the SDK with a request handler that answers the widget data requests with the given answer
     * @param {Array} sent - collects every request
     * @param {Object} answer - status and responseText for the widget data requests
     * @param {Object} options - more init options
     */
    function initAnswering(sent, answer, options) {
        Countly.init(Object.assign({
            app_key: "YOUR_APP_KEY",
            url: "https://your.domain.count.ly",
            app_version: "2.1.0",
            fake_request_handler: (req) => {
                sent.push(req);
                return req.functionName.indexOf("getFeedbackWidgetData") === 0 ? answer : { status: 200, responseText: "{\"result\":\"Success\"}" };
            }
        }, options || {}));
    }

    /**
     * The widget data requests among the sent ones
     * @param {Array} sent - every sent request
     * @returns {Array} widget data requests
     */
    function widgetRequests(sent) {
        return sent.filter((req) => req.functionName.indexOf("getFeedbackWidgetData") === 0);
    }

    ["nps", "survey", "rating"].forEach((type) => {
        it("Fetches the data of a " + type + " widget from its widget endpoint, counting it as shown", () => {
            hp.haltAndClearStorage(() => {
                var sent = [];
                var result = null;
                initAnswering(sent, { status: 200, responseText: JSON.stringify(widgetData) });
                Countly.getFeedbackWidgetData({ _id: "widget-1", type: type }, (data, err) => {
                    result = { data: data, err: err };
                });
                var requests = widgetRequests(sent);
                expect(requests.length).to.equal(1);
                expect(requests[0].url).to.equal("https://your.domain.count.ly/o/surveys/" + type + "/widget");
                expect(requests[0].params).to.include({ widget_id: "widget-1", shown: 1, sdk_name: Countly.sdk_name(), sdk_version: Countly.sdk_version(), app_version: "2.1.0" });
                expect(result).to.deep.equal({ data: widgetData, err: null });
            });
        });
    });
    it("Gives the callback an error when the widget data cannot be fetched", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            var result = null;
            initAnswering(sent, { status: 500, responseText: "{\"result\":\"Internal server error\"}" });
            Countly.getFeedbackWidgetData({ _id: "widget-1", type: "nps" }, (data, err) => {
                result = { data: data, err: err };
            });
            expect(widgetRequests(sent).length).to.equal(1);
            expect(result.data).to.equal(null);
            expect(result.err).to.be.ok;
        });
    });
    it("Fetches nothing and gives the callback a consent error without the feedback consent", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            var result = null;
            initAnswering(sent, { status: 200, responseText: JSON.stringify(widgetData) }, { require_consent: true });
            Countly.getFeedbackWidgetData({ _id: "widget-1", type: "nps" }, (data, err) => {
                result = { data: data, err: err };
            });
            expect(widgetRequests(sent).length).to.equal(0);
            expect(result.data).to.equal(null);
            expect(result.err).to.be.ok;
        });
    });
    it("Fetches nothing for a widget type the SDK does not know", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            initAnswering(sent, { status: 200, responseText: JSON.stringify(widgetData) });
            Countly.getFeedbackWidgetData({ _id: "widget-1", type: "poll" }, () => {});
            expect(widgetRequests(sent).length).to.equal(0);
        });
    });
});