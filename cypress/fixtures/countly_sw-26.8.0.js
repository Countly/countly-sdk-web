/* eslint-disable no-restricted-globals */
/**
 * Countly reference service worker for web push notifications.
 *
 * Handles the W3C Push API `push` event by displaying a notification, `notificationclick` by
 * opening the target URL and recording the [CLY]_push_action event, `notificationclose` so the
 * page's push listener hears about dismissals, and `pushsubscriptionchange` so a browser-initiated
 * subscription rotation gets re-registered with the server.
 *
 * Payload shape (mirrors iOS/Android — see CountlyNotificationService.m and ModulePush.java):
 *   {
 *     "title":   "...",
 *     "message": "...",
 *     "sound":   "...",
 *     "badge":   <int>,
 *     "c": {
 *       "i": "<messageId>",        // 24-char hex ObjectId
 *       "l": "<defaultUrl>",
 *       "m": "<mediaUrl>",         // optional image
 *       "b": [{ "t": "title", "l": "url" }, ...]  // action buttons
 *     },
 *     ...any custom key/values added to the message
 *   }
 *
 * Import it into a host worker at a pinned version (`countly-sdk-web@<version>/lib/countly_sw.js`)
 * and pass that worker's registration to the SDK as `push_service_worker_registration`.
 *
 * Globals a host worker can set before its importScripts() call:
 *   self.COUNTLY_PUSH_DEBUG = true;             // log every step and forward the lines to the pages
 *   self.COUNTLY_PUSH_LIFECYCLE = false;        // keep the host's own install/activate behaviour
 *   self.COUNTLY_PUSH_PERSIST = false;          // the site runs the SDK with storage "none"
 */

// Most of these mirror modules/Constants.js by hand; never rename a message type, other SDK versions use it.
var CLY_SW_VERSION = "26.8.0";

var CLY_ACTION = "countly_push_action";
var CLY_SUBSCRIPTION_CHANGE = "countly_push_subscription_change";
var CLY_READY = "countly_push_ready";
var CLY_ACK = "countly_push_ack";
var CLY_RECEIVED = "countly_push_received";
var CLY_CLOSED = "countly_push_closed";
var CLY_LOG = "countly_push_log";
var CLY_CONFIG = "countly_push_config";
var CLY_WORKER_VERSION = "countly_push_worker_version";
var CLY_PARAM_DEBUG = "cly_debug";
var CLY_PARAM_PERSIST = "cly_persist";
var CLY_MAX_ACTIONS = 2; // Countly messages carry at most two buttons
var CLY_MAX_PENDING = 20;
var CLY_OFFER_WINDOW_MS = 10000;
var CLY_REPORT_TIMEOUT_MS = 10000;
var CLY_PUSH_ACTION_EVENT = "[CLY]_push_action";
var CLY_TOKEN_PROVIDER = "WEB";
var CLY_DB_NAME = "countly_push";
var CLY_DB_VERSION = 1;
var CLY_STORE_ACTIONS = "actions";
var CLY_STORE_CONFIG = "config";
var CLY_CONFIG_KEY = "reporting";
var CLY_OWNER_KEY = "owner";

/**
 * In-memory copy of the pending clicks, the page's server details and the owner of new clicks.
 */
var clyMemory = { actions: [], config: null, owner: null };
var clyDbBroken = false;
// set once IndexedDB refused to save the server details: from then on the copy in memory is the newest
var clyConfigUnsaved = false;

/**
 * The connection the worker's operations share, as a promise, from the first operation that needs
 * it until another context deletes or upgrades the database.
 */
var clyDbShared = null;

/**
 * Kept clicks handed to a page in the last CLY_OFFER_WINDOW_MS: that page's id by action id.
 */
var clyOffers = {};

/**
 * Clicks this worker is still sending to the server itself: the pending attempt by action id.
 */
var clyReporting = {};

/**
 * Action ids of the clicks forgotten during this worker's life, even where IndexedDB kept a copy.
 */
var clyForgotten = {};

/**
 * Describe a failure with its type, the way the browser names it ("NotAllowedError: ...").
 * @param {*} err - the thrown or rejected value
 * @returns {string} "name: message", or the message or value alone
 */
function clyErrorText(err) {
    if (err && err.message) {
        return err.name ? err.name + ": " + err.message : String(err.message);
    }
    return String(err);
}

/**
 * Open the worker's database, creating its two stores on first use.
 * @param {boolean} [existingOnly] - open only an existing database, also while persisting is off
 * @returns {Promise<?IDBDatabase>} an open connection, or null
 */
function clyOpenDb(existingOnly) {
    if (clyDbBroken || !self.indexedDB || (!clyPersist && !existingOnly)) {
        return Promise.resolve(null);
    }
    return new Promise(function (resolve) {
        var settled = false;
        var notCreated = false;
        var request;
        try {
            request = self.indexedDB.open(CLY_DB_NAME, CLY_DB_VERSION);
        }
        catch (e) {
            clyDbBroken = true;
            clyLog("warn", "IndexedDB is unavailable, pending clicks live in memory only: " + clyErrorText(e));
            resolve(null);
            return;
        }
        request.onupgradeneeded = function (event) {
            if (existingOnly && event.oldVersion === 0) {
                // aborting the upgrade of a database that did not exist leaves no database behind
                notCreated = true;
                request.transaction.abort();
                return;
            }
            var db = request.result;
            if (!db.objectStoreNames.contains(CLY_STORE_ACTIONS)) {
                db.createObjectStore(CLY_STORE_ACTIONS, { keyPath: "aid" });
            }
            if (!db.objectStoreNames.contains(CLY_STORE_CONFIG)) {
                db.createObjectStore(CLY_STORE_CONFIG);
            }
        };
        request.onsuccess = function () {
            if (settled) {
                request.result.close();
                return;
            }
            settled = true;
            resolve(request.result);
        };
        request.onerror = function () {
            if (notCreated) {
                settled = true;
                resolve(null);
                return;
            }
            clyDbBroken = true;
            clyLog("warn", "IndexedDB could not be opened, pending clicks live in memory only: " + clyErrorText(request.error || "unknown error"));
            settled = true;
            resolve(null);
        };
        request.onblocked = function () {
            settled = true;
            resolve(null);
        };
    });
}

/**
 * The connection an operation runs on: the shared one, or for existingOnly one of its own.
 * @param {boolean} [existingOnly] - use only an existing database, also while persisting is off
 * @returns {Promise<?IDBDatabase>} an open connection, or null
 */
function clyConnection(existingOnly) {
    if (existingOnly) {
        return clyOpenDb(true);
    }
    if (clyDbBroken || !clyPersist) {
        return Promise.resolve(null);
    }
    if (!clyDbShared) {
        var opening = clyOpenDb();
        clyDbShared = opening;
        opening.then(function (db) {
            if (!db) {
                clyForgetConnection(opening);
                return;
            }
            // a deletion or upgrade elsewhere waits until every connection is closed
            db.onversionchange = function () {
                db.close();
                clyForgetConnection(opening);
            };
        });
    }
    return clyDbShared;
}

/**
 * Stop sharing a connection, so that the next operation opens a new one.
 * @param {Promise<?IDBDatabase>} connection - the shared connection, as clyConnection returned it
 */
function clyForgetConnection(connection) {
    if (clyDbShared === connection) {
        clyDbShared = null;
    }
}

/**
 * Run an operation against a store in one transaction, rejecting when it fails.
 * @param {string} storeName - object store to use
 * @param {string} mode - "readonly" | "readwrite"
 * @param {Function} operation - gets the store, returns the IDBRequest to wait for (or nothing)
 * @param {boolean} [existingOnly] - use only an existing database, also while persisting is off
 * @param {boolean} [retried] - true on the second attempt, after the shared connection was found closed
 * @returns {Promise<*>} the request's result, or undefined without a database
 */
function clyDbRun(storeName, mode, operation, existingOnly, retried) {
    var connection = clyConnection(existingOnly);
    return connection.then(function (db) {
        if (!db) {
            return undefined;
        }
        // a connection of its own is closed once its transaction is done, the shared one stays open
        var release = function () {
            if (existingOnly) {
                db.close();
            }
        };
        var transaction;
        try {
            transaction = db.transaction(storeName, mode);
        }
        catch (err) {
            release();
            if (!existingOnly && !retried && err && err.name === "InvalidStateError") {
                // the browser closed the shared connection, as it does while the site's data is cleared
                clyForgetConnection(connection);
                return clyDbRun(storeName, mode, operation, existingOnly, true);
            }
            throw err;
        }
        return new Promise(function (resolve, reject) {
            var request;
            var result;
            transaction.oncomplete = function () {
                release();
                resolve(result);
            };
            transaction.onerror = transaction.onabort = function () {
                release();
                reject(transaction.error || new Error("IndexedDB transaction failed"));
            };
            try {
                request = operation(transaction.objectStore(storeName));
            }
            catch (err) {
                release();
                reject(err);
                return;
            }
            if (request) {
                request.onsuccess = function () {
                    result = request.result;
                };
            }
        });
    });
}

/**
 * Run an operation like clyDbRun, but log a failure and settle undefined instead of rejecting.
 * @param {string} storeName - object store to use
 * @param {string} mode - "readonly" | "readwrite"
 * @param {Function} operation - gets the store, returns the IDBRequest to wait for (or nothing)
 * @returns {Promise<*>} the request's result, or undefined
 */
function clyDb(storeName, mode, operation) {
    return clyDbRun(storeName, mode, operation).catch(function (err) {
        clyLog("warn", "IndexedDB operation failed, continuing with memory: " + clyErrorText(err));
        return undefined;
    });
}

/**
 * The scope of the registration this worker runs under.
 * @returns {string} the scope URL, or "" when unknown
 */
function clyScope() {
    return (self.registration && self.registration.scope) || "";
}

/**
 * Every pending click of this worker's scope, oldest first; a copy in memory wins over IndexedDB's.
 * @returns {Promise<Object[]>} pending actions
 */
function clyAllActions() {
    var scope = clyScope();
    return clyDb(CLY_STORE_ACTIONS, "readonly", function (store) {
        return store.getAll();
    }).then(function (stored) {
        var seen = {};
        var all = [];
        clyMemory.actions.concat(stored || []).forEach(function (action) {
            if (!seen[action.aid] && !clyForgotten[action.aid] && (!action.scope || action.scope === scope)) {
                seen[action.aid] = true;
                all.push(action);
            }
        });
        all.sort(function (a, b) {
            return (a.ts || 0) - (b.ts || 0);
        });
        return all;
    });
}

/**
 * Forget a click, because a page recorded it or it fell off the end of the queue.
 * @param {string} aid - the action id
 * @returns {Promise} settles once removed
 */
function clyForget(aid) {
    clyForgotten[aid] = true;
    clyMemory.actions = clyMemory.actions.filter(function (pending) {
        return pending.aid !== aid;
    });
    return clyDb(CLY_STORE_ACTIONS, "readwrite", function (store) {
        return store.delete(aid);
    });
}

/**
 * Read one parameter from this worker's own URL (the page SDK puts its settings there).
 * @param {string} name - query parameter name
 * @returns {?string} the decoded value, or null when absent or unreadable
 */
function clyUrlParam(name) {
    try {
        return new URL(self.location.href).searchParams.get(name);
    } catch (e) {
        return null;
    }
}

var clyDebug = self.COUNTLY_PUSH_DEBUG === true || clyUrlParam(CLY_PARAM_DEBUG) === "1";

/**
 * Whether server details and kept clicks go to IndexedDB; false for a site with storage "none".
 */
var clyPersist = self.COUNTLY_PUSH_PERSIST !== false && clyUrlParam(CLY_PARAM_PERSIST) !== "0";

/**
 * Delete what IndexedDB holds for this worker's scope, moving its kept clicks to memory first.
 * @returns {Promise} settles once done; never rejects
 */
function clyDropStored() {
    var scope = clyScope();
    return Promise.all([
        clyDbRun(CLY_STORE_CONFIG, "readwrite", function (store) {
            store.delete(clyOwnerKey());
            return store.delete(clyConfigKey());
        }, true),
        clyDbRun(CLY_STORE_ACTIONS, "readwrite", function (store) {
            store.getAll().onsuccess = function (event) {
                (event.target.result || []).forEach(function (action) {
                    if (action.scope && action.scope !== scope) {
                        return;
                    }
                    store.delete(action.aid);
                    var inMemory = clyMemory.actions.some(function (kept) {
                        return kept.aid === action.aid;
                    });
                    if (!inMemory && !clyForgotten[action.aid]) {
                        clyMemory.actions.push(action);
                    }
                });
                clyMemory.actions.sort(function (a, b) {
                    return (a.ts || 0) - (b.ts || 0);
                });
                clyMemory.actions = clyMemory.actions.slice(-CLY_MAX_PENDING);
            };
        }, true)
    ]).then(function () {
        clyLog("debug", "IndexedDB holds nothing of this scope any more, everything stays in memory");
    }, function (err) {
        clyLog("warn", "could not delete what IndexedDB holds for this scope: " + clyErrorText(err));
    });
}

/**
 * Turn storing in IndexedDB off when a page says persist: false, and back on otherwise.
 * @param {*} persist - the persist field of the page's message
 * @returns {Promise} settles once done; never rejects
 */
function clyFollowPersist(persist) {
    if (persist === false) {
        if (clyPersist) {
            clyPersist = false;
            clyLog("debug", "a page asked to keep the server details and clicks in memory only");
        }
        return clyDropStored();
    }
    if (!clyPersist) {
        clyPersist = true;
        clyLog("debug", "a page let the server details and clicks be stored in IndexedDB again");
    }
    return Promise.resolve();
}

/**
 * Collect the window clients this worker could deliver a push action to.
 * @returns {Promise<WindowClient[]>} open window clients
 */
function clyWindowClients() {
    return self.clients.matchAll({ type: "window", includeUncontrolled: true });
}

/**
 * Post the same message to every open page.
 * @param {Object} message - message to post
 * @returns {Promise} settles once posted
 */
function clyBroadcast(message) {
    return clyWindowClients().then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
            clientList[i].postMessage(message);
        }
    });
}

/**
 * Log one line. Errors and warnings always reach the worker console (DevTools → Application →
 * Service Workers → inspect); everything else only with debug on, in which case each line is also
 * forwarded to the open pages so the SDK there prints it next to its own logs. Forwarding is best
 * effort: the browser may stop the worker before the clients are listed.
 * @param {string} level - "debug" | "info" | "warn" | "error"
 * @param {string} message - what happened
 * @returns {undefined}
 */
function clyLog(level, message) {
    var always = level === "error" || level === "warn";
    if (!clyDebug && !always) {
        return;
    }
    if (typeof console !== "undefined" && typeof console[level] === "function") {
        console[level]("[Countly] " + message);
    }
    if (clyDebug) {
        clyBroadcast({ type: CLY_LOG, level: level, message: message }).catch(function () { });
    }
}

/**
 * Decide whether a notification URL may be opened: http(s) only. A `javascript:` or `data:` URL
 * in a message would be an injection vector once handed to clients.openWindow, and the browser is
 * the last place that can refuse it.
 * @param {string} url - URL from the message
 * @returns {boolean} true when it may be opened
 */
function clyMayOpen(url) {
    var parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        clyLog("warn", "not opening malformed url [" + url + "]");
        return false;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        clyLog("warn", "not opening non-http(s) url [" + url + "]");
        return false;
    }
    return true;
}

/**
 * Tell whether two URLs are the same once both are normalised the way the browser reports them.
 * @param {string} a - one URL
 * @param {string} b - the other URL
 * @returns {boolean} true when they name the same page
 */
function clySameUrl(a, b) {
    try {
        return new URL(a).href === new URL(b).href;
    } catch (e) {
        return a === b;
    }
}

/**
 * Choose the single client that should record a push action: the one already on the target URL
 * (it is the one about to be focused), else a focused one, else the first available.
 * @param {WindowClient[]} clientList - open window clients
 * @param {string} url - the URL this click is heading to
 * @returns {?WindowClient} the client to hand the action to
 */
function clyPickActionTarget(clientList, url) {
    var i;
    if (url) {
        for (i = 0; i < clientList.length; i++) {
            if (clySameUrl(clientList[i].url, url)) {
                return clientList[i];
            }
        }
    }
    for (i = 0; i < clientList.length; i++) {
        if (clientList[i].focused) {
            return clientList[i];
        }
    }
    return clientList[0] || null;
}

/**
 * Hold on to a click until a page acknowledges it, dropping the oldest beyond CLY_MAX_PENDING.
 * @param {Object} actionMessage - the action to remember
 * @returns {Promise} settles once stored
 */
function clyRemember(actionMessage) {
    actionMessage.ts = actionMessage.ts || Date.now();
    clyMemory.actions.push(actionMessage);
    if (clyMemory.actions.length > CLY_MAX_PENDING) {
        clyMemory.actions.shift();
    }
    return clyDb(CLY_STORE_ACTIONS, "readwrite", function (store) {
        return store.put(actionMessage);
    }).then(clyAllActions).then(function (all) {
        var excess = all.length - CLY_MAX_PENDING;
        if (excess <= 0) {
            return undefined;
        }
        return Promise.all(all.slice(0, excess).map(function (old) {
            return clyForget(old.aid);
        }));
    });
}

/**
 * Mark a kept click as recorded here, or drop its saved copy where IndexedDB refuses the mark.
 * @param {Object} action - the kept click, as given to clyRemember
 * @returns {Promise} settles once done; never rejects
 */
function clyMarkRecorded(action) {
    action.recorded = true;
    return clyDbRun(CLY_STORE_ACTIONS, "readwrite", function (store) {
        return store.put(action);
    }).catch(function (err) {
        clyLog("warn", "could not save that a click was recorded, dropping its saved copy: " + clyErrorText(err));
        return clyDb(CLY_STORE_ACTIONS, "readwrite", function (store) {
            return store.delete(action.aid);
        });
    });
}

/**
 * Hand a kept click to a page, unless another page got it less than CLY_OFFER_WINDOW_MS ago.
 * @param {Object} action - the kept click
 * @param {Client} client - the page that announced itself
 * @returns {boolean} true when the click was handed over
 */
function clyOffer(action, client) {
    var offer = clyOffers[action.aid];
    if (offer && offer.client !== client.id) {
        return false;
    }
    var current = { client: client.id };
    clyOffers[action.aid] = current;
    self.setTimeout(function () {
        if (clyOffers[action.aid] === current) {
            delete clyOffers[action.aid];
        }
    }, CLY_OFFER_WINDOW_MS);
    client.postMessage(action);
    return true;
}

/**
 * The key this worker's server details are kept under in the config store.
 * @returns {string} CLY_CONFIG_KEY, followed by the scope where there is one
 */
function clyConfigKey() {
    var scope = clyScope();
    return scope ? CLY_CONFIG_KEY + " " + scope : CLY_CONFIG_KEY;
}

/**
 * The server details the last page of this worker's scope handed over, if any.
 * @returns {Promise<?Object>} url, app_key, device_id, t, sdk_name, sdk_version, av, salt, vapid_key
 */
function clyConfig() {
    if (clyConfigUnsaved) {
        return Promise.resolve(clyMemory.config);
    }
    return clyDb(CLY_STORE_CONFIG, "readonly", function (store) {
        return store.get(clyConfigKey());
    }).then(function (stored) {
        return stored || clyMemory.config;
    });
}

/**
 * The key the owner of new clicks is kept under in the config store.
 * @returns {string} CLY_OWNER_KEY, followed by the scope where there is one
 */
function clyOwnerKey() {
    var scope = clyScope();
    return scope ? CLY_OWNER_KEY + " " + scope : CLY_OWNER_KEY;
}

/**
 * The owner of new clicks as the last page of this worker's scope named it, if any.
 * @returns {Promise<?Object>} { owner }, owner being { device_id, t } or null; null when no page said
 */
function clyOwnerRecord() {
    if (clyConfigUnsaved) {
        return Promise.resolve(clyMemory.owner);
    }
    return clyDb(CLY_STORE_CONFIG, "readonly", function (store) {
        return store.get(clyOwnerKey());
    }).then(function (stored) {
        return stored || clyMemory.owner;
    });
}

/**
 * Take the server details and the user a page's ready or config message carries. Whether to store
 * anything is followed first: turning storing off is synchronous, so the details of a page that
 * stores nothing never open the database.
 * @param {Object} data - the countly_push_ready or countly_push_config message
 * @returns {Promise} settles once both are done
 */
function clyTakeDetails(data) {
    var persisting = clyFollowPersist(data.persist);
    return Promise.all([persisting, clyStoreConfig(data.config, data.owner)]);
}

/**
 * Keep (or, for null, drop) the server details a page handed over, with the owner of new clicks.
 * @param {?Object} config - the details, or null when the page must not have clicks recorded
 * @param {?Object} [owner] - { device_id, t } of the page's user, or null when no new click may be recorded
 * @returns {Promise} settles once stored
 */
function clyStoreConfig(config, owner) {
    clyMemory.config = config || null;
    clyMemory.owner = owner === undefined ? null : { owner: owner };
    clyLog("debug", config ? "server details updated by a page" : "server details withdrawn by a page");
    return clyDbRun(CLY_STORE_CONFIG, "readwrite", function (store) {
        if (owner === undefined) {
            store.delete(clyOwnerKey());
        }
        else {
            store.put({ owner: owner }, clyOwnerKey());
        }
        return config ? store.put(config, clyConfigKey()) : store.delete(clyConfigKey());
    }).catch(function (err) {
        clyConfigUnsaved = true;
        clyLog("warn", "could not save the server details, dropping the saved copy: " + clyErrorText(err));
        return clyDb(CLY_STORE_CONFIG, "readwrite", function (store) {
            store.delete(clyOwnerKey());
            return store.delete(clyConfigKey());
        });
    });
}

/**
 * The owner to keep with a new click, from the server details held or else the owner record.
 * @param {?Object} config - the server details held when the click is made
 * @param {?Object} ownerRecord - what clyOwnerRecord held when the click is made
 * @returns {(?Object|undefined)} { device_id, t, recordable } or { device_id, t }, null, or undefined
 */
function clyClickOwner(config, ownerRecord) {
    if (config) {
        return { device_id: config.device_id, t: config.t, recordable: true };
    }
    if (ownerRecord) {
        return ownerRecord.owner ? { device_id: ownerRecord.owner.device_id, t: ownerRecord.owner.t } : null;
    }
    return undefined;
}

/**
 * The sorted, url-encoded parameter list of a request, with the checksum the server expects when
 * a salt is set: byte for byte what prepareParams in the page SDK produces.
 * @param {Object} params - request parameters; undefined and null values are left out
 * @param {?string} salt - the checksum salt, if the site uses one
 * @returns {Promise<string>} the request body
 */
function clyRequestBody(params, salt) {
    var pairs = [];
    Object.keys(params).sort().forEach(function (key) {
        if (params[key] !== undefined && params[key] !== null) {
            pairs.push(key + "=" + encodeURIComponent(params[key]));
        }
    });
    var data = pairs.join("&");
    if (!salt) {
        return Promise.resolve(data);
    }
    if (!self.crypto || !self.crypto.subtle) {
        return Promise.reject(new Error("no SubtleCrypto to sign the request with"));
    }
    return self.crypto.subtle.digest("SHA-256", new TextEncoder().encode(data + salt)).then(function (digest) {
        var hex = Array.prototype.map.call(new Uint8Array(digest), function (byte) {
            return ("0" + byte.toString(16)).slice(-2);
        }).join("");
        return data + "&checksum256=" + hex.toUpperCase();
    });
}

/**
 * fetch() with a deadline, cancelling the request where AbortController exists.
 * @param {string} url - where to send the request
 * @param {Object} init - fetch options
 * @returns {Promise<Response>} the response; rejects on a network error or after CLY_REPORT_TIMEOUT_MS
 */
function clyFetch(url, init) {
    var controller = typeof self.AbortController === "function" ? new self.AbortController() : null;
    if (controller) {
        init.signal = controller.signal;
    }
    return new Promise(function (resolve, reject) {
        var timer = self.setTimeout(function () {
            if (controller) {
                controller.abort();
            }
            reject(new Error("no answer within " + CLY_REPORT_TIMEOUT_MS + " ms"));
        }, CLY_REPORT_TIMEOUT_MS);
        self.fetch(url, init).then(function (response) {
            self.clearTimeout(timer);
            resolve(response);
        }, function (err) {
            self.clearTimeout(timer);
            reject(err);
        });
    });
}

/**
 * Send a request from here with the fields the page SDK adds to each of its own requests.
 * @param {Object} config - the server details a page handed over
 * @param {Object} fields - what the request is about: events, or a token_session
 * @returns {Promise} resolves once the server answered 2xx, rejects otherwise
 */
function clySend(config, fields) {
    if (typeof self.fetch !== "function") {
        return Promise.reject(new Error("no fetch in this worker"));
    }
    // building the request can throw, for a value encodeURIComponent refuses, and must reject like any other failure
    return Promise.resolve().then(function () {
        var now = new Date();
        var params = {
            app_key: config.app_key,
            device_id: config.device_id,
            t: config.t,
            sdk_name: config.sdk_name,
            sdk_version: config.sdk_version,
            av: config.av,
            timestamp: now.getTime(),
            hour: now.getHours(),
            dow: now.getDay(),
            tz: -now.getTimezoneOffset()
        };
        Object.keys(fields).forEach(function (key) {
            params[key] = fields[key];
        });
        if (self.navigator && self.navigator.userAgent) {
            params.metrics = JSON.stringify({ _ua: self.navigator.userAgent });
        }
        return clyRequestBody(params, config.salt);
    }).then(function (body) {
        return clyFetch(config.url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body });
    }).then(function (response) {
        if (!response || !response.ok) {
            throw new Error("server answered " + (response ? response.status : "nothing"));
        }
    });
}

/**
 * Record a click from here as the [CLY]_push_action event a page would have queued.
 * @param {Object} action - the click, as built by the notificationclick handler
 * @param {?Object} config - the server details held when the click was made
 * @returns {Promise<boolean>} true when the server accepted the event
 */
function clyReport(action, config) {
    if (!config) {
        return Promise.resolve(false);
    }
    var now = new Date();
    var event = {
        key: CLY_PUSH_ACTION_EVENT,
        count: 1,
        segmentation: { i: action.messageId, b: action.buttonIndex, p: "w" },
        timestamp: now.getTime(),
        hour: now.getHours(),
        dow: now.getDay()
    };
    return clySend(config, { events: JSON.stringify([event]) }).then(function () {
        clyLog("debug", "click on message [" + action.messageId + "] recorded from the worker");
        return true;
    }, function (err) {
        clyLog("debug", "could not record the click from the worker (" + clyErrorText(err) + ")");
        return false;
    });
}

/**
 * Send a token_session for a subscription the browser replaced, the way the page SDK registers one.
 * @param {Object} config - the server details a page handed over
 * @param {PushSubscription} subscription - the subscription that replaced the registered one
 * @returns {Promise<boolean>} true when the server accepted it
 */
function clyRegisterToken(config, subscription) {
    var fields = { token_session: 1, token_provider: CLY_TOKEN_PROVIDER };
    try {
        fields.web_token = JSON.stringify(subscription.toJSON());
    }
    catch (e) {
        clyLog("warn", "could not read the new subscription: " + clyErrorText(e));
        return Promise.resolve(false);
    }
    if (self.navigator && self.navigator.language) {
        fields.locale = self.navigator.language;
    }
    return clySend(config, fields).then(function () {
        clyLog("debug", "new subscription registered from the worker");
        return true;
    }, function (err) {
        clyLog("warn", "could not register the new subscription from the worker, leaving it to the pages (" + clyErrorText(err) + ")");
        return false;
    });
}

/**
 * Decode the base64url VAPID public key a page hands over into bytes, ignoring whitespace.
 * @param {string} key - base64url encoded key
 * @returns {?Uint8Array} the key's bytes, or null when it is not valid base64url
 */
function clyKeyBytes(key) {
    var base64 = String(key).replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
    var raw;
    try {
        raw = atob(base64 + "===".slice((base64.length + 3) % 4));
    } catch (e) {
        return null;
    }
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

/**
 * Tell whether two application server keys hold the same bytes.
 * @param {?(ArrayBuffer|Uint8Array)} a - one key
 * @param {?(ArrayBuffer|Uint8Array)} b - the other key
 * @returns {boolean} true when both are present and equal
 */
function clySameKey(a, b) {
    if (!a || !b) {
        return false;
    }
    var x = new Uint8Array(a);
    var y = new Uint8Array(b);
    if (x.length !== y.length) {
        return false;
    }
    for (var i = 0; i < x.length; i++) {
        if (x[i] !== y[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Keep a click no page is open for, record it from here and mark it recorded on success.
 * @param {Object} action - the click, as built by the notificationclick handler
 * @param {?Object} config - the server details held when the click was made
 * @returns {Promise<Object>} the click, once its outcome is known; never rejects
 */
function clyReportKept(action, config) {
    var attempt = clyRemember(action).then(function () {
        return clyReport(action, config);
    }).then(function (recorded) {
        if (recorded) {
            return clyMarkRecorded(action);
        }
        clyLog("debug", "no page open, keeping the action for the next page that announces itself");
        return undefined;
    }).catch(function (err) {
        clyLog("warn", "could not record the click from the worker, keeping it for the next page: " + clyErrorText(err));
        return undefined;
    }).then(function () {
        delete clyReporting[action.aid];
        return action;
    });
    clyReporting[action.aid] = attempt;
    return attempt;
}

/**
 * Bring the user to the click's URL: focus the page already showing it, else open a window.
 * A failure here is logged and must not cut short the recording that runs alongside.
 * @param {?WindowClient} target - the page picked for this click, if any
 * @param {string} openUrl - the URL to open, empty when there is none to open
 * @returns {Promise} settles once done
 */
function clyNavigate(target, openUrl) {
    var navigation;
    if (!openUrl) {
        return Promise.resolve();
    }
    if (target && clySameUrl(target.url, openUrl) && "focus" in target) {
        navigation = target.focus();
    }
    else if (self.clients.openWindow) {
        navigation = self.clients.openWindow(openUrl);
    }
    return Promise.resolve(navigation).catch(function (err) {
        clyLog("warn", "could not open [" + openUrl + "]: " + clyErrorText(err));
    });
}

/**
 * The fields the page's push listener gets for every event about a notification.
 * @param {Notification|Object} notification - the notification, or an object with its title/body/data
 * @returns {Object} messageId, title, message, url, buttons, payload
 */
function clyDescribe(notification) {
    var data = notification.data || {};
    var buttons = Array.isArray(data.b) ? data.b : [];
    return {
        messageId: data.i || "",
        title: notification.title || "",
        message: notification.body || "",
        url: data.l || "",
        buttons: buttons.map(function (btn) {
            return { title: btn.t || "", url: btn.l || "" };
        }),
        payload: data.p || null
    };
}

if (self.COUNTLY_PUSH_LIFECYCLE !== false) {
    self.addEventListener("install", function (event) {
        event.waitUntil(self.skipWaiting());
    });

    self.addEventListener("activate", function (event) {
        event.waitUntil(self.clients.claim());
    });
}

/**
 * One line per activation, so a support case can tell which worker a site actually runs.
 */
self.addEventListener("activate", function () {
    console.info("[Countly] push service worker " + CLY_SW_VERSION + " active");
    clyLog("debug", "debug logging on");
});

/**
 * Show the notification for a Countly push and tell the open pages it arrived. A push without
 * Countly's message id is the host application's own and is left to its handlers. A rejected
 * showNotification() is logged rather than failing the event.
 */
self.addEventListener("push", function (event) {
    var payload = {};
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            try {
                payload = { message: event.data.text() };
            } catch (e2) {
                payload = {};
            }
        }
    }

    var countly = payload.c;
    if (!countly || !countly.i) {
        clyLog("debug", "push without a Countly message id, leaving it to the host worker");
        return;
    }
    clyLog("debug", "push received for message [" + countly.i + "]");
    var buttons = Array.isArray(countly.b) ? countly.b : [];
    var options = {
        body: payload.message || "",
        data: {
            i: countly.i,
            l: countly.l || "",
            b: buttons,
            p: payload
        }
    };
    // Notification.badge expects an icon URL, so payload.badge (an integer app badge
    // count for the mobile SDKs) deliberately has no equivalent here.
    if (payload.icon) {
        options.icon = payload.icon;
    }
    // An operator collapse key: a newer notification with the same tag replaces the one on
    // screen. renotify alerts the user again, which is why the message was sent in the first
    // place; the browser refuses renotify without a tag, so the two travel together.
    if (typeof payload.tag === "string" && payload.tag) {
        options.tag = payload.tag;
        options.renotify = true;
    }
    if (payload.requireInteraction) {
        options.requireInteraction = true;
    }
    if (countly.m) {
        options.image = countly.m;
    }
    if (buttons.length > 0) {
        options.actions = buttons.slice(0, CLY_MAX_ACTIONS).map(function (btn, i) {
            return { action: "btn_" + (i + 1), title: btn.t || "" };
        });
    }

    var title = payload.title || "";
    var received = clyDescribe({ title: title, body: options.body, data: options.data });
    received.type = CLY_RECEIVED;

    event.waitUntil(Promise.all([
        self.registration.showNotification(title, options).then(function () {
            clyLog("debug", "notification shown for message [" + countly.i + "]");
        }, function (err) {
            clyLog("error", "showNotification failed for message [" + countly.i + "]: " + clyErrorText(err));
        }),
        clyBroadcast(received)
    ]));
});

/**
 * Hand the click to one page for recording, or record it here when no page is open, then focus or
 * open the target URL.
 */
self.addEventListener("notificationclick", function (event) {
    var data = event.notification.data;
    if (!data || !data.i) {
        return;
    }
    event.notification.close();

    var buttons = Array.isArray(data.b) ? data.b : [];
    var buttonIndex = 0;
    var buttonTitle = "";
    var url = data.l || "";

    if (event.action && event.action.indexOf("btn_") === 0) {
        // "btn_1" is the first button, so index 0 of the payload's button list
        var idx = parseInt(event.action.slice(4), 10);
        var button = buttons[idx - 1];
        if (button) {
            buttonIndex = idx;
            buttonTitle = button.t || "";
            url = button.l || url;
        }
    }
    clyLog("debug", "notification clicked for message [" + data.i + "], button " + buttonIndex + (url ? ", url [" + url + "]" : ""));

    var clickedAt = Date.now();
    var actionMessage = clyDescribe(event.notification);
    actionMessage.type = CLY_ACTION;
    actionMessage.buttonIndex = buttonIndex;
    actionMessage.buttonTitle = buttonTitle;
    actionMessage.url = url;
    // lets a page drop the message if it also received it through the pending queue
    actionMessage.aid = data.i + "_" + buttonIndex + "_" + clickedAt;
    actionMessage.scope = clyScope();
    // a page that records the click later, possibly days later, records it at this time
    actionMessage.ts = clickedAt;

    var openUrl = url && clyMayOpen(url) ? url : "";

    event.waitUntil(
        clyWindowClients().then(function (clientList) {
            // Exactly one page may record the action. Broadcasting it would make every open tab
            // report the same click and inflate the campaign's actioned count.
            var target = clyPickActionTarget(clientList, openUrl);
            var navigation = clyNavigate(target, openUrl);
            var recording = Promise.all([clyConfig(), clyOwnerRecord()]).then(function (held) {
                var owner = clyClickOwner(held[0], held[1]);
                if (owner !== undefined) {
                    actionMessage.owner = owner;
                }
                if (target) {
                    return clyRemember(actionMessage).then(function () {
                        target.postMessage(actionMessage);
                        clyLog("debug", "action handed to page [" + target.url + "], waiting for its acknowledgement");
                    });
                }
                return clyReportKept(actionMessage, held[0]);
            });
            return Promise.all([recording, navigation]);
        })
    );
});

self.addEventListener("notificationclose", function (event) {
    var data = event.notification && event.notification.data;
    if (!data || !data.i) {
        return;
    }
    clyLog("debug", "notification closed for message [" + data.i + "]");
    var closed = clyDescribe(event.notification);
    closed.type = CLY_CLOSED;
    event.waitUntil(clyBroadcast(closed));
});

/**
 * Page-to-worker messages: acknowledgements, server details and ready handshakes, which the worker
 * answers with its version and the clicks it kept. A handshake without a `config` field comes from
 * an older page SDK and leaves the stored details alone.
 */
self.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || (data.scope && data.scope !== clyScope())) {
        return;
    }
    var work = null;
    if (data.type === CLY_ACK) {
        // a page recorded it, so it no longer needs redelivering
        work = clyForget(data.aid).then(function () {
            clyLog("debug", "action [" + data.aid + "] acknowledged");
        });
    }
    else if (data.type === CLY_CONFIG) {
        work = clyTakeDetails(data);
    }
    else if (data.type === CLY_READY && event.source) {
        if (data.debug === true && !clyDebug) {
            clyDebug = true;
            clyLog("debug", "debug logging turned on by a page");
        }
        var source = event.source;
        // sites serve their own copy of this file, so the page can tell one left behind on an SDK upgrade
        source.postMessage({ type: CLY_WORKER_VERSION, version: CLY_SW_VERSION, scope: clyScope() });
        work = (data.config === undefined ? Promise.resolve() : clyTakeDetails(data)).then(clyAllActions).then(function (pending) {
            return Promise.all(pending.map(function (action) {
                return clyReporting[action.aid] || action;
            }));
        }).then(function (pending) {
            var handed = 0;
            // Left in place until acknowledged: only the pages that run the SDK reply, so a window
            // that cannot record the action does not consume it. The page drops duplicates by `aid`.
            for (var i = 0; i < pending.length; i++) {
                if (clyOffer(pending[i], source)) {
                    handed++;
                }
            }
            clyLog("debug", "page announced itself, " + pending.length + " pending action(s), " + handed + " handed over");
        });
    }
    if (work && typeof event.waitUntil === "function") {
        event.waitUntil(work);
    }
});

/**
 * Get a working subscription back, register it if it has Countly's key, and tell the open pages.
 */
self.addEventListener("pushsubscriptionchange", function (event) {
    var oldSubscription = event.oldSubscription || {};
    var oldKey = (oldSubscription.options && oldSubscription.options.applicationServerKey) || null;
    event.waitUntil(clyConfig().then(function (config) {
        var countlyKey = config && config.vapid_key ? clyKeyBytes(config.vapid_key) : null;
        var subscribeKey = null;
        var resubscribed;
        if (event.newSubscription) {
            clyLog("debug", "subscription rotated by the browser, new subscription attached");
            resubscribed = Promise.resolve(event.newSubscription);
        }
        else if (oldKey || countlyKey) {
            subscribeKey = oldKey || countlyKey;
            clyLog("debug", "subscription dropped by the browser, re-subscribing with " + (oldKey ? "the previous key" : "the key the page registered"));
            resubscribed = self.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: subscribeKey
            });
        }
        else {
            clyLog("debug", "subscription dropped by the browser without a key, leaving the re-subscribe to the pages");
            resubscribed = Promise.resolve(null);
        }
        return resubscribed.catch(function (err) {
            clyLog("error", "re-subscribe failed: " + clyErrorText(err));
            return null;
        }).then(function (subscription) {
            var key = subscription && ((subscription.options && subscription.options.applicationServerKey) || subscribeKey);
            if (!subscription || !clySameKey(key, countlyKey)) {
                return false;
            }
            return clyRegisterToken(config, subscription);
        });
    }).then(function () {
        return clyBroadcast({ type: CLY_SUBSCRIPTION_CHANGE });
    }));
});
