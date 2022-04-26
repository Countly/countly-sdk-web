/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(deviceId, offline, searchQuery) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        device_id: deviceId,
        tests: true,
        debug: true,
        getSearchQuery: function() {
            return searchQuery;
        },
        offline_mode: offline
    });
}
function validateSdkGeneratedId(providedDeviceId) {
    expect(providedDeviceId).to.exist;
    expect(providedDeviceId.length).to.eq(36);
    expect(Countly._internals.isUUID(providedDeviceId)).to.be.ok;
}
function validateInternalDeviceIdType(expectedType) {
    expect(expectedType).to.eq(Countly._internals.getInternalDeviceIdType());
}
function checkRequestsForT(queue, expectedInternalType) {
    for (var i = 0; i < queue.length; i++) {
        expect(queue[i].t).to.exist;
        expect(queue[i].t).to.eq(Countly._internals.getInternalDeviceIdType());
        expect(queue[i].t).to.eq(expectedInternalType);
    }
}


/**
 *device ID type:
    *0 - device ID was set by the developer during init
    *1 - device ID was auto generated by Countly
    *2 - device ID was temporarily given by Countly
    *3 - device ID was provided from location.search
 */
var DeviceIdTypeInternalEnumsTest = {
    DEVELOPER_SUPPLIED: 0,
    SDK_GENERATED: 1,
    TEMPORARY_ID: 2,
    URL_PROVIDED: 3,
};
describe("Device Id tests during first init", ()=>{
    // sdk is initialized w/o custom device id, w/o offline mode, w/o utm device id

    // we provide no device id information sdk should generate the id
    it("SDK is initialized without custom device id, without offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            expect(Countly.get_device_id_type()).to.eq(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(Countly.get_device_id());
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    // we provide device id information sdk should use it
    it("SDK is initialized with custom device id, without offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("gerwutztreimer", false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("gerwutztreimer");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    // we provide no device id information sdk should generate the id
    it("SDK is initialized without custom device id, with offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("SDK is initialized without custom device id, without offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("SDK is initialized with custom device id, with offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID", true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("SDK is initialized with custom device id, without offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID2", false, "?cly_device_id=someID");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("SDK is initialized with custom device id, with offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID3", true, "?cly_device_id=someID2");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("someID2");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });

    // from here on the tests focus the device id change and offline mode
    // first pair
    it("SDK is initialized with no device id, not offline mode, not utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(Countly.get_device_id());
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("SDK is initialized with no device id, not offline mode, not utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(Countly.get_device_id());
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.enable_offline_mode();
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    // second pair
    it("SDK is initialized with user defined device id, not offline mode, not utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("userID", false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("userID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("SDK is initialized with user defined device id, not offline mode, not utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("userID", false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("userID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.enable_offline_mode();
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    // third pair
    it("SDK is initialized with no device id, not offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("SDK is initialized with no device id, not offline mode, with utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.enable_offline_mode();
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    // fourth pair
    it("SDK is initialized with no device id, with offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("SDK is initialized with no device id, with offline mode, no utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.enable_offline_mode();
            Countly.change_id("newID");
            Countly.begin_session();
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("newID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
});

