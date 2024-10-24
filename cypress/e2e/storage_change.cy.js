/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
import { triggerStorageChange } from "../support/integration_helper";

function initMain(val) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        device_id: 0, // provide number
        test_mode_eq: true,
        test_mode: true,
        debug: true,
        storage: val
    });
}

const userDetailObj = hp.userDetailObj;

describe("Multi tab storage change test", () => {
    // onStorageChange is a ram only operation
    it("Check device ID changes at a different tab are reflected correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain("localstorage");

            // numerical device ID provided at init is converted to string
            var id = Countly.get_device_id();
            expect(id).to.equal("0");

            // Check short string id is set correctly
            triggerStorageChange("YOUR_APP_KEY/cly_id", "123");
            id = Countly.get_device_id();
            expect(id).to.equal("123");

            // Check empty string id is set correctly
            triggerStorageChange("YOUR_APP_KEY/cly_id", "");
            id = Countly.get_device_id();
            expect(id).to.equal("");

            // Check null id is set correctly
            triggerStorageChange("YOUR_APP_KEY/cly_id", null);
            id = Countly.get_device_id();
            expect(id).to.equal(null);

            // Check long string numerical id is set correctly
            triggerStorageChange("YOUR_APP_KEY/cly_id", "12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            id = Countly.get_device_id();
            expect(id).to.equal("12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            Countly.user_details(userDetailObj);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(1);
                cy.check_user_details(rq[0], userDetailObj);
                expect(rq[0].device_id).to.equal("12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            });

            // Check numerical conversion to string (positive)
            triggerStorageChange("YOUR_APP_KEY/cly_id", 123);
            id = Countly.get_device_id();
            expect(id).to.equal("123");

            // Check numerical conversion to string (negative)
            triggerStorageChange("YOUR_APP_KEY/cly_id", -123);
            id = Countly.get_device_id();
            expect(id).to.equal("-123");

            // Check numerical conversion to string (0)
            triggerStorageChange("YOUR_APP_KEY/cly_id", 0);
            id = Countly.get_device_id();
            expect(id).to.equal("0");

            // Check numerical conversion to string (0)
            triggerStorageChange("YOUR_APP_KEY/cly_id", "{}");
            id = Countly.get_device_id();
            expect(id).to.equal("{}");
        });
    });
    it("Check in multi instance scenarions device ID assigned correctly", () => {
        hp.haltAndClearStorage(() => {
            let firstIns = Countly.init({
                app_key: "YOUR_APP_KEY1",
                url: "https://your.domain.count.ly",
                device_id: 0,
                test_mode_eq: true,
                test_mode: true,
                debug: true,
                storage: "localstorage"
            });
            let secondIns = Countly.init({
                app_key: "YOUR_APP_KEY2",
                url: "https://your.domain.count.ly",
                device_id: -1,
                test_mode_eq: true,
                test_mode: true,
                debug: false,
                storage: "localstorage"
            });

            // numerical device ID provided at init is converted to string
            var id1 = firstIns.get_device_id();
            var id2 = secondIns.get_device_id();
            expect(id1).to.equal("0");
            expect(id2).to.equal("-1");

            // Check long string numerical id is set correctly
            triggerStorageChange("YOUR_APP_KEY1/cly_id", "12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            id1 = firstIns.get_device_id();
            id2 = secondIns.get_device_id();
            expect(id1).to.equal("12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            expect(id2).to.equal("-1");

            // Check ID in request queue is set correctly for the correct instance
            firstIns.user_details(userDetailObj);
            cy.fetch_local_request_queue("YOUR_APP_KEY1").then((rq) => {
                expect(rq.length).to.equal(1);
                cy.check_user_details(rq[0], userDetailObj, undefined, "YOUR_APP_KEY1");
                expect(rq[0].device_id).to.equal("12345678901234567890123456789012345678901234567890123456789012345678901234567890");
            });
            secondIns.user_details(userDetailObj);
            cy.fetch_local_request_queue("YOUR_APP_KEY2").then((rq) => {
                expect(rq.length).to.equal(1);
                cy.check_user_details(rq[0], userDetailObj, undefined, "YOUR_APP_KEY2");
                expect(rq[0].device_id).to.equal("-1");
            });

            firstIns = null;
            secondIns = null;
        });
    });
});
