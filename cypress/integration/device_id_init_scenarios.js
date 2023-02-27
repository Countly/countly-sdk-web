/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(deviceId, offline, searchQuery, clear) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        device_id: deviceId,
        test_mode: true,
        debug: true,
        clear_stored_id: clear,
        getSearchQuery: function() {
            return searchQuery;
        },
        offline_mode: offline
    });
}

describe("Device ID init tests", ()=>{
    // situations that keeps the session cookie
    it("Default behavior", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, false);
            Countly.begin_session();
            cy.fetch_from_storage(undefined, "cly_session").then((c1) => {
                cy.log("session cookie: " + c1);
                const cookie1 = c1;
                Countly.halt();
                cy.wait(3000).then(() => {
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
                cy.wait(3000).then(() => {
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
                cy.wait(3000).then(() => {
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
                cy.wait(3000).then(() => {
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