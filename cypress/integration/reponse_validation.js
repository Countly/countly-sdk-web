/* eslint-disable comma-spacing */
/* eslint-disable key-spacing */
/* eslint-disable quote-props */
/* eslint-disable object-curly-spacing */
/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        tests: true,
        max_events: -1,
        debug: true
    });
}
// a convenience function to test wrong status code options
function variedStatusCodeTestPack(callback, response, ignoreResultField, result) {
    expect(callback(response, ignoreResultField)).to.equal(result);
    expect(callback(-500, response, ignoreResultField)).to.equal(result);
    expect(callback(-400, response, ignoreResultField)).to.equal(result);
    expect(callback(-301, response, ignoreResultField)).to.equal(result);
    expect(callback(-300, response, ignoreResultField)).to.equal(result);
    expect(callback(-201, response, ignoreResultField)).to.equal(result);
    expect(callback(-200, response, ignoreResultField)).to.equal(result);
    expect(callback(-100, response, ignoreResultField)).to.equal(result);
    expect(callback(0, response, ignoreResultField)).to.equal(result);
    expect(callback(100, response, ignoreResultField)).to.equal(result);
    expect(callback(300, response, ignoreResultField)).to.equal(result);
    expect(callback(301, response, ignoreResultField)).to.equal(result);
    expect(callback(400, response, ignoreResultField)).to.equal(result);
    expect(callback(500, response, ignoreResultField)).to.equal(result);
}

function fakeResponseTestPack(callback, ignoreResultField, result) {
    variedStatusCodeTestPack(callback, numberResponse, ignoreResultField, result);
    variedStatusCodeTestPack(callback, stringResponse, ignoreResultField, result);
    variedStatusCodeTestPack(callback, arrayResponse1, ignoreResultField, result);
    variedStatusCodeTestPack(callback, arrayResponse2, ignoreResultField, result);
    variedStatusCodeTestPack(callback, arrayResponse3, ignoreResultField, result);
    variedStatusCodeTestPack(callback, arrayResponse4, ignoreResultField, result);
    variedStatusCodeTestPack(callback, objectResponse1, ignoreResultField, result);
    variedStatusCodeTestPack(callback, objectResponse2, ignoreResultField, result);
    variedStatusCodeTestPack(callback, objectResponse3, ignoreResultField, result);
    variedStatusCodeTestPack(callback, objectResponse4, ignoreResultField, result);
    variedStatusCodeTestPack(callback, nullResponse, ignoreResultField, result);
    variedStatusCodeTestPack(callback, undefinedResponse, ignoreResultField, result);
}

function fakeResponseKeyTestPack(callback, response, ignoreResultField, result) {
    expect(callback(200, response, ignoreResultField)).to.equal(result);
    expect(callback(201, response, ignoreResultField)).to.equal(result);
}
// responses, stringified from actual parsed responses from the server
const enableRatingResponse = JSON.stringify([{"_id":"619b8dd77730596209194f7e","popup_header_text":"hohoho","popup_comment_callout":"Add comment","popup_email_callout":"Contact me via e-mail","popup_button_callout":"Submit feedback","popup_thanks_message":"Thank you for your feedback","trigger_position":"bleft","trigger_bg_color":"13B94D","trigger_font_color":"FFFFFF","trigger_button_text":"Feedback","target_devices":{"phone":false,"desktop":true,"tablet":false},"target_page":"all","target_pages":["/"],"is_active":"true","hide_sticker":false,"app_id":"6181431e09e272efa5f64305","contact_enable":"true","comment_enable":"true","trigger_size":"l","type":"rating","ratings_texts":["Very dissatisfied","Somewhat dissatisfied","Neither satisfied Nor Dissatisfied","Somewhat Satisfied","Very Satisfied"],"status":true,"targeting":null,"timesShown":22,"ratingsCount":4,"ratingsSum":13}]);
const popupResponse = JSON.stringify({"_id":"619b8dd77730596209194f7e","popup_header_text":"hohoho","popup_comment_callout":"Add comment","popup_email_callout":"Contact me via e-mail","popup_button_callout":"Submit feedback","popup_thanks_message":"Thank you for your feedback","trigger_position":"bleft","trigger_bg_color":"13B94D","trigger_font_color":"FFFFFF","trigger_button_text":"Feedback","target_devices":{"phone":false,"desktop":true,"tablet":false},"target_page":"all","target_pages":["/"],"is_active":"true","hide_sticker":false,"app_id":"6181431e09e272efa5f64305","contact_enable":"true","comment_enable":"true","trigger_size":"l","type":"rating","ratings_texts":["Very dissatisfied","Somewhat dissatisfied","Neither satisfied Nor Dissatisfied","Somewhat Satisfied","Very Satisfied"],"status":true,"targeting":null,"timesShown":23,"ratingsCount":4,"ratingsSum":13});
const remoteConfigResponse = JSON.stringify({"Nightfox":{"test":"250 mg"},"firefox":{"clen":"20 mg"}});

// fake responses for other testing purposes
const numberResponse = 551;
const stringResponse = "551";
const arrayResponse1 = [];
const arrayResponse2 = [{}];
// passing response for isResponseValidBroad
const arrayResponse3 = "[{}]";
// passing response for isResponseValidBroad
const arrayResponse4 = "[]";
const objectResponse1 = {};
const objectResponse2 = {[5]:{}};
const objectResponse3 = "{[]}";
// passing response for isResponseValid and isResponseValidBroad
const objectResponse4 = "{}";
const nullResponse = null;
const undefinedResponse = undefined;

describe("Response validation tests ", () => {
    // enableRating call => only isResponseValidBroad with ignored result field should yield true
    it("isResponseValid, ignore result field = false, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, enableRatingResponse, false, false);
            expect(Countly._internals.isResponseValid(200, enableRatingResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, enableRatingResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, enableRatingResponse, true, false);
            expect(Countly._internals.isResponseValid(200, enableRatingResponse, true)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, enableRatingResponse, true)).to.equal(false);
        });
    });
    it("isResponseValidBroad, ignore result field = false, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, enableRatingResponse, false, false);
            expect(Countly._internals.isResponseValid(200, enableRatingResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, enableRatingResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, enableRatingResponse, true, false);
            expect(Countly._internals.isResponseValidBroad(200, enableRatingResponse, true)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, enableRatingResponse, true)).to.equal(true);
        });
    });

    // popup call => both isResponseValidBroad and isResponseValid with ignored result fields should yield true
    it("isResponseValid, ignore result field = false, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, popupResponse, false, false);
            expect(Countly._internals.isResponseValid(200, popupResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, popupResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, popupResponse, true, false);
            expect(Countly._internals.isResponseValid(200, popupResponse, true)).to.equal(true);
            expect(Countly._internals.isResponseValid(201, popupResponse, true)).to.equal(true);
        });
    });
    it("isResponseValidBroad, ignore result field = false, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, popupResponse, false, false);
            expect(Countly._internals.isResponseValid(200, popupResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, popupResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, popupResponse, true, false);
            expect(Countly._internals.isResponseValidBroad(200, popupResponse, true)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, popupResponse, true)).to.equal(true);
        });
    });

    // remoteconfig call => both isResponseValidBroad and isResponseValid with ignored result fields should yield true
    it("isResponseValid, ignore result field = false, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, remoteConfigResponse, false, false);
            expect(Countly._internals.isResponseValid(200, remoteConfigResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, remoteConfigResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, remoteConfigResponse, true, false);
            expect(Countly._internals.isResponseValid(200, remoteConfigResponse, true)).to.equal(true);
            expect(Countly._internals.isResponseValid(201, remoteConfigResponse, true)).to.equal(true);
        });
    });
    it("isResponseValidBroad, ignore result field = false, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, remoteConfigResponse, false, false);
            expect(Countly._internals.isResponseValid(200, remoteConfigResponse, false)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, remoteConfigResponse, false)).to.equal(false);
        });
    });
    it("isResponseValid, ignore result field = true, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, remoteConfigResponse, true, false);
            expect(Countly._internals.isResponseValidBroad(200, remoteConfigResponse, true)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, remoteConfigResponse, true)).to.equal(true);
        });
    });

    // fake response calls => both isResponseValidBroad and isResponseValid with ignored result fields should yield true
    it("isResponseValid, ignore result field = false, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValid, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, numberResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, stringResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse1, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse2, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse3, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse4, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse1, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse2, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse3, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse4, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, nullResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, undefinedResponse, false, false);
        });
    });
    it("isResponseValid, ignore result field = true, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValid, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, numberResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, stringResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse1, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse2, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse3, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse4, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse1, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse2, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse3, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse4, true, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, nullResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, undefinedResponse, true, false);
        });
    });
    it("isResponseValidBroad, ignore result field = false, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValidBroad, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, numberResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, stringResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse1, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse2, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse3, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse4, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse1, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse2, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse3, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse4, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, nullResponse, false, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, undefinedResponse, false, false);
        });
    });
    it("isResponseValid, ignore result field = true, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValidBroad, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, numberResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, stringResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse1, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse2, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse3, true, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse4, true, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse1, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse2, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse3, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse4, true, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, nullResponse, true, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, undefinedResponse, true, false);
        });
    });
});
