var Countly = require("../../lib/countly");

const appKey = "YOUR_APP_KEY";
const sWait = 25;
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
module.exports = {
    haltAndClearStorage,
    sWait,
    mWait,
    lWait,
    appKey
};