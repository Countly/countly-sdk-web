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

describe("Health Check tests", () => {
    it("Check if health check is sent at the beginning", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.intercept("POST", "https://your.domain.count.ly/i").as("postXhr");
            cy.wait("@postXhr").then((xhr) => {
                const body = xhr.request.body;
                const params = new URLSearchParams(body);

                const hcParam = params.get("hc");
                const hcParamObj = JSON.parse(decodeURIComponent(hcParam));
                expect(hcParamObj).to.eql({ el: 0, wl: 0, sc: -1, em: "", bom: 0, cbom: 0 });

                const metricsParam = params.get("metrics");
                expect(metricsParam).to.equal("{\"_app_version\":\"0.0\",\"_ua\":\"abcd\"}");

                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
            });
        });
    });
    it("Check no health check is sent in offline mode", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                offline_mode: true
            });

            cy.intercept("POST", "https://your.domain.count.ly/i").as("postXhr");
            cy.get('@postXhr').should('not.exist');
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(0);
            });
        });
    });
    it("Sends nothing for an ignored visitor, so no user without a device ID is created", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                ignore_visitor: true,
                remote_config: true,
                fake_request_handler: (req) => {
                    sent.push(req.functionName + " device_id:" + req.params.device_id);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.fetch_remote_config();
            Countly.get_available_feedback_widgets(() => {});
            cy.wait(1500).then(() => {
                expect(sent.filter((request) => request.indexOf("device_id:undefined") !== -1)).to.deep.equal([]);
            });
        });
    });
    it("Reads the counters back from cookies with cookie storage", () => {
        hp.haltAndClearStorage(() => {
            document.cookie = "YOUR_APP_KEY/cly_hc_error_count=3; path=/";
            document.cookie = "YOUR_APP_KEY/cly_hc_warning_count=2; path=/";
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                storage: "cookie"
            });
            expect(Countly.hcErrorCount).to.equal(3);
            expect(Countly.hcWarningCount).to.equal(2);
        });
    });
});
