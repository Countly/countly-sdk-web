/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper.js");
const { SDK_VERSION, pushConstants } = require("../support/sdk-modules/Constants.js");
const { loadWorker, fakeClient, fakeFetch, formBody } = require("../support/push_worker.js");
// Releases whose service worker this SDK is also tested with, kept by npm run sync:web from what
// countly-sdk-web committed: sites serve their own copy of countly_sw.js, so a page can meet an
// older worker after any SDK upgrade.
const RELEASED_WORKERS = require("../fixtures/released_workers.json");

// An uncompressed P-256 public key is 65 bytes starting with 0x04. Two distinct keys let us
// exercise the "operator rotated the VAPID keypair" path.
function fakeVapidKey(fill) {
    var bytes = new Uint8Array(65);
    bytes[0] = 4;
    for (var i = 1; i < 65; i++) {
        bytes[i] = fill;
    }
    var binary = "";
    for (var j = 0; j < bytes.length; j++) {
        binary += String.fromCharCode(bytes[j]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const VAPID_KEY = fakeVapidKey(7);
const OTHER_VAPID_KEY = fakeVapidKey(9);
const MESSAGE_ID = "507f1f77bcf86cd799439011";
// the default worker scope: the folder countly-push/ next to the worker file
const COUNTLY_SCOPE = new URL("/countly-push/", location.href).href;
const ROOT_SCOPE = new URL("/", location.href).href;

// Push needs a real ServiceWorkerContainer, a PushManager and Notification, none of which can be
// driven from a spec. The whole surface the SDK touches is replaced with a fake so every branch
// (permission, rotation, unsubscribe) is reachable, then restored afterwards.
var push = null;

function keyToBytes(base64Url) {
    var padded = base64Url + "=".repeat((4 - base64Url.length % 4) % 4);
    var raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

function installPushMocks() {
    var state = {
        permission: "granted",
        subscription: null,
        subscribeCalls: 0,
        unsubscribeCalls: 0,
        updateCalls: 0,
        registerCalls: [],
        getRegistrationScopes: [],
        registeredScopeWorker: null,
        callOrder: [],
        messageListeners: [],
        controllerChangeListeners: [],
        controllerMessages: [],
        nextRegistration: null,
        restore: []
    };

    var pushManager = {
        getSubscription: () => Promise.resolve(state.subscription),
        subscribe: (options) => {
            state.subscribeCalls++;
            state.subscription = {
                endpoint: "https://push.example/endpoint" + state.subscribeCalls,
                expirationTime: null,
                options: { userVisibleOnly: true, applicationServerKey: options.applicationServerKey.buffer.slice(0) },
                toJSON() {
                    return { endpoint: this.endpoint, expirationTime: null, keys: { p256dh: "p256dh", auth: "auth" } };
                },
                unsubscribe: () => {
                    state.unsubscribeCalls++;
                    state.subscription = null;
                    return Promise.resolve(true);
                }
            };
            return Promise.resolve(state.subscription);
        }
    };
    state.pushManager = pushManager;
    var registration = { scope: COUNTLY_SCOPE, pushManager: pushManager, active: { scriptURL: new URL("/countly_sw.js", location.href).href } };
    registration.update = () => {
        state.updateCalls++;
        return Promise.resolve(registration);
    };

    var container = {
        controller: { postMessage: (message) => { state.controllerMessages.push(message); } },
        ready: Promise.resolve(registration),
        register: (path, options) => {
            state.callOrder.push("register");
            state.registerCalls.push({ path: path, scope: options && options.scope });
            state.registeredScopeWorker = registration;
            // nextRegistration lets a test hand back a worker that is still installing
            var registered = state.nextRegistration || registration;
            // as in a browser, the registration answered is the one for the scope asked for
            registered.scope = new URL(options.scope, location.href).href;
            return Promise.resolve(registered);
        },
        getRegistration: (scope) => {
            state.getRegistrationScopes.push(scope);
            return Promise.resolve(state.registeredScopeWorker);
        },
        addEventListener: (type, callback) => {
            if (type === "message") {
                state.messageListeners.push(callback);
            }
            else if (type === "controllerchange") {
                state.controllerChangeListeners.push(callback);
            }
        },
        removeEventListener: (type, callback) => {
            if (type === "message") {
                state.messageListeners = state.messageListeners.filter((listener) => listener !== callback);
            }
            else if (type === "controllerchange") {
                state.controllerChangeListeners = state.controllerChangeListeners.filter((listener) => listener !== callback);
            }
        }
    };
    state.container = container;
    state.registration = registration;

    function override(target, property, value) {
        var previous = Object.prototype.hasOwnProperty.call(target, property) ? Object.getOwnPropertyDescriptor(target, property) : null;
        Object.defineProperty(target, property, { value: value, configurable: true, writable: true });
        state.restore.push(() => {
            if (previous) {
                Object.defineProperty(target, property, previous);
            }
            else {
                delete target[property];
            }
        });
    }

    override(window.navigator, "serviceWorker", container);
    if (typeof window.Notification === "undefined") {
        override(window, "Notification", {});
    }
    override(window.Notification, "permission", "granted");
    override(window.Notification, "requestPermission", () => {
        state.callOrder.push("requestPermission");
        // as in a browser, the answer to the prompt becomes the origin's permission state
        setNotificationPermission(state.permission);
        return Promise.resolve(state.permission);
    });
    if (typeof window.PushManager === "undefined") {
        override(window, "PushManager", function () { });
    }

    var setNotificationPermission = (value) => {
        Object.defineProperty(window.Notification, "permission", { value: value, configurable: true, writable: true });
    };
    // what a prompt would answer, while Notification.permission stays "default" so the prompt is
    // actually consulted and the silent auto register path stays out of the way
    state.setPermission = (permission) => {
        state.permission = permission;
        setNotificationPermission(permission === "granted" ? "default" : permission);
    };
    // a returning visitor who granted permission on an earlier visit
    state.grantPermission = () => setNotificationPermission("granted");
    state.setPermission("granted");
    // `source` is the ServiceWorker that sent the message, which a page can reply to even when
    // no worker controls it yet
    state.emit = (data, source) => state.messageListeners.slice().forEach((callback) => callback({ data: data, source: source }));
    // another service worker takes control of the page, as after a newer version of a worker activated
    state.changeController = () => state.controllerChangeListeners.slice().forEach((callback) => callback({ type: "controllerchange" }));
    return state;
}

// A worker that a fresh register() hands back before it has activated
function fakeInstallingWorker() {
    var listeners = [];
    var worker = {
        state: "installing",
        scriptURL: new URL("/countly_sw.js", location.href).href,
        addEventListener: (type, callback) => {
            if (type === "statechange") {
                listeners.push(callback);
            }
        },
        removeEventListener: (type, callback) => {
            listeners = listeners.filter((listener) => listener !== callback);
        },
        becomes: (state) => {
            worker.state = state;
            listeners.slice().forEach((callback) => callback({ target: worker }));
        }
    };
    return worker;
}

// Holds pushManager.subscribe() open until `finish()`; `called` settles once the SDK asked for it
function deferSubscribe() {
    var working = push.pushManager.subscribe;
    var deferred = {};
    deferred.called = new Promise((resolveCalled) => {
        push.pushManager.subscribe = (options) => new Promise((resolve) => {
            deferred.finish = () => resolve(working(options));
            resolveCalled();
        });
    });
    return deferred;
}

// A subscription another push provider made on the same scope, bound to its own key
function foreignSubscription(base64Key) {
    return {
        endpoint: "https://push.example/someone-elses",
        expirationTime: null,
        options: { userVisibleOnly: true, applicationServerKey: keyToBytes(base64Key).buffer },
        toJSON() {
            return { endpoint: this.endpoint, expirationTime: null, keys: { p256dh: "vendor-p256dh", auth: "vendor-auth" } };
        },
        unsubscribe: () => {
            push.unsubscribeCalls++;
            push.subscription = null;
            return Promise.resolve(true);
        }
    };
}

// every line printed to the console from this call until the end of the test
function printedLines() {
    var lines = [];
    ["log", "debug", "warn", "error", "info"].forEach((k) => {
        var original = console[k];
        console[k] = function () {
            lines.push(Array.prototype.join.call(arguments, " "));
        };
        push.restore.push(() => {
            console[k] = original;
        });
    });
    return lines;
}

// [CLY]_push_action events, whether still in the event queue or already flushed into a request
function recordedPushActions(callback, appKey) {
    cy.fetch_local_event_queue(appKey).then((eq) => {
        cy.fetch_local_request_queue(appKey).then((rq) => {
            var flushed = [];
            rq.forEach((request) => {
                if (request.events) {
                    JSON.parse(request.events).forEach((event) => flushed.push(event));
                }
            });
            callback(eq.concat(flushed).filter((event) => event.key === "[CLY]_push_action"));
        });
    });
}

// [CLY]_push_action events with the device ID each is queued under, from the SDK's queues, not storage
function queuedPushActions() {
    var events = Countly._internals.getEventQueue().map((event) => Object.assign({ device_id: Countly.get_device_id() }, event));
    Countly._internals.getRequestQueue().forEach((request) => {
        if (request.events) {
            JSON.parse(request.events).forEach((event) => events.push(Object.assign({ device_id: request.device_id }, event)));
        }
    });
    return events.filter((event) => event.key === "[CLY]_push_action");
}

// what Chrome does inside <iframe sandbox="allow-scripts">: the property exists, reading it throws
function sandboxServiceWorker() {
    var mocked = Object.getOwnPropertyDescriptor(window.navigator, "serviceWorker");
    Object.defineProperty(window.navigator, "serviceWorker", {
        configurable: true,
        get() {
            throw new DOMException("Failed to read the 'serviceWorker' property from 'Navigator': The document is sandboxed and lacks the 'allow-same-origin' flag.", "SecurityError");
        }
    });
    push.restore.push(() => Object.defineProperty(window.navigator, "serviceWorker", mocked));
}

// The page SDK and a service worker evaluated from `source`, connected the way a browser connects
// them: the page posts to the registration's active worker, and the worker answers the page it heard
// from and finds it among its clients. Messages are copied and delivered later, as postMessage does.
function connectWorker(source) {
    var worker = loadWorker(source, (self) => {
        self.registration.scope = COUNTLY_SCOPE;
        self.fetch = fakeFetch();
    });
    var page = fakeClient(location.href, true);
    var active = {
        scriptURL: new URL("/countly_sw.js", location.href).href,
        postMessage: (message) => {
            var copy = structuredClone(message);
            window.setTimeout(() => worker.dispatch("message", { data: copy, source: page }), 0);
        }
    };
    page.postMessage = (message) => {
        var copy = structuredClone(message);
        page.messages.push(structuredClone(message));
        window.setTimeout(() => push.emit(copy, active), 0);
    };
    push.registration.active = active;
    // a returning visitor: the worker is registered already, under Countly's own scope, which covers no page
    push.registeredScopeWorker = push.registration;
    push.container.controller = null;
    worker.self.clients.list = [page];
    return { worker: worker, page: page };
}

function initMain(config) {
    Countly.init(Object.assign({
        app_key: hp.appKey,
        url: "https://your.domain.count.ly",
        device_id: "web push tester",
        test_mode: true,
        test_mode_eq: true,
        debug: true
    }, config || {}));
}

// enabling is queued as a command so it runs after any consent or permission change before it
function enablePush(opts) {
    return cy.wrap(null).then(() => Countly.enable_push_notifications(opts));
}

function disablePush() {
    return cy.wrap(null).then(() => Countly.disable_push_notifications());
}

// loses what the page had queued, in its tab and in what tabs left behind
function dropStoredQueue() {
    localStorage.removeItem(hp.appKey + "/cly_queue");
    sessionStorage.removeItem(hp.appKey + "/cly_queue");
}

function tokenRequests(callback) {
    cy.fetch_local_request_queue().then((rq) => {
        callback(rq.filter((request) => request.token_session));
    });
}

function expectTokenRequestCount(count) {
    tokenRequests((requests) => {
        expect(requests.length).to.equal(count);
    });
}

function pushStorage(key) {
    return cy.getLocalStorage(`${hp.appKey}/${key}`);
}

// a reload keeps the browser's storage, so the push record halt() wipes is put back before init
function reloadWithPushRecord(config) {
    var kept = {};
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.indexOf(hp.appKey + "/cly_push_") === 0) {
            kept[key] = localStorage.getItem(key);
        }
    }
    Countly.halt();
    Object.keys(kept).forEach((key) => localStorage.setItem(key, kept[key]));
    initMain(config);
}

describe("Web push tests", () => {
    beforeEach(() => {
        push = installPushMocks();
    });

    afterEach(() => {
        // reverse order, so a property defined on an object this helper itself created is
        // put back before that object is removed again
        push.restore.reverse().forEach((restore) => restore());
        push = null;
    });

    it("Decodes and validates the VAPID public key", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            const bytes = Countly._internals.urlBase64ToUint8Array(VAPID_KEY);
            expect(bytes.length).to.equal(65);
            expect(bytes[0]).to.equal(4);
            expect(Countly._internals.urlBase64ToUint8Array("this is not base64!")).to.equal(null);
            expect(Countly._internals.isPushSupported(true)).to.equal(true);
        });
    });

    it("Refuses to subscribe without a usable configuration", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(false);
                expect(result.reason).to.equal("missing_vapid_key");
            });
            enablePush({ push_vapid_public_key: "too-short" }).then((result) => {
                expect(result.reason).to.equal("invalid_vapid_key");
                expect(push.subscribeCalls).to.equal(0);
            });
            // only whitespace around a key is forgiven, not a line break or a space inside it
            enablePush({ push_vapid_public_key: VAPID_KEY.slice(0, 40) + "\n" + VAPID_KEY.slice(40) }).then((result) => {
                expect(result.reason).to.equal("invalid_vapid_key");
            });
            enablePush({ push_vapid_public_key: VAPID_KEY.slice(0, 40) + " " + VAPID_KEY.slice(40) }).then((result) => {
                expect(result.reason).to.equal("invalid_vapid_key");
                expect(push.subscribeCalls).to.equal(0);
            });
        });
    });

    it("Refuses to subscribe without push consent and without permission", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            enablePush().then((result) => {
                expect(result.reason).to.equal("no_consent");
                expect(push.subscribeCalls).to.equal(0);
            });
            cy.then(() => {
                Countly.add_consent(["push"]);
                push.setPermission("denied");
            });
            enablePush().then((result) => {
                expect(result.reason).to.equal("denied");
                expect(push.subscribeCalls).to.equal(0);
            });
        });
    });

    it("Subscribes and registers the token, then stays idempotent", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
                // initMain turns debug on, which the SDK tells the worker through its URL
                expect(push.registerCalls[0]).to.deep.equal({ path: "/countly_sw.js?cly_debug=1", scope: COUNTLY_SCOPE });
                pushStorage("cly_push_endpoint").should("equal", result.endpoint);
                pushStorage("cly_push_vapid_key").should("equal", VAPID_KEY);
                tokenRequests((requests) => {
                    expect(requests.length).to.equal(1);
                    expect(requests[0].token_provider).to.equal("WEB");
                    const token = JSON.parse(requests[0].web_token);
                    expect(token.endpoint).to.equal(result.endpoint);
                    expect(token.keys).to.be.ok;
                });
                enablePush().then((second) => {
                    expect(second.endpoint).to.equal(result.endpoint);
                    expect(push.subscribeCalls).to.equal(1);
                });
                // a second enable must not queue another token_session
                expectTokenRequestCount(1);
            });
        });
    });

    it("Re-registers a still valid subscription but re-subscribes after a key rotation", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            // a later visit that lost the stored endpoint must not cost the user their subscription
            cy.then(() => {
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            enablePush().then(() => {
                expect(push.subscribeCalls).to.equal(1);
                expect(push.unsubscribeCalls).to.equal(0);
            });
            expectTokenRequestCount(2);
            enablePush({ push_vapid_public_key: OTHER_VAPID_KEY }).then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(2);
                expect(new Uint8Array(push.subscription.options.applicationServerKey)).to.deep.equal(keyToBytes(OTHER_VAPID_KEY));
            });
            expectTokenRequestCount(3);
            pushStorage("cly_push_vapid_key").should("equal", OTHER_VAPID_KEY);
        });
    });

    it("Blacklists the token when push is disabled and stays quiet when there is nothing to disable", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            disablePush().then((result) => {
                expect(result.unsubscribed).to.equal(true);
                expect(push.unsubscribeCalls).to.equal(1);
            });
            tokenRequests((requests) => {
                expect(requests.length).to.equal(2);
                expect(requests[1].web_token).to.equal("BLACKLISTED");
            });
            pushStorage("cly_push_endpoint").should("equal", null);
            disablePush();
            expectTokenRequestCount(2);
        });
    });

    it("Blacklists the token when push consent is withdrawn", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            enablePush();
            cy.then(() => Countly.remove_consent(["push"]));
            tokenRequests((requests) => {
                expect(requests[requests.length - 1].web_token).to.equal("BLACKLISTED");
            });
            pushStorage("cly_push_endpoint").should("equal", null);
        });
    });

    it("Records [CLY]_push_action with mobile SDK compatible segmentation", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            Countly.record_push_action(MESSAGE_ID, 2);
            Countly.record_push_action(MESSAGE_ID);
            Countly.record_push_action();
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(2);
                expect(actions[0].key).to.equal("[CLY]_push_action");
                expect(actions[0].count).to.equal(1);
                expect(actions[0].segmentation).to.deep.equal({ i: MESSAGE_ID, b: 2, p: "w" });
                expect(actions[1].segmentation.b).to.equal(0);
            });
        });
    });

    it("Gates the push action event behind push consent", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            Countly.record_push_action(MESSAGE_ID, 0);
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
            });
            cy.then(() => {
                Countly.add_consent(["push"]);
                Countly.record_push_action(MESSAGE_ID, 1);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(actions[0].segmentation.b).to.equal(1);
            });
        });
    });

    it("Records actions relayed by the service worker exactly once", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                expect(push.messageListeners.length).to.equal(1);
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: "action-1" });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: "action-1" });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: "action-2" });
                push.emit({ type: "not_a_countly_message", messageId: MESSAGE_ID, aid: "action-3" });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(2);
            });
        });
    });

    it("Re-registers the token when the worker reports a subscription change", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                push.subscribeCalls = 0;
                // the browser rotated the endpoint behind the SDK's back
                push.subscription.endpoint = "https://push.example/rotated";
                push.emit({ type: "countly_push_subscription_change" });
            });
            tokenRequests((requests) => {
                // the live subscription is reused, only the server is brought back in sync
                expect(push.subscribeCalls).to.equal(0);
                expect(requests.length).to.equal(2);
                expect(JSON.parse(requests[1].web_token).endpoint).to.equal("https://push.example/rotated");
            });
        });
    });

    it("Does not prompt at init when permission was never granted", () => {
        hp.haltAndClearStorage(() => {
            // Safari and Firefox only allow a permission prompt from a user gesture, so the silent
            // path has to stay quiet and leave the work to an explicit enable_push_notifications
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(0);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Registers on init without any explicit call once permission is granted", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Stays off when auto register is opted out of", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(0);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Sends nothing when the device id changes with a merge, the server moves the token", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            // the silent registration runs on a timer after init
            cy.wait(hp.sWait);
            cy.then(() => {
                Countly.change_id("logged in user", true);
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                // same user: /i/device_id makes the server carry the push token over to the new id
                expect(requests.length).to.equal(1);
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Treats a device id change without a merge as a new user and registers the browser subscription for them", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush().then(() => {
                Countly.change_id("someone else", false);
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                // the token is taken back under the previous user's id, then registered for the new user
                expect(requests.length).to.equal(3);
                expect(requests[0].device_id).to.equal("web push tester");
                expect(requests[1]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
                expect(requests[2].device_id).to.equal("someone else");
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Makes the new user after a change without a merge wait for their own consent", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            cy.then(() => Countly.change_id("someone else", false));
            cy.wait(hp.sWait);
            // the id change reset consents; the previous user's token is taken back and their record is gone
            tokenRequests((requests) => {
                expect(requests.length).to.equal(2);
                expect(requests[1]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
            });
            pushStorage("cly_push_endpoint").should("equal", null);
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(3);
                expect(requests[2].device_id).to.equal("someone else");
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Keeps the opt-out across a device id change without a merge", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            disablePush();
            cy.then(() => Countly.change_id("someone else", false));
            cy.wait(hp.sWait).then(() => {
                // the browser's person said no; a new id on the same browser does not change that
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
            expectTokenRequestCount(2);
        });
    });

    it("Coalesces concurrent enable calls into a single subscription", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            cy.wrap(null).then(() => {
                // a double click, or the silent registration racing an explicit call
                return Promise.all([Countly.enable_push_notifications(), Countly.enable_push_notifications()]);
            }).then((results) => {
                expect(results[0].subscribed).to.equal(true);
                expect(results[1].subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Queues the token immediately and clears push state on halt", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            // no page timer holds the token: closing the tab must not lose a live subscription
            expectTokenRequestCount(1);
            cy.then(() => Countly.halt());
            pushStorage("cly_push_endpoint").should("equal", null);
            pushStorage("cly_push_vapid_key").should("equal", null);
            pushStorage("cly_push_scope").should("equal", null);
        });
    });

    it("Asks for notification permission before any asynchronous work", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush().then(() => {
                // a prompt fired after the registration resolves would have lost the click's
                // user activation, which is what browsers require it to run under
                expect(push.callOrder[0]).to.equal("requestPermission");
                expect(push.callOrder.indexOf("register")).to.be.greaterThan(0);
            });
        });
    });

    it("Refuses to replace a service worker the application already owns at the scope it was given", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            cy.then(() => {
                push.registeredScopeWorker = { scope: ROOT_SCOPE, pushManager: push.pushManager, active: { scriptURL: new URL("/my-pwa-sw.js", location.href).href } };
            });
            enablePush().then((result) => {
                expect(result.reason).to.equal("service_worker_conflict");
                expect(push.registerCalls.length).to.equal(0);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Registers its own worker next to a site's own root worker instead of refusing", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                // a PWA's worker holds the root scope; getRegistration answers with it for any scope below
                push.registeredScopeWorker = { scope: ROOT_SCOPE, pushManager: push.pushManager, active: { scriptURL: new URL("/my-pwa-sw.js", location.href).href } };
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.map((call) => call.scope)).to.deep.equal([COUNTLY_SCOPE]);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Keeps to the scope it subscribed under on a later page, also when that scope was given only to enable_push_notifications", () => {
        hp.haltAndClearStorage(() => {
            var ownScope = new URL("/my-push/", location.href).href;
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            enablePush({ push_service_worker_scope: "/my-push/" }).then((result) => {
                expect(result.subscribed).to.equal(true);
            });
            pushStorage("cly_push_scope").should("equal", ownScope);
            cy.then(() => {
                push.registerCalls.length = 0;
                push.grantPermission();
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                // the next page's silent registration does not add a second worker at the default scope
                expect(push.registerCalls.map((call) => call.scope)).to.deep.equal([ownScope]);
            });
        });
    });

    it("Looks its registration up under the scope this browser's subscription was made under before the configured one", () => {
        hp.haltAndClearStorage(() => {
            localStorage.setItem(hp.appKey + "/cly_push_endpoint", "https://push.example/endpoint1");
            localStorage.setItem(hp.appKey + "/cly_push_scope", new URL("/stored-push/", location.href).href);
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/configured-push/" });
            cy.wait(hp.sWait).then(() => {
                expect(push.getRegistrationScopes[0]).to.equal(new URL("/stored-push/", location.href).href);
            });
        });
    });

    it("Says the worker is missing when the registration promise gives none", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            enablePush({ push_service_worker_registration: Promise.resolve(null) }).then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "service_worker_missing" });
            });
        });
    });

    it("Replaces its own worker under the default scope after the site renamed the worker file in the same folder", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_path: "/countly-sw.js" });
            cy.then(() => {
                // a returning visitor's registration still runs the file under its old name
                push.registeredScopeWorker = push.registration;
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls).to.deep.equal([{ path: "/countly-sw.js?cly_debug=1", scope: COUNTLY_SCOPE }]);
            });
        });
    });

    it("Uses a registration still being made, as register() returns it, given to enable_push_notifications", () => {
        hp.haltAndClearStorage(() => {
            var supplied = { scope: new URL("/app/", location.href).href, pushManager: push.pushManager, active: { scriptURL: new URL("/app/sw.js", location.href).href } };
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            enablePush({ push_service_worker_registration: Promise.resolve(supplied) }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.length).to.equal(0);
            });
            pushStorage("cly_push_scope").should("equal", supplied.scope);
        });
    });

    it("Uses a registration still being made, as register() returns it, given at init", () => {
        hp.haltAndClearStorage(() => {
            var supplied = { scope: new URL("/app/", location.href).href, pushManager: push.pushManager, active: { scriptURL: new URL("/app/sw.js", location.href).href, postMessage: (m) => push.controllerMessages.push(Object.assign({ to: "supplied" }, m)) } };
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false, push_service_worker_registration: Promise.resolve(supplied) });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.length).to.equal(0);
                expect(push.controllerMessages.filter((m) => m.type === "countly_push_ready").map((m) => m.to)).to.deep.equal(["supplied"]);
            });
            pushStorage("cly_push_scope").should("equal", supplied.scope);
        });
    });

    it("Says why when the registration given to it could not be made", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            var failed = Promise.reject(new DOMException("Failed to register a ServiceWorker: A bad HTTP response code (404) was received when fetching the script.", "TypeError"));
            failed.catch(() => { });
            enablePush({ push_service_worker_registration: failed }).then((result) => {
                expect(result.subscribed).to.equal(false);
                expect(result.reason).to.equal("error");
                expect(result.error).to.contain("404");
                expect(push.registerCalls.length).to.equal(0);
            });
        });
    });

    it("Registers its worker under the countly-push folder next to the worker file by default", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_path: "/js/countly_sw.js" });
            cy.wait(hp.sWait);
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.map((call) => call.scope)).to.deep.equal([new URL("/js/countly-push/", location.href).href]);
            });
            pushStorage("cly_push_scope").should("equal", new URL("/js/countly-push/", location.href).href);
        });
    });

    it("Uses a supplied registration and disables through the scope it subscribed under on a later page", () => {
        hp.haltAndClearStorage(() => {
            var supplied = { scope: new URL("/app/", location.href).href, pushManager: push.pushManager, active: { scriptURL: new URL("/app/sw.js", location.href).href } };
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            enablePush({ push_service_worker_registration: supplied }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.length).to.equal(0);
            });
            pushStorage("cly_push_scope").should("equal", supplied.scope);
            cy.then(() => {
                // the registration is handed only to enable_push_notifications, so the next page looks it up
                push.registeredScopeWorker = supplied;
                push.getRegistrationScopes = [];
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.getRegistrationScopes).to.deep.equal([supplied.scope]);
                return Countly.disable_push_notifications();
            }).then((result) => {
                expect(result).to.deep.equal({ unsubscribed: true });
                expect(push.unsubscribeCalls).to.equal(1);
            });
        });
    });

    it("Blacklists a token the server may still hold when the registration is gone", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                // cleared site data or a worker unregistered elsewhere
                push.registeredScopeWorker = null;
                push.subscription = null;
                return Countly.disable_push_notifications();
            }).then((result) => {
                expect(result.unsubscribed).to.equal(true);
            });
            tokenRequests((requests) => {
                expect(requests.length).to.equal(2);
                expect(requests[1].web_token).to.equal("BLACKLISTED");
            });
        });
    });

    // ---- the opt-out, registering again, and the worker while subscribing --------------------

    it("Stays unsubscribed across a reload once push was disabled", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            disablePush().then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
            });
            // a reload keeps storage and the granted permission but starts the SDK afresh
            cy.then(() => {
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                // permission alone is not consent to re-subscribe someone who opted out
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
        });
    });

    it("Lets an explicit enable lift the opt-out", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            disablePush();
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(2);
            });
            cy.then(() => {
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                // subscribed again by choice, so the reload keeps that subscription
                expect(push.subscribeCalls).to.equal(2);
                expect(push.subscription).to.not.equal(null);
            });
        });
    });

    it("Re-registers silently when push consent is granted again after being withdrawn", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            cy.then(() => Countly.remove_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
            });
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                // withdrawing consent is not the same as opting out of push: consent given again
                // is the user's answer, so no button press is needed
                expect(push.subscribeCalls).to.equal(2);
            });
        });
    });

    it("Acknowledges relayed actions to the worker that sent them when no worker controls the page", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var acks = [];
            cy.then(() => {
                // a freshly registered worker does not control the page until the next load
                push.container.controller = null;
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "action-uncontrolled" }, { postMessage: (message) => acks.push(message) });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "action-uncontrolled" }]);
            });
        });
    });

    it("Does not depend on the page being controlled to finish subscribing", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                // ready only resolves for a registration whose scope covers the page; a worker
                // registered under a narrower scope would leave it pending forever
                push.container.ready = new Promise(() => { });
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Waits for a freshly installed worker to activate before subscribing", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var worker = fakeInstallingWorker();
            cy.then(() => {
                push.container.ready = new Promise(() => { });
                push.nextRegistration = { scope: COUNTLY_SCOPE, pushManager: push.pushManager, active: null, installing: worker };
            });
            cy.wrap(null).then(() => {
                var pending = Countly.enable_push_notifications();
                setTimeout(() => worker.becomes("activated"), 20);
                return pending;
            }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Gives up with a reason when the freshly installed worker becomes redundant", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var worker = fakeInstallingWorker();
            cy.then(() => {
                push.container.ready = new Promise(() => { });
                push.nextRegistration = { scope: COUNTLY_SCOPE, pushManager: push.pushManager, active: null, installing: worker };
            });
            cy.wrap(null).then(() => {
                var pending = Countly.enable_push_notifications();
                setTimeout(() => worker.becomes("redundant"), 20);
                return pending;
            }).then((result) => {
                expect(result.subscribed).to.equal(false);
                expect(result.reason).to.equal("service_worker_redundant");
                expect(push.subscribeCalls).to.equal(0);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Flushes push actions to the request queue immediately", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            Countly.record_push_action(MESSAGE_ID, 0);
            cy.fetch_local_event_queue().then((eq) => {
                // a click usually lands on a page about to navigate, so the event cannot wait for the heartbeat
                expect(eq.length).to.equal(0);
            });
            cy.fetch_local_request_queue().then((rq) => {
                var flushed = rq.filter((request) => request.events && request.events.indexOf("[CLY]_push_action") !== -1);
                expect(flushed.length).to.equal(1);
            });
        });
    });

    it("Stops listening to the worker on halt and does not stack listeners across re-init", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                expect(push.messageListeners.length).to.equal(1);
                Countly.halt();
                expect(push.messageListeners.length).to.equal(0);
                // a message from the worker after halt must be ignored, not blow up in the listener
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "after-halt" });
                initMain({ push_vapid_public_key: VAPID_KEY });
                expect(push.messageListeners.length).to.equal(1);
            });
        });
    });

    it("Re-registers a subscription it registered when the browser replaces it, even with push_auto_register false", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            enablePush();
            cy.then(() => {
                push.subscription.endpoint = "https://push.example/rotated";
                push.emit({ type: "countly_push_subscription_change" });
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                // push was enabled for this browser, so the server must not keep the dead endpoint
                expect(requests.length).to.equal(2);
                expect(JSON.parse(requests[1].web_token).endpoint).to.equal("https://push.example/rotated");
            });
        });
    });

    it("Leaves a subscription change alone with push_auto_register false when it never registered this browser", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            cy.wait(hp.sWait).then(() => {
                push.emit({ type: "countly_push_subscription_change" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(0);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Leaves a subscription change alone with push_auto_register false once someone else logged in, and says that no token is registered for them", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            enablePush();
            cy.then(() => {
                Countly.change_id("someone else", false);
                push.subscription.endpoint = "https://push.example/rotated";
                push.emit({ type: "countly_push_subscription_change" });
            });
            cy.wait(hp.sWait).then(() => {
                var said = lines.filter((line) => line.indexOf("[DEBUG]") === 0 && line.indexOf("autoRegisterPush, push_auto_register is off and this page knows of no token registered for the current user, so the subscription the browser replaced is not registered") !== -1);
                expect(said.length).to.equal(1);
            });
            tokenRequests((requests) => {
                expect(requests.map((request) => request.device_id + ":" + (request.web_token === "BLACKLISTED" ? "BLACKLISTED" : "token"))).to.deep.equal(["web push tester:token", "web push tester:BLACKLISTED"]);
            });
        });
    });

    it("Posts the ready handshake to the worker only when push is configured", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(hp.sWait).then(() => {
                var ready = push.controllerMessages.filter((message) => message.type === "countly_push_ready");
                expect(ready.length).to.equal(0);
            });
            cy.then(() => {
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                var ready = push.controllerMessages.filter((message) => message.type === "countly_push_ready");
                expect(ready.length).to.equal(1);
            });
        });
    });

    // ---- debugging, listener, allowed hosts ------------------------------------------------

    it("Registers the worker with the debug flag in its URL", () => {
        hp.haltAndClearStorage(() => {
            // initMain sets debug: true
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                // a previous visit registered the worker under the plain URL: that is still our worker
                push.registeredScopeWorker = push.registration;
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls[0].path).to.equal("/countly_sw.js?cly_debug=1");
            });
        });
    });

    it("Registers the plain worker URL when debug is off", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, debug: false });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls[0].path).to.equal("/countly_sw.js");
            });
        });
    });

    it("Tells the worker to log when debug is on", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                var ready = push.controllerMessages.filter((m) => m.type === "countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0].debug).to.equal(true);
            });
        });
    });

    it("Prints log lines forwarded by the worker", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                var printed = [];
                var saved = {};
                ["log", "debug", "warn", "error", "info"].forEach((k) => {
                    saved[k] = console[k];
                    console[k] = function () {
                        printed.push(Array.prototype.join.call(arguments, " "));
                    };
                });
                try {
                    push.emit({ type: "countly_push_log", level: "debug", message: "push received " + MESSAGE_ID });
                    push.emit({ type: "countly_push_log", level: "error", message: "showNotification failed" });
                }
                finally {
                    Object.keys(saved).forEach((k) => {
                        console[k] = saved[k];
                    });
                }
                expect(printed.some((l) => l.indexOf("[SW]") !== -1 && l.indexOf("push received") !== -1)).to.equal(true);
                expect(printed.some((l) => l.indexOf("[SW]") !== -1 && l.indexOf("showNotification failed") !== -1)).to.equal(true);
            });
        });
    });

    it("Informs the push listener when a notification is received, clicked and closed", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var events = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit({ type: "countly_push_received", messageId: MESSAGE_ID, title: "Hi", message: "Body", url: "https://x/open", buttons: [{ t: "One", l: "https://x/1" }], payload: { c: { i: MESSAGE_ID }, custom: 1 } });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, buttonTitle: "One", url: "https://x/1", title: "Hi", message: "Body", payload: { custom: 1 }, aid: "a-1" });
                // redelivered by the worker: recorded once, reported once
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, buttonTitle: "One", url: "https://x/1", aid: "a-1" });
                push.emit({ type: "countly_push_closed", messageId: MESSAGE_ID, title: "Hi" });
            });
            cy.then(() => {
                expect(events.map((e) => e.type)).to.deep.equal(["received", "clicked", "closed"]);
                expect(events[0]).to.include({ messageId: MESSAGE_ID, title: "Hi", message: "Body", url: "https://x/open" });
                expect(events[0].payload.custom).to.equal(1);
                expect(events[1]).to.include({ messageId: MESSAGE_ID, buttonIndex: 1, buttonTitle: "One", url: "https://x/1" });
                expect(events[2]).to.include({ messageId: MESSAGE_ID, title: "Hi" });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
            });
        });
    });

    it("Takes the push listener from init and keeps recording when it throws", () => {
        hp.haltAndClearStorage(() => {
            var calls = 0;
            initMain({
                push_vapid_public_key: VAPID_KEY,
                push_notification_listener: () => {
                    calls++;
                    throw new Error("listener bug");
                }
            });
            cy.then(() => {
                push.emit({ type: "countly_push_received", messageId: MESSAGE_ID, title: "Hi" });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "b-1" });
            });
            cy.then(() => {
                expect(calls).to.equal(2);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
            });
        });
    });

    // ---- the worker reporting clicks itself, and giving up on a browser that never answers -----

    function workerMessages(type) {
        return push.controllerMessages.filter((m) => m.type === type);
    }

    // the messages without their `scope` field, which a test of its own checks
    function withoutScope(messages) {
        return messages.map((m) => {
            var copy = Object.assign({}, m);
            delete copy.scope;
            return copy;
        });
    }

    it("Tells the worker how to report a click itself in the ready handshake", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, app_version: "1.2.3" });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0].config).to.deep.equal({
                    url: "https://your.domain.count.ly/i",
                    app_key: hp.appKey,
                    device_id: "web push tester",
                    t: 0,
                    sdk_name: "javascript_native_web",
                    sdk_version: SDK_VERSION,
                    av: "1.2.3"
                });
            });
        });
    });

    it("Passes the salt to the worker so its reports carry the same checksum", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, salt: "pepper" });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready")[0].config.salt).to.equal("pepper");
            });
        });
    });

    it("Withholds the server details until push consent is given", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0].config).to.equal(null);
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                // consent let the silent registration run, and the worker is told along with it
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.be.greaterThan(0);
                expect(configs[configs.length - 1].config.device_id).to.equal("web push tester");
            });
        });
    });

    it("Tells the worker to stop reporting when push consent is withdrawn", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                push.controllerMessages.length = 0;
                Countly.remove_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.be.greaterThan(0);
                expect(configs[configs.length - 1].config).to.equal(null);
            });
        });
    });

    it("Tells the worker the new device id after a change", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                push.controllerMessages.length = 0;
                Countly.change_id("someone else", true);
            });
            cy.wait(hp.sWait).then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.be.greaterThan(0);
                expect(configs[configs.length - 1].config.device_id).to.equal("someone else");
            });
        });
    });

    it("Only informs the listener about a click the worker already recorded", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var events = [];
            var acks = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 2, url: "https://docs.example/", aid: "direct-1", recorded: true }, { postMessage: (m) => acks.push(m) });
            });
            cy.then(() => {
                expect(events.map((e) => e.type)).to.deep.equal(["clicked"]);
                expect(events[0].buttonIndex).to.equal(2);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "direct-1" }]);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
            });
        });
    });

    it("Reaches the supplied registration's worker when no worker controls the page yet", () => {
        hp.haltAndClearStorage(() => {
            var posted = [];
            cy.then(() => {
                push.container.controller = null;
                push.registration.active.postMessage = (m) => posted.push(m);
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_registration: push.registration });
            });
            cy.wait(hp.sWait).then(() => {
                expect(posted.filter((m) => m.type === "countly_push_ready").length).to.equal(1);
            });
        });
    });

    it("Gives up with a reason when the browser never finishes subscribing, and lets a later call retry", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_subscribe_timeout: 200 });
            var working = null;
            cy.then(() => {
                working = push.pushManager.subscribe;
                // iOS 18.7 left pushManager.subscribe() pending forever
                push.pushManager.subscribe = () => new Promise(() => { });
            });
            enablePush().then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "timeout" });
                push.pushManager.subscribe = working;
            });
            enablePush().then((result) => {
                // the in-flight guard was released, so this is a fresh attempt rather than the dead promise
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Says so when the silent registration gives up", () => {
        hp.haltAndClearStorage(() => {
            var printed = [];
            var saved = {};
            cy.then(() => {
                ["log", "debug", "warn", "error", "info"].forEach((k) => {
                    saved[k] = console[k];
                    console[k] = function () {
                        printed.push(Array.prototype.join.call(arguments, " "));
                    };
                });
                push.grantPermission();
                push.pushManager.subscribe = () => Promise.reject(new Error("push service unreachable"));
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                Object.keys(saved).forEach((k) => {
                    console[k] = saved[k];
                });
                expect(printed.some((l) => l.indexOf("[WARNING]") === 0 && l.indexOf("autoRegisterPush") !== -1 && l.indexOf("push service unreachable") !== -1)).to.equal(true);
            });
        });
    });

    it("Says which endpoint the silent registration ended up with", () => {
        hp.haltAndClearStorage(() => {
            var printed = [];
            var saved = {};
            cy.then(() => {
                ["log", "debug", "warn", "error", "info"].forEach((k) => {
                    saved[k] = console[k];
                    console[k] = function () {
                        printed.push(Array.prototype.join.call(arguments, " "));
                    };
                });
                push.grantPermission();
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                Object.keys(saved).forEach((k) => {
                    console[k] = saved[k];
                });
                expect(printed.some((l) => l.indexOf("autoRegisterPush") !== -1 && l.indexOf("https://push.example/endpoint1") !== -1)).to.equal(true);
            });
        });
    });

    // ---- whose subscription it is, and keeping the server's copy of the token right ------------

    it("Never registers a token without the subscription's encryption keys", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                Countly._internals.sendPushToken({ endpoint: "https://push.example/keyless", expirationTime: null }, VAPID_KEY, COUNTLY_SCOPE);
            });
            expectTokenRequestCount(0);
            pushStorage("cly_push_endpoint").should("equal", null);
        });
    });

    it("Accepts a VAPID key with surrounding whitespace", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: " " + VAPID_KEY + "\r\n" });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(new Uint8Array(push.subscription.options.applicationServerKey)).to.deep.equal(keyToBytes(VAPID_KEY));
            });
        });
    });

    it("Waits for a supplied registration's worker to activate before subscribing", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var worker = fakeInstallingWorker();
            // as on a first visit: subscribing fails until the registration's worker is active
            var supplied = { scope: "/", active: null, waiting: null, installing: worker };
            supplied.pushManager = {
                getSubscription: () => push.pushManager.getSubscription(),
                subscribe: (options) => (supplied.active ? push.pushManager.subscribe(options) : Promise.reject(new DOMException("Registration failed - no active Service Worker", "AbortError")))
            };
            cy.wrap(null).then(() => {
                var pending = Countly.enable_push_notifications({ push_service_worker_registration: supplied });
                setTimeout(() => {
                    supplied.active = worker;
                    worker.becomes("activated");
                }, 20);
                return pending;
            }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
                expect(push.registerCalls.length).to.equal(0);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Sends the token again on the next page load, as the mobile SDKs do on every start", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => {
                // the first request was lost: the queue overflowed or another tab's copy replaced it
                dropStoredQueue();
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(1);
                expect(JSON.parse(requests[0].web_token).endpoint).to.equal("https://push.example/endpoint1");
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Sends the same token only once per page load without automatic session tracking, however long the page stays open", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            expectTokenRequestCount(1);
            cy.then(() => {
                var realNow = Date.now;
                Date.now = () => realNow() + 24 * 60 * 60 * 1000;
                try {
                    Countly._internals.sendPushToken(push.subscription, VAPID_KEY, COUNTLY_SCOPE);
                }
                finally {
                    Date.now = realNow;
                }
            });
            enablePush();
            expectTokenRequestCount(1);
        });
    });

    it("Sends the token once per session with automatic session tracking, not again on a page that continues the session", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.track_sessions());
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => {
                dropStoredQueue();
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY });
                Countly.track_sessions();
            });
            cy.wait(hp.sWait);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.filter((request) => request.begin_session).length).to.equal(0);
                expect(rq.filter((request) => request.token_session).length).to.equal(0);
            });
        });
    });

    it("Sends the token again with automatic session tracking once a later page begins a new session, after the session request", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.track_sessions());
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => {
                dropStoredQueue();
                // the session expired between the two pages
                localStorage.removeItem(hp.appKey + "/cly_session");
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY });
                Countly.track_sessions();
            });
            cy.wait(hp.sWait);
            cy.fetch_local_request_queue().then((rq) => {
                var sessionAt = rq.findIndex((request) => request.begin_session);
                var tokenAt = rq.findIndex((request) => request.token_session);
                expect(rq.filter((request) => request.token_session).length).to.equal(1);
                expect(sessionAt).to.not.equal(-1);
                expect(sessionAt).to.be.below(tokenAt);
            });
        });
    });

    it("Sends the token again with automatic session tracking when a new session begins while the page is open", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.track_sessions());
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => {
                // the visitor comes back after the session expired
                localStorage.removeItem(hp.appKey + "/cly_session");
                Countly.session_duration(30);
            });
            cy.wait(hp.sWait);
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.filter((request) => request.begin_session).length).to.equal(2);
                expect(rq.filter((request) => request.token_session).length).to.equal(2);
            });
        });
    });

    it("Registers a subscription the browser replaced at once with automatic session tracking, within the same session", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.track_sessions());
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => {
                push.subscription.endpoint = "https://push.example/rotated";
                push.emit({ type: "countly_push_subscription_change" });
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(2);
                expect(JSON.parse(requests[1].web_token).endpoint).to.equal("https://push.example/rotated");
            });
        });
    });

    it("Warns once per version when the service worker the site serves is another version than the SDK", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var lines = null;
            cy.then(() => {
                lines = printedLines();
                push.emit({ type: "countly_push_worker_version", version: SDK_VERSION, scope: COUNTLY_SCOPE });
                push.emit({ type: "countly_push_worker_version", version: "26.7.0", scope: COUNTLY_SCOPE });
                push.emit({ type: "countly_push_worker_version", version: "26.7.0", scope: COUNTLY_SCOPE });
                // another app's worker, under a scope of its own, is none of this SDK's business
                push.emit({ type: "countly_push_worker_version", version: "26.6.0", scope: new URL("/other-push/", location.href).href });
            });
            cy.then(() => {
                var warnings = lines.filter((line) => line.indexOf("push service worker") !== -1 && line.indexOf("version") !== -1);
                expect(warnings.length).to.equal(1);
                expect(warnings[0]).to.contain("26.7.0");
                expect(warnings[0]).to.contain(SDK_VERSION);
            });
        });
    });

    it("Registers the token once for the next user with automatic session tracking after a device ID change without merge", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.track_sessions());
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
            cy.then(() => Countly.change_id("someone else", false));
            cy.wait(hp.sWait).then(() => {
                var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                expect(requests.length).to.equal(3);
                expect(requests[1]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
                expect(requests[2].device_id).to.equal("someone else");
            });
        });
    });

    it("Sends the token once per page for a numeric device ID too", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, device_id: "1234567" });
            enablePush();
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.subscribeCalls).to.equal(1);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Drops the subscription an enable was still creating when push is disabled meanwhile", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var deferred = null;
            var pending = null;
            cy.then(() => {
                deferred = deferSubscribe();
                pending = Countly.enable_push_notifications();
            });
            cy.wrap(null).then(() => deferred.called);
            disablePush();
            cy.wrap(null).then(() => {
                deferred.finish();
                return pending;
            }).then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "disabled" });
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Drops the subscription an enable was still creating when push consent is withdrawn meanwhile", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var deferred = null;
            var pending = null;
            cy.then(() => {
                Countly.add_consent(["push"]);
                deferred = deferSubscribe();
                pending = Countly.enable_push_notifications();
            });
            cy.wrap(null).then(() => deferred.called);
            cy.then(() => Countly.remove_consent(["push"]));
            cy.wait(hp.sWait);
            cy.wrap(null).then(() => {
                deferred.finish();
                return pending;
            }).then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "no_consent" });
                expect(push.subscription).to.equal(null);
            });
            expectTokenRequestCount(0);
        });
    });

    it("Registers the subscription when push consent was withdrawn and given again while subscribing", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var deferred = null;
            var pending = null;
            cy.then(() => {
                Countly.add_consent(["push"]);
                deferred = deferSubscribe();
                pending = Countly.enable_push_notifications();
            });
            cy.wrap(null).then(() => deferred.called);
            cy.then(() => Countly.remove_consent(["push"]));
            cy.wait(hp.sWait);
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait);
            cy.wrap(null).then(() => {
                deferred.finish();
                return pending;
            }).then((result) => {
                expect(result.subscribed).to.equal(true);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Keeps the subscription an enable was creating when someone else logs in meanwhile, and registers it for them once they consent", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var deferred = null;
            var pending = null;
            cy.then(() => {
                Countly.add_consent(["push"]);
                deferred = deferSubscribe();
                pending = Countly.enable_push_notifications();
            });
            cy.wrap(null).then(() => deferred.called);
            // a login without merge resets every consent for the new user; nobody withdrew anything
            cy.then(() => Countly.change_id("someone else", false));
            cy.wrap(null).then(() => {
                deferred.finish();
                return pending;
            }).then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "no_consent" });
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscription).to.not.equal(null);
            });
            expectTokenRequestCount(0);
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(1);
                expect(requests[0].device_id).to.equal("someone else");
                expect(push.subscribeCalls).to.equal(1);
            });
        });
    });

    it("Leaves another push provider's subscription alone when a site without Countly push withdraws consent", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true });
            cy.then(() => {
                push.registeredScopeWorker = { scope: "/", pushManager: push.pushManager, active: { scriptURL: new URL("/vendor-sw.js", location.href).href } };
                push.subscription = foreignSubscription(OTHER_VAPID_KEY);
                Countly.add_consent(Countly.features);
            });
            cy.wait(hp.sWait);
            cy.then(() => Countly.remove_consent(Countly.features));
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscription.endpoint).to.equal("https://push.example/someone-elses");
            });
            expectTokenRequestCount(0);
        });
    });

    [["passed to enable_push_notifications", false], ["given at init", true]].forEach(([how, atInit]) => {
        it("Refuses to replace another push provider's subscription on a supplied registration " + how, () => {
            hp.haltAndClearStorage(() => {
                initMain(atInit ? { push_vapid_public_key: VAPID_KEY, push_service_worker_registration: push.registration } : { push_vapid_public_key: VAPID_KEY });
                cy.then(() => {
                    push.subscription = foreignSubscription(OTHER_VAPID_KEY);
                });
                enablePush(atInit ? undefined : { push_service_worker_registration: push.registration }).then((result) => {
                    expect(result).to.deep.equal({ subscribed: false, reason: "subscription_conflict" });
                    expect(push.unsubscribeCalls).to.equal(0);
                    expect(push.subscribeCalls).to.equal(0);
                    expect(push.subscription.endpoint).to.equal("https://push.example/someone-elses");
                });
                expectTokenRequestCount(0);
            });
        });
    });

    it("Still drops its own subscription on consent withdrawal where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY, storage: "none" });
            cy.then(() => Countly.add_consent(["push"]));
            enablePush();
            cy.then(() => Countly.remove_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
                var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                expect(requests[requests.length - 1].web_token).to.equal("BLACKLISTED");
            });
        });
    });

    it("Recognises its own subscription by the endpoint it registered when the browser does not report the key", () => {
        hp.haltAndClearStorage(() => {
            // at the root scope only what Countly registered tells its subscription apart from others
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            enablePush();
            cy.then(() => {
                // a browser without PushSubscription.options
                delete push.subscription.options;
            });
            enablePush({ push_vapid_public_key: OTHER_VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(2);
            });
        });
    });

    it("Recognises its own subscription by the key it registered when no key is configured at init", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_service_worker_scope: "/" });
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                // the browser rotated the endpoint behind the SDK's back
                push.subscription.endpoint = "https://push.example/rotated";
            });
            enablePush({ push_vapid_public_key: OTHER_VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(2);
            });
        });
    });

    it("Takes the token away from the previous user even where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            enablePush();
            cy.then(() => Countly.change_id("someone else", false));
            cy.wait(hp.sWait).then(() => {
                var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                expect(requests.length).to.equal(3);
                expect(requests[1]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
                expect(requests[2].device_id).to.equal("someone else");
            });
        });
    });

    it("Takes the token away from the previous user when offline mode ends under someone else's ID", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                Countly.enable_offline_mode();
                Countly.disable_offline_mode("someone else");
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(3);
                expect(requests[1]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
                expect(requests[2].device_id).to.equal("someone else");
            });
        });
    });

    it("Keeps the token with the user when offline mode ends under the same ID", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                Countly.enable_offline_mode();
                Countly.disable_offline_mode("web push tester");
            });
            cy.wait(hp.sWait);
            expectTokenRequestCount(1);
        });
    });

    it("Takes the token away from the previous user when the next page starts afresh with clear_stored_id", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            enablePush();
            expectTokenRequestCount(1);
            cy.then(() => {
                dropStoredQueue();
                reloadWithPushRecord({ require_consent: true, push_vapid_public_key: VAPID_KEY, clear_stored_id: true, device_id: "someone else" });
            });
            cy.wait(hp.sWait);
            tokenRequests((requests) => {
                expect(requests.length).to.equal(1);
                expect(requests[0]).to.include({ device_id: "web push tester", web_token: "BLACKLISTED" });
            });
            pushStorage("cly_push_endpoint").should("equal", null);
        });
    });

    it("Leaves the location given to the SDK out of the request that takes the token back from the previous user", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                dropStoredQueue();
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY, clear_stored_id: true, device_id: "someone else", country_code: "TR", city: "Izmir", ip_address: "10.1.2.3" });
                Countly.begin_session();
            });
            cy.wait(hp.sWait);
            cy.fetch_local_request_queue().then((rq) => {
                var blacklisted = rq.filter((request) => request.web_token === "BLACKLISTED");
                expect(blacklisted.map((request) => request.device_id)).to.deep.equal(["web push tester"]);
                expect(blacklisted[0]).to.not.have.any.keys("country_code", "city", "ip_address");
                var own = rq.filter((request) => request.begin_session);
                expect(own.map((request) => request.device_id)).to.deep.equal(["someone else"]);
                expect(own[0]).to.include({ country_code: "TR", city: "Izmir", ip_address: "10.1.2.3" });
            });
        });
    });

    it("Keeps the token with the user when a page with clear_stored_id starts under the same ID", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.add_consent(["push"]));
            enablePush();
            cy.then(() => {
                dropStoredQueue();
                // the site passes the logged-in user's own id again
                reloadWithPushRecord({ require_consent: true, push_vapid_public_key: VAPID_KEY, clear_stored_id: true });
            });
            cy.wait(hp.sWait);
            expectTokenRequestCount(0);
            pushStorage("cly_push_endpoint").should("not.equal", null);
        });
    });

    it("Still replaces its own old-key subscription after someone else logged in", () => {
        hp.haltAndClearStorage(() => {
            // no key at init and a root scope: only the stored key marks the subscription as Countly's
            initMain({ push_service_worker_scope: "/" });
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => Countly.change_id("someone else", false));
            enablePush({ push_vapid_public_key: OTHER_VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(2);
            });
        });
    });

    // ---- Countly's own scope, and the scopes it shares with the site ----------------------------

    [["where nothing can be stored", { storage: "none" }], ["after the visitor's storage was cleared", {}]].forEach(([where, config]) => {
        it("Moves a returning visitor to a new VAPID key under its own scope " + where, () => {
            hp.haltAndClearStorage(() => {
                push.grantPermission();
                initMain(Object.assign({ push_vapid_public_key: VAPID_KEY }, config));
                cy.wait(hp.sWait).then(() => {
                    expect(push.subscribeCalls).to.equal(1);
                    Countly.halt();
                    initMain(Object.assign({ push_vapid_public_key: OTHER_VAPID_KEY }, config));
                });
                cy.wait(hp.sWait).then(() => {
                    expect(push.unsubscribeCalls).to.equal(1);
                    expect(push.subscribeCalls).to.equal(2);
                    expect(new Uint8Array(push.subscription.options.applicationServerKey)).to.deep.equal(keyToBytes(OTHER_VAPID_KEY));
                    var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                    expect(JSON.parse(requests[requests.length - 1].web_token).endpoint).to.equal(push.subscription.endpoint);
                });
            });
        });
    });

    it("Says so at INFO level when it replaces its own subscription made with another VAPID key", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            initMain({ push_vapid_public_key: VAPID_KEY });
            // the silent registration at load has had its turn, before notifications were allowed
            cy.wait(hp.sWait);
            enablePush();
            enablePush({ push_vapid_public_key: OTHER_VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                var replacing = lines.filter((line) => line.indexOf("Replacing Countly's push subscription at scope [" + COUNTLY_SCOPE + "], which was made with another VAPID key") !== -1);
                expect(replacing.length).to.equal(1);
                expect(replacing[0].indexOf("[INFO]")).to.equal(0);
            });
        });
    });

    it("Leaves the subscription another app made under its scope after it registered there, and says how to avoid that", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            var other = null;
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            enablePush();
            cy.then(() => {
                // a second Countly app of the site, with a keypair of its own, under the same default scope
                other = Countly.init({ app_key: "another_app", url: "https://your.domain.count.ly", device_id: "another app user", test_mode: true, test_mode_eq: true, debug: true, push_vapid_public_key: OTHER_VAPID_KEY });
                return other.enable_push_notifications();
            }).then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.unsubscribeCalls).to.equal(1);
            });
            enablePush().then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "subscription_conflict" });
                expect(push.unsubscribeCalls).to.equal(1);
                var errors = lines.filter((line) => line.indexOf("[ERROR]") === 0 && line.indexOf("subscribeAndRegisterToken") !== -1);
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.contain("Countly's own scope [" + COUNTLY_SCOPE + "] now holds a subscription another sender made after Countly registered there; give each Countly app or push provider a scope of its own");
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: true });
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscription).to.not.equal(null);
            });
            tokenRequests((requests) => {
                expect(requests[requests.length - 1].web_token).to.equal("BLACKLISTED");
            });
            cy.then(() => other.halt());
        });
    });

    it("Leaves another push provider's subscription at the root scope alone, and says how to avoid sharing it", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            cy.wait(hp.sWait).then(() => {
                push.subscription = foreignSubscription(OTHER_VAPID_KEY);
            });
            enablePush().then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "subscription_conflict" });
                expect(push.unsubscribeCalls).to.equal(0);
                var errors = lines.filter((line) => line.indexOf("[ERROR]") === 0 && line.indexOf("subscribeAndRegisterToken") !== -1);
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.contain("The service worker at scope [" + ROOT_SCOPE + "] holds a push subscription Countly cannot recognise as its own (another push provider's, or one Countly made with an earlier VAPID key where nothing was stored or storage was cleared). A scope holds only one, so Countly leaves it alone; let Countly register its own worker under its default scope instead of sharing [" + ROOT_SCOPE + "]");
            });
        });
    });

    it("Leaves an old-key subscription it cannot recognise alone at the root scope", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/", storage: "none" });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                Countly.halt();
                initMain({ push_vapid_public_key: OTHER_VAPID_KEY, push_service_worker_scope: "/", storage: "none" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscribeCalls).to.equal(1);
                var errors = lines.filter((line) => line.indexOf("[ERROR]") === 0 && line.indexOf("subscribeAndRegisterToken") !== -1);
                expect(errors.length).to.equal(1);
                expect(errors[0]).to.contain("or one Countly made with an earlier VAPID key where nothing was stored or storage was cleared");
            });
        });
    });

    [
        ["disable_push_notifications", {}, () => Countly.disable_push_notifications()],
        ["a push consent withdrawal", { require_consent: true }, () => {
            Countly.add_consent(["push"]);
            Countly.remove_consent(["push"]);
        }]
    ].forEach(([what, config, stopPush]) => {
        it("Drops its own subscription under its own scope on " + what + " on a later page where nothing can be stored, with the key passed to enable_push_notifications only", () => {
            hp.haltAndClearStorage(() => {
                var pageConfig = Object.assign({ storage: "none" }, config);
                initMain(pageConfig);
                if (config.require_consent) {
                    cy.then(() => Countly.add_consent(["push"]));
                }
                enablePush({ push_vapid_public_key: VAPID_KEY });
                cy.then(() => {
                    Countly.halt();
                    initMain(pageConfig);
                    stopPush();
                });
                cy.wait(hp.sWait).then(() => {
                    expect(push.unsubscribeCalls).to.equal(1);
                    expect(push.subscription).to.equal(null);
                    var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                    expect(requests.map((request) => request.web_token)).to.deep.equal(["BLACKLISTED"]);
                });
            });
        });
    });

    it("Takes a registration under its folder for its own only while it runs Countly's worker file", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            cy.then(() => {
                push.registeredScopeWorker = { scope: COUNTLY_SCOPE, pushManager: push.pushManager, active: { scriptURL: new URL("/site-sw.js", location.href).href } };
                push.subscription = foreignSubscription(OTHER_VAPID_KEY);
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: true });
                expect(push.unsubscribeCalls).to.equal(0);
            });
        });
    });

    it("Drops its own subscription on a supplied registration on a later page where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            // the site's own worker imports countly_sw.js under a scope of its own
            var host = { scope: new URL("/app/", location.href).href, pushManager: push.pushManager, active: { scriptURL: new URL("/app/sw.js", location.href).href } };
            var config = { require_consent: true, push_vapid_public_key: VAPID_KEY, storage: "none", push_service_worker_registration: host };
            initMain(config);
            cy.then(() => Countly.add_consent(["push"]));
            enablePush();
            cy.then(() => {
                Countly.halt();
                initMain(config);
                Countly.add_consent(["push"]);
                Countly.remove_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
        });
    });

    it("Looks no further than its own scope for the subscription to drop when push consent is withdrawn", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            cy.then(() => {
                // with nothing registered at /push/, getRegistration answers with the root registration
                push.registeredScopeWorker = { scope: ROOT_SCOPE, pushManager: push.pushManager, active: { scriptURL: new URL("/site-sw.js", location.href).href } };
                push.subscription = foreignSubscription(VAPID_KEY);
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait);
            cy.then(() => Countly.remove_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscription).to.not.equal(null);
            });
        });
    });

    it("Leaves the push app's subscription alone when push consent is withdrawn in another Countly app that has a scope of its own", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            var other = null;
            cy.then(() => {
                expect(push.subscription).to.not.equal(null);
                other = Countly.init({ app_key: "another_app", url: "https://your.domain.count.ly", device_id: "another app user", test_mode: true, test_mode_eq: true, require_consent: true, push_service_worker_scope: "countly-push-other/" });
                other.add_consent(Countly.features);
            });
            cy.wait(hp.sWait).then(() => {
                other.remove_consent(Countly.features);
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscription).to.not.equal(null);
            });
            cy.then(() => other.halt());
        });
    });

    it("Says that disabling failed when the browser refuses to look up the registration", () => {
        hp.haltAndClearStorage(() => {
            push.container.getRegistration = () => Promise.reject(new DOMException("The document is in an invalid state.", "InvalidStateError"));
            initMain({ push_vapid_public_key: VAPID_KEY });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: false, reason: "error", error: "InvalidStateError: The document is in an invalid state." });
            });
        });
    });

    it("Takes its token back when another push provider took the root scope and nothing could be stored", () => {
        hp.haltAndClearStorage(() => {
            cy.then(() => {
                // a full disk: every write of the push record fails
                var setItem = Storage.prototype.setItem;
                Storage.prototype.setItem = function (key) {
                    if (String(key).indexOf("/cly_push_") !== -1) {
                        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
                    }
                    return setItem.apply(this, arguments);
                };
                push.restore.push(() => {
                    Storage.prototype.setItem = setItem;
                });
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            });
            enablePush();
            pushStorage("cly_push_endpoint").should("equal", null);
            cy.then(() => {
                push.subscription = foreignSubscription(OTHER_VAPID_KEY);
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: true });
                expect(push.unsubscribeCalls).to.equal(0);
            });
            tokenRequests((requests) => {
                expect(requests.map((request) => request.web_token === "BLACKLISTED")).to.deep.equal([false, true]);
            });
        });
    });

    it("Asks the browser to look for a newer version of its worker file on a returning visit, without waiting for the answer", () => {
        hp.haltAndClearStorage(() => {
            // registered on an earlier visit, whose visitor allowed notifications
            push.grantPermission();
            push.registeredScopeWorker = push.registration;
            push.registration.update = () => {
                push.updateCalls++;
                return new Promise(() => { });
            };
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.updateCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(1);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Subscribes even when the browser cannot look for a newer version of its worker file, and says why at DEBUG level", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            push.grantPermission();
            push.registeredScopeWorker = push.registration;
            push.registration.update = () => Promise.reject(new TypeError("Failed to update a ServiceWorker: A bad HTTP response code (404) was received when fetching the script."));
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                var failed = lines.filter((line) => line.indexOf("TypeError: Failed to update a ServiceWorker") !== -1);
                expect(failed.length).to.equal(1);
                expect(failed[0].indexOf("[DEBUG]")).to.equal(0);
            });
            expectTokenRequestCount(1);
        });
    });

    it("Leaves update checks of a registration it shares to the browser and the site", () => {
        hp.haltAndClearStorage(() => {
            push.registration.scope = ROOT_SCOPE;
            push.registeredScopeWorker = push.registration;
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.updateCalls).to.equal(0);
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_registration: push.registration });
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.updateCalls).to.equal(0);
            });
        });
    });

    it("Announces itself to its own worker under the default scope, which controls no page", () => {
        hp.haltAndClearStorage(() => {
            var countlyWorker = [];
            cy.then(() => {
                // registered on an earlier visit; the site's own worker, or none, controls the page
                push.registration.active.postMessage = (m) => countlyWorker.push(m);
                push.registeredScopeWorker = push.registration;
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                expect(countlyWorker.filter((m) => m.type === "countly_push_ready").length).to.equal(1);
                expect(push.controllerMessages).to.deep.equal([]);
            });
        });
    });

    it("Takes a click its worker tagged with the default scope for its own", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "own-scope-1", scope: COUNTLY_SCOPE });
                // another app's worker at the root scope
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: "root-scope-1", scope: ROOT_SCOPE });
            });
            recordedPushActions((actions) => {
                expect(actions.map((action) => action.segmentation.b)).to.deep.equal([0]);
            });
        });
    });

    // ---- reaching the worker, and handing it details only while the page itself would report ----

    it("Keeps the SDK working in a sandboxed iframe, where reading the service worker API throws", () => {
        hp.haltAndClearStorage(() => {
            sandboxServiceWorker();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                expect(() => Countly.change_id("someone else", false)).to.not.throw();
                expect(() => Countly.set_id("third user")).to.not.throw();
                expect(Countly.get_device_id()).to.equal("third user");
            });
            enablePush().then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "unsupported" });
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: false, reason: "unsupported" });
            });
        });
    });

    it("Keeps a device id change working when the worker refuses a message", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                push.container.controller = { postMessage: () => { throw new DOMException("The worker refused the message", "DataCloneError"); } };
                expect(() => Countly.change_id("someone else", false)).to.not.throw();
                expect(Countly.get_device_id()).to.equal("someone else");
            });
        });
    });

    it("Leaves the service worker alone on a device id change when push is not configured", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.then(() => {
                Countly.change_id("someone else", false);
                Countly.change_id("merged user", true);
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.controllerMessages).to.deep.equal([]);
            });
        });
    });

    it("Announces itself to its own worker when that worker does not control the page", () => {
        hp.haltAndClearStorage(() => {
            var countlyWorker = [];
            cy.then(() => {
                // Countly's worker has a scope of its own, so the site's worker, or none, controls the page
                push.registeredScopeWorker = { scope: "/push/", pushManager: push.pushManager, active: { scriptURL: new URL("/countly_sw.js", location.href).href, postMessage: (m) => countlyWorker.push(m) } };
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            });
            cy.wait(hp.sWait).then(() => {
                var ready = countlyWorker.filter((m) => m.type === "countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0].config.device_id).to.equal("web push tester");
                expect(push.controllerMessages).to.deep.equal([]);
            });
        });
    });

    it("Gives its server details to the worker it registered under a scope that does not cover the page", () => {
        hp.haltAndClearStorage(() => {
            var countlyWorker = [];
            cy.then(() => {
                push.registration.scope = "/push/";
                push.registration.active.postMessage = (m) => countlyWorker.push(m);
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                var configs = countlyWorker.filter((m) => m.type === "countly_push_config");
                expect(configs.length).to.equal(1);
                expect(configs[0].config.device_id).to.equal("web push tester");
                expect(workerMessages("countly_push_config")).to.deep.equal([]);
            });
        });
    });

    it("Does not take the site's own worker at a wider scope for Countly's", () => {
        hp.haltAndClearStorage(() => {
            var siteWorker = [];
            cy.then(() => {
                // with no registration at /push/ yet, getRegistration answers with the site's one for "/"
                push.container.controller = null;
                push.registeredScopeWorker = { scope: "/", pushManager: push.pushManager, active: { scriptURL: new URL("/site-sw.js", location.href).href, postMessage: (m) => siteWorker.push(m) } };
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(siteWorker).to.deep.equal([]);
            });
        });
    });

    it("Gives the worker no server details in offline mode, and the real id once it ends", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", offline_mode: true, test_mode: true, test_mode_eq: true, debug: true, push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").map((m) => m.config)).to.deep.equal([null]);
                Countly.disable_offline_mode("real user");
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.equal(1);
                expect(configs[0].config.device_id).to.equal("real user");
                push.controllerMessages.length = 0;
                Countly.enable_offline_mode();
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
            });
        });
    });

    it("Takes the server details back from the worker when the visitor opts out, and hands them back on opt in", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready")[0].config.device_id).to.equal("web push tester");
                push.controllerMessages.length = 0;
                Countly.opt_out();
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
                push.controllerMessages.length = 0;
                Countly.opt_in();
                expect(workerMessages("countly_push_config").map((m) => m.config.device_id)).to.deep.equal(["web push tester"]);
            });
        });
    });

    it("Takes Countly's push subscription off the browser when the visitor opts out, so no notification arrives any more", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                Countly.opt_out();
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
                expect(lines.filter((line) => line.indexOf("rejected the token") !== -1), "no token request it could not queue").to.deep.equal([]);
            });
            pushStorage("cly_push_endpoint").should("equal", null);
            expectTokenRequestCount(1);
        });
    });

    it("Leaves another push provider's subscription alone when the visitor opts out", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/" });
            cy.then(() => {
                push.registeredScopeWorker = push.registration;
                push.subscription = foreignSubscription(OTHER_VAPID_KEY);
                Countly.opt_out();
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.unsubscribeCalls).to.equal(0);
                expect(push.subscription.endpoint).to.equal("https://push.example/someone-elses");
            });
        });
    });

    it("Does not subscribe a visitor who opted out again by itself once they opt in", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                Countly.opt_out();
            });
            cy.wait(hp.sWait).then(() => {
                Countly.opt_in();
                reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                // permission alone is not consent: only enable_push_notifications subscribes them again
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
        });
    });

    it("Takes the server details back from the worker at every load of a visitor who opted out", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                Countly.opt_out();
                Countly.halt();
                push.controllerMessages.length = 0;
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                // owner null: a click made while the visitor is opted out must never be recorded
                expect(withoutScope(push.controllerMessages)).to.deep.equal([{ type: "countly_push_config", config: null, owner: null }]);
            });
        });
    });

    it("Takes the server details back at every load of a visitor who opted out, also from a worker that does not control the page", () => {
        hp.haltAndClearStorage(() => {
            var countlyWorker = [];
            cy.then(() => {
                push.container.controller = null;
                push.registration.scope = "/push/";
                push.registration.active.postMessage = (m) => countlyWorker.push(m);
                push.registeredScopeWorker = push.registration;
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            });
            cy.wait(hp.sWait).then(() => {
                Countly.opt_out();
                Countly.halt();
                countlyWorker.length = 0;
                initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/push/" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(withoutScope(countlyWorker)).to.deep.equal([{ type: "countly_push_config", config: null, owner: null }]);
            });
        });
    });

    it("Takes the server details back from the worker at a load the site itself starts with ignore_visitor", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                Countly.halt();
                push.controllerMessages.length = 0;
                initMain({ push_vapid_public_key: VAPID_KEY, ignore_visitor: true });
            });
            cy.wait(hp.sWait).then(() => {
                expect(withoutScope(push.controllerMessages)).to.deep.equal([{ type: "countly_push_config", config: null, owner: null }]);
            });
        });
    });

    it("Takes the server details back from the worker for any true value of ignore_visitor", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                Countly.halt();
                push.controllerMessages.length = 0;
                initMain({ push_vapid_public_key: VAPID_KEY, ignore_visitor: 1 });
            });
            cy.wait(hp.sWait).then(() => {
                expect(withoutScope(push.controllerMessages)).to.deep.equal([{ type: "countly_push_config", config: null, owner: null }]);
            });
        });
    });

    it("Leaves the worker's details alone on a visit that is ignored only because it is prerendered", () => {
        hp.haltAndClearStorage(() => {
            Object.defineProperty(document, "visibilityState", { value: "prerender", configurable: true });
            push.restore.push(() => delete document.visibilityState);
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                expect(push.controllerMessages).to.deep.equal([]);
            });
        });
    });

    [["tracking", { tracking: false }], ["networking", { networking: false }]].forEach(([what, settings]) => {
        it("Takes the server details back from the worker when the server switches " + what + " off", () => {
            hp.haltAndClearStorage(() => {
                // answered after the ready handshake, as a real server is
                cy.intercept("POST", "https://your.domain.count.ly/o/sdk", { statusCode: 200, body: { v: 1, t: 1, c: settings }, delay: 100 });
                cy.then(() => initMain({ push_vapid_public_key: VAPID_KEY }));
                // retried until this page's own answer is in: a request an earlier test left pending can take the stubbed answer first
                cy.wrap(null, { timeout: 4000 }).should(() => {
                    var configs = push.controllerMessages.filter((m) => m.type === "countly_push_ready" || m.type === "countly_push_config").map((m) => m.config);
                    expect(configs[0].device_id).to.equal("web push tester");
                    expect(configs[configs.length - 1]).to.equal(null);
                });
            });
        });
    });

    it("Takes the server details back from the worker when push consent is withdrawn before anything was registered", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                Countly.add_consent(["push"]);
                // a login hands the worker the details, while no token was ever registered
                Countly.change_id("logged in user", true);
            });
            cy.wait(hp.sWait).then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs[configs.length - 1].config.device_id).to.equal("logged in user");
                push.controllerMessages.length = 0;
                Countly.remove_consent(["push"]);
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
            });
        });
    });

    it("Leaves a notification click to the app that uses push when several SDK instances share the page", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var other = null;
            cy.then(() => {
                other = Countly.init({ app_key: "another_app", url: "https://your.domain.count.ly", device_id: "another app user", test_mode: true, test_mode_eq: true });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "shared-1" });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
            }, "another_app");
            cy.then(() => other.halt());
        });
    });

    it("Leaves a click to the app whose worker scope it came from when two apps with push share the page", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/a/" });
            var other = null;
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            cy.then(() => {
                // each app has a worker of its own scope, and every instance on the page hears both workers
                other = Countly.init({ app_key: "another_app", url: "https://your.domain.count.ly", device_id: "another app user", test_mode: true, test_mode_eq: true, push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/b/" });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "from-a", scope: new URL("/a/", location.href).href }, worker);
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: "from-b", scope: new URL("/b/", location.href).href }, worker);
            });
            recordedPushActions((actions) => {
                expect(actions.map((action) => action.segmentation.b)).to.deep.equal([0]);
            });
            recordedPushActions((actions) => {
                expect(actions.map((action) => action.segmentation.b)).to.deep.equal([1]);
                expect(acks.map((m) => m.aid).sort()).to.deep.equal(["from-a", "from-b"]);
            }, "another_app");
            cy.then(() => other.halt());
        });
    });

    it("Keeps talking to the worker for an app that subscribed with a key passed to enable_push_notifications only", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush({ push_vapid_public_key: VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.be.greaterThan(0);
                expect(configs[configs.length - 1].config.device_id).to.equal("web push tester");
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "per-call-1" });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
            });
        });
    });

    it("Names its own app's worker scope in the handshake and server details, also while that worker does not exist yet", () => {
        hp.haltAndClearStorage(() => {
            var scopeA = new URL("/a/", location.href).href;
            var scopeB = new URL("/b/", location.href).href;
            initMain({ push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/a/" });
            var other = null;
            cy.then(() => {
                // neither app has a worker yet, so both reach whichever worker controls the page
                other = Countly.init({ app_key: "another_app", url: "https://your.domain.count.ly", device_id: "another app user", test_mode: true, test_mode_eq: true, push_vapid_public_key: VAPID_KEY, push_service_worker_scope: "/b/" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").map((m) => [m.config.app_key, m.scope])).to.deep.equal([[hp.appKey, scopeA], ["another_app", scopeB]]);
                push.controllerMessages.length = 0;
                other.opt_out();
                expect(workerMessages("countly_push_config").map((m) => [m.config, m.scope])).to.deep.equal([[null, scopeB]]);
            });
            cy.then(() => other.halt());
        });
    });

    // ---- clicks handed over before consent, and late clicks ------------------------------------

    it("Records a click the worker kept for later at the time it was made", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            // made on Monday 28 September 2026 at 09:15 local time
            var clickedAt = new Date(2026, 8, 28, 9, 15, 0).getTime();
            cy.then(() => {
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 1, aid: MESSAGE_ID + "_1_" + clickedAt, ts: clickedAt });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(actions[0].timestamp).to.equal(clickedAt);
                expect(actions[0].hour).to.equal(9);
                expect(actions[0].dow).to.equal(1);
                expect(actions[0].id).to.match(/^[0-9a-f]{8}\d{13}$/);
            });
        });
    });

    it("Ties a click made before this page was open to no page view", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var clickedAt = Date.now() - 3 * 24 * 60 * 60 * 1000;
            cy.then(() => {
                Countly.track_pageview("push landing");
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: MESSAGE_ID + "_0_" + clickedAt, ts: clickedAt });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(actions[0].cvid).to.equal("");
            });
        });
    });

    it("Ties a click made while this page is open to the page's current view", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var viewId = null;
            cy.then(() => {
                Countly.track_pageview("push landing");
                viewId = Countly._internals.getEventQueue().filter((event) => event.key === "[CLY]_view")[0].id;
                var clickedAt = Date.now();
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: MESSAGE_ID + "_0_" + clickedAt, ts: clickedAt });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(actions[0].cvid).to.equal(viewId);
            });
        });
    });

    it("Leaves a relayed click with the worker until push consent is given, then records it", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            var events = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "kept-1" }, worker);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
                expect(acks).to.deep.equal([]);
                expect(events).to.deep.equal([]);
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                // the worker hands its kept clicks over again when the page announces itself after consent
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "kept-1" }, worker);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-1" }]);
                expect(events.map((e) => e.type)).to.deep.equal(["clicked"]);
            });
        });
    });

    it("Announces itself to the worker again once push consent is given, with the server details", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY, push_auto_register: false });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").map((m) => m.config)).to.deep.equal([null]);
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.length).to.equal(2);
                expect(ready[1].config.device_id).to.equal("web push tester");
            });
        });
    });

    it("Records a kept click once when a cookie banner grants every feature at once", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            var events = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "kept-all-1" }, worker);
                Countly.add_consent(Countly.features);
            });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").length).to.equal(2);
                // the worker answers it by handing over the click it kept
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "kept-all-1" }, worker);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-all-1" }]);
                expect(events.map((e) => e.type)).to.deep.equal(["clicked"]);
            });
        });
    });

    it("Confirms a click it will never record, so the worker stops handing it over", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var acks = [];
            cy.then(() => {
                Countly.opt_out();
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "opted-out-1" }, { postMessage: (m) => acks.push(m) });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "opted-out-1" }]);
            });
        });
    });

    it("Does not announce itself on push consent when push is not configured", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true });
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").length).to.equal(0);
            });
        });
    });

    it("Confirms a click it already recorded again, even after push consent is withdrawn", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            cy.then(() => {
                Countly.add_consent(["push"]);
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "twice-1" }, worker);
                Countly.remove_consent(["push"]);
                // the same click handed over again, as when it came directly and then with the kept ones
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "twice-1" }, worker);
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(1);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "twice-1" }, { type: "countly_push_ack", aid: "twice-1" }]);
            });
        });
    });

    it("Tells the listener about a click the worker already recorded, and confirms it, also before push consent is given", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var events = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "recorded-1", recorded: true }, { postMessage: (m) => acks.push(m) });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "recorded-1" }]);
                expect(events.map((e) => e.type)).to.deep.equal(["clicked"]);
            });
        });
    });

    // ---- what a failed call says, and keeping a replaced subscription registered --------------

    it("Names the error type when enabling fails", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                // what Chrome rejects with when the push service refuses the subscription
                push.pushManager.subscribe = () => Promise.reject(new DOMException("Registration failed - permission denied", "NotAllowedError"));
            });
            enablePush().then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "error", error: "NotAllowedError: Registration failed - permission denied" });
            });
        });
    });

    it("Names the error type when disabling fails", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush();
            cy.then(() => {
                push.subscription.unsubscribe = () => Promise.reject(new DOMException("Unsubscription failed", "AbortError"));
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: false, reason: "error", error: "AbortError: Unsubscription failed" });
            });
        });
    });

    it("Tells the worker which key the registered subscription uses, and stops once push is disabled", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            enablePush().then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs[configs.length - 1].config.vapid_key).to.equal(VAPID_KEY);
                push.controllerMessages.length = 0;
            });
            disablePush().then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs.length).to.be.greaterThan(0);
                expect(configs[configs.length - 1].config).to.not.have.property("vapid_key");
            });
        });
    });

    [
        ["with change_id", () => Countly.change_id("someone else", false)],
        ["when offline mode ends under their ID", () => {
            Countly.enable_offline_mode();
            Countly.disable_offline_mode("someone else");
        }],
        ["on a page that starts afresh with clear_stored_id", () => {
            reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY, push_auto_register: false, clear_stored_id: true, device_id: "someone else" });
        }]
    ].forEach(([how, takeOver]) => {
        it("Withdraws the subscription key from the worker when a new user takes over the browser " + how, () => {
            hp.haltAndClearStorage(() => {
                initMain({ push_vapid_public_key: VAPID_KEY, push_auto_register: false });
                enablePush().then(() => {
                    var configs = workerMessages("countly_push_config");
                    expect(configs[configs.length - 1].config.vapid_key).to.equal(VAPID_KEY);
                    push.controllerMessages.length = 0;
                    takeOver();
                });
                cy.wait(hp.sWait).then(() => {
                    var details = push.controllerMessages.filter((m) => m.type === "countly_push_config" || m.type === "countly_push_ready");
                    var last = details[details.length - 1].config;
                    expect(last.device_id).to.equal("someone else");
                    expect(last).to.not.have.property("vapid_key");
                });
            });
        });
    });

    it("Withdraws the server details from the worker when someone else logs in on a site that passes the key only to enable_push_notifications", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                var configs = workerMessages("countly_push_config");
                expect(configs[configs.length - 1].config.vapid_key).to.equal(VAPID_KEY);
                push.controllerMessages.length = 0;
                Countly.change_id("someone else", false);
                expect(withoutScope(push.controllerMessages)).to.deep.equal([{ type: "countly_push_config", config: null, owner: { device_id: "someone else", t: 0 } }]);
            });
        });
    });

    it("Withdraws the server details from the worker for good when push is disabled on a site that passes the key only to enable_push_notifications", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                push.controllerMessages.length = 0;
            });
            disablePush().then(() => {
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
                Countly.opt_out();
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
            });
        });
    });

    [
        ["push is disabled", () => disablePush()],
        ["someone else logs in", () => cy.then(() => Countly.change_id("someone else", false))]
    ].forEach(([what, stopUsingPush]) => {
        it("Hands nothing to a worker that takes control of the page after " + what + " on a site that passes the key only to enable_push_notifications", () => {
            hp.haltAndClearStorage(() => {
                initMain();
                enablePush({ push_vapid_public_key: VAPID_KEY });
                cy.wait(hp.sWait).then(() => {
                    push.controllerMessages.length = 0;
                    push.changeController();
                    expect(workerMessages("countly_push_ready").length).to.equal(1);
                });
                stopUsingPush().then(() => {
                    push.controllerMessages.length = 0;
                    push.changeController();
                    expect(push.controllerMessages).to.deep.equal([]);
                });
            });
        });
    });

    it("Withdraws the server details from the worker when the next page starts afresh with clear_stored_id on a site that passes the key only to enable_push_notifications", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                push.controllerMessages.length = 0;
                reloadWithPushRecord({ clear_stored_id: true, device_id: "someone else" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(withoutScope(push.controllerMessages)).to.deep.equal([{ type: "countly_push_config", config: null, owner: { device_id: "someone else", t: 0 } }]);
            });
        });
    });

    [["", false], [" or when push consent is given", true]].forEach(([when, consentMode]) => {
        it("Leaves the token to the site's own enable call at the next load with push_auto_register false" + when, () => {
            hp.haltAndClearStorage(() => {
                push.grantPermission();
                var config = { push_vapid_public_key: VAPID_KEY, push_auto_register: false, require_consent: consentMode };
                initMain(config);
                if (consentMode) {
                    cy.then(() => Countly.add_consent(["push"]));
                }
                enablePush();
                expectTokenRequestCount(1);
                cy.then(() => {
                    dropStoredQueue();
                    reloadWithPushRecord(config);
                });
                cy.wait(hp.sWait);
                if (consentMode) {
                    // after the load-time registration had its turn, so only the consent path is exercised
                    cy.then(() => Countly.add_consent(["push"]));
                    cy.wait(hp.sWait);
                }
                expectTokenRequestCount(0);
            });
        });
    });

    // ---- using push on the page that enabled it, also where nothing can be stored ----------------

    it("Records clicks and gives the worker its details on the page that enabled push, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY }).then((result) => {
                expect(result.subscribed).to.equal(true);
                var details = push.controllerMessages.filter((m) => (m.type === "countly_push_config" || m.type === "countly_push_ready") && m.config);
                expect(details.length).to.be.greaterThan(0);
                expect(details[details.length - 1].config).to.include({ device_id: "web push tester", vapid_key: VAPID_KEY });
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "memory-1" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(queuedPushActions().length).to.equal(1);
            });
        });
    });

    it("Asks the worker for the clicks it kept once push is enabled on a page that did not use push when it loaded", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready")).to.deep.equal([]);
            });
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0].config.device_id).to.equal("web push tester");
            });
        });
    });

    it("Drops its own subscription and takes the token back on a disable where nothing can be stored, with the key passed to enable_push_notifications only", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                push.controllerMessages.length = 0;
            });
            disablePush().then((result) => {
                expect(result).to.deep.equal({ unsubscribed: true });
                expect(push.unsubscribeCalls).to.equal(1);
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
            });
            cy.wait(hp.sWait).then(() => {
                var requests = Countly._internals.getRequestQueue().filter((request) => request.token_session);
                expect(requests.map((request) => request.web_token).slice(-1)).to.deep.equal(["BLACKLISTED"]);
            });
        });
    });

    it("Keeps using push after a device id change with merge on the page that enabled it, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                Countly.change_id("account 7", true);
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "merged-1" });
            });
            cy.wait(hp.sWait).then(() => {
                var actions = queuedPushActions();
                expect(actions.length).to.equal(1);
                expect(actions[0].device_id).to.equal("account 7");
            });
        });
    });

    it("Stops using push on the page that enabled it once someone else logs in, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                push.controllerMessages.length = 0;
                Countly.change_id("someone else", false);
                expect(workerMessages("countly_push_config").map((m) => m.config)).to.deep.equal([null]);
                push.emit({ type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: "after-switch-1" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(queuedPushActions()).to.deep.equal([]);
            });
        });
    });

    it("Takes the token back from the account a visitor was merged into once someone else logs in, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            enablePush();
            cy.then(() => {
                Countly.change_id("account 7", true);
                Countly.change_id("someone else", false);
            });
            cy.wait(hp.sWait).then(() => {
                var blacklisted = Countly._internals.getRequestQueue().filter((request) => request.web_token === "BLACKLISTED");
                expect(blacklisted.map((request) => request.device_id)).to.deep.equal(["account 7"]);
            });
        });
    });

    it("Goes by the stored record alone where storage works, so another tab's disable is not undone", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                push.controllerMessages.length = 0;
                // another tab disabled push: the record the tabs share through storage is gone
                ["cly_push_endpoint", "cly_push_vapid_key", "cly_push_scope"].forEach((key) => localStorage.removeItem(hp.appKey + "/" + key));
                // anything that hands the worker the details again
                Countly.opt_in();
                expect(push.controllerMessages.filter((m) => m.config && m.config.vapid_key)).to.deep.equal([]);
            });
        });
    });

    it("Tells the worker to keep the server details in memory only where nothing can be stored, and only there", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").map((m) => m.persist)).to.deep.equal([false]);
                push.controllerMessages.length = 0;
                // anything that withdraws the details or hands them over again
                Countly.opt_out();
                Countly.opt_in();
                expect(workerMessages("countly_push_config").map((m) => m.persist)).to.deep.equal([false, false]);
            });
            cy.then(() => {
                Countly.halt();
                push.controllerMessages.length = 0;
                initMain({ push_vapid_public_key: VAPID_KEY });
            });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.length).to.equal(1);
                expect(ready[0]).to.not.have.property("persist");
            });
        });
    });

    it("Asks for memory only also when it withdraws the details from the worker for good, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            // no key at init, so the disable ends this page's use of push
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY }).then(() => {
                push.controllerMessages.length = 0;
            });
            disablePush().then(() => {
                expect(workerMessages("countly_push_config").map((m) => [m.config, m.persist])).to.deep.equal([[null, false]]);
            });
        });
    });

    it("Registers the worker with the flag to keep everything in memory in its URL where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none", debug: false });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.map((call) => call.path)).to.deep.equal(["/countly_sw.js?cly_persist=0"]);
                Countly.halt();
                initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(push.registerCalls.map((call) => call.path).slice(-1)).to.deep.equal(["/countly_sw.js?cly_debug=1&cly_persist=0"]);
            });
        });
    });

    it("Still takes its worker under its own scope for its own when the worker's URL carries the flag to keep everything in memory", () => {
        hp.haltAndClearStorage(() => {
            var countlyWorker = [];
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none", debug: false });
            cy.wait(hp.sWait).then(() => {
                expect(push.registerCalls).to.deep.equal([{ path: "/countly_sw.js?cly_persist=0", scope: COUNTLY_SCOPE }]);
                expect(push.updateCalls).to.equal(1);
                // as a browser reports it, the worker runs the URL it was registered with, flag included
                push.registration.active = { scriptURL: new URL(push.registerCalls[0].path, location.href).href, postMessage: (m) => countlyWorker.push(m) };
                Countly.halt();
                initMain({ push_vapid_public_key: OTHER_VAPID_KEY, storage: "none", debug: false });
            });
            cy.wait(hp.sWait).then(() => {
                expect(countlyWorker.filter((m) => m.type === "countly_push_ready").map((m) => m.persist)).to.deep.equal([false]);
                expect(push.updateCalls).to.equal(2);
                expect(push.unsubscribeCalls).to.equal(1);
                expect(push.subscribeCalls).to.equal(2);
                expect(new Uint8Array(push.subscription.options.applicationServerKey)).to.deep.equal(keyToBytes(OTHER_VAPID_KEY));
            });
        });
    });

    // ---- keeping push disabled for the rest of the page, also where nothing can be stored ------

    // token_session requests from the SDK's queue, as "<device ID>:token" or "<device ID>:BLACKLISTED"
    function queuedTokenRequests() {
        return Countly._internals.getRequestQueue().filter((request) => request.token_session).map((request) => request.device_id + ":" + (request.web_token === "BLACKLISTED" ? "BLACKLISTED" : "token"));
    }

    it("Keeps push disabled for the rest of the page where nothing can be stored, whatever would subscribe the visitor silently, until push is enabled explicitly", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            disablePush();
            cy.then(() => Countly.change_id("someone else", false));
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                Countly.enable_offline_mode();
                Countly.disable_offline_mode("third person");
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                push.emit({ type: "countly_push_subscription_change" });
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
            });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                Countly.change_id("fourth person", false);
            });
            cy.wait(hp.sWait).then(() => {
                expect(queuedTokenRequests()).to.deep.equal(["web push tester:token", "web push tester:BLACKLISTED", "third person:token", "third person:BLACKLISTED", "fourth person:token"]);
            });
        });
    });

    it("Keeps push disabled for the rest of the page where nothing can be stored, also when push consent is withdrawn and given again", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY, storage: "none" });
            cy.then(() => Countly.add_consent(["push"]));
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
            });
            disablePush();
            cy.then(() => {
                Countly.remove_consent(["push"]);
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
                expect(queuedTokenRequests()).to.deep.equal(["web push tester:token", "web push tester:BLACKLISTED"]);
            });
        });
    });

    it("Drops the subscription an enable was still creating when push is disabled meanwhile, also where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            var deferred = null;
            var pending = null;
            cy.then(() => {
                deferred = deferSubscribe();
                pending = Countly.enable_push_notifications();
            });
            cy.wrap(null).then(() => deferred.called);
            disablePush();
            cy.wrap(null).then(() => {
                deferred.finish();
                return pending;
            }).then((result) => {
                expect(result).to.deep.equal({ subscribed: false, reason: "disabled" });
                expect(push.subscribeCalls).to.equal(1);
                expect(push.subscription).to.equal(null);
                expect(queuedTokenRequests()).to.deep.equal([]);
            });
        });
    });

    it("Goes by the stored opt-out alone where storage works, so another tab's enable lifts it", () => {
        hp.haltAndClearStorage(() => {
            push.grantPermission();
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait);
            disablePush();
            cy.then(() => {
                // another tab enabled push again, which lifts the opt-out the tabs share through storage
                localStorage.removeItem(hp.appKey + "/cly_push_opt_out");
                Countly.change_id("someone else", false);
            });
            cy.wait(hp.sWait).then(() => {
                expect(push.subscribeCalls).to.equal(2);
                expect(queuedTokenRequests().slice(-1)).to.deep.equal(["someone else:token"]);
            });
        });
    });

    // ---- recording a kept click for the user it belongs to -------------------------------------

    // a click the worker kept for later, made an hour ago, written down as `owner`'s
    function keptClick(aid, owner) {
        return { type: "countly_push_action", messageId: MESSAGE_ID, buttonIndex: 0, aid: aid, ts: Date.now() - 60 * 60 * 1000, owner: owner };
    }

    // the queued requests that carry a [CLY]_push_action event
    function pushActionRequests(callback) {
        cy.fetch_local_request_queue().then((rq) => {
            callback(rq.filter((request) => request.events && JSON.parse(request.events).some((event) => event.key === "[CLY]_push_action")));
        });
    }

    it("Tells the worker whose clicks they are, also while it withholds the server details", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            cy.wait(hp.sWait).then(() => {
                var ready = workerMessages("countly_push_ready");
                expect(ready.map((m) => m.config)).to.deep.equal([null]);
                expect(ready[0].owner).to.deep.equal({ device_id: "web push tester", t: 0 });
                push.controllerMessages.length = 0;
                Countly.add_consent(["push"]);
            });
            cy.wait(hp.sWait).then(() => {
                expect(workerMessages("countly_push_ready").map((m) => m.owner)).to.deep.equal([{ device_id: "web push tester", t: 0 }]);
                push.controllerMessages.length = 0;
                Countly.opt_out();
                expect(workerMessages("countly_push_config").map((m) => m.owner)).to.deep.equal([null]);
            });
        });
    });

    [["", () => { }], [", also after an opt-out the visitor took back there", () => {
        Countly.opt_out();
        Countly.opt_in();
    }]].forEach(([also, beforeConsent]) => {
        it("Does not mark later clicks as never to be recorded when push consent is given on a visit that is ignored only because it is prerendered" + also, () => {
            hp.haltAndClearStorage(() => {
                Object.defineProperty(document, "visibilityState", { value: "prerender", configurable: true });
                push.restore.push(() => delete document.visibilityState);
                initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
                cy.wait(hp.sWait).then(() => {
                    beforeConsent();
                    push.controllerMessages.length = 0;
                    Countly.add_consent(["push"]);
                });
                cy.wait(hp.sWait).then(() => {
                    var ready = workerMessages("countly_push_ready");
                    expect(ready.length).to.equal(1);
                    expect(ready[0].owner).to.equal(undefined);
                });
            });
        });
    });

    [
        ["in another tab", {}, () => {
            // another tab stored the opt-out, which this tab hears of through a storage event
            localStorage.setItem(hp.appKey + "/cly_ignore", "true");
            window.dispatchEvent(new StorageEvent("storage", { key: hp.appKey + "/cly_ignore", newValue: "true" }));
        }],
        ["where nothing can be stored", { storage: "none" }, () => Countly.opt_out()]
    ].forEach(([where, config, optOut]) => {
        it("Still marks later clicks as never to be recorded after an opt-out " + where, () => {
            hp.haltAndClearStorage(() => {
                initMain(Object.assign({ require_consent: true, push_vapid_public_key: VAPID_KEY }, config));
                cy.wait(hp.sWait).then(() => {
                    optOut();
                    push.controllerMessages.length = 0;
                    Countly.add_consent(["push"]);
                });
                cy.wait(hp.sWait).then(() => {
                    expect(workerMessages("countly_push_ready").map((m) => m.owner)).to.deep.equal([null]);
                });
            });
        });
    });

    it("Records a kept click for the user who was signed in when it was made, after someone else signed in", () => {
        hp.haltAndClearStorage(() => {
            // a location that need not be that of the user a kept click is recorded for
            initMain({ push_vapid_public_key: VAPID_KEY, country_code: "TR", city: "Izmir", ip_address: "10.1.2.3" });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            cy.then(() => {
                Countly.change_id("someone else", false);
                Countly.add_event({ key: "an event of someone else" });
                push.emit(keptClick("kept-for-tester", { device_id: "web push tester", t: 0, recordable: true }), worker);
            });
            pushActionRequests((requests) => {
                expect(requests.length).to.equal(1);
                expect(requests[0]).to.include({ device_id: "web push tester", t: 0 });
                var events = JSON.parse(requests[0].events);
                expect(events.map((event) => event.key)).to.deep.equal(["[CLY]_push_action"]);
                expect(requests[0]).to.not.have.any.keys("country_code", "city", "ip_address");
                expect(events[0].cvid).to.equal("");
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-for-tester" }]);
            });
            cy.fetch_local_request_queue().then((rq) => {
                var own = rq.filter((request) => request.events && JSON.parse(request.events).some((event) => event.key === "an event of someone else"));
                expect(own.map((request) => request.device_id)).to.deep.equal(["someone else"]);
                expect(own[0]).to.include({ country_code: "TR", city: "Izmir", ip_address: "10.1.2.3" });
            });
        });
    });

    it("Leaves a kept click to the user it belongs to when that user had not allowed it to be recorded yet", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            var events = [];
            // made before the previous user's cookie banner was answered
            var click = keptClick("kept-unconsented", { device_id: "web push tester", t: 0 });
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                Countly.change_id("someone else", false);
                Countly.add_consent(["push"]);
                push.emit(click, worker);
            });
            pushActionRequests((requests) => {
                expect(requests).to.deep.equal([]);
                expect(acks).to.deep.equal([]);
                expect(events).to.deep.equal([]);
                Countly.change_id("web push tester", false);
                Countly.add_consent(["push"]);
                push.emit(click, worker);
            });
            pushActionRequests((requests) => {
                expect(requests.map((request) => request.device_id)).to.deep.equal(["web push tester"]);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-unconsented" }]);
                expect(events.map((e) => e.type)).to.deep.equal(["clicked"]);
            });
        });
    });

    it("Tells this page's push listener nothing about a kept click of another user", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY, device_id: "someone else" });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            var events = [];
            cy.then(() => {
                Countly.set_push_notification_listener((e) => events.push(e));
                push.emit(Object.assign(keptClick("kept-not-sent", { device_id: "web push tester", t: 0, recordable: true }), { title: "Your order shipped" }), worker);
                push.emit(Object.assign(keptClick("kept-sent", { device_id: "web push tester", t: 0, recordable: true }), { title: "Your reset code", recorded: true }), worker);
            });
            pushActionRequests((requests) => {
                expect(requests.map((request) => request.device_id)).to.deep.equal(["web push tester"]);
                expect(acks.map((m) => m.aid)).to.deep.equal(["kept-not-sent", "kept-sent"]);
                expect(events).to.deep.equal([]);
            });
        });
    });

    it("Files gathered log lines under the current user also when a batch fills while another user's kept click is queued", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: hp.appKey,
                url: "https://your.domain.count.ly",
                device_id: "web push tester",
                test_mode: true,
                test_mode_eq: true,
                debug: true,
                push_vapid_public_key: VAPID_KEY,
                fake_request_handler: (req) => {
                    if (req.functionName === "server_config") {
                        return { status: 200, responseText: JSON.stringify({ v: 2, t: 1786273877636, c: {}, lg: { e: true, i: "0123456789abcdef0123456789abcdef", l: "ewidv", b: 10 } }) };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            var failNextQueueWrite = false;
            var setItem = Storage.prototype.setItem;
            cy.stub(Storage.prototype, "setItem").callsFake(function (key, value) {
                if (failNextQueueWrite && this === window.sessionStorage && key.indexOf("/cly_queue") !== -1 && String(value).indexOf("previous user") !== -1) {
                    failNextQueueWrite = false;
                    // the warning about this failed write is the line that completes a batch
                    var buffer = Countly._internals.getLogBuffer();
                    var size = Countly._internals.getLogGatheringState().batchSize;
                    while (buffer.length < size - 1) {
                        buffer.push({ t: Date.now(), l: "d", m: "[Countly] earlier line" });
                    }
                    buffer.length = size - 1;
                    throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
                }
                return setItem.call(this, key, value);
            });
            // after the start, when requests go straight into the queue
            cy.wait(hp.sWait).then(() => {
                failNextQueueWrite = true;
                push.emit(keptClick("kept-for-previous-user", { device_id: "previous user", t: 0, recordable: true }), { postMessage: () => { } });
            });
            cy.wait(hp.sWait).then(() => {
                expect(failNextQueueWrite, "the queue write failed").to.equal(false);
                var queued = Countly._internals.getRequestQueue();
                expect(queued.filter((request) => request.events && request.device_id === "previous user").length, "the click, under its own user").to.equal(1);
                var logBatches = queued.filter((request) => request.sdk_logs);
                expect(logBatches.length, "a batch was filed").to.be.greaterThan(0);
                expect(logBatches.map((request) => request.device_id)).to.deep.equal(logBatches.map(() => "web push tester"));
            });
        });
    });

    it("Records another user's kept click only once push consent is given on this page", () => {
        hp.haltAndClearStorage(() => {
            initMain({ require_consent: true, push_vapid_public_key: VAPID_KEY });
            var acks = [];
            var worker = { postMessage: (m) => acks.push(m) };
            var click = keptClick("kept-before-banner", { device_id: "previous user", t: 0, recordable: true });
            cy.then(() => push.emit(click, worker));
            pushActionRequests((requests) => {
                expect(requests).to.deep.equal([]);
                expect(acks).to.deep.equal([]);
                Countly.add_consent(["push"]);
                push.emit(click, worker);
            });
            pushActionRequests((requests) => {
                expect(requests.map((request) => request.device_id)).to.deep.equal(["previous user"]);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-before-banner" }]);
            });
        });
    });

    it("Records a kept click for the user its device ID was merged into, also on a later page", () => {
        hp.haltAndClearStorage(() => {
            // an anonymous visitor, with the ID the SDK generated for them
            Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", test_mode: true, test_mode_eq: true, debug: true, push_vapid_public_key: VAPID_KEY });
            var anonymous = null;
            cy.then(() => {
                anonymous = Countly.get_device_id();
                Countly.set_id("logged in user");
                dropStoredQueue();
                reloadWithPushRecord({ device_id: "logged in user", push_vapid_public_key: VAPID_KEY });
            });
            cy.then(() => push.emit(keptClick("kept-anonymous", { device_id: anonymous, t: 1, recordable: true })));
            pushActionRequests((requests) => {
                expect(requests.map((request) => request.device_id)).to.deep.equal(["logged in user"]);
            });
        });
    });

    [
        ["someone else signs in", () => Countly.change_id("someone else", false)],
        ["the visitor opts out", () => Countly.opt_out()],
        ["the next page starts afresh with clear_stored_id for someone else", () => reloadWithPushRecord({ push_vapid_public_key: VAPID_KEY, clear_stored_id: true, device_id: "someone else" })]
    ].forEach(([when, leave]) => {
        it("Keeps no merged device IDs on the device once " + when, () => {
            hp.haltAndClearStorage(() => {
                // an anonymous visitor, with the ID the SDK generated for them
                Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", test_mode: true, test_mode_eq: true, debug: true, push_vapid_public_key: VAPID_KEY });
                cy.then(() => {
                    var anonymous = Countly.get_device_id();
                    Countly.set_id("alice@example.com");
                    expect(JSON.parse(localStorage.getItem(hp.appKey + "/cly_push_merged_ids"))).to.deep.equal([[anonymous, "alice@example.com"]]);
                    leave();
                    expect(localStorage.getItem(hp.appKey + "/cly_push_merged_ids")).to.equal(null);
                });
            });
        });
    });

    // alice signed in with merge on this tab; then someone else signed in on another tab, which deleted the merges and changed the device ID here
    function signedInHereThenSomeoneElseOnAnotherTab() {
        Countly.init({ app_key: hp.appKey, url: "https://your.domain.count.ly", test_mode: true, test_mode_eq: true, debug: true, push_vapid_public_key: VAPID_KEY });
        return cy.then(() => {
            var anonymous = Countly.get_device_id();
            Countly.set_id("alice@example.com");
            localStorage.removeItem(hp.appKey + "/cly_push_merged_ids");
            Countly._internals.onStorageChange("cly_id", "someone else");
            return anonymous;
        });
    }

    it("Does not bring back merged device IDs another tab deleted when it remembers a new merge", () => {
        hp.haltAndClearStorage(() => {
            signedInHereThenSomeoneElseOnAnotherTab().then(() => {
                Countly.change_id("someone else's account", true);
                expect(JSON.parse(localStorage.getItem(hp.appKey + "/cly_push_merged_ids"))).to.deep.equal([["someone else", "someone else's account"]]);
            });
        });
    });

    it("Does not follow merged device IDs another tab deleted for a kept click", () => {
        hp.haltAndClearStorage(() => {
            signedInHereThenSomeoneElseOnAnotherTab().then((anonymous) => {
                push.emit(keptClick("kept-anonymous", { device_id: anonymous, t: 1, recordable: true }));
            });
            cy.wait(hp.sWait).then(() => {
                var owners = queuedPushActions().map((event) => event.device_id);
                expect(owners.length, "recorded once").to.equal(1);
                expect(owners).to.not.include("alice@example.com");
            });
        });
    });

    it("Keeps the newest merged device IDs up to their own limit", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                for (var n = 0; n <= pushConstants.MAX_MERGED_DEVICE_IDS; n++) {
                    Countly.change_id("account " + n, true);
                }
                var kept = JSON.parse(localStorage.getItem(hp.appKey + "/cly_push_merged_ids"));
                expect(kept.length).to.equal(pushConstants.MAX_MERGED_DEVICE_IDS);
                expect(kept[kept.length - 1]).to.deep.equal(["account " + (pushConstants.MAX_MERGED_DEVICE_IDS - 1), "account " + pushConstants.MAX_MERGED_DEVICE_IDS]);
            });
        });
    });

    it("Never records a click made while the visitor had opted out, also once they opted in again", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            var acks = [];
            cy.then(() => {
                Countly.opt_out();
                Countly.opt_in();
                push.emit(keptClick("kept-opted-out", null), { postMessage: (m) => acks.push(m) });
            });
            recordedPushActions((actions) => {
                expect(actions.length).to.equal(0);
                expect(acks).to.deep.equal([{ type: "countly_push_ack", aid: "kept-opted-out" }]);
            });
        });
    });

    it("Records a kept click made in offline mode for the device ID offline mode ended with", () => {
        hp.haltAndClearStorage(() => {
            initMain({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => push.emit(keptClick("kept-offline", { device_id: "[CLY]_temp_id", t: 2 })));
            pushActionRequests((requests) => {
                expect(requests.map((request) => request.device_id)).to.deep.equal(["web push tester"]);
            });
        });
    });

    it("Records a kept click for the device ID it was merged into on the page that enabled push, where nothing can be stored", () => {
        hp.haltAndClearStorage(() => {
            initMain({ storage: "none" });
            enablePush({ push_vapid_public_key: VAPID_KEY });
            cy.then(() => {
                Countly.change_id("account 7", true);
                expect(workerMessages("countly_push_config").map((m) => m.owner).slice(-1)).to.deep.equal([{ device_id: "account 7", t: 0 }]);
                push.emit(keptClick("kept-before-login", { device_id: "web push tester", t: 0, recordable: true }));
            });
            cy.wait(hp.sWait).then(() => {
                expect(queuedPushActions().map((event) => event.device_id)).to.deep.equal(["account 7"]);
            });
        });
    });

    it("Does not say it loses the push record with storage none, as the page keeps it in memory", () => {
        hp.haltAndClearStorage(() => {
            var lines = printedLines();
            initMain({ push_vapid_public_key: VAPID_KEY, storage: "none" });
            enablePush().then((result) => {
                expect(result.subscribed).to.equal(true);
                expect(lines.filter((line) => line.indexOf("won't be stored") !== -1 && line.indexOf("cly_push_") !== -1)).to.deep.equal([]);
            });
        });
    });

    // Only what every released worker does belongs here, as each one is run through the same tests
    [{ version: SDK_VERSION, current: true }].concat(RELEASED_WORKERS.map((version) => ({ version: version, current: false }))).forEach((release) => {
        describe("With the service worker of " + (release.current ? "this SDK version" : "release " + release.version), () => {
            var source = null;
            var bodyClick = () => ({ notification: { close() { }, data: { i: MESSAGE_ID, l: new URL("/sale", location.href).href, b: [] } }, action: "" });

            before(() => {
                (release.current ? cy.readFile("lib/countly_sw.js") : cy.readFile("cypress/fixtures/countly_sw-" + release.version + ".js")).then((code) => {
                    source = code;
                });
            });

            it("Exchanges the ready handshake, warning only when the worker is another version", () => {
                hp.haltAndClearStorage(() => {
                    var link = null;
                    var lines = null;
                    cy.then(() => {
                        link = connectWorker(source);
                        lines = printedLines();
                        push.grantPermission();
                        initMain({ push_vapid_public_key: VAPID_KEY });
                    });
                    cy.wrap(null).should(() => {
                        var reports = link.page.messages.filter((message) => message.type === "countly_push_worker_version");
                        expect(reports.length).to.be.above(0);
                        expect(reports[0].version).to.equal(release.version);
                    });
                    cy.then(() => {
                        var warned = lines.some((line) => line.indexOf("version [" + release.version + "] while the SDK is version [" + SDK_VERSION + "]") !== -1);
                        expect(warned).to.equal(release.version !== SDK_VERSION);
                    });
                });
            });

            it("Has the next page record once a click the worker kept while no page was open", () => {
                hp.haltAndClearStorage(() => {
                    var link = null;
                    cy.then(() => {
                        link = connectWorker(source);
                        link.worker.self.clients.list = [];
                        return link.worker.dispatch("notificationclick", bodyClick());
                    }).then(() => {
                        link.worker.self.clients.list = [link.page];
                        push.grantPermission();
                        initMain({ push_vapid_public_key: VAPID_KEY });
                    });
                    cy.wrap(null).should(() => {
                        var actions = queuedPushActions();
                        expect(actions.length).to.equal(1);
                        expect(actions[0].segmentation).to.deep.equal({ i: MESSAGE_ID, b: 0, p: "w" });
                    });
                    // acknowledged by the page, so the page announcing itself again, as after a worker
                    // update, is not handed it again (another page asking this soon would be refused anyway)
                    cy.wait(hp.sWait).then(() => {
                        var handed = () => link.page.messages.filter((message) => message.type === "countly_push_action").length;
                        expect(handed()).to.equal(1);
                        return link.worker.dispatch("message", { data: { type: "countly_push_ready" }, source: link.page }).then(() => {
                            expect(handed()).to.equal(1);
                        });
                    });
                });
            });

            it("Has the open page record once a click the worker hands it", () => {
                hp.haltAndClearStorage(() => {
                    var link = null;
                    cy.then(() => {
                        link = connectWorker(source);
                        push.grantPermission();
                        initMain({ push_vapid_public_key: VAPID_KEY });
                    });
                    cy.wait(hp.sWait).then(() => link.worker.dispatch("notificationclick", bodyClick()));
                    cy.wrap(null).should(() => {
                        var actions = queuedPushActions();
                        expect(actions.length).to.equal(1);
                        expect(actions[0].segmentation).to.deep.equal({ i: MESSAGE_ID, b: 0, p: "w" });
                        expect(link.worker.self.fetch.calls).to.deep.equal([]);
                    });
                });
            });

            it("Lets the worker record a click itself while no page is open, with the server details the page gave it", () => {
                hp.haltAndClearStorage(() => {
                    var link = null;
                    cy.then(() => {
                        link = connectWorker(source);
                        push.grantPermission();
                        initMain({ push_vapid_public_key: VAPID_KEY });
                    });
                    // the page told the worker how to reach the server, then was closed
                    cy.wait(hp.sWait2).then(() => {
                        link.worker.self.clients.list = [];
                        return link.worker.dispatch("notificationclick", bodyClick());
                    }).then(() => {
                        var calls = link.worker.self.fetch.calls;
                        expect(calls.length).to.equal(1);
                        expect(calls[0].url.indexOf("https://your.domain.count.ly/")).to.equal(0);
                        var body = formBody(calls[0]);
                        expect(body).to.include({ app_key: hp.appKey, device_id: "web push tester" });
                        var events = JSON.parse(body.events);
                        expect(events.map((event) => event.key)).to.deep.equal(["[CLY]_push_action"]);
                        expect(events[0].segmentation).to.deep.equal({ i: MESSAGE_ID, b: 0, p: "w" });
                    });
                });
            });
        });
    });
});
