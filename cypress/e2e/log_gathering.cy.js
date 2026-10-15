/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
import { triggerStorageChange } from "../support/integration_helper";

var GATHER_ID = "0123456789abcdef0123456789abcdef";
var OTHER_ID = "fedcba9876543210fedcba9876543210";
var LEVEL_CHARS = "ewidv";

// Deliver the server config through the SDK's own request machinery, with or without a
// log gathering directive, exactly as a real sc response would arrive. `lg` undefined
// means the response carries no directive at all.
function initWithDirective(lg, extra) {
    var config = {
        app_key: hp.appKey,
        url: "https://test.count.ly",
        test_mode: true,
        debug: true,
        fake_request_handler: function(req) {
            if (req.functionName === "server_config") {
                var sc = { v: 2, t: 1786273877636, c: {} };
                if (typeof lg !== "undefined") {
                    sc.lg = lg;
                }
                return { status: 200, responseText: JSON.stringify(sc) };
            }
            return { status: 200, responseText: '{"result":"Success"}' };
        }
    };
    Countly.init(Object.assign(config, extra));
}

// A later sc response reaching this tab through another tab's write of the cached config.
// The SDK treats a mirrored config as server originated, so this is the one way a test can
// deliver a second live directive without waiting for the refetch timer.
function deliverLaterDirective(lg) {
    var sc = { v: 2, t: 1786273877637, c: {} };
    if (typeof lg !== "undefined") {
        sc.lg = lg;
    }
    triggerStorageChange(hp.appKey + "/cly_config", JSON.stringify(sc));
}

function logLines(count, level) {
    for (var i = 0; i < count; i++) {
        Countly._internals.log(level || "[DEBUG] ", "log_gathering_test, line number [" + i + "]");
    }
}

function gatheredBatches(rq) {
    return rq.filter((r) => r.sdk_logs).map((r) => JSON.parse(r.sdk_logs));
}

describe("Log gathering directive", () => {
    it("arms from a live directive and adopts the lines captured during init", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, l: LEVEL_CHARS, b: 100 });
            var state = Countly._internals.getLogGatheringState();
            expect(state).to.deep.equal({ enabled: true, decided: true, gatherId: GATHER_ID, levels: LEVEL_CHARS, batchSize: 100 });
            expect(Countly._internals.getDroppedLogCount()).to.equal(0);

            var buffer = Countly._internals.getLogBuffer();
            expect(buffer.length).to.be.greaterThan(0);
            expect(buffer.some((line) => line.m.indexOf("initialize,") !== -1), "init lines are adopted").to.equal(true);
            buffer.forEach((line) => {
                expect(line.t).to.be.a("number");
                expect(LEVEL_CHARS.indexOf(line.l), "wire level char").to.not.equal(-1);
                expect(line.m).to.be.a("string");
                expect(line.m.indexOf("[Countly] "), "level prefix is not repeated in the message").to.equal(0);
                expect(line.m, "the SDK never gathers commentary about its own uploads").to.not.contain("sdk_logs");
            });

            var buffered = buffer.length;
            Countly._internals.flushLogBuffer();
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            cy.fetch_local_request_queue().then((rq) => {
                var batches = gatheredBatches(rq);
                expect(batches.length).to.equal(1);
                expect(batches[0].i).to.equal(GATHER_ID);
                expect(batches[0].d).to.equal(0);
                expect(batches[0].l.length).to.equal(buffered);
                expect(batches[0].l[0]).to.have.all.keys("t", "l", "m");
            });
        });
    });

    it("gathers while debug is off", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID }, { debug: false });
            expect(Countly._internals.getLogGatheringState().enabled).to.equal(true);
            expect(Countly._internals.getLogBuffer().length).to.be.greaterThan(0);
        });
    });

    it("decides against gathering when the live response carries no directive", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective(undefined);
            var state = Countly._internals.getLogGatheringState();
            expect(state.decided).to.equal(true);
            expect(state.enabled).to.equal(false);
            expect(state.gatherId).to.equal(null);
            expect(Countly._internals.getLogBuffer().length, "speculative lines are dropped").to.equal(0);
            logLines(5);
            expect(Countly._internals.getLogBuffer().length, "nothing is captured once decided against").to.equal(0);
            Countly._internals.flushLogBuffer();
            cy.fetch_local_request_queue().then((rq) => {
                expect(gatheredBatches(rq).length).to.equal(0);
            });
        });
    });

    it("treats an explicit off and an enable without a gather id the same way", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: false });
            expect(Countly._internals.getLogGatheringState()).to.include({ decided: true, enabled: false, gatherId: null });
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            hp.haltAndClearStorage(() => {
                initWithDirective({ e: true, l: LEVEL_CHARS });
                expect(Countly._internals.getLogGatheringState()).to.include({ decided: true, enabled: false, gatherId: null });
                expect(Countly._internals.getLogBuffer().length).to.equal(0);
            });
        });
    });

    it("keeps only the requested levels and clamps a tiny batch size up", () => {
        hp.haltAndClearStorage(() => {
            // only 'e' survives: duplicates collapse and unknown characters are dropped
            initWithDirective({ e: true, i: GATHER_ID, l: "eexz", b: 3 });
            var state = Countly._internals.getLogGatheringState();
            expect(state.levels).to.equal("e");
            expect(state.batchSize).to.equal(10);
            var buffer = Countly._internals.getLogBuffer();
            buffer.forEach((line) => {
                expect(line.l).to.equal("e");
            });
            var before = buffer.length;
            logLines(3, "[INFO] ");
            expect(Countly._internals.getLogBuffer().length, "excluded levels are not captured live either").to.equal(before);
            logLines(1, "[ERROR] ");
            expect(Countly._internals.getLogBuffer().length).to.equal(before + 1);
        });
    });

    it("falls back to every level for an unusable level string and clamps a huge batch size down", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, l: "zz", b: 9999 });
            var state = Countly._internals.getLogGatheringState();
            expect(state.levels).to.equal(LEVEL_CHARS);
            expect(state.batchSize).to.equal(500);
            hp.haltAndClearStorage(() => {
                // a non numeric batch size means the default
                initWithDirective({ e: true, i: GATHER_ID, b: "50" });
                expect(Countly._internals.getLogGatheringState().batchSize).to.equal(100);
            });
        });
    });
});

describe("Log gathering delivery", () => {
    it("moves full batches into the request queue on its own and accounts for every line", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 10 });
            // in a browser the first requests wait for the client hints, so let them reach the queue
            cy.wait(hp.sWait2).then(() => {
                var added = 25;
                logLines(added);
                expect(Countly._internals.getLogBuffer().length).to.be.lessThan(10);
                cy.wait(hp.sWait2).then(() => {
                    cy.fetch_local_request_queue().then((rq) => {
                        var batches = gatheredBatches(rq);
                        expect(batches.length).to.be.greaterThan(1);
                        var shippedLines = [];
                        batches.forEach((batch) => {
                            expect(batch.i).to.equal(GATHER_ID);
                            expect(batch.d).to.equal(0);
                            expect(batch.l.length).to.equal(10);
                            shippedLines = shippedLines.concat(batch.l.map((line) => line.m));
                        });
                        // identity rather than counts: the SDK keeps logging on its own in the
                        // background, so every generated line must show up exactly once across
                        // what was shipped and what is still buffered
                        var everywhere = shippedLines.concat(Countly._internals.getLogBuffer().map((line) => line.m));
                        for (var i = 0; i < added; i++) {
                            var marker = "log_gathering_test, line number [" + i + "]";
                            var seen = everywhere.filter((m) => m.indexOf(marker) !== -1).length;
                            expect(seen, "line " + i + " is neither lost nor duplicated").to.equal(1);
                        }
                    });
                });
            });
        });
    });

    it("truncates an oversized line to the server limit", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            Countly._internals.log("[DEBUG] ", "x".repeat(5000));
            var buffer = Countly._internals.getLogBuffer();
            expect(buffer[buffer.length - 1].m.length).to.equal(4096);
        });
    });

    it("bounds the speculative buffer, counts the loss and reports it with the first batch", () => {
        hp.haltAndClearStorage(() => {
            // the config request never answers, so the SDK stays undecided and keeps capturing
            initWithDirective(undefined, {
                fake_request_handler: function(req) {
                    if (req.functionName === "server_config") {
                        return false;
                    }
                    return { status: 200, responseText: '{"result":"Success"}' };
                }
            });
            expect(Countly._internals.getLogGatheringState().decided).to.equal(false);
            logLines(600);
            expect(Countly._internals.getLogBuffer().length).to.equal(500);
            var dropped = Countly._internals.getDroppedLogCount();
            expect(dropped).to.be.greaterThan(99);

            deliverLaterDirective({ e: true, i: GATHER_ID, b: 500 });
            expect(Countly._internals.getLogGatheringState()).to.include({ enabled: true, gatherId: GATHER_ID });
            Countly._internals.flushLogBuffer();
            cy.fetch_local_request_queue().then((rq) => {
                var batches = gatheredBatches(rq);
                // the lines the SDK logs while applying the directive push a full buffer over
                // the cap once more, so the first batch carries at least the drops seen above
                expect(batches.length).to.be.at.least(1);
                expect(batches[0].d).to.be.at.least(dropped);
                expect(batches[0].l.length).to.equal(500);
                batches.slice(1).forEach((batch) => {
                    expect(batch.d, "the drop count travels once").to.equal(0);
                });
                expect(Countly._internals.getDroppedLogCount()).to.equal(0);
            });
        });
    });
});

describe("Log gathering consent", () => {
    function bufferedText() {
        return Countly._internals.getLogBuffer().map((line) => line.m).join("\n");
    }

    it("gathers nothing while consent is required and none is given", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            expect(Countly._internals.getLogGatheringState().enabled).to.equal(true);
            Countly.add_event({ key: "refused_event" });
            Countly.user_details({ name: "Jane Refused" });
            logLines(3);
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
        });
    });

    it("gathers a method's lines under that method's consent only", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            Countly.add_consent("events");
            Countly.add_event({ key: "consented_event" });
            Countly.user_details({ name: "Jane Refused" });
            logLines(2);
            var text = bufferedText();
            expect(text).to.contain("add_event,");
            expect(text).to.contain("consented_event");
            expect(text, "users consent was not given").to.not.contain("Jane Refused");
            expect(text, "a line of no particular method needs users consent too").to.not.contain("log_gathering_test");
        });
    });

    it("holds the start-up lines in memory and gathers them in time order once their consent is given", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            Countly.add_consent(["events", "users"]);
            var buffer = Countly._internals.getLogBuffer();
            expect(buffer.some((line) => line.m.indexOf("initialize,") !== -1), "start-up lines are gathered").to.equal(true);
            for (var i = 1; i < buffer.length; i++) {
                expect(buffer[i].t).to.be.at.least(buffer[i - 1].t);
            }
            buffer.forEach((line) => {
                expect(line).to.have.all.keys("t", "l", "m");
            });
        });
    });

    it("keeps a held line back until its own consent is given", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            Countly.user_details({ name: "Jane Later" });
            Countly.add_consent("events");
            expect(bufferedText()).to.not.contain("Jane Later");
            Countly.add_consent("users");
            expect(bufferedText()).to.contain("Jane Later");
        });
    });

    it("drops the held lines when the server decides against gathering", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: false }, { require_consent: true });
            Countly.add_consent(["events", "users"]);
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
        });
    });

    it("holds at most the newest 500 lines", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            logLines(600);
            Countly.add_consent(["events", "users"]);
            cy.fetch_local_request_queue().then((rq) => {
                var gathered = gatheredBatches(rq).reduce((all, batch) => all.concat(batch.l), []).concat(Countly._internals.getLogBuffer()).map((line) => line.m);
                expect(gathered.some((m) => m.indexOf("line number [599]") !== -1), "the newest held line").to.equal(true);
                expect(gathered.some((m) => m.indexOf("line number [0]") !== -1), "the oldest held lines are dropped").to.equal(false);
            });
        });
    });

    it("gathers lines of no particular method once both events and users consent are given", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 }, { require_consent: true });
            Countly.add_consent(["events", "users"]);
            logLines(2);
            Countly.user_details({ name: "Jane Consented" });
            var text = bufferedText();
            expect(text).to.contain("log_gathering_test, line number [1]");
            expect(text).to.contain("Jane Consented");
        });
    });
});

describe("Log gathering of its own uploads", () => {
    it("gathers a line that only mentions sdk_logs", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            Countly.add_event({ key: "open_sdk_logs_panel" });
            var mentions = Countly._internals.getLogBuffer().filter((line) => line.m.indexOf("open_sdk_logs_panel") !== -1);
            expect(mentions.length).to.be.greaterThan(0);
        });
    });

    it("does not gather the heartbeat's line about a queued log batch", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 10 });
            cy.wait(hp.sWait2).then(() => {
                Countly._internals.clearQueue();
                logLines(10);
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length, "only the batch is queued").to.equal(1);
                    expect(rq[0]).to.have.property("sdk_logs");
                });
                cy.wait(hp.sWait2 * 2).then(() => {
                    Countly._internals.getLogBuffer().forEach((line) => {
                        expect(line.m, "a batch is never quoted into the next one").to.not.contain("\"sdk_logs\"");
                    });
                });
            });
        });
    });

    it("does not gather another tab's request queue", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            var batch = { i: GATHER_ID, d: 0, l: [{ t: 1, l: "d", m: "[Countly] line uploaded by another tab" }] };
            triggerStorageChange(hp.appKey + "/cly_queue", JSON.stringify([{ sdk_logs: JSON.stringify(batch) }]));
            Countly._internals.getLogBuffer().forEach((line) => {
                expect(line.m).to.not.contain("line uploaded by another tab");
            });
        });
    });
});

describe("Log gathering lifecycle", () => {
    it("stops on a later live response, ships the tail with the old id and captures nothing more", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            var buffered = Countly._internals.getLogBuffer().length;
            expect(buffered).to.be.greaterThan(0);

            deliverLaterDirective({ e: false });
            var state = Countly._internals.getLogGatheringState();
            expect(state.enabled).to.equal(false);
            expect(state.gatherId, "the id is kept so the tail can be attributed").to.equal(GATHER_ID);
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            logLines(5);
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            cy.fetch_local_request_queue().then((rq) => {
                var batches = gatheredBatches(rq);
                expect(batches.length).to.equal(1);
                expect(batches[0].i).to.equal(GATHER_ID);
                // the storage change handler logs a couple of lines of its own before the stop lands
                expect(batches[0].l.length).to.be.at.least(buffered);
            });
        });
    });

    it("never mixes two gather ids: a new id drops what the old one gathered", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            expect(Countly._internals.getLogBuffer().length).to.be.greaterThan(1);

            deliverLaterDirective({ e: true, i: OTHER_ID, b: 500 });
            expect(Countly._internals.getLogGatheringState()).to.include({ enabled: true, gatherId: OTHER_ID });
            var buffer = Countly._internals.getLogBuffer();
            expect(buffer.length, "only the lines announcing the switch remain").to.be.at.most(2);
            expect(buffer[buffer.length - 1].m).to.contain("Log gathering started for id:[" + OTHER_ID + "]");
            buffer.forEach((line) => {
                expect(line.m, "nothing from the old gather survives").to.not.contain("initialize,");
            });
            cy.fetch_local_request_queue().then((rq) => {
                expect(gatheredBatches(rq).length, "the old gather's lines are not uploaded").to.equal(0);
            });
        });
    });

    it("keeps gathering when the same id is repeated", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            var before = Countly._internals.getLogBuffer().length;
            deliverLaterDirective({ e: true, i: GATHER_ID, b: 500 });
            expect(Countly._internals.getLogGatheringState()).to.include({ enabled: true, gatherId: GATHER_ID });
            expect(Countly._internals.getLogBuffer().length).to.be.at.least(before);
        });
    });

    it("ignores a directive that only exists in the stored config", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective(undefined, { behavior_settings: { v: 2, t: 1, c: {}, lg: { e: true, i: OTHER_ID } } });
            var state = Countly._internals.getLogGatheringState();
            expect(state).to.include({ decided: true, enabled: false, gatherId: null });
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
        });
    });

    it("decides against gathering without a round trip when no config will be fetched", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID }, { offline_mode: true });
            expect(Countly._internals.getLogGatheringState()).to.include({ decided: true, enabled: false });
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            hp.haltAndClearStorage(() => {
                initWithDirective({ e: true, i: GATHER_ID }, { disable_sdk_behavior_settings_updates: true });
                expect(Countly._internals.getLogGatheringState()).to.include({ decided: true, enabled: false });
                expect(Countly._internals.getLogBuffer().length).to.equal(0);
            });
        });
    });

    it("drops everything on halt and does not capture afterwards", () => {
        hp.haltAndClearStorage(() => {
            initWithDirective({ e: true, i: GATHER_ID, b: 500 });
            expect(Countly._internals.getLogBuffer().length).to.be.greaterThan(0);
            Countly.halt();
            expect(Countly._internals.getLogGatheringState()).to.include({ decided: true, enabled: false, gatherId: null });
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
            logLines(3);
            expect(Countly._internals.getLogBuffer().length).to.equal(0);
        });
    });
});
