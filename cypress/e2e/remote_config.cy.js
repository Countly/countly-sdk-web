/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

// answers remote config requests with the given response and every other request with success
function initWithRemoteConfigAnswer(answer, extra) {
    Countly.init(Object.assign({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        debug: true,
        fake_request_handler: (req) => {
            if (req.functionName === "fetch_remote_config_explicit") {
                return answer;
            }
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, extra || {}));
}

function fetchAndRecord(calls) {
    Countly.fetch_remote_config((err, configs) => {
        calls.push({ err: err, configs: configs });
    });
}

// records the parameters of remote config requests and the counters of health checks
function initRecording(extra, rcRequests, healthChecks) {
    Countly.init(Object.assign({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        fake_request_handler: (req) => {
            if (req.functionName === "fetch_remote_config_explicit") {
                rcRequests.push(req.params);
                return { status: 200, responseText: "{\"color\":\"red\"}" };
            }
            if (req.functionName === "[healthCheck]") {
                healthChecks.push(JSON.parse(req.params.hc));
            }
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, extra));
}

describe("Remote config callback", () => {
    it("is called with the configs when the fetch succeeds", () => {
        var calls = [];
        hp.haltAndClearStorage(() => {
            initWithRemoteConfigAnswer({ status: 200, responseText: "{\"color\":\"red\"}" });
            fetchAndRecord(calls);
            cy.wait(1500).then(() => {
                expect(calls.length).to.equal(1);
                expect(calls[0].err).to.not.be.ok;
                expect(calls[0].configs).to.deep.equal({ color: "red" });
            });
        });
    });

    it("is called with an error and the stored configs when the request fails", () => {
        var calls = [];
        hp.haltAndClearStorage(() => {
            initWithRemoteConfigAnswer({ status: 500, responseText: "{\"result\":\"Error\"}" });
            fetchAndRecord(calls);
            cy.wait(1500).then(() => {
                expect(calls.length).to.equal(1);
                expect(calls[0].err).to.be.an("error");
                expect(calls[0].configs).to.be.an("object");
            });
        });
    });

    it("is called with an error when the answer cannot be read", () => {
        var calls = [];
        hp.haltAndClearStorage(() => {
            initWithRemoteConfigAnswer({ status: 200, responseText: "not json" });
            fetchAndRecord(calls);
            cy.wait(1500).then(() => {
                expect(calls.length).to.equal(1);
                expect(calls[0].err).to.be.an("error");
            });
        });
    });

    it("is called with an error when networking is switched off", () => {
        var calls = [];
        hp.haltAndClearStorage(() => {
            initWithRemoteConfigAnswer({ status: 200, responseText: "{\"color\":\"red\"}" }, { behavior_settings: { c: { networking: false } }, disable_sdk_behavior_settings_updates: true });
            fetchAndRecord(calls);
            cy.wait(1500).then(() => {
                expect(calls.length).to.equal(1);
                expect(calls[0].err).to.be.an("error");
            });
        });
    });
});

describe("Remote config request", () => {
    it("uses the current API and enrolls in A/B tests by default", () => {
        var rcRequests = [];
        var healthChecks = [];
        hp.haltAndClearStorage(() => {
            initRecording({}, rcRequests, healthChecks);
            Countly.fetch_remote_config();
            cy.wait(1500).then(() => {
                expect(rcRequests.length).to.equal(1);
                expect(rcRequests[0].method).to.equal("rc");
                expect(rcRequests[0].oi).to.equal(1);
                expect(Countly.get_remote_config()).to.deep.equal({ color: "red" });
                // the only warning is the test_mode one
                expect(healthChecks.map((hc) => hc.wl)).to.deep.equal([1]);
            });
        });
    });

    it("uses the current API without A/B test enrollment when automatic opt-in is off", () => {
        var rcRequests = [];
        var healthChecks = [];
        hp.haltAndClearStorage(() => {
            initRecording({ rc_automatic_optin_for_ab: false }, rcRequests, healthChecks);
            Countly.fetch_remote_config();
            cy.wait(1500).then(() => {
                expect(rcRequests.length).to.equal(1);
                expect(rcRequests[0].method).to.equal("rc");
                expect(rcRequests[0].oi).to.equal(0);
                expect(Countly.get_remote_config()).to.deep.equal({ color: "red" });
                expect(healthChecks.map((hc) => hc.wl)).to.deep.equal([1]);
            });
        });
    });

    it("uses the legacy API and warns when use_explicit_rc_api is false", () => {
        var rcRequests = [];
        var healthChecks = [];
        hp.haltAndClearStorage(() => {
            initRecording({ use_explicit_rc_api: false }, rcRequests, healthChecks);
            Countly.fetch_remote_config();
            cy.wait(1500).then(() => {
                expect(rcRequests.length).to.equal(1);
                expect(rcRequests[0].method).to.equal("fetch_remote_config");
                expect(rcRequests[0]).to.not.have.property("oi");
                expect(Countly.get_remote_config()).to.deep.equal({ color: "red" });
                // the test_mode warning and the legacy API warning
                expect(healthChecks.map((hc) => hc.wl)).to.deep.equal([2]);
            });
        });
    });
});
