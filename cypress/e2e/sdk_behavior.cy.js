/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
import { triggerStorageChange } from "../support/integration_helper";

function initMain(val, disableSync) {
    Countly.init({
        app_key: "spp",
        url: "https://hey.some.ly",
        debug: true,
        behavior_settings: val,
        disable_sdk_behavior_settings_updates: disableSync
    });
}

function sentReqList(size, expectedKeywords, nonexistingKeywords) {
    var directReqs = Countly._internals.testingGetRequests(); // get direct requests
    var functionNames = directReqs.map((item) => item.functionName);
    cy.log("Direct Requests: " + JSON.stringify(directReqs));

    if (typeof size !== 'undefined') {
        expect(directReqs.length).to.eq(size);
    }
    if (expectedKeywords) {
        for (var i = 0; i < expectedKeywords.length; i++) {
            expect(functionNames.includes(expectedKeywords[i])).to.be.true;
        }
    }
    if (nonexistingKeywords) {
        for (var j = 0; j < nonexistingKeywords.length; j++) {
            expect(functionNames.includes(nonexistingKeywords[j])).to.be.false;
        }
    }
}
function queues(eqsize, rqsize, expectedKeywords, nonexistingKeywords) {
    var queues = hp.waitingQueues("spp"); // get what waits to be sent
    const allKeysE = queues.eventQ.flatMap(item => Object.keys(item));
    const allKeysQ = queues.requestQ.flatMap(item => Object.keys(item));
    const uniqueKeys = [...new Set(allKeysE), ...new Set(allKeysQ)];

    const allValuesE = queues.eventQ.flatMap(item => Object.values(item));
    const allValuesQ = queues.requestQ.flatMap(item => Object.values(item));
    const uniqueValues = [...new Set(allValuesE), ...new Set(allValuesQ)];

    cy.log("Unique Keys: " + JSON.stringify(uniqueKeys));
    cy.log("Queues: " + JSON.stringify(queues));

    if (typeof eqsize !== 'undefined') {
        expect(queues.eventQ.length).to.eq(eqsize);
    }
    if (typeof rqsize !== 'undefined') {
        expect(queues.requestQ.length).to.eq(rqsize);
    }
    if (expectedKeywords) {
        for (var i = 0; i < expectedKeywords.length; i++) {
            expect(uniqueKeys.includes(expectedKeywords[i])).to.be.true;
        }
    }
    if (nonexistingKeywords) {
        for (var j = 0; j < nonexistingKeywords.length; j++) {
            expect(uniqueValues.includes(nonexistingKeywords[j])).to.be.false;
        }
    }
}

const waitT = 2000;

describe("SDK Behavior test", () => {
    it("Basic initialization with default config", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(2, ["server_config", "[healthCheck]"]);
                    queues(0, 0);
                });
            });
        });
    });
    it("Initialization with default config and integration methods", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(10, ["server_config", "[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "send_request_queue", "get_available_feedback_widgets,"]);
                    queues(0, 15);
                });
            });
        });
    });
    
    it("Config with networking disabled", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                networking: false
            };
            initMain(settings);
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(2, ["server_config"]);
                    queues(0, 15);
                });
            });
        });
    });
    
    it("Sends the queued requests on the same page once networking is switched back on", () => {
        hp.haltAndClearStorage(() => {
            initMain({ c: { networking: false } });
            Countly.add_event({ key: "waits_for_networking" });
            cy.wait(waitT).then(() => {
                var sentWhileOff = Countly._internals.testingGetRequests().filter((r) => r.functionName === "send_request_queue");
                expect(sentWhileOff.length, "nothing is sent while networking is off").to.equal(0);
                triggerStorageChange("spp/cly_config", JSON.stringify({ v: 2, t: 2, c: { networking: true } }));
                cy.wait(waitT).then(() => {
                    var sent = Countly._internals.testingGetRequests().filter((r) => r.functionName === "send_request_queue");
                    expect(sent.length).to.be.greaterThan(0);
                });
            });
        });
    });

    it("Reports a request it could not build instead of stalling silently", () => {
        hp.haltAndClearStorage(() => {
            cy.spy(console, "error").as("consoleError");
            Countly.init({ app_key: "spp", url: "https://hey.some.ly", debug: true, headers: { "bad header": "1" } });
            Countly.add_event({ key: "with_a_bad_header" });
            cy.wait(waitT).then(() => {
                cy.get("@consoleError").should((spy) => {
                    var lines = spy.getCalls().map((call) => String(call.args[0]));
                    expect(lines.some((line) => line.indexOf("send_request_queue") !== -1)).to.equal(true);
                });
            });
        });
    });

    it("Calls back once when a request times out", () => {
        // on a timeout a browser reports the request as done with status 0 and then as timed out
        function TimingOutXhr() {}
        TimingOutXhr.prototype.open = function () {};
        TimingOutXhr.prototype.setRequestHeader = function () {};
        TimingOutXhr.prototype.send = function () {
            setTimeout(() => {
                this.readyState = 4;
                this.status = 0;
                this.responseText = "";
                this.onreadystatechange();
                this.ontimeout();
            }, 50);
        };
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "spp", url: "https://hey.some.ly", test_mode: true, debug: true });
            var original = window.XMLHttpRequest;
            window.XMLHttpRequest = TimingOutXhr;
            var calls = 0;
            Countly._internals.sendXmlHttpRequest("timeout_test", "https://hey.some.ly/i", { a: 1 }, () => {
                calls++;
            });
            cy.wait(500).then(() => {
                window.XMLHttpRequest = original;
                expect(calls).to.equal(1);
            });
        });
    });

    it("Config with tracking disabled", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                tracking: false
            };
            initMain(settings);
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(10, ["server_config", "[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "get_available_feedback_widgets,"]);
                    queues(0,0);
                });
            });
        });
    });
    
    it("Config with both tracking and networking disabled", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                tracking: false,
                networking: false
            };
            initMain(settings);
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(3, ["server_config"]);
                    queues(0,0);
                });
            });
        });
    });
    
    it("Config with consent required true", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                cr: true
            };
            initMain(settings);
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(5, ["server_config", "[healthCheck]", "enrollUserToAb", "send_request_queue"]); // device id change sent
                    queues(0, 2, ["old_device_id", "consent"]);
                });
            });
        });
    });
    
    it("Limited queue sizes with networking disabled", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                rqs: 1,
                eqs: 1,
                networking: false,
            };
            initMain(settings);
            Countly.add_event({key: "test_1"});
            Countly.add_event({key: "test_2"});
            Countly.add_event({key: "test_3"});
            Countly.add_event({key: "test_4"});
            Countly.add_event({key: "test_5"});
            cy.wait(3000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(1, ["server_config"]);
                    queues(0, 2, ["events"], ["test_1", "test_2", "test_3"]); // 1+1
                });
            });
        });
    });
    
    it("Session update interval configuration", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                sui: 1,
            };
            initMain(settings);
            Countly.track_sessions();
            cy.wait(4000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(3, ["server_config", "[healthCheck]", "send_request_queue"]);
                    queues(0, 4, ["session_duration", "begin_session"], ["session_end"]);
                });
            });
        });
    });
    
    it("Disabled tracking types configuration", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                st: false,
                crt: false,
                lt: false,
                vt: false,
                cet: false,
            };
            initMain(settings);
            Countly.track_sessions();
            Countly.add_event({key: "test_1"});
            Countly.track_pageview();
            Countly.log_error({message: "test"});
            cy.wait(4000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    sentReqList(2, ["server_config", "[healthCheck]"]);
                    queues(0, 0);
                });
            });
        });
    });
});

describe("SDK Behavior Sync Disable tests", () => {
    it("Initialization with disable_sdk_behavior_settings_updates enabled - no server config request", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: true
            });
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should only have health check, no server_config request
                    sentReqList(1, ["[healthCheck]"], ["server_config"]);
                    queues(0, 0);
                });
            });
        });
    });

    it("Initialization with disable_sdk_behavior_settings_updates false - server config request made", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "spp", 
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: false
            });
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have both health check and server_config
                    sentReqList(2, ["server_config", "[healthCheck]"]);
                    queues(0, 0);
                });
            });
        });
    });

    it("Initialization without disable_sdk_behavior_settings_updates - default behavior (server config enabled)", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly", 
                debug: true
            });
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have both health check and server_config (default behavior)
                    sentReqList(2, ["server_config", "[healthCheck]"]);
                    queues(0, 0);
                });
            });
        });
    });

    it("disable_sdk_behavior_settings_updates with integration methods - no server config interference", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: true
            });
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have integration methods but no server_config
                    sentReqList(8, ["[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "send_request_queue", "get_available_feedback_widgets,"], ["server_config"]);
                    queues(0, 15);
                });
            });
        });
    });

    it("disable_sdk_behavior_settings_updates with behavior_settings - should still disable server config", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                networking: false
            };
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: true,
                behavior_settings: settings
            });
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have no server_config even with behavior_settings
                    sentReqList(0, [], ["server_config"]);
                    queues(0, 15);
                });
            });
        });
    });

    it("disable_sdk_behavior_settings_updates with tracking disabled - should still disable server config", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                tracking: false
            };
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: true,
                behavior_settings: settings
            });
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have integration methods but no server_config or tracking events
                    sentReqList(7, ["[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "get_available_feedback_widgets,"], ["server_config"]);
                    queues(0, 0);
                });
            });
        });
    });

    it("disable_sdk_behavior_settings_updates with consent required - should still disable server config", () => {
        hp.haltAndClearStorage(() => {
            var settings = {};
            settings.c = {
                cr: true
            };
            Countly.init({
                app_key: "spp",
                url: "https://hey.some.ly",
                debug: true,
                disable_sdk_behavior_settings_updates: true,
                behavior_settings: settings
            });
            hp.integrationMethods();
            cy.wait(waitT).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    // Should have consent-related requests but no server_config
                    sentReqList(3, ["[healthCheck]", "enrollUserToAb", "send_request_queue"], ["server_config"]);
                    queues(0, 2, ["old_device_id", "consent"]);
                });
            });
        });
    });
});
