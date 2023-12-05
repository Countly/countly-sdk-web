/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode_eq: true,
        test_mode: true
    });
}

const userDetailObj = hp.userDetailObj;

// an event object to use 
const eventObj = {
    key: "in_app_purchase",
    count: 3,
    sum: 2.97,
    dur: 300,
    segmentation: {
        app_version: "1.0",
        country: "Tahiti"
    }
};

describe("User details tests ", () => {
    it("Checks if user detail recording works (normal flow)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.user_details(userDetailObj);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(1);
                cy.check_user_details(rq[0], userDetailObj);
            });
        });
    });
    it("Checks if user detail recording works (events are flushed)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Countly.user_details(userDetailObj);
                cy.fetch_local_request_queue().then((rq) => { // events and user details must be here
                    expect(rq.length).to.equal(2);
                    cy.check_event(JSON.parse(rq[0].events)[0], eventObj, undefined, false);
                    cy.check_user_details(rq[1], userDetailObj);
                });
                cy.fetch_local_event_queue().then((eq) => { // event queue should be empty
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set("key", "value");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.equal("value");
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set, array)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set("key", ["value"]);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql(["value"]); // eql is deepequal
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (unset)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.unset("key"); // unset works by sending an empty string with the key
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.equal("");
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (set_once)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set_once("key", "value");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $setOnce: "value" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.increment("key");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: 1 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, + number )", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.increment_by("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, - number )", () => { // TODO: Investigate
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.increment_by("key", -10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: -10 }); // eql is deepequal
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (increment_by, string)", () => { // TODO: Investigate
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.increment_by("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $inc: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, + number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.multiply("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, - number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.multiply("key", -10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: -10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (multiply, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.multiply("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $mul: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (max, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.max("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $max: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (max, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.max("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $max: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (min, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.min("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $min: 10 });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (min, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.min("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $min: "10" });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.push("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $push: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.push("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $push: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push_unique, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.push_unique("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $addToSet: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (push_unique, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.push_unique("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $addToSet: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (pull, number)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.pull("key", 10);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $pull: [10] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if custom detail recording works (pull, string)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.pull("key", "10");
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(custom.key).to.eql({ $pull: ["10"] });
                    expect(Object.keys(custom).length).to.equal(1);
                });
            });
        });
    });
    it("Checks if all custom detail recording works together", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set("key", "value");
            Countly.userData.unset("key2");
            Countly.userData.set_once("key3", 1);
            Countly.userData.increment("key4");
            Countly.userData.increment_by("key5", 2);
            Countly.userData.multiply("key6", 3);
            Countly.userData.max("key7", 4);
            Countly.userData.min("key8", 5);
            Countly.userData.push("key9", 6);
            Countly.userData.push_unique("key10", 7);
            Countly.userData.pull("key11", 8);
            Countly.userData.save();
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(11);
                    expect(custom.key).to.equal("value");
                    expect(custom.key2).to.equal("");
                    expect(custom.key3).to.eql({ $setOnce: 1 });
                    expect(custom.key4).to.eql({ $inc: 1 });
                    expect(custom.key5).to.eql({ $inc: 2 });
                    expect(custom.key6).to.eql({ $mul: 3 });
                    expect(custom.key7).to.eql({ $max: 4 });
                    expect(custom.key8).to.eql({ $min: 5 });
                    expect(custom.key9).to.eql({ $push: [6] });
                    expect(custom.key10).to.eql({ $addToSet: [7] });
                    expect(custom.key11).to.eql({ $pull: [8] });
                });
            });
        });
    });
    it("Checks if all custom detail recording works together (early save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set("key", "value");
            Countly.userData.unset("key2");
            Countly.userData.set_once("key3", 1);
            Countly.userData.increment("key4");
            Countly.userData.save();
            Countly.userData.increment_by("key5", 2);
            Countly.userData.multiply("key6", 3);
            Countly.userData.max("key7", 4);
            Countly.userData.min("key8", 5);
            Countly.userData.push("key9", 6);
            Countly.userData.push_unique("key10", 7);
            Countly.userData.pull("key11", 8);
            hp.waitFunction(hp.getTimestampMs(), 300, 100, () => {
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(1);
                    const custom = JSON.parse(rq[0].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(4);
                    expect(custom.key).to.equal("value");
                    expect(custom.key2).to.equal("");
                    expect(custom.key3).to.eql({ $setOnce: 1 });
                    expect(custom.key4).to.eql({ $inc: 1 });
                });
            });
        });
    });
    it("Checks if all custom detail recording wont works without save", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.userData.set("key", "value");
            Countly.userData.unset("key2");
            Countly.userData.set_once("key3", 1);
            Countly.userData.increment("key4");
            Countly.userData.increment_by("key5", 2);
            Countly.userData.multiply("key6", 3);
            Countly.userData.max("key7", 4);
            Countly.userData.min("key8", 5);
            Countly.userData.push("key9", 6);
            Countly.userData.push_unique("key10", 7);
            Countly.userData.pull("key11", 8);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(0);
            });
        });
    });
    it("Checks all custom detail recording, event flush (with save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Countly.userData.set("key", "value");
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
                cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                    expect(eq.length).to.equal(1);
                    cy.check_event(eq[0], eventObj, undefined, false);
                });
            });
        });
    });
    it("Checks all custom detail recording, event flush (without save)", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_event(eventObj);
            cy.fetch_local_event_queue().then((eq) => { // event should be in event queue
                expect(eq.length).to.equal(1);
                cy.check_event(eq[0], eventObj, undefined, false);
            });
            cy.wait(300).then(() => {
                Countly.userData.set("key", "value");
                Countly.userData.save();

                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(2);
                    cy.check_event(JSON.parse(rq[0].events)[0], eventObj, undefined, false);
                    const custom = JSON.parse(rq[1].user_details).custom;
                    expect(Object.keys(custom).length).to.equal(1);
                    expect(custom.key).to.equal("value");
                });
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(0);
                });
            });
        });
    });
});
