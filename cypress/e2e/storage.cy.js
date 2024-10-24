/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain(val) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode_eq: true,
        test_mode: true,
        debug: true,
        storage: val
    });
}

const valueToStore = "value";
const key = "key";
const testArray = ["default", "cookie", "none", "localstorage", "randomValue"];

for (let i = 0; i < 5; i++) {
    const flag = testArray[i];
    const isCookie = flag === "cookie";
    const isLocal = flag === "localstorage";
    const isNone = flag === "none";

    describe("Storage tests, storage: " + flag, () => {
        // for everything at default
        describe("basic setting", () => {
            it("Checks if setValueInStorage function stores a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore);
                    cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                        if (isCookie) {
                            expect(value).to.equal(null);
                            expect(document.cookie).to.include(`${hp.appKey}/${key}=${valueToStore}`);
                        }
                        else if (isNone) {
                            expect(value).to.equal(null);
                            expect(document.cookie).to.equal("__cypress.initial=true"); // since cypress 13.6
                        }
                        else {
                            expect(value).to.equal(valueToStore);
                        }
                    });
                });
            });
            it("Checks if getValueFromStorage function gets a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    if (isNone) {
                        expect(document.cookie).to.equal("__cypress.initial=true");  // since cypress 13.6
                    }
                    Countly._internals.setValueInStorage(key, valueToStore);
                    expect(isNone ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key));
                });
            });
            it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    expect(isNone ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key));
                });
            });
            it("Checks if removeValueFromStorage function removes a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    if (isNone) {
                        expect(document.cookie).to.equal("__cypress.initial=true"); // since cypress 13.6
                    }
                    Countly._internals.setValueInStorage(key, valueToStore);
                    expect(isNone ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key));
                    Countly._internals.removeValueFromStorage(key);
                    expect(isNone ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key));
                });
            });
        });

        // check basic functionality for cookies. No rawKey or useLocalstorage.
        describe("uselocalstorage: false ", () => {
            it("Checks if setValueInStorage function stores a cookie correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false);
                    cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                        expect(value).to.equal(null);
                    });
                    if (isNone || isLocal) {
                        expect(document.cookie).to.equal("__cypress.initial=true"); // since cypress 13.6
                    }
                    else {
                        expect(document.cookie).to.include(`${hp.appKey}/${key}=${valueToStore}`);
                    }
                });
            });
            it("Checks if getValueFromStorage function gets a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false);
                    if (isCookie) {
                        expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, !!isCookie));
                    }
                    expect(isNone || isLocal ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false));
                });
            });
            it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore);
                    expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, !!isCookie));
                });
            });
            it("Checks if removeValueFromStorage function removes a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false);
                    expect(isNone || isLocal ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false));
                    Countly._internals.removeValueFromStorage(key, false);
                    expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, false));
                });
            });
        });

        // check for local storage functionality with rawKey but no cookies.
        describe("useRawKey: true", () => {
            it("Checks if setValueInStorage function stores a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
                    cy.getLocalStorage(`${key}`).then((value) => {
                        if (isCookie) {
                            expect(value).to.equal(null);
                            expect(document.cookie).to.contain(`${key}=${valueToStore}`);
                        }
                        else if (isNone) {
                            expect(value).to.equal(null);
                        }
                        else {
                            expect(value).to.equal(valueToStore);
                        }
                    });
                    cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                        expect(value).to.equal(null);
                    });
                });
            });
            it("Checks if getValueFromStorage function gets a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
                    expect(isNone ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
                });
            });
            it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    expect(isNone ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
                });
            });
            it("Checks if removeValueFromStorage function removes a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, undefined, true);
                    expect(isNone ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
                    Countly._internals.removeValueFromStorage(key, undefined, true);
                    expect(isNone ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, undefined, true));
                });
            });
        });

        // check for cookies functionality with rawKey but no uselocalstorage.
        describe("uselocalstorage: false, useRawKey: true", () => {
            it("Checks if setValueInStorage function stores a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false, true);
                    cy.getLocalStorage(`${key}`).then((value) => {
                        expect(value).to.equal(null);
                    });
                    cy.getLocalStorage(`${hp.appKey}/${key}`).then((value) => {
                        expect(value).to.equal(null);
                    });
                    if (isNone || isLocal) {
                        expect(document.cookie).to.include("");
                    }
                    else {
                        expect(document.cookie).to.include(`${key}=${valueToStore}`);
                    }
                });
            });
            it("Checks if getValueFromStorage function gets a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false, true);
                    expect(isNone || isLocal ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false, true));
                    expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, false));
                });
            });
            it("Checks if getValueFromStorage function can not get a value if it does not exist", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, false, true));
                });
            });
            it("Checks if removeValueFromStorage function removes a value correctly", () => {
                hp.haltAndClearStorage(() => {
                    initMain(flag);
                    Countly._internals.setValueInStorage(key, valueToStore, false, true);
                    expect(isNone || isLocal ? undefined : valueToStore).to.equal(Countly._internals.getValueFromStorage(key, false, true));
                    Countly._internals.removeValueFromStorage(key, false, true);
                    expect(isNone || isLocal ? undefined : null).to.equal(Countly._internals.getValueFromStorage(key, false, true));
                });
            });
        });
    });
    document.cookie = ""; // clear cookies
}