var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

// ========================================
// Device ID change tests 
// These tests are to test the device id change functionality after init
// Four situation this occurs is temp id enabling, disabling, change ID with and without merge
// ========================================

/**
 * 
 * @param {*} offline  - offline mode
 */
function initMain(offline) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        debug: true,
        offline_mode: offline
    });
}

/**
 * 
 * @param {String} param - event param for value of key
 * @returns {Object}- event object
 */
function eventObj(param) {
    return {
        key: param,
        segmentation: {
            id: "id"
        }
    };
}

/**
 * This function tests the device id change after init
 * @param {Function} callbackSecond - callback to be called for device ID change
 * @param {Function} callbackInitial - callback to be called after init
 * @param {Boolean} generatedID - if the device ID is generated,
 */
function testDeviceIdInReqs(callbackSecond, callbackInitial, generatedID) {
    callbackSecond = callbackSecond || function() { };
    generatedID = generatedID || "new ID";
    let initialID;

    if (callbackInitial) {
        callbackInitial(); // this is for enabling offline mode
    }

    Countly.add_event(eventObj("1")); // record an event.

    cy.fetch_local_request_queue().then((eq) => {
        if (callbackInitial) { // testing default config
            cy.log(eq);
            expect(eq.length).to.equal(3); // 3 requests 
            initialID = eq[0].device_id; // get the new id from first item in the queue
            expect(initialID.length).to.equal(36); // it should be a valid uuid

            expect(eq[0].device_id).to.not.equal("[CLY]_temp_id"); // it should not be the temp id
            expect(eq[0].device_id).to.equal(initialID);

            expect(eq[1].device_id).to.not.equal("[CLY]_temp_id"); // it should not be the temp id
            expect(eq[1].device_id).to.equal(initialID);

            expect(eq[2].device_id).to.equal("[CLY]_temp_id"); // last recorded has the temp id
        }
        else { // testing offline init
            expect(eq.length).to.equal(1); // only 1 request which is the event we recorded
            expect(eq[0].device_id).to.equal("[CLY]_temp_id"); // and it has the temp id
        }

        // now lets disable temp mode
        callbackSecond(); // and give a new device id or not
        Countly.add_event(eventObj("2")); // record another event    
        Countly.user_details({ name: "name" }); // record user details
        cy.wait(500); // wait for the request to be sent

        cy.fetch_local_request_queue().then((eq2) => {
            expect(eq2.length).to.equal(callbackInitial ? 5 : 3); // now 3 or 5 requests depending test mode
            if (generatedID && generatedID !== "new ID") { // if we have a generated id, in case disable_offline_mode is called without new id
                generatedID = eq2[0].device_id; // get the new id from any item in the queue
                expect(generatedID).to.not.equal("[CLY]_temp_id"); // it should not be the temp id
                expect(generatedID.length).to.equal(36); // it should be a valid uuid
            }

            // TODO: maybe make this part shorter
            if (callbackInitial) { // testing default config
                expect(eq2[0].device_id).to.equal(initialID);
                expect(eq2[1].device_id).to.equal(initialID);
                expect(eq2[2].device_id).to.equal(generatedID === "new ID" ? generatedID : initialID);
                expect(eq2[3].device_id).to.equal(generatedID === "new ID" ? generatedID : initialID);
                expect(eq2[4].device_id).to.equal(generatedID === "new ID" ? generatedID : initialID);
            }
            else { // testing offline init
                expect(eq2[0].device_id).to.equal(generatedID);
                expect(eq2[1].device_id).to.equal(generatedID);
                expect(eq2[2].device_id).to.equal(generatedID);
            }
        });
    });
}

describe("Device ID change tests ", ()=>{
    // ========================================
    // init time offline mode tests
    // start offline -> 
    // record an even -> 
    // change id/ disable offline mode -> 
    // record another event and user details -> 
    // check the device id in the requests
    // ========================================

    it("Check init time temp mode with disable_offline_mode with new ID", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(true); // init in offline mode
            testDeviceIdInReqs(()=>{
                Countly.disable_offline_mode("new ID");
            });
        });
    });
    it("Check init time temp mode with disable_offline_mode without new ID", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(true); // init in offline mode
            testDeviceIdInReqs(()=>{
                Countly.disable_offline_mode();
            }, undefined, true);
        });
    });
    it("Check init time temp mode with merge change_id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(true); // init in offline mode
            testDeviceIdInReqs(()=>{
                Countly.change_id("new ID", true);
            });
        });
    });
    it("Check init time temp mode with non-merge change_id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(true); // init in offline mode
            testDeviceIdInReqs(()=>{
                Countly.change_id("new ID", false);
            });
        });
    });
    it("Check init time temp mode with set_id", () => {
        hp.haltAndClearStorage(() => {
            initMain(true); // init in offline mode
            testDeviceIdInReqs(() => {
                Countly.set_id("new ID");
            });
        });
    });

    // ========================================
    // default init configuration tests
    // start online -> 
    // record an even and user details -> 
    // enable offline mode -> 
    // record another event -> 
    // change id/ disable offline mode -> 
    // record another event and user details -> 
    // check the device id in the requests
    // ========================================

    it("Check default init with enable_offline_mode then disable_offline_mode with new ID", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(false); // init normally
            testDeviceIdInReqs(()=>{
                Countly.disable_offline_mode("new ID");
            }, ()=>{
                Countly.add_event(eventObj("0")); // record an event prior
                Countly.user_details({ name: "name2" }); // record user details
                cy.wait(1000); // wait for the request to be sent
                Countly.enable_offline_mode();
            });
        });
    });
    it("Check default init with enable_offline_mode then disable_offline_mode with no ID", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(false); // init normally
            testDeviceIdInReqs(()=>{
                Countly.disable_offline_mode();
            }, ()=>{
                Countly.add_event(eventObj("0")); // record an event prior
                Countly.user_details({ name: "name2" }); // record user details
                cy.wait(1000); // wait for the request to be sent
                Countly.enable_offline_mode();
            }, true);
        });
    });
    it("Check default init with enable_offline_mode then change_id with merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(false); // init normally
            testDeviceIdInReqs(()=>{
                Countly.change_id("new ID", true);
            }, ()=>{
                Countly.add_event(eventObj("0")); // record an event prior
                Countly.user_details({ name: "name2" }); // record user details
                cy.wait(1000); // wait for the request to be sent
                Countly.enable_offline_mode();
            });
        });
    });
    it("Check default init with enable_offline_mode then change_id with non-merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(false); // init normally
            testDeviceIdInReqs(()=>{
                Countly.change_id("new ID", false);
            }, ()=>{
                Countly.add_event(eventObj("0")); // record an event prior
                Countly.user_details({ name: "name2" }); // record user details
                cy.wait(1000); // wait for the request to be sent
                Countly.enable_offline_mode();
            });
        });
    });
});

describe("Set ID change tests ", () => {
    it('set_id should be non merge as there was dev provided id', () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                debug: true,
                device_id: "old ID"
            });
            Countly.add_event(eventObj("1")); // record an event.
            cy.wait(500); // wait for the request to be sent
            cy.fetch_local_request_queue().then((eq) => {
                expect(eq[0].device_id).to.equal("old ID");
                Countly.set_id("new ID");
                Countly.add_event(eventObj("2")); // record another event
                cy.wait(500); // wait for the request to be sent
                cy.fetch_local_request_queue().then((eq2) => {
                    expect(eq2.length).to.equal(2); // no merge request, and no session as none was running
                    expect(eq2[0].device_id).to.equal("old ID");
                    expect(eq2[0].events).to.contains('"key\":\"1\"');
                    expect(eq2[1].device_id).to.equal("new ID");
                    expect(eq2[1].events).to.contains('"key\":\"2\"');
                });
            });
        });
    });
    it('set_id should be merge as there was sdk generated id', () => {
        hp.haltAndClearStorage(() => {
            initMain(false); // init normally
            Countly.add_event(eventObj("1")); // record an event.
            cy.wait(500); // wait for the request to be sent
            let generatedID;
            cy.fetch_local_request_queue().then((eq) => {
                cy.log(eq);
                generatedID = eq[0].device_id; // get the new id from first item in the queue
                Countly.set_id("new ID");
                Countly.add_event(eventObj("2")); // record another event
                cy.wait(500); // wait for the request to be sent
                cy.fetch_local_request_queue().then((eq2) => {
                    cy.log(eq2);
                    expect(eq2.length).to.equal(3); // merge request
                    expect(eq2[0].device_id).to.equal(generatedID);
                    expect(eq2[0].events).to.contains('"key\":\"1\"');
                    expect(eq2[1].device_id).to.equal("new ID");
                    expect(eq2[1].old_device_id).to.equal(generatedID);
                    expect(eq2[2].device_id).to.equal("new ID");
                    expect(eq2[2].events).to.contains('"key\":\"2\"');
                });
            });
        });
    });

});

describe("Device ID remote config sequencing", () => {
    it("refetches remote config for a merged ID only once the merge request was sent", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            var inst = Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                device_id: "old ID",
                debug: true,
                use_explicit_rc_api: true,
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.functionName === "fetch_remote_config_explicit") {
                        sent.push("remote config for " + req.params.device_id);
                        return { status: 200, responseText: "{}" };
                    }
                    if (req.params.old_device_id) {
                        sent.push("merge " + req.params.old_device_id + " into " + req.params.device_id);
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });

            cy.wait(hp.sWait).then(() => {
                inst.remote_config = function() {};
                // the queue cannot send yet, as when it is busy or the network is slow
                Countly.test_mode_rq(true);
                Countly.change_id("new ID", true);
            });

            cy.wait(1500).then(() => {
                expect(sent, "nothing for the new ID while its merge request waits").to.deep.equal([]);
                Countly.test_mode_rq(false);
            });

            cy.wait(1500).then(() => {
                expect(sent).to.deep.equal(["merge old ID into new ID", "remote config for new ID"]);
            });
        });
    });

    it("refetches remote config at once after a change without merge", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            var inst = Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                device_id: "old ID",
                debug: true,
                test_mode: true,
                use_explicit_rc_api: true,
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.functionName === "fetch_remote_config_explicit") {
                        sent.push("remote config for " + req.params.device_id);
                        return { status: 200, responseText: "{}" };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });

            cy.wait(hp.sWait).then(() => {
                inst.remote_config = function() {};
                Countly.change_id("new ID", false);
                expect(sent).to.deep.equal(["remote config for new ID"]);
            });
        });
    });
});

describe("Sessions around a device ID change without merge", () => {
    function initWithDeveloperId() {
        Countly.init({
            app_key: "YOUR_APP_KEY",
            url: "https://your.domain.count.ly",
            test_mode: true,
            debug: true,
            device_id: "old ID"
        });
    }

    it("starts no session for the new ID when none was running", () => {
        hp.haltAndClearStorage(() => {
            initWithDeveloperId();
            Countly.change_id("new ID", false);
            cy.wait(500).then(() => {
                var begins = Countly._internals.getLocalQueues().requestQ.filter((r) => r.begin_session);
                expect(begins.length).to.equal(0);
            });
        });
    });

    it("starts a session for the new ID when sessions are tracked automatically, also after the session was ended", () => {
        hp.haltAndClearStorage(() => {
            initWithDeveloperId();
            Countly.track_sessions();
            Countly.end_session();
            Countly.change_id("new ID", false);
            cy.wait(500).then(() => {
                var begins = Countly._internals.getLocalQueues().requestQ.filter((r) => r.begin_session);
                expect(begins.map((r) => r.device_id)).to.deep.equal(["old ID", "new ID"]);
            });
        });
    });

    it("gives a session the developer begins after the change to the new ID as a new session", () => {
        hp.haltAndClearStorage(() => {
            initWithDeveloperId();
            Countly.begin_session();
            Countly.change_id("new ID", false);
            Countly.begin_session();
            cy.wait(500).then(() => {
                var begins = Countly._internals.getLocalQueues().requestQ.filter((r) => r.begin_session);
                expect(begins.map((r) => r.device_id)).to.deep.equal(["old ID", "new ID"]);
            });
        });
    });

    it("leaves sessions to the developer when they are started manually", () => {
        hp.haltAndClearStorage(() => {
            initWithDeveloperId();
            Countly.begin_session();
            Countly.change_id("new ID", false);
            cy.wait(500).then(() => {
                var begins = Countly._internals.getLocalQueues().requestQ.filter((r) => r.begin_session);
                expect(begins.map((r) => r.device_id)).to.deep.equal(["old ID"]);
            });
        });
    });
});

describe("Device ID change details", () => {
    it("saves the previous user's pending profile changes before a change without merge", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                debug: true,
                device_id: "old ID"
            });
            Countly.userData.set("plan", "pro");
            Countly.change_id("new ID", false);
            Countly.userData.save();
            cy.wait(500).then(() => {
                var withPlan = Countly._internals.getLocalQueues().requestQ.filter((r) => r.user_details && r.user_details.indexOf("pro") !== -1);
                expect(withPlan.map((r) => r.device_id)).to.deep.equal(["old ID"]);
            });
        });
    });

    it("never gives the next user profile changes the previous user could not save", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                debug: true,
                device_id: "old ID",
                require_consent: true,
                getSearchQuery: () => ""
            });
            Countly.add_consent("users");
            Countly.userData.set("plan", "pro");
            Countly.remove_consent("users");
            Countly.change_id("new ID", false);
            Countly.add_consent("users");
            Countly.userData.save();
            cy.wait(500).then(() => {
                var withPlan = Countly._internals.getLocalQueues().requestQ.filter((r) => r.user_details && r.user_details.indexOf("pro") !== -1);
                expect(withPlan.map((r) => r.device_id)).to.deep.equal([]);
            });
        });
    });

    it("changes a device ID that came from the page link without merge, as it is reported as developer supplied", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                debug: true,
                getSearchQuery: () => "?cly_device_id=from_link"
            });
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            Countly.set_id("new ID");
            cy.wait(500).then(() => {
                expect(Countly.get_device_id()).to.equal("new ID");
                expect(Countly._internals.getLocalQueues().requestQ.filter((r) => r.old_device_id).length, "merge requests").to.equal(0);
            });
        });
    });

    it("fetches the SDK behavior settings again for the new ID right after a change without merge", () => {
        var settingsFetches = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                debug: true,
                device_id: "old ID",
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    if (req.functionName === "server_config") {
                        settingsFetches.push(req.params.device_id);
                        return { status: 200, responseText: "{\"v\":2,\"c\":{}}" };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.change_id("new ID", false);
            cy.wait(500).then(() => {
                expect(settingsFetches).to.deep.equal(["old ID", "new ID"]);
            });
        });
    });

    it("fetches the SDK behavior settings for a merged ID only once the merge request was sent", () => {
        // any fetch under an ID that is new to the server creates that user, and a merge into an existing user is no longer a rename
        var sent = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                device_id: "old ID",
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    if (req.functionName === "server_config") {
                        sent.push("settings for " + req.params.device_id);
                        return { status: 200, responseText: "{\"v\":2,\"c\":{}}" };
                    }
                    if (req.params.old_device_id) {
                        sent.push("merge " + req.params.old_device_id + " into " + req.params.device_id);
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.change_id("merged ID", true);
            cy.wait(1500).then(() => {
                expect(sent).to.deep.equal(["settings for old ID", "merge old ID into merged ID", "settings for merged ID"]);
            });
        });
    });

    it("waits also for a merge request still buffered for the client hints when another request is sent first", () => {
        var sent = [];
        hp.haltAndClearStorage(() => {
            // a request an earlier page could not send
            localStorage.setItem("YOUR_APP_KEY/cly_queue", JSON.stringify([{ app_key: "YOUR_APP_KEY", device_id: "old ID", t: 0, user_details: "{}" }]));
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                device_id: "old ID",
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    if (req.functionName === "server_config") {
                        sent.push("settings for " + req.params.device_id);
                        return { status: 200, responseText: "{\"v\":2,\"c\":{}}" };
                    }
                    if (req.functionName === "send_request_queue") {
                        sent.push(req.params.old_device_id ? "merge " + req.params.old_device_id + " into " + req.params.device_id : "earlier request");
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            // right after init the client hints are still resolving, so the merge request waits in their buffer
            Countly.change_id("merged ID", true);
            Countly._internals.heartBeat();
            cy.wait(1500).then(() => {
                expect(sent).to.deep.equal(["settings for old ID", "earlier request", "merge old ID into merged ID", "settings for merged ID"]);
            });
        });
    });
});

describe("Request order around a device ID change", () => {
    // what reached the server, in order: which request and the device ID it was made for
    function describeRequest(path, params) {
        var what = params.get("old_device_id") ? "merge" : params.get("method") || (path.indexOf("/content") !== -1 ? "content" : null) || (params.get("user_details") ? "profile" : params.get("events") ? "events" : params.get("hc") ? "health check" : path);
        return what + " for " + params.get("device_id");
    }

    function viewEndsIn(params, viewEnds) {
        if (typeof params.events === "string") {
            JSON.parse(params.events).forEach((e) => {
                if (e.key === "[CLY]_view" && typeof e.dur !== "undefined") {
                    viewEnds.push(e.segmentation.name + " for " + params.device_id);
                }
            });
        }
    }

    it("sends the duration of the last view for the previous device ID at a change without merge", () => {
        var viewEnds = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                device_id: "previous user",
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    viewEndsIn(req.params || {}, viewEnds);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.track_sessions();
            Countly.track_view("page of the previous user");
            cy.wait(2500).then(() => {
                Countly.change_id("next user", false);
            });
            cy.wait(2000).then(() => {
                expect(viewEnds).to.deep.equal(["page of the previous user for previous user"]);
            });
        });
    });

    it("sends the duration of the last view for the previous device ID at a change without merge, also without a session", () => {
        var viewEnds = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                device_id: "previous user",
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    viewEndsIn(req.params || {}, viewEnds);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.track_view("page of the previous user");
            cy.wait(2500).then(() => {
                Countly.change_id("next user", false);
                Countly.track_view("page of the next user");
            });
            cy.wait(2000).then(() => {
                expect(viewEnds).to.deep.equal(["page of the previous user for previous user"]);
            });
        });
    });

    it("sends a merge request left by the previous page before anything for the merged device ID", () => {
        var order = [];
        hp.haltAndClearStorage(() => {
            localStorage.setItem("YOUR_APP_KEY/cly_id", "new ID");
            localStorage.setItem("YOUR_APP_KEY/cly_id_type", "0");
            localStorage.setItem("YOUR_APP_KEY/cly_queue", JSON.stringify([{ app_key: "YOUR_APP_KEY", device_id: "new ID", t: 0, timestamp: 1700000000000, old_device_id: "old ID" }]));
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    var p = req.params || {};
                    order.push(p.old_device_id ? "merge" : req.functionName === "server_config" ? "settings" : req.functionName === "[healthCheck]" ? "health check" : req.functionName);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1500).then(() => {
                expect(order[0], JSON.stringify(order)).to.equal("merge");
                expect(order).to.include.members(["settings", "health check"]);
            });
        });
    });

    it("sends what waited for a merge right after the merge request, not with the next heartbeat", () => {
        var order = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                device_id: "old ID",
                interval: 10000,
                getSearchQuery: () => "",
                fake_request_handler: (req) => {
                    order.push(req.params && req.params.old_device_id ? "merge" : req.functionName);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1500).then(() => {
                order.length = 0;
                Countly.change_id("new ID", true);
                Countly.get_available_feedback_widgets(() => {});
            });
            cy.wait(1500).then(() => {
                expect(order.indexOf("merge"), JSON.stringify(order)).to.be.greaterThan(-1);
                expect(order.indexOf("get_available_feedback_widgets,"), JSON.stringify(order)).to.be.greaterThan(order.indexOf("merge"));
            });
        });
    });

    it("sends nothing for a merged device ID before its merge request, also what the site asks for right after the change", () => {
        var arrived = [];
        cy.intercept("https://your.domain.count.ly/**", (req) => {
            var params = new URLSearchParams((req.url.split("?")[1] || "") + "&" + (typeof req.body === "string" ? req.body : ""));
            arrived.push(describeRequest(req.url.split("?")[0], params));
            // the server answers the request on its way at the change slowly
            var slow = (params.get("events") || "").indexOf("before_the_change") !== -1;
            req.reply({ delay: slow ? 2000 : 0, statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", debug: true, device_id: "old ID", getSearchQuery: () => "" });
            cy.wait(1200).then(() => {
                Countly.add_event({ key: "before_the_change", count: 1 });
            });
            cy.wait(1000).then(() => {
                arrived.length = 0;
                Countly.change_id("new ID", true);
                Countly.fetch_remote_config();
                Countly.get_available_feedback_widgets(() => {});
                Countly.content.enterContentZone();
            });
            cy.wait(4000).then(() => {
                var merge = arrived.indexOf("merge for new ID");
                expect(merge, JSON.stringify(arrived)).to.be.greaterThan(-1);
                expect(arrived.slice(0, merge).filter((a) => / for new ID$/.test(a)), "before the merge: " + JSON.stringify(arrived)).to.deep.equal([]);
                expect(arrived.slice(merge + 1).filter((a) => / for new ID$/.test(a)).length, "after the merge: " + JSON.stringify(arrived)).to.be.greaterThan(2);
            });
        });
    });
});
