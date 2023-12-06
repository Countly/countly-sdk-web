var Countly = require("../../lib/countly");
var hp = require("../support/helper");

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
        url: "https://your.domain.countly",
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