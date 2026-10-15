/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

var contentAnswer = JSON.stringify({ html: "https://your.domain.count.ly/_external/content?id=1", geo: { l: { x: 0, y: 0, w: 100, h: 100 }, p: { x: 0, y: 0, w: 100, h: 100 } } });

// answers content requests with content when hasContent() says so, and counts them
function initWithContent(hasContent) {
    var counts = { content: 0 };
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        debug: true,
        test_mode_eq: true,
        fake_request_handler: (req) => {
            if (req.params && req.params.method === "queue") {
                counts.content++;
                return { status: 200, responseText: hasContent() ? contentAnswer : "{}" };
            }
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    });
    return counts;
}

function contentFrame() {
    return document.getElementById("cly-content-iframe");
}

// a message the shown content sends to the page
function fromContent(data) {
    window.dispatchEvent(new MessageEvent("message", { data: data, origin: "https://your.domain.count.ly", source: contentFrame().contentWindow }));
}

describe("Leaving the content zone", () => {
    afterEach(() => {
        document.querySelectorAll("#cly-content-iframe").forEach((frame) => frame.remove());
    });

    it("keeps the zone left when it is left during the first seconds", () => {
        hp.haltAndClearStorage(() => {
            var counts = initWithContent(() => true);
            Countly.content.enterContentZone();
            Countly.content.exitContentZone();
            cy.wait(5500).then(() => {
                expect(counts.content, "content requests after leaving").to.equal(0);
                expect(contentFrame(), "content after leaving").to.not.exist;
            });
        });
    });

    it("keeps the zone left when it is left right after a refresh", () => {
        hp.haltAndClearStorage(() => {
            var counts = initWithContent(() => false);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(counts.content, "the zone was entered").to.equal(1);
                Countly.content.refreshContentZone();
                Countly.content.exitContentZone();
                cy.wait(1500).then(() => {
                    expect(counts.content, "content requests after leaving").to.equal(1);
                });
            });
        });
    });

    it("closes the content on screen", () => {
        hp.haltAndClearStorage(() => {
            var counts = initWithContent(() => true);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "content is shown").to.exist;
                Countly.content.exitContentZone();
                expect(contentFrame(), "content after leaving").to.not.exist;
                cy.wait(1500).then(() => {
                    expect(counts.content, "content requests after leaving").to.equal(1);
                });
            });
        });
    });

    it("does not show content that arrives after the zone is left, until the zone is entered again", () => {
        var leaveWhileOnItsWay = true;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                if (leaveWhileOnItsWay) {
                    leaveWhileOnItsWay = false;
                    // the visitor leaves the zone while this request is on its way
                    Countly.content.exitContentZone();
                }
                return true;
            });
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "content that arrived after leaving").to.not.exist;
                Countly.content.enterContentZone();
                cy.wait(500).then(() => {
                    expect(contentFrame(), "content once the zone is entered again").to.exist;
                });
            });
        });
    });
});

describe("Device ID change without merge", () => {
    afterEach(() => {
        document.querySelectorAll("#cly-content-iframe").forEach((frame) => frame.remove());
    });

    it("leaves the content zone and closes the previous user's content", () => {
        hp.haltAndClearStorage(() => {
            var counts = initWithContent(() => true);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "content is shown").to.exist;
                Countly.change_id("next user", false);
                expect(contentFrame(), "content after the change").to.not.exist;
                cy.wait(1500).then(() => {
                    expect(counts.content, "content requests after the change").to.equal(1);
                });
            });
        });
    });

    it("does not show the previous user's content that arrives after the change", () => {
        var changeWhileOnItsWay = true;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                if (changeWhileOnItsWay) {
                    changeWhileOnItsWay = false;
                    Countly.change_id("next user", false);
                }
                return true;
            });
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "the previous user's content").to.not.exist;
            });
        });
    });
});

describe("Messages from content", () => {
    afterEach(() => {
        document.querySelectorAll("#cly-content-iframe").forEach((frame) => frame.remove());
    });

    it("are handled once, however many contents were shown before", () => {
        hp.haltAndClearStorage(() => {
            initWithContent(() => true);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "first content is shown").to.exist;
                fromContent({ close: 1 });
                expect(contentFrame(), "first content is closed").to.not.exist;
                Countly.content.refreshContentZone();
                cy.wait(1500).then(() => {
                    expect(contentFrame(), "second content is shown").to.exist;
                    fromContent({ event: [{ key: "from_content" }] });
                    var recorded = Countly._internals.getLocalQueues().eventQ.filter((e) => e.key === "from_content");
                    expect(recorded.length).to.equal(1);
                    Countly.content.exitContentZone();
                });
            });
        });
    });

    it("record an event sent on its own, as they do one sent in a list", () => {
        hp.haltAndClearStorage(() => {
            initWithContent(() => true);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentFrame(), "content is shown").to.exist;
                fromContent({ event: { key: "single_from_content" } });
                fromContent({ event: [{ key: "listed_from_content" }] });
                var keys = Countly._internals.getLocalQueues().eventQ.map((e) => e.key);
                expect(keys).to.include("single_from_content");
                expect(keys).to.include("listed_from_content");
                Countly.content.exitContentZone();
            });
        });
    });
});

describe("Journey content", () => {
    afterEach(() => {
        document.querySelectorAll("#cly-content-iframe").forEach((frame) => frame.remove());
    });

    it("waits for enterContentZone once the zone was left", () => {
        var counts = { content: 0 };
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["journey_start"] } },
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        counts.content++;
                        return { status: 200, responseText: contentAnswer };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.content.exitContentZone();
            Countly.add_event({ key: "journey_start" });
            cy.wait(2000).then(() => {
                expect(counts.content, "journey content requests after leaving").to.equal(0);
                expect(contentFrame(), "journey content after leaving").to.not.exist;
                // the zone itself waits 4 s after init, so what comes next is the journey's
                Countly.content.enterContentZone();
                Countly.add_event({ key: "journey_start" });
                cy.wait(1500).then(() => {
                    expect(counts.content, "journey content requests after entering again").to.be.greaterThan(0);
                    expect(contentFrame(), "journey content after entering again").to.exist;
                });
            });
        });
    });

    it("keeps coming for the next user after a device ID change on a site that does not use the content zone", () => {
        var counts = { content: 0 };
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                behavior_settings: { c: { jte: ["journey_start"] } },
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        counts.content++;
                        return { status: 200, responseText: contentAnswer };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.change_id("next user", false);
            Countly.add_event({ key: "journey_start" });
            cy.wait(1500).then(() => {
                expect(counts.content, "journey content requests for the next user").to.be.greaterThan(0);
                expect(contentFrame(), "journey content for the next user").to.exist;
            });
        });
    });

    it("is asked for once what waited in the shared storage since a failed send went out before the journey event", () => {
        var counts = { content: 0 };
        var failing = true;
        var sentKeys = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                interval: 10000,
                fail_timeout: 1,
                behavior_settings: { c: { jte: ["journey_start"] } },
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        counts.content++;
                        return { status: 200, responseText: "{}" };
                    }
                    if (req.params && typeof req.params.events === "string") {
                        if (failing) {
                            return { status: 0, responseText: "" };
                        }
                        sentKeys.push(JSON.parse(req.params.events).map((e) => e.key).join(","));
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1000).then(() => {
                // leaving the tab sends what it holds, which fails, so it waits in the shared storage
                Countly.add_event({ key: "before_the_journey" });
                Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
                document.dispatchEvent(new Event("visibilitychange"));
                // back in front without a visibility change, before the slow heartbeat comes
                delete document.hidden;
                failing = false;
            });
            cy.wait(2500).then(() => {
                Countly.add_event({ key: "journey_start" });
            });
            cy.wait(2500).then(() => {
                expect(sentKeys, "in the order they were recorded").to.deep.equal(["before_the_journey", "journey_start"]);
                expect(counts.content, "journey content requests").to.be.greaterThan(0);
            });
        });
    });

    it("is asked for even when an earlier journey event reached the server by the regular sending", () => {
        var counts = { content: 0 };
        var failedOnce = false;
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                fail_timeout: 1,
                behavior_settings: { c: { jte: ["journey_start"] } },
                disable_sdk_behavior_settings_updates: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        counts.content++;
                        return { status: 200, responseText: "{}" };
                    }
                    if (req.params && req.params.events && req.params.events.indexOf("journey_start") !== -1 && !failedOnce) {
                        failedOnce = true;
                        return { status: 500, responseText: "{\"result\":\"Error\"}" };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            cy.wait(1000).then(() => {
                // the first journey event fails to reach the server, the regular sending delivers it later
                Countly.add_event({ key: "journey_start" });
                cy.wait(4000).then(() => {
                    expect(Countly._internals.getLocalQueues().requestQ.length, "the failed request was delivered later").to.equal(0);
                    var before = counts.content;
                    Countly.add_event({ key: "journey_start" });
                    cy.wait(2500).then(() => {
                        expect(counts.content - before, "journey content requests").to.be.greaterThan(0);
                    });
                });
            });
        });
    });
});
