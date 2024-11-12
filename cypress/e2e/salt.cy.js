/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");
const crypto = require('crypto');

function initMain(salt) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        debug: true,
        salt: salt
    });
}
const salt = "salt";

/**
* Tests for salt consists of:
* 1. Init without salt
* Create events and intercept the SDK requests. Request params should be normal and there should be no checksum
* 2. Init with salt
* Create events and intercept the SDK requests. Request params should be normal and there should be a checksum with length 64
* 3. Node and Web Crypto comparison
* Compare the checksums calculated by node crypto api and SDK's web crypto api for the same data. Should be equal
*/
describe("Salt Tests", () => {
    it("Init without salt", () => {
        hp.haltAndClearStorage(() => {
            initMain(null);
            var rqArray = [];
            hp.events();
            cy.intercept("GET", "**/i?**", (req) => {
                const { url } = req;
                rqArray.push(url.split("?")[1]); // get the query string
            });
            cy.wait(1000).then(() => {
                cy.log(rqArray).then(() => {
                    for (const rq of rqArray) {
                        const paramsObject = hp.turnSearchStringToObject(rq);
                        hp.check_commons(paramsObject);
                        expect(paramsObject.checksum256).to.be.not.ok;
                    }
                });
            });
        });
    });
    it("Init with salt", () => {
        hp.haltAndClearStorage(() => {
            initMain(salt);
            var rqArray = [];
            hp.events();    
            cy.intercept("GET", "**/i?**", (req) => {
                const { url } = req;
                rqArray.push(url.split("?")[1]);
            });
            cy.wait(1000).then(() => {
                cy.log(rqArray).then(() => {
                    for (const rq of rqArray) {
                        const paramsObject = hp.turnSearchStringToObject(rq);
                        hp.check_commons(paramsObject);
                        expect(paramsObject.checksum256).to.be.ok;
                        expect(paramsObject.checksum256.length).to.equal(64);
                        // TODO: directly check the checksum with the node crypto api. Will need some extra decoding logic
                    }
                });
            });
        });
    });
    it("Node and Web Crypto comparison", () => {
        const hash = sha256("text" + salt); // node crypto api
        Countly._internals.calculateChecksum("text", salt).then((hash2) => { // SDK uses web crypto api
            expect(hash2).to.equal(hash);
        });
    });
});

/**
 * Calculate sha256 hash of given data
 * @param {*} data - data to hash
 * @returns {string} - sha256 hash
 */
function sha256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}