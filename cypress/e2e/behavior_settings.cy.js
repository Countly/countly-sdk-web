/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initWithBehavior(settings) {
    Countly.init({
        app_key: hp.appKey,
        url: "https://example.count.ly",
        debug: true,
        test_mode: true,
        behavior_settings: settings
    });
}

function collectEventKeysFromQueues() {
    return cy.fetch_local_request_queue().then((rq) => {
        const reqEvents = rq
            .filter((r) => r.events)
            .flatMap((r) => JSON.parse(r.events));
        return cy.fetch_local_event_queue().then((eq) => {
            return reqEvents.concat(eq || []);
        });
    });
}

describe("Behavior settings filters", () => {
    it("event blacklist blocks", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { eb: ["blocked"] } });
            Countly.add_event({ key: "blocked", count: 1 });
            Countly.add_event({ key: "other", count: 1 });
            Countly.add_event({ key: "kept", count: 1 });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                const keys = events.map((e) => e.key);
                expect(keys).to.include("other");
                expect(keys).to.include("kept");
                expect(keys).to.not.include("blocked");
            });
        });
    });

    it("event whitelist allows only listed", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { ew: ["kept"] } });
            Countly.add_event({ key: "blocked", count: 1 });
            Countly.add_event({ key: "other", count: 1 });
            Countly.add_event({ key: "kept", count: 1 });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                const keys = events.map((e) => e.key);
                expect(keys).to.include("kept");
                expect(keys).to.not.include("blocked");
                expect(keys).to.not.include("other");
            });
        });
    });

    it("global segmentation blacklist/whitelist applied", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { sb: ["secret"] } });
            Countly.add_event({ key: "segtest", count: 1, segmentation: { secret: "x", keep: "y", other: "z" } });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                expect(events.length).to.be.greaterThan(0);
                const seg = events[0].segmentation;
                expect(seg).to.have.property("keep", "y");
                expect(seg).to.not.have.property("secret");
                expect(seg).to.have.property("other", "z");
            });
        });
    });

    it("global segmentation whitelist applied", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { sw: ["keep"] } });
            Countly.add_event({ key: "segtest", count: 1, segmentation: { secret: "x", keep: "y", other: "z" } });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                expect(events.length).to.be.greaterThan(0);
                const seg = events[0].segmentation;
                expect(seg).to.have.property("keep", "y");
                expect(seg).to.not.have.property("secret");
                expect(seg).to.not.have.property("other");
            });
        });
    });

    it("event-specific segmentation filters respected", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { esb: { purchase: ["card"] } } });
            Countly.add_event({ key: "purchase", count: 1, segmentation: { card: "1111", keep: "ok", drop: "no" } });
            Countly.add_event({ key: "not-purchase", count: 1, segmentation: { card: "1111", keep: "ok", drop: "no" } });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                const seg = events.find((e) => e.key === "purchase").segmentation;
                expect(seg).to.have.property("keep", "ok");
                expect(seg).to.not.have.property("card");
                expect(seg).to.have.property("drop", "no");
                const otherSeg = events.find((e) => e.key === "not-purchase").segmentation;
                expect(otherSeg).to.have.property("card", "1111");
                expect(otherSeg).to.have.property("keep", "ok");
                expect(otherSeg).to.have.property("drop", "no");
            });
        });
    });

    it("event-specific segmentation whitelist respected", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { esw: { purchase: ["keep"] } } });
            Countly.add_event({ key: "purchase", count: 1, segmentation: { card: "1111", keep: "ok", drop: "no" } });
            Countly.add_event({ key: "not-purchase", count: 1, segmentation: { card: "1111", keep: "ok", drop: "no" } });
            cy.wait(200).then(() => collectEventKeysFromQueues()).then((events) => {
                const seg = events.find((e) => e.key === "purchase").segmentation;
                expect(seg).to.have.property("keep", "ok");
                expect(seg).to.not.have.property("card");
                expect(seg).to.not.have.property("drop");
                const otherSeg = events.find((e) => e.key === "not-purchase").segmentation;
                expect(otherSeg).to.have.property("card", "1111");
                expect(otherSeg).to.have.property("keep", "ok");
                expect(otherSeg).to.have.property("drop", "no");
            });
        });
    });

    it("user property whitelist applied", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { upw: ["allowed", "name"] } });
            Countly.user_details({ custom: { blocked: "x", allowed: "y", other: "z" }, name: "John", age: 30 });
            cy.wait(200).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    const userReq = rq.find((r) => r.user_details);
                    expect(userReq, "user_details request present").to.exist;
                    const details = JSON.parse(userReq.user_details);
                    expect(details.custom).to.have.property("allowed", "y");
                    expect(details.custom).to.not.have.property("blocked");
                    expect(details.custom).to.not.have.property("other");
                    expect(details).to.have.property("name", "John");
                    expect(details).to.not.have.property("age");
                });
            });
        });
    });
    it("user property blacklist applied", () => {
        hp.haltAndClearStorage(() => {
            initWithBehavior({ c: { upb: ["blocked", "age"] } });
            Countly.user_details({ custom: { blocked: "x", allowed: "y", other: "z" }, name: "John", age: 30 });
            cy.wait(200).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    const userReq = rq.find((r) => r.user_details);
                    expect(userReq, "user_details request present").to.exist;
                    const details = JSON.parse(userReq.user_details);
                    expect(details.custom).to.have.property("allowed", "y");
                    expect(details.custom).to.have.property("other", "z");
                    expect(details.custom).to.not.have.property("blocked");
                    expect(details).to.have.property("name", "John");
                    expect(details).to.not.have.property("age");
                });
            });
        });
    });
});

describe("Journey trigger behavior settings", () => {
    it("journey trigger flushes event without heartbeat", () => {
        hp.haltAndClearStorage(() => {
            Countly.noHeartBeat = true;
            initWithBehavior({ c: { jte: ["journey"] } });
            Countly.add_event({ key: "journey", count: 1 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(0); // moved out by journey trigger
            });
            cy.fetch_local_request_queue().then((rq) => {
                const eventReq = rq.find((r) => r.events);
                expect(eventReq).to.exist;
                const events = JSON.parse(eventReq.events);
                expect(events.map((e) => e.key)).to.include("journey");
                cy.wait(2000).then(() => {
                    var requests = Countly._internals.testingGetRequests();
                    expect(requests.length).to.equal(3); // hc and sc and journey event
                    const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request")); // journey event
                    const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                    const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                    const contentReq = requests.find((r) => r.functionName.includes("sendContentRequest"));
                    expect(healthReq).to.exist;
                    expect(sbsReq).to.exist;
                    expect(journeyReq).to.exist;
                    expect(contentReq).to.be.undefined; // as journey request will fail
                });
            });
        });
    });

    it("non-journey event stays queued when heartbeat disabled", () => {
        hp.haltAndClearStorage(() => {
            Countly.noHeartBeat = true;
            initWithBehavior({});
            Countly.add_event({ key: "regular", count: 1 });
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.map((e) => e.key)).to.include("regular");
            });
            cy.fetch_local_request_queue().then((rq) => {
                const eventReq = rq.find((r) => r.events);
                expect(eventReq).to.be.undefined;
                cy.wait(1500).then(() => {
                    var requests = Countly._internals.testingGetRequests();
                    expect(requests.length).to.equal(2);
                    const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request")); // no trigger event
                    const contentReq = requests.find((r) => r.functionName.includes("sendContentRequest"));
                    expect(journeyReq).to.be.undefined;
                    expect(contentReq).to.be.undefined;
                });
            });
        });
    });

    it("journey trigger sends content request after event request succeeds", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    // Return success for all requests
                    if (req.url.includes("/o/sdk/content")) {
                        return { status: 200, responseText: '{"html":"", "geo":null}' }; // will be seen as failure
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["journey_test"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "journey_test", count: 1 });
            
            cy.wait(4000).then(() => {
                var requests = fakeServer.requests;
                expect(requests.length).to.equal(6); // hc and sc and journey event
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request")); // journey event
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const contentReq = requests.find((r) => r.functionName.includes("sendContentRequest"));
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(contentReqs.length).to.equal(3); // 3 attempts due to failure (empty content)
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReq).to.exist;
                expect(requests.indexOf(contentReq)).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("journey trigger retries content request up to 3 times on failure", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        // Always fail content requests with 500
                        return { status: 500, responseText: 'Server Error' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["retry_test"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "retry_test", count: 1 });
            
            // Wait for retries (3 attempts with 1 second between = ~2 seconds, plus buffer)
            cy.wait(3000).then(() => {
                var requests = fakeServer.requests;
                // Expected: hc + sc + journey_event + 3 content retries = 6
                expect(requests.length).to.equal(6);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(3); // initial + 2 retries
                // Verify content requests come after journey request
                expect(requests.indexOf(contentReqs[0])).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("journey trigger stops retrying after successful content response", () => {
        hp.haltAndClearStorage(() => {
            var contentRequestCount = 0;
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        contentRequestCount++;
                        // Fail first request, succeed on second
                        if (contentRequestCount === 1) {
                            return { status: 500, responseText: 'Server Error' };
                        }
                        // Return valid content on second attempt
                        return { 
                            status: 200, 
                            responseText: JSON.stringify({
                                html: "https://content.test/page?param=1",
                                geo: { p: { x: 0, y: 0, w: 100, h: 100 }, l: { x: 0, y: 0, w: 100, h: 100 } }
                            })
                        };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["success_retry"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "success_retry", count: 1 });
            
            // Wait enough time that 3 retries would have happened (1 second between each)
            cy.wait(3000).then(() => {
                var requests = fakeServer.requests;
                // Expected: hc + sc + journey_event + 2 content requests (1 fail + 1 success) = 5
                expect(requests.length).to.equal(5);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(2); // first failed, second succeeded, no more retries
                // Verify content requests come after journey request
                expect(requests.indexOf(contentReqs[0])).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("journey trigger does not send content request if event request fails", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        return { status: 200, responseText: '{"html":"https://test.com", "geo":{"p":{"x":0,"y":0,"w":100,"h":100},"l":{"x":0,"y":0,"w":100,"h":100}}}' };
                    }
                    if (req.functionName === "journey_trigger_send_request") {
                        // Fail journey event request
                        return { status: 500, responseText: 'Server Error' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["fail_event"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "fail_event", count: 1 });
            
            cy.wait(2000).then(() => {
                var requests = fakeServer.requests;
                // Expected: hc + sc + journey_event (failed) = 3, no content requests
                expect(requests.length).to.equal(3);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(0); // no content request since event failed
            });
        });
    });

    it("journey trigger with empty response retries correctly", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        // Return valid JSON but no html/geo content (triggers retry)
                        return { status: 200, responseText: '{}' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["empty_content"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "empty_content", count: 1 });
            
            // Wait for retries (3 attempts with 1 second between = ~2 seconds, plus buffer)
            cy.wait(3000).then(() => {
                var requests = fakeServer.requests;
                cy.log(requests);
                // Expected: hc + sc + journey_event + 3 content retries = 6
                expect(requests.length).to.equal(6);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(3); // 3 retries due to empty content
                // Verify content requests come after journey request
                expect(requests.indexOf(contentReqs[0])).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("journey trigger validates request order and timing", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        return { status: 200, responseText: '{"html":"https://test.com", "geo":{"p":{"x":0,"y":0,"w":100,"h":100},"l":{"x":0,"y":0,"w":100,"h":100}}}' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["order_test"]} },
                fake_request_handler: fakeServer.handler
            });
            
            Countly.add_event({ key: "order_test", count: 1 });
            
            // Wait for event and content requests (content is sent immediately after event succeeds)
            cy.wait(1000).then(() => {
                var requests = fakeServer.requests;
                // Expected: hc + sc + journey_event + 1 content (success) = 4
                expect(requests.length).to.equal(4);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const contentReq = requests.find((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReq).to.exist;
                // Verify order: journey event must come before content request
                expect(requests.indexOf(contentReq)).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("multiple journey events trigger content request each time", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        return { status: 200, responseText: '{"html":"https://test.com", "geo":{"p":{"x":0,"y":0,"w":100,"h":100},"l":{"x":0,"y":0,"w":100,"h":100}}}' };
                    }
                    if (req.functionName === "server_config") {
                        return { status: 200, responseText: '{"c": {"jte": ["multi_journey"]}}' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["multi_journey"]} },
                fake_request_handler: fakeServer.handler
            });
            
            // Add multiple journey events quickly
            Countly.add_event({ key: "multi_journey", count: 1 });
            Countly.add_event({ key: "multi_journey", count: 1 });
            Countly.add_event({ key: "multi_journey", count: 1 });
            
            // Wait for processing
            cy.wait(4000).then(() => {
                var requests = fakeServer.requests;
                cy.log(requests);
                // Expected: hc + sc + journey_event (with all 3 events separate) + 1 content = 6
                expect(requests.length).to.equal(6);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const journeyReqs = requests.filter((r) => r.functionName.includes("journey_trigger_send_request"));
                expect(journeyReqs.length).to.equal(3);
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(1); // only 1 content request despite 3 journey events
                // Verify content request comes after journey request
                expect(requests.indexOf(contentReqs[0])).to.be.greaterThan(requests.indexOf(journeyReq));
            });
        });
    });

    it("multiple journey events trigger content request but while content displayed ignored", () => {
        hp.haltAndClearStorage(() => {
            var fakeServer = hp.createFakeRequestHandler({
                onRequest: function(req) {
                    if (req.url.includes("/o/sdk/content")) {
                        return { status: 200, responseText: '{"html":"https://test.com", "geo":{"p":{"x":0,"y":0,"w":100,"h":100},"l":{"x":0,"y":0,"w":100,"h":100}}}' };
                    }
                    if (req.functionName === "server_config") {
                        return { status: 200, responseText: '{"c": {"jte": ["journey_1", "journey_2"]}}' };
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            
            Countly.noHeartBeat = true;
            Countly.init({
                app_key: hp.appKey,
                url: "https://test.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["journey_1", "journey_2"]} },
                fake_request_handler: fakeServer.handler
            });
            
            // Add multiple journey events
            Countly.add_event({ key: "journey_1", count: 1 });
            Countly.add_event({ key: "random", count: 1 });
            // content is being displayed so this trigger should be ignored
            cy.wait(1000).then(() => {
                Countly.add_event({ key: "random", count: 1 });
                Countly.add_event({ key: "journey_2", count: 1 });
            });
            
            // Wait for processing
            cy.wait(4000).then(() => {
                var requests = fakeServer.requests;
                cy.log(requests);
                // Expected: hc + sc + 2 journey_events + 1 content = 5
                expect(requests.length).to.equal(5);
                const healthReq = requests.find((r) => r.functionName.includes("[healthCheck]"));
                const sbsReq = requests.find((r) => r.functionName.includes("server_config"));
                const journeyReq = requests.find((r) => r.functionName.includes("journey_trigger_send_request"));
                const journeyReqs = requests.filter((r) => r.functionName.includes("journey_trigger_send_request"));
                expect(journeyReqs.length).to.equal(2);
                const contentReqs = requests.filter((r) => r.functionName.includes("sendContentRequest"));
                expect(healthReq).to.exist;
                expect(sbsReq).to.exist;
                expect(journeyReq).to.exist;
                expect(contentReqs.length).to.equal(1); // only 1 content request for 2 journey events
                expect(requests[3]).to.equal(contentReqs[0]); // one before last request
                expect(requests[4]).to.equal(journeyReqs[1]); // last request
            });
        });
    });
});
