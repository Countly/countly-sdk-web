/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode_eq: true
    });
}
// TODO: Make tests browser specific as all browsers does not support userAgentData yet.
// TODO: check if userAgentData is configurable in cypress config file (currently not)
describe("User Agent tests ", () => {
    it("Check if the user agent set by the developer was recognized by the SDK", () => {
        hp.haltAndClearStorage(() => {
            cy.visit("./cypress/fixtures/user_agent.html");
            // we set an attribute in documentElement (html tag for html files) called data-countly-useragent at our SDK with the currentUserAgentString function value, check if it corresponds to user agent string
            cy.get("html")
                .invoke("attr", "data-countly-useragent")
                // this value was set at the cypress.json file
                .should("eq", "abcd");
            // in test html file we created a button and set its value to detect_device(), check if it returns the correct device type
            cy.get("button")
                .invoke("attr", "value")
                // useragent had no info on device type so should return desktop by default
                .should("eq", "desktop");
            // in test html file we created a button and set its name to is_bot(), check if it returns the correct value
            cy.get("button")
                .invoke("attr", "name")
                // useragent has no info about search bots so returns false
                .should("eq", "false");
        });
    });
    it("Check if currentUserAgentString works as intended", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // from the config file set ua value
            expect(Countly._internals.currentUserAgentString()).to.equal("abcd");
            // we override the ua string
            expect(Countly._internals.currentUserAgentString("123")).to.equal("123");
        });
    });
    it("Check if userAgentDeviceDetection works as intended", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // setting ua value to strings that can pass the regex test
            expect(Countly._internals.userAgentDeviceDetection("123")).to.equal("desktop");
            expect(Countly._internals.userAgentDeviceDetection("mobile")).to.equal("phone");
            expect(Countly._internals.userAgentDeviceDetection("tablet")).to.equal("tablet");
        });
    });
    it("Check if userAgentSearchBotDetection works as intended", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // setting ua value to strings that can pass the regex test
            expect(Countly._internals.userAgentSearchBotDetection("")).to.equal(false);
            expect(Countly._internals.userAgentSearchBotDetection("123")).to.equal(false);
            expect(Countly._internals.userAgentSearchBotDetection("Googlebot")).to.equal(true);
            expect(Countly._internals.userAgentSearchBotDetection("Google")).to.equal(false);
            expect(Countly._internals.userAgentSearchBotDetection("HeadlessChrome")).to.equal(true);
            expect(Countly._internals.userAgentSearchBotDetection("Chrome-Lighthouse")).to.equal(true);
            expect(Countly._internals.userAgentSearchBotDetection("Lighthouse")).to.equal(true);
        });
    });
    // userAgentData is not supported by all browsers yet so it is hard to test with consistency
    it("Check if currentUserAgentDataString override works", () => {
        hp.haltAndClearStorage(() => {
            expect(Countly._internals.currentUserAgentDataString('123')).to.equal("123");
        });
    });
});
