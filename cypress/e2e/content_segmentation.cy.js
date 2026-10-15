/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

var npsWidget = { _id: "nps-widget", type: "nps" };
var surveyWidget = { _id: "survey-widget", type: "survey" };
var ratingWidget = { _id: "rating-widget", type: "rating" };
var contentAnswer = JSON.stringify({ html: "https://your.domain.count.ly/_external/content?id=1", geo: { l: { x: 0, y: 0, w: 100, h: 100 }, p: { x: 0, y: 0, w: 100, h: 100 } } });

function init(config) {
    Countly.init(Object.assign({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        device_id: "segmentation tester",
        test_mode_eq: true,
        debug: true,
        fake_request_handler: (req) => {
            if (req.params && req.params.method === "queue") {
                return { status: 200, responseText: contentAnswer };
            }
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, config || {}));
}

// the segmentation of each queued event with this key
function queued(key) {
    return Countly._internals.getEventQueue().filter((event) => event.key === key).map((event) => event.segmentation);
}

// the segmentation a widget the SDK opens is given, as the widget page reads it from its URL
function presentedSegmentation() {
    var src = document.getElementById("countly-surveys-iframe").getAttribute("src");
    var custom = new URL(src).searchParams.get("custom");
    return JSON.parse(custom).sg;
}

// every line printed to the console from this call on, until restore() is called
function printed() {
    var lines = [];
    var saved = {};
    ["log", "debug", "info", "warn", "error"].forEach((k) => {
        saved[k] = console[k];
        console[k] = function () {
            lines.push(Array.prototype.join.call(arguments, " "));
        };
    });
    lines.restore = () => Object.keys(saved).forEach((k) => {
        console[k] = saved[k];
    });
    return lines;
}

function contentFrame() {
    return document.getElementById("cly-content-iframe");
}

// a message the shown content sends to the page
function fromContent(data) {
    window.dispatchEvent(new MessageEvent("message", { data: data, origin: "https://your.domain.count.ly", source: contentFrame().contentWindow }));
}

describe("Global content segmentation", () => {
    afterEach(() => {
        document.querySelectorAll("#cly-content-iframe, .countly-surveys-wrapper, #csbg").forEach((node) => node.remove());
    });

    it("goes with every widget result the SDK records", () => {
        hp.haltAndClearStorage(() => {
            init({ global_content_segmentation: { plan: "pro", tier: 2, beta: true, tags: ["a", "b"] } });
            Countly.reportFeedbackWidgetManually(npsWidget, {}, { rating: 9, comment: "fine" });
            Countly.reportFeedbackWidgetManually(surveyWidget, {}, { "answ-1": "yes" });
            Countly.reportFeedbackWidgetManually(ratingWidget, {}, { rating: 4 });
            Countly.recordRatingWidgetWithID({ widget_id: "star-widget", rating: 3 });
            cy.then(() => {
                var nps = queued("[CLY]_nps")[0];
                expect(nps).to.include({ widget_id: "nps-widget", rating: 9, comment: "fine", plan: "pro", tier: 2, beta: true });
                expect(nps.tags).to.deep.equal(["a", "b"]);
                expect(queued("[CLY]_survey")[0]).to.include({ "answ-1": "yes", plan: "pro" });
                var ratings = queued("[CLY]_star_rating");
                expect(ratings).to.have.length(2);
                ratings.forEach((segmentation) => expect(segmentation).to.include({ plan: "pro", tier: 2 }));
            });
        });
    });

    it("is set and replaced with Countly.content.setGlobalContentSegmentation, and cleared with null or an empty object", () => {
        hp.haltAndClearStorage(() => {
            init();
            Countly.content.setGlobalContentSegmentation({ first: "1" });
            Countly.content.setGlobalContentSegmentation({ second: "2" });
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 1 });
            Countly.content.setGlobalContentSegmentation(null);
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 2 });
            Countly.content.setGlobalContentSegmentation({ third: "3" });
            Countly.content.setGlobalContentSegmentation({});
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 3 });
            cy.then(() => {
                var ratings = queued("[CLY]_star_rating");
                expect(ratings[0]).to.include({ second: "2" }).and.not.have.property("first");
                expect(ratings[1]).to.not.have.any.keys("first", "second", "third");
                expect(ratings[2]).to.not.have.any.keys("first", "second", "third");
            });
        });
    });

    it("leaves out keys the server and the widget pages use, so a dismissed widget gets no rating from it", () => {
        hp.haltAndClearStorage(() => {
            init();
            var lines = printed();
            Countly.content.setGlobalContentSegmentation({ plan: "pro", rating: 5, closed: 1, campaign_id: "spring", answer_source: "home", widget_id: "x", journey_id: "j" });
            lines.restore();
            Countly.reportFeedbackWidgetManually(npsWidget, {}, null);
            Countly.reportFeedbackWidgetManually(surveyWidget, {}, { "answ-1": "yes" });
            cy.then(() => {
                var dismissed = queued("[CLY]_nps")[0];
                expect(dismissed).to.include({ closed: 1, widget_id: "nps-widget", plan: "pro" });
                expect(dismissed).to.not.have.property("rating");
                var answered = queued("[CLY]_survey")[0];
                expect(answered).to.not.have.any.keys("closed", "campaign_id", "answer_source", "journey_id");
                var warning = lines.filter((line) => line.indexOf("setGlobalContentSegmentation") !== -1 && line.indexOf("campaign_id") !== -1);
                expect(warning, "one warning names the keys left out").to.have.length(1);
                ["rating", "closed", "answer_source", "widget_id", "journey_id"].forEach((key) => expect(warning[0]).to.contain(key));
            });
        });
    });

    it("keeps strings, numbers, booleans and lists of those, and leaves out anything else", () => {
        hp.haltAndClearStorage(() => {
            init();
            Countly.content.setGlobalContentSegmentation({ text: "a", number: 1, flag: false, list: ["x", 2, true, { no: 1 }, null], object: { a: 1 }, nothing: null, fn: () => 1 });
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 1 });
            cy.then(() => {
                var segmentation = queued("[CLY]_star_rating")[0];
                expect(segmentation).to.include({ text: "a", number: 1, flag: false });
                expect(segmentation.list).to.deep.equal(["x", 2, true]);
                expect(segmentation).to.not.have.any.keys("object", "nothing", "fn");
            });
        });
    });

    it("is held to the SDK's limits when it is set, and its keys come after the event's own when an event is over the limit", () => {
        hp.haltAndClearStorage(() => {
            init({ max_key_length: 11, max_value_size: 4, max_segmentation_values: 4 });
            // under the 11 character key limit, campaign_id_x would be sent as campaign_id
            Countly.content.setGlobalContentSegmentation({ campaign_id_x: "c", averylongkeyname: "longer value", g2: "2", g3: "3", g4: ["abcdef", 7], g5: "5" });
            Countly.present_feedback_widget(npsWidget);
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 1 });
            cy.then(() => {
                expect(presentedSegmentation()).to.deep.equal({ averylongke: "long", g2: "2", g3: "3", g4: ["abcd", 7] });
                var segmentation = queued("[CLY]_star_rating")[0];
                // widget_id, rating and app_version are the event's own
                expect(Object.keys(segmentation)).to.have.length(4);
                expect(segmentation).to.include({ widget_id: "w", rating: 1, averylongke: "long" });
            });
        });
    });

    it("is sent to the widgets the SDK opens, where the call's own segmentation wins", () => {
        hp.haltAndClearStorage(() => {
            init({ global_content_segmentation: { plan: "global", tier: 2 } });
            Countly.present_feedback_widget(npsWidget, undefined, undefined, { plan: "call", source: "header" });
            cy.then(() => {
                expect(presentedSegmentation()).to.deep.equal({ plan: "call", source: "header", tier: 2 });
                Countly.present_feedback_widget(npsWidget);
                expect(presentedSegmentation()).to.deep.equal({ plan: "global", tier: 2 });
                Countly.content.setGlobalContentSegmentation(null);
                Countly.present_feedback_widget(npsWidget);
                expect(presentedSegmentation(), "no segmentation to send").to.equal(undefined);
            });
        });
    });

    it("goes with every event a content page sends, where the event's own keys win", () => {
        hp.haltAndClearStorage(() => {
            init({ global_content_segmentation: { plan: "pro", source: "global" } });
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "content on screen").to.exist;
                fromContent({ event: [{ key: "[CLY]_content_shown", segmentation: { content_id: "c1" } }, { key: "banner_click", count: 1, segmentation: { source: "banner" } }] });
                expect(queued("[CLY]_content_shown")[0]).to.include({ content_id: "c1", plan: "pro", source: "global" });
                expect(queued("banner_click")[0]).to.include({ source: "banner", plan: "pro" });
            });
        });
    });

    it("stays when the device ID changes and goes with halt", () => {
        hp.haltAndClearStorage(() => {
            init({ global_content_segmentation: { plan: "pro" } });
            Countly.change_id("someone else", false);
            Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 1 });
            cy.then(() => {
                expect(queued("[CLY]_star_rating")[0]).to.include({ plan: "pro" });
                Countly.halt();
                init();
                Countly.recordRatingWidgetWithID({ widget_id: "w", rating: 2 });
                expect(queued("[CLY]_star_rating").pop()).to.not.have.property("plan");
            });
        });
    });
});
