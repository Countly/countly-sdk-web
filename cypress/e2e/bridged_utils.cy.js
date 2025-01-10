/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

function initMain(name, version) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        debug: true,
        sdk_name: name,
        sdk_version: version
    });
}

const SDK_NAME = "javascript_native_web";
const SDK_VERSION = "24.11.4";

// tests
describe("Bridged SDK Utilities Tests", () => {
    it("Check if we can override sdk name and version successful", () => {
        hp.haltAndClearStorage(() => {
            initMain('javascript_gtm_web', '24.0.0');
            hp.events();
            cy.fetch_local_request_queue().then((eq) => {
                expect(eq).to.have.length(1);
                expect(eq[0].sdk_name).to.equal("javascript_gtm_web");
                expect(eq[0].sdk_version).to.equal("24.0.0");
            });
        });
    });
    it("Check if SDK uses default values if SDK name and version was not overriden", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, undefined); 
            hp.events();
            cy.fetch_local_request_queue().then((eq) => {
                expect(eq).to.have.length(1);
                expect(eq[0].sdk_name).to.equal(SDK_NAME);
                expect(eq[0].sdk_version).to.equal(SDK_VERSION);
            });
        });
    });
});