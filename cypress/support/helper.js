var Countly = require("../../lib/countly");

const appKey = "YOUR_APP_KEY";
const sWait = 100;
const mWait = 4000;
const lWait = 10000;
/**
 * resets Countly
 * @param {Function} callback - callback function that includes the Countly init and the tests
 */
function haltAndClearStorage(callback) {
    if (Countly.i !== undefined) {
        Countly.halt();
    }
    cy.wait(sWait).then(() => {
        cy.clearLocalStorage();
        cy.wait(sWait).then(() => {
            callback();
        });
    });
}

/**
 * get timestamp
 * @returns {number} -timestamp
 */
function getTimestampMs() {
    return new Date().getTime();
}

/**
 * Fine tuner for flaky tests. Retries test for  a certain amount
 * @param {number} startTime - starting time, timestamp
 * @param {number} waitTime - real wait time for tests you want to test
 * @param {number} waitIncrement -  time increment to retry the tests
 * @param {Function} continueCallback - callback function with tests
 */
var waitFunction = function(startTime, waitTime, waitIncrement, continueCallback) {
    if (waitTime <= getTimestampMs() - startTime) {
        // we have waited enough
        continueCallback();
    }
    else {
        // we need to wait more
        cy.wait(waitIncrement).then(()=>{
            waitFunction(startTime, waitTime, waitIncrement, continueCallback);
        });
    }
};

// gathered events. count and segmentation key/values must be consistent
const eventArray = [
    // first event must be custom event
    {
        key: "a",
        count: 1,
        segmentation: {
            1: "1"
        }
    },
    // rest can be internal events
    {
        key: "[CLY]_view",
        count: 2,
        segmentation: {
            2: "2"
        }
    },
    {
        key: "[CLY]_nps",
        count: 3,
        segmentation: {
            3: "3"
        }
    },
    {
        key: "[CLY]_survey",
        count: 4,
        segmentation: {
            4: "4"
        }
    },
    {
        key: "[CLY]_star_rating",
        count: 5,
        segmentation: {
            5: "5"
        }
    },
    {
        key: "[CLY]_orientation",
        count: 6,
        segmentation: {
            6: "6"
        }
    },
    {
        key: "[CLY]_action",
        count: 7,
        segmentation: {
            7: "7"
        }
    }

];
// event adding loop
/**
 * adds events to the queue
 * @param {Array} omitList - events to omit from the queue. If not provided, all events will be added. Must be an array of string key values
 */
function events(omitList) {
    for (var i = 0, len = eventArray.length; i < len; i++) {
        if (omitList) {
            if (omitList.indexOf(eventArray[i].key) === -1) {
                Countly.add_event(eventArray[i]);
            }
        }
        else {
            Countly.add_event(eventArray[i]);
        }
    }
}

module.exports = {
    haltAndClearStorage,
    sWait,
    mWait,
    lWait,
    appKey,
    getTimestampMs,
    waitFunction,
    events,
    eventArray
};