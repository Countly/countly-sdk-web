/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(deviceId, offline, searchQuery, clear, rq, eq) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        device_id: deviceId,
        test_mode: rq,
        test_mode_eq: eq,
        debug: true,
        clear_stored_id: clear,
        getSearchQuery: function() {
            return searchQuery;
        },
        offline_mode: offline
    });
}

const event = {
    key: "buttonClick",
    segmentation: {
        id: "id"
    }
};

// ====================================
// Session cookie checks: We check situations where the session cookie is updated/erased
// ====================================

describe("Device ID init tests for session cookies", ()=>{
    // situations that keeps the session cookie
    it("Default behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false);
            Countly.begin_session();
            cy.fetch_from_storage(undefined, "cly_session").then((c1) => {
                cy.log("session cookie: " + c1);
                const cookie1 = c1;
                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false);
                    cy.fetch_from_storage(undefined, "cly_session").then((c2) => {
                        cy.log("session cookie: " + c2);
                        const cookie2 = c2;
                        assert.equal(cookie1, cookie2);
                    });
                });
            });
        });
    });
    it("Default behavior, change_id, merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false);
            Countly.begin_session();
            cy.fetch_from_storage(undefined, "cly_session").then((c1) => {
                cy.log("session cookie: " + c1);
                const cookie1 = c1;
                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false);
                    Countly.change_id("new_id", true);
                    cy.fetch_from_storage(undefined, "cly_session").then((c2) => {
                        cy.log("session cookie: " + c2);
                        const cookie2 = c2;
                        assert.equal(cookie1, cookie2);
                    });
                });
            });
        });
    });

    // situations that changes the session cookie
    it("Default behavior, change_id, no merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false);
            Countly.begin_session();
            cy.fetch_from_storage(undefined, "cly_session").then((c1) => {
                cy.log("session cookie: " + c1);
                const cookie1 = c1;
                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false);
                    Countly.change_id("new_id");
                    cy.fetch_from_storage(undefined, "cly_session").then((c2) => {
                        cy.log("session cookie: " + c2);
                        const cookie2 = c2;
                        assert.notEqual(cookie1, cookie2);
                    });
                });
            });
        });
    });
    it("Clear storage behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false);
            Countly.begin_session();
            cy.fetch_from_storage(undefined, "cly_session").then((c1) => {
                cy.log("session cookie: " + c1);
                const cookie1 = c1;
                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, true); // clear stored id
                    cy.fetch_from_storage(undefined, "cly_session").then((c2) => {
                        cy.log("session cookie: " + c2);
                        const cookie2 = c2;
                        assert.notEqual(cookie1, cookie2);
                    });
                });
            });
        });
    });
});

// ====================================
// Event queue checks : We block the event queue processing to observe if internal event queue flushing works.
// ====================================

describe("Device ID init tests for event flushing", ()=>{
    // situations where the event queue is kept (no flushing should happen)
    it("Default behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, undefined, true);
            Countly.add_event(event);
            cy.fetch_local_event_queue().then((e1) => {
                cy.log("event queue: " + e1);
                const event1 = e1;

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, undefined, true);
                    cy.fetch_local_event_queue().then((e2) => {
                        cy.log("event queue: " + e2);
                        const event2 = e2;
                        assert.deepEqual(event1, event2);
                    });
                });
            });
        });
    });
    it("Default behavior, change_id, merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, undefined, true);
            Countly.add_event(event);
            cy.fetch_local_event_queue().then((e1) => {
                cy.log("event queue: " + e1);
                const event1 = e1;

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, undefined, true);
                    Countly.change_id("new_id", true);
                    cy.fetch_local_event_queue().then((e2) => {
                        cy.log("event queue: " + e2);
                        const event2 = e2;
                        assert.deepEqual(event1, event2);
                    });
                });
            });
        });
    });

    // situations where the event queue is cleared/flushed. 
    it("Default behavior, change_id, no merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, undefined, true);
            Countly.add_event(event);
            cy.fetch_local_event_queue().then((e1) => {
                cy.log("event queue: " + e1);
                const event1 = e1;

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, undefined, true);
                    Countly.change_id("new_id");
                    cy.fetch_local_event_queue().then((e2) => {
                        cy.log("event queue: " + e2);
                        const event2 = e2;
                        assert.notDeepEqual(event1, event2);
                    });
                });
            });
        });
    });
    it("Clear storage behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, undefined, true);
            Countly.add_event(event);
            cy.fetch_local_event_queue().then((e1) => {
                cy.log("event queue: " + e1);
                const event1 = e1;

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, true, undefined, true);
                    cy.wait(1000).then(() => {
                        cy.fetch_local_event_queue().then((e2) => {
                            cy.log("event queue: " + e2);
                            const event2 = e2;
                            assert.notDeepEqual(event1, event2);
                        });
                    });
                });
            });
        });
    });
});

// ====================================
// Request queue checks: Situations where both event queue and request queue processes are stopped to observe if internal event queue flushing works
// ====================================

describe("Device ID init tests for request state", ()=>{
    it("Default behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, true, true);
            Countly.add_event(event);
            cy.fetch_local_request_queue().then((r1) => {
                cy.log("request queue: " + r1);
                const req1 = r1;
                assert.equal(r1.length, 0);

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, true, true);
                    cy.fetch_local_request_queue().then((r2) => {
                        cy.log("request queue: " + r2);
                        const req2 = r2;
                        assert.equal(r2.length, 0);
                        assert.deepEqual(req1, req2);
                    });
                });
            });
        });
    });
    it("Default behavior, change_id, merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, true, true);
            Countly.add_event(event);
            cy.fetch_local_request_queue().then((r1) => {
                cy.log("request queue: " + r1);
                const req1 = r1;
                assert.equal(r1.length, 0);

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, true, true);
                    Countly.change_id("new_id", true);
                    cy.fetch_local_request_queue().then((r2) => {
                        cy.log("request queue: " + r2);
                        const req2 = r2;
                        expect(r2[0].old_device_id).to.be.ok;
                        assert.notDeepEqual(req1, req2);
                    });
                });
            });
        });
    });
    it("Default behavior, change_id, no merge", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, true, true);
            Countly.add_event(event);
            cy.fetch_local_request_queue().then((r1) => {
                cy.log("request queue: " + r1);
                const req1 = r1;
                assert.equal(r1.length, 0);

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, false, true, true);
                    Countly.change_id("new_id");
                    cy.fetch_local_request_queue().then((r2) => {
                        cy.log("request queue: " + r2);
                        const req2 = r2;
                        assert.equal(r2.length, 2);
                        expect(r2[0].events).to.be.ok;
                        expect(r2[1].begin_session).to.be.ok;
                        assert.notDeepEqual(req1, req2);
                    });
                });
            });
        });
    });
    it("Clear storage behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false, true, true);
            Countly.add_event(event);
            cy.fetch_local_request_queue().then((r1) => {
                cy.log("request queue: " + r1);
                const req1 = r1;
                assert.equal(r1.length, 0);

                Countly.halt();
                cy.wait(1000).then(() => {
                    initMain(undefined, false, undefined, true, true, true);
                    cy.fetch_local_request_queue().then((r2) => {
                        cy.log("request queue: " + r2);
                        const req2 = r2;
                        assert.notDeepEqual(req1, req2);
                    });
                });
            });
        });
    });
    it("Start with a long numerical device ID", () => {
        hp.haltAndClearStorage(() => {
            localStorage.setItem("YOUR_APP_KEY/cly_id", "12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            initMain(undefined, false, undefined, false, true, true);
            expect(Countly.get_device_id()).to.equal("12345678901234567890123456789012345678901234567890123456789012345678901234567890");
        });
    });
});