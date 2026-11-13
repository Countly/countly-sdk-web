// The request scenarios of the SDK: each makes the calls the other Countly SDKs make in their own request tests and
// collects the requests the SDK sends, with the values that change from run to run masked. api/requests/ keeps the
// result of each scenario, and the request tests fail when the SDK no longer sends those requests.
// countly-sdk-web gets a copy of this file from npm run sync:web, as test/consumers/helpers/request-scenarios.mjs.

const MASK = "<masked>";
const MASKED_PARAMS = ["timestamp", "hour", "dow", "tz", "sdk_version", "av", "rr", "checksum", "checksum256", "session_duration"];
const JSON_PARAMS = ["events", "metrics", "user_details", "crash", "consent", "hc"];
const MASKED_EVENT_FIELDS = ["timestamp", "hour", "dow", "id", "pvid", "cvid", "peid"];
const MASKED_CRASH_FIELDS = ["_error", "_run", "_os", "_os_version", "_browser", "_browser_version", "_resolution", "_density", "_locale", "_ua", "_device", "_device_type", "_online", "_background", "_orientation"];
const MAX_INT = 2147483647;

/**
 * The scenarios by name: the init config each adds to the common one, and the calls it makes. A scenario that awaits
 * settle lets the SDK send everything the calls before it queued, so that what they sent stays apart from what follows.
 */
export const SCENARIOS = {
    parity: {
        config: {},
        run: (Countly) => {
            Countly.begin_session();
            Countly.add_event({
                key: "purchase",
                count: 2,
                sum: 9.99,
                dur: 5,
                segmentation: {
                    nar: "uto",
                    sasuke: MAX_INT,
                    sakura: false,
                    itachi: Number.MAX_VALUE,
                    kakaski: Number.MIN_VALUE,
                    hashirama: -MAX_INT,
                    tobi: { obito: "uchiha", zetsu: "white" },
                    stringList: ["value1", "value2", "value3"],
                    intList: [1, 2, 3],
                    doubleList: [1.1, 2.2, 3.3],
                    boolList: [true, false, true],
                    mixedList: ["value1", 2, 3.3, true],
                    mapList: [{ key1: "value1", key2: 2 }, { key1: "value2", key2: 3 }, { key1: "value3", key2: 4 }]
                }
            });
            Countly.user_details({
                name: "John Doe",
                username: "john_d",
                email: "john@example.com",
                organization: "Countly",
                phone: "1234567890",
                picture: "https://example.com/picture.jpg",
                gender: "M",
                byear: 1980,
                custom: { tier: "gold", age: 30 }
            });
            Countly.session_duration(60);
            Countly.end_session(undefined, true);
        }
    },
    views: {
        config: {},
        run: (Countly) => {
            Countly.begin_session();
            Countly.track_view("Home", null, { source: "scenario" });
            Countly.track_view("Settings");
            Countly.end_session(undefined, true);
        }
    },
    crash: {
        config: {},
        run: (Countly) => {
            Countly.add_log("breadcrumb one");
            Countly.log_error(new Error("parity crash"), { tier: "gold" });
        }
    },
    consent: {
        config: { require_consent: true },
        run: async(Countly, settle) => {
            Countly.add_consent(["sessions", "events"]);
            Countly.begin_session();
            Countly.add_event({ key: "consented" });
            await settle();
            Countly.remove_consent("events");
            Countly.add_event({ key: "not_consented" });
            Countly.end_session(undefined, true);
        }
    },
    "device-id": {
        config: {},
        run: async(Countly, settle) => {
            Countly.begin_session();
            Countly.change_id("parity-device-002", true);
            Countly.add_event({ key: "after_merge" });
            await settle();
            Countly.change_id("parity-device-003", false);
            Countly.add_event({ key: "after_new_id" });
            Countly.end_session(undefined, true);
        }
    }
};

/**
 * A copy of a JSON value with the keys of every object sorted, so that the order the SDK writes them in does not count.
 * @param {*} value - parsed JSON
 * @returns {*} the sorted copy
 */
function sorted(value) {
    if (Array.isArray(value)) {
        return value.map(sorted);
    }
    if (value && typeof value === "object") {
        return Object.keys(value).sort().reduce((copy, key) => {
            copy[key] = sorted(value[key]);
            return copy;
        }, {});
    }
    return value;
}

/**
 * A copy of an object with the values of the given keys masked.
 * @param {Object} value - object
 * @param {string[]} keys - keys to mask
 * @returns {Object} the masked copy
 */
function masked(value, keys) {
    return Object.keys(value).reduce((copy, key) => {
        copy[key] = keys.indexOf(key) === -1 ? value[key] : MASK;
        return copy;
    }, {});
}

/**
 * The value of a JSON parameter with the values that change from run to run masked.
 * @param {string} name - parameter name
 * @param {*} value - parsed parameter value
 * @returns {*} the masked value
 */
function maskedJson(name, value) {
    if (name === "metrics" || name === "hc") {
        return masked(value, Object.keys(value));
    }
    if (name === "events" && Array.isArray(value)) {
        return value.map((event) => masked(event, event.key === "[CLY]_view" ? MASKED_EVENT_FIELDS.concat("dur") : MASKED_EVENT_FIELDS));
    }
    if (name === "crash") {
        return masked(value, MASKED_CRASH_FIELDS);
    }
    return value;
}

/**
 * A request as the scenario files record it: the path and the parameters, with the values that change from run to run
 * masked and the JSON parameters parsed.
 * @param {string} url - request URL
 * @param {Object} params - request parameters
 * @returns {Object} path and params
 */
export function recordedRequest(url, params) {
    const recorded = {};
    Object.keys(params).forEach((name) => {
        let value = params[name];
        if (MASKED_PARAMS.indexOf(name) !== -1) {
            value = MASK;
        }
        else if (JSON_PARAMS.indexOf(name) !== -1 && typeof value === "string") {
            value = maskedJson(name, JSON.parse(value));
        }
        recorded[name] = value;
    });
    return { path: new URL(url).pathname, params: sorted(recorded) };
}

/**
 * Waits until the SDK has sent everything it queued: both queues are empty and no request came for longer than the
 * SDK's own delays, such as the one second it waits before sending a consent change.
 * @param {Object} Countly - the SDK
 * @param {Object[]} sent - the requests sent so far, filled by the fake request handler
 * @returns {Promise<void>} resolves when the SDK is idle, rejects after 15 seconds
 */
async function idle(Countly, sent) {
    const started = Date.now();
    let count = -1;
    let quietSince = Date.now();
    while (Date.now() - started < 15000) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const queued = Countly._internals.getRequestQueue().length + Countly._internals.getEventQueue().length;
        if (queued || sent.length !== count) {
            count = sent.length;
            quietSince = Date.now();
        }
        else if (Date.now() - quietSince > 1500) {
            return;
        }
    }
    throw new Error("the SDK still had requests to send after 15 seconds");
}

/**
 * Runs a scenario on an SDK that is not initialized and gives back the requests it sent, halting the SDK afterwards.
 * @param {Object} Countly - the SDK
 * @param {string} name - scenario name, a key of SCENARIOS
 * @returns {Promise<Object[]>} the requests, as recordedRequest gives them
 */
export async function scenarioRequests(Countly, name) {
    const scenario = SCENARIOS[name];
    const sent = [];
    const store = new Map();
    Countly.init(Object.assign({
        app_key: "parity-app-key",
        url: "https://parity.example",
        device_id: "parity-device-001",
        interval: 50,
        // storage as a browser has it, so that the session state survives from one call to the next
        storage: { getItem: (key) => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) },
        fake_request_handler: (request) => {
            sent.push(recordedRequest(request.url, request.params));
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, scenario.config));
    await scenario.run(Countly, () => idle(Countly, sent));
    await idle(Countly, sent);
    Countly.halt();
    return sent;
}

/**
 * The content of api/requests/<scenario>.json for the requests of a scenario.
 * @param {Object[]} requests - the requests, as scenarioRequests gives them
 * @returns {string} file content
 */
export function requestsReport(requests) {
    return JSON.stringify(requests, null, 2) + "\n";
}
