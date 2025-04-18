
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

function initMain(val) {
    Countly.init({
        app_key: "spp",
        url: "https://hey.some.ly",
        debug: true,
        behavior_settings: val
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
    var queues = Countly._internals.getLocalQueues(); // get local queues
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
                    sentReqList(9, ["server_config", "[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "send_request_queue", "get_available_feedback_widgets,"]);
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
                    sentReqList(1, ["server_config"]);
                    queues(0, 15);
                });
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
                    sentReqList(8, ["server_config", "[healthCheck]", "enrollUserToAb", "fetch_remote_config_explicit", "get_available_feedback_widgets,"]);
                    queues(0, 0);
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
                    sentReqList(1, ["server_config"]);
                    queues(0, 0);
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
                    sentReqList(4, ["server_config", "[healthCheck]", "enrollUserToAb", "send_request_queue"]); // device id change sent
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
            Countly.add_event({ key: "test_1" });
            Countly.add_event({ key: "test_2" });
            Countly.add_event({ key: "test_3" });
            Countly.add_event({ key: "test_4" });
            Countly.add_event({ key: "test_5" });
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
            Countly.add_event({ key: "test_1" });
            Countly.track_pageview();
            Countly.log_error({ message: "test" });
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
