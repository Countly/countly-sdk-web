/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

const npsWidget = { _id: "widget123", type: "nps" };
const widgetData = { true: true };

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}

function presentedCustomObject() {
    var iframe = document.getElementById("countly-surveys-iframe");
    expect(iframe, "surveys iframe should be created").to.exist;
    var src = iframe.getAttribute("src");
    return JSON.parse(decodeURIComponent(src.split("&custom=")[1].split("&origin=")[0]));
}

describe("Global content segmentation", () => {
    it("is added to a manually reported widget event, and the event's own keys win over it", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({ screen: "checkout", step: 3, rating: "should lose to the answer" });
            Countly.reportFeedbackWidgetManually(npsWidget, widgetData, { rating: 4, comment: "all good" });
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0]);
                expect(eq[0].key).to.equal("[CLY]_nps");
                expect(eq[0].segmentation.screen).to.equal("checkout");
                expect(eq[0].segmentation.step).to.equal(3);
                expect(eq[0].segmentation.rating).to.equal(4);
                expect(eq[0].segmentation.comment).to.equal("all good");
                expect(eq[0].segmentation.widget_id).to.equal("widget123");
            });
        });
    });

    it("is replaced by a later call, and cleared by null or an empty object", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({ screen: "checkout" });
            Countly.content.setGlobalContentSegmentation({ state: "logged_in" });
            Countly.reportFeedbackWidgetManually(npsWidget, widgetData, { rating: 4 });
            Countly.content.setGlobalContentSegmentation(null);
            Countly.reportFeedbackWidgetManually(npsWidget, widgetData, { rating: 4 });
            Countly.content.setGlobalContentSegmentation({});
            Countly.reportFeedbackWidgetManually(npsWidget, widgetData, { rating: 4 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(3);
                expect(eq[0].segmentation.state).to.equal("logged_in");
                expect(eq[0].segmentation.screen).to.equal(undefined);
                expect(eq[1].segmentation.state).to.equal(undefined);
                expect(eq[2].segmentation.state).to.equal(undefined);
            });
        });
    });

    it("drops the keys the widget events report themselves, including on a closed widget", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({
                widget_id: "hijacked",
                platform: "hijacked",
                app_version: "hijacked",
                closed: "hijacked",
                screen: "settings"
            });
            Countly.reportFeedbackWidgetManually(npsWidget, widgetData, null);
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                expect(eq[0].segmentation.widget_id).to.equal("widget123");
                expect(eq[0].segmentation.platform).to.not.equal("hijacked");
                expect(eq[0].segmentation.app_version).to.not.equal("hijacked");
                expect(eq[0].segmentation.closed).to.equal(1);
                expect(eq[0].segmentation.screen).to.equal("settings");
            });
        });
    });

    it("is added to a rating widget recorded by id and survives a session ending and a new one starting", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({ screen: "pricing" });
            Countly.end_session();
            Countly.begin_session();
            Countly.recordRatingWidgetWithID({ widget_id: "rating123", rating: 3 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_commons(eq[0]);
                expect(eq[0].key).to.equal("[CLY]_star_rating");
                expect(eq[0].segmentation.screen).to.equal("pricing");
                expect(eq[0].segmentation.rating).to.equal(3);
                expect(eq[0].segmentation.widget_id).to.equal("rating123");
            });
        });
    });

    it("travels to a presented widget, which reports its own events", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({ screen: "onboarding", step: 2 });
            Countly.present_feedback_widget(npsWidget);
            var custom = presentedCustomObject();
            expect(custom.sg.screen).to.equal("onboarding");
            expect(custom.sg.step).to.equal(2);
            expect(custom.tc).to.equal(1);
        });
    });

    it("loses to a segmentation given to the presenting call for the same key", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.content.setGlobalContentSegmentation({ screen: "onboarding", step: 2 });
            Countly.present_feedback_widget(npsWidget, undefined, undefined, { screen: "checkout" });
            var custom = presentedCustomObject();
            expect(custom.sg.screen).to.equal("checkout");
            expect(custom.sg.step).to.equal(2);
        });
    });

    it("is left out of the presented widget when nothing was set", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.present_feedback_widget(npsWidget);
            var custom = presentedCustomObject();
            expect(custom.sg).to.equal(undefined);
        });
    });
});
