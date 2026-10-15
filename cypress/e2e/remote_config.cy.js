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
