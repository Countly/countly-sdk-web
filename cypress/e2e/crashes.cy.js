/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true
    });
}

function cause_error() {
    // eslint-disable-next-line no-undef
    undefined_function();
}

describe("Crashes tests ", () => {
    it("Checks if a caught crash is reported correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_errors();
            try {
                cause_error();
            }
            catch (err) {
                Countly.log_error(err);
            }
            cy.wait(1000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.check_crash(rq[0], hp.appKey);
                });
            });
        });
    });

    it("Keeps no breadcrumbs when the breadcrumb limit is 0", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                max_breadcrumb_count: 0
            });
            Countly.add_log("first breadcrumb");
            Countly.add_log("second breadcrumb");
            Countly.log_error(new Error("reported without breadcrumbs"));
            cy.wait(1000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    var crash = JSON.parse(rq.filter((r) => r.crash)[0].crash);
                    expect(crash._logs || "").to.not.contain("breadcrumb");
                });
            });
        });
    });
});
