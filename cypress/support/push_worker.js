/* eslint-disable require-jsdoc */
// A fake service worker global for the reference worker countly_sw.js, shared by the worker's unit tests and
// the tests that run the page SDK against it. The worker only ever talks to `self`, so its source is evaluated
// against a fake global and its handlers are driven with hand-made events.

var clientCount = 0;

// like postMessage, a page gets a copy of the message as it was when posted
function fakeClient(url, focused) {
    clientCount++;
    return {
        id: "client-" + clientCount,
        url: url,
        focused: !!focused,
        messages: [],
        focusCalls: 0,
        postMessage(message) {
            this.messages.push(structuredClone(message));
        },
        focus() {
            this.focusCalls++;
            return Promise.resolve(this);
        }
    };
}

// timers the worker sets through self.setTimeout, run by the test when it decides the time is up
function manualTimers() {
    var pending = [];
    return {
        setTimeout(callback) {
            pending.push(callback);
            return pending.length;
        },
        clearTimeout(id) {
            pending[id - 1] = null;
        },
        runAll() {
            pending.slice().forEach((callback, i) => {
                if (callback) {
                    pending[i] = null;
                    callback();
                }
            });
        }
    };
}

// `setup` runs against the fake global before the worker source is evaluated, the way a host
// worker's own code would run before an importScripts() of countly_sw.js
function loadWorker(source, setup) {
    var handlers = {};
    var self = {
        skipWaitingCalls: 0,
        skipWaiting() {
            this.skipWaitingCalls++;
            return Promise.resolve();
        },
        setTimeout(callback, ms) {
            return window.setTimeout(callback, ms);
        },
        clearTimeout(id) {
            window.clearTimeout(id);
        },
        addEventListener(type, callback) {
            (handlers[type] = handlers[type] || []).push(callback);
        },
        clients: {
            list: [],
            claimCalls: 0,
            opened: [],
            claim() {
                this.claimCalls++;
                return Promise.resolve();
            },
            matchAll() {
                return Promise.resolve(this.list.slice());
            },
            openWindow(url) {
                this.opened.push(url);
                return Promise.resolve(null);
            }
        },
        registration: {
            shown: [],
            showNotification(title, options) {
                this.shown.push({ title: title, options: options });
                return Promise.resolve();
            },
            pushManager: {
                subscribeCalls: [],
                subscribe(options) {
                    this.subscribeCalls.push(options);
                    return Promise.resolve({
                        endpoint: "https://push.example/new",
                        expirationTime: null,
                        options: options,
                        toJSON() {
                            return { endpoint: this.endpoint, expirationTime: null, keys: { p256dh: "p256dh-new", auth: "auth-new" } };
                        }
                    });
                }
            }
        }
    };
    if (setup) {
        setup(self);
    }
    new Function("self", source)(self);
    // runs every handler registered for `type` and settles once their waitUntil promises have
    function dispatch(type, event) {
        var pending = [];
        event = event || {};
        event.waitUntil = (promise) => {
            pending.push(promise);
        };
        (handlers[type] || []).forEach((callback) => callback(event));
        return Promise.all(pending);
    }
    return { self: self, handlers: handlers, dispatch: dispatch };
}

function pushEvent(payload) {
    return { data: { json: () => payload, text: () => JSON.stringify(payload) } };
}

// a fetch() handed to the worker through `self`: records every call and answers as told
function fakeFetch(answer) {
    var calls = [];
    var fn = function (url, init) {
        calls.push({ url: url, init: init || {} });
        return typeof answer === "function" ? answer() : Promise.resolve(answer || { ok: true });
    };
    fn.calls = calls;
    return fn;
}

// the fields of a form-encoded request body, each value as the text that was sent
function formBody(call) {
    return Object.fromEntries(new URLSearchParams(call.init.body));
}

module.exports = {
    fakeClient,
    manualTimers,
    loadWorker,
    pushEvent,
    fakeFetch,
    formBody
};
