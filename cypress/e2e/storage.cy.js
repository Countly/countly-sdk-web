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
}
describe("Cookie storage contents", () => {
    it("keeps a semicolon in a stored value", () => {
        hp.haltAndClearStorage(() => {
            initMain("cookie");
            var queue = [{ key: "semi", count: 1, segmentation: { v: "a;b" } }];
            Countly._internals.setValueInStorage("cly_event", queue);
            expect(Countly._internals.getValueFromStorage("cly_event")).to.deep.equal(queue);
        });
    });

    it("keeps a device ID stored by an earlier SDK version as it was", () => {
        hp.haltAndClearStorage(() => {
            // earlier versions wrote cookie values unencoded, so this ID is stored with a literal %40
            document.cookie = hp.appKey + "/cly_id=user%40example.com; path=/";
            document.cookie = hp.appKey + "/cly_id_type=0; path=/";
            initMain("cookie");
            expect(Countly.get_device_id()).to.equal("user%40example.com");
            expect(Countly.get_device_id_type()).to.equal(Countly.DeviceIdType.DEVELOPER_SUPPLIED);
        });
    });

    it("keeps a value stored by an earlier SDK version as it was", () => {
        hp.haltAndClearStorage(() => {
            document.cookie = hp.appKey + "/cly_event=[{\"key\":\"legacy\",\"count\":1,\"segmentation\":{\"note\":\"100%25\"}}]; path=/";
            initMain("cookie");
            var legacy = Countly._internals.getLocalQueues().eventQ.filter((e) => e.key === "legacy");
            expect(legacy.length).to.equal(1);
            expect(legacy[0].segmentation.note).to.equal("100%25");
        });
    });

    it("writes values without a semicolon as earlier versions did, so they can still read them", () => {
        hp.haltAndClearStorage(() => {
            initMain("cookie");
            Countly._internals.setValueInStorage("cly_id", "plain-id-123");
            var queue = [{ key: "plain", count: 1, segmentation: { v: "a,b c" } }];
            Countly._internals.setValueInStorage("cly_event", queue);
            expect(document.cookie).to.contain(hp.appKey + "/cly_id=plain-id-123");
            expect(document.cookie).to.contain(hp.appKey + "/cly_event=" + JSON.stringify(queue));
        });
    });

    it("starts with an empty event queue when the stored one is not a list", () => {
        hp.haltAndClearStorage(() => {
            document.cookie = hp.appKey + "/cly_event=[{\"key\":\"semi\",\"segmentation\":{\"v\":\"a; path=/";
            initMain("cookie");
            Countly.add_event({ key: "after_a_broken_queue" });
            expect(Countly._internals.getLocalQueues().eventQ.map((e) => e.key)).to.include("after_a_broken_queue");
        });
    });

    it("keeps unsent requests across a page load", () => {
        hp.haltAndClearStorage(() => {
            initMain("cookie");
            // the first requests wait for the client hints before they reach the stored queue
            cy.wait(hp.sWait2).then(() => {
                Countly.user_details({ name: "Kept across pages" });
                Countly.halt();
                initMain("cookie");
                var kept = Countly._internals.getLocalQueues().requestQ.filter((r) => r.user_details && r.user_details.indexOf("Kept across pages") !== -1);
                expect(kept.length).to.equal(1);
            });
        });
    });
});

describe("Saved SDK behavior settings", () => {
    function initWithSettings(extra) {
        Countly.init(Object.assign({
            app_key: "YOUR_APP_KEY",
            url: "https://your.domain.count.ly",
            test_mode: true,
            test_mode_eq: true,
            debug: true,
            disable_sdk_behavior_settings_updates: true
        }, extra));
    }

    it("are not stored anywhere when storage is none", () => {
        hp.haltAndClearStorage(() => {
            initWithSettings({ storage: "none", behavior_settings: { c: { eqs: 5 } } });
            var stored = Object.keys(localStorage).filter((k) => k.indexOf("cly_config") !== -1);
            expect(stored, "saved settings in localStorage").to.deep.equal([]);
            expect(document.cookie).to.not.contain("cly_config");
        });
    });

    it("are read from the storage of the given namespace", () => {
        hp.haltAndClearStorage(() => {
            localStorage.setItem("shop/YOUR_APP_KEY/cly_config", JSON.stringify({ c: { tracking: false } }));
            initWithSettings({ namespace: "shop" });
            Countly.add_event({ key: "while_tracking_is_off" });
            expect(Countly._internals.getLocalQueues().eventQ.length, "events recorded while the saved settings turn tracking off").to.equal(0);
            expect(localStorage.getItem("YOUR_APP_KEY/cly_config"), "settings saved outside the namespace").to.equal(null);
        });
    });

    it("are read from cookies when storage is cookie", () => {
        hp.haltAndClearStorage(() => {
            document.cookie = "YOUR_APP_KEY/cly_config=" + JSON.stringify({ c: { tracking: false } }) + "; path=/";
            initWithSettings({ storage: "cookie" });
            Countly.add_event({ key: "while_tracking_is_off" });
            expect(Countly._internals.getLocalQueues().eventQ.length, "events recorded while the saved settings turn tracking off").to.equal(0);
            expect(localStorage.getItem("YOUR_APP_KEY/cly_config"), "settings saved in localStorage").to.equal(null);
        });
    });
});
