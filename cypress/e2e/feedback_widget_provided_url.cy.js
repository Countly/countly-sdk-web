/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

function initWithUrl(url) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: url,
        test_mode: true,
        debug: true
    });
}

var npsWidget = { _id: "widget123", type: "nps" };

function presentedIframeSrc() {
    var iframe = document.getElementById("countly-surveys-iframe");
    expect(iframe, "surveys iframe should be created").to.exist;
    return iframe.getAttribute("src");
}

describe("Feedback widget provided_url parameter", () => {
    it("sends the path prefix (path only, encoded) when the SDK url has one", () => {
        hp.haltAndClearStorage(() => {
            initWithUrl("https://your.domain.count.ly/reverse-proxy/countly");
            Countly.present_feedback_widget(npsWidget);
            var src = presentedIframeSrc();
            // Server rejects any value with ":" or "//", so we send the pathname only.
            expect(src).to.include("provided_url=" + encodeURIComponent("/reverse-proxy/countly"));
            // The origin/scheme must never leak into the value.
            expect(src).to.not.include("provided_url=https");
        });
    });

    it("resolves the path prefix for a same-origin (relative) SDK url", () => {
        hp.haltAndClearStorage(() => {
            initWithUrl("/reverse-proxy/countly");
            Countly.present_feedback_widget(npsWidget);
            var src = presentedIframeSrc();
            expect(src).to.include("provided_url=" + encodeURIComponent("/reverse-proxy/countly"));
        });
    });

    it("omits provided_url entirely when the SDK url has no path prefix", () => {
        hp.haltAndClearStorage(() => {
            initWithUrl("https://your.domain.count.ly");
            Countly.present_feedback_widget(npsWidget);
            var src = presentedIframeSrc();
            expect(src).to.not.include("provided_url");
        });
    });
});
