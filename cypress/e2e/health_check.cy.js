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

/**
 * Starts the SDK with a request handler that answers every request with success
 * @param {Array} sent - collects the parameters of every request
 * @param {Boolean} debug - print the SDK's logs
 */
function initSending(sent, debug) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        debug: !!debug,
        fake_request_handler: (req) => {
            sent.push(req.params);
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    });
}

describe("Health Check tests", () => {
    afterEach(() => {
        cy.task("setResponseDelay", 0);
        cy.task("stopServer");
    });
    it("Check if health check is sent at the beginning", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.intercept("POST", "https://your.domain.count.ly/i").as("postXhr");
            cy.wait("@postXhr").then((xhr) => {
                const body = xhr.request.body;
                const params = new URLSearchParams(body);

                const hcParam = params.get("hc");
                const hcParamObj = JSON.parse(decodeURIComponent(hcParam));
                // test_mode logs a warning, and the health check counts every warning
                expect(hcParamObj).to.eql({ el: 0, wl: 1, sc: -1, em: "", bom: 0, cbom: 0 });

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
            var sent = [];
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                storage: "cookie",
                fake_request_handler: (req) => {
                    sent.push(req.params);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            // the health check sent at start reports what was read back
            var hc = sent.filter((p) => p.hc).map((p) => JSON.parse(p.hc));
            expect(hc.map((c) => [c.el, c.wl])).to.deep.equal([[3, 2]]);
        });
    });
    it("Resets the counters when the health check is sent, also when it fails", () => {
        hp.haltAndClearStorage(() => {
            localStorage.setItem("YOUR_APP_KEY/cly_hc_error_count", "3");
            localStorage.setItem("YOUR_APP_KEY/cly_hc_warning_count", "2");
            var sent = [];
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                fake_request_handler: (req) => {
                    sent.push(req.params);
                    if (req.functionName === "[healthCheck]") {
                        return { status: 500, responseText: "{\"result\":\"Internal server error\"}" };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            var hc = sent.filter((p) => p.hc).map((p) => JSON.parse(p.hc));
            expect(hc.map((c) => [c.el, c.wl])).to.deep.equal([[3, 2]]);
            expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_error_count")).to.equal("0");
            expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_warning_count")).to.equal("0");
        });
    });
    it("Counts the SDK's errors and warnings when debug printing is off", () => {
        hp.haltAndClearStorage(() => {
            initSending([]);
            // a warning: the timed event is already running
            Countly.start_event("checkout");
            Countly.start_event("checkout");
            // an error: an event without a key
            Countly.add_event({});
            // the counters of the running instance, Countly itself holds their values from init
            expect(Countly.i.YOUR_APP_KEY.hcWarningCount).to.equal(1);
            expect(Countly.i.YOUR_APP_KEY.hcErrorCount).to.equal(1);
        });
    });
    it("Keeps the error and warning counts for the next page when sessions are not tracked", () => {
        hp.haltAndClearStorage(() => {
            initSending([], true);
            Countly.start_event("checkout");
            Countly.start_event("checkout");
            Countly.add_event({});
            // what the next page reads back and reports in its health check
            expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_error_count")).to.equal("1");
            expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_warning_count")).to.equal("1");
        });
    });
    it("Keeps the warnings logged while the health check is on its way for the next health check", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 1000);
            cy.task("startServer").then(() => {
                Countly.init({
                    app_key: "YOUR_APP_KEY",
                    url: "http://localhost:9000"
                });
                // the site's own start-up code runs while the health check request is on its way
                Countly.start_event("checkout");
                Countly.start_event("checkout");
            });
            cy.wait(2500).then(() => {
                expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_warning_count")).to.equal("1");
            });
        });
    });
    it("Records the status and message of any failed request for the next health check", () => {
        hp.haltAndClearStorage(() => {
            cy.intercept("POST", "https://your.domain.count.ly/i", { statusCode: 200, body: "{\"result\":\"Success\"}" });
            // the server configuration request at start fails
            cy.intercept("POST", "https://your.domain.count.ly/o/sdk", { statusCode: 503, body: "{\"result\":\"Service Unavailable\"}" }).as("serverConfig").then(() => {
                Countly.init({
                    app_key: "YOUR_APP_KEY",
                    url: "https://your.domain.count.ly"
                });
            });
            cy.wait("@serverConfig");
            cy.wait(500).then(() => {
                expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_status_code")).to.equal("503");
                expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_error_message")).to.equal("{\"result\":\"Service Unavailable\"}");
            });
        });
    });
    it("Does not record a failed request that got no HTTP answer", () => {
        hp.haltAndClearStorage(() => {
            cy.intercept("https://your.domain.count.ly/**", { forceNetworkError: true }).then(() => {
                Countly.init({
                    app_key: "YOUR_APP_KEY",
                    url: "https://your.domain.count.ly"
                });
                Countly.add_event({ key: "connection_lost" });
            });
            cy.wait(2000).then(() => {
                expect(localStorage.getItem("YOUR_APP_KEY/cly_hc_status_code")).to.equal("-1");
            });
        });
    });
    it("Sends no health check with disable_health_check, and still counts", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                disable_health_check: true,
                fake_request_handler: (req) => {
                    sent.push(req);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.add_event({});
            cy.wait(1000).then(() => {
                expect(sent.filter((r) => r.params.hc), "health check requests").to.have.length(0);
                expect(sent.filter((r) => r.functionName === "server_config"), "the other start-up requests still go out").to.have.length(1);
                expect(Countly.i.YOUR_APP_KEY.hcErrorCount).to.equal(1);
            });
        });
    });
});
