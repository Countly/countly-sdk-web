/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
import { triggerStorageChange } from "../support/integration_helper";

// what another tab of the site leaves in the shared list when it closes
function handedOver() {
    return [{ app_key: hp.appKey, device_id: "other tab", t: 0, timestamp: 1700000000000, events: JSON.stringify([{ key: "from_other_tab", count: 1 }]) }];
}

function initRecording(sent, extra) {
    Countly.init(Object.assign({
        app_key: hp.appKey,
        url: "https://your.domain.count.ly",
        device_id: "this tab",
        debug: true,
        fake_request_handler: (req) => {
            sent.push(req.params);
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, extra || {}));
}

function eventsSent(sent, key) {
    return sent.filter((p) => typeof p.events === "string" && p.events.indexOf("\"" + key + "\"") !== -1).length;
}

function shared(key) {
    return JSON.parse(localStorage.getItem(hp.appKey + "/" + key) || "null");
}

function ownStored(key) {
    return JSON.parse(sessionStorage.getItem(hp.appKey + "/" + key) || "null");
}

function leavePage(persisted) {
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: !!persisted }));
}

// the tab goes to the background, as when another tab or app is brought to the front
function hideTab() {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
}

function requestsWithEvent(requests, key) {
    return (requests || []).filter((r) => typeof r.events === "string" && r.events.indexOf("\"" + key + "\"") !== -1).length;
}

describe("Several tabs of one site", () => {
    it("leaves requests another tab queued to that tab, or to the tab in front", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecording(sent);
            cy.wait(500).then(() => {
                // this tab is not in front (no focus), so another tab's list is not for it
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
            });
            cy.wait(2000).then(() => {
                expect(eventsSent(sent, "from_other_tab"), "sent by this tab").to.equal(0);
                expect(Countly._internals.getLocalQueues().requestQ.length, "in this tab's queue").to.equal(0);
                expect(shared("cly_queue"), "still waiting for the tab in front").to.deep.equal(handedOver());
            });
        });
    });

    it("leaves events another tab recorded to that tab", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode_eq: true });
            triggerStorageChange(hp.appKey + "/cly_event", JSON.stringify([{ key: "other_tab_event", count: 1 }]));
            expect(Countly._internals.getLocalQueues().eventQ.map((e) => e.key)).to.not.include("other_tab_event");
        });
    });

    it("keeps its unsent requests to itself, and hands them over when the page is left", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true });
            Countly.add_event({ key: "mine", count: 1 });
            Countly.user_details({ name: "this tab user" });
            cy.wait(1000).then(() => {
                expect(shared("cly_queue"), "nothing in the shared list while the page is open").to.equal(null);
                expect(ownStored("cly_queue").length, "kept in this tab").to.be.greaterThan(0);
                leavePage();
                var handed = shared("cly_queue");
                expect(handed.filter((r) => typeof r.events === "string" && r.events.indexOf("\"mine\"") !== -1).length, "the event, in the shared list").to.equal(1);
                expect(handed.filter((r) => typeof r.user_details === "string").length, "the profile change, in the shared list").to.equal(1);
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing left in this tab").to.equal(0);
                expect(ownStored("cly_queue"), "nothing left in this tab's storage").to.deep.equal([]);
            });
        });
    });

    it("hands its unsent events over too, as a request", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true, test_mode_eq: true });
            Countly.add_event({ key: "pending_event", count: 1 });
            leavePage();
            var handed = shared("cly_queue") || [];
            expect(handed.filter((r) => typeof r.events === "string" && r.events.indexOf("\"pending_event\"") !== -1).length).to.equal(1);
            expect(Countly._internals.getLocalQueues().eventQ.length).to.equal(0);
        });
    });

    it("takes over what a closed tab handed over when it starts in front, and sends it once", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            localStorage.setItem(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
            initRecording(sent);
            expect(shared("cly_queue"), "taken from the shared list").to.equal(null);
            cy.wait(2000).then(() => {
                expect(eventsSent(sent, "from_other_tab")).to.equal(1);
            });
        });
    });

    it("takes over what a tab closed meanwhile handed over, when in front", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecording(sent);
            cy.wait(500).then(() => {
                cy.stub(document, "hasFocus").returns(true);
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
                expect(shared("cly_queue"), "taken from the shared list").to.equal(null);
            });
            cy.wait(2000).then(() => {
                expect(eventsSent(sent, "from_other_tab")).to.equal(1);
            });
        });
    });

    it("sends what another tab left under the temporary device ID with its own device ID", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecording(sent);
            cy.wait(500).then(() => {
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "[CLY]_temp_id", t: 2, timestamp: 1700000000000, events: JSON.stringify([{ key: "left_offline", count: 1 }]) }]));
                document.dispatchEvent(new Event("visibilitychange"));
            });
            cy.wait(2000).then(() => {
                var carrying = sent.filter((p) => requestsWithEvent([p], "left_offline"));
                expect(carrying.map((p) => p.device_id + ", type " + p.t)).to.deep.equal(["this tab, type 0"]);
            });
        });
    });

    it("ignores another frame of the same tab writing its own queue", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true });
            localStorage.setItem(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
            cy.stub(document, "hasFocus").returns(true);
            window.dispatchEvent(new StorageEvent("storage", { key: hp.appKey + "/cly_queue", newValue: JSON.stringify(handedOver()), storageArea: sessionStorage }));
            expect(shared("cly_queue"), "the shared list is left alone").to.deep.equal(handedOver());
        });
    });

    it("takes over what was handed over meanwhile when it comes to the front", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecording(sent);
            cy.wait(500).then(() => {
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
                expect(shared("cly_queue"), "left while in the background").to.deep.equal(handedOver());
                document.dispatchEvent(new Event("visibilitychange"));
                expect(shared("cly_queue"), "taken when it came to the front").to.equal(null);
            });
            cy.wait(2000).then(() => {
                expect(eventsSent(sent, "from_other_tab")).to.equal(1);
            });
        });
    });

    it("keeps its unsent requests when the same tab loads again without leaving cleanly", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true });
            Countly.user_details({ name: "before the crash" });
            cy.wait(600).then(() => {
                Countly.halt();
                initRecording([], { test_mode: true });
                var kept = Countly._internals.getLocalQueues().requestQ.filter((r) => typeof r.user_details === "string" && r.user_details.indexOf("before the crash") !== -1);
                expect(kept.length).to.equal(1);
            });
        });
    });

    it("takes its own requests back when it returns from the back/forward cache", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true });
            Countly.user_details({ name: "cached page user" });
            cy.wait(600).then(() => {
                leavePage(true);
                expect(Countly._internals.getLocalQueues().requestQ.length, "handed over while cached").to.equal(0);
                window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
                expect(shared("cly_queue"), "taken back").to.equal(null);
                expect(Countly._internals.getLocalQueues().requestQ.filter((r) => typeof r.user_details === "string").length).to.equal(1);
            });
        });
    });

    it("removes the request it sent, not one it took over while sending", () => {
        var bodies = [];
        cy.intercept("https://your.domain.count.ly/i*", (req) => {
            bodies.push(typeof req.body === "string" ? req.body : JSON.stringify(req.body || "") + req.url);
            req.reply({ delay: 1500, statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", device_id: "this tab", debug: true });
            Countly.add_event({ key: "mine_in_flight", count: 1 });
            cy.wait(800).then(() => {
                // while this tab's request waits for the server, a closing tab hands its own over
                cy.stub(document, "hasFocus").returns(true);
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify(handedOver()));
            });
            cy.wait(5000).then(() => {
                var queued = Countly._internals.getLocalQueues().requestQ;
                expect(queued.filter((r) => typeof r.events === "string" && r.events.indexOf("mine_in_flight") !== -1).length, "the sent request is gone").to.equal(0);
                expect(bodies.filter((b) => b.indexOf("from_other_tab") !== -1).length, "the taken-over request was sent too").to.equal(1);
            });
        });
    });

    it("does not hand over the request on its way when the page is left", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: hp.appKey,
                url: "https://your.domain.count.ly",
                device_id: "this tab",
                debug: true,
                // the server never answers, so the first request stays on its way
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue") {
                        sent.push(req.params);
                    }
                    return false;
                }
            });
            Countly.add_event({ key: "on_its_way", count: 1 });
            cy.wait(1500).then(() => {
                expect(eventsSent(sent, "on_its_way"), "on its way").to.equal(1);
                Countly.add_event({ key: "not_sent_yet", count: 1 });
                leavePage();
                var handed = shared("cly_queue");
                expect(requestsWithEvent(handed, "on_its_way"), "the request on its way, not handed over").to.equal(0);
                expect(requestsWithEvent(handed, "not_sent_yet"), "the unsent one, handed over").to.equal(1);
                expect(ownStored("cly_queue"), "nothing kept for the next page").to.deep.equal([]);
            });
        });
    });

    it("hands over a request the server did not take when the page is left", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: hp.appKey,
                url: "https://your.domain.count.ly",
                device_id: "this tab",
                debug: true,
                fake_request_handler: () => ({ status: 500, responseText: "{\"result\":\"Error\"}" })
            });
            Countly.add_event({ key: "refused", count: 1 });
            cy.wait(1500).then(() => {
                leavePage();
                expect(requestsWithEvent(shared("cly_queue"), "refused")).to.equal(1);
            });
        });
    });
});

describe("Leaving a tab", () => {
    afterEach(() => {
        delete document.hidden;
    });

    // what reached the fake server; the heartbeat is slowed down so that only an immediate send can be seen
    function initSlowHeartbeat(sent, extra) {
        Countly.init(Object.assign({
            app_key: hp.appKey,
            url: "https://your.domain.count.ly",
            device_id: "this tab",
            debug: true,
            interval: 10000,
            fake_request_handler: (req) => {
                if (req.functionName === "send_request_queue") {
                    sent.push(req.params);
                }
                return { status: 200, responseText: "{\"result\":\"Success\"}" };
            }
        }, extra || {}));
    }

    it("sends what it holds right away when it is left", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "before_leaving", count: 1 });
                hideTab();
            });
            cy.wait(300).then(() => {
                expect(eventsSent(sent, "before_leaving")).to.equal(1);
            });
        });
    });

    it("sends every request it holds, in order, when it is left", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "first", count: 1 });
                Countly._internals.sendEventsForced();
                Countly.add_event({ key: "second", count: 1 });
                expect(eventsSent(sent, "first"), "waiting for the slow heartbeat").to.equal(0);
                hideTab();
            });
            cy.wait(300).then(() => {
                var batches = sent.filter((p) => typeof p.events === "string").map((p) => JSON.parse(p.events).map((e) => e.key).join(","));
                expect(batches).to.deep.equal(["first", "second"]);
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing left").to.equal(0);
            });
        });
    });

    // no connection: whatever is sent fails
    function initFailing(extra) {
        Countly.init(Object.assign({
            app_key: hp.appKey,
            url: "https://your.domain.count.ly",
            device_id: "this tab",
            debug: true,
            fake_request_handler: () => ({ status: 0, responseText: "" })
        }, extra || {}));
    }

    it("leaves what it could not send in the shared list when it is left", () => {
        hp.haltAndClearStorage(() => {
            initFailing();
            Countly.add_event({ key: "sent_and_failed", count: 1 });
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "recorded_since", count: 1 });
                hideTab();
                var left = shared("cly_queue");
                expect(requestsWithEvent(left, "sent_and_failed"), "the request that failed").to.equal(1);
                expect(requestsWithEvent(left, "recorded_since"), "what was recorded since").to.equal(1);
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing kept in the tab").to.equal(0);
            });
        });
    });

    it("leaves what it holds in the shared list when a send fails while it is in the background", () => {
        var attempts = 0;
        hp.haltAndClearStorage(() => {
            initFailing({
                interval: 10000,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue") {
                        attempts++;
                    }
                    return { status: 0, responseText: "" };
                }
            });
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "left_behind", count: 1 });
                hideTab();
            });
            cy.wait(300).then(() => {
                expect(attempts, "tried to send it when left").to.equal(1);
                expect(requestsWithEvent(shared("cly_queue"), "left_behind")).to.equal(1);
                expect(Countly._internals.getLocalQueues().requestQ.length).to.equal(0);
            });
        });
    });

    it("leaves what it could not send in the shared list while it is in front, where a crash does not take it", () => {
        hp.haltAndClearStorage(() => {
            initFailing();
            Countly.add_event({ key: "failed_in_front", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "failed_in_front"), "waiting in the shared list").to.equal(1);
            }).then(() => {
                expect(requestsWithEvent(ownStored("cly_queue"), "failed_in_front"), "not in the tab's own storage").to.equal(0);
                Countly.add_event({ key: "recorded_while_waiting", count: 1 });
            });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "recorded_while_waiting"), "recorded meanwhile, waiting there too").to.equal(1);
            }).then(() => {
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing kept in the tab").to.equal(0);
            });
        });
    });

    it("leaves what it could not send in front in the shared list once it is in the background, also when it may send again", () => {
        var sent = [];
        var failing = true;
        hp.haltAndClearStorage(() => {
            initFailing({
                fail_timeout: 1,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue") {
                        if (failing) {
                            return { status: 0, responseText: "" };
                        }
                        sent.push(req.params);
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.add_event({ key: "left_for_the_front", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "left_for_the_front"), "failed while in front").to.equal(1);
            }).then(() => {
                // the person switches to another tab
                hideTab();
                failing = false;
            });
            cy.wait(3000).then(() => {
                expect(eventsSent(sent, "left_for_the_front"), "not sent by the tab in the background").to.equal(0);
                expect(requestsWithEvent(shared("cly_queue"), "left_for_the_front"), "left for the tab in front").to.equal(1);
            });
        });
    });

    it("takes back what waits in the shared list and sends it once sending works again", () => {
        var sent = [];
        var failing = true;
        hp.haltAndClearStorage(() => {
            initFailing({
                fail_timeout: 1,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue") {
                        if (failing) {
                            return { status: 0, responseText: "" };
                        }
                        sent.push(req.params);
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.add_event({ key: "retried", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "retried"), "waiting while sends fail").to.equal(1);
            }).then(() => {
                failing = false;
            });
            cy.window({ timeout: 6000 }).should(() => {
                expect(eventsSent(sent, "retried"), "sent once sending works").to.equal(1);
            });
            cy.wait(1000).then(() => {
                expect(eventsSent(sent, "retried"), "and only once").to.equal(1);
                expect(shared("cly_queue") || [], "taken from the shared list").to.deep.equal([]);
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing left").to.equal(0);
            });
        });
    });

    it("keeps what it records in the background behind what waits in the shared list, also once it may send again", () => {
        var sent = [];
        var failing = true;
        hp.haltAndClearStorage(() => {
            initFailing({
                fail_timeout: 1,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue") {
                        if (failing) {
                            return { status: 0, responseText: "" };
                        }
                        sent.push(req.params);
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.add_event({ key: "before_the_outage_ended", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "before_the_outage_ended"), "waiting while sends fail").to.equal(1);
            }).then(() => {
                hideTab();
                failing = false;
            });
            cy.wait(2500).then(() => {
                Countly.user_details({ custom: { plan: "pro" } });
            });
            cy.wait(1000).then(() => {
                expect(sent.length, "nothing sent from the background ahead of what waits").to.equal(0);
                var left = shared("cly_queue") || [];
                expect(left.map((r) => (r.user_details ? "profile" : "events")), "waiting in order").to.deep.equal(["events", "profile"]);
                // the person comes back to the tab
                delete document.hidden;
                document.dispatchEvent(new Event("visibilitychange"));
            });
            cy.window({ timeout: 5000 }).should(() => {
                expect(sent.map((p) => (p.user_details ? "profile" : "events"))).to.deep.equal(["events", "profile"]);
            });
        });
    });

    it("sends nothing for a merged device ID while its merge request waits in the shared list", () => {
        var sent = [];
        var failing = true;
        hp.haltAndClearStorage(() => {
            initFailing({
                device_id: "anonymous",
                fail_timeout: 1,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue" && failing) {
                        return { status: 0, responseText: "" };
                    }
                    sent.push((req.params.old_device_id ? "merge" : req.functionName) + " for " + req.params.device_id);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1500).then(() => {
                Countly.change_id("signed in user", true);
            });
            cy.window({ timeout: 5000 }).should(() => {
                expect((shared("cly_queue") || []).filter((r) => r.old_device_id).length, "the merge waits in the shared list").to.equal(1);
            }).then(() => {
                sent.length = 0;
                Countly.fetch_remote_config();
                expect(sent, "nothing for the new ID before its merge").to.deep.equal([]);
                failing = false;
            });
            cy.window({ timeout: 6000 }).should(() => {
                expect(sent[0], JSON.stringify(sent)).to.equal("merge for signed in user");
                expect(sent, "after the merge").to.include("fetch_remote_config_explicit for signed in user");
            });
        });
    });

    it("keeps no more waiting in the shared list than the request queue holds", () => {
        hp.haltAndClearStorage(() => {
            initFailing({ queue_size: 3 });
            for (let i = 0; i < 5; i++) {
                cy.window().then(() => {
                    Countly.add_event({ key: "outage_" + i, count: 1 });
                });
                cy.window({ timeout: 5000 }).should(() => {
                    expect(requestsWithEvent(shared("cly_queue"), "outage_" + i), "outage_" + i + " waiting").to.equal(1);
                });
            }
            cy.window().then(() => {
                var left = shared("cly_queue");
                expect(left.length, "within the request queue size").to.equal(3);
                expect(requestsWithEvent(left, "outage_0"), "the oldest dropped").to.equal(0);
            });
        });
    });

    it("leaves what it records in offline mode in the shared list while it is in front, where a crash does not take it", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { device_id: undefined, offline_mode: true });
            Countly.add_event({ key: "recorded_offline", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "recorded_offline"), "waiting in the shared list").to.equal(1);
            }).then(() => {
                expect(Countly._internals.getLocalQueues().requestQ.length, "nothing kept in the tab").to.equal(0);
            });
        });
    });

    it("gives what it recorded in offline mode the device ID as soon as offline mode ends", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { device_id: undefined, offline_mode: true, test_mode: true });
            Countly.add_event({ key: "recorded_offline", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "recorded_offline"), "waiting in the shared list").to.equal(1);
            }).then(() => {
                Countly.disable_offline_mode("signed in");
                var waiting = hp.waitingQueues().requestQ.filter((r) => requestsWithEvent([r], "recorded_offline"));
                expect(waiting.map((r) => r.device_id)).to.deep.equal(["signed in"]);
            });
        });
    });

    it("sends what it recorded in offline mode before what follows once it gets a device ID", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecording(sent, { device_id: undefined, offline_mode: true });
            Countly.add_event({ key: "recorded_offline", count: 1 });
            cy.window({ timeout: 5000 }).should(() => {
                expect(requestsWithEvent(shared("cly_queue"), "recorded_offline"), "waiting in the shared list").to.equal(1);
            }).then(() => {
                Countly.disable_offline_mode("signed in");
                Countly.user_details({ custom: { plan: "pro" } });
            });
            cy.window({ timeout: 5000 }).should(() => {
                var order = sent.filter((p) => p.user_details || requestsWithEvent([p], "recorded_offline")).map((p) => (p.user_details ? "profile" : "events") + " of " + p.device_id);
                expect(order).to.deep.equal(["events of signed in", "profile of signed in"]);
            });
        });
    });

    it("leaves what it holds in the shared list when it is left in offline mode", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { device_id: undefined, offline_mode: true });
            Countly.add_event({ key: "offline_mode_event", count: 1 });
            cy.wait(1000).then(() => {
                hideTab();
                expect(requestsWithEvent(shared("cly_queue"), "offline_mode_event")).to.equal(1);
            });
        });
    });

    it("sends nothing for a visitor who opted out", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "before_opting_out", count: 1 });
                Countly._internals.sendEventsForced();
                Countly.opt_out();
                hideTab();
            });
            cy.wait(300).then(() => {
                expect(eventsSent(sent, "before_opting_out")).to.equal(0);
            });
        });
    });

    it("keeps what it holds in test mode", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent, { test_mode: true });
            Countly.add_event({ key: "test_mode_event", count: 1 });
            hideTab();
            cy.wait(300).then(() => {
                expect(eventsSent(sent, "test_mode_event")).to.equal(0);
            });
        });
    });
});

describe("Tabs opened by another page", () => {
    afterEach(() => {
        window.opener = null;
    });

    // unsent data in this tab's storage: a copy the browser made of the opening page's, or this tab's own
    function unsentInTabStorage() {
        sessionStorage.setItem(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "this tab", t: 0, timestamp: 1700000000000, events: JSON.stringify([{ key: "unsent_request", count: 1 }]) }]));
        sessionStorage.setItem(hp.appKey + "/cly_event", JSON.stringify([{ key: "unsent_event", count: 1, timestamp: 1700000000000 }]));
    }

    function loadedAs(type) {
        var entries = cy.stub(performance, "getEntriesByType").callThrough();
        entries.withArgs("navigation").returns([{ type: type }]);
    }

    it("does not send what the browser copied from the page that opened it", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            unsentInTabStorage();
            // opened through window.open, so the opening page sends this data itself
            window.opener = {};
            loadedAs("navigate");
            initRecording(sent);
            cy.wait(1500).then(() => {
                expect(eventsSent(sent, "unsent_request"), "the opener's request").to.equal(0);
                expect(eventsSent(sent, "unsent_event"), "the opener's event").to.equal(0);
                expect(requestsWithEvent(ownStored("cly_queue"), "unsent_request"), "dropped from this tab's storage").to.equal(0);
            });
        });
    });

    it("sends its own unsent data when it is reloaded", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            unsentInTabStorage();
            window.opener = {};
            loadedAs("reload");
            initRecording(sent);
            cy.wait(1500).then(() => {
                expect(eventsSent(sent, "unsent_request")).to.equal(1);
                expect(eventsSent(sent, "unsent_event")).to.equal(1);
            });
        });
    });

    it("sends what it finds in a tab no other page opened, also on a new visit", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            unsentInTabStorage();
            loadedAs("navigate");
            initRecording(sent);
            cy.wait(1500).then(() => {
                expect(eventsSent(sent, "unsent_request")).to.equal(1);
                expect(eventsSent(sent, "unsent_event")).to.equal(1);
            });
        });
    });
});

describe("Requests that change how the server treats what follows", () => {
    // what reached the fake server, in order; the heartbeat is slowed down so that only an immediate send can be seen
    function initSlowHeartbeat(sent, extra) {
        Countly.init(Object.assign({
            app_key: hp.appKey,
            url: "https://your.domain.count.ly",
            device_id: "this tab",
            debug: true,
            interval: 10000,
            fake_request_handler: (req) => {
                if (req.functionName === "send_request_queue") {
                    sent.push(req.params.user_details ? "profile" : req.params.old_device_id ? "merge" : req.params.consent ? "consent" : req.params.events ? "events" : Object.keys(req.params).join(","));
                }
                return { status: 200, responseText: "{\"result\":\"Success\"}" };
            }
        }, extra || {}));
    }

    it("sends a profile update right away, after the events recorded before it", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.add_event({ key: "before_the_change", count: 1 });
                Countly.user_details({ custom: { plan: "pro" } });
            });
            cy.wait(1000).then(() => {
                expect(sent).to.deep.equal(["events", "profile"]);
            });
        });
    });

    it("sends a device ID merge right away", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.change_id("merged user", true);
            });
            cy.wait(1000).then(() => {
                expect(sent).to.deep.equal(["merge"]);
            });
        });
    });

    it("sends a consent change right away", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent, { require_consent: true });
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.add_consent("events");
            });
            // consent changes are gathered for a second before they are queued
            cy.wait(2000).then(() => {
                expect(sent).to.deep.equal(["consent"]);
            });
        });
    });

    it("sends the next one right away when it was queued while another request was on its way", () => {
        var sent = [];
        cy.intercept("https://your.domain.count.ly/i*", (req) => {
            sent.push(typeof req.body === "string" && req.body.indexOf("user_details") !== -1 ? "profile" : "other");
            req.reply({ delay: 800, statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", device_id: "this tab", interval: 10000, force_post: true });
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.user_details({ custom: { step: "one" } });
                Countly.user_details({ custom: { step: "two" } });
            });
            cy.wait(2500).then(() => {
                expect(sent).to.deep.equal(["profile", "profile"]);
            });
        });
    });

    it("sends a profile update taken over from a closed tab right away", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            cy.wait(1500).then(() => {
                sent.length = 0;
                cy.stub(document, "hasFocus").returns(true);
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "this tab", t: 0, timestamp: 1700000000000, user_details: JSON.stringify({ custom: { plan: "pro" } }) }]));
            });
            cy.wait(1000).then(() => {
                expect(sent).to.deep.equal(["profile"]);
            });
        });
    });

    it("sends a profile update made right at start with the first heartbeat", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent);
            Countly.user_details({ custom: { plan: "pro" } });
            cy.wait(1500).then(() => {
                expect(sent).to.include("profile");
            });
        });
    });

    it("sends nothing while starting, so a profile update left under the temporary ID gets the real one first", () => {
        var sentIds = [];
        hp.haltAndClearStorage(() => {
            localStorage.setItem(hp.appKey + "/cly_id", "[CLY]_temp_id");
            localStorage.setItem(hp.appKey + "/cly_id_type", "2");
            localStorage.setItem(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "[CLY]_temp_id", t: 2, timestamp: 1700000000000, user_details: JSON.stringify({ custom: { plan: "pro" } }) }]));
            Countly.init({
                app_key: hp.appKey,
                url: "https://your.domain.count.ly",
                device_id: "real user",
                debug: true,
                fake_request_handler: (req) => {
                    if (req.functionName === "send_request_queue" && req.params.user_details) {
                        sentIds.push(req.params.device_id);
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1500).then(() => {
                expect(sentIds).to.deep.equal(["real user"]);
            });
        });
    });

    it("keeps them queued in test mode", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initSlowHeartbeat(sent, { test_mode: true });
            Countly.user_details({ custom: { plan: "pro" } });
            cy.wait(1000).then(() => {
                expect(sent).to.deep.equal([]);
                expect(Countly._internals.getLocalQueues().requestQ.filter((r) => r.user_details).length).to.equal(1);
            });
        });
    });
});

describe("Namespaces open in several tabs", () => {
    it("reacts only to its own namespace and app key", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", namespace: "ns2", device_id: "two", test_mode: true });
            triggerStorageChange("ns1/" + hp.appKey + "/cly_id", "one");
            expect(Countly.get_device_id(), "another namespace's device ID").to.equal("two");
            triggerStorageChange(hp.appKey + "/cly_id", "no namespace");
            expect(Countly.get_device_id(), "a device ID without a namespace").to.equal("two");
            triggerStorageChange("ns2/" + hp.appKey + "/cly_id", "three");
            expect(Countly.get_device_id(), "its own namespace still syncs").to.equal("three");
        });
    });

    it("without a namespace ignores keys that have one", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", device_id: "plain", test_mode: true });
            triggerStorageChange("ns1/" + hp.appKey + "/cly_id", "namespaced");
            expect(Countly.get_device_id()).to.equal("plain");
        });
    });
});

describe("Storage modes and tabs", () => {
    it("stores and hands over nothing with storage none", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true, storage: "none" });
            Countly.user_details({ name: "nothing stored" });
            leavePage();
            expect(shared("cly_queue")).to.equal(null);
            expect(ownStored("cly_queue")).to.equal(null);
        });
    });

    it("keeps the queues of a cookie storage page in its own tab too", () => {
        hp.haltAndClearStorage(() => {
            initRecording([], { test_mode: true, test_mode_eq: true, storage: "cookie" });
            Countly.add_event({ key: "cookie_mode_event", count: 1 });
            expect(ownStored("cly_event").map((e) => e.key)).to.include("cookie_mode_event");
            // the profile change first moves the pending events into a request
            Countly.user_details({ name: "cookie mode user" });
            cy.wait(600).then(() => {
                expect(document.cookie, "no event queue in cookies").to.not.contain("cly_event");
                expect(ownStored("cly_queue").filter((r) => typeof r.user_details === "string").length).to.equal(1);
                expect(shared("cly_queue")).to.equal(null);
            });
        });
    });
});

describe("Device ID and profile changes with several tabs", () => {
    // what reached the fake server, in order, with the device ID each went out for; the heartbeat is slowed down
    function initRecordingIds(sent, extra) {
        Countly.init(Object.assign({
            app_key: hp.appKey,
            url: "https://your.domain.count.ly",
            device_id: "this tab user",
            debug: true,
            interval: 10000,
            fake_request_handler: (req) => {
                if (req.functionName === "send_request_queue") {
                    var p = req.params;
                    var what = p.old_device_id ? "merge" : p.user_details ? "profile" : typeof p.events === "string" ? JSON.parse(p.events).map((e) => e.key).join(",") : "other";
                    sent.push(what + " for " + p.device_id);
                }
                return { status: 200, responseText: "{\"result\":\"Success\"}" };
            }
        }, extra || {}));
    }

    // another tab of the site is about to change the device ID, or the profile when no ID is given
    function otherTabChanges(newId) {
        triggerStorageChange(hp.appKey + "/cly_handover", JSON.stringify(newId ? { at: Date.now(), id: newId, t: 0 } : { at: Date.now() }));
    }

    function leftWithEvent(key) {
        return (shared("cly_queue") || []).filter((r) => requestsWithEvent([r], key)).map((r) => r.device_id);
    }

    it("leaves what it has not sent, under the previous device ID, when another tab changes the device ID", () => {
        hp.haltAndClearStorage(() => {
            initRecordingIds([], { interval: 500 });
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "before_the_change", count: 1 });
                otherTabChanges("next user");
                expect(leftWithEvent("before_the_change"), "left for the changing tab").to.deep.equal(["this tab user"]);
                expect(Countly.get_device_id()).to.equal("next user");
            });
            cy.wait(1000).then(() => {
                expect(leftWithEvent("before_the_change"), "not taken back, the changing tab sends it before its change").to.deep.equal(["this tab user"]);
            });
        });
    });

    it("leaves what it has not sent under the previous device ID also when only the stored ID changes, as an older SDK version in another tab does", () => {
        hp.haltAndClearStorage(() => {
            initRecordingIds([]);
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "before_the_change", count: 1 });
                triggerStorageChange(hp.appKey + "/cly_id", "next user");
                expect(leftWithEvent("before_the_change"), "left for the changing tab").to.deep.equal(["this tab user"]);
                expect(Countly.get_device_id()).to.equal("next user");
            });
        });
    });

    it("sends nothing of its own for a moment after another tab changes the device ID", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecordingIds(sent);
            cy.wait(1500).then(() => {
                otherTabChanges("next user");
                sent.length = 0;
                Countly.add_event({ key: "after_the_change", count: 1 });
                Countly.user_details({ custom: { plan: "pro" } });
            });
            cy.wait(1000).then(() => {
                expect(sent, "while the changing tab sends what was left before its change").to.deep.equal([]);
                expect(leftWithEvent("after_the_change"), "kept in this tab, so it cannot go ahead of the change").to.deep.equal([]);
            });
            cy.wait(2500).then(() => {
                expect(sent).to.deep.equal(["after_the_change for next user", "profile for next user"]);
            });
        });
    });

    it("sends everything it held back at once when the pause after another tab's device ID change ends", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecordingIds(sent);
            cy.wait(1500).then(() => {
                otherTabChanges("next user");
                sent.length = 0;
                Countly.add_event({ key: "first_after", count: 1 });
                Countly._internals.sendEventsForced();
                Countly.add_event({ key: "second_after", count: 1 });
                Countly._internals.sendEventsForced();
            });
            // the pause ends after 2 s, the slow heartbeat would come only after 10 s
            cy.wait(2800).then(() => {
                expect(sent).to.deep.equal(["first_after for next user", "second_after for next user"]);
            });
        });
    });

    it("learns the device ID another tab changed to, also when the ID is kept in a cookie", () => {
        hp.haltAndClearStorage(() => {
            initRecordingIds([], { storage: "cookie" });
            cy.wait(500).then(() => {
                otherTabChanges("next user");
                expect(Countly.get_device_id()).to.equal("next user");
            });
        });
    });

    it("sends what other tabs leave right after its device ID change before its merge request", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecordingIds(sent, { device_id: "anonymous" });
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.change_id("signed in user", true);
                expect(shared("cly_handover"), "the other tabs are told").to.include({ id: "signed in user" });
                // another tab leaves what it had not sent under the previous ID
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "anonymous", t: 0, timestamp: Date.now(), events: JSON.stringify([{ key: "other_tab_before", count: 1 }]) }]));
            });
            cy.wait(1500).then(() => {
                expect(sent).to.deep.equal(["other_tab_before for anonymous", "merge for signed in user"]);
            });
        });
    });

    it("leaves its pending events for another tab that changes the profile, and keeps sending its own", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecordingIds(sent);
            cy.wait(1500).then(() => {
                Countly.add_event({ key: "before_the_profile_change", count: 1 });
                otherTabChanges();
                expect(leftWithEvent("before_the_profile_change"), "left for the changing tab").to.deep.equal(["this tab user"]);
                expect(Countly.get_device_id()).to.equal("this tab user");
                sent.length = 0;
                Countly.user_details({ custom: { plan: "pro" } });
            });
            cy.wait(1200).then(() => {
                expect(sent, "no pause for a profile change").to.include("profile for this tab user");
            });
        });
    });

    it("sends what other tabs leave right after its profile change before the change", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            initRecordingIds(sent);
            cy.wait(1500).then(() => {
                sent.length = 0;
                Countly.user_details({ custom: { plan: "pro" } });
                expect(shared("cly_handover"), "the other tabs are told").to.have.property("at");
                triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify([{ app_key: hp.appKey, device_id: "this tab user", t: 0, timestamp: Date.now(), events: JSON.stringify([{ key: "other_tab_before", count: 1 }]) }]));
            });
            cy.wait(1500).then(() => {
                expect(sent).to.deep.equal(["other_tab_before for this tab user", "profile for this tab user"]);
            });
        });
    });
});
