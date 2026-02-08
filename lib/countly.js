/** **********
* Countly Web SDK
* https://github.com/Countly/countly-sdk-web
*********** */
/**
 * Countly object to manage the internal queue and send requests to Countly server. More information on {@link https://resources.count.ly/docs/countly-sdk-for-web}
 * @name Countly
 * @global
 * @namespace Countly
 * @example <caption>SDK integration</caption>
 * <script type="text/javascript">
 *
 * //some default pre init
 * var Countly = Countly || {};
 * Countly.q = Countly.q || [];
 *
 * //provide your app key that you retrieved from Countly dashboard
 * Countly.app_key = "YOUR_APP_KEY";
 *
 * //provide your server IP or name. Use try.count.ly for EE trial server.
 * //if you use your own server, make sure you have https enabled if you use
 * //https below.
 * Countly.url = "https://yourdomain.com";
 *
 * //start pushing function calls to queue
 * //track sessions automatically
 * Countly.q.push(["track_sessions"]);
 *
 * //track sessions automatically
 * Countly.q.push(["track_pageview"]);
 *
 * //load countly script asynchronously
 * (function() {
 *  var cly = document.createElement("script"); cly.type = "text/javascript";
 *  cly.async = true;
 *  //enter url of script here
 *  cly.src = "https://cdn.jsdelivr.net/countly-sdk-web/latest/countly.min.js";
 *  cly.onload = function(){Countly.init()};
 *  var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(cly, s);
 * })();
 * </script>
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Countly = global.Countly || {}));
})(this, (function (exports) {
    'use strict';

    function _assertClassBrand(e, t, n) {
        if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
        throw new TypeError("Private element is not present on this object");
    }
    function asyncGeneratorStep(n, t, e, r, o, a, c) {
        try {
            var i = n[a](c),
                u = i.value;
        } catch (n) {
            return void e(n);
        }
        i.done ? t(u) : Promise.resolve(u).then(r, o);
    }
    function _asyncToGenerator(n) {
        return function () {
            var t = this,
                e = arguments;
            return new Promise(function (r, o) {
                var a = n.apply(t, e);
                function _next(n) {
                    asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
                }
                function _throw(n) {
                    asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
                }
                _next(void 0);
            });
        };
    }
    function _checkPrivateRedeclaration(e, t) {
        if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
    function _classCallCheck(a, n) {
        if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
    }
    function _classPrivateFieldGet2(s, a) {
        return s.get(_assertClassBrand(s, a));
    }
    function _classPrivateFieldInitSpec(e, t, a) {
        _checkPrivateRedeclaration(e, t), t.set(e, a);
    }
    function _classPrivateFieldSet2(s, a, r) {
        return s.set(_assertClassBrand(s, a), r), r;
    }
    function _defineProperties(e, r) {
        for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
        }
    }
    function _createClass(e, r, t) {
        return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
            writable: !1
        }), e;
    }
    function _defineProperty(e, r, t) {
        return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
            value: t,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[r] = t, e;
    }
    function _readOnlyError(r) {
        throw new TypeError('"' + r + '" is read-only');
    }
    function _regenerator() {
        /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
        var e,
            t,
            r = "function" == typeof Symbol ? Symbol : {},
            n = r.iterator || "@@iterator",
            o = r.toStringTag || "@@toStringTag";
        function i(r, n, o, i) {
            var c = n && n.prototype instanceof Generator ? n : Generator,
                u = Object.create(c.prototype);
            return _regeneratorDefine(u, "_invoke", function (r, n, o) {
                var i,
                    c,
                    u,
                    f = 0,
                    p = o || [],
                    y = !1,
                    G = {
                        p: 0,
                        n: 0,
                        v: e,
                        a: d,
                        f: d.bind(e, 4),
                        d: function (t, r) {
                            return i = t, c = 0, u = e, G.n = r, a;
                        }
                    };
                function d(r, n) {
                    for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
                        var o,
                            i = p[t],
                            d = G.p,
                            l = i[2];
                        r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
                    }
                    if (o || r > 1) return a;
                    throw y = !0, n;
                }
                return function (o, p, l) {
                    if (f > 1) throw TypeError("Generator is already running");
                    for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
                        i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
                        try {
                            if (f = 2, i) {
                                if (c || (o = "next"), t = i[o]) {
                                    if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                                    if (!t.done) return t;
                                    u = t.value, c < 2 && (c = 0);
                                } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                                i = e;
                            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
                        } catch (t) {
                            i = e, c = 1, u = t;
                        } finally {
                            f = 1;
                        }
                    }
                    return {
                        value: t,
                        done: y
                    };
                };
            }(r, o, i), !0), u;
        }
        var a = {};
        function Generator() { }
        function GeneratorFunction() { }
        function GeneratorFunctionPrototype() { }
        t = Object.getPrototypeOf;
        var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
            return this;
        }), t),
            u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
        function f(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
        }
        return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
            return this;
        }), _regeneratorDefine(u, "toString", function () {
            return "[object Generator]";
        }), (_regenerator = function () {
            return {
                w: i,
                m: f
            };
        })();
    }
    function _regeneratorDefine(e, r, n, t) {
        var i = Object.defineProperty;
        try {
            i({}, "", {});
        } catch (e) {
            i = 0;
        }
        _regeneratorDefine = function (e, r, n, t) {
            function o(r, n) {
                _regeneratorDefine(e, r, function (e) {
                    return this._invoke(r, n, e);
                });
            }
            r ? i ? i(e, r, {
                value: n,
                enumerable: !t,
                configurable: !t,
                writable: !t
            }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
        }, _regeneratorDefine(e, r, n, t);
    }
    function _toPrimitive(t, r) {
        if ("object" != typeof t || !t) return t;
        var e = t[Symbol.toPrimitive];
        if (void 0 !== e) {
            var i = e.call(t, r || "default");
            if ("object" != typeof i) return i;
            throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
        var i = _toPrimitive(t, "string");
        return "symbol" == typeof i ? i : i + "";
    }
    function _typeof(o) {
        "@babel/helpers - typeof";

        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
            return typeof o;
        } : function (o) {
            return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
        }, _typeof(o);
    }

    // Feature ENUMS
    var featureEnums = {
        SESSIONS: "sessions",
        EVENTS: "events",
        VIEWS: "views",
        SCROLLS: "scrolls",
        CLICKS: "clicks",
        FORMS: "forms",
        CRASHES: "crashes",
        ATTRIBUTION: "attribution",
        USERS: "users",
        STAR_RATING: "star-rating",
        LOCATION: "location",
        APM: "apm",
        FEEDBACK: "feedback",
        REMOTE_CONFIG: "remote-config"
    };

    /**
     * At the current moment there are following internal events and their respective required consent:
        [CLY]_nps - "feedback" consent
        [CLY]_survey - "feedback" consent
        [CLY]_star_rating - "star_rating" consent
        [CLY]_view - "views" consent
        [CLY]_orientation - "users" consent
        [CLY]_push_action - "push" consent
        [CLY]_action - "clicks" or "scroll" consent
     */
    var internalEventKeyEnums = {
        NPS: "[CLY]_nps",
        SURVEY: "[CLY]_survey",
        STAR_RATING: "[CLY]_star_rating",
        VIEW: "[CLY]_view",
        ORIENTATION: "[CLY]_orientation",
        ACTION: "[CLY]_action"
    };
    var internalEventKeyEnumsArray = Object.values(internalEventKeyEnums);
    /**
     * 
     *log level Enums:
     *Error - this is a issues that needs attention right now.
     *Warning - this is something that is potentially a issue. Maybe a deprecated usage of something, maybe consent is enabled but consent is not given.
     *Info - All publicly exposed functions should log a call at this level to indicate that they were called. These calls should include the function name.
     *Debug - this should contain logs from the internal workings of the SDK and it's important calls. This should include things like the SDK configuration options, success or fail of the current network request, "request queue is full" and the oldest request get's dropped, etc.
     *Verbose - this should give a even deeper look into the SDK's inner working and should contain things that are more noisy and happen often.
     */
    var logLevelEnums = {
        ERROR: "[ERROR] ",
        WARNING: "[WARNING] ",
        INFO: "[INFO] ",
        DEBUG: "[DEBUG] ",
        VERBOSE: "[VERBOSE] "
    };
    /**
     * 
     *device ID type:
     *0 - device ID was set by the developer during init
     *1 - device ID was auto generated by Countly
     *2 - device ID was temporarily given by Countly
     *3 - device ID was provided from location.search
     */
    var DeviceIdTypeInternalEnums = {
        DEVELOPER_SUPPLIED: 0,
        SDK_GENERATED: 1,
        TEMPORARY_ID: 2,
        URL_PROVIDED: 3
    };
    /**
     * to be used as a default value for certain configuration key values
     */
    var configurationDefaultValues = {
        BEAT_INTERVAL: 500,
        QUEUE_SIZE: 1000,
        FAIL_TIMEOUT_AMOUNT: 60,
        INACTIVITY_TIME: 20,
        SESSION_UPDATE: 60,
        MAX_EVENT_BATCH: 100,
        SESSION_COOKIE_TIMEOUT: 30,
        MAX_KEY_LENGTH: 128,
        MAX_VALUE_SIZE: 256,
        MAX_SEGMENTATION_VALUES: 100,
        MAX_BREADCRUMB_COUNT: 100,
        MAX_STACKTRACE_LINES_PER_THREAD: 30,
        MAX_STACKTRACE_LINE_LENGTH: 200
    };

    /**
     * BoomerangJS and countly
     */
    var CDN = {
        BOOMERANG_SRC: "https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/boomerang.min.js",
        CLY_BOOMERANG_SRC: "https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/countly_boomerang.js"
    };

    /**
     * Health check counters' local storage keys
     */
    var healthCheckCounterEnum = Object.freeze({
        errorCount: "cly_hc_error_count",
        warningCount: "cly_hc_warning_count",
        statusCode: "cly_hc_status_code",
        errorMessage: "cly_hc_error_message",
        backoffCount: "cly_hc_backoff_count",
        consecutiveBackoffCount: "cly_hc_consecutive_backoff_count"
    });
    var SDK_VERSION = "26.1.0";
    var SDK_NAME = "javascript_native_web";

    // Using this on document.referrer would return an array with 17 elements in it. The 12th element (array[11]) would be the path we are looking for. Others would be things like password and such (use https://regex101.com/ to check more)
    // an example URL:
    // http://user:pass@host:8080/path/to/resource?query=value#fragment
    // this url would yield the following result for matches = urlParseRE.exec(document.referrer);
    //
    // 0: "http://user:pass@host:8080/path/to/resource?query=value#fragment"
    // 1: "http://user:pass@host:8080/path/to/resource?query=value"
    // 2: "http://user:pass@host:8080/path/to/resource"
    // 3: "http://user:pass@host:8080"
    // 4: "http:"
    // 5: "//"
    // 6: "user:pass@host:8080"
    // 7: "user:pass"
    // 8: "user"
    // 9: "pass"
    // 10: "host:8080"
    // 11: "host"
    // 12: "8080"
    // 13: "/path/to/resource"
    // 14: "/path/to/"
    // 15: "resource"
    // 16: "?query=value"
    // 17: "#fragment"
    var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    var isBrowser = typeof window !== "undefined";
    var Countly = globalThis.Countly || {};

    /**
     *  Get selected values from multi select input
     *  @param {HTMLElement} input - select with multi true option
     *  @returns {String} coma concatenated values
     */
    function getMultiSelectValues(input) {
        var values = [];
        if (typeof input.options !== "undefined") {
            for (var j = 0; j < input.options.length; j++) {
                if (input.options[j].selected) {
                    values.push(input.options[j].value);
                }
            }
        }
        return values.join(", ");
    }

    /**
     * Return a crypto-safe random string
     * @memberof Countly._internals
     * @returns {string} - random string
     */
    function secureRandom() {
        var id = "xxxxxxxx";
        id = replacePatternWithRandomValues(id, "[x]");

        // timestamp in milliseconds
        var timestamp = Date.now().toString();
        return id + timestamp;
    }

    /**
     *  Generate random UUID value
     *  @memberof Countly._internals
     *  @returns {String} random UUID value
     */
    function generateUUID() {
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        uuid = replacePatternWithRandomValues(uuid, "[xy]");
        return uuid;
    }

    /**
     * Generate random value based on pattern
     * 
     * @param {string} str - string to replace
     * @param {string} pattern - pattern to replace
     * @returns {string} - replaced string
    */
    function replacePatternWithRandomValues(str, pattern) {
        var d = new Date().getTime();
        var regex = new RegExp(pattern, "g");
        return str.replace(regex, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
        });
    }

    /**
     *  Get unix timestamp
     *  @memberof Countly._internals
     *  @returns {Number} unix timestamp
     */
    function getTimestamp() {
        return Math.floor(new Date().getTime() / 1000);
    }
    var lastMsTs = 0;
    /**
     *  Get unique timestamp in milliseconds
     *  @memberof Countly._internals
     *  @returns {Number} milliseconds timestamp
     */
    function getMsTimestamp() {
        var ts = new Date().getTime();
        if (lastMsTs >= ts) {
            lastMsTs++;
        } else {
            lastMsTs = ts;
        }
        return lastMsTs;
    }

    /**
     *  Get config value from multiple sources
     *  like config object, global object or fallback value
     *  @param {String} key - config key
     *  @param {Object} ob - config object
     *  @param {Varies} override - fallback value
     *  @returns {Varies} value to be used as config
     */
    function getConfig(key, ob, override) {
        if (ob && Object.keys(ob).length) {
            if (typeof ob[key] !== "undefined") {
                return ob[key];
            }
        } else if (typeof Countly[key] !== "undefined") {
            return Countly[key];
        }
        return override;
    }

    /**
     *  Dispatch errors to instances that lister to errors
     *  @param {Error} error - Error object
     *  @param {Boolean} fatality - fatal if false and nonfatal if true
     *  @param {Object} segments - custom crash segments
     */
    function dispatchErrors(error, fatality, segments) {
        // Check each instance like Countly.i[app_key_1], Countly.i[app_key_2] ...
        for (var app_key in Countly.i) {
            // If track_errors is enabled for that instance
            if (Countly.i[app_key].tracking_crashes) {
                // Trigger recordError function for that instance
                Countly.i[app_key].recordError(error, fatality, segments);
            }
        }
    }

    /**
     *  Convert JSON object to URL encoded query parameter string
     *  @memberof Countly._internals
     *  @param {Object} params - object with query parameters
     *  @param {String} salt - salt to be used for checksum calculation
     *  @returns {String} URL encode query string
     */
    function prepareParams(params, salt) {
        var str = [];
        // deterministic ordering for checksum stability
        var keys = Object.keys(params || {}).sort();
        for (var k = 0; k < keys.length; k++) {
            var i = keys[k];
            str.push(i + "=" + encodeURIComponent(params[i]));
        }
        var data = str.join("&");
        if (salt) {
            return calculateChecksum(data, salt).then(function (checksum) {
                data += "&checksum256=" + checksum.toUpperCase();
                return data;
            });
        }
        return Promise.resolve(data);
    }

    /**
     *  Removing trailing slashes
     *  @memberof Countly._internals
     *  @param {String} str - string from which to remove trailing slash
     *  @returns {String} modified string
     */
    function stripTrailingSlash(str) {
        if (typeof str === "string") {
            if (str.substring(str.length - 1) === "/") {
                return str.substring(0, str.length - 1);
            }
        }
        return str;
    }

    /**
     *  Retrieve only specific properties from object
     *  @memberof Countly._internals
     *  @param {Object} orig - original object
     *  @param {Array} props - array with properties to get from object
     *  @returns {Object} new object with requested properties
     */
    function createNewObjectFromProperties(orig, props) {
        var ob = {};
        var prop;
        for (var i = 0, len = props.length; i < len; i++) {
            prop = props[i];
            if (typeof orig[prop] !== "undefined") {
                ob[prop] = orig[prop];
            }
        }
        return ob;
    }

    /**
     *  Add specified properties to an object from another object
     *  @memberof Countly._internals
     *  @param {Object} orig - original object
     *  @param {Object} transferOb - object to copy values from
     *  @param {Array} props - array with properties to get from object
     *  @returns {Object} original object with additional requested properties
     */
    function addNewProperties(orig, transferOb, props) {
        if (!props) {
            return;
        }
        var prop;
        for (var i = 0, len = props.length; i < len; i++) {
            prop = props[i];
            if (typeof transferOb[prop] !== "undefined") {
                orig[prop] = transferOb[prop];
            }
        }
        return orig;
    }

    /**
     * Truncates an object's key/value pairs to a certain length
     * @param {Object} obj - original object to be truncated
     * @param {Number} keyLimit - limit for key length
     * @param {Number} valueLimit - limit for value length
     * @param {Number} segmentLimit - limit for segments pairs
     * @param {string} errorLog - prefix for error log
     * @param {function} logCall - internal logging function
     * @returns {Object} - the new truncated object
     */
    function truncateObject(obj, keyLimit, valueLimit, segmentLimit, errorLog, logCall) {
        var ob = {};
        if (obj) {
            if (Object.keys(obj).length > segmentLimit) {
                var resizedObj = {};
                var i = 0;
                for (var e in obj) {
                    if (i < segmentLimit) {
                        resizedObj[e] = obj[e];
                        i++;
                    }
                }
                obj = resizedObj;
            }
            for (var key in obj) {
                var newKey = truncateSingleValue(key, keyLimit, errorLog, logCall);
                var newValue = truncateSingleValue(obj[key], valueLimit, errorLog, logCall);
                ob[newKey] = newValue;
            }
        }
        return ob;
    }

    /**
     * Truncates a single value to a certain length
     * @param {string|number} str - original value to be truncated
     * @param {Number} limit - limit length
     * @param {string} errorLog - prefix for error log
     * @param {function} logCall - internal logging function
     * @returns {string|number} - the new truncated value
     */
    function truncateSingleValue(str, limit, errorLog, logCall) {
        var newStr = str;
        if (typeof str === "number") {
            str = str.toString();
        }
        if (typeof str === "string") {
            if (str.length > limit) {
                newStr = str.substring(0, limit);
                logCall(logLevelEnums.DEBUG, errorLog + ", Key: [ " + str + " ] is longer than accepted length. It will be truncated.");
            }
        }
        return newStr;
    }

    /**
     * Calculates the checksum of the data with the given salt
     * Uses SHA-256 algorithm with web crypto API
     * Implementation based on https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
     * TODO: Turn to async function when we drop support for older browsers
     * @param {string} data - data to be used for checksum calculation (concatenated query parameters)
     * @param {string} salt - salt to be used for checksum calculation
     * @returns {string} checksum in hex format
     */
    function calculateChecksum(data, salt) {
        var msgUint8 = new TextEncoder().encode(data + salt); // encode as (utf-8) Uint8Array
        return crypto.subtle.digest("SHA-256", msgUint8).then(function (hashBuffer) {
            // hash the message
            var hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
            var hashHex = hashArray.map(function (b) {
                return b.toString(16).padStart(2, "0");
            }).join(""); // convert bytes to hex string (lowercase)
            return hashHex.toUpperCase();
        });
    }

    /**
     *  Polyfill to get closest parent matching nodeName
     *  @param {HTMLElement} el - element from which to search
     *  @param {String} nodeName - tag/node name
     *  @returns {HTMLElement} closest parent element
     */
    function get_closest_element(el, nodeName) {
        nodeName = nodeName.toUpperCase();
        while (el) {
            if (el.nodeName.toUpperCase() === nodeName) {
                return el;
            }
            el = el.parentElement;
        }
    }

    /**
     *  Listen to specific browser event
     *  @memberof Countly._internals
     *  @param {HTMLElement} element - HTML element that should listen to event
     *  @param {String} type - event name or action
     *  @param {Function} listener - callback when event is fired
     */
    function add_event_listener(element, type, listener) {
        if (!isBrowser) {
            return;
        }
        if (element === null || typeof element === "undefined") {
            // element can be null so lets check it first
            if (checkIfLoggingIsOn()) {
                // eslint-disable-next-line no-console
                console.warn("[WARNING] [Countly] add_event_listener, Can't bind [" + type + "] event to nonexisting element");
            }
            return;
        }
        if (typeof element.addEventListener !== "undefined") {
            element.addEventListener(type, listener, false);
        }
        // for old browser use attachEvent instead
        else {
            element.attachEvent("on" + type, listener);
        }
    }

    /**
     *  Get element that fired event
     *  @memberof Countly._internals
     *  @param {Event} event - event that was filed
     *  @returns {HTMLElement} HTML element that caused event to fire
     */
    function get_event_target(event) {
        if (!event) {
            return window.event.srcElement;
        }
        if (typeof event.target !== "undefined") {
            return event.target;
        }
        return event.srcElement;
    }

    /**
     *  Returns raw user agent string
     *  @memberof Countly._internals
     *  @param {string} uaOverride - a string value to pass instead of ua value
     *  @returns {string} currentUserAgentString - raw user agent string
     */
    function currentUserAgentString(uaOverride) {
        if (uaOverride) {
            return uaOverride;
        }
        var ua_raw = navigator.userAgent;
        // check if userAgentData is supported and userAgent is not available, then use it
        if (!ua_raw) {
            ua_raw = currentUserAgentDataString();
        }
        // RAW USER AGENT STRING
        return ua_raw;
    }

    /**
     *  Forms user agent string from userAgentData by concatenating brand, version, mobile and platform
     *  @memberof Countly._internals
     *  @param {string} uaOverride - a string value to pass instead of ua value
     *  @returns {string} currentUserAgentString - user agent string from userAgentData
     */
    function currentUserAgentDataString(uaOverride) {
        if (uaOverride) {
            return uaOverride;
        }
        var ua = "";
        if (navigator.userAgentData) {
            // turn brands array into string
            ua = navigator.userAgentData.brands.map(function (e) {
                return e.brand + ":" + e.version;
            }).join();
            // add mobile info
            ua += navigator.userAgentData.mobile ? " mobi " : " ";
            // add platform info
            ua += navigator.userAgentData.platform;
        }
        return ua;
    }

    /**
     *  Returns device type information according to user agent string
     *  @memberof Countly._internals
     *  @param {string} uaOverride - a string value to pass instead of ua value
     *  @returns {string} userAgentDeviceDetection - current device type (desktop, tablet, phone)
     */
    function userAgentDeviceDetection(uaOverride) {
        var userAgent;
        // TODO: refactor here
        if (uaOverride) {
            userAgent = uaOverride;
        } else if (navigator.userAgentData && navigator.userAgentData.mobile) {
            return "phone";
        } else {
            userAgent = currentUserAgentString();
        }
        // make it lowercase for regex to work properly
        userAgent = userAgent.toLowerCase();

        // assign the default device
        var device = "desktop";

        // regexps corresponding to tablets or phones that can be found in userAgent string
        var tabletCheck = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/;
        var phoneCheck = /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/;

        // check whether the regexp values corresponds to something in the user agent string
        if (tabletCheck.test(userAgent)) {
            device = "tablet";
        } else if (phoneCheck.test(userAgent)) {
            device = "phone";
        }

        // set the device type
        return device;
    }

    /**
     *  Returns information regarding if the current user is a search bot or not
     *  @memberof Countly._internals
     *  @param {string} uaOverride - a string value to pass instead of ua value
     *  @returns {boolean} userAgentSearchBotDetection - if a search bot is reaching the site or not
     */
    function userAgentSearchBotDetection(uaOverride) {
        // search bot regexp
        var searchBotRE = /(CountlySiteBot|nuhk|Googlebot|GoogleSecurityScanner|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|AdsBot-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|Yandex|YaDirectFetcher|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler|wesee|AliasIO|contxbot|PingdomBot|BingPreview|HeadlessChrome|Lighthouse)/;

        // check override first
        if (uaOverride) {
            return searchBotRE.test(uaOverride);
        }

        // check both userAgent and userAgentData, as one of them might be containing the information we are looking for
        var ua_bot = searchBotRE.test(currentUserAgentString());
        var uaData_bot = searchBotRE.test(currentUserAgentDataString());
        return ua_bot || uaData_bot;
    }

    /**
     *  Modify event to set standard coordinate properties if they are not available
     *  @memberof Countly._internals
     *  @param {Event} e - event object
     *  @returns {Event} modified event object
     */
    function get_page_coord(e) {
        // checking if pageY and pageX is already available
        if (typeof e.pageY === "undefined" && typeof e.clientX === "number" && document.documentElement) {
            // if not, then add scrolling positions
            e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        // return e which now contains pageX and pageY attributes
        return e;
    }

    /**
     *  Get height of whole document
     *  @memberof Countly._internals
     *  @returns {Number} height in pixels
     */
    function getDocHeight() {
        var D = document;
        return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
    }

    /**
     *  Get width of whole document
     *  @memberof Countly._internals
     *  @returns {Number} width in pixels
     */
    function getDocWidth() {
        var D = document;
        return Math.max(Math.max(D.body.scrollWidth, D.documentElement.scrollWidth), Math.max(D.body.offsetWidth, D.documentElement.offsetWidth), Math.max(D.body.clientWidth, D.documentElement.clientWidth));
    }

    /**
     *  Get height of viewable area
     *  @memberof Countly._internals
     *  @returns {Number} height in pixels
     */
    function getViewportHeight() {
        var D = document;
        return Math.min(Math.min(D.body.clientHeight, D.documentElement.clientHeight), Math.min(D.body.offsetHeight, D.documentElement.offsetHeight), window.innerHeight);
    }

    /**
     *  Get device's orientation
     *  @returns {String} device orientation
     */
    function getOrientation() {
        return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    }

    /**
     *  Load external js files
     *  @param {String} tag - Tag/node name to load file in
     *  @param {String} attr - Attribute name for type
     *  @param {String} type - Type value
     *  @param {String} src - Attribute name for file path
     *  @param {String} data - File path
     *  @param {Function} callback - callback when done
     */
    function loadFile(tag, attr, type, src, data, callback) {
        var fileRef = document.createElement(tag);
        var loaded;
        fileRef.setAttribute(attr, type);
        fileRef.setAttribute(src, data);
        var callbackFunction = function callbackFunction() {
            if (!loaded) {
                callback();
            }
            loaded = true;
        };
        if (callback) {
            fileRef.onreadystatechange = callbackFunction;
            fileRef.onload = callbackFunction;
        }
        document.getElementsByTagName("head")[0].appendChild(fileRef);
    }

    /**
     *  Load external js files
     *  @memberof Countly._internals
     *  @param {String} js - path to JS file
     *  @param {Function} callback - callback when done
     */
    function loadJS(js, callback) {
        loadFile("script", "type", "text/javascript", "src", js, callback);
    }

    /**
     *  Load external css files
     *  @memberof Countly._internals
     *  @param {String} css - path to CSS file
     *  @param {Function} callback - callback when done
     */
    function loadCSS(css, callback) {
        loadFile("link", "rel", "stylesheet", "href", css, callback);
    }

    /**
     *  Show loader UI when loading external data
     *  @memberof Countly._internals
     */
    function showLoader() {
        if (!isBrowser) {
            return;
        }
        var loader = document.getElementById("cly-loader");
        if (!loader) {
            var css = "#cly-loader {height: 4px; width: 100%; position: absolute; z-index: 99999; overflow: hidden; background-color: #fff; top:0px; left:0px;}" + "#cly-loader:before{display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2EB52B; animation: cly-loading 2s linear infinite;}" + "@keyframes cly-loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;}}";
            var head = document.head || document.getElementsByTagName("head")[0];
            var style = document.createElement("style");
            style.type = "text/css";
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
            loader = document.createElement("div");
            loader.setAttribute("id", "cly-loader");
            window.addEventListener("load", function () {
                if (Countly.showLoaderProtection) {
                    if (checkIfLoggingIsOn()) {
                        console.warn("[WARNING] [Countly] showLoader, Loader is already on");
                    }
                    return;
                }
                try {
                    document.body.appendChild(loader);
                } catch (e) {
                    if (checkIfLoggingIsOn()) {
                        console.error("[ERROR] [Countly] showLoader, Body is not loaded for loader to append: " + e);
                    }
                }
            });
        }
        loader.style.display = "block";
    }

    /**
     *  Checks if debug is true and console is available in Countly object
     *  @memberof Countly._internals 
     * @returns {Boolean} true if debug is true and console is available in Countly object
     */
    function checkIfLoggingIsOn() {
        // check if logging is enabled
        if (Countly && Countly.debug && typeof console !== "undefined") {
            return true;
        }
        return false;
    }

    /**
     *  Hide loader UI
     *  @memberof Countly._internals
     */
    function hideLoader() {
        if (!isBrowser) {
            return;
        }
        // Inform showLoader that it should not append the loader
        Countly.showLoaderProtection = true;
        var loader = document.getElementById("cly-loader");
        if (loader) {
            loader.style.display = "none";
        }
    }

    var _consentTimer = /*#__PURE__*/new WeakMap();
    var _self = /*#__PURE__*/new WeakMap();
    var _global = /*#__PURE__*/new WeakMap();
    var _sessionStarted = /*#__PURE__*/new WeakMap();
    var _apiPath = /*#__PURE__*/new WeakMap();
    var _readPath = /*#__PURE__*/new WeakMap();
    var _beatInterval = /*#__PURE__*/new WeakMap();
    var _requestQueue = /*#__PURE__*/new WeakMap();
    var _eventQueue = /*#__PURE__*/new WeakMap();
    var _remoteConfigs = /*#__PURE__*/new WeakMap();
    var _crashLogs = /*#__PURE__*/new WeakMap();
    var _timedEvents = /*#__PURE__*/new WeakMap();
    var _ignoreReferrers = /*#__PURE__*/new WeakMap();
    var _crashSegments = /*#__PURE__*/new WeakMap();
    var _autoExtend = /*#__PURE__*/new WeakMap();
    var _lastBeat = /*#__PURE__*/new WeakMap();
    var _storedDuration = /*#__PURE__*/new WeakMap();
    var _lastView = /*#__PURE__*/new WeakMap();
    var _lastViewTime = /*#__PURE__*/new WeakMap();
    var _lastViewStoredDuration = /*#__PURE__*/new WeakMap();
    var _failTimeout = /*#__PURE__*/new WeakMap();
    var _failTimeoutAmount = /*#__PURE__*/new WeakMap();
    var _inactivityTime = /*#__PURE__*/new WeakMap();
    var _inactivityCounter = /*#__PURE__*/new WeakMap();
    var _useSessionCookie = /*#__PURE__*/new WeakMap();
    var _sessionCookieTimeout = /*#__PURE__*/new WeakMap();
    var _readyToProcess = /*#__PURE__*/new WeakMap();
    var _hasPulse = /*#__PURE__*/new WeakMap();
    var _offlineMode = /*#__PURE__*/new WeakMap();
    var _lastParams = /*#__PURE__*/new WeakMap();
    var _trackTime = /*#__PURE__*/new WeakMap();
    var _startTime = /*#__PURE__*/new WeakMap();
    var _lsSupport = /*#__PURE__*/new WeakMap();
    var _firstView = /*#__PURE__*/new WeakMap();
    var _deviceIdType = /*#__PURE__*/new WeakMap();
    var _isScrollRegistryOpen = /*#__PURE__*/new WeakMap();
    var _scrollRegistryTopPosition = /*#__PURE__*/new WeakMap();
    var _trackingScrolls = /*#__PURE__*/new WeakMap();
    var _currentViewId = /*#__PURE__*/new WeakMap();
    var _previousViewId = /*#__PURE__*/new WeakMap();
    var _freshUTMTags = /*#__PURE__*/new WeakMap();
    var _sdkName = /*#__PURE__*/new WeakMap();
    var _sdkVersion = /*#__PURE__*/new WeakMap();
    var _shouldSendHC = /*#__PURE__*/new WeakMap();
    var _consents = /*#__PURE__*/new WeakMap();
    var _generatedRequests = /*#__PURE__*/new WeakMap();
    var _contentEndPoint = /*#__PURE__*/new WeakMap();
    var _inContentZone = /*#__PURE__*/new WeakMap();
    var _contentZoneTimer = /*#__PURE__*/new WeakMap();
    var _contentIframeID = /*#__PURE__*/new WeakMap();
    var _crashFilterCallback = /*#__PURE__*/new WeakMap();
    var _serverConfigCache = /*#__PURE__*/new WeakMap();
    var _SCNetwork = /*#__PURE__*/new WeakMap();
    var _SCSizeReqQueue = /*#__PURE__*/new WeakMap();
    var _SCSizeEventBatch = /*#__PURE__*/new WeakMap();
    var _SCIntervalSessionUpdate = /*#__PURE__*/new WeakMap();
    var _SCIntervalContent = /*#__PURE__*/new WeakMap();
    var _SCInterval = /*#__PURE__*/new WeakMap();
    var _SCTrackingAll = /*#__PURE__*/new WeakMap();
    var _SCTrackingSession = /*#__PURE__*/new WeakMap();
    var _SCTrackingViews = /*#__PURE__*/new WeakMap();
    var _SCTrackingCrashes = /*#__PURE__*/new WeakMap();
    var _SCTrackingEvents = /*#__PURE__*/new WeakMap();
    var _SCTrackingLocation = /*#__PURE__*/new WeakMap();
    var _SCEnableContent = /*#__PURE__*/new WeakMap();
    var _SCEnableConsentRequired = /*#__PURE__*/new WeakMap();
    var _SCEnableRefreshContentZone = /*#__PURE__*/new WeakMap();
    var _SCLimitKeyLength = /*#__PURE__*/new WeakMap();
    var _SCLimitValueSize = /*#__PURE__*/new WeakMap();
    var _SCLimitSegmentationValues = /*#__PURE__*/new WeakMap();
    var _SCLimitBreadcrumbCount = /*#__PURE__*/new WeakMap();
    var _SCLimitStackTraceLinesPerThread = /*#__PURE__*/new WeakMap();
    var _SCLimitStackTraceLineLength = /*#__PURE__*/new WeakMap();
    var _SCBackoffMechanismEnabled = /*#__PURE__*/new WeakMap();
    var _SCBackoffAcceptedTimeout = /*#__PURE__*/new WeakMap();
    var _SCBackoffRQPercentage = /*#__PURE__*/new WeakMap();
    var _SCBackoffRequestAge = /*#__PURE__*/new WeakMap();
    var _SCBackoffDuration = /*#__PURE__*/new WeakMap();
    var _SCEventBlacklist = /*#__PURE__*/new WeakMap();
    var _SCEventWhitelist = /*#__PURE__*/new WeakMap();
    var _SCUserPropertyBlacklist = /*#__PURE__*/new WeakMap();
    var _SCUserPropertyWhitelist = /*#__PURE__*/new WeakMap();
    var _SCSegmentationBlacklist = /*#__PURE__*/new WeakMap();
    var _SCSegmentationWhitelist = /*#__PURE__*/new WeakMap();
    var _SCEventSegmentationBlacklist = /*#__PURE__*/new WeakMap();
    var _SCEventSegmentationWhitelist = /*#__PURE__*/new WeakMap();
    var _SCJourneyTriggerEvents = /*#__PURE__*/new WeakMap();
    var _initContentSent = /*#__PURE__*/new WeakMap();
    var _initTimestamp = /*#__PURE__*/new WeakMap();
    var _isSCDisabled = /*#__PURE__*/new WeakMap();
    var _lastRequestDuration = /*#__PURE__*/new WeakMap();
    var _backoffEndTime = /*#__PURE__*/new WeakMap();
    var _isInBackoff = /*#__PURE__*/new WeakMap();
    var _backOffLogShown = /*#__PURE__*/new WeakMap();
    var _lastRequestWasBackoff = /*#__PURE__*/new WeakMap();
    var _testModeTime = /*#__PURE__*/new WeakMap();
    var _requestTimeoutDuration = /*#__PURE__*/new WeakMap();
    var _contentFilterCallback = /*#__PURE__*/new WeakMap();
    var _isProcessingAsyncFromUserDataSave = /*#__PURE__*/new WeakMap();
    var _journeyTriggerInProgress = /*#__PURE__*/new WeakMap();
    var _journeyTriggerPending = /*#__PURE__*/new WeakMap();
    var _journeyPendingEventIds = /*#__PURE__*/new WeakMap();
    var _fakeRequestHandler = /*#__PURE__*/new WeakMap();
    var _getAndSetServerConfig = /*#__PURE__*/new WeakMap();
    var _populateServerConfig = /*#__PURE__*/new WeakMap();
    var _initialize = /*#__PURE__*/new WeakMap();
    var _updateConsent = /*#__PURE__*/new WeakMap();
    var _add_cly_events = /*#__PURE__*/new WeakMap();
    var _isEventAllowedByBehaviorSettings = /*#__PURE__*/new WeakMap();
    var _filterSegmentationByBehaviorSettings = /*#__PURE__*/new WeakMap();
    var _isUserPropertyAllowed = /*#__PURE__*/new WeakMap();
    var _filterUserCustomProperties = /*#__PURE__*/new WeakMap();
    var _handleJourneyTrigger = /*#__PURE__*/new WeakMap();
    var _processJourneyTriggerQueueAndContent = /*#__PURE__*/new WeakMap();
    var _drainRequestQueueForJourney = /*#__PURE__*/new WeakMap();
    var _sendNextRequestFromQueueForJourney = /*#__PURE__*/new WeakMap();
    var _markJourneyEventIfSent = /*#__PURE__*/new WeakMap();
    var _triggerJourneyContentRequestWithRetries = /*#__PURE__*/new WeakMap();
    var _delay = /*#__PURE__*/new WeakMap();
    var _report_orientation = /*#__PURE__*/new WeakMap();
    var _customData = /*#__PURE__*/new WeakMap();
    var _change_custom_property = /*#__PURE__*/new WeakMap();
    var _fetch_remote_config_explicit = /*#__PURE__*/new WeakMap();
    var _stop_time = /*#__PURE__*/new WeakMap();
    var _start_time = /*#__PURE__*/new WeakMap();
    var _showWidgetInternal = /*#__PURE__*/new WeakMap();
    var _interpretFeedbackWidgetMessage = /*#__PURE__*/new WeakMap();
    var _checkIgnore = /*#__PURE__*/new WeakMap();
    var _enterContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _refreshContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _exitContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _prepareContentRequest = /*#__PURE__*/new WeakMap();
    var _sendContentRequest = /*#__PURE__*/new WeakMap();
    var _displayContent = /*#__PURE__*/new WeakMap();
    var _interpretContentMessage = /*#__PURE__*/new WeakMap();
    var _closeContentFrame = /*#__PURE__*/new WeakMap();
    var _sendEventsForced = /*#__PURE__*/new WeakMap();
    var _processWidget = /*#__PURE__*/new WeakMap();
    var _notifyLoaders = /*#__PURE__*/new WeakMap();
    var _reportViewDuration = /*#__PURE__*/new WeakMap();
    var _getLastView = /*#__PURE__*/new WeakMap();
    var _extendSession = /*#__PURE__*/new WeakMap();
    var _prepareRequest = /*#__PURE__*/new WeakMap();
    var _toRequestQueue = /*#__PURE__*/new WeakMap();
    var _heartBeat = /*#__PURE__*/new WeakMap();
    var _checkBackoffConditions = /*#__PURE__*/new WeakMap();
    var _getGeneratedRequests = /*#__PURE__*/new WeakMap();
    var _sendRequestFromQueue = /*#__PURE__*/new WeakMap();
    var _processAsyncQueue = /*#__PURE__*/new WeakMap();
    var _getStoredIdOrGenerateId = /*#__PURE__*/new WeakMap();
    var _isUUID = /*#__PURE__*/new WeakMap();
    var _getUA = /*#__PURE__*/new WeakMap();
    var _getMetrics = /*#__PURE__*/new WeakMap();
    var _getResolution = /*#__PURE__*/new WeakMap();
    var _isReferrerUsable = /*#__PURE__*/new WeakMap();
    var _log = /*#__PURE__*/new WeakMap();
    var _makeNetworkRequest = /*#__PURE__*/new WeakMap();
    var _sendXmlHttpRequest = /*#__PURE__*/new WeakMap();
    var _createBlobFromBase = /*#__PURE__*/new WeakMap();
    var _prepareImageUploadFormData = /*#__PURE__*/new WeakMap();
    var _sendFetchRequest = /*#__PURE__*/new WeakMap();
    var _isResponseValid = /*#__PURE__*/new WeakMap();
    var _isResponseValidBroad = /*#__PURE__*/new WeakMap();
    var _processScroll = /*#__PURE__*/new WeakMap();
    var _processScrollView = /*#__PURE__*/new WeakMap();
    var _getInternalDeviceIdType = /*#__PURE__*/new WeakMap();
    var _setToken = /*#__PURE__*/new WeakMap();
    var _getToken = /*#__PURE__*/new WeakMap();
    var _getEventQueue = /*#__PURE__*/new WeakMap();
    var _getRequestQueue = /*#__PURE__*/new WeakMap();
    var _readCookie = /*#__PURE__*/new WeakMap();
    var _createCookie = /*#__PURE__*/new WeakMap();
    var _getValueFromStorage = /*#__PURE__*/new WeakMap();
    var _setValueInStorage = /*#__PURE__*/new WeakMap();
    var _removeValueFromStorage = /*#__PURE__*/new WeakMap();
    var _migrate = /*#__PURE__*/new WeakMap();
    var _onStorageChange = /*#__PURE__*/new WeakMap();
    var _clearQueue = /*#__PURE__*/new WeakMap();
    var _getLocalQueues = /*#__PURE__*/new WeakMap();
    var _HealthCheck = /*#__PURE__*/new WeakMap();
    var CountlyClass = /*#__PURE__*/_createClass(
        /**
         * Create a new Countly instance with configuration
         * @param {Object} ob - Configuration object for Countly initialization
         */
        function CountlyClass(_ob) {
        var _this = this;
        _classCallCheck(this, CountlyClass);
        _classPrivateFieldInitSpec(this, _consentTimer, void 0);
        _classPrivateFieldInitSpec(this, _self, void 0);
        _classPrivateFieldInitSpec(this, _global, void 0);
        _classPrivateFieldInitSpec(this, _sessionStarted, void 0);
        _classPrivateFieldInitSpec(this, _apiPath, void 0);
        _classPrivateFieldInitSpec(this, _readPath, void 0);
        _classPrivateFieldInitSpec(this, _beatInterval, void 0);
        _classPrivateFieldInitSpec(this, _requestQueue, void 0);
        _classPrivateFieldInitSpec(this, _eventQueue, void 0);
        _classPrivateFieldInitSpec(this, _remoteConfigs, void 0);
        _classPrivateFieldInitSpec(this, _crashLogs, void 0);
        _classPrivateFieldInitSpec(this, _timedEvents, void 0);
        _classPrivateFieldInitSpec(this, _ignoreReferrers, void 0);
        _classPrivateFieldInitSpec(this, _crashSegments, void 0);
        _classPrivateFieldInitSpec(this, _autoExtend, void 0);
        _classPrivateFieldInitSpec(this, _lastBeat, void 0);
        _classPrivateFieldInitSpec(this, _storedDuration, void 0);
        _classPrivateFieldInitSpec(this, _lastView, void 0);
        _classPrivateFieldInitSpec(this, _lastViewTime, void 0);
        _classPrivateFieldInitSpec(this, _lastViewStoredDuration, void 0);
        _classPrivateFieldInitSpec(this, _failTimeout, void 0);
        _classPrivateFieldInitSpec(this, _failTimeoutAmount, void 0);
        _classPrivateFieldInitSpec(this, _inactivityTime, void 0);
        _classPrivateFieldInitSpec(this, _inactivityCounter, void 0);
        _classPrivateFieldInitSpec(this, _useSessionCookie, void 0);
        _classPrivateFieldInitSpec(this, _sessionCookieTimeout, void 0);
        _classPrivateFieldInitSpec(this, _readyToProcess, void 0);
        _classPrivateFieldInitSpec(this, _hasPulse, void 0);
        _classPrivateFieldInitSpec(this, _offlineMode, void 0);
        _classPrivateFieldInitSpec(this, _lastParams, void 0);
        _classPrivateFieldInitSpec(this, _trackTime, void 0);
        _classPrivateFieldInitSpec(this, _startTime, void 0);
        _classPrivateFieldInitSpec(this, _lsSupport, void 0);
        _classPrivateFieldInitSpec(this, _firstView, void 0);
        _classPrivateFieldInitSpec(this, _deviceIdType, void 0);
        _classPrivateFieldInitSpec(this, _isScrollRegistryOpen, void 0);
        _classPrivateFieldInitSpec(this, _scrollRegistryTopPosition, void 0);
        _classPrivateFieldInitSpec(this, _trackingScrolls, void 0);
        _classPrivateFieldInitSpec(this, _currentViewId, void 0);
        _classPrivateFieldInitSpec(this, _previousViewId, void 0);
        _classPrivateFieldInitSpec(this, _freshUTMTags, void 0);
        _classPrivateFieldInitSpec(this, _sdkName, void 0);
        _classPrivateFieldInitSpec(this, _sdkVersion, void 0);
        _classPrivateFieldInitSpec(this, _shouldSendHC, void 0);
        _classPrivateFieldInitSpec(this, _consents, void 0);
        _classPrivateFieldInitSpec(this, _generatedRequests, void 0);
        _classPrivateFieldInitSpec(this, _contentEndPoint, void 0);
        _classPrivateFieldInitSpec(this, _inContentZone, void 0);
        _classPrivateFieldInitSpec(this, _contentZoneTimer, void 0);
        _classPrivateFieldInitSpec(this, _contentIframeID, void 0);
        _classPrivateFieldInitSpec(this, _crashFilterCallback, void 0);
        _classPrivateFieldInitSpec(this, _serverConfigCache, void 0);
        _classPrivateFieldInitSpec(this, _SCNetwork, void 0);
        _classPrivateFieldInitSpec(this, _SCSizeReqQueue, void 0);
        _classPrivateFieldInitSpec(this, _SCSizeEventBatch, void 0);
        _classPrivateFieldInitSpec(this, _SCIntervalSessionUpdate, void 0);
        _classPrivateFieldInitSpec(this, _SCIntervalContent, void 0);
        _classPrivateFieldInitSpec(this, _SCInterval, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingAll, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingSession, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingViews, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingCrashes, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingEvents, void 0);
        _classPrivateFieldInitSpec(this, _SCTrackingLocation, void 0);
        _classPrivateFieldInitSpec(this, _SCEnableContent, void 0);
        _classPrivateFieldInitSpec(this, _SCEnableConsentRequired, void 0);
        _classPrivateFieldInitSpec(this, _SCEnableRefreshContentZone, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitKeyLength, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitValueSize, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitSegmentationValues, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitBreadcrumbCount, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitStackTraceLinesPerThread, void 0);
        _classPrivateFieldInitSpec(this, _SCLimitStackTraceLineLength, void 0);
        _classPrivateFieldInitSpec(this, _SCBackoffMechanismEnabled, void 0);
        _classPrivateFieldInitSpec(this, _SCBackoffAcceptedTimeout, void 0);
        _classPrivateFieldInitSpec(this, _SCBackoffRQPercentage, void 0);
        _classPrivateFieldInitSpec(this, _SCBackoffRequestAge, void 0);
        _classPrivateFieldInitSpec(this, _SCBackoffDuration, void 0);
        _classPrivateFieldInitSpec(this, _SCEventBlacklist, void 0);
        _classPrivateFieldInitSpec(this, _SCEventWhitelist, void 0);
        _classPrivateFieldInitSpec(this, _SCUserPropertyBlacklist, void 0);
        _classPrivateFieldInitSpec(this, _SCUserPropertyWhitelist, void 0);
        _classPrivateFieldInitSpec(this, _SCSegmentationBlacklist, void 0);
        _classPrivateFieldInitSpec(this, _SCSegmentationWhitelist, void 0);
        _classPrivateFieldInitSpec(this, _SCEventSegmentationBlacklist, void 0);
        _classPrivateFieldInitSpec(this, _SCEventSegmentationWhitelist, void 0);
        _classPrivateFieldInitSpec(this, _SCJourneyTriggerEvents, void 0);
        _classPrivateFieldInitSpec(this, _initContentSent, void 0);
        _classPrivateFieldInitSpec(this, _initTimestamp, void 0);
        _classPrivateFieldInitSpec(this, _isSCDisabled, void 0);
        _classPrivateFieldInitSpec(this, _lastRequestDuration, void 0);
        _classPrivateFieldInitSpec(this, _backoffEndTime, void 0);
        _classPrivateFieldInitSpec(this, _isInBackoff, void 0);
        _classPrivateFieldInitSpec(this, _backOffLogShown, void 0);
        _classPrivateFieldInitSpec(this, _lastRequestWasBackoff, void 0);
        _classPrivateFieldInitSpec(this, _testModeTime, void 0);
        _classPrivateFieldInitSpec(this, _requestTimeoutDuration, void 0);
        _classPrivateFieldInitSpec(this, _contentFilterCallback, void 0);
        _classPrivateFieldInitSpec(this, _isProcessingAsyncFromUserDataSave, void 0);
        _classPrivateFieldInitSpec(this, _journeyTriggerInProgress, void 0);
        _classPrivateFieldInitSpec(this, _journeyTriggerPending, void 0);
        _classPrivateFieldInitSpec(this, _journeyPendingEventIds, void 0);
        _classPrivateFieldInitSpec(this, _fakeRequestHandler, void 0);
        /**
         * Fetch and set server configuration
         * Retrieves server-side settings and behavior configurations
         * @private
         */
        _classPrivateFieldInitSpec(this, _getAndSetServerConfig, function () {
            if (_this.device_id === "[CLY]_temp_id") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, Device ID is temporary, not fetching server config");
                return;
            }
            if (_classPrivateFieldGet2(_isSCDisabled, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, SDK behavior sync is disabled, not fetching server config");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, Fetching server config");
            var params = {};
            params.app_key = _this.app_key;
            params.device_id = _this.device_id;
            params.sdk_version = _classPrivateFieldGet2(_sdkVersion, _this);
            params.sdk_name = _classPrivateFieldGet2(_sdkName, _this);
            params.t = _classPrivateFieldGet2(_deviceIdType, _this);
            params.timestamp = getMsTimestamp();
            var date = new Date();
            params.hour = date.getHours();
            params.dow = date.getDay();
            params.av = _this.app_version;
            params.method = "sc";
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "server_config", _this.url + _classPrivateFieldGet2(_readPath, _this), params, function (err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    return;
                }
                try {
                    var config = JSON.parse(responseText);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, Config fetched successfully:[" + JSON.stringify(config) + "]");
                    if (config) {
                        _classPrivateFieldGet2(_populateServerConfig, _this).call(_this, config);
                    }
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_config", JSON.stringify(config));
                } catch (ex) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "server_config, Had an issue while parsing the response: " + ex);
                }
            }, true, true);
            setTimeout(function () {
                _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
            }, _classPrivateFieldGet2(_SCInterval, _this) * 60 * 60 * 1000);
        });
        /**
         * Populate server configuration with received settings
         * Updates internal server configuration settings based on server response
         * @private
         * @param {Object} mainCache - Server configuration response object
         */
        _classPrivateFieldInitSpec(this, _populateServerConfig, function (mainCache) {
            if (!mainCache || !mainCache.c || _typeof(mainCache.c) !== "object") {
                return;
            }
            var cache = mainCache.c;
            if (cache.hasOwnProperty("networking")) {
                _classPrivateFieldSet2(_SCNetwork, _this, cache.networking);
            }
            if (cache.hasOwnProperty("tracking")) {
                _classPrivateFieldSet2(_SCTrackingAll, _this, cache.tracking);
            }
            if (cache.hasOwnProperty("rqs")) {
                _classPrivateFieldSet2(_SCSizeReqQueue, _this, cache.rqs);
            }
            if (cache.hasOwnProperty("eqs")) {
                _classPrivateFieldSet2(_SCSizeEventBatch, _this, cache.eqs);
            }
            if (cache.hasOwnProperty("sui")) {
                _classPrivateFieldSet2(_SCIntervalSessionUpdate, _this, cache.sui);
            }
            if (cache.hasOwnProperty("czi") && cache.czi > 14) {
                _classPrivateFieldSet2(_SCIntervalContent, _this, cache.czi * 1000);
            }
            if (cache.hasOwnProperty("ecz")) {
                _classPrivateFieldSet2(_SCEnableContent, _this, cache.ecz);
                if (!_classPrivateFieldGet2(_initContentSent, _this) && _classPrivateFieldGet2(_SCEnableContent, _this)) {
                    _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                }
            }
            if (cache.hasOwnProperty("cr")) {
                _classPrivateFieldSet2(_SCEnableConsentRequired, _this, cache.cr);
            }
            if (cache.hasOwnProperty("st")) {
                _classPrivateFieldSet2(_SCTrackingSession, _this, cache.st);
            }
            if (cache.hasOwnProperty("crt")) {
                _classPrivateFieldSet2(_SCTrackingCrashes, _this, cache.crt);
            }
            if (cache.hasOwnProperty("vt")) {
                _classPrivateFieldSet2(_SCTrackingViews, _this, cache.vt);
            }
            if (cache.hasOwnProperty("cet")) {
                _classPrivateFieldSet2(_SCTrackingEvents, _this, cache.cet);
            }
            if (cache.hasOwnProperty("lkl")) {
                _classPrivateFieldSet2(_SCLimitKeyLength, _this, cache.lkl);
            }
            if (cache.hasOwnProperty("lvs")) {
                _classPrivateFieldSet2(_SCLimitValueSize, _this, cache.lvs);
            }
            if (cache.hasOwnProperty("lsv")) {
                _classPrivateFieldSet2(_SCLimitSegmentationValues, _this, cache.lsv);
            }
            if (cache.hasOwnProperty("lbc")) {
                _classPrivateFieldSet2(_SCLimitBreadcrumbCount, _this, cache.lbc);
            }
            if (cache.hasOwnProperty("ltlpt")) {
                _classPrivateFieldSet2(_SCLimitStackTraceLinesPerThread, _this, cache.ltlpt);
            }
            if (cache.hasOwnProperty("ltl")) {
                _classPrivateFieldSet2(_SCLimitStackTraceLineLength, _this, cache.ltl);
            }
            if (cache.hasOwnProperty("scui")) {
                _classPrivateFieldSet2(_SCInterval, _this, Math.max(cache.scui, 4));
            }
            if (cache.hasOwnProperty("lt")) {
                _classPrivateFieldSet2(_SCTrackingLocation, _this, cache.lt);
            }
            // web does not have support for 'dort' parameter
            if (cache.hasOwnProperty("rcz")) {
                _classPrivateFieldSet2(_SCEnableRefreshContentZone, _this, cache.rcz);
            }
            if (cache.hasOwnProperty("bom")) {
                _classPrivateFieldSet2(_SCBackoffMechanismEnabled, _this, cache.bom);
            }
            if (cache.hasOwnProperty("bom_at")) {
                _classPrivateFieldSet2(_SCBackoffAcceptedTimeout, _this, cache.bom_at);
            }
            if (cache.hasOwnProperty("bom_rqp")) {
                _classPrivateFieldSet2(_SCBackoffRQPercentage, _this, cache.bom_rqp);
            }
            if (cache.hasOwnProperty("bom_ra")) {
                _classPrivateFieldSet2(_SCBackoffRequestAge, _this, cache.bom_ra);
            }
            if (cache.hasOwnProperty("bom_d")) {
                _classPrivateFieldSet2(_SCBackoffDuration, _this, cache.bom_d);
            }
            if (cache.hasOwnProperty("eb") && Array.isArray(cache.eb)) {
                _classPrivateFieldSet2(_SCEventBlacklist, _this, cache.eb);
            }
            if (cache.hasOwnProperty("ew") && Array.isArray(cache.ew)) {
                _classPrivateFieldSet2(_SCEventWhitelist, _this, cache.ew);
            }
            if (cache.hasOwnProperty("upb") && Array.isArray(cache.upb)) {
                _classPrivateFieldSet2(_SCUserPropertyBlacklist, _this, cache.upb);
            }
            if (cache.hasOwnProperty("upw") && Array.isArray(cache.upw)) {
                _classPrivateFieldSet2(_SCUserPropertyWhitelist, _this, cache.upw);
            }
            if (cache.hasOwnProperty("sb") && Array.isArray(cache.sb)) {
                _classPrivateFieldSet2(_SCSegmentationBlacklist, _this, cache.sb);
            }
            if (cache.hasOwnProperty("sw") && Array.isArray(cache.sw)) {
                _classPrivateFieldSet2(_SCSegmentationWhitelist, _this, cache.sw);
            }
            if (cache.hasOwnProperty("esb") && cache.esb && _typeof(cache.esb) === "object" && !Array.isArray(cache.esb)) {
                _classPrivateFieldSet2(_SCEventSegmentationBlacklist, _this, cache.esb);
            }
            if (cache.hasOwnProperty("esw") && cache.esw && _typeof(cache.esw) === "object" && !Array.isArray(cache.esw)) {
                _classPrivateFieldSet2(_SCEventSegmentationWhitelist, _this, cache.esw);
            }
            if (cache.hasOwnProperty("jte") && Array.isArray(cache.jte)) {
                _classPrivateFieldSet2(_SCJourneyTriggerEvents, _this, cache.jte);
            }
        });
        /**
         * Initialize the Countly
         * @param {Object} ob - config object
         * @returns 
         */
        _classPrivateFieldInitSpec(this, _initialize, function (ob) {
            _classPrivateFieldSet2(_ignoreReferrers, _this, getConfig("ignore_referrers", ob, []));
            _classPrivateFieldSet2(_failTimeoutAmount, _this, getConfig("fail_timeout", ob, configurationDefaultValues.FAIL_TIMEOUT_AMOUNT));
            _classPrivateFieldSet2(_inactivityTime, _this, getConfig("inactivity_time", ob, configurationDefaultValues.INACTIVITY_TIME));
            _classPrivateFieldSet2(_useSessionCookie, _this, getConfig("use_session_cookie", ob, true));
            _classPrivateFieldSet2(_sessionCookieTimeout, _this, getConfig("session_cookie_timeout", ob, configurationDefaultValues.SESSION_COOKIE_TIMEOUT));
            _classPrivateFieldSet2(_offlineMode, _this, getConfig("offline_mode", ob, false));
            _classPrivateFieldSet2(_sdkName, _this, getConfig("sdk_name", ob, SDK_NAME));
            _classPrivateFieldSet2(_sdkVersion, _this, getConfig("sdk_version", ob, SDK_VERSION));
            _classPrivateFieldSet2(_beatInterval, _this, getConfig("interval", ob, configurationDefaultValues.BEAT_INTERVAL));
            _this.getViewName = getConfig("getViewName", ob, Countly.getViewName);
            _this.getViewUrl = getConfig("getViewUrl", ob, Countly.getViewUrl);
            _this.getSearchQuery = getConfig("getSearchQuery", ob, Countly.getSearchQuery);
            _this.DeviceIdType = Countly.DeviceIdType; // it is Countly device Id type Enums for clients to use
            _this.namespace = getConfig("namespace", ob, "");
            _this.clearStoredId = getConfig("clear_stored_id", ob, false);
            _this.onload = getConfig("onload", ob, []);
            _this.utm = getConfig("utm", ob, {
                source: true,
                medium: true,
                campaign: true,
                term: true,
                content: true
            });
            _this.ignore_prefetch = getConfig("ignore_prefetch", ob, true);
            _this.rcAutoOptinAb = getConfig("rc_automatic_optin_for_ab", ob, true);
            _this.useExplicitRcApi = getConfig("use_explicit_rc_api", ob, false);
            _this.debug = getConfig("debug", ob, false);
            _this.test_mode = getConfig("test_mode", ob, false);
            _this.test_mode_eq = getConfig("test_mode_eq", ob, false);
            _this.metrics = getConfig("metrics", ob, {});
            _this.headers = getConfig("headers", ob, {});
            _this.app_version = getConfig("app_version", ob, "0.0");
            _this.country_code = getConfig("country_code", ob, null);
            _this.city = getConfig("city", ob, null);
            _this.ip_address = getConfig("ip_address", ob, null);
            _this.ignore_bots = getConfig("ignore_bots", ob, true);
            _this.force_post = getConfig("force_post", ob, true);
            _this.remote_config = getConfig("remote_config", ob, false);
            _this.ignore_visitor = getConfig("ignore_visitor", ob, false);
            _this.track_domains = !isBrowser ? undefined : getConfig("track_domains", ob, true);
            _this.storage = getConfig("storage", ob, "default");
            _this.enableOrientationTracking = !isBrowser ? undefined : getConfig("enable_orientation_tracking", ob, true);
            _this.heatmapWhitelist = getConfig("heatmap_whitelist", ob, []);
            _this.contentWhitelist = getConfig("content_whitelist", ob, []);
            _this.salt = getConfig("salt", ob, null);
            _this.hcErrorCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.errorCount) || 0;
            _this.hcWarningCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.warningCount) || 0;
            _this.hcStatusCode = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.statusCode) || -1;
            _this.hcErrorMessage = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.errorMessage) || "";
            _this.hcBackoffCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.backoffCount) || 0;
            _this.hcConsecutiveBackoffCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.consecutiveBackoffCount) || 0;
            _classPrivateFieldSet2(_lastRequestWasBackoff, _this, false); // Track if the previous request resulted in a backoff
            _classPrivateFieldSet2(_crashFilterCallback, _this, getConfig("crash_filter_callback", ob, null));
            if (_this.storage === "cookie") {
                _classPrivateFieldSet2(_lsSupport, _this, false);
            }
            if (!_this.rcAutoOptinAb && !_this.useExplicitRcApi) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, Auto opting is disabled, switching to explicit RC API");
                _this.useExplicitRcApi = true;
            }
            if (!Array.isArray(_classPrivateFieldGet2(_ignoreReferrers, _this))) {
                _classPrivateFieldSet2(_ignoreReferrers, _this, []);
            }
            if (_this.url === "") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initialize, Please provide server URL");
                _this.ignore_visitor = true;
            }
            if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_ignore")) {
                // opted out user
                _this.ignore_visitor = true;
            }
            _classPrivateFieldGet2(_checkIgnore, _this).call(_this);
            if (isBrowser) {
                if (window.name && window.name.indexOf("cly:") === 0) {
                    try {
                        _this.passed_data = JSON.parse(window.name.replace("cly:", ""));
                    } catch (ex) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initialize, Could not parse name: " + window.name + ", error: " + ex);
                    }
                } else if (location.hash && location.hash.indexOf("this.#cly:") === 0) {
                    try {
                        _this.passed_data = JSON.parse(location.hash.replace("this.#cly:", ""));
                    } catch (ex) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initialize, Could not parse hash: " + location.hash + ", error: " + ex);
                    }
                }
            }
            if (Array.isArray(_this.contentWhitelist)) {
                _this.contentWhitelist.push(_this.url);
                _this.contentWhitelist = _this.contentWhitelist.map(function (e) {
                    // remove trailing slashes from the entries
                    return stripTrailingSlash(e);
                });
            }
            if (_this.passed_data && _this.passed_data.app_key && _this.passed_data.app_key === _this.app_key || _this.passed_data && !_this.passed_data.app_key && _classPrivateFieldGet2(_global, _this)) {
                if (_this.passed_data.token && _this.passed_data.purpose) {
                    if (_this.passed_data.token !== _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_old_token")) {
                        _classPrivateFieldGet2(_setToken, _this).call(_this, _this.passed_data.token);
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_old_token", _this.passed_data.token);
                    }
                    var strippedList = [];
                    // if whitelist is provided is an array
                    if (Array.isArray(_this.heatmapWhitelist)) {
                        _this.heatmapWhitelist.push(_this.url);
                        strippedList = _this.heatmapWhitelist.map(function (e) {
                            // remove trailing slashes from the entries
                            return stripTrailingSlash(e);
                        });
                    } else {
                        strippedList = [_this.url];
                    }
                    // if the passed url is in the whitelist proceed
                    if (strippedList.includes(_this.passed_data.url)) {
                        if (_this.passed_data.purpose === "heatmap") {
                            _this.ignore_visitor = true;
                            showLoader();
                            loadJS(_this.passed_data.url + "/views/heatmap.js", hideLoader);
                        }
                    }
                }
            }
            if (_this.ignore_visitor) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, ignore_visitor:[" + _this.ignore_visitor + "], this user will not be tracked");
                return;
            }
            _classPrivateFieldGet2(_migrate, _this).call(_this);
            _classPrivateFieldSet2(_requestQueue, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_queue") || []);
            _classPrivateFieldSet2(_eventQueue, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_event") || []);
            _classPrivateFieldSet2(_remoteConfigs, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_remote_configs") || {});

            // flag that indicates that the offline mode was enabled at the end of the previous app session 
            var tempIdModeWasEnabled = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id") === "[CLY]_temp_id";
            if (_this.clearStoredId) {
                // retrieve stored device ID and type from local storage and use it to flush existing events
                if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id") && !tempIdModeWasEnabled) {
                    _this.device_id = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id");
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, temporarily using the previous device ID to flush existing events");
                    _classPrivateFieldSet2(_deviceIdType, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id_type"));
                    if (!_classPrivateFieldGet2(_deviceIdType, _this)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, No device ID type info from the previous session, falling back to DEVELOPER_SUPPLIED, for event flushing");
                        _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                    }
                    // don't process async queue here, just send the events (most likely async data is for the new user)
                    _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                    // set them back to their initial values
                    _this.device_id = undefined;
                    _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.SDK_GENERATED);
                }
                // then clear the storage so that a new device ID is set again later
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Clearing the device ID storage");
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_id");
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_id_type");
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_session");
                tempIdModeWasEnabled = false;
            }

            // init configuration is printed out here:
            // key values should be printed out as is
            if (_classPrivateFieldGet2(_sdkName, _this) === SDK_NAME && _classPrivateFieldGet2(_sdkVersion, _this) === SDK_VERSION) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, SDK name:[" + _classPrivateFieldGet2(_sdkName, _this) + "], version:[" + _classPrivateFieldGet2(_sdkVersion, _this) + "]");
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, SDK name:[" + _classPrivateFieldGet2(_sdkName, _this) + "], version:[" + _classPrivateFieldGet2(_sdkVersion, _this) + "], default name:[" + SDK_NAME + "] and default version:[" + SDK_VERSION + "]");
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, stored server config:[" + JSON.stringify(_classPrivateFieldGet2(_serverConfigCache, _this)) + "]");
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, app_key:[" + _this.app_key + "], url:[" + _this.url + "]");
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, device_id:[" + getConfig("device_id", ob, undefined) + "]");
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, require_consent is enabled:[" + _classPrivateFieldGet2(_SCEnableConsentRequired, _this) + "]");
            try {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, metric override:[" + JSON.stringify(_this.metrics) + "]");
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, header override:[" + JSON.stringify(_this.headers) + "]");
                // empty array is truthy and so would be printed if provided
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, number of onload callbacks provided:[" + _this.onload.length + "]");
                // if the utm object is different to default utm object print it here
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, utm tags:[" + JSON.stringify(_this.utm) + "]");
                // empty array printed if non provided
                if (_classPrivateFieldGet2(_ignoreReferrers, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, referrers to ignore :[" + JSON.stringify(_classPrivateFieldGet2(_ignoreReferrers, _this)) + "]");
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, salt given:[" + !!_this.salt + "]");
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initialize, Could not stringify some config object values");
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, app_version:[" + _this.app_version + "]");

            // location info printed here
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, provided location info; country_code:[" + _this.country_code + "], city:[" + _this.city + "], ip_address:[" + _this.ip_address + "]");

            // print non vital values only if provided by the developer or differs from the default value
            if (_this.namespace !== "") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, namespace given:[" + _this.namespace + "]");
            }
            if (_this.clearStoredId) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, clearStoredId flag set to:[" + _this.clearStoredId + "]");
            }
            if (_this.ignore_prefetch) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, ignoring pre-fetching and pre-rendering from counting as real website visits :[" + _this.ignore_prefetch + "]");
            }
            // if test mode is enabled warn the user
            if (_this.test_mode) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, test_mode:[" + _this.test_mode + "], request queue won't be processed");
            }
            if (_this.test_mode_eq) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, test_mode_eq:[" + _this.test_mode_eq + "], event queue won't be processed");
            }
            // if test mode is enabled warn the user
            if (_this.heatmapWhitelist) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, heatmap whitelist:[" + JSON.stringify(_this.heatmapWhitelist) + "], these domains will be whitelisted");
            }
            // if storage is se to something other than local storage
            if (_this.storage !== "default") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, storage is set to:[" + _this.storage + "]");
            }
            if (_this.ignore_bots) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, ignore traffic from bots :[" + _this.ignore_bots + "]");
            }
            if (_this.force_post) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, forced post method for all requests:[" + _this.force_post + "]");
            }
            if (_this.remote_config) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, remote_config callback provided:[" + !!_this.remote_config + "]");
            }
            if (typeof _this.rcAutoOptinAb === "boolean") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, automatic RC optin is enabled:[" + _this.rcAutoOptinAb + "]");
            }
            if (!_this.useExplicitRcApi) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, will use legacy RC API. Consider enabling new API during init with use_explicit_rc_api flag");
            }
            if (_this.track_domains) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, tracking domain info:[" + _this.track_domains + "]");
            }
            if (_this.enableOrientationTracking) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, enableOrientationTracking:[" + _this.enableOrientationTracking + "]");
            }
            if (!_classPrivateFieldGet2(_useSessionCookie, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, use_session_cookie is enabled:[" + _classPrivateFieldGet2(_useSessionCookie, _this) + "]");
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, offline_mode:[" + _classPrivateFieldGet2(_offlineMode, _this) + "], user info won't be send to the servers");
            }
            if (_classPrivateFieldGet2(_remoteConfigs, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, stored remote configs:[" + JSON.stringify(_classPrivateFieldGet2(_remoteConfigs, _this)) + "]");
            }
            if (_classPrivateFieldGet2(_SCIntervalContent, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, content_zone_timer_interval:[" + _classPrivateFieldGet2(_SCIntervalContent, _this) + "]");
            }
            // functions, if provided, would be printed as true without revealing their content
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, 'getViewName' callback override provided:[" + (_this.getViewName !== Countly.getViewName) + "]");
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, 'getSearchQuery' callback override provided:[" + (_this.getSearchQuery !== Countly.getSearchQuery) + "]");

            // limits are printed here if they were modified 
            if (_classPrivateFieldGet2(_SCLimitKeyLength, _this) !== configurationDefaultValues.MAX_KEY_LENGTH) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxKeyLength set to:[" + _classPrivateFieldGet2(_SCLimitKeyLength, _this) + "] characters");
            }
            if (_classPrivateFieldGet2(_SCLimitValueSize, _this) !== configurationDefaultValues.MAX_VALUE_SIZE) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxValueSize set to:[" + _classPrivateFieldGet2(_SCLimitValueSize, _this) + "] characters");
            }
            if (_classPrivateFieldGet2(_SCLimitSegmentationValues, _this) !== configurationDefaultValues.MAX_SEGMENTATION_VALUES) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxSegmentationValues set to:[" + _classPrivateFieldGet2(_SCLimitSegmentationValues, _this) + "] key/value pairs");
            }
            if (_classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this) !== configurationDefaultValues.MAX_BREADCRUMB_COUNT) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxBreadcrumbCount for custom logs set to:[" + _classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this) + "] entries");
            }
            if (_classPrivateFieldGet2(_SCLimitStackTraceLinesPerThread, _this) !== configurationDefaultValues.MAX_STACKTRACE_LINES_PER_THREAD) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxStackTraceLinesPerThread set to:[" + _classPrivateFieldGet2(_SCLimitStackTraceLinesPerThread, _this) + "] lines");
            }
            if (_classPrivateFieldGet2(_SCLimitStackTraceLineLength, _this) !== configurationDefaultValues.MAX_STACKTRACE_LINE_LENGTH) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, maxStackTraceLineLength set to:[" + _classPrivateFieldGet2(_SCLimitStackTraceLineLength, _this) + "] characters");
            }
            if (_classPrivateFieldGet2(_beatInterval, _this) !== configurationDefaultValues.BEAT_INTERVAL) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, interval for heartbeats set to:[" + _classPrivateFieldGet2(_beatInterval, _this) + "] milliseconds");
            }
            if (_classPrivateFieldGet2(_SCSizeReqQueue, _this) !== configurationDefaultValues.QUEUE_SIZE) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, queue_size set to:[" + _classPrivateFieldGet2(_SCSizeReqQueue, _this) + "] items max");
            }
            if (_classPrivateFieldGet2(_failTimeoutAmount, _this) !== configurationDefaultValues.FAIL_TIMEOUT_AMOUNT) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, fail_timeout set to:[" + _classPrivateFieldGet2(_failTimeoutAmount, _this) + "] seconds of wait time after a failed connection to server");
            }
            if (_classPrivateFieldGet2(_inactivityTime, _this) !== configurationDefaultValues.INACTIVITY_TIME) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, inactivity_time set to:[" + _classPrivateFieldGet2(_inactivityTime, _this) + "] minutes to consider a user as inactive after no observable action");
            }
            if (_classPrivateFieldGet2(_SCIntervalSessionUpdate, _this) !== configurationDefaultValues.SESSION_UPDATE) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, session_update set to:[" + _classPrivateFieldGet2(_SCIntervalSessionUpdate, _this) + "] seconds to check if extending a session is needed while the user is active");
            }
            if (_classPrivateFieldGet2(_SCSizeEventBatch, _this) !== configurationDefaultValues.MAX_EVENT_BATCH) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, max_events set to:[" + _classPrivateFieldGet2(_SCSizeEventBatch, _this) + "] events to send in one batch");
            }
            if (_classPrivateFieldGet2(_sessionCookieTimeout, _this) !== configurationDefaultValues.SESSION_COOKIE_TIMEOUT) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, session_cookie_timeout set to:[" + _classPrivateFieldGet2(_sessionCookieTimeout, _this) + "] minutes to expire a cookies session");
            }
            var deviceIdParamValue = null;
            var searchQuery = _this.getSearchQuery();
            var hasUTM = false;
            var utms = {};
            if (searchQuery) {
                // remove the '?' character from the beginning if it exists
                if (searchQuery.indexOf('?') === 0) {
                    searchQuery = searchQuery.substring(1);
                }
                var parts = searchQuery.split("&");
                for (var i = 0; i < parts.length; i++) {
                    var nv = parts[i].split("=");
                    if (nv[0] === "cly_id") {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_cmp_id", nv[1]);
                    } else if (nv[0] === "cly_uid") {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_cmp_uid", nv[1]);
                    } else if (nv[0] === "cly_device_id") {
                        deviceIdParamValue = nv[1];
                    } else if ((nv[0] + "").indexOf("utm_") === 0 && _this.utm[nv[0].replace("utm_", "")]) {
                        utms[nv[0].replace("utm_", "")] = nv[1];
                        hasUTM = true;
                    }
                }
            }
            var developerSetDeviceId = getConfig("device_id", ob, undefined);
            if (typeof developerSetDeviceId === "number") {
                // device ID should always be string
                developerSetDeviceId = developerSetDeviceId.toString();
            }

            // check if there wqs stored ID
            if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id") && !tempIdModeWasEnabled) {
                _this.device_id = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id");
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Set the stored device ID");
                _classPrivateFieldSet2(_deviceIdType, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id_type"));
                if (!_classPrivateFieldGet2(_deviceIdType, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, No device ID type info from the previous session, falling back to DEVELOPER_SUPPLIED");
                    // there is a device ID saved but there is no device ID information saved 
                    _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                }
                _classPrivateFieldSet2(_offlineMode, _this, false);
            }
            // if not check if device ID was provided with URL
            else if (deviceIdParamValue !== null) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Device ID set by URL");
                _this.device_id = deviceIdParamValue;
                _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.URL_PROVIDED);
                _classPrivateFieldSet2(_offlineMode, _this, false);
            }
            // if not check if developer provided any ID
            else if (developerSetDeviceId) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Device ID set by developer");
                _this.device_id = developerSetDeviceId;
                if (ob && Object.keys(ob).length) {
                    if (ob.device_id !== undefined) {
                        _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                    }
                } else if (Countly.device_id !== undefined) {
                    _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                }
                _classPrivateFieldSet2(_offlineMode, _this, false);
            }
            // if not check if offline mode is on
            else if (_classPrivateFieldGet2(_offlineMode, _this) || tempIdModeWasEnabled) {
                _this.device_id = "[CLY]_temp_id";
                _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.TEMPORARY_ID);
                if (_classPrivateFieldGet2(_offlineMode, _this) && tempIdModeWasEnabled) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Temp ID set, continuing offline mode from previous app session");
                } else if (_classPrivateFieldGet2(_offlineMode, _this) && !tempIdModeWasEnabled) {
                    // this if we get here then it means either first init we enter offline mode or we cleared the device ID during the init and still user entered the offline mode
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Temp ID set, entering offline mode");
                } else {
                    // no device ID was provided, no offline mode flag was provided, in the previous app session we entered offline mode and now we carry on
                    _classPrivateFieldSet2(_offlineMode, _this, true);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Temp ID set, enabling offline mode");
                }
            }
            // if all fails generate an ID
            else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initialize, Generating the device ID");
                _this.device_id = getConfig("device_id", ob, _classPrivateFieldGet2(_getStoredIdOrGenerateId, _this).call(_this));
                if (ob && Object.keys(ob).length) {
                    if (ob.device_id !== undefined) {
                        _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                    }
                } else if (Countly.device_id !== undefined) {
                    _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                }
            }

            // Store the device ID and device ID type
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", _classPrivateFieldGet2(_deviceIdType, _this));

            // as we have assigned the device ID now we can save the tags
            if (hasUTM) {
                _classPrivateFieldSet2(_freshUTMTags, _this, {});
                for (var tag in _this.utm) {
                    // this.utm is a filter for allowed tags
                    if (utms[tag]) {
                        // utms is the tags that were passed in the URL
                        _this.userData.set("utm_" + tag, utms[tag]);
                        _classPrivateFieldGet2(_freshUTMTags, _this)[tag] = utms[tag];
                    } else {
                        _this.userData.unset("utm_" + tag);
                    }
                }
                _this.userData.save();
            }
            _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
        });
        /**
         * Update consent status and sync with server
         * Handles consent management and sends consent updates to server
         * @private
         */
        _classPrivateFieldInitSpec(this, _updateConsent, function () {
            if (_classPrivateFieldGet2(_consentTimer, _this)) {
                // delay syncing consents
                clearTimeout(_classPrivateFieldGet2(_consentTimer, _this));
                _classPrivateFieldSet2(_consentTimer, _this, null);
            }
            _classPrivateFieldSet2(_consentTimer, _this, setTimeout(function () {
                var consentMessage = {};
                for (var i = 0; i < Countly.features.length; i++) {
                    if (_classPrivateFieldGet2(_consents, _this)[Countly.features[i]].optin === true) {
                        consentMessage[Countly.features[i]] = true;
                    } else {
                        consentMessage[Countly.features[i]] = false;
                    }
                }
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    consent: JSON.stringify(consentMessage)
                });
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Consent update request has been sent to the queue.");
            }, 1000));
        });
        /**
         * WARNING!!!
         * Should be used only for testing purposes!!!
         * 
         * Resets Countly to its initial state (used mainly to wipe the queues in memory).
         * Calling this will result in a loss of data
         */
        _defineProperty(this, "halt", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "halt, Resetting Countly");
            Countly.i = undefined;
            Countly.q = [];
            Countly.noHeartBeat = undefined;
            _classPrivateFieldSet2(_global, _this, !Countly.i);
            _classPrivateFieldSet2(_sessionStarted, _this, false);
            _classPrivateFieldSet2(_apiPath, _this, "/i");
            _classPrivateFieldSet2(_readPath, _this, "/o/sdk");
            _classPrivateFieldSet2(_beatInterval, _this, 500);
            _classPrivateFieldSet2(_SCSizeReqQueue, _this, 1000);
            _classPrivateFieldSet2(_requestQueue, _this, []);
            _classPrivateFieldSet2(_eventQueue, _this, []);
            _classPrivateFieldSet2(_remoteConfigs, _this, {});
            _classPrivateFieldSet2(_crashLogs, _this, []);
            _classPrivateFieldSet2(_timedEvents, _this, {});
            _classPrivateFieldSet2(_ignoreReferrers, _this, []);
            _classPrivateFieldSet2(_crashSegments, _this, null);
            _classPrivateFieldSet2(_autoExtend, _this, true);
            _classPrivateFieldSet2(_storedDuration, _this, 0);
            _classPrivateFieldSet2(_lastView, _this, null);
            _classPrivateFieldSet2(_lastViewTime, _this, 0);
            _classPrivateFieldSet2(_lastViewStoredDuration, _this, 0);
            _classPrivateFieldSet2(_failTimeout, _this, 0);
            _classPrivateFieldSet2(_failTimeoutAmount, _this, 60);
            _classPrivateFieldSet2(_inactivityTime, _this, 20);
            _classPrivateFieldSet2(_inactivityCounter, _this, 0);
            _classPrivateFieldSet2(_SCIntervalSessionUpdate, _this, 60);
            _classPrivateFieldSet2(_SCSizeEventBatch, _this, 100);
            _classPrivateFieldSet2(_useSessionCookie, _this, true);
            _classPrivateFieldSet2(_sessionCookieTimeout, _this, 30);
            _classPrivateFieldSet2(_readyToProcess, _this, true);
            _classPrivateFieldSet2(_hasPulse, _this, false);
            _classPrivateFieldSet2(_offlineMode, _this, false);
            _classPrivateFieldSet2(_lastParams, _this, {});
            _classPrivateFieldSet2(_trackTime, _this, true);
            _classPrivateFieldSet2(_startTime, _this, getTimestamp());
            _classPrivateFieldSet2(_lsSupport, _this, true);
            _classPrivateFieldSet2(_firstView, _this, null);
            _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.SDK_GENERATED);
            _classPrivateFieldSet2(_isScrollRegistryOpen, _this, false);
            _classPrivateFieldSet2(_scrollRegistryTopPosition, _this, 0);
            _classPrivateFieldSet2(_trackingScrolls, _this, false);
            _classPrivateFieldSet2(_currentViewId, _this, null);
            _classPrivateFieldSet2(_previousViewId, _this, null);
            _classPrivateFieldSet2(_freshUTMTags, _this, null);
            _classPrivateFieldSet2(_generatedRequests, _this, []);
            try {
                localStorage.setItem("cly_testLocal", true);
                // clean up test
                localStorage.removeItem("cly_testLocal");
                localStorage.removeItem("cly_old_token");
                localStorage.removeItem("cly_cmp_id");
                localStorage.removeItem("cly_cmp_uid");
                localStorage.removeItem("cly_id");
                localStorage.removeItem("cly_id_type");
                localStorage.removeItem("cly_queue");
                localStorage.removeItem("cly_session");
                localStorage.removeItem("cly_remote_configs");
                localStorage.removeItem("cly_event");
                localStorage.removeItem("cly_ignore");
                localStorage.removeItem("cly_fb_widgets");
                localStorage.removeItem("cly_token");
                localStorage.removeItem("cly_hc_error_count");
                localStorage.removeItem("cly_hc_warning_count");
                localStorage.removeItem("cly_hc_status_code");
                localStorage.removeItem("cly_hc_error_message");
                localStorage.removeItem("cly_hc_backoff_count");
                localStorage.removeItem("cly_hc_consecutive_backoff_count");
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "halt, Local storage test failed, will fallback to cookies");
                _classPrivateFieldSet2(_lsSupport, _this, false);
            }
            Countly.features = [featureEnums.SESSIONS, featureEnums.EVENTS, featureEnums.VIEWS, featureEnums.SCROLLS, featureEnums.CLICKS, featureEnums.FORMS, featureEnums.CRASHES, featureEnums.ATTRIBUTION, featureEnums.USERS, featureEnums.STAR_RATING, featureEnums.LOCATION, featureEnums.APM, featureEnums.FEEDBACK, featureEnums.REMOTE_CONFIG];

            // CONSENTS
            _classPrivateFieldSet2(_consents, _this, {});
            for (var a = 0; a < Countly.features.length; a++) {
                _classPrivateFieldGet2(_consents, _this)[Countly.features[a]] = {};
            }
            _this.app_key = undefined;
            _this.device_id = undefined;
            _this.onload = undefined;
            _this.utm = undefined;
            _this.ignore_prefetch = undefined;
            _this.debug = undefined;
            _this.test_mode = undefined;
            _this.test_mode_eq = undefined;
            _this.metrics = undefined;
            _this.headers = undefined;
            _this.url = undefined;
            _this.app_version = undefined;
            _this.country_code = undefined;
            _this.city = undefined;
            _this.ip_address = undefined;
            _this.ignore_bots = undefined;
            _this.force_post = undefined;
            _this.rcAutoOptinAb = undefined;
            _this.useExplicitRcApi = undefined;
            _this.remote_config = undefined;
            _this.ignore_visitor = undefined;
            _classPrivateFieldSet2(_SCEnableConsentRequired, _this, undefined);
            _this.track_domains = undefined;
            _this.storage = undefined;
            _this.enableOrientationTracking = undefined;
            _this.salt = undefined;
            _classPrivateFieldSet2(_SCLimitKeyLength, _this, undefined);
            _classPrivateFieldSet2(_SCLimitValueSize, _this, undefined);
            _classPrivateFieldSet2(_SCLimitSegmentationValues, _this, undefined);
            _classPrivateFieldSet2(_SCLimitBreadcrumbCount, _this, undefined);
            _classPrivateFieldSet2(_SCLimitStackTraceLinesPerThread, _this, undefined);
            _classPrivateFieldSet2(_SCLimitStackTraceLineLength, _this, undefined);
            _classPrivateFieldSet2(_fakeRequestHandler, _this, undefined);
            _classPrivateFieldSet2(_journeyTriggerInProgress, _this, undefined);
            _classPrivateFieldSet2(_journeyTriggerPending, _this, undefined);
            _classPrivateFieldSet2(_journeyPendingEventIds, _this, undefined);
        });
        /**
         * Returns the SDK version string currently in use
         * @returns {string} sdk version
         */
        _defineProperty(this, "sdk_version", function () {
            return _classPrivateFieldGet2(_sdkVersion, _this);
        });
        /**
         * Returns the SDK name string currently in use
         * @returns {string} sdk name
         */
        _defineProperty(this, "sdk_name", function () {
            return _classPrivateFieldGet2(_sdkName, _this);
        });
        /**
        * Modify feature groups for consent management. Allows you to group multiple features under one feature group
        * @param {object} features - object to define feature name as key and core features as value
        * @example <caption>Adding all features under one group</caption>
        * Countly.group_features({all:["sessions","events","views","scrolls","clicks","forms","crashes","attribution","users"]});
        * //After this call Countly.add_consent("all") to allow all features
        @example <caption>Grouping features</caption>
        * Countly.group_features({
        *    activity:["sessions","events","views"],
        *    interaction:["scrolls","clicks","forms"]
        * });
        * //After this call Countly.add_consent("activity") to allow "sessions","events","views"
        * //or call Countly.add_consent("interaction") to allow "scrolls","clicks","forms"
        * //or call Countly.add_consent("crashes") to allow some separate feature
        */
        _defineProperty(this, "group_features", function (features) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "group_features, Grouping features");
            if (features) {
                for (var i in features) {
                    if (!_classPrivateFieldGet2(_consents, _this)[i]) {
                        if (typeof features[i] === "string") {
                            _classPrivateFieldGet2(_consents, _this)[i] = {
                                features: [features[i]]
                            };
                        } else if (features[i] && Array.isArray(features[i]) && features[i].length) {
                            _classPrivateFieldGet2(_consents, _this)[i] = {
                                features: features[i]
                            };
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "group_features, Incorrect feature list for [" + i + "] value: [" + features[i] + "]");
                        }
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "group_features, Feature name [" + i + "] is already reserved");
                    }
                }
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "group_features, Incorrect features:[" + features + "]");
            }
        });
        /**
        * Check if consent is given for specific feature (either core feature of from custom feature group)
        * @param {string} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or custom provided through {@link Countly.group_features}
        * @returns {Boolean} true if consent was given for the feature or false if it was not
        */
        _defineProperty(this, "check_consent", function (feature) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_consent, Checking if consent is given for specific feature:[" + feature + "]");
            if (!_classPrivateFieldGet2(_SCEnableConsentRequired, _this)) {
                // we don't need to have specific consents
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_consent, require_consent is off, no consent is necessary");
                return true;
            }
            if (_classPrivateFieldGet2(_consents, _this)[feature]) {
                return !!(_classPrivateFieldGet2(_consents, _this)[feature] && _classPrivateFieldGet2(_consents, _this)[feature].optin);
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "check_consent, No feature available for [" + feature + "]");
            return false;
        });
        /**
        * Check and return the current device id type
        * @returns {number} a number that indicates the device id type
        */
        _defineProperty(this, "get_device_id_type", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_device_id_type, Retrieving the current device id type.[" + _classPrivateFieldGet2(_deviceIdType, _this) + "]");
            var type;
            switch (_classPrivateFieldGet2(_deviceIdType, _this)) {
                case DeviceIdTypeInternalEnums.SDK_GENERATED:
                    type = _this.DeviceIdType.SDK_GENERATED;
                    break;
                case DeviceIdTypeInternalEnums.URL_PROVIDED:
                case DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED:
                    type = _this.DeviceIdType.DEVELOPER_SUPPLIED;
                    break;
                case DeviceIdTypeInternalEnums.TEMPORARY_ID:
                    type = _this.DeviceIdType.TEMPORARY_ID;
                    break;
                default:
                    type = -1;
                    break;
            }
            return type;
        });
        /**
        * Gets the current device id (of the CountlyClass instance)
        * @returns {string} device id
        */
        _defineProperty(this, "get_device_id", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "get_device_id, Retrieving the device id: [" + _this.device_id + "]");
            return _this.device_id;
        });
        /**
        * Check if any consent is given, for some cases, when crucial parts are like device_id are needed for any request
        * @returns {Boolean} true is has any consent given, false if no consents given
        */
        _defineProperty(this, "check_any_consent", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_any_consent, Checking if any consent is given");
            if (!_classPrivateFieldGet2(_SCEnableConsentRequired, _this)) {
                // we don't need to have consents
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_any_consent, require_consent is off, no consent is necessary");
                return true;
            }
            for (var i in _classPrivateFieldGet2(_consents, _this)) {
                if (_classPrivateFieldGet2(_consents, _this)[i] && _classPrivateFieldGet2(_consents, _this)[i].optin) {
                    return true;
                }
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "check_any_consent, No consents given");
            return false;
        });
        /**
        * Add consent for specific feature, meaning, user allowed to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        */
        _defineProperty(this, "add_consent", function (feature) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "add_consent, Adding consent for [" + feature + "]");
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    _this.add_consent(feature[i]);
                }
            } else if (_classPrivateFieldGet2(_consents, _this)[feature]) {
                if (_classPrivateFieldGet2(_consents, _this)[feature].features) {
                    _classPrivateFieldGet2(_consents, _this)[feature].optin = true;
                    // this is added group, let's iterate through sub features
                    _this.add_consent(_classPrivateFieldGet2(_consents, _this)[feature].features);
                } else {
                    // this is core feature
                    if (_classPrivateFieldGet2(_consents, _this)[feature].optin !== true) {
                        _classPrivateFieldGet2(_consents, _this)[feature].optin = true;
                        _classPrivateFieldGet2(_updateConsent, _this).call(_this);
                        setTimeout(function () {
                            if (feature === featureEnums.SESSIONS && _classPrivateFieldGet2(_lastParams, _this).begin_session) {
                                _this.begin_session.apply(_this, _classPrivateFieldGet2(_lastParams, _this).begin_session);
                                _classPrivateFieldGet2(_lastParams, _this).begin_session = null;
                            } else if (feature === featureEnums.VIEWS && _classPrivateFieldGet2(_lastParams, _this).track_pageview) {
                                _classPrivateFieldSet2(_lastView, _this, null);
                                _this.track_pageview.apply(_this, _classPrivateFieldGet2(_lastParams, _this).track_pageview);
                                _classPrivateFieldGet2(_lastParams, _this).track_pageview = null;
                            }
                        }, 1);
                    }
                }
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "add_consent, No feature available for [" + feature + "]");
            }
        });
        /**
        * Remove consent for specific feature, meaning, user opted out to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        */
        _defineProperty(this, "remove_consent", function (feature) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "remove_consent, Removing consent for [" + feature + "]");
            _this.remove_consent_internal(feature, true);
        });
        /**
        * Remove consent for specific feature, meaning, user opted out to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        * @param {Boolean} enforceConsentUpdate - regulates if a request will be sent to the server or not. If true, removing consents will send a request to the server and if false, consents will be removed without a request 
        */
        _defineProperty(this, "remove_consent_internal", function (feature, enforceConsentUpdate) {
            // if true updateConsent will execute when possible
            enforceConsentUpdate = enforceConsentUpdate || false;
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    _this.remove_consent_internal(feature[i], enforceConsentUpdate);
                }
            } else if (_classPrivateFieldGet2(_consents, _this)[feature]) {
                if (_classPrivateFieldGet2(_consents, _this)[feature].features) {
                    // this is added group, let's iterate through sub features
                    _this.remove_consent_internal(_classPrivateFieldGet2(_consents, _this)[feature].features, enforceConsentUpdate);
                } else {
                    _classPrivateFieldGet2(_consents, _this)[feature].optin = false;
                    // this is core feature
                    if (enforceConsentUpdate && _classPrivateFieldGet2(_consents, _this)[feature].optin !== false) {
                        _classPrivateFieldGet2(_updateConsent, _this).call(_this);
                    }
                }
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "remove_consent, No feature available for [" + feature + "]");
            }
        });
        _defineProperty(this, "enable_offline_mode", function () {
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_offline_mode, Countly is already in offline mode.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "enable_offline_mode, Enabling offline mode");
            // clear consents
            _this.remove_consent_internal(Countly.features, false);
            _classPrivateFieldSet2(_offlineMode, _this, true);
            _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
            _this.device_id = "[CLY]_temp_id";
            _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.TEMPORARY_ID);
        });
        _defineProperty(this, "disable_offline_mode", function (device_id) {
            if (!_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "disable_offline_mode, Countly was not in offline mode.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "disable_offline_mode, Disabling offline mode");
            _classPrivateFieldSet2(_offlineMode, _this, false);
            if (device_id && _this.device_id !== device_id) {
                _this.device_id = device_id;
                _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "disable_offline_mode, Changing id to: " + _this.device_id);
            } else {
                _this.device_id = _classPrivateFieldGet2(_getStoredIdOrGenerateId, _this).call(_this);
                if (_this.device_id === "[CLY]_temp_id") {
                    _this.device_id = generateUUID();
                }
                if (_this.device_id !== _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id")) {
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", DeviceIdTypeInternalEnums.SDK_GENERATED);
                }
            }
            var needResync = false;
            if (_classPrivateFieldGet2(_requestQueue, _this).length > 0) {
                for (var i = 0; i < _classPrivateFieldGet2(_requestQueue, _this).length; i++) {
                    if (_classPrivateFieldGet2(_requestQueue, _this)[i].device_id === "[CLY]_temp_id") {
                        _classPrivateFieldGet2(_requestQueue, _this)[i].device_id = _this.device_id;
                        _classPrivateFieldGet2(_requestQueue, _this)[i].t = _classPrivateFieldGet2(_deviceIdType, _this);
                        needResync = true;
                    }
                }
            }
            if (needResync) {
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this), true);
            }
            if (_classPrivateFieldGet2(_shouldSendHC, _this)) {
                _classPrivateFieldGet2(_HealthCheck, _this).sendInstantHCRequest();
                _classPrivateFieldSet2(_shouldSendHC, _this, false);
            }
            _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
            if (_classPrivateFieldGet2(_SCEnableContent, _this)) {
                _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                _classPrivateFieldSet2(_initContentSent, _this, true);
            }
        });
        /**
        * Start session
        * @param {boolean} noHeartBeat - true if you don't want to use internal heartbeat to manage session
        * @param {bool} force - force begin session request even if session cookie is enabled
        */
        _defineProperty(this, "begin_session", function (noHeartBeat, force) {
            if (!_classPrivateFieldGet2(_SCTrackingSession, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "begin_session, Session tracking is disabled by server config");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "begin_session, Starting the session. There was an ongoing session: [" + _classPrivateFieldGet2(_sessionStarted, _this) + "]");
            if (noHeartBeat) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "begin_session, Heartbeats are disabled");
            }
            if (force) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "begin_session, Session starts irrespective of session cookie");
            }
            if (_this.check_consent(featureEnums.SESSIONS)) {
                if (!_classPrivateFieldGet2(_sessionStarted, _this)) {
                    if (_this.enableOrientationTracking) {
                        // report orientation
                        _classPrivateFieldGet2(_report_orientation, _this).call(_this);
                        var orientationTimeout;
                        add_event_listener(window, "resize", function () {
                            clearTimeout(orientationTimeout);
                            orientationTimeout = setTimeout(function () {
                                _classPrivateFieldGet2(_report_orientation, _this).call(_this);
                            }, 200);
                        });
                    }
                    _classPrivateFieldSet2(_lastBeat, _this, getTimestamp());
                    _classPrivateFieldSet2(_sessionStarted, _this, true);
                    _classPrivateFieldSet2(_autoExtend, _this, !noHeartBeat);
                    var expire = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_session");
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "begin_session, Session state, forced: [" + force + "], useSessionCookie: [" + _classPrivateFieldGet2(_useSessionCookie, _this) + "], seconds to expire: [" + (expire - _classPrivateFieldGet2(_lastBeat, _this)) + "], expired: [" + (parseInt(expire) <= getTimestamp()) + "] ");
                    if (force || !_classPrivateFieldGet2(_useSessionCookie, _this) || !expire || parseInt(expire) <= getTimestamp()) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "begin_session, Session started");
                        if (_classPrivateFieldGet2(_firstView, _this) === null) {
                            _classPrivateFieldSet2(_firstView, _this, true);
                        }
                        var req = {};
                        req.begin_session = 1;
                        req.metrics = JSON.stringify(_classPrivateFieldGet2(_getMetrics, _this).call(_this));
                        _this.userData.save(true); // ensure user data is saved before session start
                        _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, req);
                    }
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_session", getTimestamp() + _classPrivateFieldGet2(_sessionCookieTimeout, _this) * 60);
                }
            } else {
                _classPrivateFieldGet2(_lastParams, _this).begin_session = [noHeartBeat, force];
            }
        });
        /**
        * Report session duration
        * @param {int} sec - amount of seconds to report for current session
        */
        _defineProperty(this, "session_duration", function (sec) {
            if (!_classPrivateFieldGet2(_SCTrackingSession, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "session_duration, Session tracking is disabled by server config");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "session_duration, Reporting session duration: [" + sec + "]");
            if (!_this.check_consent(featureEnums.SESSIONS)) {
                return;
            }
            if (!_classPrivateFieldGet2(_sessionStarted, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "session_duration, No session was started");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "session_duration, Session extended: [" + sec + "]");
            _this.userData.save(true); // ensure user data is saved before session update
            _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                session_duration: sec
            });
            _classPrivateFieldGet2(_extendSession, _this).call(_this);
        });
        /**
        * End current session
        * @param {int} sec - amount of seconds to report for current session, before ending it
        * @param {bool} force - force end session request even if session cookie is enabled
        */
        _defineProperty(this, "end_session", function (sec, force) {
            if (!_classPrivateFieldGet2(_SCTrackingSession, _this) && !force) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "end_session, Session tracking is disabled by server config");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "end_session, Ending the current session. There was an on going session:[" + _classPrivateFieldGet2(_sessionStarted, _this) + "]");
            if (_this.check_consent(featureEnums.SESSIONS)) {
                if (_classPrivateFieldGet2(_sessionStarted, _this)) {
                    sec = sec || getTimestamp() - _classPrivateFieldGet2(_lastBeat, _this);
                    _classPrivateFieldGet2(_reportViewDuration, _this).call(_this);
                    if (!_classPrivateFieldGet2(_useSessionCookie, _this) || force) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "end_session, Session ended");
                        _this.userData.save(true); // ensure user data is saved before session end
                        _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                            end_session: 1,
                            session_duration: sec
                        });
                    } else {
                        _this.session_duration(sec);
                    }
                    _classPrivateFieldSet2(_sessionStarted, _this, false);
                }
            }
        });
        /**
        * Changes the current device ID according to the device ID type (the preffered method)
        * @param {string} newId - new user/device ID to use. Must be a non-empty string value. Invalid values (like null, empty string or undefined) will be rejected
        * */
        _defineProperty(this, "set_id", function (newId) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "set_id, Changing the device ID to:[" + newId + "]");
            if (newId == null || newId === "") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "set_id, The provided device is not a valid ID");
                return;
            }
            if (_classPrivateFieldGet2(_deviceIdType, _this) === DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED) {
                /*change ID without merge as current ID is Dev supplied, so not first login*/
                _this.change_id(newId, false);
            } else {
                /*change ID with merge as current ID is not Dev supplied*/
                _this.change_id(newId, true);
            }
        });
        /**
        * Change current user/device id (use set_id instead if you are not sure about the merge operation)
        * @param {string} newId - new user/device ID to use. Must be a non-empty string value. Invalid values (like null, empty string or undefined) will be rejected
        * @param {boolean} merge - move data from old ID to new ID on server
        * */
        _defineProperty(this, "change_id", function (newId, merge) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "change_id, Changing the device ID to: [" + newId + "] with merge:[" + merge + "]");
            if (!newId || typeof newId !== "string" || newId.length === 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "change_id, The provided device ID is not a valid ID");
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "change_id, Offline mode was on, initiating disabling sequence instead.");
                _this.disable_offline_mode(newId);
                return;
            }
            // eqeq is used here since we want to catch number to string checks too. type conversion might happen at a new init
            // eslint-disable-next-line eqeqeq
            if (_this.device_id == newId) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "change_id, Provided device ID is equal to the current device ID. Aborting.");
                return;
            }
            if (!merge) {
                // process async queue before sending events
                _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                // empty event queue
                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                // end current session
                _this.end_session(null, true);
                // clear timed events
                _classPrivateFieldSet2(_timedEvents, _this, {});
                // clear all consents
                _this.remove_consent_internal(Countly.features, false);
            }
            var oldId = _this.device_id;
            _this.device_id = newId;
            _this.device_id = _this.device_id;
            _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "change_id, Changing ID from:[" + oldId + "] to [" + newId + "]");
            if (merge) {
                // no consent check here since 21.11.0
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    old_device_id: oldId
                });
            } else {
                // start new session for new ID TODO: check this when no session tracking is enabled
                _this.begin_session(!_classPrivateFieldGet2(_autoExtend, _this), true);
            }
            // if init time remote config was enabled with a callback function, remove currently stored remote configs and fetch remote config again
            if (_this.remote_config) {
                _classPrivateFieldSet2(_remoteConfigs, _this, {});
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_remote_configs", _classPrivateFieldGet2(_remoteConfigs, _this));
                _this.fetch_remote_config(_this.remote_config);
            }
        });
        /**
        * Report custom event
        * @param {Object} event - Countly {@link Event} object
        * @param {string} event.key - name or id of the event
        * @param {number} [event.count=1] - how many times did event occur
        * @param {number=} event.sum - sum to report with event (if any)
        * @param {number=} event.dur - duration to report with event (if any)
        * @param {Object=} event.segmentation - object with segments key /values
        * */
        _defineProperty(this, "add_event", function (event) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "add_event, Adding event: ", event);
            // initially no consent is given
            var respectiveConsent = false;
            switch (event.key) {
                case internalEventKeyEnums.NPS:
                    respectiveConsent = _this.check_consent(featureEnums.FEEDBACK);
                    break;
                case internalEventKeyEnums.SURVEY:
                    respectiveConsent = _this.check_consent(featureEnums.FEEDBACK);
                    break;
                case internalEventKeyEnums.STAR_RATING:
                    respectiveConsent = _this.check_consent(featureEnums.STAR_RATING);
                    break;
                case internalEventKeyEnums.VIEW:
                    respectiveConsent = _this.check_consent(featureEnums.VIEWS);
                    break;
                case internalEventKeyEnums.ORIENTATION:
                    respectiveConsent = _this.check_consent(featureEnums.USERS);
                    break;
                case internalEventKeyEnums.ACTION:
                    respectiveConsent = _this.check_consent(featureEnums.CLICKS) || _this.check_consent(featureEnums.SCROLLS);
                    break;
                default:
                    respectiveConsent = _classPrivateFieldGet2(_SCTrackingEvents, _this) ? _this.check_consent(featureEnums.EVENTS) : false;
            }
            // if consent is given adds event to the queue
            if (respectiveConsent) {
                _classPrivateFieldGet2(_add_cly_events, _this).call(_this, event);
            }
        });
        /**
         * Attempt to send stored requests
         * 
         */
        _defineProperty(this, "attempt_to_send_stored_requests", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "attemptToSendStoredRequests, Attempting to send stored requests");
            _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
            _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
        });
        /**
         * FOR TESTING PURPOSES ONLY
         * Set test mode for request queue
         * @param {Boolean} value 
         */
        _defineProperty(this, "test_mode_rq", function (value) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "test_mode_rq, Setting test mode to: [" + value + "]");
            _this.test_mode = value;
        });
        /**
         *  Add events to event queue
         *  @memberof Countly._internals
         *  @param {Event} event - countly event
         *  @param {String} eventIdOverride - countly event ID
         */
        _classPrivateFieldInitSpec(this, _add_cly_events, function (event, eventIdOverride) {
            // ignore bots
            if (_this.ignore_visitor || !_classPrivateFieldGet2(_SCTrackingAll, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "Not adding the event. Tracking is disabled by the server config:[" + !_classPrivateFieldGet2(_SCTrackingAll, _this) + "] or ignore_visitor is:[" + _this.ignore_visitor + "]");
                return;
            }
            if (!event.key) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Adding event failed. Event must have a key property");
                return;
            }
            if (!_classPrivateFieldGet2(_isProcessingAsyncFromUserDataSave, _this)) {
                _this.userData.save(true); // ensure cached user data is saved before adding event
            }
            if (!event.count) {
                event.count = 1;
            }
            if (!_classPrivateFieldGet2(_isEventAllowedByBehaviorSettings, _this).call(_this, event.key)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "add_cly_event, Event was filtered out by behavior settings: [" + event.key + "]");
                return;
            }
            var initialKey = event.key;
            // we omit the internal event keys from truncation. TODO: This is not perfect as it would omit a key that includes an internal event key and more too. But that possibility seems negligible. 
            if (!internalEventKeyEnumsArray.includes(event.key)) {
                event.key = truncateSingleValue(event.key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "add_cly_event", _classPrivateFieldGet2(_log, _this));
            }
            event.segmentation = _classPrivateFieldGet2(_filterSegmentationByBehaviorSettings, _this).call(_this, event.key, event.segmentation);
            event.segmentation = truncateObject(event.segmentation, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "add_cly_event", _classPrivateFieldGet2(_log, _this));
            var props = ["key", "count", "sum", "dur", "segmentation"];
            var e = createNewObjectFromProperties(event, props);
            e.timestamp = getMsTimestamp();
            var date = new Date();
            e.hour = date.getHours();
            e.dow = date.getDay();
            e.id = eventIdOverride || secureRandom();
            if (e.key === internalEventKeyEnums.VIEW) {
                e.pvid = _classPrivateFieldGet2(_previousViewId, _this) || "";
            } else {
                e.cvid = _classPrivateFieldGet2(_currentViewId, _this) || "";
            }
            _classPrivateFieldGet2(_eventQueue, _this).push(e);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", _classPrivateFieldGet2(_eventQueue, _this));
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "With event ID: [" + e.id + "], successfully adding the last event:", e);
            _classPrivateFieldGet2(_handleJourneyTrigger, _this).call(_this, initialKey, e.id);
        });
        /**
         * 
         * @param {String} eventKey - Event key to filter for
         * @returns {Boolean} true if event is allowed, false if it is blocked
         */
        _classPrivateFieldInitSpec(this, _isEventAllowedByBehaviorSettings, function (eventKey) {
            if (_classPrivateFieldGet2(_SCEventBlacklist, _this) && _classPrivateFieldGet2(_SCEventBlacklist, _this).length > 0) {
                return _classPrivateFieldGet2(_SCEventBlacklist, _this).indexOf(eventKey) === -1;
            }
            if (_classPrivateFieldGet2(_SCEventWhitelist, _this) && _classPrivateFieldGet2(_SCEventWhitelist, _this).length > 0) {
                return _classPrivateFieldGet2(_SCEventWhitelist, _this).indexOf(eventKey) !== -1;
            }
            return true;
        });
        /**
         * Filter segmentation object by behavior settings
         * 
         * @param {String} eventKey - Event key to filter segmentation for
         * @param {Object} segmentation - segmentation object to filter
         * @returns {Object} filtered segmentation object
         */
        _classPrivateFieldInitSpec(this, _filterSegmentationByBehaviorSettings, function (eventKey, segmentation) {
            if (!segmentation || _typeof(segmentation) !== "object") {
                return segmentation;
            }
            var filteredSegmentation = {};
            for (var key in segmentation) {
                if (Object.prototype.hasOwnProperty.call(segmentation, key)) {
                    filteredSegmentation[key] = segmentation[key];
                }
            }

            // global segmentation filtering
            if (_classPrivateFieldGet2(_SCSegmentationBlacklist, _this) && _classPrivateFieldGet2(_SCSegmentationBlacklist, _this).length > 0) {
                _classPrivateFieldGet2(_SCSegmentationBlacklist, _this).forEach(function (blockedKey) {
                    delete filteredSegmentation[blockedKey];
                });
            } else if (_classPrivateFieldGet2(_SCSegmentationWhitelist, _this) && _classPrivateFieldGet2(_SCSegmentationWhitelist, _this).length > 0) {
                for (var segKey in filteredSegmentation) {
                    if (Object.prototype.hasOwnProperty.call(filteredSegmentation, segKey) && _classPrivateFieldGet2(_SCSegmentationWhitelist, _this).indexOf(segKey) === -1) {
                        delete filteredSegmentation[segKey];
                    }
                }
            }

            // specific event segmentation filtering
            var specificBlacklist = _classPrivateFieldGet2(_SCEventSegmentationBlacklist, _this)[eventKey];
            if (Array.isArray(specificBlacklist) && specificBlacklist.length > 0) {
                specificBlacklist.forEach(function (blockedSegKey) {
                    delete filteredSegmentation[blockedSegKey];
                });
            } else {
                var specificWhitelist = _classPrivateFieldGet2(_SCEventSegmentationWhitelist, _this)[eventKey];
                if (Array.isArray(specificWhitelist) && specificWhitelist.length > 0) {
                    for (var specificSeg in filteredSegmentation) {
                        if (Object.prototype.hasOwnProperty.call(filteredSegmentation, specificSeg) && specificWhitelist.indexOf(specificSeg) === -1) {
                            delete filteredSegmentation[specificSeg];
                        }
                    }
                }
            }
            return filteredSegmentation;
        });
        /**
         *
         * @param {String} key - User property key to check
         * @returns {Boolean} true if user property is allowed, false if it is blocked
         */
        _classPrivateFieldInitSpec(this, _isUserPropertyAllowed, function (key) {
            if (_classPrivateFieldGet2(_SCUserPropertyBlacklist, _this) && _classPrivateFieldGet2(_SCUserPropertyBlacklist, _this).length > 0) {
                return _classPrivateFieldGet2(_SCUserPropertyBlacklist, _this).indexOf(key) === -1;
            }
            if (_classPrivateFieldGet2(_SCUserPropertyWhitelist, _this) && _classPrivateFieldGet2(_SCUserPropertyWhitelist, _this).length > 0) {
                return _classPrivateFieldGet2(_SCUserPropertyWhitelist, _this).indexOf(key) !== -1;
            }
            return true;
        });
        /**
         *
         * @param {Object} customProps - Custom user properties to filter
         * @returns {Object} filtered custom user properties
         */
        _classPrivateFieldInitSpec(this, _filterUserCustomProperties, function (customProps) {
            if (!customProps || _typeof(customProps) !== "object") {
                return customProps;
            }
            var filtered = {};
            for (var key in customProps) {
                if (!Object.prototype.hasOwnProperty.call(customProps, key)) {
                    continue;
                }
                if (!_classPrivateFieldGet2(_isUserPropertyAllowed, _this).call(_this, key)) {
                    continue;
                }
                filtered[key] = customProps[key];
            }
            return filtered;
        });
        /**
         * Handle journey trigger event
         * @param {String} eventKey - Event key to check for journey trigger
         */
        _classPrivateFieldInitSpec(this, _handleJourneyTrigger, function (eventKey, eventId) {
            if (!Array.isArray(_classPrivateFieldGet2(_SCJourneyTriggerEvents, _this)) || _classPrivateFieldGet2(_SCJourneyTriggerEvents, _this).length === 0) {
                return;
            }
            if (_classPrivateFieldGet2(_SCJourneyTriggerEvents, _this).indexOf(eventKey) === -1) {
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Matched journey trigger event: [" + eventKey + "]");
            _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
            _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
            if (eventId) {
                _classPrivateFieldGet2(_journeyPendingEventIds, _this).add(eventId);
            }

            // If already processing, mark as pending to re-trigger after current processing completes
            if (_classPrivateFieldGet2(_journeyTriggerInProgress, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Already processing, marking as pending");
                _classPrivateFieldSet2(_journeyTriggerPending, _this, true);
                return;
            }
            _classPrivateFieldGet2(_processJourneyTriggerQueueAndContent, _this).call(_this);
        });
        /**
         * Process journey trigger queue and content requests asynchronously
         * Manages the journey trigger processing state and handles pending triggers
         * @private
         * @async
         * @returns {Promise<void>}
         */
        _classPrivateFieldInitSpec(this, _processJourneyTriggerQueueAndContent, /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
            var flushed;
            return _regenerator().w(function (_context) {
                while (1) switch (_context.p = _context.n) {
                    case 0:
                        if (!_classPrivateFieldGet2(_journeyTriggerInProgress, _this)) {
                            _context.n = 1;
                            break;
                        }
                        return _context.a(2);
                    case 1:
                        _classPrivateFieldSet2(_journeyTriggerInProgress, _this, true);
                        _classPrivateFieldSet2(_journeyTriggerPending, _this, false);
                        _context.p = 2;
                        _context.n = 3;
                        return _classPrivateFieldGet2(_drainRequestQueueForJourney, _this).call(_this);
                    case 3:
                        flushed = _context.v;
                        if (flushed) {
                            _classPrivateFieldGet2(_triggerJourneyContentRequestWithRetries, _this).call(_this);
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Could not flush request queue before content refresh");
                        }
                    case 4:
                        _context.p = 4;
                        _classPrivateFieldSet2(_journeyTriggerInProgress, _this, false);

                        // If another journey trigger came in while we were processing, re-process
                        if (_classPrivateFieldGet2(_journeyTriggerPending, _this)) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Processing pending journey trigger");
                            _classPrivateFieldSet2(_journeyTriggerPending, _this, false);
                            // Use setTimeout to avoid stack overflow and allow current call to complete
                            setTimeout(function () {
                                _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                                _classPrivateFieldGet2(_processJourneyTriggerQueueAndContent, _this).call(_this);
                            }, 0);
                        }
                        return _context.f(4);
                    case 5:
                        return _context.a(2);
                }
            }, _callee, null, [[2, , 4, 5]]);
        })));
        /**
         * Drain the request queue for journey trigger processing
         * Attempts to send all pending requests in the queue
         * @private
         * @async
         * @returns {Promise<boolean>} True if queue was successfully drained, false otherwise
         */
        _classPrivateFieldInitSpec(this, _drainRequestQueueForJourney, /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            var initialQueueLength, i, sent;
            return _regenerator().w(function (_context2) {
                while (1) switch (_context2.n) {
                    case 0:
                        initialQueueLength = _classPrivateFieldGet2(_requestQueue, _this).length;
                        if (!(initialQueueLength === 0)) {
                            _context2.n = 1;
                            break;
                        }
                        return _context2.a(2, true);
                    case 1:
                        i = 0;
                    case 2:
                        if (!(i < initialQueueLength)) {
                            _context2.n = 6;
                            break;
                        }
                        _context2.n = 3;
                        return _classPrivateFieldGet2(_sendNextRequestFromQueueForJourney, _this).call(_this);
                    case 3:
                        sent = _context2.v;
                        if (sent) {
                            _context2.n = 4;
                            break;
                        }
                        return _context2.a(2, false);
                    case 4:
                        if (!(_classPrivateFieldGet2(_requestQueue, _this).length === 0)) {
                            _context2.n = 5;
                            break;
                        }
                        return _context2.a(2, true);
                    case 5:
                        i++;
                        _context2.n = 2;
                        break;
                    case 6:
                        return _context2.a(2, _classPrivateFieldGet2(_requestQueue, _this).length === 0);
                }
            }, _callee2);
        })));
        /**
         * Send the next request from queue specifically for journey trigger processing
         * Waits for the SDK to be ready and handles backoff states
         * @private
         * @returns {Promise<boolean>} Promise that resolves to true if request was sent, false otherwise
         */
        _classPrivateFieldInitSpec(this, _sendNextRequestFromQueueForJourney, function () {
            return new Promise(/*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(resolve) {
                    var waitAttempts;
                    return _regenerator().w(function (_context3) {
                        while (1) switch (_context3.n) {
                            case 0:
                                if (!_classPrivateFieldGet2(_offlineMode, _this)) {
                                    _context3.n = 1;
                                    break;
                                }
                                resolve(false);
                                return _context3.a(2);
                            case 1:
                                if (!(_classPrivateFieldGet2(_requestQueue, _this).length === 0)) {
                                    _context3.n = 2;
                                    break;
                                }
                                resolve(true);
                                return _context3.a(2);
                            case 2:
                                waitAttempts = 0;
                            case 3:
                                if (!((!_classPrivateFieldGet2(_readyToProcess, _this) || _classPrivateFieldGet2(_isInBackoff, _this) || getTimestamp() <= _classPrivateFieldGet2(_failTimeout, _this)) && waitAttempts < 5)) {
                                    _context3.n = 5;
                                    break;
                                }
                                waitAttempts++;
                                _context3.n = 4;
                                return _classPrivateFieldGet2(_delay, _this).call(_this, 500);
                            case 4:
                                _context3.n = 3;
                                break;
                            case 5:
                                if (!(!_classPrivateFieldGet2(_readyToProcess, _this) || _classPrivateFieldGet2(_isInBackoff, _this) || getTimestamp() <= _classPrivateFieldGet2(_failTimeout, _this))) {
                                    _context3.n = 6;
                                    break;
                                }
                                resolve(false);
                                return _context3.a(2);
                            case 6:
                                _classPrivateFieldGet2(_sendRequestFromQueue, _this).call(_this, "journey_trigger_send_request", function (parameters) {
                                    _classPrivateFieldGet2(_markJourneyEventIfSent, _this).call(_this, parameters);
                                }).then(function (sent) {
                                    resolve(sent);
                                });
                            case 7:
                                return _context3.a(2);
                        }
                    }, _callee3);
                }));
                return function (_x) {
                    return _ref3.apply(this, arguments);
                };
            }());
        });
        /**
         * Mark journey events as sent based on the request parameters
         * Removes event IDs from pending set when they are confirmed sent
         * @private
         * @param {Object} params - Request parameters containing events data
         */
        _classPrivateFieldInitSpec(this, _markJourneyEventIfSent, function (params) {
            if (!params || !params.events) {
                return;
            }
            try {
                var sentEvents = JSON.parse(params.events);
                if (!Array.isArray(sentEvents)) {
                    return;
                }
                for (var i = 0; i < sentEvents.length; i++) {
                    var evt = sentEvents[i];
                    if (evt && evt.id && _classPrivateFieldGet2(_journeyPendingEventIds, _this).has(evt.id)) {
                        _classPrivateFieldGet2(_journeyPendingEventIds, _this)["delete"](evt.id);
                    }
                }
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Could not parse events while marking sent ids");
            }
        });
        /**
         * Trigger journey content request with retry mechanism
         * Retries up to 3 times if the content request fails
         * @private
         * @param {number} [attempt=0] - Current attempt number for retry logic
         */
        _classPrivateFieldInitSpec(this, _triggerJourneyContentRequestWithRetries, function (attempt) {
            var currentAttempt = attempt || 0;

            // Skip if content is already being displayed (iframe exists)
            if (typeof document !== "undefined" && document.getElementById(_classPrivateFieldGet2(_contentIframeID, _this))) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Content is already being displayed, skipping content request");
                return;
            }
            if (_classPrivateFieldGet2(_journeyPendingEventIds, _this) && _classPrivateFieldGet2(_journeyPendingEventIds, _this).size > 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Pending journey events not yet confirmed sent. Deferring content refresh.");
                setTimeout(function () {
                    _classPrivateFieldGet2(_triggerJourneyContentRequestWithRetries, _this).call(_this, currentAttempt);
                }, 300);
                return;
            }
            var maxAttempts = 3;
            var handleResult = function handleResult(success) {
                if (!success && currentAttempt + 1 < maxAttempts) {
                    setTimeout(function () {
                        _classPrivateFieldGet2(_triggerJourneyContentRequestWithRetries, _this).call(_this, currentAttempt + 1);
                    }, 1000);
                }
            };
            _classPrivateFieldGet2(_sendContentRequest, _this).call(_this, handleResult);
        });
        /**
         * Delay execution for a specified number of milliseconds
         * @param {number} ms - Number of milliseconds to delay
         * @returns {Promise} Promise that resolves after the specified delay
         */
        _classPrivateFieldInitSpec(this, _delay, function (ms) {
            return new Promise(function (resolve) {
                return setTimeout(resolve, ms);
            });
        });
        /**
        * Start timed event, which will fill in duration property upon ending automatically
        * This works basically as a timer and does not create an event till end_event is called
        * @param {string} key - event name that will be used as key property
        * */
        _defineProperty(this, "start_event", function (key) {
            if (!key || typeof key !== "string") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "start_event, you have to provide a valid string key instead of: [" + key + "]");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "start_event, Starting timed event with key: [" + key + "]");
            // truncate event name to internal limits
            key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "start_event", _classPrivateFieldGet2(_log, _this));
            if (_classPrivateFieldGet2(_timedEvents, _this)[key]) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "start_event, Timed event with key: [" + key + "] already started");
                return;
            }
            _classPrivateFieldGet2(_timedEvents, _this)[key] = getTimestamp();
        });
        /**
        * Cancel timed event, cancels a timed event if it exists
        * @param {string} key - event name that will canceled
        * @returns {boolean} - returns true if the event was canceled and false if no event with that key was found
        * */
        _defineProperty(this, "cancel_event", function (key) {
            if (!key || typeof key !== "string") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "cancel_event, you have to provide a valid string key instead of: [" + key + "]");
                return false;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "cancel_event, Canceling timed event with key: [" + key + "]");
            // truncate event name to internal limits. This is done incase start_event key was truncated.
            key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "cancel_event", _classPrivateFieldGet2(_log, _this));
            if (_classPrivateFieldGet2(_timedEvents, _this)[key]) {
                delete _classPrivateFieldGet2(_timedEvents, _this)[key];
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "cancel_event, Timed event with key: [" + key + "] is canceled");
                return true;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "cancel_event, Timed event with key: [" + key + "] was not found");
            return false;
        });
        /**
        * End timed event
        * @param {string|object} event - event key if string or Countly event same as passed to {@link Countly.add_event}
        * */
        _defineProperty(this, "end_event", function (event) {
            if (!event) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "end_event, you have to provide a valid string key or event object instead of: [" + event + "]");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "end_event, Ending timed event");
            if (typeof event === "string") {
                // truncate event name to internal limits. This is done incase start_event key was truncated.
                event = truncateSingleValue(event, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "end_event", _classPrivateFieldGet2(_log, _this));
                event = {
                    key: event
                };
            }
            if (!event.key) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "end_event, Timed event must have a key property");
                return;
            }
            if (!_classPrivateFieldGet2(_timedEvents, _this)[event.key]) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "end_event, Timed event with key: [" + event.key + "] was not started");
                return;
            }
            event.dur = getTimestamp() - _classPrivateFieldGet2(_timedEvents, _this)[event.key];
            _this.add_event(event);
            delete _classPrivateFieldGet2(_timedEvents, _this)[event.key];
        });
        /**
        * Report device orientation
        * @param {string=} orientation - orientation as landscape or portrait
        * */
        _classPrivateFieldInitSpec(this, _report_orientation, function (orientation) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "report_orientation, Reporting orientation");
            if (_this.check_consent(featureEnums.USERS)) {
                _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                    key: internalEventKeyEnums.ORIENTATION,
                    segmentation: {
                        mode: orientation || getOrientation()
                    }
                });
            }
        });
        /**
        * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
        * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
        * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
        * 
        * @deprecated use 'recordDirectAttribution' in place of this call
        * */
        _defineProperty(this, "report_conversion", function (campaign_id, campaign_user_id) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "report_conversion, Deprecated function call! Use 'recordDirectAttribution' in place of this call. Call will be redirected now!");
            _this.recordDirectAttribution(campaign_id, campaign_user_id);
        });
        /**
        * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
        * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
        * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
        * */
        _defineProperty(this, "recordDirectAttribution", function (campaign_id, campaign_user_id) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "recordDirectAttribution, Recording the attribution for campaign ID: [" + campaign_id + "] and the user ID: [" + campaign_user_id + "]");
            if (_this.check_consent(featureEnums.ATTRIBUTION)) {
                campaign_id = campaign_id || _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_cmp_id") || "cly_organic";
                campaign_user_id = campaign_user_id || _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_cmp_uid");
                if (campaign_user_id) {
                    _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        campaign_id: campaign_id,
                        campaign_user: campaign_user_id
                    });
                } else {
                    _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        campaign_id: campaign_id
                    });
                }
            }
        });
        /**
        * Provide information about user
        * @param {Object} user - Countly {@link UserDetails} object
        * @param {string=} user.name - user's full name
        * @param {string=} user.username - user's username or nickname
        * @param {string=} user.email - user's email address
        * @param {string=} user.organization - user's organization or company
        * @param {string=} user.phone - user's phone number
        * @param {string=} user.picture - url to user's picture
        * @param {string=} user.gender - M value for male and F value for female
        * @param {number=} user.byear - user's birth year used to calculate current age
        * @param {Object=} user.custom - object with custom key value properties you want to save with user
        * */
        _defineProperty(this, "user_details", function (user) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "user_details, Trying to add user details: ", user);
            if (_this.check_consent(featureEnums.USERS)) {
                // process async queue before sending events
                _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                // flush events to event queue to prevent a drill issue
                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "user_details, flushed the event queue");
                for (var prop in user) {
                    if (prop !== "custom") {
                        if (!_classPrivateFieldGet2(_isUserPropertyAllowed, _this).call(_this, prop)) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "user_details, User property filtered by behavior settings: [" + prop + "]");
                            delete user[prop];
                        }
                    }
                }
                // truncating user values and custom object key value pairs
                user.name = truncateSingleValue(user.name, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.username = truncateSingleValue(user.username, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.email = truncateSingleValue(user.email, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.organization = truncateSingleValue(user.organization, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.phone = truncateSingleValue(user.phone, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.picture = truncateSingleValue(user.picture, 4096, "user_details", _classPrivateFieldGet2(_log, _this));
                user.gender = truncateSingleValue(user.gender, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.byear = truncateSingleValue(user.byear, _classPrivateFieldGet2(_SCLimitValueSize, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                user.custom = _classPrivateFieldGet2(_filterUserCustomProperties, _this).call(_this, user.custom);
                user.custom = truncateObject(user.custom, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "user_details", _classPrivateFieldGet2(_log, _this));
                var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
                _this.userData.save(); // ensure user data (and events) is saved before sending user details
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    user_details: JSON.stringify(createNewObjectFromProperties(user, props))
                });
            }
        });
        /** ************************
        * Modifying custom property values of user details
        * Possible modification commands
        *  - inc, to increment existing value by provided value
        *  - mul, to multiply existing value by provided value
        *  - max, to select maximum value between existing and provided value
        *  - min, to select minimum value between existing and provided value
        *  - setOnce, to set value only if it was not set before
        *  - push, creates an array property, if property does not exist, and adds value to array
        *  - pull, to remove value from array property
        *  - addToSet, creates an array property, if property does not exist, and adds unique value to array, only if it does not yet exist in array
        ************************* */
        _classPrivateFieldInitSpec(this, _customData, {});
        _classPrivateFieldInitSpec(this, _change_custom_property, function (key, value, mod) {
            if (_this.check_consent(featureEnums.USERS)) {
                if (!_classPrivateFieldGet2(_isUserPropertyAllowed, _this).call(_this, key)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "[userData] change_custom_property, User property filtered by behavior settings: [" + key + "]");
                    return;
                }
                if (!_classPrivateFieldGet2(_customData, _this)[key]) {
                    _classPrivateFieldGet2(_customData, _this)[key] = {};
                }
                if (mod === "$push" || mod === "$pull" || mod === "$addToSet") {
                    if (!_classPrivateFieldGet2(_customData, _this)[key][mod]) {
                        _classPrivateFieldGet2(_customData, _this)[key][mod] = [];
                    }
                    _classPrivateFieldGet2(_customData, _this)[key][mod].push(value);
                } else {
                    _classPrivateFieldGet2(_customData, _this)[key][mod] = value;
                }
            }
        });
        /**
        * Control user related custom properties. Don't forget to call save after finishing manipulation of custom data
        * @namespace Countly.userData
        * @name Countly.userData
        * @example
        * //set custom key value property
        * Countly.userData.set("twitter", "hulk@rowboat");
        * //create or increase specific number property
        * Countly.userData.increment("login_count");
        * //add new value to array property if it is not already there
        * Countly.userData.push_unique("selected_category", "IT");
        * //send all custom property modified data to server
        * Countly.userData.save();
        */
        _defineProperty(this, "userData", {
            /**
            * Sets user's custom property value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value to store under provided property
            * */
            set: function set(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] set, Setting user's custom property value: [" + value + "] under the key: [" + key + "]");
                // truncate user's custom property value to internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData set", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData set", _classPrivateFieldGet2(_log, _this));
                if (!_classPrivateFieldGet2(_isUserPropertyAllowed, _this).call(_this, key)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "[userData] set, User property filtered by behavior settings: [" + key + "]");
                    return;
                }
                _classPrivateFieldGet2(_customData, _this)[key] = value;
            },
            /**
            * Unset/deletes user's custom property
            * @memberof Countly.userData
            * @param {string} key - name of the property to delete
            * */
            unset: function unset(key) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] unset, Resetting user's custom property with key: [" + key + "] ");
                if (!_classPrivateFieldGet2(_isUserPropertyAllowed, _this).call(_this, key)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "[userData] unset, User property filtered by behavior settings: [" + key + "]");
                    return;
                }
                _classPrivateFieldGet2(_customData, _this)[key] = "";
            },
            /**
            * Sets user's custom property value only if it was not set before
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value to store under provided property
            * */
            set_once: function set_once(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] set_once, Setting user's unique custom property value: [" + value + "] under the key: [" + key + "] ");
                // truncate user's custom property value to internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData set_once", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData set_once", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$setOnce");
            },
            /**
            * Increment value under the key of this user's custom properties by one
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * */
            increment: function increment(key) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] increment, Increasing user's custom property value under the key: [" + key + "] by one");
                // truncate property name wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData increment", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, 1, "$inc");
            },
            /**
            * Increment value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to increment server value
            * */
            increment_by: function increment_by(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] increment_by, Increasing user's custom property value under the key: [" + key + "] by: [" + value + "]");
                // truncate property name and value wrt internal limits 
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData increment_by", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData increment_by", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$inc");
            },
            /**
            * Multiply value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to multiply server value
            * */
            multiply: function multiply(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] multiply, Multiplying user's custom property value under the key: [" + key + "] by: [" + value + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData multiply", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData multiply", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$mul");
            },
            /**
            * Save maximal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store maximal value of both provided
            * */
            max: function max(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] max, Saving user's maximum custom property value compared to the value: [" + value + "] under the key: [" + key + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData max", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData max", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$max");
            },
            /**
            * Save minimal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store minimal value of both provided
            * */
            min: function min(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] min, Saving user's minimum custom property value compared to the value: [" + value + "] under the key: [" + key + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData min", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData min", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$min");
            },
            /**
            * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            * */
            push: function push(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] push, Pushing a value: [" + value + "] under the key: [" + key + "] to user's custom property array");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData push", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData push", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$push");
            },
            /**
            * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            * */
            push_unique: function push_unique(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] push_unique, Pushing a unique value: [" + value + "] under the key: [" + key + "] to user's custom property array");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData push_unique", _classPrivateFieldGet2(_log, _this));
                value = truncateSingleValue(value, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData push_unique", _classPrivateFieldGet2(_log, _this));
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$addToSet");
            },
            /**
            * Remove value from array under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property
            * @param {string|number} value - value which to remove from array
            * */
            pull: function pull(key, value) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] pull, Removing the value: [" + value + "] under the key: [" + key + "] from user's custom property array");
                _classPrivateFieldGet2(_change_custom_property, _this).call(_this, key, value, "$pull");
            },
            /**
            * Save changes made to user's custom properties object and send them to server
            * @memberof Countly.userData
            * */
            save: function save(forEvents) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] save, Saving changes to user's custom property. forEvents:[" + forEvents + "]");
                if (!_this.check_consent(featureEnums.USERS) || Object.keys(_classPrivateFieldGet2(_customData, _this)).length === 0) {
                    return;
                }
                if (!forEvents) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "[userData] save, flushing async queue and event queue before sending custom user data");
                    _classPrivateFieldSet2(_isProcessingAsyncFromUserDataSave, _this, true);
                    try {
                        // process async queue before sending events
                        _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                    } finally {
                        _classPrivateFieldSet2(_isProcessingAsyncFromUserDataSave, _this, false);
                    }

                    // flush events to request queue
                    _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                }
                _classPrivateFieldSet2(_customData, _this, _classPrivateFieldGet2(_filterUserCustomProperties, _this).call(_this, _classPrivateFieldGet2(_customData, _this)));
                if (Object.keys(_classPrivateFieldGet2(_customData, _this)).length === 0) {
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "[userData] save, will send the following custom data to server: [" + JSON.stringify(_classPrivateFieldGet2(_customData, _this)) + "]");
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    user_details: JSON.stringify({
                        custom: _classPrivateFieldGet2(_customData, _this)
                    })
                });
                _classPrivateFieldSet2(_customData, _this, {});
            }
        });
        /**
        * Report performance trace
        * @param {Object} trace - apm trace object
        * @param {string} trace.type - device or network
        * @param {string} trace.name - url or view of the trace
        * @param {number} trace.stz - start timestamp
        * @param {number} trace.etz - end timestamp
        * @param {Object} trace.app_metrics - key/value metrics like duration, to report with trace where value is number
        * @param {Object=} trace.apm_attr - object profiling attributes (not yet supported)
        */
        _defineProperty(this, "report_trace", function (trace) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "report_trace, Reporting performance trace");
            if (_this.check_consent(featureEnums.APM)) {
                var props = ["type", "name", "stz", "etz", "apm_metrics", "apm_attr"];
                for (var i = 0; i < props.length; i++) {
                    if (props[i] !== "apm_attr" && typeof trace[props[i]] === "undefined") {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "report_trace, APM trace don't have the property: " + props[i]);
                        return;
                    }
                }
                // truncate trace name and metrics wrt internal limits
                trace.name = truncateSingleValue(trace.name, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "report_trace", _classPrivateFieldGet2(_log, _this));
                trace.app_metrics = truncateObject(trace.app_metrics, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "report_trace", _classPrivateFieldGet2(_log, _this));
                var e = createNewObjectFromProperties(trace, props);
                e.timestamp = trace.stz;
                var date = new Date();
                e.hour = date.getHours();
                e.dow = date.getDay();
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    apm: JSON.stringify(e)
                });
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "report_trace, Successfully adding APM trace: ", e);
            }
        });
        /**
        * Automatically track javascript errors that happen on the website and report them to the server
        * @param {Object} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        * */
        _defineProperty(this, "track_errors", function (segments) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_errors, window object is not available. Not tracking errors.");
                return;
            }
            if (!_classPrivateFieldGet2(_SCTrackingCrashes, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_errors, Crash tracking is disabled by the server config. Not tracking errors.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_errors, Started tracking errors");
            // Indicated that for this instance of the countly error tracking is enabled
            Countly.i[_this.app_key].tracking_crashes = true;
            if (!window.cly_crashes) {
                window.cly_crashes = true;
                _classPrivateFieldSet2(_crashSegments, _this, segments);
                // override global 'uncaught error' handler
                window.addEventListener("error", function (event) {
                    if (event.error) {
                        dispatchErrors(event.error, false); // false indicates fatal error
                    } else {
                        // For older browsers that don't provide error object, construct an error message
                        var errorMsg = event.message || "Unknown error";
                        var url = event.filename || "";
                        var line = event.lineno || 0;
                        var col = event.colno || 0;
                        var error = errorMsg + "\n";
                        if (url) error += "at " + url;
                        if (line) error += ":" + line;
                        if (col) error += ":" + col;
                        error += "\n";
                        try {
                            var stack = [];
                            // We don't have caller info in this case, so we skip that part
                            error += stack.join("\n");
                        } catch (ex) {
                            // silent error
                        }
                        // false indicates fatal error (as in non_fatal:false)
                        dispatchErrors(error, false);
                    }
                });

                // error handling for 'uncaught rejections'
                window.addEventListener("unhandledrejection", function (event) {
                    // true indicates non fatal error (as in non_fatal: true)
                    dispatchErrors(new Error("Unhandled rejection (reason: " + (event.reason && event.reason.stack ? event.reason.stack : event.reason) + ")."), true);
                });
            }
        });
        /**
        * Log an exception that you caught through try and catch block and handled yourself and just want to report it to server
        * @param {Object} err - error exception object provided in catch block
        * @param {Object} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        * */
        _defineProperty(this, "log_error", function (err, segments) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "log_error, Logging errors");
            // true indicates non fatal error (as in non_fatal:true)
            _this.recordError(err, true, segments);
        });
        /**
        * Add new line in the log of breadcrumbs of what user did, will be included together with error report
        * @param {string} record - any text describing what user did
        * */
        _defineProperty(this, "add_log", function (record) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "add_log, Adding a new log of breadcrumbs: [ " + record + " ]");
            if (_this.check_consent(featureEnums.CRASHES)) {
                // truncate description wrt internal limits
                record = truncateSingleValue(record, _classPrivateFieldGet2(_SCLimitValueSize, _this), "add_log", _classPrivateFieldGet2(_log, _this));
                while (_classPrivateFieldGet2(_crashLogs, _this).length >= _classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this)) {
                    _classPrivateFieldGet2(_crashLogs, _this).shift();
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "add_log, Reached maximum crashLogs size. Will erase the oldest one.");
                }
                _classPrivateFieldGet2(_crashLogs, _this).push(record);
            }
        });
        /**
        * Fetch remote config from the server (old one for method=fetch_remote_config API)
        * @param {array=} keys - Array of keys to fetch, if not provided will fetch all keys
        * @param {array=} omit_keys - Array of keys to omit, if provided will fetch all keys except provided ones
        * @param {function=} callback - Callback to notify with first param error and second param remote config object
        * */
        _defineProperty(this, "fetch_remote_config", function (keys, omit_keys, callback) {
            var keysFiltered = null;
            var omitKeysFiltered = null;
            var callbackFiltered = null;

            // check first param is truthy
            if (keys) {
                // if third parameter is falsy and first param is a function assign it as the callback function
                if (!callback && typeof keys === "function") {
                    callbackFiltered = keys;
                }
                // else if first param is an array assign it as 'keys'
                else if (Array.isArray(keys)) {
                    keysFiltered = keys;
                }
            }
            // check second param is truthy
            if (omit_keys) {
                // if third parameter is falsy and second param is a function assign it as the callback function
                if (!callback && typeof omit_keys === "function") {
                    callbackFiltered = omit_keys;
                }
                // else if second param is an array assign it as 'omit_keys'
                else if (Array.isArray(omit_keys)) {
                    omitKeysFiltered = omit_keys;
                }
            }
            // assign third param as a callback function if it was not assigned yet in first two params
            if (!callbackFiltered && typeof callback === "function") {
                callbackFiltered = callback;
            }

            // use new RC API
            if (_this.useExplicitRcApi) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "fetch_remote_config, Fetching remote config");
                // opt in is true(1) or false(0)
                var opt = _this.rcAutoOptinAb ? 1 : 0;
                _classPrivateFieldGet2(_fetch_remote_config_explicit, _this).call(_this, keysFiltered, omitKeysFiltered, opt, null, callbackFiltered);
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "fetch_remote_config, Fetching remote config, with legacy API");
            _classPrivateFieldGet2(_fetch_remote_config_explicit, _this).call(_this, keysFiltered, omitKeysFiltered, null, "legacy", callbackFiltered);
        });
        /**
        * Fetch remote config from the server (new one with method=rc API)
        * @param {array=} keys - Array of keys to fetch, if not provided will fetch all keys
        * @param {array=} omit_keys - Array of keys to omit, if provided will fetch all keys except provided ones
        * @param {number=} optIn - an inter to indicate if the user is opted in for the AB testing or not (1 is opted in, 0 is opted out)
        * @param {string=} api - which API to use, if not provided would use default ("legacy" is for method="fetch_remote_config", default is method="rc")
        * @param {function=} callback - Callback to notify with first param error and second param remote config object
        * */
        _classPrivateFieldInitSpec(this, _fetch_remote_config_explicit, function (keys, omit_keys, optIn, api, callback) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "fetch_remote_config_explicit, Fetching sequence initiated");
            var request = {
                method: "rc",
                av: _this.app_version
            };
            // check if keys were provided
            if (keys) {
                request.keys = JSON.stringify(keys);
            }
            // check if omit_keys were provided
            if (omit_keys) {
                request.omit_keys = JSON.stringify(omit_keys);
            }
            var providedCall;
            // legacy api prompt check
            if (api === "legacy") {
                request.method = "fetch_remote_config";
            }
            // opted out/in check
            if (optIn === 0) {
                request.oi = 0;
            }
            if (optIn === 1) {
                request.oi = 1;
            }
            // callback check
            if (typeof callback === "function") {
                providedCall = callback;
            }
            if (_this.check_consent(featureEnums.SESSIONS)) {
                request.metrics = JSON.stringify(_classPrivateFieldGet2(_getMetrics, _this).call(_this));
            }
            if (_this.check_consent(featureEnums.REMOTE_CONFIG)) {
                _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);
                _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "fetch_remote_config_explicit", _this.url + _classPrivateFieldGet2(_readPath, _this), request, function (err, params, responseText) {
                    if (err) {
                        // error has been logged by the request function
                        return;
                    }
                    try {
                        var configs = JSON.parse(responseText);
                        if (request.keys || request.omit_keys) {
                            // we merge config
                            for (var i in configs) {
                                _classPrivateFieldGet2(_remoteConfigs, _this)[i] = configs[i];
                            }
                        } else {
                            // we replace config
                            _classPrivateFieldSet2(_remoteConfigs, _this, configs);
                        }
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_remote_configs", _classPrivateFieldGet2(_remoteConfigs, _this));
                    } catch (ex) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "fetch_remote_config_explicit, Had an issue while parsing the response: " + ex);
                    }
                    if (providedCall) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "fetch_remote_config_explicit, Callback function is provided");
                        providedCall(err, _classPrivateFieldGet2(_remoteConfigs, _this));
                    }
                    // JSON array can pass    
                }, true);
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "fetch_remote_config_explicit, Remote config requires explicit consent");
                if (providedCall) {
                    providedCall(new Error("Remote config requires explicit consent"), _classPrivateFieldGet2(_remoteConfigs, _this));
                }
            }
        });
        /**
        * AB testing key provider, opts the user in for the selected keys
        * @param {array=} keys - Array of keys opt in FOR
        * */
        _defineProperty(this, "enrollUserToAb", function (keys) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "enrollUserToAb, Providing AB test keys to opt in for");
            if (!keys || !Array.isArray(keys) || keys.length === 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enrollUserToAb, No keys provided");
                return;
            }
            var request = {
                method: "ab",
                keys: JSON.stringify(keys),
                av: _this.app_version
            };
            _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "enrollUserToAb", _this.url + _classPrivateFieldGet2(_readPath, _this), request, function (err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    return;
                }
                try {
                    var resp = JSON.parse(responseText);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "enrollUserToAb, Parsed the response's result: [" + resp.result + "]");
                } catch (ex) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enrollUserToAb, Had an issue while parsing the response: " + ex);
                }
                // JSON array can pass    
            }, true);
        });
        /**
        * Gets remote config object (all key/value pairs) or specific value for provided key from the storage
        * @param {string=} key - if provided, will return value for key, or return whole object
        * @returns {object} remote configs
        * */
        _defineProperty(this, "get_remote_config", function (key) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "get_remote_config, Getting remote config from storage");
            if (typeof key !== "undefined") {
                return _classPrivateFieldGet2(_remoteConfigs, _this)[key];
            }
            return _classPrivateFieldGet2(_remoteConfigs, _this);
        });
        /**
        * Stop tracking duration time for this user
        * */
        _classPrivateFieldInitSpec(this, _stop_time, function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "stop_time, Stopping tracking duration");
            if (_classPrivateFieldGet2(_trackTime, _this)) {
                _classPrivateFieldSet2(_trackTime, _this, false);
                _classPrivateFieldSet2(_storedDuration, _this, getTimestamp() - _classPrivateFieldGet2(_lastBeat, _this));
                _classPrivateFieldSet2(_lastViewStoredDuration, _this, getTimestamp() - _classPrivateFieldGet2(_lastViewTime, _this));
            }
        });
        /** 
        * Start tracking duration time for this user, by default it is automatically tracked if you are using internal session handling
        * */
        _classPrivateFieldInitSpec(this, _start_time, function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "start_time, Starting tracking duration");
            if (!_classPrivateFieldGet2(_trackTime, _this)) {
                _classPrivateFieldSet2(_trackTime, _this, true);
                _classPrivateFieldSet2(_lastBeat, _this, getTimestamp() - _classPrivateFieldGet2(_storedDuration, _this));
                _classPrivateFieldSet2(_lastViewTime, _this, getTimestamp() - _classPrivateFieldGet2(_lastViewStoredDuration, _this));
                _classPrivateFieldSet2(_lastViewStoredDuration, _this, 0);
                _classPrivateFieldGet2(_extendSession, _this).call(_this);
            }
        });
        /**
        * Track user sessions automatically, including  time user spent on your website
        * */
        _defineProperty(this, "track_sessions", function () {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_sessions, window object is not available. Not tracking sessions.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_session, Starting tracking user session");
            // start session
            _this.begin_session();
            _classPrivateFieldGet2(_start_time, _this).call(_this);
            // end session on unload
            add_event_listener(window, "beforeunload", function () {
                // process async queue before sending events
                _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                // empty the event queue
                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                _this.end_session();
            });

            // manage sessions on window visibility events
            var hidden = "hidden";

            /**
             *  Handle visibility change events
             */
            var onchange = function onchange() {
                if (document[hidden] || !document.hasFocus()) {
                    _classPrivateFieldGet2(_stop_time, _this).call(_this);
                } else {
                    _classPrivateFieldGet2(_start_time, _this).call(_this);
                }
            };

            // add focus handling eventListeners
            add_event_listener(window, "focus", onchange);
            add_event_listener(window, "blur", onchange);

            // newer mobile compatible way
            add_event_listener(window, "pageshow", onchange);
            add_event_listener(window, "pagehide", onchange);

            // IE 9 and lower:
            if ("onfocusin" in document) {
                add_event_listener(window, "focusin", onchange);
                add_event_listener(window, "focusout", onchange);
            }

            // Page Visibility API for changing tabs and minimizing browser
            if (hidden in document) {
                document.addEventListener("visibilitychange", onchange);
            } else if ("mozHidden" in document) {
                hidden = "mozHidden";
                document.addEventListener("mozvisibilitychange", onchange);
            } else if ("webkitHidden" in document) {
                hidden = "webkitHidden";
                document.addEventListener("webkitvisibilitychange", onchange);
            } else if ("msHidden" in document) {
                hidden = "msHidden";
                document.addEventListener("msvisibilitychange", onchange);
            }

            /**
             *  Reset inactivity counter and time
             */
            var resetInactivity = function resetInactivity() {
                if (_classPrivateFieldGet2(_inactivityCounter, _this) >= _classPrivateFieldGet2(_inactivityTime, _this)) {
                    _classPrivateFieldGet2(_start_time, _this).call(_this);
                }
                _classPrivateFieldSet2(_inactivityCounter, _this, 0);
            };
            add_event_listener(window, "mousemove", resetInactivity);
            add_event_listener(window, "click", resetInactivity);
            add_event_listener(window, "keydown", resetInactivity);
            add_event_listener(window, "scroll", resetInactivity);

            // track user inactivity
            setInterval(function () {
                var _this$inactivityCount;
                _classPrivateFieldSet2(_inactivityCounter, _this, (_this$inactivityCount = _classPrivateFieldGet2(_inactivityCounter, _this), _this$inactivityCount++, _this$inactivityCount));
                if (_classPrivateFieldGet2(_inactivityCounter, _this) >= _classPrivateFieldGet2(_inactivityTime, _this)) {
                    _classPrivateFieldGet2(_stop_time, _this).call(_this);
                }
            }, 60000);
        });
        /**
        * Track page views user visits
        * @param {string=} page - optional name of the page, by default uses current url path
        * @param {array=} ignoreList - optional array of strings or regexps to test for the url/view name to ignore and not report
        * @param {object=} viewSegments - optional key value object with segments to report with the view
        * */
        _defineProperty(this, "track_pageview", function (page, ignoreList, viewSegments) {
            if (!isBrowser && !page) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_pageview, window object is not available. Not tracking page views as page name is not provided.");
                return;
            }
            if (!_classPrivateFieldGet2(_SCTrackingViews, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_pageview, View tracking is disabled by the server config. Not tracking page views.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_pageview, Tracking page views");
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "track_pageview, last view is:[" + _classPrivateFieldGet2(_lastView, _this) + "], current view ID is:[" + _classPrivateFieldGet2(_currentViewId, _this) + "], previous view ID is:[" + _classPrivateFieldGet2(_previousViewId, _this) + "]");
            if (_classPrivateFieldGet2(_lastView, _this) && _classPrivateFieldGet2(_trackingScrolls, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "track_pageview, Scroll registry triggered");
                _classPrivateFieldGet2(_processScrollView, _this).call(_this); // for single page site's view change
                _classPrivateFieldSet2(_isScrollRegistryOpen, _this, true);
                _classPrivateFieldSet2(_scrollRegistryTopPosition, _this, 0);
            }
            _classPrivateFieldGet2(_reportViewDuration, _this).call(_this);
            _classPrivateFieldSet2(_previousViewId, _this, _classPrivateFieldGet2(_currentViewId, _this));
            _classPrivateFieldSet2(_currentViewId, _this, secureRandom());
            // truncate page name and segmentation wrt internal limits
            page = truncateSingleValue(page, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "track_pageview", _classPrivateFieldGet2(_log, _this));
            // if the first parameter we got is an array we got the ignoreList first, assign it here
            if (page && Array.isArray(page)) {
                ignoreList = page;
                page = null;
            }
            // no page or ignore list provided, get the current view name/url
            if (!page) {
                page = _this.getViewName();
            }
            if (page === undefined || page === "") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "track_pageview, No page name to track (it is either undefined or empty string). No page view can be tracked.");
                return;
            }
            if (page === null) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "track_pageview, View name returned as null. Page view will be ignored.");
                return;
            }
            if (ignoreList && ignoreList.length) {
                for (var i = 0; i < ignoreList.length; i++) {
                    try {
                        var reg = new RegExp(ignoreList[i]);
                        if (reg.test(page)) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_pageview, Ignoring the page: " + page);
                            return;
                        }
                    } catch (ex) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "track_pageview, Problem with finding ignore list item: " + ignoreList[i] + ", error: " + ex);
                    }
                }
            }
            var segments = {
                name: page,
                visit: 1,
                view: _this.getViewUrl()
            };
            // truncate new segment
            segments = truncateObject(segments, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "track_pageview", _classPrivateFieldGet2(_log, _this));
            if (_this.track_domains) {
                segments.domain = window.location.hostname;
            }
            if (_classPrivateFieldGet2(_useSessionCookie, _this)) {
                if (!_classPrivateFieldGet2(_sessionStarted, _this)) {
                    // tracking view was called before tracking session, so we check expiration ourselves
                    var expire = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_session");
                    if (!expire || parseInt(expire) <= getTimestamp()) {
                        _classPrivateFieldSet2(_firstView, _this, false);
                        segments.start = 1;
                    }
                }
                // tracking views called after tracking session, so we can rely on tracking session decision
                else if (_classPrivateFieldGet2(_firstView, _this)) {
                    _classPrivateFieldSet2(_firstView, _this, false);
                    segments.start = 1;
                }
            }
            // if we are not using session cookie, there is no session state between refreshes
            // so we fallback to old logic of landing
            else if (isBrowser && typeof document.referrer !== "undefined" && document.referrer.length) {
                var matches = urlParseRE.exec(document.referrer);
                // do not report referrers of current website
                if (matches && matches[11] && matches[11] !== window.location.hostname) {
                    segments.start = 1;
                }
            }

            // add utm tags
            if (_classPrivateFieldGet2(_freshUTMTags, _this) && Object.keys(_classPrivateFieldGet2(_freshUTMTags, _this)).length) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_pageview, Adding fresh utm tags to segmentation:[" + JSON.stringify(_classPrivateFieldGet2(_freshUTMTags, _this)) + "]");
                for (var utm in _classPrivateFieldGet2(_freshUTMTags, _this)) {
                    if (typeof segments["utm_" + utm] === "undefined") {
                        segments["utm_" + utm] = _classPrivateFieldGet2(_freshUTMTags, _this)[utm];
                    }
                }
                // TODO: Current logic adds utm tags to each view if the user landed with utm tags for that session(in non literal sense)
                // we might want to change this logic to add utm tags only to the first view's segmentation by freshUTMTags = null; here
            }

            // add referrer if it is usable
            if (isBrowser && _classPrivateFieldGet2(_isReferrerUsable, _this).call(_this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_pageview, Adding referrer to segmentation:[" + document.referrer + "]");
                segments.referrer = document.referrer; // add referrer
            }
            if (viewSegments) {
                viewSegments = truncateObject(viewSegments, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "track_pageview", _classPrivateFieldGet2(_log, _this));
                for (var key in viewSegments) {
                    if (typeof segments[key] === "undefined") {
                        segments[key] = viewSegments[key];
                    }
                }
            }

            // track pageview
            if (_this.check_consent(featureEnums.VIEWS)) {
                _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                    key: internalEventKeyEnums.VIEW,
                    segmentation: segments
                }, _classPrivateFieldGet2(_currentViewId, _this));
                _classPrivateFieldSet2(_lastView, _this, page);
                _classPrivateFieldSet2(_lastViewTime, _this, getTimestamp());
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "track_pageview, last view is assigned:[" + _classPrivateFieldGet2(_lastView, _this) + "]");
            } else {
                _classPrivateFieldGet2(_lastParams, _this).track_pageview = [page, ignoreList, viewSegments];
            }
        });
        /**
        * Track page views user visits. Alias of {@link track_pageview} method for compatibility with NodeJS SDK
        * @param {string=} page - optional name of the page, by default uses current url path
        * @param {array=} ignoreList - optional array of strings or regexps to test for the url/view name to ignore and not report
        * @param {object=} segments - optional view segments to track with the view
        * */
        _defineProperty(this, "track_view", function (page, ignoreList, segments) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_view, Initiating tracking page views");
            _this.track_pageview(page, ignoreList, segments);
        });
        /**
        * Track all clicks on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        _defineProperty(this, "track_clicks", function (parent) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_clicks, window object is not available. Not tracking clicks.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_clicks, Starting to track clicks");
            if (parent) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_clicks, Tracking the specified children:[" + parent + "]");
            }
            parent = parent || document;
            var shouldProcess = true;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            var processClick = function processClick(event) {
                if (shouldProcess) {
                    shouldProcess = false;

                    // cross browser click coordinates
                    get_page_coord(event);
                    if (typeof event.pageX !== "undefined" && typeof event.pageY !== "undefined") {
                        var height = getDocHeight();
                        var width = getDocWidth();

                        // record click event
                        if (_this.check_consent(featureEnums.CLICKS)) {
                            var segments = {
                                type: "click",
                                x: event.pageX,
                                y: event.pageY,
                                width: width,
                                height: height,
                                view: _this.getViewUrl()
                            };
                            // truncate new segment
                            segments = truncateObject(segments, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "processClick", _classPrivateFieldGet2(_log, _this));
                            if (_this.track_domains) {
                                segments.domain = window.location.hostname;
                            }
                            _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                                key: internalEventKeyEnums.ACTION,
                                segmentation: segments
                            });
                        }
                    }
                    setTimeout(function () {
                        shouldProcess = true;
                    }, 1000);
                }
            };
            // add any events you want
            add_event_listener(parent, "click", processClick);
        });
        /**
        * Track all scrolls on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        _defineProperty(this, "track_scrolls", function (parent) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_scrolls, window object is not available. Not tracking scrolls.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_scrolls, Starting to track scrolls");
            if (parent) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_scrolls, Tracking the specified children");
            }
            parent = parent || window;
            _classPrivateFieldSet2(_isScrollRegistryOpen, _this, true);
            _classPrivateFieldSet2(_trackingScrolls, _this, true);
            add_event_listener(parent, "scroll", _classPrivateFieldGet2(_processScroll, _this));
            add_event_listener(parent, "beforeunload", _classPrivateFieldGet2(_processScrollView, _this));
        });
        /**
        * Generate custom event for all links that were clicked on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        _defineProperty(this, "track_links", function (parent) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_links, window object is not available. Not tracking links.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_links, Starting to track clicks to links");
            if (parent) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_links, Tracking the specified children");
            }
            parent = parent || document;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            var processClick = function processClick(event) {
                // get element which was clicked
                var elem = get_closest_element(get_event_target(event), "a");
                if (elem) {
                    // cross browser click coordinates
                    get_page_coord(event);

                    // record click event
                    if (_this.check_consent(featureEnums.CLICKS)) {
                        _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                            key: "linkClick",
                            segmentation: {
                                href: elem.href,
                                text: elem.innerText,
                                id: elem.id,
                                view: _this.getViewUrl()
                            }
                        });
                    }
                }
            };

            // add any events you want
            add_event_listener(parent, "click", processClick);
        });
        /**
        * Upload user profile picture (image) to the server.
        * @param {File|Blob} imageFile - The image file to upload
        */
        _defineProperty(this, "uploadUserProfilePicture", function (imageFile) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: Browser environment required.");
                return;
            }
            if (!imageFile || _typeof(imageFile) !== "object" || !imageFile.type || imageFile.type.indexOf("image") !== 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: Provided file is not an image.");
                return;
            }
            if (typeof FileReader === "undefined") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: FileReader is not available in this environment.");
                return;
            }
            var reader = new FileReader();
            reader.onerror = function () {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: Failed to read the provided image file.");
            };
            reader.onload = function () {
                var result = reader.result;
                if (typeof result !== "string") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: Unable to process the selected image.");
                    return;
                }
                var commaIndex = result.indexOf(",");
                var base64Data = commaIndex === -1 ? result : result.substring(commaIndex + 1);
                if (!base64Data) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "uploadUserProfilePicture: Invalid image data received.");
                    return;
                }
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    __imageUpload: true,
                    imageData: base64Data,
                    imageName: imageFile.name || "avatar",
                    imageType: imageFile.type || "application/octet-stream",
                    user_details: "{}"
                });
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "uploadUserProfilePicture: Image upload request queued.");
            };
            reader.readAsDataURL(imageFile);
        });
        /**
        * Generate custom event for all forms that were submitted on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean=} trackHidden - provide true to also track hidden inputs, default false
        * */
        _defineProperty(this, "track_forms", function (parent, trackHidden) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_forms, window object is not available. Not tracking forms.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_forms, Starting to track form submissions. DOM object provided:[" + !!parent + "] Tracking hidden inputs :[" + !!trackHidden + "]");
            parent = parent || document;
            /**
             *  Get name of the input
             *  @param {HTMLElement} input - HTML input from which to get name
             *  @returns {String} name of the input
             */
            var getInputName = function getInputName(input) {
                return input.name || input.id || input.type || input.nodeName;
            };
            /**
             *  Process form data
             *  @param {Event} event - form submission event
             */
            var processForm = function processForm(event) {
                var form = get_event_target(event);
                var segmentation = {
                    id: form.attributes.id && form.attributes.id.nodeValue,
                    name: form.attributes.name && form.attributes.name.nodeValue,
                    action: form.attributes.action && form.attributes.action.nodeValue,
                    method: form.attributes.method && form.attributes.method.nodeValue,
                    view: _this.getViewUrl()
                };

                // get input values
                var input;
                if (typeof form.elements !== "undefined") {
                    for (var i = 0; i < form.elements.length; i++) {
                        input = form.elements[i];
                        if (input && input.type !== "password" && input.className.indexOf("cly_user_ignore") === -1) {
                            if (typeof segmentation["input:" + getInputName(input)] === "undefined") {
                                segmentation["input:" + getInputName(input)] = [];
                            }
                            if (input.nodeName.toLowerCase() === "select") {
                                if (typeof input.multiple !== "undefined") {
                                    segmentation["input:" + getInputName(input)].push(getMultiSelectValues(input));
                                } else {
                                    segmentation["input:" + getInputName(input)].push(input.options[input.selectedIndex].value);
                                }
                            } else if (input.nodeName.toLowerCase() === "input") {
                                if (typeof input.type !== "undefined") {
                                    if (input.type.toLowerCase() === "checkbox" || input.type.toLowerCase() === "radio") {
                                        if (input.checked) {
                                            segmentation["input:" + getInputName(input)].push(input.value);
                                        }
                                    } else if (input.type.toLowerCase() !== "hidden" || trackHidden) {
                                        segmentation["input:" + getInputName(input)].push(input.value);
                                    }
                                } else {
                                    segmentation["input:" + getInputName(input)].push(input.value);
                                }
                            } else if (input.nodeName.toLowerCase() === "textarea") {
                                segmentation["input:" + getInputName(input)].push(input.value);
                            } else if (typeof input.value !== "undefined") {
                                segmentation["input:" + getInputName(input)].push(input.value);
                            }
                        }
                    }
                    for (var key in segmentation) {
                        if (segmentation[key] && typeof segmentation[key].join === "function") {
                            segmentation[key] = segmentation[key].join(", ");
                        }
                    }
                }

                // record submit event
                if (_this.check_consent(featureEnums.FORMS)) {
                    _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                        key: "formSubmit",
                        segmentation: segmentation
                    });
                }
            };

            // add any events you want
            add_event_listener(parent, "submit", processForm);
        });
        /**
        * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If not class is provided, Countly SDK will try to determine type of information automatically.
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean} [useCustom=false] - submit collected data as custom user properties, by default collects as main user properties
        * */
        _defineProperty(this, "collect_from_forms", function (parent, useCustom) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "collect_from_forms, window object is not available. Not collecting from forms.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "collect_from_forms, Starting to collect possible user data. DOM object provided:[" + !!parent + "] Submitting custom user property:[" + !!useCustom + "]");
            parent = parent || document;
            /**
             *  Process form data
             *  @param {Event} event - form submission event
             */
            var processForm = function processForm(event) {
                var form = get_event_target(event);
                var userdata = {};
                var hasUserInfo = false;

                // get input values
                var input;
                if (typeof form.elements !== "undefined") {
                    // load labels for inputs
                    var labelData = {};
                    var labels = parent.getElementsByTagName("LABEL");
                    var i;
                    var j;
                    for (i = 0; i < labels.length; i++) {
                        if (labels[i].htmlFor && labels[i].htmlFor !== "") {
                            labelData[labels[i].htmlFor] = labels[i].innerText || labels[i].textContent || labels[i].innerHTML;
                        }
                    }
                    for (i = 0; i < form.elements.length; i++) {
                        input = form.elements[i];
                        if (input && input.type !== "password") {
                            // check if element should be ignored
                            if (input.className.indexOf("cly_user_ignore") === -1) {
                                var value = "";
                                // get value from input
                                if (input.nodeName.toLowerCase() === "select") {
                                    if (typeof input.multiple !== "undefined") {
                                        value = getMultiSelectValues(input);
                                    } else {
                                        value = input.options[input.selectedIndex].value;
                                    }
                                } else if (input.nodeName.toLowerCase() === "input") {
                                    if (typeof input.type !== "undefined") {
                                        if (input.type.toLowerCase() === "checkbox" || input.type.toLowerCase() === "radio") {
                                            if (input.checked) {
                                                value = input.value;
                                            }
                                        } else {
                                            value = input.value;
                                        }
                                    } else {
                                        value = input.value;
                                    }
                                } else if (input.nodeName.toLowerCase() === "textarea") {
                                    value = input.value;
                                } else if (typeof input.value !== "undefined") {
                                    value = input.value;
                                }
                                // check if input was marked to be collected
                                if (input.className && input.className.indexOf("cly_user_") !== -1) {
                                    var classes = input.className.split(" ");
                                    for (j = 0; j < classes.length; j++) {
                                        if (classes[j].indexOf("cly_user_") === 0) {
                                            userdata[classes[j].replace("cly_user_", "")] = value;
                                            hasUserInfo = true;
                                            break;
                                        }
                                    }
                                }
                                // check for email
                                else if (input.type && input.type.toLowerCase() === "email" || input.name && input.name.toLowerCase().indexOf("email") !== -1 || input.id && input.id.toLowerCase().indexOf("email") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("email") !== -1 || /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value)) {
                                    if (!userdata.email) {
                                        userdata.email = value;
                                    }
                                    hasUserInfo = true;
                                } else if (input.name && input.name.toLowerCase().indexOf("username") !== -1 || input.id && input.id.toLowerCase().indexOf("username") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("username") !== -1) {
                                    if (!userdata.username) {
                                        userdata.username = value;
                                    }
                                    hasUserInfo = true;
                                } else if (input.name && (input.name.toLowerCase().indexOf("tel") !== -1 || input.name.toLowerCase().indexOf("phone") !== -1 || input.name.toLowerCase().indexOf("number") !== -1) || input.id && (input.id.toLowerCase().indexOf("tel") !== -1 || input.id.toLowerCase().indexOf("phone") !== -1 || input.id.toLowerCase().indexOf("number") !== -1) || input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("tel") !== -1 || labelData[input.id].toLowerCase().indexOf("phone") !== -1 || labelData[input.id].toLowerCase().indexOf("number") !== -1)) {
                                    if (!userdata.phone) {
                                        userdata.phone = value;
                                    }
                                    hasUserInfo = true;
                                } else if (input.name && (input.name.toLowerCase().indexOf("org") !== -1 || input.name.toLowerCase().indexOf("company") !== -1) || input.id && (input.id.toLowerCase().indexOf("org") !== -1 || input.id.toLowerCase().indexOf("company") !== -1) || input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("org") !== -1 || labelData[input.id].toLowerCase().indexOf("company") !== -1)) {
                                    if (!userdata.organization) {
                                        userdata.organization = value;
                                    }
                                    hasUserInfo = true;
                                } else if (input.name && input.name.toLowerCase().indexOf("name") !== -1 || input.id && input.id.toLowerCase().indexOf("name") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("name") !== -1) {
                                    if (!userdata.name) {
                                        userdata.name = "";
                                    }
                                    userdata.name += value + " ";
                                    hasUserInfo = true;
                                }
                            }
                        }
                    }
                }

                // record user info, if any
                if (hasUserInfo) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "collect_from_forms, Gathered user data", userdata);
                    if (useCustom) {
                        _this.user_details({
                            custom: userdata
                        });
                    } else {
                        _this.user_details(userdata);
                    }
                }
            };

            // add any events you want
            add_event_listener(parent, "submit", processForm);
        });
        /**
        * Collect information about user from Facebook, if your website integrates Facebook SDK. Call this method after Facebook SDK is loaded and user is authenticated.
        * @param {Object=} custom - Custom keys to collected from Facebook, key will be used to store as key in custom user properties and value as key in Facebook graph object. For example, {"tz":"timezone"} will collect Facebook's timezone property, if it is available and store it in custom user's property under "tz" key. If you want to get value from some sub object properties, then use dot as delimiter, for example, {"location":"location.name"} will collect data from Facebook's {"location":{"name":"MyLocation"}} object and store it in user's custom property "location" key
        * */
        _defineProperty(this, "collect_from_facebook", function (custom) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "collect_from_facebook, window object is not available. Not collecting from Facebook.");
                return;
            }
            if (typeof FB === "undefined" || !FB || !FB.api) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "collect_from_facebook, Facebook SDK is not available");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "collect_from_facebook, Starting to collect possible user data");
            /* globals FB */
            FB.api("/me", function (resp) {
                var data = {};
                if (resp.name) {
                    data.name = resp.name;
                }
                if (resp.email) {
                    data.email = resp.email;
                }
                if (resp.gender === "male") {
                    data.gender = "M";
                } else if (resp.gender === "female") {
                    data.gender = "F";
                }
                if (resp.birthday) {
                    var byear = resp.birthday.split("/").pop();
                    if (byear && byear.length === 4) {
                        data.byear = byear;
                    }
                }
                if (resp.work && resp.work[0] && resp.work[0].employer && resp.work[0].employer.name) {
                    data.organization = resp.work[0].employer.name;
                }
                // check if any custom keys to collect
                if (custom) {
                    data.custom = {};
                    for (var i in custom) {
                        var parts = custom[i].split(".");
                        var get = resp;
                        for (var j = 0; j < parts.length; j++) {
                            get = get[parts[j]];
                            if (typeof get === "undefined") {
                                break;
                            }
                        }
                        if (typeof get !== "undefined") {
                            data.custom[i] = get;
                        }
                    }
                }
                _this.user_details(data);
            });
        });
        /**
        * Opts out user of any metric tracking
        * */
        _defineProperty(this, "opt_out", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "opt_out, Opting out the user. Deprecated function call! Use 'consent' in place of this call.");
            _this.ignore_visitor = true;
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_ignore", true);
        });
        /**
        * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
        * */
        _defineProperty(this, "opt_in", function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "opt_in, Opting in the user. Deprecated function call! Use 'consent' in place of this call.");
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_ignore", false);
            _this.ignore_visitor = false;
            _classPrivateFieldGet2(_checkIgnore, _this).call(_this);
            if (!_this.ignore_visitor && !_classPrivateFieldGet2(_hasPulse, _this)) {
                _classPrivateFieldGet2(_heartBeat, _this).call(_this);
            }
        });
        /**
        * Provide information about user
        * @param {Object} ratingWidget - object with rating widget properties
        * @param {string} ratingWidget.widget_id - id of the widget in the dashboard
        * @param {boolean=} ratingWidget.contactMe - did user give consent to contact him
        * @param {string=} ratingWidget.platform - user's platform (will be filled if not provided)
        * @param {string=} ratingWidget.app_version - app's app version (will be filled if not provided)
        * @param {number} ratingWidget.rating - user's rating from 1 to 5
        * @param {string=} ratingWidget.email - user's email
        * @param {string=} ratingWidget.comment - user's comment
        * 
        * @deprecated use 'recordRatingWidgetWithID' in place of this call
        * */
        _defineProperty(this, "report_feedback", function (ratingWidget) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "report_feedback, Deprecated function call! Use 'recordRatingWidgetWithID' or 'reportFeedbackWidgetManually' in place of this call. Call will be redirected to 'recordRatingWidgetWithID' now!");
            _this.recordRatingWidgetWithID(ratingWidget);
        });
        /**
        * Provide information about user
        * @param {Object} ratingWidget - object with rating widget properties
        * @param {string} ratingWidget.widget_id - id of the widget in the dashboard
        * @param {boolean=} ratingWidget.contactMe - did user give consent to contact him
        * @param {string=} ratingWidget.platform - user's platform (will be filled if not provided)
        * @param {string=} ratingWidget.app_version - app's app version (will be filled if not provided)
        * @param {number} ratingWidget.rating - user's rating from 1 to 5
        * @param {string=} ratingWidget.email - user's email
        * @param {string=} ratingWidget.comment - user's comment
        * */
        _defineProperty(this, "recordRatingWidgetWithID", function (ratingWidget) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "recordRatingWidgetWithID, Providing information about user with ID: [ " + ratingWidget.widget_id + " ]");
            if (!_this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (!ratingWidget.widget_id) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "recordRatingWidgetWithID, Rating Widget must contain widget_id property");
                return;
            }
            if (!ratingWidget.rating) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "recordRatingWidgetWithID, Rating Widget must contain rating property");
                return;
            }
            var props = ["widget_id", "contactMe", "platform", "app_version", "rating", "email", "comment"];
            var event = {
                key: internalEventKeyEnums.STAR_RATING,
                count: 1,
                segmentation: {}
            };
            event.segmentation = createNewObjectFromProperties(ratingWidget, props);
            if (!event.segmentation.app_version) {
                event.segmentation.app_version = _this.metrics._app_version || _this.app_version;
            }
            if (event.segmentation.rating > 5) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "recordRatingWidgetWithID, You have entered a rating higher than 5. Changing it back to 5 now.");
                event.segmentation.rating = 5;
            } else if (event.segmentation.rating < 1) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "recordRatingWidgetWithID, You have entered a rating lower than 1. Changing it back to 1 now.");
                event.segmentation.rating = 1;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "recordRatingWidgetWithID, Reporting Rating Widget: ", event);
            _classPrivateFieldGet2(_add_cly_events, _this).call(_this, event);
        });
        /**
        * Report information about survey, nps or rating widget answers/results
        * @param {Object} CountlyFeedbackWidget - it is the widget object retrieved from get_available_feedback_widgets
        * @param {Object} CountlyWidgetData - it is the widget data object retrieved from getFeedbackWidgetData
        * @param {Object} widgetResult - it is the widget results that need to be reported, different for all widgets, if provided as null it means the widget was closed
        * widgetResult For NPS
        * Should include rating and comment from the nps. Example:
        * widgetResult = {rating: 3, comment: "comment"}
        * 
        * widgetResult For Survey
        * Should include questions ids and their answers as key/value pairs. Keys should be formed as “answ-”+[question.id]. Example:
        * widgetResult = {
        *   "answ-1602694029-0": "Some text field long answer", //for text fields
        *   "answ-1602694029-1": 7, //for rating
        *   "answ-1602694029-2": "ch1602694029-0", //There is a question with choices like multi or radio. It is a choice key.
        *   "answ-1602694029-3": "ch1602694030-0,ch1602694030-1" //In case 2 selected
        *   }
        * 
        * widgetResult For Rating Widget
        * Should include rating, email, comment and contact consent information. Example:
        * widgetResult = {
        *   rating: 2, 
        *   email: "email@mail.com", 
        *   contactMe: true,    
        *   comment: "comment"
        *   }
        * */
        _defineProperty(this, "reportFeedbackWidgetManually", function (CountlyFeedbackWidget, CountlyWidgetData, widgetResult) {
            if (!_this.check_consent(featureEnums.FEEDBACK)) {
                return;
            }
            if (!(CountlyFeedbackWidget && CountlyWidgetData)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget data and/or Widget object not provided. Aborting.");
                return;
            }
            if (!CountlyFeedbackWidget._id) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Feedback Widgets must contain _id property");
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Feedback Widgets can not be reported in offline mode");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "reportFeedbackWidgetManually, Providing information about user with, provided result of the widget with  ID: [ " + CountlyFeedbackWidget._id + " ] and type: [" + CountlyFeedbackWidget.type + "]");

            // type specific checks to see if everything was provided
            var props = [];
            var type = CountlyFeedbackWidget.type;
            var eventKey;
            if (type === "nps") {
                if (widgetResult) {
                    if (!widgetResult.rating) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget must contain rating property");
                        return;
                    }
                    widgetResult.rating = Math.round(widgetResult.rating);
                    if (widgetResult.rating > 10) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating higher than 10. Changing it back to 10 now.");
                        widgetResult.rating = 10;
                    } else if (widgetResult.rating < 0) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating lower than 0. Changing it back to 0 now.");
                        widgetResult.rating = 0;
                    }
                    props = ["rating", "comment"];
                }
                eventKey = internalEventKeyEnums.NPS;
            } else if (type === "survey") {
                if (widgetResult) {
                    if (Object.keys(widgetResult).length < 1) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget should have answers to be reported");
                        return;
                    }
                    props = Object.keys(widgetResult);
                }
                eventKey = internalEventKeyEnums.SURVEY;
            } else if (type === "rating") {
                if (widgetResult) {
                    if (!widgetResult.rating) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget must contain rating property");
                        return;
                    }
                    widgetResult.rating = Math.round(widgetResult.rating);
                    if (widgetResult.rating > 5) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating higher than 5. Changing it back to 5 now.");
                        widgetResult.rating = 5;
                    } else if (widgetResult.rating < 1) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating lower than 1. Changing it back to 1 now.");
                        widgetResult.rating = 1;
                    }
                    props = ["rating", "comment", "email", "contactMe"];
                }
                eventKey = internalEventKeyEnums.STAR_RATING;
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget has an unacceptable type");
                return;
            }

            // event template
            var event = {
                key: eventKey,
                count: 1,
                segmentation: {
                    widget_id: CountlyFeedbackWidget._id,
                    platform: _this.platform,
                    app_version: _this.metrics._app_version || _this.app_version
                }
            };
            if (widgetResult === null) {
                event.segmentation.closed = 1;
            } else {
                // add response to the segmentation
                event.segmentation = addNewProperties(event.segmentation, widgetResult, props);
            }

            // add event
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "reportFeedbackWidgetManually, Reporting " + type + ": ", event);
            _classPrivateFieldGet2(_add_cly_events, _this).call(_this, event);
        });
        /**
        * Show specific widget popup by the widget id
        * @param {string} id - id value of related rating widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
        * 
        * @deprecated use 'feedback.showRating' in place of this call
        */
        _defineProperty(this, "show_feedback_popup", function (id) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "show_feedback_popup, window object is not available. Not showing feedback popup.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "show_feedback_popup, Deprecated function call! Use 'presentRatingWidgetWithID' in place of this call. Call will be redirected now!");
            presentRatingWidgetWithID(id);
        });
        /**
        * Show specific widget popup by the widget id
        * @param {string} id - id value of related rating widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
        * @deprecated use 'feedback.showRating' in place of this call
        */
        _defineProperty(this, "presentRatingWidgetWithID", function (id) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "presentRatingWidgetWithID, window object is not available. Not showing rating widget popup.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "presentRatingWidgetWithID, Showing rating widget popup for the widget with ID: [ " + id + " ]");
            if (!_this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "presentRatingWidgetWithID, Cannot show ratingWidget popup in offline mode");
            } else {
                _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "presentRatingWidgetWithID,", _this.url + "/o/feedback/widget", {
                    widget_id: id,
                    av: _this.app_version
                }, function (err, params, responseText) {
                    if (err) {
                        // error has been logged by the request function
                        return;
                    }
                    try {
                        // widget object
                        var currentWidget = JSON.parse(responseText);
                        _classPrivateFieldGet2(_processWidget, _this).call(_this, currentWidget, false);
                    } catch (JSONParseError) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "presentRatingWidgetWithID, JSON parse failed: " + JSONParseError);
                    }
                    // JSON array can pass 
                }, true);
            }
        });
        /**
        * Prepare rating widgets according to the current options
        * @param {array=} enableWidgets - widget ids array
        * 
        * @deprecated use 'feedback.showRating' in place of this call
        */
        _defineProperty(this, "initialize_feedback_popups", function (enableWidgets) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize_feedback_popups, window object is not available. Not initializing feedback popups.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize_feedback_popups, Deprecated function call! Use 'initializeRatingWidgets' in place of this call. Call will be redirected now!");
            _this.initializeRatingWidgets(enableWidgets);
        });
        /**
        * Prepare rating widgets according to the current options
        * @param {array=} enableWidgets - widget ids array
        * @deprecated use 'feedback.showRating' in place of this call
        */
        _defineProperty(this, "initializeRatingWidgets", function (enableWidgets) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initializeRatingWidgets, window object is not available. Not initializing rating widgets.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "initializeRatingWidgets, Initializing rating widget with provided widget IDs:[ " + enableWidgets + "]");
            if (!_this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (!enableWidgets) {
                enableWidgets = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_fb_widgets");
            }

            // remove all old stickers before add new one
            var stickers = document.getElementsByClassName("countly-feedback-sticker");
            while (stickers.length > 0) {
                stickers[0].remove();
            }
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "initializeRatingWidgets,", _this.url + "/o/feedback/multiple-widgets-by-id", {
                widgets: JSON.stringify(enableWidgets),
                av: _this.app_version
            }, function (err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    return;
                }
                try {
                    // widgets array
                    var widgets = JSON.parse(responseText);
                    for (var i = 0; i < widgets.length; i++) {
                        if (widgets[i].is_active === "true") {
                            var target_devices = widgets[i].target_devices;
                            var currentDevice = userAgentDeviceDetection();
                            // device match check
                            if (target_devices[currentDevice]) {
                                // is hide sticker option selected?
                                if (typeof widgets[i].hide_sticker === "string") {
                                    widgets[i].hide_sticker = widgets[i].hide_sticker === "true";
                                }
                                // is target_page option provided as "All"?
                                if (widgets[i].target_page === "all" && !widgets[i].hide_sticker) {
                                    _classPrivateFieldGet2(_processWidget, _this).call(_this, widgets[i], true);
                                }
                                // is target_page option provided as "selected"?
                                else {
                                    var pages = widgets[i].target_pages;
                                    for (var k = 0; k < pages.length; k++) {
                                        var isWildcardMatched = pages[k].substr(0, pages[k].length - 1) === window.location.pathname.substr(0, pages[k].length - 1);
                                        var isFullPathMatched = pages[k] === window.location.pathname;
                                        var isContainAsterisk = pages[k].includes("*");
                                        if ((isContainAsterisk && isWildcardMatched || isFullPathMatched) && !widgets[i].hide_sticker) {
                                            _classPrivateFieldGet2(_processWidget, _this).call(_this, widgets[i], true);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (JSONParseError) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initializeRatingWidgets, JSON parse error: " + JSONParseError);
                }
                // JSON array can pass
            }, true);
        });
        /**
        * Show rating widget popup by passed widget ids array
        * @param {object=} params - required - includes "popups" property as string array of widgets ("widgets" for old versions)
        * example params: {"popups":["5b21581b967c4850a7818617"]}
        * 
        * @deprecated use 'feedback.showRating' in place of this call
        * */
        _defineProperty(this, "enable_feedback", function (params) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_feedback, window object is not available. Not enabling feedback.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_feedback, Deprecated function call! Use 'enableRatingWidgets' in place of this call. Call will be redirected now!");
            _this.enableRatingWidgets(params);
        });
        /**
        * Show rating widget popup by passed widget ids array
        * @param {object=} params - required - includes "popups" property as string array of widgets ("widgets" for old versions)
        * example params: {"popups":["5b21581b967c4850a7818617"]}
        * @deprecated use 'feedback.showRating' in place of this call
        * */
        _defineProperty(this, "enableRatingWidgets", function (params) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enableRatingWidgets, window object is not available. Not enabling rating widgets.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "enableRatingWidgets, Enabling rating widget with params:", params);
            if (!_this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enableRatingWidgets, Cannot enable rating widgets in offline mode");
            } else {
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_fb_widgets", params.popups || params.widgets);
                // inject feedback styles
                loadCSS(_this.url + "/star-rating/stylesheets/countly-feedback-web.css");
                // get enable widgets by app_key
                // define xhr object
                var enableWidgets = params.popups || params.widgets;
                if (enableWidgets.length > 0) {
                    document.body.insertAdjacentHTML("beforeend", "<div id=\"cfbg\"></div>");
                    _this.initializeRatingWidgets(enableWidgets);
                } else {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enableRatingWidgets, You should provide at least one widget id as param. Read documentation for more detail. https://resources.count.ly/plugins/feedback");
                }
            }
        });
        /**
         * Internal method to display a feedback widget of a specific type.
         * @param {String} widgetType - The type of widget ("nps", "survey", "rating").
         * @param {String} [nameIDorTag] - The name, id, or tag of the widget to display.
         */
        _classPrivateFieldInitSpec(this, _showWidgetInternal, function (widgetType, nameIDorTag) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "showWidget, Showing ".concat(widgetType, " widget, nameIDorTag:[").concat(nameIDorTag, "]"));
            _this.get_available_feedback_widgets(function (feedbackWidgetArray, error) {
                if (error) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "showWidget, Error while getting feedback widgets list: ".concat(error));
                    return;
                }

                // Find the first widget of the specified type, or match by name, id, or tag if provided
                var widget = feedbackWidgetArray.find(function (w) {
                    return w.type === widgetType;
                });
                if (nameIDorTag && typeof nameIDorTag === 'string') {
                    var matchedWidget = feedbackWidgetArray.find(function (w) {
                        return w.type === widgetType && (w.name === nameIDorTag || w._id === nameIDorTag || w.tg.includes(nameIDorTag));
                    });
                    if (matchedWidget) {
                        widget = matchedWidget;
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "showWidget, Found ".concat(widgetType, " widget by name, id, or tag: [").concat(JSON.stringify(matchedWidget), "]"));
                    }
                }
                if (!widget) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "showWidget, No ".concat(widgetType, " widget found."));
                    return;
                }
                _this.present_feedback_widget(widget, null, null, null);
            });
        });
        /**
        * Feedback interface with convenience methods for feedback widgets:
        * - showNPS([String nameIDorTag]) - shows an NPS widget by name, id or tag, or a random one if not provided
        * - showSurvey([String nameIDorTag]) - shows a Survey widget by name, id or tag, or a random one if not provided
        * - showRating([String nameIDorTag]) - shows a Rating widget by name, id or tag, or a random one if not provided
        */
        _defineProperty(this, "feedback", {
            /**
             * Displays the first available NPS widget or the one with the provided name, id, or tag.
             * @param {String} [nameIDorTag] - Name, id, or tag of the NPS widget to display.
             */
            showNPS: function showNPS(nameIDorTag) {
                return _classPrivateFieldGet2(_showWidgetInternal, _this).call(_this, "nps", nameIDorTag);
            },
            /**
             * Displays the first available Survey widget or the one with the provided name, id, or tag.
             * @param {String} [nameIDorTag] - Name, id, or tag of the Survey widget to display.
             */
            showSurvey: function showSurvey(nameIDorTag) {
                return _classPrivateFieldGet2(_showWidgetInternal, _this).call(_this, "survey", nameIDorTag);
            },
            /**
             * Displays the first available Rating widget or the one with the provided name, id, or tag.
             * @param {String} [nameIDorTag] - Name, id, or tag of the Rating widget to display.
             */
            showRating: function showRating(nameIDorTag) {
                return _classPrivateFieldGet2(_showWidgetInternal, _this).call(_this, "rating", nameIDorTag);
            }
        });
        /**
        * This function retrieves all associated widget information (IDs, type, name etc in an array/list of objects) of your app
        * @param {Function} callback - Callback function with two parameters, 1st for returned list, 2nd for error
        * */
        _defineProperty(this, "get_available_feedback_widgets", function (callback) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "get_available_feedback_widgets, Getting the feedback list, callback function is provided:[" + !!callback + "]");
            if (!_this.check_consent(featureEnums.FEEDBACK)) {
                if (callback) {
                    callback(null, new Error("Consent for feedback not provided."));
                }
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "get_available_feedback_widgets, Cannot enable feedback widgets in offline mode.");
                return;
            }
            var url = _this.url + _classPrivateFieldGet2(_readPath, _this);
            var data = {
                method: featureEnums.FEEDBACK,
                device_id: _this.device_id,
                app_key: _this.app_key,
                av: _this.app_version
            };
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "get_available_feedback_widgets,", url, data, function (err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    if (callback) {
                        callback(null, err);
                    }
                    return;
                }
                try {
                    var response = JSON.parse(responseText);
                    var feedbacks = response.result || [];
                    if (callback) {
                        callback(feedbacks, null);
                    }
                } catch (error) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "get_available_feedback_widgets, Error while parsing feedback widgets list: " + error);
                    if (callback) {
                        callback(null, error);
                    }
                }
                // expected response is JSON object
            }, false);
        });
        /**
        * Get feedback (nps, survey or rating) widget data, like questions, message etc.
        * @param {Object} CountlyFeedbackWidget - Widget object, retrieved from 'get_available_feedback_widgets'
        * @param {Function} callback - Callback function with two parameters, 1st for returned widget data, 2nd for error
        * */
        _defineProperty(this, "getFeedbackWidgetData", function (CountlyFeedbackWidget, callback) {
            if (!CountlyFeedbackWidget.type) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "getFeedbackWidgetData, Expected the provided widget object to have a type but got: [" + JSON.stringify(CountlyFeedbackWidget) + "], aborting.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "getFeedbackWidgetData, Retrieving data for: [" + JSON.stringify(CountlyFeedbackWidget) + "], callback function is provided:[" + !!callback + "]");
            if (!_this.check_consent(featureEnums.FEEDBACK)) {
                if (callback) {
                    callback(null, new Error("Consent for feedback not provided."));
                }
                return;
            }
            if (_classPrivateFieldGet2(_offlineMode, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "getFeedbackWidgetData, Cannot enable feedback widgets in offline mode.");
                return;
            }
            var url = _this.url;
            var data = {
                widget_id: CountlyFeedbackWidget._id,
                shown: 1,
                sdk_version: _classPrivateFieldGet2(_sdkVersion, _this),
                sdk_name: _classPrivateFieldGet2(_sdkName, _this),
                platform: _this.platform,
                app_version: _this.app_version
            };
            if (CountlyFeedbackWidget.type === "nps") {
                url += "/o/surveys/nps/widget";
            } else if (CountlyFeedbackWidget.type === "survey") {
                url += "/o/surveys/survey/widget";
            } else if (CountlyFeedbackWidget.type === "rating") {
                url += "/o/surveys/rating/widget";
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "getFeedbackWidgetData, Unknown type info: [" + CountlyFeedbackWidget.type + "]");
                return;
            }

            /**
             *  Server response would be evaluated here
             * @param {*} err - error object
             * @param {*} params - parameters
             * @param {*} responseText - server reponse text
             */
            var responseCallback = function responseCallback(err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    if (callback) {
                        callback(null, err);
                    }
                    return;
                }
                try {
                    var response = JSON.parse(responseText);
                    // return parsed response
                    if (callback) {
                        callback(response, null);
                    }
                } catch (error) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "getFeedbackWidgetData, Error while parsing feedback widgets list: " + error);
                    if (callback) {
                        callback(null, error);
                    }
                }
            };
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "getFeedbackWidgetData,", url, data, responseCallback, true);
        });
        /**
        * Present the feedback widget in webview
        * @param {Object} presentableFeedback - Current presentable feedback
        * @param {String} [id] - DOM id to append the feedback widget (optional, in case not used pass undefined)
        * @param {String} [className] - Class name to append the feedback widget (optional, in case not used pass undefined)
        * @param {Object} [feedbackWidgetSegmentation] - Segmentation object to be passed to the feedback widget (optional)
        * */
        _defineProperty(this, "present_feedback_widget", function (presentableFeedback, id, className, feedbackWidgetSegmentation) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "present_feedback_widget, window object is not available. Not presenting feedback widget.");
                return;
            }
            // TODO: feedbackWidgetSegmentation implementation only assumes we want to send segmentation data. Change it if we add more data to the custom object.
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "present_feedback_widget, Presenting the feedback widget by appending to the element with ID: [ " + id + " ] and className: [ " + className + " ]");
            if (!_this.check_consent(featureEnums.FEEDBACK)) {
                return;
            }
            if (!presentableFeedback || _typeof(presentableFeedback) !== "object" || Array.isArray(presentableFeedback)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "present_feedback_widget, Please provide at least one feedback widget object.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "present_feedback_widget, Adding segmentation to feedback widgets:[" + JSON.stringify(feedbackWidgetSegmentation) + "]");
            if (!feedbackWidgetSegmentation || _typeof(feedbackWidgetSegmentation) !== "object" || Object.keys(feedbackWidgetSegmentation).length === 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Segmentation is not an object or empty");
                feedbackWidgetSegmentation = null;
            }
            try {
                var url = _this.url;
                if (presentableFeedback.type === "nps") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Widget type: nps.");
                    url += "/feedback/nps";
                } else if (presentableFeedback.type === "survey") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Widget type: survey.");
                    url += "/feedback/survey";
                } else if (presentableFeedback.type === "rating") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Widget type: rating.");
                    url += "/feedback/rating";
                } else {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "present_feedback_widget, Feedback widget only accepts nps, rating and survey types.");
                    return;
                }
                var passedOrigin = window.origin || window.location.origin;
                var feedbackWidgetFamily;

                // set feedback widget family as ratings and load related style file when type is ratings
                if (presentableFeedback.type === "rating") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Loading css for rating widget.");
                    feedbackWidgetFamily = "ratings";
                    loadCSS(_this.url + "/star-rating/stylesheets/countly-feedback-web.css");
                }
                // if it's not ratings, it means we need to name it as surveys and load related style file
                // (at least until we add new type in future)
                else {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Loading css for survey or nps.");
                    loadCSS(_this.url + "/surveys/stylesheets/countly-surveys.css");
                    feedbackWidgetFamily = "surveys";
                }
                url += "?widget_id=" + presentableFeedback._id;
                url += "&app_key=" + _this.app_key;
                url += "&device_id=" + _this.device_id;
                url += "&sdk_name=" + _classPrivateFieldGet2(_sdkName, _this);
                url += "&platform=" + _this.platform;
                url += "&app_version=" + _this.app_version;
                url += "&sdk_version=" + _classPrivateFieldGet2(_sdkVersion, _this);
                var customObjectToSendWithTheWidget = {};
                customObjectToSendWithTheWidget.tc = 1; // indicates SDK supports opening links from the widget in a new tab
                if (feedbackWidgetSegmentation) {
                    customObjectToSendWithTheWidget.sg = feedbackWidgetSegmentation;
                }
                var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
                customObjectToSendWithTheWidget.width = resInfo.width;
                customObjectToSendWithTheWidget.height = resInfo.height;
                url += "&custom=" + JSON.stringify(customObjectToSendWithTheWidget);
                // Origin is passed to the popup so that it passes it back in the postMessage event
                // Only web SDK passes origin and web
                url += "&origin=" + passedOrigin;
                url += "&widget_v=web";
                var iframe = document.createElement("iframe");
                iframe.src = url;
                iframe.name = "countly-" + feedbackWidgetFamily + "-iframe";
                iframe.id = "countly-" + feedbackWidgetFamily + "-iframe";
                var initiated = false;
                iframe.onload = function () {
                    // This is used as a fallback for browsers where postMessage API doesn't work.

                    if (initiated) {
                        // On iframe reset remove the iframe and the overlay.
                        document.getElementById("countly-" + feedbackWidgetFamily + "-wrapper-" + presentableFeedback._id).style.display = "none";
                        document.getElementById("csbg").style.display = "none";
                    }

                    // Setting initiated marks the first time initiation of the iframe.
                    // When initiated for the first time, do not hide the survey because you want
                    // the survey to be shown for the first time.
                    // Any subsequent onload means that the survey is being refreshed or reset.
                    // This time hide it as being done in the above check.
                    initiated = true;
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Loaded iframe.");
                };
                var overlay = document.getElementById("csbg");
                while (overlay) {
                    // Remove any existing overlays
                    overlay.remove();
                    overlay = document.getElementById("csbg");
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Removing past overlay.");
                }
                var wrapper = document.getElementsByClassName("countly-" + feedbackWidgetFamily + "-wrapper");
                for (var i = 0; i < wrapper.length; i++) {
                    // Remove any existing feedback wrappers
                    wrapper[i].remove();
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Removed a wrapper.");
                }
                wrapper = document.createElement("div");
                var wrapperClass = "countly-" + feedbackWidgetFamily + "-wrapper";
                wrapper.className = wrapperClass + " " + wrapperClass + "--" + presentableFeedback.type;
                wrapper.id = "countly-" + feedbackWidgetFamily + "-wrapper-" + presentableFeedback._id;
                if (presentableFeedback.type === "survey") {
                    // Set popup position
                    wrapper.className = wrapper.className + " " + presentableFeedback.appearance.position;
                }
                var element = document.body;
                var found = false;
                if (id) {
                    if (document.getElementById(id)) {
                        element = document.getElementById(id);
                        found = true;
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "present_feedback_widget, Provided ID not found.");
                    }
                }
                if (!found) {
                    // If the id element is not found check if a class was provided
                    if (className) {
                        if (document.getElementsByClassName(className)[0]) {
                            element = document.getElementsByClassName(className)[0];
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "present_feedback_widget, Provided class not found.");
                        }
                    }
                }
                element.insertAdjacentHTML("beforeend", "<div id=\"csbg\"></div>");
                element.appendChild(wrapper);
                if (presentableFeedback.type === "rating") {
                    // create a overlay div and inject it to wrapper
                    var ratingsOverlay = document.createElement("div");
                    ratingsOverlay.className = "countly-ratings-overlay";
                    ratingsOverlay.id = "countly-ratings-overlay-" + presentableFeedback._id;
                    wrapper.appendChild(ratingsOverlay);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, appended the rating overlay to wrapper");

                    // add an event listener for the overlay
                    // so if someone clicked on the overlay, we can close popup
                    add_event_listener(document.getElementById("countly-ratings-overlay-" + presentableFeedback._id), "click", function () {
                        document.getElementById("countly-ratings-wrapper-" + presentableFeedback._id).style.display = "none";
                    });
                }
                wrapper.appendChild(iframe);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, Appended the iframe");
                add_event_listener(window, "message", function (event) {
                    _classPrivateFieldGet2(_interpretFeedbackWidgetMessage, _this).call(_this, event, wrapper, iframe);
                });
                var resizeTimeout;
                add_event_listener(window, 'resize', function () {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function () {
                        var width = window.innerWidth;
                        var height = window.innerHeight;
                        var feedbackWidgetIframe = document.getElementById("countly-" + feedbackWidgetFamily + "-iframe");
                        if (!feedbackWidgetIframe) {
                            return;
                        }
                        feedbackWidgetIframe.contentWindow.postMessage({
                            type: 'resize',
                            width: width,
                            height: height
                        }, '*');
                    }, 200);
                });
                /**
                 * Function to show survey popup
                 * @param  {Object} feedback - feedback object
                 */
                var showSurvey = function showSurvey(feedback) {
                    document.getElementById("countly-surveys-wrapper-" + feedback._id).style.display = "block";
                    document.getElementById("csbg").style.display = "block";
                };

                /**
                 * Function to prepare rating sticker and feedback widget
                 * @param  {Object} feedback - feedback object
                 */
                var showRatingForFeedbackWidget = function showRatingForFeedbackWidget(feedback) {
                    // remove old stickers if exists
                    var stickers = document.getElementsByClassName("countly-feedback-sticker");
                    while (stickers.length > 0) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "present_feedback_widget, Removing old stickers");
                        stickers[0].remove();
                    }

                    // render sticker if hide sticker property isn't set
                    if (!feedback.appearance.hideS) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "present_feedback_widget, handling the sticker as it was not set to hidden");
                        // create sticker wrapper element
                        var sticker = document.createElement("div");
                        sticker.innerText = feedback.appearance.text;
                        sticker.style.color = feedback.appearance.text_color.length < 7 ? "#" + feedback.appearance.text_color : feedback.appearance.text_color;
                        sticker.style.backgroundColor = feedback.appearance.bg_color.length < 7 ? "#" + feedback.appearance.bg_color : feedback.appearance.bg_color;
                        sticker.className = "countly-feedback-sticker  " + feedback.appearance.position + "-" + feedback.appearance.size;
                        sticker.id = "countly-feedback-sticker-" + feedback._id;
                        document.body.appendChild(sticker);

                        // sticker event handler
                        add_event_listener(document.getElementById("countly-feedback-sticker-" + feedback._id), "click", function () {
                            document.getElementById("countly-ratings-wrapper-" + feedback._id).style.display = "flex";
                            document.getElementById("csbg").style.display = "block";
                        });
                    }

                    // feedback widget close event handler
                    // TODO: Check if this is still valid
                    add_event_listener(document.getElementById("countly-feedback-close-icon-" + feedback._id), "click", function () {
                        document.getElementById("countly-ratings-wrapper-" + feedback._id).style.display = "none";
                        document.getElementById("csbg").style.display = "none";
                    });
                };
                if (presentableFeedback.type === "survey") {
                    var surveyShown = false;

                    // Set popup show policy
                    switch (presentableFeedback.showPolicy) {
                        case "afterPageLoad":
                            if (document.readyState === "complete") {
                                if (!surveyShown) {
                                    surveyShown = true;
                                    showSurvey(presentableFeedback);
                                }
                            } else {
                                add_event_listener(document, "readystatechange", function (e) {
                                    if (e.target.readyState === "complete") {
                                        if (!surveyShown) {
                                            surveyShown = true;
                                            showSurvey(presentableFeedback);
                                        }
                                    }
                                });
                            }
                            break;
                        case "afterConstantDelay":
                            setTimeout(function () {
                                if (!surveyShown) {
                                    surveyShown = true;
                                    showSurvey(presentableFeedback);
                                }
                            }, 10000);
                            break;
                        case "onAbandon":
                            if (document.readyState === "complete") {
                                add_event_listener(document, "mouseleave", function () {
                                    if (!surveyShown) {
                                        surveyShown = true;
                                        showSurvey(presentableFeedback);
                                    }
                                });
                            } else {
                                add_event_listener(document, "readystatechange", function (e) {
                                    if (e.target.readyState === "complete") {
                                        add_event_listener(document, "mouseleave", function () {
                                            if (!surveyShown) {
                                                surveyShown = true;
                                                showSurvey(presentableFeedback);
                                            }
                                        });
                                    }
                                });
                            }
                            break;
                        case "onScrollHalfwayDown":
                            add_event_listener(window, "scroll", function () {
                                if (!surveyShown) {
                                    var scrollY = Math.max(window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);
                                    var documentHeight = getDocHeight();
                                    if (scrollY >= documentHeight / 2) {
                                        surveyShown = true;
                                        showSurvey(presentableFeedback);
                                    }
                                }
                            });
                            break;
                        default:
                            if (!surveyShown) {
                                surveyShown = true;
                                showSurvey(presentableFeedback);
                            }
                    }
                } else if (presentableFeedback.type === "nps") {
                    document.getElementById("countly-" + feedbackWidgetFamily + "-wrapper-" + presentableFeedback._id).style.display = "block";
                    document.getElementById("csbg").style.display = "block";
                } else if (presentableFeedback.type === "rating") {
                    var ratingShown = false;
                    if (document.readyState === "complete") {
                        if (!ratingShown) {
                            ratingShown = true;
                            showRatingForFeedbackWidget(presentableFeedback);
                        }
                    } else {
                        add_event_listener(document, "readystatechange", function (e) {
                            if (e.target.readyState === "complete") {
                                if (!ratingShown) {
                                    ratingShown = true;
                                    showRatingForFeedbackWidget(presentableFeedback);
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "present_feedback_widget, Something went wrong while presenting the widget: " + e);
            }
        });
        _classPrivateFieldInitSpec(this, _interpretFeedbackWidgetMessage, function (messageEvent, wrapper, iframe) {
            if (!iframe || messageEvent.source !== iframe.contentWindow) {
                //this.#log(logLevelEnums.WARNING, "interpretFeedbackWidgetMessage, Received message from an unknown source, ignoring.");
                //silent ignore
                return;
            }
            var data = {};
            try {
                if (_typeof(messageEvent.data) === "object" && messageEvent.data !== null) {
                    data = messageEvent.data;
                } else {
                    data = JSON.parse(messageEvent.data);
                }
            } catch (ex) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "interpretFeedbackWidgetMessage, Error while parsing message body " + ex);
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretFeedbackWidgetMessage, Received message from widget with origin: [" + messageEvent.origin + "] and data: [" + JSON.stringify(data) + "]");
            var _data = data;
            _data.key;
            var resize_me = _data.resize_me,
                close = _data.close;
            // use action when avaliable

            if (resize_me) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretFeedbackWidgetMessage, Resizing iframe to: [" + JSON.stringify(resize_me) + "]");
                var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
                if (!resize_me.l || !resize_me.p) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "interpretFeedbackWidgetMessage, Invalid resize object");
                    return;
                }
                var dimensionToUse = resize_me.p;
                if (resInfo.width >= resInfo.height) {
                    dimensionToUse = resize_me.l;
                }
                wrapper.style.height = dimensionToUse.h + "px";
                wrapper.style.width = dimensionToUse.w + "px";
                wrapper.style.top = dimensionToUse.y + "px";
                wrapper.style.left = dimensionToUse.x + "px";
                iframe.style.height = dimensionToUse.h + "px";
                iframe.style.width = dimensionToUse.w + "px";
                iframe.style.top = dimensionToUse.y + "px";
                iframe.style.left = dimensionToUse.x + "px";
                return;
            }
            if (close && (close === true || close === 1)) {
                wrapper.style.display = "none";
                iframe.style.display = "none";
                document.getElementById("csbg").style.display = "none";
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretFeedbackWidgetMessage, Closed the widget");
            }
        });
        /**
         *  Record and report error, this is were tracked errors are modified and send to the request queue
         *  @param {Error} err - Error object
         *  @param {Boolean} nonfatal - nonfatal if true and false if fatal
         *  @param {Object} segments - custom crash segments
         */
        _defineProperty(this, "recordError", function (err, nonfatal, segments) {
            if (!_classPrivateFieldGet2(_SCTrackingCrashes, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "recordError, Crash tracking is disabled by the server config. Not tracking errors.");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "recordError, Recording error");
            if (_this.check_consent(featureEnums.CRASHES) && err) {
                // crashSegments, if not null, was set while enabling error tracking
                segments = segments || _classPrivateFieldGet2(_crashSegments, _this);
                var error = "";
                if (_typeof(err) === "object") {
                    if (typeof err.stack !== "undefined") {
                        error = err.stack;
                    } else {
                        if (typeof err.name !== "undefined") {
                            error += err.name + ":";
                        }
                        if (typeof err.message !== "undefined") {
                            error += err.message + "\n";
                        }
                        if (typeof err.fileName !== "undefined") {
                            error += "in " + err.fileName + "\n";
                        }
                        if (typeof err.lineNumber !== "undefined") {
                            error += "on " + err.lineNumber;
                        }
                        if (typeof err.columnNumber !== "undefined") {
                            error += ":" + err.columnNumber;
                        }
                    }
                } else {
                    error = err + "";
                }
                // character limit check
                if (error.length > _classPrivateFieldGet2(_SCLimitStackTraceLineLength, _this) * _classPrivateFieldGet2(_SCLimitStackTraceLinesPerThread, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "record_error, Error stack is too long will be truncated");
                    // convert error into an array split from each newline 
                    var splittedError = error.split("\n");
                    // trim the array if it is too long
                    if (splittedError.length > _classPrivateFieldGet2(_SCLimitStackTraceLinesPerThread, _this)) {
                        splittedError = splittedError.splice(0, _classPrivateFieldGet2(_SCLimitStackTraceLinesPerThread, _this));
                    }
                    // trim each line to a given limit
                    for (var i = 0, len = splittedError.length; i < len; i++) {
                        if (splittedError[i].length > _classPrivateFieldGet2(_SCLimitStackTraceLineLength, _this)) {
                            splittedError[i] = splittedError[i].substring(0, _classPrivateFieldGet2(_SCLimitStackTraceLineLength, _this));
                        }
                    }
                    // turn modified array back into error string
                    error = splittedError.join("\n");
                }
                nonfatal = !!nonfatal;
                var metrics = _classPrivateFieldGet2(_getMetrics, _this).call(_this);
                var obj = {
                    _resolution: metrics._resolution,
                    _error: error,
                    _app_version: metrics._app_version,
                    _run: getTimestamp() - _classPrivateFieldGet2(_startTime, _this)
                };
                obj._not_os_specific = true;
                obj._javascript = true;
                var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery || navigator.msBattery;
                if (battery) {
                    obj._bat = Math.floor(battery.level * 100);
                }
                if (typeof navigator.onLine !== "undefined") {
                    obj._online = !!navigator.onLine;
                }
                if (isBrowser) {
                    obj._background = !document.hasFocus();
                }
                if (_classPrivateFieldGet2(_crashLogs, _this).length > 0) {
                    obj._logs = _classPrivateFieldGet2(_crashLogs, _this).join("\n");
                }
                _classPrivateFieldSet2(_crashLogs, _this, []);
                obj._nonfatal = nonfatal;
                obj._view = _this.getViewName();
                if (typeof segments !== "undefined") {
                    // truncate custom crash segment's key value pairs
                    segments = truncateObject(segments, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "record_error", _classPrivateFieldGet2(_log, _this));
                    obj._custom = segments;
                }
                try {
                    var canvas = document.createElement("canvas");
                    var gl = canvas.getContext("experimental-webgl");
                    obj._opengl = gl.getParameter(gl.VERSION);
                } catch (ex) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Could not get the experimental-webgl context: " + ex);
                }

                // send userAgent string with the crash object incase it gets removed by a gateway
                var req = {};
                req.metrics = JSON.stringify({
                    _ua: metrics._ua
                });
                if (_classPrivateFieldGet2(_crashFilterCallback, _this) && typeof _classPrivateFieldGet2(_crashFilterCallback, _this) === "function") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "recordError, Applying crash filter to:[" + JSON.stringify(obj) + "]");
                    obj = _classPrivateFieldGet2(_crashFilterCallback, _this).call(_this, obj);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "recordError, Filtered crash object:[" + JSON.stringify(obj) + "]");
                }
                if (!obj) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "recordError, Crash object was filtered out");
                    return;
                }

                // error should be re-truncated incase it was modified by the filter
                req.crash = JSON.stringify(obj);
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, req);
            }
        });
        /**
         *  Check if user or visit should be ignored
         */
        _classPrivateFieldInitSpec(this, _checkIgnore, function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "checkIgnore, Checking if user or visit should be ignored");
            if (_this.ignore_prefetch && isBrowser && typeof document.visibilityState !== "undefined" && document.visibilityState === "prerender") {
                _this.ignore_visitor = true;
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "checkIgnore, Ignoring visit due to prerendering");
            }
            if (_this.ignore_bots && userAgentSearchBotDetection()) {
                _this.ignore_visitor = true;
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "checkIgnore, Ignoring visit due to bot");
            }
        });
        _defineProperty(this, "content", {
            enterContentZone: function enterContentZone(filter_callback) {
                _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this, undefined, filter_callback);
            },
            refreshContentZone: function refreshContentZone() {
                _classPrivateFieldGet2(_refreshContentZoneInternal, _this).call(_this);
            },
            exitContentZone: function exitContentZone() {
                _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
            }
        });
        /**
         * Internal method to enter content zone
         * Initializes content zone tracking and content requests
         * @private
         * @param {boolean} [forced] - Whether to force enter even if already in content zone
         * @param {function} [filter_callback] - Optional callback to filter content
         */
        _classPrivateFieldInitSpec(this, _enterContentZoneInternal, function (forced, filter_callback) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "content.enterContentZone, window object is not available. Not entering content zone.");
                return;
            }
            if (_classPrivateFieldGet2(_inContentZone, _this) && !forced) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.enterContentZone, Already in content zone");
                return;
            }
            if (filter_callback && typeof filter_callback == "function") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.enterContentZone, Content filter callback is provided");
                _classPrivateFieldSet2(_contentFilterCallback, _this, filter_callback);
            }
            if (!_classPrivateFieldGet2(_initTimestamp, _this) || getMsTimestamp() - _classPrivateFieldGet2(_initTimestamp, _this) < 4000) {
                // settimeout
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.enterContentZone, Not enough time passed since initialization");
                setTimeout(function () {
                    _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                }, 4001);
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "content.enterContentZone, Entering content zone");
            _classPrivateFieldSet2(_inContentZone, _this, true);
            if (!forced) {
                _classPrivateFieldGet2(_sendContentRequest, _this).call(_this);
            }
            _classPrivateFieldSet2(_contentZoneTimer, _this, setInterval(function () {
                _classPrivateFieldGet2(_sendContentRequest, _this).call(_this);
            }, _classPrivateFieldGet2(_SCIntervalContent, _this)));
        });
        /**
         * Internal method to refresh content zone
         * Triggers a content refresh request while in content zone
         * @private
         */
        _classPrivateFieldInitSpec(this, _refreshContentZoneInternal, function () {
            if (!_classPrivateFieldGet2(_SCEnableRefreshContentZone, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.refreshContentZone, Refresh content zone is disabled");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "content.refreshContentZone, Refreshing content zone");
            _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
            _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
            _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
            setTimeout(function () {
                _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
            }, 1000);
        });
        /**
         * Internal method to exit content zone
         * Stops content zone tracking and cleans up timers
         * @private
         */
        _classPrivateFieldInitSpec(this, _exitContentZoneInternal, function () {
            if (!_classPrivateFieldGet2(_inContentZone, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.exitContentZone, Not in content zone");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "content.exitContentZone, Exiting content zone");
            _classPrivateFieldSet2(_inContentZone, _this, false);
            if (_classPrivateFieldGet2(_contentZoneTimer, _this)) {
                clearInterval(_classPrivateFieldGet2(_contentZoneTimer, _this));
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.exitContentZone, content zone exited");
            }
        });
        _classPrivateFieldInitSpec(this, _prepareContentRequest, function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "prepareContentRequest, forming content request");
            var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
            var resToSend = {
                l: {},
                p: {}
            };
            var lWidthPHeight = Math.max(resInfo.width, resInfo.height);
            var lHeightPWidth = Math.min(resInfo.width, resInfo.height);
            resToSend.l.w = lWidthPHeight;
            resToSend.l.h = lHeightPWidth;
            resToSend.p.w = lHeightPWidth;
            resToSend.p.h = lWidthPHeight;
            var local = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
            var language = local.split('-')[0];
            var params = {
                method: "queue",
                la: language,
                resolution: JSON.stringify(resToSend),
                cly_ws: 1,
                cly_origin: window.location.origin,
                dt: userAgentDeviceDetection()
            };
            _classPrivateFieldGet2(_prepareRequest, _this).call(_this, params);
            return params;
        });
        _classPrivateFieldInitSpec(this, _sendContentRequest, function (callback) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendContentRequest, sending content request");
            var params = _classPrivateFieldGet2(_prepareContentRequest, _this).call(_this);
            var finalizeContentRequest = function finalizeContentRequest(success) {
                if (typeof callback === "function") {
                    callback(success);
                }
            };
            _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "sendContentRequest,", _this.url + _classPrivateFieldGet2(_contentEndPoint, _this), params, function (e, param, resp) {
                if (e) {
                    finalizeContentRequest(false);
                    return;
                }
                if (!resp) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "sendContentRequest, no content to display");
                    finalizeContentRequest(false);
                    return;
                }
                try {
                    var response = JSON.parse(resp);
                } catch (error) {
                    // verbose log
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "sendContentRequest, No content to display or an error while parsing content: " + error);
                    finalizeContentRequest(false);
                    return;
                }
                if (!response.html || !response.geo) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "sendContentRequest, no html content or orientation to display");
                    finalizeContentRequest(false);
                    return;
                }

                // Build query params
                var queryParams = {};
                var qIndex = response.html.indexOf("?");
                if (qIndex !== -1) {
                    var search = response.html.slice(qIndex + 1);
                    new URLSearchParams(search).forEach(function (v, k) {
                        queryParams[k] = v;
                    });
                }

                // Filter check
                if (_classPrivateFieldGet2(_contentFilterCallback, _this) && _classPrivateFieldGet2(_contentFilterCallback, _this).call(_this, queryParams) === false) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "sendContentRequest, Content was filtered out by the content filter");
                    finalizeContentRequest(false);
                    return;
                }
                _classPrivateFieldGet2(_displayContent, _this).call(_this, response);
                clearInterval(_classPrivateFieldGet2(_contentZoneTimer, _this)); // prevent multiple content requests while one is on
                // this needs to be deleted after content is closed
                // otherwise it listens forever
                window.addEventListener('message', function (event) {
                    _classPrivateFieldGet2(_interpretContentMessage, _this).call(_this, event);
                });
                var resizeTimeout;
                window.addEventListener('resize', function () {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(function () {
                        var width = window.innerWidth;
                        var height = window.innerHeight;
                        var iframe = document.getElementById(_classPrivateFieldGet2(_contentIframeID, _this));
                        if (!iframe) {
                            return;
                        }
                        iframe.contentWindow.postMessage({
                            type: 'resize',
                            width: width,
                            height: height
                        }, '*');
                    }, 200);
                });
                finalizeContentRequest(true);
            }, true);
        });
        _classPrivateFieldInitSpec(this, _displayContent, function (response) {
            try {
                var iframe = document.createElement("iframe");
                iframe.id = _classPrivateFieldGet2(_contentIframeID, _this);
                // always https in the future
                // response.html = response.html.replace(/http:\/\//g, "https://");
                iframe.src = response.html;
                iframe.style.position = "absolute";
                if (response.html.indexOf("feedback/survey") != -1) {
                    // for surveys to scroll with the page (nps is not in journeys yet)
                    iframe.style.position = "fixed";
                }
                var dimensionToUse = response.geo.p;
                var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
                if (resInfo.width >= resInfo.height) {
                    dimensionToUse = response.geo.l;
                }
                ;
                iframe.style.left = dimensionToUse.x + "px";
                iframe.style.top = dimensionToUse.y + "px";
                iframe.style.width = dimensionToUse.w + "px";
                iframe.style.height = dimensionToUse.h + "px";
                iframe.style.border = "none";
                iframe.style.zIndex = "999999";
                document.body.appendChild(iframe);
            } catch (error) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "displayContent, Error while creating iframe for the content: " + error);
            }
        });
        _classPrivateFieldInitSpec(this, _interpretContentMessage, function (messageEvent) {
            if (_this.contentWhitelist.indexOf(messageEvent.origin) === -1) {
                // this.#log(logLevelEnums.ERROR, "interpretContentMessage, Received message from invalid origin");
                // silent ignore
                return;
            }
            if (messageEvent.data === null || _typeof(messageEvent.data) !== "object") {
                // silent ignore, we only accept object messages
                // This prevents destructuring strings which would expose String.prototype methods
                return;
            }
            var iframe = document.getElementById(_classPrivateFieldGet2(_contentIframeID, _this));
            if (!iframe || messageEvent.source !== iframe.contentWindow) {
                //this.#log(logLevelEnums.WARNING, "interpretContentMessage, Received message from an unknown source, ignoring.");
                //silent ignore
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Received message from: [" + messageEvent.origin + "] with data: [" + JSON.stringify(messageEvent.data) + "]");
            var _messageEvent$data = messageEvent.data,
                close = _messageEvent$data.close,
                link = _messageEvent$data.link,
                event = _messageEvent$data.event,
                resize_me = _messageEvent$data.resize_me;
            if (event) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Received event");
                if (close === 1) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Closing content frame for event");
                    _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                }
                if (!Array.isArray(event)) {
                    if (_typeof(event) === "object") {
                        _readOnlyError("event");
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "interpretContentMessage, Invalid event type: [" + _typeof(event) + "]");
                        return;
                    }
                }
                // event is expected to be an array of events
                for (var i = 0; i < event.length; i++) {
                    _classPrivateFieldGet2(_add_cly_events, _this).call(_this, event[i]); // let this method handle the event
                }
            }
            if (link && typeof link === "string") {
                if (close === 1) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Closing content frame for link");
                    _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                }
                window.open(link, "_blank");
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Opened link in new tab: [".concat(link, "]"));
            }
            if (resize_me) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Resizing iframe");
                var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
                if (!resize_me.l || !resize_me.p) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "interpretContentMessage, Invalid resize object");
                    return;
                }
                var dimensionToUse = resize_me.p;
                if (resInfo.width >= resInfo.height) {
                    dimensionToUse = resize_me.l;
                }
                iframe.style.left = dimensionToUse.x + "px";
                iframe.style.top = dimensionToUse.y + "px";
                iframe.style.width = dimensionToUse.w + "px";
                iframe.style.height = dimensionToUse.h + "px";
            }
            if (close === 1) {
                _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
            }
        });
        _classPrivateFieldInitSpec(this, _closeContentFrame, function () {
            // we might want to remove event listeners here too but with the current implementation, it seems unnecessary
            var iframe = document.getElementById(_classPrivateFieldGet2(_contentIframeID, _this));
            if (iframe) {
                iframe.remove();
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, removed iframe");
                if (_classPrivateFieldGet2(_inContentZone, _this)) {
                    // if user did not exit content zone, re-enter
                    _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this, true);
                }
            }
        });
        /**
         * Check and send the events to request queue if there are any, empty the event queue
         */
        _classPrivateFieldInitSpec(this, _sendEventsForced, function () {
            if (_classPrivateFieldGet2(_eventQueue, _this).length > 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Flushing events");
                _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                    events: JSON.stringify(_classPrivateFieldGet2(_eventQueue, _this))
                });
                _classPrivateFieldSet2(_eventQueue, _this, []);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", _classPrivateFieldGet2(_eventQueue, _this));
            }
        });
        /**
         *  Prepare widget data for displaying
         *  @param {Object} currentWidget - widget object
         *  @param {Boolean} hasSticker - if widget has sticker
         */
        _classPrivateFieldInitSpec(this, _processWidget, function (currentWidget, hasSticker) {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "processWidget, window object is not available. Not processing widget.");
                return;
            }
            // prevent widget create process if widget exist with same id
            var isDuplicate = !!document.getElementById("countly-feedback-sticker-" + currentWidget._id);
            if (isDuplicate) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Widget with same ID exists");
                return;
            }
            try {
                // create wrapper div
                var wrapper = document.createElement("div");
                wrapper.className = "countly-iframe-wrapper";
                wrapper.id = "countly-iframe-wrapper-" + currentWidget._id;
                // create close icon for iframe popup
                var closeIcon = document.createElement("span");
                closeIcon.className = "countly-feedback-close-icon";
                closeIcon.id = "countly-feedback-close-icon-" + currentWidget._id;
                closeIcon.innerText = "x";

                // create iframe
                var iframe = document.createElement("iframe");
                iframe.name = "countly-feedback-iframe";
                iframe.id = "countly-feedback-iframe";
                iframe.src = _this.url + "/feedback?widget_id=" + currentWidget._id + "&app_key=" + _this.app_key + "&device_id=" + _this.device_id + "&sdk_version=" + _classPrivateFieldGet2(_sdkVersion, _this);
                // inject them to dom
                document.body.appendChild(wrapper);
                wrapper.appendChild(closeIcon);
                wrapper.appendChild(iframe);
                add_event_listener(document.getElementById("countly-feedback-close-icon-" + currentWidget._id), "click", function () {
                    document.getElementById("countly-iframe-wrapper-" + currentWidget._id).style.display = "none";
                    document.getElementById("cfbg").style.display = "none";
                });
                if (hasSticker) {
                    // create svg element
                    var svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svgIcon.id = "feedback-sticker-svg";
                    svgIcon.setAttribute("aria-hidden", "true");
                    svgIcon.setAttribute("data-prefix", "far");
                    svgIcon.setAttribute("data-icon", "grin");
                    svgIcon.setAttribute("class", "svg-inline--fa fa-grin fa-w-16");
                    svgIcon.setAttribute("role", "img");
                    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgIcon.setAttribute("viewBox", "0 0 496 512");
                    // create path for svg
                    var svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    svgPath.id = "smileyPathInStickerSvg";
                    svgPath.setAttribute("fill", "white");
                    svgPath.setAttribute("d", "M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm105.6-151.4c-25.9 8.3-64.4 13.1-105.6 13.1s-79.6-4.8-105.6-13.1c-9.9-3.1-19.4 5.4-17.7 15.3 7.9 47.1 71.3 80 123.3 80s115.3-32.9 123.3-80c1.6-9.8-7.7-18.4-17.7-15.3zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z");
                    // create sticker text wrapper
                    var stickerText = document.createElement("span");
                    stickerText.innerText = currentWidget.trigger_button_text;
                    // create sticker wrapper element
                    var sticker = document.createElement("div");
                    sticker.style.color = currentWidget.trigger_font_color.length < 7 ? "#" + currentWidget.trigger_font_color : currentWidget.trigger_font_color;
                    sticker.style.backgroundColor = currentWidget.trigger_bg_color.length < 7 ? "#" + currentWidget.trigger_bg_color : currentWidget.trigger_bg_color;
                    sticker.className = "countly-feedback-sticker  " + currentWidget.trigger_position + "-" + currentWidget.trigger_size;
                    sticker.id = "countly-feedback-sticker-" + currentWidget._id;
                    svgIcon.appendChild(svgPath);
                    sticker.appendChild(svgIcon);
                    sticker.appendChild(stickerText);
                    document.body.appendChild(sticker);
                    var smileySvg = document.getElementById("smileyPathInStickerSvg");
                    if (smileySvg) {
                        smileySvg.style.fill = currentWidget.trigger_font_color.length < 7 ? "#" + currentWidget.trigger_font_color : currentWidget.trigger_font_color;
                    }
                    add_event_listener(document.getElementById("countly-feedback-sticker-" + currentWidget._id), "click", function () {
                        document.getElementById("countly-iframe-wrapper-" + currentWidget._id).style.display = "block";
                        document.getElementById("cfbg").style.display = "block";
                    });
                } else {
                    document.getElementById("countly-iframe-wrapper-" + currentWidget._id).style.display = "block";
                    document.getElementById("cfbg").style.display = "block";
                }
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Somethings went wrong while element injecting process: " + e);
            }
        });
        /**
         *  Notify all waiting callbacks that script was loaded and instance created
         */
        _classPrivateFieldInitSpec(this, _notifyLoaders, function () {
            // notify load waiters
            var i;
            if (typeof _this.onload !== "undefined" && _this.onload.length > 0) {
                for (i = 0; i < _this.onload.length; i++) {
                    if (typeof _this.onload[i] === "function") {
                        _this.onload[i](_this);
                    }
                }
                _this.onload = [];
            }
        });
        /**
         *  Report duration of how long user was on this view
         *  @memberof Countly._internals
         */
        _classPrivateFieldInitSpec(this, _reportViewDuration, function () {
            if (!_classPrivateFieldGet2(_lastView, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "reportViewDuration, No last view, will not report view duration");
                return;
            }
            if (!_classPrivateFieldGet2(_SCTrackingViews, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "reportViewDuration, View tracking is disabled by the server config. Not tracking view duration");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "reportViewDuration, Reporting view duration for: [" + _classPrivateFieldGet2(_lastView, _this) + "]");
            var segments = {
                name: _classPrivateFieldGet2(_lastView, _this)
            };

            // track pageview
            if (_this.check_consent(featureEnums.VIEWS)) {
                _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                    key: internalEventKeyEnums.VIEW,
                    dur: _classPrivateFieldGet2(_trackTime, _this) ? getTimestamp() - _classPrivateFieldGet2(_lastViewTime, _this) : _classPrivateFieldGet2(_lastViewStoredDuration, _this),
                    segmentation: segments
                }, _classPrivateFieldGet2(_currentViewId, _this));
                _classPrivateFieldSet2(_lastView, _this, null);
            }
        });
        /**
         *  Get last view that user visited
         *  @memberof Countly._internals
         *  @returns {String} view name
         */
        _classPrivateFieldInitSpec(this, _getLastView, function () {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "getLastView, Getting last view: [" + _classPrivateFieldGet2(_lastView, _this) + "]");
            return _classPrivateFieldGet2(_lastView, _this);
        });
        /**
         *  Extend session's cookie's time
         */
        _classPrivateFieldInitSpec(this, _extendSession, function () {
            if (!_classPrivateFieldGet2(_useSessionCookie, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Will not extend the session as session cookie is disabled");
                return;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Extending session");

            // if session expired, we should start a new one
            var expire = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_session");
            if (!expire || parseInt(expire) <= getTimestamp()) {
                _classPrivateFieldSet2(_sessionStarted, _this, false);
                _this.begin_session(!_classPrivateFieldGet2(_autoExtend, _this));
            }
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_session", getTimestamp() + _classPrivateFieldGet2(_sessionCookieTimeout, _this) * 60);
        });
        /**
         *  Prepare request params by adding common properties to it
         *  @param {Object} request - request object
         */
        _classPrivateFieldInitSpec(this, _prepareRequest, function (request) {
            request.app_key = _this.app_key;
            request.device_id = _this.device_id;
            request.sdk_name = _classPrivateFieldGet2(_sdkName, _this);
            request.sdk_version = _classPrivateFieldGet2(_sdkVersion, _this);
            request.t = _classPrivateFieldGet2(_deviceIdType, _this);
            request.av = _this.app_version;
            var ua = _classPrivateFieldGet2(_getUA, _this).call(_this);
            if (!request.metrics) {
                // if metrics not provided pass useragent with this event
                request.metrics = JSON.stringify({
                    _ua: ua
                });
            } else {
                // if metrics provided
                var currentMetrics = JSON.parse(request.metrics);
                if (!currentMetrics._ua) {
                    // check if ua is present and if not add that
                    currentMetrics._ua = ua;
                    request.metrics = JSON.stringify(currentMetrics);
                }
            }
            if (_this.check_consent(featureEnums.LOCATION) && _classPrivateFieldGet2(_SCTrackingLocation, _this)) {
                if (_this.country_code) {
                    request.country_code = _this.country_code;
                }
                if (_this.city) {
                    request.city = _this.city;
                }
                if (_this.ip_address !== null) {
                    request.ip_address = _this.ip_address;
                }
            } else {
                request.location = "";
            }
            request.timestamp = getMsTimestamp();
            if (_classPrivateFieldGet2(_testModeTime, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "prepareRequest, testing timestamp is set to: " + _classPrivateFieldGet2(_testModeTime, _this));
                request.timestamp = _classPrivateFieldGet2(_testModeTime, _this);
            }
            var date = new Date();
            request.hour = date.getHours();
            request.dow = date.getDay();
            request.tz = -date.getTimezoneOffset(); // to match android and iOS SDKs its negative value
        });
        /**
         *  Add request to request queue
         *  @memberof Countly._internals
         *  @param {Object} request - object with request parameters
         */
        _classPrivateFieldInitSpec(this, _toRequestQueue, function (request) {
            if (_this.ignore_visitor) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "User is opt_out will ignore the request: " + request);
                return;
            }
            if (!_classPrivateFieldGet2(_SCTrackingAll, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Tracking is disabled by server config, will not track the request: " + JSON.stringify(request));
                return;
            }
            if (!_this.app_key || !_this.device_id) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "app_key or device_id is missing ", _this.app_key, _this.device_id);
                return;
            }
            _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);
            if (_classPrivateFieldGet2(_requestQueue, _this).length > _classPrivateFieldGet2(_SCSizeReqQueue, _this)) {
                _classPrivateFieldGet2(_requestQueue, _this).shift();
            }
            _classPrivateFieldGet2(_requestQueue, _this).push(request);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this), true);
        });
        /**
         *  Making request making and data processing loop
         *  @memberof Countly._internals
         *  @returns {void} void
         */
        _classPrivateFieldInitSpec(this, _heartBeat, function () {
            _classPrivateFieldGet2(_notifyLoaders, _this).call(_this);

            // ignore bots
            if (_this.ignore_visitor) {
                _classPrivateFieldSet2(_hasPulse, _this, false);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "User opt_out:[" + _this.ignore_visitor + "], no heartbeat");
                return;
            }
            _classPrivateFieldSet2(_hasPulse, _this, true);
            // process queue
            if (_classPrivateFieldGet2(_global, _this) && typeof Countly.q !== "undefined" && Countly.q.length > 0) {
                _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
            }

            // extend session if needed
            if (_classPrivateFieldGet2(_sessionStarted, _this) && _classPrivateFieldGet2(_autoExtend, _this) && _classPrivateFieldGet2(_trackTime, _this)) {
                var last = getTimestamp();
                if (last - _classPrivateFieldGet2(_lastBeat, _this) > _classPrivateFieldGet2(_SCIntervalSessionUpdate, _this)) {
                    _this.session_duration(last - _classPrivateFieldGet2(_lastBeat, _this));
                    _classPrivateFieldSet2(_lastBeat, _this, last);
                    // save health check logging counters if there are any
                    if (_this.hcErrorCount > 0) {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.errorCount, _this.hcErrorCount);
                    }
                    if (_this.hcWarningCount > 0) {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.warningCount, _this.hcWarningCount);
                    }
                }
            }

            // process event queue
            if (_classPrivateFieldGet2(_eventQueue, _this).length > 0 && !_this.test_mode_eq) {
                if (_classPrivateFieldGet2(_eventQueue, _this).length <= _classPrivateFieldGet2(_SCSizeEventBatch, _this)) {
                    _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        events: JSON.stringify(_classPrivateFieldGet2(_eventQueue, _this))
                    });
                    _classPrivateFieldSet2(_eventQueue, _this, []);
                } else {
                    var events = _classPrivateFieldGet2(_eventQueue, _this).splice(0, _classPrivateFieldGet2(_SCSizeEventBatch, _this));
                    _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        events: JSON.stringify(events)
                    });
                }
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", _classPrivateFieldGet2(_eventQueue, _this));
            }

            // Check if we're in back-off period and update status
            var currentTime = getTimestamp();
            var skipRequestProcessing = false;
            if (_classPrivateFieldGet2(_isInBackoff, _this) && currentTime < _classPrivateFieldGet2(_backoffEndTime, _this)) {
                skipRequestProcessing = true;
                if (!_classPrivateFieldGet2(_backOffLogShown, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "Request back-off active, suspending requests until: " + _classPrivateFieldGet2(_backoffEndTime, _this) + ", current time: " + currentTime);
                    _classPrivateFieldSet2(_backOffLogShown, _this, true);
                }
            } else if (_classPrivateFieldGet2(_isInBackoff, _this) && currentTime >= _classPrivateFieldGet2(_backoffEndTime, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "Request back-off period ended, resuming normal request processing");
                _classPrivateFieldSet2(_isInBackoff, _this, false);
                _classPrivateFieldSet2(_backoffEndTime, _this, 0);
                skipRequestProcessing = false;
                _classPrivateFieldSet2(_backOffLogShown, _this, false);
            }

            // process request queue with event queue (skip if in back-off)
            if (!skipRequestProcessing && !_classPrivateFieldGet2(_offlineMode, _this) && _classPrivateFieldGet2(_requestQueue, _this).length > 0 && _classPrivateFieldGet2(_readyToProcess, _this) && getTimestamp() > _classPrivateFieldGet2(_failTimeout, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Processing request", _classPrivateFieldGet2(_requestQueue, _this)[0]);
                if (!_this.test_mode) {
                    _classPrivateFieldGet2(_sendRequestFromQueue, _this).call(_this, "send_request_queue");
                }
            }
            setTimeout(function () {
                _classPrivateFieldGet2(_heartBeat, _this).call(_this);
            }, _classPrivateFieldGet2(_beatInterval, _this));
        });
        /**
         * Check if back-off conditions are met and activate back-off if necessary
         * @param {Object} parameters - Request parameters to check timestamp
         */
        _classPrivateFieldInitSpec(this, _checkBackoffConditions, function (parameters) {
            if (!_classPrivateFieldGet2(_SCBackoffMechanismEnabled, _this)) {
                return; // Back-off is disabled, skip checks
            }
            if (_classPrivateFieldGet2(_isInBackoff, _this)) {
                return;
            }
            var responseTimeExceeded = _classPrivateFieldGet2(_lastRequestDuration, _this) > _classPrivateFieldGet2(_SCBackoffAcceptedTimeout, _this);
            if (!responseTimeExceeded) {
                return; // No need to check further if response time is acceptable
            }
            var queueNotHalfFull = _classPrivateFieldGet2(_requestQueue, _this).length < _classPrivateFieldGet2(_SCSizeReqQueue, _this) * _classPrivateFieldGet2(_SCBackoffRQPercentage, _this);
            var currentTime = getTimestamp();
            var requestTimestamp = parameters && parameters.timestamp ? parameters.timestamp : currentTime;
            var requestAge = currentTime - requestTimestamp;
            var requestIsYoung = requestAge < _classPrivateFieldGet2(_SCBackoffRequestAge, _this) * 60 * 60; // 24 hours in seconds

            if (responseTimeExceeded && queueNotHalfFull && requestIsYoung) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "Activating request back-off: response time [" + _classPrivateFieldGet2(_lastRequestDuration, _this) + "s], queue size [" + _classPrivateFieldGet2(_requestQueue, _this).length + "/" + _classPrivateFieldGet2(_SCSizeReqQueue, _this) + "], request age [" + requestAge + "s]");
                _classPrivateFieldSet2(_isInBackoff, _this, true);
                _classPrivateFieldSet2(_backoffEndTime, _this, currentTime + _classPrivateFieldGet2(_SCBackoffDuration, _this)); // 60 seconds from now

                _classPrivateFieldGet2(_HealthCheck, _this).incrementBackoffCount();
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "Request back-off activated until: " + _classPrivateFieldGet2(_backoffEndTime, _this));
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "No back-off conditions met: response time [" + _classPrivateFieldGet2(_lastRequestDuration, _this) + "s], queue size [" + _classPrivateFieldGet2(_requestQueue, _this).length + "/" + _classPrivateFieldGet2(_SCSizeReqQueue, _this) + "], request age [" + requestAge + "s]");
                _classPrivateFieldGet2(_HealthCheck, _this).resetLastRequestBackoffStatus();
            }
        });
        /**
         * Returns generated requests for the instance for testing purposes
         * @returns {Array} - Returns generated requests array of objects { functionName: functionName, url: url, params: params }
         */
        _classPrivateFieldInitSpec(this, _getGeneratedRequests, function () {
            return _classPrivateFieldGet2(_generatedRequests, _this);
        });
        _classPrivateFieldInitSpec(this, _sendRequestFromQueue, function (requestName, onSuccess) {
            return new Promise(function (resolve) {
                if (_classPrivateFieldGet2(_offlineMode, _this)) {
                    resolve(false);
                    return;
                }
                if (_classPrivateFieldGet2(_requestQueue, _this).length === 0) {
                    resolve(false);
                    return;
                }
                if (!_classPrivateFieldGet2(_readyToProcess, _this) || _classPrivateFieldGet2(_isInBackoff, _this) || getTimestamp() <= _classPrivateFieldGet2(_failTimeout, _this)) {
                    resolve(false);
                    return;
                }
                _classPrivateFieldSet2(_readyToProcess, _this, false);
                var params = _classPrivateFieldGet2(_requestQueue, _this)[0];
                params.rr = _classPrivateFieldGet2(_requestQueue, _this).length;
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this), true);
                _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, requestName, _this.url + _classPrivateFieldGet2(_apiPath, _this), params, function (err, parameters) {
                    if (err) {
                        _classPrivateFieldSet2(_failTimeout, _this, getTimestamp() + _classPrivateFieldGet2(_failTimeoutAmount, _this));
                    } else {
                        _classPrivateFieldGet2(_requestQueue, _this).shift();
                        _classPrivateFieldGet2(_checkBackoffConditions, _this).call(_this, parameters);
                        if (onSuccess) {
                            try {
                                onSuccess(parameters);
                            } catch (e) {
                                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendRequestFromQueue, onSuccess handler threw");
                            }
                        }
                    }
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this), true);
                    _classPrivateFieldSet2(_readyToProcess, _this, true);
                    resolve(!err);
                }, false);
            });
        });
        /**
         * Process queued calls
         * @memberof Countly._internals
         */
        _classPrivateFieldInitSpec(this, _processAsyncQueue, function () {
            if (typeof Countly === "undefined" || typeof Countly.i === "undefined") {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Countly is not finished initialization yet, will process the queue after initialization is done");
                return;
            }
            var q = Countly.q;
            Countly.q = [];
            for (var i = 0; i < q.length; i++) {
                var req = q[i];
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Processing queued calls:" + req);
                if (typeof req === "function") {
                    req();
                } else if (Array.isArray(req) && req.length > 0) {
                    var inst = _this;
                    var arg = 0;
                    // check if it is meant for other tracker
                    try {
                        if (Countly.i[req[arg]]) {
                            inst = Countly.i[req[arg]];
                            arg++;
                        }
                    } catch (error) {
                        // possibly first init and no other instance
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "No instance found for the provided key while processing async queue");
                        Countly.q.push(req); // return it back to queue and continue to the next one
                        continue;
                    }
                    if (typeof inst[req[arg]] === "function") {
                        inst[req[arg]].apply(inst, req.slice(arg + 1));
                    }
                    // Add interfaces you add to here for async queue to work
                    else if (req[arg].indexOf("userData.") === 0) {
                        var userdata = req[arg].replace("userData.", "");
                        if (typeof inst.userData[userdata] === "function") {
                            inst.userData[userdata].apply(inst, req.slice(arg + 1));
                        }
                    } else if (req[arg].indexOf("content.") === 0) {
                        var contentMethod = req[arg].replace("content.", "");
                        if (typeof inst.content[contentMethod] === "function") {
                            inst.content[contentMethod].apply(inst, req.slice(arg + 1));
                        }
                    } else if (req[arg].indexOf("feedback.") === 0) {
                        var feedbackMethod = req[arg].replace("feedback.", "");
                        if (typeof inst.feedback[feedbackMethod] === "function") {
                            inst.feedback[feedbackMethod].apply(inst, req.slice(arg + 1));
                        }
                    } else if (typeof Countly[req[arg]] === "function") {
                        Countly[req[arg]].apply(Countly, req.slice(arg + 1));
                    }
                }
            }
        });
        /**
         *  Get device ID, stored one, or generate new one
         *  @memberof Countly._internals
         *  @returns {String} device id
         */
        _classPrivateFieldInitSpec(this, _getStoredIdOrGenerateId, function () {
            var storedDeviceId = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id");
            if (storedDeviceId) {
                _classPrivateFieldSet2(_deviceIdType, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id_type"));
                return storedDeviceId;
            }
            return generateUUID();
        });
        /**
         *  Check if value is in UUID format
         *  @memberof Countly._internals
         * @param {string} providedId -  Id to check
         *  @returns {Boolean} true if it is in UUID format
         */
        _classPrivateFieldInitSpec(this, _isUUID, function (providedId) {
            return /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(providedId);
        });
        /**
         *  Get and return user agentAgent
         *  @memberof Countly._internals
         *  @returns {string} returns userAgent string
         */
        _classPrivateFieldInitSpec(this, _getUA, function () {
            if (_this.metrics && _this.metrics._ua) {
                return _this.metrics._ua;
            }
            return currentUserAgentString();
        });
        /**
         *  Get metrics of the browser or config object
         *  @memberof Countly._internals
         *  @returns {Object} Metrics object
         */
        _classPrivateFieldInitSpec(this, _getMetrics, function () {
            var metrics = JSON.parse(JSON.stringify(_this.metrics || {}));

            // getting app version
            metrics._app_version = metrics._app_version || _this.app_version;
            metrics._ua = metrics._ua || currentUserAgentString();

            // getting resolution
            var resolution = _classPrivateFieldGet2(_getResolution, _this).call(_this);
            if (resolution) {
                var formattedRes = "" + resolution.width + "x" + resolution.height;
                metrics._resolution = metrics._resolution || formattedRes;
            }

            // getting density ratio
            if (isBrowser && window.devicePixelRatio) {
                metrics._density = metrics._density || window.devicePixelRatio;
            }

            // getting locale
            var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
            if (typeof locale !== "undefined") {
                metrics._locale = metrics._locale || locale;
            }
            if (_classPrivateFieldGet2(_isReferrerUsable, _this).call(_this)) {
                metrics._store = metrics._store || document.referrer;
            }
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Got metrics", metrics);
            return metrics;
        });
        /**
         * returns the resolution of the device
         * @param {bool} getViewPort - get viewport
         * @returns {object} resolution object: {width: 1920, height: 1080, orientation: 0}
         */
        _classPrivateFieldInitSpec(this, _getResolution, function (getViewPort) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Getting the resolution of the device");
            if (!isBrowser || !screen) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "No screen available");
                return null;
            }
            var width = screen.width ? parseInt(screen.width) : 0;
            var height = screen.height ? parseInt(screen.height) : 0;
            if (getViewPort) {
                var viewportWidth = window.innerWidth;
                var viewportHeight = window.innerHeight;
                var layoutWidth = document.documentElement.clientWidth;
                var layoutHeight = document.documentElement.clientHeight;
                var visibleWidth = Math.min(viewportWidth, layoutWidth);
                var visibleHeight = Math.min(viewportHeight, layoutHeight);
                width = visibleWidth ? parseInt(visibleWidth) : width;
                height = visibleHeight ? parseInt(visibleHeight) : height;
            }
            if (width === 0 || height === 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Screen width or height is non existent");
                return null;
            }
            var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
            if (iOS && window.devicePixelRatio) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.VERBOSE, "Mobile Mac device detected, adjusting resolution");
                // ios provides dips, need to multiply
                width = Math.round(width * window.devicePixelRatio);
                height = Math.round(height * window.devicePixelRatio);
            }
            return {
                width: width,
                height: height
            };
        });
        /**
         *  @memberof Countly._internals
         * document.referrer returns the full URL of the page the user was on before they came to your site.
         * If the user open your site from bookmarks or by typing the URL in the address bar, then document.referrer is an empty string.
         * Inside an iframe, document.referrer will initially be set to the same value as the href of the parent window's Window.location. 
         * 
         * @param {string} customReferrer - custom referrer for testing
         * @returns {boolean} true if document.referrer is not empty string, undefined, current host or in the ignore list.
         */
        _classPrivateFieldInitSpec(this, _isReferrerUsable, function (customReferrer) {
            if (!isBrowser) {
                return false;
            }
            var referrer = customReferrer || document.referrer;
            var isReferrerLegit = false;

            // do not report referrer if it is empty string or undefined
            if (typeof referrer === "undefined" || referrer.length === 0) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Invalid referrer:[" + referrer + "], ignoring.");
            } else {
                // dissect the referrer (check urlParseRE's comments for more info on this process)
                var matches = urlParseRE.exec(referrer); // this can return null
                if (!matches) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Referrer is corrupt:[" + referrer + "], ignoring.");
                } else if (!matches[11]) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "No path found in referrer:[" + referrer + "], ignoring.");
                } else if (matches[11] === window.location.hostname) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Referrer is current host:[" + referrer + "], ignoring.");
                } else {
                    if (_classPrivateFieldGet2(_ignoreReferrers, _this) && _classPrivateFieldGet2(_ignoreReferrers, _this).length) {
                        isReferrerLegit = true;
                        for (var k = 0; k < _classPrivateFieldGet2(_ignoreReferrers, _this).length; k++) {
                            if (referrer.indexOf(_classPrivateFieldGet2(_ignoreReferrers, _this)[k]) >= 0) {
                                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Referrer in ignore list:[" + referrer + "], ignoring.");
                                isReferrerLegit = false;
                                break;
                            }
                        }
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Valid referrer:[" + referrer + "]");
                        isReferrerLegit = true;
                    }
                }
            }
            return isReferrerLegit;
        });
        /**
         *  Logging stuff, works only when debug mode is true
         * @param {string} level - log level (error, warning, info, debug, verbose)
         * @param {string} message - any string message
         * @memberof Countly._internals
         */
        _classPrivateFieldInitSpec(this, _log, function (level, message, third) {
            if (_this.debug && typeof console !== "undefined") {
                // parse the arguments into a string if it is an object
                if (third && _typeof(third) === "object") {
                    third = JSON.stringify(third);
                }
                // append app_key to the start of the message if it is not the first instance (for multi instancing)
                if (!_classPrivateFieldGet2(_global, _this)) {
                    message = "[" + _this.app_key + "] " + message;
                }
                // if the provided level is not a proper log level re-assign it as [DEBUG]
                if (!level) {
                    level = logLevelEnums.DEBUG;
                }
                // append level, message and args
                var extraArguments = "";
                if (third) {
                    extraArguments = " " + third;
                }
                // eslint-disable-next-line no-shadow
                var log = level + "[Countly] " + message + extraArguments;
                // decide on the console
                if (level === logLevelEnums.ERROR) {
                    // eslint-disable-next-line no-console
                    console.error(log);
                    _classPrivateFieldGet2(_HealthCheck, _this).incrementErrorCount();
                } else if (level === logLevelEnums.WARNING) {
                    // eslint-disable-next-line no-console
                    console.warn(log);
                    _classPrivateFieldGet2(_HealthCheck, _this).incrementWarningCount();
                } else if (level === logLevelEnums.INFO) {
                    // eslint-disable-next-line no-console
                    console.info(log);
                } else if (level === logLevelEnums.VERBOSE) {
                    // eslint-disable-next-line no-console
                    console.log(log);
                }
                // if none of the above must be [DEBUG]
                else {
                    // eslint-disable-next-line no-console
                    console.debug(log);
                }
            }
        });
        /**
         *  Decides to use which type of request method
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         *  @param {Boolean} forced - if true that means the request is forced and should be made regardless of the networking config
         */
        _classPrivateFieldInitSpec(this, _makeNetworkRequest, function (functionName, url, params, callback, useBroadResponseValidator, forced) {
            if (!_classPrivateFieldGet2(_SCNetwork, _this) && !forced) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Network request is disabled by the SCNetwork");
                return;
            }
            _classPrivateFieldGet2(_generatedRequests, _this).push({
                functionName: functionName,
                url: url,
                params: params
            });

            // Use fake request handler if provided (for testing)
            if (_classPrivateFieldGet2(_fakeRequestHandler, _this)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " Using fake request handler");
                try {
                    var response = _classPrivateFieldGet2(_fakeRequestHandler, _this).call(_this, {
                        functionName: functionName,
                        url: url,
                        params: params
                    });
                    // Default to success response if handler returns nothing
                    if (response === undefined) {
                        response = {
                            status: 200,
                            responseText: '{"result":"Success"}'
                        };
                    }
                    // Allow handler to return false to skip callback entirely
                    if (response === false) {
                        return;
                    }
                    var isError = response.status < 200 || response.status >= 300;
                    if (typeof callback === "function") {
                        callback(isError, params, response.responseText);
                    }
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Fake request handler error: " + e);
                    if (typeof callback === "function") {
                        callback(true, params, "fake_handler_error");
                    }
                }
                return;
            }
            if (!isBrowser) {
                _classPrivateFieldGet2(_sendFetchRequest, _this).call(_this, functionName, url, params, callback, useBroadResponseValidator);
            } else {
                _classPrivateFieldGet2(_sendXmlHttpRequest, _this).call(_this, functionName, url, params, callback, useBroadResponseValidator);
            }
        });
        /**
         *  Making xml HTTP request
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         */
        _classPrivateFieldInitSpec(this, _sendXmlHttpRequest, function (functionName, url, params, callback, useBroadResponseValidator) {
            useBroadResponseValidator = useBroadResponseValidator || false;
            try {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Sending XML HTTP request");
                var xhr = new XMLHttpRequest();
                xhr.ontimeout = function () {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " timed out after 30 seconds");
                    if (typeof callback === "function") {
                        callback(true, params, 'timeout');
                    }
                };
                params = params || {};
                var isImage = params._forceImageUpload || params.__imageUpload === true || params.imageData && (params.imageName || params.imageType);
                var paramSource = params;
                if (isImage) {
                    // filter out binary-only keys from salted params
                    var filtered = {};
                    for (var fk in params) {
                        if (!Object.prototype.hasOwnProperty.call(params, fk)) {
                            continue;
                        }
                        if (fk === "__imageUpload" || fk === "imageData" || fk === "imageName" || fk === "imageType" || fk === "type") {
                            continue;
                        }
                        filtered[fk] = params[fk];
                    }
                    paramSource = filtered;
                }
                prepareParams(paramSource, _this.salt).then(function (saltedData) {
                    var method = "POST";
                    if (_this.force_post || saltedData.length >= 2000) {
                        method = "POST";
                    }
                    if (isImage) {
                        xhr.open("POST", url, true);
                    } else if (method === "GET") {
                        xhr.open("GET", url + "?" + saltedData, true);
                    } else {
                        xhr.open("POST", url, true);
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    }
                    try {
                        if ('timeout' in xhr) {
                            xhr.timeout = _classPrivateFieldGet2(_requestTimeoutDuration, _this);
                        }
                    } catch (ex) {
                        // for IE11 InvalidStateError
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " could not set xhr.timeout: " + ex);
                    }
                    for (var header in _this.headers) {
                        if (!Object.prototype.hasOwnProperty.call(_this.headers, header)) {
                            continue;
                        }
                        if (isImage && header.toLowerCase() === "content-type") {
                            continue;
                        }
                        xhr.setRequestHeader(header, _this.headers[header]);
                    }

                    // Track request start time for back-off mechanism
                    var requestStartTime = getTimestamp();

                    // fallback on error
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            // Calculate request duration for back-off mechanism
                            var requestEndTime = getTimestamp();
                            var requestDuration = requestEndTime - requestStartTime;
                            _classPrivateFieldSet2(_lastRequestDuration, _this, requestDuration);
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " HTTP request completed with status code: [" + xhr.status + "] and response: [" + xhr.responseText + "], duration: [" + requestDuration + "] seconds");
                            // response validation function will be selected to also accept JSON arrays if useBroadResponseValidator is true
                            var isResponseValidated;
                            if (useBroadResponseValidator) {
                                // JSON array/object both can pass
                                isResponseValidated = _classPrivateFieldGet2(_isResponseValidBroad, _this).call(_this, xhr.status, xhr.responseText);
                            } else {
                                // only JSON object can pass
                                isResponseValidated = _classPrivateFieldGet2(_isResponseValid, _this).call(_this, xhr.status, xhr.responseText);
                            }
                            if (isResponseValidated) {
                                if (typeof callback === "function") {
                                    callback(false, params, xhr.responseText);
                                }
                            } else {
                                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Invalid response from server");
                                if (functionName === "send_request_queue") {
                                    _classPrivateFieldGet2(_HealthCheck, _this).saveRequestCounters(xhr.status, xhr.responseText);
                                }
                                if (typeof callback === "function") {
                                    callback(true, params, xhr.status, xhr.responseText);
                                }
                            }
                        }
                    };
                    if (isImage) {
                        var formData = _classPrivateFieldGet2(_prepareImageUploadFormData, _this).call(_this, params, saltedData);
                        if (!formData) {
                            if (typeof callback === "function") {
                                callback(true, params, 'invalid_formdata');
                            }
                            return;
                        }
                        xhr.send(formData);
                    } else if (method === "GET") {
                        xhr.send();
                    } else {
                        xhr.send(saltedData);
                    }
                });
            } catch (e) {
                // fallback
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Something went wrong while making an XML HTTP request: " + e);
                if (typeof callback === "function") {
                    callback(true, params);
                }
            }
        });
        _classPrivateFieldInitSpec(this, _createBlobFromBase, function (base64Data, mimeType) {
            if (!base64Data) {
                return null;
            }
            try {
                if (typeof atob === "function") {
                    var binaryString = atob(base64Data);
                    var len = binaryString.length;
                    var bytes = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    if (typeof Blob !== "undefined") {
                        return new Blob([bytes], {
                            type: mimeType || "application/octet-stream"
                        });
                    }
                    if (typeof File !== "undefined") {
                        try {
                            return new File([bytes], "avatar", {
                                type: mimeType || "application/octet-stream"
                            });
                        } catch (fileError) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "createBlobFromBase64: Unable to create File instance: " + fileError);
                        }
                    }
                    return null;
                } else if (typeof Buffer !== "undefined") {
                    var buffer = Buffer.from(base64Data, "base64");
                    if (typeof Blob !== "undefined") {
                        return new Blob([buffer], {
                            type: mimeType || "application/octet-stream"
                        });
                    }
                    if (typeof File !== "undefined") {
                        try {
                            return new File([buffer], "avatar", {
                                type: mimeType || "application/octet-stream"
                            });
                        } catch (fileError) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "createBlobFromBase64: Unable to create File instance from buffer: " + fileError);
                        }
                    }
                    return null;
                }
            } catch (error) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "createBlobFromBase64 failed: " + error);
            }
            return null;
        });
        _classPrivateFieldInitSpec(this, _prepareImageUploadFormData, function (params, saltedData) {
            if (!params || !params.imageData) {
                return null;
            }
            var blob = _classPrivateFieldGet2(_createBlobFromBase, _this).call(_this, params.imageData, params.imageType);
            if (!blob || typeof FormData === 'undefined') {
                return null;
            }
            var fd = new FormData();
            fd.append('user_details[picture]', blob, params.imageName || 'avatar');
            if (saltedData && typeof saltedData === 'string') {
                var pairs = saltedData.split('&');
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    if (!pair) {
                        continue;
                    }
                    var idx = pair.indexOf('=');
                    var key = idx >= 0 ? pair.substring(0, idx) : pair;
                    var val = idx >= 0 ? pair.substring(idx + 1) : '';
                    fd.append(key, val);
                }
            }
            return fd;
        });
        /**
         *  Make a fetch request
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         */
        _classPrivateFieldInitSpec(this, _sendFetchRequest, function (functionName, url, params, callback, useBroadResponseValidator) {
            useBroadResponseValidator = useBroadResponseValidator || false;
            var response;
            try {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Sending Fetch request");

                // Prepare request options
                var method = "POST";
                var headers = {
                    "Content-type": "application/x-www-form-urlencoded"
                };
                var body = null;
                params = params || {};
                var isImage = params._forceImageUpload || params.__imageUpload === true || params.imageData && (params.imageName || params.imageType);
                var paramSource = params;
                if (isImage) {
                    var filtered = {};
                    for (var pk in params) {
                        if (!Object.prototype.hasOwnProperty.call(params, pk)) {
                            continue;
                        }
                        if (pk === '__imageUpload' || pk === 'imageData' || pk === 'imageName' || pk === 'imageType' || pk === 'type') {
                            continue;
                        }
                        filtered[pk] = params[pk];
                    }
                    paramSource = filtered;
                }
                prepareParams(paramSource, _this.salt).then(function (saltedData) {
                    if (_this.force_post || saltedData.length >= 2000) {
                        method = "POST";
                        body = saltedData;
                    } else {
                        url += "?" + saltedData;
                    }

                    // Add custom headers
                    for (var header in _this.headers) {
                        headers[header] = _this.headers[header];
                    }

                    // Track request start time for back-off mechanism
                    var requestStartTime = getTimestamp();
                    var controller = new AbortController();
                    var signal = controller.signal;
                    var timeoutId = setTimeout(function () {
                        return controller.abort();
                    }, _classPrivateFieldGet2(_requestTimeoutDuration, _this));

                    // Make the fetch request
                    var fetchBody = body;
                    var fetchUrl = url;
                    if (isImage) {
                        var formData = _classPrivateFieldGet2(_prepareImageUploadFormData, _this).call(_this, params, saltedData);
                        if (!formData) {
                            clearTimeout(timeoutId);
                            if (typeof callback === 'function') {
                                callback(true, params, 'invalid_formdata');
                            }
                            return;
                        }
                        // remove explicit content-type so browser sets boundary
                        if (headers['Content-type']) {
                            delete headers['Content-type'];
                        }
                        fetchBody = formData;
                        fetchUrl = url.split('?')[0];
                    }
                    fetch(fetchUrl, {
                        method: method,
                        headers: headers,
                        body: fetchBody,
                        signal: signal
                    }).then(function (res) {
                        clearTimeout(timeoutId);
                        response = res;
                        return response.text();
                    }).then(function (data) {
                        var requestEndTime = getTimestamp();
                        var requestDuration = requestEndTime - requestStartTime;
                        _classPrivateFieldSet2(_lastRequestDuration, _this, requestDuration);
                        if (isImage) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " image Fetch upload completed with status code: [" + response.status + "] and response: [" + data + "], duration: [" + requestDuration + "] seconds");
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " Fetch request completed wit status code: [" + response.status + "] and response: [" + data + "], duration: [" + requestDuration + "] seconds");
                        }
                        var isResponseValidated;
                        if (useBroadResponseValidator) {
                            isResponseValidated = _classPrivateFieldGet2(_isResponseValidBroad, _this).call(_this, response.status, data);
                        } else {
                            isResponseValidated = _classPrivateFieldGet2(_isResponseValid, _this).call(_this, response.status, data);
                        }
                        if (isResponseValidated) {
                            if (typeof callback === "function") {
                                callback(false, params, data);
                            }
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Invalid response from server");
                            if (functionName === "send_request_queue") {
                                _classPrivateFieldGet2(_HealthCheck, _this).saveRequestCounters(response.status, data);
                            }
                            if (typeof callback === "function") {
                                callback(true, params, response.status, data);
                            }
                        }
                    })["catch"](function (error) {
                        clearTimeout(timeoutId);
                        if (error.name === 'AbortError') {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " timed out after 30 seconds");
                            if (typeof callback === "function") {
                                callback(true, params, 'timeout');
                            }
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Failed Fetch request: " + error);
                            if (typeof callback === "function") {
                                callback(true, params);
                            }
                        }
                    });
                });
            } catch (e) {
                // fallback
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Something went wrong with the Fetch request attempt: " + e);
                if (typeof callback === "function") {
                    callback(true, params);
                }
            }
        });
        /**
         * Check if the http response fits the bill of:
         * 1. The HTTP response code was successful (which is any 2xx code or code between 200 <= x < 300)
         * 2. The returned request is a JSON object
         * @memberof Countly._internals
         * @param {Number} statusCode - http incoming statusCode.
         * @param {String} str - response from server, ideally must be: {"result":"Success"} or should contain at least result field
         * @returns {Boolean} - returns true if response passes the tests 
         */
        _classPrivateFieldInitSpec(this, _isResponseValid, function (statusCode, str) {
            // status code and response format check
            if (!(statusCode >= 200 && statusCode < 300)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response status code:[" + statusCode + "] is not within the expected range");
                return false;
            }

            // Try to parse JSON
            try {
                var parsedResponse = JSON.parse(str);

                // check if parsed response is a JSON object, if not the response is not valid
                if (Object.prototype.toString.call(parsedResponse) !== "[object Object]") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response is not JSON Object");
                    return false;
                }
                return !!parsedResponse.result;
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response is not JSON: " + e);
                return false;
            }
        });
        /**
         * Check if the http response fits the bill of:
         * 1. The HTTP response code was successful (which is any 2xx code or code between 200 <= x < 300)
         * 2. The returned request is a JSON object or JSON Array
         * @memberof Countly._internals
         * @param {Number} statusCode - http incoming statusCode.
         * @param {String} str - response from server, ideally must be: {"result":"Success"} or should contain at least result field
         * @returns {Boolean} - returns true if response passes the tests 
         */
        _classPrivateFieldInitSpec(this, _isResponseValidBroad, function (statusCode, str) {
            // status code and response format check
            if (!(statusCode >= 200 && statusCode < 300)) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response status code:[" + statusCode + "] is not within the expected range");
                return false;
            }

            // Try to parse JSON
            try {
                var parsedResponse = JSON.parse(str);
                // check if parsed response is a JSON object or JSON array, if not it is not valid 
                if (Object.prototype.toString.call(parsedResponse) !== "[object Object]" && !Array.isArray(parsedResponse) && parsedResponse !== "No content block found!") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response is not JSON Object nor JSON Array");
                    return false;
                }

                // request should be accepted even if does not have result field
                return true;
            } catch (e) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "Http response is not JSON: " + e);
                return false;
            }
        });
        /**
         *  Get max scroll position
         *  @memberof Countly._internals
         * 
         */
        _classPrivateFieldInitSpec(this, _processScroll, function () {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "processScroll, window object is not available. Not processing scroll.");
                return;
            }
            _classPrivateFieldSet2(_scrollRegistryTopPosition, _this, Math.max(_classPrivateFieldGet2(_scrollRegistryTopPosition, _this), window.scrollY, document.body.scrollTop, document.documentElement.scrollTop));
        });
        /**
         *  Process scroll data
         *  @memberof Countly._internals
         */
        _classPrivateFieldInitSpec(this, _processScrollView, function () {
            if (!isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "processScrollView, window object is not available. Not processing scroll view.");
                return;
            }
            if (_classPrivateFieldGet2(_isScrollRegistryOpen, _this)) {
                _classPrivateFieldSet2(_isScrollRegistryOpen, _this, false);
                var height = getDocHeight();
                var width = getDocWidth();
                var viewportHeight = getViewportHeight();
                if (_this.check_consent(featureEnums.SCROLLS)) {
                    var segments = {
                        type: "scroll",
                        y: _classPrivateFieldGet2(_scrollRegistryTopPosition, _this) + viewportHeight,
                        width: width,
                        height: height,
                        view: _this.getViewUrl()
                    };
                    // truncate new segment
                    segments = truncateObject(segments, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "processScrollView", _classPrivateFieldGet2(_log, _this));
                    if (_this.track_domains) {
                        segments.domain = window.location.hostname;
                    }
                    _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                        key: internalEventKeyEnums.ACTION,
                        segmentation: segments
                    });
                }
            }
        });
        /**
         *  Fetches the current device Id type
         *  @memberof Countly._internals
         *  @returns {String} token - auth token
         */
        _classPrivateFieldInitSpec(this, _getInternalDeviceIdType, function () {
            return _classPrivateFieldGet2(_deviceIdType, _this);
        });
        /**
         *  Set auth token
         *  @memberof Countly._internals
         *  @param {String} token - auth token
         */
        _classPrivateFieldInitSpec(this, _setToken, function (token) {
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_token", token);
        });
        /**
         *  Get auth token
         *  @memberof Countly._internals
         *  @returns {String} auth token
         */
        _classPrivateFieldInitSpec(this, _getToken, function () {
            var token = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_token");
            _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_token");
            return token;
        });
        /**
         *  Get event queue
         *  @memberof Countly._internals
         *  @returns {Array} event queue
         */
        _classPrivateFieldInitSpec(this, _getEventQueue, function () {
            return _classPrivateFieldGet2(_eventQueue, _this);
        });
        /**
         *  Get request queue
         *  @memberof Countly._internals
         *  @returns {Array} request queue
         */
        _classPrivateFieldInitSpec(this, _getRequestQueue, function () {
            return _classPrivateFieldGet2(_requestQueue, _this);
        });
        /**
        * Returns contents of a cookie
        * @param {String} cookieKey - The key, name or identifier for the cookie
        * @returns {Varies} stored value
        */
        _classPrivateFieldInitSpec(this, _readCookie, function (cookieKey) {
            var cookieID = cookieKey + "=";
            // array of all cookies available
            var cookieArray = document.cookie.split(";");
            for (var i = 0, max = cookieArray.length; i < max; i++) {
                // cookie from the cookie array to be checked
                var cookie = cookieArray[i];
                // get rid of empty spaces at the beginning
                while (cookie.charAt(0) === " ") {
                    cookie = cookie.substring(1, cookie.length);
                }
                // return the cookie if it is the one we are looking for
                if (cookie.indexOf(cookieID) === 0) {
                    // just return the value part after '='
                    return cookie.substring(cookieID.length, cookie.length);
                }
            }
            return null;
        });
        /**
         *  Creates new cookie or removes cookie with negative expiration
         *  @param {String} cookieKey - The key or identifier for the storage
         *  @param {String} cookieVal - Contents to store
         *  @param {Number} exp - Expiration in days
         */
        _classPrivateFieldInitSpec(this, _createCookie, function (cookieKey, cookieVal, exp) {
            var date = new Date();
            date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
            // TODO: If we offer the developer the ability to manipulate the expiration date in the future, this part must be reworked
            var expires = "; expires=" + date.toGMTString();
            document.cookie = cookieKey + "=" + cookieVal + expires + "; path=/";
        });
        /**
         *  Storage function that acts as getter, can be used for fetching data from local storage or cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Boolean} useLocalStorage - if false, will fallback to cookie storage
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
         *  @returns {Varies} values stored for key
         */
        _classPrivateFieldInitSpec(this, _getValueFromStorage, function (key, useLocalStorage, useRawKey) {
            // check if we should use storage at all. If in worker context but no storage is available, return early
            if (_this.storage === "none" || _typeof(_this.storage) !== "object" && !isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Storage is disabled. Value with key: [" + key + "] won't be retrieved");
                return;
            }

            // apply namespace or app_key
            if (!useRawKey) {
                key = _this.app_key + "/" + key;
                if (_this.namespace) {
                    key = stripTrailingSlash(_this.namespace) + "/" + key;
                }
            }
            var data;
            // use dev provided storage if available
            if (_this.storage && _typeof(_this.storage) === "object" && typeof _this.storage.getItem === "function") {
                data = _this.storage.getItem(key);
                return key.endsWith("cly_id") ? data : _this.deserialize(data);
            }

            // developer set values takes priority
            if (useLocalStorage === undefined) {
                useLocalStorage = _classPrivateFieldGet2(_lsSupport, _this);
            }
            try {
                // Get value
                if (useLocalStorage) {
                    // Native support
                    data = localStorage.getItem(key);
                } else if (_this.storage !== "localstorage") {
                    // Use cookie
                    data = _classPrivateFieldGet2(_readCookie, _this).call(_this, key);
                }

                // we return early without parsing if we are trying to get the device ID. This way we are keeping it as a string incase it was numerical.
                if (key.endsWith("cly_id")) {
                    return data;
                }
                return _this.deserialize(data);
            } catch (error) { }
        });
        /**
         *  Storage function that acts as setter, can be used for setting data into local storage or as cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Varies} value - value to set for key
         *  @param {Boolean} useLocalStorage - if false, will fallback to storing as cookies
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
        */
        _classPrivateFieldInitSpec(this, _setValueInStorage, function (key, value, useLocalStorage, useRawKey) {
            // check if we should use storage options at all
            if (_this.storage === "none" || _typeof(_this.storage) !== "object" && !isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Storage is disabled. Value with key: " + key + " won't be stored");
                return;
            }

            // apply namespace
            if (!useRawKey) {
                key = _this.app_key + "/" + key;
                if (_this.namespace) {
                    key = stripTrailingSlash(_this.namespace) + "/" + key;
                }
            }
            try {
                if (typeof value !== "undefined" && value !== null) {
                    // use dev provided storage if available
                    if (_typeof(_this.storage) === "object" && typeof _this.storage.setItem === "function") {
                        _this.storage.setItem(key, value);
                        return;
                    }

                    // developer set values takes priority
                    if (useLocalStorage === undefined) {
                        useLocalStorage = _classPrivateFieldGet2(_lsSupport, _this);
                    }
                    value = _this.serialize(value);
                    // Set the store
                    if (useLocalStorage) {
                        // Native support
                        localStorage.setItem(key, value);
                    } else if (_this.storage !== "localstorage") {
                        // Use Cookie
                        _classPrivateFieldGet2(_createCookie, _this).call(_this, key, value, 30);
                    }
                }
            } catch (error) {
                // silent fail   
            }
        });
        /**
         *  A function that can be used for removing data from local storage or cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Boolean} useLocalStorage - if false, will fallback to removing cookies
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
        */
        _classPrivateFieldInitSpec(this, _removeValueFromStorage, function (key, useLocalStorage, useRawKey) {
            // check if we should use storage options at all
            if (_this.storage === "none" || _typeof(_this.storage) !== "object" && !isBrowser) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Storage is disabled. Value with key: " + key + " won't be removed");
                return;
            }

            // apply namespace
            if (!useRawKey) {
                key = _this.app_key + "/" + key;
                if (_this.namespace) {
                    key = stripTrailingSlash(_this.namespace) + "/" + key;
                }
            }
            try {
                // use dev provided storage if available
                if (_typeof(_this.storage) === "object" && typeof _this.storage.removeItem === "function") {
                    _this.storage.removeItem(key);
                    return;
                }

                // developer set values takes priority
                if (useLocalStorage === undefined) {
                    useLocalStorage = _classPrivateFieldGet2(_lsSupport, _this);
                }
                if (useLocalStorage) {
                    // Native support
                    localStorage.removeItem(key);
                } else if (_this.storage !== "localstorage") {
                    // Use cookie
                    _classPrivateFieldGet2(_createCookie, _this).call(_this, key, "", -1);
                }
            } catch (error) {
                // silent fail   
            }
        });
        /**
         *  Migrate from old storage to new app_key prefixed storage
         */
        _classPrivateFieldInitSpec(this, _migrate, function () {
            if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_id", false, true)) {
                // old data exists, we should migrate it
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_id", false, true));
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_id_type", false, true));
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_event", false, true));
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_session", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_session", false, true));

                // filter out requests with correct app_key
                var requests = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_queue", false, true);
                if (Array.isArray(requests)) {
                    requests = requests.filter(function (req) {
                        return req.app_key === _this.app_key;
                    });
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", requests);
                }
                if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_cmp_id", false, true)) {
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_cmp_id", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_cmp_id", false, true));
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_cmp_uid", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_cmp_uid", false, true));
                }
                if (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_ignore", false, true)) {
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_ignore", _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, _this.namespace + "cly_ignore", false, true));
                }

                // now deleting old data, so we won't migrate again
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_id", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_id_type", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_event", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_session", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_queue", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_cmp_id", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_cmp_uid", false, true);
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_ignore", false, true);
            }
        });
        /**
         *  Apply modified storage changes
         *  @param {String} key - key of storage modified
         *  @param {Varies} newValue - new value for storage
         */
        _classPrivateFieldInitSpec(this, _onStorageChange, function (key, newValue) {
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for key:", key);
            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for value:", newValue);
            switch (key) {
                // queue of requests
                case "cly_queue":
                    _classPrivateFieldSet2(_requestQueue, _this, _this.deserialize(newValue || "[]"));
                    break;
                // queue of events
                case "cly_event":
                    _classPrivateFieldSet2(_eventQueue, _this, _this.deserialize(newValue || "[]"));
                    break;
                case "cly_remote_configs":
                    _classPrivateFieldSet2(_remoteConfigs, _this, _this.deserialize(newValue || "{}"));
                    break;
                case "cly_ignore":
                    _this.ignore_visitor = _this.deserialize(newValue);
                    break;
                case "cly_config":
                    _classPrivateFieldSet2(_serverConfigCache, _this, _this.deserialize(newValue || "{}"));
                    _classPrivateFieldGet2(_populateServerConfig, _this).call(_this, _classPrivateFieldGet2(_serverConfigCache, _this));
                    break;
                case "cly_id":
                    _this.device_id = newValue;
                    break;
                case "cly_id_type":
                    _classPrivateFieldSet2(_deviceIdType, _this, _this.deserialize(newValue));
                    break;
                // do nothing
            }
        });
        /**
        *  Clear queued data for testing purposes
        *  @memberof Countly._internals
        */
        _classPrivateFieldInitSpec(this, _clearQueue, function () {
            _classPrivateFieldSet2(_requestQueue, _this, []);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", []);
            _classPrivateFieldSet2(_eventQueue, _this, []);
            _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", []);
        });
        /**
         * For testing purposes only
         * @returns {Object} - returns the local queues
         */
        _classPrivateFieldInitSpec(this, _getLocalQueues, function () {
            return {
                eventQ: _classPrivateFieldGet2(_eventQueue, _this),
                requestQ: _classPrivateFieldGet2(_requestQueue, _this)
            };
        });
        /**
        * Expose internal methods to end user for usability
        * @namespace Countly._internals
        * @name Countly._internals
        */
        _defineProperty(this, "_internals", {
            store: _classPrivateFieldGet2(_setValueInStorage, this),
            getDocWidth: getDocWidth,
            getDocHeight: getDocHeight,
            getViewportHeight: getViewportHeight,
            get_page_coord: get_page_coord,
            get_event_target: get_event_target,
            add_event_listener: add_event_listener,
            createNewObjectFromProperties: createNewObjectFromProperties,
            truncateObject: truncateObject,
            truncateSingleValue: truncateSingleValue,
            stripTrailingSlash: stripTrailingSlash,
            prepareParams: prepareParams,
            sendXmlHttpRequest: _classPrivateFieldGet2(_sendXmlHttpRequest, this),
            isResponseValid: _classPrivateFieldGet2(_isResponseValid, this),
            getInternalDeviceIdType: _classPrivateFieldGet2(_getInternalDeviceIdType, this),
            getMsTimestamp: getMsTimestamp,
            getTimestamp: getTimestamp,
            isResponseValidBroad: _classPrivateFieldGet2(_isResponseValidBroad, this),
            secureRandom: secureRandom,
            log: _classPrivateFieldGet2(_log, this),
            checkIfLoggingIsOn: checkIfLoggingIsOn,
            getMetrics: _classPrivateFieldGet2(_getMetrics, this),
            getUA: _classPrivateFieldGet2(_getUA, this),
            prepareRequest: _classPrivateFieldGet2(_prepareRequest, this),
            generateUUID: generateUUID,
            sendEventsForced: _classPrivateFieldGet2(_sendEventsForced, this),
            isUUID: _classPrivateFieldGet2(_isUUID, this),
            calculateChecksum: calculateChecksum,
            isReferrerUsable: _classPrivateFieldGet2(_isReferrerUsable, this),
            getId: _classPrivateFieldGet2(_getStoredIdOrGenerateId, this),
            heartBeat: _classPrivateFieldGet2(_heartBeat, this),
            toRequestQueue: _classPrivateFieldGet2(_toRequestQueue, this),
            reportViewDuration: _classPrivateFieldGet2(_reportViewDuration, this),
            loadJS: loadJS,
            loadCSS: loadCSS,
            getLastView: _classPrivateFieldGet2(_getLastView, this),
            setToken: _classPrivateFieldGet2(_setToken, this),
            getToken: _classPrivateFieldGet2(_getToken, this),
            showLoader: showLoader,
            hideLoader: hideLoader,
            setValueInStorage: _classPrivateFieldGet2(_setValueInStorage, this),
            getValueFromStorage: _classPrivateFieldGet2(_getValueFromStorage, this),
            removeValueFromStorage: _classPrivateFieldGet2(_removeValueFromStorage, this),
            add_cly_events: _classPrivateFieldGet2(_add_cly_events, this),
            processScrollView: _classPrivateFieldGet2(_processScrollView, this),
            processScroll: _classPrivateFieldGet2(_processScroll, this),
            currentUserAgentString: currentUserAgentString,
            currentUserAgentDataString: currentUserAgentDataString,
            userAgentDeviceDetection: userAgentDeviceDetection,
            userAgentSearchBotDetection: userAgentSearchBotDetection,
            getRequestQueue: _classPrivateFieldGet2(_getRequestQueue, this),
            getEventQueue: _classPrivateFieldGet2(_getEventQueue, this),
            sendFetchRequest: _classPrivateFieldGet2(_sendFetchRequest, this),
            processAsyncQueue: _classPrivateFieldGet2(_processAsyncQueue, this),
            makeNetworkRequest: _classPrivateFieldGet2(_makeNetworkRequest, this),
            onStorageChange: _classPrivateFieldGet2(_onStorageChange, this),
            clearQueue: _classPrivateFieldGet2(_clearQueue, this),
            getLocalQueues: _classPrivateFieldGet2(_getLocalQueues, this),
            testingGetRequests: _classPrivateFieldGet2(_getGeneratedRequests, this),
            setFakeRequestHandler: function setFakeRequestHandler(handler) {
                _classPrivateFieldSet2(_fakeRequestHandler, _this, handler);
            },
            getFakeRequestHandler: function getFakeRequestHandler() {
                return _classPrivateFieldGet2(_fakeRequestHandler, _this);
            },
            closeContent: function closeContent() {
                return _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
            }
        });
        /**
         * Health Check Interface:
         * {sendInstantHCRequest} Sends instant health check request
         * {resetAndSaveCounters} Resets and saves health check counters (including backoff counters)
         * {incrementErrorCount} Increments health check error count
         * {incrementWarningCount} Increments health check warning count
         * {incrementBackoffCount} Increments health check backoff count and consecutive backoff count
         * {resetConsecutiveBackoffCount} Resets consecutive backoff tracking flag (not the counter value)
         * {resetCounters} Resets health check counters (excluding backoff counters)
         * {saveRequestCounters} Saves health check request counters
         */
        _classPrivateFieldInitSpec(this, _HealthCheck, {
            sendInstantHCRequest: function sendInstantHCRequest() {
                if (_classPrivateFieldGet2(_offlineMode, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendInstantHCRequest, Offline mode is active. Not sending health check request.");
                    _classPrivateFieldSet2(_shouldSendHC, _this, true);
                    return;
                }
                // truncate error message to 1000 characters
                var curbedMessage = truncateSingleValue(_this.hcErrorMessage, 1000, "healthCheck", _classPrivateFieldGet2(_log, _this));
                // due to some server issues we pass empty string as is
                if (curbedMessage !== "") {
                    curbedMessage = JSON.stringify(curbedMessage);
                }
                // prepare hc object
                var hc = {
                    el: _this.hcErrorCount,
                    wl: _this.hcWarningCount,
                    sc: _this.hcStatusCode,
                    em: curbedMessage,
                    bom: _this.hcBackoffCount,
                    cbom: _this.hcConsecutiveBackoffCount
                };
                // prepare request
                var request = {
                    hc: JSON.stringify(hc),
                    metrics: JSON.stringify({
                        _app_version: _this.app_version
                    })
                };
                // add common request params
                _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);
                // send request
                _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "[healthCheck]", _this.url + _classPrivateFieldGet2(_apiPath, _this), request, function (err) {
                    // request maker already logs the error. No need to log it again here
                    if (!err) {
                        // reset and save health check counters if request was successful
                        _classPrivateFieldGet2(_HealthCheck, _this).resetAndSaveCounters();
                    }
                }, true);
            },
            resetAndSaveCounters: function resetAndSaveCounters() {
                _classPrivateFieldGet2(_HealthCheck, _this).resetCounters();
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.errorCount, _this.hcErrorCount);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.warningCount, _this.hcWarningCount);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.statusCode, _this.hcStatusCode);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.errorMessage, _this.hcErrorMessage);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.backoffCount, _this.hcBackoffCount);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.consecutiveBackoffCount, _this.hcConsecutiveBackoffCount);
            },
            incrementErrorCount: function incrementErrorCount() {
                _this.hcErrorCount++;
            },
            incrementWarningCount: function incrementWarningCount() {
                _this.hcWarningCount++;
            },
            incrementBackoffCount: function incrementBackoffCount() {
                _this.hcBackoffCount++;
                if (_classPrivateFieldGet2(_lastRequestWasBackoff, _this)) {
                    _this.hcConsecutiveBackoffCount++;
                }
                _classPrivateFieldSet2(_lastRequestWasBackoff, _this, true);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.backoffCount, _this.hcBackoffCount);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.consecutiveBackoffCount, _this.hcConsecutiveBackoffCount);
            },
            resetLastRequestBackoffStatus: function resetLastRequestBackoffStatus() {
                _classPrivateFieldSet2(_lastRequestWasBackoff, _this, false);
            },
            resetCounters: function resetCounters() {
                _this.hcErrorCount = 0;
                _this.hcWarningCount = 0;
                _this.hcStatusCode = -1;
                _this.hcErrorMessage = "";
                _this.hcBackoffCount = 0;
                _this.hcConsecutiveBackoffCount = 0;
            },
            saveRequestCounters: function saveRequestCounters(status, responseText) {
                _this.hcStatusCode = status;
                _this.hcErrorMessage = responseText;
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.statusCode, _this.hcStatusCode);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.errorMessage, _this.hcErrorMessage);
            }
        });
        _classPrivateFieldSet2(_self, this, this);
        _classPrivateFieldSet2(_global, this, !Countly.i);
        _classPrivateFieldSet2(_sessionStarted, this, false);
        _classPrivateFieldSet2(_apiPath, this, "/i");
        _classPrivateFieldSet2(_readPath, this, "/o/sdk");
        _classPrivateFieldSet2(_requestQueue, this, []);
        _classPrivateFieldSet2(_eventQueue, this, []);
        _classPrivateFieldSet2(_remoteConfigs, this, {});
        _classPrivateFieldSet2(_crashLogs, this, []);
        _classPrivateFieldSet2(_timedEvents, this, {});
        _classPrivateFieldSet2(_crashSegments, this, null);
        _classPrivateFieldSet2(_autoExtend, this, true);
        _classPrivateFieldGet2(_lastBeat, this);
        _classPrivateFieldSet2(_storedDuration, this, 0);
        _classPrivateFieldSet2(_lastView, this, null);
        _classPrivateFieldSet2(_lastViewTime, this, 0);
        _classPrivateFieldSet2(_lastViewStoredDuration, this, 0);
        _classPrivateFieldSet2(_failTimeout, this, 0);
        _classPrivateFieldSet2(_inactivityCounter, this, 0);
        _classPrivateFieldSet2(_readyToProcess, this, true);
        _classPrivateFieldSet2(_lastRequestDuration, this, 0);
        _classPrivateFieldSet2(_backoffEndTime, this, 0);
        _classPrivateFieldSet2(_isInBackoff, this, false);
        _classPrivateFieldSet2(_hasPulse, this, false);
        _classPrivateFieldSet2(_lastParams, this, {});
        _classPrivateFieldSet2(_trackTime, this, true);
        _classPrivateFieldSet2(_startTime, this, getTimestamp());
        _classPrivateFieldSet2(_lsSupport, this, true);
        _classPrivateFieldSet2(_firstView, this, null);
        _classPrivateFieldSet2(_deviceIdType, this, DeviceIdTypeInternalEnums.SDK_GENERATED);
        _classPrivateFieldSet2(_isScrollRegistryOpen, this, false);
        _classPrivateFieldSet2(_scrollRegistryTopPosition, this, 0);
        _classPrivateFieldSet2(_trackingScrolls, this, false);
        _classPrivateFieldSet2(_currentViewId, this, null); // this is the global variable for tracking the current view's ID. Used in view tracking. Becomes previous view ID at the end.
        _classPrivateFieldSet2(_previousViewId, this, null); // this is the global variable for tracking the previous view's ID. Used in view tracking. First view has no previous view ID.
        _classPrivateFieldSet2(_freshUTMTags, this, null);
        _classPrivateFieldSet2(_shouldSendHC, this, false);
        _classPrivateFieldSet2(_generatedRequests, this, []);
        _classPrivateFieldSet2(_contentEndPoint, this, "/o/sdk/content");
        _classPrivateFieldSet2(_inContentZone, this, false);
        _classPrivateFieldSet2(_contentZoneTimer, this, null);
        _classPrivateFieldSet2(_contentIframeID, this, "cly-content-iframe");
        _classPrivateFieldSet2(_crashFilterCallback, this, null);
        _classPrivateFieldSet2(_SCNetwork, this, true);
        _classPrivateFieldSet2(_SCSizeReqQueue, this, getConfig("queue_size", _ob, configurationDefaultValues.QUEUE_SIZE));
        _classPrivateFieldSet2(_SCSizeEventBatch, this, getConfig("max_events", _ob, configurationDefaultValues.MAX_EVENT_BATCH));
        _classPrivateFieldSet2(_SCIntervalSessionUpdate, this, getConfig("session_update", _ob, configurationDefaultValues.SESSION_UPDATE));
        _classPrivateFieldSet2(_SCIntervalContent, this, Math.max(getConfig("content_zone_timer_interval", _ob, 30), 15) * 1000); // min 15 seconds
        _classPrivateFieldSet2(_SCInterval, this, 4); // 4 hours
        _classPrivateFieldSet2(_SCTrackingAll, this, true);
        _classPrivateFieldSet2(_SCTrackingSession, this, true);
        _classPrivateFieldSet2(_SCTrackingCrashes, this, true);
        _classPrivateFieldSet2(_SCTrackingViews, this, true);
        _classPrivateFieldSet2(_SCTrackingEvents, this, true);
        _classPrivateFieldSet2(_SCTrackingLocation, this, true);
        _classPrivateFieldSet2(_SCEnableContent, this, false);
        _classPrivateFieldSet2(_SCEnableRefreshContentZone, this, true);
        _classPrivateFieldSet2(_SCEnableConsentRequired, this, getConfig("require_consent", _ob, false));
        _classPrivateFieldSet2(_SCLimitKeyLength, this, getConfig("max_key_length", _ob, configurationDefaultValues.MAX_KEY_LENGTH));
        _classPrivateFieldSet2(_SCLimitValueSize, this, getConfig("max_value_size", _ob, configurationDefaultValues.MAX_VALUE_SIZE));
        _classPrivateFieldSet2(_SCLimitSegmentationValues, this, getConfig("max_segmentation_values", _ob, configurationDefaultValues.MAX_SEGMENTATION_VALUES));
        _classPrivateFieldSet2(_SCLimitBreadcrumbCount, this, getConfig("max_breadcrumb_count", _ob, configurationDefaultValues.MAX_BREADCRUMB_COUNT));
        _classPrivateFieldSet2(_SCLimitStackTraceLinesPerThread, this, getConfig("max_stack_trace_lines_per_thread", _ob, configurationDefaultValues.MAX_STACKTRACE_LINES_PER_THREAD));
        _classPrivateFieldSet2(_SCLimitStackTraceLineLength, this, getConfig("max_stack_trace_line_length", _ob, configurationDefaultValues.MAX_STACKTRACE_LINE_LENGTH));
        _classPrivateFieldSet2(_SCBackoffMechanismEnabled, this, !getConfig("disable_backoff_mechanism", _ob, false));
        _classPrivateFieldSet2(_SCBackoffAcceptedTimeout, this, 10); // 10 seconds
        _classPrivateFieldSet2(_SCBackoffRQPercentage, this, 0.5); // 50% of the request queue
        _classPrivateFieldSet2(_SCBackoffRequestAge, this, 24); // 24 hours
        _classPrivateFieldSet2(_SCBackoffDuration, this, 60); // 60 seconds
        _classPrivateFieldSet2(_SCEventBlacklist, this, []);
        _classPrivateFieldSet2(_SCEventWhitelist, this, []);
        _classPrivateFieldSet2(_SCUserPropertyBlacklist, this, []);
        _classPrivateFieldSet2(_SCUserPropertyWhitelist, this, []);
        _classPrivateFieldSet2(_SCSegmentationBlacklist, this, []);
        _classPrivateFieldSet2(_SCSegmentationWhitelist, this, []);
        _classPrivateFieldSet2(_SCEventSegmentationBlacklist, this, {});
        _classPrivateFieldSet2(_SCEventSegmentationWhitelist, this, {});
        _classPrivateFieldSet2(_SCJourneyTriggerEvents, this, []);
        _classPrivateFieldSet2(_requestTimeoutDuration, this, 30000); // 30 seconds
        _classPrivateFieldSet2(_contentFilterCallback, this, null);
        _classPrivateFieldSet2(_isProcessingAsyncFromUserDataSave, this, false);
        _classPrivateFieldSet2(_journeyTriggerInProgress, this, false);
        _classPrivateFieldSet2(_journeyTriggerPending, this, false);
        _classPrivateFieldSet2(_journeyPendingEventIds, this, new Set());
        _classPrivateFieldSet2(_fakeRequestHandler, this, getConfig("fake_request_handler", _ob, null));
        this.app_key = getConfig("app_key", _ob, null);
        this.url = stripTrailingSlash(getConfig("url", _ob, ""));
        this.serialize = getConfig("serialize", _ob, Countly.serialize);
        this.deserialize = getConfig("deserialize", _ob, Countly.deserialize);
        _classPrivateFieldSet2(_isSCDisabled, this, getConfig("disable_sdk_behavior_settings_updates", _ob, false));
        _classPrivateFieldSet2(_backOffLogShown, this, false);
        _classPrivateFieldSet2(_testModeTime, this, getConfig("test_mode_time", _ob, 0));
        try {
            localStorage.setItem("cly_testLocal", true);
            // clean up test
            localStorage.removeItem("cly_testLocal");
        } catch (e) {
            _classPrivateFieldGet2(_log, this).call(this, logLevelEnums.ERROR, "Local storage test failed, Halting local storage support: " + e);
            _classPrivateFieldSet2(_lsSupport, this, false);
        }
        _classPrivateFieldSet2(_serverConfigCache, this, _classPrivateFieldGet2(_getValueFromStorage, this).call(this, "cly_config"));
        if (!_classPrivateFieldGet2(_serverConfigCache, this)) {
            _classPrivateFieldSet2(_serverConfigCache, this, getConfig("behavior_settings", _ob, {}));
            _classPrivateFieldGet2(_setValueInStorage, this).call(this, "cly_config", JSON.stringify(_classPrivateFieldGet2(_serverConfigCache, this)));
        }
        _classPrivateFieldGet2(_populateServerConfig, this).call(this, _classPrivateFieldGet2(_serverConfigCache, this));

        // create object to store consents
        _classPrivateFieldSet2(_consents, this, {});
        for (var it = 0; it < Countly.features.length; it++) {
            _classPrivateFieldGet2(_consents, this)[Countly.features[it]] = {};
        }
        _classPrivateFieldGet2(_initialize, this).call(this, _ob);

        // start SDK
        _classPrivateFieldGet2(_notifyLoaders, this).call(this);
        setTimeout(function () {
            if (!Countly.noHeartBeat) {
                _classPrivateFieldGet2(_heartBeat, _this).call(_this);
            } else {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, Heartbeat disabled. This is for testing purposes only!");
            }
            if (_this.remote_config) {
                _this.fetch_remote_config(_this.remote_config);
            }
        }, 1);
        if (isBrowser) {
            document.documentElement.setAttribute("data-countly-useragent", currentUserAgentString());
        }
        _classPrivateFieldSet2(_initTimestamp, this, getMsTimestamp());
        // send instant health check request
        _classPrivateFieldGet2(_HealthCheck, this).sendInstantHCRequest();
        if (_classPrivateFieldGet2(_SCEnableContent, this)) {
            _classPrivateFieldGet2(_enterContentZoneInternal, this).call(this);
            _classPrivateFieldSet2(_initContentSent, this, true);
        }
        _classPrivateFieldGet2(_log, this).call(this, logLevelEnums.INFO, "initialize, Countly initialized");
    });

    var apmLibrariesNotLoaded = true; // used to prevent loading apm scripts multiple times.

    Countly.features = [featureEnums.APM, featureEnums.ATTRIBUTION, featureEnums.CLICKS, featureEnums.CRASHES, featureEnums.EVENTS, featureEnums.FEEDBACK, featureEnums.FORMS, featureEnums.LOCATION, featureEnums.REMOTE_CONFIG, featureEnums.SCROLLS, featureEnums.SESSIONS, featureEnums.STAR_RATING, featureEnums.USERS, featureEnums.VIEWS];
    Countly.q = Countly.q || [];
    Countly.onload = Countly.onload || [];
    Countly.CountlyClass = CountlyClass;
    Countly.init = function (conf) {
        conf = conf || {};
        if (Countly.loadAPMScriptsAsync && apmLibrariesNotLoaded) {
            apmLibrariesNotLoaded = false;
            initAfterLoadingAPM(conf);
            return;
        }
        var appKey = conf.app_key || Countly.app_key;
        if (!Countly.i || !Countly.i[appKey]) {
            var inst = new CountlyClass(conf);
            if (!Countly.i) {
                Countly.i = {};
                for (var key in inst) {
                    Countly[key] = inst[key];
                }
            }
            Countly.i[appKey] = inst;
        }
        return Countly.i[appKey];
    };
    function initAfterLoadingAPM(conf) {
        // TODO: We assume we are in browser context. If browser context checks at top are removed this code should have its own check.
        // TODO: We already have a loadFile and loadJS functions but they are not used here. If readability would improve that way, they can also be considered here.

        // Create boomerang script
        var boomerangScript = document.createElement("script");
        var countlyBoomerangScript = document.createElement("script");

        // Set boomerang script attributes
        boomerangScript.async = true;
        countlyBoomerangScript.async = true;

        // Set boomerang script source
        boomerangScript.src = Countly.customSourceBoomerang || CDN.BOOMERANG_SRC;
        countlyBoomerangScript.src = Countly.customSourceCountlyBoomerang || CDN.CLY_BOOMERANG_SRC;

        // Append boomerang script to the head
        document.getElementsByTagName("head")[0].appendChild(boomerangScript);
        document.getElementsByTagName("head")[0].appendChild(countlyBoomerangScript);
        var boomLoaded = false;
        var countlyBoomLoaded = false;
        boomerangScript.onload = function () {
            boomLoaded = true;
        };
        countlyBoomerangScript.onload = function () {
            countlyBoomLoaded = true;
        };
        var timeoutCounter = 0;
        var intervalDuration = 50;
        var timeoutLimit = 1500; // TODO: Configurable? Mb with Countly.apmScriptLoadTimeout?
        // init Countly only after boomerang is loaded
        var intervalID = setInterval(function () {
            timeoutCounter += intervalDuration;
            if (boomLoaded && countlyBoomLoaded || timeoutCounter >= timeoutLimit) {
                if (Countly.debug) {
                    var message = "BoomerangJS loaded:[" + boomLoaded + "], countly_boomerang loaded:[" + countlyBoomLoaded + "].";
                    if (boomLoaded && countlyBoomLoaded) {
                        message = "[DEBUG] " + message;
                        // eslint-disable-next-line no-console
                        console.log(message);
                    } else {
                        message = "[WARNING] " + message + " Initializing without APM.";
                        // eslint-disable-next-line no-console
                        console.warn(message);
                    }
                }
                Countly.init(conf);
                clearInterval(intervalID);
            }
        }, intervalDuration);
    }

    /**
    * Overwrite serialization function for extending SDK with encryption, etc
    * @param {any} value - value to serialize
    * @return {string} serialized value
    * */
    Countly.serialize = function (value) {
        try {
            // Convert object values to JSON
            if (_typeof(value) === "object") {
                value = JSON.stringify(value);
            }
        } catch (error) {
            // silent fail        
        }
        return value;
    };

    /**
    * Overwrite deserialization function for extending SDK with encryption, etc
    * @param {string} data - value to deserialize
    * @return {varies} deserialized value
    * */
    Countly.deserialize = function (data) {
        if (data === "") {
            // we expect string or null only. Empty sting would throw an error.
            return data;
        }
        // Try to parse JSON...
        try {
            data = JSON.parse(data);
        } catch (e) {
            // silent fail
        }
        return data;
    };

    /**
    * Overwrite a way to retrieve view name
    * @return {string} view name
    * */
    Countly.getViewName = function () {
        if (!isBrowser) {
            return "web_worker";
        }
        return window.location.pathname;
    };

    /**
    * Overwrite a way to retrieve view url
    * @return {string} view url
    * */
    Countly.getViewUrl = function () {
        if (!isBrowser) {
            return "web_worker";
        }
        return window.location.pathname;
    };

    /**
    * Overwrite a way to get search query
    * @return {string} view url
    * */
    Countly.getSearchQuery = function () {
        if (!isBrowser) {
            return;
        }
        return window.location.search;
    };

    /**
    * Possible device Id types are: DEVELOPER_SUPPLIED, SDK_GENERATED, TEMPORARY_ID
    * @enum DeviceIdType
    * */
    Countly.DeviceIdType = {
        DEVELOPER_SUPPLIED: DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED,
        SDK_GENERATED: DeviceIdTypeInternalEnums.SDK_GENERATED,
        TEMPORARY_ID: DeviceIdTypeInternalEnums.TEMPORARY_ID
    };

    /**
     *  Monitor parallel storage changes like other opened tabs
     */
    if (isBrowser) {
        window.addEventListener("storage", function (e) {
            var parts = (e.key + "").split("/");
            var key = parts.pop();
            var appKey = parts.pop();
            if (Countly.i && Countly.i[appKey]) {
                Countly.i[appKey]._internals.onStorageChange(key, e.newValue);
            }
        });
    }

    exports.default = Countly;

    Object.defineProperty(exports, '__esModule', { value: true });

}));   