/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");

function initMain(clear) {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        debug: true,
        test_mode: true,
        clear_stored_id: clear
    });
}

function event(number) {
    return {
        key: `event_${number}`,
        segmentation: {
            id: number
        }
    };
};


// All the tests below checks if the functions are working correctly
// Currently tests for 'beforeunload' and 'unload' events has to be done manually by using the throttling option of the browser
describe("Test Countly.q related methods and processes", () => {
    // For this tests we disable the internal heatbeat and use processAsyncQueue and sendEventsForced
    // So we are able to test if those functions work as intented:
    // processAsyncQueue should send events from .q to event queue
    // sendEventsForced should send events from event queue to request queue (it also calls processAsyncQueue)
    it("Check processAsyncQueue and sendEventsForced works as expected", () => {
        hp.haltAndClearStorage(() => {
            // Disable heartbeat and init the SDK
            Countly.noHeartBeat = true;
            initMain();
            cy.wait(1000);

            // Check that the .q is empty
            expect(Countly.q.length).to.equal(0);

            // Add 4 events to the .q
            Countly.q.push(['track_errors']); // adding this as calling it during init used to cause an error (at v23.12.5)
            Countly.q.push(['add_event', event(1)]);
            Countly.q.push(['add_event', event(2)]);
            Countly.q.push(['add_event', event(3)]);
            Countly.q.push(['add_event', event(4)]);
            // Check that the .q has 4 events
            expect(Countly.q.length).to.equal(5);

            cy.fetch_local_event_queue().then((rq) => {
                // Check that events are still in .q
                expect(Countly.q.length).to.equal(5);

                // Check that the event queue is empty
                expect(rq.length).to.equal(0);

                // Process the .q (should send things to the event queue)
                Countly._internals.processAsyncQueue();

                // Check that the .q is empty
                expect(Countly.q.length).to.equal(0);

                cy.fetch_local_request_queue().then((rq) => {
                    // Check that nothing sent to request queue
                    expect(rq.length).to.equal(0);
                    cy.fetch_local_event_queue().then((eq) => {
                        // Check that events are now in event queue
                        expect(eq.length).to.equal(4);

                        // Send events from event queue to request queue
                        Countly._internals.sendEventsForced();
                        cy.fetch_local_event_queue().then((eq) => {
                            // Check that event queue is empty
                            expect(eq.length).to.equal(0);
                            cy.fetch_local_request_queue().then((rq) => {
                                // Check that events are now in request queue
                                expect(rq.length).to.equal(1);
                                const eventsArray = JSON.parse(rq[0].events);
                                expect(eventsArray[0].key).to.equal("event_1");
                                expect(eventsArray[1].key).to.equal("event_2");
                                expect(eventsArray[2].key).to.equal("event_3");
                                expect(eventsArray[3].key).to.equal("event_4");
                            });
                        });
                    });
                });
            });
        });
    });
    //This test is same with the ones above but this time we use change_id to trigger processAsyncQueue
    it('Check changing device ID without merge empties the .q', () => {
        hp.haltAndClearStorage(() => {
            // Disable heartbeat and init the SDK
            Countly.noHeartBeat = true;
            Countly.q = [];
            initMain();
            cy.wait(1000);

            // Check that the .q is empty
            expect(Countly.q.length).to.equal(0);

            // Add 4 events to the .q
            Countly.q.push(['add_event', event(1)]);
            Countly.q.push(['add_event', event(2)]);
            Countly.q.push(['add_event', event(3)]);
            Countly.q.push(['add_event', event(4)]);
            // Check that the .q has 4 events
            expect(Countly.q.length).to.equal(4);

            cy.fetch_local_event_queue().then((rq) => {
                // Check that the event queue is empty
                expect(rq.length).to.equal(0);

                // Check that events are still in .q
                expect(Countly.q.length).to.equal(4);

                // Trigger processAsyncQueue by changing device ID without merge
                Countly.change_id("new_user_id", false);

                // Check that the .q is empty
                expect(Countly.q.length).to.equal(0);
                cy.fetch_local_event_queue().then((eq) => {
                    // Check that the event queue was flushed for the previous device ID
                    expect(eq.length).to.equal(0);
                    cy.fetch_local_request_queue().then((rq) => {
                        // Check that events are now in request queue (no session for the new device ID, as none was running)
                        expect(rq.length).to.equal(1);
                        const eventsArray = JSON.parse(rq[0].events);
                        expect(eventsArray[0].key).to.equal("event_1");
                        expect(eventsArray[1].key).to.equal("event_2");
                        expect(eventsArray[2].key).to.equal("event_3");
                        expect(eventsArray[3].key).to.equal("event_4");
                    });
                });
            });
        });
    });
    // This test checks if calling user_details triggers processAsyncQueue (it sends events from .q to event queue and then to request queue)
    it('Check sending user details empties .q', () => {
        hp.haltAndClearStorage(() => {
            // Disable heartbeat and init the SDK
            Countly.noHeartBeat = true;
            Countly.q = [];
            initMain();
            cy.wait(1000);

            // Check that the .q is empty
            expect(Countly.q.length).to.equal(0);

            // Add 4 events to the .q
            Countly.q.push(['add_event', event(1)]);
            Countly.q.push(['add_event', event(2)]);
            Countly.q.push(['add_event', event(3)]);
            Countly.q.push(['add_event', event(4)]);
            // Check that the .q has 4 events
            expect(Countly.q.length).to.equal(4);

            cy.fetch_local_event_queue().then((rq) => {
                // Check that the event queue is empty
                expect(rq.length).to.equal(0);

                // Check that events are still in .q
                expect(Countly.q.length).to.equal(4);

                // Trigger processAsyncQueue by adding user details
                Countly.user_details({name: "test_user"});

                // Check that the .q is empty
                expect(Countly.q.length).to.equal(0);
                cy.fetch_local_event_queue().then((eq) => {
                    // Check that event queue is empty
                    expect(eq.length).to.equal(0);
                    cy.fetch_local_request_queue().then((rq) => {
                        // Check that events are now in request queue (second request is user details)
                        expect(rq.length).to.equal(2);
                        const eventsArray = JSON.parse(rq[0].events);
                        expect(eventsArray[0].key).to.equal("event_1");
                        expect(eventsArray[1].key).to.equal("event_2");
                        expect(eventsArray[2].key).to.equal("event_3");
                        expect(eventsArray[3].key).to.equal("event_4");
                        // check user details
                        const user_details = JSON.parse(rq[1].user_details);
                        expect(user_details.name).to.equal("test_user");
                    });
                });
            });
        });
    });
    // This Test checks if calling userData.save triggers processAsyncQueue (it sends events from .q to event queue and then to request queue)
    it('Check sending custom user info empties .q', () => {
        hp.haltAndClearStorage(() => {
            // Disable heartbeat and init the SDK
            Countly.noHeartBeat = true;
            Countly.q = [];
            initMain();
            cy.wait(1000);

            // Check that the .q is empty
            expect(Countly.q.length).to.equal(0);

            // Add 4 events to the .q
            Countly.q.push(['add_event', event(1)]);
            Countly.q.push(['add_event', event(2)]);
            Countly.q.push(['add_event', event(3)]);
            Countly.q.push(['add_event', event(4)]);
            // Check that the .q has 4 events
            expect(Countly.q.length).to.equal(4);

            cy.fetch_local_event_queue().then((rq) => {
                // Check that the event queue is empty
                expect(rq.length).to.equal(0);

                // Check that events are still in .q
                expect(Countly.q.length).to.equal(4);

                // Trigger processAsyncQueue by saving UserData
                Countly.userData.set("name", "test_user");
                Countly.userData.save();

                // Check that the .q is empty
                expect(Countly.q.length).to.equal(0);
                cy.fetch_local_event_queue().then((eq) => {
                    // Check that event queue is empty
                    expect(eq.length).to.equal(0);
                    cy.fetch_local_request_queue().then((rq) => {
                        // Check that events are now in request queue (second request is user details)
                        expect(rq.length).to.equal(2);
                        const eventsArray = JSON.parse(rq[0].events);
                        expect(eventsArray[0].key).to.equal("event_1");
                        expect(eventsArray[1].key).to.equal("event_2");
                        expect(eventsArray[2].key).to.equal("event_3");
                        expect(eventsArray[3].key).to.equal("event_4");
                        // check user data
                        const user_details = JSON.parse(rq[1].user_details);
                        expect(user_details.custom.name).to.equal("test_user");
                    });
                });
            });
        });
    });
    // This test check if the heartbeat is processing the .q (executes processAsyncQueue)
    it('Check if heatbeat is processing .q', () => {
        hp.haltAndClearStorage(() => {
            // init the SDK
            Countly.q = [];
            initMain();

            // Check that the .q is empty
            expect(Countly.q.length).to.equal(0);
            cy.fetch_local_event_queue().then((eq) => {
                // Check that the event queue is empty
                expect(eq.length).to.equal(0);
                cy.fetch_local_request_queue().then((rq) => {
                    // Check that the request queue is empty
                    expect(rq.length).to.equal(0);
                    // Add 4 events to the .q
                    Countly.q.push(['add_event', event(1)]);
                    Countly.q.push(['add_event', event(2)]);
                    Countly.q.push(['add_event', event(3)]);
                    Countly.q.push(['add_event', event(4)]);
                    // Check that the .q has 4 events
                    expect(Countly.q.length).to.equal(4);
                    // Wait for heartBeat to process the .q
                    cy.wait(1500).then(() => {
                    // Check that the .q is empty
                    expect(Countly.q.length).to.equal(0);
                    cy.fetch_local_event_queue().then((eq) => {
                        // Check that event queue is empty as all must be in request queue
                        expect(eq.length).to.equal(0);
                        cy.fetch_local_request_queue().then((rq) => {
                            // Check that events are now in request queue
                            expect(rq.length).to.equal(1);
                            const eventsArray = JSON.parse(rq[0].events);
                            expect(eventsArray[0].key).to.equal("event_1");
                            expect(eventsArray[1].key).to.equal("event_2");
                            expect(eventsArray[2].key).to.equal("event_3");
                            expect(eventsArray[3].key).to.equal("event_4");
                        });
                    });
                    });
                });
            });
        });
    });

    it("Runs a queued call meant for the main instance on the main instance, also when another instance works through Countly.q first", () => {
        cy.visit("./cypress/fixtures/async_queue_instances.html");
        cy.wait(2000).then(() => {
            cy.fetch_local_request_queue("SECOND_APP_KEY").then((rq) => {
                var secondKeys = rq.filter((r) => r.events).reduce((all, r) => all.concat(JSON.parse(r.events).map((e) => e.key)), []);
                expect(secondKeys, "events recorded by the second instance").to.deep.equal(["for_second"]);
                expect(rq.filter((r) => r.user_details).length, "the second instance's user details").to.equal(1);
                cy.fetch_local_event_queue("MAIN_APP_KEY").then((eq) => {
                    expect(eq.map((e) => e.key), "events recorded by the main instance, in their order").to.deep.equal(["for_main", "for_main_by_key"]);
                });
            });
        });
    });

    it("Leaves Countly.q to the next instance once an instance is halted", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.halt();
            // the next instance runs no heartbeat, so only a halted instance could take the queued call
            Countly.noHeartBeat = true;
            initMain();
            Countly.q.push(["add_event", event(1)]);
            cy.wait(1500).then(() => {
                expect(Countly.q.length, "calls still waiting in Countly.q").to.equal(1);
            });
        });
    });

    it("Keeps processing Countly.q and the heartbeat after a queued call throws", () => {
        // a halted instance of an earlier test keeps its heartbeat and can take the queued calls, so a fresh page is used
        cy.visit("./cypress/fixtures/async_queue_throw.html");
        cy.wait(3000).then(() => {
            cy.fetch_local_request_queue().then((rq) => {
                var keys = rq.filter((r) => r.events).reduce((all, r) => all.concat(JSON.parse(r.events).map((e) => e.key)), []);
                expect(keys, "the call queued after the throwing ones still ran").to.include("event_1");
                expect(keys, "the heartbeat kept moving events on").to.include("event_2");
            });
        });
    });

});