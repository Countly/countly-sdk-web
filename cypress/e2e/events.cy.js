/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        session_update: 3,
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}
// an event object to use 
const eventObj = {
    key: "in_app_purchase",
    count: 3,
    sum: 2.97,
    dur: 1000,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti"
    }
};
// a timed event object
const timedEventObj = {
    key: "timed",
    count: 1,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti"
    }
};

const longStringName = "LongStringNameLongStringNameLongStringNameLongStringNameLongStringNameLongStringNameLongStringNameLongStringName";

// a timed event object with long string key
const timedEventObjLong = {
    key: longStringName,
    count: 1,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti"
    }
};

describe("Events tests ", () => {
    it("Checks if adding events works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
        });
    });
    it("Checks if timed events works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event("timed");
            // wait for a while
            cy.wait(3000).then(() => {
                cy.fetch_local_event_queue().then((eq) => {
                    // there should be nothing in the queue
                    expect(eq.length).to.equal(0);
                });
                cy.wait(1000).then(() => {
                    // end the event and check duration
                    Countly.end_event(timedEventObj);
                    cy.fetch_local_event_queue().then((eq) => {
                        expect(eq.length).to.equal(1);
                        // we waited 3000 milliseconds so duration must be 3 to 4
                        cy.check_event(eq[0], timedEventObj, 4, false);
                    });
                });
            });
        });
    });
    it("Checks if timed events works with long string", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event(longStringName);
            // wait for a while
            cy.wait(3000).then(() => {
                cy.fetch_local_event_queue().then((eq) => {
                    // there should be nothing in the queue
                    expect(eq.length).to.equal(0);
                });
                cy.wait(1000).then(() => {
                    // end the event and check duration
                    Countly.end_event(timedEventObjLong);
                    cy.fetch_local_event_queue().then((eq) => {
                        expect(eq.length).to.equal(1);
                        // we waited 3000 milliseconds so duration must be 3 to 4
                        cy.check_event(eq[0], timedEventObjLong, 4, false);
                    });
                });
            });
        });
    });
    it("Checks if canceling timed events works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event("timed");
            // wait for a while
            cy.wait(1000).then(() => {
                const didCancel = Countly.cancel_event("timed");
                expect(didCancel).to.be.true;
                Countly.end_event(timedEventObj);
                cy.fetch_local_event_queue().then((eq) => {
                    // queue should be empty and end_event should not create an event
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
    it("Checks if canceling timed events works with long string key", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event(longStringName);
            // wait for a while
            cy.wait(1000).then(() => {
                const didCancel = Countly.cancel_event(longStringName);
                expect(didCancel).to.be.true;
                Countly.end_event(timedEventObjLong);
                cy.fetch_local_event_queue().then((eq) => {
                    // queue should be empty and end_event should not create an event
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
    it("Checks if canceling timed events with wrong key does nothing", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event("timed");
            // wait for a while
            cy.wait(3000).then(() => {
                const didCancel = Countly.cancel_event("false_key");
                expect(didCancel).to.be.false; // did not cancel as the key was wrong
                Countly.end_event(timedEventObj);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(1);
                    // we waited 3000 milliseconds so duration must be 3 to 4
                    cy.check_event(eq[0], timedEventObj, 3, false);
                });
            });
        });
    });
    it("Checks if canceling timed events with empty key does nothing", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event("timed");
            // wait for a while
            cy.wait(3000).then(() => {
                const didCancel = Countly.cancel_event();
                expect(didCancel).to.be.false; // did not cancel as the key was wrong
                Countly.end_event(timedEventObj);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(1);
                    // we waited 3000 milliseconds so duration must be 3 to 4
                    cy.check_event(eq[0], timedEventObj, 3, false);
                });
            });
        });
    });
    it("Checks if canceling non existent timed events with false key does nothing", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event();
            // wait for a while
            cy.wait(3000).then(() => {
                const didCancel = Countly.cancel_event("false_key");
                expect(didCancel).to.be.false; // did not cancel as the key was wrong
                Countly.end_event();
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
    it("Checks if canceling timed events with wrong key does nothing with Long string key", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            // start the timer
            Countly.start_event(longStringName);
            // wait for a while
            cy.wait(3000).then(() => {
                const didCancel = Countly.cancel_event("false_key");
                expect(didCancel).to.be.false; // did not cancel as the key was wrong
                Countly.end_event(timedEventObjLong);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(1);
                    // we waited 3000 milliseconds so duration must be 3 to 4
                    cy.check_event(eq[0], timedEventObjLong, 3, false);
                });
            });
        });
    });
    // JSON cannot encode a BigInt (an ID from an API that returns 64-bit numbers) or an object that refers back to
    // itself (a React click event carries view: window)
    it("Keeps sending events after an event with a value JSON cannot encode", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                fake_request_handler: (req) => {
                    sent.push(req.params);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            var loop = { id: 7 };
            loop.self = loop;
            Countly.add_event({ key: "before" });
            Countly.add_event({ key: "order", segmentation: { order_id: BigInt("12345678901234567890"), loop: loop, click: { type: "click", view: window }, plan: "pro" } });
            Countly.add_event({ key: "refund", sum: BigInt(5) });
            Countly.add_event({ key: "after" });
            cy.wait(1500).then(() => {
                var events = sent.filter((p) => p.events).reduce((all, p) => all.concat(JSON.parse(p.events)), []);
                expect(events.map((e) => e.key)).to.deep.equal(["before", "order", "after"]);
                expect(events[1].segmentation).to.deep.equal({ order_id: "12345678901234567890", plan: "pro" });
            });
        });
    });
    it("Keeps recording events after a user property with a value JSON cannot encode", () => {
        hp.haltAndClearStorage(() => {
            var sent = [];
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                fake_request_handler: (req) => {
                    sent.push(req.params);
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            var loop = { id: 7 };
            loop.self = loop;
            Countly.userData.set("account_id", BigInt("12345678901234567890"));
            Countly.userData.set("profile", loop);
            Countly.userData.push("order_ids", BigInt("98765432109876543210"));
            Countly.userData.set_once("first_plan", "pro");
            Countly.add_event({ key: "after_profile_change" });
            cy.wait(1500).then(() => {
                var events = sent.filter((p) => p.events).reduce((all, p) => all.concat(JSON.parse(p.events)), []);
                expect(events.map((e) => e.key)).to.deep.equal(["after_profile_change"]);
                var details = sent.filter((p) => p.user_details).map((p) => JSON.parse(p.user_details));
                expect(details).to.deep.equal([{ custom: { account_id: "12345678901234567890", order_ids: { $push: ["98765432109876543210"] }, first_plan: { $setOnce: "pro" } } }]);
            });
        });
    });
});
