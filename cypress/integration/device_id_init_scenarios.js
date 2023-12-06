/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
/**
 * +--------------------------------------------------+------------------------------------+----------------------+
 * | SDK state at the end of the previous app session | Provided configuration during init | Action taken by SDK  |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |     Custom      |   SDK used a   |   Temp ID     |   Custom   |  Temporary  |   URL   |    Flag   |   flag   |
 * |   device ID     |   generated    |   mode was    | device ID  |  device ID  |         |    not    |          |
 * |    was set      |       ID       |   enabled     | provided   |  enabled    |         |    set    |   set    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    -    |    1      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    -    |    2      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    -    |    3      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    x    |    4      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      x      |    -    |    5      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    x    |    6      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    x    |    7      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      x      |    x    |    8      |    -     |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      -     |      -      |    -    |    17     |    33    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      x     |      -      |    -    |    18     |    34    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      -     |      x      |    -    |    19     |    35    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      -     |      -      |    x    |    20     |    36    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      x     |      x      |    -    |    21     |    37    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      x     |      -      |    x    |    22     |    38    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      -     |      x      |    x    |    23     |    39    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        x        |        -       |       -       |      x     |      x      |    x    |    24     |    40    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      -     |      -      |    -    |    25     |    41    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      x     |      -      |    -    |    26     |    42    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      -     |      x      |    -    |    27     |    43    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      -     |      -      |    x    |    28     |    44    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      x     |      x      |    -    |    29     |    45    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      x     |      -      |    x    |    30     |    46    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      -     |      x      |    x    |    31     |    47    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        -       |       x       |      x     |      x      |    x    |    32     |    48    |
 * +--------------------------------------------------+------------------------------------+----------------------+ 
 * |        -        |        x       |       -       |      -     |      -      |    -    |    49     |    57    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      x     |      -      |    -    |    50     |    58    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      -     |      x      |    -    |    51     |    59    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      -     |      -      |    x    |    52     |    60    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      x     |      x      |    -    |    53     |    61    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      x     |      -      |    x    |    54     |    62    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      -     |      x      |    x    |    55     |    63    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |        -        |        x       |       -       |      x     |      x      |    x    |    56     |    64    |
 * +--------------------------------------------------+------------------------------------+----------------------+ 
 * |                                        Change ID and offline mode tests                                      |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    -    |   9-10    |     -    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    -    |   11-12   |     -    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    -    |   13-14   |     -    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    x    |   15-16   |     -    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 */

var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(deviceId, offline, searchQuery, clear) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.countly",
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
    URL_PROVIDED: 3
};
describe("Device Id tests during first init", ()=>{
    // sdk is initialized w/o custom device id, w/o offline mode, w/o utm device id

    // we provide no device id information sdk should generate the id
    it("1-SDK is initialized without custom device id, without offline mode, without utm device id", ()=>{
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
    it("2-SDK is initialized with custom device id, without offline mode, without utm device id", ()=>{
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
    it("3-SDK is initialized without custom device id, with offline mode, without utm device id", ()=>{
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
    it("4-SDK is initialized without custom device id, without offline mode, with utm device id", ()=>{
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
    it("5-SDK is initialized with custom device id, with offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID", true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("customID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("6-SDK is initialized with custom device id, without offline mode, with utm device id", ()=>{
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
    it("7-SDK is initialized without custom device id, with offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, "?cly_device_id=someID");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("8-SDK is initialized with custom device id, with offline mode, with utm device id", ()=>{
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

    // Here tests focus the device id change and offline mode
    // first pair
    it("9-SDK is initialized with no device id, not offline mode, not utm device id", ()=>{
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
    it("10-SDK is initialized with no device id, not offline mode, not utm device id, but then offline", ()=>{
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
    it("11-SDK is initialized with user defined device id, not offline mode, not utm device id", ()=>{
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
    it("12-SDK is initialized with user defined device id, not offline mode, not utm device id, but then offline", ()=>{
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
    it("13-SDK is initialized with no device id, not offline mode, with utm device id", ()=>{
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
    it("14-SDK is initialized with no device id, not offline mode, with utm device id, but then offline", ()=>{
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
    it("15-SDK is initialized with no device id, with offline mode, no utm device id", ()=>{
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
    it("16-SDK is initialized with no device id, with offline mode, no utm device id, but then offline", ()=>{
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

    // Auto generated or developer set device ID was present in the local storage before initialization
    it("17-Stored ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("18-Stored ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("19-Stored ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("20-Stored ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("21-Stored ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("22-Stored ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("23-Stored ID precedence, SDK is initialized no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("24-Stored ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });

    // Temporary ID  was present in the local storage before initialization
    it("25-Stored temp ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("26-Stored temp ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", false, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("27-Stored temp ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
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
    it("28-Stored temp ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
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
    it("29-Stored temp ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", true, undefined);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("30-Stored temp ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("31-Stored temp ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("32-Stored temp ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });

    // Same tests with clear device ID flag set to true
    // Auto generated or developer set device ID was present in the local storage before initialization
    it("33-Cleared ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, false, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(Countly.get_device_id());
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("34-Cleared ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", false, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("35-Cleared ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("36-Cleared ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("37-Cleared ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("38-Cleared ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("39-Cleared ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("40-Cleared ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("storedID", false, undefined);
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });

    // Temporary ID  was present in the local storage before initialization
    it("41-Cleared temp ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, false, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(Countly.get_device_id());
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("42-Cleared temp ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", false, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("43-Cleared temp ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("44-Cleared temp ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("45-Cleared temp ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("counterID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("46-Cleared temp ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("47-Cleared temp ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("48-Cleared temp ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("[CLY]_temp_id", false, undefined);
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.eq("abab");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });

    // SDK generated ID was present prior the second init
    it("49-Stored UUID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, false, undefined);
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("50-Stored UUID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", false, undefined);
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("51-Stored UUID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, true, undefined);
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("52-Stored UUID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, false, "?cly_device_id=abab");
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("53-Stored UUID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", true, undefined);
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("54-Stored UUID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab");
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("55-Stored UUID precedence, SDK is initialized no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab");
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("56-Stored UUID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab");
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });

    // SDK generated ID was present prior the second init (same tests with flag set to true)
    it("57-Stored UUID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, false, undefined, true);
            validateSdkGeneratedId(Countly.get_device_id());
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            });
        });
    });
    it("58-Stored UUID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", false, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("59-Stored UUID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            });
        });
    });
    it("60-Stored UUID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("61-Stored UUID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", true, undefined, true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            });
        });
    });
    it("62-Stored UUID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", false, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("63-Stored UUID precedence, SDK is initialized no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain(undefined, true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
    it("64-Stored UUID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);
            var oldUUID = Countly.get_device_id();
            Countly.halt();
            initMain("counterID", true, "?cly_device_id=abab", true);
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(Countly.get_device_id()).to.not.eq(oldUUID);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            Countly.begin_session();
            cy.fetch_local_request_queue().then((eq) => {
                checkRequestsForT(eq, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            });
        });
    });
});
