/* eslint-disable require-jsdoc */
// Unit tests for the reference service worker. The worker only ever talks to `self`, so the file
// is evaluated against a fake global and its handlers are driven with hand-made events.

const MESSAGE_ID = "507f1f77bcf86cd799439011";
const { SDK_VERSION, pushMessageTypes, pushWorkerParams, pushConstants, internalEventKeyEnums } = require("../support/sdk-modules/Constants.js");

const { fakeClient, manualTimers, loadWorker, pushEvent, fakeFetch, formBody } = require("../support/push_worker.js");

describe("Web push service worker", () => {
    var source = null;

    before(() => {
        cy.readFile("lib/countly_sw.js").then((code) => {
            source = code;
        });
    });

    it("Takes control of open pages as soon as it activates", () => {
        var worker = loadWorker(source);
        cy.then(() => worker.dispatch("install")).then(() => {
            // a page that registered this worker is otherwise not controlled until it reloads, and
            // an updated worker would wait for every tab to close
            expect(worker.self.skipWaitingCalls).to.equal(1);
            return worker.dispatch("activate");
        }).then(() => {
            expect(worker.self.clients.claimCalls).to.equal(1);
        });
    });

    it("Shows the notification described by the Countly payload", () => {
        var worker = loadWorker(source);
        var payload = {
            title: "Hi",
            message: "Body",
            icon: "https://x/icon.png",
            badge: 3,
            c: {
                i: MESSAGE_ID,
                l: "https://x/open",
                m: "https://x/image.jpg",
                b: [{ t: "One", l: "https://x/1" }, { t: "Two", l: "https://x/2" }, { t: "Three", l: "https://x/3" }]
            }
        };
        cy.then(() => worker.dispatch("push", pushEvent(payload))).then(() => {
            var shown = worker.self.registration.shown[0];
            expect(shown.title).to.equal("Hi");
            expect(shown.options.body).to.equal("Body");
            expect(shown.options.icon).to.equal("https://x/icon.png");
            expect(shown.options.image).to.equal("https://x/image.jpg");
            // an app badge count is not a badge icon URL
            expect(shown.options.badge).to.equal(undefined);
            expect(shown.options.actions).to.deep.equal([{ action: "btn_1", title: "One" }, { action: "btn_2", title: "Two" }]);
            // the whole payload rides along so a click or close can hand the page its custom data
            expect(shown.options.data).to.deep.equal({ i: MESSAGE_ID, l: "https://x/open", b: payload.c.b, p: payload });
        });
    });

    it("Replaces the notification on screen when the payload carries a tag", () => {
        var worker = loadWorker(source);
        var payload = { title: "Hi", message: "Body", tag: "order-updates", c: { i: MESSAGE_ID } };
        cy.then(() => worker.dispatch("push", pushEvent(payload))).then(() => {
            var shown = worker.self.registration.shown[0];
            expect(shown.options.tag).to.equal("order-updates");
            // without renotify the replacement is silent, which is not what an operator asked for
            expect(shown.options.renotify).to.equal(true);
        });
    });

    it("Leaves tag and renotify off when the payload has no tag", () => {
        var worker = loadWorker(source);
        cy.then(() => worker.dispatch("push", pushEvent({ title: "Hi", message: "Body", c: { i: MESSAGE_ID } }))).then(() => {
            var shown = worker.self.registration.shown[0];
            expect(shown.options.tag).to.equal(undefined);
            expect(shown.options.renotify).to.equal(undefined);
        });
    });

    it("Keeps the notification on screen when the payload asks for it", () => {
        var worker = loadWorker(source);
        cy.then(() => worker.dispatch("push", pushEvent({ title: "Hi", message: "Body", requireInteraction: true, c: { i: MESSAGE_ID } }))).then(() => {
            expect(worker.self.registration.shown[0].options.requireInteraction).to.equal(true);
        });
    });

    it("Does not ask to keep the notification on screen by default", () => {
        var worker = loadWorker(source);
        cy.then(() => worker.dispatch("push", pushEvent({ title: "Hi", message: "Body", c: { i: MESSAGE_ID } }))).then(() => {
            expect(worker.self.registration.shown[0].options.requireInteraction).to.equal(undefined);
        });
    });

    it("Hands a click to exactly one page and forgets it once acknowledged", () => {
        var worker = loadWorker(source);
        var other = fakeClient("https://x/other", false);
        var target = fakeClient("https://x/open", false);
        worker.self.clients.list = [other, target];
        var notification = {
            closed: false,
            close() {
                this.closed = true;
            },
            data: { i: MESSAGE_ID, l: "https://x/open", b: [{ t: "One", l: "https://x/1" }] }
        };
        cy.then(() => worker.dispatch("notificationclick", { notification: notification, action: "" })).then(() => {
            expect(notification.closed).to.equal(true);
            expect(other.messages.length).to.equal(0);
            expect(target.messages.length).to.equal(1);
            expect(target.messages[0].type).to.equal("countly_push_action");
            expect(target.messages[0].messageId).to.equal(MESSAGE_ID);
            expect(target.messages[0].buttonIndex).to.equal(0);
            expect(target.focusCalls).to.equal(1);
            expect(worker.self.clients.opened).to.deep.equal([]);
            // until someone acknowledges it, a page announcing itself is handed the action too
            var late = fakeClient("https://x/late", false);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: late }).then(() => {
                expect(actionsHandedTo(late).length).to.equal(1);
                expect(actionsHandedTo(late)[0].aid).to.equal(target.messages[0].aid);
                return worker.dispatch("message", { data: { type: "countly_push_ack", aid: target.messages[0].aid } });
            }).then(() => {
                var later = fakeClient("https://x/later", false);
                return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: later }).then(() => {
                    expect(actionsHandedTo(later).length).to.equal(0);
                });
            });
        });
    });

    it("Opens the button's URL and reports the button index when no page is open", () => {
        var worker = loadWorker(source);
        var notification = {
            close() { },
            data: { i: MESSAGE_ID, l: "https://x/open", b: [{ t: "One", l: "https://x/1" }, { t: "Two", l: "https://x/2" }] }
        };
        cy.then(() => worker.dispatch("notificationclick", { notification: notification, action: "btn_2" })).then(() => {
            expect(worker.self.clients.opened).to.deep.equal(["https://x/2"]);
            var page = fakeClient("https://x/2", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                expect(actionsHandedTo(page).length).to.equal(1);
                expect(actionsHandedTo(page)[0].buttonIndex).to.equal(2);
                expect(actionsHandedTo(page)[0].messageId).to.equal(MESSAGE_ID);
            });
        });
    });

    it("Focuses the tab already showing the click's URL when the message leaves out the trailing slash", () => {
        var worker = loadWorker(source);
        // browsers report window URLs normalised, so the home page is "https://x/" however it was linked
        var other = fakeClient("https://x/other", true);
        var home = fakeClient("https://x/", false);
        worker.self.clients.list = [other, home];
        cy.then(() => worker.dispatch("notificationclick", { notification: { close() { }, data: { i: MESSAGE_ID, l: "https://x", b: [] } }, action: "" })).then(() => {
            expect(worker.self.clients.opened).to.deep.equal([]);
            expect(home.focusCalls).to.equal(1);
            expect(home.messages.filter((m) => m.type === "countly_push_action").length).to.equal(1);
            expect(other.messages.length).to.equal(0);
        });
    });

    it("Does not attempt a re-subscribe without an application server key", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        // Chrome 138 fires the event with neither subscription attached
        cy.then(() => worker.dispatch("pushsubscriptionchange", {})).then(() => {
            // subscribe() without a key is a guaranteed rejection; the page re-registers with the
            // configured key instead
            expect(worker.self.registration.pushManager.subscribeCalls.length).to.equal(0);
            expect(page.messages).to.deep.equal([{ type: "countly_push_subscription_change" }]);
        });
    });

    it("Re-subscribes with the previous key and tells the pages when the browser rotates the subscription", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        var key = new Uint8Array([4, 1, 2, 3]).buffer;
        cy.then(() => worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: key } } })).then(() => {
            var calls = worker.self.registration.pushManager.subscribeCalls;
            expect(calls.length).to.equal(1);
            expect(calls[0].userVisibleOnly).to.equal(true);
            expect(calls[0].applicationServerKey).to.equal(key);
            expect(page.messages).to.deep.equal([{ type: "countly_push_subscription_change" }]);
        });
    });

    // ---- living inside someone else's worker (importScripts) ---------------------------------

    it("Leaves pushes that are not from Countly to the host worker", () => {
        var worker = loadWorker(source);
        // no `c.i`: a push the host application's own backend sent through the same subscription
        cy.then(() => worker.dispatch("push", pushEvent({ title: "Someone else's push", body: "not ours" }))).then(() => {
            expect(worker.self.registration.shown.length).to.equal(0);
        });
    });

    it("Ignores clicks on notifications it did not show", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        var notification = {
            closed: false,
            close() {
                this.closed = true;
            },
            data: { someoneElses: true }
        };
        cy.then(() => worker.dispatch("notificationclick", { notification: notification, action: "" })).then(() => {
            expect(notification.closed).to.equal(false);
            expect(page.messages.length).to.equal(0);
            expect(worker.self.clients.opened).to.deep.equal([]);
        });
    });

    it("Leaves the host worker's lifecycle alone when asked", () => {
        var worker = loadWorker(source, (self) => {
            self.COUNTLY_PUSH_LIFECYCLE = false;
        });
        cy.then(() => worker.dispatch("install")).then(() => worker.dispatch("activate")).then(() => {
            expect(worker.self.skipWaitingCalls).to.equal(0);
            expect(worker.self.clients.claimCalls).to.equal(0);
        });
    });

    it("Announces its version when it activates", () => {
        var worker = loadWorker(source);
        var lines = [];
        var original = console.info;
        console.info = function () {
            lines.push(Array.prototype.join.call(arguments, " "));
        };
        cy.then(() => worker.dispatch("activate").then(() => {
            console.info = original;
        }, (err) => {
            console.info = original;
            throw err;
        })).then(() => {
            expect(lines.some((line) => line.indexOf("Countly") !== -1 && line.indexOf(SDK_VERSION) !== -1)).to.equal(true);
        });
    });

    it("Keeps the page-to-worker contract in sync with modules/Constants.js", () => {
        // the worker cannot import Constants.js, so these values are duplicated by hand
        var copies = {
            CLY_ACTION: pushMessageTypes.ACTION,
            CLY_SUBSCRIPTION_CHANGE: pushMessageTypes.SUBSCRIPTION_CHANGE,
            CLY_READY: pushMessageTypes.READY,
            CLY_ACK: pushMessageTypes.ACK,
            CLY_RECEIVED: pushMessageTypes.RECEIVED,
            CLY_CLOSED: pushMessageTypes.CLOSED,
            CLY_LOG: pushMessageTypes.LOG,
            CLY_CONFIG: pushMessageTypes.CONFIG,
            CLY_WORKER_VERSION: pushMessageTypes.WORKER_VERSION,
            CLY_PARAM_DEBUG: pushWorkerParams.debug,
            CLY_PARAM_PERSIST: pushWorkerParams.persist,
            CLY_MAX_PENDING: pushConstants.MAX_SEEN_ACTION_IDS,
            CLY_TOKEN_PROVIDER: pushConstants.TOKEN_PROVIDER,
            CLY_PUSH_ACTION_EVENT: internalEventKeyEnums.PUSH_ACTION,
            CLY_SW_VERSION: SDK_VERSION
        };
        cy.then(() => {
            var reads = Object.keys(copies).map((name) => JSON.stringify(name) + ": typeof " + name + " === 'undefined' ? undefined : " + name);
            var worker = loadWorker(source + "\n;self.copies = {" + reads.join(", ") + "};");
            expect(worker.self.copies).to.deep.equal(copies);
            // a message type or worker URL parameter added to Constants.js needs its worker copy listed above
            var copiedTypes = Object.keys(copies).map((name) => copies[name]).filter((value) => Object.values(pushMessageTypes).indexOf(value) !== -1);
            expect(copiedTypes.sort()).to.deep.equal(Object.values(pushMessageTypes).sort());
            var copiedParams = Object.keys(copies).map((name) => copies[name]).filter((value) => Object.values(pushWorkerParams).indexOf(value) !== -1);
            expect(copiedParams.sort()).to.deep.equal(Object.values(pushWorkerParams).sort());
        });
    });

    it("Tells a page that announces itself which version it is", () => {
        var worker = loadWorker(source, (self) => {
            self.registration.scope = "https://x/countly-push/";
        });
        var page = fakeClient("https://x/", true);
        cy.then(() => worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page })).then(() => {
            expect(page.messages.filter((message) => message.type === "countly_push_worker_version")).to.deep.equal([
                { type: "countly_push_worker_version", version: SDK_VERSION, scope: "https://x/countly-push/" }
            ]);
        });
    });

    // ---- debugging, listener events, allowed hosts -------------------------------------------

    // runs fn while recording everything written to the console, then restores the console
    function capture(fn) {
        var lines = [];
        var saved = {};
        ["log", "info", "warn", "error", "debug"].forEach((k) => {
            saved[k] = console[k];
            console[k] = function () {
                lines.push(k + ": " + Array.prototype.join.call(arguments, " "));
            };
        });
        function restore() {
            Object.keys(saved).forEach((k) => {
                console[k] = saved[k];
            });
        }
        return Promise.resolve().then(fn).then((result) => {
            restore();
            return { lines: lines, result: result };
        }, (err) => {
            restore();
            throw err;
        });
    }

    it("Stays quiet without debug and narrates every step with it", () => {
        var quiet = loadWorker(source);
        var chatty = loadWorker(source, (self) => {
            self.COUNTLY_PUSH_DEBUG = true;
        });
        var payload = { title: "Hi", message: "Body", c: { i: MESSAGE_ID, l: "https://x/open" } };
        cy.then(() => capture(() => quiet.dispatch("push", pushEvent(payload)))).then((out) => {
            expect(out.lines.filter((l) => l.indexOf("[Countly]") !== -1).length).to.equal(0);
            return capture(() => chatty.dispatch("push", pushEvent(payload)));
        }).then((out) => {
            expect(out.lines.some((l) => l.indexOf("[Countly]") !== -1 && l.indexOf(MESSAGE_ID) !== -1)).to.equal(true);
        });
    });

    it("Turns debug on from the worker URL", () => {
        var worker = loadWorker(source, (self) => {
            self.location = { href: "https://x/countly_sw.js?cly_debug=1" };
        });
        cy.then(() => capture(() => worker.dispatch("push", pushEvent({ title: "Hi", c: { i: MESSAGE_ID } })))).then((out) => {
            expect(out.lines.some((l) => l.indexOf("[Countly]") !== -1 && l.indexOf(MESSAGE_ID) !== -1)).to.equal(true);
        });
    });

    it("Turns debug on when a page says so in its handshake", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        cy.then(() => worker.dispatch("message", { data: { type: "countly_push_ready", debug: true }, source: page })).then(() => capture(() => worker.dispatch("push", pushEvent({ title: "Hi", c: { i: MESSAGE_ID } })))).then((out) => {
            expect(out.lines.some((l) => l.indexOf("[Countly]") !== -1 && l.indexOf(MESSAGE_ID) !== -1)).to.equal(true);
        });
    });

    it("Forwards its log lines to open pages when debug is on", () => {
        var worker = loadWorker(source, (self) => {
            self.COUNTLY_PUSH_DEBUG = true;
        });
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        cy.then(() => capture(() => worker.dispatch("push", pushEvent({ title: "Hi", c: { i: MESSAGE_ID } })))).then(() => new Promise((r) => setTimeout(r, 20))).then(() => {
            var logs = page.messages.filter((m) => m.type === "countly_push_log");
            expect(logs.length).to.be.greaterThan(0);
            expect(logs[0].level).to.be.a("string");
            expect(logs.some((m) => m.message.indexOf(MESSAGE_ID) !== -1)).to.equal(true);
        });
    });

    it("Reports a notification the browser refused to show, naming the error", () => {
        var worker = loadWorker(source);
        // what Chrome rejects showNotification() with once the permission is gone
        worker.self.registration.showNotification = () => Promise.reject(new TypeError("No notification permission has been granted for this origin."));
        cy.then(() => capture(() => worker.dispatch("push", pushEvent({ title: "Hi", c: { i: MESSAGE_ID } })))).then((out) => {
            expect(out.lines.some((l) => l.indexOf("error:") === 0 && l.indexOf("TypeError: No notification permission") !== -1)).to.equal(true);
        });
    });

    it("Names the error when re-subscribing after a rotation fails", () => {
        var worker = loadWorker(source);
        worker.self.registration.pushManager.subscribe = () => Promise.reject(new DOMException("Registration failed - push service error", "AbortError"));
        var key = new Uint8Array([4, 1, 2, 3]).buffer;
        cy.then(() => capture(() => worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: key } } }))).then((out) => {
            expect(out.lines.some((l) => l.indexOf("error:") === 0 && l.indexOf("AbortError: Registration failed") !== -1)).to.equal(true);
        });
    });

    it("Tells open pages when a push arrives and when its notification is closed", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        var payload = { title: "Hi", message: "Body", c: { i: MESSAGE_ID, l: "https://x/open", b: [{ t: "One", l: "https://x/1" }] }, custom: 1 };
        cy.then(() => worker.dispatch("push", pushEvent(payload))).then(() => {
            var received = page.messages.filter((m) => m.type === "countly_push_received");
            expect(received.length).to.equal(1);
            expect(received[0]).to.include({ messageId: MESSAGE_ID, title: "Hi", message: "Body", url: "https://x/open" });
            expect(received[0].payload.custom).to.equal(1);
            var shown = worker.self.registration.shown[0];
            return worker.dispatch("notificationclose", { notification: { title: shown.title, body: shown.options.body, data: shown.options.data } });
        }).then(() => {
            var closed = page.messages.filter((m) => m.type === "countly_push_closed");
            expect(closed.length).to.equal(1);
            expect(closed[0].messageId).to.equal(MESSAGE_ID);
            expect(closed[0].title).to.equal("Hi");
        });
    });

    it("Describes a click fully: button title, url, text and payload", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/1", true);
        worker.self.clients.list = [page];
        var payload = { title: "Hi", message: "Body", c: { i: MESSAGE_ID, l: "https://x/open", b: [{ t: "One", l: "https://x/1" }] }, custom: 1 };
        cy.then(() => worker.dispatch("push", pushEvent(payload))).then(() => {
            var shown = worker.self.registration.shown[0];
            return worker.dispatch("notificationclick", { notification: { title: shown.title, body: shown.options.body, data: shown.options.data, close() { } }, action: "btn_1" });
        }).then(() => {
            var action = page.messages.filter((m) => m.type === "countly_push_action")[0];
            expect(action).to.include({ messageId: MESSAGE_ID, buttonIndex: 1, buttonTitle: "One", url: "https://x/1", title: "Hi", message: "Body" });
            expect(action.payload.custom).to.equal(1);
        });
    });

    it("Never opens anything but http(s) URLs", () => {
        var worker = loadWorker(source);
        var click = (url) => worker.dispatch("notificationclick", { notification: { close() { }, data: { i: MESSAGE_ID, l: url, b: [] } }, action: "" });
        cy.then(() => capture(() => click("javascript:alert(1)"))).then(() => click("https://anything.example/page")).then(() => {
            expect(worker.self.clients.opened).to.deep.equal(["https://anything.example/page"]);
        });
    });

    it("Still records a click whose URL it refuses to open, and says why", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        worker.self.clients.list = [page];
        cy.then(() => capture(() => worker.dispatch("notificationclick", { notification: { close() { }, data: { i: MESSAGE_ID, l: "javascript:alert(1)", b: [] } }, action: "" }))).then((out) => {
            expect(worker.self.clients.opened).to.deep.equal([]);
            expect(out.lines.some((l) => l.indexOf("warn:") === 0 && l.indexOf("not opening") !== -1)).to.equal(true);
            expect(page.messages.filter((m) => m.type === "countly_push_action").length).to.equal(1);
        });
    });

    // ---- reporting a click itself when no page is open -----------------------------------------

    const REPORTING_CONFIG = { url: "https://srv.example/i", app_key: "app-key-1", device_id: "device-1", t: 0, sdk_name: "javascript_native_web", sdk_version: SDK_VERSION, av: "1.0" };

    // a worker that a page has already told how to reach the server
    function configuredWorker(setup) {
        var worker = loadWorker(source, (self) => {
            self.fetch = fakeFetch();
            if (setup) {
                setup(self);
            }
        });
        var page = fakeClient("https://x/", true);
        return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => worker);
    }

    function click(worker, action) {
        var data = { i: MESSAGE_ID, l: "https://x/open", b: [{ t: "One", l: "https://x/1" }, { t: "Docs", l: "https://docs.example/" }] };
        return worker.dispatch("notificationclick", { notification: { close() { }, data: data }, action: action || "" });
    }

    // signing the report goes through crypto.subtle, which settles after the dispatch promise in
    // some browsers, so wait for the fetch itself rather than for the event handler
    function untilFetched(worker, attempts) {
        attempts = typeof attempts === "number" ? attempts : 50;
        if (worker.self.fetch.calls.length > 0 || attempts <= 0) {
            return Promise.resolve(worker);
        }
        return new Promise((resolve) => setTimeout(resolve, 20)).then(() => untilFetched(worker, attempts - 1));
    }

    function actionsHandedTo(page) {
        return page.messages.filter((m) => m.type === "countly_push_action");
    }

    it("Records a click itself when no page is open, with what the page told it about the server", () => {
        cy.then(() => configuredWorker()).then((worker) => click(worker, "btn_2").then(() => {
            var calls = worker.self.fetch.calls;
            expect(calls.length).to.equal(1);
            expect(calls[0].url).to.equal("https://srv.example/i");
            expect(calls[0].init.method).to.equal("POST");
            expect(calls[0].init.headers["Content-Type"]).to.equal("application/x-www-form-urlencoded");
            var body = formBody(calls[0]);
            expect(body).to.include({ app_key: "app-key-1", device_id: "device-1", t: "0", sdk_name: "javascript_native_web", sdk_version: SDK_VERSION, av: "1.0" });
            ["timestamp", "hour", "dow", "tz"].forEach((k) => {
                expect(body[k], k).to.match(/^-?\d+$/);
            });
            var events = JSON.parse(body.events);
            expect(events.length).to.equal(1);
            expect(events[0].key).to.equal("[CLY]_push_action");
            expect(events[0].count).to.equal(1);
            expect(events[0].segmentation).to.deep.equal({ i: MESSAGE_ID, b: 2, p: "w" });
            expect(events[0].timestamp).to.be.a("number");
            // the tab this click opens has no SDK on it, so nothing else could have recorded the click
            expect(worker.self.clients.opened).to.deep.equal(["https://docs.example/"]);
            // the next SDK page still hears about the click for its listener, but must not record it again
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                var actions = actionsHandedTo(page);
                expect(actions.length).to.equal(1);
                expect(actions[0].recorded).to.equal(true);
                expect(actions[0].buttonIndex).to.equal(2);
            });
        }));
    });

    it("Hands the click to an open page instead of reporting it itself", () => {
        cy.then(() => configuredWorker()).then((worker) => {
            var page = fakeClient("https://x/other", false);
            worker.self.clients.list = [page];
            return click(worker).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(0);
                var actions = actionsHandedTo(page);
                expect(actions.length).to.equal(1);
                expect(actions[0].recorded).to.not.equal(true);
            });
        });
    });

    it("Keeps the click for a page when the server cannot be reached", () => {
        cy.then(() => configuredWorker((self) => {
            self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
        })).then((worker) => click(worker).then(() => {
            expect(worker.self.fetch.calls.length).to.equal(1);
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                var actions = actionsHandedTo(page);
                expect(actions.length).to.equal(1);
                expect(actions[0].recorded).to.not.equal(true);
            });
        }));
    });

    it("Keeps the click for a page when the server answers with an error", () => {
        cy.then(() => configuredWorker((self) => {
            self.fetch = fakeFetch({ ok: false, status: 400 });
        })).then((worker) => click(worker).then(() => {
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                expect(actionsHandedTo(page).filter((m) => m.recorded !== true).length).to.equal(1);
            });
        }));
    });

    it("Keeps the click for a page while no page has told it about the server", () => {
        var worker = loadWorker(source, (self) => {
            self.fetch = fakeFetch();
        });
        cy.then(() => click(worker)).then(() => {
            expect(worker.self.fetch.calls.length).to.equal(0);
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                expect(actionsHandedTo(page).filter((m) => m.recorded !== true).length).to.equal(1);
            });
        });
    });

    it("Stops reporting when a page withdraws the server details", () => {
        cy.then(() => configuredWorker()).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: null } }).then(() => click(worker)).then(() => {
            expect(worker.self.fetch.calls.length).to.equal(0);
        }));
    });

    it("Signs the report the way the page SDK does when a salt is configured", () => {
        var salt = "pepper";
        cy.then(() => configuredWorker((self) => {
            self.crypto = window.crypto;
        })).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: Object.assign({ salt: salt }, REPORTING_CONFIG) } }).then(() => click(worker)).then(() => untilFetched(worker)).then(() => {
            var subtle = !!(window.crypto && window.crypto.subtle);
            expect(worker.self.fetch.calls.length, "the signed report was sent (SubtleCrypto available: " + subtle + ")").to.equal(1);
            var body = worker.self.fetch.calls[0].init.body;
            var marker = "&checksum256=";
            var at = body.lastIndexOf(marker);
            expect(at).to.be.greaterThan(0);
            var unsigned = body.slice(0, at);
            var checksum = body.slice(at + marker.length);
            // the signed string is the sorted, url-encoded parameter list, as prepareParams builds it
            var keys = unsigned.split("&").map((pair) => pair.split("=")[0]);
            expect(keys).to.deep.equal(keys.slice().sort());
            expect(keys).to.not.include("salt");
            return crypto.subtle.digest("SHA-256", new TextEncoder().encode(unsigned + salt)).then((digest) => {
                var expected = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
                expect(checksum).to.equal(expected);
            });
        }));
    });

    // ---- surviving a worker restart (IndexedDB) ----------------------------------------------

    function deleteDb() {
        return new Promise((resolve) => {
            var request = indexedDB.deleteDatabase("countly_push");
            request.onsuccess = request.onerror = request.onblocked = () => resolve();
        });
    }

    // a worker with the browser's real IndexedDB, as in production; a fresh loadWorker() stands for
    // the browser stopping the worker and starting it again later, with empty memory
    function persistentWorker(setup) {
        return loadWorker(source, (self) => {
            self.indexedDB = window.indexedDB;
            self.fetch = fakeFetch();
            if (setup) {
                setup(self);
            }
        });
    }

    it("Keeps pending clicks and the server details across a worker restart", () => {
        cy.then(() => deleteDb()).then(() => {
            var first = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var page = fakeClient("https://x/", true);
            return first.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => click(first, "btn_1")).then(() => {
                var second = persistentWorker();
                var later = fakeClient("https://x/", true);
                return second.dispatch("message", { data: { type: "countly_push_ready" }, source: later }).then(() => {
                    var actions = actionsHandedTo(later);
                    expect(actions.length).to.equal(1);
                    expect(actions[0].buttonIndex).to.equal(1);
                    expect(actions[0].recorded).to.not.equal(true);
                    return second.dispatch("message", { data: { type: "countly_push_ack", aid: actions[0].aid } });
                }).then(() => click(second, "btn_2")).then(() => {
                    // the restarted worker also still knows how to reach the server
                    expect(second.self.fetch.calls.length).to.equal(1);
                    expect(formBody(second.self.fetch.calls[0]).app_key).to.equal("app-key-1");
                    var third = persistentWorker();
                    var last = fakeClient("https://x/", true);
                    return third.dispatch("message", { data: { type: "countly_push_ready" }, source: last }).then(() => {
                        // the acknowledged click is gone; the one recorded directly is only there for the listener
                        expect(actionsHandedTo(last).map((m) => m.recorded)).to.deep.equal([true]);
                    });
                });
            });
        });
    });

    it("Bounds the persisted queue to the newest CLY_MAX_PENDING clicks", () => {
        cy.then(() => deleteDb()).then(() => {
            // no server details, so every click is kept for a page
            var worker = persistentWorker();
            var chain = Promise.resolve();
            for (let n = 0; n <= pushConstants.MAX_SEEN_ACTION_IDS; n++) {
                const id = MESSAGE_ID.slice(0, 22) + String(n).padStart(2, "0");
                chain = chain.then(() => worker.dispatch("notificationclick", { notification: { close() { }, data: { i: id, l: "https://x/open", b: [] } }, action: "" }));
            }
            return chain.then(() => {
                var restarted = persistentWorker();
                var page = fakeClient("https://x/", true);
                return restarted.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                    var ids = actionsHandedTo(page).map((m) => m.messageId.slice(-2));
                    expect(ids.length).to.equal(pushConstants.MAX_SEEN_ACTION_IDS);
                    expect(ids).to.include(String(pushConstants.MAX_SEEN_ACTION_IDS).padStart(2, "0"));
                });
            });
        });
    });

    it("Keeps the server details and pending clicks of each worker scope apart", () => {
        cy.then(() => deleteDb()).then(() => {
            // two apps on one site, each with a worker of its own scope; the workers share one IndexedDB
            var shopA = persistentWorker((self) => {
                self.registration.scope = "https://x/a/";
            });
            var shopB = persistentWorker((self) => {
                self.registration.scope = "https://x/b/";
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var pageA = fakeClient("https://x/a/", true);
            var pageB = fakeClient("https://x/b/", true);
            return shopA.dispatch("message", { data: { type: "countly_push_ready", config: Object.assign({}, REPORTING_CONFIG, { app_key: "app-a" }) }, source: pageA })
                .then(() => shopB.dispatch("message", { data: { type: "countly_push_ready", config: Object.assign({}, REPORTING_CONFIG, { app_key: "app-b" }) }, source: pageB }))
                .then(() => click(shopB, "btn_1"))
                .then(() => click(shopA))
                .then(() => {
                    expect(shopA.self.fetch.calls.length).to.equal(1);
                    expect(formBody(shopA.self.fetch.calls[0]).app_key).to.equal("app-a");
                    var laterA = fakeClient("https://x/a/", true);
                    var laterB = fakeClient("https://x/b/", true);
                    return shopA.dispatch("message", { data: { type: "countly_push_ready" }, source: laterA })
                        .then(() => shopB.dispatch("message", { data: { type: "countly_push_ready" }, source: laterB }))
                        .then(() => {
                            expect(actionsHandedTo(laterA).map((m) => m.recorded)).to.deep.equal([true]);
                            expect(actionsHandedTo(laterB).map((m) => m.buttonIndex)).to.deep.equal([1]);
                        });
                });
        });
    });

    it("Leaves its server details alone when a page meant them for the worker of another scope", () => {
        cy.then(() => deleteDb()).then(() => {
            // one page runs two apps; B has no worker of its own yet, so its messages reach A's worker
            var shopA = persistentWorker((self) => {
                self.registration.scope = "https://x/a/";
            });
            var page = fakeClient("https://x/a/", true);
            return shopA.dispatch("message", { data: { type: "countly_push_ready", config: Object.assign({}, REPORTING_CONFIG, { app_key: "app-a" }), scope: "https://x/a/" }, source: page })
                .then(() => shopA.dispatch("message", { data: { type: "countly_push_ready", config: Object.assign({}, REPORTING_CONFIG, { app_key: "app-b" }), scope: "https://x/b/" }, source: page }))
                .then(() => click(shopA))
                .then(() => {
                    expect(shopA.self.fetch.calls.length).to.equal(1);
                    expect(formBody(shopA.self.fetch.calls[0]).app_key).to.equal("app-a");
                    return shopA.dispatch("message", { data: { type: "countly_push_config", config: null, scope: "https://x/b/" } });
                })
                .then(() => click(shopA, "btn_1"))
                .then(() => {
                    expect(shopA.self.fetch.calls.length).to.equal(2);
                    expect(formBody(shopA.self.fetch.calls[1]).app_key).to.equal("app-a");
                });
        });
    });

    // ---- handing kept clicks over: one page at a time, at the time they were made ------------

    function announce(worker, page) {
        return worker.dispatch("message", { data: { type: "countly_push_ready" }, source: page });
    }

    it("Keeps a click before sending it, so a worker stopped mid-request leaves it to the next page", () => {
        cy.then(() => deleteDb()).then(() => {
            var timers = manualTimers();
            // a request still on its way when the browser stops the worker
            var first = persistentWorker((self) => {
                self.setTimeout = timers.setTimeout;
                self.clearTimeout = timers.clearTimeout;
                self.fetch = fakeFetch(() => new Promise(() => { }));
            });
            var page = fakeClient("https://x/", true);
            return first.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => {
                click(first, "btn_1");
                return untilFetched(first);
            }).then(() => {
                var restarted = persistentWorker();
                var later = fakeClient("https://x/", true);
                return announce(restarted, later).then(() => {
                    var actions = actionsHandedTo(later);
                    expect(actions.length).to.equal(1);
                    expect(actions[0].buttonIndex).to.equal(1);
                    expect(actions[0].recorded).to.not.equal(true);
                });
            });
        });
    });

    it("Gives up on a server that does not answer and leaves the click to the next page", () => {
        var timers = manualTimers();
        cy.then(() => configuredWorker((self) => {
            self.setTimeout = timers.setTimeout;
            self.clearTimeout = timers.clearTimeout;
            self.AbortController = window.AbortController;
            self.fetch = fakeFetch(() => new Promise(() => { }));
        })).then((worker) => {
            var settled = false;
            click(worker).then(() => {
                settled = true;
            });
            return untilFetched(worker).then(() => {
                // the deadline passes without an answer
                timers.runAll();
                return new Promise((resolve) => setTimeout(resolve, 50));
            }).then(() => {
                expect(settled).to.equal(true);
                expect(worker.self.fetch.calls[0].init.signal.aborted).to.equal(true);
                var page = fakeClient("https://x/", true);
                return announce(worker, page).then(() => {
                    var actions = actionsHandedTo(page);
                    expect(actions.length).to.equal(1);
                    expect(actions[0].recorded).to.not.equal(true);
                });
            });
        });
    });

    it("Hands a click it is still sending to a page announcing itself only once the server has answered", () => {
        var answer = null;
        cy.then(() => configuredWorker((self) => {
            self.fetch = fakeFetch(() => new Promise((resolve) => {
                answer = resolve;
            }));
        })).then((worker) => {
            var page = fakeClient("https://x/", true);
            var clicked = click(worker);
            return untilFetched(worker).then(() => {
                // the window this click opened loads while the worker still waits for the server
                var announced = announce(worker, page);
                setTimeout(() => answer({ ok: true }), 50);
                return Promise.all([clicked, announced]);
            }).then(() => {
                var actions = actionsHandedTo(page);
                expect(actions.length).to.equal(1);
                expect(actions[0].recorded).to.equal(true);
            });
        });
    });

    it("Sends the click it records itself without an event id or a view id", () => {
        cy.then(() => configuredWorker()).then((worker) => click(worker, "btn_1").then(() => {
            var event = JSON.parse(formBody(worker.self.fetch.calls[0]).events)[0];
            expect(Object.keys(event).sort()).to.deep.equal(["count", "dow", "hour", "key", "segmentation", "timestamp"]);
        }));
    });

    it("Keeps the click for a page, and says why, when the request for it cannot be built", () => {
        // a lone surrogate cannot be URL-encoded, so building the request throws before anything is sent
        var config = Object.assign({}, REPORTING_CONFIG, { device_id: "device-\uD83D" });
        var reason = null;
        try {
            encodeURIComponent(config.device_id);
        }
        catch (err) {
            // the browser's own error type and wording; the wording differs between engines
            reason = err.name + ": " + err.message;
        }
        cy.then(() => configuredWorker((self) => {
            self.COUNTLY_PUSH_DEBUG = true;
        })).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: config } }).then(() => capture(() => click(worker))).then((out) => {
            expect(reason).to.be.a("string");
            expect(out.lines.some((l) => l.indexOf("[Countly]") !== -1 && l.indexOf(reason) !== -1)).to.equal(true);
            var page = fakeClient("https://x/", true);
            return announce(worker, page).then(() => {
                var actions = actionsHandedTo(page);
                expect(actions.length).to.equal(1);
                expect(actions[0].recorded).to.not.equal(true);
            });
        }));
    });

    it("Hands a kept click to one page at a time when several announce themselves together", () => {
        var timers = manualTimers();
        // no server details, so the click is kept for a page
        var worker = loadWorker(source, (self) => {
            self.setTimeout = timers.setTimeout;
            self.clearTimeout = timers.clearTimeout;
        });
        var first = fakeClient("https://x/a", false);
        var second = fakeClient("https://x/b", false);
        cy.then(() => click(worker)).then(() => announce(worker, first)).then(() => announce(worker, second)).then(() => {
            expect(actionsHandedTo(first).length).to.equal(1);
            expect(actionsHandedTo(second).length).to.equal(0);
            // the page holding it announces itself again once push consent is given
            return announce(worker, first);
        }).then(() => {
            expect(actionsHandedTo(first).length).to.equal(2);
            // that page never acknowledged it, so once the window has passed the next page gets it
            timers.runAll();
            return announce(worker, second);
        }).then(() => {
            expect(actionsHandedTo(second).length).to.equal(1);
        });
    });

    // the browser's IndexedDB, rolling back each write for which refuse(storeName, op, value) is true
    function refusingWrites(refuse) {
        return {
            open(name, version) {
                var request = window.indexedDB.open(name, version);
                request.addEventListener("success", () => {
                    var db = request.result;
                    var transaction = db.transaction.bind(db);
                    db.transaction = (storeName, mode) => {
                        var tx = transaction(storeName, mode);
                        if (mode !== "readwrite") {
                            return tx;
                        }
                        var objectStore = tx.objectStore.bind(tx);
                        tx.objectStore = (n) => {
                            var store = objectStore(n);
                            ["put", "delete"].forEach((op) => {
                                var original = store[op].bind(store);
                                store[op] = function (value) {
                                    var pending = original.apply(null, arguments);
                                    if (refuse(storeName, op, value)) {
                                        tx.abort();
                                    }
                                    return pending;
                                };
                            });
                            return store;
                        };
                        return tx;
                    };
                });
                return request;
            }
        };
    }

    // a worker that was told about device-1 while IndexedDB worked, before failing.ops took effect
    function workerWithFailingSaves(failing) {
        var worker = persistentWorker((self) => {
            self.indexedDB = refusingWrites((storeName, op) => storeName === "config" && failing.ops.indexOf(op) !== -1);
        });
        var page = fakeClient("https://x/", true);
        return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => worker);
    }

    it("Reports with the newest server details even when saving them failed", () => {
        var failing = { ops: [] };
        cy.then(() => deleteDb()).then(() => workerWithFailingSaves(failing)).then((worker) => {
            failing.ops = ["put"];
            return worker.dispatch("message", { data: { type: "countly_push_config", config: Object.assign({}, REPORTING_CONFIG, { device_id: "device-2" }) } }).then(() => click(worker)).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(1);
                expect(formBody(worker.self.fetch.calls[0]).device_id).to.equal("device-2");
            });
        });
    });

    it("Stops reporting once the page withdrew the details, even when forgetting them failed", () => {
        var failing = { ops: [] };
        cy.then(() => deleteDb()).then(() => workerWithFailingSaves(failing)).then((worker) => {
            failing.ops = ["delete"];
            return worker.dispatch("message", { data: { type: "countly_push_config", config: null } }).then(() => click(worker)).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(0);
            });
        });
    });

    it("Leaves a restarted worker no details rather than the ones it failed to replace", () => {
        var failing = { ops: [] };
        cy.then(() => deleteDb()).then(() => workerWithFailingSaves(failing)).then((worker) => {
            failing.ops = ["put"];
            return worker.dispatch("message", { data: { type: "countly_push_config", config: Object.assign({}, REPORTING_CONFIG, { device_id: "device-2" }) } });
        }).then(() => {
            var restarted = persistentWorker();
            return click(restarted).then(() => {
                expect(restarted.self.fetch.calls.length).to.equal(0);
                var page = fakeClient("https://x/", true);
                return restarted.dispatch("message", { data: { type: "countly_push_ready" }, source: page }).then(() => {
                    expect(actionsHandedTo(page).filter((m) => m.recorded !== true).length).to.equal(1);
                });
            });
        });
    });

    it("Does not hand back a click it sent itself as unrecorded when saving that mark failed", () => {
        cy.then(() => deleteDb()).then(() => {
            // IndexedDB takes the click, then refuses the write that marks it recorded
            var worker = persistentWorker((self) => {
                self.indexedDB = refusingWrites((storeName, op, value) => storeName === "actions" && op === "put" && !!value && value.recorded === true);
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => click(worker)).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(1);
                var later = fakeClient("https://x/", true);
                return announce(worker, later).then(() => {
                    expect(actionsHandedTo(later).map((m) => m.recorded)).to.deep.equal([true]);
                });
            });
        });
    });

    it("Leaves a restarted worker no unrecorded copy of a click it sent itself when saving that mark failed", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.indexedDB = refusingWrites((storeName, op, value) => storeName === "actions" && op === "put" && !!value && value.recorded === true);
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page }).then(() => click(worker)).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(1);
                // browsers stop idle workers within seconds, so the next page usually talks to a fresh one
                var restarted = persistentWorker();
                var later = fakeClient("https://x/", true);
                return announce(restarted, later).then(() => {
                    expect(actionsHandedTo(later).filter((m) => m.recorded !== true)).to.deep.equal([]);
                });
            });
        });
    });

    it("Does not hand a click over again once a page confirmed it, even when forgetting it failed", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.indexedDB = refusingWrites((storeName, op) => storeName === "actions" && op === "delete");
            });
            var page = fakeClient("https://x/", true);
            worker.self.clients.list = [page];
            return click(worker).then(() => {
                var handed = actionsHandedTo(page);
                expect(handed.length).to.equal(1);
                return worker.dispatch("message", { data: { type: "countly_push_ack", aid: handed[0].aid } });
            }).then(() => {
                var later = fakeClient("https://x/", true);
                return announce(worker, later).then(() => {
                    expect(actionsHandedTo(later)).to.deep.equal([]);
                });
            });
        });
    });

    // the browser's IndexedDB, keeping every connection the worker opened
    function recordingConnections() {
        var connections = [];
        return {
            connections: connections,
            open(name, version) {
                var request = window.indexedDB.open(name, version);
                request.addEventListener("success", () => {
                    connections.push(request.result);
                });
                return request;
            }
        };
    }

    // the buttons of the clicks a newly started worker finds in IndexedDB and hands to the next page
    function keptForNextPage() {
        var restarted = persistentWorker();
        var later = fakeClient("https://x/", true);
        return announce(restarted, later).then(() => actionsHandedTo(later).map((m) => m.buttonIndex));
    }

    it("Opens IndexedDB once for everything it stores and reads", () => {
        var idb = recordingConnections();
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.indexedDB = idb;
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page })
                .then(() => worker.dispatch("message", { data: { type: "countly_push_config", config: REPORTING_CONFIG } }))
                .then(() => click(worker, "btn_1"))
                .then(() => click(worker, "btn_2"))
                .then(() => {
                    expect(idb.connections.length).to.equal(1);
                    return keptForNextPage();
                })
                .then((kept) => {
                    expect(kept).to.deep.equal([1, 2]);
                });
        });
    });

    it("Lets another context delete the database while it holds its connection, and stores in the new one", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page })
                .then(() => new Promise((resolve) => {
                    // a deletion waits for every open connection to close, an upgrade by a newer worker as well
                    var request = indexedDB.deleteDatabase("countly_push");
                    request.onsuccess = () => resolve("deleted");
                    request.onerror = () => resolve("failed");
                    request.onblocked = () => resolve("blocked");
                }))
                .then((outcome) => {
                    expect(outcome).to.equal("deleted");
                    return click(worker, "btn_1");
                })
                .then(() => keptForNextPage())
                .then((kept) => {
                    expect(kept).to.deep.equal([1]);
                });
        });
    });

    it("Opens a new connection when the one it holds was closed under it", () => {
        var idb = recordingConnections();
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.indexedDB = idb;
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG }, source: page })
                .then(() => {
                    // as the browser does while the site's data is being cleared
                    idb.connections[0].close();
                    return click(worker, "btn_1");
                })
                .then(() => {
                    expect(idb.connections.length).to.equal(2);
                    return keptForNextPage();
                })
                .then((kept) => {
                    expect(kept).to.deep.equal([1]);
                });
        });
    });

    // ---- registering a subscription the browser replaced --------------------------------------

    // the app's VAPID public key as the dashboard hands it out: 0x04, then 64 bytes (all 7 here)
    const VAPID_KEY = "BAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc";
    const VAPID_BYTES = new Uint8Array([4].concat(new Array(64).fill(7)));
    // another push provider's key, sharing the registration inside a host worker
    const OTHER_KEY_BYTES = new Uint8Array([4].concat(new Array(64).fill(9)));

    // a worker whose page has registered a subscription made with VAPID_KEY
    function registeredWorker(setup) {
        return configuredWorker(setup).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: Object.assign({ vapid_key: VAPID_KEY }, REPORTING_CONFIG) } }).then(() => worker));
    }

    it("Registers the subscription the browser replaced itself, with what the page told it about the server", () => {
        cy.then(() => registeredWorker()).then((worker) => worker.dispatch("pushsubscriptionchange", { oldSubscription: { endpoint: "https://push.example/old", options: { applicationServerKey: VAPID_BYTES.buffer } } }).then(() => {
            var calls = worker.self.fetch.calls;
            expect(calls.length).to.equal(1);
            expect(calls[0].url).to.equal("https://srv.example/i");
            expect(calls[0].init.method).to.equal("POST");
            var body = formBody(calls[0]);
            expect(body).to.include({ token_session: "1", token_provider: "WEB", app_key: "app-key-1", device_id: "device-1", t: "0", sdk_name: "javascript_native_web", sdk_version: SDK_VERSION, av: "1.0" });
            expect(JSON.parse(body.web_token)).to.deep.equal({ endpoint: "https://push.example/new", expirationTime: null, keys: { p256dh: "p256dh-new", auth: "auth-new" } });
        }));
    });

    it("Subscribes again with the registered key when Chrome dropped the subscription without saying which", () => {
        cy.then(() => registeredWorker()).then((worker) => {
            var page = fakeClient("https://x/", true);
            worker.self.clients.list = [page];
            // Chrome 138+ after the permission was revoked and granted again: neither subscription attached
            return worker.dispatch("pushsubscriptionchange", {}).then(() => {
                var calls = worker.self.registration.pushManager.subscribeCalls;
                expect(calls.length).to.equal(1);
                expect(calls[0].userVisibleOnly).to.equal(true);
                expect(Array.from(new Uint8Array(calls[0].applicationServerKey))).to.deep.equal(Array.from(VAPID_BYTES));
                expect(worker.self.fetch.calls.length).to.equal(1);
                expect(JSON.parse(formBody(worker.self.fetch.calls[0]).web_token).endpoint).to.equal("https://push.example/new");
                expect(page.messages.filter((m) => m.type === "countly_push_subscription_change").length).to.equal(1);
            });
        });
    });

    it("Reads a registered key that still carries the line break it was configured with", () => {
        cy.then(() => configuredWorker()).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: Object.assign({ vapid_key: " " + VAPID_KEY + "\r\n" }, REPORTING_CONFIG) } }).then(() => {
            return worker.dispatch("pushsubscriptionchange", {});
        }).then(() => {
            var calls = worker.self.registration.pushManager.subscribeCalls;
            expect(calls.length).to.equal(1);
            expect(Array.from(new Uint8Array(calls[0].applicationServerKey))).to.deep.equal(Array.from(VAPID_BYTES));
            expect(worker.self.fetch.calls.length).to.equal(1);
        }));
    });

    it("Registers only Countly's own subscription", () => {
        cy.then(() => registeredWorker()).then((worker) => worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: OTHER_KEY_BYTES.buffer } } }).then(() => {
            expect(worker.self.registration.pushManager.subscribeCalls.length).to.equal(1);
            expect(worker.self.fetch.calls.length).to.equal(0);
        })).then(() => configuredWorker()).then((worker) => worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: VAPID_BYTES.buffer } } }).then(() => {
            // details from a page SDK that does not say which key is Countly's prove nothing
            expect(worker.self.fetch.calls.length).to.equal(0);
        }));
    });

    it("Still tells the open pages when the server cannot take the new subscription", () => {
        cy.then(() => registeredWorker((self) => {
            self.fetch = fakeFetch(() => Promise.reject(new TypeError("Failed to fetch")));
        })).then((worker) => {
            var page = fakeClient("https://x/", true);
            worker.self.clients.list = [page];
            return worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: VAPID_BYTES.buffer } } }).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(1);
                expect(page.messages.filter((m) => m.type === "countly_push_subscription_change").length).to.equal(1);
            });
        });
    });

    it("Still tells the open pages when the new subscription cannot even be put into a request", () => {
        cy.then(() => configuredWorker()).then((worker) => {
            var page = fakeClient("https://x/", true);
            worker.self.clients.list = [page];
            // a lone surrogate, which encodeURIComponent refuses while the request is built
            var details = Object.assign({}, REPORTING_CONFIG, { vapid_key: VAPID_KEY, device_id: "device-\uD800" });
            return worker.dispatch("message", { data: { type: "countly_push_config", config: details } }).then(() => {
                return worker.dispatch("pushsubscriptionchange", { oldSubscription: { options: { applicationServerKey: VAPID_BYTES.buffer } } });
            }).then(() => {
                expect(worker.self.fetch.calls.length).to.equal(0);
                expect(page.messages.filter((m) => m.type === "countly_push_subscription_change").length).to.equal(1);
            });
        });
    });

    // ---- writing down whose click it is --------------------------------------------------------

    it("Writes down with a click it keeps whose server details it held when the click was made", () => {
        cy.then(() => configuredWorker((self) => {
            self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
        })).then((worker) => click(worker).then(() => {
            var page = fakeClient("https://x/", true);
            return announce(worker, page).then(() => {
                expect(actionsHandedTo(page)[0].owner).to.deep.equal({ device_id: "device-1", t: 0, recordable: true });
            });
        }));
    });

    it("Writes down the user a page named while it withheld the server details", () => {
        var worker = loadWorker(source, (self) => {
            self.fetch = fakeFetch();
        });
        var page = fakeClient("https://x/", true);
        // a page whose cookie banner has not been answered yet: no details, but a user
        cy.then(() => worker.dispatch("message", { data: { type: "countly_push_ready", config: null, owner: { device_id: "device-1", t: 0 } }, source: page })).then(() => click(worker)).then(() => {
            expect(worker.self.fetch.calls.length).to.equal(0);
            var later = fakeClient("https://x/", true);
            return announce(worker, later).then(() => {
                expect(actionsHandedTo(later)[0].owner).to.deep.equal({ device_id: "device-1", t: 0 });
            });
        });
    });

    it("Marks a click made while the visitor was opted out as one no page may record", () => {
        cy.then(() => configuredWorker()).then((worker) => worker.dispatch("message", { data: { type: "countly_push_config", config: null, owner: null } }).then(() => click(worker)).then(() => {
            var page = fakeClient("https://x/", true);
            return announce(worker, page).then(() => {
                expect(actionsHandedTo(page)[0]).to.have.property("owner", null);
            });
        }));
    });

    it("Still knows whose clicks they are after the browser restarted it", () => {
        cy.then(() => deleteDb()).then(() => {
            var first = persistentWorker();
            var page = fakeClient("https://x/", true);
            return first.dispatch("message", { data: { type: "countly_push_ready", config: null, owner: { device_id: "device-1", t: 0 } }, source: page }).then(() => {
                var restarted = persistentWorker();
                return click(restarted).then(() => {
                    var later = fakeClient("https://x/", true);
                    return announce(restarted, later).then(() => {
                        expect(actionsHandedTo(later)[0].owner).to.deep.equal({ device_id: "device-1", t: 0 });
                    });
                });
            });
        });
    });

    it("Writes down no user for a click once a page that does not name one took over", () => {
        var worker = loadWorker(source);
        var page = fakeClient("https://x/", true);
        cy.then(() => worker.dispatch("message", { data: { type: "countly_push_ready", config: null, owner: { device_id: "device-1", t: 0 } }, source: page }))
            // an older page SDK in another tab withdraws the details without naming its user
            .then(() => worker.dispatch("message", { data: { type: "countly_push_config", config: null } }))
            .then(() => click(worker))
            .then(() => {
                var later = fakeClient("https://x/", true);
                return announce(worker, later).then(() => {
                    expect(actionsHandedTo(later)[0]).to.not.have.property("owner");
                });
            });
    });

    // ---- keeping everything in memory for a site that stores nothing ---------------------------

    // the config keys and kept clicks IndexedDB holds, or null without a database; never creates one
    function storedRecords() {
        return indexedDB.databases().then((databases) => {
            if (!databases.some((db) => db.name === "countly_push")) {
                return null;
            }
            return new Promise((resolve, reject) => {
                var request = indexedDB.open("countly_push");
                request.onsuccess = () => {
                    var db = request.result;
                    var transaction = db.transaction(["actions", "config"], "readonly");
                    var stored = {};
                    transaction.objectStore("config").getAllKeys().onsuccess = (event) => {
                        stored.config = event.target.result;
                    };
                    transaction.objectStore("actions").getAll().onsuccess = (event) => {
                        stored.actions = event.target.result;
                    };
                    transaction.oncomplete = () => {
                        db.close();
                        resolve(stored);
                    };
                    transaction.onabort = () => {
                        db.close();
                        reject(transaction.error);
                    };
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    // a page of a site that runs the SDK with storage "none"
    function memoryOnlyReady(config) {
        return { type: "countly_push_ready", config: config, owner: { device_id: config ? config.device_id : "device-1", t: 0 }, persist: false };
    }

    it("Keeps the server details and kept clicks in memory only when the page stores nothing", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.registration.scope = "https://x/";
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            var page = fakeClient("https://x/", true);
            return worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: page })
                .then(() => click(worker, "btn_1"))
                .then(() => storedRecords())
                .then((stored) => {
                    expect(worker.self.fetch.calls.length).to.equal(1);
                    expect(stored).to.equal(null);
                    var later = fakeClient("https://x/", true);
                    return worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: later }).then(() => {
                        expect(actionsHandedTo(later).map((m) => m.buttonIndex)).to.deep.equal([1]);
                    });
                });
        });
    });

    it("Deletes what an earlier life stored also when its URL already says the site stores nothing, handing over the clicks kept there", () => {
        cy.then(() => deleteDb()).then(() => {
            // while the site still stored, the worker kept its details, whose clicks they are and a click no page took yet
            var before = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            return before.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG, owner: { device_id: "device-1", t: 0 } }, source: fakeClient("https://x/", true) })
                .then(() => click(before, "btn_1"))
                .then(() => {
                    // the site switched to storage "none", so the browser installed the worker again under its new URL
                    var after = persistentWorker((self) => {
                        self.location = { href: "https://x/countly_sw.js?cly_persist=0" };
                        self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
                    });
                    var page = fakeClient("https://x/", true);
                    return after.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: page }).then(() => storedRecords()).then((stored) => {
                        expect(stored).to.deep.equal({ config: [], actions: [] });
                        expect(actionsHandedTo(page).map((m) => m.buttonIndex)).to.deep.equal([1]);
                    });
                });
        });
    });

    it("Deletes what its own scope stored once a page asks it to keep everything in memory, handing over the clicks kept there", () => {
        cy.then(() => deleteDb()).then(() => {
            var offline = (self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            };
            var shopA = persistentWorker((self) => {
                self.registration.scope = "https://x/a/";
                offline(self);
            });
            var shopB = persistentWorker((self) => {
                self.registration.scope = "https://x/b/";
                offline(self);
            });
            var detailsA = Object.assign({}, REPORTING_CONFIG, { app_key: "app-a" });
            var detailsB = Object.assign({}, REPORTING_CONFIG, { app_key: "app-b" });
            return shopA.dispatch("message", { data: { type: "countly_push_ready", config: detailsA, owner: { device_id: "device-1", t: 0 } }, source: fakeClient("https://x/a/", true) })
                .then(() => shopB.dispatch("message", { data: { type: "countly_push_ready", config: detailsB, owner: { device_id: "device-1", t: 0 } }, source: fakeClient("https://x/b/", true) }))
                .then(() => click(shopA, "btn_1"))
                .then(() => click(shopB, "btn_2"))
                .then(() => {
                    // B's site switches to storage "none", and its worker restarts with empty memory
                    var restartedB = persistentWorker((self) => {
                        self.registration.scope = "https://x/b/";
                        offline(self);
                    });
                    var pageB = fakeClient("https://x/b/", true);
                    return restartedB.dispatch("message", { data: memoryOnlyReady(detailsB), source: pageB }).then(() => storedRecords()).then((stored) => {
                        expect(stored.config).to.deep.equal(["owner https://x/a/", "reporting https://x/a/"]);
                        expect(stored.actions.map((action) => action.scope)).to.deep.equal(["https://x/a/"]);
                        expect(actionsHandedTo(pageB).map((m) => m.buttonIndex)).to.deep.equal([2]);
                    });
                });
        });
    });

    [
        ["its URL", (self) => {
            self.location = { href: "https://x/countly_sw.js?cly_persist=0" };
        }],
        ["the host worker", (self) => {
            self.COUNTLY_PUSH_PERSIST = false;
        }]
    ].forEach(([who, setup]) => {
        it("Keeps a click in memory only from its start when " + who + " says the site stores nothing", () => {
            cy.then(() => deleteDb()).then(() => {
                var worker = persistentWorker(setup);
                return click(worker, "btn_1").then(() => storedRecords()).then((stored) => {
                    expect(stored).to.equal(null);
                    var opened = fakeClient("https://x/open", true);
                    return worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: opened }).then(() => {
                        expect(actionsHandedTo(opened).map((m) => m.buttonIndex)).to.deep.equal([1]);
                        return storedRecords();
                    }).then((after) => {
                        expect(after).to.equal(null);
                    });
                });
            });
        });
    });

    it("Stores in IndexedDB again only once a page that may store hands over its details", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            return worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: fakeClient("https://x/", true) })
                // an older page SDK announces itself without a word about the details
                .then(() => announce(worker, fakeClient("https://x/", true)))
                .then(() => click(worker, "btn_1"))
                .then(() => storedRecords())
                .then((stored) => {
                    expect(stored).to.equal(null);
                    // a page of the site that stores, or a page SDK that does not know about storage "none"
                    return worker.dispatch("message", { data: { type: "countly_push_config", config: REPORTING_CONFIG } });
                })
                .then(() => click(worker, "btn_2"))
                .then(() => storedRecords())
                .then((stored) => {
                    expect(stored, "stored again").to.not.equal(null);
                    expect(stored.config).to.deep.equal(["reporting"]);
                    expect(stored.actions.map((action) => action.buttonIndex)).to.deep.equal([2]);
                });
        });
    });

    it("Deletes what it stored when a page that withdraws the details asks for memory only", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG, owner: { device_id: "device-1", t: 0 } }, source: fakeClient("https://x/", true) })
                .then(() => click(worker, "btn_1"))
                // the visitor opts out on a page that runs with storage "none"
                .then(() => worker.dispatch("message", { data: { type: "countly_push_config", config: null, owner: null, persist: false } }))
                .then(() => storedRecords())
                .then((stored) => {
                    expect(stored).to.deep.equal({ config: [], actions: [] });
                    var later = fakeClient("https://x/", true);
                    return announce(worker, later).then(() => {
                        expect(actionsHandedTo(later).map((m) => m.buttonIndex)).to.deep.equal([1]);
                    });
                });
        });
    });

    it("Stores nothing more once a page asks for memory only, though its connection is still open", () => {
        cy.then(() => deleteDb()).then(() => {
            var worker = persistentWorker((self) => {
                self.fetch = fakeFetch(() => Promise.reject(new Error("offline")));
            });
            return worker.dispatch("message", { data: { type: "countly_push_ready", config: REPORTING_CONFIG, owner: { device_id: "device-1", t: 0 } }, source: fakeClient("https://x/", true) })
                .then(() => worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: fakeClient("https://x/", true) }))
                .then(() => click(worker, "btn_1"))
                .then(() => storedRecords())
                .then((stored) => {
                    expect(stored).to.deep.equal({ config: [], actions: [] });
                    var later = fakeClient("https://x/", true);
                    return worker.dispatch("message", { data: memoryOnlyReady(REPORTING_CONFIG), source: later }).then(() => {
                        expect(actionsHandedTo(later).map((m) => m.buttonIndex)).to.deep.equal([1]);
                    });
                });
        });
    });
});
