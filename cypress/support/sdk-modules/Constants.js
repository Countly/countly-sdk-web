
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
    CONTENT: "content",
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
    PUSH_ACTION: "[CLY]_push_action",
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
 * Maps the internal log level to the single character the server expects on the wire
 */
var logLevelToWireChar = {
    "[ERROR] ": "e",
    "[WARNING] ": "w",
    "[INFO] ": "i",
    "[DEBUG] ": "d",
    "[VERBOSE] ": "v",
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
    MAX_MESSAGE_LENGTH: 4096,
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
    journeyTrigger: featureEnums.CONTENT,
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
 * how long tabs of a site wait for each other around a device ID or profile change, in milliseconds
 */
var tabHandoverTimes = {
    // the changing tab waits this long for what the other tabs leave, which it sends before its change
    COLLECT: 500,
    // after another tab changes the device ID, a tab sends nothing of its own for this long
    PAUSE: 2000,
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
    backoffCount: "cly_hc_backoff_count",
    consecutiveBackoffCount: "cly_hc_consecutive_backoff_count",
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
    WORKER_VERSION: "countly_push_worker_version",
});

/**
 * Query parameters the SDK appends to the service worker URL so the worker knows the page's
 * configuration without a round trip. Mirrored by hand in countly_sw.js.
 * persist: "0" while the page runs with storage "none"
 */
var pushWorkerParams = Object.freeze({
    debug: "cly_debug",
    persist: "cly_persist",
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
    sessionToken: "cly_push_session_token",
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
    DEFAULT_SCOPE_FOLDER: "countly-push/",
});

var SDK_VERSION = "26.8.0";
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

export { CDN, DeviceIdTypeInternalEnums, SDK_NAME, SDK_VERSION, configurationDefaultValues, contentReservedSegmentationKeys, contentReservedSegmentationPrefix, featureEnums, featureList, healthCheckCounterEnum, internalEventKeyEnums, internalEventKeyEnumsArray, logGatheringDefaultValues, logLevelEnums, logLevelToWireChar, logLineConsent, pushConstants, pushMessageTypes, pushStorageKeys, pushWorkerParams, tabHandoverTimes, urlParseRE };