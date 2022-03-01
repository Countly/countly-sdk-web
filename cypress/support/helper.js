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
        cy.clearLocalStorage().then(() => {
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

/**
 *  returns a customized init object
 * @param {Array} specs - an array of strings that corresponds to desired object customization values. Possible values: 
 * tests, id, offline, debug
 * @returns {Object} - final customized object 
 */
function giveInitObj(specs) {
    var basicInit = {
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly"
    };

    for (var i = 0, len = specs.length; i < len; i++) {
        switch (specs[i]) {
        case "id":
            basicInit.device_id = "a";
            break;
        case "offline":
            basicInit.offline_mode = true;
            break;
        case "debug":
            basicInit.debug = true;
            break;
        case "tests":
            basicInit.tests = true;
            break;
        default:
            break;
        }
    }
    return basicInit;
}

module.exports = {
    haltAndClearStorage,
    sWait,
    mWait,
    lWait,
    appKey,
    getTimestampMs,
    waitFunction,
    giveInitObj
};