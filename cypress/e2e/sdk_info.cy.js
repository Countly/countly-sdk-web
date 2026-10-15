/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
import { SDK_NAME, SDK_VERSION } from "../support/sdk-modules/Constants.js";
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

describe("SDK name and version methods", () => {
    it("sdk_name and sdk_version return default values when not overridden", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, undefined);
            const name = Countly.sdk_name();
            const version = Countly.sdk_version();
            expect(name).to.equal(SDK_NAME);
            expect(version).to.equal(SDK_VERSION);
        });
    });

    it("sdk_name and sdk_version return overridden values", () => {
        hp.haltAndClearStorage(() => {
            initMain("custom_sdk_name", "1.2.3");
            const name = Countly.sdk_name();
            const version = Countly.sdk_version();
            expect(name).to.equal("custom_sdk_name");
            expect(version).to.equal("1.2.3");
        });
    });
});
