/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

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

// the parameter reader of the server's widget pages (nps-popup-v2.html and the other popups)
function readLikeTheWidgetPage(url, name) {
    var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

describe("Feedback widget URL values", () => {
    it("reach the widget page unchanged, whatever characters they hold", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                device_id: "john+test@mail.com&x#y 100%",
                app_version: "1.0+beta&rc#2",
                test_mode: true,
                debug: true
            });
            Countly.present_feedback_widget(npsWidget, undefined, undefined, { plan: "a&b+c#d 50%" });
            var src = presentedIframeSrc();
            expect(readLikeTheWidgetPage(src, "device_id")).to.equal("john+test@mail.com&x#y 100%");
            expect(readLikeTheWidgetPage(src, "app_version")).to.equal("1.0+beta&rc#2");
            expect(JSON.parse(readLikeTheWidgetPage(src, "custom")).sg).to.deep.equal({ plan: "a&b+c#d 50%" });
            expect(readLikeTheWidgetPage(src, "origin")).to.equal(window.origin);
        });
    });

    it("reach the older rating widget page unchanged, whatever characters they hold", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                device_id: "john+test@mail.com&x#y 100%",
                test_mode: true,
                debug: true,
                fake_request_handler: (req) => {
                    if (req.url.indexOf("/o/feedback/widget") !== -1) {
                        return { status: 200, responseText: JSON.stringify({ _id: "legacy123" }) };
                    }
                    return undefined;
                }
            });
            Countly.presentRatingWidgetWithID("legacy123");
            var iframe = document.getElementById("countly-feedback-iframe");
            expect(iframe, "rating iframe should be created").to.exist;
            expect(readLikeTheWidgetPage(iframe.getAttribute("src"), "device_id")).to.equal("john+test@mail.com&x#y 100%");
            expect(readLikeTheWidgetPage(iframe.getAttribute("src"), "widget_id")).to.equal("legacy123");
        });
    });
});

describe("Feedback widget platform", () => {
    it("is left out when the SDK does not know it, so the widget page uses its web default", () => {
        hp.haltAndClearStorage(() => {
            initWithUrl("https://your.domain.count.ly");
            Countly.present_feedback_widget(npsWidget);
            expect(readLikeTheWidgetPage(presentedIframeSrc(), "platform")).to.equal(null);
        });
    });
});

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
