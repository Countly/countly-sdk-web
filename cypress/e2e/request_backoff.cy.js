/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

/**
1. check 30 sec timeout works(request are not removed): (2)
2. check back off works(all conditions met):
    1. D |    |    : backs off (3)
3. check back off not used(for each combination of conditions)
    2. D | FQ |    : - (4)
    3. D |    | OR : - (6)
    4. D | FQ | OR : - (5)
    5.   | FQ | OR : - (7)
    6.   | FQ |    : - (9)
    7.   |    | OR : - (8)
4. check base server works normally
    8.   |    |    : - (1)
*/

function initMain(beat, time, test_mode, backoff, sc) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "http://localhost:9000",
        debug: true,
        queue_size: 10,
        beat_interval: beat,
        test_mode_time: time,
        test_mode: test_mode,
        disable_backoff_mechanism: backoff,
        behavior_settings: sc
    });
}

describe("Request Back-off Mechanism Tests", () => {
    beforeEach(() => {
        cy.wait(1000);
    });
    afterEach(() => {
        cy.task("stopServer");
    });

    it("1_Basic test checking server works", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            initMain();
            Countly.add_event({ key: "test_1" });
            cy.wait(3000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });
    it("2_Basic timeout test", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 31000);
            cy.task("startServer");
            initMain();
            Countly.add_event({ key: "test_1" });
            cy.wait(40000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(1);
                    cy.task("stopServer");
                });
            });
        });
    });
    it("3_Initial backoff test Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 11000);
            cy.task("startServer");
            initMain();
            Countly.add_event({ key: "test_1" });
            cy.wait(15000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    Countly.add_event({ key: "test_2" });
                    cy.task("setResponseDelay", 0);
                    Countly.get_available_feedback_widgets();
                    cy.wait(40000).then(() => {
                        cy.task("getRequests").then((reqs) => {
                            cy.log("Server Requests: " + JSON.stringify(reqs));
                            let found_test = 0;
                            let found_sc = 0;
                            let found_feedback = 0;
                            let found_hc = 0;
                            for (let i = 0; i < reqs.length; i++) {
                                if (reqs[i].body.includes("test_1")) {
                                    found_test++;
                                }
                                if (reqs[i].body.includes("hc=")) {
                                    found_hc++;
                                }
                                if (reqs[i].body.includes("feedback")) {
                                    found_feedback++;
                                }
                                if (reqs[i].body.includes("method=sc")) {
                                    found_sc++;
                                }
                            }
                            expect(found_test).to.equal(1);
                            expect(found_hc).to.equal(1);
                            expect(found_feedback).to.equal(1);
                            expect(found_sc).to.equal(1);
                        });
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(1);
                            cy.wait(21000).then(() => {
                                cy.fetch_local_request_queue().then((rq) => {
                                    cy.log("Request Queue: " + JSON.stringify(rq));
                                    expect(rq.length).to.equal(0);
                                    Countly.add_event({ key: "test_3" });
                                    cy.wait(2000).then(() => {
                                        cy.fetch_local_request_queue().then((rq) => {
                                            cy.log("Request Queue: " + JSON.stringify(rq));
                                            expect(rq.length).to.equal(0);
                                            cy.task("stopServer");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    it("3_B_backoff turned off Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 11000);
            cy.task("startServer");
            initMain(undefined, undefined, undefined, true);
            Countly.add_event({ key: "test_1" });
            cy.wait(15000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("setResponseDelay", 0);
                    Countly.add_event({ key: "test_2" });
                    Countly.attempt_to_send_stored_requests();
                    cy.wait(7000).then(() => {
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(0);
                            cy.task("stopServer");
                        });
                    });
                });
            });
        });
    });
    it("3_C_sc backoff turned off Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 11000);
            cy.task("startServer");
            initMain(undefined, undefined, undefined, undefined, { c: { bom: false } });
            Countly.add_event({ key: "test_1" });
            cy.wait(15000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("setResponseDelay", 0);
                    Countly.add_event({ key: "test_2" });
                    Countly.attempt_to_send_stored_requests();
                    cy.wait(8000).then(() => {
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(0);
                            cy.task("stopServer");
                        });
                    });
                });
            });
        });
    });
    it("3_D_sc timeout and duration Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 3500);
            cy.task("startServer");
            initMain(undefined, undefined, undefined, undefined, { c: { bom_at: 3, bom_d: 15 } });
            Countly.add_event({ key: "test_1" });
            cy.wait(5000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    Countly.add_event({ key: "test_2" });
                    cy.task("setResponseDelay", 0);
                    Countly.get_available_feedback_widgets();
                    cy.wait(5000).then(() => {
                        cy.task("getRequests").then((reqs) => {
                            cy.log("Server Requests: " + JSON.stringify(reqs));
                            expect(reqs.length).to.equal(4);
                            let found_test_1 = 0;
                            let found_sc = 0;
                            let found_feedback = 0;
                            let found_hc = 0;
                            for (let i = 0; i < reqs.length; i++) {
                                if (reqs[i].body.includes("test_1")) {
                                    found_test_1++;
                                }
                                if (reqs[i].body.includes("hc=")) {
                                    found_hc++;
                                }
                                if (reqs[i].body.includes("feedback")) {
                                    found_feedback++;
                                }
                                if (reqs[i].body.includes("method=sc")) {
                                    found_sc++;
                                }
                            }
                            expect(found_test_1).to.equal(1);
                            expect(found_hc).to.equal(1);
                            expect(found_feedback).to.equal(1);
                            expect(found_sc).to.equal(1);
                        });
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(1);
                            cy.wait(9000).then(() => {
                                cy.fetch_local_request_queue().then((rq) => {
                                    cy.log("Request Queue: " + JSON.stringify(rq));
                                    expect(rq.length).to.equal(0);
                                    Countly.add_event({ key: "test_3" });
                                    cy.wait(2000).then(() => {
                                        cy.fetch_local_request_queue().then((rq) => {
                                            cy.log("Request Queue: " + JSON.stringify(rq));
                                            expect(rq.length).to.equal(0);
                                            cy.task("stopServer");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    it("3_E_sc timeout, duration and age Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 3500);
            cy.task("startServer");
            var oldTimestamp = Math.floor(Date.now() / 1000) - 2 * 60 * 60; // 2 hours ago
            initMain(undefined, oldTimestamp, undefined, undefined, { c: { bom_at: 3, bom_d: 15, bom_ra: 1 } });
            Countly.add_event({ key: "test_1" });
            cy.wait(5000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    Countly.add_event({ key: "test_2" });
                    cy.task("setResponseDelay", 0);
                    Countly.get_available_feedback_widgets();
                    cy.wait(5000).then(() => {
                        cy.task("getRequests").then((reqs) => {
                            cy.log("Server Requests: " + JSON.stringify(reqs));
                            expect(reqs.length).to.equal(5);
                            let found_test_1 = 0;
                            let found_test_2 = 0;
                            let found_sc = 0;
                            let found_feedback = 0;
                            let found_hc = 0;
                            for (let i = 0; i < reqs.length; i++) {
                                if (reqs[i].body.includes("test_1")) {
                                    found_test_1++;
                                }
                                if (reqs[i].body.includes("test_2")) {
                                    found_test_2++;
                                }
                                if (reqs[i].body.includes("hc=")) {
                                    found_hc++;
                                }
                                if (reqs[i].body.includes("feedback")) {
                                    found_feedback++;
                                }
                                if (reqs[i].body.includes("method=sc")) {
                                    found_sc++;
                                }
                            }
                            expect(found_test_1).to.equal(1);
                            expect(found_test_2).to.equal(1);
                            expect(found_hc).to.equal(1);
                            expect(found_feedback).to.equal(1);
                            expect(found_sc).to.equal(1);
                            cy.task("stopServer");
                        });
                    });
                });
            });
        });
    });
    it("3_F_sc request queue percentage Delay", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 3500);
            cy.task("startServer");
            initMain(undefined, undefined, undefined, undefined, { c: { bom_at: 3, bom_d: 15, bom_rqp: 0.1 } });
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            cy.wait(12000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });
    it("4_No backoff if queue is crowded Delay_FullQueue", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 31000);
            cy.task("startServer");
            initMain();
            Countly.add_event({ key: "test_1" });
            Countly.userData.set("key", "value");
            Countly.userData.save();
            Countly.add_event({ key: "test_1" });
            Countly.userData.set("key", "value");
            Countly.userData.save();
            Countly.add_event({ key: "test_1" });
            Countly.userData.set("key", "value");
            Countly.userData.save();
            Countly.add_event({ key: "test_1" });
            Countly.userData.set("key", "value");
            Countly.userData.save();
            cy.wait(42000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(8);
                    cy.task("setResponseDelay", 11000);
                    cy.wait(90000).then(() => {
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(5);
                            cy.wait(21000).then(() => {
                                cy.fetch_local_request_queue().then((rq) => {
                                    cy.log("Request Queue: " + JSON.stringify(rq));
                                    expect(rq.length).to.equal(4);
                                    cy.wait(30000).then(() => {
                                        cy.fetch_local_request_queue().then((rq) => {
                                            cy.log("Request Queue: " + JSON.stringify(rq));
                                            expect(rq.length).to.equal(4);
                                            cy.task("stopServer");
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("5_No backoff if queue is crowded Delay_FullQueue_OldRequest", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 31000);
            cy.task("startServer");
            var oldTimestamp = Math.floor(Date.now() / 1000) - 10 * 365 * 24 * 60 * 60; // 10 years old timestamp in ms
            initMain(undefined, oldTimestamp);
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            cy.wait(42000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(8);
                    cy.task("setResponseDelay", 11000);
                    cy.wait(90000).then(() => {
                        cy.fetch_local_request_queue().then((rq) => {
                            cy.log("Request Queue: " + JSON.stringify(rq));
                            expect(rq.length).to.equal(5);
                            cy.wait(66000).then(() => {
                                cy.fetch_local_request_queue().then((rq) => {
                                    cy.log("Request Queue: " + JSON.stringify(rq));
                                    expect(rq.length).to.equal(0);
                                    cy.task("stopServer");
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("6_No backoff if queue is crowded Delay_OldRequest", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 11000);
            cy.task("startServer");
            var oldTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours old timestamp in ms
            initMain(undefined, oldTimestamp, true);
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.test_mode_rq(false);
            cy.wait(45000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });

    it("7_No backoff if queue is crowded FullQueue_OldRequest", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            var oldTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours old timestamp in ms
            initMain(undefined, oldTimestamp, true);
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.test_mode_rq(false);
            cy.wait(10000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });

    it("8_No backoff OldRequest", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            var oldTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours old timestamp in ms
            initMain(undefined, oldTimestamp, true);
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.test_mode_rq(false);
            cy.wait(10000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });

    it("9_No backoff FullQueue", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            initMain(undefined, undefined, true);
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.add_event({ key: "test_1" });
            Countly.attempt_to_send_stored_requests();
            Countly.test_mode_rq(false);
            cy.wait(10000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.log("Request Queue: " + JSON.stringify(rq));
                    expect(rq.length).to.equal(0);
                    cy.task("stopServer");
                });
            });
        });
    });

});


