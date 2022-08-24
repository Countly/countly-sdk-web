/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1,
        test_mode: true,
        debug: true
    });
}
const valueToStore = "value";
const key = "key";

// check basic functionality for local storage. No rawKey or cookies.
describe("Storage tests, local storage ", () => {
    it("Checks if setValueInStorage function stores a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore);
            cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                expect(value).to.equal(valueToStore);
            });
        });
    });
    it("Checks if getValueFromStorage function gets a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key));
        });
    });
    it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            expect(null).to.equal(Countly._internals.getValueFromStorage(key));
        });
    });
    it("Checks if removeValueFromStorage function removes a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key));
            Countly._internals.removeValueFromStorage(key);
            expect(null).to.equal(Countly._internals.getValueFromStorage(key));
        });
    });
});

// check basic functionality for cookies. No rawKey or localstorage.
describe("Storage tests, cookies ", () => {
    it("Checks if setValueInStorage function stores a cookie correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false);
            cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                expect(value).to.equal(null);
            });
            expect(document.cookie).to.equal(`${hp.appKey}/${key}=${valueToStore}`);
        });
    });
    it("Checks if getValueFromStorage function gets a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false));
            expect(null).to.equal(Countly._internals.getValueFromStorage(key));
        });
    });
    it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key));
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, false));
        });
    });
    it("Checks if removeValueFromStorage function removes a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false));
            Countly._internals.removeValueFromStorage(key, false);
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, false));
        });
    });
});

// check for local storage functionality with rawKey but no cookies.
describe("Storage tests, local storage w/raw key", () => {
    it("Checks if setValueInStorage function stores a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
            cy.getLocalStorage(`${key}`).then((value) => {
                expect(value).to.equal(valueToStore);
            });
            cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                expect(value).to.equal(null);
            });
        });
    });
    it("Checks if getValueFromStorage function gets a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
        });
    });
    it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
        });
    });
    it("Checks if removeValueFromStorage function removes a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
            Countly._internals.removeValueFromStorage(key, undefined, true);
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
        });
    });
});

// check for cookies functionality with rawKey but no localstorage.
describe("Storage tests, cookies w/raw key", () => {
    it("Checks if setValueInStorage function stores a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false, true);
            cy.getLocalStorage(`${key}`).then((value) => {
                expect(value).to.equal(null);
            });
            cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                expect(value).to.equal(null);
            });
            expect(document.cookie).to.equal(`${key}=${valueToStore}`);
        });
    });
    it("Checks if getValueFromStorage function gets a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false, true);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false, true));
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, false));
        });
    });
    it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, false, true));
        });
    });
    it("Checks if removeValueFromStorage function removes a value correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly._internals.setValueInStorage(key, valueToStore, false, true);
            expect(valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false, true));
            Countly._internals.removeValueFromStorage(key, false, true);
            expect(null).to.equal(Countly._internals.getValueFromStorage(key, false, true));
        });
    });
});