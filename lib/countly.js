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
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Countly = factory());
})(this, (function () {
    'use strict';

    function _arrayLikeToArray(r, a) {
        (null == a || a > r.length) && (a = r.length);
        for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
        return n;
    }
    function _arrayWithoutHoles(r) {
        if (Array.isArray(r)) return _arrayLikeToArray(r);
    }
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
    function _iterableToArray(r) {
        if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
    }
    function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
    function _toConsumableArray(r) {
        return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
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
    function _unsupportedIterableToArray(r, a) {
        if (r) {
            if ("string" == typeof r) return _arrayLikeToArray(r, a);
            var t = {}.toString.call(r).slice(8, -1);
            return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
        }
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
        REMOTE_CONFIG: "remote-config",
        PUSH: "push",
        CONTENT: "content"
    };

    // every feature in featureEnums, alphabetically, the order Countly.features lists them in
    var featureList = Object.keys(featureEnums).map(function (key) {
        return featureEnums[key];
    }).sort();

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
        ACTION: "[CLY]_action",
        PUSH_ACTION: "[CLY]_push_action"
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
     * Maps the internal log level to the single character the server expects on the wire
     */
    var logLevelToWireChar = {
        "[ERROR] ": "e",
        "[WARNING] ": "w",
        "[INFO] ": "i",
        "[DEBUG] ": "d",
        "[VERBOSE] ": "v"
    };

    /**
     * Default and limit values for the operator driven internal log gathering ('lg' server config key)
     */
    var logGatheringDefaultValues = {
        ALLOWED_LEVELS: "ewidv",
        BATCH_SIZE: 100,
        MIN_BATCH_SIZE: 10,
        // buffer cap while undecided, and so also the largest batch the server may ask for
        MAX_BUFFERED_LINES: 500,
        // milliseconds between time based flushes, checked on the heartbeat
        FLUSH_INTERVAL: 60000,
        MAX_MESSAGE_LENGTH: 4096
    };

    /**
     * The consent a gathered log line needs when consent is required, by the method its message starts with
     * ("add_event, ..." or a bracketed prefix such as "[userData] ..."). Any other line needs both "events" and "users" consent.
     */
    var logLineConsent = Object.freeze({
        add_event: featureEnums.EVENTS,
        start_event: featureEnums.EVENTS,
        end_event: featureEnums.EVENTS,
        cancel_event: featureEnums.EVENTS,
        begin_session: featureEnums.SESSIONS,
        session_duration: featureEnums.SESSIONS,
        end_session: featureEnums.SESSIONS,
        track_sessions: featureEnums.SESSIONS,
        track_session: featureEnums.SESSIONS,
        track_pageview: featureEnums.VIEWS,
        track_view: featureEnums.VIEWS,
        reportViewDuration: featureEnums.VIEWS,
        getLastView: featureEnums.VIEWS,
        track_clicks: featureEnums.CLICKS,
        track_links: featureEnums.CLICKS,
        track_scrolls: featureEnums.SCROLLS,
        processScroll: featureEnums.SCROLLS,
        processScrollView: featureEnums.SCROLLS,
        track_forms: featureEnums.FORMS,
        track_errors: featureEnums.CRASHES,
        log_error: featureEnums.CRASHES,
        recordError: featureEnums.CRASHES,
        record_error: featureEnums.CRASHES,
        add_log: featureEnums.CRASHES,
        report_conversion: featureEnums.ATTRIBUTION,
        recordDirectAttribution: featureEnums.ATTRIBUTION,
        user_details: featureEnums.USERS,
        "[userData]": featureEnums.USERS,
        collect_from_forms: featureEnums.USERS,
        collect_from_facebook: featureEnums.USERS,
        report_orientation: featureEnums.USERS,
        recordRatingWidgetWithID: featureEnums.STAR_RATING,
        presentRatingWidgetWithID: featureEnums.STAR_RATING,
        enableRatingWidgets: featureEnums.STAR_RATING,
        initializeRatingWidgets: featureEnums.STAR_RATING,
        initialize_feedback_popups: featureEnums.STAR_RATING,
        enable_feedback: featureEnums.STAR_RATING,
        show_feedback_popup: featureEnums.STAR_RATING,
        report_feedback: featureEnums.STAR_RATING,
        report_trace: featureEnums.APM,
        present_feedback_widget: featureEnums.FEEDBACK,
        reportFeedbackWidgetManually: featureEnums.FEEDBACK,
        getFeedbackWidgetData: featureEnums.FEEDBACK,
        get_available_feedback_widgets: featureEnums.FEEDBACK,
        interpretFeedbackWidgetMessage: featureEnums.FEEDBACK,
        processWidget: featureEnums.FEEDBACK,
        fetch_remote_config: featureEnums.REMOTE_CONFIG,
        fetch_remote_config_explicit: featureEnums.REMOTE_CONFIG,
        get_remote_config: featureEnums.REMOTE_CONFIG,
        enrollUserToAb: featureEnums.REMOTE_CONFIG,
        enable_push_notifications: featureEnums.PUSH,
        disable_push_notifications: featureEnums.PUSH,
        record_push_action: featureEnums.PUSH,
        set_push_notification_listener: featureEnums.PUSH,
        handlePushAction: featureEnums.PUSH,
        autoRegisterPush: featureEnums.PUSH,
        subscribeAndRegisterToken: featureEnums.PUSH,
        sendPushToken: featureEnums.PUSH,
        resolvePushRegistration: featureEnums.PUSH,
        findPushRegistration: featureEnums.PUSH,
        requestNotificationPermission: featureEnums.PUSH,
        urlBase64ToUint8Array: featureEnums.PUSH,
        initPushMessageListener: featureEnums.PUSH,
        removePushMessageListener: featureEnums.PUSH,
        notifyPushListener: featureEnums.PUSH,
        postToPushWorker: featureEnums.PUSH,
        announceToPushWorker: featureEnums.PUSH,
        updatePushWorker: featureEnums.PUSH,
        releasePushTokenOfLeavingUser: featureEnums.PUSH,
        "[SW]": featureEnums.PUSH,
        "content.enterContentZone": featureEnums.CONTENT,
        "content.exitContentZone": featureEnums.CONTENT,
        "content.refreshContentZone": featureEnums.CONTENT,
        sendContentRequest: featureEnums.CONTENT,
        prepareContentRequest: featureEnums.CONTENT,
        displayContent: featureEnums.CONTENT,
        interpretContentMessage: featureEnums.CONTENT,
        journeyTrigger: featureEnums.CONTENT
    });

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
     * how long tabs of a site wait for each other around a device ID or profile change, in milliseconds
     */
    var tabHandoverTimes = {
        // the changing tab waits this long for what the other tabs leave, which it sends before its change
        COLLECT: 500,
        // after another tab changes the device ID, a tab sends nothing of its own for this long
        PAUSE: 2000
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

    /**
     * postMessage `type` values exchanged between the page and the Countly service worker.
     * Mirrored by hand as the CLY_* constants in countly_sw.js (the worker cannot import this file);
     * cypress/e2e/web_push_sw.cy.js fails if the two drift. Treat these as a wire contract: a
     * customer's cached worker may be a different version than the page SDK, so never rename them.
     */
    var pushMessageTypes = Object.freeze({
        ACTION: "countly_push_action",
        SUBSCRIPTION_CHANGE: "countly_push_subscription_change",
        READY: "countly_push_ready",
        ACK: "countly_push_ack",
        RECEIVED: "countly_push_received",
        CLOSED: "countly_push_closed",
        LOG: "countly_push_log",
        CONFIG: "countly_push_config",
        WORKER_VERSION: "countly_push_worker_version"
    });

    /**
     * Query parameters the SDK appends to the service worker URL so the worker knows the page's
     * configuration without a round trip. Mirrored by hand in countly_sw.js.
     * persist: "0" while the page runs with storage "none"
     */
    var pushWorkerParams = Object.freeze({
        debug: "cly_debug",
        persist: "cly_persist"
    });

    /**
     * Local storage keys holding the last registered push subscription, the explicit opt-out
     * (set by disable_push_notifications, cleared by enable_push_notifications, kept across halt()),
     * the device IDs merged into others and the token sent in the current session
     */
    var pushStorageKeys = Object.freeze({
        endpoint: "cly_push_endpoint",
        vapidKey: "cly_push_vapid_key",
        scope: "cly_push_scope",
        optOut: "cly_push_opt_out",
        mergedIds: "cly_push_merged_ids",
        sessionToken: "cly_push_session_token"
    });

    /**
     * Web push behaviour constants
     * MAX_SEEN_ACTION_IDS: how many recently handled push action ids are kept to drop duplicates
     * MAX_MERGED_DEVICE_IDS: how many device ID merges are remembered for the clicks the service worker kept
     * VAPID_PUBLIC_KEY_BYTE_LENGTH / VAPID_PUBLIC_KEY_PREFIX: an uncompressed P-256 point is 65 bytes and starts with 0x04
     * SUBSCRIBE_TIMEOUT_MS: how long enable_push_notifications waits for the browser to create a subscription before giving up on that attempt
     * DEFAULT_SCOPE_FOLDER: the worker's default scope, a folder next to the worker file
     */
    var pushConstants = Object.freeze({
        MAX_SEEN_ACTION_IDS: 20,
        MAX_MERGED_DEVICE_IDS: 20,
        SUBSCRIBE_TIMEOUT_MS: 30000,
        VAPID_PUBLIC_KEY_BYTE_LENGTH: 65,
        VAPID_PUBLIC_KEY_PREFIX: 4,
        TOKEN_PROVIDER: "WEB",
        BLACKLISTED_TOKEN: "BLACKLISTED",
        DEFAULT_SCOPE_FOLDER: "countly-push/"
    });
    var SDK_VERSION = "26.8.1";
    var SDK_NAME = "javascript_native_web";

    /**
     * Segmentation keys the server and the widget and content pages read on content and feedback widget events, which
     * the global content segmentation leaves out: the server drops a survey event carrying "closed" outside a journey,
     * skips widget processing for any "campaign_id", counts keys starting with "answ" as survey answers and drops a
     * rating event whose "rating" is not 1 to 5, and the widget pages fill in only keys the event leaves empty
     */
    var contentReservedSegmentationKeys = Object.freeze(["widget_id", "platform", "app_version", "rating", "ratingSum", "comment", "email", "contactMe", "platform_version_rate", "shown", "closed", "answered", "answers", "type", "summaryUpdated", "campaign_id", "schedule_id", "content_id", "journey_id", "journey_definition_id", "journey_instance_id", "journeyId", "journeyDefinitionId", "journeyInstanceId", "blockId", "dismissed", "element", "element_id", "started", "commented"]);
    var contentReservedSegmentationPrefix = "answ";

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
     *  Gives the fields of a multipart request with their plain values, in the order the checksum is calculated
     *  @memberof Countly._internals
     *  @param {Object} params - key value object of the fields
     *  @param {String} salt - salt to sign the fields with, if any
     *  @returns {Promise<Array>} [key, value] pairs, the checksum last when there is a salt
     */
    function prepareFormFields(params, salt) {
        var fields = [];
        var keys = Object.keys(params || {}).sort();
        for (var k = 0; k < keys.length; k++) {
            fields.push([keys[k], String(params[keys[k]])]);
        }
        if (salt) {
            // the server signs the plain field values again, as key=value pairs joined with "&"
            var data = fields.map(function (field) {
                return field[0] + "=" + field[1];
            }).join("&");
            return calculateChecksum(data, salt).then(function (checksum) {
                fields.push(["checksum256", checksum.toUpperCase()]);
                return fields;
            });
        }
        return Promise.resolve(fields);
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
     * Returns a copy of a value that JSON can always encode, with the JSON the original gives wherever it can be encoded.
     * BigInt numbers become strings, so IDs keep every digit. A value JSON still cannot encode, such as an object that refers
     * back to itself (a React click event holds the window), is left out and logged as an error, so it can never stop the SDK
     * from turning its queues into JSON later.
     * @param {*} value - value to copy
     * @param {string} errorLog - prefix for error log
     * @param {function} logCall - internal logging function
     * @returns {*} the value, its copy, or undefined when JSON cannot encode it
     */
    function makeJsonSafe(value, errorLog, logCall) {
        if (typeof value === "bigint") {
            return value.toString();
        }
        if (value === null || _typeof(value) !== "object") {
            return value;
        }
        try {
            var json = JSON.stringify(value, function (key, v) {
                return typeof v === "bigint" ? v.toString() : v;
            });
            return typeof json === "undefined" ? undefined : JSON.parse(json);
        } catch (ex) {
            logCall(logLevelEnums.ERROR, errorLog + ", A value JSON cannot encode was left out: [" + ex + "]");
            return undefined;
        }
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
                var safeValue = makeJsonSafe(obj[key], errorLog, logCall);
                if (typeof safeValue === "undefined" && typeof obj[key] !== "undefined") {
                    continue;
                }
                var newKey = truncateSingleValue(key, keyLimit, errorLog, logCall);
                var newValue = truncateSingleValue(safeValue, valueLimit, errorLog, logCall);
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
     * Decodes standard base64 text into bytes, with atob or, in runtimes without it, Buffer.
     * Buffer is read from globalThis: Parcel replaces a bare Buffer in browser bundles with the npm buffer package, which
     * every site would then have to install.
     * @param {String} base64 - standard base64 text
     * @returns {Uint8Array} the decoded bytes
     * @throws when atob rejects the text, or when the runtime has neither atob nor Buffer
     */
    function base64ToBytes(base64) {
        if (typeof atob === "function") {
            var binary = atob(base64);
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        }
        if (typeof globalThis.Buffer !== "undefined") {
            return new Uint8Array(globalThis.Buffer.from(base64, "base64"));
        }
        throw new Error("No base64 decoder in this runtime");
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
     * Parse Windows version from UA-CH platformVersion
     * Chromium based browsers use platformVersion major >= 13 for Windows 11 and lower values for Windows 10.
     *
     * @param {string} platformVersion - platformVersion value from userAgentData.getHighEntropyValues
     * @returns {string|null} "11", "10" or null if not parsable
     */
    function parseWindowsVersionFromPlatformVersion(platformVersion) {
        if (typeof platformVersion !== "string" || !platformVersion) {
            return null;
        }
        var major = parseInt(platformVersion.split(".")[0], 10);
        if (isNaN(major)) {
            return null;
        }
        return major >= 13 ? "11" : "10";
    }

    /**
     * Retrieve User-Agent Client Hints (high entropy values) when available.
     *
     * @param {Object} uaDataOverride - optional userAgentData override for testing
     * @returns {Promise<Object|null>} resolved hints object or null
     */
    function getUserAgentClientHintsInternal(uaData) {
        if (!uaData || typeof uaData.getHighEntropyValues !== "function") {
            return Promise.resolve(null);
        }
        return uaData.getHighEntropyValues(["platform", "platformVersion", "architecture", "bitness", "model", "uaFullVersion", "fullVersionList"]).then(function (values) {
            if (!values || _typeof(values) !== "object") {
                return null;
            }
            var browserName = null;
            var browserVersion = null;
            var versionList = Array.isArray(values.fullVersionList) ? values.fullVersionList : [];
            var fallbackList = Array.isArray(uaData.brands) ? uaData.brands : [];
            var normalizeBrand = function normalizeBrand(brand) {
                return typeof brand === "string" ? brand.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
            };
            var isGreaseBrand = function isGreaseBrand(brand) {
                var normalized = normalizeBrand(brand);
                return normalized === "notabrand" || normalized === "notabrand99" || normalized.indexOf("notabrand") === 0;
            };
            var isChromiumBrand = function isChromiumBrand(brand) {
                return normalizeBrand(brand) === "chromium";
            };
            var pickEntry = function pickEntry(list, allowChromiumFallback) {
                return list.find(function (entry) {
                    if (!entry || !entry.brand) {
                        return false;
                    }
                    if (isGreaseBrand(entry.brand)) {
                        return false;
                    }
                    if (!allowChromiumFallback && isChromiumBrand(entry.brand)) {
                        return false;
                    }
                    return true;
                });
            };
            var browserEntry = pickEntry(versionList, false) || pickEntry(fallbackList, false) || pickEntry(versionList, true) || pickEntry(fallbackList, true);
            if (browserEntry) {
                browserName = browserEntry.brand || null;
                browserVersion = browserEntry.version || null;
            }
            var parsed = {
                platform: values.platform || uaData.platform || null,
                platformVersion: values.platformVersion || null,
                architecture: values.architecture || null,
                bitness: values.bitness || null,
                model: values.model || null,
                uaFullVersion: values.uaFullVersion || null,
                fullVersionList: values.fullVersionList || null,
                browserName: browserName,
                browserVersion: browserVersion,
                windowsVersion: null
            };
            if (parsed.platform && parsed.platform.toLowerCase() === "windows") {
                parsed.windowsVersion = parseWindowsVersionFromPlatformVersion(parsed.platformVersion);
            }
            return parsed;
        })["catch"](function () {
            return null;
        });
    }
    var prefetchedUserAgentClientHintsPromise = null;
    if (isBrowser && typeof navigator !== "undefined" && navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
        prefetchedUserAgentClientHintsPromise = getUserAgentClientHintsInternal(navigator.userAgentData);
    }
    function getUserAgentClientHints(uaDataOverride) {
        if (uaDataOverride) {
            return getUserAgentClientHintsInternal(uaDataOverride);
        }
        if (prefetchedUserAgentClientHintsPromise) {
            return prefetchedUserAgentClientHintsPromise;
        }
        if (isBrowser && typeof navigator !== "undefined" && navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
            prefetchedUserAgentClientHintsPromise = getUserAgentClientHintsInternal(navigator.userAgentData);
            return prefetchedUserAgentClientHintsPromise;
        }
        return Promise.resolve(null);
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

    /**
     * Split a URL string into its parts using the shared urlParseRE regex. Kept regex-based
     * (rather than the URL constructor) to preserve IE11 support, and it needs no DOM access.
     * Relative URLs (no scheme/host) return an empty origin and everything in pathname.
     * @memberof Countly._internals
     * @param {String} urlString - URL to parse
     * @returns {Object} object with origin, pathname, search and hash string properties
     */
    function parseUrlParts(urlString) {
        var parts = {
            origin: "",
            pathname: "",
            search: "",
            hash: ""
        };
        if (typeof urlString !== "string") {
            return parts;
        }
        var matches = urlParseRE.exec(urlString);
        if (!matches) {
            return parts;
        }
        // matches[4] = "protocol:", matches[10] = "host[:port]", matches[13] = path,
        // matches[16] = "?query", matches[17] = "#hash" (see urlParseRE comments in Constants.js)
        if (matches[4] && matches[10]) {
            parts.origin = matches[4] + "//" + matches[10];
        }
        parts.pathname = matches[13] || "";
        parts.search = matches[16] || "";
        parts.hash = matches[17] || "";
        return parts;
    }

    /**
     * Schemes a content link may never open, in any form: they run script, load a document that inherits an
     * origin, reach the local machine or an OS handler. The same list the Countly server applies to content.
     */
    var BLOCKED_LINK_SCHEMES = ["javascript", "vbscript", "livescript", "mocha", "data", "blob", "filesystem", "jar", "file", "view-source", "about", "intent", "ms-msdt", "search-ms", "ms-search", "smb", "nfs", "chrome", "chrome-extension", "moz-extension", "moz-icon", "resource", "ftp", "ws", "wss"];

    /**
     * Schemes that carry a recipient rather than a host, allowed for contact links.
     */
    var CONTACT_LINK_SCHEMES = ["mailto", "tel", "sms", "geo", "facetime", "skype"];
    var LINK_SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

    /**
     * Tells whether a content link may be opened: web links, contact links, relative links and app deep links in
     * scheme:// form pass; anything that would execute where it is opened does not.
     * @param {*} value - the link
     * @returns {Boolean} true when the link may be opened
     */
    function isSafeActionUrl(value) {
        if (typeof value !== "string") {
            return false;
        }
        var authored = value.trim();
        // browsers drop control characters and spaces while parsing a URL, so "java\tscript:" still runs
        // eslint-disable-next-line no-control-regex
        var url = authored.replace(/[\u0000- ]/g, "");
        if (!url) {
            return false;
        }
        var scheme = LINK_SCHEME_RE.exec(url);
        if (!scheme) {
            return true;
        }
        var name = scheme[1].toLowerCase();
        if (BLOCKED_LINK_SCHEMES.indexOf(name) !== -1) {
            return false;
        }
        if (name === "http" || name === "https" || CONTACT_LINK_SCHEMES.indexOf(name) !== -1) {
            return true;
        }
        // an unknown scheme passes only in the deep link shape as written, which the stripping above must not create
        var authoredScheme = LINK_SCHEME_RE.exec(authored);
        return authoredScheme !== null && authored.slice(authoredScheme[0].length, authoredScheme[0].length + 2) === "//";
    }

    /**
     * Parts of a form field's name or label that mark it as holding a secret or payment, bank or identity data,
     * found anywhere in the lowercased name without separators
     */
    var SENSITIVE_FIELD_PARTS = ["password", "passwd", "passwort", "passcode", "passphrase", "cardnum", "ccnum", "ccexp", "cardexp", "creditcard", "debitcard", "cardholder", "nameoncard", "securitycode", "securitynum", "seccode", "verificationcode", "onetimecode", "authcode", "iban", "routingnum", "sortcode", "accountnum", "bankaccount", "socialsec", "socsec", "nationalid", "taxid", "taxnum", "passport", "driverlicen", "driverslicen", "apikey", "privatekey", "clientsecret", "accesstoken", "authtoken", "csrf", "xsrf"];

    /**
     * Short words that mark a sensitive field only as a whole word of its name, so "pin_code" matches and "shipping" does not
     */
    var SENSITIVE_FIELD_WORDS = ["pass", "pwd", "pw", "pin", "otp", "cc", "cvv", "cvc", "csc", "cvn", "exp", "expiry", "pan", "ssn", "bic", "swift", "token", "secret", "auth"];

    /**
     * Parts and whole words of a form field's name or label that mark it as a phone number field
     */
    var PHONE_FIELD_PARTS = ["phone", "mobile", "telefon", "msisdn"];
    var PHONE_FIELD_WORDS = ["tel", "cell", "gsm"];

    /**
     * Tells whether a form field's name, id or label contains one of the given parts, or one of the given words as a
     * whole word (words split at separators, digits and camelCase humps)
     * @param {*} text - name, id or label text of the field
     * @param {Array<String>} parts - parts matched anywhere
     * @param {Array<String>} words - words matched as whole words
     * @returns {Boolean} true when the text matches
     */
    function fieldNameMatches(text, parts, words) {
        if (typeof text !== "string" || !text) {
            return false;
        }
        var joined = text.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (var i = 0; i < parts.length; i++) {
            if (joined.indexOf(parts[i]) !== -1) {
                return true;
            }
        }
        var split = text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[^a-z]+/);
        for (var j = 0; j < split.length; j++) {
            if (words.indexOf(split[j]) !== -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Tells whether a form field's name, id or label marks it as holding a secret or payment, bank or identity data
     * @param {*} text - name, id or label text of the field
     * @returns {Boolean} true when the field looks sensitive
     */
    function isSensitiveFieldName(text) {
        return fieldNameMatches(text, SENSITIVE_FIELD_PARTS, SENSITIVE_FIELD_WORDS);
    }

    /**
     * Tells whether a form field's name, id or label marks it as a phone number field
     * @param {*} text - name, id or label text of the field
     * @returns {Boolean} true when the field looks like a phone number field
     */
    function isPhoneFieldName(text) {
        return fieldNameMatches(text, PHONE_FIELD_PARTS, PHONE_FIELD_WORDS);
    }

    /**
     * Tells whether a value holds a payment card number: a run of 13 to 19 digits, single spaces or dashes allowed
     * between them, that passes the Luhn check
     * @param {*} value - form field value
     * @returns {Boolean} true when a card number is found in the value
     */
    function looksLikeCardNumber(value) {
        if (typeof value !== "string") {
            return false;
        }
        var runs = /\d(?:[ -]?\d)*/g;
        var run;
        while ((run = runs.exec(value)) !== null) {
            // card numbers are never written after a "+", international phone numbers are
            if (run.index > 0 && value.charAt(run.index - 1) === "+") {
                continue;
            }
            var digits = run[0].replace(/\D/g, "");
            if (digits.length < 13 || digits.length > 19) {
                continue;
            }
            var sum = 0;
            for (var i = 0; i < digits.length; i++) {
                var digit = +digits.charAt(digits.length - 1 - i);
                if (i % 2 === 1) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                sum += digit;
            }
            if (sum % 10 === 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Tells whether a whole value is shaped like a US social security number, 123-45-6789 or 123456789
     * @param {*} value - form field value
     * @returns {Boolean} true when the value is SSN-shaped
     */
    function looksLikeSsn(value) {
        // the separators must match, so a ZIP+4 code such as 12345-6789 is not taken for one
        return typeof value === "string" && /^\d{3}([ -]?)\d{2}\1\d{4}$/.test(value.trim());
    }

    /**
     * Tells whether a whole value is shaped like a phone number: digits, spaces and ( ) . / - signs with an optional
     * leading +, holding 5 to 15 digits
     * @param {*} value - form field value
     * @returns {Boolean} true when the value is phone-shaped
     */
    function isPhoneShaped(value) {
        if (typeof value !== "string" || !/^\+?[\d\s()./-]+$/.test(value.trim())) {
            return false;
        }
        var digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 5 && digitCount <= 15;
    }

    /**
     * Tells whether a whole value is one email address
     * @param {*} value - form field value
     * @returns {Boolean} true when the value is one email address
     */
    function isWholeEmail(value) {
        return typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
    }

    /** Per-probe deadline. */
    var CT_PROBE_TIMEOUT = 10000;

    /** Server-side limits on the report. */
    var CT_MAX_ROWS = 32;
    var CT_MAX_BYTES = 8192;
    var CT_MAX_DETAIL = 256;

    /**
     * Resolve a probe path against the SDK's configured server URL.
     * The configured URL may carry a path prefix for reverse-proxied deployments,
     * so the path is appended to it rather than to the bare origin.
     * @param {String} baseUrl - the SDK's configured server URL
     * @param {String} path - probe path, always starting with a slash
     * @returns {String} absolute probe URL
     */
    function buildProbeUrl(baseUrl, path) {
        return stripTrailingSlash(baseUrl) + path;
    }

    /**
     * Explanations carried in the report's `e` field. Each says what was expected and what
     * arrived instead, so an operator reading a single row does not have to know the grading
     * rules to understand the verdict.
     */
    var CT_DETAIL = {
        TIMEOUT: "Expected an answer within " + CT_PROBE_TIMEOUT / 1000 + "s, but the request never completed.",
        TRANSPORT: "Expected the server to answer, but no readable answer arrived: the connection failed (DNS, TLS, certificate pinning), or a firewall or proxy blocked the request or answered without Countly's CORS headers.",
        REDIRECTED_HIDDEN: "Expected a direct answer from Countly, but the request was redirected away; the browser hides the redirect status.",
        OPAQUE: "Reachable, but the answer could not be read: it arrived without Countly's CORS headers, so a firewall or proxy between the device and the server may be removing or rewriting them.",
        NOT_RUN: "Not run, because the battery deadline elapsed before this row was reached."
    };

    /**
     * Explain a failing status in terms of what was expected of it.
     * @param {Number} status - the HTTP status observed
     * @param {Boolean} strict2xx - whether this row has no legitimate 4xx
     * @returns {String} the explanation for the `e` field
     */
    function detailForStatus(status, strict2xx) {
        if (status >= 300 && status < 400) {
            return "Expected a direct answer from Countly, but the request was redirected away with HTTP " + status + ".";
        }
        if (status === 403) {
            return "Expected the Countly application to answer, but a proxy rejected the request with HTTP " + status + " before it got there.";
        }
        if (status >= 500) {
            return "Expected the Countly application to answer, but the gateway or an upstream service failed with HTTP " + status + ".";
        }
        if (strict2xx) {
            return "Expected a 2xx from this route, which has no legitimate 4xx, but got HTTP " + status + ".";
        }
        return "Expected the Countly application to answer, but it returned HTTP " + status + ".";
    }

    /**
     * Grade a single probe outcome into a report row fragment.
     * The question is "did the Countly application answer", not "did it succeed", so an
     * application-level rejection counts as reachable while a proxy block does not.
     * @param {Object} outcome - what the transport observed: {status}, {rejected, timedOut},
     *                           {redirected} for an opaque redirect, {opaque} for a resolved
     *                           opaque response
     * @param {Object} [opts] - {strict2xx} for rows that have no legitimate 4xx
     * @returns {Object} {ok, st} plus {e} when there is a detail worth carrying
     */
    function gradeProbe(outcome, opts) {
        opts = opts || {};
        if (outcome.rejected) {
            return {
                ok: false,
                st: 0,
                e: outcome.timedOut ? CT_DETAIL.TIMEOUT : CT_DETAIL.TRANSPORT
            };
        }
        if (outcome.redirected) {
            return {
                ok: false,
                st: 0,
                e: CT_DETAIL.REDIRECTED_HIDDEN
            };
        }
        // an opaque response cannot be inspected, so the strict-2xx rule cannot apply to it
        if (outcome.opaque) {
            return {
                ok: true,
                st: 0,
                e: CT_DETAIL.OPAQUE
            };
        }
        var status = outcome.status;
        if (status >= 200 && status < 300) {
            return {
                ok: true,
                st: status
            };
        }
        if (status >= 400 && status < 500 && status !== 403 && !opts.strict2xx) {
            return {
                ok: true,
                st: status
            };
        }
        return {
            ok: false,
            st: status,
            e: detailForStatus(status, opts.strict2xx)
        };
    }

    /**
     * Fold the probes of a multi-path row into the single row the report carries.
     * Each path is a separate nginx location that can be blocked on its own, so the row
     * is only reachable when every one of them answered, and it keeps the opaque qualifier
     * when any of them could only be reached opaquely.
     * @param {Array} results - graded probes, each {ok, st, ms} plus optional {e}
     * @returns {Object} combined row {ok, st, ms, n} plus optional {e}
     */
    function combineRow(results) {
        var firstFailure = null;
        var total = 0;
        var anyOpaque = false;
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            total += result.ms;
            if (!result.ok && !firstFailure) {
                firstFailure = result;
            }
            if (result.e === CT_DETAIL.OPAQUE) {
                anyOpaque = true;
            }
        }
        var row = {
            ok: !firstFailure,
            st: firstFailure ? firstFailure.st : results[0].st,
            ms: total,
            n: results.length
        };
        if (firstFailure) {
            row.e = firstFailure.e;
        } else if (anyOpaque) {
            row.e = CT_DETAIL.OPAQUE;
        }
        return row;
    }

    /**
     * The probe list lives here rather than on the wire, which is why the server's armed flag
     * never has to change when this list evolves. Rows with several paths hit separate nginx
     * locations that can be blocked independently.
     */
    var CT_ROWS = [{
        f: "core",
        tier: 1,
        paths: ["/o/ping"],
        strict2xx: true
    }, {
        f: "core-write",
        tier: 1,
        paths: ["/i"]
    }, {
        f: "sc",
        tier: 1,
        paths: []
    }, {
        f: "rc",
        tier: 1,
        paths: ["/o/sdk?method=rc"]
    }, {
        f: "ab",
        tier: 1,
        paths: ["/o/sdk?method=ab_fetch_variants"]
    }, {
        f: "feedback",
        tier: 1,
        paths: ["/o/sdk?method=feedback"]
    }, {
        f: "feedback-widget",
        tier: 1,
        paths: ["/o/surveys/nps/widget", "/o/surveys/survey/widget", "/o/feedback/widget"]
    }, {
        f: "feedback-submit",
        tier: 1,
        paths: ["/i/feedback/inputs"]
    }, {
        f: "content",
        tier: 1,
        paths: ["/o/sdk/content"]
    }, {
        f: "feedback-page",
        tier: 2,
        paths: ["/feedback/nps", "/feedback/survey", "/feedback/rating"]
    }, {
        f: "feedback-assets",
        tier: 2,
        paths: ["/surveys/images/ct-probe.png", "/star-rating/images/ct-probe.png"],
        strict2xx: true
    }, {
        f: "content-page",
        tier: 2,
        paths: ["/_external/content/"]
    }];

    /**
     * How many probes the battery may issue. A Tier 2 path can cost two requests when the
     * CORS attempt is rejected and the opaque fallback runs, and the deadline has to allow
     * for the worst case rather than the happy path.
     * @param {String} tier2 - "cors-first" or "unsupported"
     * @returns {Number} worst-case request count
     */
    function attemptedRequests(tier2) {
        return CT_ROWS.reduce(function (total, row) {
            if (row.tier !== 2) {
                return total + row.paths.length;
            }
            if (tier2 === "unsupported") {
                return total;
            }
            return total + row.paths.length * (tier2 === "cors-first" ? 2 : 1);
        }, 0);
    }

    /**
     * Deadline for the whole battery, measured over the requests actually attempted rather
     * than the rows in the table — a row with three paths costs three requests.
     * @param {Number} attemptedRequests - how many probes the battery intends to issue
     * @returns {Number} cap in milliseconds
     */
    function batteryCapMs(attemptedRequests) {
        return attemptedRequests * CT_PROBE_TIMEOUT + 30000;
    }

    /**
     * Stamp a graded result with its feature key, in the field order the report documents,
     * so an operator reading the raw JSON sees which row it is before anything else.
     * @param {String} f - feature key
     * @param {Object} result - graded row body
     * @returns {Object} report row
     */
    function toReportRow(f, result) {
        var row = {
            f: f
        };
        ["ok", "st", "ms", "n", "e", "sk"].forEach(function (key) {
            if (typeof result[key] !== "undefined") {
                row[key] = result[key];
            }
        });
        return row;
    }

    /**
     * Probe a single path, falling back to an opaque attempt where that is meaningful.
     * @param {Object} ctx - battery context
     * @param {Object} row - row definition from CT_ROWS
     * @param {String} path - the path to probe
     * @returns {Promise} resolves to the outcome, with ms covering every attempt made
     */
    function probePath(ctx, row, path) {
        var url = buildProbeUrl(ctx.url, path);
        var mayFallBack = row.tier === 2 && ctx.tier2 === "cors-first";
        // the SDK calls the Tier 1 routes itself, with its headers; the browser loads the Tier 2 pages and images without them
        var headers = row.tier === 1 ? ctx.headers : undefined;
        return ctx.probe(url, {
            mode: "cors",
            headers: headers
        }).then(function (first) {
            if (!first.rejected || !mayFallBack) {
                return first;
            }
            // On Tier 1 a rejection is simply a failure. On Tier 2 it can also mean a middlebox
            // stripped the CORS headers in transit, so one opaque retry separates "unreachable"
            // from "reachable but tampered with".
            return ctx.probe(url, {
                mode: "no-cors"
            }).then(function (second) {
                var merged = {
                    ms: first.ms + second.ms
                };
                ["status", "rejected", "timedOut", "redirected", "opaque"].forEach(function (key) {
                    if (typeof second[key] !== "undefined") {
                        merged[key] = second[key];
                    }
                });
                return merged;
            });
        });
    }

    /**
     * Probe one row's paths in sequence and fold them into a single report row.
     * @param {Object} ctx - battery context
     * @param {Object} row - row definition from CT_ROWS
     * @returns {Promise} resolves to the report row
     */
    function runRow(ctx, row) {
        var graded = [];
        var chain = row.paths.reduce(function (previous, path) {
            return previous.then(function () {
                return probePath(ctx, row, path).then(function (outcome) {
                    var result = gradeProbe(outcome, {
                        strict2xx: row.strict2xx
                    });
                    result.ms = outcome.ms;
                    graded.push(result);
                });
            });
        }, Promise.resolve());
        return chain.then(function () {
            return toReportRow(row.f, row.paths.length > 1 ? combineRow(graded) : graded[0]);
        });
    }

    /**
     * Run the connection test battery once and build the report.
     * Probes are sequential and carry no identity, so nothing here depends on consent
     * and nothing the server does with them can write.
     * @param {Object} ctx - {url, sdkName, sdkVersion, sc: {status, ms}, probe, tier2, now, headers}
     *                       where probe(url, opts) resolves to an outcome carrying its own ms,
     *                       headers are the init headers the SDK sends with its own requests,
     *                       tier2 is "cors-first" or "unsupported", and the optional now() replaces Date.now for the deadline
     * @returns {Promise} resolves to the ct_results report object
     */
    function runConnectionTest(ctx) {
        var results = [];
        var now = ctx.now || Date.now;
        var deadline = now() + batteryCapMs(attemptedRequests(ctx.tier2));
        var chain = CT_ROWS.reduce(function (previous, row) {
            return previous.then(function () {
                if (row.f === "sc") {
                    var sc = gradeProbe({
                        status: ctx.sc.status
                    });
                    sc.ms = ctx.sc.ms;
                    results.push(toReportRow(row.f, sc));
                    return null;
                }
                if (row.tier === 2 && ctx.tier2 === "unsupported") {
                    results.push({
                        f: row.f,
                        sk: "unsupported"
                    });
                    return null;
                }
                // the cap only governs rows that would cost a request; the free rows above
                // are reported either way
                if (now() >= deadline) {
                    results.push({
                        f: row.f,
                        ok: false,
                        st: 0,
                        e: CT_DETAIL.NOT_RUN
                    });
                    return null;
                }
                return runRow(ctx, row).then(function (result) {
                    results.push(result);
                });
            });
        }, Promise.resolve());
        return chain.then(function () {
            return {
                ts: Date.now(),
                sdk: {
                    name: ctx.sdkName,
                    version: ctx.sdkVersion
                },
                results: results
            };
        });
    }

    /**
     * Bring a report inside the server's limits before it is queued.
     * The opaque qualifier survives every reduction: it is not diagnostic detail but the mark
     * that keeps a low-confidence green row from reading as authoritative.
     * @param {Object} report - the assembled report
     * @returns {Object} the same report, trimmed to at most 32 rows and 8 KB
     */
    function capReport(report) {
        report.results = report.results.slice(0, CT_MAX_ROWS);
        report.results.forEach(function (row) {
            if (typeof row.e === "string" && row.e.length > CT_MAX_DETAIL) {
                row.e = row.e.substring(0, CT_MAX_DETAIL);
            }
        });
        if (JSON.stringify(report).length > CT_MAX_BYTES) {
            report.results.forEach(function (row) {
                if (row.e && row.e !== CT_DETAIL.OPAQUE) {
                    delete row.e;
                }
            });
        }
        return report;
    }

    /**
     * Issue one probe: a bare GET carrying no app_key, no device_id and no payload, so the
     * server rejects it on its first validation check without ever reaching application work.
     * Only the given headers are set, so a probe meets the same gateway rules and preflight
     * as the SDK's own requests to that route.
     * @param {String} url - absolute probe URL
     * @param {Object} opts - {mode} "cors" for a readable status, "no-cors" for an opaque
     *                        fallback when the CORS attempt was rejected, and {headers} for a
     *                        CORS probe
     * @returns {Promise} resolves to an outcome object carrying its own ms
     */
    function probeViaFetch(url, opts) {
        var start = Date.now();
        // ct=1 marks probe traffic in server logs; the cache-buster keeps a CDN or the browser
        // cache from answering on the origin's behalf and reporting a dead server as healthy
        var target = url + (url.indexOf("?") === -1 ? "?" : "&") + "ct=1&_=" + start;
        var timedOut = false;
        var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer;
        // without AbortController a hung request can never be cancelled, so the probe settles on its own deadline
        var deadline = new Promise(function (resolve) {
            timer = setTimeout(function () {
                timedOut = true;
                if (controller) {
                    controller.abort();
                }
                resolve({
                    rejected: true,
                    timedOut: true,
                    ms: Date.now() - start
                });
            }, CT_PROBE_TIMEOUT);
        });
        var init = {
            method: "GET",
            cache: "no-store",
            credentials: "omit"
        };
        if (controller) {
            init.signal = controller.signal;
        }
        if (opts && opts.mode === "no-cors") {
            // no-cors forbids any redirect mode but follow, and every response is opaque anyway
            init.mode = "no-cors";
        } else {
            init.mode = "cors";
            init.redirect = "manual";
            if (opts && opts.headers) {
                init.headers = opts.headers;
            }
        }
        var request = fetch(target, init).then(function (response) {
            var ms = Date.now() - start;
            if (response.type === "opaqueredirect") {
                return {
                    redirected: true,
                    ms: ms
                };
            }
            if (response.type === "opaque") {
                return {
                    opaque: true,
                    ms: ms
                };
            }
            return {
                status: response.status,
                ms: ms
            };
        })["catch"](function () {
            return {
                rejected: true,
                timedOut: timedOut,
                ms: Date.now() - start
            };
        });
        return Promise.race([request, deadline]).then(function (outcome) {
            clearTimeout(timer);
            return outcome;
        });
    }

    var _consentTimer = /*#__PURE__*/new WeakMap();
    var _self = /*#__PURE__*/new WeakMap();
    var _global = /*#__PURE__*/new WeakMap();
    var _sessionStarted = /*#__PURE__*/new WeakMap();
    var _apiPath = /*#__PURE__*/new WeakMap();
    var _readPath = /*#__PURE__*/new WeakMap();
    var _logTransportInProgress = /*#__PURE__*/new WeakMap();
    var _beatInterval = /*#__PURE__*/new WeakMap();
    var _requestQueue = /*#__PURE__*/new WeakMap();
    var _eventQueue = /*#__PURE__*/new WeakMap();
    var _remoteConfigs = /*#__PURE__*/new WeakMap();
    var _crashLogs = /*#__PURE__*/new WeakMap();
    var _timedEvents = /*#__PURE__*/new WeakMap();
    var _ignoreReferrers = /*#__PURE__*/new WeakMap();
    var _trackFormValues = /*#__PURE__*/new WeakMap();
    var _crashSegments = /*#__PURE__*/new WeakMap();
    var _autoExtend = /*#__PURE__*/new WeakMap();
    var _autoSessionTracking = /*#__PURE__*/new WeakMap();
    var _halted = /*#__PURE__*/new WeakMap();
    var _serverConfigTimer = /*#__PURE__*/new WeakMap();
    var _serverConfigAfterMerge = /*#__PURE__*/new WeakMap();
    var _remoteConfigAfterMerge = /*#__PURE__*/new WeakMap();
    var _tabStore = /*#__PURE__*/new WeakMap();
    var _sendingUpTo = /*#__PURE__*/new WeakMap();
    var _requestOnItsWay = /*#__PURE__*/new WeakMap();
    var _waitingToRetry = /*#__PURE__*/new WeakMap();
    var _collectUntil = /*#__PURE__*/new WeakMap();
    var _collectTimer = /*#__PURE__*/new WeakMap();
    var _pausedUntil = /*#__PURE__*/new WeakMap();
    var _pauseTimer = /*#__PURE__*/new WeakMap();
    var _deferredRequests = /*#__PURE__*/new WeakMap();
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
    var _disableHealthCheck = /*#__PURE__*/new WeakMap();
    var _consents = /*#__PURE__*/new WeakMap();
    var _generatedRequests = /*#__PURE__*/new WeakMap();
    var _contentEndPoint = /*#__PURE__*/new WeakMap();
    var _inContentZone = /*#__PURE__*/new WeakMap();
    var _contentZoneWanted = /*#__PURE__*/new WeakMap();
    var _contentZoneExited = /*#__PURE__*/new WeakMap();
    var _contentZoneTimer = /*#__PURE__*/new WeakMap();
    var _contentZoneEntryTimer = /*#__PURE__*/new WeakMap();
    var _contentMessageListener = /*#__PURE__*/new WeakMap();
    var _contentResizeListener = /*#__PURE__*/new WeakMap();
    var _globalContentSegmentation = /*#__PURE__*/new WeakMap();
    var _contentTheme = /*#__PURE__*/new WeakMap();
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
    var _SCDropOldRequestTime = /*#__PURE__*/new WeakMap();
    var _SCEventBlacklist = /*#__PURE__*/new WeakMap();
    var _SCEventWhitelist = /*#__PURE__*/new WeakMap();
    var _SCUserPropertyBlacklist = /*#__PURE__*/new WeakMap();
    var _SCUserPropertyWhitelist = /*#__PURE__*/new WeakMap();
    var _SCSegmentationBlacklist = /*#__PURE__*/new WeakMap();
    var _SCSegmentationWhitelist = /*#__PURE__*/new WeakMap();
    var _SCEventSegmentationBlacklist = /*#__PURE__*/new WeakMap();
    var _SCEventSegmentationWhitelist = /*#__PURE__*/new WeakMap();
    var _SCJourneyTriggerEvents = /*#__PURE__*/new WeakMap();
    var _SCLogGathering = /*#__PURE__*/new WeakMap();
    var _logBuffer = /*#__PURE__*/new WeakMap();
    var _logHeld = /*#__PURE__*/new WeakMap();
    var _logBufferDropped = /*#__PURE__*/new WeakMap();
    var _logCaptureInProgress = /*#__PURE__*/new WeakMap();
    var _lastLogFlushTime = /*#__PURE__*/new WeakMap();
    var _initContentSent = /*#__PURE__*/new WeakMap();
    var _initTimestamp = /*#__PURE__*/new WeakMap();
    var _isSCDisabled = /*#__PURE__*/new WeakMap();
    var _connectionTestRunning = /*#__PURE__*/new WeakMap();
    var _standingInForAnotherUser = /*#__PURE__*/new WeakMap();
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
    var _uaClientHints = /*#__PURE__*/new WeakMap();
    var _uaClientHintsStatus = /*#__PURE__*/new WeakMap();
    var _clientHintsPromise = /*#__PURE__*/new WeakMap();
    var _pendingRequestBuffer = /*#__PURE__*/new WeakMap();
    var _clientHintsBufferTimeoutId = /*#__PURE__*/new WeakMap();
    var _seenPushActionIds = /*#__PURE__*/new WeakMap();
    var _pushMessageHandler = /*#__PURE__*/new WeakMap();
    var _pushEnableInFlight = /*#__PURE__*/new WeakMap();
    var _pushNotificationListener = /*#__PURE__*/new WeakMap();
    var _lastPushToken = /*#__PURE__*/new WeakMap();
    var _pushRegistration = /*#__PURE__*/new WeakMap();
    var _suppliedPushRegistration = /*#__PURE__*/new WeakMap();
    var _pushListeningSince = /*#__PURE__*/new WeakMap();
    var _pushMergedIds = /*#__PURE__*/new WeakMap();
    var _pushConsentWithdrawals = /*#__PURE__*/new WeakMap();
    var _pushRecordInMemory = /*#__PURE__*/new WeakMap();
    var _pushWorkerVersionsWarned = /*#__PURE__*/new WeakMap();
    var _ignoredByChoice = /*#__PURE__*/new WeakMap();
    var _orientationListening = /*#__PURE__*/new WeakMap();
    var _hcCountersLoaded = /*#__PURE__*/new WeakMap();
    var _idBeforeOfflineMode = /*#__PURE__*/new WeakMap();
    var _passwordFields = /*#__PURE__*/new WeakMap();
    var _passwordWatchRoots = /*#__PURE__*/new WeakMap();
    var _encodedCookiePrefix = /*#__PURE__*/new WeakMap();
    var _initializeClientHints = /*#__PURE__*/new WeakMap();
    var _flushPendingRequestBuffer = /*#__PURE__*/new WeakMap();
    var _getAndSetServerConfig = /*#__PURE__*/new WeakMap();
    var _runConnectionTest = /*#__PURE__*/new WeakMap();
    var _populateServerConfig = /*#__PURE__*/new WeakMap();
    var _initialize = /*#__PURE__*/new WeakMap();
    var _initPushMessageListener = /*#__PURE__*/new WeakMap();
    var _checkPushWorkerVersion = /*#__PURE__*/new WeakMap();
    var _announceToPushWorker = /*#__PURE__*/new WeakMap();
    var _removePushMessageListener = /*#__PURE__*/new WeakMap();
    var _handlePushAction = /*#__PURE__*/new WeakMap();
    var _otherPushOwner = /*#__PURE__*/new WeakMap();
    var _rememberPushMerge = /*#__PURE__*/new WeakMap();
    var _pushMerges = /*#__PURE__*/new WeakMap();
    var _forgetPushMerges = /*#__PURE__*/new WeakMap();
    var _hasSeenPushAction = /*#__PURE__*/new WeakMap();
    var _isNewPushAction = /*#__PURE__*/new WeakMap();
    var _autoRegisterPush = /*#__PURE__*/new WeakMap();
    var _releasePushTokenOfLeavingUser = /*#__PURE__*/new WeakMap();
    var _asDeviceId = /*#__PURE__*/new WeakMap();
    var _handlePushOnDeviceIdChange = /*#__PURE__*/new WeakMap();
    var _drainPendingPushActions = /*#__PURE__*/new WeakMap();
    var _pushClickOwner = /*#__PURE__*/new WeakMap();
    var _pushReportingConfig = /*#__PURE__*/new WeakMap();
    var _syncPushWorkerConfig = /*#__PURE__*/new WeakMap();
    var _pushDetailsMessage = /*#__PURE__*/new WeakMap();
    var _postToPushWorker = /*#__PURE__*/new WeakMap();
    var _findPushRegistration = /*#__PURE__*/new WeakMap();
    var _lookUpPushRegistration = /*#__PURE__*/new WeakMap();
    var _pushRegistrationAt = /*#__PURE__*/new WeakMap();
    var _pushScope = /*#__PURE__*/new WeakMap();
    var _defaultPushScope = /*#__PURE__*/new WeakMap();
    var _isPrivatePushRegistration = /*#__PURE__*/new WeakMap();
    var _updatePushWorker = /*#__PURE__*/new WeakMap();
    var _updateConsent = /*#__PURE__*/new WeakMap();
    var _giveTemporaryIdRequestsToCurrentId = /*#__PURE__*/new WeakMap();
    var _resolvePushRegistration = /*#__PURE__*/new WeakMap();
    var _waitForPushWorker = /*#__PURE__*/new WeakMap();
    var _resolveUrl = /*#__PURE__*/new WeakMap();
    var _stripQuery = /*#__PURE__*/new WeakMap();
    var _pushWorkerUrl = /*#__PURE__*/new WeakMap();
    var _subscribeAndRegisterToken = /*#__PURE__*/new WeakMap();
    var _registerPushSubscription = /*#__PURE__*/new WeakMap();
    var _unsubscribePush = /*#__PURE__*/new WeakMap();
    var _pushErrorText = /*#__PURE__*/new WeakMap();
    var _recordPushAction = /*#__PURE__*/new WeakMap();
    var _notifyPushListener = /*#__PURE__*/new WeakMap();
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
    var _watchPasswordFields = /*#__PURE__*/new WeakMap();
    var _autocompleteTokens = /*#__PURE__*/new WeakMap();
    var _neverReadField = /*#__PURE__*/new WeakMap();
    var _ignoredByMarkup = /*#__PURE__*/new WeakMap();
    var _hasSensitiveName = /*#__PURE__*/new WeakMap();
    var _unsubscribePushOnOptOut = /*#__PURE__*/new WeakMap();
    var _showWidgetInternal = /*#__PURE__*/new WeakMap();
    var _interpretFeedbackWidgetMessage = /*#__PURE__*/new WeakMap();
    var _stackWithMessage = /*#__PURE__*/new WeakMap();
    var _checkIgnore = /*#__PURE__*/new WeakMap();
    var _setGlobalContentSegmentation = /*#__PURE__*/new WeakMap();
    var _withGlobalContentSegmentation = /*#__PURE__*/new WeakMap();
    var _setContentTheme = /*#__PURE__*/new WeakMap();
    var _currentContentTheme = /*#__PURE__*/new WeakMap();
    var _withContentTheme = /*#__PURE__*/new WeakMap();
    var _enterContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _refreshContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _exitContentZoneInternal = /*#__PURE__*/new WeakMap();
    var _prepareContentRequest = /*#__PURE__*/new WeakMap();
    var _sendContentRequest = /*#__PURE__*/new WeakMap();
    var _displayContent = /*#__PURE__*/new WeakMap();
    var _interpretContentMessage = /*#__PURE__*/new WeakMap();
    var _removeContentListeners = /*#__PURE__*/new WeakMap();
    var _closeContentFrame = /*#__PURE__*/new WeakMap();
    var _sendEventsForced = /*#__PURE__*/new WeakMap();
    var _processWidget = /*#__PURE__*/new WeakMap();
    var _notifyLoaders = /*#__PURE__*/new WeakMap();
    var _reportViewDuration = /*#__PURE__*/new WeakMap();
    var _getLastView = /*#__PURE__*/new WeakMap();
    var _extendSession = /*#__PURE__*/new WeakMap();
    var _prepareRequest = /*#__PURE__*/new WeakMap();
    var _isPushSupported = /*#__PURE__*/new WeakMap();
    var _isPushConfigured = /*#__PURE__*/new WeakMap();
    var _isOwnPushScope = /*#__PURE__*/new WeakMap();
    var _ownPushScope = /*#__PURE__*/new WeakMap();
    var _clearStoredPushSubscription = /*#__PURE__*/new WeakMap();
    var _getPushRecord = /*#__PURE__*/new WeakMap();
    var _setPushRecord = /*#__PURE__*/new WeakMap();
    var _removePushRecord = /*#__PURE__*/new WeakMap();
    var _pushSubscriptionUsesKey = /*#__PURE__*/new WeakMap();
    var _isCountlyPushSubscription = /*#__PURE__*/new WeakMap();
    var _withPushTimeout = /*#__PURE__*/new WeakMap();
    var _requestNotificationPermission = /*#__PURE__*/new WeakMap();
    var _sendPushToken = /*#__PURE__*/new WeakMap();
    var _isPushTokenSent = /*#__PURE__*/new WeakMap();
    var _renewPushTokenForSession = /*#__PURE__*/new WeakMap();
    var _urlBase64ToUint8Array = /*#__PURE__*/new WeakMap();
    var _toRequestQueue = /*#__PURE__*/new WeakMap();
    var _heartBeat = /*#__PURE__*/new WeakMap();
    var _checkBackoffConditions = /*#__PURE__*/new WeakMap();
    var _getGeneratedRequests = /*#__PURE__*/new WeakMap();
    var _mergeRequestUnsent = /*#__PURE__*/new WeakMap();
    var _fetchAfterMerge = /*#__PURE__*/new WeakMap();
    var _isOrderSensitive = /*#__PURE__*/new WeakMap();
    var _noteOrderSensitive = /*#__PURE__*/new WeakMap();
    var _sendUpTo = /*#__PURE__*/new WeakMap();
    var _sendNextRightAway = /*#__PURE__*/new WeakMap();
    var _removeSentRequest = /*#__PURE__*/new WeakMap();
    var _dropOldRequests = /*#__PURE__*/new WeakMap();
    var _sendRequestFromQueue = /*#__PURE__*/new WeakMap();
    var _processAsyncQueue = /*#__PURE__*/new WeakMap();
    var _isForSecondaryInstance = /*#__PURE__*/new WeakMap();
    var _getStoredIdOrGenerateId = /*#__PURE__*/new WeakMap();
    var _isUUID = /*#__PURE__*/new WeakMap();
    var _getUA = /*#__PURE__*/new WeakMap();
    var _getBrowserInfoFromUA = /*#__PURE__*/new WeakMap();
    var _getMetrics = /*#__PURE__*/new WeakMap();
    var _getResolution = /*#__PURE__*/new WeakMap();
    var _isReferrerUsable = /*#__PURE__*/new WeakMap();
    var _log = /*#__PURE__*/new WeakMap();
    var _logLineWanted = /*#__PURE__*/new WeakMap();
    var _logLineConsent = /*#__PURE__*/new WeakMap();
    var _logConsentGiven = /*#__PURE__*/new WeakMap();
    var _hasConsent = /*#__PURE__*/new WeakMap();
    var _forRequest = /*#__PURE__*/new WeakMap();
    var _withoutLogCapture = /*#__PURE__*/new WeakMap();
    var _resetLogGathering = /*#__PURE__*/new WeakMap();
    var _dropLogBuffer = /*#__PURE__*/new WeakMap();
    var _resolveProvisionalLogs = /*#__PURE__*/new WeakMap();
    var _applyLogGatheringConfig = /*#__PURE__*/new WeakMap();
    var _captureLogLine = /*#__PURE__*/new WeakMap();
    var _releaseHeldLogLines = /*#__PURE__*/new WeakMap();
    var _settleLogBuffer = /*#__PURE__*/new WeakMap();
    var _flushLogBuffer = /*#__PURE__*/new WeakMap();
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
    var _storageKey = /*#__PURE__*/new WeakMap();
    var _canUseTabStore = /*#__PURE__*/new WeakMap();
    var _getTabValue = /*#__PURE__*/new WeakMap();
    var _setTabValue = /*#__PURE__*/new WeakMap();
    var _saveRequestQueue = /*#__PURE__*/new WeakMap();
    var _saveEventQueue = /*#__PURE__*/new WeakMap();
    var _handOver = /*#__PURE__*/new WeakMap();
    var _leaveUnsentRequests = /*#__PURE__*/new WeakMap();
    var _sendWhenLeft = /*#__PURE__*/new WeakMap();
    var _cannotSendNow = /*#__PURE__*/new WeakMap();
    var _takeBackWhenSendable = /*#__PURE__*/new WeakMap();
    var _announceChange = /*#__PURE__*/new WeakMap();
    var _onOtherTabChange = /*#__PURE__*/new WeakMap();
    var _leaveForChangingTab = /*#__PURE__*/new WeakMap();
    var _pauseForOtherTab = /*#__PURE__*/new WeakMap();
    var _holding = /*#__PURE__*/new WeakMap();
    var _mustWaitForQueue = /*#__PURE__*/new WeakMap();
    var _flushDeferredRequests = /*#__PURE__*/new WeakMap();
    var _takeHandedOver = /*#__PURE__*/new WeakMap();
    var _listenForTabChanges = /*#__PURE__*/new WeakMap();
    var _isOpenersCopy = /*#__PURE__*/new WeakMap();
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
            _classPrivateFieldInitSpec(this, _logTransportInProgress, void 0);
            _classPrivateFieldInitSpec(this, _beatInterval, void 0);
            _classPrivateFieldInitSpec(this, _requestQueue, void 0);
            _classPrivateFieldInitSpec(this, _eventQueue, void 0);
            _classPrivateFieldInitSpec(this, _remoteConfigs, void 0);
            _classPrivateFieldInitSpec(this, _crashLogs, void 0);
            _classPrivateFieldInitSpec(this, _timedEvents, void 0);
            _classPrivateFieldInitSpec(this, _ignoreReferrers, void 0);
            _classPrivateFieldInitSpec(this, _trackFormValues, void 0);
            _classPrivateFieldInitSpec(this, _crashSegments, void 0);
            _classPrivateFieldInitSpec(this, _autoExtend, void 0);
            _classPrivateFieldInitSpec(this, _autoSessionTracking, void 0);
            _classPrivateFieldInitSpec(this, _halted, void 0);
            _classPrivateFieldInitSpec(this, _serverConfigTimer, void 0);
            _classPrivateFieldInitSpec(this, _serverConfigAfterMerge, void 0);
            _classPrivateFieldInitSpec(this, _remoteConfigAfterMerge, void 0);
            _classPrivateFieldInitSpec(this, _tabStore, void 0);
            _classPrivateFieldInitSpec(this, _sendingUpTo, void 0);
            _classPrivateFieldInitSpec(this, _requestOnItsWay, void 0);
            _classPrivateFieldInitSpec(this, _waitingToRetry, void 0);
            _classPrivateFieldInitSpec(this, _collectUntil, void 0);
            _classPrivateFieldInitSpec(this, _collectTimer, void 0);
            _classPrivateFieldInitSpec(this, _pausedUntil, void 0);
            _classPrivateFieldInitSpec(this, _pauseTimer, void 0);
            _classPrivateFieldInitSpec(this, _deferredRequests, void 0);
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
            _classPrivateFieldInitSpec(this, _disableHealthCheck, void 0);
            _classPrivateFieldInitSpec(this, _consents, void 0);
            _classPrivateFieldInitSpec(this, _generatedRequests, void 0);
            _classPrivateFieldInitSpec(this, _contentEndPoint, void 0);
            _classPrivateFieldInitSpec(this, _inContentZone, void 0);
            _classPrivateFieldInitSpec(this, _contentZoneWanted, void 0);
            _classPrivateFieldInitSpec(this, _contentZoneExited, false);
            _classPrivateFieldInitSpec(this, _contentZoneTimer, void 0);
            _classPrivateFieldInitSpec(this, _contentZoneEntryTimer, void 0);
            _classPrivateFieldInitSpec(this, _contentMessageListener, void 0);
            _classPrivateFieldInitSpec(this, _contentResizeListener, void 0);
            _classPrivateFieldInitSpec(this, _globalContentSegmentation, {});
            _classPrivateFieldInitSpec(this, _contentTheme, null);
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
            _classPrivateFieldInitSpec(this, _SCDropOldRequestTime, void 0);
            _classPrivateFieldInitSpec(this, _SCEventBlacklist, void 0);
            _classPrivateFieldInitSpec(this, _SCEventWhitelist, void 0);
            _classPrivateFieldInitSpec(this, _SCUserPropertyBlacklist, void 0);
            _classPrivateFieldInitSpec(this, _SCUserPropertyWhitelist, void 0);
            _classPrivateFieldInitSpec(this, _SCSegmentationBlacklist, void 0);
            _classPrivateFieldInitSpec(this, _SCSegmentationWhitelist, void 0);
            _classPrivateFieldInitSpec(this, _SCEventSegmentationBlacklist, void 0);
            _classPrivateFieldInitSpec(this, _SCEventSegmentationWhitelist, void 0);
            _classPrivateFieldInitSpec(this, _SCJourneyTriggerEvents, void 0);
            _classPrivateFieldInitSpec(this, _SCLogGathering, void 0);
            _classPrivateFieldInitSpec(this, _logBuffer, void 0);
            _classPrivateFieldInitSpec(this, _logHeld, void 0);
            _classPrivateFieldInitSpec(this, _logBufferDropped, void 0);
            _classPrivateFieldInitSpec(this, _logCaptureInProgress, void 0);
            _classPrivateFieldInitSpec(this, _lastLogFlushTime, void 0);
            _classPrivateFieldInitSpec(this, _initContentSent, void 0);
            _classPrivateFieldInitSpec(this, _initTimestamp, void 0);
            _classPrivateFieldInitSpec(this, _isSCDisabled, void 0);
            _classPrivateFieldInitSpec(this, _connectionTestRunning, false);
            _classPrivateFieldInitSpec(this, _standingInForAnotherUser, false);
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
            _classPrivateFieldInitSpec(this, _uaClientHints, void 0);
            _classPrivateFieldInitSpec(this, _uaClientHintsStatus, void 0);
            _classPrivateFieldInitSpec(this, _clientHintsPromise, void 0);
            _classPrivateFieldInitSpec(this, _pendingRequestBuffer, void 0);
            _classPrivateFieldInitSpec(this, _clientHintsBufferTimeoutId, void 0);
            _classPrivateFieldInitSpec(this, _seenPushActionIds, void 0);
            _classPrivateFieldInitSpec(this, _pushMessageHandler, void 0);
            _classPrivateFieldInitSpec(this, _pushEnableInFlight, void 0);
            _classPrivateFieldInitSpec(this, _pushNotificationListener, void 0);
            _classPrivateFieldInitSpec(this, _lastPushToken, void 0);
            _classPrivateFieldInitSpec(this, _pushRegistration, void 0);
            _classPrivateFieldInitSpec(this, _suppliedPushRegistration, void 0);
            _classPrivateFieldInitSpec(this, _pushListeningSince, void 0);
            _classPrivateFieldInitSpec(this, _pushMergedIds, void 0);
            _classPrivateFieldInitSpec(this, _pushConsentWithdrawals, 0);
            _classPrivateFieldInitSpec(this, _pushRecordInMemory, {});
            _classPrivateFieldInitSpec(this, _pushWorkerVersionsWarned, []);
            _classPrivateFieldInitSpec(this, _ignoredByChoice, false);
            _classPrivateFieldInitSpec(this, _orientationListening, false);
            _classPrivateFieldInitSpec(this, _hcCountersLoaded, false);
            _classPrivateFieldInitSpec(this, _idBeforeOfflineMode, void 0);
            _classPrivateFieldInitSpec(this, _passwordFields, new WeakMap());
            _classPrivateFieldInitSpec(this, _passwordWatchRoots, new WeakMap());
            _classPrivateFieldInitSpec(this, _encodedCookiePrefix, "~cly~");
            /**
             * Fetch User-Agent Client Hints and cache values for metrics enrichment.
             * @private
             */
            _classPrivateFieldInitSpec(this, _initializeClientHints, function () {
                if (!isBrowser) {
                    _classPrivateFieldSet2(_uaClientHintsStatus, _this, "unavailable");
                    _classPrivateFieldSet2(_pendingRequestBuffer, _this, null); // no buffering needed
                    return;
                }
                var uaRaw = currentUserAgentString();
                var uaDataAvailable = typeof navigator !== "undefined" && !!navigator.userAgentData;
                var getHighEntropyValuesAvailable = uaDataAvailable && typeof navigator.userAgentData.getHighEntropyValues === "function";
                var uaDataPlatform = uaDataAvailable ? navigator.userAgentData.platform : undefined;
                var uaDataBrands = uaDataAvailable ? navigator.userAgentData.brands : undefined;
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, raw ua string:[" + uaRaw + "]");
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, userAgentData available:[" + uaDataAvailable + "], getHighEntropyValues available:[" + getHighEntropyValuesAvailable + "]");
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, userAgentData low-entropy platform:[" + uaDataPlatform + "], brands:[" + JSON.stringify(uaDataBrands) + "]");
                _classPrivateFieldSet2(_uaClientHintsStatus, _this, "pending");
                _classPrivateFieldSet2(_pendingRequestBuffer, _this, []); // enable request buffering until hints resolve

                // Safety timeout: flush buffer even if hints never resolve (e.g. API blocked)
                _classPrivateFieldSet2(_clientHintsBufferTimeoutId, _this, setTimeout(function () {
                    if (_classPrivateFieldGet2(_pendingRequestBuffer, _this) !== null) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "ua_logic, client hints resolution timed out after 1s, flushing pending requests with available metrics");
                        _classPrivateFieldGet2(_flushPendingRequestBuffer, _this).call(_this);
                    }
                }, 1000));
                _classPrivateFieldSet2(_clientHintsPromise, _this, getUserAgentClientHints().then(function (clientHints) {
                    if (clientHints && _typeof(clientHints) === "object") {
                        _classPrivateFieldSet2(_uaClientHints, _this, clientHints);
                        _classPrivateFieldSet2(_uaClientHintsStatus, _this, "resolved");
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, high-entropy hints resolved:[" + JSON.stringify(clientHints) + "]");
                    } else {
                        _classPrivateFieldSet2(_uaClientHintsStatus, _this, "unavailable");
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, high-entropy hints unavailable or not returned");
                    }
                })["catch"](function (err) {
                    _classPrivateFieldSet2(_uaClientHints, _this, null);
                    _classPrivateFieldSet2(_uaClientHintsStatus, _this, "failed");
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, high-entropy hints fetch failed:[" + err + "]");
                })["finally"](function () {
                    _classPrivateFieldGet2(_flushPendingRequestBuffer, _this).call(_this);
                }));
            });
            /**
             * Flush pending request buffer after client hints resolution.
             * Re-computes metrics for any buffered begin_session request so that
             * high-entropy Client Hints values are included. All other buffered
             * requests are pushed to the queue unchanged, preserving order.
             * @private
             */
            _classPrivateFieldInitSpec(this, _flushPendingRequestBuffer, function () {
                // Clear safety timeout
                if (_classPrivateFieldGet2(_clientHintsBufferTimeoutId, _this)) {
                    clearTimeout(_classPrivateFieldGet2(_clientHintsBufferTimeoutId, _this));
                    _classPrivateFieldSet2(_clientHintsBufferTimeoutId, _this, null);
                }
                var buffer = _classPrivateFieldGet2(_pendingRequestBuffer, _this);
                _classPrivateFieldSet2(_pendingRequestBuffer, _this, null); // disable buffering — subsequent calls go directly to queue

                if (!buffer || buffer.length === 0) {
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, flushing [" + buffer.length + "] pending request(s) after client hints resolution");
                for (var i = 0; i < buffer.length; i++) {
                    var request = buffer[i];
                    // Re-compute metrics for begin_session requests with now-resolved hints
                    if (request.begin_session) {
                        request.metrics = JSON.stringify(_classPrivateFieldGet2(_getMetrics, _this).call(_this));
                    }
                    if (_classPrivateFieldGet2(_requestQueue, _this).length > _classPrivateFieldGet2(_SCSizeReqQueue, _this)) {
                        _classPrivateFieldGet2(_requestQueue, _this).shift();
                    }
                    _classPrivateFieldGet2(_requestQueue, _this).push(request);
                }
                _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
            });
            /**
             * Fetch and set server configuration
             * Retrieves server-side settings and behavior configurations
             * @private
             */
            _classPrivateFieldInitSpec(this, _getAndSetServerConfig, function () {
                if (_this.device_id === "[CLY]_temp_id") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, Device ID is temporary, not fetching server config");
                    _classPrivateFieldGet2(_resolveProvisionalLogs, _this).call(_this, "device id is temporary so no server config will be fetched");
                    return;
                }
                if (_classPrivateFieldGet2(_isSCDisabled, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, SDK behavior sync is disabled, not fetching server config");
                    _classPrivateFieldGet2(_resolveProvisionalLogs, _this).call(_this, "SDK behavior settings sync is disabled");
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
                var scStart = Date.now();
                _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "server_config", _this.url + _classPrivateFieldGet2(_readPath, _this), params, function (err, params, responseText) {
                    if (err) {
                        // error has been logged by the request function
                        _classPrivateFieldGet2(_resolveProvisionalLogs, _this).call(_this, "server config request failed");
                        return;
                    }
                    try {
                        var config = JSON.parse(responseText);
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "server_config, Config fetched successfully:[" + JSON.stringify(config) + "]");
                        // the connection test flag is read here, from a live response, and stripped
                        // before anything caches or mirrors the config. It is never persisted, so a
                        // page load or another tab can never replay a battery
                        var armed = !!(config && config.ct);
                        if (config && typeof config.ct !== "undefined") {
                            delete config.ct;
                        }
                        if (config) {
                            _classPrivateFieldGet2(_populateServerConfig, _this).call(_this, config);
                            _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
                        }
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_config", JSON.stringify(config));
                        // only a live response decides log gathering, the stored config applied above never does
                        _classPrivateFieldGet2(_applyLogGatheringConfig, _this).call(_this, config ? config.lg : undefined);
                        if (armed) {
                            _classPrivateFieldGet2(_runConnectionTest, _this).call(_this, Date.now() - scStart);
                        }
                    } catch (ex) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "server_config, Had an issue while parsing the response: " + ex);
                        _classPrivateFieldGet2(_resolveProvisionalLogs, _this).call(_this, "server config response could not be parsed");
                    }
                }, true, true);
                clearTimeout(_classPrivateFieldGet2(_serverConfigTimer, _this));
                _classPrivateFieldSet2(_serverConfigTimer, _this, setTimeout(function () {
                    _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
                }, _classPrivateFieldGet2(_SCInterval, _this) * 60 * 60 * 1000));
            });
            /**
             * Run the connection test battery the server armed, then report through the request queue.
             * Probes are bare parameterless GETs that never reach application work, so this needs no
             * consent and can write nothing. Nothing about the run is persisted: the only guard is the
             * in-memory flag below, which stops a second armed response from starting a parallel run.
             * @private
             * @param {Number} scMs - latency of the config fetch that delivered the flag
             */
            _classPrivateFieldInitSpec(this, _runConnectionTest, function (scMs) {
                if (_classPrivateFieldGet2(_connectionTestRunning, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "connection_test, A battery is already in flight, ignoring this delivery");
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "connection_test, Server armed a connection test, running the battery");
                _classPrivateFieldSet2(_connectionTestRunning, _this, true);
                runConnectionTest({
                    url: _this.url,
                    sdkName: _classPrivateFieldGet2(_sdkName, _this),
                    sdkVersion: _classPrivateFieldGet2(_sdkVersion, _this),
                    sc: {
                        status: 200,
                        ms: scMs
                    },
                    // the Tier 2 routes send no CORS headers, so a browser can only reach them
                    // opaquely; elsewhere they are irrelevant
                    tier2: isBrowser ? "cors-first" : "unsupported",
                    headers: _this.headers,
                    probe: probeViaFetch
                }).then(function (report) {
                    _classPrivateFieldSet2(_connectionTestRunning, _this, false);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "connection_test, Battery finished, queueing report:[" + JSON.stringify(report) + "]");
                    _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        ct_results: JSON.stringify(capReport(report))
                    });
                })["catch"](function (error) {
                    _classPrivateFieldSet2(_connectionTestRunning, _this, false);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "connection_test, Battery failed: " + error);
                });
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
                    _classPrivateFieldGet2(_releaseHeldLogLines, _this).call(_this);
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
                if (cache.hasOwnProperty("dort")) {
                    _classPrivateFieldSet2(_SCDropOldRequestTime, _this, cache.dort);
                }
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
                _classPrivateFieldSet2(_trackFormValues, _this, getConfig("track_form_values", ob, true));
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
                _this.useExplicitRcApi = getConfig("use_explicit_rc_api", ob, true);
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
                if (_this.storage === "cookie") {
                    _classPrivateFieldSet2(_lsSupport, _this, false);
                }
                _this.enableOrientationTracking = !isBrowser ? undefined : getConfig("enable_orientation_tracking", ob, true);
                _this.heatmapWhitelist = getConfig("heatmap_whitelist", ob, []);
                _this.contentWhitelist = getConfig("content_whitelist", ob, []);
                var globalContentSegmentation = getConfig("global_content_segmentation", ob, null);
                if (globalContentSegmentation !== null) {
                    _classPrivateFieldGet2(_setGlobalContentSegmentation, _this).call(_this, globalContentSegmentation, "initialize");
                }
                var contentTheme = getConfig("content_theme", ob, null);
                if (contentTheme !== null) {
                    _classPrivateFieldGet2(_setContentTheme, _this).call(_this, contentTheme, "initialize");
                }
                _this.salt = getConfig("salt", ob, null);
                _this.push_vapid_public_key = getConfig("push_vapid_public_key", ob, null);
                _this.push_service_worker_path = getConfig("push_service_worker_path", ob, "/countly_sw.js");
                // null means Countly's own folder next to the worker file, not "/"
                _this.push_service_worker_scope = getConfig("push_service_worker_scope", ob, null);
                _this.push_service_worker_registration = getConfig("push_service_worker_registration", ob, null);
                _this.push_auto_register = getConfig("push_auto_register", ob, true);
                _this.push_subscribe_timeout = getConfig("push_subscribe_timeout", ob, pushConstants.SUBSCRIBE_TIMEOUT_MS);
                var pushListener = getConfig("push_notification_listener", ob, null);
                _classPrivateFieldSet2(_pushNotificationListener, _this, typeof pushListener === "function" ? pushListener : null);
                _this.hcErrorCount = (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.errorCount) || 0) + (_this.hcErrorCount || 0);
                _this.hcWarningCount = (_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.warningCount) || 0) + (_this.hcWarningCount || 0);
                _classPrivateFieldSet2(_hcCountersLoaded, _this, true);
                _this.hcStatusCode = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.statusCode) || -1;
                _this.hcErrorMessage = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.errorMessage) || "";
                _this.hcBackoffCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.backoffCount) || 0;
                _this.hcConsecutiveBackoffCount = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, healthCheckCounterEnum.consecutiveBackoffCount) || 0;
                _classPrivateFieldSet2(_lastRequestWasBackoff, _this, false); // Track if the previous request resulted in a backoff
                _classPrivateFieldSet2(_crashFilterCallback, _this, getConfig("crash_filter_callback", ob, null));
                _classPrivateFieldSet2(_serverConfigCache, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_config"));
                if (!_classPrivateFieldGet2(_serverConfigCache, _this)) {
                    _classPrivateFieldSet2(_serverConfigCache, _this, getConfig("behavior_settings", ob, {}));
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_config", JSON.stringify(_classPrivateFieldGet2(_serverConfigCache, _this)));
                }
                _classPrivateFieldGet2(_populateServerConfig, _this).call(_this, _classPrivateFieldGet2(_serverConfigCache, _this));
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
                _classPrivateFieldSet2(_ignoredByChoice, _this, !!_classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_ignore") || !!getConfig("ignore_visitor", ob, false));
                if (_this.ignore_visitor) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "initialize, ignore_visitor:[" + _this.ignore_visitor + "], this user will not be tracked");
                    _classPrivateFieldGet2(_resolveProvisionalLogs, _this).call(_this, "visitor is ignored so no server config will be fetched");
                    // a prerendered, bot or heatmap visit is ignored too, but must not withdraw the worker's details
                    if (_classPrivateFieldGet2(_ignoredByChoice, _this) && _classPrivateFieldGet2(_isPushConfigured, _this).call(_this) && _classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                        _classPrivateFieldGet2(_findPushRegistration, _this).call(_this).then(_classPrivateFieldGet2(_syncPushWorkerConfig, _this));
                    }
                    return;
                }
                _classPrivateFieldGet2(_migrate, _this).call(_this);
                _classPrivateFieldSet2(_tabStore, _this, _classPrivateFieldGet2(_canUseTabStore, _this).call(_this));
                if (_classPrivateFieldGet2(_tabStore, _this)) {
                    if (_classPrivateFieldGet2(_isOpenersCopy, _this).call(_this)) {
                        _classPrivateFieldGet2(_setTabValue, _this).call(_this, "cly_queue", []);
                        _classPrivateFieldGet2(_setTabValue, _this).call(_this, "cly_event", []);
                    }
                    // each tab sends what it recorded; a reload, or a return after the tab was discarded, finds what it had not sent
                    var ownRequests = _classPrivateFieldGet2(_getTabValue, _this).call(_this, "cly_queue");
                    _classPrivateFieldSet2(_requestQueue, _this, Array.isArray(ownRequests) ? ownRequests : []);
                    var ownEvents = _classPrivateFieldGet2(_getTabValue, _this).call(_this, "cly_event");
                    _classPrivateFieldSet2(_eventQueue, _this, Array.isArray(ownEvents) ? ownEvents : []);
                    if (!document.hidden) {
                        _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, false);
                    }
                    _classPrivateFieldGet2(_listenForTabChanges, _this).call(_this);
                } else {
                    // the request queue is always written to localStorage, so it is read back from there
                    var storedRequests = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_queue", true);
                    _classPrivateFieldSet2(_requestQueue, _this, Array.isArray(storedRequests) ? storedRequests : []);
                    var storedEvents = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_event");
                    _classPrivateFieldSet2(_eventQueue, _this, Array.isArray(storedEvents) ? storedEvents : []);
                }
                _classPrivateFieldSet2(_remoteConfigs, _this, _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_remote_configs") || {});

                // flag that indicates that the offline mode was enabled at the end of the previous app session 
                var tempIdModeWasEnabled = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_id") === "[CLY]_temp_id";
                var idBeforeClear = null;
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
                        idBeforeClear = {
                            id: _this.device_id,
                            type: _classPrivateFieldGet2(_deviceIdType, _this)
                        };
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
                if (!_classPrivateFieldGet2(_trackFormValues, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initialize, track_form_values set to:[false], form submissions are recorded without field values");
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
                    // a "+" stays as it is, as links carrying device IDs are often built without encoding
                    var decodeQueryPart = function decodeQueryPart(part) {
                        try {
                            return decodeURIComponent(part);
                        } catch (ex) {
                            return part;
                        }
                    };
                    for (var i = 0; i < parts.length; i++) {
                        var separatorIndex = parts[i].indexOf("=");
                        var nv = separatorIndex === -1 ? [decodeQueryPart(parts[i])] : [decodeQueryPart(parts[i].substring(0, separatorIndex)), decodeQueryPart(parts[i].substring(separatorIndex + 1))];
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
                    // a device_id given as null or "" is no ID, so it must not replace the generated one
                    _this.device_id = _classPrivateFieldGet2(_getStoredIdOrGenerateId, _this).call(_this);
                }

                // Store the device ID and device ID type
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", _classPrivateFieldGet2(_deviceIdType, _this));
                if (_this.device_id !== "[CLY]_temp_id") {
                    _classPrivateFieldGet2(_giveTemporaryIdRequestsToCurrentId, _this).call(_this);
                }
                if (idBeforeClear && idBeforeClear.id !== _this.device_id) {
                    var pushWasInUse = _classPrivateFieldGet2(_isPushConfigured, _this).call(_this);
                    _classPrivateFieldGet2(_releasePushTokenOfLeavingUser, _this).call(_this, idBeforeClear);
                    _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.endpoint);
                    _classPrivateFieldGet2(_forgetPushMerges, _this).call(_this);
                    if (pushWasInUse && !_classPrivateFieldGet2(_isPushConfigured, _this).call(_this) && _classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                        _classPrivateFieldGet2(_findPushRegistration, _this).call(_this).then(function () {
                            return _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this, true);
                        });
                    }
                }

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
                _classPrivateFieldGet2(_initPushMessageListener, _this).call(_this);
                _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
            });
            /**
             *  Wire up navigator.serviceWorker 'message' events so the reference service worker
             *  can ask the page to record [CLY]_push_action, and to re-register the
             *  token after the browser rotates the subscription. Keeps consent enforcement and
             *  request batching on the page side. No-op outside a browser.
             *  Actions are acknowledged to the worker that sent them, since a freshly registered worker
             *  does not control the page until the next load and navigator.serviceWorker.controller may
             *  still be null. Messages are only acted on, and the ready handshake only sent, when this app
             *  uses push, otherwise it would record another app's clicks and its handshake would land on
             *  whatever worker the host application runs. The handler is kept so halt() can remove exactly
             *  this listener.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _initPushMessageListener, function () {
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                    return;
                }
                _classPrivateFieldSet2(_seenPushActionIds, _this, []);
                _classPrivateFieldSet2(_pushListeningSince, _this, Date.now());
                var mergedIds = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, pushStorageKeys.mergedIds);
                _classPrivateFieldSet2(_pushMergedIds, _this, Array.isArray(mergedIds) ? mergedIds.filter(function (pair) {
                    return Array.isArray(pair) && pair.length === 2;
                }) : []);
                try {
                    _classPrivateFieldSet2(_pushMessageHandler, _this, function (event) {
                        var data = event && event.data;
                        if (!data || !_classPrivateFieldGet2(_isPushConfigured, _this).call(_this) || data.scope && !_classPrivateFieldGet2(_isOwnPushScope, _this).call(_this, data.scope)) {
                            return;
                        }
                        if (data.type === pushMessageTypes.ACTION) {
                            _classPrivateFieldGet2(_handlePushAction, _this).call(_this, data, event.source);
                        } else if (data.type === pushMessageTypes.RECEIVED) {
                            _classPrivateFieldGet2(_notifyPushListener, _this).call(_this, "received", data);
                        } else if (data.type === pushMessageTypes.CLOSED) {
                            _classPrivateFieldGet2(_notifyPushListener, _this).call(_this, "closed", data);
                        } else if (data.type === pushMessageTypes.LOG) {
                            var levels = {
                                error: logLevelEnums.ERROR,
                                warn: logLevelEnums.WARNING,
                                info: logLevelEnums.INFO
                            };
                            _classPrivateFieldGet2(_log, _this).call(_this, levels[data.level] || logLevelEnums.DEBUG, "[SW] " + data.message);
                        } else if (data.type === pushMessageTypes.SUBSCRIPTION_CHANGE) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "initPushMessageListener, The browser replaced the push subscription");
                            _classPrivateFieldGet2(_autoRegisterPush, _this).call(_this, true);
                        } else if (data.type === pushMessageTypes.WORKER_VERSION) {
                            _classPrivateFieldGet2(_checkPushWorkerVersion, _this).call(_this, data.version);
                        }
                    });
                    navigator.serviceWorker.addEventListener("message", _classPrivateFieldGet2(_pushMessageHandler, _this));
                    if (_classPrivateFieldGet2(_isPushConfigured, _this).call(_this)) {
                        _classPrivateFieldGet2(_announceToPushWorker, _this).call(_this);
                    }
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "initPushMessageListener, Failed to register service worker message listener: " + e);
                }
                setTimeout(function () {
                    _classPrivateFieldGet2(_autoRegisterPush, _this).call(_this);
                }, 1);
            });
            /**
             *  Warn when the service worker is another version than this SDK. Sites serve their own copy of
             *  countly_sw.js, and a copy left behind on an SDK upgrade can lack what this SDK relies on.
             *  @memberof Countly._internals
             *  @param {string} version - the version the worker reported
             */
            _classPrivateFieldInitSpec(this, _checkPushWorkerVersion, function (version) {
                if (version === SDK_VERSION || _classPrivateFieldGet2(_pushWorkerVersionsWarned, _this).indexOf(version) !== -1) {
                    return;
                }
                _classPrivateFieldGet2(_pushWorkerVersionsWarned, _this).push(version);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "checkPushWorkerVersion, The push service worker your site serves is version [" + version + "] while the SDK is version [" + SDK_VERSION + "]; serve the countly_sw.js of the SDK version your pages run");
            });
            /**
             *  Start the ready handshake with Countly's worker once the registration lookup is done, and
             *  again whenever another worker takes control of the page.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _announceToPushWorker, function () {
                try {
                    _classPrivateFieldGet2(_findPushRegistration, _this).call(_this).then(_classPrivateFieldGet2(_drainPendingPushActions, _this));
                    navigator.serviceWorker.addEventListener("controllerchange", _classPrivateFieldGet2(_drainPendingPushActions, _this));
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "announceToPushWorker, Could not start the handshake with the service worker: " + e);
                }
            });
            /**
             *  Undo #initPushMessageListener. A worker keeps posting to the page after halt(); nothing here
             *  must act on those messages, and the next init must not end up with two listeners.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _removePushMessageListener, function () {
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                    return;
                }
                try {
                    if (_classPrivateFieldGet2(_pushMessageHandler, _this)) {
                        navigator.serviceWorker.removeEventListener("message", _classPrivateFieldGet2(_pushMessageHandler, _this));
                        _classPrivateFieldSet2(_pushMessageHandler, _this, null);
                    }
                    navigator.serviceWorker.removeEventListener("controllerchange", _classPrivateFieldGet2(_drainPendingPushActions, _this));
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "removePushMessageListener, Failed to remove service worker message listener: " + e);
                }
            });
            /**
             *  Record, report to the push listener and acknowledge a click the service worker handed over,
             *  or leave it with the worker while it cannot be recorded yet.
             *  @memberof Countly._internals
             *  @param {Object} data - the countly_push_action message
             *  @param {?ServiceWorker} source - the worker that sent it
             */
            _classPrivateFieldInitSpec(this, _handlePushAction, function (data, source) {
                var dealtWith = _classPrivateFieldGet2(_hasSeenPushAction, _this).call(_this, data.aid);
                var owner = dealtWith ? null : _classPrivateFieldGet2(_otherPushOwner, _this).call(_this, data.owner);
                if (!dealtWith && data.recorded !== true && data.owner !== null) {
                    if (!_this.check_consent(featureEnums.PUSH)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, No push consent yet, leaving push action [" + data.aid + "] with the worker until it is given");
                        return;
                    }
                    if (owner && data.owner.recordable !== true) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, Push action [" + data.aid + "] belongs to device ID [" + owner.id + "], who had not allowed recording it when it was made, leaving it with the worker for a page of theirs");
                        return;
                    }
                }
                if (_classPrivateFieldGet2(_isNewPushAction, _this).call(_this, data.aid)) {
                    if (data.recorded === true) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, The worker already recorded push action [" + data.aid + "]");
                    } else if (data.owner === null) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, Push action [" + data.aid + "] was made while the visitor had opted out, not recording it");
                    } else {
                        _classPrivateFieldGet2(_recordPushAction, _this).call(_this, data.messageId, data.buttonIndex, data.ts, owner);
                    }
                    if (owner) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, Push action [" + data.aid + "] belongs to device ID [" + owner.id + "], not telling this page's push listener about it");
                    } else {
                        _classPrivateFieldGet2(_notifyPushListener, _this).call(_this, "clicked", data);
                    }
                } else {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "handlePushAction, Ignoring duplicate push action [" + data.aid + "]");
                }
                _classPrivateFieldGet2(_postToPushWorker, _this).call(_this, {
                    type: pushMessageTypes.ACK,
                    aid: data.aid
                }, source);
            });
            /**
             *  The user a kept push click belongs to when that is not the current one, following the
             *  device IDs merged since the click.
             *  @memberof Countly._internals
             *  @param {?Object} [stamp] - what the worker wrote down: { device_id, t, recordable }
             *  @returns {?Object} { id, type } of that user, or null for the current user
             */
            _classPrivateFieldInitSpec(this, _otherPushOwner, function (stamp) {
                if (!stamp || typeof stamp.device_id !== "string" && typeof stamp.device_id !== "number") {
                    return null;
                }
                var id = String(stamp.device_id);
                if (id === "[CLY]_temp_id") {
                    return null;
                }
                var type = typeof stamp.t === "number" ? stamp.t : DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                var merged = _classPrivateFieldGet2(_pushMergedIds, _this) ? _classPrivateFieldGet2(_pushMerges, _this).call(_this) : [];
                for (var step = 0; step < merged.length && id !== String(_this.device_id); step++) {
                    var into = merged.filter(function (pair) {
                        return pair[0] === id;
                    })[0];
                    if (!into) {
                        break;
                    }
                    id = into[1];
                    // change_id, the only way device IDs are merged, makes the new one developer supplied
                    type = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                }
                return id === String(_this.device_id) ? null : {
                    id: id,
                    type: type
                };
            });
            /**
             *  Remember that a device ID was merged into another one, so a push click the service worker
             *  kept for the old ID is recorded for the new one.
             *  @memberof Countly._internals
             *  @param {string} fromId - the device ID that was merged
             *  @param {string} toId - the device ID it was merged into
             */
            _classPrivateFieldInitSpec(this, _rememberPushMerge, function (fromId, toId) {
                if (!_classPrivateFieldGet2(_pushMergedIds, _this) || !_classPrivateFieldGet2(_isPushConfigured, _this).call(_this)) {
                    return;
                }
                var from = String(fromId);
                var to = String(toId);
                var merged = _classPrivateFieldGet2(_pushMerges, _this).call(_this).filter(function (pair) {
                    return pair[0] !== from && pair[0] !== to;
                });
                merged.push([from, to]);
                _classPrivateFieldSet2(_pushMergedIds, _this, merged.slice(-pushConstants.MAX_MERGED_DEVICE_IDS));
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, pushStorageKeys.mergedIds, _classPrivateFieldGet2(_pushMergedIds, _this));
            });
            /**
             *  The device ID merges remembered for this browser, as stored, so a merge list another tab
             *  deleted is not brought back from this page's copy; with storage "none" this page's own list.
             *  @memberof Countly._internals
             *  @returns {Array} [from, to] pairs, oldest first
             */
            _classPrivateFieldInitSpec(this, _pushMerges, function () {
                if (_this.storage === "none") {
                    return _classPrivateFieldGet2(_pushMergedIds, _this) || [];
                }
                var stored = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, pushStorageKeys.mergedIds);
                return Array.isArray(stored) ? stored.filter(function (pair) {
                    return Array.isArray(pair) && pair.length === 2;
                }) : [];
            });
            /**
             *  Forget the remembered device ID merges, once someone else signs in or the visitor opts out.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _forgetPushMerges, function () {
                if (_classPrivateFieldGet2(_pushMergedIds, _this)) {
                    _classPrivateFieldSet2(_pushMergedIds, _this, []);
                }
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, pushStorageKeys.mergedIds);
            });
            /**
             *  Tell whether this page already handled the push action with this id.
             *  @memberof Countly._internals
             *  @param {?string} aid - the worker assigned action id, if any
             *  @returns {Boolean} true for an id among the recently handled ones
             */
            _classPrivateFieldInitSpec(this, _hasSeenPushAction, function (aid) {
                return !!aid && _classPrivateFieldGet2(_seenPushActionIds, _this).indexOf(aid) !== -1;
            });
            /**
             *  Decide whether a push action relayed by the service worker still has to be recorded, and
             *  remember it if so. The worker holds an action until a page confirms it and redelivers it on
             *  the next handshake, so the same action can legitimately arrive more than once. An action
             *  without an id cannot be tracked, so it is always treated as new.
             *  @memberof Countly._internals
             *  @param {?string} aid - the worker assigned action id, if any
             *  @returns {Boolean} true when the action has not been recorded yet
             */
            _classPrivateFieldInitSpec(this, _isNewPushAction, function (aid) {
                if (!aid) {
                    return true;
                }
                if (_classPrivateFieldGet2(_hasSeenPushAction, _this).call(_this, aid)) {
                    return false;
                }
                _classPrivateFieldGet2(_seenPushActionIds, _this).push(aid);
                if (_classPrivateFieldGet2(_seenPushActionIds, _this).length > pushConstants.MAX_SEEN_ACTION_IDS) {
                    _classPrivateFieldGet2(_seenPushActionIds, _this).shift();
                }
                return true;
            });
            /**
             *  Register for push without the developer having to call anything, but only when it can be
             *  done silently: notification permission must already be granted, because Safari and Firefox
             *  only allow Notification.requestPermission from a user gesture and a prompt fired at init
             *  would simply be refused. New visitors still go through enable_push_notifications, wired to
             *  a button; returning ones get their token kept in sync on every load (once per session while
             *  sessions are tracked automatically), after a device ID change and as soon as push consent
             *  arrives. Never after an explicit disable_push_notifications: permission alone is not consent
             *  to re-subscribe someone who asked to be unsubscribed.
             *  @memberof Countly._internals
             *  @param {Boolean} [keepRegistered] - true to renew this SDK's registration even with push_auto_register off
             */
            _classPrivateFieldInitSpec(this, _autoRegisterPush, function (keepRegistered) {
                if (!_this.push_vapid_public_key) {
                    return;
                }
                if (!_this.push_auto_register && !(keepRegistered === true && _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint))) {
                    if (keepRegistered === true) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "autoRegisterPush, push_auto_register is off and this page knows of no token registered for the current user, so the subscription the browser replaced is not registered; with storage \"none\" a token an earlier page registered is not known here, and enable_push_notifications registers it again");
                    }
                    return;
                }
                if (_classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.optOut)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "autoRegisterPush, Push was disabled explicitly, waiting for an explicit enable_push_notifications call");
                    return;
                }
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, true) || Notification.permission !== "granted") {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "autoRegisterPush, Notification permission has not been granted yet, waiting for an explicit enable_push_notifications call");
                    return;
                }
                if (!_this.check_consent(featureEnums.PUSH)) {
                    return;
                }
                _this.enable_push_notifications().then(function (result) {
                    if (result && result.subscribed) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "autoRegisterPush, Silent registration done, endpoint: [" + result.endpoint + "]");
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "autoRegisterPush, Silent registration did not subscribe, reason: [" + (result && result.reason) + "]" + (result && result.error ? " " + result.error : ""));
                    }
                });
            });
            /**
             *  Take the push token away from the user who is leaving, in a request under their own device ID.
             *  @memberof Countly._internals
             *  @param {Object} [leavingUser] - { id, type } of the leaving user; the current one when absent
             */
            _classPrivateFieldInitSpec(this, _releasePushTokenOfLeavingUser, function (leavingUser) {
                var leaving = leavingUser || {
                    id: _this.device_id,
                    type: _classPrivateFieldGet2(_deviceIdType, _this)
                };
                var registeredHere = _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint) || _classPrivateFieldGet2(_lastPushToken, _this) && _classPrivateFieldGet2(_lastPushToken, _this).deviceId === leaving.id;
                if (!registeredHere) {
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "releasePushTokenOfLeavingUser, Blacklisting the push token of device ID [" + leaving.id + "] before switching to a new user");
                _classPrivateFieldGet2(_asDeviceId, _this).call(_this, leaving, function () {
                    return _classPrivateFieldGet2(_sendPushToken, _this).call(_this, null);
                });
            });
            /**
             *  Run fn while this instance stands for another user's device ID and has no location fields,
             *  to queue a request about that user. A batch of gathered log lines that fills meanwhile is
             *  sent only after that, so it goes out under the current user's device ID.
             *  @memberof Countly._internals
             *  @param {Object} identity - { id, type } of the user the request is about
             *  @param {Function} fn - queues the request
             *  @returns {*} what fn returns
             */
            _classPrivateFieldInitSpec(this, _asDeviceId, function (identity, fn) {
                var current = {
                    id: _this.device_id,
                    type: _classPrivateFieldGet2(_deviceIdType, _this),
                    country_code: _this.country_code,
                    city: _this.city,
                    ip_address: _this.ip_address
                };
                _classPrivateFieldSet2(_standingInForAnotherUser, _this, true);
                _this.device_id = identity.id;
                _classPrivateFieldSet2(_deviceIdType, _this, identity.type);
                _this.country_code = null;
                _this.city = null;
                _this.ip_address = null;
                try {
                    return fn();
                } finally {
                    _this.device_id = current.id;
                    _classPrivateFieldSet2(_deviceIdType, _this, current.type);
                    _this.country_code = current.country_code;
                    _this.city = current.city;
                    _this.ip_address = current.ip_address;
                    _classPrivateFieldSet2(_standingInForAnotherUser, _this, false);
                }
            });
            /**
             *  Keep the push registration right after a device ID change. With a merge the user is the
             *  same and the server moves the token to the new ID itself while handling /i/device_id, so
             *  the page only remembers the merge for clicks the worker kept for the old ID. Without a merge
             *  the new ID is a new user who does not own the browser's subscription yet: the record that
             *  the previous user's token is registered and the remembered merges are dropped, and the new
             *  user gets the same silent registration a fresh visitor gets, which waits for their consent
             *  when consent is required. An explicit opt-out belongs to the person at the browser and stays
             *  either way.
             *  @memberof Countly._internals
             *  @param {Boolean} merge - whether the old and new IDs were merged on the server
             *  @param {string} [previousId] - the device ID before the change, needed with a merge
             */
            _classPrivateFieldInitSpec(this, _handlePushOnDeviceIdChange, function (merge, previousId) {
                var wasInUse = _classPrivateFieldGet2(_isPushConfigured, _this).call(_this);
                if (merge) {
                    _classPrivateFieldGet2(_rememberPushMerge, _this).call(_this, previousId, _this.device_id);
                } else {
                    _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.endpoint);
                    _classPrivateFieldGet2(_forgetPushMerges, _this).call(_this);
                }
                _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this, wasInUse);
                if (!merge) {
                    _classPrivateFieldGet2(_autoRegisterPush, _this).call(_this);
                }
            });
            /**
             *  Ask the service worker for push actions it kept while no tab was listening, and tell it
             *  whether this page wants its debug log lines (the only way a host worker that imported
             *  countly_sw.js, which this SDK did not register, learns that), what it needs to record a
             *  click itself while no page is open, and who the current user is.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _drainPendingPushActions, function () {
                if (!_classPrivateFieldGet2(_isPushConfigured, _this).call(_this)) {
                    return;
                }
                _classPrivateFieldGet2(_postToPushWorker, _this).call(_this, _classPrivateFieldGet2(_pushDetailsMessage, _this).call(_this, {
                    type: pushMessageTypes.READY,
                    debug: _this.debug === true,
                    config: _classPrivateFieldGet2(_pushReportingConfig, _this).call(_this),
                    owner: _classPrivateFieldGet2(_pushClickOwner, _this).call(_this)
                }));
            });
            /**
             *  The current user, for the service worker to write down with every click.
             *  @memberof Countly._internals
             *  @returns {?Object} { device_id, t }; null while ignored by choice; undefined when unknown
             */
            _classPrivateFieldInitSpec(this, _pushClickOwner, function () {
                if (_this.ignore_visitor) {
                    return _classPrivateFieldGet2(_ignoredByChoice, _this) ? null : undefined;
                }
                if (!_this.device_id) {
                    return undefined;
                }
                return {
                    device_id: _this.device_id,
                    t: _classPrivateFieldGet2(_deviceIdType, _this)
                };
            });
            /**
             *  What the service worker needs to record a click itself when no page is open: the identity
             *  fields of the request this page would have sent, and the VAPID key of the current user's
             *  registered subscription. Null while this page would not send a click right away either (no
             *  push consent, visitor opted out, tracking or networking off, offline mode), in which case
             *  the worker keeps such clicks for a page to decide on.
             *  @memberof Countly._internals
             *  @returns {?Object} url, app_key, device_id, t, sdk_name, sdk_version, av, salt and vapid_key, or null
             */
            _classPrivateFieldInitSpec(this, _pushReportingConfig, function () {
                if (_this.ignore_visitor || _classPrivateFieldGet2(_offlineMode, _this) || !_classPrivateFieldGet2(_SCTrackingAll, _this) || !_classPrivateFieldGet2(_SCNetwork, _this) || !_this.check_consent(featureEnums.PUSH) || !_this.app_key || !_this.device_id) {
                    return null;
                }
                var config = {
                    url: _this.url + _classPrivateFieldGet2(_apiPath, _this),
                    app_key: _this.app_key,
                    device_id: _this.device_id,
                    t: _classPrivateFieldGet2(_deviceIdType, _this),
                    sdk_name: _classPrivateFieldGet2(_sdkName, _this),
                    sdk_version: _classPrivateFieldGet2(_sdkVersion, _this),
                    av: _this.app_version
                };
                if (_this.salt) {
                    config.salt = _this.salt;
                }
                // only while a token is registered for this user: the stored key survives a switch to another user
                var vapidKey = _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint) && _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.vapidKey);
                if (vapidKey) {
                    config.vapid_key = vapidKey;
                }
                return config;
            });
            /**
             *  Hand the worker the current server details, or withdraw them, along with the current user:
             *  called whenever a token is registered or blacklisted, the device ID changes or something the
             *  details depend on changes, so the worker records a click the way this page would have at
             *  that moment.
             *  @memberof Countly._internals
             *  @param {Boolean} [wasInUse] - true when push was in use until a moment ago
             */
            _classPrivateFieldInitSpec(this, _syncPushWorkerConfig, function (wasInUse) {
                if (_classPrivateFieldGet2(_isPushConfigured, _this).call(_this)) {
                    _classPrivateFieldGet2(_postToPushWorker, _this).call(_this, _classPrivateFieldGet2(_pushDetailsMessage, _this).call(_this, {
                        type: pushMessageTypes.CONFIG,
                        config: _classPrivateFieldGet2(_pushReportingConfig, _this).call(_this),
                        owner: _classPrivateFieldGet2(_pushClickOwner, _this).call(_this)
                    }));
                } else if (wasInUse === true) {
                    _classPrivateFieldGet2(_postToPushWorker, _this).call(_this, _classPrivateFieldGet2(_pushDetailsMessage, _this).call(_this, {
                        type: pushMessageTypes.CONFIG,
                        config: null,
                        owner: _classPrivateFieldGet2(_pushClickOwner, _this).call(_this)
                    }));
                }
            });
            /**
             *  Mark a message carrying the server details with persist false when storage is "none", so
             *  the worker keeps them and its clicks in memory only.
             *  @memberof Countly._internals
             *  @param {Object} message - a countly_push_ready or countly_push_config message
             *  @returns {Object} the same message
             */
            _classPrivateFieldInitSpec(this, _pushDetailsMessage, function (message) {
                if (_this.storage === "none") {
                    message.persist = false;
                }
                return message;
            });
            /**
             *  Send a message to Countly's service worker: the given one, else the active worker of the
             *  registration push runs under (it need not control this page), else the one controlling
             *  this page.
             *  @memberof Countly._internals
             *  @param {Object} message - message to post; a ready or config message also gets this app's `scope`
             *  @param {?ServiceWorker} [worker] - the worker to address, typically the `source` of a message being replied to
             */
            _classPrivateFieldInitSpec(this, _postToPushWorker, function (message, worker) {
                // no service worker API at all (private windows, some webviews): there is nobody to talk to
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                    return;
                }
                try {
                    if (message.type === pushMessageTypes.READY || message.type === pushMessageTypes.CONFIG) {
                        message.scope = _classPrivateFieldGet2(_ownPushScope, _this).call(_this);
                    }
                    var registration = _classPrivateFieldGet2(_pushRegistration, _this) || _this.push_service_worker_registration;
                    var candidates = [worker, registration && registration.active, navigator.serviceWorker.controller];
                    for (var i = 0; i < candidates.length; i++) {
                        if (candidates[i] && typeof candidates[i].postMessage === "function") {
                            candidates[i].postMessage(message);
                            return;
                        }
                    }
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "postToPushWorker, Could not post [" + message.type + "] to the service worker: " + e);
                }
            });
            /**
             *  Look up the registration Countly push runs under, logging a failure instead of rejecting.
             *  @memberof Countly._internals
             *  @returns {Promise} settles once the lookup is done, never rejects
             */
            _classPrivateFieldInitSpec(this, _findPushRegistration, function () {
                return _classPrivateFieldGet2(_lookUpPushRegistration, _this).call(_this).then(function () { }, function (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "findPushRegistration, Could not look up the service worker registration: " + e);
                });
            });
            /**
             *  The registration Countly push runs under, found by exact scope and kept for the rest of the page.
             *  @memberof Countly._internals
             *  @returns {Promise<?ServiceWorkerRegistration>} the registration or null; rejects when the browser refuses the lookup
             */
            _classPrivateFieldInitSpec(this, _lookUpPushRegistration, function () {
                if (_classPrivateFieldGet2(_pushRegistration, _this)) {
                    return Promise.resolve(_classPrivateFieldGet2(_pushRegistration, _this));
                }
                if (_this.push_service_worker_registration) {
                    var supplied = _this.push_service_worker_registration;
                    return Promise.resolve(supplied).then(function (registration) {
                        if (_this.push_service_worker_registration === supplied) {
                            _this.push_service_worker_registration = registration;
                        }
                        if (registration && !_classPrivateFieldGet2(_pushRegistration, _this)) {
                            _classPrivateFieldSet2(_pushRegistration, _this, registration);
                        }
                        return _classPrivateFieldGet2(_pushRegistration, _this) || null;
                    });
                }
                return _classPrivateFieldGet2(_pushRegistrationAt, _this).call(_this, _classPrivateFieldGet2(_pushScope, _this).call(_this)).then(function (registration) {
                    if (registration && !_classPrivateFieldGet2(_pushRegistration, _this)) {
                        _classPrivateFieldSet2(_pushRegistration, _this, registration);
                    }
                    return _classPrivateFieldGet2(_pushRegistration, _this) || null;
                });
            });
            /**
             *  Look up the service worker registration of exactly the given scope, never the wider one
             *  getRegistration may answer with.
             *  @memberof Countly._internals
             *  @param {string} scope - the scope, relative or absolute
             *  @returns {Promise<?ServiceWorkerRegistration>} the registration, or null when there is none for that scope
             */
            _classPrivateFieldInitSpec(this, _pushRegistrationAt, function (scope) {
                return Promise.resolve().then(function () {
                    return navigator.serviceWorker.getRegistration(scope);
                }).then(function (registration) {
                    return registration && _classPrivateFieldGet2(_resolveUrl, _this).call(_this, registration.scope) === _classPrivateFieldGet2(_resolveUrl, _this).call(_this, scope) ? registration : null;
                });
            });
            /**
             *  The scope Countly push runs under: the one given to this call, else the one this browser's
             *  subscription was made under, else push_service_worker_scope, else the default.
             *  @memberof Countly._internals
             *  @param {Object} [opts] - per-call push_service_worker_scope and push_service_worker_path
             *  @returns {string} the scope, relative or absolute
             */
            _classPrivateFieldInitSpec(this, _pushScope, function (opts) {
                var o = opts || {};
                return o.push_service_worker_scope || _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.scope) || _this.push_service_worker_scope || _classPrivateFieldGet2(_defaultPushScope, _this).call(_this, o.push_service_worker_path || _this.push_service_worker_path);
            });
            /**
             *  The scope Countly's worker is registered under unless push_service_worker_scope says
             *  otherwise: the folder countly-push/ next to the worker file.
             *  @memberof Countly._internals
             *  @param {string} swPath - path of the worker file
             *  @returns {string} the scope as an absolute URL
             */
            _classPrivateFieldInitSpec(this, _defaultPushScope, function (swPath) {
                try {
                    return new URL(pushConstants.DEFAULT_SCOPE_FOLDER, new URL(swPath, location.href)).href;
                } catch (e) {
                    return pushConstants.DEFAULT_SCOPE_FOLDER;
                }
            });
            /**
             *  Tell whether a registration is Countly's private one: registered by the SDK under the
             *  default scope and running Countly's worker file.
             *  @memberof Countly._internals
             *  @param {?ServiceWorkerRegistration} registration - registration to inspect
             *  @param {string} swPath - path of Countly's worker file
             *  @returns {Boolean} true for Countly's private registration
             */
            _classPrivateFieldInitSpec(this, _isPrivatePushRegistration, function (registration, swPath) {
                if (!registration || registration === _this.push_service_worker_registration || registration === _classPrivateFieldGet2(_suppliedPushRegistration, _this)) {
                    return false;
                }
                var worker = registration.active || registration.waiting || registration.installing;
                return !!worker && _classPrivateFieldGet2(_resolveUrl, _this).call(_this, registration.scope) === _classPrivateFieldGet2(_defaultPushScope, _this).call(_this, swPath) && _classPrivateFieldGet2(_stripQuery, _this).call(_this, worker.scriptURL) === _classPrivateFieldGet2(_stripQuery, _this).call(_this, _classPrivateFieldGet2(_resolveUrl, _this).call(_this, swPath));
            });
            /**
             *  Ask the browser, without waiting, to look for a newer worker file under Countly's private
             *  scope, where no page loads that would make it look by itself.
             *  @memberof Countly._internals
             *  @param {ServiceWorkerRegistration} registration - Countly's private registration
             */
            _classPrivateFieldInitSpec(this, _updatePushWorker, function (registration) {
                Promise.resolve().then(function () {
                    return registration.update();
                })["catch"](function (err) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "updatePushWorker, Could not look for a newer version of the service worker: " + _classPrivateFieldGet2(_pushErrorText, _this).call(_this, err));
                });
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
                _classPrivateFieldSet2(_halted, _this, true);
                Countly.i = undefined;
                if (Array.isArray(Countly.q)) {
                    Countly.q.length = 0;
                } else {
                    Countly.q = [];
                }
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
                clearTimeout(_classPrivateFieldGet2(_collectTimer, _this));
                clearTimeout(_classPrivateFieldGet2(_pauseTimer, _this));
                _classPrivateFieldSet2(_collectUntil, _this, 0);
                _classPrivateFieldSet2(_pausedUntil, _this, 0);
                _classPrivateFieldSet2(_deferredRequests, _this, []);
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
                // decided, so nothing logged after halt is captured
                _classPrivateFieldGet2(_resetLogGathering, _this).call(_this, true);
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
                _classPrivateFieldGet2(_removePushMessageListener, _this).call(_this);
                // This has to happen while app_key is still set, hence before the reset block further down.
                _classPrivateFieldGet2(_clearStoredPushSubscription, _this).call(_this);
                Countly.features = featureList.slice();

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
                _this.push_vapid_public_key = undefined;
                _this.push_service_worker_path = undefined;
                _this.push_service_worker_scope = undefined;
                _this.push_service_worker_registration = undefined;
                _this.push_auto_register = undefined;
                _this.push_subscribe_timeout = undefined;
                _classPrivateFieldSet2(_pushNotificationListener, _this, null);
                _classPrivateFieldSet2(_seenPushActionIds, _this, null);
                _classPrivateFieldSet2(_pushEnableInFlight, _this, null);
                _classPrivateFieldSet2(_lastPushToken, _this, null);
                _classPrivateFieldSet2(_pushRegistration, _this, null);
                _classPrivateFieldSet2(_suppliedPushRegistration, _this, null);
                _classPrivateFieldSet2(_pushMergedIds, _this, null);
                // like a reload, halt() keeps a stored push opt-out and drops the one storage "none" keeps in memory
                _classPrivateFieldSet2(_pushRecordInMemory, _this, {});
                _classPrivateFieldSet2(_pushWorkerVersionsWarned, _this, []);
                _classPrivateFieldSet2(_globalContentSegmentation, _this, {});
                _classPrivateFieldSet2(_contentTheme, _this, null);
                _classPrivateFieldSet2(_idBeforeOfflineMode, _this, null);
                _classPrivateFieldSet2(_SCLimitKeyLength, _this, undefined);
                _classPrivateFieldSet2(_SCLimitValueSize, _this, undefined);
                _classPrivateFieldSet2(_SCLimitSegmentationValues, _this, undefined);
                _classPrivateFieldSet2(_SCLimitBreadcrumbCount, _this, undefined);
                _classPrivateFieldSet2(_SCLimitStackTraceLinesPerThread, _this, undefined);
                _classPrivateFieldSet2(_SCLimitStackTraceLineLength, _this, undefined);
                _classPrivateFieldSet2(_fakeRequestHandler, _this, undefined);
                _classPrivateFieldSet2(_journeyTriggerInProgress, _this, undefined);
                _classPrivateFieldSet2(_journeyTriggerPending, _this, undefined);
                _classPrivateFieldSet2(_contentZoneWanted, _this, undefined);
                _classPrivateFieldSet2(_contentZoneExited, _this, false);
                _classPrivateFieldSet2(_journeyPendingEventIds, _this, undefined);
                if (_classPrivateFieldGet2(_clientHintsBufferTimeoutId, _this)) {
                    clearTimeout(_classPrivateFieldGet2(_clientHintsBufferTimeoutId, _this));
                    _classPrivateFieldSet2(_clientHintsBufferTimeoutId, _this, null);
                }
                _classPrivateFieldSet2(_serverConfigAfterMerge, _this, false);
                _classPrivateFieldSet2(_remoteConfigAfterMerge, _this, false);
                _classPrivateFieldSet2(_pendingRequestBuffer, _this, null);
                _classPrivateFieldSet2(_clientHintsPromise, _this, null);
                _classPrivateFieldSet2(_uaClientHints, _this, null);
                _classPrivateFieldSet2(_uaClientHintsStatus, _this, "not_started");
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
                            _classPrivateFieldGet2(_releaseHeldLogLines, _this).call(_this);
                            _classPrivateFieldGet2(_updateConsent, _this).call(_this);
                            setTimeout(function () {
                                if (feature === featureEnums.SESSIONS && _classPrivateFieldGet2(_lastParams, _this).begin_session) {
                                    _this.begin_session.apply(_this, _classPrivateFieldGet2(_lastParams, _this).begin_session);
                                    _classPrivateFieldGet2(_lastParams, _this).begin_session = null;
                                } else if (feature === featureEnums.VIEWS && _classPrivateFieldGet2(_lastParams, _this).track_pageview) {
                                    _classPrivateFieldSet2(_lastView, _this, null);
                                    _this.track_pageview.apply(_this, _classPrivateFieldGet2(_lastParams, _this).track_pageview);
                                    _classPrivateFieldGet2(_lastParams, _this).track_pageview = null;
                                } else if (feature === featureEnums.CONTENT && _classPrivateFieldGet2(_contentZoneWanted, _this)) {
                                    _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                                } else if (feature === featureEnums.PUSH) {
                                    if (_classPrivateFieldGet2(_isPushConfigured, _this).call(_this)) {
                                        _classPrivateFieldGet2(_drainPendingPushActions, _this).call(_this);
                                    }
                                    _classPrivateFieldGet2(_autoRegisterPush, _this).call(_this);
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
                        var wasOptedIn = _classPrivateFieldGet2(_consents, _this)[feature].optin === true;
                        _classPrivateFieldGet2(_consents, _this)[feature].optin = false;
                        // this is core feature
                        if (enforceConsentUpdate && wasOptedIn) {
                            _classPrivateFieldGet2(_updateConsent, _this).call(_this);
                        }
                        if (wasOptedIn && feature === featureEnums.CONTENT) {
                            _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
                            _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                        }
                        // leaving the browser subscribed after push consent is withdrawn would keep the
                        // server able to reach this user, so drop the subscription and blacklist the token
                        if (enforceConsentUpdate && wasOptedIn && feature === featureEnums.PUSH && _classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                            var _this$pushConsentWith;
                            _classPrivateFieldSet2(_pushConsentWithdrawals, _this, (_this$pushConsentWith = _classPrivateFieldGet2(_pushConsentWithdrawals, _this), _this$pushConsentWith++, _this$pushConsentWith));
                            _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
                            _classPrivateFieldGet2(_unsubscribePush, _this).call(_this, {});
                        }
                    }
                } else {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "remove_consent, No feature available for [" + feature + "]");
                }
            });
            /**
             *  Moves the requests queued under the temporary device ID to the current device ID
             */
            _classPrivateFieldInitSpec(this, _giveTemporaryIdRequestsToCurrentId, function () {
                var changed = false;
                for (var i = 0; i < _classPrivateFieldGet2(_requestQueue, _this).length; i++) {
                    if (_classPrivateFieldGet2(_requestQueue, _this)[i].device_id === "[CLY]_temp_id") {
                        _classPrivateFieldGet2(_requestQueue, _this)[i].device_id = _this.device_id;
                        _classPrivateFieldGet2(_requestQueue, _this)[i].t = _classPrivateFieldGet2(_deviceIdType, _this);
                        changed = true;
                    }
                }
                if (changed) {
                    _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
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
                _classPrivateFieldSet2(_contentZoneWanted, _this, false);
                _classPrivateFieldSet2(_idBeforeOfflineMode, _this, {
                    id: _this.device_id,
                    type: _classPrivateFieldGet2(_deviceIdType, _this)
                });
                _this.device_id = "[CLY]_temp_id";
                _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.TEMPORARY_ID);
                _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
            });
            _defineProperty(this, "disable_offline_mode", function (device_id) {
                if (!_classPrivateFieldGet2(_offlineMode, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "disable_offline_mode, Countly was not in offline mode.");
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "disable_offline_mode, Disabling offline mode");
                _classPrivateFieldSet2(_offlineMode, _this, false);
                var leavingUser = device_id && _classPrivateFieldGet2(_idBeforeOfflineMode, _this) && _classPrivateFieldGet2(_idBeforeOfflineMode, _this).id !== device_id ? _classPrivateFieldGet2(_idBeforeOfflineMode, _this) : null;
                _classPrivateFieldSet2(_idBeforeOfflineMode, _this, null);
                if (leavingUser) {
                    _classPrivateFieldGet2(_releasePushTokenOfLeavingUser, _this).call(_this, leavingUser);
                }
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
                _classPrivateFieldGet2(_announceChange, _this).call(_this, _this.device_id, _classPrivateFieldGet2(_deviceIdType, _this));
                _classPrivateFieldGet2(_takeBackWhenSendable, _this).call(_this, false);
                _classPrivateFieldGet2(_giveTemporaryIdRequestsToCurrentId, _this).call(_this);
                if (leavingUser) {
                    _classPrivateFieldGet2(_handlePushOnDeviceIdChange, _this).call(_this, false);
                } else {
                    _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
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
                            if (!_classPrivateFieldGet2(_orientationListening, _this)) {
                                _classPrivateFieldSet2(_orientationListening, _this, true);
                                var orientationTimeout;
                                add_event_listener(window, "resize", function () {
                                    clearTimeout(orientationTimeout);
                                    orientationTimeout = setTimeout(function () {
                                        _classPrivateFieldGet2(_report_orientation, _this).call(_this);
                                    }, 200);
                                });
                            }
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
                            _classPrivateFieldGet2(_renewPushTokenForSession, _this).call(_this);
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
                        sec = sec || (_classPrivateFieldGet2(_trackTime, _this) ? getTimestamp() - _classPrivateFieldGet2(_lastBeat, _this) : _classPrivateFieldGet2(_storedDuration, _this));
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
                if (_classPrivateFieldGet2(_deviceIdType, _this) === DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED || _classPrivateFieldGet2(_deviceIdType, _this) === DeviceIdTypeInternalEnums.URL_PROVIDED) {
                    /*change ID without merge as current ID is Dev supplied (an ID from the page link is reported as such), so not first login*/
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
                _classPrivateFieldGet2(_announceChange, _this).call(_this, newId, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                if (!merge) {
                    // process async queue before sending events
                    _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                    // the last view's duration belongs to the previous user, so it goes out with their events, session or not
                    _classPrivateFieldGet2(_reportViewDuration, _this).call(_this);
                    // empty event queue
                    _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                    // save the previous user's pending profile changes while the ID and consents are still theirs, and never give them to the next user
                    _this.userData.save(true);
                    _classPrivateFieldSet2(_customData, _this, {});
                    // end current session
                    _this.end_session(null, true);
                    // the previous user's session cookie must not let the next user continue that session
                    _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_session");
                    // clear timed events
                    _classPrivateFieldSet2(_timedEvents, _this, {});
                    // clear all consents
                    _this.remove_consent_internal(Countly.features, false);
                    // a content zone entered for the previous user is not entered again for the next one, and their content is closed
                    if (_classPrivateFieldGet2(_contentZoneWanted, _this)) {
                        _classPrivateFieldSet2(_contentZoneExited, _this, true);
                    }
                    _classPrivateFieldSet2(_contentZoneWanted, _this, false);
                    _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
                    _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                    _classPrivateFieldGet2(_releasePushTokenOfLeavingUser, _this).call(_this);
                }
                var oldId = _this.device_id;
                _this.device_id = newId;
                _this.device_id = _this.device_id;
                _classPrivateFieldSet2(_deviceIdType, _this, DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id", _this.device_id);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_id_type", DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "change_id, Changing ID from:[" + oldId + "] to [" + newId + "]");
                var mergeQueued = false;
                if (merge) {
                    // no consent check here since 21.11.0
                    mergeQueued = _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        old_device_id: oldId
                    });
                } else if (_classPrivateFieldGet2(_autoSessionTracking, _this)) {
                    // only automatic session tracking starts a session for the new ID, manual sessions are left to the developer
                    _this.begin_session(!_classPrivateFieldGet2(_autoExtend, _this), true);
                }
                _classPrivateFieldGet2(_handlePushOnDeviceIdChange, _this).call(_this, merge, oldId);
                // the behavior settings and remote config can differ for the new ID. A fetch creates the user of an ID the server has not seen,
                // so after a merge they wait for the merge request to be sent, or the server would merge two users instead of renaming one
                if (mergeQueued) {
                    _classPrivateFieldSet2(_serverConfigAfterMerge, _this, true);
                } else {
                    _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
                }
                // if init time remote config was enabled with a callback function, remove currently stored remote configs and fetch remote config again
                if (_this.remote_config) {
                    _classPrivateFieldSet2(_remoteConfigs, _this, {});
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_remote_configs", _classPrivateFieldGet2(_remoteConfigs, _this));
                    if (mergeQueued) {
                        _classPrivateFieldSet2(_remoteConfigAfterMerge, _this, true);
                    } else {
                        _this.fetch_remote_config(_this.remote_config);
                    }
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
                    case internalEventKeyEnums.PUSH_ACTION:
                        respectiveConsent = _this.check_consent(featureEnums.PUSH);
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
            * Enable web push notifications. Registers the service worker, requests notification permission,
            * subscribes via the Push API using the configured VAPID public key, and queues a token_session
            * request mirroring the Android/iOS contract. A subscription already bound to the key is reused
            * and its token sent again, unless this page sent it for the same device ID less than a minute
            * ago. The worker is registered under the scope given to this call, else the one this browser's
            * subscription was made under, else `push_service_worker_scope`, else the folder countly-push/
            * next to its file. Another push provider's subscription is left alone.
            * Lifts an earlier disable_push_notifications. Concurrent calls (a double click, or the silent
            * registration racing an explicit call) share one run, so only one subscription is ever created.
            * Gives up on an attempt after `push_subscribe_timeout` milliseconds (default 30 s) when the
            * browser never finishes creating the subscription, as iOS 18.7 was seen doing; the next call
            * then starts afresh instead of joining the stuck one.
            * @param {Object} [opts] - per-call overrides for push_vapid_public_key / push_service_worker_path / push_service_worker_scope / push_service_worker_registration (a registration, or the promise register() returns for it)
            * @returns {Promise<Object>} resolves to { subscribed: true, endpoint } on success, or { subscribed: false, reason } otherwise, with reason one of "unsupported", "no_consent", "missing_vapid_key", "invalid_vapid_key", "denied", "default", "service_worker_conflict", "service_worker_missing", "service_worker_redundant", "timeout", "subscription_conflict", "disabled" or "error" (which adds an `error` field)
            */
            _defineProperty(this, "enable_push_notifications", function (opts) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "enable_push_notifications, Enabling push notifications");
                opts = opts || {};
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, true)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_push_notifications, Web push is not supported in this environment");
                    return Promise.resolve({
                        subscribed: false,
                        reason: "unsupported"
                    });
                }
                if (!_this.check_consent(featureEnums.PUSH)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_push_notifications, Consent for [push] is not given, aborting");
                    return Promise.resolve({
                        subscribed: false,
                        reason: "no_consent"
                    });
                }
                var vapidKey = opts.push_vapid_public_key || _this.push_vapid_public_key;
                if (!vapidKey) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enable_push_notifications, push_vapid_public_key is required");
                    return Promise.resolve({
                        subscribed: false,
                        reason: "missing_vapid_key"
                    });
                }
                var applicationServerKey = _classPrivateFieldGet2(_urlBase64ToUint8Array, _this).call(_this, vapidKey);
                if (!applicationServerKey || applicationServerKey.length !== pushConstants.VAPID_PUBLIC_KEY_BYTE_LENGTH || applicationServerKey[0] !== pushConstants.VAPID_PUBLIC_KEY_PREFIX) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enable_push_notifications, push_vapid_public_key is not a base64-url encoded uncompressed P-256 public key (got [" + vapidKey + "]). Generate one from your Countly application settings.");
                    return Promise.resolve({
                        subscribed: false,
                        reason: "invalid_vapid_key"
                    });
                }
                var swPath = opts.push_service_worker_path || _this.push_service_worker_path;
                var swScope = _classPrivateFieldGet2(_pushScope, _this).call(_this, opts);
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.optOut);
                if (_classPrivateFieldGet2(_pushEnableInFlight, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "enable_push_notifications, Already in progress, joining that call");
                    return _classPrivateFieldGet2(_pushEnableInFlight, _this);
                }
                if (opts.push_service_worker_registration) {
                    _classPrivateFieldSet2(_suppliedPushRegistration, _this, opts.push_service_worker_registration);
                }
                var withdrawalsAtStart = _classPrivateFieldGet2(_pushConsentWithdrawals, _this);
                // Ask before touching anything asynchronous. Browsers that require transient user
                // activation for a notification prompt would refuse it once the service worker
                // registration has resolved, which would make the first opt-in impossible.
                _classPrivateFieldSet2(_pushEnableInFlight, _this, _classPrivateFieldGet2(_requestNotificationPermission, _this).call(_this).then(function (permission) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "enable_push_notifications, Notification permission: [" + permission + "]");
                    if (permission !== "granted") {
                        return {
                            subscribed: false,
                            reason: permission || "denied"
                        };
                    }
                    return _classPrivateFieldGet2(_resolvePushRegistration, _this).call(_this, swPath, swScope, opts.push_service_worker_registration).then(function (registration) {
                        if (!registration) {
                            return {
                                subscribed: false,
                                reason: "service_worker_conflict"
                            };
                        }
                        _classPrivateFieldSet2(_pushRegistration, _this, registration);
                        var privateRegistration = _classPrivateFieldGet2(_isPrivatePushRegistration, _this).call(_this, registration, swPath);
                        if (privateRegistration) {
                            _classPrivateFieldGet2(_updatePushWorker, _this).call(_this, registration);
                        }
                        return _classPrivateFieldGet2(_withPushTimeout, _this).call(_this, _classPrivateFieldGet2(_subscribeAndRegisterToken, _this).call(_this, registration, vapidKey, applicationServerKey, withdrawalsAtStart, privateRegistration), _this.push_subscribe_timeout);
                    });
                })["catch"](function (err) {
                    var message = err && err.message ? err.message : String(err);
                    if (message === "service_worker_redundant" || message === "service_worker_missing") {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enable_push_notifications, The service worker never became active: [" + message + "]");
                        return {
                            subscribed: false,
                            reason: message
                        };
                    }
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enable_push_notifications, Failed to enable push notifications: " + err);
                    return {
                        subscribed: false,
                        reason: "error",
                        error: _classPrivateFieldGet2(_pushErrorText, _this).call(_this, err)
                    };
                }).then(function (result) {
                    _classPrivateFieldSet2(_pushEnableInFlight, _this, null);
                    return result;
                }));
                return _classPrivateFieldGet2(_pushEnableInFlight, _this);
            });
            /**
             *  Get a service worker registration to subscribe through, without replacing one the host
             *  application already owns. register() updates whatever is registered for the same scope, so
             *  installing the reference worker at "/" on a PWA would silently drop its fetch and cache
             *  handlers. When a foreign worker holds the scope the developer has to either import
             *  countly_sw.js into it, pass its registration in, or leave push_service_worker_scope unset.
             *  Script URLs are compared without their query string, where #pushWorkerUrl puts the debug and
             *  storage flags, so toggling either is not mistaken for a foreign worker. Under Countly's own
             *  default scope another file is Countly's worker under its earlier name, which is replaced.
             *  @memberof Countly._internals
             *  @param {string} swPath - path of the reference worker to install
             *  @param {string} swScope - scope to register it under
             *  @param {?(ServiceWorkerRegistration|Promise<ServiceWorkerRegistration>)} suppliedRegistration - registration to use instead, if any, or the promise register() returned for it
             *  @returns {Promise<?ServiceWorkerRegistration>} the registration to use, or null when the scope is taken; rejects with "service_worker_missing" or "service_worker_redundant" when its worker never becomes active, and with the error of a supplied registration that could not be made
             */
            _classPrivateFieldInitSpec(this, _resolvePushRegistration, function (swPath, swScope, suppliedRegistration) {
                var provided = suppliedRegistration || _this.push_service_worker_registration;
                if (provided) {
                    return Promise.resolve(provided).then(function (registration) {
                        if (!registration) {
                            throw new Error("service_worker_missing");
                        }
                        if (provided === suppliedRegistration) {
                            _classPrivateFieldSet2(_suppliedPushRegistration, _this, registration);
                        } else if (_this.push_service_worker_registration === provided) {
                            _this.push_service_worker_registration = registration;
                        }
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "resolvePushRegistration, Using the supplied service worker registration at scope: [" + registration.scope + "]");
                        return _classPrivateFieldGet2(_waitForPushWorker, _this).call(_this, registration);
                    });
                }
                return navigator.serviceWorker.getRegistration(swScope).then(function (existing) {
                    var existingWorker = existing && (existing.active || existing.waiting || existing.installing);
                    // getRegistration matches by longest scope prefix, so `existing` can belong to a wider
                    // scope than the one asked for. Registering a narrower scope leaves that one alone, so
                    // only an exact scope match can actually be replaced.
                    var ownsExactScope = existing && _classPrivateFieldGet2(_resolveUrl, _this).call(_this, existing.scope) === _classPrivateFieldGet2(_resolveUrl, _this).call(_this, swScope);
                    var countlyScope = _classPrivateFieldGet2(_resolveUrl, _this).call(_this, swScope) === _classPrivateFieldGet2(_defaultPushScope, _this).call(_this, swPath);
                    if (existingWorker && ownsExactScope && !countlyScope && _classPrivateFieldGet2(_stripQuery, _this).call(_this, existingWorker.scriptURL) !== _classPrivateFieldGet2(_stripQuery, _this).call(_this, _classPrivateFieldGet2(_resolveUrl, _this).call(_this, swPath))) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "resolvePushRegistration, A different service worker ([" + existingWorker.scriptURL + "]) already owns scope [" + existing.scope + "]. Registering [" + swPath + "] would replace it. Import countly_sw.js into that worker and pass its registration as push_service_worker_registration, or leave push_service_worker_scope unset so that Countly's worker gets a scope of its own.");
                        return null;
                    }
                    return navigator.serviceWorker.register(_classPrivateFieldGet2(_pushWorkerUrl, _this).call(_this, swPath), {
                        scope: swScope
                    }).then(function (registration) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "resolvePushRegistration, Service worker registered at scope: [" + registration.scope + "]");
                        return _classPrivateFieldGet2(_waitForPushWorker, _this).call(_this, registration);
                    });
                });
            });
            /**
             *  Wait until the registration's worker is active, so its push manager can be used.
             *  navigator.serviceWorker.ready is not usable for this: it only resolves once a registration
             *  whose scope covers the current page is active, so a worker registered under a narrower
             *  scope would leave the caller pending forever, with no error.
             *  @memberof Countly._internals
             *  @param {ServiceWorkerRegistration} registration - the registration just created or updated, or the one the application supplied
             *  @returns {Promise<ServiceWorkerRegistration>} the same registration once active; rejects with "service_worker_missing" or "service_worker_redundant" otherwise
             */
            _classPrivateFieldInitSpec(this, _waitForPushWorker, function (registration) {
                if (registration.active) {
                    return Promise.resolve(registration);
                }
                var worker = registration.installing || registration.waiting;
                if (!worker) {
                    return Promise.reject(new Error("service_worker_missing"));
                }
                return new Promise(function (resolve, reject) {
                    var _onStateChange = function onStateChange() {
                        if (worker.state === "activated") {
                            worker.removeEventListener("statechange", _onStateChange);
                            resolve(registration);
                        } else if (worker.state === "redundant") {
                            worker.removeEventListener("statechange", _onStateChange);
                            reject(new Error("service_worker_redundant"));
                        }
                    };
                    worker.addEventListener("statechange", _onStateChange);
                    _onStateChange();
                });
            });
            /**
             *  Resolve a possibly relative service worker path or scope against the page, so it can be
             *  compared with the absolute values the browser reports.
             *  @memberof Countly._internals
             *  @param {string} value - path or scope, relative or absolute
             *  @returns {string} absolute URL, or the input unchanged if it cannot be resolved
             */
            _classPrivateFieldInitSpec(this, _resolveUrl, function (value) {
                try {
                    return new URL(value, location.href).href;
                } catch (e) {
                    return value;
                }
            });
            /**
             *  A URL without its query string and fragment.
             *  @memberof Countly._internals
             *  @param {string} value - URL to trim
             *  @returns {string} the URL up to the first ? or #
             */
            _classPrivateFieldInitSpec(this, _stripQuery, function (value) {
                var parts = parseUrlParts(String(value || ""));
                return parts.origin + parts.pathname;
            });
            /**
             *  The URL to register the reference worker under. The worker cannot ask the page for its
             *  configuration when a push wakes it up with no page open, so `cly_debug=1` travels in the
             *  query string of its own URL while debug is on, and `cly_persist=0` with storage "none". A
             *  different query string is a different script URL to the browser, so toggling either
             *  re-installs the worker (the subscription belongs to the scope and survives that).
             *  @memberof Countly._internals
             *  @param {string} swPath - configured worker path
             *  @returns {string} the path with the settings appended
             */
            _classPrivateFieldInitSpec(this, _pushWorkerUrl, function (swPath) {
                var params = [];
                if (_this.debug === true) {
                    params.push(pushWorkerParams.debug + "=1");
                }
                if (_this.storage === "none") {
                    params.push(pushWorkerParams.persist + "=0");
                }
                if (!params.length) {
                    return swPath;
                }
                return swPath + (swPath.indexOf("?") === -1 ? "?" : "&") + params.join("&");
            });
            /**
             *  Reuse or create a browser subscription for the given key and register its token. One bound
             *  to another key is only replaced when it is Countly's own.
             *  @memberof Countly._internals
             *  @param {ServiceWorkerRegistration} swReg - registration to subscribe through
             *  @param {string} vapidKey - configured VAPID public key, base64-url encoded
             *  @param {Uint8Array} applicationServerKey - the same key decoded
             *  @param {number} withdrawalsAtStart - push consent withdrawals when the enable call started
             *  @param {Boolean} privateRegistration - true when swReg is Countly's private registration
             *  @returns {Promise<Object>} resolves to { subscribed: true, endpoint }, or { subscribed: false, reason }
             */
            _classPrivateFieldInitSpec(this, _subscribeAndRegisterToken, function (swReg, vapidKey, applicationServerKey, withdrawalsAtStart, privateRegistration) {
                return swReg.pushManager.getSubscription().then(function (existing) {
                    var savedVapidKey = _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.vapidKey);
                    if (existing && _classPrivateFieldGet2(_pushSubscriptionUsesKey, _this).call(_this, existing, applicationServerKey, savedVapidKey, vapidKey)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "subscribeAndRegisterToken, Reusing the existing subscription and registering its token");
                        return _classPrivateFieldGet2(_registerPushSubscription, _this).call(_this, existing, vapidKey, swReg.scope, withdrawalsAtStart);
                    }
                    var unsubChain = Promise.resolve();
                    if (existing) {
                        if (!_classPrivateFieldGet2(_isCountlyPushSubscription, _this).call(_this, existing, privateRegistration)) {
                            if (privateRegistration) {
                                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "subscribeAndRegisterToken, Countly's own scope [" + swReg.scope + "] now holds a subscription another sender made after Countly registered there; give each Countly app or push provider a scope of its own");
                            } else {
                                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "subscribeAndRegisterToken, The service worker at scope [" + swReg.scope + "] holds a push subscription Countly cannot recognise as its own (another push provider's, or one Countly made with an earlier VAPID key where nothing was stored or storage was cleared). A scope holds only one, so Countly leaves it alone; let Countly register its own worker under its default scope instead of sharing [" + swReg.scope + "]");
                            }
                            return {
                                subscribed: false,
                                reason: "subscription_conflict"
                            };
                        }
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "subscribeAndRegisterToken, Replacing Countly's push subscription at scope [" + swReg.scope + "], which was made with another VAPID key");
                        // subscribe() with another key is refused (InvalidStateError) while this subscription exists
                        unsubChain = existing.unsubscribe()["catch"](function (err) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "subscribeAndRegisterToken, unsubscribe failed, continuing: " + err);
                        });
                    }
                    return unsubChain.then(function () {
                        return swReg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: applicationServerKey
                        });
                    }).then(function (subscription) {
                        return _classPrivateFieldGet2(_registerPushSubscription, _this).call(_this, subscription, vapidKey, swReg.scope, withdrawalsAtStart);
                    });
                });
            });
            /**
             *  Register a subscription's token, or drop the subscription when push was disabled or its
             *  consent withdrawn while enable_push_notifications was waiting on the browser.
             *  @memberof Countly._internals
             *  @param {PushSubscription} subscription - subscription to register
             *  @param {string} vapidKey - VAPID public key it is bound to, base64-url encoded
             *  @param {string} scope - scope of the service worker it belongs to
             *  @param {number} withdrawalsAtStart - push consent withdrawals when the enable call started
             *  @returns {Promise<Object>} { subscribed: true, endpoint }, or { subscribed: false, reason } with reason "disabled" or "no_consent"
             */
            _classPrivateFieldInitSpec(this, _registerPushSubscription, function (subscription, vapidKey, scope, withdrawalsAtStart) {
                var reason = null;
                if (_classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.optOut)) {
                    reason = "disabled";
                } else if (!_this.check_consent(featureEnums.PUSH)) {
                    reason = "no_consent";
                }
                if (!reason) {
                    _classPrivateFieldGet2(_sendPushToken, _this).call(_this, subscription, vapidKey, scope);
                    return Promise.resolve({
                        subscribed: true,
                        endpoint: subscription.endpoint
                    });
                }
                if (reason === "no_consent" && withdrawalsAtStart === _classPrivateFieldGet2(_pushConsentWithdrawals, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "enable_push_notifications, Push consent was reset while subscribing, keeping the subscription unregistered until push consent is given");
                    return Promise.resolve({
                        subscribed: false,
                        reason: reason
                    });
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_push_notifications, " + (reason === "disabled" ? "Push was disabled" : "Push consent was withdrawn") + " while subscribing, dropping the subscription instead of registering it");
                return Promise.resolve().then(function () {
                    return subscription.unsubscribe();
                })["catch"](function (err) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "enable_push_notifications, Could not drop the subscription: " + err);
                }).then(function () {
                    return {
                        subscribed: false,
                        reason: reason
                    };
                });
            });
            /**
            * Disable web push notifications. Unsubscribes Countly's subscription from the browser push
            * manager (another push provider's subscription is left alone) and queues a
            * blacklist token_session request so the server clears the stored subscription. Deliberately
            * not consent gated — opting out must stay possible after push consent is withdrawn. The
            * opt-out is stored and survives reloads: notification permission stays granted after an
            * unsubscribe, so otherwise the silent registration at the next init would subscribe again.
            * Only an explicit enable_push_notifications lifts it. With `storage: "none"` the opt-out holds
            * for the current page only.
            * @param {Object} [opts] - per-call override for push_service_worker_scope
            * @returns {Promise<Object>} resolves to { unsubscribed: true } when complete, or { unsubscribed: false, reason } with reason "unsupported" or "error"
            */
            _defineProperty(this, "disable_push_notifications", function (opts) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "disable_push_notifications, Disabling push notifications");
                if (!_classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "disable_push_notifications, Web push is not supported in this environment");
                    return Promise.resolve({
                        unsubscribed: false,
                        reason: "unsupported"
                    });
                }
                _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.optOut, 1);
                return _classPrivateFieldGet2(_unsubscribePush, _this).call(_this, opts || {});
            });
            /**
             *  Drop Countly's browser subscription and blacklist the token on the server. Shared by the
             *  explicit disable and by push consent withdrawal, which must not count as an opt-out. Both
             *  call it only where the push API is supported.
             *  @memberof Countly._internals
             *  @param {Object} opts - per-call override for push_service_worker_scope
             *  @returns {Promise<Object>} resolves to { unsubscribed: true } when complete
             */
            _classPrivateFieldInitSpec(this, _unsubscribePush, function (opts) {
                // a token the server may still hold, even if the registration or subscription is already gone
                var hadRegisteredToken = !!_classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint) || !!_classPrivateFieldGet2(_lastPushToken, _this);
                var wasInUse = _classPrivateFieldGet2(_isPushConfigured, _this).call(_this);
                var lookup = opts.push_service_worker_scope ? _classPrivateFieldGet2(_pushRegistrationAt, _this).call(_this, opts.push_service_worker_scope) : _classPrivateFieldGet2(_lookUpPushRegistration, _this).call(_this);
                var swReg = null;
                return lookup.then(function (registration) {
                    swReg = registration;
                    return swReg ? swReg.pushManager.getSubscription() : null;
                }).then(function (subscription) {
                    if (subscription && !_classPrivateFieldGet2(_isCountlyPushSubscription, _this).call(_this, subscription, _classPrivateFieldGet2(_isPrivatePushRegistration, _this).call(_this, swReg, _this.push_service_worker_path))) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "disable_push_notifications, The subscription at scope [" + swReg.scope + "] belongs to another push provider, leaving it alone");
                        return false;
                    }
                    return subscription ? subscription.unsubscribe().then(function () {
                        return true;
                    }) : false;
                }).then(function (hadSubscription) {
                    // a page that halted meanwhile leaves storage to the instance that came after it
                    if (_classPrivateFieldGet2(_halted, _this)) {
                        return {
                            unsubscribed: true
                        };
                    }
                    // forgotten first, so the details the worker is handed below do not name this subscription's key
                    _classPrivateFieldGet2(_clearStoredPushSubscription, _this).call(_this);
                    if ((hadSubscription || hadRegisteredToken) && _this.ignore_visitor) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "disable_push_notifications, The visitor opted out, so no request is sent; the server drops the token the next time it sends to it");
                    } else if (hadSubscription || hadRegisteredToken) {
                        _classPrivateFieldGet2(_sendPushToken, _this).call(_this, null);
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "disable_push_notifications, Nothing was registered, no blacklist request needed");
                    }
                    _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this, wasInUse);
                    return {
                        unsubscribed: true
                    };
                })["catch"](function (err) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "disable_push_notifications, Failed to disable push notifications: " + err);
                    return {
                        unsubscribed: false,
                        reason: "error",
                        error: _classPrivateFieldGet2(_pushErrorText, _this).call(_this, err)
                    };
                });
            });
            /**
             *  Describe a push failure as "name: message", the way the browser names it, for the `error`
             *  field of a failed result.
             *  @memberof Countly._internals
             *  @param {*} err - what the failing call threw or rejected with
             *  @returns {string} "name: message", or the error as text
             */
            _classPrivateFieldInitSpec(this, _pushErrorText, function (err) {
                if (err && err.message) {
                    return err.name ? err.name + ": " + err.message : String(err.message);
                }
                return String(err);
            });
            /**
            * Record a push notification action event (body click or action button click).
            * Mirrors the [CLY]_push_action event recorded by the iOS and Android SDKs. Sent right away
            * rather than on the next heartbeat, as the page is usually about to navigate.
            * @param {string} messageId - the ObjectId of the message that produced the notification
            * @param {number} [buttonIndex=0] - 0 = body click, 1+ = action button index
            */
            _defineProperty(this, "record_push_action", function (messageId, buttonIndex) {
                _classPrivateFieldGet2(_recordPushAction, _this).call(_this, messageId, buttonIndex);
            });
            /**
             *  Queue a [CLY]_push_action event when push consent allows it and send the event queue right away.
             *  @memberof Countly._internals
             *  @param {string} messageId - the ObjectId of the message that produced the notification
             *  @param {number} [buttonIndex=0] - 0 = body click, 1+ = action button index
             *  @param {number} [clickedAt] - when the click happened, in ms since epoch
             *  @param {?Object} [owner] - { id, type } of the user the click belongs to, if not the current one
             */
            _classPrivateFieldInitSpec(this, _recordPushAction, function (messageId, buttonIndex, clickedAt, owner) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "record_push_action, Recording push action for message:[" + messageId + "], button:[" + buttonIndex + "]" + (owner ? ", device ID:[" + owner.id + "]" : ""));
                if (!messageId) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "record_push_action, messageId is required");
                    return;
                }
                if (_this.check_consent(featureEnums.PUSH)) {
                    var happenedAt = typeof clickedAt === "number" && isFinite(clickedAt) && clickedAt > 0 ? clickedAt : undefined;
                    var outsideViews = !!owner || !!happenedAt && happenedAt < _classPrivateFieldGet2(_pushListeningSince, _this);
                    _classPrivateFieldGet2(_add_cly_events, _this).call(_this, {
                        key: internalEventKeyEnums.PUSH_ACTION,
                        count: 1,
                        segmentation: {
                            i: messageId,
                            b: typeof buttonIndex === "number" ? buttonIndex : 0,
                            p: "w"
                        }
                    }, undefined, happenedAt, outsideViews, owner || undefined);
                }
                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
            });
            /**
            * Set a function that is told what happens to push notifications on this origin. It is called
            * with one object: `{ type, messageId, title, message, url, buttons, payload, buttonIndex,
            * buttonTitle }` where `type` is "received" (the worker got the push and showed the
            * notification), "clicked" (body or a button; `buttonIndex` 0 = body, 1+ = button and
            * `buttonTitle`/`url` describe it) or "closed" (dismissed without a click). `payload` is the
            * whole message as sent by the server, including any custom key/values. Only pages that are
            * open at the time hear about "received" and "closed"; a click that opened a new window is
            * reported by that window, and a click made while no page was open (the worker recorded it
            * itself) is reported to the next page that loads. A click the page still has to record is
            * reported once push consent is given, and a click made for a user other than the one currently
            * signed in is not reported to this page. "closed" is best effort: browsers only pass on the dismissals the OS
            * tells them about, and that differs by browser and OS (on Windows the toast's X and Action
            * Center removals mostly produce nothing; on macOS Chrome and Firefox report Notification Center
            * removals, Safari does not). Firefox, and Safari for Notification Center clicks, also report a
            * "closed" right after "clicked" because they fire the close event for the worker's own close()
            * call. Safari shows no action buttons, and neither does desktop Firefox before version 152 (it
            * shows them since, on macOS in the notification's Options list; Firefox for Android always
            * did), so a click there is always the body (index 0).
            * The [CLY]_push_action event is recorded regardless of the listener.
            * Can also be given at init as `push_notification_listener`.
            * @param {?Function} listener - the function to call, or null to remove the current one
            */
            _defineProperty(this, "set_push_notification_listener", function (listener) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "set_push_notification_listener, " + (typeof listener === "function" ? "Setting the push notification listener" : "Removing the push notification listener"));
                _classPrivateFieldSet2(_pushNotificationListener, _this, typeof listener === "function" ? listener : null);
            });
            /**
             *  Tell the push notification listener about an event the worker reported. The listener is
             *  application code, so a throwing one must not break recording or acknowledging the action.
             *  @memberof Countly._internals
             *  @param {string} type - "received" | "clicked" | "closed"
             *  @param {Object} data - message from the worker
             */
            _classPrivateFieldInitSpec(this, _notifyPushListener, function (type, data) {
                if (typeof _classPrivateFieldGet2(_pushNotificationListener, _this) !== "function") {
                    return;
                }
                var event = {
                    type: type,
                    messageId: data.messageId || "",
                    title: data.title || "",
                    message: data.message || "",
                    url: data.url || "",
                    buttons: Array.isArray(data.buttons) ? data.buttons : [],
                    payload: data.payload || null
                };
                if (type === "clicked") {
                    event.buttonIndex = typeof data.buttonIndex === "number" ? data.buttonIndex : 0;
                    event.buttonTitle = data.buttonTitle || "";
                }
                try {
                    _classPrivateFieldGet2(_pushNotificationListener, _this).call(_this, event);
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "notifyPushListener, The push notification listener threw on [" + type + "]: " + e);
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
             *  @param {Number} [timestampOverride] - when the event happened, in ms since epoch; the current time when absent
             *  @param {Boolean} [outsideViews] - true when the event belongs to none of this page's views
             *  @param {Object} [owner] - { id, type } of another user, whose event goes out in a request of its own
             */
            _classPrivateFieldInitSpec(this, _add_cly_events, function (event, eventIdOverride, timestampOverride, outsideViews, owner) {
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

                // the dashboard's event and segmentation filters are for the app's own events, as on Android and iOS; every "[CLY]_" event, also the ones content sends, is Countly's
                var isInternalEvent = typeof event.key === "string" && event.key.indexOf("[CLY]_") === 0;
                if (!isInternalEvent && !_classPrivateFieldGet2(_isEventAllowedByBehaviorSettings, _this).call(_this, event.key)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "add_cly_event, Event was filtered out by behavior settings: [" + event.key + "]");
                    return;
                }
                var initialKey = event.key;
                // we omit the internal event keys from truncation. TODO: This is not perfect as it would omit a key that includes an internal event key and more too. But that possibility seems negligible. 
                if (!internalEventKeyEnumsArray.includes(event.key)) {
                    event.key = truncateSingleValue(event.key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "add_cly_event", _classPrivateFieldGet2(_log, _this));
                }
                if (!isInternalEvent) {
                    event.segmentation = _classPrivateFieldGet2(_filterSegmentationByBehaviorSettings, _this).call(_this, event.key, event.segmentation);
                }
                event.segmentation = truncateObject(event.segmentation, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), "add_cly_event", _classPrivateFieldGet2(_log, _this));
                var props = ["key", "count", "sum", "dur", "segmentation"];
                var e = createNewObjectFromProperties(event, props);
                e.timestamp = timestampOverride || getMsTimestamp();
                var date = timestampOverride ? new Date(timestampOverride) : new Date();
                e.hour = date.getHours();
                e.dow = date.getDay();
                e.id = eventIdOverride || secureRandom();
                if (e.key === internalEventKeyEnums.VIEW) {
                    e.pvid = _classPrivateFieldGet2(_previousViewId, _this) || "";
                } else {
                    e.cvid = outsideViews ? "" : _classPrivateFieldGet2(_currentViewId, _this) || "";
                }
                try {
                    JSON.stringify(e);
                } catch (ex) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "add_cly_event, The event [" + e.key + "] cannot be turned into JSON and was not recorded: " + ex);
                    return;
                }
                if (owner) {
                    _classPrivateFieldGet2(_asDeviceId, _this).call(_this, owner, function () {
                        return _classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                            events: JSON.stringify([e])
                        });
                    });
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "With event ID: [" + e.id + "], successfully queued the last event for device ID: [" + owner.id + "]", e);
                    return;
                }
                _classPrivateFieldGet2(_eventQueue, _this).push(e);
                _classPrivateFieldGet2(_saveEventQueue, _this).call(_this);
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
                            // Flush any buffered requests (e.g. held while client hints were resolving)
                            // into the real request queue so they can be sent before the content request.
                            if (_classPrivateFieldGet2(_pendingRequestBuffer, _this) !== null) {
                                _classPrivateFieldGet2(_flushPendingRequestBuffer, _this).call(_this);
                            }
                            _classPrivateFieldGet2(_takeBackWhenSendable, _this).call(_this, false);
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
                                    if (!((!_classPrivateFieldGet2(_readyToProcess, _this) || _classPrivateFieldGet2(_isInBackoff, _this) || getTimestamp() <= _classPrivateFieldGet2(_failTimeout, _this) || _classPrivateFieldGet2(_holding, _this).call(_this)) && waitAttempts < 5)) {
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
             * Waits up to 3 times for the journey events to be confirmed sent, then retries up to 3 times if the content request fails
             * @private
             * @param {number} [attempt=0] - Current attempt number for retry logic
             * @param {number} [waits=0] - How many times the request already waited for the journey events
             */
            _classPrivateFieldInitSpec(this, _triggerJourneyContentRequestWithRetries, function (attempt, waits) {
                var currentAttempt = attempt || 0;
                var currentWaits = waits || 0;
                var maxAttempts = 3;

                // Skip if content is already being displayed (iframe exists)
                if (typeof document !== "undefined" && document.getElementById(_classPrivateFieldGet2(_contentIframeID, _this))) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Content is already being displayed, skipping content request");
                    return;
                }
                if (_classPrivateFieldGet2(_journeyPendingEventIds, _this) && _classPrivateFieldGet2(_journeyPendingEventIds, _this).size > 0) {
                    if (currentWaits < maxAttempts) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Pending journey events not yet confirmed sent. Deferring content refresh.");
                        setTimeout(function () {
                            _classPrivateFieldGet2(_triggerJourneyContentRequestWithRetries, _this).call(_this, currentAttempt, currentWaits + 1);
                        }, 300);
                        return;
                    }
                    // events sent by the regular sending or by another tab are never confirmed here, so waiting longer would not help
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "journeyTrigger, Journey events are still not confirmed sent, requesting the content anyway");
                    _classPrivateFieldGet2(_journeyPendingEventIds, _this).clear();
                }
                var handleResult = function handleResult(success) {
                    if (!success && currentAttempt + 1 < maxAttempts) {
                        setTimeout(function () {
                            _classPrivateFieldGet2(_triggerJourneyContentRequestWithRetries, _this).call(_this, currentAttempt + 1, currentWaits);
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
                    var safeValue = makeJsonSafe(value, "[userData] change_custom_property", _classPrivateFieldGet2(_log, _this));
                    if (typeof safeValue === "undefined" && typeof value !== "undefined") {
                        return;
                    }
                    value = safeValue;
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
                    var safeValue = makeJsonSafe(value, "userData set", _classPrivateFieldGet2(_log, _this));
                    if (typeof safeValue === "undefined" && typeof value !== "undefined") {
                        return;
                    }
                    // truncate user's custom property value to internal limits
                    key = truncateSingleValue(key, _classPrivateFieldGet2(_SCLimitKeyLength, _this), "userData set", _classPrivateFieldGet2(_log, _this));
                    value = truncateSingleValue(safeValue, _classPrivateFieldGet2(_SCLimitValueSize, _this), "userData set", _classPrivateFieldGet2(_log, _this));
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
                        dispatchErrors(new Error("Unhandled rejection (reason: " + (event.reason && event.reason.stack ? _classPrivateFieldGet2(_stackWithMessage, _this).call(_this, event.reason) : event.reason) + ")."), true);
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
                    if (!(_classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this) > 0)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "add_log, The breadcrumb limit is [" + _classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this) + "], not keeping breadcrumbs");
                        return;
                    }
                    while (_classPrivateFieldGet2(_crashLogs, _this).length >= _classPrivateFieldGet2(_SCLimitBreadcrumbCount, _this)) {
                        _classPrivateFieldGet2(_crashLogs, _this).shift();
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "add_log, Reached maximum crashLogs size. Will erase the oldest one.");
                    }
                    _classPrivateFieldGet2(_crashLogs, _this).push(record);
                }
            });
            /**
            * Fetch remote config from the server, with the method=rc API, or with the legacy method=fetch_remote_config API when use_explicit_rc_api is false
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
                    if (!_classPrivateFieldGet2(_SCNetwork, _this)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "fetch_remote_config_explicit, Networking is disabled by the SDK behavior settings");
                        if (providedCall) {
                            providedCall(new Error("Networking is disabled by the SDK behavior settings"), _classPrivateFieldGet2(_remoteConfigs, _this));
                        }
                        return;
                    }
                    _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);
                    _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "fetch_remote_config_explicit", _this.url + _classPrivateFieldGet2(_readPath, _this), request, function (err, params, responseText) {
                        if (err) {
                            // error has been logged by the request function
                            if (providedCall) {
                                providedCall(new Error("Remote config could not be fetched"), _classPrivateFieldGet2(_remoteConfigs, _this));
                            }
                            return;
                        }
                        var parseError = false;
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
                            parseError = new Error("Remote config answer could not be read");
                        }
                        if (providedCall) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "fetch_remote_config_explicit, Callback function is provided");
                            providedCall(parseError || err, _classPrivateFieldGet2(_remoteConfigs, _this));
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
                _classPrivateFieldSet2(_autoSessionTracking, _this, true);
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
                    _classPrivateFieldSet2(_lastViewStoredDuration, _this, 0);
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
                if (!_this.check_consent(featureEnums.USERS)) {
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
             * Remembers the password fields under a DOM root, so a password the visitor reveals as text is still never read
             * @param {Object} root - DOM object whose password fields to remember
             */
            _classPrivateFieldInitSpec(this, _watchPasswordFields, function (root) {
                if (!root || typeof root.nodeType !== "number" || _classPrivateFieldGet2(_passwordWatchRoots, _this).has(root)) {
                    return;
                }
                _classPrivateFieldGet2(_passwordWatchRoots, _this).set(root, true);
                var current = typeof root.querySelectorAll === "function" ? root.querySelectorAll("input[type=password]") : [];
                for (var i = 0; i < current.length; i++) {
                    _classPrivateFieldGet2(_passwordFields, _this).set(current[i], true);
                }
                if (typeof MutationObserver === "function") {
                    new MutationObserver(function (records) {
                        for (var j = 0; j < records.length; j++) {
                            if (records[j].oldValue && records[j].oldValue.toLowerCase() === "password") {
                                _classPrivateFieldGet2(_passwordFields, _this).set(records[j].target, true);
                            }
                        }
                    }).observe(root, {
                        attributes: true,
                        attributeFilter: ["type"],
                        attributeOldValue: true,
                        subtree: true
                    });
                }
            });
            /**
             * Gives the lowercased tokens of a form field's autocomplete attribute
             * @param {HTMLElement} input - form field
             * @returns {Array<String>} autocomplete tokens
             */
            _classPrivateFieldInitSpec(this, _autocompleteTokens, function (input) {
                var autocomplete = typeof input.getAttribute === "function" ? input.getAttribute("autocomplete") : null;
                return autocomplete ? autocomplete.toLowerCase().split(/\s+/) : [];
            });
            /**
             * Tells whether a form field must never be read: a password field, also one shown as text after it was one,
             * a payment card field or a one-time code field
             * @param {HTMLElement} input - form field
             * @returns {Boolean} true when the field is never read
             */
            _classPrivateFieldInitSpec(this, _neverReadField, function (input) {
                if (input.type === "password" || _classPrivateFieldGet2(_passwordFields, _this).has(input)) {
                    return true;
                }
                return _classPrivateFieldGet2(_autocompleteTokens, _this).call(_this, input).some(function (token) {
                    return token === "current-password" || token === "new-password" || token === "one-time-code" || token.indexOf("cc-") === 0;
                });
            });
            /**
             * Tells whether a form field or one of its ancestors has the cly_user_ignore class
             * @param {HTMLElement} input - form field
             * @returns {Boolean} true when the field is ignored
             */
            _classPrivateFieldInitSpec(this, _ignoredByMarkup, function (input) {
                for (var node = input; node && node.nodeType === 1; node = node.parentNode) {
                    if ((node.getAttribute("class") || "").indexOf("cly_user_ignore") !== -1) {
                        return true;
                    }
                }
                return false;
            });
            /**
             * Tells whether a form field's name, id or labels mark it as holding a secret or payment, bank or identity data
             * @param {HTMLElement} input - form field
             * @param {String=} labelText - text of a label found for the field
             * @returns {Boolean} true when the field looks sensitive
             */
            _classPrivateFieldInitSpec(this, _hasSensitiveName, function (input, labelText) {
                if (isSensitiveFieldName(input.name) || isSensitiveFieldName(input.id) || isSensitiveFieldName(labelText)) {
                    return true;
                }
                var labels = input.labels || [];
                for (var i = 0; i < labels.length; i++) {
                    if (isSensitiveFieldName(labels[i].textContent)) {
                        return true;
                    }
                }
                return false;
            });
            /**
            * Generate custom event for all forms that were submitted on this page. With the track_form_values init option set to false, the event carries no field values. Password, payment card and one-time code fields and card numbers are never read. Fields named like secrets, bank or identity data and values shaped like a social security number are skipped unless the field has the cly_form_allow class. Add cly_user_ignore class to a field or to an element containing fields to skip them.
            * @param {Object=} parent - DOM object which children to track, by default it is document body
            * @param {boolean=} trackHidden - provide true to also track hidden inputs, default false
            * */
            _defineProperty(this, "track_forms", function (parent, trackHidden) {
                if (!isBrowser) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "track_forms, window object is not available. Not tracking forms.");
                    return;
                }
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "track_forms, Starting to track form submissions. DOM object provided:[" + !!parent + "] Tracking hidden inputs :[" + !!trackHidden + "] Recording field values:[" + _classPrivateFieldGet2(_trackFormValues, _this) + "]");
                parent = parent || document;
                _classPrivateFieldGet2(_watchPasswordFields, _this).call(_this, parent);
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
                    if (_classPrivateFieldGet2(_trackFormValues, _this) && typeof form.elements !== "undefined") {
                        for (var i = 0; i < form.elements.length; i++) {
                            input = form.elements[i];
                            if (!input || _classPrivateFieldGet2(_neverReadField, _this).call(_this, input) || _classPrivateFieldGet2(_ignoredByMarkup, _this).call(_this, input)) {
                                continue;
                            }
                            var allowed = (" " + (input.getAttribute("class") || "") + " ").indexOf(" cly_form_allow ") !== -1;
                            if (!allowed && _classPrivateFieldGet2(_hasSensitiveName, _this).call(_this, input)) {
                                continue;
                            }
                            var values = [];
                            if (input.nodeName.toLowerCase() === "select") {
                                if (typeof input.multiple !== "undefined") {
                                    values.push(getMultiSelectValues(input));
                                } else {
                                    values.push(input.options[input.selectedIndex].value);
                                }
                            } else if (input.nodeName.toLowerCase() === "input") {
                                if (typeof input.type !== "undefined") {
                                    if (input.type.toLowerCase() === "checkbox" || input.type.toLowerCase() === "radio") {
                                        if (input.checked) {
                                            values.push(input.value);
                                        }
                                    } else if (input.type.toLowerCase() !== "hidden" || trackHidden) {
                                        values.push(input.value);
                                    }
                                } else {
                                    values.push(input.value);
                                }
                            } else if (input.nodeName.toLowerCase() === "textarea") {
                                values.push(input.value);
                            } else if (typeof input.value !== "undefined") {
                                values.push(input.value);
                            }
                            if (values.some(function (value) {
                                return looksLikeCardNumber(value) || !allowed && looksLikeSsn(value);
                            })) {
                                continue;
                            }
                            var inputKey = "input:" + getInputName(input);
                            segmentation[inputKey] = (segmentation[inputKey] || []).concat(values);
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
            * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms, also to an element containing them, or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If not class is provided, Countly SDK will try to determine type of information automatically. Password, payment card and one-time code fields are never read. Hidden fields and fields named like secrets, bank or identity data are read only with a cly_user_{key} class.
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
                _classPrivateFieldGet2(_watchPasswordFields, _this).call(_this, parent);
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
                            if (input && !_classPrivateFieldGet2(_neverReadField, _this).call(_this, input)) {
                                // check if element should be ignored
                                if (!_classPrivateFieldGet2(_ignoredByMarkup, _this).call(_this, input)) {
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
                                    if (looksLikeCardNumber(value)) {
                                        continue;
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
                                    } else if (input.type && input.type.toLowerCase() === "hidden" || _classPrivateFieldGet2(_hasSensitiveName, _this).call(_this, input, labelData[input.id])) {
                                        continue;
                                    }
                                    // check for email
                                    else if (input.type && input.type.toLowerCase() === "email" || input.name && input.name.toLowerCase().indexOf("email") !== -1 || input.id && input.id.toLowerCase().indexOf("email") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("email") !== -1 || input.nodeName.toLowerCase() === "input" && isWholeEmail(value)) {
                                        if (!userdata.email && isWholeEmail(value)) {
                                            userdata.email = value;
                                            hasUserInfo = true;
                                        }
                                    } else if (input.name && input.name.toLowerCase().indexOf("username") !== -1 || input.id && input.id.toLowerCase().indexOf("username") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("username") !== -1) {
                                        if (!userdata.username) {
                                            userdata.username = value;
                                        }
                                        hasUserInfo = true;
                                    } else if (input.type && input.type.toLowerCase() === "tel" || _classPrivateFieldGet2(_autocompleteTokens, _this).call(_this, input).some(function (token) {
                                        return token === "tel" || token.indexOf("tel-") === 0;
                                    }) || isPhoneFieldName(input.name) || isPhoneFieldName(input.id) || isPhoneFieldName(labelData[input.id])) {
                                        if (!userdata.phone && isPhoneShaped(value)) {
                                            userdata.phone = value;
                                            hasUserInfo = true;
                                        }
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
            * Opts out user of any metric tracking, and takes Countly's push subscription off the browser
            * */
            _defineProperty(this, "opt_out", function () {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "opt_out, Opting out the user. Deprecated function call! Use 'consent' in place of this call.");
                _this.ignore_visitor = true;
                _classPrivateFieldSet2(_ignoredByChoice, _this, true);
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_ignore", true);
                _classPrivateFieldGet2(_forgetPushMerges, _this).call(_this);
                _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
                _classPrivateFieldGet2(_unsubscribePushOnOptOut, _this).call(_this);
            });
            /**
             *  Take Countly's push subscription off the browser when the visitor opts out, so no more
             *  notifications arrive; the server drops the token the next time it sends to it. It stays a
             *  push opt-out after opt_in, which only enable_push_notifications lifts.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _unsubscribePushOnOptOut, function () {
                if (!_classPrivateFieldGet2(_isPushConfigured, _this).call(_this) || !_classPrivateFieldGet2(_isPushSupported, _this).call(_this, false)) {
                    return;
                }
                _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.optOut, 1);
                _classPrivateFieldGet2(_unsubscribePush, _this).call(_this, {});
            });
            /**
            * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
            * */
            _defineProperty(this, "opt_in", function () {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "opt_in, Opting in the user. Deprecated function call! Use 'consent' in place of this call.");
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_ignore", false);
                _this.ignore_visitor = false;
                _classPrivateFieldSet2(_ignoredByChoice, _this, false);
                _classPrivateFieldGet2(_checkIgnore, _this).call(_this);
                _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
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
                event.segmentation = _classPrivateFieldGet2(_withGlobalContentSegmentation, _this).call(_this, event.segmentation);
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
                        var npsScore = parseFloat(widgetResult.rating);
                        if (isNaN(npsScore)) {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget must contain rating property");
                            return;
                        }
                        widgetResult.rating = Math.round(npsScore);
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
                event.segmentation = _classPrivateFieldGet2(_withGlobalContentSegmentation, _this).call(_this, event.segmentation);

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
                _this.presentRatingWidgetWithID(id);
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
            * @param {Object} [feedbackWidgetSegmentation] - Segmentation object to be passed to the feedback widget, which the global content segmentation is added behind (optional)
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
                    url += "?widget_id=" + encodeURIComponent(presentableFeedback._id);
                    url += "&app_key=" + encodeURIComponent(_this.app_key);
                    url += "&device_id=" + encodeURIComponent(_this.device_id);
                    url += "&sdk_name=" + encodeURIComponent(_classPrivateFieldGet2(_sdkName, _this));
                    // the widget pages take a missing platform as their web default, as they did with "undefined"
                    if (_this.platform) {
                        url += "&platform=" + encodeURIComponent(_this.platform);
                    }
                    url += "&app_version=" + encodeURIComponent(_this.app_version);
                    url += "&sdk_version=" + encodeURIComponent(_classPrivateFieldGet2(_sdkVersion, _this));
                    var customObjectToSendWithTheWidget = {};
                    customObjectToSendWithTheWidget.tc = 1; // indicates SDK supports opening links from the widget in a new tab
                    var widgetSegmentation = _classPrivateFieldGet2(_withGlobalContentSegmentation, _this).call(_this, feedbackWidgetSegmentation);
                    if (Object.keys(widgetSegmentation).length) {
                        customObjectToSendWithTheWidget.sg = widgetSegmentation;
                    }
                    var resInfo = _classPrivateFieldGet2(_getResolution, _this).call(_this, true);
                    customObjectToSendWithTheWidget.width = resInfo.width;
                    customObjectToSendWithTheWidget.height = resInfo.height;
                    url += "&custom=" + encodeURIComponent(JSON.stringify(customObjectToSendWithTheWidget));
                    // Origin is passed to the popup so that it passes it back in the postMessage event
                    // Only web SDK passes origin and web
                    url += "&origin=" + encodeURIComponent(passedOrigin);
                    // Pass the path prefix (if any) for reverse proxy scenarios. The server only accepts a
                    // same-origin relative path, so we send just the pathname and omit it when there is none.
                    var providedPath = "";
                    if (_this.url) {
                        providedPath = stripTrailingSlash(parseUrlParts(_this.url).pathname);
                    }
                    if (providedPath) {
                        url += "&provided_url=" + encodeURIComponent(providedPath);
                    }
                    url += "&widget_v=web";
                    url = _classPrivateFieldGet2(_withContentTheme, _this).call(_this, url);
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
             *  Gives the stack of an error with the error's name and message in front, as Chromium-based browsers give it.
             *  Firefox and Safari leave the name and message out of the stack, so a crash report made from the stack alone would lack them.
             *  @param {Object} err - error, or error-like object, with a stack
             *  @returns {String} the stack, starting with the error's name and message when the error has them
             */
            _classPrivateFieldInitSpec(this, _stackWithMessage, function (err) {
                var name = err.name ? err.name + "" : "";
                var message = err.message ? err.message + "" : "";
                var header = name && message ? name + ": " + message : name || message;
                if (header && (err.stack + "").indexOf(header) !== 0) {
                    return header + "\n" + err.stack;
                }
                return err.stack;
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
                            error = _classPrivateFieldGet2(_stackWithMessage, _this).call(_this, err);
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
                    _classPrivateFieldSet2(_contentZoneWanted, _this, false);
                    _classPrivateFieldSet2(_contentZoneExited, _this, true);
                    _classPrivateFieldGet2(_exitContentZoneInternal, _this).call(_this);
                    _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                },
                setGlobalContentSegmentation: function setGlobalContentSegmentation(segmentation) {
                    _classPrivateFieldGet2(_setGlobalContentSegmentation, _this).call(_this, segmentation, "content.setGlobalContentSegmentation");
                },
                setTheme: function setTheme(theme) {
                    _classPrivateFieldGet2(_setContentTheme, _this).call(_this, theme, "content.setTheme");
                }
            });
            /**
             * Keep the segmentation recorded with every content and feedback widget event, in place of the one kept before.
             * Values other than strings, numbers, booleans and lists of those are left out, as are the keys the server and
             * the widget and content pages read on these events, and what is kept is held to the SDK's limits.
             * @param {?Object} segmentation - the segmentation; null or an empty object clears it
             * @param {string} caller - name of the calling method, for the log
             */
            _classPrivateFieldInitSpec(this, _setGlobalContentSegmentation, function (segmentation, caller) {
                if (segmentation === null || segmentation === undefined || _typeof(segmentation) === "object" && !Array.isArray(segmentation) && !Object.keys(segmentation).length) {
                    _classPrivateFieldSet2(_globalContentSegmentation, _this, {});
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, caller + ", Cleared the global content segmentation");
                    return;
                }
                if (_typeof(segmentation) !== "object" || Array.isArray(segmentation)) {
                    _classPrivateFieldSet2(_globalContentSegmentation, _this, {});
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, caller + ", The global content segmentation must be an object, cleared it instead");
                    return;
                }
                var isValue = function isValue(value) {
                    return typeof value === "string" || typeof value === "boolean" || typeof value === "number" && isFinite(value);
                };
                var isReserved = function isReserved(key) {
                    return contentReservedSegmentationKeys.indexOf(key) !== -1 || key.indexOf(contentReservedSegmentationPrefix) === 0;
                };
                var kept = {};
                var reserved = [];
                var unsupported = [];
                Object.keys(segmentation).forEach(function (key) {
                    var value = segmentation[key];
                    // a key over the key length limit is sent cut, which can make it one the server reads
                    if (isReserved(key) || isReserved(key.slice(0, _classPrivateFieldGet2(_SCLimitKeyLength, _this)))) {
                        reserved.push(key);
                    } else if (isValue(value)) {
                        kept[key] = value;
                    } else if (Array.isArray(value)) {
                        var items = value.filter(isValue);
                        if (items.length < value.length) {
                            unsupported.push(key + " (some items)");
                        }
                        kept[key] = items.map(function (item) {
                            return truncateSingleValue(item, _classPrivateFieldGet2(_SCLimitValueSize, _this), caller, _classPrivateFieldGet2(_log, _this));
                        });
                    } else {
                        unsupported.push(key);
                    }
                });
                if (reserved.length) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, caller + ", Left out keys the server and the widget and content pages read on these events: [" + reserved.join(", ") + "]");
                }
                if (unsupported.length) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, caller + ", Left out values that are not a string, number, boolean or a list of those: [" + unsupported.join(", ") + "]");
                }
                _classPrivateFieldSet2(_globalContentSegmentation, _this, truncateObject(kept, _classPrivateFieldGet2(_SCLimitKeyLength, _this), _classPrivateFieldGet2(_SCLimitValueSize, _this), _classPrivateFieldGet2(_SCLimitSegmentationValues, _this), caller, _classPrivateFieldGet2(_log, _this)));
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, caller + ", Global content segmentation set: [" + JSON.stringify(_classPrivateFieldGet2(_globalContentSegmentation, _this)) + "]");
            });
            /**
             * A segmentation with the global content segmentation added after its own keys, which win, so the SDK's
             * segmentation limit drops global keys first.
             * @param {?Object} segmentation - the event's own segmentation
             * @returns {Object} the merged segmentation
             */
            _classPrivateFieldInitSpec(this, _withGlobalContentSegmentation, function (segmentation) {
                var merged = {};
                if (segmentation && _typeof(segmentation) === "object" && !Array.isArray(segmentation)) {
                    Object.keys(segmentation).forEach(function (key) {
                        merged[key] = segmentation[key];
                    });
                }
                Object.keys(_classPrivateFieldGet2(_globalContentSegmentation, _this)).forEach(function (key) {
                    if (!Object.prototype.hasOwnProperty.call(merged, key)) {
                        merged[key] = _classPrivateFieldGet2(_globalContentSegmentation, _this)[key];
                    }
                });
                return merged;
            });
            /**
             * Keep the theme content and feedback widgets are told to show: "dark" or "light", false to tell them none, or
             * null to tell them the page's own.
             * @param {?(string|boolean)} theme - the theme
             * @param {string} caller - name of the calling method, for the log
             */
            _classPrivateFieldInitSpec(this, _setContentTheme, function (theme, caller) {
                if (theme === null || theme === undefined) {
                    _classPrivateFieldSet2(_contentTheme, _this, null);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, caller + ", Content and feedback widgets follow the page's theme");
                    return;
                }
                if (theme !== "dark" && theme !== "light" && theme !== false) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, caller + ", Unknown theme: [" + theme + "], expected \"dark\", \"light\", false or null; keeping " + (_classPrivateFieldGet2(_contentTheme, _this) === null ? "the page's theme" : "[" + _classPrivateFieldGet2(_contentTheme, _this) + "]"));
                    return;
                }
                _classPrivateFieldSet2(_contentTheme, _this, theme);
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, caller + (theme === false ? ", Content and feedback widgets are told no theme" : ", Content and feedback widgets are shown in the [" + theme + "] theme"));
            });
            /**
             * The theme content and feedback widgets are told to show, as their th parameter: the theme set for them, else
             * the color-scheme the page declares, in its CSS or else in its color-scheme meta tag, when it names only one,
             * else the browser's setting; none when it is turned off.
             * @returns {?string} "d" or "l", or null when no theme is known or it is turned off
             */
            _classPrivateFieldInitSpec(this, _currentContentTheme, function () {
                if (_classPrivateFieldGet2(_contentTheme, _this) === false) {
                    return null;
                }
                if (_classPrivateFieldGet2(_contentTheme, _this)) {
                    return _classPrivateFieldGet2(_contentTheme, _this) === "dark" ? "d" : "l";
                }
                try {
                    var schemes = function schemes(value) {
                        return (value || "").split(/[\s,]+/).filter(function (scheme) {
                            return scheme === "dark" || scheme === "light";
                        });
                    };
                    var declared = schemes(window.getComputedStyle(document.documentElement).colorScheme);
                    if (!declared.length) {
                        // the meta tag sets the color-scheme of a page whose CSS sets none, but does not show in the computed style
                        var meta = document.querySelector("meta[name='color-scheme']");
                        declared = schemes(meta && meta.getAttribute("content"));
                    }
                    if (declared.length === 1) {
                        return declared[0] === "dark" ? "d" : "l";
                    }
                    if (typeof window.matchMedia === "function") {
                        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                            return "d";
                        }
                        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                            return "l";
                        }
                    }
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "currentContentTheme, Could not read the page's theme: " + e);
                }
                return null;
            });
            /**
             * A content or widget page URL with the current theme added to its query, before any fragment.
             * @param {string} url - the page URL
             * @returns {string} the URL with th=d or th=l, unchanged when no theme is known
             */
            _classPrivateFieldInitSpec(this, _withContentTheme, function (url) {
                var theme = _classPrivateFieldGet2(_currentContentTheme, _this).call(_this);
                if (!theme || typeof url !== "string") {
                    return url;
                }
                var hashAt = url.indexOf("#");
                var page = hashAt === -1 ? url : url.slice(0, hashAt);
                var hash = hashAt === -1 ? "" : url.slice(hashAt);
                return page + (page.indexOf("?") === -1 ? "?" : "&") + "th=" + theme + hash;
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
                _classPrivateFieldSet2(_contentZoneWanted, _this, true);
                _classPrivateFieldSet2(_contentZoneExited, _this, false);
                if (!_this.check_consent(featureEnums.CONTENT)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.enterContentZone, Content consent is not given, the zone is entered once it is");
                    return;
                }
                if (!_classPrivateFieldGet2(_initTimestamp, _this) || getMsTimestamp() - _classPrivateFieldGet2(_initTimestamp, _this) < 4000) {
                    // settimeout
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "content.enterContentZone, Not enough time passed since initialization");
                    clearTimeout(_classPrivateFieldGet2(_contentZoneEntryTimer, _this));
                    _classPrivateFieldSet2(_contentZoneEntryTimer, _this, setTimeout(function () {
                        _classPrivateFieldSet2(_contentZoneEntryTimer, _this, null);
                        _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                    }, 4001));
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
                _classPrivateFieldSet2(_contentZoneEntryTimer, _this, setTimeout(function () {
                    _classPrivateFieldSet2(_contentZoneEntryTimer, _this, null);
                    _classPrivateFieldGet2(_enterContentZoneInternal, _this).call(_this);
                }, 1000));
            });
            /**
             * Internal method to exit content zone
             * Stops content zone tracking and cleans up timers
             * @private
             */
            _classPrivateFieldInitSpec(this, _exitContentZoneInternal, function () {
                if (_classPrivateFieldGet2(_contentZoneEntryTimer, _this)) {
                    clearTimeout(_classPrivateFieldGet2(_contentZoneEntryTimer, _this));
                    _classPrivateFieldSet2(_contentZoneEntryTimer, _this, null);
                }
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
                var finalizeContentRequest = function finalizeContentRequest(success) {
                    if (typeof callback === "function") {
                        callback(success);
                    }
                };
                if (!_this.check_consent(featureEnums.CONTENT)) {
                    finalizeContentRequest(false);
                    return;
                }
                if (_classPrivateFieldGet2(_contentZoneExited, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendContentRequest, The content zone was exited, no content until it is entered again");
                    finalizeContentRequest(false);
                    return;
                }
                var params = _classPrivateFieldGet2(_prepareContentRequest, _this).call(_this);
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

                    // consent can be removed, or the zone exited, while the request is on its way
                    if (!_this.check_consent(featureEnums.CONTENT)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendContentRequest, Content consent was removed, not showing the content");
                        finalizeContentRequest(false);
                        return;
                    }
                    if (_classPrivateFieldGet2(_contentZoneExited, _this)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendContentRequest, The content zone was exited, not showing the content");
                        finalizeContentRequest(false);
                        return;
                    }
                    _classPrivateFieldGet2(_displayContent, _this).call(_this, response);
                    clearInterval(_classPrivateFieldGet2(_contentZoneTimer, _this)); // prevent multiple content requests while one is on
                    _classPrivateFieldGet2(_removeContentListeners, _this).call(_this);
                    _classPrivateFieldSet2(_contentMessageListener, _this, function (event) {
                        _classPrivateFieldGet2(_interpretContentMessage, _this).call(_this, event);
                    });
                    window.addEventListener('message', _classPrivateFieldGet2(_contentMessageListener, _this));
                    var resizeTimeout;
                    _classPrivateFieldSet2(_contentResizeListener, _this, function () {
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
                    window.addEventListener('resize', _classPrivateFieldGet2(_contentResizeListener, _this));
                    finalizeContentRequest(true);
                }, true);
            });
            _classPrivateFieldInitSpec(this, _displayContent, function (response) {
                try {
                    //   1. rebase html onto dev provided url so the content page loads from the right path
                    //   2. pass the SDK path prefix as provided_url
                    var contentUrl = response.html;
                    if (typeof contentUrl === "string") {
                        var parts = parseUrlParts(contentUrl);
                        var base = parts.origin + parts.pathname;
                        if (_this.url && contentUrl.indexOf(_this.url) !== 0) {
                            base = stripTrailingSlash(_this.url) + parts.pathname;
                        }
                        var search = parts.search;
                        var providedPath = _this.url ? stripTrailingSlash(parseUrlParts(_this.url).pathname) : "";
                        if (providedPath) {
                            // insert into the query (before any #hash); server ignores values with ':' or '//'
                            search += (search ? "&" : "?") + "provided_url=" + encodeURIComponent(providedPath);
                        }
                        contentUrl = _classPrivateFieldGet2(_withContentTheme, _this).call(_this, base + search + parts.hash);
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "displayContent, Content iframe URL:[" + contentUrl + "]");
                    }
                    var iframe = document.createElement("iframe");
                    iframe.id = _classPrivateFieldGet2(_contentIframeID, _this);
                    // always https in the future
                    // response.html = response.html.replace(/http:\/\//g, "https://");
                    iframe.src = contentUrl;
                    iframe.style.position = "absolute";
                    if (contentUrl.indexOf("feedback/survey") != -1) {
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
                // messageEvent.origin is always origin-only (scheme://host[:port]), while whitelist
                // entries (including this.url) may carry a path prefix behind a reverse proxy. Compare
                // by origin so proxied content (served from this.url's origin) is not rejected.
                var isWhitelistedOrigin = Array.isArray(_this.contentWhitelist) && _this.contentWhitelist.some(function (entry) {
                    return parseUrlParts(entry).origin === messageEvent.origin;
                });
                if (!isWhitelistedOrigin) {
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
                    var events = event;
                    if (!Array.isArray(events)) {
                        if (_typeof(events) === "object") {
                            events = [events];
                        } else {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "interpretContentMessage, Invalid event type: [" + _typeof(events) + "]");
                            return;
                        }
                    }
                    // event is expected to be an array of events
                    for (var i = 0; i < events.length; i++) {
                        var contentEvent = events[i];
                        if (contentEvent && _typeof(contentEvent) === "object") {
                            contentEvent.segmentation = _classPrivateFieldGet2(_withGlobalContentSegmentation, _this).call(_this, contentEvent.segmentation);
                        }
                        _classPrivateFieldGet2(_add_cly_events, _this).call(_this, contentEvent); // let this method handle the event
                    }
                }
                if (link && typeof link === "string") {
                    if (close === 1) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Closing content frame for link");
                        _classPrivateFieldGet2(_closeContentFrame, _this).call(_this);
                    }
                    if (!isSafeActionUrl(link)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "interpretContentMessage, Not opening a link with a scheme that is not allowed: [" + link + "]");
                    } else {
                        // noopener keeps the opened page from controlling this one
                        window.open(link, "_blank", "noopener");
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "interpretContentMessage, Opened link in new tab: [".concat(link, "]"));
                    }
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
            /**
             *  Stops listening to the messages and the window size changes for the content that was shown
             */
            _classPrivateFieldInitSpec(this, _removeContentListeners, function () {
                if (_classPrivateFieldGet2(_contentMessageListener, _this)) {
                    window.removeEventListener('message', _classPrivateFieldGet2(_contentMessageListener, _this));
                    _classPrivateFieldSet2(_contentMessageListener, _this, null);
                }
                if (_classPrivateFieldGet2(_contentResizeListener, _this)) {
                    window.removeEventListener('resize', _classPrivateFieldGet2(_contentResizeListener, _this));
                    _classPrivateFieldSet2(_contentResizeListener, _this, null);
                }
            });
            _classPrivateFieldInitSpec(this, _closeContentFrame, function () {
                _classPrivateFieldGet2(_removeContentListeners, _this).call(_this);
                if (!isBrowser) {
                    return;
                }
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
                    _classPrivateFieldGet2(_saveEventQueue, _this).call(_this);
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
                    iframe.src = _classPrivateFieldGet2(_withContentTheme, _this).call(_this, _this.url + "/feedback?widget_id=" + encodeURIComponent(currentWidget._id) + "&app_key=" + encodeURIComponent(_this.app_key) + "&device_id=" + encodeURIComponent(_this.device_id) + "&sdk_version=" + encodeURIComponent(_classPrivateFieldGet2(_sdkVersion, _this)));
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
             *  Report whether this environment can do web push at all.
             *  @memberof Countly._internals
             *  @param {Boolean} needsSubscribe - also require the APIs used to create a subscription
             *  @returns {Boolean} true if web push is usable here
             */
            _classPrivateFieldInitSpec(this, _isPushSupported, function (needsSubscribe) {
                if (!isBrowser || typeof navigator === "undefined") {
                    return false;
                }
                try {
                    // in a sandboxed iframe the property exists, but reading it throws a SecurityError
                    if (!navigator.serviceWorker) {
                        return false;
                    }
                } catch (e) {
                    return false;
                }
                if (!needsSubscribe) {
                    return true;
                }
                return typeof window !== "undefined" && "PushManager" in window && typeof Notification !== "undefined";
            });
            /**
             *  Tell whether this app uses Countly push in this browser: a VAPID key was given at init, or
             *  the SDK registered a token for this app here. The SDK sends messages to a service worker only
             *  while this holds, or right after it stopped holding, to take back the details it handed over.
             *  Withdrawing push consent is the exception: it also drops Countly's subscription under the
             *  default scope for an app that does not use push.
             *  @memberof Countly._internals
             *  @returns {Boolean} true when push is in use for this app key
             */
            _classPrivateFieldInitSpec(this, _isPushConfigured, function () {
                return !!(_this.push_vapid_public_key || _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint));
            });
            /**
             *  Tell whether a scope a service worker put on its message is the one this app's push runs
             *  under.
             *  @memberof Countly._internals
             *  @param {string} scope - the scope the worker sent, an absolute URL
             *  @returns {Boolean} true when it is this app's scope
             */
            _classPrivateFieldInitSpec(this, _isOwnPushScope, function (scope) {
                return _classPrivateFieldGet2(_resolveUrl, _this).call(_this, scope) === _classPrivateFieldGet2(_ownPushScope, _this).call(_this);
            });
            /**
             *  The scope this app's push runs under, as an absolute URL.
             *  @memberof Countly._internals
             *  @returns {string} the resolved scope
             */
            _classPrivateFieldInitSpec(this, _ownPushScope, function () {
                var registration = _classPrivateFieldGet2(_pushRegistration, _this) || _this.push_service_worker_registration;
                var own = registration && registration.scope || _classPrivateFieldGet2(_pushScope, _this).call(_this);
                return _classPrivateFieldGet2(_resolveUrl, _this).call(_this, own);
            });
            /**
             *  Forget the last push subscription this SDK registered. The keys are namespaced by app key,
             *  so they need the storage helper rather than a raw removeItem.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _clearStoredPushSubscription, function () {
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.endpoint);
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.vapidKey);
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.scope);
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.sessionToken);
            });
            /**
             *  Read one entry of what this SDK keeps about push, from storage, or with storage "none" from
             *  this page's memory.
             *  @memberof Countly._internals
             *  @param {string} key - one of pushStorageKeys.endpoint, vapidKey, scope or optOut
             *  @returns {?(string|number)} the value, if any
             */
            _classPrivateFieldInitSpec(this, _getPushRecord, function (key) {
                if (_this.storage === "none") {
                    return _classPrivateFieldGet2(_pushRecordInMemory, _this)[key];
                }
                return _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, key);
            });
            /**
             *  Write one entry of what this SDK keeps about push, to storage, or with storage "none" to this
             *  page's memory.
             *  @memberof Countly._internals
             *  @param {string} key - one of pushStorageKeys.endpoint, vapidKey, scope or optOut
             *  @param {string|number} value - the value to keep
             */
            _classPrivateFieldInitSpec(this, _setPushRecord, function (key, value) {
                if (_this.storage === "none") {
                    _classPrivateFieldGet2(_pushRecordInMemory, _this)[key] = value;
                    return;
                }
                _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, key, value);
            });
            /**
             *  Drop one entry of what this SDK keeps about push, wherever it is kept.
             *  @memberof Countly._internals
             *  @param {string} key - one of pushStorageKeys.endpoint, vapidKey, scope or optOut
             */
            _classPrivateFieldInitSpec(this, _removePushRecord, function (key) {
                delete _classPrivateFieldGet2(_pushRecordInMemory, _this)[key];
                _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, key);
            });
            /**
             *  Tell whether an existing browser subscription is bound to the given application server key.
             *  Prefers the key the browser reports on the subscription itself and falls back to the last
             *  key this SDK stored when the browser does not expose subscription options.
             *  @memberof Countly._internals
             *  @param {PushSubscription} subscription - subscription to inspect
             *  @param {Uint8Array} keyBytes - decoded configured VAPID public key
             *  @param {?string} savedVapidKey - last VAPID key this SDK registered, if any
             *  @param {string} vapidKey - configured VAPID public key, base64-url encoded
             *  @returns {Boolean} true when the subscription can keep being used
             */
            _classPrivateFieldInitSpec(this, _pushSubscriptionUsesKey, function (subscription, keyBytes, savedVapidKey, vapidKey) {
                var reported = subscription.options && subscription.options.applicationServerKey;
                if (!reported) {
                    // no way to compare, so trust our own record and treat an unknown key as usable
                    return !savedVapidKey || savedVapidKey === vapidKey;
                }
                var reportedBytes = new Uint8Array(reported);
                if (reportedBytes.length !== keyBytes.length) {
                    return false;
                }
                for (var i = 0; i < reportedBytes.length; i++) {
                    if (reportedBytes[i] !== keyBytes[i]) {
                        return false;
                    }
                }
                return true;
            });
            /**
             *  Tell whether a browser subscription is Countly's own, judged by its endpoint, its VAPID key
             *  or the private registration it is on.
             *  @memberof Countly._internals
             *  @param {PushSubscription} subscription - subscription to inspect
             *  @param {Boolean} privateRegistration - true when the subscription is on Countly's private registration
             *  @returns {Boolean} true when Countly may unsubscribe or replace it
             */
            _classPrivateFieldInitSpec(this, _isCountlyPushSubscription, function (subscription, privateRegistration) {
                var registeredEndpoint = _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.endpoint);
                if (subscription.endpoint && subscription.endpoint === registeredEndpoint) {
                    return true;
                }
                if (subscription.options && subscription.options.applicationServerKey) {
                    var keys = [_classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.vapidKey), _this.push_vapid_public_key];
                    for (var i = 0; i < keys.length; i++) {
                        var keyBytes = keys[i] ? _classPrivateFieldGet2(_urlBase64ToUint8Array, _this).call(_this, keys[i]) : null;
                        if (keyBytes && _classPrivateFieldGet2(_pushSubscriptionUsesKey, _this).call(_this, subscription, keyBytes, null, keys[i])) {
                            return true;
                        }
                    }
                }
                return privateRegistration === true && !registeredEndpoint;
            });
            /**
             *  Give the browser's part of subscribing a deadline. pushManager.subscribe() has been seen never
             *  settling (iOS 18.7); without a deadline #pushEnableInFlight would hold that dead promise and
             *  hand it to every later enable_push_notifications call until the page is reloaded. On expiry
             *  this attempt resolves with reason "timeout" and the guard is released; should the browser
             *  answer late after all, the chain still registers the token it produced.
             *  @memberof Countly._internals
             *  @param {Promise<Object>} attempt - the subscribe-and-register chain
             *  @param {number} ms - how long to wait
             *  @returns {Promise<Object>} the attempt's result, or { subscribed: false, reason: "timeout" }
             */
            _classPrivateFieldInitSpec(this, _withPushTimeout, function (attempt, ms) {
                return new Promise(function (resolve, reject) {
                    var timer = setTimeout(function () {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "enable_push_notifications, The browser did not finish subscribing within [" + ms + "] ms, giving up on this attempt");
                        resolve({
                            subscribed: false,
                            reason: "timeout"
                        });
                    }, ms);
                    attempt.then(function (result) {
                        clearTimeout(timer);
                        resolve(result);
                    }, function (err) {
                        clearTimeout(timer);
                        reject(err);
                    });
                });
            });
            /**
             *  Ask for notification permission, tolerating the legacy callback-only form of
             *  Notification.requestPermission still shipped by some browsers.
             *  @memberof Countly._internals
             *  @returns {Promise<string>} resolves to "granted", "denied" or "default"
             */
            _classPrivateFieldInitSpec(this, _requestNotificationPermission, function () {
                if (Notification.permission === "granted" || Notification.permission === "denied") {
                    return Promise.resolve(Notification.permission);
                }
                return new Promise(function (resolve) {
                    var pending;
                    try {
                        pending = Notification.requestPermission(resolve);
                    } catch (e) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "requestNotificationPermission, Failed to request notification permission: " + e);
                        resolve("denied");
                        return;
                    }
                    if (pending && typeof pending.then === "function") {
                        pending.then(resolve, function () {
                            return resolve("denied");
                        });
                    }
                });
            });
            /**
             *  Build and queue the web-push token_session request. Pass `null` to register the BLACKLISTED
             *  sentinel (unsubscribe path). The same token is queued for the same device ID once per page
             *  load, or once per session while sessions are tracked automatically.
             *
             *  Android delays this by 10 seconds so begin_session is processed before the token write, but
             *  a page timer is not durable — navigating away inside the window would lose a live
             *  subscription the server never heard about. It is not needed here either: the request queue
             *  is FIFO and sends one request at a time, awaiting each response, so a begin_session queued
             *  earlier is already processed server side before this request goes out.
             *  @memberof Countly._internals
             *  @param {?PushSubscription} subscription - subscription to register, or null to blacklist
             *  @param {string} [vapidKey] - the VAPID public key used to create this subscription
             *  @param {string} [scope] - the service worker scope the subscription was created under
             */
            _classPrivateFieldInitSpec(this, _sendPushToken, function (subscription, vapidKey, scope) {
                var tokenValue = pushConstants.BLACKLISTED_TOKEN;
                if (subscription) {
                    try {
                        tokenValue = JSON.stringify(subscription.toJSON());
                    } catch (e) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "sendPushToken, Failed to serialize subscription: " + e);
                        return;
                    }
                }
                if (subscription && _classPrivateFieldGet2(_isPushTokenSent, _this).call(_this, tokenValue, subscription.endpoint)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendPushToken, This token was already queued for this device ID " + (_classPrivateFieldGet2(_autoSessionTracking, _this) ? "in this session" : "on this page") + ", not queueing it again");
                } else {
                    var req = {
                        token_session: 1,
                        web_token: tokenValue,
                        token_provider: pushConstants.TOKEN_PROVIDER
                    };
                    if (typeof navigator !== "undefined" && navigator.language) {
                        req.locale = navigator.language;
                    }
                    // a silent drop (opted out, tracking off by server config, no app key yet) must not count as registered
                    if (!_classPrivateFieldGet2(_toRequestQueue, _this).call(_this, req)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "sendPushToken, The request queue rejected the token, not recording it as registered");
                        return;
                    }
                    _classPrivateFieldSet2(_lastPushToken, _this, subscription ? {
                        token: tokenValue,
                        deviceId: _this.device_id
                    } : null);
                    if (subscription) {
                        _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.sessionToken, {
                            endpoint: subscription.endpoint,
                            deviceId: _this.device_id
                        });
                    } else {
                        _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.sessionToken);
                    }
                }
                if (subscription) {
                    var inUseBefore = _classPrivateFieldGet2(_isPushConfigured, _this).call(_this);
                    _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.endpoint, subscription.endpoint);
                    if (vapidKey) {
                        _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.vapidKey, vapidKey);
                    }
                    if (scope) {
                        _classPrivateFieldGet2(_setPushRecord, _this).call(_this, pushStorageKeys.scope, scope);
                    }
                    _classPrivateFieldGet2(_syncPushWorkerConfig, _this).call(_this);
                    if (!inUseBefore) {
                        _classPrivateFieldGet2(_announceToPushWorker, _this).call(_this);
                    }
                }
            });
            /**
             *  Whether a token was already queued for the current device ID: on this page, or while
             *  sessions are tracked automatically, in the current session, which pages that continue it
             *  share through storage.
             *  @memberof Countly._internals
             *  @param {string} tokenValue - the serialized subscription
             *  @param {string} endpoint - the subscription's endpoint
             *  @returns {Boolean} true when it need not be queued again
             */
            _classPrivateFieldInitSpec(this, _isPushTokenSent, function (tokenValue, endpoint) {
                if (_classPrivateFieldGet2(_autoSessionTracking, _this)) {
                    var sent = _classPrivateFieldGet2(_getPushRecord, _this).call(_this, pushStorageKeys.sessionToken);
                    return !!sent && sent.endpoint === endpoint && sent.deviceId === _this.device_id;
                }
                var last = _classPrivateFieldGet2(_lastPushToken, _this);
                return !!last && last.token === tokenValue && last.deviceId === _this.device_id;
            });
            /**
             *  Let a new session send the push token again. A page that already sent it registers it again
             *  right away; a page that has not yet sends it with its own registration.
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _renewPushTokenForSession, function () {
                _classPrivateFieldGet2(_removePushRecord, _this).call(_this, pushStorageKeys.sessionToken);
                if (_classPrivateFieldGet2(_autoSessionTracking, _this) && _classPrivateFieldGet2(_lastPushToken, _this)) {
                    _classPrivateFieldGet2(_autoRegisterPush, _this).call(_this, true);
                }
            });
            /**
             *  Decode a base64-url VAPID public key into a Uint8Array, the format Push API expects.
             *  @memberof Countly._internals
             *  @param {string} base64String - base64-url encoded key; surrounding whitespace is ignored
             *  @returns {?Uint8Array} decoded bytes, or null if the input is not valid base64-url
             */
            _classPrivateFieldInitSpec(this, _urlBase64ToUint8Array, function (base64String) {
                var trimmed = String(base64String).trim();
                // atob skips inner whitespace but the padding counts it, so whitespace would decide whether a key decodes
                if (/\s/.test(trimmed)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "urlBase64ToUint8Array, Value is not valid base64-url: it has whitespace inside the key");
                    return null;
                }
                var padding = "=".repeat((4 - trimmed.length % 4) % 4);
                try {
                    return base64ToBytes((trimmed + padding).replace(/-/g, "+").replace(/_/g, "/"));
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "urlBase64ToUint8Array, Value is not valid base64-url: " + e);
                    return null;
                }
            });
            /**
             *  Add request to request queue
             *  @memberof Countly._internals
             *  @param {Object} request - object with request parameters
             *  @returns {Boolean} true if the request was accepted, false if it was dropped. Callers that
             *  record state about a request having been sent must check this, since a drop is otherwise silent.
             */
            _classPrivateFieldInitSpec(this, _toRequestQueue, function (request) {
                if (_this.ignore_visitor) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "User is opt_out will ignore the request: " + request);
                    return false;
                }
                if (!_classPrivateFieldGet2(_SCTrackingAll, _this)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Tracking is disabled by server config, will not track the request: " + JSON.stringify(request));
                    return false;
                }
                if (!_this.app_key || !_this.device_id) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "app_key or device_id is missing ", _this.app_key, _this.device_id);
                    return false;
                }
                _classPrivateFieldGet2(_prepareRequest, _this).call(_this, request);

                // Buffer requests while client hints are still resolving. Counts as accepted: the buffer is
                // flushed into the queue as soon as the hints land.
                if (_classPrivateFieldGet2(_pendingRequestBuffer, _this) !== null) {
                    _classPrivateFieldGet2(_pendingRequestBuffer, _this).push(request);
                    return true;
                }
                if (_classPrivateFieldGet2(_requestQueue, _this).length > _classPrivateFieldGet2(_SCSizeReqQueue, _this)) {
                    _classPrivateFieldGet2(_requestQueue, _this).shift();
                }
                _classPrivateFieldGet2(_requestQueue, _this).push(request);
                _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                if (_classPrivateFieldGet2(_isOrderSensitive, _this).call(_this, request) && !request.old_device_id) {
                    _classPrivateFieldGet2(_announceChange, _this).call(_this);
                }
                _classPrivateFieldGet2(_noteOrderSensitive, _this).call(_this, [request], true);
                return true;
            });
            /**
             *  Making request making and data processing loop
             *  @memberof Countly._internals
             *  @returns {void} void
             */
            _classPrivateFieldInitSpec(this, _heartBeat, function () {
                // a halted instance no longer counts as any instance, so it must not take Countly.q or send anything
                if (_classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
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
                    _classPrivateFieldGet2(_saveEventQueue, _this).call(_this);
                }

                // a quiet SDK that never fills a batch still reports what it gathered
                if (_classPrivateFieldGet2(_SCLogGathering, _this).enabled && _classPrivateFieldGet2(_logBuffer, _this).length > 0 && Date.now() - _classPrivateFieldGet2(_lastLogFlushTime, _this) >= logGatheringDefaultValues.FLUSH_INTERVAL) {
                    _classPrivateFieldGet2(_flushLogBuffer, _this).call(_this);
                }

                // what this tab cannot send waits in the shared storage, where a crash does not take it, until it is in front and may send
                if (_classPrivateFieldGet2(_tabStore, _this)) {
                    _classPrivateFieldGet2(_takeBackWhenSendable, _this).call(_this, true);
                    if (_classPrivateFieldGet2(_cannotSendNow, _this).call(_this) && _classPrivateFieldGet2(_requestQueue, _this).length) {
                        _classPrivateFieldGet2(_leaveUnsentRequests, _this).call(_this);
                    }
                }
                _classPrivateFieldGet2(_flushDeferredRequests, _this).call(_this);

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
                    _classPrivateFieldGet2(_forRequest, _this).call(_this, _classPrivateFieldGet2(_requestQueue, _this)[0], function () {
                        return _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Processing request", _classPrivateFieldGet2(_requestQueue, _this)[0]);
                    });
                    if (!_this.test_mode) {
                        _classPrivateFieldGet2(_sendRequestFromQueue, _this).call(_this, "send_request_queue");
                    }
                }
                setTimeout(function () {
                    _classPrivateFieldGet2(_heartBeat, _this).call(_this);
                }, _classPrivateFieldGet2(_beatInterval, _this));
            });
            /**
             * Check if back-off conditions are met and activate back-off if necessary. The request's timestamp is in
             * milliseconds, its age is compared in seconds.
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
                var requestTimestamp = parameters && parameters.timestamp ? parameters.timestamp : getMsTimestamp();
                var requestAge = Math.round((getMsTimestamp() - requestTimestamp) / 1000);
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
            /**
             *  Whether a merge request has not been sent yet, in the request queue or in the buffer requests wait in for the client hints
             *  @memberof Countly._internals
             *  @returns {Boolean} true while a request with old_device_id is waiting
             */
            _classPrivateFieldInitSpec(this, _mergeRequestUnsent, function () {
                return _classPrivateFieldGet2(_requestQueue, _this).concat(_classPrivateFieldGet2(_pendingRequestBuffer, _this) || []).some(function (request) {
                    return request && request.old_device_id;
                });
            });
            /**
             *  Make the fetches a merged device ID change held back until its merge request was sent: the behavior settings, then remote config
             *  @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _fetchAfterMerge, function () {
                if (_classPrivateFieldGet2(_serverConfigAfterMerge, _this)) {
                    _classPrivateFieldSet2(_serverConfigAfterMerge, _this, false);
                    _classPrivateFieldGet2(_getAndSetServerConfig, _this).call(_this);
                }
                if (_classPrivateFieldGet2(_remoteConfigAfterMerge, _this)) {
                    _classPrivateFieldSet2(_remoteConfigAfterMerge, _this, false);
                    if (_this.remote_config) {
                        _this.fetch_remote_config(_this.remote_config);
                    }
                }
            });
            /**
             *  Whether a request changes how the server treats the requests after it: a profile update, a device ID merge or a
             *  consent change
             *  @param {Object} request - request parameters
             *  @returns {Boolean} true for such a request
             */
            _classPrivateFieldInitSpec(this, _isOrderSensitive, function (request) {
                return !!(request && (request.user_details || request.old_device_id || request.consent));
            });
            /**
             *  Note the newest order-sensitive request among the given ones and start sending the queue up to it
             *  @param {Array} requests - requests that just entered the queue
             *  @param {Boolean} sendNow - false to leave the sending to the heartbeat, which continues it
             */
            _classPrivateFieldInitSpec(this, _noteOrderSensitive, function (requests, sendNow) {
                for (var i = requests.length - 1; i >= 0; i--) {
                    if (_classPrivateFieldGet2(_isOrderSensitive, _this).call(_this, requests[i])) {
                        _classPrivateFieldGet2(_sendUpTo, _this).call(_this, requests[i], sendNow);
                        return;
                    }
                }
            });
            /**
             *  Send the queue right away, without waiting for the heartbeat, until the given request is out
             *  @param {Object} request - request in the queue to send up to
             *  @param {Boolean} sendNow - false to leave the sending to the heartbeat, which continues it
             */
            _classPrivateFieldInitSpec(this, _sendUpTo, function (request, sendNow) {
                // the one further back in the queue is the one to send up to
                if (_classPrivateFieldGet2(_requestQueue, _this).indexOf(request) > _classPrivateFieldGet2(_requestQueue, _this).indexOf(_classPrivateFieldGet2(_sendingUpTo, _this))) {
                    _classPrivateFieldSet2(_sendingUpTo, _this, request);
                }
                if (sendNow) {
                    _classPrivateFieldGet2(_sendNextRightAway, _this).call(_this);
                }
            });
            /**
             *  Send the next request of the queue while it still holds the request noted to send up to, as other tabs send their own
             *  requests meanwhile instead of waiting for this tab's heartbeat
             */
            _classPrivateFieldInitSpec(this, _sendNextRightAway, function () {
                if (_classPrivateFieldGet2(_halted, _this) || _this.test_mode || _this.ignore_visitor) {
                    return;
                }
                if (_classPrivateFieldGet2(_requestQueue, _this).indexOf(_classPrivateFieldGet2(_sendingUpTo, _this)) === -1) {
                    _classPrivateFieldSet2(_sendingUpTo, _this, null);
                    return;
                }
                _classPrivateFieldGet2(_sendRequestFromQueue, _this).call(_this, "send_request_queue");
            });
            /**
             *  Remove a request from the queue once the server accepted it
             *  @param {Object} sent - the request that was sent
             */
            _classPrivateFieldInitSpec(this, _removeSentRequest, function (sent) {
                if (!_classPrivateFieldGet2(_tabStore, _this)) {
                    _classPrivateFieldGet2(_requestQueue, _this).shift();
                    return;
                }
                // requests taken over from other tabs go first, so the queue can change while this one is on its way
                var index = _classPrivateFieldGet2(_requestQueue, _this).indexOf(sent);
                if (index !== -1) {
                    _classPrivateFieldGet2(_requestQueue, _this).splice(index, 1);
                }
            });
            /**
             *  Drop the requests at the front of the queue that are older than the drop old request time (dort, in hours) of the
             *  SDK behavior settings, as each one comes up to be sent, instead of sending them
             */
            _classPrivateFieldInitSpec(this, _dropOldRequests, function () {
                if (!(_classPrivateFieldGet2(_SCDropOldRequestTime, _this) > 0)) {
                    return;
                }
                var oldest = getMsTimestamp() - _classPrivateFieldGet2(_SCDropOldRequestTime, _this) * 60 * 60 * 1000;
                var dropped = 0;
                while (_classPrivateFieldGet2(_requestQueue, _this).length > 0 && _classPrivateFieldGet2(_requestQueue, _this)[0] && _classPrivateFieldGet2(_requestQueue, _this)[0].timestamp < oldest) {
                    _classPrivateFieldGet2(_requestQueue, _this).shift();
                    dropped++;
                }
                if (dropped > 0) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "dropOldRequests, Dropped [" + dropped + "] request(s) older than [" + _classPrivateFieldGet2(_SCDropOldRequestTime, _this) + "] hours");
                    _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                }
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

                    // checked before the queue is marked busy: no answer comes back while networking is off
                    if (!_classPrivateFieldGet2(_SCNetwork, _this)) {
                        resolve(false);
                        return;
                    }
                    if (_classPrivateFieldGet2(_holding, _this).call(_this)) {
                        resolve(false);
                        return;
                    }
                    _classPrivateFieldGet2(_takeBackWhenSendable, _this).call(_this, false);
                    if (_classPrivateFieldGet2(_waitingToRetry, _this)) {
                        resolve(false);
                        return;
                    }
                    _classPrivateFieldGet2(_dropOldRequests, _this).call(_this);
                    if (_classPrivateFieldGet2(_requestQueue, _this).length === 0) {
                        resolve(false);
                        return;
                    }
                    _classPrivateFieldSet2(_readyToProcess, _this, false);
                    var params = _classPrivateFieldGet2(_requestQueue, _this)[0];
                    params.rr = _classPrivateFieldGet2(_requestQueue, _this).length;
                    _classPrivateFieldSet2(_requestOnItsWay, _this, params);
                    _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                    _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, requestName, _this.url + _classPrivateFieldGet2(_apiPath, _this), params, function (err, parameters) {
                        _classPrivateFieldSet2(_requestOnItsWay, _this, null);
                        if (err) {
                            _classPrivateFieldSet2(_failTimeout, _this, getTimestamp() + _classPrivateFieldGet2(_failTimeoutAmount, _this));
                        } else {
                            _classPrivateFieldGet2(_removeSentRequest, _this).call(_this, params);
                            _classPrivateFieldGet2(_checkBackoffConditions, _this).call(_this, parameters);
                            if ((_classPrivateFieldGet2(_serverConfigAfterMerge, _this) || _classPrivateFieldGet2(_remoteConfigAfterMerge, _this)) && !_classPrivateFieldGet2(_mergeRequestUnsent, _this).call(_this)) {
                                _classPrivateFieldGet2(_fetchAfterMerge, _this).call(_this);
                            }
                            _classPrivateFieldGet2(_flushDeferredRequests, _this).call(_this);
                            if (onSuccess) {
                                try {
                                    onSuccess(parameters);
                                } catch (e) {
                                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendRequestFromQueue, onSuccess handler threw");
                                }
                            }
                        }
                        _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                        _classPrivateFieldSet2(_readyToProcess, _this, true);
                        resolve(!err);
                        if (!err) {
                            // a microtask, not a timer: background tabs slow timers down, and a fake handler answers synchronously
                            Promise.resolve().then(_classPrivateFieldGet2(_sendNextRightAway, _this));
                        } else if (_classPrivateFieldGet2(_tabStore, _this) && document.hidden) {
                            // a tab in the background can be closed without any further event, the shared storage keeps what it could not send
                            _classPrivateFieldGet2(_handOver, _this).call(_this);
                        }
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
                var q = Countly.q.splice(0, Countly.q.length);
                // another instance leaves the main instance's calls, unaddressed ones included, for the main instance to run in their order
                var forMainInstance = [];
                for (var i = 0; i < q.length; i++) {
                    var req = q[i];
                    if (!_classPrivateFieldGet2(_global, _this) && !_classPrivateFieldGet2(_isForSecondaryInstance, _this).call(_this, req)) {
                        forMainInstance.push(req);
                        continue;
                    }
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Processing queued calls:" + req);
                    try {
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
                    } catch (error) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "processAsyncQueue, A queued call threw and was skipped: " + error);
                    }
                }
                if (forMainInstance.length > 0) {
                    Countly.q.unshift.apply(Countly.q, forMainInstance);
                }
            });
            /**
             * Tells whether a queued call is addressed by its app key to an instance other than the main one
             * @param {*} req - queued call
             * @returns {Boolean} true when the call names another instance's app key first
             */
            _classPrivateFieldInitSpec(this, _isForSecondaryInstance, function (req) {
                return Array.isArray(req) && typeof req[0] === "string" && req[0] !== Countly.app_key && !!Countly.i[req[0]];
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
             * Basic browser name/version parsing fallback from UA string.
             * @private
             * @param {string} ua - raw user agent string
             * @returns {{name: string|null, version: string|null}}
             */
            _classPrivateFieldInitSpec(this, _getBrowserInfoFromUA, function (ua) {
                if (!ua || typeof ua !== "string") {
                    return {
                        name: null,
                        version: null
                    };
                }
                var patterns = [{
                    name: "Edge",
                    regex: /Edg\/([\d\.]+)/
                }, {
                    name: "Opera",
                    regex: /OPR\/([\d\.]+)/
                }, {
                    name: "Chrome",
                    regex: /Chrome\/([\d\.]+)/
                }, {
                    name: "Firefox",
                    regex: /Firefox\/([\d\.]+)/
                }, {
                    name: "Safari",
                    regex: /Version\/([\d\.]+).*Safari/
                }];
                for (var i = 0; i < patterns.length; i++) {
                    var match = ua.match(patterns[i].regex);
                    if (match && match[1]) {
                        return {
                            name: patterns[i].name,
                            version: match[1]
                        };
                    }
                }
                return {
                    name: null,
                    version: null
                };
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
                if (isBrowser && navigator.userAgentData && navigator.userAgentData.platform) {
                    metrics._os = metrics._os || navigator.userAgentData.platform;
                }
                var detectedDeviceType = userAgentDeviceDetection();
                if (detectedDeviceType === "phone") {
                    detectedDeviceType = "mobile";
                }
                metrics._device_type = metrics._device_type || detectedDeviceType;
                if (_classPrivateFieldGet2(_uaClientHints, _this) && _typeof(_classPrivateFieldGet2(_uaClientHints, _this)) === "object") {
                    if (_classPrivateFieldGet2(_uaClientHints, _this).platform) {
                        metrics._os = metrics._os || _classPrivateFieldGet2(_uaClientHints, _this).platform;
                    }
                    var osVersionFromHints = _classPrivateFieldGet2(_uaClientHints, _this).windowsVersion || _classPrivateFieldGet2(_uaClientHints, _this).platformVersion;
                    if (osVersionFromHints) {
                        metrics._os_version = metrics._os_version || osVersionFromHints;
                    }
                    if (_classPrivateFieldGet2(_uaClientHints, _this).model) {
                        metrics._device = metrics._device || _classPrivateFieldGet2(_uaClientHints, _this).model;
                    }
                    if (_classPrivateFieldGet2(_uaClientHints, _this).browserName) {
                        metrics._browser = metrics._browser || _classPrivateFieldGet2(_uaClientHints, _this).browserName;
                    }
                    if (_classPrivateFieldGet2(_uaClientHints, _this).browserVersion) {
                        metrics._browser_version = metrics._browser_version || _classPrivateFieldGet2(_uaClientHints, _this).browserVersion;
                    }
                    if (_classPrivateFieldGet2(_uaClientHints, _this).windowsVersion) {
                        metrics._os = metrics._os || "Windows";
                        metrics._os_version = metrics._os_version || _classPrivateFieldGet2(_uaClientHints, _this).windowsVersion;
                    }
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, metrics enriched from hints:[" + JSON.stringify({
                        _os: metrics._os,
                        _os_version: metrics._os_version,
                        _device: metrics._device,
                        _device_type: metrics._device_type,
                        _browser: metrics._browser,
                        _browser_version: metrics._browser_version
                    }) + "]");
                } else {
                    if (_classPrivateFieldGet2(_uaClientHintsStatus, _this) === "pending") {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, high-entropy hints are still pending, using fallback metrics for now");
                    } else {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "ua_logic, no high-entropy hints available, using UA fallback parsing");
                    }
                }
                if (!metrics._browser || !metrics._browser_version) {
                    var browserInfo = _classPrivateFieldGet2(_getBrowserInfoFromUA, _this).call(_this, metrics._ua);
                    metrics._browser = metrics._browser || browserInfo.name;
                    metrics._browser_version = metrics._browser_version || browserInfo.version;
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
                // the resolution metric is in device pixels like the iOS SDK's; content is placed in CSS pixels
                if (iOS && window.devicePixelRatio && !getViewPort) {
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
             *  Print a log line to the console when debug is on, and gather it when log gathering wants it and its consent is given
             * @param {string} level - log level (error, warning, info, debug, verbose)
             * @param {string} message - any string message
             * @param {*} [third] - optional value appended to the message, serialized when it is an object
             * @memberof Countly._internals
             */
            _classPrivateFieldInitSpec(this, _log, function (level, message, third) {
                if (level === logLevelEnums.ERROR) {
                    _classPrivateFieldGet2(_HealthCheck, _this).incrementErrorCount();
                } else if (level === logLevelEnums.WARNING) {
                    _classPrivateFieldGet2(_HealthCheck, _this).incrementWarningCount();
                }
                var shouldPrint = _this.debug && typeof console !== "undefined";
                var levelChar = logLevelToWireChar[level] || "d";
                var shouldCapture = _classPrivateFieldGet2(_logLineWanted, _this).call(_this, levelChar);
                if (!shouldPrint && !shouldCapture) {
                    return;
                }
                // parse the arguments into a string if it is an object
                if (third && _typeof(third) === "object") {
                    try {
                        third = JSON.stringify(third);
                    } catch (ex) {
                        third = "[unserializable]";
                    }
                }
                // append app_key to the start of the message if it is not the first instance (for multi instancing)
                if (!_classPrivateFieldGet2(_global, _this)) {
                    message = "[" + _this.app_key + "] " + message;
                }
                // if the provided level is not a proper log level re-assign it as [DEBUG]
                if (!level) {
                    level = logLevelEnums.DEBUG;
                }
                var body = "[Countly] " + message + (third ? " " + third : "");
                // the gathered line carries its level in its own field, so the prefix is left off
                if (shouldCapture) {
                    _classPrivateFieldGet2(_captureLogLine, _this).call(_this, levelChar, body, _classPrivateFieldGet2(_logLineConsent, _this).call(_this, message));
                }
                if (shouldPrint) {
                    // eslint-disable-next-line no-shadow
                    var log = level + body;
                    // decide on the console
                    if (level === logLevelEnums.ERROR) {
                        // eslint-disable-next-line no-console
                        console.error(log);
                    } else if (level === logLevelEnums.WARNING) {
                        // eslint-disable-next-line no-console
                        console.warn(log);
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
             * Tells whether a log line of the given level would be gathered right now.
             * Every level is wanted while the server has not decided yet, so the init lines exist when a
             * directive adopts them; lines produced while a log batch is being enqueued or sent are never
             * wanted, or every batch would describe the previous one.
             * @param {String} levelChar - wire character of the line's level
             * @returns {Boolean} true when the line should be captured
             */
            _classPrivateFieldInitSpec(this, _logLineWanted, function (levelChar) {
                if (_classPrivateFieldGet2(_logCaptureInProgress, _this) || _classPrivateFieldGet2(_logTransportInProgress, _this)) {
                    return false;
                }
                var state = _classPrivateFieldGet2(_SCLogGathering, _this);
                if (!state.decided) {
                    return true;
                }
                return state.enabled && state.levels.indexOf(levelChar) !== -1;
            });
            /**
             * The consent a log line needs to be gathered: that of the method it comes from (logLineConsent).
             * @param {String} message - the message as passed to #log
             * @returns {?String} the feature name, or null for a line of no known method, which needs both "events" and "users" consent
             */
            _classPrivateFieldInitSpec(this, _logLineConsent, function (message) {
                var text = message + "";
                var end = text.charAt(0) === "[" ? text.indexOf("]") + 1 : text.indexOf(",");
                var method = end > 0 ? text.substring(0, end) : "";
                return Object.prototype.hasOwnProperty.call(logLineConsent, method) ? logLineConsent[method] : null;
            });
            /**
             * Tells whether a log line needing the given consent may be gathered now.
             * @param {?String} need - what #logLineConsent returned for the line
             * @returns {Boolean} true when consent is not required or is given
             */
            _classPrivateFieldInitSpec(this, _logConsentGiven, function (need) {
                if (!_classPrivateFieldGet2(_SCEnableConsentRequired, _this)) {
                    return true;
                }
                return need ? _classPrivateFieldGet2(_hasConsent, _this).call(_this, need) : _classPrivateFieldGet2(_hasConsent, _this).call(_this, featureEnums.EVENTS) && _classPrivateFieldGet2(_hasConsent, _this).call(_this, featureEnums.USERS);
            });
            /**
             * Tells whether consent is given for a feature, without the log line check_consent writes. Before the consents are
             * read at start-up, as for a log line the constructor writes, no consent is given.
             * @param {String} feature - name of the feature
             * @returns {Boolean} true when consent is given
             */
            _classPrivateFieldInitSpec(this, _hasConsent, function (feature) {
                return !!(_classPrivateFieldGet2(_consents, _this) && _classPrivateFieldGet2(_consents, _this)[feature] && _classPrivateFieldGet2(_consents, _this)[feature].optin);
            });
            /**
             * Runs fn with log capture paused when the request carries a log batch, so the lines that
             * describe uploading gathered logs are never gathered themselves.
             * @param {Object} params - request parameters
             * @param {Function} fn - work to run
             * @returns {*} whatever fn returns
             */
            _classPrivateFieldInitSpec(this, _forRequest, function (params, fn) {
                return _classPrivateFieldGet2(_withoutLogCapture, _this).call(_this, !!(params && params.sdk_logs), fn);
            });
            /**
             * Runs fn without gathering the log lines it produces when pause is true.
             * @param {Boolean} pause - true to pause log capture while fn runs
             * @param {Function} fn - work to run
             * @returns {*} whatever fn returns
             */
            _classPrivateFieldInitSpec(this, _withoutLogCapture, function (pause, fn) {
                if (!pause) {
                    return fn();
                }
                var paused = _classPrivateFieldGet2(_logTransportInProgress, _this);
                _classPrivateFieldSet2(_logTransportInProgress, _this, true);
                try {
                    return fn();
                } finally {
                    _classPrivateFieldSet2(_logTransportInProgress, _this, paused);
                }
            });
            /**
             * Puts log gathering back to its initial state and drops everything gathered.
             * @param {Boolean} decided - true when no directive is expected any more, false to capture speculatively until the server answers
             */
            _classPrivateFieldInitSpec(this, _resetLogGathering, function (decided) {
                _classPrivateFieldSet2(_SCLogGathering, _this, {
                    enabled: false,
                    decided: decided,
                    gatherId: null,
                    levels: logGatheringDefaultValues.ALLOWED_LEVELS,
                    batchSize: logGatheringDefaultValues.BATCH_SIZE
                });
                _classPrivateFieldSet2(_logBuffer, _this, []);
                _classPrivateFieldSet2(_logHeld, _this, []);
                _classPrivateFieldSet2(_logBufferDropped, _this, 0);
                _classPrivateFieldSet2(_logCaptureInProgress, _this, false);
                _classPrivateFieldSet2(_logTransportInProgress, _this, false);
                _classPrivateFieldSet2(_lastLogFlushTime, _this, Date.now());
            });
            /**
             * Drops every gathered line, the lines held for consent and the drop count, logging how many went.
             * @param {String} reason - why the lines are dropped, for the log line
             */
            _classPrivateFieldInitSpec(this, _dropLogBuffer, function (reason) {
                var count = _classPrivateFieldGet2(_logBuffer, _this).length + _classPrivateFieldGet2(_logHeld, _this).length;
                _classPrivateFieldSet2(_logBuffer, _this, []);
                _classPrivateFieldSet2(_logHeld, _this, []);
                _classPrivateFieldSet2(_logBufferDropped, _this, 0);
                if (count > 0) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "dropLogBuffer, " + reason + ", discarding [" + count + "] gathered lines");
                }
            });
            /**
             * Settles the provisional window as "not gathered" when it is certain no directive is coming.
             * @param {String} reason - why the window closed, for the log line
             */
            _classPrivateFieldInitSpec(this, _resolveProvisionalLogs, function (reason) {
                if (_classPrivateFieldGet2(_SCLogGathering, _this).decided) {
                    return;
                }
                _classPrivateFieldGet2(_SCLogGathering, _this).decided = true;
                _classPrivateFieldGet2(_dropLogBuffer, _this).call(_this, reason);
            });
            /**
             * Apply the operator driven internal log gathering configuration ('lg' key of a live server config response).
             * Starts gathering, drops lines that belong to another gather id and flushes the tail once when gathering is switched off.
             * @param {Object} lg - log gathering object of the server config, absent when the server is not gathering this device
             */
            _classPrivateFieldInitSpec(this, _applyLogGatheringConfig, function (lg) {
                var previousState = _classPrivateFieldGet2(_SCLogGathering, _this);
                if (typeof lg === "undefined" || lg === null) {
                    lg = {
                        e: false
                    };
                }
                if (_typeof(lg) !== "object" || Array.isArray(lg)) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "applyLogGatheringConfig, Ignoring malformed log gathering configuration");
                    return;
                }
                var enabled = lg.e === true;
                var receivedId = typeof lg.i === "string" && lg.i.length > 0 ? lg.i : null;
                var levels = logGatheringDefaultValues.ALLOWED_LEVELS;
                if (typeof lg.l === "string") {
                    levels = "";
                    for (var lvl = 0; lvl < lg.l.length; lvl++) {
                        if (logGatheringDefaultValues.ALLOWED_LEVELS.indexOf(lg.l[lvl]) !== -1 && levels.indexOf(lg.l[lvl]) === -1) {
                            levels += lg.l[lvl];
                        }
                    }
                    // a level string with nothing usable would arm a gather that captures nothing
                    if (levels.length === 0) {
                        levels = logGatheringDefaultValues.ALLOWED_LEVELS;
                    }
                }
                var batchSize = logGatheringDefaultValues.BATCH_SIZE;
                if (typeof lg.b === "number" && isFinite(lg.b) && lg.b > 0) {
                    batchSize = Math.min(Math.max(Math.floor(lg.b), logGatheringDefaultValues.MIN_BATCH_SIZE), logGatheringDefaultValues.MAX_BUFFERED_LINES);
                }
                if (enabled && !receivedId) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "applyLogGatheringConfig, Log gathering was enabled without a gather id, will not gather");
                    enabled = false;
                }
                var idChanged = !!receivedId && receivedId !== previousState.gatherId;
                var wasUndecided = !previousState.decided;
                _classPrivateFieldSet2(_SCLogGathering, _this, {
                    enabled: enabled,
                    decided: true,
                    // a stop carries no id, keep the old one so the tail can still be attributed
                    gatherId: receivedId || previousState.gatherId,
                    levels: levels,
                    batchSize: batchSize
                });
                if (wasUndecided) {
                    if (enabled) {
                        // provisional lines were captured at every level, apply the filter now that it is known
                        var kept = _classPrivateFieldGet2(_logBuffer, _this).filter(function (line) {
                            return levels.indexOf(line.l) !== -1;
                        });
                        _classPrivateFieldSet2(_logBuffer, _this, kept);
                        _classPrivateFieldSet2(_logHeld, _this, _classPrivateFieldGet2(_logHeld, _this).filter(function (held) {
                            return levels.indexOf(held.line.l) !== -1;
                        }));
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "applyLogGatheringConfig, Adopting [" + kept.length + "] lines captured before the directive arrived, including init, and holding [" + _classPrivateFieldGet2(_logHeld, _this).length + "] until their consent is given");
                    } else {
                        _classPrivateFieldGet2(_dropLogBuffer, _this).call(_this, "not gathered");
                    }
                } else if (idChanged) {
                    _classPrivateFieldGet2(_dropLogBuffer, _this).call(_this, "gathered for the previous gather id");
                }
                if (enabled && (!previousState.enabled || idChanged)) {
                    _classPrivateFieldSet2(_lastLogFlushTime, _this, Date.now());
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "applyLogGatheringConfig, Log gathering started for id:[" + _classPrivateFieldGet2(_SCLogGathering, _this).gatherId + "], levels:[" + levels + "], batch size:[" + batchSize + "]");
                } else if (!enabled && previousState.enabled) {
                    // the server accepts one tail batch after a stop
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "applyLogGatheringConfig, Log gathering stopped, flushing the gathered lines");
                    _classPrivateFieldSet2(_logHeld, _this, []);
                    _classPrivateFieldGet2(_flushLogBuffer, _this).call(_this);
                }
            });
            /**
             * Buffer a single formatted log line for the ongoing gather, or hold it in memory until its consent is given.
             * The caller has already checked that the line is wanted.
             * @param {String} levelChar - wire character of the line's level
             * @param {String} message - the fully formatted log line
             * @param {?String} need - the consent the line needs, as #logLineConsent returns it
             */
            _classPrivateFieldInitSpec(this, _captureLogLine, function (levelChar, message, need) {
                var line = message;
                if (message.length > logGatheringDefaultValues.MAX_MESSAGE_LENGTH) {
                    // a copy, so the buffered line does not keep the whole original string alive
                    line = (" " + message.substring(0, logGatheringDefaultValues.MAX_MESSAGE_LENGTH)).slice(1);
                }
                // not getMsTimestamp, it mutates the shared unique timestamp counter
                var entry = {
                    t: Date.now(),
                    l: levelChar,
                    m: line
                };
                if (!_classPrivateFieldGet2(_logConsentGiven, _this).call(_this, need)) {
                    _classPrivateFieldGet2(_logHeld, _this).push({
                        line: entry,
                        need: need
                    });
                    if (_classPrivateFieldGet2(_logHeld, _this).length > logGatheringDefaultValues.MAX_BUFFERED_LINES) {
                        _classPrivateFieldGet2(_logHeld, _this).shift();
                    }
                    return;
                }
                _classPrivateFieldGet2(_logBuffer, _this).push(entry);
                _classPrivateFieldGet2(_settleLogBuffer, _this).call(_this);
            });
            /**
             * Gather the held lines whose consent is given by now, in time order with the lines already buffered.
             */
            _classPrivateFieldInitSpec(this, _releaseHeldLogLines, function () {
                if (!_classPrivateFieldGet2(_logHeld, _this) || _classPrivateFieldGet2(_logHeld, _this).length === 0) {
                    return;
                }
                var released = [];
                _classPrivateFieldSet2(_logHeld, _this, _classPrivateFieldGet2(_logHeld, _this).filter(function (held) {
                    if (_classPrivateFieldGet2(_logConsentGiven, _this).call(_this, held.need)) {
                        released.push(held.line);
                        return false;
                    }
                    return true;
                }));
                if (released.length > 0) {
                    _classPrivateFieldSet2(_logBuffer, _this, _classPrivateFieldGet2(_logBuffer, _this).concat(released).sort(function (a, b) {
                        return a.t - b.t;
                    }));
                    _classPrivateFieldGet2(_settleLogBuffer, _this).call(_this);
                }
            });
            /**
             * Drop the oldest buffered lines beyond the buffer cap, counting the loss, and move full batches into the request queue.
             */
            _classPrivateFieldInitSpec(this, _settleLogBuffer, function () {
                var buffer = _classPrivateFieldGet2(_logBuffer, _this);
                // the oldest lines go and the loss travels with the next batch as its drop count
                if (buffer.length > logGatheringDefaultValues.MAX_BUFFERED_LINES) {
                    var overflow = buffer.length - logGatheringDefaultValues.MAX_BUFFERED_LINES;
                    buffer.splice(0, overflow);
                    _classPrivateFieldSet2(_logBufferDropped, _this, _classPrivateFieldGet2(_logBufferDropped, _this) + overflow);
                }
                // provisional lines have no gather id to be attributed to yet, so they wait, and so do lines while the SDK stands in for another user
                while (!_classPrivateFieldGet2(_standingInForAnotherUser, _this) && _classPrivateFieldGet2(_SCLogGathering, _this).decided && _classPrivateFieldGet2(_logBuffer, _this).length >= _classPrivateFieldGet2(_SCLogGathering, _this).batchSize) {
                    var before = _classPrivateFieldGet2(_logBuffer, _this).length;
                    _classPrivateFieldGet2(_flushLogBuffer, _this).call(_this);
                    if (_classPrivateFieldGet2(_logBuffer, _this).length >= before) {
                        break;
                    }
                }
            });
            /**
             * Move one batch of gathered log lines into the request queue. A batch the queue refuses goes back to the front of the buffer.
             */
            _classPrivateFieldInitSpec(this, _flushLogBuffer, function () {
                var state = _classPrivateFieldGet2(_SCLogGathering, _this);
                var buffer = _classPrivateFieldGet2(_logBuffer, _this);
                if (!state.decided || !state.gatherId || buffer.length === 0) {
                    return;
                }
                _classPrivateFieldSet2(_logCaptureInProgress, _this, true);
                try {
                    var batch = buffer.splice(0, state.batchSize);
                    var dropped = _classPrivateFieldGet2(_logBufferDropped, _this);
                    _classPrivateFieldSet2(_logBufferDropped, _this, 0);
                    _classPrivateFieldSet2(_lastLogFlushTime, _this, Date.now());
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.INFO, "flushLogBuffer, Sending [" + batch.length + "] gathered log lines, [" + buffer.length + "] still buffered, [" + dropped + "] dropped");
                    if (!_classPrivateFieldGet2(_toRequestQueue, _this).call(_this, {
                        sdk_logs: JSON.stringify({
                            i: state.gatherId,
                            d: dropped,
                            l: batch
                        })
                    })) {
                        buffer.unshift.apply(buffer, _toConsumableArray(batch));
                        _classPrivateFieldSet2(_logBufferDropped, _this, _classPrivateFieldGet2(_logBufferDropped, _this) + dropped);
                    }
                } finally {
                    _classPrivateFieldSet2(_logCaptureInProgress, _this, false);
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
                return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
                    // a visitor ignored at init has no device ID, and the server would store "undefined" as a user
                    if (params && Object.prototype.hasOwnProperty.call(params, "device_id") && (typeof params.device_id === "undefined" || params.device_id === null || params.device_id === "")) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, functionName + " Not sending a request without a device ID");
                        if (typeof callback === "function") {
                            callback(true, params);
                        }
                        return;
                    }
                    if (!_classPrivateFieldGet2(_SCNetwork, _this) && !forced) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Network request is disabled by the SCNetwork");
                        return;
                    }
                    if (_classPrivateFieldGet2(_mustWaitForQueue, _this).call(_this, functionName, params)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, functionName + " Waits until the device ID change is sent");
                        _classPrivateFieldGet2(_deferredRequests, _this).push([functionName, url, params, callback, useBroadResponseValidator, forced]);
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
                // a browser reports a timed out request both as done and as timed out, the caller hears of it once
                var answered = false;
                var answer = function answer() {
                    if (!answered && typeof callback === "function") {
                        answered = true;
                        callback.apply(void 0, arguments);
                    }
                };
                try {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "Sending XML HTTP request");
                    var xhr = new XMLHttpRequest();
                    xhr.ontimeout = function () {
                        return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " timed out after 30 seconds");
                            answer(true, params, 'timeout');
                        });
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
                    (isImage ? prepareFormFields(paramSource, _this.salt) : prepareParams(paramSource, _this.salt)).then(function (saltedData) {
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
                            return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
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
                                        answer(false, params, xhr.responseText);
                                    } else {
                                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Invalid response from server");
                                        _classPrivateFieldGet2(_HealthCheck, _this).saveRequestCounters(xhr.status, xhr.responseText);
                                        answer(true, params, xhr.status, xhr.responseText);
                                    }
                                }
                            });
                        };
                        if (isImage) {
                            var formData = _classPrivateFieldGet2(_prepareImageUploadFormData, _this).call(_this, params, saltedData);
                            if (!formData) {
                                answer(true, params, 'invalid_formdata');
                                return;
                            }
                            xhr.send(formData);
                        } else if (method === "GET") {
                            xhr.send();
                        } else {
                            xhr.send(saltedData);
                        }
                    })["catch"](function (err) {
                        return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
                            _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Could not make the XML HTTP request: " + err);
                            answer(true, params);
                        });
                    });
                } catch (e) {
                    // fallback
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, functionName + " Something went wrong while making an XML HTTP request: " + e);
                    answer(true, params);
                }
            });
            _classPrivateFieldInitSpec(this, _createBlobFromBase, function (base64Data, mimeType) {
                if (!base64Data) {
                    return null;
                }
                try {
                    var bytes = base64ToBytes(base64Data);
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
                } catch (error) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.ERROR, "createBlobFromBase64 failed: " + error);
                }
                return null;
            });
            /**
             *  Builds the multipart body of an image upload
             *  @param {Object} params - request params holding the image
             *  @param {Array} fields - [key, value] pairs of the other fields, from prepareFormFields
             *  @returns {FormData|null} the body, or null when the image can not be read
             */
            _classPrivateFieldInitSpec(this, _prepareImageUploadFormData, function (params, fields) {
                if (!params || !params.imageData) {
                    return null;
                }
                var blob = _classPrivateFieldGet2(_createBlobFromBase, _this).call(_this, params.imageData, params.imageType);
                if (!blob || typeof FormData === 'undefined') {
                    return null;
                }
                var fd = new FormData();
                fd.append('user_details[picture]', blob, params.imageName || 'avatar');
                for (var i = 0; i < (fields || []).length; i++) {
                    fd.append(fields[i][0], fields[i][1]);
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
                    (isImage ? prepareFormFields(paramSource, _this.salt) : prepareParams(paramSource, _this.salt)).then(function (saltedData) {
                        if (isImage) {
                            method = "POST";
                        } else if (_this.force_post || saltedData.length >= 2000) {
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
                            return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
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
                                    _classPrivateFieldGet2(_HealthCheck, _this).saveRequestCounters(response.status, data);
                                    if (typeof callback === "function") {
                                        callback(true, params, response.status, data);
                                    }
                                }
                            });
                        })["catch"](function (error) {
                            return _classPrivateFieldGet2(_forRequest, _this).call(_this, params, function () {
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
                        var raw = cookie.substring(cookieID.length, cookie.length);
                        // only values written with the prefix are encoded; any other value, also one written by an earlier version, is read as it is
                        if (raw.indexOf(_classPrivateFieldGet2(_encodedCookiePrefix, _this)) !== 0) {
                            return raw;
                        }
                        try {
                            return decodeURIComponent(raw.substring(_classPrivateFieldGet2(_encodedCookiePrefix, _this).length));
                        } catch (e) {
                            return raw;
                        }
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
                var value = String(cookieVal);
                // a value is written as earlier versions wrote it, so they can still read it, unless a cookie cannot carry it as it is
                // eslint-disable-next-line no-control-regex
                if (/[;\u0000-\u001f\u007f]|^\s|\s$/.test(value) || value.indexOf(_classPrivateFieldGet2(_encodedCookiePrefix, _this)) === 0) {
                    value = _classPrivateFieldGet2(_encodedCookiePrefix, _this) + encodeURIComponent(value);
                }
                document.cookie = cookieKey + "=" + value + expires + "; path=/";
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
             *  The storage key of a value of this instance, with its app key and namespace
             *  @param {String} key - key of the value
             *  @returns {String} the prefixed key
             */
            _classPrivateFieldInitSpec(this, _storageKey, function (key) {
                var prefixed = _this.app_key + "/" + key;
                return _this.namespace ? stripTrailingSlash(_this.namespace) + "/" + prefixed : prefixed;
            });
            /**
             *  Whether this page can keep its queues in its own tab's storage: a browser page with sessionStorage, neither with
             *  storage "none" nor with a storage object of the developer's
             *  @returns {Boolean} true when the queues can be kept per tab
             */
            _classPrivateFieldInitSpec(this, _canUseTabStore, function () {
                if (!isBrowser || _this.storage === "none" || _typeof(_this.storage) === "object") {
                    return false;
                }
                try {
                    window.sessionStorage.setItem("cly_tab_check", "1");
                    window.sessionStorage.removeItem("cly_tab_check");
                    return true;
                } catch (e) {
                    return false;
                }
            });
            /**
             *  Read a value this tab keeps in its own storage
             *  @param {String} key - key of the value
             *  @returns {Varies} the stored value, or undefined
             */
            _classPrivateFieldInitSpec(this, _getTabValue, function (key) {
                try {
                    return _this.deserialize(window.sessionStorage.getItem(_classPrivateFieldGet2(_storageKey, _this).call(_this, key)));
                } catch (e) {
                    return undefined;
                }
            });
            /**
             *  Keep a value in this tab's own storage
             *  @param {String} key - key of the value
             *  @param {Varies} value - value to keep
             */
            _classPrivateFieldInitSpec(this, _setTabValue, function (key, value) {
                try {
                    window.sessionStorage.setItem(_classPrivateFieldGet2(_storageKey, _this).call(_this, key), _this.serialize(value));
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "setTabValue, Could not keep [" + key + "] in this tab's storage: " + e);
                }
            });
            /**
             *  Save the request queue: in this tab's own storage, or in localStorage where there is none
             */
            _classPrivateFieldInitSpec(this, _saveRequestQueue, function () {
                if (_classPrivateFieldGet2(_tabStore, _this)) {
                    _classPrivateFieldGet2(_setTabValue, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this));
                } else {
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_queue", _classPrivateFieldGet2(_requestQueue, _this), true);
                }
            });
            /**
             *  Save the event queue: in this tab's own storage, or where the storage setting puts it where there is none
             */
            _classPrivateFieldInitSpec(this, _saveEventQueue, function () {
                if (_classPrivateFieldGet2(_tabStore, _this)) {
                    _classPrivateFieldGet2(_setTabValue, _this).call(_this, "cly_event", _classPrivateFieldGet2(_eventQueue, _this));
                } else {
                    _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, "cly_event", _classPrivateFieldGet2(_eventQueue, _this));
                }
            });
            /**
             *  Leave this tab's unsent events and requests in the shared storage when its page is left, or when it cannot send
             *  them while in the background, for the tab in front or the next page to send
             */
            _classPrivateFieldInitSpec(this, _handOver, function () {
                if (!_classPrivateFieldGet2(_tabStore, _this) || _classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                _classPrivateFieldGet2(_flushPendingRequestBuffer, _this).call(_this);
                _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                _classPrivateFieldGet2(_leaveUnsentRequests, _this).call(_this);
            });
            /**
             *  Move this tab's unsent requests into the shared storage, where they outlast the tab, for the tab in front or the
             *  next page to send; until this tab takes them back it sends nothing of its own, which would overtake them
             *  @param {Boolean} [forChangingTab] - true when they are left for a tab changing the device ID or the profile, which
             *  takes them, so this tab does not wait to take them back
             */
            _classPrivateFieldInitSpec(this, _leaveUnsentRequests, function (forChangingTab) {
                // a request on its way has almost always reached the server already, handing it over would send it twice
                var unsent = _classPrivateFieldGet2(_requestQueue, _this).filter(function (request) {
                    return request !== _classPrivateFieldGet2(_requestOnItsWay, _this);
                });
                if (unsent.length) {
                    var waiting = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_queue", true);
                    var list = (Array.isArray(waiting) ? waiting : []).concat(unsent);
                    if (list.length > _classPrivateFieldGet2(_SCSizeReqQueue, _this)) {
                        list = list.slice(-_classPrivateFieldGet2(_SCSizeReqQueue, _this));
                    }
                    try {
                        window.localStorage.setItem(_classPrivateFieldGet2(_storageKey, _this).call(_this, "cly_queue"), _this.serialize(list));
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "leaveUnsentRequests, Left [" + unsent.length + "] unsent request(s) for the tab in front or the next page");
                        unsent = [];
                        if (!forChangingTab) {
                            _classPrivateFieldSet2(_waitingToRetry, _this, true);
                        }
                    } catch (e) {
                        // with nowhere to leave them they stay in this tab's storage, for its next page
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "leaveUnsentRequests, Could not leave the unsent requests for other tabs: " + e);
                    }
                }
                _classPrivateFieldSet2(_requestQueue, _this, unsent);
                _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
            });
            /**
             *  Send everything this tab holds when it is left for another tab or app: the browser slows a tab in the background
             *  down, and a phone can close it without any further event
             */
            _classPrivateFieldInitSpec(this, _sendWhenLeft, function () {
                if (_classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                if (_classPrivateFieldGet2(_global, _this) && typeof Countly.q !== "undefined" && Countly.q.length > 0) {
                    _classPrivateFieldGet2(_processAsyncQueue, _this).call(_this);
                }
                if (!_this.test_mode_eq) {
                    _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                }
                if (!_classPrivateFieldGet2(_requestQueue, _this).length) {
                    return;
                }
                if (_classPrivateFieldGet2(_cannotSendNow, _this).call(_this)) {
                    _classPrivateFieldGet2(_handOver, _this).call(_this);
                    return;
                }
                _classPrivateFieldGet2(_sendUpTo, _this).call(_this, _classPrivateFieldGet2(_requestQueue, _this)[_classPrivateFieldGet2(_requestQueue, _this).length - 1], true);
            });
            /**
             *  Whether this tab cannot send for now: its last send failed, as without a connection, it is in offline mode, or what
             *  it left in the shared storage waits to be taken back first
             *  @returns {Boolean} true while sending is held back for one of these reasons
             */
            _classPrivateFieldInitSpec(this, _cannotSendNow, function () {
                return _classPrivateFieldGet2(_offlineMode, _this) || getTimestamp() <= _classPrivateFieldGet2(_failTimeout, _this) || _classPrivateFieldGet2(_waitingToRetry, _this);
            });
            /**
             *  Take back what this tab left in the shared storage while it could not send, once it is in front and may send again
             *  @param {Boolean} sendNow - false to leave the sending to the caller or the heartbeat
             */
            _classPrivateFieldInitSpec(this, _takeBackWhenSendable, function (sendNow) {
                if (_classPrivateFieldGet2(_waitingToRetry, _this) && !_classPrivateFieldGet2(_offlineMode, _this) && getTimestamp() > _classPrivateFieldGet2(_failTimeout, _this) && !document.hidden) {
                    _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, sendNow);
                }
            });
            /**
             *  Tell the site's other tabs that this tab is about to change the device ID or the profile, so they leave what they
             *  have not sent in the shared storage, and collect that for a moment to send it before the change
             *  @param {String} [newId] - the device ID after a device ID change
             *  @param {Number} [newType] - the type of that device ID
             */
            _classPrivateFieldInitSpec(this, _announceChange, function (newId, newType) {
                if (!_classPrivateFieldGet2(_tabStore, _this) || _classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                var signal = {
                    at: getMsTimestamp()
                };
                if (typeof newId === "string") {
                    signal.id = newId;
                    signal.t = newType;
                }
                try {
                    window.localStorage.setItem(_classPrivateFieldGet2(_storageKey, _this).call(_this, "cly_handover"), JSON.stringify(signal));
                } catch (e) {
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.WARNING, "announceChange, Could not tell the other tabs: " + e);
                    return;
                }
                _classPrivateFieldSet2(_collectUntil, _this, signal.at + tabHandoverTimes.COLLECT);
                clearTimeout(_classPrivateFieldGet2(_collectTimer, _this));
                _classPrivateFieldSet2(_collectTimer, _this, setTimeout(function () {
                    _classPrivateFieldSet2(_collectTimer, _this, null);
                    _classPrivateFieldSet2(_collectUntil, _this, 0);
                    if (_classPrivateFieldGet2(_halted, _this)) {
                        return;
                    }
                    // a tab in the background takes nothing, it leaves its own requests behind those of the other tabs
                    if (document.hidden) {
                        _classPrivateFieldGet2(_leaveUnsentRequests, _this).call(_this);
                        return;
                    }
                    _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, true);
                    _classPrivateFieldGet2(_sendNextRightAway, _this).call(_this);
                }, tabHandoverTimes.COLLECT));
            });
            /**
             *  React to another tab that is about to change the device ID or the profile: leave what this tab has not sent for it,
             *  and on a device ID change take the new ID and hold back for a moment, so the change reaches the server first
             *  @param {String} value - the other tab's signal, with the new device ID and its type on a device ID change
             */
            _classPrivateFieldInitSpec(this, _onOtherTabChange, function (value) {
                if (!_classPrivateFieldGet2(_tabStore, _this) || !value) {
                    return;
                }
                var signal = null;
                try {
                    signal = JSON.parse(value);
                } catch (e) {
                    return;
                }
                _classPrivateFieldGet2(_leaveForChangingTab, _this).call(_this);
                if (signal && typeof signal.id === "string" && signal.id !== _this.device_id) {
                    _this.device_id = signal.id;
                    if (typeof signal.t === "number") {
                        _classPrivateFieldSet2(_deviceIdType, _this, signal.t);
                    }
                    _classPrivateFieldGet2(_pauseForOtherTab, _this).call(_this);
                }
            });
            /**
             *  Leave what this tab has not sent in the shared storage, its pending events packed under its current device ID, for
             *  the tab changing the device ID or the profile to send before its change
             */
            _classPrivateFieldInitSpec(this, _leaveForChangingTab, function () {
                if (!_classPrivateFieldGet2(_tabStore, _this) || _classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                _classPrivateFieldGet2(_flushPendingRequestBuffer, _this).call(_this);
                if (!_this.test_mode_eq) {
                    _classPrivateFieldGet2(_sendEventsForced, _this).call(_this);
                }
                _classPrivateFieldGet2(_leaveUnsentRequests, _this).call(_this, true);
            });
            /**
             *  Send nothing of this tab's own for a moment after another tab changed the device ID, so that tab's change goes out first
             */
            _classPrivateFieldInitSpec(this, _pauseForOtherTab, function () {
                if (!_classPrivateFieldGet2(_tabStore, _this) || _classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                _classPrivateFieldSet2(_pausedUntil, _this, getMsTimestamp() + tabHandoverTimes.PAUSE);
                clearTimeout(_classPrivateFieldGet2(_pauseTimer, _this));
                _classPrivateFieldSet2(_pauseTimer, _this, setTimeout(function () {
                    _classPrivateFieldSet2(_pauseTimer, _this, null);
                    _classPrivateFieldSet2(_pausedUntil, _this, 0);
                    if (_classPrivateFieldGet2(_halted, _this)) {
                        return;
                    }
                    // what was held back goes out at once, one request per heartbeat would keep a busy background tab behind
                    if (_classPrivateFieldGet2(_requestQueue, _this).length) {
                        _classPrivateFieldGet2(_sendUpTo, _this).call(_this, _classPrivateFieldGet2(_requestQueue, _this)[_classPrivateFieldGet2(_requestQueue, _this).length - 1], true);
                    }
                    _classPrivateFieldGet2(_flushDeferredRequests, _this).call(_this);
                }, tabHandoverTimes.PAUSE));
            });
            /**
             *  Whether this tab holds back its own sending around a device ID or profile change: while it collects what the other
             *  tabs leave, or while another tab changes the device ID
             *  @returns {Boolean} true while it holds back
             */
            _classPrivateFieldInitSpec(this, _holding, function () {
                var now = getMsTimestamp();
                return now < _classPrivateFieldGet2(_collectUntil, _this) || now < _classPrivateFieldGet2(_pausedUntil, _this);
            });
            /**
             *  Whether a request outside the queue has to wait, as a request for a device ID the server has not seen creates that
             *  user: while a merge into its device ID is unsent, here or in the shared storage, and while another tab changes the
             *  device ID
             *  @param {String} functionName - name of the request
             *  @param {Object} params - request parameters
             *  @returns {Boolean} true when it has to wait
             */
            _classPrivateFieldInitSpec(this, _mustWaitForQueue, function (functionName, params) {
                if (functionName === "send_request_queue" || functionName === "journey_trigger_send_request" || _this.test_mode || !params) {
                    return false;
                }
                if (getMsTimestamp() < _classPrivateFieldGet2(_pausedUntil, _this)) {
                    return true;
                }
                var shared = _classPrivateFieldGet2(_waitingToRetry, _this) ? _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_queue", true) : null;
                var unsent = _classPrivateFieldGet2(_requestQueue, _this).concat(_classPrivateFieldGet2(_pendingRequestBuffer, _this) || [], Array.isArray(shared) ? shared : []);
                return unsent.some(function (request) {
                    return request && request.old_device_id && request.device_id === params.device_id;
                });
            });
            /**
             *  Make the requests that waited for a device ID change to be sent, in the order they were made; any that still have to
             *  wait go back to waiting
             */
            _classPrivateFieldInitSpec(this, _flushDeferredRequests, function () {
                if (!_classPrivateFieldGet2(_deferredRequests, _this).length) {
                    return;
                }
                var waiting = _classPrivateFieldGet2(_deferredRequests, _this);
                _classPrivateFieldSet2(_deferredRequests, _this, []);
                waiting.forEach(function (args) {
                    return _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, args[0], args[1], args[2], args[3], args[4], args[5]);
                });
            });
            /**
             *  Take over the requests and events other tabs left in the shared storage, to be sent before this tab's own
             *  @param {Boolean} sendNow - false at start, where requests from a temporary device ID still get the real one
             */
            _classPrivateFieldInitSpec(this, _takeHandedOver, function (sendNow) {
                if (!_classPrivateFieldGet2(_tabStore, _this) || _classPrivateFieldGet2(_halted, _this)) {
                    return;
                }
                _classPrivateFieldSet2(_waitingToRetry, _this, false);
                var requests = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_queue", true);
                if (Array.isArray(requests) && requests.length) {
                    _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_queue", true);
                    _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "takeHandedOver, Taking over [" + requests.length + "] request(s) other tabs left");
                    _classPrivateFieldSet2(_requestQueue, _this, requests.concat(_classPrivateFieldGet2(_requestQueue, _this)));
                    if (_classPrivateFieldGet2(_requestQueue, _this).length > _classPrivateFieldGet2(_SCSizeReqQueue, _this)) {
                        _classPrivateFieldSet2(_requestQueue, _this, _classPrivateFieldGet2(_requestQueue, _this).slice(-_classPrivateFieldGet2(_SCSizeReqQueue, _this)));
                    }
                    // what a tab left in offline mode goes out with this tab's device ID, as at start, where it is not known yet
                    if (_this.device_id && _this.device_id !== "[CLY]_temp_id") {
                        _classPrivateFieldGet2(_giveTemporaryIdRequestsToCurrentId, _this).call(_this);
                    }
                    _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                    _classPrivateFieldGet2(_noteOrderSensitive, _this).call(_this, requests, sendNow);
                }
                // events are only left there by SDK versions that shared the event queue between tabs
                var events = _classPrivateFieldGet2(_getValueFromStorage, _this).call(_this, "cly_event");
                if (Array.isArray(events) && events.length) {
                    _classPrivateFieldGet2(_removeValueFromStorage, _this).call(_this, "cly_event");
                    _classPrivateFieldSet2(_eventQueue, _this, events.concat(_classPrivateFieldGet2(_eventQueue, _this)));
                    _classPrivateFieldGet2(_saveEventQueue, _this).call(_this);
                }
            });
            /**
             *  Hand over what this tab has not sent when its page is left, and take over what other tabs left whenever this
             *  tab comes to the front
             */
            _classPrivateFieldInitSpec(this, _listenForTabChanges, function () {
                add_event_listener(window, "onpagehide" in window ? "pagehide" : "unload", function () {
                    _classPrivateFieldGet2(_handOver, _this).call(_this);
                });
                add_event_listener(window, "pageshow", function (event) {
                    if (event && event.persisted && !document.hidden) {
                        _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, true);
                    }
                });
                add_event_listener(document, "visibilitychange", function () {
                    if (document.hidden) {
                        _classPrivateFieldGet2(_sendWhenLeft, _this).call(_this);
                    } else {
                        _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, true);
                    }
                });
            });
            /**
             *  Whether what this tab's storage holds is a copy of the page that opened this tab: a tab opened by script starts with
             *  a copy of its opener's storage, while the opener keeps and sends its own unsent data
             *  @returns {Boolean} true on a new visit of a tab another page opened, false otherwise or when the browser cannot tell
             */
            _classPrivateFieldInitSpec(this, _isOpenersCopy, function () {
                try {
                    if (!window.opener) {
                        return false;
                    }
                    var entries = typeof performance.getEntriesByType === "function" ? performance.getEntriesByType("navigation") : [];
                    if (entries && entries.length) {
                        return entries[0].type === "navigate";
                    }
                    // older browsers number the type, 0 being a new visit
                    return !!(performance.navigation && performance.navigation.type === 0);
                } catch (e) {
                    return false;
                }
            });
            /**
             *  Apply modified storage changes
             *  @param {String} key - key of storage modified
             *  @param {Varies} newValue - new value for storage
             */
            _classPrivateFieldInitSpec(this, _onStorageChange, function (key, newValue) {
                _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for key:", key);
                // another tab's request queue can carry log batches, which must not be gathered a second time
                _classPrivateFieldGet2(_withoutLogCapture, _this).call(_this, key === "cly_queue", function () {
                    return _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for value:", newValue);
                });
                switch (key) {
                    // queue of requests
                    case "cly_queue":
                        if (_classPrivateFieldGet2(_tabStore, _this)) {
                            // another tab left its unsent requests: the tab in front sends them, only one window has the focus
                            if (newValue && !document.hidden && document.hasFocus()) {
                                _classPrivateFieldGet2(_takeHandedOver, _this).call(_this, true);
                            }
                        } else {
                            var mirroredRequests = _this.deserialize(newValue || "[]");
                            _classPrivateFieldSet2(_requestQueue, _this, Array.isArray(mirroredRequests) ? mirroredRequests : []);
                        }
                        break;
                    // queue of events
                    case "cly_event":
                        if (!_classPrivateFieldGet2(_tabStore, _this)) {
                            var mirroredEvents = _this.deserialize(newValue || "[]");
                            _classPrivateFieldSet2(_eventQueue, _this, Array.isArray(mirroredEvents) ? mirroredEvents : []);
                        }
                        break;
                    case "cly_remote_configs":
                        _classPrivateFieldSet2(_remoteConfigs, _this, _this.deserialize(newValue || "{}"));
                        break;
                    case "cly_ignore":
                        _this.ignore_visitor = _this.deserialize(newValue);
                        _classPrivateFieldSet2(_ignoredByChoice, _this, !!_this.ignore_visitor);
                        break;
                    case "cly_config":
                        _classPrivateFieldSet2(_serverConfigCache, _this, _this.deserialize(newValue || "{}"));
                        _classPrivateFieldGet2(_populateServerConfig, _this).call(_this, _classPrivateFieldGet2(_serverConfigCache, _this));
                        // a live server response always carries 'lg', so a mirrored config that has one came from another tab's fetch
                        if (_classPrivateFieldGet2(_serverConfigCache, _this) && typeof _classPrivateFieldGet2(_serverConfigCache, _this).lg !== "undefined") {
                            _classPrivateFieldGet2(_applyLogGatheringConfig, _this).call(_this, _classPrivateFieldGet2(_serverConfigCache, _this).lg);
                        }
                        break;
                    case "cly_id":
                        // another tab changed the device ID: what this tab has not sent goes out first, under the previous one
                        if (newValue !== _this.device_id) {
                            _classPrivateFieldGet2(_leaveForChangingTab, _this).call(_this);
                            _classPrivateFieldGet2(_pauseForOtherTab, _this).call(_this);
                        }
                        _this.device_id = newValue;
                        break;
                    case "cly_handover":
                        _classPrivateFieldGet2(_onOtherTabChange, _this).call(_this, newValue);
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
                if (_classPrivateFieldGet2(_tabStore, _this)) {
                    _classPrivateFieldGet2(_saveRequestQueue, _this).call(_this);
                    _classPrivateFieldGet2(_saveEventQueue, _this).call(_this);
                }
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
                parseUrlParts: parseUrlParts,
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
                },
                getLogBuffer: function getLogBuffer() {
                    return _classPrivateFieldGet2(_logBuffer, _this);
                },
                getLogGatheringState: function getLogGatheringState() {
                    return _classPrivateFieldGet2(_SCLogGathering, _this);
                },
                getDroppedLogCount: function getDroppedLogCount() {
                    return _classPrivateFieldGet2(_logBufferDropped, _this);
                },
                flushLogBuffer: function flushLogBuffer() {
                    return _classPrivateFieldGet2(_flushLogBuffer, _this).call(_this);
                },
                sendPushToken: _classPrivateFieldGet2(_sendPushToken, this),
                urlBase64ToUint8Array: _classPrivateFieldGet2(_urlBase64ToUint8Array, this),
                isPushSupported: _classPrivateFieldGet2(_isPushSupported, this)
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
                    if (_classPrivateFieldGet2(_disableHealthCheck, _this)) {
                        _classPrivateFieldGet2(_log, _this).call(_this, logLevelEnums.DEBUG, "sendInstantHCRequest, Health check is disabled with disable_health_check. Not sending health check request.");
                        return;
                    }
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
                    // the counters start again once the health check is sent, whether it reaches the server or not
                    _classPrivateFieldGet2(_HealthCheck, _this).resetAndSaveCounters();
                    // send request, the request maker logs a failure
                    _classPrivateFieldGet2(_makeNetworkRequest, _this).call(_this, "[healthCheck]", _this.url + _classPrivateFieldGet2(_apiPath, _this), request, null, true);
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
                    _this.hcErrorCount = (_this.hcErrorCount || 0) + 1;
                    if (_classPrivateFieldGet2(_hcCountersLoaded, _this)) {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.errorCount, _this.hcErrorCount);
                    }
                },
                incrementWarningCount: function incrementWarningCount() {
                    _this.hcWarningCount = (_this.hcWarningCount || 0) + 1;
                    if (_classPrivateFieldGet2(_hcCountersLoaded, _this)) {
                        _classPrivateFieldGet2(_setValueInStorage, _this).call(_this, healthCheckCounterEnum.warningCount, _this.hcWarningCount);
                    }
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
                /**
                 * Keeps the HTTP status code and response of the last failed request, of any kind, for the next health check.
                 * A request that got no HTTP answer, such as one sent while offline or blocked, has no status code to keep.
                 * @param {Number} status - HTTP status code
                 * @param {String} responseText - response body
                 */
                saveRequestCounters: function saveRequestCounters(status, responseText) {
                    if (!(status > 0 && status < 1000)) {
                        return;
                    }
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
            _classPrivateFieldSet2(_autoSessionTracking, this, false);
            _classPrivateFieldSet2(_halted, this, false);
            _classPrivateFieldSet2(_serverConfigTimer, this, null);
            _classPrivateFieldSet2(_serverConfigAfterMerge, this, false);
            _classPrivateFieldSet2(_remoteConfigAfterMerge, this, false);
            _classPrivateFieldSet2(_tabStore, this, false);
            _classPrivateFieldSet2(_sendingUpTo, this, null);
            _classPrivateFieldSet2(_requestOnItsWay, this, null);
            _classPrivateFieldSet2(_waitingToRetry, this, false);
            _classPrivateFieldSet2(_collectUntil, this, 0);
            _classPrivateFieldSet2(_collectTimer, this, null);
            _classPrivateFieldSet2(_pausedUntil, this, 0);
            _classPrivateFieldSet2(_pauseTimer, this, null);
            _classPrivateFieldSet2(_deferredRequests, this, []);
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
            _classPrivateFieldSet2(_contentZoneWanted, this, false);
            _classPrivateFieldSet2(_contentZoneTimer, this, null);
            _classPrivateFieldSet2(_contentZoneEntryTimer, this, null);
            _classPrivateFieldSet2(_contentMessageListener, this, null);
            _classPrivateFieldSet2(_contentResizeListener, this, null);
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
            _classPrivateFieldSet2(_disableHealthCheck, this, !!getConfig("disable_health_check", _ob, false));
            _classPrivateFieldSet2(_SCBackoffAcceptedTimeout, this, 10); // 10 seconds
            _classPrivateFieldSet2(_SCBackoffRQPercentage, this, 0.5); // 50% of the request queue
            _classPrivateFieldSet2(_SCBackoffRequestAge, this, 24); // 24 hours
            _classPrivateFieldSet2(_SCBackoffDuration, this, 60); // 60 seconds
            _classPrivateFieldSet2(_SCDropOldRequestTime, this, 0); // hours, 0 keeps every request
            _classPrivateFieldSet2(_SCEventBlacklist, this, []);
            _classPrivateFieldSet2(_SCEventWhitelist, this, []);
            _classPrivateFieldSet2(_SCUserPropertyBlacklist, this, []);
            _classPrivateFieldSet2(_SCUserPropertyWhitelist, this, []);
            _classPrivateFieldSet2(_SCSegmentationBlacklist, this, []);
            _classPrivateFieldSet2(_SCSegmentationWhitelist, this, []);
            _classPrivateFieldSet2(_SCEventSegmentationBlacklist, this, {});
            _classPrivateFieldSet2(_SCEventSegmentationWhitelist, this, {});
            _classPrivateFieldSet2(_SCJourneyTriggerEvents, this, []);
            // undecided until the server answers, so the init lines below are captured and adopted or dropped later
            _classPrivateFieldGet2(_resetLogGathering, this).call(this, false);
            _classPrivateFieldSet2(_requestTimeoutDuration, this, 30000); // 30 seconds
            _classPrivateFieldSet2(_contentFilterCallback, this, null);
            _classPrivateFieldSet2(_isProcessingAsyncFromUserDataSave, this, false);
            _classPrivateFieldSet2(_journeyTriggerInProgress, this, false);
            _classPrivateFieldSet2(_journeyTriggerPending, this, false);
            _classPrivateFieldSet2(_journeyPendingEventIds, this, new Set());
            _classPrivateFieldSet2(_fakeRequestHandler, this, getConfig("fake_request_handler", _ob, null));
            _classPrivateFieldSet2(_uaClientHints, this, null);
            _classPrivateFieldSet2(_uaClientHintsStatus, this, "not_started");
            _classPrivateFieldSet2(_clientHintsPromise, this, null);
            _classPrivateFieldSet2(_pendingRequestBuffer, this, null);
            _classPrivateFieldSet2(_clientHintsBufferTimeoutId, this, null);
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

            // create object to store consents
            _classPrivateFieldSet2(_consents, this, {});
            for (var it = 0; it < Countly.features.length; it++) {
                _classPrivateFieldGet2(_consents, this)[Countly.features[it]] = {};
            }
            _classPrivateFieldGet2(_initializeClientHints, this).call(this);
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

    Countly.features = featureList.slice();
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
            try {
                // each tab keeps its queues in its own sessionStorage, which other frames of that tab can change too
                if (e.storageArea && e.storageArea !== window.localStorage) {
                    return;
                }
            } catch (ex) {
                return;
            }
            var parts = (e.key + "").split("/");
            var key = parts.pop();
            var appKey = parts.pop();
            var inst = Countly.i && Countly.i[appKey];
            // what is left of the key is the namespace, which has to be the instance's own
            if (inst && parts.join("/") === stripTrailingSlash(inst.namespace || "")) {
                inst._internals.onStorageChange(key, e.newValue);
            }
        });
    }

    /**
     *  The CommonJS and UMD bundles hand out Countly itself, so import and require() get the SDK under every module system.
     *  Countly.default and __esModule keep code written as Countly.default.init and bundlers that read __esModule working;
     *  they are not enumerable, so they do not show when Countly is listed or serialized.
     */
    Object.defineProperty(Countly, "default", {
        value: Countly,
        enumerable: false,
        writable: true,
        configurable: true
    });
    Object.defineProperty(Countly, "__esModule", {
        value: true,
        enumerable: false
    });

    return Countly;

}));
