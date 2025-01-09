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
 * |                     First init                   |      -     |      -      |    -    |    1      |    65    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    -    |    2      |    66    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    -    |    3      |    67    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    x    |    4      |    68    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      x      |    -    |    5      |    69    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    x    |    6      |    70    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    x    |    7      |    71    |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      x      |    x    |    8      |    72    |
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
 * |                     First init                   |      -     |      -      |    -    |   9-10    |   73-74  |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      x     |      -      |    -    |   11-12   |   75-76  |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      x      |    -    |   13-14   |   77-78  |
 * +--------------------------------------------------+------------------------------------+----------------------+
 * |                     First init                   |      -     |      -      |    x    |   15-16   |   79-80  |
 * +--------------------------------------------------+------------------------------------+----------------------+
 */

var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(deviceId, offline, searchQuery, clear) {
    Countly.init({
        app_key: hp.appKey,
        url: "https://d.count.ly",
        device_id: deviceId,
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
function checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, temp) {
    var directReqs = Countly._internals.testingGetRequests(); // get direct requests
    cy.log("Requests: " + JSON.stringify(directReqs));

    expect(directReqs.length).to.eq(temp ? 0 : 2);
    for (var i = 0; i < directReqs.length; i++) {
        expect(directReqs[i].params.device_id).to.eq(afterInitDeviceId);
        expect(directReqs[i].params.t).to.eq(afterInitDeviceIdType);
    }
}
function checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType) {
    var queues = Countly._internals.getLocalQueues(); // get local queues
    cy.log("Queues: " + JSON.stringify(queues));

    expect(queues.eventQ.length).to.eq(0);
    expect(queues.requestQ.length).to.eq(2);

    for (var i = 0; i < queues.requestQ.length; i++) {
        expect(queues.requestQ[i].device_id).to.eq(afterInitDeviceId);
        expect(queues.requestQ[i].t).to.eq(afterInitDeviceIdType);
    }
}

function checkStoredReqQueueAfterIDChange(changedID, changedIDType, afterOffline) {
    var queues = Countly._internals.getLocalQueues(); // get local queues
    cy.log("QueuesE: " + JSON.stringify(queues.eventQ));
    cy.log("QueuesQ: " + JSON.stringify(queues.requestQ));
    // print each item in the queue
    for (var i = 0; i < queues.requestQ.length; i++) {
        cy.log("Queue item: " + JSON.stringify(queues.requestQ[i]));
    }

    expect(queues.eventQ.length).to.eq(0);
    var expectedL = 5;
    if (afterOffline) {
        expectedL = 3; // basic after offline tests where entering offline mode should not trigger session end and getting out of offline mode should not trigger session begin (default 5 with those)
    }
    if (afterOffline == 2) {
        expectedL = 6; // offline mode with change id
    }
    if (afterOffline == 3) {
        expectedL = 4; // offline mode with change id
    }

    expect(queues.requestQ.length).to.eq(expectedL);
    const lastInd = queues.requestQ.length - 1;

    expect(queues.requestQ[lastInd].device_id).to.eq(changedID);
    expect(queues.requestQ[lastInd].t).to.eq(changedIDType);
}

function generateSomeEvents() {
    // some events/requests
    Countly.begin_session();
    Countly.track_pageview();
    Countly.add_event({key: "test", segmentation: {"segment": "segment"}});  
}

function setURLCheck(deviceID) {
    const afterInitDeviceId = Countly.get_device_id();
    const afterInitDeviceIdType = Countly.get_device_id_type();

    expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
    expect(afterInitDeviceId).to.eq(deviceID);
    validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

    generateSomeEvents();

    // wait for things to resolve
    cy.wait(hp.sWait2).then(() => {
        checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
        checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
        changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
    });
}

function storedIDUsingTests(customID, offline, utm) {
    hp.haltAndClearStorage(() => {
        cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
        cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

            initMain(customID, offline, utm);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("storedID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
}

function changeIDTests(afterInitDeviceId, afterInitDeviceIdType, afterOffline) {
    Countly.change_id("id_1");
    const changedID = Countly.get_device_id();
    const changedIDType = Countly.get_device_id_type();
    if (afterOffline) {
        afterInitDeviceId = changedID;
        afterInitDeviceIdType = changedIDType;
    }

    expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
    expect(changedID).to.eq("id_1");
    validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

    generateSomeEvents();

    // wait for things to resolve
    cy.wait(550).then(() => {
        // direct requests would have the old device id (hc and session)
        checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

        // after ID events
        checkStoredReqQueueAfterIDChange(changedID, changedIDType, afterOffline);
        Countly.enable_offline_mode();
        Countly.change_id("id_2");
        const changedID2 = Countly.get_device_id();
        const changedIDType2 = Countly.get_device_id_type();

        expect(changedIDType2).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
        expect(changedID2).to.eq("id_2");
        validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

        generateSomeEvents();

        // wait for things to resolve
        cy.wait(550).then(() => {
            // direct requests would have the old device id (hc and session)
            checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

            // after ID events
            checkStoredReqQueueAfterIDChange(changedID2, changedIDType2, afterOffline? 3 : 2); // no end and begin session in offline mode => device id change scenario
        });

    });
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
            
            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();
            
            expect(afterInitDeviceIdType).to.eq(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(afterInitDeviceId);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    // we provide device id information sdk should use it
    it("2-SDK is initialized with custom device id, without offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID", false, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();
       
            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("customID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
       
            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    
    // we provide no device id information sdk should generate the id
    it("3-SDK is initialized without custom device id, with offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                changeIDTests(afterInitDeviceId, afterInitDeviceIdType, true);
            });
        });
    });
    it("4-SDK is initialized without custom device id, without offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID");
            setURLCheck("someID");
        });
    });
    it("5-SDK is initialized with custom device id, with offline mode, without utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID", true, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("customID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    it("6-SDK is initialized with custom device id, without offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID2", false, "?cly_device_id=someID1");
            setURLCheck("someID1");
        });
    });
    it("7-SDK is initialized without custom device id, with offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, "?cly_device_id=someID2");
            setURLCheck("someID2");
        });
    });
    it("8-SDK is initialized with custom device id, with offline mode, with utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("customID3", true, "?cly_device_id=someID3");
            setURLCheck("someID3");
        });
    });

    // Here tests focus the device id change and offline mode
    // first pair
    it("9-SDK is initialized with no device id, not offline mode, not utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });

    it("10-SDK is initialized with no device id, not offline mode, not utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("newID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("newID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true); // no end and begin session in offline mode => device id change scenario
                });
            });
        });
    });
    // second pair
    it("11-SDK is initialized with user defined device id, not offline mode, not utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("initID", false, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("initID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });
    it("12-SDK is initialized with user defined device id, not offline mode, not utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain("initID", false, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("initID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    // third pair
    it("13-SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(changedID, changedIDType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    it("14-SDK is initialized with no device id, offline mode, no utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(changedID, changedIDType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    // fourth pair
    it("15-SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID");

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });
    it("16-SDK is initialized with no device id, no offline mode, utm device id, but then offline", ()=>{
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID");

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });

    // Auto generated or developer set device ID was present in the local storage before initialization
    it("17-Stored ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", () => {
        storedIDUsingTests(undefined, undefined, undefined);
    });
    it("18-Stored ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        storedIDUsingTests("counterID", undefined, undefined);
    });
    it("19-Stored ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        storedIDUsingTests(undefined, true, undefined);
    });
    it("20-Stored ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        storedIDUsingTests(undefined, undefined, "?cly_device_id=abab");
    });
    it("21-Stored ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        storedIDUsingTests("counterID", true, undefined);
    });
    it("22-Stored ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        storedIDUsingTests("counterID", undefined, "?cly_device_id=abab");
    });
    it("23-Stored ID precedence, SDK is initialized no device id, offline mode, utm device id", ()=>{
        storedIDUsingTests(undefined, true, "?cly_device_id=abab");
    });
    it("24-Stored ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        storedIDUsingTests("counterID", true, "?cly_device_id=abab");
    });

    // Temporary ID  was present in the local storage before initialization
    it("25-Stored temp ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, undefined, undefined);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
                expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType, true);
                });
            });
        });
    });
    it("26-Stored temp ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("initID", undefined, undefined);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("initID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("27-Stored temp ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, true, undefined);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
                expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType, true);
                });
            });
        });
    });
    it("28-Stored temp ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, undefined, "?cly_device_id=abab");

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("29-Stored temp ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", true, undefined);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("randomID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("30-Stored temp ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", undefined, "?cly_device_id=abab");

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("31-Stored temp ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, true, "?cly_device_id=abab");

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("32-Stored temp ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", true, "?cly_device_id=abab");

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });

    // Same tests with clear device ID flag set to true
    // Auto generated or developer set device ID was present in the local storage before initialization
    it("33-Cleared ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain(undefined, undefined, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
                expect(afterInitDeviceId).to.not.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("34-Cleared ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain("randomID", undefined, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("randomID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("35-Cleared ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain(undefined, true, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
                expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType, true);
                });
            });
        });
    });
    it("36-Cleared ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain(undefined, undefined, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("37-Cleared ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain("randomID", true, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("randomID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("38-Cleared ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain("randomID", undefined, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("39-Cleared ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain(undefined, true, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("40-Cleared ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "storedID");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED).then(() => {

                initMain("randomID", true, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });

    // Temporary ID  was present in the local storage before initialization
    it("41-Cleared temp ID precedence, SDK is initialized with no device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, undefined, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
                expect(afterInitDeviceId).to.not.eq("[CLY]_temp_id");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("42-Cleared temp ID precedence, SDK is initialized with device id, not offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", undefined, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("randomID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("43-Cleared temp ID precedence, SDK is initialized with no device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, true, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
                expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType, true);
                });
            });
        });
    });
    it("44-Cleared temp ID precedence, SDK is initialized with no device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, undefined, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("45-Cleared temp ID precedence, SDK is initialized with device id, offline mode, no utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", true, undefined, true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("randomID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                    changeIDTests(afterInitDeviceId, afterInitDeviceIdType);
                });
            });
        });
    });
    it("46-Cleared temp ID precedence, SDK is initialized with device id, no offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", undefined, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("47-Cleared temp ID precedence, SDK is initialized with no device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain(undefined, true, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
            });
        });
    });
    it("48-Cleared temp ID precedence, SDK is initialized with device id, offline mode, utm device id", ()=>{
        hp.haltAndClearStorage(() => {
            cy.setLocalStorage("YOUR_APP_KEY/cly_id", "[CLY]_temp_id");
            cy.setLocalStorage("YOUR_APP_KEY/cly_id_type", DeviceIdTypeInternalEnumsTest.TEMPORARY_ID).then(() => {

                initMain("randomID", true, "?cly_device_id=abab", true);

                const afterInitDeviceId = Countly.get_device_id();
                const afterInitDeviceIdType = Countly.get_device_id_type();

                expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(afterInitDeviceId).to.eq("abab");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(hp.sWait2).then(() => {
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                    changeIDTests(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                });
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

    // testing first 8 tests with clear_stored_id flag set to true
    it("65-SDK is initialized without custom device id, without offline mode, without utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, true);
            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.eq(Countly.DeviceIdType.SDK_GENERATED);
            validateSdkGeneratedId(afterInitDeviceId);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    // we provide device id information sdk should use it
    it("66-SDK is initialized with custom device id, without offline mode, without utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain("customID", false, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("customID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    // we provide no device id information sdk should generate the id
    it("67-SDK is initialized without custom device id, with offline mode, without utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    it("68-SDK is initialized without custom device id, without offline mode, with utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID", true);
            setURLCheck("someID");
        });
    });
    it("69-SDK is initialized with custom device id, with offline mode, without utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain("customID", true, undefined, true);
            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("customID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

            generateSomeEvents();

            // wait for things to resolve
            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
            });
        });
    });
    it("70-SDK is initialized with custom device id, without offline mode, with utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain("customID2", false, "?cly_device_id=someID1", true);
            setURLCheck("someID1");
        });
    });
    it("71-SDK is initialized without custom device id, with offline mode, with utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, "?cly_device_id=someID2", true);
            setURLCheck("someID2");
        });
    });
    it("72-SDK is initialized with custom device id, with offline mode, with utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain("customID3", true, "?cly_device_id=someID3", true);
            setURLCheck("someID3");
        });
    });

    // Here tests focus the device id change and offline mode with clear_stored_id flag set to true
    // first pair
    it("73-SDK is initialized with no device id, not offline mode, not utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });

    it("74-SDK is initialized with no device id, not offline mode, not utm device id, but then offline", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.SDK_GENERATED);
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.SDK_GENERATED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("newID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("newID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true); // no end and begin session in offline mode => device id change scenario
                });
            });
        });
    });
    // second pair
    it("75-SDK is initialized with user defined device id, not offline mode, not utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain("initID", false, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("initID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });
    it("76-SDK is initialized with user defined device id, not offline mode, not utm device id, but then offline", () => {
        hp.haltAndClearStorage(() => {
            initMain("initID", false, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("initID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    // third pair
    it("77-SDK is initialized with no device id, offline mode, no utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(changedID, changedIDType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    it("78-SDK is initialized with no device id, offline mode, no utm device id, but then offline", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, true, undefined, true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.TEMPORARY_ID);
            expect(afterInitDeviceId).to.eq("[CLY]_temp_id");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.TEMPORARY_ID);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, afterInitDeviceIdType, true);
                checkEachStoredReqForIDandT(afterInitDeviceId, afterInitDeviceIdType);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(changedID, changedIDType);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
    // fourth pair
    it("79-SDK is initialized with no device id, no offline mode, utm device id", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID", true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType);
                });
            });
        });
    });
    it("80-SDK is initialized with no device id, no offline mode, utm device id, but then offline", () => {
        hp.haltAndClearStorage(() => {
            initMain(undefined, false, "?cly_device_id=someID", true);

            const afterInitDeviceId = Countly.get_device_id();
            const afterInitDeviceIdType = Countly.get_device_id_type();

            expect(afterInitDeviceIdType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
            expect(afterInitDeviceId).to.eq("someID");
            validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
            generateSomeEvents();

            cy.wait(hp.sWait2).then(() => {
                checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);
                checkEachStoredReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                Countly.enable_offline_mode();
                Countly.change_id("storedID");
                const changedID = Countly.get_device_id();
                const changedIDType = Countly.get_device_id_type();

                expect(changedIDType).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
                expect(changedID).to.eq("storedID");
                validateInternalDeviceIdType(DeviceIdTypeInternalEnumsTest.DEVELOPER_SUPPLIED);

                generateSomeEvents();

                // wait for things to resolve
                cy.wait(550).then(() => {
                    // direct requests would have the old device id (hc and session)
                    checkEachDirectReqForIDandT(afterInitDeviceId, DeviceIdTypeInternalEnumsTest.URL_PROVIDED);

                    // after ID events
                    checkStoredReqQueueAfterIDChange(changedID, changedIDType, true);
                });
            });
        });
    });
});
