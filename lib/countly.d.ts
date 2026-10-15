declare module "countly-sdk-web" {
  namespace Countly {
    /**
     * It initializes the SDK and exposes it to the window object. It should be called before any other SDK methods in sync implementations.
     * @param {object} config - Configuration object. Determines the SDK behavior. Some essential keys are:
     *
     * app_key : "app key" from your Countly server application. (MANDATORY!)
     *
     * url : Your Countly server URL. You may also use your own server URL or IP here. (MANDATORY!)
     *
     * debug : Enables SDK logs to be printed into the browser console. (default: false)
     *
     * push_vapid_public_key : Base64-URL VAPID public key from Management > Applications > Push Notifications > Web (VAPID). Required for web push.
     *
     * push_service_worker_path : URL of the Countly service worker on your origin. (default: "/countly_sw.js")
     *
     * push_service_worker_scope : Scope the worker is registered under. (default: the folder countly-push/ next to the worker file)
     *
     * push_service_worker_registration : An existing ServiceWorkerRegistration, or the promise register() returns for it, to subscribe through instead of registering countly_sw.js. Use it when your own worker imports countly_sw.js.
     *
     * push_auto_register : Re-registers the push subscription silently on every load once notification permission is granted. Never prompts. (default: true)
     *
     * push_subscribe_timeout : Milliseconds to wait for the browser to create the push subscription before enable_push_notifications gives up on that attempt with reason "timeout". (default: 30000)
     *
     * push_notification_listener : Function called with a PushNotificationEvent when a notification is received, clicked or closed. Same as set_push_notification_listener.
     *
     * For the full list of configuration options, see https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript#h_01HABTQ439HZN7Y6A6F07Y6G0K
     */
    function init(config: object): void;

    /**
     * Modify feature groups for consent management. Allows you to group multiple features under one feature group
     * @param {object} features - object to define feature name as key and core features as value
     * @example <caption>Adding all features under one group</caption>
     * Countly.group_features({all:["sessions","events","views","scrolls","clicks","forms","crashes","attribution","users"]});
     * //After this call Countly.add_consent("all") to allow all features
     * @example <caption>Grouping features</caption>
     * Countly.group_features({
     *    activity:["sessions","events","views"],
     *    interaction:["scrolls","clicks","forms"]
     * });
     * //After this call Countly.add_consent("activity") to allow "sessions","events","views"
     * //or call Countly.add_consent("interaction") to allow "scrolls","clicks","forms"
     * //or call Countly.add_consent("crashes") to allow some separate feature
     */
    function group_features(features: object): void;

    /**
     * Check if consent is given for specific feature (either core feature of from custom feature group)
     * @param {string} feature - name of the feature, possible values, "sessions","events","views","scrolls","clicks","forms","crashes","attribution","users" or custom provided through {@link Countly.group_features}
     * @returns {Boolean} true if consent was given for the feature or false if it was not
     */
    function check_consent(feature: string): boolean;

    /**
     * Check if any consent is given, for some cases, when crucial parts are like device_id are needed for any request
     * @returns {Boolean} true is has any consent given, false if no consents given
     */
    function check_any_consent(): boolean;

    enum DeviceIdType {
      DEVELOPER_SUPPLIED,
      SDK_GENERATED,
      TEMPORARY_ID,
    }

    /**
     * Countly SDK async queue
     * You can push methods here to be executed after Countly SDK is fully loaded
     * @example
     * Countly.q.push(['track_sessions']);
     * Countly.q.push(['add_event',{
     *   "key": "click",
     *   "count": 1,
     *   "sum": 1.5,
     *   "dur": 30,
     *   "segmentation": {
     *     "key1": "value1",
     *     "key2": "value2"
     *   }
     * }]);
     * @type {Array}
     */
    let q: any[];

    /**
     * Checks and return the current device id type
     * @returns {DeviceIdType|number} a number that indicates the device id type (or -1 if not set)
     */
    function get_device_id_type(): DeviceIdType;

    /**
     * Gives the current device id (of the CountlyClass instance)
     * @returns {string} device id
     */
    function get_device_id(): string;

    /**
     * Returns the SDK version string currently in use
     * @returns {string} sdk version
     */
    function sdk_version(): string;

    /**
     * Returns the SDK name string currently in use
     * @returns {string} sdk name
     */
    function sdk_name(): string;

    /**
     * Add consent for specific feature, meaning, user allowed to track that data (either core feature or from custom feature group)
     * @param {string | string[]} feature - name of the feature, possible values: "sessions", "events", "views", "scrolls", "clicks", "forms", "crashes", "attribution", "users", etc. or custom provided through {@link Countly.group_features}
     */
    function add_consent(feature: string | string[]): void;

    /**
     * Remove consent for specific feature, meaning, user opted out to track that data (either core feature or from custom feature group)
     * @param {string | string[]} feature - name of the feature, possible values: "sessions", "events", "views", "scrolls", "clicks", "forms", "crashes", "attribution", "users", etc. or custom provided through {@link Countly.group_features}
     */
    function remove_consent(feature: string | string[]): void;

    /**
     * Enable offline mode, which disables data tracking and temporarily changes the device ID.
     */
    function enable_offline_mode(): void;

    /**
     * Disable offline mode, re-enabling data tracking and potentially changing the device ID.
     * @param {string} [device_id] - Optional new device ID to use when disabling offline mode. If not provided, a new ID will be generated.
     */
    function disable_offline_mode(device_id?: string): void;

    /**
     * Opts in user for tracking, if complies with other user ignore rules like bot useragent and prefetch settings
     */
    function opt_in(): void;

    /**
     * Opts out user of any metric tracking, and takes Countly's push subscription off the browser
     */
    function opt_out(): void;

    /**
     * Attempt to send stored requests
     */
    function attempt_to_send_stored_requests(): void;

    /**
     * Enable web push notifications: asks for notification permission, registers the Countly service worker,
     * subscribes with the configured VAPID public key and registers the subscription with the server.
     * Call it directly from a user gesture (a click handler), not through Countly.q — Firefox and Safari
     * refuse the permission prompt otherwise. Idempotent; re-subscribes when the VAPID key changed.
     * @param {object} [opts] - per-call overrides: push_vapid_public_key, push_service_worker_path, push_service_worker_scope, push_service_worker_registration
     * @return {Promise<{subscribed: boolean, endpoint?: string, reason?: string, error?: string}>} reason is one of "unsupported", "no_consent", "missing_vapid_key", "invalid_vapid_key", "denied", "default", "service_worker_conflict", "service_worker_redundant", "service_worker_missing", "timeout", "subscription_conflict", "disabled", "error"
     */
    function enable_push_notifications(opts?: {
      push_vapid_public_key?: string;
      push_service_worker_path?: string;
      push_service_worker_scope?: string;
      push_service_worker_registration?: ServiceWorkerRegistration | Promise<ServiceWorkerRegistration>;
    }): Promise<{ subscribed: boolean; endpoint?: string; reason?: string; error?: string }>;

    /**
     * Disable web push notifications: unsubscribes in the browser and blacklists the token on the server.
     * Remembered across page loads, so the automatic re-registration never undoes it; only another
     * enable_push_notifications call subscribes again. Not gated on consent.
     * @param {object} [opts] - per-call override: push_service_worker_scope
     * @return {Promise<{unsubscribed: boolean, reason?: string, error?: string}>}
     */
    function disable_push_notifications(opts?: {
      push_service_worker_scope?: string;
    }): Promise<{ unsubscribed: boolean; reason?: string; error?: string }>;

    /**
     * Record a push notification click as a [CLY]_push_action event. The Countly service worker relay
     * calls this for you; call it yourself only from a custom worker integration.
     * @param {string} messageId - 24 character id of the Countly message that produced the notification
     * @param {number} [buttonIndex=0] - 0 for the notification body, 1 or 2 for an action button
     */
    function record_push_action(messageId: string, buttonIndex?: number): void;

    /**
     * What the push notification listener is told about one notification.
     * type "received": the worker got the push and showed the notification; "clicked": the body
     * (buttonIndex 0) or an action button (1 or 2, with its buttonTitle and url) was clicked;
     * "closed": the notification was dismissed. payload is the whole message as the server sent it,
     * including any custom key/values. Only pages open at the time hear "received" and "closed"; a
     * click made while no page was open is recorded by the worker itself and reported to the next
     * page that loads.
     * "closed" is best effort and differs by browser and OS: dismissals mostly go unreported on
     * Windows, macOS Chrome and Firefox report Notification Center removals, Safari does not; Firefox
     * (and Safari for Notification Center clicks) also reports "closed" right after "clicked".
     * Safari shows no action buttons, and neither does desktop Firefox before version 152 (buttonIndex
     * is always 0 there; Firefox for Android always showed them).
     */
    interface PushNotificationEvent {
      type: "received" | "clicked" | "closed";
      messageId: string;
      title: string;
      message: string;
      url: string;
      buttons: { title: string; url: string }[];
      payload: Record<string, any> | null;
      buttonIndex?: number;
      buttonTitle?: string;
    }

    /**
     * Set the function told when a push notification is received, clicked or closed. The
     * [CLY]_push_action event is recorded whether or not a listener is set, and a listener that
     * throws does not affect it. Pass null to remove the listener.
     * @param {function|null} listener - called with a PushNotificationEvent
     */
    function set_push_notification_listener(listener: ((event: PushNotificationEvent) => void) | null): void;

    /**
     * Start session
     * @param {boolean} noHeartBeat - true if you don't want to use internal heartbeat to manage session
     * @param {boolean} force - force begin session request even if session cookie is enabled
     */
    function begin_session(noHeartBeat: boolean, force: boolean): void;

    /**
     * Report session duration
     * @param {number} sec - amount of seconds to report for current session
     */
    function session_duration(sec: number): void;

    /**
     * End current session
     * @param {number} sec - amount of seconds to report for current session, before ending it
     * @param {boolean} force - force end session request even if session cookie is enabled
     */
    function end_session(sec: number, force: boolean): void;

    /**
     * USING set_id INSTEAD IS RECOMMENDED
     * Change current user/device id (use set_id instead if you are not sure about the merge operation)
     * @param {string} newId - new user/device ID to use. Must be a non-empty string value. Invalid values (like null, empty string or undefined) will be rejected
     * @param {boolean} merge - move data from old ID to new ID on server
     */
    function change_id(newId: string, merge: boolean): void;

    /**
     * Changes the current device ID according to the device ID type (the preffered method)
     * @param {string} newId - new user/device ID to use. Must be a non-empty string value. Invalid values (like null, empty string or undefined) will be rejected
     */
    function set_id(newId: string): void;

    /**
     * Report custom event
     * @param {Object} event - Countly {@link Event} object
     * @param {string} event.key - name or id of the event
     * @param {number} [event.count=1] - how many times did event occur
     * @param {number} [event.sum] - sum to report with event (if any)
     * @param {number} [event.dur] - duration to report with event (if any)
     * @param {Object} [event.segmentation] - object with segments key/values
     */
    function add_event(event: {
      key: string;
      count?: number;
      sum?: number;
      dur?: number;
      segmentation?: { [key: string]: any };
    }): void;

    /**
     * Start timed event, which will fill in duration property upon ending automatically
     * This works basically as a timer and does not create an event till end_event is called
     * @param {string} key - event name that will be used as key property
     */
    function start_event(key: string): void;

    /**
     * Cancel timed event, cancels a timed event if it exists
     * @param {string} key - event name that will be canceled
     * @returns {boolean} - returns true if the event was canceled and false if no event with that key was found
     */
    function cancel_event(key: string): boolean;

    /**
     * End timed event
     * @param {string | Object} event - event key if string or Countly event same as passed to {@link Countly.add_event}
     */
    function end_event(
      event:
        | string
        | {
            key: string;
            count?: number;
            sum?: number;
            dur?: number;
            segmentation?: { [key: string]: any };
          }
    ): void;

    /**
     * Report user conversion to the server (when user signup or made a purchase, or whatever your conversion is), if there is no campaign data, user will be reported as organic
     * @param {string} [campaign_id] - id of campaign, or will use the one that is stored after campaign link click
     * @param {string} [campaign_user_id] - id of user's click on campaign, or will use the one that is stored after campaign link click
     */
    function recordDirectAttribution(
      campaign_id?: string,
      campaign_user_id?: string
    ): void;

    /**
     * Provide information about user
     * @param {Object} user - Countly {@link UserDetails} object
     * @param {string} [user.name] - user's full name
     * @param {string} [user.username] - user's username or nickname
     * @param {string} [user.email] - user's email address
     * @param {string} [user.organization] - user's organization or company
     * @param {string} [user.phone] - user's phone number
     * @param {string} [user.picture] - url to user's picture
     * @param {string} [user.gender] - M value for male and F value for female
     * @param {number} [user.byear] - user's birth year used to calculate current age
     * @param {Object} [user.custom] - object with custom key value properties you want to save with user
     */
    function user_details(user: {
      name?: string;
      username?: string;
      email?: string;
      organization?: string;
      phone?: string;
      picture?: string;
      gender?: string;
      byear?: number;
      custom?: { [key: string]: any };
    }): void;

    /**
     * Upload user profile picture (image) to the server.
     * @param {File|Blob} imageFile - The image file or blob to upload
     */
    function uploadUserProfilePicture(imageFile: File | Blob): void;

    namespace userData {
      /**
       * Sets user's custom property value
       * @param {string} key - name of the property to attach to user
       * @param {string|number} value - value to store under provided property
       */
      function set(key: string, value: string | number): void;

      /**
       * Unset/deletes user's custom property
       * @param {string} key - name of the property to delete
       */
      function unset(key: string): void;

      /**
       * Sets user's custom property value only if it was not set before
       * @param {string} key - name of the property to attach to user
       * @param {string|number} value - value to store under provided property
       */
      function set_once(key: string, value: string | number): void;

      /**
       * Increment value under the key of this user's custom properties by one
       * @param {string} key - name of the property to attach to user
       */
      function increment(key: string): void;

      /**
       * Increment value under the key of this user's custom properties by provided value
       * @param {string} key - name of the property to attach to user
       * @param {number} value - value by which to increment server value
       */
      function increment_by(key: string, value: number): void;

      /**
       * Multiply value under the key of this user's custom properties by provided value
       * @param {string} key - name of the property to attach to user
       * @param {number} value - value by which to multiply server value
       */
      function multiply(key: string, value: number): void;

      /**
       * Save maximal value under the key of this user's custom properties
       * @param {string} key - name of the property to attach to user
       * @param {number} value - value which to compare to server's value and store maximal value of both provided
       */
      function max(key: string, value: number): void;

      /**
       * Save minimal value under the key of this user's custom properties
       * @param {string} key - name of the property to attach to user
       * @param {number} value - value which to compare to server's value and store minimal value of both provided
       */
      function min(key: string, value: number): void;

      /**
       * Add value to array under the key of this user's custom properties. If property is not an array, it will be converted to array
       * @param {string} key - name of the property to attach to user
       * @param {string|number} value - value which to add to array
       */
      function push(key: string, value: string | number): void;

      /**
       * Add value to array under the key of this user's custom properties, storing only unique values. If property is not an array, it will be converted to array
       * @param {string} key - name of the property to attach to user
       * @param {string|number} value - value which to add to array
       */
      function push_unique(key: string, value: string | number): void;

      /**
       * Remove value from array under the key of this user's custom properties
       * @param {string} key - name of the property
       * @param {string|number} value - value which to remove from array
       */
      function pull(key: string, value: string | number): void;

      /**
       * Save changes made to user's custom properties object and send them to server
       */
      function save(): void;
    }

    /**
     * Report performance trace
     * @param {Object} trace - apm trace object
     * @param {string} trace.type - device or network
     * @param {string} trace.name - url or view of the trace
     * @param {number} trace.stz - start timestamp
     * @param {number} trace.etz - end timestamp
     * @param {Object} trace.app_metrics - key/value metrics like duration, to report with trace where value is number
     * @param {Object} [trace.apm_attr] - object profiling attributes (not yet supported)
     */
    function report_trace(trace: {
      type: string;
      name: string;
      stz: number;
      etz: number;
      app_metrics: { [key: string]: number };
      apm_attr?: { [key: string]: any };
    }): void;

    /**
     * Automatically track JavaScript errors that happen on the website and report them to the server
     * @param {Object} [segments] - additional key-value pairs you want to provide with error report, like versions of libraries used, etc.
     */
    function track_errors(segments?: Object): void;

    /**
     * Log an exception that you caught through try and catch block and handled yourself and just want to report it to server
     * @param {Object} err - error exception object provided in catch block
     * @param {Object} [segments] - additional key-value pairs you want to provide with error report, like versions of libraries used, etc.
     */
    function log_error(err: Object, segments?: Object): void;

    /**
     * Record and report error, this is were tracked errors are modified and send to the request queue
     * @param {Error} err - Error object
     * @param {Boolean} nonfatal - nonfatal if true and false if fatal
     * @param {Object} [segments] - custom crash segments
     */
    function recordError(err: Error, nonfatal: boolean, segments?: Object): void;

    /**
     * Add new line in the log of breadcrumbs of what user did, will be included together with error report
     * @param {string} record - any text describing what user did
     */
    function add_log(record: string): void;

    /**
     * Fetch remote config from the server
     * @param {string[]} [keys] - Array of keys to fetch, if not provided will fetch all keys
     * @param {string[]} [omit_keys] - Array of keys to omit, if provided will fetch all keys except provided ones
     * @param {Function} [callback] - Callback to notify with first param error and second param remote config object
     */
    function fetch_remote_config(
      keys?: string[],
      omit_keys?: string[],
      callback?: (error: any, config: any) => void
    ): void;

    /**
     * AB testing key provider, opts the user in for the selected keys
     * @param {string[]} [keys] - Array of keys opt in FOR
     */
    function enrollUserToAb(keys?: string[]): void;

    /**
     * Gets remote config object (all key/value pairs) or specific value for provided key from the storage
     * @param {string} [key] - if provided, will return value for key, or return whole object
     * @returns {object} remote configs
     */
    function get_remote_config(key?: string): object;

    /**
     * Track user sessions automatically, including time user spent on your website
     */
    function track_sessions(): void;

    /**
     * Track page views user visits
     * @param {string} [page] - optional name of the page, by default uses current url path
     * @param {string[]} [ignoreList] - optional array of strings or regexps to test for the url/view name to ignore and not report
     * @param {object} [viewSegments] - optional key value object with segments to report with the view
     */
    function track_pageview(
      page?: string,
      ignoreList?: string[],
      viewSegments?: object
    ): void;

    /**
     * Track page views user visits. Alias of {@link track_pageview} method for compatibility with NodeJS SDK
     * @param {string} [page] - optional name of the page, by default uses current url path
     * @param {string[]} [ignoreList] - optional array of strings or regexps to test for the url/view name to ignore and not report
     * @param {object} [segments] - optional view segments to track with the view
     */
    function track_view(
      page?: string,
      ignoreList?: string[],
      segments?: object
    ): void;

    /**
     * Track all clicks on this page
     * @param {Object} [parent] - DOM object whose children to track, by default it is document body
     */
    function track_clicks(parent?: Object): void;

    /**
     * Track all scrolls on this page
     * @param {Object} [parent] - DOM object whose children to track, by default it is document body
     */
    function track_scrolls(parent?: Object): void;

    /**
     * Generate custom event for all links that were clicked on this page
     * @param {Object} [parent] - DOM object whose children to track, by default it is document body
     */
    function track_links(parent?: Object): void;

    /**
     * Generate custom event for all forms that were submitted on this page
     * @param {Object} [parent] - DOM object whose children to track, by default it is document body
     * @param {boolean} [trackHidden] - provide true to also track hidden inputs, default false
     */
    function track_forms(parent?: Object, trackHidden?: boolean): void;

    /**
     * Collect possible user data from submitted forms. Add cly_user_ignore class to ignore inputs in forms or cly_user_{key} to collect data from this input as specified key, as cly_user_username to save collected value from this input as username property. If no class is provided, Countly SDK will try to determine type of information automatically.
     * @param {Object} [parent] - DOM object whose children to track, by default it is document body
     * @param {boolean} [useCustom=false] - submit collected data as custom user properties, by default collects as main user properties
     */
    function collect_from_forms(parent?: Object, useCustom?: boolean): void;

    /**
     * Collect information about user from Facebook, if your website integrates Facebook SDK. Call this method after Facebook SDK is loaded and user is authenticated.
     * @param {Object} [custom] - Custom keys to collect from Facebook, key will be used to store as key in custom user properties and value as key in Facebook graph object. For example, {"tz":"timezone"} will collect Facebook's timezone property, if it is available and store it in custom user's property under "tz" key. If you want to get value from some sub-object properties, then use dot as delimiter, for example, {"location":"location.name"} will collect data from Facebook's {"location":{"name":"MyLocation"}} object and store it in user's custom property "location" key.
     */
    function collect_from_facebook(custom?: { [key: string]: string }): void;

    /**
     * Report information about survey, NPS, or rating widget answers/results
     * @param {Object} CountlyFeedbackWidget - it is the widget object retrieved from get_available_feedback_widgets
     * @param {Object} CountlyWidgetData - it is the widget data object retrieved from getFeedbackWidgetData
     * @param {Object|null} widgetResult - it is the widget results that need to be reported, different for all widgets, if provided as null it means the widget was closed
     * widgetResult For NPS
     * Should include rating and comment from the NPS. Example:
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
     */
    function reportFeedbackWidgetManually(
      CountlyFeedbackWidget: { _id: string; type: string },
      CountlyWidgetData: object,
      widgetResult:
        | { rating: number; comment?: string }
        | { [key: string]: string | number }
        | {
            rating: number;
            email?: string;
            contactMe?: boolean;
            comment?: string;
          }
        | null
    ): void;

    /**
     * Report a rating widget result, given by the user in your own interface
     * @param {Object} ratingWidget - object with rating widget properties
     * @param {string} ratingWidget.widget_id - id of the widget in the dashboard
     * @param {boolean} [ratingWidget.contactMe] - did user give consent to contact him
     * @param {string} [ratingWidget.platform] - user's platform (will be filled if not provided)
     * @param {string} [ratingWidget.app_version] - app's app version (will be filled if not provided)
     * @param {number} ratingWidget.rating - user's rating from 1 to 5
     * @param {string} [ratingWidget.email] - user's email
     * @param {string} [ratingWidget.comment] - user's comment
     */
    function recordRatingWidgetWithID(ratingWidget: {
      widget_id: string;
      rating: number;
      contactMe?: boolean;
      platform?: string;
      app_version?: string;
      email?: string;
      comment?: string;
    }): void;

    /**
     * Feedback interface with convenience methods for feedback widgets:
     * - showNPS([nameIDorTag]) - shows an NPS widget by name, id, or tag, or a random one if not provided
     * - showSurvey([nameIDorTag]) - shows a Survey widget by name, id, or tag, or a random one if not provided
     * - showRating([nameIDorTag]) - shows a Rating widget by name, id, or tag, or a random one if not provided
     */
    const feedback: Feedback;
    interface Feedback {
      /**
       * Displays the first available NPS widget or the one with the provided name, id, or tag.
       * @param nameIDorTag - Optional name, id, or tag of the NPS widget to display.
       */
      showNPS(nameIDorTag?: string): void;

      /**
       * Displays the first available Survey widget or the one with the provided name, id, or tag.
       * @param nameIDorTag - Optional name, id, or tag of the Survey widget to display.
       */
      showSurvey(nameIDorTag?: string): void;

      /**
       * Displays the first available Rating widget or the one with the provided name, id, or tag.
       * @param nameIDorTag - Optional name, id, or tag of the Rating widget to display.
       */
      showRating(nameIDorTag?: string): void;
    }

    /**
     * Content interface with convenience methods for content zones:
     * - enterContentZone(contentFilterCallback) - enters a content zone
     * - refreshContentZone() - refreshes the content zone
     * - exitContentZone() - exits a content zone
     * - setGlobalContentSegmentation(segmentation) - sets the segmentation recorded with every content and feedback widget event
     * - setTheme(theme) - sets the theme content and feedback widgets are shown in
     */
    const content: Content;
    interface Content {
      /**
       * Enters content zone and checks and displays available content regularly
       * @param {Function} [contentFilterCallback] - Optional callback function to filter content based on URL parameters. Should return true to display content, false to ignore.
       */
      enterContentZone(contentFilterCallback?: (contentURLParams: object) => boolean): void;
      /**
       * Refreshes content zone
       */
      refreshContentZone(): void;
      /**
       * Exits content zone
       */
      exitContentZone(): void;
      /**
       * Sets the segmentation recorded with every content and feedback widget event and given to the feedback widgets
       * the SDK opens, in place of the one set before. An event's own keys win over it. Keys the server reads on these
       * events, such as "rating", "closed", "campaign_id" or keys starting with "answ", are left out, as are values
       * other than strings, numbers, booleans and lists of those. It stays when the device ID changes.
       * @param {Object|null} segmentation - the segmentation; null or an empty object clears it
       */
      setGlobalContentSegmentation(segmentation: { [key: string]: string | number | boolean | Array<string | number | boolean> } | null): void;
      /**
       * Sets the theme content and feedback widgets are shown in. By default they follow the page: the color-scheme
       * it declares in its CSS or its color-scheme meta tag when it names only one, otherwise the browser's light or
       * dark setting. Content already on the screen keeps the theme it opened with.
       * @param {"dark"|"light"|false|null} theme - the theme, false to tell them no theme at all, or null to follow the page again
       */
      setTheme(theme: "dark" | "light" | false | null): void;
    }
    /**
     * This function retrieves all associated widget information (IDs, type, name etc in an array/list of objects) of your app
     * @param {Function} callback - Callback function with two parameters, 1st for returned list, 2nd for error
     * @returns {void}
     */
    function get_available_feedback_widgets(
      callback: (
        widgets: Array<{ _id: string; type: string; name: string }>,
        error: Error | null
      ) => void
    ): void;

    /**
     * Get feedback (nps, survey or rating) widget data, like questions, message etc.
     * @param {Object} CountlyFeedbackWidget - Widget object, retrieved from 'get_available_feedback_widgets'
     * @param {string} CountlyFeedbackWidget._id - The unique identifier of the widget
     * @param {string} CountlyFeedbackWidget.type - The type of the widget (nps, survey, rating)
     * @param {string} CountlyFeedbackWidget.name - The name of the widget
     * @param {Function} callback - Callback function with two parameters, 1st for returned widget data, 2nd for error
     * @returns {void}
     */
    function getFeedbackWidgetData(
      CountlyFeedbackWidget: { _id: string; type: string; name: string },
      callback: (widgetData: Object, error: Error | null) => void
    ): void;

    /**
     * Present the feedback widget in webview
     * @param {Object} presentableFeedback - Current presentable feedback
     * @param {string} [id] - DOM id to append the feedback widget (optional, in case not used pass undefined)
     * @param {string} [className] - Class name to append the feedback widget (optional, in case not used pass undefined)
     * @param {Object} [feedbackWidgetSegmentation] - Segmentation object to be passed to the feedback widget, which the global content segmentation is added behind (optional)
     */
    function present_feedback_widget(
      presentableFeedback: object,
      id?: string,
      className?: string,
      feedbackWidgetSegmentation?: object
    ): void;

    /**
     * Overwrite a way to retrieve view name
     * @return {string} view name
     */
    function getViewName(): string;

    /**
     * Overwrite a way to retrieve view url
     * @return {string} view url
     */
    function getViewUrl(): string;

    /**
     * Overwrite a way to get search query
     * @return {string} search query
     */
    function getSearchQuery(): string;
  }

  export default Countly;
}

interface Window {
  Countly: any;
}
