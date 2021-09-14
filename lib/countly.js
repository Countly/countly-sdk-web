/************
* Countly Web SDK
* https://github.com/Countly/countly-sdk-web
************/

/**
 * Countly object to manage the internal queue and send requests to Countly server. More information on {@link http://resources.count.ly/docs/countly-sdk-for-web}
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
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return factory(root.Countly);
        });
    }
    else if (typeof module === "object" && module.exports) {
        module.exports = factory(root.Countly);
    }
    else {
        root.Countly = factory(root.Countly);
    }
}(typeof window !== "undefined" ? window : this, function(Countly) {
    "use strict";

    // Make sure the code is being run in a browser
    // eslint-disable-next-line no-undef
    if (typeof (window) === 'undefined') {
        return;
    }

    /** @lends Countly */
    Countly = Countly || {};

    /**
     * Array with list of available features that you can require consent for
     * @example
     * Countly.features = ["sessions", "events", "views", "scrolls", "clicks", "forms", "crashes", "attribution", "users", "star-rating", "location", "apm", "feedback", "remote-config"];
     */
    Countly.features = ["sessions", "events", "views", "scrolls", "clicks", "forms", "crashes", "attribution", "users", "star-rating", "location", "apm", "feedback", "remote-config"];

    /**
     * Object with which UTM tags to check and record
     * @example
     * Countly.utm = {"source": true, "medium": true, "campaign": true, "term": true, "content": true};
     */
    Countly.utm = {"source": true, "medium": true, "campaign": true, "term": true, "content": true};

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

    var SDK_VERSION = "20.11.3";
    var SDK_NAME = "javascript_native_web";

    var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
    var searchBotRE = /(CountlySiteBot|nuhk|Googlebot|GoogleSecurityScanner|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|AdsBot-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|Yandex|YaDirectFetcher|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler|wesee|AliasIO|contxbot|PingdomBot|BingPreview|HeadlessChrome)/;

    /**
     *  @this Countly
     *  @param {Object} ob - Configuration object
     */
    var CountlyClass = function(ob) {
        var self = this,
            global = !Countly.i,
            sessionStarted = false,
            apiPath = "/i",
            readPath = "/o/sdk",
            beatInterval = getConfig("interval", ob, 500),
            queueSize = getConfig("queue_size", ob, 1000),
            requestQueue = [],
            eventQueue = [],
            remoteConfigs = {},
            crashLogs = [],
            timedEvents = {},
            ignoreReferrers = getConfig("ignore_referrers", ob, []),
            crashSegments = null,
            autoExtend = true,
            lastBeat,
            storedDuration = 0,
            lastView = null,
            lastViewTime = 0,
            lastViewStoredDuration = 0,
            failTimeout = 0,
            failTimeoutAmount = getConfig("fail_timeout", ob, 60),
            inactivityTime = getConfig("inactivity_time", ob, 20),
            inactivityCounter = 0,
            sessionUpdate = getConfig("session_update", ob, 60),
            maxEventBatch = getConfig("max_events", ob, 10),
            maxCrashLogs = getConfig("max_logs", ob, 100),
            useSessionCookie = getConfig("use_session_cookie", ob, true),
            sessionCookieTimeout = getConfig("session_cookie_timeout", ob, 30),
            readyToProcess = true,
            hasPulse = false,
            offlineMode = getConfig("offline_mode", ob, false),
            syncConsents = {},
            lastParams = {},
            trackTime = true,
            startTime = getTimestamp(),
            lsSupport = true,
            firstView = null;

        try {
            localStorage.setItem("cly_testLocal", true);
            //clean up test
            localStorage.removeItem('cly_testLocal');
        }
        catch (e) {
            lsSupport = false;
        }

        //create object to store consents
        var consents = {};
        for (var it = 0; it < Countly.features.length; it++) {
            consents[Countly.features[it]] = {};
        }

        this.initialize = function() {
            this.serialize = ob.serialize || Countly.serialize;
            this.deserialize = ob.deserialize || Countly.deserialize;
            this.getViewName = ob.getViewName || Countly.getViewName;
            this.getViewUrl = ob.getViewUrl || Countly.getViewUrl;
            this.namespace = getConfig("namespace", ob, "");
            this.app_key = getConfig("app_key", ob, null);
            this.onload = getConfig("onload", ob, []);
            this.utm = getConfig("utm", ob, {"source": true, "medium": true, "campaign": true, "term": true, "content": true});
            this.ignore_prefetch = getConfig("ignore_prefetch", ob, true);
            this.debug = getConfig("debug", ob, false);
            this.test_mode = getConfig("test_mode", ob, false);
            this.metrics = getConfig("metrics", ob, {});
            this.headers = getConfig("headers", ob, {});
            this.url = stripTrailingSlash(getConfig("url", ob, ""));
            this.app_version = getConfig("app_version", ob, "0.0");
            this.country_code = getConfig("country_code", ob, null);
            this.city = getConfig("city", ob, null);
            this.ip_address = getConfig("ip_address", ob, null);
            this.ignore_bots = getConfig("ignore_bots", ob, true);
            this.force_post = getConfig("force_post", ob, false);
            this.remote_config = getConfig("remote_config", ob, false);
            this.ignore_visitor = getConfig("ignore_visitor", ob, false);
            this.require_consent = getConfig("require_consent", ob, false);
            this.track_domains = getConfig("track_domains", ob, true);
            this.storage = getConfig("storage", ob, "default");

            if (this.storage === "cookie") {
                lsSupport = false;
            }

            if (!Array.isArray(ignoreReferrers)) {
                ignoreReferrers = [];
            }

            if (this.url === "") {
                log("Please provide server URL");
                this.ignore_visitor = true;
            }
            if (store("cly_ignore")) {
                //opted out user
                this.ignore_visitor = true;
            }

            migrate();

            if (!offlineMode) {
                this.device_id = getConfig("device_id", ob, getId());
            }
            else if (!this.device_id) {
                this.device_id = "[CLY]_temp_id";
            }

            requestQueue = store("cly_queue") || [];
            eventQueue = store("cly_event") || [];
            remoteConfigs = store("cly_remote_configs") || {};

            checkIgnore();

            if (window.name && window.name.indexOf("cly:") === 0) {
                try {
                    this.passed_data = JSON.parse(window.name.replace("cly:", ""));
                }
                catch (ex) {
                    log("Could not parse name", window.name);
                }
            }
            else if (location.hash && location.hash.indexOf("#cly:") === 0) {
                try {
                    this.passed_data = JSON.parse(location.hash.replace("#cly:", ""));
                }
                catch (ex) {
                    log("Could not parse hash", location.hash);
                }
            }

            if ((this.passed_data && this.passed_data.app_key && this.passed_data.app_key === this.app_key) || (this.passed_data && !this.passed_data.app_key && global)) {
                if (this.passed_data.token && this.passed_data.purpose) {
                    if (this.passed_data.token !== store("cly_old_token")) {
                        setToken(this.passed_data.token);
                        store("cly_old_token", this.passed_data.token);
                    }
                    this.passed_data.url = this.passed_data.url || this.url;
                    if (this.passed_data.purpose === "heatmap") {
                        this.ignore_visitor = true;
                        showLoader();
                        loadJS(this.passed_data.url + "/views/heatmap.js", hideLoader);
                    }
                }
            }

            if (!this.ignore_visitor) {
                log("Countly initialized");

                if (location.search) {
                    var parts = location.search.substring(1).split("&");
                    var utms = {};
                    var hasUTM = false;
                    for (var i = 0; i < parts.length; i++) {
                        var nv = parts[i].split("=");
                        if (nv[0] === "cly_id") {
                            store("cly_cmp_id", nv[1]);
                        }
                        else if (nv[0] === "cly_uid") {
                            store("cly_cmp_uid", nv[1]);
                        }
                        else if (nv[0] === "cly_device_id") {
                            this.device_id = nv[1];
                        }
                        else if ((nv[0] + "").indexOf("utm_") === 0 && this.utm[nv[0].replace("utm_", "")]) {
                            utms[nv[0].replace("utm_", "")] = nv[1];
                            hasUTM = true;
                        }
                    }
                    if (hasUTM) {
                        for (var tag in this.utm) {
                            if (utms[tag]) {
                                this.userData.set("utm_" + tag, utms[tag]);
                            }
                            else {
                                this.userData.unset("utm_" + tag);
                            }
                        }
                        this.userData.save();
                    }
                }

                if (!offlineMode) {
                    if (this.device_id !== store("cly_id")) {
                        store("cly_id", this.device_id);
                    }
                }

                notifyLoaders();

                setTimeout(function() {
                    heartBeat();
                    if (self.remote_config) {
                        self.fetch_remote_config(self.remote_config);
                    }
                }, 1);
            }
            document.documentElement.setAttribute('data-countly-useragent', navigator.userAgent);
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
                            log("Incorrect feature list for " + i + " value: " + features[i]);
                        }
                    }
                    else {
                        log("Feature name " + i + " is already reserved");
                    }
                }
            }
            else {
                log("Incorrect features: " + features);
            }
        };

        /**
        * Check if consent is given for specific feature (either core feature of from custom feature group)
        * @param {string} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or custom provided through {@link Countly.group_features}
        * @returns {Boolean} true if consent was given for the feature or false if it was not
        */
        this.check_consent = function(feature) {
            if (!this.require_consent) {
                //we don't need to have specific consents
                return true;
            }
            if (consents[feature]) {
                return (consents[feature] && consents[feature].optin) ? true : false;
            }
            else {
                log("No feature available for " + feature);
            }
            return false;
        };

        /**
        * Check if any consent is given, for some cases, when crucial parts are like device_id are needed for any request
        * @returns {Boolean} true is has any consent given, false if no consents given
        */
        this.check_any_consent = function() {
            if (!this.require_consent) {
                //we don't need to have consents
                return true;
            }
            for (var i in consents) {
                if (consents[i] && consents[i].optin) {
                    return true;
                }
            }
            return false;
        };

        /**
        * Add consent for specific feature, meaning, user allowed to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        */
        this.add_consent = function(feature) {
            log("Adding consent for " + feature);
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    this.add_consent(feature[i]);
                }
            }
            else if (consents[feature]) {
                if (consents[feature].features) {
                    consents[feature].optin = true;
                    //this is added group, let's iterate through sub features
                    this.add_consent(consents[feature].features);
                }
                else {
                    //this is core feature
                    if (consents[feature].optin !== true) {
                        syncConsents[feature] = true;
                        consents[feature].optin = true;
                        updateConsent();
                        setTimeout(function() {
                            if (feature === "sessions" && lastParams.begin_session) {
                                self.begin_session.apply(self, lastParams.begin_session);
                                lastParams.begin_session = null;
                            }
                            else if (feature === "views" && lastParams.track_pageview) {
                                lastView = null;
                                self.track_pageview.apply(self, lastParams.track_pageview);
                                lastParams.track_pageview = null;
                            }
                            if (lastParams.change_id) {
                                self.change_id.apply(self, lastParams.change_id);
                                lastParams.change_id = null;
                            }
                        }, 1);

                    }
                }
            }
            else {
                log("No feature available for " + feature);
            }
        };


        /**
        * Remove consent for specific feature, meaning, user opted out to track that data (either core feature of from custom feature group)
        * @param {string|array} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users", etc or custom provided through {@link Countly.group_features}
        */
        this.remove_consent = function(feature) {
            log("Removing consent for " + feature);
            if (Array.isArray(feature)) {
                for (var i = 0; i < feature.length; i++) {
                    this.remove_consent(feature[i]);
                }
            }
            else if (consents[feature]) {
                if (consents[feature].features) {
                    //this is added group, let's iterate through sub features
                    this.remove_consent(consents[feature].features);
                }
                else {
                    //this is core feature
                    if (consents[feature].optin !== false) {
                        syncConsents[feature] = false;
                        updateConsent();
                    }
                }
                consents[feature].optin = false;
            }
            else {
                log("No feature available for " + feature);
            }
        };

        var consentTimer;
        var updateConsent = function() {
            if (consentTimer) {
                //delay syncing consents
                clearTimeout(consentTimer);
                consentTimer = null;
            }
            consentTimer = setTimeout(function() {
                if (hasAnyProperties(syncConsents)) {
                    //we have consents to sync, create request
                    toRequestQueue({ consent: JSON.stringify(syncConsents) });
                    //clear consents that needs syncing
                    syncConsents = {};
                }
            }, 1000);
        };

        this.enable_offline_mode = function() {
            offlineMode = true;
            this.device_id = "[CLY]_temp_id";
        };

        this.disable_offline_mode = function(device_id) {
            offlineMode = false;
            if (device_id && this.device_id !== device_id) {
                this.device_id = device_id;
                store("cly_id", this.device_id);
                log("Changing id");
            }
            else {
                this.device_id = getId();
                if (this.device_id !== store("cly_id")) {
                    store("cly_id", this.device_id);
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
                store("cly_queue", requestQueue, true);
            }
        };

        /**
        * Start session
        * @param {boolean} noHeartBeat - true if you don't want to use internal heartbeat to manage session
        * @param {bool} force - force begin session request even if session cookie is enabled
        */
        this.begin_session = function(noHeartBeat, force) {
            if (this.check_consent("sessions")) {
                if (!sessionStarted) {
                    //report orientation
                    this.report_orientation();
                    add_event(window, "resize", function() {
                        self.report_orientation();
                    });
                    lastBeat = getTimestamp();
                    sessionStarted = true;
                    autoExtend = (noHeartBeat) ? false : true;
                    var expire = store("cly_session");
                    if (force || !useSessionCookie || !expire || parseInt(expire) <= getTimestamp()) {
                        log("Session started");
                        if (firstView === null) {
                            firstView = true;
                        }
                        var req = {};
                        req.begin_session = 1;
                        req.metrics = JSON.stringify(getMetrics());
                        toRequestQueue(req);
                    }
                    store("cly_session", getTimestamp() + (sessionCookieTimeout * 60));
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
            if (this.check_consent("sessions")) {
                if (sessionStarted) {
                    log("Session extended", sec);
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
            if (this.check_consent("sessions")) {
                if (sessionStarted) {
                    sec = sec || getTimestamp() - lastBeat;
                    reportViewDuration();
                    if (!useSessionCookie || force) {
                        log("Ending session");
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
        * @param {string} newId - new user/device ID to use
        * @param {boolean} merge - move data from old ID to new ID on server
        **/
        this.change_id = function(newId, merge) {
            if (this.device_id !== newId) {
                if (!merge) {
                    //empty event queue
                    if (eventQueue.length > 0) {
                        toRequestQueue({ events: JSON.stringify(eventQueue) });
                        eventQueue = [];
                        store("cly_event", eventQueue);
                    }
                    //end current session
                    this.end_session(null, true);
                    //clear timed events
                    timedEvents = {};
                }
                var oldId = this.device_id;
                this.device_id = newId;
                store("cly_id", this.device_id);
                log("Changing id");
                if (merge) {
                    if (this.check_any_consent()) {
                        toRequestQueue({ old_device_id: oldId });
                    }
                    else {
                        lastParams.change_id = arguments;
                    }
                }
                else {
                    //start new session for new id
                    this.begin_session(!autoExtend, true);
                }
                if (this.remote_config) {
                    remoteConfigs = {};
                    store("cly_remote_configs", remoteConfigs);
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
        **/
        this.add_event = function(event) {
            if (this.check_consent("events")) {
                add_cly_events(event);
            }
        };

        /**
         *  Add events to event queue
         *  @memberof Countly._internals
         *  @param {Event} event - countly event
         */
        function add_cly_events(event) {
            //ignore bots
            if (self.ignore_visitor) {
                return;
            }

            if (!event.key) {
                log("Event must have key property");
                return;
            }

            if (!event.count) {
                event.count = 1;
            }

            var props = ["key", "count", "sum", "dur", "segmentation"];
            var e = getProperties(event, props);
            e.timestamp = getMsTimestamp();
            var date = new Date();
            e.hour = date.getHours();
            e.dow = date.getDay();
            eventQueue.push(e);
            store("cly_event", eventQueue);
            log("Adding event: ", event);
        }

        /**
        * Start timed event, which will fill in duration property upon ending automatically
        * @param {string} key - event name that will be used as key property
        **/
        this.start_event = function(key) {
            if (timedEvents[key]) {
                log("Timed event with key " + key + " already started");
                return;
            }
            timedEvents[key] = getTimestamp();
        };

        /**
        * End timed event
        * @param {string|object} event - event key if string or Countly event same as passed to {@link Countly.add_event}
        **/
        this.end_event = function(event) {
            if (typeof event === "string") {
                event = { key: event };
            }
            if (!event.key) {
                log("Event must have key property");
                return;
            }
            if (!timedEvents[event.key]) {
                log("Timed event with key " + event.key + " was not started");
                return;
            }
            event.dur = getTimestamp() - timedEvents[event.key];
            this.add_event(event);
            delete timedEvents[event.key];
        };

        /**
        * Report device orientation
        * @param {string=} orientation - orientation as landscape or portrait
        **/
        this.report_orientation = function(orientation) {
            if (this.check_consent("users")) {
                add_cly_events({
                    "key": "[CLY]_orientation",
                    "segmentation": {
                        "mode": orientation || getOrientation()
                    }
                });
            }
        };

        /**
        * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
        * @param {string=} campaign_id - id of campaign, or will use the one that is stored after campaign link click
        * @param {string=} campaign_user_id - id of user's click on campaign, or will use the one that is stored after campaign link click
        **/
        this.report_conversion = function(campaign_id, campaign_user_id) {
            if (this.check_consent("attribution")) {
                campaign_id = campaign_id || store("cly_cmp_id") || "cly_organic";
                campaign_user_id = campaign_user_id || store("cly_cmp_uid");

                if (campaign_id && campaign_user_id) {
                    toRequestQueue({ campaign_id: campaign_id, campaign_user: campaign_user_id });
                }
                else if (campaign_id) {
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
        **/
        this.user_details = function(user) {
            if (this.check_consent("users")) {
                log("Adding user details: ", user);
                var props = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear", "custom"];
                toRequestQueue({ user_details: JSON.stringify(getProperties(user, props)) });
            }
        };

        /**************************
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
        **************************/
        var customData = {};
        var change_custom_property = function(key, value, mod) {
            if (self.check_consent("users")) {
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
        * Countly.userData.set("twitter", "ar2rsawseen");
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
            **/
            set: function(key, value) {
                customData[key] = value;
            },
            /**
            * Unset/deletes user's custom property
            * @memberof Countly.userData
            * @param {string} key - name of the property to delete
            **/
            unset: function(key) {
                customData[key] = "";
            },
            /**
            * Sets user's custom property value only if it was not set before
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value to store under provided property
            **/
            set_once: function(key, value) {
                change_custom_property(key, value, "$setOnce");
            },
            /**
            * Increment value under the key of this user's custom properties by one
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            **/
            increment: function(key) {
                change_custom_property(key, 1, "$inc");
            },
            /**
            * Increment value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to increment server value
            **/
            increment_by: function(key, value) {
                change_custom_property(key, value, "$inc");
            },
            /**
            * Multiply value under the key of this user's custom properties by provided value
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value by which to multiply server value
            **/
            multiply: function(key, value) {
                change_custom_property(key, value, "$mul");
            },
            /**
            * Save maximal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store maximal value of both provided
            **/
            max: function(key, value) {
                change_custom_property(key, value, "$max");
            },
            /**
            * Save minimal value under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {number} value - value which to compare to server's value and store minimal value of both provided
            **/
            min: function(key, value) {
                change_custom_property(key, value, "$min");
            },
            /**
            * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            **/
            push: function(key, value) {
                change_custom_property(key, value, "$push");
            },
            /**
            * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
            * @memberof Countly.userData
            * @param {string} key - name of the property to attach to user
            * @param {string|number} value - value which to add to array
            **/
            push_unique: function(key, value) {
                change_custom_property(key, value, "$addToSet");
            },
            /**
            * Remove value from array under the key of this user's custom properties
            * @memberof Countly.userData
            * @param {string} key - name of the property
            * @param {string|number} value - value which to remove from array
            **/
            pull: function(key, value) {
                change_custom_property(key, value, "$pull");
            },
            /**
            * Save changes made to user's custom properties object and send them to server
            * @memberof Countly.userData
            **/
            save: function() {
                if (self.check_consent("users")) {
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
            if (this.check_consent("apm")) {
                var props = ["type", "name", "stz", "etz", "apm_metrics", "apm_attr"];
                for (var i = 0; i < props.length; i++) {
                    if (props[i] !== "apm_attr" && typeof trace[props[i]] === "undefined") {
                        log("APM trace must have a", props[i]);
                        return;
                    }
                }

                var e = getProperties(trace, props);
                e.timestamp = trace.stz;
                var date = new Date();
                e.hour = date.getHours();
                e.dow = date.getDay();
                toRequestQueue({ apm: JSON.stringify(e) });
                log("Adding APM trace: ", e);
            }
        };

        /**
        * Automatically track javascript errors that happen on the website and report them to the server
        * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        **/
        this.track_errors = function(segments) {
            Countly.i[this.app_key].tracking_crashes = true;
            if (!window.cly_crashes) {
                window.cly_crashes = true;
                crashSegments = segments;
                //override global uncaught error handler
                window.onerror = function(msg, url, line, col, err) {
                    if (typeof err !== "undefined") {
                        dispatchErrors(err, false);
                    }
                    else {
                        col = col || (window.event && window.event.errorCharacter);
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
                            // eslint-disable-next-line no-caller
                            var f = arguments.callee.caller;
                            while (f) {
                                stack.push(f.name);
                                f = f.caller;
                            }
                            error += stack.join("\n");
                        }
                        catch (ex) {
                            //silent error
                        }
                        dispatchErrors(error, false);
                    }
                };

                window.addEventListener('unhandledrejection', function(event) {
                    dispatchErrors(new Error('Unhandled rejection (reason: ' + (event.reason && event.reason.stack ? event.reason.stack : event.reason) + ').'), true);
                });
            }
        };

        /**
        * Log an exception that you caught through try and catch block and handled yourself and just want to report it to server
        * @param {Object} err - error exception object provided in catch block
        * @param {string=} segments - additional key value pairs you want to provide with error report, like versions of libraries used, etc.
        **/
        this.log_error = function(err, segments) {
            this.recordError(err, true, segments);
        };

        /**
        * Add new line in the log of breadcrumbs of what user did, will be included together with error report
        * @param {string} record - any text describing what user did
        **/
        this.add_log = function(record) {
            if (this.check_consent("crashes")) {
                if (crashLogs.length > maxCrashLogs) {
                    crashLogs.shift();
                }
                crashLogs.push(record);
            }
        };

        /**
        * Fetch remote config
        * @param {array=} keys - Array of keys to fetch, if not provided will fetch all keys
        * @param {array=} omit_keys - Array of keys to omit, if provided will fetch all keys except provided ones
        * @param {function=} callback - Callback to notify with first param error and second param remote config object
        **/
        this.fetch_remote_config = function(keys, omit_keys, callback) {
            if (this.check_consent("remote-config")) {
                var request = {
                    method: "fetch_remote_config"
                };
                if (this.check_consent("sessions")) {
                    request.metrics = JSON.stringify(getMetrics());
                }
                if (keys) {
                    if (!callback && typeof keys === "function") {
                        callback = keys;
                        keys = null;
                    }
                    else if (Array.isArray(keys) && keys.length) {
                        request.keys = JSON.stringify(keys);
                    }
                }
                if (omit_keys) {
                    if (!callback && typeof omit_keys === "function") {
                        callback = omit_keys;
                        omit_keys = null;
                    }
                    else if (Array.isArray(omit_keys) && omit_keys.length) {
                        request.omit_keys = JSON.stringify(omit_keys);
                    }
                }
                prepareRequest(request);
                sendXmlHttpRequest(this.url + readPath, request, function(err, params, responseText) {
                    try {
                        var configs = JSON.parse(responseText);
                        if (request.keys || request.omit_keys) {
                            //we merge config
                            for (var i in configs) {
                                remoteConfigs[i] = configs[i];
                            }
                        }
                        else {
                            //we replace config
                            remoteConfigs = configs;
                        }
                        store("cly_remote_configs", remoteConfigs);
                    }
                    catch (ex) {
                        //silent catch
                    }
                    if (typeof callback === "function") {
                        callback(err, remoteConfigs);
                    }
                });
            }
            else {
                log("Remote config requires explicit consent");
                if (typeof callback === "function") {
                    callback(new Error("Remote config requires explicit consent"), remoteConfigs);
                }
            }
        };

        /**
        * Get Remote config object or specific value for provided key
        * @param {string=} key - if provided, will return value for key, or return whole object
        * @returns {object} remote configs
        **/
        this.get_remote_config = function(key) {
            if (typeof key !== "undefined") {
                return remoteConfigs[key];
            }
            return remoteConfigs;
        };

        /**
        * Stop tracking duration time for this user
        **/
        this.stop_time = function() {
            if (trackTime) {
                trackTime = false;
                storedDuration = getTimestamp() - lastBeat;
                lastViewStoredDuration = getTimestamp() - lastViewTime;
            }
        };

        /**
        * Start tracking duration time for this user, by default it is automatically tracked if you are using internal session handling
        **/
        this.start_time = function() {
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
        **/
        this.track_sessions = function() {
            //start session
            this.begin_session();
            this.start_time();

            //end session on unload
            add_event(window, "beforeunload", function() {
                self.end_session();
            });

            //manage sessions on window visibility events
            var hidden = "hidden";

            /**
             *  Handle visibility change events
             */
            function onchange() {
                if (document[hidden]) {
                    self.stop_time();
                }
                else {
                    self.start_time();
                }
            }

            //Page Visibility API
            if (hidden in document) {
                document.addEventListener("visibilitychange", onchange);
            }
            else if ((hidden = "mozHidden") in document) {
                document.addEventListener("mozvisibilitychange", onchange);
            }
            else if ((hidden = "webkitHidden") in document) {
                document.addEventListener("webkitvisibilitychange", onchange);
            }
            else if ((hidden = "msHidden") in document) {
                document.addEventListener("msvisibilitychange", onchange);
            }
            // IE 9 and lower:
            else if ("onfocusin" in document) {
                add_event(window, "focusin", function() {
                    self.start_time();
                });
                add_event(window, "focusout", function() {
                    self.stop_time();
                });
            }
            // All others:
            else {
                //old way
                add_event(window, "focus", function() {
                    self.start_time();
                });
                add_event(window, "blur", function() {
                    self.stop_time();
                });

                //newer mobile compatible way
                add_event(window, "pageshow", function() {
                    self.start_time();
                });
                add_event(window, "pagehide", function() {
                    self.stop_time();
                });
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

            add_event(window, "mousemove", resetInactivity);
            add_event(window, "click", resetInactivity);
            add_event(window, "keydown", resetInactivity);
            add_event(window, "scroll", resetInactivity);

            //track user inactivity
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
        **/
        this.track_pageview = function(page, ignoreList, viewSegments) {
            reportViewDuration();
            //we got ignoreList first
            if (page && Array.isArray(page)) {
                ignoreList = page;
                page = null;
            }
            if (!page) {
                page = this.getViewName();
            }
            if (ignoreList && ignoreList.length) {
                for (var i = 0; i < ignoreList.length; i++) {
                    try {
                        var reg = new RegExp(ignoreList[i]);
                        if (reg.test(page)) {
                            log("Ignored:", page);
                            return;
                        }
                    }
                    catch (ex) {
                        log("Problem with regex", ignoreList[i]);
                    }
                }
            }
            lastView = page;
            lastViewTime = getTimestamp();
            var segments = {
                "name": page,
                "visit": 1,
                "view": this.getViewUrl()
            };

            if (this.track_domains) {
                segments.domain = window.location.hostname;
            }

            if (useSessionCookie) {
                if (!sessionStarted) {
                    //tracking view was called before tracking session, so we check expiration ourselves
                    var expire = store("cly_session");
                    if (!expire || parseInt(expire) <= getTimestamp()) {
                        firstView = false;
                        segments.start = 1;
                    }
                }
                //tracking views called after tracking session, so we can rely on tracking session decision
                else if (firstView) {
                    firstView = false;
                    segments.start = 1;
                }
            }
            //if we are not using session cookie, there is no session state between refreshes
            //so we fallback to old logic of landing
            else if (typeof document.referrer !== "undefined" && document.referrer.length) {
                var matches = urlParseRE.exec(document.referrer);
                //do not report referrers of current website
                if (matches && matches[11] && matches[11] !== window.location.hostname) {
                    segments.start = 1;
                }
            }

            if (viewSegments) {
                for (var key in viewSegments) {
                    if (typeof segments[key] === "undefined") {
                        segments[key] = viewSegments[key];
                    }
                }
            }

            //track pageview
            if (this.check_consent("views")) {
                add_cly_events({
                    "key": "[CLY]_view",
                    "segmentation": segments
                });
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
        **/
        this.track_view = function(page, ignoreList, segments) {
            this.track_pageview(page, ignoreList, segments);
        };

        /**
        * Track all clicks on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        **/
        this.track_clicks = function(parent) {
            parent = parent || document;
            var shouldProcess = true;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            function processClick(event) {
                if (shouldProcess) {
                    shouldProcess = false;

                    //cross browser click coordinates
                    get_page_coord(event);
                    if (typeof event.pageX !== "undefined" && typeof event.pageY !== "undefined") {
                        var height = getDocHeight();
                        var width = getDocWidth();

                        //record click event
                        if (self.check_consent("clicks")) {
                            var segments = {
                                "type": "click",
                                "x": event.pageX,
                                "y": event.pageY,
                                "width": width,
                                "height": height,
                                "view": self.getViewUrl()
                            };
                            if (self.track_domains) {
                                segments.domain = window.location.hostname;
                            }
                            add_cly_events({
                                "key": "[CLY]_action",
                                "segmentation": segments
                            });
                        }
                    }
                    setTimeout(function() {
                        shouldProcess = true;
                    }, 1000);
                }
            }
            //add any events you want
            add_event(parent, "click", processClick);
        };

        /**
        * Track all scrolls on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        **/
        this.track_scrolls = function(parent) {
            parent = parent || window;
            var shouldProcess = true;
            var scrollY = 0;

            /**
             *  Get max scroll position
             */
            function processScroll() {
                scrollY = Math.max(scrollY, window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);
            }

            /**
             *  Process scroll data
             */
            function processScrollView() {
                if (shouldProcess) {
                    shouldProcess = false;
                    var height = getDocHeight();
                    var width = getDocWidth();

                    var viewportHeight = getViewportHeight();

                    if (self.check_consent("scrolls")) {
                        var segments = {
                            "type": "scroll",
                            "y": scrollY + viewportHeight,
                            "width": width,
                            "height": height,
                            "view": self.getViewUrl()
                        };
                        if (self.track_domains) {
                            segments.domain = window.location.hostname;
                        }
                        add_cly_events({
                            "key": "[CLY]_action",
                            "segmentation": segments
                        });
                    }
                }
            }

            add_event(parent, "scroll", processScroll);
            add_event(parent, "beforeunload", processScrollView);
        };

        /**
        * Generate custom event for all links that were clicked on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        **/
        this.track_links = function(parent) {
            parent = parent || document;
            /**
             *  Process click information
             *  @param {Event} event - click event
             */
            function processClick(event) {

                //get element which was clicked
                var elem = get_closest_element(get_event_target(event), "a");

                if (elem) {
                    //cross browser click coordinates
                    get_page_coord(event);

                    //record click event
                    if (self.check_consent("clicks")) {
                        add_cly_events({
                            "key": "linkClick",
                            "segmentation": {
                                "href": elem.href,
                                "text": elem.innerText,
                                "id": elem.id,
                                "view": self.getViewUrl()
                            }
                        });
                    }
                }
            }

            //add any events you want
            add_event(parent, "click", processClick);
        };

        /**
        * Generate custom event for all forms that were submitted on this page
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean=} trackHidden - provide true to also track hidden inputs, default false
        **/
        this.track_forms = function(parent, trackHidden) {
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
                    "id": form.attributes.id && form.attributes.id.nodeValue,
                    "name": form.attributes.name && form.attributes.name.nodeValue,
                    "action": form.attributes.action && form.attributes.action.nodeValue,
                    "method": form.attributes.method && form.attributes.method.nodeValue,
                    "view": self.getViewUrl()
                };

                //get input values
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

                //record submit event
                if (self.check_consent("forms")) {
                    add_cly_events({
                        "key": "formSubmit",
                        "segmentation": segmentation
                    });
                }
            }

            //add any events you want
            add_event(parent, "submit", processForm);
        };

        /**
        * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If not class is provided, Countly SDK will try to determine type of information automatically.
        * @param {Object=} parent - DOM object which children to track, by default it is document body
        * @param {boolean} [useCustom=false] - submit collected data as custom user properties, by default collects as main user properties
        **/
        this.collect_from_forms = function(parent, useCustom) {
            parent = parent || document;
            /**
             *  Process form data
             *  @param {Event} event - form submission event
             */
            function processForm(event) {
                var form = get_event_target(event);
                var userdata = {};
                var hasUserInfo = false;

                //get input values
                var input;
                if (typeof form.elements !== "undefined") {
                    //load labels for inputs
                    var labelData = {};
                    var labels = parent.getElementsByTagName("LABEL");
                    var i, j;
                    for (i = 0; i < labels.length; i++) {
                        if (labels[i].htmlFor && labels[i].htmlFor !== "") {
                            labelData[labels[i].htmlFor] = labels[i].innerText || labels[i].textContent || labels[i].innerHTML;
                        }
                    }
                    for (i = 0; i < form.elements.length; i++) {
                        input = form.elements[i];
                        if (input && input.type !== "password") {
                            //check if element should be ignored
                            if (input.className.indexOf("cly_user_ignore") === -1) {
                                var value = "";
                                //get value from input
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
                                //check if input was marked to be collected
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
                                //check for email
                                else if ((input.type && input.type.toLowerCase() === "email") ||
                                    (input.name && input.name.toLowerCase().indexOf("email") !== -1) ||
                                    (input.id && input.id.toLowerCase().indexOf("email") !== -1) ||
                                    (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("email") !== -1) ||
                                    (/[^@\s]+@[^@\s]+\.[^@\s]+/).test(value)) {
                                    if (!userdata.email) {
                                        userdata.email = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if ((input.name && input.name.toLowerCase().indexOf("username") !== -1) ||
                                    (input.id && input.id.toLowerCase().indexOf("username") !== -1) ||
                                    (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("username") !== -1)) {
                                    if (!userdata.username) {
                                        userdata.username = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if ((input.name && (input.name.toLowerCase().indexOf("tel") !== -1 || input.name.toLowerCase().indexOf("phone") !== -1 || input.name.toLowerCase().indexOf("number") !== -1)) ||
                                    (input.id && (input.id.toLowerCase().indexOf("tel") !== -1 || input.id.toLowerCase().indexOf("phone") !== -1 || input.id.toLowerCase().indexOf("number") !== -1)) ||
                                    (input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("tel") !== -1 || labelData[input.id].toLowerCase().indexOf("phone") !== -1 || labelData[input.id].toLowerCase().indexOf("number") !== -1))) {
                                    if (!userdata.phone) {
                                        userdata.phone = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if ((input.name && (input.name.toLowerCase().indexOf("org") !== -1 || input.name.toLowerCase().indexOf("company") !== -1)) ||
                                    (input.id && (input.id.toLowerCase().indexOf("org") !== -1 || input.id.toLowerCase().indexOf("company") !== -1)) ||
                                    (input.id && labelData[input.id] && (labelData[input.id].toLowerCase().indexOf("org") !== -1 || labelData[input.id].toLowerCase().indexOf("company") !== -1))) {
                                    if (!userdata.organization) {
                                        userdata.organization = value;
                                    }
                                    hasUserInfo = true;
                                }
                                else if ((input.name && input.name.toLowerCase().indexOf("name") !== -1) ||
                                    (input.id && input.id.toLowerCase().indexOf("name") !== -1) ||
                                    (input.id && labelData[input.id] && labelData[input.id].toLowerCase().indexOf("name") !== -1)) {
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

                //record user info, if any
                if (hasUserInfo) {
                    log("Gathered user data", userdata);
                    if (useCustom) {
                        self.user_details({ custom: userdata });
                    }
                    else {
                        self.user_details(userdata);
                    }
                }
            }

            //add any events you want
            add_event(parent, "submit", processForm);
        };

        /**
        * Collect information about user from Facebook, if your website integrates Facebook SDK. Call this method after Facebook SDK is loaded and user is authenticated.
        * @param {Object=} custom - Custom keys to collected from Facebook, key will be used to store as key in custom user properties and value as key in Facebook graph object. For example, {"tz":"timezone"} will collect Facebook's timezone property, if it is available and store it in custom user's property under "tz" key. If you want to get value from some sub object properties, then use dot as delimiter, for example, {"location":"location.name"} will collect data from Facebook's {"location":{"name":"MyLocation"}} object and store it in user's custom property "location" key
        **/
        this.collect_from_facebook = function(custom) {
            /* globals FB */
            if (FB && FB.api) {
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
                    //check if any custom keys to collect
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
            }
        };
        /**
        * Opts out user of any metric tracking
        **/
        this.opt_out = function() {
            this.ignore_visitor = true;
            store("cly_ignore", true);
        };

        /**
        * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
        **/
        this.opt_in = function() {
            store("cly_ignore", false);
            this.ignore_visitor = false;
            checkIgnore();
            if (!this.ignore_visitor && !hasPulse) {
                heartBeat();
            }
        };

        /**
        * Provide information about user
        * @param {Object} feedback - object with feedback properties
        * @param {string} feedback.widget_id - id of the widget in the dashboard
        * @param {boolean=} feedback.contactMe - did user give consent to contact him
        * @param {string=} feedback.platform - user's platform (will be filled if not provided)
        * @param {string=} feedback.app_version - app's app version (will be filled if not provided)
        * @param {number} feedback.rating - user's rating from 1 to 5
        * @param {string=} feedback.email - user's email
        * @param {string=} feedback.comment - user's comment
        **/
        this.report_feedback = function(feedback) {
            if (this.check_consent("star-rating") || this.check_consent("feedback")) {
                if (!feedback.widget_id) {
                    log("Feedback must contain widget_id property");
                    return;
                }
                if (!feedback.rating) {
                    log("Feedback must contain rating property");
                    return;
                }
                if (this.check_consent("events")) {
                    var props = ["widget_id", "contactMe", "platform", "app_version", "rating", "email", "comment"];
                    var event = {
                        key: "[CLY]_star_rating",
                        count: 1,
                        segmentation: {}
                    };
                    event.segmentation = getProperties(feedback, props);
                    if (!event.segmentation.app_version) {
                        event.segmentation.app_version = this.metrics._app_version || this.app_version;
                    }
                    log("Reporting feedback: ", event);
                    this.add_event(event);
                }
            }
        };

        /**
        * Show specific widget popup by the widget id
        * @param {string} id - id value of related feedback widget, you can get this value by click "Copy ID" button in row menu at "Feedback widgets" screen
        */
        this.show_feedback_popup = function(id) {
            if (!this.check_consent("star-rating") && !this.check_consent("feedback")) {
                return;
            }
            if (offlineMode) {
                log("Cannot show feedback popup in offline mode");
            }
            else {
                sendXmlHttpRequest(this.url + '/o/feedback/widget', {widget_id: id}, function(err, params, responseText) {
                    if (err) {
                        log("Error occurred", err);
                    }
                    try {
                        // widget object
                        var currentWidget = JSON.parse(responseText);
                        processWidget(currentWidget, false);
                    }
                    catch (JSONParseError) {
                        log("JSON parse failed: " + JSONParseError);
                    }
                });
            }
        };

        /**
        * Prepare widgets according current options
        * @param {array=} enableWidgets - widget ids array
        */
        this.initialize_feedback_popups = function(enableWidgets) {
            if (!this.check_consent("star-rating") && !this.check_consent("feedback")) {
                return;
            }
            if (!enableWidgets) {
                enableWidgets = store('cly_fb_widgets');
            }

            // remove all old stickers before add new one
            var stickers = document.getElementsByClassName("countly-feedback-sticker");
            while (stickers.length > 0) {
                stickers[0].remove();
            }

            sendXmlHttpRequest(this.url + '/o/feedback/multiple-widgets-by-id', {widgets: JSON.stringify(enableWidgets)}, function(err, params, responseText) {
                if (err) {
                    log("Errors occurred:", err);
                    return;
                }
                try {
                    // widgets array
                    var widgets = JSON.parse(responseText);
                    for (var i = 0; i < widgets.length; i++) {
                        if (widgets[i].is_active === "true") {
                            var target_devices = widgets[i].target_devices;
                            var currentDevice = detect_device.device;
                            // device match check
                            if (target_devices[currentDevice]) {
                                // is hide sticker option selected?
                                if (typeof widgets[i].hide_sticker === "string") {
                                    widgets[i].hide_sticker = widgets[i].hide_sticker === "true" ? true : false;
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
                                        var isFullpathMatched = pages[k] === window.location.pathname;
                                        var isContainAsterisk = pages[k].includes("*");
                                        if (((isContainAsterisk && isWildcardMatched) || isFullpathMatched) && !widgets[i].hide_sticker) {
                                            processWidget(widgets[i], true);
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
                catch (JSONParseError) {
                    log("JSON parse error: " + JSONParseError);
                }
            });
        };

        /**
        * Show feedback popup by passed widget ids array
        * @param {object=} params - required - includes "popups" property as string array of widgets ("widgets" for old versions)
        * example params: {"popups":["5b21581b967c4850a7818617"]}
        **/
        this.enable_feedback = function(params) {
            if (!this.check_consent("star-rating") && !this.check_consent("feedback")) {
                return;
            }
            if (offlineMode) {
                log("Cannot enable feedback in offline mode");
            }
            else {
                store('cly_fb_widgets', params.popups || params.widgets);
                // inject feedback styles
                loadCSS(this.url + '/star-rating/stylesheets/countly-feedback-web.css');
                // get enable widgets by app_key
                // define xhr object
                var enableWidgets = params.popups || params.widgets;

                if (enableWidgets.length > 0) {
                    document.body.insertAdjacentHTML('beforeend', '<div id="cfbg"></div>');
                    this.initialize_feedback_popups(enableWidgets);
                }
                else {
                    log("You should provide at least one widget id as param. Read documentation for more detail. https://resources.count.ly/plugins/feedback");
                }
            }
        };

        /**
        * Initialize feedbacks
        * @param {Function} callback - Callback function
        **/
        this.get_available_feedback_widgets = function(callback) {
            if (!this.check_consent("star-rating") && !this.check_consent("feedback")) {
                if (callback) {
                    callback(null, new Error("Consent for feedback not provided."));
                }

                return;
            }

            if (offlineMode) {
                log("Cannot enable feedback in offline mode.");
                return;
            }

            var url = this.url + readPath;
            var data = {
                method: "feedback",
                device_id: this.device_id,
                app_key: this.app_key
            };

            sendXmlHttpRequest(url, data, function(err, params, responseText) {
                if (err) {
                    log("Error occurred while fetching feedbacks", err);
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

                    return;
                }
                catch (error) {
                    log("Error while processing feedbacks", error);
                    if (callback) {
                        callback(null, error);
                    }

                    return;
                }
            });
        };

        /**
        * Present the feedback widget in webview
        * @param {Object} presentableFeedback - Current presentable feedback
        **/
        this.present_feedback_widget = function(presentableFeedback) {
            if (!this.check_consent("star-rating") && !this.check_consent("feedback")) {
                return;
            }

            if (!presentableFeedback ||
                (typeof presentableFeedback !== "object") ||
                Array.isArray(presentableFeedback)
            ) {
                log("Please provide at least one feedback widget object.");
                return;
            }

            try {
                var url = this.url;

                if (presentableFeedback.type === "nps") {
                    url += "/feedback/nps";
                }
                else if (presentableFeedback.type === "survey") {
                    url += "/feedback/survey";
                }
                else {
                    log("Feedback widget only accepts nps and survey types.");
                    return;
                }

                url += "?widget_id=" + presentableFeedback._id;
                url += "&app_key=" + this.app_key;
                url += "&device_id=" + this.device_id;
                url += "&sdk_name=" + SDK_NAME;
                url += "&platform=" + this.platform;
                url += "&app_version=" + this.app_version;
                url += "&sdk_version=" + SDK_VERSION;

                //Only web SDK passes origin and web
                url += "&origin=" + (window.origin || window.location.origin);
                url += "&widget_v=web";
                //Origin is passed to the popup so that it passes it back in the postMessage event

                var iframe = document.createElement("iframe");
                iframe.name = "countly-surveys-iframe";
                iframe.id = "countly-surveys-iframe";
                iframe.src = url;

                var initiated = false;
                iframe.onload = function() {
                    //This is used as a fallback for browsers where postMessage API doesn't work.

                    if (initiated) {
                        //On iframe reset remove the iframe and the overlay.
                        document.getElementById('countly-surveys-wrapper-' + presentableFeedback._id).style.display = "none";
                        document.getElementById('csbg').style.display = "none";
                    }

                    //Setting initiated marks the first time initiation of the iframe.
                    //When initiated for the first time, do not hide the survey bcz you want
                    //the survey to be shown for the first time.
                    //Any subsequent onloads mean that the survey is being refreshed or reset.
                    //This time hide it as being done in the above check.
                    initiated = true;
                };

                loadCSS(this.url + '/surveys/stylesheets/countly-surveys.css');

                var overlay = document.getElementById("csbg");
                while (overlay) {
                    //Remove any existing overlays
                    overlay.remove();
                    overlay = document.getElementById("csbg");
                }

                var wrapper = document.getElementsByClassName("countly-surveys-wrapper");
                for (var i = 0; i < wrapper.length; i++) {
                    //Remove any existing feedback wrappers
                    wrapper[i].remove();
                }

                document.body.insertAdjacentHTML('beforeend', '<div id="csbg"></div>');

                wrapper = document.createElement("div");
                wrapper.className = 'countly-surveys-wrapper';
                wrapper.id = 'countly-surveys-wrapper-' + presentableFeedback._id;

                if (presentableFeedback.type === "survey") {
                    //Set popup position
                    wrapper.className = wrapper.className + " " + presentableFeedback.appearance.position;
                }

                document.body.appendChild(wrapper);
                wrapper.appendChild(iframe);

                add_event(window, "message", function(e) {
                    var data = {};
                    try {
                        data = JSON.parse(e.data);
                    }
                    catch (ex) {
                        log("Error while parsing message body " + ex);
                    }

                    if ((e.origin !== Countly.url) || !(data.close)) {
                        return;
                    }

                    document.getElementById('countly-surveys-wrapper-' + presentableFeedback._id).style.display = "none";
                    document.getElementById('csbg').style.display = "none";
                });

                if (presentableFeedback.type === "survey") {
                    var surveyShown = false;

                    //Set popup show policy
                    switch (presentableFeedback.showPolicy) {
                    case "afterPageLoad":
                        if (document.readyState === "complete") {
                            if (!surveyShown) {
                                surveyShown = true;
                                showSurvey(presentableFeedback);
                            }
                        }
                        else {
                            add_event(document, "readystatechange", function(e) {
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
                            add_event(document, "mouseleave", function() {
                                if (!surveyShown) {
                                    surveyShown = true;
                                    showSurvey(presentableFeedback);
                                }
                            });
                        }
                        else {
                            add_event(document, "readystatechange", function(e) {
                                if (e.target.readyState === "complete") {
                                    add_event(document, "mouseleave", function() {
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
                        add_event(window, "scroll", function() {
                            if (!surveyShown) {
                                var scrollY = Math.max(window.scrollY, document.body.scrollTop, document.documentElement.scrollTop);
                                var documentHeight = getDocHeight();
                                if (scrollY >= (documentHeight / 2)) {
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
                    document.getElementById('countly-surveys-wrapper-' + presentableFeedback._id).style.display = "block";
                    document.getElementById('csbg').style.display = "block";
                }
            }
            catch (e) {
                log("Somethings went wrong while presenting the feedback", e);
            }

            /**
             * Function to show survey popup
             * @param  {Object} feedback - feedback object
             */
            function showSurvey(feedback) {
                document.getElementById('countly-surveys-wrapper-' + feedback._id).style.display = "block";
                document.getElementById('csbg').style.display = "block";
            }
        };

        /**
         *  Record and report error
         *  @param {Error} err - Error object
         *  @param {Boolean} nonfatal - nonfatal if true and false if fatal
         *  @param {Object} segments - custom crash segments
         */
        this.recordError = function(err, nonfatal, segments) {
            if (this.check_consent("crashes") && err) {
                segments = segments || crashSegments;
                var error = "";
                if (typeof err === "object") {
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
                nonfatal = (nonfatal) ? true : false;
                var metrics = getMetrics();
                var obj = { _resolution: metrics._resolution, _error: error, _app_version: metrics._app_version, _run: getTimestamp() - startTime };

                obj._not_os_specific = true;
                obj._javascript = true;

                var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery || navigator.msBattery;
                if (battery) {
                    obj._bat = Math.floor(battery.level * 100);
                }

                if (typeof navigator.onLine !== "undefined") {
                    obj._online = (navigator.onLine) ? true : false;
                }

                obj._background = (document.hasFocus()) ? false : true;

                if (crashLogs.length > 0) {
                    obj._logs = crashLogs.join("\n");
                }
                crashLogs = [];

                obj._nonfatal = nonfatal;

                obj._view = this.getViewName();

                if (typeof segments !== "undefined") {
                    obj._custom = segments;
                }

                try {
                    var canvas = document.createElement("canvas");
                    var gl = canvas.getContext("experimental-webgl");
                    obj._opengl = gl.getParameter(gl.VERSION);
                }
                catch (ex) {
                    //silent error
                }

                toRequestQueue({ crash: JSON.stringify(obj) });
            }
        };

        /**
         *  Check if user or visit should be ignored
         */
        function checkIgnore() {
            if (self.ignore_prefetch && typeof document.visibilityState !== "undefined" && document.visibilityState === "prerender") {
                self.ignore_visitor = true;
            }
            if (self.ignore_bots && searchBotRE.test(navigator.userAgent)) {
                self.ignore_visitor = true;
            }
        }

        /**
         *  Prepare widget data for displaying
         *  @param {Object} currentWidget - widget object
         *  @param {Boolean} hasSticker - if widget has sticker
         */
        function processWidget(currentWidget, hasSticker) {
            // prevent widget create process if widget exist with same id
            var isDuplicate = document.getElementById('countly-feedback-sticker-' + currentWidget._id) ? true : false;
            if (isDuplicate) {
                return;
            }
            try {
                // create wrapper div
                var wrapper = document.createElement("div");
                wrapper.className = 'countly-iframe-wrapper';
                wrapper.id = 'countly-iframe-wrapper-' + currentWidget._id;
                // create close icon for iframe popup
                var closeIcon = document.createElement("span");
                closeIcon.className = "countly-feedback-close-icon";
                closeIcon.id = "countly-feedback-close-icon-" + currentWidget._id;
                closeIcon.innerText = "x";

                // create iframe
                var iframe = document.createElement("iframe");
                iframe.name = "countly-feedback-iframe";
                iframe.id = "countly-feedback-iframe";
                iframe.src = self.url + "/feedback?widget_id=" + currentWidget._id + "&app_key=" + self.app_key + '&device_id=' + self.device_id + '&sdk_version=' + SDK_VERSION;
                // inject them to dom
                document.body.appendChild(wrapper);
                wrapper.appendChild(closeIcon);
                wrapper.appendChild(iframe);
                add_event(document.getElementById('countly-feedback-close-icon-' + currentWidget._id), 'click', function() {
                    document.getElementById('countly-iframe-wrapper-' + currentWidget._id).style.display = "none";
                    document.getElementById('cfbg').style.display = "none";
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
                    sticker.style.color = ((currentWidget.trigger_font_color < 7) ? '#' + currentWidget.trigger_font_color : currentWidget.trigger_font_color);
                    sticker.style.backgroundColor = ((currentWidget.trigger_bg_color.length < 7) ? '#' + currentWidget.trigger_bg_color : currentWidget.trigger_bg_color);
                    sticker.className = 'countly-feedback-sticker  ' + currentWidget.trigger_position + '-' + currentWidget.trigger_size;
                    sticker.id = 'countly-feedback-sticker-' + currentWidget._id;
                    svgIcon.appendChild(svgPath);
                    sticker.appendChild(svgIcon);
                    sticker.appendChild(stickerText);
                    document.body.appendChild(sticker);
                    var smileySvg = document.getElementById("smileyPathInStickerSvg");
                    if (smileySvg) {
                        smileySvg.style.fill = ((currentWidget.trigger_font_color < 7) ? '#' + currentWidget.trigger_font_color : currentWidget.trigger_font_color);
                    }
                    add_event(document.getElementById('countly-feedback-sticker-' + currentWidget._id), 'click', function() {
                        document.getElementById('countly-iframe-wrapper-' + currentWidget._id).style.display = "block";
                        document.getElementById('cfbg').style.display = "block";
                    });
                }
                else {
                    document.getElementById('countly-iframe-wrapper-' + currentWidget._id).style.display = "block";
                    document.getElementById('cfbg').style.display = "block";
                }
            }
            catch (e) {
                log("Somethings went wrong while element injecting process: " + e);
            }
        }

        /**
         *  Notify all waiting callbacks that script was loaded and instance created
         */
        function notifyLoaders() {
            //notify load waiters
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
                    "name": lastView
                };

                //track pageview
                if (self.check_consent("views")) {
                    add_cly_events({
                        "key": "[CLY]_view",
                        "dur": (trackTime) ? getTimestamp() - lastViewTime : lastViewStoredDuration,
                        "segmentation": segments
                    });
                }
                lastView = null;
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
                //if session expired, we should start a new one
                var expire = store("cly_session");
                if (!expire || parseInt(expire) <= getTimestamp()) {
                    sessionStarted = false;
                    self.begin_session(!autoExtend);
                }
                store("cly_session", getTimestamp() + (sessionCookieTimeout * 60));
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

            if (self.check_consent("location")) {
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
                return;
            }

            if (!self.app_key || !self.device_id) {
                log("app_key or device_id is missing");
                return;
            }

            prepareRequest(request);

            if (requestQueue.length > queueSize) {
                requestQueue.shift();
            }

            requestQueue.push(request);
            store("cly_queue", requestQueue, true);
        }

        /**
         *  Making request making and data processing loop
         *  @memberof Countly._internals
         *  @returns {void} void
         */
        function heartBeat() {
            notifyLoaders();

            //ignore bots
            if (self.test_mode || self.ignore_visitor) {
                hasPulse = false;
                return;
            }

            hasPulse = true;
            var i = 0;
            //process queue
            if (global && typeof Countly.q !== "undefined" && Countly.q.length > 0) {
                var req;
                var q = Countly.q;
                Countly.q = [];
                for (i = 0; i < q.length; i++) {
                    req = q[i];
                    log("Processing queued call", req);
                    if (typeof req === "function") {
                        req();
                    }
                    else if (Array.isArray(req) && req.length > 0) {
                        var inst = self, arg = 0;
                        //check if it is meant for other tracker
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

            //extend session if needed
            if (sessionStarted && autoExtend && trackTime) {
                var last = getTimestamp();
                if (last - lastBeat > sessionUpdate) {
                    self.session_duration(last - lastBeat);
                    lastBeat = last;
                }
            }

            //process event queue
            if (eventQueue.length > 0) {
                if (eventQueue.length <= maxEventBatch) {
                    toRequestQueue({ events: JSON.stringify(eventQueue) });
                    eventQueue = [];
                }
                else {
                    var events = eventQueue.splice(0, maxEventBatch);
                    toRequestQueue({ events: JSON.stringify(events) });
                }
                store("cly_event", eventQueue);
            }

            //process request queue with event queue
            if (!offlineMode && requestQueue.length > 0 && readyToProcess && getTimestamp() > failTimeout) {
                readyToProcess = false;
                var params = requestQueue[0];
                //check if any consent to sync
                if (hasAnyProperties(syncConsents)) {
                    if (consentTimer) {
                        clearTimeout(consentTimer);
                        consentTimer = null;
                    }
                    params.consent = JSON.stringify(syncConsents);
                    syncConsents = {};
                }
                log("Processing request", params);
                store("cly_queue", requestQueue, true);
                sendXmlHttpRequest(self.url + apiPath, params, function(err, parameters) {
                    log("Request Finished", parameters, err);
                    if (err) {
                        failTimeout = getTimestamp() + failTimeoutAmount;
                    }
                    else {
                        //remove first item from queue
                        requestQueue.shift();
                    }
                    store("cly_queue", requestQueue, true);
                    readyToProcess = true;
                });
            }

            setTimeout(heartBeat, beatInterval);
        }

        /**
         *  Get device ID, stored one, or generate new one
         *  @memberof Countly._internals
         *  @returns {String} device id
         */
        function getId() {
            return store("cly_id") || generateUUID();
        }

        /**
         *  Check if value is in UUID format
         *  @memberof Countly._internals
         *  @returns {Boolean} true if it is in UUID format
         */
        function isUUID() {
            return /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(self.device_id);
        }

        /**
         *  Get metrics of the browser or config object
         *  @memberof Countly._internals
         *  @returns {Object} Metrics object
         */
        function getMetrics() {
            var metrics = JSON.parse(JSON.stringify(self.metrics || {}));

            //getting app version
            metrics._app_version = metrics._app_version || self.app_version;
            metrics._ua = metrics._ua || navigator.userAgent;

            //getting resolution
            if (screen.width) {
                var width = (screen.width) ? parseInt(screen.width) : 0;
                var height = (screen.height) ? parseInt(screen.height) : 0;
                if (width !== 0 && height !== 0) {
                    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
                    if (iOS && window.devicePixelRatio) {
                        //ios provides dips, need to multiply
                        width = Math.round(width * window.devicePixelRatio);
                        height = Math.round(height * window.devicePixelRatio);
                    }
                    else {
                        if (Math.abs(window.orientation) === 90) {
                            //we have landscape orientation
                            //switch values for all except ios
                            var temp = width;
                            width = height;
                            height = temp;
                        }
                    }
                    metrics._resolution = metrics._resolution || "" + width + "x" + height;
                }
            }

            //getting density ratio
            if (window.devicePixelRatio) {
                metrics._density = metrics._density || window.devicePixelRatio;
            }

            //getting locale
            var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
            if (typeof locale !== "undefined") {
                metrics._locale = metrics._locale || locale;
            }

            if (typeof document.referrer !== "undefined" && document.referrer.length) {
                var matches = urlParseRE.exec(document.referrer);
                //do not report referrers of current website
                if (matches && matches[11] && matches[11] !== window.location.hostname) {
                    var ignoring = false;
                    if (ignoreReferrers && ignoreReferrers.length) {
                        for (var k = 0; k < ignoreReferrers.length; k++) {
                            try {
                                var reg = new RegExp(ignoreReferrers[k]);
                                if (reg.test(document.referrer)) {
                                    log("Ignored:", document.referrer);
                                    ignoring = true;
                                    break;
                                }
                            }
                            catch (ex) {
                                log("Problem with regex", ignoreReferrers[k]);
                            }
                        }
                    }
                    if (!ignoring) {
                        metrics._store = metrics._store || document.referrer;
                    }
                }
            }

            log("Got metrics", metrics);
            return metrics;
        }

        /**
         *  Logging stuff, works only when debug mode is enabled
         *  @memberof Countly._internals
         */
        function log() {
            if (self.debug && typeof console !== "undefined") {
                if (arguments[1] && typeof arguments[1] === "object") {
                    arguments[1] = JSON.stringify(arguments[1]);
                }
                if (!global) {
                    arguments[0] = "[" + self.app_key + "] " + arguments[0];
                }
                // eslint-disable-next-line no-console
                console.log(Array.prototype.slice.call(arguments).join("\n"));
            }
        }

        /**
         *  Making xml HTTP request
         *  @memberof Countly._internals
         *  @param {String} url - URL where to make request
         *  @param {Object} params - key value object with URL params
         *  @param {Function} callback - callback when request finished or failed
         */
        function sendXmlHttpRequest(url, params, callback) {
            try {
                log("Sending XML HTTP request");
                var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : window.ActiveXObject ? new window.ActiveXObject("Microsoft.XMLHTTP") : null;
                params = params || {};
                var data = prepareParams(params);
                var method = "GET";
                if (self.force_post || data.length >= 2000) {
                    method = "POST";
                }
                if (method === "GET") {
                    xhr.open('GET', url + "?" + data, true);
                }
                else {
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }
                for (var header in self.headers) {
                    xhr.setRequestHeader(header, self.headers[header]);
                }
                // fallback on error
                xhr.onreadystatechange = function() {
                    if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                        if (typeof callback === 'function') {
                            callback(false, params, this.responseText);
                        }
                    }
                    else if (this.readyState === 4) {
                        log("Failed Server XML HTTP request", this.status);
                        if (typeof callback === "function") {
                            callback(true, params);
                        }
                    }
                };
                if (method === "GET") {
                    xhr.send();
                }
                else {
                    xhr.send(data);
                }
            }
            catch (e) {
                // fallback
                log("Failed XML HTTP request", e);
                if (typeof callback === "function") {
                    callback(true, params);
                }
            }
        }

        /**
         *  Set auth token
         *  @memberof Countly._internals
         *  @param {String} token - auth token
         */
        function setToken(token) {
            store("cly_token", token);
        }

        /**
         *  Get auth token
         *  @memberof Countly._internals
         *  @returns {String} auth token
         */
        function getToken() {
            var token = store("cly_token");
            store("cly_token", null);
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
         *  Storage function that acts as setter and getter
         *  @memberof Countly._internals
         *  @param {String} key - storage key
         *  @param {Varies} value - value to set for key, if omitted acts as getter
         *  @param {Boolean} storageOnly - if false, will fallback to cookie storage
         *  @param {Boolean} rawKey - if true, raw key will be used without app_key prefix
         *  @returns {Varies} values stored for key
         */
        function store(key, value, storageOnly, rawKey) {
            //check if we should use storage at all
            if (self.storage === "none") {
                return;
            }

            //apply namespace
            if (!rawKey) {
                key = self.app_key + "/" + key;
                if (self.namespace) {
                    key = stripTrailingSlash(self.namespace) + "/" + key;
                }
            }

            storageOnly = storageOnly || self.storage === "localstorage";
            var data;

            // If value is detected, set new or modify store
            if (typeof value !== "undefined" && value !== null) {
                value = self.serialize(value);
                // Set the store
                if (lsSupport) { // Native support
                    localStorage.setItem(key, value);
                }
                else if (!storageOnly) { // Use Cookie
                    createCookie(key, value, 30);
                }
            }

            // No value supplied, return value
            if (typeof value === "undefined") {
                // Get value
                if (lsSupport) { // Native support
                    data = localStorage.getItem(key);
                }
                else if (!storageOnly) { // Use cookie
                    data = readCookie(key);
                }

                return self.deserialize(data);

            }

            // Null specified, remove store
            if (value === null) {
                if (lsSupport) { // Native support
                    localStorage.removeItem(key);
                }
                else if (!storageOnly) { // Use cookie
                    createCookie(key, "", -1);
                }
            }

            /**
             *  Creates new cookie or removes cookie with negative expiration
             *  @param {String} cookieKey - The key or identifier for the store
             *  @param {String} cookieVal - Contents of the store
             *  @param {Number} exp - Expiration in days
             */
            function createCookie(cookieKey, cookieVal, exp) {
                var date = new Date();
                date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
                document.cookie = cookieKey + "=" + cookieVal + expires + "; path=/";
            }

            /**
            * Returns contents of cookie
            * @param {String} cookieKey - The key or identifier for the store
            * @returns {Varies} stored value
            */
            function readCookie(cookieKey) {
                var nameEQ = cookieKey + "=";
                var ca = document.cookie.split(";");
                for (var i = 0, max = ca.length; i < max; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === " ") {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
                return null;
            }
        }

        /**
         *  Migrate from old storage to new app_key prefixed storage
         */
        function migrate() {
            if (store(self.namespace + "cly_id", undefined, false, true)) {
                //old data exists, we should migrate it
                store("cly_id", store(self.namespace + "cly_id", undefined, false, true));
                store("cly_event", store(self.namespace + "cly_event", undefined, false, true));
                store("cly_session", store(self.namespace + "cly_session", undefined, false, true));

                //filter out requests with correct app_key
                var requests = store(self.namespace + "cly_queue", undefined, false, true);
                if (Array.isArray(requests)) {
                    requests = requests.filter(function(req) {
                        return req.app_key === self.app_key;
                    });
                    store("cly_queue", requests);
                }
                if (store(self.namespace + "cly_cmp_id", undefined, false, true)) {
                    store("cly_cmp_id", store(self.namespace + "cly_cmp_id", undefined, false, true));
                    store("cly_cmp_uid", store(self.namespace + "cly_cmp_uid", undefined, false, true));
                }
                if (store(self.namespace + "cly_ignore", undefined, false, true)) {
                    store("cly_ignore", store(self.namespace + "cly_ignore", undefined, false, true));
                }

                //now deleting old data, so we won't migrate again
                store("cly_id", null, false, true);
                store("cly_event", null, false, true);
                store("cly_session", null, false, true);
                store("cly_queue", null, false, true);
                store("cly_cmp_id", null, false, true);
                store("cly_cmp_uid", null, false, true);
                store("cly_ignore", null, false, true);
            }
        }

        /**
         *  Apply modified storage changes
         *  @param {String} key - key of storage modified
         *  @param {Varies} newValue - new value for storage
         */
        this.onStorageChange = function(key, newValue) {
            switch (key) {
            //queue of requests
            case "cly_queue":
                requestQueue = self.deserialize(newValue || '[]');
                break;
                //queue of events
            case "cly_event":
                eventQueue = self.deserialize(newValue || '[]');
                break;
            case "cly_remote_configs":
                remoteConfigs = self.deserialize(newValue || '{}');
                break;
            case "cly_ignore":
                self.ignore_visitor = self.deserialize(newValue);
                break;
            case "cly_id":
                self.device_id = self.deserialize(newValue);
                break;
            default:
                    // do nothing
            }
        };

        /**
        * Expose internal methods for pluggable code to reuse them
        * @namespace Countly._internals
        * @name Countly._internals
        */
        this._internals = {
            store: store,
            getDocWidth: getDocWidth,
            getDocHeight: getDocHeight,
            getViewportHeight: getViewportHeight,
            get_page_coord: get_page_coord,
            get_event_target: get_event_target,
            add_event: add_event,
            getProperties: getProperties,
            stripTrailingSlash: stripTrailingSlash,
            prepareParams: prepareParams,
            sendXmlHttpRequest: sendXmlHttpRequest,
            getMsTimestamp: getMsTimestamp,
            getTimestamp: getTimestamp,
            log: log,
            getMetrics: getMetrics,
            generateUUID: generateUUID,
            isUUID: isUUID,
            getId: getId,
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
            add_cly_events: add_cly_events,
            detect_device: detect_device,
            getRequestQueue: getRequestQueue,
            getEventQueue: getEventQueue,
            /**
             *  Clear queued data
             *  @memberof Countly._internals
             */
            clearQueue: function() {
                requestQueue = [];
                store("cly_queue", []);
                eventQueue = [];
                store("cly_event", []);
            }
        };

        this.initialize();
    };

    /**
     *  Countly class - exposing so plugins can extend its prototype
     *  @param {Object} ob - Configuration object
     */
    Countly.CountlyClass = CountlyClass;

    /**
     * Initialize Countly object
     * @param {Object} conf - Countly initialization {@link Init} object with configuration options
     * @param {string} conf.app_key - app key for your app created in Countly
     * @param {string} conf.device_id - to identify a visitor, will be auto generated if not provided
     * @param {string} conf.url - your Countly server url, you can use your server URL or IP here
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
     * @param {number} [conf.max_events=10] - maximum amount of events to send in one batch
     * @param {number} [conf.max_logs=100] - maximum amount of breadcrumbs to store for crash logs
     * @param {array=} conf.ignore_referrers - array with referrers to ignore
     * @param {boolean} [conf.ignore_prefetch=true] - ignore prefetching and pre rendering from counting as real website visits
     * @param {boolean} [conf.force_post=false] - force using post method for all requests
     * @param {boolean} [conf.ignore_visitor=false] - ignore this current visitor
     * @param {boolean} [conf.require_consent=false] - Pass true if you are implementing GDPR compatible consent management. It would prevent running any functionality without proper consent
     * @param {boolean} [conf.utm={"source":true, "medium":true, "campaign":true, "term":true, "content":true}] - Object instructing which UTM parameters to track
     * @param {boolean} [conf.use_session_cookie=true] - Use cookie to track session
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
     * @param {string=} [conf.storage=default] - What type of storage to use, by default uses local storage and would fallback to cookies, but you can set values "localstorage" or "cookies" to force only specific storage, or use "none" to not use any storage and keep everything in memory
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
        var appKey = conf.app_key || Countly.app_key;
        if (!Countly.i || !Countly.i[appKey]) {
            var inst = new Countly.CountlyClass(conf);
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
    *  PRIVATE METHODS
    **/

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
     *  Generate random UUID value
     *  @memberof Countly._internals
     *  @returns {String} random UUID value
     */
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
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
        for (var key in Countly.i) {
            if (Countly.i[key].tracking_crashes) {
                Countly.i[key].recordError(error, fatality, segments);
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
        if (str.substr(str.length - 1) === "/") {
            return str.substr(0, str.length - 1);
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
    function getProperties(orig, props) {
        var ob = {};
        var prop;
        for (var i = 0; i < props.length; i++) {
            prop = props[i];
            if (typeof orig[prop] !== "undefined") {
                ob[prop] = orig[prop];
            }
        }
        return ob;
    }

    /**
     *  Polyfill to get closest parent matching nodeName
     *  @param {HTMLElementng} el - element from which to search
     *  @param {String} nodeName - tag/node name
     *  @returns {HTMLElement} closest parent element
     */
    var get_closest_element = function(el, nodeName) {
        nodeName = nodeName.toUpperCase();
        while (el) {
            if (el.nodeName.toUpperCase() === nodeName) {
                return el;
            }
            el = el.parentElement;
        }
    };

    /**
     *  Listen to specific browser event
     *  @memberof Countly._internals
     *  @param {HTMLElement} element - HTML element that should listen to event
     *  @param {String} type - event name or action
     *  @param {Function} listener - callback when event is fired
     */
    var add_event = function(element, type, listener) {
        if (typeof element.addEventListener !== "undefined") {
            element.addEventListener(type, listener, false);
        }
        else {
            element.attachEvent("on" + type, listener);
        }
    };

    /**
     *  Get element that fired event
     *  @memberof Countly._internals
     *  @param {Event} event - event that was filed
     *  @returns {HTMLElement} HTML element that caused event to fire
     */
    var get_event_target = function(event) {
        if (!event) {
            return window.event.srcElement;
        }
        else if (typeof event.target !== "undefined") {
            return event.target;
        }
        else {
            return event.srcElement;
        }
    };

    /**
     *  Current device data
     *  @memberof Countly._internals
     *  @prop {String} device - device type
     *  @prop {Function} detect - detect device type
     *  @prop {Boolean} isMobile - true if mobile device
     *  @prop {String} userAgent - userAgent value
     */
    var detect_device = (function() {
        var b = navigator.userAgent.toLowerCase(),
            a = function(t) {
                if (t) {
                    b = (t + "").toLowerCase();
                }
                return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(b) ? "tablet" : /(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(b) ? "phone" : "desktop";
            };
        return {
            device: a(),
            detect: a,
            isMobile: "desktop" !== a() ? !0 : !1,
            userAgent: b
        };
    }());

    /**
     *  Modify event to set standard coordinate properties if they are not available
     *  @memberof Countly._internals
     *  @param {Event} e - event object
     *  @returns {Event} modified event object
     */
    function get_page_coord(e) {
        //checking if pageY and pageX is already available
        if (typeof e.pageY === "undefined" &&
            typeof e.clientX === "number" &&
            document.documentElement) {
            //if not, then add scrolling positions
            e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        //return e which now contains pageX and pageY attributes
        return e;
    }

    /**
     *  Get height of whole document
     *  @memberof Countly._internals
     *  @returns {Number} height in pixels
     */
    function getDocHeight() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
            Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
            Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
    }

    /**
     *  Get width of whole document
     *  @memberof Countly._internals
     *  @returns {Number} width in pixels
     */
    function getDocWidth() {
        var D = document;
        return Math.max(
            Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
            Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
            Math.max(D.body.clientWidth, D.documentElement.clientWidth)
        );
    }

    /**
     *  Get height of viewable area
     *  @memberof Countly._internals
     *  @returns {Number} height in pixels
     */
    function getViewportHeight() {
        var D = document;
        return Math.min(
            Math.min(D.body.clientHeight, D.documentElement.clientHeight),
            Math.min(D.body.offsetHeight, D.documentElement.offsetHeight),
            window.innerHeight
        );
    }

    /**
     *  Get device's orientation
     *  @returns {String} device orientation
     */
    function getOrientation() {
        return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    }

    /**
     *  Check if object has any properties
     *  @param {Object} ob - object to check
     *  @returns {Boolean} true if has propertyes and false if not
     */
    function hasAnyProperties(ob) {
        if (ob) {
            for (var prop in ob) {
                if (Object.prototype.hasOwnProperty.call(ob, prop)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *  Monitor paralel storage changes like other opened tabs
     */
    window.addEventListener('storage', function(e) {
        var parts = (e.key + "").split("/");
        var key = parts.pop();
        var appKey = parts.pop();

        if (Countly.i && Countly.i[appKey]) {
            Countly.i[appKey].onStorageChange(key, e.newValue);
        }
    });

    /**
     *  Load external js files
     *  @param {String} tag - Tag/node name to load file in
     *  @param {String} attr - Attribute name for type
     *  @param {String} type - Type value
     *  @param {String} src - Attrube name for file path
     *  @param {String} data - File path
     *  @param {Function} callback - callback when done
     */
    function loadFile(tag, attr, type, src, data, callback) {
        var fileref = document.createElement(tag),
            loaded;
        fileref.setAttribute(attr, type);
        fileref.setAttribute(src, data);
        if (callback) {
            fileref.onreadystatechange = fileref.onload = function() {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName("head")[0].appendChild(fileref);
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
        var loader = document.getElementById("cly-loader");
        if (!loader) {
            var css = "#cly-loader {height: 4px; width: 100%; position: absolute; z-index: 99999; overflow: hidden; background-color: #fff; top:0px; left:0px;}" +
                "#cly-loader:before{display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2EB52B; animation: cly-loading 2s linear infinite;}" +
                "@keyframes cly-loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;}}",
                head = document.head || document.getElementsByTagName("head")[0],
                style = document.createElement("style");
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
            document.body.appendChild(loader);
        }
        loader.style.display = "block";
    }

    /**
     *  Hide loader UI
     *  @memberof Countly._internals
     */
    function hideLoader() {
        var loader = document.getElementById("cly-loader");
        if (loader) {
            loader.style.display = "none";
        }
    }

    /**
    * Overwrite serialization function for extending SDK with encryption, etc
    * @param {any} value - value to serialize
    * @return {string} serialized value
    **/
    Countly.serialize = function(value) {
        // Convert object values to JSON
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        return value;
    };

    /**
    * Overwrite deserialization function for extending SDK with encryption, etc
    * @param {string} data - value to deserialize
    * @return {varies} deserialized value
    **/
    Countly.deserialize = function(data) {
        // Try to parse JSON...
        try {
            data = JSON.parse(data);
        }
        catch (e) {
            //it means data is not json,
            //dont do anything
        }

        return data;
    };

    /**
    * Overwrite a way to retrieve view name
    * @return {string} view name
    **/
    Countly.getViewName = function() {
        return window.location.pathname;
    };

    /**
    * Overwrite a way to retrieve view url
    * @return {string} view url
    **/
    Countly.getViewUrl = function() {
        return window.location.pathname;
    };

    return Countly;
}));
