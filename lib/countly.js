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
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Countly = global.Countly || {}));
})(this, (function(exports) {
    'use strict';

    function _typeof(o) {
        "@babel/helpers - typeof";

        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
            return typeof o;
        } : function(o) {
            return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
        }, _typeof(o);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
            writable: false
        });
        return Constructor;
    }
    function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== undefined) {
            var res = prim.call(input, hint || "default");
            if (typeof res !== "object") return res;
            throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
    }
    function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
    }

    var isBrowser = typeof window !== "undefined";
    var Countly = globalThis.Countly || {};

    /**
     * Array with list of available features that you can require consent for
     * @example
     * Countly.features = ["sessions", "events", "views", "scrolls", "clicks", "forms", "crashes", "attribution", "users", "star-rating", "location", "apm", "feedback", "remote-config"];
     */
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
    };
    Countly.features = [featureEnums.SESSIONS, featureEnums.EVENTS, featureEnums.VIEWS, featureEnums.SCROLLS, featureEnums.CLICKS, featureEnums.FORMS, featureEnums.CRASHES, featureEnums.ATTRIBUTION, featureEnums.USERS, featureEnums.STAR_RATING, featureEnums.LOCATION, featureEnums.APM, featureEnums.FEEDBACK, featureEnums.REMOTE_CONFIG];

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
        VERBOSE: "[VERBOSE] ",
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
        URL_PROVIDED: 3,
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
        MAX_STACKTRACE_LINE_LENGTH: 200,
    };

    /**
     * BoomerangJS and countly
     */
    var CDN = {
        BOOMERANG_SRC: "https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/boomerang.min.js",
        CLY_BOOMERANG_SRC: "https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/countly_boomerang.js",
    };

    /**
     * Health check counters' local storage keys
     */
    var healthCheckCounterEnum = Object.freeze({
        errorCount: "cly_hc_error_count",
        warningCount: "cly_hc_warning_count",
        statusCode: "cly_hc_status_code",
        errorMessage: "cly_hc_error_message",
    });
    /**
     *  Async api queue, push commands here to be executed when script is loaded or after
     *  @example <caption>Add command as array</caption>
     *  Countly.q.push(['add_event',{
     *      key:"asyncButtonClick",
     *      segmentation: {
     *          "id": ob.id
     *      }
     *  }]);
     */
    Countly.q = Countly.q || [];
    /**
    *  Array of functions that are waiting to be notified that script has loaded and instantiated
    *  @example
    *  Countly.onload.push(function(){
    *      console.log("script loaded");
    *  });
    */
    Countly.onload = Countly.onload || [];

    var SDK_VERSION = "23.12.0";
    var SDK_NAME = "javascript_native_web";

    // Using this on document.referrer would return an array with 15 elements in it. The 12th element (array[11]) would be the path we are looking for. Others would be things like password and such (use https://regex101.com/ to check more)
    var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
    var apmLibrariesNotLoaded = true; // used to prevent loading apm scripts multiple times.

    var CountlyClass = /*#__PURE__*/_createClass(function CountlyClass(ob) {
        _classCallCheck(this, CountlyClass);
        var self = this;
        var global = !Countly.i;
        var sessionStarted = false;
        var apiPath = "/i";
        var readPath = "/o/sdk";
        var beatInterval = getConfig("interval", ob, configurationDefaultValues.BEAT_INTERVAL);
        var queueSize = getConfig("queue_size", ob, configurationDefaultValues.QUEUE_SIZE);
        var requestQueue = [];
        var eventQueue = [];
        var remoteConfigs = {};
        var crashLogs = [];
        var timedEvents = {};
        var ignoreReferrers = getConfig("ignore_referrers", ob, []);
        var crashSegments = null;
        var autoExtend = true;
        var lastBeat;
        var storedDuration = 0;
        var lastView = null;
        var lastViewTime = 0;
        var lastViewStoredDuration = 0;
        var failTimeout = 0;
        var failTimeoutAmount = getConfig("fail_timeout", ob, configurationDefaultValues.FAIL_TIMEOUT_AMOUNT);
        var inactivityTime = getConfig("inactivity_time", ob, configurationDefaultValues.INACTIVITY_TIME);
        var inactivityCounter = 0;
        var sessionUpdate = getConfig("session_update", ob, configurationDefaultValues.SESSION_UPDATE);
        var maxEventBatch = getConfig("max_events", ob, configurationDefaultValues.MAX_EVENT_BATCH);
        var maxCrashLogs = getConfig("max_logs", ob, null);
        var useSessionCookie = getConfig("use_session_cookie", ob, true);
        var sessionCookieTimeout = getConfig("session_cookie_timeout", ob, configurationDefaultValues.SESSION_COOKIE_TIMEOUT);
        var readyToProcess = true;
        var hasPulse = false;
        var offlineMode = getConfig("offline_mode", ob, false);
        var lastParams = {};
        var trackTime = true;
        var startTime = getTimestamp();
        var lsSupport = true;
        var firstView = null;
        var deviceIdType = DeviceIdTypeInternalEnums.SDK_GENERATED;
        var isScrollRegistryOpen = false;
        var scrollRegistryTopPosition = 0;
        var trackingScrolls = false;
        var currentViewId = null; // this is the global variable for tracking the current view's ID. Used in view tracking. Becomes previous view ID at the end.
        var previousViewId = null; // this is the global variable for tracking the previous view's ID. Used in view tracking. First view has no previous view ID.
        var freshUTMTags = null;

        try {
            localStorage.setItem("cly_testLocal", true);
            // clean up test
            localStorage.removeItem("cly_testLocal");
        }
        catch (e) {
            log(logLevelEnums.ERROR, "Local storage test failed, Halting local storage support: " + e);
            lsSupport = false;
        }

        // create object to store consents
        var consents = {};
        for (var it = 0; it < Countly.features.length; it++) {
            consents[Countly.features[it]] = {};
        }

        this.initialize = function() {
            this.serialize = getConfig("serialize", ob, Countly.serialize);
            this.deserialize = getConfig("deserialize", ob, Countly.deserialize);
            this.getViewName = getConfig("getViewName", ob, Countly.getViewName);
            this.getViewUrl = getConfig("getViewUrl", ob, Countly.getViewUrl);
            this.getSearchQuery = getConfig("getSearchQuery", ob, Countly.getSearchQuery);
            this.DeviceIdType = Countly.DeviceIdType; // it is Countly device Id type Enums for clients to use
            this.namespace = getConfig("namespace", ob, "");
            this.clearStoredId = !isBrowser ? undefined : getConfig("clear_stored_id", ob, false);
            this.app_key = getConfig("app_key", ob, null);
            this.onload = getConfig("onload", ob, []);
            this.utm = getConfig("utm", ob, { source: true, medium: true, campaign: true, term: true, content: true });
            this.ignore_prefetch = getConfig("ignore_prefetch", ob, true);
            this.rcAutoOptinAb = getConfig("rc_automatic_optin_for_ab", ob, true);
            this.useExplicitRcApi = getConfig("use_explicit_rc_api", ob, false);
            this.debug = getConfig("debug", ob, false);
            this.test_mode = getConfig("test_mode", ob, false);
            this.test_mode_eq = getConfig("test_mode_eq", ob, false);
            this.metrics = getConfig("metrics", ob, {});
            this.headers = getConfig("headers", ob, {});
            this.url = stripTrailingSlash(getConfig("url", ob, ""));
            this.app_version = getConfig("app_version", ob, "0.0");
            this.country_code = getConfig("country_code", ob, null);
            this.city = getConfig("city", ob, null);
            this.ip_address = getConfig("ip_address", ob, null);
            this.ignore_bots = !isBrowser ? undefined : getConfig("ignore_bots", ob, true);
            this.force_post = getConfig("force_post", ob, false);
            this.remote_config = getConfig("remote_config", ob, false);
            this.ignore_visitor = getConfig("ignore_visitor", ob, false);
            this.require_consent = getConfig("require_consent", ob, false);
            this.track_domains = !isBrowser ? undefined : getConfig("track_domains", ob, true);
            this.storage = getConfig("storage", ob, "default");
            this.enableOrientationTracking = !isBrowser ? undefined : getConfig("enable_orientation_tracking", ob, true);
            this.maxKeyLength = getConfig("max_key_length", ob, configurationDefaultValues.MAX_KEY_LENGTH);
            this.maxValueSize = getConfig("max_value_size", ob, configurationDefaultValues.MAX_VALUE_SIZE);
            this.maxSegmentationValues = getConfig("max_segmentation_values", ob, configurationDefaultValues.MAX_SEGMENTATION_VALUES);
            this.maxBreadcrumbCount = getConfig("max_breadcrumb_count", ob, null);
            this.maxStackTraceLinesPerThread = getConfig("max_stack_trace_lines_per_thread", ob, configurationDefaultValues.MAX_STACKTRACE_LINES_PER_THREAD);
            this.maxStackTraceLineLength = getConfig("max_stack_trace_line_length", ob, configurationDefaultValues.MAX_STACKTRACE_LINE_LENGTH);
            this.heatmapWhitelist = getConfig("heatmap_whitelist", ob, []);
            self.hcErrorCount = getValueFromStorage(healthCheckCounterEnum.errorCount) || 0;
            self.hcWarningCount = getValueFromStorage(healthCheckCounterEnum.warningCount) || 0;
            self.hcStatusCode = getValueFromStorage(healthCheckCounterEnum.statusCode) || -1;
            self.hcErrorMessage = getValueFromStorage(healthCheckCounterEnum.errorMessage) || "";

            if (maxCrashLogs && !this.maxBreadcrumbCount) {
                this.maxBreadcrumbCount = maxCrashLogs;
                log(logLevelEnums.WARNING, "initialize, 'maxCrashLogs' is deprecated. Use 'maxBreadcrumbCount' instead!");
            }
            else if (!maxCrashLogs && !this.maxBreadcrumbCount) {
                this.maxBreadcrumbCount = 100;
            }

            if (this.storage === "cookie") {
                lsSupport = false;
            }

            if (!this.rcAutoOptinAb && !this.useExplicitRcApi) {
                log(logLevelEnums.WARNING, "initialize, Auto opting is disabled, switching to explicit RC API");
                this.useExplicitRcApi = true;
            }

            if (!Array.isArray(ignoreReferrers)) {
                ignoreReferrers = [];
            }

            if (this.url === "") {
                log(logLevelEnums.ERROR, "initialize, Please provide server URL");
                this.ignore_visitor = true;
            }
            if (getValueFromStorage("cly_ignore")) {
                // opted out user
                this.ignore_visitor = true;
            }

            migrate();

            requestQueue = getValueFromStorage("cly_queue") || [];
            eventQueue = getValueFromStorage("cly_event") || [];
            remoteConfigs = getValueFromStorage("cly_remote_configs") || {};

            if (this.clearStoredId) {
                // retrieve stored device ID and type from local storage and use it to flush existing events
                if (getValueFromStorage("cly_id") && !tempIdModeWasEnabled) {
                    this.device_id = getValueFromStorage("cly_id");
                    log(logLevelEnums.DEBUG, "initialize, temporarily using the previous device ID to flush existing events");
                    deviceIdType = getValueFromStorage("cly_id_type");
                    if (!deviceIdType) {
                        log(logLevelEnums.DEBUG, "initialize, No device ID type info from the previous session, falling back to DEVELOPER_SUPPLIED, for event flushing");
                        deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                    }
                    sendEventsForced();
                    // set them back to their initial values
                    this.device_id = undefined;
                    deviceIdType = DeviceIdTypeInternalEnums.SDK_GENERATED;
                }
                // then clear the storage so that a new device ID is set again later
                log(logLevelEnums.INFO, "initialize, Clearing the device ID storage");
                localStorage.removeItem(this.app_key + "/cly_id");
                localStorage.removeItem(this.app_key + "/cly_id_type");
                localStorage.removeItem(this.app_key + "/cly_session");
            }

            checkIgnore();

            if (isBrowser) {
                if (window.name && window.name.indexOf("cly:") === 0) {
                    try {
                        this.passed_data = JSON.parse(window.name.replace("cly:", ""));
                    }
                    catch (ex) {
                        log(logLevelEnums.ERROR, "initialize, Could not parse name: " + window.name + ", error: " + ex);
                    }
                }
                else if (location.hash && location.hash.indexOf("#cly:") === 0) {
                    try {
                        this.passed_data = JSON.parse(location.hash.replace("#cly:", ""));
                    }
                    catch (ex) {
                        log(logLevelEnums.ERROR, "initialize, Could not parse hash: " + location.hash + ", error: " + ex);
                    }
                }
            }

            if (this.passed_data && this.passed_data.app_key && this.passed_data.app_key === this.app_key || this.passed_data && !this.passed_data.app_key && global) {
                if (this.passed_data.token && this.passed_data.purpose) {
                    if (this.passed_data.token !== getValueFromStorage("cly_old_token")) {
                        setToken(this.passed_data.token);
                        setValueInStorage("cly_old_token", this.passed_data.token);
                    }
                    var strippedList = [];
                    // if whitelist is provided is an array
                    if (Array.isArray(this.heatmapWhitelist)) {
                        this.heatmapWhitelist.push(this.url);
                        strippedList = this.heatmapWhitelist.map(function(e) {
                            // remove trailing slashes from the entries
                            return stripTrailingSlash(e);
                        });
                    }
                    else {
                        strippedList = [this.url];
                    }
                    // if the passed url is in the whitelist proceed
                    if (strippedList.includes(this.passed_data.url)) {
                        if (this.passed_data.purpose === "heatmap") {
                            this.ignore_visitor = true;
                            showLoader();
                            loadJS(this.passed_data.url + "/views/heatmap.js", hideLoader);
                        }
                    }
                }
            }

            if (this.ignore_visitor) {
                log(logLevelEnums.WARNING, "initialize, ignore_visitor:[" + this.ignore_visitor + "], this user will not be tracked");
                return;
            }

            // init configuration is printed out here:
            // key values should be printed out as is
            log(logLevelEnums.DEBUG, "initialize, app_key:[" + this.app_key + "], url:[" + this.url + "]");
            log(logLevelEnums.DEBUG, "initialize, device_id:[" + getConfig("device_id", ob, undefined) + "]");
            log(logLevelEnums.DEBUG, "initialize, require_consent is enabled:[" + this.require_consent + "]");
            try {
                log(logLevelEnums.DEBUG, "initialize, metric override:[" + JSON.stringify(this.metrics) + "]");
                log(logLevelEnums.DEBUG, "initialize, header override:[" + JSON.stringify(this.headers) + "]");
                // empty array is truthy and so would be printed if provided
                log(logLevelEnums.DEBUG, "initialize, number of onload callbacks provided:[" + this.onload.length + "]");
                // if the utm object is different to default utm object print it here
                log(logLevelEnums.DEBUG, "initialize, utm tags:[" + JSON.stringify(this.utm) + "]");
                // empty array printed if non provided
                if (ignoreReferrers) {
                    log(logLevelEnums.DEBUG, "initialize, referrers to ignore :[" + JSON.stringify(ignoreReferrers) + "]");
                }
            }
            catch (e) {
                log(logLevelEnums.ERROR, "initialize, Could not stringify some config object values");
            }
            log(logLevelEnums.DEBUG, "initialize, app_version:[" + this.app_version + "]");

            // location info printed here
            log(logLevelEnums.DEBUG, "initialize, provided location info; country_code:[" + this.country_code + "], city:[" + this.city + "], ip_address:[" + this.ip_address + "]");

            // print non vital values only if provided by the developer or differs from the default value
            if (this.namespace !== "") {
                log(logLevelEnums.DEBUG, "initialize, namespace given:[" + this.namespace + "]");
            }
            if (this.clearStoredId) {
                log(logLevelEnums.DEBUG, "initialize, clearStoredId flag set to:[" + this.clearStoredId + "]");
            }
            if (this.ignore_prefetch) {
                log(logLevelEnums.DEBUG, "initialize, ignoring pre-fetching and pre-rendering from counting as real website visits :[" + this.ignore_prefetch + "]");
            }
            // if test mode is enabled warn the user
            if (this.test_mode) {
                log(logLevelEnums.WARNING, "initialize, test_mode:[" + this.test_mode + "], request queue won't be processed");
            }
            if (this.test_mode_eq) {
                log(logLevelEnums.WARNING, "initialize, test_mode_eq:[" + this.test_mode_eq + "], event queue won't be processed");
            }
            // if test mode is enabled warn the user
            if (this.heatmapWhitelist) {
                log(logLevelEnums.DEBUG, "initialize, heatmap whitelist:[" + JSON.stringify(this.heatmapWhitelist) + "], these domains will be whitelisted");
            }
            // if storage is se to something other than local storage
            if (this.storage !== "default") {
                log(logLevelEnums.DEBUG, "initialize, storage is set to:[" + this.storage + "]");
            }
            if (this.ignore_bots) {
                log(logLevelEnums.DEBUG, "initialize, ignore traffic from bots :[" + this.ignore_bots + "]");
            }
            if (this.force_post) {
                log(logLevelEnums.DEBUG, "initialize, forced post method for all requests:[" + this.force_post + "]");
            }
            if (this.remote_config) {
                log(logLevelEnums.DEBUG, "initialize, remote_config callback provided:[" + !!this.remote_config + "]");
            }
            if (typeof this.rcAutoOptinAb === "boolean") {
                log(logLevelEnums.DEBUG, "initialize, automatic RC optin is enabled:[" + this.rcAutoOptinAb + "]");
            }
            if (!this.useExplicitRcApi) {
                log(logLevelEnums.WARNING, "initialize, will use legacy RC API. Consider enabling new API during init with use_explicit_rc_api flag");
            }
            if (this.track_domains) {
                log(logLevelEnums.DEBUG, "initialize, tracking domain info:[" + this.track_domains + "]");
            }
            if (this.enableOrientationTracking) {
                log(logLevelEnums.DEBUG, "initialize, enableOrientationTracking:[" + this.enableOrientationTracking + "]");
            }
            if (!useSessionCookie) {
                log(logLevelEnums.WARNING, "initialize, use_session_cookie is enabled:[" + useSessionCookie + "]");
            }
            if (offlineMode) {
                log(logLevelEnums.DEBUG, "initialize, offline_mode:[" + offlineMode + "], user info won't be send to the servers");
            }
            if (offlineMode) {
                log(logLevelEnums.DEBUG, "initialize, stored remote configs:[" + JSON.stringify(remoteConfigs) + "]");
            }
            // functions, if provided, would be printed as true without revealing their content
            log(logLevelEnums.DEBUG, "initialize, 'getViewName' callback override provided:[" + (this.getViewName !== Countly.getViewName) + "]");
            log(logLevelEnums.DEBUG, "initialize, 'getSearchQuery' callback override provided:[" + (this.getSearchQuery !== Countly.getSearchQuery) + "]");

            // limits are printed here if they were modified 
            if (this.maxKeyLength !== configurationDefaultValues.MAX_KEY_LENGTH) {
                log(logLevelEnums.DEBUG, "initialize, maxKeyLength set to:[" + this.maxKeyLength + "] characters");
            }
            if (this.maxValueSize !== configurationDefaultValues.MAX_VALUE_SIZE) {
                log(logLevelEnums.DEBUG, "initialize, maxValueSize set to:[" + this.maxValueSize + "] characters");
            }
            if (this.maxSegmentationValues !== configurationDefaultValues.MAX_SEGMENTATION_VALUES) {
                log(logLevelEnums.DEBUG, "initialize, maxSegmentationValues set to:[" + this.maxSegmentationValues + "] key/value pairs");
            }
            if (this.maxBreadcrumbCount !== configurationDefaultValues.MAX_BREADCRUMB_COUNT) {
                log(logLevelEnums.DEBUG, "initialize, maxBreadcrumbCount for custom logs set to:[" + this.maxBreadcrumbCount + "] entries");
            }
            if (this.maxStackTraceLinesPerThread !== configurationDefaultValues.MAX_STACKTRACE_LINES_PER_THREAD) {
                log(logLevelEnums.DEBUG, "initialize, maxStackTraceLinesPerThread set to:[" + this.maxStackTraceLinesPerThread + "] lines");
            }
            if (this.maxStackTraceLineLength !== configurationDefaultValues.MAX_STACKTRACE_LINE_LENGTH) {
                log(logLevelEnums.DEBUG, "initialize, maxStackTraceLineLength set to:[" + this.maxStackTraceLineLength + "] characters");
            }
            if (beatInterval !== configurationDefaultValues.BEAT_INTERVAL) {
                log(logLevelEnums.DEBUG, "initialize, interval for heartbeats set to:[" + beatInterval + "] milliseconds");
            }
            if (queueSize !== configurationDefaultValues.QUEUE_SIZE) {
                log(logLevelEnums.DEBUG, "initialize, queue_size set to:[" + queueSize + "] items max");
            }
            if (failTimeoutAmount !== configurationDefaultValues.FAIL_TIMEOUT_AMOUNT) {
                log(logLevelEnums.DEBUG, "initialize, fail_timeout set to:[" + failTimeoutAmount + "] seconds of wait time after a failed connection to server");
            }
            if (inactivityTime !== configurationDefaultValues.INACTIVITY_TIME) {
                log(logLevelEnums.DEBUG, "initialize, inactivity_time set to:[" + inactivityTime + "] minutes to consider a user as inactive after no observable action");
            }
            if (sessionUpdate !== configurationDefaultValues.SESSION_UPDATE) {
                log(logLevelEnums.DEBUG, "initialize, session_update set to:[" + sessionUpdate + "] seconds to check if extending a session is needed while the user is active");
            }
            if (maxEventBatch !== configurationDefaultValues.MAX_EVENT_BATCH) {
                log(logLevelEnums.DEBUG, "initialize, max_events set to:[" + maxEventBatch + "] events to send in one batch");
            }
            if (maxCrashLogs) {
                log(logLevelEnums.WARNING, "initialize, max_logs set to:[" + maxCrashLogs + "] breadcrumbs to store for crash logs max, deprecated ");
            }
            if (sessionCookieTimeout !== configurationDefaultValues.SESSION_COOKIE_TIMEOUT) {
                log(logLevelEnums.DEBUG, "initialize, session_cookie_timeout set to:[" + sessionCookieTimeout + "] minutes to expire a cookies session");
            }

            log(logLevelEnums.INFO, "initialize, Countly initialized");

            var deviceIdParamValue = null;
            var searchQuery = self.getSearchQuery();
            var hasUTM = false;
            var utms = {};
            if (searchQuery) {
                var parts = searchQuery.substring(1).split("&");
                for (var i = 0; i < parts.length; i++) {
                    var nv = parts[i].split("=");
                    if (nv[0] === "cly_id") {
                        setValueInStorage("cly_cmp_id", nv[1]);
                    }
                    else if (nv[0] === "cly_uid") {
                        setValueInStorage("cly_cmp_uid", nv[1]);
                    }
                    else if (nv[0] === "cly_device_id") {
                        deviceIdParamValue = nv[1];
                    }
                    else if ((nv[0] + "").indexOf("utm_") === 0 && this.utm[nv[0].replace("utm_", "")]) {
                        utms[nv[0].replace("utm_", "")] = nv[1];
                        hasUTM = true;
                    }
                }
            }

            // flag that indicates that the offline mode was enabled at the end of the previous app session 
            var tempIdModeWasEnabled = getValueFromStorage("cly_id") === "[CLY]_temp_id";
            var developerSetDeviceId = getConfig("device_id", ob, undefined);
            if (typeof developerSetDeviceId === "number") { // device ID should always be string
                developerSetDeviceId = developerSetDeviceId.toString();
            }

            // check if there wqs stored ID
            if (getValueFromStorage("cly_id") && !tempIdModeWasEnabled) {
                this.device_id = getValueFromStorage("cly_id");
                log(logLevelEnums.INFO, "initialize, Set the stored device ID");
                deviceIdType = getValueFromStorage("cly_id_type");
                if (!deviceIdType) {
                    log(logLevelEnums.INFO, "initialize, No device ID type info from the previous session, falling back to DEVELOPER_SUPPLIED");
                    // there is a device ID saved but there is no device ID information saved 
                    deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                }
            }
            // if not check if device ID was provided with URL
            else if (deviceIdParamValue !== null) {
                log(logLevelEnums.INFO, "initialize, Device ID set by URL");
                this.device_id = deviceIdParamValue;
                deviceIdType = DeviceIdTypeInternalEnums.URL_PROVIDED;
            }
            // if not check if developer provided any ID
            else if (developerSetDeviceId) {
                log(logLevelEnums.INFO, "initialize, Device ID set by developer");
                this.device_id = developerSetDeviceId;
                if (ob && Object.keys(ob).length) {
                    if (ob.device_id !== undefined) {
                        deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                    }
                }
                else if (Countly.device_id !== undefined) {
                    deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                }
            }
            // if not check if offline mode is on
            else if (offlineMode || tempIdModeWasEnabled) {
                this.device_id = "[CLY]_temp_id";
                deviceIdType = DeviceIdTypeInternalEnums.TEMPORARY_ID;
                if (offlineMode && tempIdModeWasEnabled) {
                    log(logLevelEnums.INFO, "initialize, Temp ID set, continuing offline mode from previous app session");
                }
                else if (offlineMode && !tempIdModeWasEnabled) {
                    // this if we get here then it means either first init we enter offline mode or we cleared the device ID during the init and still user entered the offline mode
                    log(logLevelEnums.INFO, "initialize, Temp ID set, entering offline mode");
                }
                else {
                    // no device ID was provided, no offline mode flag was provided, in the previous app session we entered offline mode and now we carry on
                    offlineMode = true;
                    log(logLevelEnums.INFO, "initialize, Temp ID set, enabling offline mode");
                }
            }
            // if all fails generate an ID
            else {
                log(logLevelEnums.INFO, "initialize, Generating the device ID");
                this.device_id = getConfig("device_id", ob, getStoredIdOrGenerateId());
                if (ob && Object.keys(ob).length) {
                    if (ob.device_id !== undefined) {
                        deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                    }
                }
                else if (Countly.device_id !== undefined) {
                    deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                }
            }

            // Store the device ID and device ID type
            setValueInStorage("cly_id", this.device_id);
            setValueInStorage("cly_id_type", deviceIdType);

            // as we have assigned the device ID now we can save the tags
            if (hasUTM) {
                freshUTMTags = {};
                for (var tag in this.utm) { // this.utm is a filter for allowed tags
                    if (utms[tag]) { // utms is the tags that were passed in the URL
                        this.userData.set("utm_" + tag, utms[tag]);
                        freshUTMTags[tag] = utms[tag];
                    }
                    else {
                        this.userData.unset("utm_" + tag);
                    }
                }
                this.userData.save();
            }

            notifyLoaders();

            setTimeout(function() {
                heartBeat();
                if (self.remote_config) {
                    self.fetch_remote_config(self.remote_config);
                }
            }, 1);
            if (isBrowser) {
                document.documentElement.setAttribute("data-countly-useragent", currentUserAgentString());
            }
            // send instant health check request
            HealthCheck.sendInstantHCRequest();
        };

        /**
         * WARNING!!!
         * Should be used only for testing purposes!!!
         * 
         * Resets Countly to its initial state (used mainly to wipe the queues in memory).
         * Calling this will result in a loss of data
         */
        this.halt = function() {
            log(logLevelEnums.WARNING, "halt, Resetting Countly");
            Countly.i = undefined;
            global = !Countly.i;
            sessionStarted = false;
            apiPath = "/i";
            readPath = "/o/sdk";
            beatInterval = 500;
            queueSize = 1000;
            requestQueue = [];
            eventQueue = [];
            remoteConfigs = {};
            crashLogs = [];
            timedEvents = {};
            ignoreReferrers = [];
            crashSegments = null;
            autoExtend = true;
            storedDuration = 0;
            lastView = null;
            lastViewTime = 0;
            lastViewStoredDuration = 0;
            failTimeout = 0;
            failTimeoutAmount = 60;
            inactivityTime = 20;
            inactivityCounter = 0;
            sessionUpdate = 60;
            maxEventBatch = 100;
            maxCrashLogs = null;
            useSessionCookie = true;
            sessionCookieTimeout = 30;
            readyToProcess = true;
            hasPulse = false;
            offlineMode = false;
            lastParams = {};
            trackTime = true;
            startTime = getTimestamp();
            lsSupport = true;
            firstView = null;
            deviceIdType = DeviceIdTypeInternalEnums.SDK_GENERATED;
            isScrollRegistryOpen = false;
            scrollRegistryTopPosition = 0;
            trackingScrolls = false;
            currentViewId = null;
            previousViewId = null;
            freshUTMTags = null;

            try {
                localStorage.setItem("cly_testLocal", true);
                // clean up test
                localStorage.removeItem("cly_testLocal");
            }
            catch (e) {
                log(logLevelEnums.ERROR, "halt, Local storage test failed, will fallback to cookies");
                lsSupport = false;
            }

            Countly.features = [featureEnums.SESSIONS, featureEnums.EVENTS, featureEnums.VIEWS, featureEnums.SCROLLS, featureEnums.CLICKS, featureEnums.FORMS, featureEnums.CRASHES, featureEnums.ATTRIBUTION, featureEnums.USERS, featureEnums.STAR_RATING, featureEnums.LOCATION, featureEnums.APM, featureEnums.FEEDBACK, featureEnums.REMOTE_CONFIG];

            // CONSENTS
            consents = {};
            for (var a = 0; a < Countly.features.length; a++) {
                consents[Countly.features[a]] = {};
            }

            self.app_key = undefined;
            self.device_id = undefined;
            self.onload = undefined;
            self.utm = undefined;
            self.ignore_prefetch = undefined;
            self.debug = undefined;
            self.test_mode = undefined;
            self.test_mode_eq = undefined;
            self.metrics = undefined;
            self.headers = undefined;
            self.url = undefined;
            self.app_version = undefined;
            self.country_code = undefined;
            self.city = undefined;
            self.ip_address = undefined;
            self.ignore_bots = undefined;
            self.force_post = undefined;
            self.rcAutoOptinAb = undefined;
            self.useExplicitRcApi = undefined;
            self.remote_config = undefined;
            self.ignore_visitor = undefined;
            self.require_consent = undefined;
            self.track_domains = undefined;
            self.storage = undefined;
            self.enableOrientationTracking = undefined;
            self.maxKeyLength = undefined;
            self.maxValueSize = undefined;
            self.maxSegmentationValues = undefined;
            self.maxBreadcrumbCount = undefined;
            self.maxStackTraceLinesPerThread = undefined;
            self.maxStackTraceLineLength = undefined;
        };

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
        this.group_features = function(features) {
            log(logLevelEnums.INFO, "group_features, Grouping features");
            if (features) {
                for (var i in features) {
                    if (!consents[i]) {
                        if (typeof features[i] === "string") {
                            consents[i] = { features: [features[i]] };
                        }
                        else if (features[i] && Array.isArray(features[i]) && features[i].length) {
                            consents[i] = { features: features[i] };
                        }
                        else {
                            log(logLevelEnums.ERROR, "group_features, Incorrect feature list for [" + i + "] value: [" + features[i] + "]");
                        }
                    }
                    else {
                        log(logLevelEnums.WARNING, "group_features, Feature name [" + i + "] is already reserved");
                    }
                }
            }
            else {
                log(logLevelEnums.ERROR, "group_features, Incorrect features:[" + features + "]");
            }
        };

        /**
        * Check if consent is given for specific feature (either core feature of from custom feature group)
        * @param {string} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or custom provided through {@link Countly.group_features}
        * @returns {Boolean} true if consent was given for the feature or false if it was not
        */
        this.check_consent = function(feature) {
            log(logLevelEnums.INFO, "check_consent, Checking if consent is given for specific feature:[" + feature + "]");
            if (!this.require_consent) {
                // we don't need to have specific consents
                log(logLevelEnums.INFO, "check_consent, require_consent is off, no consent is necessary");
                return true;
            }
            if (consents[feature]) {
                return !!(consents[feature] && consents[feature].optin);
            }
            log(logLevelEnums.ERROR, "check_consent, No feature available for [" + feature + "]");
            return false;
        };

        /**
        * Check and return the current device id type
        * @returns {number} a number that indicates the device id type
        */
        this.get_device_id_type = function() {
            log(logLevelEnums.INFO, "check_device_id_type, Retrieving the current device id type.[" + deviceIdType + "]");
            var type;
            switch (deviceIdType) {
            case DeviceIdTypeInternalEnums.SDK_GENERATED:
                type = self.DeviceIdType.SDK_GENERATED;
                break;
            case DeviceIdTypeInternalEnums.URL_PROVIDED:
            case DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED:
                type = self.DeviceIdType.DEVELOPER_SUPPLIED;
                break;
            case DeviceIdTypeInternalEnums.TEMPORARY_ID:
                type = self.DeviceIdType.TEMPORARY_ID;
                break;
            default:
                type = -1;
                break;
            }
            return type;
        };

        /**
        * Gets the current device id (of the CountlyClass instance)
        * @returns {string} device id
        */
        this.get_device_id = function() {
            log(logLevelEnums.INFO, "get_device_id, Retrieving the device id: [" + self.device_id + "]");
            return self.device_id;
        };

        /**
        * Check if any consent is given, for some cases, when crucial parts are like device_id are needed for any request
        * @returns {Boolean} true is has any consent given, false if no consents given
        */
        this.check_any_consent = function() {
            log(logLevelEnums.INFO, "check_any_consent, Checking if any consent is given");
            if (!this.require_consent) {
                // we don't need to have consents
                log(logLevelEnums.INFO, "check_any_consent, require_consent is off, no consent is necessary");
                return true;
            }
            for (var i in consents) {
                if (consents[i] && consents[i].optin) {
                    return true;
                }
            }
            log(logLevelEnums.INFO, "check_any_consent, No consents given");
            return false;
        };

        /**
        * Add consent for specific feature, meaning, user allowed to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        */
        this.add_consent = function(feature) {
            log(logLevelEnums.INFO, "add_consent, Adding consent for [" + feature + "]");
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    this.add_consent(feature[i]);
                }
            }
            else if (consents[feature]) {
                if (consents[feature].features) {
                    consents[feature].optin = true;
                    // this is added group, let's iterate through sub features
                    this.add_consent(consents[feature].features);
                }
                else {
                    // this is core feature
                    if (consents[feature].optin !== true) {
                        consents[feature].optin = true;
                        updateConsent();
                        setTimeout(function() {
                            if (feature === featureEnums.SESSIONS && lastParams.begin_session) {
                                self.begin_session.apply(self, lastParams.begin_session);
                                lastParams.begin_session = null;
                            }
                            else if (feature === featureEnums.VIEWS && lastParams.track_pageview) {
                                lastView = null;
                                self.track_pageview.apply(self, lastParams.track_pageview);
                                lastParams.track_pageview = null;
                            }
                        }, 1);
                    }
                }
            }
            else {
                log(logLevelEnums.ERROR, "add_consent, No feature available for [" + feature + "]");
            }
        };

        /**
        * Remove consent for specific feature, meaning, user opted out to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        * @param {Boolean} enforceConsentUpdate - regulates if a request will be sent to the server or not. If true, removing consents will send a request to the server and if false, consents will be removed without a request 
        */
        this.remove_consent = function(feature) {
            log(logLevelEnums.INFO, "remove_consent, Removing consent for [" + feature + "]");
            this.remove_consent_internal(feature, true);
        };
        // removes consent without updating
        this.remove_consent_internal = function(feature, enforceConsentUpdate) {
            // if true updateConsent will execute when possible
            enforceConsentUpdate = enforceConsentUpdate || false;
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    this.remove_consent_internal(feature[i], enforceConsentUpdate);
                }
            }
            else if (consents[feature]) {
                if (consents[feature].features) {
                    // this is added group, let's iterate through sub features
                    this.remove_consent_internal(consents[feature].features, enforceConsentUpdate);
                }
                else {
                    consents[feature].optin = false;
                    // this is core feature
                    if (enforceConsentUpdate && consents[feature].optin !== false) {
                        updateConsent();
                    }
                }
            }
            else {
                log(logLevelEnums.WARNING, "remove_consent, No feature available for [" + feature + "]");
            }
        };

        var consentTimer;
        var updateConsent = function updateConsent() {
            if (consentTimer) {
                // delay syncing consents
                clearTimeout(consentTimer);
                consentTimer = null;
            }
            consentTimer = setTimeout(function() {
                var consentMessage = {};
                for (var i = 0; i < Countly.features.length; i++) {
                    if (consents[Countly.features[i]].optin === true) {
                        consentMessage[Countly.features[i]] = true;
                    }
                    else {
                        consentMessage[Countly.features[i]] = false;
                    }
                }
                toRequestQueue({ consent: JSON.stringify(consentMessage) });
                log(logLevelEnums.DEBUG, "Consent update request has been sent to the queue.");
            }, 1000);
        };

        this.enable_offline_mode = function() {
            log(logLevelEnums.INFO, "enable_offline_mode, Enabling offline mode");
            // clear consents
            this.remove_consent_internal(Countly.features, false);
            offlineMode = true;
            this.device_id = "[CLY]_temp_id";
            self.device_id = this.device_id;
            deviceIdType = DeviceIdTypeInternalEnums.TEMPORARY_ID;
        };

        this.disable_offline_mode = function(device_id) {
            if (!offlineMode) {
                log(logLevelEnums.WARNING, "disable_offline_mode, Countly was not in offline mode.");
                return;
            }
            log(logLevelEnums.INFO, "disable_offline_mode, Disabling offline mode");
            offlineMode = false;
            if (device_id && this.device_id !== device_id) {
                this.device_id = device_id;
                self.device_id = this.device_id;
                deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                setValueInStorage("cly_id", this.device_id);
                setValueInStorage("cly_id_type", DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                log(logLevelEnums.INFO, "disable_offline_mode, Changing id to: " + this.device_id);
            }
            else {
                this.device_id = getStoredIdOrGenerateId();
                if (this.device_id === "[CLY]_temp_id") {
                    this.device_id = generateUUID();
                }
                self.device_id = this.device_id;
                if (this.device_id !== getValueFromStorage("cly_id")) {
                    setValueInStorage("cly_id", this.device_id);
                    setValueInStorage("cly_id_type", DeviceIdTypeInternalEnums.SDK_GENERATED);
                }
            }
            var needResync = false;
            if (requestQueue.length > 0) {
                for (var i = 0; i < requestQueue.length; i++) {
                    if (requestQueue[i].device_id === "[CLY]_temp_id") {
                        requestQueue[i].device_id = this.device_id;
                        needResync = true;
                    }
                }
            }
            if (needResync) {
                setValueInStorage("cly_queue", requestQueue, true);
            }
        };

        /**
        * Start session
        * @param {boolean} noHeartBeat - true if you don't want to use internal heartbeat to manage session
        * @param {bool} force - force begin session request even if session cookie is enabled
        */
        this.begin_session = function(noHeartBeat, force) {
            log(logLevelEnums.INFO, "begin_session, Starting the session. There was an ongoing session: [" + sessionStarted + "]");
            if (noHeartBeat) {
                log(logLevelEnums.INFO, "begin_session, Heartbeats are disabled");
            }
            if (force) {
                log(logLevelEnums.INFO, "begin_session, Session starts irrespective of session cookie");
            }
            if (this.check_consent(featureEnums.SESSIONS)) {
                if (!sessionStarted) {
                    if (this.enableOrientationTracking) {
                        // report orientation
                        this.report_orientation();
                        add_event_listener(window, "resize", function() {
                            self.report_orientation();
                        });
                    }
                    lastBeat = getTimestamp();
                    sessionStarted = true;
                    autoExtend = !noHeartBeat;
                    var expire = getValueFromStorage("cly_session");
                    log(logLevelEnums.VERBOSE, "begin_session, Session state, forced: [" + force + "], useSessionCookie: [" + useSessionCookie + "], seconds to expire: [" + (expire - lastBeat) + "], expired: [" + (parseInt(expire) <= getTimestamp()) + "] ");
                    if (force || !useSessionCookie || !expire || parseInt(expire) <= getTimestamp()) {
                        log(logLevelEnums.INFO, "begin_session, Session started");
                        if (firstView === null) {
                            firstView = true;
                        }
                        var req = {};
                        req.begin_session = 1;
                        req.metrics = JSON.stringify(getMetrics());
                        toRequestQueue(req);
                    }
                    setValueInStorage("cly_session", getTimestamp() + sessionCookieTimeout * 60);
                }
            }
            else {
                lastParams.begin_session = arguments;
            }
        };

        /**
        * Report session duration
        * @param {int} sec - amount of seconds to report for current session
        */
        this.session_duration = function(sec) {
            log(logLevelEnums.INFO, "session_duration, Reporting session duration");
            if (this.check_consent(featureEnums.SESSIONS)) {
                if (sessionStarted) {
                    log(logLevelEnums.INFO, "session_duration, Session extended: ", sec);
                    toRequestQueue({ session_duration: sec });
                    extendSession();
                }
            }
        };

        /**
        * End current session
        * @param {int} sec - amount of seconds to report for current session, before ending it
        * @param {bool} force - force end session request even if session cookie is enabled
        */
        this.end_session = function(sec, force) {
            log(logLevelEnums.INFO, "end_session, Ending the current session. There was an on going session:[" + sessionStarted + "]");
            if (this.check_consent(featureEnums.SESSIONS)) {
                if (sessionStarted) {
                    sec = sec || getTimestamp() - lastBeat;
                    reportViewDuration();
                    if (!useSessionCookie || force) {
                        log(logLevelEnums.INFO, "end_session, Session ended");
                        toRequestQueue({ end_session: 1, session_duration: sec });
                    }
                    else {
                        this.session_duration(sec);
                    }
                    sessionStarted = false;
                }
            }
        };

        /**
        * Change current user/device id
        * @param {string} newId - new user/device ID to use. Must be a non-empty string value. Invalid values (like null, empty string or undefined) will be rejected
        * @param {boolean} merge - move data from old ID to new ID on server
        * */
        this.change_id = function(newId, merge) {
            log(logLevelEnums.INFO, "change_id, Changing the ID");
            if (merge) {
                log(logLevelEnums.INFO, "change_id, Will merge the IDs");
            }
            if (!newId || typeof newId !== "string" || newId.length === 0) {
                log(logLevelEnums.ERROR, "change_id, The provided ID: [" + newId + "] is not a valid ID");
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.WARNING, "change_id, Offline mode was on, initiating disabling sequence instead.");
                this.disable_offline_mode(newId);
                return;
            }
            // eqeq is used here since we want to catch number to string checks too. type conversion might happen at a new init
            // eslint-disable-next-line eqeqeq
            if (this.device_id != newId) {
                if (!merge) {
                    // empty event queue
                    sendEventsForced();
                    // end current session
                    this.end_session(null, true);
                    // clear timed events
                    timedEvents = {};
                    // clear all consents
                    this.remove_consent_internal(Countly.features, false);
                }
                var oldId = this.device_id;
                this.device_id = newId;
                self.device_id = this.device_id;
                deviceIdType = DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED;
                setValueInStorage("cly_id", this.device_id);
                setValueInStorage("cly_id_type", DeviceIdTypeInternalEnums.DEVELOPER_SUPPLIED);
                log(logLevelEnums.INFO, "change_id, Changing ID from:[" + oldId + "] to [" + newId + "]");
                if (merge) {
                    // no consent check here since 21.11.0
                    toRequestQueue({ old_device_id: oldId });
                }
                else {
                    // start new session for new ID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                    this.begin_session(!autoExtend, true);
                }
                // if init time remote config was enabled with a callback function, remove currently stored remote configs and fetch remote config again
                if (this.remote_config) {
                    remoteConfigs = {};
                    setValueInStorage("cly_remote_configs", remoteConfigs);
                    this.fetch_remote_config(this.remote_config);
                }
            }
        };

        /**
        * Report custom event
        * @param {Object} event - Countly {@link Event} object
        * @param {string} event.key - name or id of the event
        * @param {number} [event.count=1] - how many times did event occur
        * @param {number=} event.sum - sum to report with event (if any)
        * @param {number=} event.dur - duration to report with event (if any)
        * @param {Object=} event.segmentation - object with segments key /values
        * */
        this.add_event = function(event) {
            log(logLevelEnums.INFO, "add_event, Adding event: ", event);
            // initially no consent is given
            var respectiveConsent = false;
            switch (event.key) {
            case internalEventKeyEnums.NPS:
                respectiveConsent = this.check_consent(featureEnums.FEEDBACK);
                break;
            case internalEventKeyEnums.SURVEY:
                respectiveConsent = this.check_consent(featureEnums.FEEDBACK);
                break;
            case internalEventKeyEnums.STAR_RATING:
                respectiveConsent = this.check_consent(featureEnums.STAR_RATING);
                break;
            case internalEventKeyEnums.VIEW:
                respectiveConsent = this.check_consent(featureEnums.VIEWS);
                break;
            case internalEventKeyEnums.ORIENTATION:
                respectiveConsent = this.check_consent(featureEnums.USERS);
                break;
            case internalEventKeyEnums.ACTION:
                respectiveConsent = this.check_consent(featureEnums.CLICKS) || this.check_consent(featureEnums.SCROLLS);
                break;
            default:
                respectiveConsent = this.check_consent(featureEnums.EVENTS);
            }
            // if consent is given adds event to the queue
            if (respectiveConsent) {
                add_cly_events(event);
            }
        };

        /**
         *  Add events to event queue
         *  @memberof Countly._internals
         *  @param {Event} event - countly event
         *  @param {String} eventIdOverride - countly event ID
         */
        function add_cly_events(event, eventIdOverride) {
            // ignore bots
            if (self.ignore_visitor) {
                log(logLevelEnums.ERROR, "Adding event failed. Possible bot or user opt out");
                return;
            }

            if (!event.key) {
                log(logLevelEnums.ERROR, "Adding event failed. Event must have a key property");
                return;
            }

            if (!event.count) {
                event.count = 1;
            }
            // we omit the internal event keys from truncation. TODO: This is not perfect as it would omit a key that includes an internal event key and more too. But that possibility seems negligible. 
            if (!internalEventKeyEnumsArray.includes(event.key)) {
                // truncate event name and segmentation to internal limits
                event.key = truncateSingleValue(event.key, self.maxKeyLength, "add_cly_event", log);
            }
            event.segmentation = truncateObject(event.segmentation, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "add_cly_event", log);
            var props = ["key", "count", "sum", "dur", "segmentation"];
            var e = createNewObjectFromProperties(event, props);
            e.timestamp = getMsTimestamp();
            var date = new Date();
            e.hour = date.getHours();
            e.dow = date.getDay();
            e.id = eventIdOverride || secureRandom();
            if (e.key === internalEventKeyEnums.VIEW) {
                e.pvid = previousViewId || "";
            }
            else {
                e.cvid = currentViewId || "";
            }
            eventQueue.push(e);
            setValueInStorage("cly_event", eventQueue);
            log(logLevelEnums.INFO, "With event ID: [" + e.id + "], successfully adding the last event:", e);
        }

        /**
        * Start timed event, which will fill in duration property upon ending automatically
        * This works basically as a timer and does not create an event till end_event is called
        * @param {string} key - event name that will be used as key property
        * */
        this.start_event = function(key) {
            if (!key || typeof key !== "string") {
                log(logLevelEnums.WARNING, "start_event, you have to provide a valid string key instead of: [" + key + "]");
                return;
            }
            log(logLevelEnums.INFO, "start_event, Starting timed event with key: [" + key + "]");
            // truncate event name to internal limits
            key = truncateSingleValue(key, self.maxKeyLength, "start_event", log);
            if (timedEvents[key]) {
                log(logLevelEnums.WARNING, "start_event, Timed event with key: [" + key + "] already started");
                return;
            }
            timedEvents[key] = getTimestamp();
        };

        /**
        * Cancel timed event, cancels a timed event if it exists
        * @param {string} key - event name that will canceled
        * @returns {boolean} - returns true if the event was canceled and false if no event with that key was found
        * */
        this.cancel_event = function(key) {
            if (!key || typeof key !== "string") {
                log(logLevelEnums.WARNING, "cancel_event, you have to provide a valid string key instead of: [" + key + "]");
                return false;
            }
            log(logLevelEnums.INFO, "cancel_event, Canceling timed event with key: [" + key + "]");
            // truncate event name to internal limits. This is done incase start_event key was truncated.
            key = truncateSingleValue(key, self.maxKeyLength, "cancel_event", log);
            if (timedEvents[key]) {
                delete timedEvents[key];
                log(logLevelEnums.INFO, "cancel_event, Timed event with key: [" + key + "] is canceled");
                return true;
            }
            log(logLevelEnums.WARNING, "cancel_event, Timed event with key: [" + key + "] was not found");
            return false;
        };

        /**
        * End timed event
        * @param {string|object} event - event key if string or Countly event same as passed to {@link Countly.add_event}
        * */
        this.end_event = function(event) {
            if (!event) {
                log(logLevelEnums.WARNING, "end_event, you have to provide a valid string key or event object instead of: [" + event + "]");
                return;
            }
            log(logLevelEnums.INFO, "end_event, Ending timed event");
            if (typeof event === "string") {
                // truncate event name to internal limits. This is done incase start_event key was truncated.
                event = truncateSingleValue(event, self.maxKeyLength, "end_event", log);
                event = { key: event };
            }
            if (!event.key) {
                log(logLevelEnums.ERROR, "end_event, Timed event must have a key property");
                return;
            }
            if (!timedEvents[event.key]) {
                log(logLevelEnums.ERROR, "end_event, Timed event with key: [" + event.key + "] was not started");
                return;
            }
            event.dur = getTimestamp() - timedEvents[event.key];
            this.add_event(event);
            delete timedEvents[event.key];
        };

        /**
        * Report device orientation
        * @param {string=} orientation - orientation as landscape or portrait
        * */
        this.report_orientation = function(orientation) {
            log(logLevelEnums.INFO, "report_orientation, Reporting orientation");
            if (this.check_consent(featureEnums.USERS)) {
                add_cly_events({
                    key: internalEventKeyEnums.ORIENTATION,
                    segmentation: {
                        mode: orientation || getOrientation()
                    }
                });
            }
        };

        /**
        * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
        * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
        * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
        * 
        * @deprecated use 'recordDirectAttribution' in place of this call
        * */
        this.report_conversion = function(campaign_id, campaign_user_id) {
            log(logLevelEnums.WARNING, "report_conversion, Deprecated function call! Use 'recordDirectAttribution' in place of this call. Call will be redirected now!");
            this.recordDirectAttribution(campaign_id, campaign_user_id);
        };
        /**
        * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
        * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
        * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
        * */
        this.recordDirectAttribution = function(campaign_id, campaign_user_id) {
            log(logLevelEnums.INFO, "recordDirectAttribution, Recording the attribution for campaign ID: [" + campaign_id + "] and the user ID: [" + campaign_user_id + "]");
            if (this.check_consent(featureEnums.ATTRIBUTION)) {
                campaign_id = campaign_id || getValueFromStorage("cly_cmp_id") || "cly_organic";
                campaign_user_id = campaign_user_id || getValueFromStorage("cly_cmp_uid");

                if (campaign_user_id) {
                    toRequestQueue({ campaign_id: campaign_id, campaign_user: campaign_user_id });
                }
                else {
                    toRequestQueue({ campaign_id: campaign_id });
                }
            }
        };

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
        this.user_details = function(user) {
            log(logLevelEnums.INFO, "user_details, Trying to add user details: ", user);
            if (this.check_consent(featureEnums.USERS)) {
                sendEventsForced(); // flush events to event queue to prevent a drill issue
                log(logLevelEnums.INFO, "user_details, flushed the event queue");
                // truncating user values and custom object key value pairs
                user.name = truncateSingleValue(user.name, self.maxValueSize, "user_details", log);
                user.username = truncateSingleValue(user.username, self.maxValueSize, "user_details", log);
                user.email = truncateSingleValue(user.email, self.maxValueSize, "user_details", log);
                user.organization = truncateSingleValue(user.organization, self.maxValueSize, "user_details", log);
                user.phone = truncateSingleValue(user.phone, self.maxValueSize, "user_details", log);
                user.picture = truncateSingleValue(user.picture, 4096, "user_details", log);
                user.gender = truncateSingleValue(user.gender, self.maxValueSize, "user_details", log);
                user.byear = truncateSingleValue(user.byear, self.maxValueSize, "user_details", log);
                user.custom = truncateObject(user.custom, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "user_details", log);
                var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
                toRequestQueue({ user_details: JSON.stringify(createNewObjectFromProperties(user, props)) });
            }
        };

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
        var customData = {};
        var change_custom_property = function change_custom_property(key, value, mod) {
            if (self.check_consent(featureEnums.USERS)) {
                if (!customData[key]) {
                    customData[key] = {};
                }
                if (mod === "$push" || mod === "$pull" || mod === "$addToSet") {
                    if (!customData[key][mod]) {
                        customData[key][mod] = [];
                    }
                    customData[key][mod].push(value);
                }
                else {
                    customData[key][mod] = value;
                }
            }
        };

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
        this.userData = {
            /**
            * Sets user's custom property value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value to store under provided property
            * */
            set: function set(key, value) {
                log(logLevelEnums.INFO, "[userData] set, Setting user's custom property value: [" + value + "] under the key: [" + key + "]");
                // truncate user's custom property value to internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData set", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData set", log);
                customData[key] = value;
            },
            /**
            * Unset/deletes user's custom property
            * @memberof Countly.userData
            * @param {string} key - name of the property to delete
            * */
            unset: function unset(key) {
                log(logLevelEnums.INFO, "[userData] unset, Resetting user's custom property with key: [" + key + "] ");
                customData[key] = "";
            },
            /**
            * Sets user's custom property value only if it was not set before
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value to store under provided property
            * */
            set_once: function set_once(key, value) {
                log(logLevelEnums.INFO, "[userData] set_once, Setting user's unique custom property value: [" + value + "] under the key: [" + key + "] ");
                // truncate user's custom property value to internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData set_once", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData set_once", log);
                change_custom_property(key, value, "$setOnce");
            },
            /**
            * Increment value under the key of this user's custom properties by one
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * */
            increment: function increment(key) {
                log(logLevelEnums.INFO, "[userData] increment, Increasing user's custom property value under the key: [" + key + "] by one");
                // truncate property name wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData increment", log);
                change_custom_property(key, 1, "$inc");
            },
            /**
            * Increment value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to increment server value
            * */
            increment_by: function increment_by(key, value) {
                log(logLevelEnums.INFO, "[userData] increment_by, Increasing user's custom property value under the key: [" + key + "] by: [" + value + "]");
                // truncate property name and value wrt internal limits 
                key = truncateSingleValue(key, self.maxKeyLength, "userData increment_by", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData increment_by", log);
                change_custom_property(key, value, "$inc");
            },
            /**
            * Multiply value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to multiply server value
            * */
            multiply: function multiply(key, value) {
                log(logLevelEnums.INFO, "[userData] multiply, Multiplying user's custom property value under the key: [" + key + "] by: [" + value + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData multiply", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData multiply", log);
                change_custom_property(key, value, "$mul");
            },
            /**
            * Save maximal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store maximal value of both provided
            * */
            max: function max(key, value) {
                log(logLevelEnums.INFO, "[userData] max, Saving user's maximum custom property value compared to the value: [" + value + "] under the key: [" + key + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData max", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData max", log);
                change_custom_property(key, value, "$max");
            },
            /**
            * Save minimal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store minimal value of both provided
            * */
            min: function min(key, value) {
                log(logLevelEnums.INFO, "[userData] min, Saving user's minimum custom property value compared to the value: [" + value + "] under the key: [" + key + "]");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData min", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData min", log);
                change_custom_property(key, value, "$min");
            },
            /**
            * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            * */
            push: function push(key, value) {
                log(logLevelEnums.INFO, "[userData] push, Pushing a value: [" + value + "] under the key: [" + key + "] to user's custom property array");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData push", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData push", log);
                change_custom_property(key, value, "$push");
            },
            /**
            * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            * */
            push_unique: function push_unique(key, value) {
                log(logLevelEnums.INFO, "[userData] push_unique, Pushing a unique value: [" + value + "] under the key: [" + key + "] to user's custom property array");
                // truncate key value pair wrt internal limits
                key = truncateSingleValue(key, self.maxKeyLength, "userData push_unique", log);
                value = truncateSingleValue(value, self.maxValueSize, "userData push_unique", log);
                change_custom_property(key, value, "$addToSet");
            },
            /**
            * Remove value from array under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property
            * @param {string|number} value - value which to remove from array
            * */
            pull: function pull(key, value) {
                log(logLevelEnums.INFO, "[userData] pull, Removing the value: [" + value + "] under the key: [" + key + "] from user's custom property array");
                change_custom_property(key, value, "$pull");
            },
            /**
            * Save changes made to user's custom properties object and send them to server
            * @memberof Countly.userData
            * */
            save: function save() {
                log(logLevelEnums.INFO, "[userData] save, Saving changes to user's custom property");
                if (self.check_consent(featureEnums.USERS)) {
                    sendEventsForced(); // flush events to event queue to prevent a drill issue
                    log(logLevelEnums.INFO, "user_details, flushed the event queue");
                    toRequestQueue({ user_details: JSON.stringify({ custom: customData }) });
                }
                customData = {};
            }
        };

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
        this.report_trace = function(trace) {
            log(logLevelEnums.INFO, "report_trace, Reporting performance trace");
            if (this.check_consent(featureEnums.APM)) {
                var props = ["type", "name", "stz", "etz", "apm_metrics", "apm_attr"];
                for (var i = 0; i < props.length; i++) {
                    if (props[i] !== "apm_attr" && typeof trace[props[i]] === "undefined") {
                        log(logLevelEnums.WARNING, "report_trace, APM trace don't have the property: " + props[i]);
                        return;
                    }
                }
                // truncate trace name and metrics wrt internal limits
                trace.name = truncateSingleValue(trace.name, self.maxKeyLength, "report_trace", log);
                trace.app_metrics = truncateObject(trace.app_metrics, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "report_trace", log);
                var e = createNewObjectFromProperties(trace, props);
                e.timestamp = trace.stz;
                var date = new Date();
                e.hour = date.getHours();
                e.dow = date.getDay();
                toRequestQueue({
                    apm: JSON.stringify(e)
                });
                log(logLevelEnums.INFO, "report_trace, Successfully adding APM trace: ", e);
            }
        };

        /**
        * Automatically track javascript errors that happen on the website and report them to the server
        * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        * */
        this.track_errors = function(segments) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_errors, window object is not available. Not tracking errors.");
                return;
            }
            log(logLevelEnums.INFO, "track_errors, Started tracking errors");
            // Indicated that for this instance of the countly error tracking is enabled
            Countly.i[this.app_key].tracking_crashes = true;
            if (!window.cly_crashes) {
                window.cly_crashes = true;
                crashSegments = segments;
                // override global 'uncaught error' handler
                window.onerror = function errorBundler(msg, url, line, col, err) {
                    // old browsers like IE 10 and Safari 9 won't give this value 'err' to us, but if it is provided we can trigger error recording immediately
                    if (err !== undefined && err !== null) {
                        // false indicates fatal error (as in non_fatal:false)
                        dispatchErrors(err, false);
                    }
                    // fallback if no error object is present for older browsers, we create it instead
                    else {
                        col = col || window.event && window.event.errorCharacter;
                        var error = "";
                        if (typeof msg !== "undefined") {
                            error += msg + "\n";
                        }
                        if (typeof url !== "undefined") {
                            error += "at " + url;
                        }
                        if (typeof line !== "undefined") {
                            error += ":" + line;
                        }
                        if (typeof col !== "undefined") {
                            error += ":" + col;
                        }
                        error += "\n";
                        try {
                            var stack = [];
                            // deprecated, must be changed 
                            // eslint-disable-next-line no-caller
                            var f = errorBundler.caller;
                            while (f) {
                                stack.push(f.name);
                                f = f.caller;
                            }
                            error += stack.join("\n");
                        } catch (ex) {
                            log(logLevelEnums.ERROR, "track_errors, Call stack generation experienced a problem: " + ex);
                        }
                        // false indicates fatal error (as in non_fatal:false)
                        dispatchErrors(error, false);
                    }
                };

                // error handling for 'uncaught rejections'
                window.addEventListener("unhandledrejection", function(event) {
                    // true indicates non fatal error (as in non_fatal: true)
                    dispatchErrors(new Error("Unhandled rejection (reason: " + (event.reason && event.reason.stack ? event.reason.stack : event.reason) + ")."), true);
                });
            }
        };

        /**
        * Log an exception that you caught through try and catch block and handled yourself and just want to report it to server
        * @param {Object} err - error exception object provided in catch block
        * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        * */
        this.log_error = function(err, segments) {
            log(logLevelEnums.INFO, "log_error, Logging errors");
            // true indicates non fatal error (as in non_fatal:true)
            this.recordError(err, true, segments);
        };

        /**
        * Add new line in the log of breadcrumbs of what user did, will be included together with error report
        * @param {string} record - any text describing what user did
        * */
        this.add_log = function(record) {
            log(logLevelEnums.INFO, "add_log, Adding a new log of breadcrumbs: [ " + record + " ]");
            if (this.check_consent(featureEnums.CRASHES)) {
                // truncate description wrt internal limits
                record = truncateSingleValue(record, self.maxValueSize, "add_log", log);
                while (crashLogs.length >= self.maxBreadcrumbCount) {
                    crashLogs.shift();
                    log(logLevelEnums.WARNING, "add_log, Reached maximum crashLogs size. Will erase the oldest one.");
                }
                crashLogs.push(record);
            }
        };
        /**
        * Fetch remote config from the server (old one for method=fetch_remote_config API)
        * @param {array=} keys - Array of keys to fetch, if not provided will fetch all keys
        * @param {array=} omit_keys - Array of keys to omit, if provided will fetch all keys except provided ones
        * @param {function=} callback - Callback to notify with first param error and second param remote config object
        * */
        this.fetch_remote_config = function(keys, omit_keys, callback) {
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
            if (this.useExplicitRcApi) {
                log(logLevelEnums.INFO, "fetch_remote_config, Fetching remote config");
                // opt in is true(1) or false(0)
                var opt = this.rcAutoOptinAb ? 1 : 0;
                fetch_remote_config_explicit(keysFiltered, omitKeysFiltered, opt, null, callbackFiltered);
                return;
            }
            log(logLevelEnums.WARNING, "fetch_remote_config, Fetching remote config, with legacy API");
            fetch_remote_config_explicit(keysFiltered, omitKeysFiltered, null, "legacy", callbackFiltered);
        };

        /**
        * Fetch remote config from the server (new one with method=rc API)
        * @param {array=} keys - Array of keys to fetch, if not provided will fetch all keys
        * @param {array=} omit_keys - Array of keys to omit, if provided will fetch all keys except provided ones
        * @param {number=} optIn - an inter to indicate if the user is opted in for the AB testing or not (1 is opted in, 0 is opted out)
        * @param {string=} api - which API to use, if not provided would use default ("legacy" is for method="fetch_remote_config", default is method="rc")
        * @param {function=} callback - Callback to notify with first param error and second param remote config object
        * */
        function fetch_remote_config_explicit(keys, omit_keys, optIn, api, callback) {
            log(logLevelEnums.INFO, "fetch_remote_config_explicit, Fetching sequence initiated");
            var request = {
                method: "rc",
                av: self.app_version
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
            if (self.check_consent(featureEnums.SESSIONS)) {
                request.metrics = JSON.stringify(getMetrics());
            }
            if (self.check_consent(featureEnums.REMOTE_CONFIG)) {
                prepareRequest(request);
                makeNetworkRequest("fetch_remote_config_explicit", self.url + readPath, request, function(err, params, responseText) {
                    if (err) {
                        // error has been logged by the request function
                        return;
                    }
                    try {
                        var configs = JSON.parse(responseText);
                        if (request.keys || request.omit_keys) {
                            // we merge config
                            for (var i in configs) {
                                remoteConfigs[i] = configs[i];
                            }
                        }
                        else {
                            // we replace config
                            remoteConfigs = configs;
                        }
                        setValueInStorage("cly_remote_configs", remoteConfigs);
                    } catch (ex) {
                        log(logLevelEnums.ERROR, "fetch_remote_config_explicit, Had an issue while parsing the response: " + ex);
                    }
                    if (providedCall) {
                        log(logLevelEnums.INFO, "fetch_remote_config_explicit, Callback function is provided");
                        providedCall(err, remoteConfigs);
                    }
                    // JSON array can pass    
                }, true);
            }
            else {
                log(logLevelEnums.ERROR, "fetch_remote_config_explicit, Remote config requires explicit consent");
                if (providedCall) {
                    providedCall(new Error("Remote config requires explicit consent"), remoteConfigs);
                }
            }
        }

        /**
        * AB testing key provider, opts the user in for the selected keys
        * @param {array=} keys - Array of keys opt in FOR
        * */
        this.enrollUserToAb = function(keys) {
            log(logLevelEnums.INFO, "enrollUserToAb, Providing AB test keys to opt in for");
            if (!keys || !Array.isArray(keys) || keys.length === 0) {
                log(logLevelEnums.ERROR, "enrollUserToAb, No keys provided");
                return;
            }
            var request = {
                method: "ab",
                keys: JSON.stringify(keys),
                av: self.app_version
            };
            prepareRequest(request);
            makeNetworkRequest("enrollUserToAb", this.url + readPath, request, function(err, params, responseText) {
                if (err) {
                    // error has been logged by the request function
                    return;
                }
                try {
                    var resp = JSON.parse(responseText);
                    log(logLevelEnums.DEBUG, "enrollUserToAb, Parsed the response's result: [" + resp.result + "]");
                } catch (ex) {
                    log(logLevelEnums.ERROR, "enrollUserToAb, Had an issue while parsing the response: " + ex);
                }
                // JSON array can pass    
            }, true);
        };

        /**
        * Gets remote config object (all key/value pairs) or specific value for provided key from the storage
        * @param {string=} key - if provided, will return value for key, or return whole object
        * @returns {object} remote configs
        * */
        this.get_remote_config = function(key) {
            log(logLevelEnums.INFO, "get_remote_config, Getting remote config from storage");
            if (typeof key !== "undefined") {
                return remoteConfigs[key];
            }
            return remoteConfigs;
        };

        /**
        * Stop tracking duration time for this user
        * */
        this.stop_time = function() {
            log(logLevelEnums.INFO, "stop_time, Stopping tracking duration");
            if (trackTime) {
                trackTime = false;
                storedDuration = getTimestamp() - lastBeat;
                lastViewStoredDuration = getTimestamp() - lastViewTime;
            }
        };

        /** 
        * Start tracking duration time for this user, by default it is automatically tracked if you are using internal session handling
        * */
        this.start_time = function() {
            log(logLevelEnums.INFO, "start_time, Starting tracking duration");
            if (!trackTime) {
                trackTime = true;
                lastBeat = getTimestamp() - storedDuration;
                lastViewTime = getTimestamp() - lastViewStoredDuration;
                lastViewStoredDuration = 0;
                extendSession();
            }
        };

        /**
        * Track user sessions automatically, including  time user spent on your website
        * */
        this.track_sessions = function() {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_sessions, window object is not available. Not tracking sessions.");
                return;
            }
            log(logLevelEnums.INFO, "track_session, Starting tracking user session");
            // start session
            this.begin_session();
            this.start_time();
            // end session on unload
            add_event_listener(window, "beforeunload", function() {
                // empty the event queue
                sendEventsForced();
                self.end_session();
            });

            // manage sessions on window visibility events
            var hidden = "hidden";

            /**
             *  Handle visibility change events
             */
            function onchange() {
                if (document[hidden] || !document.hasFocus()) {
                    self.stop_time();
                }
                else {
                    self.start_time();
                }
            }

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
            }
            else if ("mozHidden" in document) {
                hidden = "mozHidden";
                document.addEventListener("mozvisibilitychange", onchange);
            }
            else if ("webkitHidden" in document) {
                hidden = "webkitHidden";
                document.addEventListener("webkitvisibilitychange", onchange);
            }
            else if ("msHidden" in document) {
                hidden = "msHidden";
                document.addEventListener("msvisibilitychange", onchange);
            }

            /**
             *  Reset inactivity counter and time
             */
            function resetInactivity() {
                if (inactivityCounter >= inactivityTime) {
                    self.start_time();
                }
                inactivityCounter = 0;
            }
            add_event_listener(window, "mousemove", resetInactivity);
            add_event_listener(window, "click", resetInactivity);
            add_event_listener(window, "keydown", resetInactivity);
            add_event_listener(window, "scroll", resetInactivity);

            // track user inactivity
            setInterval(function() {
                inactivityCounter++;
                if (inactivityCounter >= inactivityTime) {
                    self.stop_time();
                }
            }, 60000);
        };

        /**
        * Track page views user visits
        * @param {string=} page - optional name of the page, by default uses current url path
        * @param {array=} ignoreList - optional array of strings or regexps to test for the url/view name to ignore and not report
        * @param {object=} viewSegments - optional key value object with segments to report with the view
        * */
        this.track_pageview = function(page, ignoreList, viewSegments) {
            if (!isBrowser && !page) {
                log(logLevelEnums.WARNING, "track_pageview, window object is not available. Not tracking page views is page is not provided.");
                return;
            }
            log(logLevelEnums.INFO, "track_pageview, Tracking page views");
            log(logLevelEnums.VERBOSE, "track_pageview, last view is:[" + lastView + "], current view ID is:[" + currentViewId + "], previous view ID is:[" + previousViewId + "]");
            if (lastView && trackingScrolls) {
                log(logLevelEnums.DEBUG, "track_pageview, Scroll registry triggered");
                processScrollView(); // for single page site's view change
                isScrollRegistryOpen = true;
                scrollRegistryTopPosition = 0;
            }
            reportViewDuration();
            previousViewId = currentViewId;
            currentViewId = secureRandom();
            // truncate page name and segmentation wrt internal limits
            page = truncateSingleValue(page, self.maxKeyLength, "track_pageview", log);
            // if the first parameter we got is an array we got the ignoreList first, assign it here
            if (page && Array.isArray(page)) {
                ignoreList = page;
                page = null;
            }
            // no page or ignore list provided, get the current view name/url
            if (!page) {
                page = this.getViewName();
            }
            if (page === undefined || page === "") {
                log(logLevelEnums.ERROR, "track_pageview, No page name to track (it is either undefined or empty string). No page view can be tracked.");
                return;
            }
            if (page === null) {
                log(logLevelEnums.ERROR, "track_pageview, View name returned as null. Page view will be ignored.");
                return;
            }
            if (ignoreList && ignoreList.length) {
                for (var i = 0; i < ignoreList.length; i++) {
                    try {
                        var reg = new RegExp(ignoreList[i]);
                        if (reg.test(page)) {
                            log(logLevelEnums.INFO, "track_pageview, Ignoring the page: " + page);
                            return;
                        }
                    } catch (ex) {
                        log(logLevelEnums.ERROR, "track_pageview, Problem with finding ignore list item: " + ignoreList[i] + ", error: " + ex);
                    }
                }
            }
            lastView = page;
            lastViewTime = getTimestamp();
            log(logLevelEnums.VERBOSE, "track_pageview, last view is assigned:[" + lastView + "], current view ID is:[" + currentViewId + "], previous view ID is:[" + previousViewId + "]");
            var segments = {
                name: page,
                visit: 1,
                view: self.getViewUrl()
            };
            // truncate new segment
            segments = truncateObject(segments, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "track_pageview", log);
            if (this.track_domains) {
                segments.domain = window.location.hostname;
            }
            if (useSessionCookie) {
                if (!sessionStarted) {
                    // tracking view was called before tracking session, so we check expiration ourselves
                    var expire = getValueFromStorage("cly_session");
                    if (!expire || parseInt(expire) <= getTimestamp()) {
                        firstView = false;
                        segments.start = 1;
                    }
                }
                // tracking views called after tracking session, so we can rely on tracking session decision
                else if (firstView) {
                    firstView = false;
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
            if (freshUTMTags && Object.keys(freshUTMTags).length) {
                log(logLevelEnums.INFO, "track_pageview, Adding fresh utm tags to segmentation:[" + JSON.stringify(freshUTMTags) + "]");
                for (var utm in freshUTMTags) {
                    if (typeof segments["utm_" + utm] === "undefined") {
                        segments["utm_" + utm] = freshUTMTags[utm];
                    }
                }
                // TODO: Current logic adds utm tags to each view if the user landed with utm tags for that session(in non literal sense)
                // we might want to change this logic to add utm tags only to the first view's segmentation by freshUTMTags = null; here
            }

            // add referrer if it is usable
            if (isBrowser && isReferrerUsable()) {
                log(logLevelEnums.INFO, "track_pageview, Adding referrer to segmentation:[" + document.referrer + "]");
                segments.referrer = document.referrer; // add referrer
            }

            if (viewSegments) {
                viewSegments = truncateObject(viewSegments, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "track_pageview", log);
                for (var key in viewSegments) {
                    if (typeof segments[key] === "undefined") {
                        segments[key] = viewSegments[key];
                    }
                }
            }

            // track pageview
            if (this.check_consent(featureEnums.VIEWS)) {
                add_cly_events({
                    key: internalEventKeyEnums.VIEW,
                    segmentation: segments
                }, currentViewId);
            }
            else {
                lastParams.track_pageview = arguments;
            }
        };

        /**
        * Track page views user visits. Alias of {@link track_pageview} method for compatibility with NodeJS SDK
        * @param {string=} page - optional name of the page, by default uses current url path
        * @param {array=} ignoreList - optional array of strings or regexps to test for the url/view name to ignore and not report
        * @param {object=} segments - optional view segments to track with the view
        * */
        this.track_view = function(page, ignoreList, segments) {
            log(logLevelEnums.INFO, "track_view, Initiating tracking page views");
            this.track_pageview(page, ignoreList, segments);
        };

        /**
        * Track all clicks on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        this.track_clicks = function(parent) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_clicks, window object is not available. Not tracking clicks.");
                return;
            }
            log(logLevelEnums.INFO, "track_clicks, Starting to track clicks");
            if (parent) {
                log(logLevelEnums.INFO, "track_clicks, Tracking the specified children:[" + parent + "]");
            }
            parent = parent || document;
            var shouldProcess = true;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            function processClick(event) {
                if (shouldProcess) {
                    shouldProcess = false;

                    // cross browser click coordinates
                    get_page_coord(event);
                    if (typeof event.pageX !== "undefined" && typeof event.pageY !== "undefined") {
                        var height = getDocHeight();
                        var width = getDocWidth();

                        // record click event
                        if (self.check_consent(featureEnums.CLICKS)) {
                            var segments = {
                                type: "click",
                                x: event.pageX,
                                y: event.pageY,
                                width: width,
                                height: height,
                                view: self.getViewUrl()
                            };
                            // truncate new segment
                            segments = truncateObject(segments, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "processClick", log);
                            if (self.track_domains) {
                                segments.domain = window.location.hostname;
                            }
                            add_cly_events({
                                key: internalEventKeyEnums.ACTION,
                                segmentation: segments
                            });
                        }
                    }
                    setTimeout(function() {
                        shouldProcess = true;
                    }, 1000);
                }
            }
            // add any events you want
            add_event_listener(parent, "click", processClick);
        };

        /**
        * Track all scrolls on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        this.track_scrolls = function(parent) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_scrolls, window object is not available. Not tracking scrolls.");
                return;
            }
            log(logLevelEnums.INFO, "track_scrolls, Starting to track scrolls");
            if (parent) {
                log(logLevelEnums.INFO, "track_scrolls, Tracking the specified children");
            }
            parent = parent || window;
            isScrollRegistryOpen = true;
            trackingScrolls = true;
            add_event_listener(parent, "scroll", processScroll);
            add_event_listener(parent, "beforeunload", processScrollView);
        };

        /**
        * Generate custom event for all links that were clicked on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * */
        this.track_links = function(parent) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_links, window object is not available. Not tracking links.");
                return;
            }
            log(logLevelEnums.INFO, "track_links, Starting to track clicks to links");
            if (parent) {
                log(logLevelEnums.INFO, "track_links, Tracking the specified children");
            }
            parent = parent || document;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            function processClick(event) {
                // get element which was clicked
                var elem = get_closest_element(get_event_target(event), "a");
                if (elem) {
                    // cross browser click coordinates
                    get_page_coord(event);

                    // record click event
                    if (self.check_consent(featureEnums.CLICKS)) {
                        add_cly_events({
                            key: "linkClick",
                            segmentation: {
                                href: elem.href,
                                text: elem.innerText,
                                id: elem.id,
                                view: self.getViewUrl()
                            }
                        });
                    }
                }
            }

            // add any events you want
            add_event_listener(parent, "click", processClick);
        };

        /**
        * Generate custom event for all forms that were submitted on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean=} trackHidden - provide true to also track hidden inputs, default false
        * */
        this.track_forms = function(parent, trackHidden) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "track_forms, window object is not available. Not tracking forms.");
                return;
            }
            log(logLevelEnums.INFO, "track_forms, Starting to track form submissions. DOM object provided:[" + !!parent + "] Tracking hidden inputs :[" + !!trackHidden + "]");
            parent = parent || document;
            /**
             *  Get name of the input
             *  @param {HTMLElement} input - HTML input from which to get name
             *  @returns {String} name of the input
             */
            function getInputName(input) {
                return input.name || input.id || input.type || input.nodeName;
            }
            /**
             *  Process form data
             *  @param {Event} event - form submission event
             */
            function processForm(event) {
                var form = get_event_target(event);
                var segmentation = {
                    id: form.attributes.id && form.attributes.id.nodeValue,
                    name: form.attributes.name && form.attributes.name.nodeValue,
                    action: form.attributes.action && form.attributes.action.nodeValue,
                    method: form.attributes.method && form.attributes.method.nodeValue,
                    view: self.getViewUrl()
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
                                }
                                else {
                                    segmentation["input:" + getInputName(input)].push(input.options[input.selectedIndex].value);
                                }
                            }
                            else if (input.nodeName.toLowerCase() === "input") {
                                if (typeof input.type !== "undefined") {
                                    if (input.type.toLowerCase() === "checkbox" || input.type.toLowerCase() === "radio") {
                                        if (input.checked) {
                                            segmentation["input:" + getInputName(input)].push(input.value);
                                        }
                                    }
                                    else if (input.type.toLowerCase() !== "hidden" || trackHidden) {
                                        segmentation["input:" + getInputName(input)].push(input.value);
                                    }
                                }
                                else {
                                    segmentation["input:" + getInputName(input)].push(input.value);
                                }
                            }
                            else if (input.nodeName.toLowerCase() === "textarea") {
                                segmentation["input:" + getInputName(input)].push(input.value);
                            }
                            else if (typeof input.value !== "undefined") {
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
                if (self.check_consent(featureEnums.FORMS)) {
                    add_cly_events({
                        key: "formSubmit",
                        segmentation: segmentation
                    });
                }
            }

            // add any events you want
            add_event_listener(parent, "submit", processForm);
        };

        /**
        * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If not class is provided, Countly SDK will try to determine type of information automatically.
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean} [useCustom=false] - submit collected data as custom user properties, by default collects as main user properties
        * */
        this.collect_from_forms = function(parent, useCustom) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "collect_from_forms, window object is not available. Not collecting from forms.");
                return;
            }
            log(logLevelEnums.INFO, "collect_from_forms, Starting to collect possible user data. DOM object provided:[" + !!parent + "] Submitting custom user property:[" + !!useCustom + "]");
            parent = parent || document;
            /**
             *  Process form data
             *  @param {Event} event - form submission event
             */
            function processForm(event) {
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
                                    }
                                    else {
                                        value = input.options[input.selectedIndex].value;
                                    }
                                }
                                else if (input.nodeName.toLowerCase() === "input") {
                                    if (typeof input.type !== "undefined") {
                                        if (input.type.toLowerCase() === "checkbox" || input.type.toLowerCase() === "radio") {
                                            if (input.checked) {
                                                value = input.value;
                                            }
                                        }
                                        else {
                                            value = input.value;
                                        }
                                    }
                                    else {
                                        value = input.value;
                                    }
                                }
                                else if (input.nodeName.toLowerCase() === "textarea") {
                                    value = input.value;
                                }
                                else if (typeof input.value !== "undefined") {
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
                                }
                                else if (input.name && input.name.toLowerCase().indexOf("username") !== -1 || input.id && input.id.toLowerCase().indexOf("username") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("username") !== -1) {
                                    if (!userdata.username) {
                                        userdata.username = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if (input.name && (input.name.toLowerCase().indexOf("tel") !== -1 || input.name.toLowerCase().indexOf("phone") !== -1 || input.name.toLowerCase().indexOf("number") !== -1) || input.id && (input.id.toLowerCase().indexOf("tel") !== -1 || input.id.toLowerCase().indexOf("phone") !== -1 || input.id.toLowerCase().indexOf("number") !== -1) || input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("tel") !== -1 || labelData[input.id].toLowerCase().indexOf("phone") !== -1 || labelData[input.id].toLowerCase().indexOf("number") !== -1)) {
                                    if (!userdata.phone) {
                                        userdata.phone = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if (input.name && (input.name.toLowerCase().indexOf("org") !== -1 || input.name.toLowerCase().indexOf("company") !== -1) || input.id && (input.id.toLowerCase().indexOf("org") !== -1 || input.id.toLowerCase().indexOf("company") !== -1) || input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("org") !== -1 || labelData[input.id].toLowerCase().indexOf("company") !== -1)) {
                                    if (!userdata.organization) {
                                        userdata.organization = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if (input.name && input.name.toLowerCase().indexOf("name") !== -1 || input.id && input.id.toLowerCase().indexOf("name") !== -1 || input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("name") !== -1) {
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
                    log(logLevelEnums.INFO, "collect_from_forms, Gathered user data", userdata);
                    if (useCustom) {
                        self.user_details({
                            custom: userdata
                        });
                    }
                    else {
                        self.user_details(userdata);
                    }
                }
            }

            // add any events you want
            add_event_listener(parent, "submit", processForm);
        };

        /**
        * Collect information about user from Facebook, if your website integrates Facebook SDK. Call this method after Facebook SDK is loaded and user is authenticated.
        * @param {Object=} custom - Custom keys to collected from Facebook, key will be used to store as key in custom user properties and value as key in Facebook graph object. For example, {"tz":"timezone"} will collect Facebook's timezone property, if it is available and store it in custom user's property under "tz" key. If you want to get value from some sub object properties, then use dot as delimiter, for example, {"location":"location.name"} will collect data from Facebook's {"location":{"name":"MyLocation"}} object and store it in user's custom property "location" key
        * */
        this.collect_from_facebook = function(custom) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "collect_from_facebook, window object is not available. Not collecting from Facebook.");
                return;
            }
            if (typeof FB === "undefined" || !FB || !FB.api) {
                log(logLevelEnums.ERROR, "collect_from_facebook, Facebook SDK is not available");
                return;
            }
            log(logLevelEnums.INFO, "collect_from_facebook, Starting to collect possible user data");
            /* globals FB */
            FB.api("/me", function(resp) {
                var data = {};
                if (resp.name) {
                    data.name = resp.name;
                }
                if (resp.email) {
                    data.email = resp.email;
                }
                if (resp.gender === "male") {
                    data.gender = "M";
                }
                else if (resp.gender === "female") {
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
                self.user_details(data);
            });
        };
        /**
        * Opts out user of any metric tracking
        * */
        this.opt_out = function() {
            log(logLevelEnums.INFO, "opt_out, Opting out the user");
            this.ignore_visitor = true;
            setValueInStorage("cly_ignore", true);
        };

        /**
        * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
        * */
        this.opt_in = function() {
            log(logLevelEnums.INFO, "opt_in, Opting in the user");
            setValueInStorage("cly_ignore", false);
            this.ignore_visitor = false;
            checkIgnore();
            if (!this.ignore_visitor && !hasPulse) {
                heartBeat();
            }
        };
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
        this.report_feedback = function(ratingWidget) {
            log(logLevelEnums.WARNING, "report_feedback, Deprecated function call! Use 'recordRatingWidgetWithID' or 'reportFeedbackWidgetManually' in place of this call. Call will be redirected to 'recordRatingWidgetWithID' now!");
            this.recordRatingWidgetWithID(ratingWidget);
        };
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
        this.recordRatingWidgetWithID = function(ratingWidget) {
            log(logLevelEnums.INFO, "recordRatingWidgetWithID, Providing information about user with ID: [ " + ratingWidget.widget_id + " ]");
            if (!this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (!ratingWidget.widget_id) {
                log(logLevelEnums.ERROR, "recordRatingWidgetWithID, Rating Widget must contain widget_id property");
                return;
            }
            if (!ratingWidget.rating) {
                log(logLevelEnums.ERROR, "recordRatingWidgetWithID, Rating Widget must contain rating property");
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
                event.segmentation.app_version = this.metrics._app_version || this.app_version;
            }
            if (event.segmentation.rating > 5) {
                log(logLevelEnums.WARNING, "recordRatingWidgetWithID, You have entered a rating higher than 5. Changing it back to 5 now.");
                event.segmentation.rating = 5;
            }
            else if (event.segmentation.rating < 1) {
                log(logLevelEnums.WARNING, "recordRatingWidgetWithID, You have entered a rating lower than 1. Changing it back to 1 now.");
                event.segmentation.rating = 1;
            }
            log(logLevelEnums.INFO, "recordRatingWidgetWithID, Reporting Rating Widget: ", event);
            add_cly_events(event);
        };
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
        this.reportFeedbackWidgetManually = function(CountlyFeedbackWidget, CountlyWidgetData, widgetResult) {
            if (!this.check_consent(featureEnums.FEEDBACK)) {
                return;
            }
            if (!(CountlyFeedbackWidget && CountlyWidgetData)) {
                log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget data and/or Widget object not provided. Aborting.");
                return;
            }
            if (!CountlyFeedbackWidget._id) {
                log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Feedback Widgets must contain _id property");
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Feedback Widgets can not be reported in offline mode");
                return;
            }
            log(logLevelEnums.INFO, "reportFeedbackWidgetManually, Providing information about user with, provided result of the widget with  ID: [ " + CountlyFeedbackWidget._id + " ] and type: [" + CountlyFeedbackWidget.type + "]");

            // type specific checks to see if everything was provided
            var props = [];
            var type = CountlyFeedbackWidget.type;
            var eventKey;
            if (type === "nps") {
                if (widgetResult) {
                    if (!widgetResult.rating) {
                        log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget must contain rating property");
                        return;
                    }
                    widgetResult.rating = Math.round(widgetResult.rating);
                    if (widgetResult.rating > 10) {
                        log(logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating higher than 10. Changing it back to 10 now.");
                        widgetResult.rating = 10;
                    }
                    else if (widgetResult.rating < 0) {
                        log(logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating lower than 0. Changing it back to 0 now.");
                        widgetResult.rating = 0;
                    }
                    props = ["rating", "comment"];
                }
                eventKey = internalEventKeyEnums.NPS;
            }
            else if (type === "survey") {
                if (widgetResult) {
                    if (Object.keys(widgetResult).length < 1) {
                        log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget should have answers to be reported");
                        return;
                    }
                    props = Object.keys(widgetResult);
                }
                eventKey = internalEventKeyEnums.SURVEY;
            }
            else if (type === "rating") {
                if (widgetResult) {
                    if (!widgetResult.rating) {
                        log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget must contain rating property");
                        return;
                    }
                    widgetResult.rating = Math.round(widgetResult.rating);
                    if (widgetResult.rating > 5) {
                        log(logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating higher than 5. Changing it back to 5 now.");
                        widgetResult.rating = 5;
                    }
                    else if (widgetResult.rating < 1) {
                        log(logLevelEnums.WARNING, "reportFeedbackWidgetManually, You have entered a rating lower than 1. Changing it back to 1 now.");
                        widgetResult.rating = 1;
                    }
                    props = ["rating", "comment", "email", "contactMe"];
                }
                eventKey = internalEventKeyEnums.STAR_RATING;
            }
            else {
                log(logLevelEnums.ERROR, "reportFeedbackWidgetManually, Widget has an unacceptable type");
                return;
            }

            // event template
            var event = {
                key: eventKey,
                count: 1,
                segmentation: {
                    widget_id: CountlyFeedbackWidget._id,
                    platform: this.platform,
                    app_version: this.metrics._app_version || this.app_version
                }
            };
            if (widgetResult === null) {
                event.segmentation.closed = 1;
            }
            else {
                // add response to the segmentation
                event.segmentation = addNewProperties(event.segmentation, widgetResult, props);
            }

            // add event
            log(logLevelEnums.INFO, "reportFeedbackWidgetManually, Reporting " + type + ": ", event);
            add_cly_events(event);
        };
        /**
        * Show specific widget popup by the widget id
        * @param {string} id - id value of related rating widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
        * 
        * @deprecated use 'presentRatingWidgetWithID' in place of this call
        */
        this.show_feedback_popup = function(id) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "show_feedback_popup, window object is not available. Not showing feedback popup.");
                return;
            }
            log(logLevelEnums.WARNING, "show_feedback_popup, Deprecated function call! Use 'presentRatingWidgetWithID' in place of this call. Call will be redirected now!");
            this.presentRatingWidgetWithID(id);
        };
        /**
        * Show specific widget popup by the widget id
        * @param {string} id - id value of related rating widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
        */
        this.presentRatingWidgetWithID = function(id) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "presentRatingWidgetWithID, window object is not available. Not showing rating widget popup.");
                return;
            }
            log(logLevelEnums.INFO, "presentRatingWidgetWithID, Showing rating widget popup for the widget with ID: [ " + id + " ]");
            if (!this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.ERROR, "presentRatingWidgetWithID, Cannot show ratingWidget popup in offline mode");
            }
            else {
                makeNetworkRequest("presentRatingWidgetWithID,", this.url + "/o/feedback/widget", {
                    widget_id: id,
                    av: self.app_version
                }, function(err, params, responseText) {
                    if (err) {
                        // error has been logged by the request function
                        return;
                    }
                    try {
                        // widget object
                        var currentWidget = JSON.parse(responseText);
                        processWidget(currentWidget, false);
                    } catch (JSONParseError) {
                        log(logLevelEnums.ERROR, "presentRatingWidgetWithID, JSON parse failed: " + JSONParseError);
                    }
                    // JSON array can pass 
                }, true);
            }
        };

        /**
        * Prepare rating widgets according to the current options
        * @param {array=} enableWidgets - widget ids array
        * 
        * @deprecated use 'initializeRatingWidgets' in place of this call
        */
        this.initialize_feedback_popups = function(enableWidgets) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "initialize_feedback_popups, window object is not available. Not initializing feedback popups.");
                return;
            }
            log(logLevelEnums.WARNING, "initialize_feedback_popups, Deprecated function call! Use 'initializeRatingWidgets' in place of this call. Call will be redirected now!");
            this.initializeRatingWidgets(enableWidgets);
        };
        /**
        * Prepare rating widgets according to the current options
        * @param {array=} enableWidgets - widget ids array
        */
        this.initializeRatingWidgets = function(enableWidgets) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "initializeRatingWidgets, window object is not available. Not initializing rating widgets.");
                return;
            }
            log(logLevelEnums.INFO, "initializeRatingWidgets, Initializing rating widget with provided widget IDs:[ " + enableWidgets + "]");
            if (!this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (!enableWidgets) {
                enableWidgets = getValueFromStorage("cly_fb_widgets");
            }

            // remove all old stickers before add new one
            var stickers = document.getElementsByClassName("countly-feedback-sticker");
            while (stickers.length > 0) {
                stickers[0].remove();
            }
            makeNetworkRequest("initializeRatingWidgets,", this.url + "/o/feedback/multiple-widgets-by-id", {
                widgets: JSON.stringify(enableWidgets),
                av: self.app_version
            }, function(err, params, responseText) {
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
                                    processWidget(widgets[i], true);
                                }
                                // is target_page option provided as "selected"?
                                else {
                                    var pages = widgets[i].target_pages;
                                    for (var k = 0; k < pages.length; k++) {
                                        var isWildcardMatched = pages[k].substr(0, pages[k].length - 1) === window.location.pathname.substr(0, pages[k].length - 1);
                                        var isFullPathMatched = pages[k] === window.location.pathname;
                                        var isContainAsterisk = pages[k].includes("*");
                                        if ((isContainAsterisk && isWildcardMatched || isFullPathMatched) && !widgets[i].hide_sticker) {
                                            processWidget(widgets[i], true);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (JSONParseError) {
                    log(logLevelEnums.ERROR, "initializeRatingWidgets, JSON parse error: " + JSONParseError);
                }
                // JSON array can pass
            }, true);
        };

        /**
        * Show rating widget popup by passed widget ids array
        * @param {object=} params - required - includes "popups" property as string array of widgets ("widgets" for old versions)
        * example params: {"popups":["5b21581b967c4850a7818617"]}
        * 
        * @deprecated use 'enableRatingWidgets' in place of this call
        * */
        this.enable_feedback = function(params) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "enable_feedback, window object is not available. Not enabling feedback.");
                return;
            }
            log(logLevelEnums.WARNING, "enable_feedback, Deprecated function call! Use 'enableRatingWidgets' in place of this call. Call will be redirected now!");
            this.enableRatingWidgets(params);
        };
        /**
        * Show rating widget popup by passed widget ids array
        * @param {object=} params - required - includes "popups" property as string array of widgets ("widgets" for old versions)
        * example params: {"popups":["5b21581b967c4850a7818617"]}
        * */
        this.enableRatingWidgets = function(params) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "enableRatingWidgets, window object is not available. Not enabling rating widgets.");
                return;
            }
            log(logLevelEnums.INFO, "enableRatingWidgets, Enabling rating widget with params:", params);
            if (!this.check_consent(featureEnums.STAR_RATING)) {
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.ERROR, "enableRatingWidgets, Cannot enable rating widgets in offline mode");
            }
            else {
                setValueInStorage("cly_fb_widgets", params.popups || params.widgets);
                // inject feedback styles
                loadCSS(this.url + "/star-rating/stylesheets/countly-feedback-web.css");
                // get enable widgets by app_key
                // define xhr object
                var enableWidgets = params.popups || params.widgets;
                if (enableWidgets.length > 0) {
                    document.body.insertAdjacentHTML("beforeend", "<div id=\"cfbg\"></div>");
                    this.initializeRatingWidgets(enableWidgets);
                }
                else {
                    log(logLevelEnums.ERROR, "enableRatingWidgets, You should provide at least one widget id as param. Read documentation for more detail. https://resources.count.ly/plugins/feedback");
                }
            }
        };

        /**
        * This function retrieves all associated widget information (IDs, type, name etc in an array/list of objects) of your app
        * @param {Function} callback - Callback function with two parameters, 1st for returned list, 2nd for error
        * */
        this.get_available_feedback_widgets = function(callback) {
            log(logLevelEnums.INFO, "get_available_feedback_widgets, Getting the feedback list, callback function is provided:[" + !!callback + "]");
            if (!this.check_consent(featureEnums.FEEDBACK)) {
                if (callback) {
                    callback(null, new Error("Consent for feedback not provided."));
                }
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.ERROR, "get_available_feedback_widgets, Cannot enable feedback widgets in offline mode.");
                return;
            }
            var url = this.url + readPath;
            var data = {
                method: featureEnums.FEEDBACK,
                device_id: this.device_id,
                app_key: this.app_key,
                av: self.app_version
            };
            makeNetworkRequest("get_available_feedback_widgets,", url, data, function(err, params, responseText) {
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
                    log(logLevelEnums.ERROR, "get_available_feedback_widgets, Error while parsing feedback widgets list: " + error);
                    if (callback) {
                        callback(null, error);
                    }
                }
                // expected response is JSON object
            }, false);
        };

        /**
        * Get feedback (nps, survey or rating) widget data, like questions, message etc.
        * @param {Object} CountlyFeedbackWidget - Widget object, retrieved from 'get_available_feedback_widgets'
        * @param {Function} callback - Callback function with two parameters, 1st for returned widget data, 2nd for error
        * */
        this.getFeedbackWidgetData = function(CountlyFeedbackWidget, callback) {
            if (!CountlyFeedbackWidget.type) {
                log(logLevelEnums.ERROR, "getFeedbackWidgetData, Expected the provided widget object to have a type but got: [" + JSON.stringify(CountlyFeedbackWidget) + "], aborting.");
                return;
            }
            log(logLevelEnums.INFO, "getFeedbackWidgetData, Retrieving data for: [" + JSON.stringify(CountlyFeedbackWidget) + "], callback function is provided:[" + !!callback + "]");
            if (!this.check_consent(featureEnums.FEEDBACK)) {
                if (callback) {
                    callback(null, new Error("Consent for feedback not provided."));
                }
                return;
            }
            if (offlineMode) {
                log(logLevelEnums.ERROR, "getFeedbackWidgetData, Cannot enable feedback widgets in offline mode.");
                return;
            }
            var url = this.url;
            var data = {
                widget_id: CountlyFeedbackWidget._id,
                shown: 1,
                sdk_version: SDK_VERSION,
                sdk_name: SDK_NAME,
                platform: this.platform,
                app_version: this.app_version
            };
            if (CountlyFeedbackWidget.type === "nps") {
                url += "/o/surveys/nps/widget";
            }
            else if (CountlyFeedbackWidget.type === "survey") {
                url += "/o/surveys/survey/widget";
            }
            else if (CountlyFeedbackWidget.type === "rating") {
                url += "/o/surveys/rating/widget";
            }
            else {
                log(logLevelEnums.ERROR, "getFeedbackWidgetData, Unknown type info: [" + CountlyFeedbackWidget.type + "]");
                return;
            }
            makeNetworkRequest("getFeedbackWidgetData,", url, data, responseCallback, true);

            /**
             *  Server response would be evaluated here
             * @param {*} err - error object
             * @param {*} params - parameters
             * @param {*} responseText - server reponse text
             */
            function responseCallback(err, params, responseText) {
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
                    log(logLevelEnums.ERROR, "getFeedbackWidgetData, Error while parsing feedback widgets list: " + error);
                    if (callback) {
                        callback(null, error);
                    }
                }
            }
        };

        /**
        * Present the feedback widget in webview
        * @param {Object} presentableFeedback - Current presentable feedback
        * @param {String} [id] - DOM id to append the feedback widget (optional, in case not used pass undefined)
        * @param {String} [className] - Class name to append the feedback widget (optional, in case not used pass undefined)
        * @param {Object} [feedbackWidgetSegmentation] - Segmentation object to be passed to the feedback widget (optional)
        * */
        this.present_feedback_widget = function(presentableFeedback, id, className, feedbackWidgetSegmentation) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "present_feedback_widget, window object is not available. Not presenting feedback widget.");
                return;
            }
            // TODO: feedbackWidgetSegmentation implementation only assumes we want to send segmentation data. Change it if we add more data to the custom object.
            log(logLevelEnums.INFO, "present_feedback_widget, Presenting the feedback widget by appending to the element with ID: [ " + id + " ] and className: [ " + className + " ]");
            if (!this.check_consent(featureEnums.FEEDBACK)) {
                return;
            }
            if (!presentableFeedback || _typeof(presentableFeedback) !== "object" || Array.isArray(presentableFeedback)) {
                log(logLevelEnums.ERROR, "present_feedback_widget, Please provide at least one feedback widget object.");
                return;
            }
            log(logLevelEnums.INFO, "present_feedback_widget, Adding segmentation to feedback widgets:[" + JSON.stringify(feedbackWidgetSegmentation) + "]");
            if (!feedbackWidgetSegmentation || _typeof(feedbackWidgetSegmentation) !== "object" || Object.keys(feedbackWidgetSegmentation).length === 0) {
                log(logLevelEnums.DEBUG, "present_feedback_widget, Segmentation is not an object or empty");
                feedbackWidgetSegmentation = null;
            }
            try {
                var url = this.url;
                if (presentableFeedback.type === "nps") {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Widget type: nps.");
                    url += "/feedback/nps";
                }
                else if (presentableFeedback.type === "survey") {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Widget type: survey.");
                    url += "/feedback/survey";
                }
                else if (presentableFeedback.type === "rating") {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Widget type: rating.");
                    url += "/feedback/rating";
                }
                else {
                    log(logLevelEnums.ERROR, "present_feedback_widget, Feedback widget only accepts nps, rating and survey types.");
                    return;
                }
                var passedOrigin = window.origin || window.location.origin;
                var feedbackWidgetFamily;

                // set feedback widget family as ratings and load related style file when type is ratings
                if (presentableFeedback.type === "rating") {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Loading css for rating widget.");
                    feedbackWidgetFamily = "ratings";
                    loadCSS(this.url + "/star-rating/stylesheets/countly-feedback-web.css");
                }
                // if it's not ratings, it means we need to name it as surveys and load related style file
                // (at least until we add new type in future)
                else {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Loading css for survey or nps.");
                    loadCSS(this.url + "/surveys/stylesheets/countly-surveys.css");
                    feedbackWidgetFamily = "surveys";
                }
                url += "?widget_id=" + presentableFeedback._id;
                url += "&app_key=" + this.app_key;
                url += "&device_id=" + this.device_id;
                url += "&sdk_name=" + SDK_NAME;
                url += "&platform=" + this.platform;
                url += "&app_version=" + this.app_version;
                url += "&sdk_version=" + SDK_VERSION;
                if (feedbackWidgetSegmentation) {
                    var customObjectToSendWithTheWidget = {};
                    customObjectToSendWithTheWidget.sg = feedbackWidgetSegmentation;
                    url += "&custom=" + JSON.stringify(customObjectToSendWithTheWidget);
                }
                // Origin is passed to the popup so that it passes it back in the postMessage event
                // Only web SDK passes origin and web
                url += "&origin=" + passedOrigin;
                url += "&widget_v=web";
                var iframe = document.createElement("iframe");
                iframe.src = url;
                iframe.name = "countly-" + feedbackWidgetFamily + "-iframe";
                iframe.id = "countly-" + feedbackWidgetFamily + "-iframe";
                var initiated = false;
                iframe.onload = function() {
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
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Loaded iframe.");
                };
                var overlay = document.getElementById("csbg");
                while (overlay) {
                    // Remove any existing overlays
                    overlay.remove();
                    overlay = document.getElementById("csbg");
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Removing past overlay.");
                }
                var wrapper = document.getElementsByClassName("countly-" + feedbackWidgetFamily + "-wrapper");
                for (var i = 0; i < wrapper.length; i++) {
                    // Remove any existing feedback wrappers
                    wrapper[i].remove();
                    log(logLevelEnums.DEBUG, "present_feedback_widget, Removed a wrapper.");
                }
                wrapper = document.createElement("div");
                wrapper.className = "countly-" + feedbackWidgetFamily + "-wrapper";
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
                    }
                    else {
                        log(logLevelEnums.ERROR, "present_feedback_widget, Provided ID not found.");
                    }
                }
                if (!found) {
                    // If the id element is not found check if a class was provided
                    if (className) {
                        if (document.getElementsByClassName(className)[0]) {
                            element = document.getElementsByClassName(className)[0];
                        }
                        else {
                            log(logLevelEnums.ERROR, "present_feedback_widget, Provided class not found.");
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
                    log(logLevelEnums.DEBUG, "present_feedback_widget, appended the rating overlay to wrapper");

                    // add an event listener for the overlay
                    // so if someone clicked on the overlay, we can close popup
                    add_event_listener(document.getElementById("countly-ratings-overlay-" + presentableFeedback._id), "click", function() {
                        document.getElementById("countly-ratings-wrapper-" + presentableFeedback._id).style.display = "none";
                    });
                }
                wrapper.appendChild(iframe);
                log(logLevelEnums.DEBUG, "present_feedback_widget, Appended the iframe");
                add_event_listener(window, "message", function(e) {
                    var data = {};
                    try {
                        data = JSON.parse(e.data);
                        log(logLevelEnums.DEBUG, "present_feedback_widget, Parsed response message " + data);
                    } catch (ex) {
                        log(logLevelEnums.ERROR, "present_feedback_widget, Error while parsing message body " + ex);
                    }
                    if (!data.close) {
                        log(logLevelEnums.DEBUG, "present_feedback_widget, Closing signal not sent yet");
                        return;
                    }
                    document.getElementById("countly-" + feedbackWidgetFamily + "-wrapper-" + presentableFeedback._id).style.display = "none";
                    document.getElementById("csbg").style.display = "none";
                });
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
                            }
                            else {
                                add_event_listener(document, "readystatechange", function(e) {
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
                            setTimeout(function() {
                                if (!surveyShown) {
                                    surveyShown = true;
                                    showSurvey(presentableFeedback);
                                }
                            }, 10000);
                            break;
                        case "onAbandon":
                            if (document.readyState === "complete") {
                                add_event_listener(document, "mouseleave", function() {
                                    if (!surveyShown) {
                                        surveyShown = true;
                                        showSurvey(presentableFeedback);
                                    }
                                });
                            }
                            else {
                                add_event_listener(document, "readystatechange", function(e) {
                                    if (e.target.readyState === "complete") {
                                        add_event_listener(document, "mouseleave", function() {
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
                            add_event_listener(window, "scroll", function() {
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
                }
                else if (presentableFeedback.type === "nps") {
                    document.getElementById("countly-" + feedbackWidgetFamily + "-wrapper-" + presentableFeedback._id).style.display = "block";
                    document.getElementById("csbg").style.display = "block";
                }
                else if (presentableFeedback.type === "rating") {
                    var ratingShown = false;
                    if (document.readyState === "complete") {
                        if (!ratingShown) {
                            ratingShown = true;
                            showRatingForFeedbackWidget(presentableFeedback);
                        }
                    }
                    else {
                        add_event_listener(document, "readystatechange", function(e) {
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
                log(logLevelEnums.ERROR, "present_feedback_widget, Something went wrong while presenting the widget: " + e);
            }

            /**
             * Function to show survey popup
             * @param  {Object} feedback - feedback object
             */
            function showSurvey(feedback) {
                document.getElementById("countly-surveys-wrapper-" + feedback._id).style.display = "block";
                document.getElementById("csbg").style.display = "block";
            }

            /**
             * Function to prepare rating sticker and feedback widget
             * @param  {Object} feedback - feedback object
             */
            function showRatingForFeedbackWidget(feedback) {
                // render sticker if hide sticker property isn't set
                if (!feedback.appearance.hideS) {
                    log(logLevelEnums.DEBUG, "present_feedback_widget, handling the sticker as it was not set to hidden");
                    // create sticker wrapper element
                    var sticker = document.createElement("div");
                    sticker.innerText = feedback.appearance.text;
                    sticker.style.color = feedback.appearance.text_color.length < 7 ? "#" + feedback.appearance.text_color : feedback.appearance.text_color;
                    sticker.style.backgroundColor = feedback.appearance.bg_color.length < 7 ? "#" + feedback.appearance.bg_color : feedback.appearance.bg_color;
                    sticker.className = "countly-feedback-sticker  " + feedback.appearance.position + "-" + feedback.appearance.size;
                    sticker.id = "countly-feedback-sticker-" + feedback._id;
                    document.body.appendChild(sticker);

                    // sticker event handler
                    add_event_listener(document.getElementById("countly-feedback-sticker-" + feedback._id), "click", function() {
                        document.getElementById("countly-ratings-wrapper-" + feedback._id).style.display = "flex";
                        document.getElementById("csbg").style.display = "block";
                    });
                }

                // feedback widget close event handler
                // TODO: Check if this is still valid
                add_event_listener(document.getElementById("countly-feedback-close-icon-" + feedback._id), "click", function() {
                    document.getElementById("countly-ratings-wrapper-" + feedback._id).style.display = "none";
                    document.getElementById("csbg").style.display = "none";
                });
            }
        };

        /**
         *  Record and report error, this is were tracked errors are modified and send to the request queue
         *  @param {Error} err - Error object
         *  @param {Boolean} nonfatal - nonfatal if true and false if fatal
         *  @param {Object} segments - custom crash segments
         */
        this.recordError = function(err, nonfatal, segments) {
            log(logLevelEnums.INFO, "recordError, Recording error");
            if (this.check_consent(featureEnums.CRASHES) && err) {
                // crashSegments, if not null, was set while enabling error tracking
                segments = segments || crashSegments;
                var error = "";
                if (_typeof(err) === "object") {
                    if (typeof err.stack !== "undefined") {
                        error = err.stack;
                    }
                    else {
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
                }
                else {
                    error = err + "";
                }
                // character limit check
                if (error.length > self.maxStackTraceLineLength * self.maxStackTraceLinesPerThread) {
                    log(logLevelEnums.DEBUG, "record_error, Error stack is too long will be truncated");
                    // convert error into an array split from each newline 
                    var splittedError = error.split("\n");
                    // trim the array if it is too long
                    if (splittedError.length > self.maxStackTraceLinesPerThread) {
                        splittedError = splittedError.splice(0, self.maxStackTraceLinesPerThread);
                    }
                    // trim each line to a given limit
                    for (var i = 0, len = splittedError.length; i < len; i++) {
                        if (splittedError[i].length > self.maxStackTraceLineLength) {
                            splittedError[i] = splittedError[i].substring(0, self.maxStackTraceLineLength);
                        }
                    }
                    // turn modified array back into error string
                    error = splittedError.join("\n");
                }
                nonfatal = !!nonfatal;
                var metrics = getMetrics();
                var obj = {
                    _resolution: metrics._resolution,
                    _error: error,
                    _app_version: metrics._app_version,
                    _run: getTimestamp() - startTime
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
                if (crashLogs.length > 0) {
                    obj._logs = crashLogs.join("\n");
                }
                crashLogs = [];
                obj._nonfatal = nonfatal;
                obj._view = this.getViewName();
                if (typeof segments !== "undefined") {
                    // truncate custom crash segment's key value pairs
                    segments = truncateObject(segments, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "record_error", log);
                    obj._custom = segments;
                }
                try {
                    var canvas = document.createElement("canvas");
                    var gl = canvas.getContext("experimental-webgl");
                    obj._opengl = gl.getParameter(gl.VERSION);
                } catch (ex) {
                    log(logLevelEnums.ERROR, "Could not get the experimental-webgl context: " + ex);
                }

                // send userAgent string with the crash object incase it gets removed by a gateway
                var req = {};
                req.crash = JSON.stringify(obj);
                req.metrics = JSON.stringify({
                    _ua: metrics._ua
                });
                toRequestQueue(req);
            }
        };

        /**
         *  Check if user or visit should be ignored
         */
        function checkIgnore() {
            if (self.ignore_prefetch && isBrowser && typeof document.visibilityState !== "undefined" && document.visibilityState === "prerender") {
                self.ignore_visitor = true;
            }
            if (self.ignore_bots && userAgentSearchBotDetection()) {
                self.ignore_visitor = true;
            }
        }

        /**
         * Check and send the events to request queue if there are any, empty the event queue
         */
        function sendEventsForced() {
            if (eventQueue.length > 0) {
                log(logLevelEnums.DEBUG, "Flushing events");
                toRequestQueue({
                    events: JSON.stringify(eventQueue)
                });
                eventQueue = [];
                setValueInStorage("cly_event", eventQueue);
            }
        }

        /**
         *  Prepare widget data for displaying
         *  @param {Object} currentWidget - widget object
         *  @param {Boolean} hasSticker - if widget has sticker
         */
        function processWidget(currentWidget, hasSticker) {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "processWidget, window object is not available. Not processing widget.");
                return;
            }
            // prevent widget create process if widget exist with same id
            var isDuplicate = !!document.getElementById("countly-feedback-sticker-" + currentWidget._id);
            if (isDuplicate) {
                log(logLevelEnums.ERROR, "Widget with same ID exists");
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
                iframe.src = self.url + "/feedback?widget_id=" + currentWidget._id + "&app_key=" + self.app_key + "&device_id=" + self.device_id + "&sdk_version=" + SDK_VERSION;
                // inject them to dom
                document.body.appendChild(wrapper);
                wrapper.appendChild(closeIcon);
                wrapper.appendChild(iframe);
                add_event_listener(document.getElementById("countly-feedback-close-icon-" + currentWidget._id), "click", function() {
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
                    add_event_listener(document.getElementById("countly-feedback-sticker-" + currentWidget._id), "click", function() {
                        document.getElementById("countly-iframe-wrapper-" + currentWidget._id).style.display = "block";
                        document.getElementById("cfbg").style.display = "block";
                    });
                }
                else {
                    document.getElementById("countly-iframe-wrapper-" + currentWidget._id).style.display = "block";
                    document.getElementById("cfbg").style.display = "block";
                }
            } catch (e) {
                log(logLevelEnums.ERROR, "Somethings went wrong while element injecting process: " + e);
            }
        }

        /**
         *  Notify all waiting callbacks that script was loaded and instance created
         */
        function notifyLoaders() {
            // notify load waiters
            var i;
            if (typeof self.onload !== "undefined" && self.onload.length > 0) {
                for (i = 0; i < self.onload.length; i++) {
                    if (typeof self.onload[i] === "function") {
                        self.onload[i](self);
                    }
                }
                self.onload = [];
            }
        }

        /**
         *  Report duration of how long user was on this view
         *  @memberof Countly._internals
         */
        function reportViewDuration() {
            if (lastView) {
                var segments = {
                    name: lastView
                };

                // track pageview
                if (self.check_consent(featureEnums.VIEWS)) {
                    add_cly_events({
                        key: internalEventKeyEnums.VIEW,
                        dur: trackTime ? getTimestamp() - lastViewTime : lastViewStoredDuration,
                        segmentation: segments
                    }, currentViewId);
                    lastView = null;
                }
            }
        }

        /**
         *  Get last view that user visited
         *  @memberof Countly._internals
         *  @returns {String} view name
         */
        function getLastView() {
            return lastView;
        }

        /**
         *  Extend session's cookie's time
         */
        function extendSession() {
            if (useSessionCookie) {
                // if session expired, we should start a new one
                var expire = getValueFromStorage("cly_session");
                if (!expire || parseInt(expire) <= getTimestamp()) {
                    sessionStarted = false;
                    self.begin_session(!autoExtend);
                }
                setValueInStorage("cly_session", getTimestamp() + sessionCookieTimeout * 60);
            }
        }

        /**
         *  Prepare request params by adding common properties to it
         *  @param {Object} request - request object
         */
        function prepareRequest(request) {
            request.app_key = self.app_key;
            request.device_id = self.device_id;
            request.sdk_name = SDK_NAME;
            request.sdk_version = SDK_VERSION;
            request.t = deviceIdType;
            request.av = self.app_version;
            var ua = getUA();
            if (!request.metrics) {
                // if metrics not provided pass useragent with this event
                request.metrics = JSON.stringify({
                    _ua: ua
                });
            }
            else {
                // if metrics provided
                var currentMetrics = JSON.parse(request.metrics);
                if (!currentMetrics._ua) {
                    // check if ua is present and if not add that
                    currentMetrics._ua = ua;
                    request.metrics = JSON.stringify(currentMetrics);
                }
            }
            if (self.check_consent(featureEnums.LOCATION)) {
                if (self.country_code) {
                    request.country_code = self.country_code;
                }
                if (self.city) {
                    request.city = self.city;
                }
                if (self.ip_address !== null) {
                    request.ip_address = self.ip_address;
                }
            }
            else {
                request.location = "";
            }
            request.timestamp = getMsTimestamp();
            var date = new Date();
            request.hour = date.getHours();
            request.dow = date.getDay();
        }

        /**
         *  Add request to request queue
         *  @memberof Countly._internals
         *  @param {Object} request - object with request parameters
         */
        function toRequestQueue(request) {
            if (self.ignore_visitor) {
                log(logLevelEnums.WARNING, "User is opt_out will ignore the request: " + request);
                return;
            }
            if (!self.app_key || !self.device_id) {
                log(logLevelEnums.ERROR, "app_key or device_id is missing ", self.app_key, self.device_id);
                return;
            }
            prepareRequest(request);
            if (requestQueue.length > queueSize) {
                requestQueue.shift();
            }
            requestQueue.push(request);
            setValueInStorage("cly_queue", requestQueue, true);
        }

        /**
         *  Making request making and data processing loop
         *  @memberof Countly._internals
         *  @returns {void} void
         */
        function heartBeat() {
            notifyLoaders();

            // ignore bots
            if (self.ignore_visitor) {
                hasPulse = false;
                log(logLevelEnums.WARNING, "User opt_out, no heartbeat");
                return;
            }
            hasPulse = true;
            var i = 0;
            // process queue
            if (global && typeof Countly.q !== "undefined" && Countly.q.length > 0) {
                var req;
                var q = Countly.q;
                Countly.q = [];
                for (i = 0; i < q.length; i++) {
                    req = q[i];
                    log(logLevelEnums.DEBUG, "Processing queued call", req);
                    if (typeof req === "function") {
                        req();
                    }
                    else if (Array.isArray(req) && req.length > 0) {
                        var inst = self;
                        var arg = 0;
                        // check if it is meant for other tracker
                        if (Countly.i[req[arg]]) {
                            inst = Countly.i[req[arg]];
                            arg++;
                        }
                        if (typeof inst[req[arg]] === "function") {
                            inst[req[arg]].apply(inst, req.slice(arg + 1));
                        }
                        else if (req[arg].indexOf("userData.") === 0) {
                            var userdata = req[arg].replace("userData.", "");
                            if (typeof inst.userData[userdata] === "function") {
                                inst.userData[userdata].apply(inst, req.slice(arg + 1));
                            }
                        }
                        else if (typeof Countly[req[arg]] === "function") {
                            Countly[req[arg]].apply(Countly, req.slice(arg + 1));
                        }
                    }
                }
            }

            // extend session if needed
            if (sessionStarted && autoExtend && trackTime) {
                var last = getTimestamp();
                if (last - lastBeat > sessionUpdate) {
                    self.session_duration(last - lastBeat);
                    lastBeat = last;
                    // save health check logging counters if there are any
                    if (self.hcErrorCount > 0) {
                        setValueInStorage(healthCheckCounterEnum.errorCount, self.hcErrorCount);
                    }
                    if (self.hcWarningCount > 0) {
                        setValueInStorage(healthCheckCounterEnum.warningCount, self.hcWarningCount);
                    }
                }
            }

            // process event queue
            if (eventQueue.length > 0 && !self.test_mode_eq) {
                if (eventQueue.length <= maxEventBatch) {
                    toRequestQueue({
                        events: JSON.stringify(eventQueue)
                    });
                    eventQueue = [];
                }
                else {
                    var events = eventQueue.splice(0, maxEventBatch);
                    toRequestQueue({
                        events: JSON.stringify(events)
                    });
                }
                setValueInStorage("cly_event", eventQueue);
            }

            // process request queue with event queue
            if (!offlineMode && requestQueue.length > 0 && readyToProcess && getTimestamp() > failTimeout) {
                readyToProcess = false;
                var params = requestQueue[0];
                params.rr = requestQueue.length; // added at 23.2.3. It would give the current length of the queue. That includes the current request.
                log(logLevelEnums.DEBUG, "Processing request", params);
                setValueInStorage("cly_queue", requestQueue, true);
                if (!self.test_mode) {
                    makeNetworkRequest("send_request_queue", self.url + apiPath, params, function(err, parameters) {
                        if (err) {
                            // error has been logged by the request function
                            failTimeout = getTimestamp() + failTimeoutAmount;
                        }
                        else {
                            // remove first item from queue
                            requestQueue.shift();
                        }
                        setValueInStorage("cly_queue", requestQueue, true);
                        readyToProcess = true;
                        // expected response is only JSON object
                    }, false);
                }
            }
            setTimeout(heartBeat, beatInterval);
        }

        /**
         *  Get device ID, stored one, or generate new one
         *  @memberof Countly._internals
         *  @returns {String} device id
         */
        function getStoredIdOrGenerateId() {
            var storedDeviceId = getValueFromStorage("cly_id");
            if (storedDeviceId) {
                deviceIdType = getValueFromStorage("cly_id_type");
                return storedDeviceId;
            }
            return generateUUID();
        }

        /**
         *  Check if value is in UUID format
         *  @memberof Countly._internals
         * @param {string} providedId -  Id to check
         *  @returns {Boolean} true if it is in UUID format
         */
        function isUUID(providedId) {
            return /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(providedId);
        }

        /**
         *  Get and return user agentAgent
         *  @memberof Countly._internals
         *  @returns {string} returns userAgent string
         */
        function getUA() {
            return self.metrics._ua || currentUserAgentString();
        }

        /**
         *  Get metrics of the browser or config object
         *  @memberof Countly._internals
         *  @returns {Object} Metrics object
         */
        function getMetrics() {
            var metrics = JSON.parse(JSON.stringify(self.metrics || {}));

            // getting app version
            metrics._app_version = metrics._app_version || self.app_version;
            metrics._ua = metrics._ua || currentUserAgentString();

            // getting resolution
            if (isBrowser && screen.width) {
                var width = screen.width ? parseInt(screen.width) : 0;
                var height = screen.height ? parseInt(screen.height) : 0;
                if (width !== 0 && height !== 0) {
                    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
                    if (iOS && window.devicePixelRatio) {
                        // ios provides dips, need to multiply
                        width = Math.round(width * window.devicePixelRatio);
                        height = Math.round(height * window.devicePixelRatio);
                    }
                    else {
                        if (Math.abs(window.orientation) === 90) {
                            // we have landscape orientation
                            // switch values for all except ios
                            var temp = width;
                            width = height;
                            height = temp;
                        }
                    }
                    metrics._resolution = metrics._resolution || "" + width + "x" + height;
                }
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
            if (isReferrerUsable()) {
                metrics._store = metrics._store || document.referrer;
            }
            log(logLevelEnums.DEBUG, "Got metrics", metrics);
            return metrics;
        }

        /**
         *  @memberof Countly._internals
         * document.referrer returns the full URL of the page the user was on before they came to your site.
         * If the user open your site from bookmarks or by typing the URL in the address bar, then document.referrer is an empty string.
         * Inside an iframe, document.referrer will initially be set to the same value as the href of the parent window's Window.location. 
         * 
         * @param {string} customReferrer - custom referrer for testing
         * @returns {boolean} true if document.referrer is not empty string, undefined, current host or in the ignore list.
         */
        function isReferrerUsable(customReferrer) {
            if (!isBrowser) {
                return false;
            }
            var referrer = customReferrer || document.referrer;
            var isReferrerLegit = false;

            // do not report referrer if it is empty string or undefined
            if (typeof referrer === "undefined" || referrer.length === 0) {
                log(logLevelEnums.DEBUG, "Invalid referrer:[" + referrer + "], ignoring.");
            }
            else {
                // dissect the referrer (check urlParseRE's comments for more info on this process)
                var matches = urlParseRE.exec(referrer); // this can return null
                if (!matches) {
                    log(logLevelEnums.DEBUG, "Referrer is corrupt:[" + referrer + "], ignoring.");
                }
                else if (!matches[11]) {
                    log(logLevelEnums.DEBUG, "No path found in referrer:[" + referrer + "], ignoring.");
                }
                else if (matches[11] === window.location.hostname) {
                    log(logLevelEnums.DEBUG, "Referrer is current host:[" + referrer + "], ignoring.");
                }
                else {
                    if (ignoreReferrers && ignoreReferrers.length) {
                        isReferrerLegit = true;
                        for (var k = 0; k < ignoreReferrers.length; k++) {
                            if (referrer.indexOf(ignoreReferrers[k]) >= 0) {
                                log(logLevelEnums.DEBUG, "Referrer in ignore list:[" + referrer + "], ignoring.");
                                isReferrerLegit = false;
                                break;
                            }
                        }
                    }
                    else {
                        log(logLevelEnums.DEBUG, "Valid referrer:[" + referrer + "]");
                        isReferrerLegit = true;
                    }
                }
            }
            return isReferrerLegit;
        }

        /**
         *  Logging stuff, works only when debug mode is true
         * @param {string} level - log level (error, warning, info, debug, verbose)
         * @param {string} message - any string message
         * @memberof Countly._internals
         */
        function log(level, message) {
            if (self.debug && typeof console !== "undefined") {
                // parse the arguments into a string if it is an object
                if (arguments[2] && _typeof(arguments[2]) === "object") {
                    arguments[2] = JSON.stringify(arguments[2]);
                }
                // append app_key to the start of the message if it is not the first instance (for multi instancing)
                if (!global) {
                    message = "[" + self.app_key + "] " + message;
                }
                // if the provided level is not a proper log level re-assign it as [DEBUG]
                if (!level) {
                    level = logLevelEnums.DEBUG;
                }
                // append level, message and args
                var extraArguments = "";
                for (var i = 2; i < arguments.length; i++) {
                    extraArguments += arguments[i];
                }
                // eslint-disable-next-line no-shadow
                var log = level + "[Countly] " + message + extraArguments;
                // decide on the console
                if (level === logLevelEnums.ERROR) {
                    // eslint-disable-next-line no-console
                    console.error(log);
                    HealthCheck.incrementErrorCount();
                }
                else if (level === logLevelEnums.WARNING) {
                    // eslint-disable-next-line no-console
                    console.warn(log);
                    HealthCheck.incrementWarningCount();
                }
                else if (level === logLevelEnums.INFO) {
                    // eslint-disable-next-line no-console
                    console.info(log);
                }
                else if (level === logLevelEnums.VERBOSE) {
                    // eslint-disable-next-line no-console
                    console.log(log);
                }
                // if none of the above must be [DEBUG]
                else {
                    // eslint-disable-next-line no-console
                    console.debug(log);
                }
            }
        }

        /**
         *  Decides to use which type of request method
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         */
        function makeNetworkRequest(functionName, url, params, callback, useBroadResponseValidator) {
            if (!isBrowser) {
                sendFetchRequest(functionName, url, params, callback, useBroadResponseValidator);
            }
            else {
                sendXmlHttpRequest(functionName, url, params, callback, useBroadResponseValidator);
            }
        }

        /**
         *  Making xml HTTP request
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         */
        function sendXmlHttpRequest(functionName, url, params, callback, useBroadResponseValidator) {
            useBroadResponseValidator = useBroadResponseValidator || false;
            try {
                log(logLevelEnums.DEBUG, "Sending XML HTTP request");
                var xhr = new XMLHttpRequest();
                params = params || {};
                var data = prepareParams(params);
                var method = "GET";
                if (self.force_post || data.length >= 2000) {
                    method = "POST";
                }
                if (method === "GET") {
                    xhr.open("GET", url + "?" + data, true);
                }
                else {
                    xhr.open("POST", url, true);
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }
                for (var header in self.headers) {
                    xhr.setRequestHeader(header, self.headers[header]);
                }
                // fallback on error
                xhr.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        log(logLevelEnums.DEBUG, functionName + " HTTP request completed with status code: [" + this.status + "] and response: [" + this.responseText + "]");
                        // response validation function will be selected to also accept JSON arrays if useBroadResponseValidator is true
                        var isResponseValidated;
                        if (useBroadResponseValidator) {
                            // JSON array/object both can pass
                            isResponseValidated = isResponseValidBroad(this.status, this.responseText);
                        }
                        else {
                            // only JSON object can pass
                            isResponseValidated = isResponseValid(this.status, this.responseText);
                        }
                        if (isResponseValidated) {
                            if (typeof callback === "function") {
                                callback(false, params, this.responseText);
                            }
                        }
                        else {
                            log(logLevelEnums.ERROR, functionName + " Invalid response from server");
                            if (functionName === "send_request_queue") {
                                HealthCheck.saveRequestCounters(this.status, this.responseText);
                            }
                            if (typeof callback === "function") {
                                callback(true, params, this.status, this.responseText);
                            }
                        }
                    }
                };
                if (method === "GET") {
                    xhr.send();
                }
                else {
                    xhr.send(data);
                }
            } catch (e) {
                // fallback
                log(logLevelEnums.ERROR, functionName + " Something went wrong while making an XML HTTP request: " + e);
                if (typeof callback === "function") {
                    callback(true, params);
                }
            }
        }

        /**
         *  Make a fetch request
         *  @memberof Countly._internals
         *  @param {String} functionName - Name of the function making the request for more detailed logging
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         *  @param {Boolean} useBroadResponseValidator - if true that means the expected response is either a JSON object or a JSON array, if false only JSON 
         */
        function sendFetchRequest(functionName, url, params, callback, useBroadResponseValidator) {
            useBroadResponseValidator = useBroadResponseValidator || false;
            var response;
            try {
                log(logLevelEnums.DEBUG, "Sending Fetch request");

                // Prepare request options
                var method = "GET";
                var headers = {
                    "Content-type": "application/x-www-form-urlencoded"
                };
                var body = null;
                params = params || {};
                if (self.force_post || prepareParams(params).length >= 2000) {
                    method = "POST";
                    body = prepareParams(params);
                }
                else {
                    url += "?" + prepareParams(params);
                }

                // Add custom headers
                for (var header in self.headers) {
                    headers[header] = self.headers[header];
                }

                // Make the fetch request
                fetch(url, {
                    method: method,
                    headers: headers,
                    body: body
                }).then(function(res) {
                    response = res;
                    return response.text();
                }).then(function(data) {
                    log(logLevelEnums.DEBUG, functionName + " Fetch request completed wit status code: [" + response.status + "] and response: [" + data + "]");
                    var isResponseValidated;
                    if (useBroadResponseValidator) {
                        isResponseValidated = isResponseValidBroad(response.status, data);
                    }
                    else {
                        isResponseValidated = isResponseValid(response.status, data);
                    }
                    if (isResponseValidated) {
                        if (typeof callback === "function") {
                            callback(false, params, data);
                        }
                    }
                    else {
                        log(logLevelEnums.ERROR, functionName + " Invalid response from server");
                        if (functionName === "send_request_queue") {
                            HealthCheck.saveRequestCounters(response.status, data);
                        }
                        if (typeof callback === "function") {
                            callback(true, params, response.status, data);
                        }
                    }
                })["catch"](function(error) {
                    log(logLevelEnums.ERROR, functionName + " Failed Fetch request: " + error);
                    if (typeof callback === "function") {
                        callback(true, params);
                    }
                });
            } catch (e) {
                // fallback
                log(logLevelEnums.ERROR, functionName + " Something went wrong with the Fetch request attempt: " + e);
                if (typeof callback === "function") {
                    callback(true, params);
                }
            }
        }

        /**
         * Check if the http response fits the bill of:
         * 1. The HTTP response code was successful (which is any 2xx code or code between 200 <= x < 300)
         * 2. The returned request is a JSON object
         * @memberof Countly._internals
         * @param {Number} statusCode - http incoming statusCode.
         * @param {String} str - response from server, ideally must be: {"result":"Success"} or should contain at least result field
         * @returns {Boolean} - returns true if response passes the tests 
         */
        function isResponseValid(statusCode, str) {
            // status code and response format check
            if (!(statusCode >= 200 && statusCode < 300)) {
                log(logLevelEnums.ERROR, "Http response status code:[" + statusCode + "] is not within the expected range");
                return false;
            }

            // Try to parse JSON
            try {
                var parsedResponse = JSON.parse(str);

                // check if parsed response is a JSON object, if not the response is not valid
                if (Object.prototype.toString.call(parsedResponse) !== "[object Object]") {
                    log(logLevelEnums.ERROR, "Http response is not JSON Object");
                    return false;
                }
                return !!parsedResponse.result;
            } catch (e) {
                log(logLevelEnums.ERROR, "Http response is not JSON: " + e);
                return false;
            }
        }

        /**
         * Check if the http response fits the bill of:
         * 1. The HTTP response code was successful (which is any 2xx code or code between 200 <= x < 300)
         * 2. The returned request is a JSON object or JSON Array
         * @memberof Countly._internals
         * @param {Number} statusCode - http incoming statusCode.
         * @param {String} str - response from server, ideally must be: {"result":"Success"} or should contain at least result field
         * @returns {Boolean} - returns true if response passes the tests 
         */
        function isResponseValidBroad(statusCode, str) {
            // status code and response format check
            if (!(statusCode >= 200 && statusCode < 300)) {
                log(logLevelEnums.ERROR, "Http response status code:[" + statusCode + "] is not within the expected range");
                return false;
            }

            // Try to parse JSON
            try {
                var parsedResponse = JSON.parse(str);
                // check if parsed response is a JSON object or JSON array, if not it is not valid 
                if (Object.prototype.toString.call(parsedResponse) !== "[object Object]" && !Array.isArray(parsedResponse)) {
                    log(logLevelEnums.ERROR, "Http response is not JSON Object nor JSON Array");
                    return false;
                }

                // request should be accepted even if does not have result field
                return true;
            } catch (e) {
                log(logLevelEnums.ERROR, "Http response is not JSON: " + e);
                return false;
            }
        }

        /**
         *  Get max scroll position
         *  @memberof Countly._internals
         * 
         */
        function processScroll() {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "processScroll, window object is not available. Not processing scroll.");
                return;
            }
            scrollRegistryTopPosition = Math.max(scrollRegistryTopPosition, window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);
        }

        /**
         *  Process scroll data
         *  @memberof Countly._internals
         */
        function processScrollView() {
            if (!isBrowser) {
                log(logLevelEnums.WARNING, "processScrollView, window object is not available. Not processing scroll view.");
                return;
            }
            if (isScrollRegistryOpen) {
                isScrollRegistryOpen = false;
                var height = getDocHeight();
                var width = getDocWidth();
                var viewportHeight = getViewportHeight();
                if (self.check_consent(featureEnums.SCROLLS)) {
                    var segments = {
                        type: "scroll",
                        y: scrollRegistryTopPosition + viewportHeight,
                        width: width,
                        height: height,
                        view: self.getViewUrl()
                    };
                    // truncate new segment
                    segments = truncateObject(segments, self.maxKeyLength, self.maxValueSize, self.maxSegmentationValues, "processScrollView", log);
                    if (self.track_domains) {
                        segments.domain = window.location.hostname;
                    }
                    add_cly_events({
                        key: internalEventKeyEnums.ACTION,
                        segmentation: segments
                    });
                }
            }
        }

        /**
         *  Fetches the current device Id type
         *  @memberof Countly._internals
         *  @returns {String} token - auth token
         */
        function getInternalDeviceIdType() {
            return deviceIdType;
        }

        /**
         *  Set auth token
         *  @memberof Countly._internals
         *  @param {String} token - auth token
         */
        function setToken(token) {
            setValueInStorage("cly_token", token);
        }

        /**
         *  Get auth token
         *  @memberof Countly._internals
         *  @returns {String} auth token
         */
        function getToken() {
            var token = getValueFromStorage("cly_token");
            removeValueFromStorage("cly_token");
            return token;
        }

        /**
         *  Get event queue
         *  @memberof Countly._internals
         *  @returns {Array} event queue
         */
        function getEventQueue() {
            return eventQueue;
        }

        /**
         *  Get request queue
         *  @memberof Countly._internals
         *  @returns {Array} request queue
         */
        function getRequestQueue() {
            return requestQueue;
        }

        /**
        * Returns contents of a cookie
        * @param {String} cookieKey - The key, name or identifier for the cookie
        * @returns {Varies} stored value
        */
        function readCookie(cookieKey) {
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
        }

        /**
         *  Creates new cookie or removes cookie with negative expiration
         *  @param {String} cookieKey - The key or identifier for the storage
         *  @param {String} cookieVal - Contents to store
         *  @param {Number} exp - Expiration in days
         */
        function createCookie(cookieKey, cookieVal, exp) {
            var date = new Date();
            date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
            // TODO: If we offer the developer the ability to manipulate the expiration date in the future, this part must be reworked
            var expires = "; expires=" + date.toGMTString();
            document.cookie = cookieKey + "=" + cookieVal + expires + "; path=/";
        }

        /**
         *  Storage function that acts as getter, can be used for fetching data from local storage or cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Boolean} useLocalStorage - if false, will fallback to cookie storage
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
         *  @returns {Varies} values stored for key
         */
        function getValueFromStorage(key, useLocalStorage, useRawKey) {
            // check if we should use storage at all. If in worker context but no storage is available, return early
            if (self.storage === "none" || _typeof(self.storage) !== "object" && !isBrowser) {
                log(logLevelEnums.DEBUG, "Storage is disabled. Value with key: [" + key + "] won't be retrieved");
                return;
            }

            // apply namespace or app_key
            if (!useRawKey) {
                key = self.app_key + "/" + key;
                if (self.namespace) {
                    key = stripTrailingSlash(self.namespace) + "/" + key;
                }
            }
            var data;
            // use dev provided storage if available
            if (_typeof(self.storage) === "object" && typeof self.storage.getItem === "function") {
                data = self.storage.getItem(key);
                return key.endsWith("cly_id") ? data : self.deserialize(data);
            }

            // developer set values takes priority
            if (useLocalStorage === undefined) {
                useLocalStorage = lsSupport;
            }

            // Get value
            if (useLocalStorage) {
                // Native support
                data = localStorage.getItem(key);
            }
            else if (self.storage !== "localstorage") {
                // Use cookie
                data = readCookie(key);
            }

            // we return early without parsing if we are trying to get the device ID. This way we are keeping it as a string incase it was numerical.
            if (key.endsWith("cly_id")) {
                return data;
            }
            return self.deserialize(data);
        }

        /**
         *  Storage function that acts as setter, can be used for setting data into local storage or as cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Varies} value - value to set for key
         *  @param {Boolean} useLocalStorage - if false, will fallback to storing as cookies
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
        */
        function setValueInStorage(key, value, useLocalStorage, useRawKey) {
            // check if we should use storage options at all
            if (self.storage === "none" || _typeof(self.storage) !== "object" && !isBrowser) {
                log(logLevelEnums.DEBUG, "Storage is disabled. Value with key: " + key + " won't be stored");
                return;
            }

            // apply namespace
            if (!useRawKey) {
                key = self.app_key + "/" + key;
                if (self.namespace) {
                    key = stripTrailingSlash(self.namespace) + "/" + key;
                }
            }
            if (typeof value !== "undefined" && value !== null) {
                // use dev provided storage if available
                if (_typeof(self.storage) === "object" && typeof self.storage.setItem === "function") {
                    self.storage.setItem(key, value);
                    return;
                }

                // developer set values takes priority
                if (useLocalStorage === undefined) {
                    useLocalStorage = lsSupport;
                }
                value = self.serialize(value);
                // Set the store
                if (useLocalStorage) {
                    // Native support
                    localStorage.setItem(key, value);
                }
                else if (self.storage !== "localstorage") {
                    // Use Cookie
                    createCookie(key, value, 30);
                }
            }
        }

        /**
         *  A function that can be used for removing data from local storage or cookies
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Boolean} useLocalStorage - if false, will fallback to removing cookies
         *  @param {Boolean} useRawKey - if true, raw key will be used without any prefix
        */
        function removeValueFromStorage(key, useLocalStorage, useRawKey) {
            // check if we should use storage options at all
            if (self.storage === "none" || _typeof(self.storage) !== "object" && !isBrowser) {
                log(logLevelEnums.DEBUG, "Storage is disabled. Value with key: " + key + " won't be removed");
                return;
            }

            // apply namespace
            if (!useRawKey) {
                key = self.app_key + "/" + key;
                if (self.namespace) {
                    key = stripTrailingSlash(self.namespace) + "/" + key;
                }
            }

            // use dev provided storage if available
            if (_typeof(self.storage) === "object" && typeof self.storage.removeItem === "function") {
                self.storage.removeItem(key);
                return;
            }

            // developer set values takes priority
            if (useLocalStorage === undefined) {
                useLocalStorage = lsSupport;
            }
            if (useLocalStorage) {
                // Native support
                localStorage.removeItem(key);
            }
            else if (self.storage !== "localstorage") {
                // Use cookie
                createCookie(key, "", -1);
            }
        }

        /**
         *  Migrate from old storage to new app_key prefixed storage
         */
        function migrate() {
            if (getValueFromStorage(self.namespace + "cly_id", false, true)) {
                // old data exists, we should migrate it
                setValueInStorage("cly_id", getValueFromStorage(self.namespace + "cly_id", false, true));
                setValueInStorage("cly_id_type", getValueFromStorage(self.namespace + "cly_id_type", false, true));
                setValueInStorage("cly_event", getValueFromStorage(self.namespace + "cly_event", false, true));
                setValueInStorage("cly_session", getValueFromStorage(self.namespace + "cly_session", false, true));

                // filter out requests with correct app_key
                var requests = getValueFromStorage(self.namespace + "cly_queue", false, true);
                if (Array.isArray(requests)) {
                    requests = requests.filter(function(req) {
                        return req.app_key === self.app_key;
                    });
                    setValueInStorage("cly_queue", requests);
                }
                if (getValueFromStorage(self.namespace + "cly_cmp_id", false, true)) {
                    setValueInStorage("cly_cmp_id", getValueFromStorage(self.namespace + "cly_cmp_id", false, true));
                    setValueInStorage("cly_cmp_uid", getValueFromStorage(self.namespace + "cly_cmp_uid", false, true));
                }
                if (getValueFromStorage(self.namespace + "cly_ignore", false, true)) {
                    setValueInStorage("cly_ignore", getValueFromStorage(self.namespace + "cly_ignore", false, true));
                }

                // now deleting old data, so we won't migrate again
                removeValueFromStorage("cly_id", false, true);
                removeValueFromStorage("cly_id_type", false, true);
                removeValueFromStorage("cly_event", false, true);
                removeValueFromStorage("cly_session", false, true);
                removeValueFromStorage("cly_queue", false, true);
                removeValueFromStorage("cly_cmp_id", false, true);
                removeValueFromStorage("cly_cmp_uid", false, true);
                removeValueFromStorage("cly_ignore", false, true);
            }
        }

        /**
         *  Apply modified storage changes
         *  @param {String} key - key of storage modified
         *  @param {Varies} newValue - new value for storage
         */
        this.onStorageChange = function(key, newValue) {
            log(logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for key:", key);
            log(logLevelEnums.DEBUG, "onStorageChange, Applying storage changes for value:", newValue);
            switch (key) {
                // queue of requests
                case "cly_queue":
                    requestQueue = self.deserialize(newValue || "[]");
                    break;
                // queue of events
                case "cly_event":
                    eventQueue = self.deserialize(newValue || "[]");
                    break;
                case "cly_remote_configs":
                    remoteConfigs = self.deserialize(newValue || "{}");
                    break;
                case "cly_ignore":
                    self.ignore_visitor = self.deserialize(newValue);
                    break;
                case "cly_id":
                    self.device_id = newValue;
                    break;
                case "cly_id_type":
                    deviceIdType = self.deserialize(newValue);
                    break;
                // do nothing
            }
        };

        /**
        * Expose internal methods to end user for usability
        * @namespace Countly._internals
        * @name Countly._internals
        */
        this._internals = {
            // TODO: looks like we do not use this function. Either use it for something or eliminate.
            store: setValueInStorage,
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
            sendXmlHttpRequest: sendXmlHttpRequest,
            isResponseValid: isResponseValid,
            getInternalDeviceIdType: getInternalDeviceIdType,
            getMsTimestamp: getMsTimestamp,
            getTimestamp: getTimestamp,
            isResponseValidBroad: isResponseValidBroad,
            secureRandom: secureRandom,
            log: log,
            checkIfLoggingIsOn: checkIfLoggingIsOn,
            getMetrics: getMetrics,
            getUA: getUA,
            prepareRequest: prepareRequest,
            generateUUID: generateUUID,
            sendEventsForced: sendEventsForced,
            isUUID: isUUID,
            isReferrerUsable: isReferrerUsable,
            getId: getStoredIdOrGenerateId,
            heartBeat: heartBeat,
            toRequestQueue: toRequestQueue,
            reportViewDuration: reportViewDuration,
            loadJS: loadJS,
            loadCSS: loadCSS,
            getLastView: getLastView,
            setToken: setToken,
            getToken: getToken,
            showLoader: showLoader,
            hideLoader: hideLoader,
            setValueInStorage: setValueInStorage,
            getValueFromStorage: getValueFromStorage,
            removeValueFromStorage: removeValueFromStorage,
            add_cly_events: add_cly_events,
            processScrollView: processScrollView,
            processScroll: processScroll,
            currentUserAgentString: currentUserAgentString,
            userAgentDeviceDetection: userAgentDeviceDetection,
            userAgentSearchBotDetection: userAgentSearchBotDetection,
            getRequestQueue: getRequestQueue,
            getEventQueue: getEventQueue,
            sendFetchRequest: sendFetchRequest,
            makeNetworkRequest: makeNetworkRequest,
            /**
             *  Clear queued data
             *  @memberof Countly._internals
             */
            clearQueue: function clearQueue() {
                requestQueue = [];
                setValueInStorage("cly_queue", []);
                eventQueue = [];
                setValueInStorage("cly_event", []);
            },
            /**
             * For testing pusposes only
             * @returns {Object} - returns the local queues
             */
            getLocalQueues: function getLocalQueues() {
                return {
                    eventQ: eventQueue,
                    requestQ: requestQueue
                };
            }
        };

        /**
         * Health Check Interface:
         * {sendInstantHCRequest} Sends instant health check request
         * {resetAndSaveCounters} Resets and saves health check counters
         * {incrementErrorCount} Increments health check error count
         * {incrementWarningCount} Increments health check warning count
         * {resetCounters} Resets health check counters
         * {saveRequestCounters} Saves health check request counters
         */
        var HealthCheck = {};
        HealthCheck.sendInstantHCRequest = sendInstantHCRequest;
        HealthCheck.resetAndSaveCounters = resetAndSaveCounters;
        HealthCheck.incrementErrorCount = incrementErrorCount;
        HealthCheck.incrementWarningCount = incrementWarningCount;
        HealthCheck.resetCounters = resetCounters;
        HealthCheck.saveRequestCounters = saveRequestCounters;
        /**
         * Increments health check error count
         */
        function incrementErrorCount() {
            self.hcErrorCount++;
        }
        /**
         * Increments health check warning count
         */
        function incrementWarningCount() {
            self.hcWarningCount++;
        }
        /**
         * Resets health check counters
         */
        function resetCounters() {
            self.hcErrorCount = 0;
            self.hcWarningCount = 0;
            self.hcStatusCode = -1;
            self.hcErrorMessage = "";
        }
        /**
         * Sets and saves the status code and error message counters 
         * @param {number} status - response status code of the request
         * @param {string} responseText - response text of the request
         */
        function saveRequestCounters(status, responseText) {
            self.hcStatusCode = status;
            self.hcErrorMessage = responseText;
            setValueInStorage(healthCheckCounterEnum.statusCode, self.hcStatusCode);
            setValueInStorage(healthCheckCounterEnum.errorMessage, self.hcErrorMessage);
        }
        /**
         * Resets and saves health check counters
         */
        function resetAndSaveCounters() {
            HealthCheck.resetCounters();
            setValueInStorage(healthCheckCounterEnum.errorCount, self.hcErrorCount);
            setValueInStorage(healthCheckCounterEnum.warningCount, self.hcWarningCount);
            setValueInStorage(healthCheckCounterEnum.statusCode, self.hcStatusCode);
            setValueInStorage(healthCheckCounterEnum.errorMessage, self.hcErrorMessage);
        }
        /**
         * Countly health check request sender
         */
        function sendInstantHCRequest() {
            // truncate error message to 1000 characters
            var curbedMessage = truncateSingleValue(self.hcErrorMessage, 1000, "healthCheck", log);
            // prepare hc object
            var hc = {
                el: self.hcErrorCount,
                wl: self.hcWarningCount,
                sc: self.hcStatusCode,
                em: JSON.stringify(curbedMessage)
            };
            // prepare request
            var request = {
                hc: JSON.stringify(hc),
                metrics: JSON.stringify({
                    _app_version: self.app_version
                })
            };
            // add common request params
            prepareRequest(request);
            // send request
            makeNetworkRequest("[healthCheck]", self.url + apiPath, request, function(err) {
                // request maker already logs the error. No need to log it again here
                if (!err) {
                    // reset and save health check counters if request was successful
                    HealthCheck.resetAndSaveCounters();
                }
            }, true);
        }

        // initialize Countly Class
        this.initialize();
    });

    Countly.CountlyClass = CountlyClass;

    /**
     * Initialize Countly object
     * @param {Object} conf - Countly initialization/config {@link Init} object with configuration options
     * @param {string} conf.app_key - app key for your app created in Countly
     * @param {string} conf.device_id - to identify a visitor, will be auto generated if not provided
     * @param {string} conf.url - your Countly server url, you can use your server URL or IP here
     * @param {boolean} [conf.clear_stored_id=false] - set it to true if you want to erase previously stored device ID from the local storage
     * @param {string} [conf.app_version=0.0] - the version of your app or website
     * @param {string=} conf.country_code - country code for your visitor
     * @param {string=} conf.city - name of the city of your visitor
     * @param {string=} conf.ip_address - ip address of your visitor
     * @param {boolean} [conf.debug=false] - output debug info into console
     * @param {boolean} [conf.ignore_bots=true] - option to ignore traffic from bots
     * @param {number} [conf.interval=500] - set an interval how often to check if there is any data to report and report it in milliseconds
     * @param {number} [conf.queue_size=1000] - maximum amount of queued requests to store
     * @param {number} [conf.fail_timeout=60] - set time in seconds to wait after failed connection to server in seconds
     * @param {number} [conf.inactivity_time=20] - after how many minutes user should be counted as inactive, if he did not perform any actions, as mouse move, scroll or keypress
     * @param {number} [conf.session_update=60] - how often in seconds should session be extended
     * @param {number} [conf.max_events=100] - maximum amount of events to send in one batch
     * @deprecated {number} [conf.max_logs=100] - maximum amount of breadcrumbs to store for crash logs
     * @param {number} [conf.max_key_length=128] - maximum size of all string keys
     * @param {number} [conf.max_value_size=256] - maximum size of all values in our key-value pairs (Except "picture" field, that has a limit of 4096 chars)
     * @param {number} [conf.max_segmentation_values=30] - max amount of custom (dev provided) segmentation in one event
     * @param {number} [conf.max_breadcrumb_count=100] - maximum amount of breadcrumbs that can be recorded before the oldest one is deleted
     * @param {number} [conf.max_stack_trace_lines_per_thread=30] - maximum amount of stack trace lines would be recorded per thread
     * @param {number} [conf.max_stack_trace_line_length=200] - maximum amount of characters are allowed per stack trace line. This limits also the crash message length
     * @param {array=} conf.ignore_referrers - array with referrers to ignore
     * @param {boolean} [conf.ignore_prefetch=true] - ignore prefetching and pre rendering from counting as real website visits
     * @param {boolean} [conf.rc_automatic_optin_for_ab=true] - opts in the user for A/B testing while fetching the remote config (if true)
     * @param {boolean} [conf.use_explicit_rc_api=false] - set it to true to use the new remote config API
     * @param {boolean} [conf.force_post=false] - force using post method for all requests
     * @param {boolean} [conf.ignore_visitor=false] - ignore this current visitor
     * @param {boolean} [conf.require_consent=false] - Pass true if you are implementing GDPR compatible consent management. It would prevent running any functionality without proper consent
     * @param {boolean} [conf.utm={"source":true, "medium":true, "campaign":true, "term":true, "content":true}] - Object instructing which UTM parameters to track
     * @param {boolean} [conf.use_session_cookie=true] - Use cookie to track session
     * @param {boolean} [conf.enable_orientation_tracking=true] - Enables orientation tracking at the start of a session
     * @param {array=} [conf.heatmap_whitelist=[]] - array with trustable domains for heatmap reporting
     * @param {number} [conf.session_cookie_timeout=30] - How long till cookie session should expire in minutes
     * @param {boolean|function} [conf.remote_config=false] - Enable automatic remote config fetching, provide callback function to be notified when fetching done
     * @param {string=} [conf.namespace=""] - Have separate namespace of of persistent data
     * @param {boolean=} [conf.track_domains=true] - Set to false to disable domain tracking, so no domain data would be reported
     * @param {Object=} [conf.metrics={}] - provide metrics for this user, or else will try to collect what's possible
     * @param {string} conf.metrics._os - name of platform/operating system
     * @param {string} conf.metrics._os_version - version of platform/operating system
     * @param {string} conf.metrics._device - device name
     * @param {string} conf.metrics._resolution - screen resolution of the device
     * @param {string} conf.metrics._carrier - carrier or operator used for connection
     * @param {string} conf.metrics._density - screen density of the device
     * @param {string} conf.metrics._locale - locale or language of the device in ISO format
     * @param {string} conf.metrics._store - source from where the user came from
     * @param {string} conf.metrics._browser - browser name
     * @param {string} conf.metrics._browser_version - browser version
     * @param {string} conf.metrics._ua - user agent string
     * @param {Object=} [conf.headers={}] - Object to override or add headers to all SDK requests
     * @param {string | Object} [conf.storage=default] - What type of storage to use, by default uses local storage and would fallback to cookies, but you can set values "localstorage" or "cookies" to force only specific storage, or use "none" to not use any storage and keep everything in memory
     * If developer wants to provide their own storage methods they can provide an object with methods getItem(key:string), setItem(key:string, value:string), removeItem(key:string)  
     * SDK would hand the key and value params to use these methods to store and retrieve data.
     * Here key is the key of the data to be stored and value is the value of the data to be stored.
     * This can be used in scenarios where a clear storage method is not available, like in web workers
     * @returns {Object} countly tracker instance
     * @example
     * Countly.init({
     *   //provide your app key that you retrieved from Countly dashboard
     *   app_key: "YOUR_APP_KEY",
     *   //provide your server IP or name. Use try.count.ly for EE trial server.
     *   url: "http://yourdomain.com"
     * });
     */
    Countly.init = function(conf) {
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

    /**
     * Countly object methods:
     * Countly. 
     *     CountlyClass: ƒ (ob)
     *     DeviceIdType: {DEVELOPER_SUPPLIED: 0, SDK_GENERATED: 1, TEMPORARY_ID: 2}
     *     add_consent: ƒ (feature)
     *     add_event: ƒ (event)
     *     add_log: ƒ (record)
     *     app_key: "YOUR_APP_KEY"
     *     app_version: "0.0"
     *     begin_session: ƒ (noHeartBeat, force)
     *     cancel_event: ƒ (key)
     *     change_id: ƒ (newId, merge)
     *     check_any_consent: ƒ ()
     *     check_consent: ƒ (feature)
     *     city: null
     *     clearStoredId: false
     *     collect_from_facebook: ƒ (custom)
     *     collect_from_forms: ƒ (parent, useCustom)
     *     country_code: null
     *     debug: false
     *     deserialize: ƒ (data)
     *     device_id: undefined
     *     disable_offline_mode: ƒ (device_id)
     *     enableOrientationTracking: true
     *     enableRatingWidgets: ƒ (params)
     *     enable_feedback: ƒ (params)
     *     enable_offline_mode: ƒ ()
     *     end_event: ƒ (event)
     *     end_session: ƒ (sec, force)
     *     enrollUserToAb: ƒ (keys)
     *     features: (14) ['sessions', 'events', 'views', 'scrolls', 'clicks', 'forms', 'crashes', 'attribution', 'users', 'star-rating', 'location', 'apm', 'feedback', 'remote-config']
     *     fetch_remote_config: ƒ (keys, omit_keys, callback)
     *     force_post: false
     *     getFeedbackWidgetData: ƒ (CountlyFeedbackWidget, callback)
     *     getSearchQuery: ƒ ()
     *     getViewName: ƒ ()
     *     getViewUrl: ƒ ()
     *     get_available_feedback_widgets: ƒ (callback)
     *     get_device_id: ƒ ()
     *     get_device_id_type: ƒ ()
     *     get_remote_config: ƒ (key)
     *     group_features: ƒ (features)
     *     halt: ƒ ()
     *     headers: {}
     *     heatmapWhitelist: []
     *     i: {YOUR_APP_KEY: CountlyClass}
     *     ignore_bots: true
     *     ignore_prefetch: true
     *     ignore_visitor: false
     *     init: ƒ (conf)
     *     initialize: ƒ ()
     *     initializeRatingWidgets: ƒ (enableWidgets)
     *     initialize_feedback_popups: ƒ (enableWidgets)
     *     ip_address: null
     *     loadAPMScriptsAsync: undefined
     *     customSourceBoomerang: CDN.BOOMERANG_SRC or basically the cdn link to boomerang.min.js
     *     customSourceCountlyBoomerang: CDN.CLY_BOOMERANG_SRC or basically the cdn link to countly_boomerang.js
     *     log_error: ƒ (err, segments)
     *     maxBreadcrumbCount: 100
     *     maxKeyLength: 128
     *     maxSegmentationValues: 100
     *     maxStackTraceLineLength: 200
     *     maxStackTraceLinesPerThread: 30
     *     maxValueSize: 256
     *     metrics: {}
     *     namespace: ""
     *     onStorageChange: ƒ (key, newValue)
     *     onload: []
     *     opt_in: ƒ ()
     *     opt_out: ƒ ()
     *     presentRatingWidgetWithID: ƒ (id)
     *     present_feedback_widget: ƒ (presentableFeedback, id, className)
     *     q: []
     *     rcAutoOptinAb: true
     *     recordDirectAttribution: ƒ (campaign_id, campaign_user_id)
     *     recordError: ƒ (err, nonfatal, segments)
     *     recordRatingWidgetWithID: ƒ (ratingWidget)
     *     remote_config: false
     *     remove_consent: ƒ (feature)
     *     remove_consent_internal: ƒ (feature, enforceConsentUpdate)
     *     reportFeedbackWidgetManually: ƒ (CountlyFeedbackWidget, CountlyWidgetData, widgetResult)
     *     report_conversion: ƒ (campaign_id, campaign_user_id)
     *     report_feedback: ƒ (ratingWidget)
     *     report_orientation: ƒ (orientation)
     *     report_trace: ƒ (trace)
     *     require_consent: false
     *     serialize: ƒ (value)
     *     session_duration: ƒ (sec)
     *     show_feedback_popup: ƒ (id)
     *     start_event: ƒ (key)
     *     start_time: ƒ ()
     *     stop_time: ƒ ()
     *     storage: "default" but can be "none" or "cookies" or "localstorage" == "default"
     *     test_mode: false
     *     test_mode_eq: false
     *     track_clicks: ƒ (parent)
     *     track_domains: true
     *     track_errors: ƒ (segments)
     *     track_forms: ƒ (parent, trackHidden)
     *     track_links: ƒ (parent)
     *     track_pageview: ƒ (page, ignoreList, viewSegments)
     *     track_performance: ƒ (config)
     *     track_scrolls: ƒ (parent)
     *     track_sessions: ƒ ()
     *     track_view: ƒ (page, ignoreList, segments)
     *     url: "https://try.count.ly" or the URL you have set
     *     useExplicitRcApi: false
     *     userData: {set: ƒ, unset: ƒ, set_once: ƒ, increment: ƒ, increment_by: ƒ, …}
     *     user_details: ƒ (user)
     *     utm: {source: true, medium: true, campaign: true, term: true, content: true}
     *     _internals: {store: ƒ, getDocWidth: ƒ, getDocHeight: ƒ, getViewportHeight: ƒ, get_page_coord: ƒ, …}
     * 
     */

    /**
     *  PRIVATE METHODS
     * */

    /**
     * This is for Async implementation only
     * This should be used to initialize the SDK with APM feature. It loads necessary scripts before initializing the SDK.
     * @param {Object} conf - Countly config object.
     */
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
        boomerangScript.onload = function() {
            boomLoaded = true;
        };
        countlyBoomerangScript.onload = function() {
            countlyBoomLoaded = true;
        };
        var timeoutCounter = 0;
        var intervalDuration = 50;
        var timeoutLimit = 1500; // TODO: Configurable? Mb with Countly.apmScriptLoadTimeout?
        // init Countly only after boomerang is loaded
        var intervalID = setInterval(function() {
            timeoutCounter += intervalDuration;
            if (boomLoaded && countlyBoomLoaded || timeoutCounter >= timeoutLimit) {
                if (Countly.debug) {
                    var message = "BoomerangJS loaded:[" + boomLoaded + "], countly_boomerang loaded:[" + countlyBoomLoaded + "].";
                    if (boomLoaded && countlyBoomLoaded) {
                        message = "[DEBUG] " + message;
                        // eslint-disable-next-line no-console
                        console.log(message);
                    }
                    else {
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
        return str.replace(regex, function(c) {
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
        }
        else {
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
        }
        else if (typeof Countly[key] !== "undefined") {
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
     *  @returns {String} URL encode query string
     */
    function prepareParams(params) {
        var str = [];
        for (var i in params) {
            str.push(i + "=" + encodeURIComponent(params[i]));
        }
        return str.join("&");
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
        // check if userAgentData is supported and userAgent is not available, use it
        if (!ua_raw) {
            if (navigator.userAgentData) {
                // turn brands array into string
                ua_raw = navigator.userAgentData.brands.map(function(e) {
                    return e.brand + ":" + e.version;
                }).join();
                // add mobile info
                ua_raw += navigator.userAgentData.mobile ? " mobi " : " ";
                // add platform info
                ua_raw += navigator.userAgentData.platform;
            }
        }
        // RAW USER AGENT STRING
        return ua_raw;
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
        }
        else if (navigator.userAgentData.mobile) {
            return "phone";
        }
        else {
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
        }
        else if (phoneCheck.test(userAgent)) {
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
        var searchBotRE = /(CountlySiteBot|nuhk|Googlebot|GoogleSecurityScanner|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|AdsBot-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|Yandex|YaDirectFetcher|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler|wesee|AliasIO|contxbot|PingdomBot|BingPreview|HeadlessChrome|Chrome-Lighthouse)/;
        // true if the user agent string contains a search bot string pattern
        return searchBotRE.test(uaOverride || currentUserAgentString());
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
     *  Monitor parallel storage changes like other opened tabs
     */
    if (isBrowser) {
        window.addEventListener("storage", function (e) {
            var parts = (e.key + "").split("/");
            var key = parts.pop();
            var appKey = parts.pop();
            if (Countly.i && Countly.i[appKey]) {
                Countly.i[appKey].onStorageChange(key, e.newValue);
            }
        });
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
            }
            else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
            loader = document.createElement("div");
            loader.setAttribute("id", "cly-loader");
            document.body.onload = function() {
                // check if hideLoader is on and if so return
                if (Countly.showLoaderProtection) {
                    if (checkIfLoggingIsOn()) {
                        // eslint-disable-next-line no-console
                        console.warn("[WARNING] [Countly] showloader, Loader is already on");
                    }
                    return;
                }
                try {
                    document.body.appendChild(loader);
                } catch (e) {
                    if (checkIfLoggingIsOn()) {
                        // eslint-disable-next-line no-console
                        console.error("[ERROR] [Countly] showLoader, Body is not loaded for loader to append: " + e);
                    }
                }
            };
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
    * Overwrite serialization function for extending SDK with encryption, etc
    * @param {any} value - value to serialize
    * @return {string} serialized value
    * */
    Countly.serialize = function(value) {
        // Convert object values to JSON
        if (_typeof(value) === "object") {
            value = JSON.stringify(value);
        }
        return value;
    };

    /**
    * Overwrite deserialization function for extending SDK with encryption, etc
    * @param {string} data - value to deserialize
    * @return {varies} deserialized value
    * */
    Countly.deserialize = function(data) {
        if (data === "") {
            // we expect string or null only. Empty sting would throw an error.
            return data;
        }
        // Try to parse JSON...
        try {
            data = JSON.parse(data);
        } catch (e) {
            if (checkIfLoggingIsOn()) {
                // eslint-disable-next-line no-console
                console.warn("[WARNING] [Countly] deserialize, Could not parse the file:[" + data + "], error: " + e);
            }
        }
        return data;
    };

    /**
    * Overwrite a way to retrieve view name
    * @return {string} view name
    * */
    Countly.getViewName = function() {
        if (!isBrowser) {
            return "web_worker";
        }
        return window.location.pathname;
    };

    /**
    * Overwrite a way to retrieve view url
    * @return {string} view url
    * */
    Countly.getViewUrl = function() {
        if (!isBrowser) {
            return "web_worker";
        }
        return window.location.pathname;
    };

    /**
    * Overwrite a way to get search query
    * @return {string} view url
    * */
    Countly.getSearchQuery = function() {
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


    exports.default = Countly;

    Object.defineProperty(exports, '__esModule', { value: true });

}));