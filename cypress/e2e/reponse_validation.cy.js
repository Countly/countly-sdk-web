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
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}
// a convenience function to test wrong status code options
function variedStatusCodeTestPack(validationFunction, response, result) {
    expect(validationFunction(response)).to.equal(result);
    expect(validationFunction(-500, response)).to.equal(result);
    expect(validationFunction(-400, response)).to.equal(result);
    expect(validationFunction(-301, response)).to.equal(result);
    expect(validationFunction(-300, response)).to.equal(result);
    expect(validationFunction(-201, response)).to.equal(result);
    expect(validationFunction(-200, response)).to.equal(result);
    expect(validationFunction(-100, response)).to.equal(result);
    expect(validationFunction(0, response)).to.equal(result);
    expect(validationFunction(100, response)).to.equal(result);
    expect(validationFunction(300, response)).to.equal(result);
    expect(validationFunction(301, response)).to.equal(result);
    expect(validationFunction(400, response)).to.equal(result);
    expect(validationFunction(500, response)).to.equal(result);
}

function fakeResponseTestPack(validationFunction, result) {
    variedStatusCodeTestPack(validationFunction, numberResponse, result);
    variedStatusCodeTestPack(validationFunction, stringResponse, result);
    variedStatusCodeTestPack(validationFunction, arrayResponse1, result);
    variedStatusCodeTestPack(validationFunction, arrayResponse2, result);
    variedStatusCodeTestPack(validationFunction, arrayResponse3, result);
    variedStatusCodeTestPack(validationFunction, arrayResponse4, result);
    variedStatusCodeTestPack(validationFunction, objectResponse1, result);
    variedStatusCodeTestPack(validationFunction, objectResponse2, result);
    variedStatusCodeTestPack(validationFunction, objectResponse3, result);
    variedStatusCodeTestPack(validationFunction, objectResponse4, result);
    variedStatusCodeTestPack(validationFunction, nullResponse, result);
    variedStatusCodeTestPack(validationFunction, undefinedResponse, result);
}

function fakeResponseKeyTestPack(validationFunction, response, result) {
    expect(validationFunction(200, response)).to.equal(result);
    expect(validationFunction(201, response)).to.equal(result);
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
    // enableRating call => only isResponseValidBroad field should yield true
    it("isResponseValid, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, enableRatingResponse, false);
            expect(Countly._internals.isResponseValid(200, enableRatingResponse)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, enableRatingResponse)).to.equal(false);
        });
    });
    it("isResponseValid, enableRatingResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, enableRatingResponse, false);
            expect(Countly._internals.isResponseValidBroad(200, enableRatingResponse)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, enableRatingResponse)).to.equal(true);
        });
    });

    // popup call => both isResponseValidBroad and isResponseValid fields should yield true
    it("isResponseValid, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, popupResponse, false);
            expect(Countly._internals.isResponseValid(200, popupResponse)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, popupResponse)).to.equal(false);
        });
    });
    it("isResponseValidBroad, popupResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, popupResponse, false);
            expect(Countly._internals.isResponseValidBroad(200, popupResponse)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, popupResponse)).to.equal(true);
        });
    });

    // remoteconfig call => both isResponseValidBroad and isResponseValid fields should yield true
    it("isResponseValid, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValid, remoteConfigResponse, false);
            expect(Countly._internals.isResponseValid(200, remoteConfigResponse)).to.equal(false);
            expect(Countly._internals.isResponseValid(201, remoteConfigResponse)).to.equal(false);
        });
    });
    it("isResponseValidBroad, remoteConfigResponse", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            variedStatusCodeTestPack(Countly._internals.isResponseValidBroad, remoteConfigResponse, false);
            expect(Countly._internals.isResponseValidBroad(200, remoteConfigResponse)).to.equal(true);
            expect(Countly._internals.isResponseValidBroad(201, remoteConfigResponse)).to.equal(true);
        });
    });

    // fake response calls => both isResponseValidBroad and isResponseValid fields should yield true
    it("isResponseValid, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValid, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, numberResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, stringResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse1, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse2, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse3, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, arrayResponse4, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse1, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse2, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse3, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, objectResponse4, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, nullResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValid, undefinedResponse, false);
        });
    });
    it("isResponseValidBroad, fake responses", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            fakeResponseTestPack(Countly._internals.isResponseValidBroad, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, numberResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, stringResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse1, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse2, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse3, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, arrayResponse4, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse1, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse2, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse3, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, objectResponse4, true);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, nullResponse, false);
            fakeResponseKeyTestPack(Countly._internals.isResponseValidBroad, undefinedResponse, false);
        });
    });
});
