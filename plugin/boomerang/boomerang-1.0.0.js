/**
 * @copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * @copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * @copyright (c) 2012-2017, SOASTA, Inc. All rights reserved.
 * @copyright (c) 2017-2019, Akamai Technologies, Inc. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/**
 * @class BOOMR
 * @desc
 * boomerang measures various performance characteristics of your user's browsing
 * experience and beacons it back to your server.
 *
 * To use this you'll need a web site, lots of users and the ability to do
 * something with the data you collect.  How you collect the data is up to
 * you, but we have a few ideas.
 *
 * Everything in boomerang is accessed through the `BOOMR` object, which is
 * available on `window.BOOMR`.  It contains the public API, utility functions
 * ({@link BOOMR.utils}) and all of the plugins ({@link BOOMR.plugins}).
 *
 * Each plugin has its own API, but is reachable through {@link BOOMR.plugins}.
 *
 * ## Beacon Parameters
 *
 * The core boomerang object will add the following parameters to the beacon.
 *
 * Note that each individual {@link BOOMR.plugins plugin} will add its own
 * parameters as well.
 *
 * * `v`: Boomerang version
 * * `sv`: Boomerang Loader Snippet version
 * * `sm`: Boomerang Loader Snippet method
 * * `u`: The page's URL (for most beacons), or the `XMLHttpRequest` URL
 * * `pgu`: The page's URL (for `XMLHttpRequest` beacons)
 * * `pid`: Page ID (8 characters)
 * * `r`: Navigation referrer (from `document.location`)
 * * `vis.pre`: `1` if the page transitioned from prerender to visible
 * * `xhr.pg`: The `XMLHttpRequest` page group
 * * `errors`: Error messages of errors detected in Boomerang code, separated by a newline
 * * `rt.si`: Session ID
 * * `rt.ss`: Session start timestamp
 * * `rt.sl`: Session length (number of pages), can be increased by XHR beacons as well
 */

/**
 * @typedef TimeStamp
 * @type {number}
 *
 * @desc
 * A [Unix Epoch](https://en.wikipedia.org/wiki/Unix_time) timestamp (milliseconds
 * since 1970) created by [BOOMR.now()]{@link BOOMR.now}.
 *
 * If `DOMHighResTimeStamp` (`performance.now()`) is supported, it is
 * a `DOMHighResTimeStamp` (with microsecond resolution in the fractional),
 * otherwise, it is `Date.now()`.
 */


/**
 * @global
 * @type {TimeStamp}
 * @desc
 * Timestamp the boomerang.js script started executing.
 *
 * This has to be global so that we don't wait for this entire
 * script to download and execute before measuring the
 * time.  We also declare it without `var` so that we can later
 * `delete` it.  This is the only way that works on Internet Explorer.
 */
BOOMR_start = new Date().getTime();

/**
 * @function
 * @global
 * @desc
 * Check the value of `document.domain` and fix it if incorrect.
 *
 * This function is run at the top of boomerang, and then whenever
 * {@link BOOMR.init} is called.  If boomerang is running within an IFRAME, this
 * function checks to see if it can access elements in the parent
 * IFRAME.  If not, it will fudge around with `document.domain` until
 * it finds a value that works.
 *
 * This allows site owners to change the value of `document.domain` at
 * any point within their page's load process, and we will adapt to
 * it.
 *
 * @param {string} domain Domain name as retrieved from page URL
 */
function BOOMR_check_doc_domain(domain) {
	/*eslint no-unused-vars:0*/
	var test;


	if (!window) {
		return;
	}

	// If domain is not passed in, then this is a global call
	// domain is only passed in if we call ourselves, so we
	// skip the frame check at that point
	if (!domain) {
		// If we're running in the main window, then we don't need this
		if (window.parent === window || !document.getElementById("boomr-if-as")) {
			return;// true;	// nothing to do
		}

		if (window.BOOMR && BOOMR.boomerang_frame && BOOMR.window) {
			try {
				// If document.domain is changed during page load (from www.blah.com to blah.com, for example),
				// BOOMR.window.location.href throws "Permission Denied" in IE.
				// Resetting the inner domain to match the outer makes location accessible once again
				if (BOOMR.boomerang_frame.document.domain !== BOOMR.window.document.domain) {
					BOOMR.boomerang_frame.document.domain = BOOMR.window.document.domain;
				}
			}
			catch (err) {
				if (!BOOMR.isCrossOriginError(err)) {
					BOOMR.addError(err, "BOOMR_check_doc_domain.domainFix");
				}
			}
		}
		domain = document.domain;
	}

	if (!domain || domain.indexOf(".") === -1) {
		return;// false;	// not okay, but we did our best
	}

	// window.parent might be null if we're running during unload from
	// a detached iframe
	if (!window.parent) {
		return;
	}

	// 1. Test without setting document.domain
	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 2. Test with document.domain
	catch (err) {
		try {
			document.domain = domain;
		}
		catch (err2) {
			// An exception might be thrown if the document is unloaded
			// or when the domain is incorrect.  If so, we can't do anything
			// more, so bail.
			return;
		}
	}

	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 3. Strip off leading part and try again
	catch (err) {
		domain = domain.replace(/^[\w\-]+\./, "");
	}

	BOOMR_check_doc_domain(domain);
}

BOOMR_check_doc_domain();

// Construct BOOMR
// w is window
(function(w) {
	var impl, boomr, d, createCustomEvent, dispatchEvent, visibilityState, visibilityChange, orig_w = w;

	// If the window that boomerang is running in is not top level (ie, we're running in an iframe)
	// and if this iframe contains a script node with an id of "boomr-if-as",
	// Then that indicates that we are using the iframe loader, so the page we're trying to measure
	// is w.parent
	//
	// Note that we use `document` rather than `w.document` because we're specifically interested in
	// the document of the currently executing context rather than a passed in proxy.
	//
	// The only other place we do this is in `BOOMR.utils.getMyURL` below, for the same reason, we
	// need the full URL of the currently executing (boomerang) script.
	if (w.parent !== w &&
	    document.getElementById("boomr-if-as") &&
	    document.getElementById("boomr-if-as").nodeName.toLowerCase() === "script") {
		w = w.parent;
	}

	d = w.document;

	// Short namespace because I don't want to keep typing BOOMERANG
	if (!w.BOOMR) {
		w.BOOMR = {};
	}

	BOOMR = w.BOOMR;

	// don't allow this code to be included twice
	if (BOOMR.version) {
		return;
	}

	/**
	 * Boomerang version, formatted as major.minor.patchlevel.
	 *
	 * This variable is replaced during build (`grunt build`).
	 *
	 * @type {string}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.version = "1.0.0";

	/**
	 * The main document window.
	 * * If Boomerang was loaded in an IFRAME, this is the parent window
	 * * If Boomerang was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.window = w;

	/**
	 * The Boomerang frame:
	 * * If Boomerang was loaded in an IFRAME, this is the IFRAME
	 * * If Boomerang was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof BOOMR
	 */
	BOOMR.boomerang_frame = orig_w;

	/**
	 * @class BOOMR.plugins
	 * @desc
	 * Boomerang plugin namespace.
	 *
	 * All plugins should add their plugin object to `BOOMR.plugins`.
	 *
	 * A plugin should have, at minimum, the following exported functions:
	 * * `init(config)`
	 * * `is_complete()`
	 *
	 * See {@tutorial creating-plugins} for details.
	 */
	if (!BOOMR.plugins) {
		BOOMR.plugins = {};
	}

	// CustomEvent proxy for IE9 & 10 from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
	(function() {
		try {
			if (new w.CustomEvent("CustomEvent") !== undefined) {
				createCustomEvent = function(e_name, params) {
					return new w.CustomEvent(e_name, params);
				};
			}
		}
		catch (ignore) {
			// empty
		}

		try {
			if (!createCustomEvent && d.createEvent && d.createEvent("CustomEvent")) {
				createCustomEvent = function(e_name, params) {
					var evt = d.createEvent("CustomEvent");
					params = params || { cancelable: false, bubbles: false };
					evt.initCustomEvent(e_name, params.bubbles, params.cancelable, params.detail);

					return evt;
				};
			}
		}
		catch (ignore) {
			// empty
		}

		if (!createCustomEvent && d.createEventObject) {
			createCustomEvent = function(e_name, params) {
				var evt = d.createEventObject();
				evt.type = evt.propertyName = e_name;
				evt.detail = params.detail;

				return evt;
			};
		}

		if (!createCustomEvent) {
			createCustomEvent = function() { return undefined; };
		}
	}());

	/**
	 * Dispatch a custom event to the browser
	 * @param {string} e_name The custom event name that consumers can subscribe to
	 * @param {object} e_data Any data passed to subscribers of the custom event via the `event.detail` property
	 * @param {boolean} async By default, custom events are dispatched immediately.
	 * Set to true if the event should be dispatched once the browser has finished its current
	 * JavaScript execution.
	 */
	dispatchEvent = function(e_name, e_data, async) {
		var ev = createCustomEvent(e_name, {"detail": e_data});
		if (!ev) {
			return;
		}

		function dispatch() {
			try {
				if (d.dispatchEvent) {
					d.dispatchEvent(ev);
				}
				else if (d.fireEvent) {
					d.fireEvent("onpropertychange", ev);
				}
			}
			catch (e) {
				
			}
		}

		if (async) {
			BOOMR.setImmediate(dispatch);
		}
		else {
			dispatch();
		}
	};

	// visibilitychange is useful to detect if the page loaded through prerender
	// or if the page never became visible
	// http://www.w3.org/TR/2011/WD-page-visibility-20110602/
	// http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
	// https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

	// Set the name of the hidden property and the change event for visibility
	if (typeof d.hidden !== "undefined") {
		visibilityState = "visibilityState";
		visibilityChange = "visibilitychange";
	}
	else if (typeof d.mozHidden !== "undefined") {
		visibilityState = "mozVisibilityState";
		visibilityChange = "mozvisibilitychange";
	}
	else if (typeof d.msHidden !== "undefined") {
		visibilityState = "msVisibilityState";
		visibilityChange = "msvisibilitychange";
	}
	else if (typeof d.webkitHidden !== "undefined") {
		visibilityState = "webkitVisibilityState";
		visibilityChange = "webkitvisibilitychange";
	}

	// impl is a private object not reachable from outside the BOOMR object.
	// Users can set properties by passing in to the init() method.
	impl = {
		// Beacon URL
		beacon_url: "",

		// Forces protocol-relative URLs to HTTPS
		beacon_url_force_https: true,

		// List of string regular expressions that must match the beacon_url.  If
		// not set, or the list is empty, all beacon URLs are allowed.
		beacon_urls_allowed: [],

		// Beacon request method, either GET, POST or AUTO. AUTO will check the
		// request size then use GET if the request URL is less than MAX_GET_LENGTH
		// chars. Otherwise, it will fall back to a POST request.
		beacon_type: "AUTO",

		// Beacon authorization key value. Most systems will use the 'Authentication'
		// keyword, but some some services use keys like 'X-Auth-Token' or other
		// custom keys.
		beacon_auth_key: "Authorization",

		// Beacon authorization token. This is only needed if your are using a POST
		// and the beacon requires an Authorization token to accept your data.  This
		// disables use of the browser sendBeacon() API.
		beacon_auth_token: undefined,

		// Sends beacons with Credentials (applies to XHR beacons, not IMG or `sendBeacon()`).
		// If you need this, you may want to enable `beacon_disable_sendbeacon` as
		// `sendBeacon()` does not support credentials.
		beacon_with_credentials: false,

		// Disables navigator.sendBeacon() support
		beacon_disable_sendbeacon: false,

		// Strip out everything except last two parts of hostname.
		// This doesn't work well for domains that end with a country tld,
		// but we allow the developer to override site_domain for that.
		// You can disable all cookies by setting site_domain to a falsy value.
		site_domain: w.location.hostname.
					replace(/.*?([^.]+\.[^.]+)\.?$/, "$1").
					toLowerCase(),

		// User's ip address determined on the server.  Used for the BW cookie.
		user_ip: "",

		// Whether or not to send beacons on page load
		autorun: true,

		// Whether or not we've sent a page load beacon
		hasSentPageLoadBeacon: false,

		// document.referrer
		r: undefined,

		// strip_query_string: false,

		// onloadfired: false,

		// handlers_attached: false,

		// waiting_for_config: false,

		events: {
			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the page is usable by the user.
			 *
			 * By default this is fired when `window.onload` fires, but if you
			 * set `autorun` to false when calling {@link BOOMR.init}, then you
			 * must explicitly fire this event by calling {@link BOOMR#event:page_ready}.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload}
			 * @event BOOMR#page_ready
			 * @property {Event} [event] Event triggering the page_ready
			 */
			"page_ready": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired just before the browser unloads the page.
			 *
			 * The first event of `window.pagehide`, `window.beforeunload`,
			 * or `window.unload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/pagehide}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunload}
			 * @event BOOMR#page_unload
			 */
			"page_unload": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired before the document is about to be unloaded.
			 *
			 * `window.beforeunload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @event BOOMR#before_unload
			 */
			"before_unload": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired on `document.DOMContentLoaded`.
			 *
			 * The `DOMContentLoaded` event is fired when the initial HTML document
			 * has been completely loaded and parsed, without waiting for stylesheets,
			 * images, and subframes to finish loading
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded}
			 * @event BOOMR#dom_loaded
			 */
			"dom_loaded": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired on `document.visibilitychange`.
			 *
			 * The `visibilitychange` event is fired when the content of a tab has
			 * become visible or has been hidden.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event BOOMR#visibility_changed
			 */
			"visibility_changed": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the `visibilityState` of the document has changed from
			 * `prerender` to `visible`
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event BOOMR#prerender_to_visible
			 */
			"prerender_to_visible": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when a beacon is about to be sent.
			 *
			 * The subscriber can still add variables to the beacon at this point,
			 * either by modifying the `vars` paramter or calling {@link BOOMR.addVar}.
			 *
			 * @event BOOMR#before_beacon
			 * @property {object} vars Beacon variables
			 */
			"before_beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when a beacon was sent.
			 *
			 * The beacon variables cannot be modified at this point.  Any calls
			 * to {@link BOOMR.addVar} or {@link BOOMR.removeVar} will apply to the
			 * next beacon.
			 *
			 * Also known as `onbeacon`.
			 *
			 * @event BOOMR#beacon
			 * @property {object} vars Beacon variables
			 */
			"beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the page load beacon has been sent.
			 *
			 * This event should only happen once on a page.  It does not apply
			 * to SPA soft navigations.
			 *
			 * @event BOOMR#page_load_beacon
			 * @property {object} vars Beacon variables
			 */
			"page_load_beacon": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when an XMLHttpRequest has finished, or, if something calls
			 * {@link BOOMR.responseEnd}.
			 *
			 * @event BOOMR#xhr_load
			 * @property {object} data Event data
			 */
			"xhr_load": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when the `click` event has happened on the `document`.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick}
			 * @event BOOMR#click
			 */
			"click": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when any `FORM` element is submitted.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit}
			 * @event BOOMR#form_submit
			 */
			"form_submit": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever new configuration data is applied via {@link BOOMR.init}.
			 *
			 * Also known as `onconfig`.
			 *
			 * @event BOOMR#config
			 * @property {object} data Configuration data
			 */
			"config": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.open` is called.
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * @event BOOMR#xhr_init
			 * @property {string} type XHR type ("xhr")
			 */
			"xhr_init": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA plugin is about to track a new navigation.
			 *
			 * @event BOOMR#spa_init
			 * @property {string} navType Navigation type (`spa` or `spa_hard`)
			 * @property {object} param SPA navigation parameters
			 */
			"spa_init": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA navigation is complete.
			 *
			 * @event BOOMR#spa_navigation
			 */
			"spa_navigation": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a SPA navigation is cancelled.
			 *
			 * @event BOOMR#spa_cancel
			 */
			"spa_cancel": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.send` is called.
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * @event BOOMR#xhr_send
			 * @property {object} xhr `XMLHttpRequest` object
			 */
			"xhr_send": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever and `XMLHttpRequest` has an error (if its `status` is
			 * set).
			 *
			 * This event will only happen if {@link BOOMR.plugins.AutoXHR} is enabled.
			 *
			 * Also known as `onxhrerror`.
			 *
			 * @event BOOMR#xhr_error
			 * @property {object} data XHR data
			 */
			"xhr_error": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a page error has happened.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Errors} is enabled.
			 *
			 * Also known as `onerror`.
			 *
			 * @event BOOMR#error
			 * @property {object} err Error
			 */
			"error": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever connection information changes via the
			 * Network Information API.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Mobile} is enabled.
			 *
			 * @event BOOMR#netinfo
			 * @property {object} connection `navigator.connection`
			 */
			"netinfo": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired whenever a Rage Click is detected.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Continuity} is enabled.
			 *
			 * @event BOOMR#rage_click
			 * @property {Event} e Event
			 */
			"rage_click": [],

			/**
			 * Boomerang event, subscribe via {@link BOOMR.subscribe}.
			 *
			 * Fired when an early beacon is about to be sent.
			 *
			 * The subscriber can still add variables to the early beacon at this point
			 * by calling {@link BOOMR.addVar}.
			 *
			 * This event will only happen if {@link BOOMR.plugins.Early} is enabled.
			 *
			 * @event BOOMR#before_early_beacon
			 * @property {object} data Event data
			 */
			"before_early_beacon": []
		},

		/**
		 * Public events
		 */
		public_events: {
			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBeforeBoomerangBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link BOOMR#event:before_beacon}
			 *
			 * @event document#onBeforeBoomerangBeacon
			 * @property {object} vars Beacon variables
			 */
			"before_beacon": "onBeforeBoomerangBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBoomerangBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link BOOMR#event:before_beacon}
			 *
			 * @event document#onBoomerangBeacon
			 * @property {object} vars Beacon variables
			 */
			"beacon": "onBoomerangBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBoomerangLoaded", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Fired when {@link BOOMR} has loaded and can be used.
			 *
			 * @event document#onBoomerangLoaded
			 */
			"onboomerangloaded": "onBoomerangLoaded"
		},

		/**
		 * Maps old event names to their updated name
		 */
		translate_events: {
			"onbeacon": "beacon",
			"onconfig": "config",
			"onerror": "error",
			"onxhrerror": "xhr_error"
		},

		/**
		 * Number of page_unload or before_unload callbacks registered
		 */
		unloadEventsCount: 0,

		/**
		 * Number of page_unload or before_unload callbacks called
		 */
		unloadEventCalled: 0,

		listenerCallbacks: {},

		vars: {},
		singleBeaconVars: {},

		/**
		 * Variable priority lists:
		 * -1 = first
		 *  1 = last
		 */
		varPriority: {
			"-1": {},
			"1": {}
		},

		errors: {},

		disabled_plugins: {},

		localStorageSupported: false,
		LOCAL_STORAGE_PREFIX: "_boomr_",

		/**
		 * Native functions that were overwritten and should be restored when
		 * the Boomerang IFRAME is unloaded
		 */
		nativeOverwrites: [],

		xb_handler: function(type) {
			return function(ev) {
				var target;
				if (!ev) { ev = w.event; }
				if (ev.target) { target = ev.target; }
				else if (ev.srcElement) { target = ev.srcElement; }
				if (target.nodeType === 3) {  // defeat Safari bug
					target = target.parentNode;
				}

				// don't capture events on flash objects
				// because of context slowdowns in PepperFlash
				if (target &&
				    target.nodeName &&
				    target.nodeName.toUpperCase() === "OBJECT" &&
				    target.type === "application/x-shockwave-flash") {
					return;
				}
				impl.fireEvent(type, target);
			};
		},

		clearEvents: function() {
			var eventName;

			for (eventName in this.events) {
				if (this.events.hasOwnProperty(eventName)) {
					this.events[eventName] = [];
				}
			}
		},

		clearListeners: function() {
			var type, i;

			for (type in impl.listenerCallbacks) {
				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					// remove all callbacks -- removeListener is guaranteed
					// to remove the element we're calling with
					while (impl.listenerCallbacks[type].length) {
						BOOMR.utils.removeListener(
						    impl.listenerCallbacks[type][0].el,
						    type,
						    impl.listenerCallbacks[type][0].fn);
					}
				}
			}

			impl.listenerCallbacks = {};
		},

		fireEvent: function(e_name, data) {
			var i, handler, handlers, handlersLen;

			e_name = e_name.toLowerCase();


			// translate old names
			if (this.translate_events[e_name]) {
				e_name = this.translate_events[e_name];
			}

			if (!this.events.hasOwnProperty(e_name)) {
				return;// false;
			}

			if (this.public_events.hasOwnProperty(e_name)) {
				dispatchEvent(this.public_events[e_name], data);
			}

			handlers = this.events[e_name];

			// Before we fire any event listeners, let's call real_sendBeacon() to flush
			// any beacon that is being held by the setImmediate.
			if (e_name !== "before_beacon" && e_name !== "beacon" && e_name !== "before_early_beacon") {
				BOOMR.real_sendBeacon();
			}

			// only call handlers at the time of fireEvent (and not handlers that are
			// added during this callback to avoid an infinite loop)
			handlersLen = handlers.length;
			for (i = 0; i < handlersLen; i++) {
				try {
					handler = handlers[i];
					handler.fn.call(handler.scope, data, handler.cb_data);
				}
				catch (err) {
					BOOMR.addError(err, "fireEvent." + e_name + "<" + i + ">");
				}
			}

			// remove any 'once' handlers now that we've fired all of them
			for (i = 0; i < handlersLen; i++) {
				if (handlers[i].once) {
					handlers.splice(i, 1);
					handlersLen--;
					i--;
				}
			}


			return;// true;
		},

		spaNavigation: function() {
			// a SPA navigation occured, force onloadfired to true
			impl.onloadfired = true;
		},

		/**
		 * Determines whether a beacon URL is allowed based on
		 * `beacon_urls_allowed` config
		 *
		 * @param {string} url URL to test
		 *
		 */
		beaconUrlAllowed: function(url) {
			if (!impl.beacon_urls_allowed || impl.beacon_urls_allowed.length === 0) {
				return true;
			}

			for (var i = 0; i < impl.beacon_urls_allowed.length; i++) {
				var regEx = new RegExp(impl.beacon_urls_allowed[i]);
				if (regEx.exec(url)) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Checks browser for localStorage support
		 */
		checkLocalStorageSupport: function() {
			var name = impl.LOCAL_STORAGE_PREFIX + "clss";
			impl.localStorageSupported = false;

			// Browsers with cookies disabled or in private/incognito mode may throw an
			// error when accessing the localStorage variable
			try {
				// we need JSON and localStorage support
				if (!w.JSON || !w.localStorage) {
					return;
				}

				w.localStorage.setItem(name, name);
				impl.localStorageSupported = (w.localStorage.getItem(name) === name);
				w.localStorage.removeItem(name);
			}
			catch (ignore) {
				impl.localStorageSupported = false;
			}
		},

		/**
		 * Fired when the Boomerang IFRAME is unloaded.
		 *
		 * If Boomerang was loaded into the root document, this code
		 * will not run.
		 */
		onFrameUnloaded: function() {
			var i, prop;

			BOOMR.isUnloaded = true;

			// swap the original function back in for any overwrites
			for (i = 0; i < impl.nativeOverwrites.length; i++) {
				prop = impl.nativeOverwrites[i];

				prop.obj[prop.functionName] = prop.origFn;
			}

			impl.nativeOverwrites = [];
		}
	};

	// We create a boomr object and then copy all its properties to BOOMR so that
	// we don't overwrite anything additional that was added to BOOMR before this
	// was called... for example, a plugin.
	boomr = {
		/**
		 * The timestamp when boomerang.js showed up on the page.
		 *
		 * This is the value of `BOOMR_start` we set earlier.
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		t_start: BOOMR_start,

		/**
		 * When the Boomerang plugins have all run.
		 *
		 * This value is generally set in zzz-last-plugin.js.
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		t_end: undefined,

		/**
		 * URL of boomerang.js.
		 *
		 * @type {string}
		 *
		 * @memberof BOOMR
		 */
		url: "",

		/**
		 * (Optional) URL of configuration file
		 *
		 * @type {string}
		 *
		 * @memberof BOOMR
		 */
		config_url: null,

		/**
		 * Whether or not Boomerang was loaded after the `onload` event.
		 *
		 * @type {boolean}
		 *
		 * @memberof BOOMR
		 */
		loadedLate: false,

		/**
		 * Current number of beacons sent.
		 *
		 * Will be incremented and added to outgoing beacon as `n`.
		 *
		 * @type {number}
		 *
		 */
		beaconsSent: 0,

		/**
		 * Whether or not Boomerang thinks it has been unloaded (if it was
		 * loaded in an IFRAME)
		 *
		 * @type {boolean}
		 */
		isUnloaded: false,

		/**
		 * Whether or not we're in the middle of building a beacon.
		 *
		 * If so, the code desiring to send a beacon should wait until the beacon
		 * event and try again.  At that point, it should set this flag to true.
		 *
		 * @type {boolean}
		 */
		beaconInQueue: false,

		/*
		 * Cache of cookies set
		 */
		cookies: {},

		/**
		 * Whether or not we've tested cookie setting
		 */
		testedCookies: false,

		/**
		 * Constants visible to the world
		 * @class BOOMR.constants
		 */
		constants: {
			/**
			 * SPA beacon types
			 *
			 * @type {string[]}
			 *
			 * @memberof BOOMR.constants
			 */
			BEACON_TYPE_SPAS: ["spa", "spa_hard"],

			/**
			 * Maximum GET URL length.
			 * Using 2000 here as a de facto maximum URL length based on:
 			 * http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
			 *
			 * @type {number}
			 *
			 * @memberof BOOMR.constants
			 */
			MAX_GET_LENGTH: 2000
		},

		/**
		 * Session data
		 * @class BOOMR.session
		 */
		session: {
			/**
			 * Session Domain.
			 *
			 * You can disable all cookies by setting site_domain to a falsy value.
			 *
			 * @type {string}
			 *
			 * @memberof BOOMR.session
			 */
			domain: impl.site_domain,

			/**
			 * Session ID.  This will be randomly generated in the client but may
			 * be overwritten by the server if not set.
			 *
			 * @type {string}
			 *
			 * @memberof BOOMR.session
			 */
			ID: undefined,

			/**
			 * Session start time.
			 *
			 * @type {TimeStamp}
			 *
			 * @memberof BOOMR.session
			 */
			start: undefined,

			/**
			 * Session length (number of pages)
			 *
			 * @type {number}
			 *
			 * @memberof BOOMR.session
			 */
			length: 0,

			/**
			 * Session enabled (Are session cookies enabled?)
			 *
			 * @type {boolean}
			 *
			 * @memberof BOOMR.session
			 */
			enabled: true
		},

		/**
		 * @class BOOMR.utils
		 */
		utils: {
			/**
			 * Determines whether or not the browser has `postMessage` support
			 *
			 * @returns {boolean} True if supported
			 */
			hasPostMessageSupport: function() {
				if (!w.postMessage || typeof w.postMessage !== "function" && typeof w.postMessage !== "object") {
					return false;
				}
				return true;
			},

			/**
			 * Converts an object to a string.
			 *
			 * @param {object} o Object
			 * @param {string} separator Member separator
			 * @param {number} nest_level Number of levels to recurse
			 *
			 * @returns {string} String representation of the object
			 *
			 * @memberof BOOMR.utils
			 */
			objectToString: function(o, separator, nest_level) {
				var value = [], k;

				if (!o || typeof o !== "object") {
					return o;
				}
				if (separator === undefined) {
					separator = "\n\t";
				}
				if (!nest_level) {
					nest_level = 0;
				}

				if (BOOMR.utils.isArray(o)) {
					for (k = 0; k < o.length; k++) {
						if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
							value.push(
								this.objectToString(
									o[k],
									separator + (separator === "\n\t" ? "\t" : ""),
									nest_level - 1
								)
							);
						}
						else {
							if (separator === "&") {
								value.push(encodeURIComponent(o[k]));
							}
							else {
								value.push(o[k]);
							}
						}
					}
					separator = ",";
				}
				else {
					for (k in o) {
						if (Object.prototype.hasOwnProperty.call(o, k)) {
							if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
								value.push(encodeURIComponent(k) + "=" +
									this.objectToString(
										o[k],
										separator + (separator === "\n\t" ? "\t" : ""),
										nest_level - 1
									)
								);
							}
							else {
								if (separator === "&") {
									value.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k]));
								}
								else {
									value.push(k + "=" + o[k]);
								}
							}
						}
					}
				}

				return value.join(separator);
			},

			/**
			 * Gets the cached value of the cookie identified by `name`.
			 *
			 * @param {string} name Cookie name
			 *
			 * @returns {string|undefined} Cookie value, if set.
			 *
			 * @memberof BOOMR.utils
			 */
			getCookie: function(name) {
				var cookieVal;

				if (!name) {
					return null;
				}


				if (typeof BOOMR.cookies[name] !== "undefined") {
					// a cached value of false indicates that the value doesn't exist, if so,
					// return undefined per the API
					return BOOMR.cookies[name] === false ? undefined : BOOMR.cookies[name];
				}

				// unknown value
				cookieVal = this.getRawCookie(name);
				if (typeof cookieVal === "undefined") {
					// set to false to indicate we've attempted to get this cookie
					BOOMR.cookies[name] = false;

					// but return undefined per the API
					return undefined;
				}

				BOOMR.cookies[name] = cookieVal;

				return BOOMR.cookies[name];
			},

			/**
			 * Gets the value of the cookie identified by `name`.
			 *
			 * @param {string} name Cookie name
			 *
			 * @returns {string|null} Cookie value, if set.
			 *
			 * @memberof BOOMR.utils
			 */
			getRawCookie: function(name) {
				if (!name) {
					return null;
				}


				name = " " + name + "=";

				var i, cookies;
				cookies = " " + d.cookie + ";";
				if ((i = cookies.indexOf(name)) >= 0) {
					i += name.length;
					return cookies.substring(i, cookies.indexOf(";", i)).replace(/^"/, "").replace(/"$/, "");
				}
			},

			/**
			 * Sets the cookie named `name` to the serialized value of `subcookies`.
			 *
			 * @param {string} name The name of the cookie
			 * @param {object} subcookies Key/value pairs to write into the cookie.
			 * These will be serialized as an & separated list of URL encoded key=value pairs.
			 * @param {number} max_age Lifetime in seconds of the cookie.
			 * Set this to 0 to create a session cookie that expires when
			 * the browser is closed. If not set, defaults to 0.
			 *
			 * @returns {boolean} True if the cookie was set successfully
			 *
			 * @example
			 * BOOMR.utils.setCookie("RT", { s: t_start, r: url });
			 *
			 * @memberof BOOMR.utils
			 */
			setCookie: function(name, subcookies, max_age) {
				var value, nameval, savedval, c, exp;

				if (!name || !BOOMR.session.domain || typeof subcookies === "undefined") {
					

					BOOMR.addVar("nocookie", 1);
					return false;
				}


				value = this.objectToString(subcookies, "&");

				if (value === BOOMR.cookies[name]) {
					// no change
					return true;
				}

				nameval = name + "=\"" + value + "\"";

				if (nameval.length < 500) {
					c = [nameval, "path=/", "domain=" + BOOMR.session.domain];
					if (typeof max_age === "number") {
						exp = new Date();
						exp.setTime(exp.getTime() + max_age * 1000);
						exp = exp.toGMTString();
						c.push("expires=" + exp);
					}


					// set the cookie
					d.cookie = c.join("; ");

					// we only need to test setting the cookie once
					if (BOOMR.testedCookies) {
						// only cache this cookie value if the expiry is in the future
						if (typeof max_age !== "number" || max_age > 0) {
							BOOMR.cookies[name] = value;
						}
						else {
							// the cookie is going to expire right away, don't cache it
							BOOMR.cookies[name] = undefined;
						}

						return true;
					}

					// unset the cached cookie value, in case the set doesn't work
					BOOMR.cookies[name] = undefined;

					// confirm cookie was set (could be blocked by user's settings, etc.)
					savedval = this.getRawCookie(name);

					// the saved cookie should be the same or undefined in the case of removeCookie
					if (value === savedval ||
					    (typeof savedval === "undefined" && typeof max_age === "number" && max_age <= 0)) {
						// re-set the cached value
						BOOMR.cookies[name] = value;

						// note we've saved successfully
						BOOMR.testedCookies = true;

						BOOMR.removeVar("nocookie");

						return true;
					}
					BOOMR.warn("Saved cookie value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					BOOMR.warn("Cookie too long: " + nameval.length + " " + nameval);
				}

				BOOMR.addVar("nocookie", 1);
				return false;
			},

			/**
			 * Parse a cookie string returned by {@link BOOMR.utils.getCookie} and
			 * split it into its constituent subcookies.
			 *
			 * @param {string} cookie Cookie value
			 *
			 * @returns {object} On success, an object of key/value pairs of all
			 * sub cookies. Note that some subcookies may have empty values.
			 * `null` if `cookie` was not set or did not contain valid subcookies.
			 *
			 * @memberof BOOMR.utils
			 */
			getSubCookies: function(cookie) {
				var cookies_a,
				    i, l, kv,
				    gotcookies = false,
				    cookies = {};

				if (!cookie) {
					return null;
				}

				if (typeof cookie !== "string") {
					
					return null;
				}

				cookies_a = cookie.split("&");

				for (i = 0, l = cookies_a.length; i < l; i++) {
					kv = cookies_a[i].split("=");
					if (kv[0]) {
						kv.push("");  // just in case there's no value
						cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
						gotcookies = true;
					}
				}

				return gotcookies ? cookies : null;
			},

			/**
			 * Removes the cookie identified by `name` by nullifying its value,
			 * and making it a session cookie.
			 *
			 * @param {string} name Cookie name
			 *
			 * @memberof BOOMR.utils
			 */
			removeCookie: function(name) {
				return this.setCookie(name, {}, -86400);
			},

			/**
			 * Retrieve items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {object|null} Returns object retrieved from localStorage.
			 *                       Returns undefined if not found or expired.
			 *                       Returns null if parameters are invalid or an error occured
			 *
			 * @memberof BOOMR.utils
			 */
			getLocalStorage: function(name) {
				var value, data;
				if (!name || !impl.localStorageSupported) {
					return null;
				}


				try {
					value = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
					if (value === null) {
						return undefined;
					}
					data = w.JSON.parse(value);
				}
				catch (e) {
					BOOMR.warn(e);
					return null;
				}

				if (!data || typeof data.items !== "object") {
					// Items are invalid
					this.removeLocalStorage(name);
					return null;
				}
				if (typeof data.expires === "number") {
					if (BOOMR.now() >= data.expires) {
						// Items are expired
						this.removeLocalStorage(name);
						return undefined;
					}
				}
				return data.items;
			},

			/**
			 * Saves items in localStorage
			 * The value stored in localStorage will be a JSON string representation of {"items": items, "expiry": expiry}
			 * where items is the object we're saving and expiry is an optional epoch number of when the data is to be
			 * considered expired
			 *
			 * @param {string} name Name of storage
			 * @param {object} items Items to be saved
			 * @param {number} max_age Age in seconds before items are to be considered expired
			 *
			 * @returns {boolean} True if the localStorage was set successfully
			 *
			 * @memberof BOOMR.utils
			 */
			setLocalStorage: function(name, items, max_age) {
				var data, value, savedval;

				if (!name || !impl.localStorageSupported || typeof items !== "object") {
					return false;
				}


				data = {"items": items};

				if (typeof max_age === "number") {
					data.expires = BOOMR.now() + (max_age * 1000);
				}

				value = w.JSON.stringify(data);

				if (value.length < 50000) {
					try {
						w.localStorage.setItem(impl.LOCAL_STORAGE_PREFIX + name, value);
						// confirm storage was set (could be blocked by user's settings, etc.)
						savedval = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
						if (value === savedval) {
							return true;
						}
					}
					catch (ignore) {
						// Empty
					}
					BOOMR.warn("Saved storage value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					BOOMR.warn("Storage items too large: " + value.length + " " + value);
				}

				return false;
			},

			/**
			 * Remove items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {boolean} True if item was removed from localStorage.
			 *
			 * @memberof BOOMR.utils
			 */
			removeLocalStorage: function(name) {
				if (!name || !impl.localStorageSupported) {
					return false;
				}
				try {
					w.localStorage.removeItem(impl.LOCAL_STORAGE_PREFIX + name);
					return true;
				}
				catch (ignore) {
					// Empty
				}
				return false;
			},

			/**
			 * Cleans up a URL by removing the query string (if configured), and
			 * limits the URL to the specified size.
			 *
			 * @param {string} url URL to clean
			 * @param {number} urlLimit Maximum size, in characters, of the URL
			 *
			 * @returns {string} Cleaned up URL
			 *
			 * @memberof BOOMR.utils
			 */
			cleanupURL: function(url, urlLimit) {
				if (!url || BOOMR.utils.isArray(url)) {
					return "";
				}

				if (impl.strip_query_string) {
					url = url.replace(/\?.*/, "?qs-redacted");
				}

				if (typeof urlLimit !== "undefined" && url && url.length > urlLimit) {
					// We need to break this URL up.  Try at the query string first.
					var qsStart = url.indexOf("?");
					if (qsStart !== -1 && qsStart < urlLimit) {
						url = url.substr(0, qsStart) + "?...";
					}
					else {
						// No query string, just stop at the limit
						url = url.substr(0, urlLimit - 3) + "...";
					}
				}

				return url;
			},

			/**
			 * Gets the URL with the query string replaced with a hash of its contents.
			 *
			 * @param {string} url URL
			 * @param {boolean} stripHash Whether or not to strip the hash
			 *
			 * @returns {string} URL with query string hashed
			 *
			 * @memberof BOOMR.utils
			 */
			hashQueryString: function(url, stripHash) {
				if (!url) {
					return url;
				}
				if (!url.match) {
					BOOMR.addError("TypeError: Not a string", "hashQueryString", typeof url);
					return "";
				}
				if (url.match(/^\/\//)) {
					url = location.protocol + url;
				}
				if (!url.match(/^(https?|file):/)) {
					BOOMR.error("Passed in URL is invalid: " + url);
					return "";
				}
				if (stripHash) {
					url = url.replace(/#.*/, "");
				}
				return url.replace(/\?([^#]*)/, function(m0, m1) {
					return "?" + (m1.length > 10 ? BOOMR.utils.hashString(m1) : m1);
				});
			},

			/**
			 * Sets the object's properties if anything in config matches
			 * one of the property names.
			 *
			 * @param {object} o The plugin's `impl` object within which it stores
			 * all its configuration and private properties
			 * @param {object} config The config object passed in to the plugin's
			 * `init()` method.
			 * @param {string} plugin_name The plugin's name in the {@link BOOMR.plugins} object.
			 * @param {string[]} properties An array containing a list of all configurable
			 * properties that this plugin has.
			 *
			 * @returns {boolean} True if a property was set
			 *
			 * @memberof BOOMR.utils
			 */
			pluginConfig: function(o, config, plugin_name, properties) {
				var i, props = 0;

				if (!config || !config[plugin_name]) {
					return false;
				}

				for (i = 0; i < properties.length; i++) {
					if (config[plugin_name][properties[i]] !== undefined) {
						o[properties[i]] = config[plugin_name][properties[i]];
						props++;
					}
				}

				return (props > 0);
			},

			/**
			 * `filter` for arrays
			 *
			 * @param {Array} array The array to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 *
			 * @returns {Array} Returns the new filtered array.
			 *
			 * @memberof BOOMR.utils
			 */
			arrayFilter: function(array, predicate) {
				var result = [];

				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return result;
				}

				if (typeof array.filter === "function") {
					result = array.filter(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							result[result.length] = value;
						}
					}
				}
				return result;
			},

			/**
			 * `find` for Arrays
			 *
			 * @param {Array} array The array to iterate over
			 * @param {Function} predicate The function invoked per iteration
			 *
			 * @returns {Array} Returns the value of first element that satisfies
			 * the predicate
			 *
			 * @memberof BOOMR.utils
			 */
			arrayFind: function(array, predicate) {
				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return undefined;
				}

				if (typeof array.find === "function") {
					return array.find(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							return value;
						}
					}
					return undefined;
				}
			},

			/**
			 * MutationObserver feature detection
			 *
			 * @returns {boolean} Returns true if MutationObserver is supported.
			 * Always returns false for IE 11 due several bugs in it's implementation that MS flagged as Won't Fix.
			 * In IE11, XHR responseXML might be malformed if MO is enabled (where extra newlines get added in nodes with UTF-8 content).
			 * Another IE 11 MO bug can cause the process to crash when certain mutations occur.
			 * For the process crash issue, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8137215/ and
			 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15167323/
			 *
			 * @memberof BOOMR.utils
			 */
			isMutationObserverSupported: function() {
				// We can only detect IE 11 bugs by UA sniffing.
				var ie11 = (w && w.navigator && w.navigator.userAgent && w.navigator.userAgent.match(/Trident.*rv[ :]*11\./));
				return (!ie11 && w && w.MutationObserver && typeof w.MutationObserver === "function");
			},

			/**
			 * The callback function may return a falsy value to disconnect the
			 * observer after it returns, or a truthy value to keep watching for
			 * mutations. If the return value is numeric and greater than 0, then
			 * this will be the new timeout. If it is boolean instead, then the
			 * timeout will not fire any more so the caller MUST call disconnect()
			 * at some point.
			 *
			 * @callback BOOMR~addObserverCallback
			 * @param {object[]} mutations List of mutations detected by the observer or `undefined` if the observer timed out
			 * @param {object} callback_data Is the passed in `callback_data` parameter without modifications
			 */

			/**
			 * Add a MutationObserver for a given element and terminate after `timeout`ms.
			 *
			 * @param {DOMElement} el DOM element to watch for mutations
			 * @param {MutationObserverInit} config MutationObserverInit object (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit)
			 * @param {number} timeout Number of milliseconds of no mutations after which the observer should be automatically disconnected.
			 * If set to a falsy value, the observer will wait indefinitely for Mutations.
			 * @param {BOOMR~addObserverCallback} callback Callback function to call either on timeout or if mutations are detected.
			 * @param {object} callback_data Any data to be passed to the callback function as its second parameter.
			 * @param {object} callback_ctx An object that represents the `this` object of the `callback` method.
			 * Leave unset the callback function is not a method of an object.
			 *
			 * @returns {object|null}
			 * - `null` if a MutationObserver could not be created OR
			 * - An object containing the observer and the timer object:
			 *   `{ observer: <MutationObserver>, timer: <Timeout Timer if any> }`
			 * - The caller can use this to disconnect the observer at any point
			 *   by calling `retval.observer.disconnect()`
			 * - Note that the caller should first check to see if `retval.observer`
			 *   is set before calling `disconnect()` as it may have been cleared automatically.
			 *
			 * @memberof BOOMR.utils
			 */
			addObserver: function(el, config, timeout, callback, callback_data, callback_ctx) {
				var MO, zs, o = {observer: null, timer: null};


				if (!this.isMutationObserverSupported() || !callback || !el) {
					return null;
				}

				function done(mutations) {
					var run_again = false;


					if (o.timer) {
						clearTimeout(o.timer);
						o.timer = null;
					}

					if (callback) {
						run_again = callback.call(callback_ctx, mutations, callback_data);

						if (!run_again) {
							callback = null;
						}
					}

					if (!run_again && o.observer) {
						o.observer.disconnect();
						o.observer = null;
					}

					if (typeof run_again === "number" && run_again > 0) {
						o.timer = setTimeout(done, run_again);
					}
				}

				MO = w.MutationObserver;
				// if the site uses Zone.js then get the native MutationObserver
				if (w.Zone && typeof w.Zone.__symbol__ === "function") {
					zs = w.Zone.__symbol__("MutationObserver");
					if (zs && typeof zs === "string" && w.hasOwnProperty(zs) && typeof w[zs] === "function") {
						
						MO = w[zs];
					}
				}
				o.observer = new MO(done);

				if (timeout) {
					o.timer = setTimeout(done, o.timeout);
				}

				o.observer.observe(el, config);

				return o;
			},

			/**
			 * Adds an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 * @param {boolean} passive Passive mode
			 *
			 * @memberof BOOMR.utils
			 */
			addListener: function(el, type, fn, passive) {
				var opts = false;


				if (el.addEventListener) {
					if (passive && BOOMR.browser.supportsPassive()) {
						opts = {
							capture: false,
							passive: true
						};
					}

					el.addEventListener(type, fn, opts);
				}
				else if (el.attachEvent) {
					el.attachEvent("on" + type, fn);
				}

				// ensure the type arry exists
				impl.listenerCallbacks[type] = impl.listenerCallbacks[type] || [];

				// save a reference to the target object and function
				impl.listenerCallbacks[type].push({ el: el, fn: fn});
			},

			/**
			 * Removes an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 *
			 * @memberof BOOMR.utils
			 */
			removeListener: function(el, type, fn) {
				var i;


				if (el.removeEventListener) {
					// NOTE: We don't need to match any other options (e.g. passive)
					// from addEventListener, as removeEventListener only cares
					// about captive.
					el.removeEventListener(type, fn, false);
				}
				else if (el.detachEvent) {
					el.detachEvent("on" + type, fn);
				}

				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					for (var i = 0; i < impl.listenerCallbacks[type].length; i++) {
						if (fn === impl.listenerCallbacks[type][i].fn &&
						    el === impl.listenerCallbacks[type][i].el) {
							impl.listenerCallbacks[type].splice(i, 1);
							return;
						}
					}
				}
			},

			/**
			 * Determines if the specified object is an `Array` or not
			 *
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the object is an `Array`
			 *
			 * @memberof BOOMR.utils
			 */
			isArray: function(ary) {
				return Object.prototype.toString.call(ary) === "[object Array]";
			},

			/**
			 * Determines if the specified value is in the array
			 *
			 * @param {object} val Value to check
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the value is in the Array
			 *
			 * @memberof BOOMR.utils
			 */
			inArray: function(val, ary) {
				var i;

				if (typeof val === "undefined" || typeof ary === "undefined" || !ary.length) {
					return false;
				}

				for (i = 0; i < ary.length; i++) {
					if (ary[i] === val) {
						return true;
					}
				}

				return false;
			},

			/**
			 * Get a query parameter value from a URL's query string
			 *
			 * @param {string} param Query parameter name
			 * @param {string|Object} [url] URL containing the query string, or a link object.
			 * Defaults to `BOOMR.window.location`
			 *
			 * @returns {string|null} URI decoded value or null if param isn't a query parameter
			 *
			 * @memberof BOOMR.utils
			 */
			getQueryParamValue: function(param, url) {
				var l, params, i, kv;
				if (!param) {
					return null;
				}

				if (typeof url === "string") {
					l = BOOMR.window.document.createElement("a");
					l.href = url;
				}
				else if (typeof url === "object" && typeof url.search === "string") {
					l = url;
				}
				else {
					l = BOOMR.window.location;
				}

				// Now that we match, pull out all query string parameters
				params = l.search.slice(1).split(/&/);

				for (i = 0; i < params.length; i++) {
					if (params[i]) {
						kv = params[i].split("=");
						if (kv.length && kv[0] === param) {
							return kv.length > 1 ? decodeURIComponent(kv.splice(1).join("=").replace(/\+/g, " ")) : "";
						}
					}
				}
				return null;
			},

			/**
			 * Generates a pseudo-random UUID (Version 4):
			 * https://en.wikipedia.org/wiki/Universally_unique_identifier
			 *
			 * @returns {string} UUID
			 *
			 * @memberof BOOMR.utils
			 */
			generateUUID: function() {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0;
					var v = c === "x" ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},

			/**
			 * Generates a random ID based on the specified number of characters.  Uses
			 * characters a-z0-9.
			 *
			 * @param {number} chars Number of characters (max 40)
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof BOOMR.utils
			 */
			generateId: function(chars) {
				return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".substr(0, chars || 40).replace(/x/g, function(c) {
					var c = (Math.random() || 0.01).toString(36);

					// some implementations may return "0" for small numbers
					if (c === "0") {
						return "0";
					}
					else {
						return c.substr(2, 1);
					}
				});
			},

			/**
			 * Attempt to serialize an object, preferring JSURL over JSON.stringify
			 *
			 * @param {Object} value Object to serialize
			 * @returns {string} serialized version of value, empty-string if not possible
			 */
			serializeForUrl: function(value) {
				if (BOOMR.utils.Compression && BOOMR.utils.Compression.jsUrl) {
					return BOOMR.utils.Compression.jsUrl(value);
				}
				if (window.JSON) {
					return JSON.stringify(value);
				}
				// not supported
				
				return "";
			},

			/**
			 * Attempt to identify the URL of boomerang itself using multiple methods for cross-browser support
			 *
			 * This method uses document.currentScript (which cannot be called from an event handler), script.readyState (IE6-10),
			 * and the stack property of a caught Error object.
			 *
			 * @returns {string} The URL of the currently executing boomerang script.
			 */
			getMyURL: function() {
				var stack;
				// document.currentScript works in all browsers except for IE: https://caniuse.com/#feat=document-currentscript
				// #boomr-if-as works in all browsers if the page uses our standard iframe loader
				// #boomr-scr-as works in all browsers if the page uses our preloader loader
				// BOOMR_script will be undefined on IE for pages that do not use our standard loaders

				// Note that we do not use `w.document` or `d` here because we need the current execution context
				var BOOMR_script = (document.currentScript || document.getElementById("boomr-if-as") || document.getElementById("boomr-scr-as"));

				if (BOOMR_script) {
					return BOOMR_script.src;
				}

				// For IE 6-10 users on pages not using the standard loader, we iterate through all scripts backwards
				var scripts = document.getElementsByTagName("script"), i;

				// i-- is both a decrement as well as a condition, ie, the loop will terminate when i goes from 0 to -1
				for (i = scripts.length; i--;) {
					// We stop at the first script that has its readyState set to interactive indicating that it is currently executing
					if (scripts[i].readyState === "interactive") {
						return scripts[i].src;
					}
				}

				// For IE 11, we throw an Error and inspect its stack property in the catch block
				// This also works on IE10, but throwing is disruptive so we try to avoid it and use
				// the less disruptive script iterator above
				try {
					throw new Error();
				}
				catch (e) {
					if ("stack" in e) {
						stack = this.arrayFilter(e.stack.split(/\n/), function(l) { return l.match(/https?:\/\//); });
						if (stack && stack.length) {
							return stack[0].replace(/.*(https?:\/\/.+?)(:\d+)+\D*$/m, "$1");
						}
					}
					// FWIW, on IE 8 & 9, the Error object does not contain a stack property, but if you have an uncaught error,
					// and a `window.onerror` handler (not using addEventListener), then the second argument to that handler is
					// the URL of the script that threw. The handler needs to `return true;` to prevent the default error handler
					// This flow is asynchronous though (due to the event handler), so won't work in a function return scenario
					// like this (we can't use promises because we would only need this hack in browsers that don't support promises).
				}

				return "";
			},

			/*
			 * Gets the Scroll x and y (rounded) for a page
			 *
			 * @returns {object} Scroll x and y coordinates
			 */
			scroll: function() {
				// Adapted from:
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
				var supportPageOffset = w.pageXOffset !== undefined;
				var isCSS1Compat = ((w.document.compatMode || "") === "CSS1Compat");

				var ret = {
					x: 0,
					y: 0
				};

				if (supportPageOffset) {
					if (typeof w.pageXOffset === "function") {
						ret.x = w.pageXOffset();
						ret.y = w.pageYOffset();
					}
					else {
						ret.x = w.pageXOffset;
						ret.y = w.pageYOffset;
					}
				}
				else if (isCSS1Compat) {
					ret.x = w.document.documentElement.scrollLeft;
					ret.y = w.document.documentElement.scrollTop;
				}
				else {
					ret.x = w.document.body.scrollLeft;
					ret.y = w.document.body.scrollTop;
				}

				// round to full numbers
				if (typeof ret.sx === "number") {
					ret.sx = Math.round(ret.sx);
				}

				if (typeof ret.sy === "number") {
					ret.sy = Math.round(ret.sy);
				}

				return ret;
			},

			/**
			 * Gets the window height
			 *
			 * @returns {number} Window height
			 */
			windowHeight: function() {
				return w.innerHeight || w.document.documentElement.clientHeight || w.document.body.clientHeight;
			},

			/**
			 * Gets the window width
			 *
			 * @returns {number} Window width
			 */
			windowWidth: function() {
				return w.innerWidth || w.document.documentElement.clientWidth || w.document.body.clientWidth;
			},

			/**
			 * Determines if the function is native or not
			 *
			 * @param {function} fn Function
			 *
			 * @returns {boolean} True when the function is native
			 */
			isNative: function(fn) {
				return !!fn &&
				    fn.toString &&
				    !fn.hasOwnProperty("toString") &&
				    /\[native code\]/.test(String(fn));
			},

			/**
			 * Overwrites a function on the specified object.
			 *
			 * When the Boomerang IFRAME unloads, it will swap the old
			 * function back in, so calls to the functions are successful.
			 *
			 * If this isn't done, callers of the overwritten functions may still
			 * call into freed Boomerang code or the IFRAME that is partially unloaded,
			 * leading to "Freed script" errors or exceptions from accessing
			 * unloaded DOM properties.
			 *
			 * This tracking isn't needed if Boomerang is loaded in the root
			 * document, as everthing will be cleaned up along with Boomerang
			 * on unload.
			 *
			 * @param {object} obj Object whose property will be overwritten
			 * @param {string} functionName Function name
			 * @param {function} newFn New function
			 */
			overwriteNative: function(obj, functionName, newFn) {
				// bail if the object doesn't exist
				if (!obj || !newFn) {
					return;
				}

				// we only need to keep track if we're running Boomerang in
				// an IFRAME
				if (BOOMR.boomerang_frame !== BOOMR.window) {
					// note we overwrote this
					impl.nativeOverwrites.push({
						obj: obj,
						functionName: functionName,
						origFn: obj[functionName]
					});
				}

				obj[functionName] = newFn;
			},

			/**
			 * Determines if the given input is an Integer.
			 * Relies on standard Number.isInteger() function that available
			 * is most browsers except IE. For IE, this relies on the polyfill
			 * provided by MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
			 *
			 * @param {number} input dat
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof BOOMR.utils
			 *
			 */
			isInteger: function(data) {
				var isInt = Number.isInteger || function(value) {
					return typeof value === "number" &&
						isFinite(value) &&
						Math.floor(value) === value;
				};

				return isInt(data);
			},

			/**
			 * Determines whether or not an Object is empty
			 *
			 * @param {object} data Data object
			 *
			 * @returns {boolean} True if the object has no properties
			 */
			isObjectEmpty: function(data) {
				for (var propName in data) {
					if (data.hasOwnProperty(propName)) {
						return false;
					}
				}

				return true;
			},

			/**
			 * Calculates the FNV hash of the specified string.
			 *
			 * @param {string} string Input string
			 *
			 * @returns {string} FNV hash of the input string
			 *
			 */
			hashString: function(string) {
				string = encodeURIComponent(string);
				var hval = 0x811c9dc5;

				for (var i = 0; i < string.length; i++) {
					hval = hval ^ string.charCodeAt(i);
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}

				var hash = (hval >>> 0).toString() + string.length;

				return parseInt(hash).toString(36);
			}


		}, // closes `utils`

		/**
		 * Browser feature detection flags.
		 *
		 * @class BOOMR.browser
		 */
		browser: {
			results: {},

			/**
			 * Whether or not the browser supports 'passive' mode for event
			 * listeners
			 *
			 * @returns {boolean} True if the browser supports passive mode
			 */
			supportsPassive: function() {
				if (typeof BOOMR.browser.results.supportsPassive === "undefined") {
					BOOMR.browser.results.supportsPassive = false;

					if (!Object.defineProperty) {
						return false;
					}

					try {
						var opts = Object.defineProperty({}, "passive", {
							get: function() {
								BOOMR.browser.results.supportsPassive = true;
							}
						});
						window.addEventListener("test", null, opts);
					}
					catch (e) {
						// NOP
					}
				}

				return BOOMR.browser.results.supportsPassive;
			}
		},

		/**
		 * Initializes Boomerang by applying the specified configuration.
		 *
		 * All plugins' `init()` functions will be called with the same config as well.
		 *
		 * @param {object} config Configuration object
		 * @param {boolean} [config.autorun] By default, boomerang runs automatically
		 * and attaches its `page_ready` handler to the `window.onload` event.
		 * If you set `autorun` to `false`, this will not happen and you will
		 * need to call {@link BOOMR.page_ready} yourself.
		 * @param {string} config.beacon_auth_key Beacon authorization key value
		 * @param {string} config.beacon_auth_token Beacon authorization token.
		 * @param {boolean} config.beacon_with_credentials Sends beacon with credentials
		 * @param {boolean} config.beacon_disable_sendbeacon Disables `navigator.sendBeacon()` support
		 * @param {string} config.beacon_url The URL to beacon results back to.
		 * If not set, no beacon will be sent.
		 * @param {boolean} config.beacon_url_force_https Forces protocol-relative Beacon URLs to HTTPS
		 * @param {string} config.beacon_type `GET`, `POST` or `AUTO`
		 * @param {string} [config.site_domain] The domain that all cookies should be set on
		 * Boomerang will try to auto-detect this, but unless your site is of the
		 * `foo.com` format, it will probably get it wrong. It's a good idea
		 * to set this to whatever part of your domain you'd like to share
		 * bandwidth and performance measurements across.
		 * Set this to a falsy value to disable all cookies.
		 * @param {boolean} [config.strip_query_string] Whether or not to strip query strings from all URLs (e.g. `u`, `pgu`, etc.)
		 * @param {string} [config.user_ip] Despite its name, this is really a free-form
		 * string used to uniquely identify the user's current internet
		 * connection. It's used primarily by the bandwidth test to determine
		 * whether it should re-measure the user's bandwidth or just use the
		 * value stored in the cookie. You may use IPv4, IPv6 or anything else
		 * that you think can be used to identify the user's network connection.
		 * @param {function} [config.log] Logger to use. Set to `null` to disable logging.
		 * @param {function} [<plugins>] Each plugin has its own section
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		init: function(config) {
			var i, k,
			    properties = [
				    "autorun",
				    "beacon_auth_key",
				    "beacon_auth_token",
				    "beacon_with_credentials",
				    "beacon_disable_sendbeacon",
				    "beacon_url",
				    "beacon_url_force_https",
				    "beacon_type",
				    "site_domain",
				    "strip_query_string",
				    "user_ip"
			    ];


			BOOMR_check_doc_domain();

			if (!config) {
				config = {};
			}

			// ensure logging is setup properly (or null'd out for production)
			if (config.log !== undefined) {
				this.log = config.log;
			}

			if (!this.log) {
				this.log = function(/* m,l,s */) {};
			}

			if (!this.pageId) {
				// generate a random page ID for this page's lifetime
				this.pageId = BOOMR.utils.generateId(8);
				
			}

			if (config.primary && impl.handlers_attached) {
				return this;
			}

			if (typeof config.site_domain !== "undefined") {
				if (/:/.test(config.site_domain)) {
					// domains with : are not valid, fall back to the current hostname
					config.site_domain = w.location.hostname.toLowerCase();
				}

				this.session.domain = config.site_domain;
			}

			if (BOOMR.session.enabled && typeof BOOMR.session.ID === "undefined") {
				BOOMR.session.ID = BOOMR.utils.generateUUID();
			}

			// Set autorun if in config right now, as plugins that listen for page_ready
			// event may fire when they .init() if onload has already fired, and whether
			// or not we should fire page_ready depends on config.autorun.
			if (typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}


			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					// config[plugin].enabled has been set to false
					if (config[k] &&
					    config[k].hasOwnProperty("enabled") &&
					    config[k].enabled === false) {
						impl.disabled_plugins[k] = 1;

						if (typeof this.plugins[k].disable === "function") {
							this.plugins[k].disable();
						}

						continue;
					}

					// plugin was previously disabled
					if (impl.disabled_plugins[k]) {

						// and has not been explicitly re-enabled
						if (!config[k] ||
						    !config[k].hasOwnProperty("enabled") ||
						    config[k].enabled !== true) {
							continue;
						}

						if (typeof this.plugins[k].enable === "function") {
							this.plugins[k].enable();
						}

						// plugin is now enabled
						delete impl.disabled_plugins[k];
					}

					// plugin exists and has an init method
					if (typeof this.plugins[k].init === "function") {
						try {

							this.plugins[k].init(config);

						}
						catch (err) {
							BOOMR.addError(err, k + ".init");
						}
					}
				}
			}


			for (i = 0; i < properties.length; i++) {
				if (config[properties[i]] !== undefined) {
					impl[properties[i]] = config[properties[i]];
				}
			}

			// if it's the first call to init (handlers aren't attached) and we're not asked to wait OR
			// it's the second init call (handlers are attached) and we were previously waiting
			// then we set up the page ready autorun functionality
			if ((!impl.handlers_attached && !config.wait) || (impl.handlers_attached && impl.waiting_for_config)) {
				// The developer can override onload by setting autorun to false
				if (!impl.onloadfired && (impl.autorun === undefined || impl.autorun !== false)) {
					if (BOOMR.hasBrowserOnloadFired()) {
						BOOMR.loadedLate = true;
					}
					BOOMR.attach_page_ready(BOOMR.page_ready_autorun);
				}
				impl.waiting_for_config = false;
			}

			// only attach handlers once
			if (impl.handlers_attached) {

				return this;
			}

			if (config.wait) {
				impl.waiting_for_config = true;
			}

			BOOMR.attach_page_ready(function() {
				// if we're not using the loader snippet, save the onload time for
				// browsers that do not support NavigationTiming.
				// This will be later than onload if boomerang arrives late on the
				// page but it's the best we can do
				if (!BOOMR.t_onload) {
					BOOMR.t_onload = BOOMR.now();
				}
			});

			BOOMR.utils.addListener(w, "DOMContentLoaded", function() { impl.fireEvent("dom_loaded"); });

			BOOMR.fireEvent("config", config);
			BOOMR.subscribe("config", function(beaconConfig) {
				if (beaconConfig.beacon_url) {
					impl.beacon_url = beaconConfig.beacon_url;
				}
			});

			BOOMR.subscribe("spa_navigation", impl.spaNavigation, null, impl);

			(function() {
				var forms, iterator;
				if (visibilityChange !== undefined) {
					BOOMR.utils.addListener(d, visibilityChange, function() { impl.fireEvent("visibility_changed"); });

					// save the current visibility state
					impl.lastVisibilityState = BOOMR.visibilityState();

					BOOMR.subscribe("visibility_changed", function() {
						var visState = BOOMR.visibilityState();

						// record the last time each visibility state occurred
						BOOMR.lastVisibilityEvent[visState] = BOOMR.now();
						

						// if we transitioned from prerender to hidden or visible, fire the prerender_to_visible event
						if (impl.lastVisibilityState === "prerender" &&
						    visState !== "prerender") {
							// note that we transitioned from prerender on the beacon for debugging
							BOOMR.addVar("vis.pre", "1");

							// let all listeners know
							impl.fireEvent("prerender_to_visible");
						}

						impl.lastVisibilityState = visState;
					});
				}

				BOOMR.utils.addListener(d, "mouseup", impl.xb_handler("click"));

				forms = d.getElementsByTagName("form");
				for (iterator = 0; iterator < forms.length; iterator++) {
					BOOMR.utils.addListener(forms[iterator], "submit", impl.xb_handler("form_submit"));
				}

				if (!w.onpagehide && w.onpagehide !== null) {
					// This must be the last one to fire
					// We only clear w on browsers that don't support onpagehide because
					// those that do are new enough to not have memory leak problems of
					// some older browsers
					BOOMR.utils.addListener(w, "unload", function() {
						BOOMR.window = w = null;
					});
				}

				// if we were loaded in an IFRAME, try to keep track if the IFRAME was unloaded
				if (BOOMR.boomerang_frame !== BOOMR.window) {
					BOOMR.utils.addListener(BOOMR.boomerang_frame, "unload", impl.onFrameUnloaded);
				}
			}());

			impl.handlers_attached = true;


			return this;
		},

		/**
		 * Attach a callback to the `pageshow` or `onload` event if `onload` has not
		 * been fired otherwise queue it to run immediately
		 *
		 * @param {function} cb Callback to run when `onload` fires or page is visible (`pageshow`)
		 *
		 * @memberof BOOMR
		 */
		attach_page_ready: function(cb) {
			if (BOOMR.hasBrowserOnloadFired()) {
				this.setImmediate(cb, null, null, BOOMR);
			}
			else {
				// Use `pageshow` if available since it will fire even if page came from a back-forward page cache.
				// Browsers that support `pageshow` will not fire `onload` if navigation was through a back/forward button
				// and the page was retrieved from back-forward cache.
				if (w.onpagehide || w.onpagehide === null) {
					BOOMR.utils.addListener(w, "pageshow", cb);
				}
				else {
					BOOMR.utils.addListener(w, "load", cb);
				}
			}
		},

		/**
		 * Sends the `page_ready` event only if `autorun` is still true after
		 * {@link BOOMR.init} is called.
		 *
		 * @param {Event} ev Event
		 *
		 * @memberof BOOMR
		 */
		page_ready_autorun: function(ev) {
			if (impl.autorun) {
				BOOMR.page_ready(ev, true);
			}
		},

		/**
		 * Method that fires the {@link BOOMR#event:page_ready} event. Call this
		 * only if you've set `autorun` to `false` when calling the {@link BOOMR.init}
		 * method. You should call this method when you determine that your page
		 * is ready to be used by your user. This will be the end-time used in
		 * the page load time measurement. Optionally, you can pass a Unix Epoch
		 * timestamp as a parameter or set the global `BOOMR_page_ready` var that will
		 * be used as the end-time instead.
		 *
		 * @param {Event|number} [ev] Ready event or optional load event end timestamp if called manually
		 * @param {boolean} auto True if called by `page_ready_autorun`
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @example
		 * BOOMR.init({ autorun: false, ... });
		 * // wait until the page is ready, i.e. your view has loaded
		 * BOOMR.page_ready();
		 *
		 * @memberof BOOMR
		 */
		page_ready: function(ev, auto) {
			var tm_page_ready;

			// a number can be passed as the first argument if called manually which
			// will be used as the loadEventEnd time
			if (!auto && typeof ev === "number") {
				tm_page_ready = ev;
				ev = null;
			}

			if (!ev) {
				ev = w.event;
			}

			if (!ev) {
				ev = {
					name: "load"
				};
			}

			// if we were called manually or global BOOMR_page_ready was set then
			// add loadEventEnd and note this was 'pr' on the beacon
			if (!auto) {
				ev.timing = ev.timing || {};
				// use timestamp parameter or global BOOMR_page_ready if set, otherwise use
				// the current timestamp
				if (tm_page_ready) {
					ev.timing.loadEventEnd = tm_page_ready;
				}
				else if (typeof w.BOOMR_page_ready === "number") {
					ev.timing.loadEventEnd = w.BOOMR_page_ready;
				}
				else {
					ev.timing.loadEventEnd = BOOMR.now();
				}

				BOOMR.addVar("pr", 1, true);
			}
			else if (typeof w.BOOMR_page_ready === "number") {
				ev.timing = ev.timing || {};
				// the global BOOMR_page_ready will override our loadEventEnd
				ev.timing.loadEventEnd = w.BOOMR_page_ready;

				BOOMR.addVar("pr", 1, true);
			}

			if (impl.onloadfired) {
				return this;
			}

			impl.fireEvent("page_ready", ev);
			impl.onloadfired = true;
			return this;
		},

		/**
		 * Determines whether or not the page's `onload` event has fired
		 *
		 * @returns {boolean} True if page's onload was called
		 */
		hasBrowserOnloadFired: function() {
			var p = BOOMR.getPerformance();
			// if the document is `complete` then the `onload` event has already occurred, we'll fire the callback immediately.
			// When `document.write` is used to replace the contents of the page and inject boomerang, the document `readyState`
			// will go from `complete` back to `loading` and then to `complete` again. The second transition to `complete`
			// doesn't fire a second `pageshow` event in some browsers (e.g. Safari). We need to check if
			// `performance.timing.loadEventStart` or `BOOMR_onload` has occurred to detect this scenario. Will not work for
			// older Safari that doesn't have NavTiming
			return ((d.readyState && d.readyState === "complete") ||
			    (p && p.timing && p.timing.loadEventStart > 0) ||
			    w.BOOMR_onload > 0);
		},

		/**
		 * Determines whether or not the page's `onload` event has fired, or
		 * if `autorun` is false, whether {@link BOOMR.page_ready} was called.
		 *
		 * @returns {boolean} True if `onload` or {@link BOOMR.page_ready} were called
		 *
		 * @memberof BOOMR
		 */
		onloadFired: function() {
			return impl.onloadfired;
		},

		/**
		 * The callback function may return a falsy value to disconnect the observer
		 * after it returns, or a truthy value to keep watching for mutations. If
		 * the return value is numeric and greater than 0, then this will be the new timeout.
		 * If it is boolean instead, then the timeout will not fire any more so
		 * the caller MUST call disconnect() at some point
		 *
		 * @callback BOOMR~setImmediateCallback
		 * @param {object} data The passed in `data` object
		 * @param {object} cb_data The passed in `cb_data` object
		 * @param {Error} callstack An Error object that holds the callstack for
		 * when `setImmediate` was called, used to determine what called the callback
		 */

		/**
		 * Defer the function `fn` until the next instant the browser is free from
		 * user tasks.
		 *
		 * @param {BOOMR~setImmediateCallback} fn The callback function.
		 * @param {object} [data] Any data to pass to the callback function
		 * @param {object} [cb_data] Any passthrough data for the callback function.
		 * This differs from `data` when `setImmediate` is called via an event
		 * handler and `data` is the Event object
		 * @param {object} [cb_scope] The scope of the callback function if it is a method of an object
		 *
		 * @returns nothing
		 *
		 * @memberof BOOMR
		 */
		setImmediate: function(fn, data, cb_data, cb_scope) {
			var cb, cstack;


			cb = function() {
				fn.call(cb_scope || null, data, cb_data || {}, cstack);
				cb = null;
			};

			if (w.requestIdleCallback) {
				// set a timeout since rIC doesn't get called reliably in chrome headless
				w.requestIdleCallback(cb, {timeout: 1000});
			}
			else if (w.setImmediate) {
				w.setImmediate(cb);
			}
			else {
				setTimeout(cb, 10);
			}
		},

		/**
		 * Gets the current time in milliseconds since the Unix Epoch (Jan 1 1970).
		 *
		 * In browsers that support `DOMHighResTimeStamp`, this will be replaced
		 * by a function that adds `performance.now()` to `navigationStart`
		 * (with milliseconds.microseconds resolution).
		 *
		 * @function
		 *
		 * @returns {TimeStamp} Milliseconds since Unix Epoch
		 *
		 * @memberof BOOMR
		 */
		now: (function() {
			return Date.now || function() { return new Date().getTime(); };
		}()),

		/**
		 * Gets the `window.performance` object of the root window.
		 *
		 * Checks vendor prefixes for older browsers (e.g. IE9).
		 *
		 * @returns {Performance|undefined} `window.performance` if it exists
		 *
		 * @memberof BOOMR
		 */
		getPerformance: function() {
			try {
				if (BOOMR.window) {
					if ("performance" in BOOMR.window && BOOMR.window.performance) {
						return BOOMR.window.performance;
					}

					// vendor-prefixed fallbacks
					return BOOMR.window.msPerformance ||
					    BOOMR.window.webkitPerformance ||
					    BOOMR.window.mozPerformance;
				}
			}
			catch (ignore) {
				// empty
			}
		},

		/**
		 * Get high resolution delta timestamp from time origin
		 *
		 * This function needs to approximate the time since the performance timeOrigin
		 * or Navigation Timing API's `navigationStart` time.
		 * If available, `performance.now()` can provide this value.
		 * If not we either get the navigation start time from the RT plugin or
		 * from `t_lstart` or `t_start`. Those values are subtracted from the current
		 * time to derive a time since `navigationStart` value.
		 *
		 * @returns {float} Exact or approximate time since the time origin.
		 */
		hrNow: function() {
			var now, navigationStart, p = BOOMR.getPerformance();

			if (p && p.now) {
				now = p.now();
			}
			else {
				navigationStart = (BOOMR.plugins.RT && BOOMR.plugins.RT.navigationStart &&
					BOOMR.plugins.RT.navigationStart()) || BOOMR.t_lstart || BOOMR.t_start;

				// if navigationStart is undefined, we'll be returning NaN
				now = BOOMR.now() - navigationStart;
			}

			return now;
		},

		/**
		 * Gets the `document.visibilityState`, or `visible` if Page Visibility
		 * is not supported.
		 *
		 * @function
		 *
		 * @returns {string} Visibility state
		 *
		 * @memberof BOOMR
		 */
		visibilityState: (visibilityState === undefined ? function() {
			return "visible";
		} : function() {
			return d[visibilityState];
		}),

		/**
		 * An mapping of visibliity event states to the latest time they happened
		 *
		 * @type {object}
		 *
		 * @memberof BOOMR
		 */
		lastVisibilityEvent: {},

		/**
		 * Registers a Boomerang event.
		 *
		 * @param {string} e_name Event name
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		registerEvent: function(e_name) {
			if (impl.events.hasOwnProperty(e_name)) {
				// already registered
				return this;
			}

			// create a new queue of handlers
			impl.events[e_name] = [];

			return this;
		},

		/**
		 * Disables boomerang from doing anything further:
		 * 1. Clears event handlers (such as onload)
		 * 2. Clears all event listeners
		 *
		 * @memberof BOOMR
		 */
		disable: function() {
			impl.clearEvents();
			impl.clearListeners();
		},

		/**
		 * Fires a Boomerang event
		 *
		 * @param {string} e_name Event name
		 * @param {object} data Event payload
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		fireEvent: function(e_name, data) {
			return impl.fireEvent(e_name, data);
		},

		/**
		 * @callback BOOMR~subscribeCallback
		 * @param {object} eventData Event data
		 * @param {object} cb_data Callback data
		 */

		/**
		 * Subscribes to a Boomerang event
		 *
		 * @param {string} e_name Event name, i.e. {@link BOOMR#event:page_ready}.
		 * @param {BOOMR~subscribeCallback} fn Callback function
		 * @param {object} cb_data Callback data, passed as the second parameter to the callback function
		 * @param {object} cb_scope Callback scope.  If set to an object, then the
		 * callback function is called as a method of this object, and all
		 * references to `this` within the callback function will refer to `cb_scope`.
		 * @param {boolean} once Whether or not this callback should only be run once
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		subscribe: function(e_name, fn, cb_data, cb_scope, once) {
			var i, handler, ev;

			e_name = e_name.toLowerCase();


			// translate old names
			if (impl.translate_events[e_name]) {
				e_name = impl.translate_events[e_name];
			}

			if (!impl.events.hasOwnProperty(e_name)) {
				// allow subscriptions before they're registered
				impl.events[e_name] = [];
			}

			ev = impl.events[e_name];

			// don't allow a handler to be attached more than once to the same event
			for (i = 0; i < ev.length; i++) {
				handler = ev[i];
				if (handler && handler.fn === fn && handler.cb_data === cb_data && handler.scope === cb_scope) {
					return this;
				}
			}

			ev.push({
				fn: fn,
				cb_data: cb_data || {},
				scope: cb_scope || null,
				once: once || false
			});

			// attaching to page_ready after onload fires, so call soon
			if (e_name === "page_ready" && impl.onloadfired && impl.autorun) {
				this.setImmediate(fn, null, cb_data, cb_scope);
			}

			// Attach unload handlers directly to the window.onunload and
			// window.onbeforeunload events. The first of the two to fire will clear
			// fn so that the second doesn't fire. We do this because technically
			// onbeforeunload is the right event to fire, but not all browsers
			// support it.  This allows us to fall back to onunload when onbeforeunload
			// isn't implemented
			if (e_name === "page_unload" || e_name === "before_unload") {
				// Keep track of how many pagehide/unload/beforeunload handlers we're registering
				impl.unloadEventsCount++;

				(function() {
					var unload_handler, evt_idx = ev.length;

					unload_handler = function(evt) {
						if (fn) {
							fn.call(cb_scope, evt || w.event, cb_data);
						}

						// If this was the last pagehide/unload/beforeunload handler,
						// we'll try to send the beacon immediately after it is done.
						// The beacon will only be sent if one of the handlers has queued it.
						if (++impl.unloadEventCalled === impl.unloadEventsCount) {
							BOOMR.real_sendBeacon();
						}
					};

					if (e_name === "page_unload") {
						// pagehide is for iOS devices
						// see http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
						if (w.onpagehide || w.onpagehide === null) {
							BOOMR.utils.addListener(w, "pagehide", unload_handler);
						}
						else {
							BOOMR.utils.addListener(w, "unload", unload_handler);
						}
					}
					BOOMR.utils.addListener(w, "beforeunload", unload_handler);
				}());
			}

			return this;
		},

		/**
		 * Logs an internal Boomerang error.
		 *
		 * If the {@link BOOMR.plugins.Errors} plugin is enabled, this data will
		 * be compressed on the `err` beacon parameter.  If not, it will be included
		 * in uncompressed form on the `errors` parameter.
		 *
		 * @param {string|object} err Error
		 * @param {string} [src] Source
		 * @param {object} [extra] Extra data
		 *
		 * @memberof BOOMR
		 */
		addError: function BOOMR_addError(err, src, extra) {
			var str, E = BOOMR.plugins.Errors;


			BOOMR.error("Boomerang caught error: " + err + ", src: " + src + ", extra: " + extra);

			//
			// Use the Errors plugin if it's enabled
			//
			if (E && E.is_supported()) {
				if (typeof err === "string") {
					E.send({
						message: err,
						extra: extra,
						functionName: src,
						noStack: true
					}, E.VIA_APP, E.SOURCE_BOOMERANG);
				}
				else {
					if (typeof src === "string") {
						err.functionName = src;
					}

					if (typeof extra !== "undefined") {
						err.extra = extra;
					}

					E.send(err, E.VIA_APP, E.SOURCE_BOOMERANG);
				}

				return;
			}

			if (typeof err !== "string") {
				str = String(err);
				if (str.match(/^\[object/)) {
					str = err.name + ": " + (err.description || err.message).replace(/\r\n$/, "");
				}
				err = str;
			}
			if (src !== undefined) {
				err = "[" + src + ":" + BOOMR.now() + "] " + err;
			}
			if (extra) {
				err += ":: " + extra;
			}

			if (impl.errors[err]) {
				impl.errors[err]++;
			}
			else {
				impl.errors[err] = 1;
			}
		},

		/**
		 * Determines if the specified Error is a Cross-Origin error.
		 *
		 * @param {string|object} err Error
		 *
		 * @returns {boolean} True if the Error is a Cross-Origin error.
		 *
		 * @memberof BOOMR
		 */
		isCrossOriginError: function(err) {
			// These are expected for cross-origin iframe access.
			// For IE and Edge, we'll also check the error number for non-English browsers
			return err.name === "SecurityError" ||
				(err.name === "TypeError" && err.message === "Permission denied") ||
				(err.name === "Error" && err.message && err.message.match(/^(Permission|Access is) denied/)) ||
				err.number === -2146828218;  // IE/Edge error number for "Permission Denied"
		},

		/**
		 * Add one or more parameters to the beacon.
		 *
		 * This method may either be called with a single object containing
		 * key/value pairs, or with two parameters, the first is the variable
		 * name and the second is its value.
		 *
		 * All names should be strings usable in a URL's query string.
		 *
		 * We recommend only using alphanumeric characters and underscores, but you
		 * can use anything you like.
		 *
		 * Values should be strings (or numbers), and have the same restrictions
		 * as names.
		 *
		 * Parameters will be on all subsequent beacons unless `singleBeacon` is
		 * set. Early beacons will not clear vars that were set with `singleBeacon`.
		 *
		 * @param {string} name Variable name
		 * @param {string|object} val Value
		 * @param {boolean} singleBeacon Whether or not to add to a single beacon
		 * or all beacons.
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @example
		 * BOOMR.addVar("page_id", 123);
		 * BOOMR.addVar({"page_id": 123, "user_id": "Person1"});
		 *
		 * @memberof BOOMR
		 */
		 addVar: function(name, value, singleBeacon) {

			if (typeof name === "string") {
				impl.vars[name] = value;

				if (singleBeacon) {
					impl.singleBeaconVars[name] = 1;
				}
			}
			else if (typeof name === "object") {
				var o = name, k;
				for (k in o) {
					if (o.hasOwnProperty(k)) {
						impl.vars[k] = o[k];

						// remove after the first beacon
						if (singleBeacon) {
							impl.singleBeaconVars[k] = 1;
						}
					}
				}
			}

			return this;
		},

		/**
		 * Appends data to a beacon.
		 *
		 * If the value already exists, a comma is added and the new data is applied.
		 *
		 * @param {string} name Variable name
		 * @param {string} val Value
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		appendVar: function(name, value) {
			var existing = BOOMR.getVar(name) || "";
			if (existing) {
				existing += ",";
			}

			BOOMR.addVar(name, existing + value);

			return this;
		},

		/**
		 * Removes one or more variables from the beacon URL. This is useful within
		 * a plugin to reset the values of parameters that it is about to set.
		 *
		 * Plugins can also use this in the {@link BOOMR#event:beacon} event to clear
		 * any variables that should only live on a single beacon.
		 *
		 * This method accepts either a list of variable names, or a single
		 * array containing a list of variable names.
		 *
		 * @param {string[]|string} name Variable name or list
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		removeVar: function(arg0) {
			var i, params;
			if (!arguments.length) {
				return this;
			}

			if (arguments.length === 1 && BOOMR.utils.isArray(arg0)) {
				params = arg0;
			}
			else {
				params = arguments;
			}

			for (i = 0; i < params.length; i++) {
				if (impl.vars.hasOwnProperty(params[i])) {
					delete impl.vars[params[i]];
				}
			}

			return this;
		},

		/**
		 * Determines whether or not the beacon has the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {boolean} True if the variable is set.
		 *
		 * @memberof BOOMR
		 */
		hasVar: function(name) {
			return impl.vars.hasOwnProperty(name);
		},

		/**
		 * Gets the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {object|undefined} Variable, or undefined if it isn't set
		 *
		 * @memberof BOOMR
		 */
		getVar: function(name) {
			return impl.vars[name];
		},

		/**
		 * Sets a variable's priority in the beacon URL.
		 * -1 = beginning of the URL
		 * 0  = middle of the URL (default)
		 * 1  = end of the URL
		 *
		 * @param {string} name Variable name
		 * @param {number} pri Priority (-1 or 1)
		 *
		 * @returns {BOOMR} Boomerang object
		 *
		 * @memberof BOOMR
		 */
		setVarPriority: function(name, pri) {
			if (typeof pri !== "number" || Math.abs(pri) !== 1) {
				return this;
			}

			impl.varPriority[pri][name] = 1;

			return this;
		},

		/**
		 * Sets the Referrers variable.
		 *
		 * @param {string} r Referrer from the document.referrer
		 *
		 * @memberof BOOMR
		 */
		setReferrer: function(r) {
			// document.referrer
			impl.r = r;
		},

		/**
		 * Starts a timer for a dynamic request.
		 *
		 * Once the named request has completed, call `loaded()` to send a beacon
		 * with the duration.
		 *
		 * @example
		 * var timer = BOOMR.requestStart("my-timer");
		 * // do stuff
		 * timer.loaded();
		 *
		 * @param {string} name Timer name
		 *
		 * @returns {object} An object with a `.loaded()` function that you can call
		 *     when the dynamic timer is complete.
		 *
		 * @memberof BOOMR
		 */
		requestStart: function(name) {
			var t_start = BOOMR.now();
			BOOMR.plugins.RT.startTimer("xhr_" + name, t_start);

			return {
				loaded: function(data) {
					BOOMR.responseEnd(name, t_start, data);
				}
			};
		},

		/**
		 * Determines if Boomerang can send a beacon.
		 *
		 * Queryies all plugins to see if they implement `readyToSend()`,
		 * and if so, that they return `true`.
		 *
		 * If not, the beacon cannot be sent.
		 *
		 * @returns {boolean} True if Boomerang can send a beacon
		 *
		 * @memberof BOOMR
		 */
		readyToSend: function() {
			var plugin;

			for (plugin in this.plugins) {
				if (this.plugins.hasOwnProperty(plugin)) {
					if (impl.disabled_plugins[plugin]) {
						continue;
					}

					if (typeof this.plugins[plugin].readyToSend === "function" &&
					    this.plugins[plugin].readyToSend() === false) {
						
						return false;
					}
				}
			}

			return true;
		},

		/**
		 * Sends a beacon for a dynamic request.
		 *
		 * @param {string|object} name Timer name or timer object data.
		 * @param {string} [name.initiator] Initiator, such as `xhr` or `spa`
		 * @param {string} [name.url] URL of the request
		 * @param {TimeStamp} t_start Start time
		 * @param {object} data Request data
		 * @param {TimeStamp} t_end End time
		 *
		 * @memberof BOOMR
		 */
		responseEnd: function(name, t_start, data, t_end) {
			// take the now timestamp for start and end, if unspecified, in case we delay this beacon
			t_start = typeof t_start === "number" ? t_start : BOOMR.now();
			t_end = typeof t_end === "number" ? t_end : BOOMR.now();

			// wait until all plugins are ready to send
			if (!BOOMR.readyToSend()) {
				

				// try again later
				setTimeout(function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, 1000);

				return;
			}

			// Wait until we've sent the Page Load beacon first
			if (!BOOMR.hasSentPageLoadBeacon() &&
			    !BOOMR.utils.inArray(name.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
				// wait for a beacon, then try again
				BOOMR.subscribe("page_load_beacon", function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, null, BOOMR, true);

				return;
			}

			// Ensure we don't have two beacons trying to send data at the same time
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				BOOMR.subscribe("beacon", function() {
					BOOMR.responseEnd(name, t_start, data, t_end);
				}, null, BOOMR, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			if (typeof name === "object") {
				if (!name.url) {
					
					return;
				}

				impl.fireEvent("xhr_load", name);
			}
			else {
				// flush out any queue'd beacons before we set the Page Group
				// and timers
				BOOMR.real_sendBeacon();

				BOOMR.addVar("xhr.pg", name, true);

				BOOMR.plugins.RT.startTimer("xhr_" + name, t_start);

				impl.fireEvent("xhr_load", {
					name: "xhr_" + name,
					data: data,
					timing: {
						loadEventEnd: t_end
					}
				});
			}
		},

		//
		// uninstrumentXHR, instrumentXHR, uninstrumentFetch and instrumentFetch
		// are stubs that will be replaced by auto-xhr.js if active.
		//
		/**
		 * Undo XMLHttpRequest instrumentation and reset the original `XMLHttpRequest`
		 * object
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		uninstrumentXHR: function() { },

		/**
		 * Instrument all requests made via XMLHttpRequest to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		instrumentXHR: function() { },

		/**
		 * Undo fetch instrumentation and reset the original `fetch`
		 * function
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		uninstrumentFetch: function() { },

		/**
		 * Instrument all requests made via fetch to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link BOOMR.plugins.AutoXHR}.
		 *
		 * @memberof BOOMR
		 */
		instrumentFetch: function() { },

		/**
		 * Request boomerang to send its beacon with all queued beacon data
		 * (via {@link BOOMR.addVar}).
		 *
		 * Boomerang may ignore this request.
		 *
		 * When this method is called, boomerang checks all plugins. If any
		 * plugin has not completed its checks (ie, the plugin's `is_complete()`
		 * method returns `false`, then this method does nothing.
		 *
		 * If all plugins have completed, then this method fires the
		 * {@link BOOMR#event:before_beacon} event with all variables that will be
		 * sent on the beacon.
		 *
		 * After all {@link BOOMR#event:before_beacon} handlers return, this method
		 * checks if a `beacon_url` has been configured and if there are any
		 * beacon parameters to be sent. If both are true, it fires the beacon.
		 *
		 * The {@link BOOMR#event:beacon} event is then fired.
		 *
		 * `sendBeacon()` should be called any time a plugin goes from
		 * `is_complete() = false` to `is_complete = true` so the beacon is
		 * sent.
		 *
		 * The actual beaconing is handled in {@link BOOMR.real_sendBeacon} after
		 * a short delay (via {@link BOOMR.setImmediate}).  If other calls to
		 * `sendBeacon` happen before {@link BOOMR.real_sendBeacon} is called,
		 * those calls will be discarded (so it's OK to call this in quick
		 * succession).
		 *
		 * @param {string} [beacon_url_override] Beacon URL override
		 *
		 * @memberof BOOMR
		 */
		sendBeacon: function(beacon_url_override) {
			// This plugin wants the beacon to go somewhere else,
			// so update the location
			if (beacon_url_override) {
				impl.beacon_url_override = beacon_url_override;
			}

			if (!impl.beaconQueued) {
				impl.beaconQueued = true;
				BOOMR.setImmediate(BOOMR.real_sendBeacon, null, null, BOOMR);
			}

			return true;
		},

		/**
		 * Sends a beacon when the beacon queue is empty.
		 *
		 * @param {object} params Beacon parameters to set
		 * @param {function} callback Callback to run when the queue is ready
		 * @param {object} that Function to apply callback to
		 */
		sendBeaconWhenReady: function(params, callback, that) {
			// If we're already sending a beacon, wait until the queue is empty
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				BOOMR.subscribe("beacon", function() {
					BOOMR.sendBeaconWhenReady(params, callback, that);
				}, null, BOOMR, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			// add all parameters
			for (var paramName in params) {
				if (params.hasOwnProperty(paramName)) {
					// add this data to a single beacon
					BOOMR.addVar(paramName, params[paramName], true);
				}
			}

			// run the callback
			if (typeof callback === "function" && typeof that !== "undefined") {
				callback.apply(that);
			}

			// send the beacon
			BOOMR.sendBeacon();
		},

		/**
		 * Sends all beacon data.
		 *
		 * This function should be called directly any time a "new" beacon is about
		 * to be constructed.  For example, if you're creating a new XHR or other
		 * custom beacon, you should ensure the existing beacon data is flushed
		 * by calling `BOOMR.real_sendBeacon();` first.
		 *
		 * @memberof BOOMR
		 */
		real_sendBeacon: function() {
			var k, form, url, errors = [], params = [], paramsJoined, varsSent = {}, _if;

			if (!impl.beaconQueued) {
				return false;
			}


			impl.beaconQueued = false;

			

			// At this point someone is ready to send the beacon.  We send
			// the beacon only if all plugins have finished doing what they
			// wanted to do
			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					if (impl.disabled_plugins[k]) {
						continue;
					}
					if (!this.plugins[k].is_complete(impl.vars)) {
						
						return false;
					}
				}
			}

			// Sanity test that the browser is still available (and not shutting down)
			if (!window || !window.Image || !window.navigator || !BOOMR.window) {
				
				return false;
			}

			// For SPA apps, don't strip hashtags as some SPA frameworks use #s for tracking routes
			// instead of History pushState() APIs. Use d.URL instead of location.href because of a
			// Safari bug.
			var isSPA = BOOMR.utils.inArray(impl.vars["http.initiator"], BOOMR.constants.BEACON_TYPE_SPAS);
			var isPageLoad = typeof impl.vars["http.initiator"] === "undefined" || isSPA;

			if (!impl.vars.pgu) {
				impl.vars.pgu = isSPA ? d.URL : d.URL.replace(/#.*/, "");
			}
			impl.vars.pgu = BOOMR.utils.cleanupURL(impl.vars.pgu);

			// Use the current document.URL if it hasn't already been set, or for SPA apps,
			// on each new beacon (since each SPA soft navigation might change the URL)
			if (!impl.vars.u || isSPA) {
				impl.vars.u = impl.vars.pgu;
			}

			if (impl.vars.pgu === impl.vars.u) {
				delete impl.vars.pgu;
			}

			// Add cleaned-up referrer URLs to the beacon, if available
			if (impl.r) {
				impl.vars.r = BOOMR.utils.cleanupURL(impl.r);
			}
			else {
				delete impl.vars.r;
			}

			impl.vars.v = BOOMR.version;

			// Snippet version, if available
			if (BOOMR.snippetVersion) {
				impl.vars.sv = BOOMR.snippetVersion;
			}

			// Snippet method is IFRAME if not specified (pre-v12 snippets)
			impl.vars.sm = BOOMR.snippetMethod || "i";

			if (BOOMR.session.enabled) {
				impl.vars["rt.si"] = BOOMR.session.ID + "-" + Math.round(BOOMR.session.start / 1000).toString(36);
				impl.vars["rt.ss"] = BOOMR.session.start;
				impl.vars["rt.sl"] = BOOMR.session.length;
			}
			else {
				BOOMR.removeVar("rt.si", "rt.ss", "rt.sl");
			}

			if (BOOMR.visibilityState()) {
				impl.vars["vis.st"] = BOOMR.visibilityState();
				if (BOOMR.lastVisibilityEvent.visible) {
					impl.vars["vis.lv"] = BOOMR.now() - BOOMR.lastVisibilityEvent.visible;
				}
				if (BOOMR.lastVisibilityEvent.hidden) {
					impl.vars["vis.lh"] = BOOMR.now() - BOOMR.lastVisibilityEvent.hidden;
				}
			}

			impl.vars["ua.plt"] = navigator.platform;
			impl.vars["ua.vnd"] = navigator.vendor;

			if (this.pageId) {
				impl.vars.pid = this.pageId;
			}

			// add beacon number
			impl.vars.n = ++this.beaconsSent;

			if (w !== window) {
				_if = "if";  // work around uglifyJS minification that breaks in IE8 and quirks mode
				impl.vars[_if] = "";
			}

			for (k in impl.errors) {
				if (impl.errors.hasOwnProperty(k)) {
					errors.push(k + (impl.errors[k] > 1 ? " (*" + impl.errors[k] + ")" : ""));
				}
			}

			if (errors.length > 0) {
				impl.vars.errors = errors.join("\n");
			}

			impl.errors = {};

			// If we reach here, all plugins have completed
			impl.fireEvent("before_beacon", impl.vars);

			// clone the vars object for two reasons: first, so all listeners of
			// 'beacon' get an exact clone (in case listeners are doing
			// BOOMR.removeVar), and second, to help build our priority list of vars.
			for (k in impl.vars) {
				if (impl.vars.hasOwnProperty(k)) {
					varsSent[k] = impl.vars[k];
				}
			}

			BOOMR.removeVar(["qt", "pgu"]);

			if (typeof impl.vars.early === "undefined") {
				// remove any vars that should only be on a single beacon.
				// Early beacons don't clear vars even if flagged as `singleBeacon` so
				// that they can be re-sent on the next normal beacon
				for (var singleVarName in impl.singleBeaconVars) {
					if (impl.singleBeaconVars.hasOwnProperty(singleVarName)) {
						BOOMR.removeVar(singleVarName);
					}
				}

				// clear single beacon vars list
				impl.singleBeaconVars = {};

				// keep track of page load beacons
				if (!impl.hasSentPageLoadBeacon && isPageLoad) {
					impl.hasSentPageLoadBeacon = true;

					// let this beacon go out first
					BOOMR.setImmediate(function() {
						impl.fireEvent("page_load_beacon", varsSent);
					});
				}
			}

			// Stop at this point if we are rate limited
			if (BOOMR.session.rate_limited) {
				
				return false;
			}

			// mark that we're no longer sending a beacon now, as those
			// paying attention to this will trigger at the beacon event
			impl.beaconInQueue = false;

			// send the beacon data
			BOOMR.sendBeaconData(varsSent);


			return true;
		},

		/**
		 * Determines whether or not a Page Load beacon has been sent.
		 *
		 * @returns {boolean} True if a Page Load beacon has been sent.
		 */
		hasSentPageLoadBeacon: function() {
			return impl.hasSentPageLoadBeacon;
		},

		/**
		 * Sends beacon data via the Beacon API, XHR or Image
		 *
		 * @param {object} data Data
		 */
		sendBeaconData: function(data) {
			var urlFirst = [], urlLast = [], params, paramsJoined,
			    url, img, useImg = true, xhr, ret;

			

			// Use the override URL if given
			impl.beacon_url = impl.beacon_url_override || impl.beacon_url;

			// Check that the beacon_url was set first
			if (!impl.beacon_url) {
				
				return false;
			}

			if (!impl.beaconUrlAllowed(impl.beacon_url)) {
				
				return false;
			}

			// Check that we have data to send
			if (BOOMR.utils.isObjectEmpty(data)) {
				return false;
			}

			// If we reach here, we've figured out all of the beacon data we'll send.
			impl.fireEvent("beacon", data);

			// get high- and low-priority variables first, which remove any of
			// those vars from data
			urlFirst = this.getVarsOfPriority(data, -1);
			urlLast  = this.getVarsOfPriority(data, 1);

			// merge the 3 lists
			params = urlFirst.concat(this.getVarsOfPriority(data, 0), urlLast);
			paramsJoined = params.join("&");

			// If beacon_url is protocol relative, make it https only
			if (impl.beacon_url_force_https && impl.beacon_url.match(/^\/\//)) {
				impl.beacon_url = "https:" + impl.beacon_url;
			}

			// if there are already url parameters in the beacon url,
			// change the first parameter prefix for the boomerang url parameters to &
			url = impl.beacon_url + ((impl.beacon_url.indexOf("?") > -1) ? "&" : "?") + paramsJoined;

			//
			// Try to send an IMG beacon if possible (which is the most compatible),
			// otherwise send an XHR beacon if the  URL length is longer than 2,000 bytes.
			//
			if (impl.beacon_type === "GET") {
				useImg = true;

				if (url.length > BOOMR.constants.MAX_GET_LENGTH) {
					((window.console && (console.warn || console.log)) || function() {})("Boomerang: Warning: Beacon may not be sent via GET due to payload size > 2000 bytes");
				}
			}
			else if (impl.beacon_type === "POST" || url.length > BOOMR.constants.MAX_GET_LENGTH) {
				// switch to a XHR beacon if the the user has specified a POST OR GET length is too long
				useImg = false;
			}

			//
			// Try the sendBeacon API first.
			// But if beacon_type is set to "GET", dont attempt
			// sendBeacon API call
			//
			if (w && w.navigator &&
			    typeof w.navigator.sendBeacon === "function" &&
			    BOOMR.utils.isNative(w.navigator.sendBeacon) &&
			    typeof w.Blob === "function" &&
			    impl.beacon_type !== "GET" &&
			    // As per W3C, The sendBeacon method does not provide ability to pass any
			    // header other than 'Content-Type'. So if we need to send data with
			    // 'Authorization' header, we need to fallback to good old xhr.
			    typeof impl.beacon_auth_token === "undefined" &&
			    !impl.beacon_disable_sendbeacon) {
				// note we're using sendBeacon with &sb=1
				var blobData = new w.Blob([paramsJoined + "&sb=1"], {
					type: "application/x-www-form-urlencoded"
				});

				if (w.navigator.sendBeacon(impl.beacon_url, blobData)) {
					return true;
				}

				// sendBeacon was not successful, try Image or XHR beacons
			}

			// If we don't have XHR available, force an image beacon and hope
			// for the best
			if (!BOOMR.orig_XMLHttpRequest && (!w || !w.XMLHttpRequest)) {
				useImg = true;
			}

			if (useImg) {
				//
				// Image beacon
				//

				// just in case Image isn't a valid constructor
				try {
					img = new Image();
				}
				catch (e) {
					
					return false;
				}

				img.src = url;
			}
			else {
				//
				// XHR beacon
				//

				// Send a form-encoded XHR POST beacon
				xhr = new (BOOMR.window.orig_XMLHttpRequest || BOOMR.orig_XMLHttpRequest || BOOMR.window.XMLHttpRequest)();
				try {
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
				catch (e) {
					// if we had an exception with the window XHR object, try our IFRAME XHR
					xhr = new BOOMR.boomerang_frame.XMLHttpRequest();
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
			}

			return true;
		},

		/**
		 * Determines whether or not a Page Load beacon has been sent.
		 *
		 * @returns {boolean} True if a Page Load beacon has been sent.
		 *
		 * @memberof BOOMR
		 */
		hasSentPageLoadBeacon: function() {
			return impl.hasSentPageLoadBeacon;
		},

		/**
		 * Sends a beacon via XMLHttpRequest
		 *
		 * @param {object} xhr XMLHttpRequest object
		 * @param {object} [paramsJoined] XMLHttpRequest.send() argument
		 *
		 * @memberof BOOMR
		 */
		sendXhrPostBeacon: function(xhr, paramsJoined) {
			xhr.open("POST", impl.beacon_url);

			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			if (typeof impl.beacon_auth_token !== "undefined") {
				if (typeof impl.beacon_auth_key === "undefined") {
					impl.beacon_auth_key = "Authorization";
				}

				xhr.setRequestHeader(impl.beacon_auth_key, impl.beacon_auth_token);
			}

			if (impl.beacon_with_credentials) {
				xhr.withCredentials = true;
			}

			xhr.send(paramsJoined);
		},

		/**
		 * Gets all variables of the specified priority
		 *
		 * @param {object} vars Variables (will be modified for pri -1 and 1)
		 * @param {number} pri Priority (-1, 0, or 1)
		 *
		 * @return {string[]} Array of URI-encoded vars
		 *
		 * @memberof BOOMR
		 */
		getVarsOfPriority: function(vars, pri) {
			var name, url = [],
			    // if we were given a priority, iterate over that list
			    // else iterate over vars
			    iterVars = (pri !== 0 ? impl.varPriority[pri] : vars);

			for (name in iterVars) {
				// if this var is set, add it to our URL array
				if (iterVars.hasOwnProperty(name) && vars.hasOwnProperty(name)) {
					url.push(this.getUriEncodedVar(name, typeof vars[name] === "undefined" ? "" : vars[name]));

					// remove this name from vars so it isn't also added
					// to the non-prioritized list when pri=0 is called
					if (pri !== 0) {
						delete vars[name];
					}
				}
			}

			return url;
		},

		/**
		 * Gets a URI-encoded name/value pair.
		 *
		 * @param {string} name Name
		 * @param {string} value Value
		 *
		 * @returns {string} URI-encoded string
		 *
		 * @memberof BOOMR
		 */
		getUriEncodedVar: function(name, value) {
			if (value === undefined || value === null) {
				value = "";
			}

			if (typeof value === "object") {
				value = BOOMR.utils.serializeForUrl(value);
			}

			var result = encodeURIComponent(name) +
				"=" + encodeURIComponent(value);

			return result;
		},

		/**
		 * Gets the latest ResourceTiming entry for the specified URL.
		 *
		 * Default sort order is chronological startTime.
		 *
		 * @param {string} url Resource URL
		 * @param {function} [sort] Sort the entries before returning the last one
		 * @param {function} [filter] Filter the entries. Will be applied before sorting
		 *
		 * @returns {PerformanceEntry|undefined} Entry, or undefined if ResourceTiming is not
		 *  supported or if the entry doesn't exist
		 *
		 * @memberof BOOMR
		 */
		getResourceTiming: function(url, sort, filter) {
			var entries, p = BOOMR.getPerformance();

			try {
				if (p && typeof p.getEntriesByName === "function") {
					entries = p.getEntriesByName(url);
					if (!entries || !entries.length) {
						return;
					}
					if (typeof filter === "function") {
						entries = BOOMR.utils.arrayFilter(entries, filter);
						if (!entries || !entries.length) {
							return;
						}
					}
					if (entries.length > 1 && typeof sort === "function") {
						entries.sort(sort);
					}
					return entries[entries.length - 1];
				}
			}
			catch (e) {
				BOOMR.warn("getResourceTiming:" + e);
			}
		}

	};

	// if not already set already on BOOMR, determine the URL
	if (!BOOMR.url) {
		boomr.url = boomr.utils.getMyURL();
	}
	else {
		// canonicalize the URL
		var a = BOOMR.window.document.createElement("a");
		a.href = BOOMR.url;
		boomr.url = a.href;
	}

	delete BOOMR_start;

	/**
	 * @global
	 * @type {TimeStamp}
	 * @name BOOMR_lstart
	 * @desc
	 * Time the loader script started fetching boomerang.js (if the asynchronous
	 * loader snippet is used).
	 */
	if (typeof BOOMR_lstart === "number") {
		/**
		 * Time the loader script started fetching boomerang.js (if using the
		 * asynchronous loader snippet) (`BOOMR_lstart`)
		 * @type {TimeStamp}
		 *
		 * @memberof BOOMR
		 */
		boomr.t_lstart = BOOMR_lstart;
		delete BOOMR_lstart;
	}
	else if (typeof BOOMR.window.BOOMR_lstart === "number") {
		boomr.t_lstart = BOOMR.window.BOOMR_lstart;
	}

	/**
	 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
	 *
	 * This timestamp is logged in the case boomerang.js loads after the onload event
	 * for browsers that don't support NavigationTiming.
	 *
	 * @global
	 * @name BOOMR_onload
	 * @type {TimeStamp}
	 */
	if (typeof BOOMR.window.BOOMR_onload === "number") {
		/**
		 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
		 *
		 * This timestamp is logged in the case boomerang.js loads after the onload event
		 * for browsers that don't support NavigationTiming.
		 *
		 * @type {TimeStamp}
		 * @memberof BOOMR
		 */
		boomr.t_onload = BOOMR.window.BOOMR_onload;
	}

	(function() {
		var make_logger;

		if (typeof console === "object" && console.log !== undefined) {
			/**
			 * Logs the message to the console
			 *
			 * @param {string} m Message
			 * @param {string} l Log level
			 * @param {string} [s] Source
			 *
			 * @function log
			 *
			 * @memberof BOOMR
			 */
			boomr.log = function(m, l, s) {
				console.log("(" + BOOMR.now() + ") " +
					"{" + BOOMR.pageId + "}" +
					": " + s +
					": [" + l + "] " +
					m);
			};
		}
		else {
			// NOP for browsers that don't support it
			boomr.log = function() {};
		}

		make_logger = function(l) {
			return function(m, s) {
				this.log(m, l, "boomerang" + (s ? "." + s : ""));
				return this;
			};
		};

		/**
		 * Logs debug messages to the console
		 *
		 * Debug messages are stripped out of production builds.
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function debug
		 *
		 * @memberof BOOMR
		 */
		boomr.debug = make_logger("debug");

		/**
		 * Logs info messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function info
		 *
		 * @memberof BOOMR
		 */
		boomr.info = make_logger("info");

		/**
		 * Logs warning messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function warn
		 *
		 * @memberof BOOMR
		 */
		boomr.warn = make_logger("warn");

		/**
		 * Logs error messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function error
		 *
		 * @memberof BOOMR
		 */
		boomr.error = make_logger("error");
	}());

	// If the browser supports performance.now(), swap that in for BOOMR.now
	try {
		var p = boomr.getPerformance();
		if (p &&
		    typeof p.now === "function" &&
		    // #545 handle bogus performance.now from broken shims
		    /\[native code\]/.test(String(p.now)) &&
		    p.timing &&
		    p.timing.navigationStart) {
			boomr.now = function() {
				return Math.round(p.now() + p.timing.navigationStart);
			};
		}
	}
	catch (ignore) {
		// empty
	}

	impl.checkLocalStorageSupport();

	(function() {
		var ident;
		for (ident in boomr) {
			if (boomr.hasOwnProperty(ident)) {
				BOOMR[ident] = boomr[ident];
			}
		}

		if (!BOOMR.xhr_excludes) {
			/**
			 * URLs to exclude from automatic `XMLHttpRequest` instrumentation.
			 *
			 * You can put any of the following in it:
			 * * A full URL
			 * * A hostname
			 * * A path
			 *
			 * @example
			 * 
			 * BOOMR.xhr_excludes = {
			 *   "mysite.com": true,
			 *   "/dashboard/": true,
			 *   "https://mysite.com/dashboard/": true
			 * };
			 *
			 * @memberof BOOMR
			 */
			BOOMR.xhr_excludes = {};
		}
	}());


	dispatchEvent("onBoomerangLoaded", { "BOOMR": BOOMR }, true);

}(window));


// end of boomerang beaconing section

// Adding Resource timing decompression module
//
// resourcetiming-decompression.js
//
// Decompresses ResourceTiming data compressed via resourcetiming-compression.js.
//
// See http://nicj.net/compressing-resourcetiming/
//
// https://github.com/nicjansma/resourcetiming-compression.js
//
(function(window) {
    "use strict";

    // save old ResourceTimingDecompression object for noConflict()
    var root;
    var previousObj;
    if (typeof window !== "undefined") {
        root = window;
        previousObj = root.ResourceTimingDecompression;
    }

    // model
    var ResourceTimingDecompression = {};

    //
    // Constants / Config
    //

    /**
     * Are hostnames in the compressed trie reversed or not
     */
    ResourceTimingDecompression.HOSTNAMES_REVERSED = true;

    /**
     * Initiator type map
     */
    ResourceTimingDecompression.INITIATOR_TYPES = {
        /** Unknown type */
        "other": 0,
        /** IMG element */
        "img": 1,
        /** LINK element (i.e. CSS) */
        "link": 2,
        /** SCRIPT element */
        "script": 3,
        /** Resource referenced in CSS */
        "css": 4,
        /** XMLHttpRequest */
        "xmlhttprequest": 5,
        /** The root HTML page itself */
        "html": 6,
        /** IMAGE element inside a SVG */
        "image": 7,
        /** [sendBeacon]{@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon} */
        "beacon": 8,
        /** [Fetch API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} */
        "fetch": 9,
        /** An IFRAME */
        "iframe": "a",
        /** IE11 and Edge (some versions) send "subdocument" instead of "iframe" */
        "subdocument": "a",
        /** BODY element */
        "body": "b",
        /** INPUT element */
        "input": "c",
        /** FRAME element */
        "frame": "a",
        /** OBJECT element */
        "object": "d",
        /** VIDEO element */
        "video": "e",
        /** AUDIO element */
        "audio": "f",
        /** SOURCE element */
        "source": "g",
        /** TRACK element */
        "track": "h",
        /** EMBED element */
        "embed": "i",
        /** EventSource */
        "eventsource": "j",
        /** The root HTML page itself */
        "navigation": 6
    };

    /**
    * Dimension name map
    */
    ResourceTimingDecompression.DIMENSION_NAMES = {
        "height": 0,
        "width": 1,
        "y": 2,
        "x": 3,
        "naturalHeight": 4,
        "naturalWidth": 5
    };

    /**
     * Script mask map
     */
    ResourceTimingDecompression.SCRIPT_ATTRIBUTES = {
        "scriptAsync": 0x1,
        "scriptDefer": 0x2,
        "scriptBody": 0x4
    };

    /**
     * These are the only `rel` types that might be reference-able from
     * ResourceTiming.
     *
     * https://html.spec.whatwg.org/multipage/links.html#linkTypes
     *
     * @enum {number}
     */
    ResourceTimingDecompression.REL_TYPES = {
        "prefetch": 1,
        "preload": 2,
        "prerender": 3,
        "stylesheet": 4
    };

    /**
     * Returns a map with key/value pairs reversed.
     *
     * @param {object} origMap Map we want to reverse.
     *
     * @returns {object} New map with reversed mappings.
     */
    ResourceTimingDecompression.getRevMap = function(origMap) {
        var revMap = {};
        for (var key in origMap) {
            if (origMap.hasOwnProperty(key)) {
                revMap[origMap[key]] = key;
            }
        }
        return revMap;
    };

    /**
     * Reverse initiator type map
     */
    ResourceTimingDecompression.REV_INITIATOR_TYPES = ResourceTimingDecompression.
        getRevMap(ResourceTimingDecompression.INITIATOR_TYPES);

    /**
     * Reverse dimension name map
     */
    ResourceTimingDecompression.REV_DIMENSION_NAMES = ResourceTimingDecompression.
        getRevMap(ResourceTimingDecompression.DIMENSION_NAMES);

    /**
     * Reverse script attribute map
     */
    ResourceTimingDecompression.REV_SCRIPT_ATTRIBUTES = ResourceTimingDecompression.
        getRevMap(ResourceTimingDecompression.SCRIPT_ATTRIBUTES);

    /**
     * Reverse link rel attribute map
     */
    ResourceTimingDecompression.REV_REL_TYPES = ResourceTimingDecompression.
        getRevMap(ResourceTimingDecompression.REL_TYPES);

    // Any ResourceTiming data time that starts with this character is not a time,
    // but something else (like dimension data)
    ResourceTimingDecompression.SPECIAL_DATA_PREFIX = "*";

    // Dimension data special type
    ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_TYPE = "0";
    ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_PREFIX = ResourceTimingDecompression.SPECIAL_DATA_PREFIX +
        ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_TYPE;

    // Dimension data special type
    ResourceTimingDecompression.SPECIAL_DATA_SIZE_TYPE = "1";

    // Dimension data special type
    ResourceTimingDecompression.SPECIAL_DATA_SCRIPT_TYPE = "2";

    // Dimension data special type
    ResourceTimingDecompression.SPECIAL_DATA_SERVERTIMING_TYPE = "3";

    // Link attributes
    ResourceTimingDecompression.SPECIAL_DATA_LINK_ATTR_TYPE = "4";

    // Namespaced data
    ResourceTimingDecompression.SPECIAL_DATA_NAMESPACED_TYPE = "5";

    // Service worker type
    ResourceTimingDecompression.SPECIAL_DATA_SERVICE_WORKER_TYPE = "6";

    // Regular Expression to parse a URL
    ResourceTimingDecompression.HOSTNAME_REGEX = /^(https?:\/\/)([^/]+)(.*)/;

    //
    // Functions
    //

    /**
     * Returns the index of the first value in the array such that it is
     * greater or equal to x.
     * The search is performed using binary search and the array is assumed
     * to be sorted in ascending order.
     *
     * @param {array} arr haystack
     * @param {any} x needle
     * @param {function} by transform function (optional)
     *
     * @returns {number} the desired index or arr.length if x is more than all values.
     */
    ResourceTimingDecompression.searchSortedFirst = function(arr, x, by) {
        if (!arr || arr.length === 0) {
            return -1;
        }

        function ident(a) {
            return a;
        }
        by = by || ident;
        x = by(x);
        var min = -1;
        var max = arr.length;
        var m = 0;

        while (min < (max - 1)) {
            m = (min + max) >>> 1;
            if (by(arr[m]) < x) {
                min = m;
            } else {
                max = m;
            }
        }
        return max;
    };

    /**
     * Returns the index of the last value in the array such that is it less
     * than or equal to x.
     * The search is performed using binary search and the array is assumed
     * to be sorted in ascending order.
     *
     * @param {array} arr haystack
     * @param {any} x needle
     * @param {function} by transform function (optional)
     *
     * @returns {number} the desired index or -1 if x is less than all values.
     */
    ResourceTimingDecompression.searchSortedLast = function(arr, x, by) {
        if (!arr || arr.length === 0) {
            return -1;
        }

        function ident(a) {
            return a;
        }
        by = by || ident;
        x = by(x);
        var min = -1;
        var max = arr.length;
        var m = 0;

        while (min < (max - 1)) {
            m = (min + max) >>> 1;
            if (x < by(arr[m])) {
                max = m;
            } else {
                min = m;
            }
        }
        return min;
    };

    /**
     * Changes the value of ResourceTimingDecompression back to its original value, returning
     * a reference to the ResourceTimingDecompression object.
     *
     * @returns {object} Original ResourceTimingDecompression object
     */
    ResourceTimingDecompression.noConflict = function() {
        root.ResourceTimingDecompression = previousObj;
        return ResourceTimingDecompression;
    };

    /**
     * Decompresses a compressed ResourceTiming trie
     *
     * @param {object} rt ResourceTiming trie
     * @param {array} st server timing entries lookup
     * @param {string} prefix URL prefix for the current node
     *
     * @returns {ResourceTiming[]} ResourceTiming array
     */
    ResourceTimingDecompression.decompressResources = function(rt, st, prefix) {
        var resources = [];

        // Dimension data for resources.
        var dimensionData;

        prefix = prefix || "";

        for (var key in rt) {
            // skip over inherited properties
            if (!rt.hasOwnProperty(key)) {
                continue;
            }

            var node = rt[key];
            var nodeKey = prefix + key;

            // strip trailing pipe, which is used to designate a node that is a prefix for
            // other nodes but has resTiming data
            if (nodeKey.indexOf("|", nodeKey.length - 1) !== -1) {
                nodeKey = nodeKey.substring(0, nodeKey.length - 1);
            }

            if (typeof node === "string") {
                // add all occurences
                var timings = node.split("|");

                if (timings.length === 0) {
                    continue;
                }

                // Make sure we reset the dimensions before each new resource.
                dimensionData = undefined;

                if (this.isDimensionData(timings[0])) {
                    dimensionData = this.decompressDimension(timings[0]);

                    // Remove the dimension data from our timings array
                    timings = timings.splice(1);
                }

                // end-node
                for (var i = 0; i < timings.length; i++) {
                    var resourceData = timings[i];

                    if (resourceData.length > 0 &&
                        resourceData[0] === ResourceTimingDecompression.SPECIAL_DATA_PREFIX) {
                        // dimensions or sizes for this resource
                        continue;
                    }

                    // Decode resource and add dimension data to it.
                    resources.push(
                        this.addDimension(
                            this.decodeCompressedResource(resourceData, nodeKey, st),
                            dimensionData
                        )
                    );
                }
            } else {
                // continue down
                var nodeResources = this.decompressResources(node, st, nodeKey);

                resources = resources.concat(nodeResources);
            }
        }

        return resources;
    };

    /**
     * Checks that the input contains dimension information.
     *
     * @param {string} resourceData The string we want to check.
     *
     * @returns {boolean} True if resourceData starts with SPECIAL_DATA_DIMENSION_PREFIX, false otherwise.
     */
    ResourceTimingDecompression.isDimensionData = function(resourceData) {
        return resourceData &&
            resourceData.substring(0, ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_PREFIX.length)
                === ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_PREFIX;
    };

    /**
     * Extract height, width, y and x from a string.
     *
     * @param {string} resourceData A string containing dimension data.
     *
     * @returns {object} Dimension data with keys defined by DIMENSION_NAMES.
     */
    ResourceTimingDecompression.decompressDimension = function(resourceData) {
        var dimensions, i;
        var dimensionData = {};

        // If the string does not contain dimension information, do nothing.
        if (!this.isDimensionData(resourceData)) {
            return dimensionData;
        }

        // Remove special prefix
        resourceData = resourceData.substring(ResourceTimingDecompression.SPECIAL_DATA_DIMENSION_PREFIX.length);

        dimensions = resourceData.split(",");

        // The data should contain at least height/width.
        if (dimensions.length < 2) {
            return dimensionData;
        }

        // If x is 0, and the last dimension, then it will be excluded, so initialize to 0
        // If x & y are 0, and the last dimensions, then both will be excluded, so initialize to 0
        dimensionData.y = 0;
        dimensionData.x = 0;

        // Base 36 decode and assign to correct keys of dimensionData.
        for (i = 0; i < dimensions.length; i++) {
            if (dimensions[i] === "") {
                dimensionData[this.REV_DIMENSION_NAMES[i]] = 0;
            } else {
                dimensionData[this.REV_DIMENSION_NAMES[i]] = parseInt(dimensions[i], 36);
            }
        }

        // If naturalHeight and naturalWidth are missing, then they are the same as height and width
        if (!dimensionData.hasOwnProperty("naturalHeight")) {
            dimensionData.naturalHeight = dimensionData.height;
        }
        if (!dimensionData.hasOwnProperty("naturalWidth")) {
            dimensionData.naturalWidth = dimensionData.width;
        }

        return dimensionData;
    };

    /**
     * Adds dimension data to the given resource.
     *
     * @param {object} resource The resource we want to edit.
     * @param {object} dimensionData The dimension data we want to add.
     *
     * @returns {object} The resource with added dimensions.
     */
    ResourceTimingDecompression.addDimension = function(resource, dimensionData) {
        // If the resource or data are not defined, do nothing.
        if (!resource || !dimensionData) {
            return resource;
        }

        // Add all the dimensions to our resource.
        for (var key in this.DIMENSION_NAMES) {
            if (this.DIMENSION_NAMES.hasOwnProperty(key) &&
                dimensionData.hasOwnProperty(key)) {
                resource[key] = dimensionData[key];
            }
        }

        return resource;
    };

    /**
     * Compute a list of cells based on the start/end times of the
     * given array of resources.
     * The returned list of cells is sorted in chronological order.
     *
     * @param {array} rts array of resource timings.
     *
     * @returns {array} Array of cells.
     */
    ResourceTimingDecompression.getSortedCells = function(rts) {
        // We have exactly 2 events per resource (start and end).
        // var cells = new Array(rts.length * 2);

        var cells = [];
        for (var i = 0; i < rts.length; i++) {
            // Ignore resources with duration <= 0
            if (rts[i].responseEnd <= rts[i].startTime) {
                continue;
            }
            // Increment on resource start
            cells.push({
                ts: rts[i].startTime,
                val: 1.0
            });
            // Decrement on resource end
            cells.push({
                ts: rts[i].responseEnd,
                val: -1.0
            });
        }

        // Sort in chronological order
        cells.sort(function(x, y) {
            return x.ts - y.ts;
        });

        return cells;
    };

    /**
     * Add contributions to the array of cells.
     *
     * @param {array} cells array of cells that need contributions.
     *
     * @returns {array} Array of cells with their contributions.
     */
    ResourceTimingDecompression.addCellContributions = function(cells) {
        var tot = 0.0;
        var incr = 0.0;
        var deleteIdx = [];
        var currentSt = cells[0].ts;
        var cellLen = cells.length;
        var c = {};

        for (var i = 0; i < cellLen; i++) {
            c = cells[i];
            // The next timestamp is the same.
            // We don't want to have cells of duration 0, so
            // we aggregate them.
            if ((i < (cellLen - 1)) && (cells[i + 1].ts === c.ts)) {
                cells[i + 1].val += c.val;
                deleteIdx.push(i);
                continue;
            }

            incr = c.val;
            if (tot > 0) {
                // divide time delta by number of active resources.
                c.val = (c.ts - currentSt) / tot;
            }

            currentSt = c.ts;
            tot += incr;
        }

        // Delete timestamps that don't delimit cells.
        for (i = deleteIdx.length - 1; i >= 0; i--) {
            cells.splice(deleteIdx[i], 1);
        }

        return cells;
    };

    /**
     * Sum the contributions of a single resource based on an array of cells.
     *
     * @param {array} cells Array of cells with their contributions.
     * @param {ResourceTiming} rt a single resource timing object.
     *
     * @returns {number} The total contribution for that resource.
     */
    ResourceTimingDecompression.sumContributions = function(cells, rt) {
        if (!rt || typeof rt.startTime === "undefined" ||
            typeof rt.responseEnd === "undefined") {

            return 0.0;
        }

        var startTime = rt.startTime + 1;
        var responseEnd = rt.responseEnd;

        function getTs(x) {
            return x.ts;
        }

        // Find indices of cells that were affected by our resource.
        var low = this.searchSortedFirst(cells, { ts: startTime }, getTs);
        var up = this.searchSortedLast(cells, { ts: responseEnd }, getTs);

        var tot = 0.0;

        // Sum contributions across all those cells
        for (var i = low; i <= up; i++) {
            tot += cells[i].val;
        }

        return tot;
    };

    /**
     * Adds contribution scores to all resources in the array.
     *
     * @param {array} rts array of resource timings.
     *
     * @returns {array} Array of resource timings with their contributions.
     */
    ResourceTimingDecompression.addContribution = function(rts) {
        if (!rts || rts.length === 0) {
            return rts;
        }

        // Get cells in chronological order.
        var cells = this.getSortedCells(rts);

        // We need at least two cells and they need to begin
        // with a start event. Furthermore, the last timestamp
        // should be > 0.
        if (cells.length < 2 ||
            cells[0].val < 1.0 ||
            cells[cells.length - 1].ts <= 0
        ) {
            return rts;
        }

        // Compute each cell's contribution.
        this.addCellContributions(cells);

        // Total load time for this batch of resources.
        var loadTime = cells[cells.length - 1].ts;

        for (var i = 0; i < rts.length; i++) {
            // Compute the contribution of each resource.
            // Normalize by total load time.
            rts[i].contribution = this.sumContributions(cells, rts[i]) / loadTime;
        }

        return rts;
    };

    /**
     * Determines the initiatorType from a lookup
     *
     * @param {number} index Initiator type index
     *
     * @returns {string} initiatorType, or "other" if not known
     */
    ResourceTimingDecompression.getInitiatorTypeFromIndex = function(index) {
        if (this.REV_INITIATOR_TYPES.hasOwnProperty(index)) {
            return this.REV_INITIATOR_TYPES[index];
        }

        return "other";
    };

    /**
     * Decodes a compressed ResourceTiming data string
     *
     * @param {string} data Compressed timing data
     * @param {string} url  URL
     * @param {array} st server timing entries lookup
     *
     * @returns {ResourceTiming} ResourceTiming pseudo-object (containing all of the properties of a
     * ResourceTiming object)
     */
    ResourceTimingDecompression.decodeCompressedResource = function(data, url, st) {
        if (!data || !url) {
            return {};
        }

        if (ResourceTimingDecompression.HOSTNAMES_REVERSED) {
            url = ResourceTimingDecompression.reverseHostname(url);
        }

        var initiatorType = isNaN(parseInt(data[0], 10)) ? data[0] : parseInt(data[0], 10);
        data = data.length > 1 ? data.split(ResourceTimingDecompression.SPECIAL_DATA_PREFIX) : [];
        var timings = data.length > 0 && data[0].length > 1 ? data[0].substring(1).split(",") : [];
        var specialData = data.length > 1 ? data.slice(1) : [];

        // convert all timings from base36
        for (var i = 0; i < timings.length; i++) {
            if (timings[i] === "") {
                // startTime being 0
                timings[i] = 0;
            } else {
                // de-base36
                timings[i] = parseInt(timings[i], 36);
            }
        }

        // special case timestamps
        var startTime = timings.length >= 1 ? timings[0] : 0;

        // fetchStart is either the redirectEnd time, or startTime
        // NOTE: This may be later modified by Service Worker special data, which has the real timestamp if needed
        var fetchStart = timings.length < 10 ?
            startTime :
            this.decodeCompressedResourceTimeStamp(timings, 9, startTime);

        // all others are offset from startTime
        var res = {
            name: url,
            initiatorType: this.getInitiatorTypeFromIndex(initiatorType),
            startTime: startTime,
            redirectStart: this.decodeCompressedResourceTimeStamp(timings, 9, startTime) > 0 ? startTime : 0,
            redirectEnd: this.decodeCompressedResourceTimeStamp(timings, 9, startTime),
            fetchStart: fetchStart,
            domainLookupStart: this.decodeCompressedResourceTimeStamp(timings, 8, startTime),
            domainLookupEnd: this.decodeCompressedResourceTimeStamp(timings, 7, startTime),
            connectStart: this.decodeCompressedResourceTimeStamp(timings, 6, startTime),
            secureConnectionStart: this.decodeCompressedResourceTimeStamp(timings, 5, startTime),
            connectEnd: this.decodeCompressedResourceTimeStamp(timings, 4, startTime),
            requestStart: this.decodeCompressedResourceTimeStamp(timings, 3, startTime),
            responseStart: this.decodeCompressedResourceTimeStamp(timings, 2, startTime),
            responseEnd: this.decodeCompressedResourceTimeStamp(timings, 1, startTime)
        };

        res.duration = res.responseEnd > 0 ? (res.responseEnd - res.startTime) : 0;

        // decompress resource size data
        for (i = 0; i < specialData.length; i++) {
            this.decompressSpecialData(specialData[i], res, st);
        }

        return res;
    };

    /**
     * Decodes a timestamp from a compressed RT array
     *
     * @param {number[]} timings ResourceTiming timings
     * @param {number} idx Index into array
     * @param {number} startTime NavigationTiming The Resource's startTime
     *
     * @returns {number} Timestamp, or 0 if unknown or missing
     */
    ResourceTimingDecompression.decodeCompressedResourceTimeStamp = function(timings, idx, startTime) {
        if (timings && timings.length >= (idx + 1)) {
            if (timings[idx] !== 0) {
                return timings[idx] + startTime;
            }
        }

        return 0;
    };

    /**
     * Decompresses script load type into the specified resource.
     *
     * @param {string} compressed String with a single integer.
     * @param {ResourceTiming} resource ResourceTiming object.
     * @returns {ResourceTiming} ResourceTiming object with decompressed script type.
     */
    ResourceTimingDecompression.decompressScriptType = function(compressed, resource) {
        var data = parseInt(compressed, 10);

        if (!resource) {
            resource = {};
        }

        for (var key in this.SCRIPT_ATTRIBUTES) {
            if (this.SCRIPT_ATTRIBUTES.hasOwnProperty(key)) {
                resource[key] = (data & this.SCRIPT_ATTRIBUTES[key]) === this.SCRIPT_ATTRIBUTES[key];
            }
        }

        return resource;
    };

    /**
     * Decompresses link attributes
     *
     * @param {string} compressed String with a single integer.
     * @param {ResourceTiming} resource ResourceTiming object.
     * @returns {ResourceTiming} ResourceTiming object with decompressed link attribute type.
     */
    ResourceTimingDecompression.decompressLinkAttrType = function(compressed, resource) {
        var data = parseInt(compressed, 10);

        if (!resource) {
            resource = {};
        }

        if (this.REV_REL_TYPES.hasOwnProperty(data)) {
            resource.rel = this.REV_REL_TYPES[data];
        }

        return resource;
    };

    /**
     * Decompresses size information back into the specified resource
     *
     * @param {string} compressed Compressed string
     * @param {ResourceTiming} resource ResourceTiming object
     * @returns {ResourceTiming} ResourceTiming object with decompressed sizes
     */
    ResourceTimingDecompression.decompressSize = function(compressed, resource) {
        var split, i;

        if (typeof resource === "undefined") {
            resource = {};
        }

        split = compressed.split(",");

        for (i = 0; i < split.length; i++) {
            if (split[i] === "_") {
                // special non-delta value
                split[i] = 0;
            } else {
                // fill in missing numbers
                if (split[i] === "") {
                    split[i] = 0;
                }

                // convert back from Base36
                split[i] = parseInt(split[i], 36);

                if (i > 0) {
                    // delta against first number
                    split[i] += split[0];
                }
            }
        }

        // fill in missing
        if (split.length === 1) {
            // transferSize is a delta from encodedSize
            split.push(split[0]);
        }

        if (split.length === 2) {
            // decodedSize is a delta from encodedSize
            split.push(split[0]);
        }

        // re-add attributes to the resource
        resource.encodedBodySize = split[0];
        resource.transferSize = split[1];
        resource.decodedBodySize = split[2];

        return resource;
    };

    /**
     * Decompresses namespaced data back into the specified resource
     *
     * @param {string} compressed Compressed string
     * @param {ResourceTiming} resource ResourceTiming object
     * @returns {ResourceTiming} ResourceTiming object with namespaced data
     */
    ResourceTimingDecompression.decompressNamespacedData = function(compressed, resource) {
        resource = resource || {};

        if (typeof compressed === "string") {
            var delimiter = ":";
            var colon = compressed.indexOf(delimiter);
            if (colon > 0) {
                var key = compressed.substring(0, colon);
                var value = compressed.substring(colon + delimiter.length);

                resource._data = resource._data || {};
                if (resource._data.hasOwnProperty(key)) {
                    // we are adding our 2nd or nth value (n > 2) for this key
                    if (!Array.isArray(resource._data[key])) {
                        // we are adding our 2nd value for this key, convert to array before pushing
                        resource._data[key] = [resource._data[key]];
                    }

                    // push it onto the array
                    resource._data[key].push(value);
                } else {
                    // we are adding our 1st value for this key
                    resource._data[key] = value;
                }
            }
        }

        return resource;
    };

    /**
     * Decompresses service worker data
     *
     * @param {string} compressed Compressed string
     * @param {ResourceTiming} resource ResourceTiming object
     * @returns {ResourceTiming} ResourceTiming object with decompressed special data
     */
    ResourceTimingDecompression.decompressServiceWorkerData = function(compressed, resource) {
        resource = resource || {};

        if (typeof compressed === "string") {
            var splitCompressed = compressed.split(",");

            var offset = parseInt(splitCompressed[0], 36);
            resource.workerStart = resource.startTime + offset;

            // if fetchStart is set, also use that instead of the inferred startTime/redirectEnd
            if (splitCompressed[1]) {
                resource.fetchStart = resource.startTime + parseInt(splitCompressed[1], 36);
            }
        }

        return resource;
    };

    /**
     * Decompresses special data such as resource size or script type into the given resource.
     *
     * @param {string} compressed Compressed string
     * @param {ResourceTiming} resource ResourceTiming object
     * @param {array} st server timing entries lookup
     * @returns {ResourceTiming} ResourceTiming object with decompressed special data
     */
    ResourceTimingDecompression.decompressSpecialData = function(compressed, resource, st) {
        var dataType;

        if (!compressed || compressed.length === 0) {
            return resource;
        }

        dataType = compressed[0];

        compressed = compressed.substring(1);

        if (dataType === ResourceTimingDecompression.SPECIAL_DATA_SIZE_TYPE) {
            resource = this.decompressSize(compressed, resource);
        } else if (dataType === ResourceTimingDecompression.SPECIAL_DATA_SCRIPT_TYPE) {
            resource = this.decompressScriptType(compressed, resource);
        } else if (dataType === ResourceTimingDecompression.SPECIAL_DATA_SERVERTIMING_TYPE) {
            resource = this.decompressServerTimingEntries(st, compressed, resource);
        } else if (dataType === ResourceTimingDecompression.SPECIAL_DATA_LINK_ATTR_TYPE) {
            resource = this.decompressLinkAttrType(compressed, resource);
        } else if (dataType === ResourceTimingDecompression.SPECIAL_DATA_NAMESPACED_TYPE) {
            resource = this.decompressNamespacedData(compressed, resource);
        } else if (dataType === ResourceTimingDecompression.SPECIAL_DATA_SERVICE_WORKER_TYPE) {
            resource = this.decompressServiceWorkerData(compressed, resource);
        }

        return resource;
    };

    /**
     * Reverse the hostname portion of a URL
     *
     * @param {string} url a fully-qualified URL
     * @returns {string} the input URL with the hostname portion reversed, if it can be found
     */
    ResourceTimingDecompression.reverseHostname = function(url) {
        return url.replace(ResourceTimingDecompression.HOSTNAME_REGEX, function(m, p1, p2, p3) {
            // p2 is everything after the first `://` and before the next `/`
            // which includes `<username>:<password>@` and `:<port-number>`, if present
            return p1 + ResourceTimingDecompression.reverseString(p2) + p3;
        });
    };

    /**
     * Reverse a string
     *
     * @param {string} i a string
     * @returns {string} the reversed string
     */
    ResourceTimingDecompression.reverseString = function(i) {
        var l = i.length, o = "";
        while (l--) {
            o += i[l];
        }
        return o;
    };

    /**
     * Decompress a list of compressed server timing entries for a resource
     *
     * @param {array} lookup server timing entries lookup
     * @param {string} compressedList server timing entries for a resource
     * @param {ResourceTiming} resource ResourceTiming object.
     * @returns {ResourceTiming} ResourceTiming object with decompressed server timing entries.
     */
    ResourceTimingDecompression.decompressServerTimingEntries = function(lookup, compressedList, resource) {
        if (typeof resource === "undefined") {
            resource = {};
        }

        if (lookup && compressedList) {
            resource.serverTiming = compressedList.split(",").map(function(compressedEntry) {
                return this.decompressServerTiming(lookup, compressedEntry);
            }, this);
        }
        return resource;
    };

    /**
     * Decompress a compressed server timing entry for a resource
     *
     * @param {array} lookup server timing entries lookup
     * @param {string} key key into the lookup for one server timing entry
     * @returns {object} server timing entry
     */
    ResourceTimingDecompression.decompressServerTiming = function(lookup, key) {
        var split = key.split(":");
        var duration = Number(split[0]);
        var entryIndex = 0, descriptionIndex = 0;

        if (split.length > 1) {
            var identity = split[1].split(".");
            if (identity[0] !== "") {
                entryIndex = Number(identity[0]);
            }
            if (identity.length > 1) {
                descriptionIndex = Number(identity[1]);
            }
        }

        var name, description = "";
        if (Array.isArray(lookup[entryIndex])) {
            name = lookup[entryIndex][0];
            description = lookup[entryIndex][1 + descriptionIndex] || "";
        } else {
            name = lookup[entryIndex];
        }

        return {
            name: name,
            duration: duration,
            description: description
        };
    };

    //
    // Export to the appropriate location
    //
    if (typeof define === "function" && define.amd) {
        //
        // AMD / RequireJS
        //
        define([], function() {
            return ResourceTimingDecompression;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        //
        // Node.js
        //
        module.exports = ResourceTimingDecompression;
    } else if (typeof root !== "undefined") {
        //
        // Browser Global
        //
        root.ResourceTimingDecompression = ResourceTimingDecompression;
    }
}(typeof window !== "undefined" ? window : undefined));

/**
 * The Continuity plugin measures performance and user experience metrics beyond
 * just the traditional Page Load timings.
 *
 * ## Approach
 *
 * The goal of the Continuity plugin is to capture the important aspects of your
 * visitor's overall _user experience_ during page load and beyond.  For example, the
 * plugin measures when the site appeared _Visually Ready_, and when it was _Interactive_.
 *
 * In addition, the Continuity plugin captures in-page interactions (such as keys,
 * clicks and scrolls), and monitors how the site performed when responding to
 * these inputs.
 *
 * Finally, the Continuity plugin is utilizing cutting-edge browser
 * performance APIs like [LongTasks](https://w3c.github.io/longtasks/) to get
 * important insights into how the browser is performing.
 *
 * Here are some of the metrics that the Continuity plugin captures:
 *
 * * Timers:
 *     * **Time to Visually Ready**: When did the user feel like they could interact
 *         with the site?  When did it look ready? (see below for details)
 *     * **Time to Interactive**: After the page was Visually Ready, when was the
 *         first time the user could have interacted with the site, and had a
 *         good (performant) experience? (see below for details)
 *     * **Time to First Interaction**: When was the first time the user tried to
 *         interact (key, click or scroll) with the site?
 *     * **First Input Delay**: For the first interaction on the page, how
 *         responsive was it?
 * * Interaction metrics:
 *     * **Interactions**: Keys, mouse movements, clicks, and scrolls (counts and
 *         an event log)
 *     * **Delayed Interactions**: How often was the user's interaction delayed
 *         more than 50ms?
 *     * **Rage Clicks**: Did the user repeatedly clicked on the same element/region?
 * * Page performance metrics:
 *     * **Frame Rate data**: FPS during page load, minimum FPS, number of long frames
 *     * **Long Task data**: Number of Long Tasks, how much time they took, attribution
 *         to what caused them
 *     * **Page Busy**: Measurement of the page's busyness
 *
 * This data is captured during the page load, as well as when the user later
 * interacts with the site (if configured via
 * {@link BOOMR.plugins.Continuity.init `afterOnload`}).
 * These metrics are reported at regular intervals, so you can see how they
 * change over time.
 *
 * If configured, the Continuity plugin can send additional beacons after a page
 * interaction happens (via {@link BOOMR.plugins.Continuity.init `monitorInteractions`}).
 *
 * ## Configuration
 *
 * The `Continuity` plugin has a variety of options to configure what it does (and
 * what it doesn't do):
 *
 * ### Monitoring Long Tasks
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorLongTasks`} is turned on,
 * the Continuity plugin will monitor [Long Tasks](https://w3c.github.io/longtasks/)
 * (if the browser supports it).
 *
 * Long Tasks represent work being done on the browser's UI thread that monopolize
 * the UI thread and block other critical tasks from being executed (such as reacting
 * to user input).  Long Tasks can be caused by anything from JavaScript
 * execution, to parsing, to layout.  The browser fires `LongTask` events
 * (via the `PerformanceObserver`) when a task takes over 50 milliseconds to execute.
 *
 * Long Tasks are important to measure as a Long Task will block all other user input
 * (e.g. clicks, keys and scrolls).
 *
 * Long Tasks are powerful because they can give _attribution_ about what component
 * caused the task, i.e. the source JavaScript file.
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorLongTasks`} is enabled:
 *
 * * A `PerformanceObserver` will be turned on to capture all Long Tasks that happen
 *     on the page.
 * * Long Tasks will be used to calculate _Time to Interactive_
 * * A log (`c.lt`), timeline (`c.t.lt`) and other Long Task metrics (`c.lt.*`) will
 *     be added to the beacon (see Beacon Parameters details below)
 *
 * The log `c.lt` is a JSON (or JSURL) object of compressed `LongTask` data.  See
 * the source code for what each attribute maps to.
 *
 * Long Tasks are currently a cutting-edge browser feature and will not be available
 * in older browsers.
 *
 * Enabling Long Tasks should not have a performance impact on the page load experience,
 * as collecting of the tasks are via the lightweight `PerformanceObserver` interface.
 *
 * ### Monitoring Page Busy
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorPageBusy`} is turned on,
 * the Continuity plugin will measure Page Busy.
 *
 * Page Busy is a way of measuring how much work was being done on the page (how "busy"
 * it was).  Page Busy is calculated via `setInterval()` polling: a timeout is scheduled
 * on the page at a regular interval, and _busyness_ is detected if that timeout does
 * not fire at the time it was expected to.
 *
 * Page Busy is a percentage -- 100% means that the browser was entirely busy doing other
 * things, while 0% means the browser was idle.
 *
 * Page Busy is _just an estimate_, as it uses sampling.  As an example, if you have
 * a high number of small tasks that execute frequently, Page Busy might run at
 * a frequency that it either detects 100% (busy) or 0% (idle).
 *
 * Page Busy is not the most efficient way of measuring what the browser is doing,
 * but since it is calculated via `setInterval()`, it is supported in all browsers.
 * The Continuity plugin currently measures Page Busy by polling every 32 milliseconds.
 *
 * Page Busy can be an indicator of how likely the user will have a good experience
 * when they interact with it. If Page Busy is 100%, the user may see the page lag
 * behind their input.
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorPageBusy`} is enabled:
 *
 * * The Page Busy monitor will be active (polling every 32 milliseconds) (unless
 *     Long Tasks is supported and enabled)
 * * Page Busy will be used to calculate _Time to Interactive_
 * * A timeline (`c.t.busy`) and the overall Page Busy % (`c.b`) will be added to the
 *     beacon (see Beacon Parameters details below)
 *
 * Enabling Page Busy monitoring should not have a noticeable effect on the page load
 * experience.  The 32-millisecond polling is lightweight and should barely register
 * on JavaScript CPU profiles.
 *
 * ### Monitoring Frame Rate
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorFrameRate`} is turned on,
 * the Continuity plugin will measure the Frame Rate of the page via
 * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).
 *
 * `requestAnimationFrame` is a browser API that can be used to schedule animations
 * that run at the device's refresh rate.  It can also be used to measure how many
 * frames were actually delivered to the screen, which can be an indicator of how
 * good the user's experience is.
 *
 * `requestAnimationFrame` is available in
 * [all modern browsers](https://caniuse.com/#feat=requestanimationframe).
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorFrameRate`} is enabled:
 *
 * * `requestAnimationFrame` will be used to measure Frame Rate
 * * Frame Rate will be used to calculate _Time to Interactive_
 * * A timeline (`c.t.fps`) and many Frame Rate metrics (`c.f.*`) will be added to the
 *     beacon (see Beacon Parameters details below)
 *
 * Enabling Frame Rate monitoring should not have a noticeable effect on the page load
 * experience.  The frame callback may happen up to the device's refresh rate (which
 * is often 60 FPS), and the work done in the callback should be barely visible
 * in JavaScript CPU profiles (often less than 5ms over a page load).
 *
 * ### Monitoring Interactions
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorInteractions`} is turned on,
 * the Continuity plugin will measure user interactions during the page load and beyond.
 *
 * Interactions include:
 *
 * * Mouse Clicks: Where the user clicked on the screen
 *     * Rage Clicks: Clicks to the same area repeatedly
 * * Mouse Movement: Rough mouse movement will be tracked, but these interactions will
 *    not send a beacon on their own, nor be used for _Time to First Interaction_
 *    calculations.
 * * Keyboard Presses: Individual key codes are not captured
 * * Scrolls: How frequently and far the user scrolled
 *     * Distinct Scrolls: Scrolls that happened over 2 seconds since the last scroll
 * * Page Visibility changes
 * * Orientation changes
 *
 * These interactions are monitored and instrumented throughout the page load.  By using
 * the event's `timeStamp`, we can detect how long it took for the physical event (e.g.
 * mouse click) to execute the JavaScript listening handler (in the Continuity plugin).
 * If there is a delay, this is tracked as an _Interaction Delay_.  Interaction Delays
 * can be an indicator that the user is having a degraded experience.
 *
 * The very first interaction delay will be added to the beacon as the
 * _First Input Delay_ - this is tracked as the user's first experience
 * with your site is important.
 *
 * In addition, if {@link BOOMR.plugins.Continuity.init `afterOnLoad`} is enabled,
 * these interactions (except Mouse Movements) can also trigger an `interaction`
 * beacon after the Page Load.  {@link BOOMR.plugins.Continuity.init `afterOnLoadMaxLength`}
 * can be used to control how many milliseconds after Page Load interactions will be
 * measured for.
 *
 * After a post-Load interaction occurs, the plugin will wait for
 * {@link BOOMR.plugins.Continuity.init `afterOnLoadMinWait`} milliseconds before
 * sending the `interaction` beacon.  If another interaction happens within that
 * timeframe, the plugin will wait another {@link BOOMR.plugins.Continuity.init `afterOnLoadMinWait`}
 * milliseconds.  This is to ensure that groups of interactions will be batched
 * together.  The plugin will wait up to 60 seconds to batch groups of interactions
 * together, at which point a beacon will be sent immediately.
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorInteractions`} is enabled:
 *
 * * Passive event handlers will be added to monitor clicks, keys, etc.
 * * A log and many interaction metrics (`c.f.*`) will be added to the
 *     beacon (see Beacon Parameters details below)
 *
 * For `interaction` beacons, the following will be set:
 *
 * * `rt.tstart` will be the timestamp of the first interaction
 * * `rt.end` will be the timestamp of the last interaction
 * * `rt.start = 'manual'`
 * * `http.initiator = 'interaction'`
 *
 * Enabling interaction monitoring will add lightweight passive event handlers
 * to `scroll`, `click`, `mousemove` and `keydown` events.  These event handlers
 * should not delay the user's interaction, and are used to measure delays and
 * keep a log of interaction events.
 *
 * ### Monitoring Page Statistics
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorStats`} is turned on,
 * the Continuity plugin will measure statistics about the page and browser over time.
 *
 * These statistics include:
 *
 * * Memory Usage: `usedJSHeapSize` (Chrome-only)
 * * [Battery Level](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)
 * * DOM Size: Number of bytes of HTML in the root frame
 * * DOM Length: Number of DOM nodes in the root frame
 * * Mutations: How often and how much the page is changing
 *
 * If {@link BOOMR.plugins.Continuity.init `monitorStats`} is enabled:
 *
 * * Events and polls will be setup to monitor the above statistics
 * * A timeline (`c.t.*`) of these statistics will be added to the beacon (see
 *     details below)
 *
 * Enabling Page Statistic monitoring adds a poll to the page every second, gathering
 * the above statistics.  These statistics should take less than 5ms JavaScript CPU
 * on a desktop browser each poll, but this monitoring is probably the most
 * expensive of the Continuity plugin monitors.
 *
 * This option is off by default, and can be turned on via the
 * {@link BOOMR.plugins.Continuity.init `monitorStats`} config option.
 *
 * ## New Timers
 *
 * There are 4 new timers from the Continuity plugin that center around user
 * interactions:
 *
 * * **Time to Visually Ready** (VR)
 * * **Time to Interactive** (TTI)
 * * **Time to First Interaction** (TTFI)
 * * **First Input Delay** (FID)
 *
 * _Time to Interactive_ (TTI), at it's core, is a measurement (timestamp) of when the
 * page was interact-able. In other words, at what point does the user both believe
 * the page could be interacted with, and if they happened to try to interact with
 * it then, would they have a good experience?
 *
 * To calculate Time to Interactive, we need to figure out two things:
 *
 * * Does the page appear to the visitor to be interactable?
 *     * We'll use one or more Visually Ready Signals to determine this
 * * If so, what's the first time a user could interact with the page and have a good
 *     experience?
 *     * We'll use several Time to Interactive Signals to determine this
 *
 * ### Visually Ready
 *
 * For the first question, "does the page appear to be interactable?", we need to
 * determine when the page would _look_ to the user like they _could_ interact with it.
 *
 * It's only after this point that TTI could happen. Think of Visually Ready (VR) as
 * the anchor point of TTI -- it's the earliest possible timestamp in the page's
 * lifecycle that TTI could happen.
 *
 * We have a few signals that might be appropriate to use as Visually Ready:
 * * First Paint (if available)
 *     * We should wait at least for the first paint on the page
 *     * i.e. IE's [`msFirstPaint`](https://msdn.microsoft.com/en-us/library/ff974719)
 *         or Chrome's `firstPaintTime`
 *     * These might just be paints of white, so they're not the only signal we should use
 * * First Contentful Paint (if available)
 *     * Via [PaintTiming](https://www.w3.org/TR/paint-timing/)
 * * [domContentLoadedEventEnd](https://msdn.microsoft.com/en-us/library/ff974719)
 *     * "The DOMContentLoaded event is fired when the initial HTML document has been
 *         completely loaded and parsed, without waiting for stylesheets, images,
 *         and subframes to finish loading"
 *     * This happens after `domInteractive`
 *     * Available in NavigationTiming browsers via a timestamp and all other
 *         browser if we're on the page in time to listen for readyState change events
 * * Hero Images (if defined)
 *     * Instead of tracking all Above-the-Fold images, it could be useful to know
 *         which specific images are important to the site owner
 *     * Defined via a simple CSS selector (e.g. `.hero-images`)
 *     * Can be measured via ResourceTiming
 *     * Will add Hero Images Ready `c.tti.hi` to the beacon
 * * "My Framework is Ready" (if defined)
 *     * A catch-all for other things that we can't automatically track
 *     * This would be an event or callback from the page author saying their page is ready
 *     * They could fire this for whatever is important to them, i.e. when their page's
 *         click handlers have all registered
 *     * Will add Framework Ready `c.tti.fr` to the beacon
 *
 * Once the last of all of the above have happened, Visually Ready has occurred.
 *
 * Visually Ready will add `c.tti.vr` to the beacon.
 *
 * #### Controlling Visually Ready via Framework Ready
 *
 * There are two additional options for controlling when Visually Ready happens:
 * via Framework Ready or Hero Images.
 *
 * If you want to wait for your framework to be ready (e.g. your SPA has loaded or
 * a button has a click handler registered), you can add an
 * option {@link BOOMR.plugins.Continuity.init `ttiWaitForFrameworkReady`}.
 *
 * Once enabled, TTI won't be calculated until the following is called:
 *
 * ```
 * // my framework is ready
 * if (BOOMR && BOOMR.plugins && BOOMR.plugins.Continuity) {
 *     BOOMR.plugins.Continuity.frameworkReady();
 * }
 * ```
 *
 * #### Controlling Visually Ready via Hero Images
 *
 * If you want to wait for your hero/main images to be loaded before Visually Ready
 * is measured, you can give the plugin a CSS selector via
 * {@link BOOMR.plugins.Continuity.init `ttiWaitForHeroImages`}.
 * If set, Visually Ready will be delayed until all IMGs that match that selector
 * have loaded, e.g.:
 *
 * ```
 * BOOMR.init({
 *   ...
 *   Continuity: {
 *     enabled: true,
 *     ttiWaitForHeroImages: ".hero-image"
 *   }
 * });
 * ```
 *
 * Note this only works in ResourceTiming-supported browsers (and won't be used in
 * older browsers).
 *
 * If no images match the CSS selector at Page Load, this setting will be ignored
 * (the plugin will not wait for a match).
 *
 * ### Time to Interactive
 *
 * After the page is Visually Ready for the user, if they were to try to interact
 * with the page (click, scroll, type), when would they have a good experience (i.e.
 * the page responded in a satisfactory amount of time)?
 *
 * We can use some of the signals below, when available:
 *
 * * Frame Rate (FPS)
 *     * Available in all modern browsers: by using `requestAnimationFrame` we can
 *         get a sense of the overall frame rate (FPS)
 *     * To ensure a "smooth" page load experience, ideally the page should never drop
 *         below 20 FPS.
 *     * 20 FPS gives about 50ms of activity to block the main thread at any one time
 * * Long Tasks
 *     * Via the PerformanceObserver, a Long Tasks fires any time the main thread
 *         was blocked by a task that took over 50ms such as JavaScript, layout, etc
 *     * Great indicator both that the page would not have been interact-able and
 *         in some cases, attribution as to why
 * * Page Busy via `setInterval`
 *     * By measuring how long it takes for a regularly-scheduled callback to fire,
 *         we can detect other tasks that got in the way
 *     * Can give an estimate for Page Busy Percentage (%)
 *     * Available in every browser
 * * Delayed interactions
 *     * If the user interacted with the page and there was a delay in responding
 *         to the input
 *
 * The {@link BOOMR.plugins.Continuity.init `waitAfterOnload`} option will delay
 * the beacon for up to that many milliseconds if Time to Interactive doesn't
 * happen by the browser's `load` event.  You shouldn't set it too high, or
 * the likelihood that the page load beacon will be lost increases (because of
 * the user navigating away first, or closing their browser). If
 * {@link BOOMR.plugins.Continuity.init `waitAfterOnload`} is reached and TTI
 * hasn't happened yet, the beacon will be sent immediately (missing the TTI timer).
 *
 * If you set {@link BOOMR.plugins.Continuity.init `waitAfterOnload`} to `0`
 * (or it's not set), Boomerang will send the beacon at the regular page load
 * event.  If TTI didn't yet happen, it won't be reported.
 *
 * If you want to set {@link BOOMR.plugins.Continuity.init `waitAfterOnload`},
 * we'd recommend a value between `1000` and `5000` (1 and 5 seconds).
 *
 * Time to Interaction will add `c.tti` to the beacon.  It will also add `c.tti.m`,
 * which is the higest-accuracy method available for TTI calculation: `lt` (Long Tasks),
 * `raf` (FPS), or `b` (Page Busy).
 *
 * #### Algorithm
 *
 * Putting these two timers together, here's how we measure Visually Ready and
 * Time to Interactive:
 *
 * 1. Determine the highest Visually Ready timestamp (VRTS):
 *     * First Contentful Paint (if available)
 *     * First Paint (if available)
 *     * `domContentLoadedEventEnd`
 *     * Hero Images are loaded (if configured)
 *     * Framework Ready (if configured)
 *
 * 2. After VRTS, calculate Time to Interactive by finding the first period of
 *     500ms where all of the following are true:
 *     * There were no Long Tasks
 *     * The FPS was always above 20 (if available)
 *     * Page Busy was less than 10% (if the above aren't available)
 *
 * ### Time to First Interaction
 *
 * Time to First Interaction (TTFI) is the first time a user interacted with the
 * page.  This may happen during or after the page's `load` event.
 *
 * The events that are tracked are:
 * * Mouse Clicks
 * * Keyboard Presses
 * * Scrolls
 * * Page Visibility changes
 * * Orientation changes
 *
 * Time to First Interaction is not affected by Mouse Movement.
 *
 * Time to First Interaction will add `c.ttfi` to the beacon.
 *
 * If the user does not interact with the page by the beacon, there will be no
 * `c.ttfi` on the beacon.
 *
 * ### First Input Delay
 *
 * If the user interacted with the page by the time the beacon was sent, the
 * Continuity plugin will also measure how long it took for the JavaScript
 * event handler to fire.
 *
 * This can give you an indication of the page being otherwise busy and unresponsive
 * to the user if the callback is delayed.
 *
 * This time (measured in milliseconds) is added to the beacon as `c.fid`.
 *
 * ## Timelines
 *
 * If {@link BOOMR.plugins.Continuity.init `sendTimeline`} is enabled, many of
 * the above options will add bucketed "timelines" to the beacon.
 *
 * The Continuity plugin keeps track of statistics, interactions and metrics over time
 * by keeping track of these counts at a granularity of 100-millisecond intervals.
 *
 * As an example, if you are measuring Long Tasks, its timeline will have entries
 * whenever a Long Task occurs.
 *
 * Not every timeline will have data for every interval.  As an example, the click
 * timeline will be sparse except for the periods where there was a click.  Statistics
 * like DOM Size are captured only once every second.  The Continuity plugin is
 * optimized to use as little memory as possible for these cases.
 *
 * ### Compressed Timeline Format
 *
 * If {@link BOOMR.plugins.Continuity.init `sendTimeline`} is enabled, the
 * Continuity plugin will add several timelines as `c.t.[name]` to the beacon
 * in a compressed format.
 *
 * An example timeline may look like this:
 *
 * ```
 * c.t.fps      = 03*a*657576576566766507575*8*65
 * c.t.domsz    = 11o3,1o4
 * c.t.mousepct = 2*5*0053*4*00050718
 * ```
 *
 * The format of the compressed timeline is as follows:
 *
 * `[Compression Type - 1 character][Data - everything else]`
 *
 * * Compression Type is a single character that denotes how each timeline's bucket
 *     numbers are compressed:
 *     * `0` (for smaller numbers):
 *         * Each number takes a single character, encoded in Base-64
 *         * If a number is >= 64, the number is converted to Base-36 and wrapped in
 *             `.` characters
 *     * `1` (for larger numbers)
 *         * Each number is separated by `,`s
 *         * Each number is encoded in Base-36
 *     * `2` (for percentages)
 *         * Each number takes two characters, encoded in Base-10
 *         * If a number is <= 0, it is `00`
 *         * If a number is >= 100, it is `__`
 *
 * In addition, for repeated numbers, the format is as follows:
 *
 * `*[Repeat Count]*[Number]`
 *
 * Where:
 *
 * * Repeat Count is encoded Base-36
 * * Number is encoded per the rules above
 *
 * From the above example, the data would be decompressed to:
 *
 * ```
 * c.t.fps =
 *     [3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 7, 5, 7, 6, 5, 7, 6, 5, 6, 6, 7, 6, 6,
 *     5, 0, 7, 5, 7, 5, 6, 6, 6, 6, 6, 6, 6, 6, 5];
 *
 * c.t.domsz = [2163, 2164];
 *
 * c.t.mousepct = [0, 0, 0, 0, 0, 53, 0, 0, 0, 0, 5, 7, 18];
 * ```
 *
 * The timeline can be decompressed via
 * {@link BOOMR.plugins.Continuity.decompressBucketLog `decompressBucketLog`}
 * (for debug builds).
 *
 * The Continuity Epoch (`c.e`) and Continuity Last Beacon (`c.lb`) are timestamps
 * (Base-36) that indicate what timestamp the first bucket represents.  If both are
 * given, the Last Beacon timestamp should be used.
 *
 * For example:
 *
 * ```
 * c.e=j5twmlbv       // 1501611350395
 * c.lb=j5twmlyk      // 1501611351212
 * c.t.domsz=11o3,1o4 // 2163, 2164 using method 1
 * ```
 *
 * In the above example, the first value of `2163` (`1o3` Base-36) happened
 * at `1501611351212`.  The second value of `2164` (`1o4` Base-36) happened
 * at `1501611351212 + 100 = 1501611351312`.
 *
 * For all of the available timelines, see the Beacon Parameters list below.
 *
 * ## Logs
 *
 * If {@link BOOMR.plugins.Continuity.init `sendLog`} is enabled, the Continuity
 * plugin will add a log to the beacon as `c.l`.
 *
 * The following events will generate a Log entry with the listed parameters:
 *
 * * Scrolls (type `0`):
 *     * `y`: Y pixels
 * * Clicks (type `1`):
 *     * `x`: X pixels
 *     * `y`: Y pixels
 * * Mouse Movement (type `2`):
 *     * Data is captured at minimum 10 pixel granularity
 *     * `x`: X pixels
 *     * `y`: Y pixels
 * * Keyboard presses (type `3`):
 *     * (no data is captured)
 * * Visibility Changes (type `4`):
 *     * `s`
 *         * `0`: `visible`
 *         * `1`: `hidden`
 *         * `2`: `prerender`
 *         * `3`: `unloaded`
 * * Orientation Changes (type `5`):
 *     * `a`: Angle
 *
 * The log is put on the beacon in a compressed format.  Here is an example log:
 *
 * ```
 * c.l=214y,xk9,y8p|142c,xk5,y8v|34kh
 * ```
 *
 * The format of the compressed timeline is as follows:
 *
 * ```
 * [Type][Timestamp],[Param1 type][Param 1 value],[... Param2 ...]|[... Event2 ...]
 * ```
 *
 * * Type is a single character indicating what type of event it is, per above
 * * Timestamp (`navigationStart` epoch in milliseconds) is Base-36 encoded
 * * Each parameter follows, separated by commas:
 *     * The first character indicates the type of parameter
 *     * The subsequent characters are the value of the parameter, Base-36 encoded
 *
 * From the above example, the data would be decompressed to:
 *
 * ```
 * [
 *     {
 *         "type": "mouse",
 *         "time": 1474,
 *         "x": 729,
 *         "y": 313
 *     },
 *     {
 *         "type": "click",
 *         "time": 5268,
 *         "x": 725,
 *         "y": 319
 *     },
 *     {
 *         "type": "key",
 *         "time": 5921,
 *     }
 * ]
 * ```
 *
 * The plugin will keep track of the last
 * {@link BOOMR.plugins.Continuity.init `logMaxEntries`} entries in the log
 * (default 100).
 *
 * The timeline can be decompressed via
 * {@link BOOMR.plugins.Continuity.decompressBucketLog `decompressLog`} (for
 * debug builds).
 *
 * ## Overhead
 *
 * When enabled, the Continuity plugin adds new layers of instrumentation to
 * each page load.  It also keeps some of this instrumentation enabled
 * after the `load` event, if configured.  By default, these instrumentation
 * "monitors" will be turned on:
 *
 * * Long Tasks via `PerformanceObserver`
 * * Frame Rate (FPS) via `requestAnimationFrame`
 * * Page Busy via `setInterval` polling (if Long Tasks aren't supported)
 * * Monitoring of interactions such as mouse clicks, movement, keys, and scrolls
 * * Page statistics like DOM size/length, memory usage, and mutations
 *
 * Each of these monitors is designed to be as lightweight as possible, but
 * enabling instrumentation will always incur non-zero CPU time.  Please read
 * the above sections for overhead information on each monitor.
 *
 * With the Continuity plugin enabled, during page load, you may see the plugin's
 * total CPU usage over the entire length of that page load reach 10-35ms, depending on
 * the hardware and makeup of the host-site. In general, for most modern websites,
 * this means Boomerang should still only account for a few percentage points of
 * overall page CPU usage with the Continuity plugin enabled.
 *
 * The majority of this CPU usage increase is from Page Statistics reporting and
 * FPS monitoring.  You can disable either of these monitors individually if desired
 * ({@link BOOMR.plugins.Continuity.init `monitorStats`} and
 * {@link BOOMR.plugins.Continuity.init `monitorFrameRate`}).
 *
 * During idle periods (after page load), the Continuity plugin will continue
 * monitoring the above items if {@link BOOMR.plugins.Continuity.init `afterOnload`}
 * is enabled.  This may increase Boomerang JavaScript CPU usage as well.  Again,
 * the majority of this CPU usage increase is from Page Statistic reporting and
 * Frame Rate monitoring, and can be disabled.
 *
 * When Long Tasks aren't supported by the browser, Page Busy monitoring via
 * `setInterval` should only 1-2ms CPU during and after page load.
 *
 * ## Beacon Parameters
 *
 * The following parameters will be added to the beacon:
 *
 * * `c.b`: Page Busy percentage (Base-10)
 * * `c.c.r`: Rage click count (Base-10)
 * * `c.c`: Click count (Base-10)
 * * `c.e`: Continuity Epoch timestamp (when everything started measuring) (Base-36)
 * * `c.f.d`: Frame Rate duration (how long it has been measuring) (milliseconds) (Base-10)
 * * `c.f.l`: Number of Long Frames (>= 50ms) (Base-10)
 * * `c.f.m`: Minimum Frame Rate (Base-10) per `COLLECTION_INTERVAL`
 * * `c.f.s`: Frame Rate measurement start timestamp (Base-36)
 * * `c.f`: Average Frame Rate over the Frame Rate Duration (Base-10)
 * * `c.fid`: First Input Delay (milliseconds) (Base-10)
 * * `c.i.a`: Average interaction delay (milliseconds) (Base-10)
 * * `c.i.dc`: Delayed interaction count (Base-10)
 * * `c.i.dt`: Delayed interaction time (milliseconds) (Base-10)
 * * `c.k.e`: Keyboard ESC count (Base-10)
 * * `c.k`: Keyboard event count (Base-10)
 * * `c.l`: Log (compressed)
 * * `c.lb`: Last Beacon timestamp (Base-36)
 * * `c.lt.n`: Number of Long Tasks (Base-10)
 * * `c.lt.tt`: Total duration of Long Tasks (milliseconds) (Base-10)
 * * `c.lt`: Long Task data (compressed)
 * * `c.m.n`: Mouse movement pixels (Base-10)
 * * `c.m.p`: Mouse movement percentage (Base-10)
 * * `c.s.d`: Distinct scrolls (scrolls that happen 2 seconds after the last) (Base-10)
 * * `c.s.p`: Scroll percentage (Base-10)
 * * `c.s.y`: Scroll y (pixels) (Base-10)
 * * `c.s`: Scroll count (Base-10)
 * * `c.t.click`: Click timeline (compressed)
 * * `c.t.domln`: DOM Length timeline (compressed)
 * * `c.t.domsz`: DOM Size timeline (compressed)
 * * `c.t.fps`: Frame Rate timeline (compressed)
 * * `c.t.inter`: Interactions timeline (compressed)
 * * `c.t.interdly`: Delayed Interactions timeline (compressed)
 * * `c.t.key`: Keyboard press timeline (compressed)
 * * `c.t.longtask`: LongTask timeline (compressed)
 * * `c.t.mem`: Memory usage timeline (compressed)
 * * `c.t.mouse`: Mouse movements timeline (compressed)
 * * `c.t.mousepct`: Mouse movement percentage (of full screen) timeline (compressed)
 * * `c.t.scroll`: Scroll timeline (compressed)
 * * `c.t.scrollpct`:Scroll percentage (of full page) timeline (compressed)
 * * `c.t.mut`: DOM Mutations timeline (compressed)
 * * `c.ttfi`: Time to First Interaction (milliseconds) (Base-10)
 * * `c.tti.fr`: Framework Ready (milliseconds) (Base-10)
 * * `c.tti.hi`: Hero Images ready (milliseconds) (Base-10)
 * * `c.tti.m`: Time to Interactive Method (`lt`, `raf`, `b`)
 * * `c.tti.vr`: Visually Ready (milliseconds) (Base-10)
 * * `c.tti`: Time to Interactive (milliseconds) (Base-10)
 *
 * @class BOOMR.plugins.Continuity
 */
(function() {
	var impl;

	

	

	if (BOOMR.plugins.Continuity) {
		return;
	}

	//
	// Constants available to all Continuity classes
	//
	/**
	 * Timeline collection interval
	 */
	var COLLECTION_INTERVAL = 100;

	/**
	 * Maximum length (ms) that events will be recorded, if not
	 * a SPA.
	 */
	var DEFAULT_AFTER_ONLOAD_MAX_LENGTH = 60000;

	/**
	 * Time to Interactive polling period (after onload, how often we'll
	 * check to see if TTI fired yet)
	 */
	var TIME_TO_INTERACTIVE_WAIT_POLL_PERIOD = 500;

	/**
	 * Compression Modes
	 */

	/**
	 * Most numbers are expected to be 0-63, though larger numbers are
	 * allowed.
	 */
	var COMPRESS_MODE_SMALL_NUMBERS = 0;

	/**
	 * Most numbers are expected to be larger than 63.
	 */
	var COMPRESS_MODE_LARGE_NUMBERS = 1;

	/**
	 * Numbers are from 0 to 100
	 */
	var COMPRESS_MODE_PERCENT = 2;

	/**
	 * Log types
	 */
	var LOG_TYPE_SCROLL = 0;
	var LOG_TYPE_CLICK = 1;
	var LOG_TYPE_MOUSE = 2;
	var LOG_TYPE_KEY = 3;
	var LOG_TYPE_VIS = 4;
	var LOG_TYPE_ORIENTATION = 5;

	/**
	 * Base64 number encoding
	 */
	var BASE64_NUMBER = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

	/**
	 * Large number delimiter (.)
	 *
	 * For COMPRESS_MODE_SMALL_NUMBERS, numbers larger than 63 are wrapped in this
	 * character.
	 */
	var LARGE_NUMBER_WRAP = ".";

	// Performance object
	var p = BOOMR.getPerformance();

	// Metrics that will be exported
	var externalMetrics = {};

	/**
	 * Epoch - when to base all relative times from.
	 *
	 * If the browser supports NavigationTiming, this is navigationStart.
	 *
	 * If not, just use 'now'.
	 */
	var epoch = p && p.timing && p.timing.navigationStart ?
		p.timing.navigationStart : BOOMR.now();

	/**
	 * Debug logging
	 *
	 * @param {string} msg Message
	 */
	function debug(msg) {
		
	}

	/**
	 * Compress JSON to a string for a URL parameter in the best way possible.
	 *
	 * If UserTimingCompression is available (which has JSURL), use that.  The
	 * data will start with the character `~`
	 *
	 * Otherwise, use JSON.stringify.  The data will start with the character `{`.
	 *
	 * @param {object} obj Data
	 *
	 * @returns {string} Compressed data
	 */
	function compressJson(data) {
		var utc = window.UserTimingCompression || BOOMR.window.UserTimingCompression;

		if (utc) {
			return utc.jsUrl(data);
		}
		else if (window.JSON) {
			return JSON.stringify(data);
		}
		else {
			// JSON isn't available
			return "";
		}
	}

	/**
	 * Gets a compressed bucket log.
	 *
	 * Each bucket is represented by a single character (the value of the
	 * bucket base 64), unless:
	 *
	 * 1. There are 4 or more duplicates in a row. Then the format is:
	 *   *[count of dupes]*[number base 64]
	 * 2. The value is greater than 63, then the format is:
	 *   _[number base 36]_
	 *
	 * @param {number} type Compression type
	 * @param {boolean} backfill Backfill
	 * @param {object} dataSet Data
	 * @param {number} sinceBucket Lowest bucket
	 * @param {number} endBucket Highest bucket
	 *
	 * @returns {string} Compressed log
	 */
	function compressBucketLog(type, backfill, dataSet, sinceBucket, endBucket) {
		var out = "", val = 0, i, j, dupes, valStr, nextVal, wroteSomething;

		if (!dataSet || !BOOMR.utils.Compression) {
			return "";
		}

		// if we know there's no data, return an empty string
		if (dataSet.length === 0) {
			return "";
		}

		if (backfill) {
			if (typeof dataSet[sinceBucket] === "undefined") {
				dataSet[sinceBucket] = 0;
			}

			// pre-fill buckets
			for (i = sinceBucket + 1; i <= endBucket; i++) {
				if (typeof dataSet[i] === "undefined") {
					dataSet[i] = dataSet[i - 1];
				}
			}
		}

		for (i = sinceBucket; i <= endBucket; i++) {
			val = (typeof dataSet[i] === "number" && !isNaN(dataSet[i])) ?
			    dataSet[i] : 0;

			//
			// Compression modes
			//
			if (type === COMPRESS_MODE_SMALL_NUMBERS) {
				// Small numbers can be max 63 for our single-digit encoding
				if (val <= 63) {
					valStr = BASE64_NUMBER.charAt(val);
				}
				else {
					// large numbers get wrapped in .s
					valStr = LARGE_NUMBER_WRAP + val.toString(36) + LARGE_NUMBER_WRAP;
				}
			}
			else if (type === COMPRESS_MODE_LARGE_NUMBERS) {
				// large numbers just get Base36 encoding by default
				valStr = val.toString(36);
			}
			else if (type === COMPRESS_MODE_PERCENT) {
				//
				// Percentage characters take two digits always, with
				// 100 = __
				//
				if (val < 99) {
					// 0-pad
					valStr = val <= 9 ? ("0" + Math.max(val, 0)) : val;
				}
				else {
					// 100 or higher
					valStr = "__";
				}
			}

			// compress sequences of the same number 4 or more times
			if ((i + 3) <= endBucket &&
			    (dataSet[i + 1] === val || (val === 0 && dataSet[i + 1] === undefined)) &&
			    (dataSet[i + 2] === val || (val === 0 && dataSet[i + 2] === undefined)) &&
			    (dataSet[i + 3] === val || (val === 0 && dataSet[i + 3] === undefined))) {
				dupes = 1;

				// loop until we're past the end bucket or we find a non-dupe
				while (i < endBucket) {
					if (dataSet[i + 1] === val || (val === 0 && dataSet[i + 1] === undefined)) {
						dupes++;
					}
					else {
						break;
					}

					i++;
				}

				nextVal = "*" + dupes.toString(36) + "*" + valStr;
			}
			else {
				nextVal = valStr;
			}

			// add this value if it isn't just 0s at the end
			if (val !== 0 || i !== endBucket) {
				//
				// Small numbers fit into a single character (or are delimited
				// by _s), so can just be appended to each other.
				//
				// Percentage always takes two characters.
				//
				if (type === COMPRESS_MODE_LARGE_NUMBERS) {
					//
					// Large numbers need to be separated by commas
					//
					if (wroteSomething) {
						out += ",";
					}
				}

				wroteSomething = true;
				out += nextVal;
			}
		}

		return wroteSomething ? (type.toString() + out) : "";
	}


	/**
	 * Timeline data
	 *
	 * Responsible for:
	 *
	 * * Keeping track of counts of events that happen over time (in
	 *   COLLECTION_INTERVAL intervals).
	 * * Keeps a log of raw events.
	 * * Calculates Time to Interactive (TTI) and Visually Ready.
	 */
	var Timeline = function(startTime) {
		//
		// Constants
		//
		/**
		 * Number of "idle" intervals (of COLLECTION_INTERVAL ms) before
		 * Time to Interactive is called.
		 *
		 * 5 * 100 = 500ms (of no long tasks > 50ms and FPS >= 20)
		 */
		var TIME_TO_INTERACTIVE_IDLE_INTERVALS = 5;

		/**
		 * For Time to Interactive, minimum FPS.
		 *
		 * ~20 FPS or max ~50ms blocked
		 */
		var TIME_TO_INTERACTIVE_MIN_FPS = 20;

		/**
		 * For Time to Interactive, minimum FPS per COLLECTION_INTERVAL.
		 */
		var TIME_TO_INTERACTIVE_MIN_FPS_PER_INTERVAL =
			TIME_TO_INTERACTIVE_MIN_FPS / (1000 / COLLECTION_INTERVAL);

		/**
		 * For Time to Interactive, max Page Busy (if LongTasks aren't supported)
		 *
		 * ~50%
		 */
		var TIME_TO_INTERACTIVE_MAX_PAGE_BUSY = 50;

		//
		// Local Members
		//

		// timeline data
		var data = {};

		// timeline data options
		var dataOptions = {};

		// timeline log
		var dataLog = [];

		// time-to-interactive timestamp
		var tti = 0;

		// visually ready timestamp
		var visuallyReady = 0;

		// hero images timestamp
		var heroImagesReady = 0;

		// check for pre-Boomerang FPS log
		if (BOOMR.fpsLog && BOOMR.fpsLog.length) {
			// start at the first frame instead of now
			startTime = BOOMR.fpsLog[0] + epoch;

			// NOTE: FrameRateMonitor will remove fpsLog
		}

		//
		// Functions
		//
		/**
		 * Registers a monitor
		 *
		 * @param {string} type Type
		 * @param {number} [compressMode] Compression mode
		 * @param {boolean} [backfillLast] Whether or not to backfill missing entries
		 * with the most recent value.
		 */
		function register(type, compressMode, backfillLast) {
			if (!data[type]) {
				data[type] = [];
			}

			dataOptions[type] = {
				compressMode: compressMode ? compressMode : COMPRESS_MODE_SMALL_NUMBERS,
				backfillLast: backfillLast
			};
		}

		/**
		 * Gets the current time bucket
		 *
		 * @returns {number} Current time bucket
		 */
		function getTimeBucket() {
			return Math.floor((BOOMR.now() - startTime) / COLLECTION_INTERVAL);
		}

		/**
		 * Sets data for the specified type.
		 *
		 * The type should be registered first via {@link register}.
		 *
		 * @param {string} type Type
		 * @param {number} [value] Value
		 * @param {number} [bucket] Time bucket
		 */
		function set(type, value, bucket) {
			if (typeof bucket === "undefined") {
				bucket = getTimeBucket();
			}

			if (!data[type]) {
				return;
			}

			data[type][bucket] = value;
		}

		/**
		 * Increments data for the specified type
		 *
		 * The type should be registered first via {@link register}.
		 *
		 * @param {string} type Type
		 * @param {number} [value] Value
		 * @param {number} [bucket] Time bucket
		 */
		function increment(type, value, bucket) {
			if (typeof bucket === "undefined") {
				bucket = getTimeBucket();
			}

			if (typeof value === "undefined") {
				value = 1;
			}

			if (!data[type]) {
				return;
			}

			if (!data[type][bucket]) {
				data[type][bucket] = 0;
			}

			data[type][bucket] += value;
		}

		/**
		 * Log an event
		 *
		 * @param {string} type Type
		 * @param {number} [bucket] Time bucket
		 * @param {array} [val] Event data
		 */
		function log(type, bucket, val) {
			if (typeof bucket === "undefined") {
				bucket = getTimeBucket();
			}

			dataLog.push({
				type: type,
				time: bucket,
				val: val
			});

			// trim to logMaxEntries
			if (dataLog.length > impl.logMaxEntries) {
				Array.prototype.splice.call(
					dataLog,
					0,
					(dataLog.length - impl.logMaxEntries)
				);
			}
		}

		/**
		 * Gets stats for a type since the specified start time.
		 *
		 * @param {string} type Type
		 * @param {number} since Start time
		 *
		 * @returns {object} Stats for the type
		 */
		function getStats(type, since) {
			var count = 0,
			    total = 0,
			    min = Infinity,
			    max = 0,
			    val,
			    sinceBucket = Math.floor((since - startTime) / COLLECTION_INTERVAL);

			if (!data[type]) {
				return 0;
			}

			for (var bucket in data[type]) {
				bucket = parseInt(bucket, 10);

				if (bucket >= sinceBucket) {
					if (data[type].hasOwnProperty(bucket)) {
						val = data[type][bucket];

						// calculate count, total and minimum
						count++;
						total += val;

						min = Math.min(min, val);
						max = Math.max(max, val);
					}
				}
			}

			// return the stats
			return {
				total: total,
				count: count,
				min: min,
				max: max
			};
		}

		/**
		 * Given a CSS selector, determine the load time of any IMGs matching
		 * that selector and/or IMGs underneath it.
		 *
		 * @param {string} selector CSS selector
		 *
		 * @returns {number} Last image load time
		 */
		function determineImageLoadTime(selector) {
			var combinedSelector, elements, latestTs = 0, i, j, src, entries;

			// check to see if we have querySelectorAll available
			if (!BOOMR.window ||
			    !BOOMR.window.document ||
			    typeof BOOMR.window.document.querySelectorAll !== "function") {
				// can't use querySelectorAll
				return 0;
			}

			// check to see if we have ResourceTiming available
			if (!p ||
			    typeof p.getEntriesByType !== "function") {
				// can't use ResourceTiming
				return 0;
			}

			// find any images matching this selector or underneath this selector
			combinedSelector = selector + ", " + selector + " * img, " + selector + " * image";

			// use QSA to find all matching
			elements = BOOMR.window.document.querySelectorAll(combinedSelector);
			if (elements && elements.length) {
				for (i = 0; i < elements.length; i++) {
					src = elements[i].currentSrc ||
						elements[i].src ||
						(typeof elements[i].getAttribute === "function" && elements[i].getAttribute("xlink:href"));

					// if src if not defined, look for it in css background image
					if (!src) {
						if (typeof BOOMR.window.getComputedStyle === "function") {
							var bgStyle = BOOMR.window.getComputedStyle(elements[i]) &&
								BOOMR.window.getComputedStyle(elements[i]).getPropertyValue("background");
							if (bgStyle) {
								var bgImgUrl = bgStyle.match(/url\(["']?([^"']*)["']?\)/);
								if (bgImgUrl && bgImgUrl.length > 0) {
									src = bgImgUrl[1];
								}
							}
						}
					}

					if (src) {
						entries = p.getEntriesByName(src);
						if (entries && entries.length) {
							for (j = 0; j < entries.length; j++) {
								latestTs = Math.max(latestTs, entries[j].responseEnd);
							}
						}
					}
				}
			}

			return latestTs ? Math.floor(latestTs + epoch) : 0;
		}

		/**
		 * Determine Visually Ready time.  This is the last of:
		 * 1. First Contentful Paint (if available)
		 * 2. First Paint (if available)
		 * 3. domContentLoadedEventEnd
		 * 4. Hero Images are loaded (if configured)
		 * 5. Framework Ready (if configured)
		 *
		 * @returns {number|undefined} Timestamp, if everything is ready, or
		 *    `undefined` if not
		 */
		function determineVisuallyReady() {
			var latestTs = 0;

			// start with Framework Ready (if configured)
			if (impl.ttiWaitForFrameworkReady) {
				if (!impl.frameworkReady) {
					return;
				}

				latestTs = impl.frameworkReady;
			}

			// use First Contentful Paint (if available) or
			if (BOOMR.plugins.PaintTiming &&
			    BOOMR.plugins.PaintTiming.is_supported() &&
			    p &&
			    p.timeOrigin) {
				var fp = BOOMR.plugins.PaintTiming.getTimingFor("first-contentful-paint");
				if (!fp) {
					// or get First Paint directly from PaintTiming
					fp = BOOMR.plugins.PaintTiming.getTimingFor("first-paint");
				}

				if (fp) {
					latestTs = Math.max(latestTs, Math.round(fp + p.timeOrigin));
				}
			}
			else if (p && p.timing && p.timing.msFirstPaint) {
				// use IE's First Paint (if available) or
				latestTs = Math.max(latestTs, p.timing.msFirstPaint);
			}
			else if (BOOMR.window &&
			    BOOMR.window.chrome &&
			    typeof BOOMR.window.chrome.loadTimes === "function") {
				// use Chrome's firstPaintTime (if available)
				var loadTimes = BOOMR.window.chrome.loadTimes();
				if (loadTimes && loadTimes.firstPaintTime) {
					latestTs = Math.max(latestTs, loadTimes.firstPaintTime * 1000);
				}
			}

			// Use domContentLoadedEventEnd (if available)
			if (p && p.timing && p.timing.domContentLoadedEventEnd) {
				latestTs = Math.max(latestTs, p.timing.domContentLoadedEventEnd);
			}

			// look up any Hero Images (if configured)
			if (impl.ttiWaitForHeroImages) {
				heroImagesReady = determineImageLoadTime(impl.ttiWaitForHeroImages);

				if (heroImagesReady) {
					latestTs = Math.max(latestTs, heroImagesReady);
				}
			}

			return latestTs;
		}

		/**
		 * Adds the compressed data log to the beacon
		 */
		function addCompressedLogToBeacon() {
			var val = "";

			for (var i = 0; i < dataLog.length; i++) {
				var evt = dataLog[i];

				if (i !== 0) {
					// add a separator between events
					val += "|";
				}

				// add the type
				val += evt.type;

				// add the time: offset from epoch, base36
				val += Math.round(evt.time - epoch).toString(36);

				// add each parameter
				for (var param in evt.val) {
					if (evt.val.hasOwnProperty(param)) {
						val += "," + param;

						if (typeof evt.val[param] === "number") {
							// base36
							val += evt.val[param].toString(36);
						}
						else {
							val += evt.val[param];
						}
					}
				}
			}

			if (val !== "") {
				impl.addToBeacon("c.l", val);
			}
		}

		/**
		 * Gets the bucket log for our data
		 *
		 * @param {string} type Type
		 * @param {number} sinceBucket Lowest bucket
		 *
		 * @returns {string} Compressed log of our data
		 */
		function getCompressedBucketLogFor(type, since) {
			return compressBucketLog(
				dataOptions[type].compressMode,
				dataOptions[type].backfillLast,
				data[type],
				since !== 0 ? Math.floor((since - startTime) / COLLECTION_INTERVAL) : 0,
				getTimeBucket());
		}

		/**
		 * Adds the timeline to the beacon compressed.
		 *
		 * @param {number} [since] Since timestamp
		 */
		function addCompressedTimelineToBeacon(since) {
			var type, compressedLog;

			for (type in data) {
				if (data.hasOwnProperty((type))) {
					// get the compressed data
					compressedLog = getCompressedBucketLogFor(type, since);

					// add to the beacon
					if (compressedLog !== "") {
						impl.addToBeacon("c.t." + type, compressedLog);
					}
				}
			}
		}

		/**
		 * Analyzes metrics such as Time To Interactive
		 *
		 * @param {number} timeOfLastBeacon Time we last sent a beacon
		 */
		function analyze(timeOfLastBeacon) {
			var endBucket = getTimeBucket(),
			    j = 0,
			    idleIntervals = 0;

			// add log
			if (impl.sendLog && typeof timeOfLastBeacon !== "undefined") {
				addCompressedLogToBeacon();
			}

			// add timeline
			if (impl.sendTimeline && typeof timeOfLastBeacon !== "undefined") {
				addCompressedTimelineToBeacon(timeOfLastBeacon);
			}

			if (tti) {
				return;
			}

			// need to get Visually Ready first
			if (!visuallyReady) {
				visuallyReady = determineVisuallyReady();
				if (!visuallyReady) {
					return;
				}
			}

			// add Visually Ready to the beacon
			impl.addToBeacon("c.tti.vr", externalMetrics.timeToVisuallyReady());

			// add Framework Ready to the beacon
			impl.addToBeacon("c.tti.fr", externalMetrics.timeToFrameworkReady());

			// add Framework Ready to the beacon
			impl.addToBeacon("c.tti.hi", externalMetrics.timeToHeroImagesReady());

			// Calculate TTI
			if (!data.longtask && !data.fps && !data.busy) {
				// can't calculate TTI
				return;
			}

			// determine the first bucket we'd use
			var startBucket = Math.floor((visuallyReady - startTime) / COLLECTION_INTERVAL);

			for (j = startBucket; j <= endBucket; j++) {
				if (data.longtask && data.longtask[j]) {
					// had a long task during this interval
					idleIntervals = 0;
					continue;
				}

				if (data.fps && (!data.fps[j] || data.fps[j] < TIME_TO_INTERACTIVE_MIN_FPS_PER_INTERVAL)) {
					// No FPS or less than 20 FPS during this interval
					idleIntervals = 0;
					continue;
				}

				if (data.busy && (data.busy[j] > TIME_TO_INTERACTIVE_MAX_PAGE_BUSY)) {
					// Too busy
					idleIntervals = 0;
					continue;
				}

				if (data.interdly && data.interdly[j]) {
					// a delayed interaction happened
					idleIntervals = 0;
					continue;
				}

				// this was an idle interval
				idleIntervals++;

				// if we've found enough idle intervals, mark TTI as the beginning
				// of this idle period
				if (idleIntervals >= TIME_TO_INTERACTIVE_IDLE_INTERVALS) {
					tti = startTime + ((j - TIME_TO_INTERACTIVE_IDLE_INTERVALS) * COLLECTION_INTERVAL);

					// ensure we don't set TTI before TTVR
					tti = Math.max(tti, visuallyReady);
					break;
				}
			}

			// we were able to calculate a TTI
			if (tti > 0) {
				impl.addToBeacon("c.tti", externalMetrics.timeToInteractive());
			}
		}

		//
		// External metrics
		//

		/**
		 * Time to Interactive
		 */
		externalMetrics.timeToInteractive = function() {
			if (tti) {
				// milliseconds since nav start
				return tti - epoch;
			}

			// no data
			return;
		};

		/**
		 * Time to Visually Ready
		 */
		externalMetrics.timeToVisuallyReady = function() {
			if (visuallyReady) {
				// milliseconds since nav start
				return visuallyReady - epoch;
			}

			// no data
			return;
		};

		/**
		 * Time to Hero Images Ready
		 */
		externalMetrics.timeToHeroImagesReady = function() {
			if (impl.ttiWaitForHeroImages && heroImagesReady) {
				return heroImagesReady - epoch;
			}

			// not configured or not set
			return;
		};

		/**
		 * Time to Framework Ready
		 */
		externalMetrics.timeToFrameworkReady = function() {
			if (impl.ttiWaitForFrameworkReady && impl.frameworkReady) {
				return impl.frameworkReady - epoch;
			}

			// not configured or not set
			return;
		};

		externalMetrics.log = function() {
			return dataLog;
		};

		/**
		 * Disables the monitor
		 */
		function stop() {
			data = {};
			dataLog = [];
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			// clear the buckets
			for (var type in data) {
				if (data.hasOwnProperty(type)) {
					data[type] = [];
				}
			}

			// reset the data log
			dataLog = [];
		}

		return {
			register: register,
			set: set,
			log: log,
			increment: increment,
			getTimeBucket: getTimeBucket,
			getStats: getStats,
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors LongTasks
	 */
	var LongTaskMonitor = function(w, t) {
		if (!w.PerformanceObserver || !w.PerformanceLongTaskTiming) {
			return;
		}

		//
		// Constants
		//
		/**
		 * LongTask attribution types
		 */
		var ATTRIBUTION_TYPES = {
			"unknown": 0,
			"self": 1,
			"same-origin-ancestor": 2,
			"same-origin-descendant": 3,
			"same-origin": 4,
			"cross-origin-ancestor": 5,
			"cross-origin-descendant": 6,
			"cross-origin-unreachable": 7,
			"multiple-contexts": 8
		};

		/**
		 * LongTask culprit attribution names
		 */
		var CULPRIT_ATTRIBUTION_NAMES = {
			"unknown": 0,
			"script": 1,
			"layout": 2
		};

		/**
		 * LongTask culprit types
		 */
		var CULPRIT_TYPES = {
			"unknown": 0,
			"iframe": 1,
			"embed": 2,
			"object": 3
		};

		//
		// Local Members
		//

		// PerformanceObserver
		var perfObserver = new w.PerformanceObserver(onPerformanceObserver);

		try {
			perfObserver.observe({ entryTypes: ["longtask"] });
		}
		catch (e) {
			// longtask not supported
			return;
		}

		// register this type
		t.register("longtask", COMPRESS_MODE_SMALL_NUMBERS);

		// Long Tasks array
		var longTasks = [];

		// whether or not we're enabled
		var enabled = true;

		// total time of long tasks
		var longTasksTime = 0;

		/**
		 * Callback for the PerformanceObserver
		 */
		function onPerformanceObserver(list) {
			var entries, i;

			if (!enabled) {
				return;
			}

			// just capture all of the data for now, we'll analyze at the beacon
			entries = list.getEntries();
			Array.prototype.push.apply(longTasks, entries);

			// add total time and count of long tasks
			for (i = 0; i < entries.length; i++) {
				longTasksTime += entries[i].duration;
			}

			// add to the timeline
			t.increment("longtask", entries.length);
		}

		/**
		 * Gets the current list of tasks
		 *
		 * @returns {PerformanceEntry[]} Tasks
		 */
		function getTasks() {
			return longTasks;
		}

		/**
		 * Clears the Long Tasks
		 */
		function clearTasks() {
			longTasks = [];

			longTasksTime = 0;
		}

		/**
		 * Analyzes LongTasks
		 */
		function analyze(startTime) {
			var i, j, task, obj, objs = [], attrs = [], attr;

			if (longTasks.length === 0) {
				return;
			}

			for (i = 0; i < longTasks.length; i++) {
				task = longTasks[i];

				// compress the object a bit
				obj = {
					s: Math.round(task.startTime).toString(36),
					d: Math.ceil(task.duration).toString(36),
					n: ATTRIBUTION_TYPES[task.name] ? ATTRIBUTION_TYPES[task.name] : 0
				};

				attrs = [];

				for (j = 0; j < task.attribution.length; j++) {
					attr = task.attribution[j];

					// skip script/iframe with no attribution
					if (attr.name === "script" &&
					    attr.containerType === "iframe" &&
					    !attr.containerName &&
						!attr.containerId && !attr.containerSrc) {
						continue;
					}

					// only use containerName if not the same as containerId
					var containerName = attr.containerName ? attr.containerName : undefined;
					var containerId = attr.containerId ? attr.containerId : undefined;
					if (containerName === containerId) {
						containerName = undefined;
					}

					// only use containerSrc if containerId is undefined
					var containerSrc = containerId === undefined ? attr.containerSrc : undefined;

					attrs.push({
						a: CULPRIT_ATTRIBUTION_NAMES[attr.name] ? CULPRIT_ATTRIBUTION_NAMES[attr.name] : 0,
						t: CULPRIT_TYPES[attr.containerType] ? CULPRIT_TYPES[attr.containerType] : 0,
						n: containerName,
						i: containerId,
						s: containerSrc
					});
				}

				if (attrs.length > 0) {
					obj.a = attrs;
				}

				objs.push(obj);
			}

			// add data to beacon
			impl.addToBeacon("c.lt.n", externalMetrics.longTasksCount(), true);
			impl.addToBeacon("c.lt.tt", externalMetrics.longTasksTime());

			impl.addToBeacon("c.lt", compressJson(objs));
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			enabled = false;

			perfObserver.disconnect();

			clearTasks();
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			clearTasks();
		}

		//
		// External metrics
		//

		/**
		 * Total time of LongTasks (ms)
		 */
		externalMetrics.longTasksTime = function() {
			return longTasksTime;
		};

		/**
		 * Number of LongTasks
		 */
		externalMetrics.longTasksCount = function() {
			return longTasks.length;
		};

		return {
			getTasks: getTasks,
			clearTasks: clearTasks,
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors Page Busy if LongTasks isn't supported
	 */
	var PageBusyMonitor = function(w, t) {
		// register this type
		t.register("busy", COMPRESS_MODE_PERCENT);

		//
		// Constants
		//

		/**
		 * How frequently to poll (ms).
		 *
		 * IE and Edge clamp polling to the nearest 16ms.  With 32ms, we
		 * will see approximately 3 polls per 100ms.
		 */
		var POLLING_INTERVAL = 32;

		/**
		 * How much deviation from the expected time to allow (ms)
		 */
		var ALLOWED_DEVIATION_MS = 4;

		/**
		 * How often to report on Page Busy (ms)
		 */
		var REPORT_INTERVAL = 100;

		/**
		 * How many polls there were per-report
		 */
		var POLLS_PER_REPORT =
		    Math.floor(REPORT_INTERVAL / POLLING_INTERVAL);

		/**
		 * How many missed polls should we go backwards? (10 seconds worth)
		 */
		var MAX_MISSED_REPORTS = 100;

		//
		// Local Members
		//

		// last time we ran
		var last = BOOMR.now();

		// total callbacks
		var total = 0;

		// late callbacks
		var late = 0;

		// overall total and late callbacks (reset on beacon)
		var overallTotal = 0;
		var overallLate = 0;

		// whether or not we're enabled
		var enabled = true;

		// intervals
		var pollInterval = false;
		var reportInterval = false;

		/**
		 * Polling interval
		 */
		function onPoll() {
			var now = BOOMR.now();
			var delta = now - last;
			last = now;

			// if we're more than 2x the polling interval
			// + deviation, we missed at least one period completely
			if (delta > ((POLLING_INTERVAL * 2) + ALLOWED_DEVIATION_MS)) {
				var missedPolls = Math.floor((delta - POLLING_INTERVAL) / POLLING_INTERVAL);

				total += missedPolls;
				late += missedPolls;
				delta -= (missedPolls * POLLING_INTERVAL);
			}

			// total intervals increased by one
			total++;

			// late intervals increased by one if we're more than the interval + deviation
			if (delta > (POLLING_INTERVAL + ALLOWED_DEVIATION_MS)) {
				late++;
			}
		}

		/**
		 * Each reporting interval, log page busy
		 */
		function onReport() {
			var reportTime = t.getTimeBucket();
			var curTime = reportTime;
			var missedReports = 0;

			if (total === 0) {
				return;
			}

			// if we had more polls than we expect in each
			// collection period (we allow one extra for wiggle room), we
			// must not have been able to report, so assume those periods were 100%
			while (total > (POLLS_PER_REPORT + 1) &&
			       missedReports <= MAX_MISSED_REPORTS) {
				t.set("busy", 100, --curTime);

				// reset the period by one
				total -= POLLS_PER_REPORT;
				late   = Math.max(late - POLLS_PER_REPORT, 0);

				// this was a busy period
				overallTotal += POLLS_PER_REPORT;
				overallLate += POLLS_PER_REPORT;

				missedReports++;
			}

			// update the total stats
			overallTotal += total;
			overallLate += late;

			t.set("busy", Math.ceil(late / total * 100), reportTime);

			// reset stats
			total = 0;
			late = 0;
		}

		/**
		 * Analyzes Page Busy
		 */
		function analyze(startTime) {
			// add data to beacon
			impl.addToBeacon("c.b", externalMetrics.pageBusy());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			enabled = false;

			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = false;
			}

			if (reportInterval) {
				clearInterval(reportInterval);
				reportInterval = false;
			}
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			overallTotal = 0;
			overallLate = 0;
		}

		//
		// External metrics
		//

		/**
		 * Total Page Busy time
		 */
		externalMetrics.pageBusy = function() {
			if (overallTotal === 0) {
				return 0;
			}

			return Math.ceil(overallLate / overallTotal * 100);
		};

		//
		// Setup
		//
		pollInterval = setInterval(onPoll, POLLING_INTERVAL);
		reportInterval = setInterval(onReport, REPORT_INTERVAL);

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors framerate (FPS)
	 */
	var FrameRateMonitor = function(w, t) {
		// register this type
		t.register("fps", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Constants
		//

		// long frame maximum milliseconds
		var LONG_FRAME_MAX = 50;

		//
		// Local Members
		//

		// total frames seen
		var totalFrames = 0;

		// long frames
		var longFrames = 0;

		// time we started monitoring
		var frameStartTime;

		// last frame we saw
		var lastFrame;

		// whether or not we're enabled
		var enabled = true;

		// check for pre-Boomerang FPS log
		if (BOOMR.fpsLog && BOOMR.fpsLog.length) {
			lastFrame = frameStartTime = BOOMR.fpsLog[0] + epoch;

			// transition any FPS log events to our timeline
			for (var i = 0; i < BOOMR.fpsLog.length; i++) {
				var ts = epoch + BOOMR.fpsLog[i];

				// update the frame count for this time interval
				t.increment("fps", 1, Math.floor((ts - frameStartTime) / COLLECTION_INTERVAL));

				// calculate how long this frame took
				if (ts - lastFrame >= LONG_FRAME_MAX) {
					longFrames++;
				}

				// last frame timestamp
				lastFrame = ts;
			}

			totalFrames = BOOMR.fpsLog.length;

			delete BOOMR.fpsLog;
		}
		else {
			frameStartTime = BOOMR.now();
		}

		/**
		 * requestAnimationFrame callback
		 */
		function frame(now) {
			if (!enabled) {
				return;
			}

			// calculate how long this frame took
			if (now - lastFrame >= LONG_FRAME_MAX) {
				longFrames++;
			}

			// last frame timestamp
			lastFrame = now;

			// keep track of total frames we've seen
			totalFrames++;

			// increment the FPS
			t.increment("fps");

			// request the next frame
			w.requestAnimationFrame(frame);
		}

		/**
		 * Analyzes FPS
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.f", externalMetrics.fps());
			impl.addToBeacon("c.f.d", externalMetrics.fpsDuration());
			impl.addToBeacon("c.f.m", externalMetrics.fpsMinimum());
			impl.addToBeacon("c.f.l", externalMetrics.fpsLongFrames());
			impl.addToBeacon("c.f.s", externalMetrics.fpsStart());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			enabled = false;
			frameStartTime = 0;
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			if (enabled) {
				// restart to now
				frameStartTime = BOOMR.now();
			}

			totalFrames = 0;
			longFrames = 0;
		}

		// start the first frame
		w.requestAnimationFrame(frame);

		//
		// External metrics
		//

		/**
		 * Frame Rate since fpsStart
		 */
		externalMetrics.fps = function() {
			var dur = externalMetrics.fpsDuration();
			if (dur) {
				return Math.floor(totalFrames / (dur / 1000));
			}
		};

		/**
		 * How long FPS was being tracked for
		 */
		externalMetrics.fpsDuration = function() {
			if (frameStartTime) {
				return BOOMR.now() - frameStartTime;
			}
		};

		/**
		 * Minimum FPS during the period
		 */
		externalMetrics.fpsMinimum = function() {
			var dur = externalMetrics.fpsDuration();
			if (dur) {
				var min = t.getStats("fps", frameStartTime).min;
				return min !== Infinity ? min : undefined;
			}
		};

		/**
		 * Number of long frames (over 18ms)
		 */
		externalMetrics.fpsLongFrames = function() {
			return longFrames;
		};

		/**
		 * When FPS tracking started (base 36)
		 */
		externalMetrics.fpsStart = function() {
			return frameStartTime ? frameStartTime.toString(36) : 0;
		};

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors scrolling
	 */
	var ScrollMonitor = function(w, t, i) {
		if (!w || !w.document || !w.document.body || !w.document.documentElement) {
			// something's wrong with the DOM, abort
			return;
		}

		//
		// Constants
		//

		// number of milliseconds between each distinct scroll
		var DISTINCT_SCROLL_SECONDS = 2000;

		// number of pixels to change before logging a scroll event
		var MIN_SCROLL_Y_CHANGE_FOR_LOG = 20;

		//
		// Local Members
		//

		// last scroll Y
		var lastY = 0;

		// last scroll Y logged
		var lastYLogged = 0;

		// scroll % this period
		var intervalScrollPct = 0;

		// scroll % total
		var totalScrollPct = 0;

		// number of scroll events
		var scrollCount = 0;

		// total scroll pixels
		var scrollPixels = 0;

		// number of distinct scrolls (scroll which happened
		// over DISTINCT_SCROLL_SECONDS seconds apart)
		var distinctScrollCount = 0;

		// last time we scrolled
		var lastScroll = 0;

		// collection interval id
		var collectionInterval = false;

		// body and html element
		var body = w.document.body;
		var html = w.document.documentElement;

		// register this type
		t.register("scroll", COMPRESS_MODE_SMALL_NUMBERS);
		t.register("scrollpct", COMPRESS_MODE_PERCENT);

		// height of the document
		var documentHeight = Math.max(
			body.scrollHeight,
			body.offsetHeight,
			html.clientHeight,
			html.scrollHeight,
			html.offsetHeight) - BOOMR.utils.windowHeight();

		/**
		 * Fired when a scroll event happens
		 *
		 * @param {Event} e Scroll event
		 */
		function onScroll(e) {
			var now = BOOMR.now();

			scrollCount++;

			// see if this is a unique scroll
			if (now - lastScroll > DISTINCT_SCROLL_SECONDS) {
				distinctScrollCount++;
			}

			lastScroll = now;

			// determine how many pixels were scrolled
			var curY = BOOMR.utils.scroll().y;
			var diffY = Math.abs(lastY - curY);

			scrollPixels += diffY;

			// update the timeline
			t.increment("scroll", diffY);

			// only log the event if we're over the threshold
			if (lastYLogged === 0 || Math.abs(lastYLogged - curY) > MIN_SCROLL_Y_CHANGE_FOR_LOG) {
				// add to the log
				t.log(LOG_TYPE_SCROLL, now, {
					y: curY
				});

				lastYLogged = curY;
			}

			// update the interaction monitor
			i.interact("scroll", now, e);

			// calculate percentage of document scrolled
			intervalScrollPct += Math.round(diffY / documentHeight * 100);
			totalScrollPct += Math.round(diffY / documentHeight * 100);

			lastY = curY;
		}

		/**
		 * Reports on the number of scrolls seen
		 */
		function reportScroll() {
			var pct = Math.min(intervalScrollPct, 100);

			if (pct !== 0) {
				t.set("scrollpct", pct);
			}

			// reset count
			intervalScrollPct = 0;
		}

		/**
		 * Analyzes Scrolling events
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.s", externalMetrics.scrollCount());
			impl.addToBeacon("c.s.p", externalMetrics.scrollPct());
			impl.addToBeacon("c.s.y", externalMetrics.scrollPixels());
			impl.addToBeacon("c.s.d", externalMetrics.scrollDistinct());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			if (collectionInterval) {
				clearInterval(collectionInterval);

				collectionInterval = false;
			}

			BOOMR.utils.removeListener(w, "scroll", onScroll);
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			totalScrollPct = 0;
			scrollCount = 0;
			scrollPixels = 0;
			distinctScrollCount = 0;
		}

		//
		// External metrics
		//

		/**
		 * Percentage of the screen that was scrolled.
		 *
		 * All the way to the bottom = 100%
		 */
		externalMetrics.scrollPct = function() {
			return totalScrollPct;
		};

		/**
		 * Number of scrolls
		 */
		externalMetrics.scrollCount = function() {
			return scrollCount;
		};

		/**
		 * Number of scrolls (more than two seconds apart)
		 */
		externalMetrics.scrollDistinct = function() {
			return distinctScrollCount;
		};

		/**
		 * Number of pixels scrolled
		 */
		externalMetrics.scrollPixels = function() {
			return scrollPixels;
		};

		// startup
		BOOMR.utils.addListener(w, "scroll", onScroll, true);

		collectionInterval = setInterval(reportScroll, COLLECTION_INTERVAL);

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors mouse clicks
	 */
	var ClickMonitor = function(w, t, i) {
		// register this type
		t.register("click", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Constants
		//

		// number of pixels area for Rage Clicks
		var PIXEL_AREA = 10;

		// number of clicks in the same area to trigger a Rage Click
		var RAGE_CLICK_THRESHOLD = 3;

		//
		// Local Members
		//

		// number of click events
		var clickCount = 0;

		// number of clicks in the same PIXEL_AREA area
		var sameClicks = 0;

		// number of Rage Clicks
		var rageClicks = 0;

		// last coordinates
		var x = 0;
		var y = 0;

		// last click target
		var lastTarget = null;

		/**
		 * Fired when a `click` event happens.
		 *
		 * @param {Event} e Event
		 */
		function onClick(e) {
			var now = BOOMR.now();

			var newX = e.clientX;
			var newY = e.clientY;

			// track total number of clicks
			clickCount++;

			// calculate number of pixels moved
			var pixels = Math.round(
				Math.sqrt(Math.pow(y - newY, 2) +
				Math.pow(x - newX, 2)));

			// track Rage Clicks
			if (lastTarget === e.target || pixels <= PIXEL_AREA) {
				sameClicks++;

				if ((sameClicks + 1) >= RAGE_CLICK_THRESHOLD) {
					rageClicks++;

					// notify any listeners
					BOOMR.fireEvent("rage_click", e);
				}
			}
			else {
				sameClicks = 0;
			}

			// track last click coordinates and element
			x = newX;
			y = newY;
			lastTarget = e.target;

			// update the timeline
			t.increment("click");

			// add to the log
			t.log(LOG_TYPE_CLICK, now, {
				x: newX,
				y: newY
			});

			// update the interaction monitor
			i.interact("click", now, e);
		}

		/**
		 * Analyzes Click events
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.c", externalMetrics.clicksCount());
			impl.addToBeacon("c.c.r", externalMetrics.clicksRage());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			BOOMR.utils.removeListener(w.document, "click", onClick);
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			clickCount = 0;
			sameClicks = 0;
			rageClicks = 0;
		}

		//
		// External metrics
		//
		externalMetrics.clicksCount = function() {
			return clickCount;
		};

		externalMetrics.clicksRage = function() {
			return rageClicks;
		};

		//
		// Startup
		//
		BOOMR.utils.addListener(w.document, "click", onClick, true);

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors keyboard events
	 */
	var KeyMonitor = function(w, t, i) {
		// register this type
		t.register("key", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Local members
		//

		// key presses
		var keyCount = 0;

		// esc key presses
		var escKeyCount = 0;

		/**
		 * Fired on key down
		 *
		 * @param {Event} e keydown event
		 */
		function onKeyDown(e) {
			var now = BOOMR.now();

			keyCount++;

			if (e.keyCode === 27) {
				escKeyCount++;
			}

			// update the timeline
			t.increment("key");

			// add to the log (don't track the actual keys)
			t.log(LOG_TYPE_KEY, now);

			// update the interaction monitor
			i.interact("key", now, e);
		}

		/**
		 * Analyzes Key events
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.k", externalMetrics.keyCount());
			impl.addToBeacon("c.k.e", externalMetrics.keyEscapes());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			BOOMR.utils.removeListener(w.document, "keydown", onKeyDown);
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			keyCount = 0;
			escKeyCount = 0;
		}

		//
		// External metrics
		//
		externalMetrics.keyCount = function() {
			return keyCount;
		};

		externalMetrics.keyEscapes = function() {
			return escKeyCount;
		};

		// start
		BOOMR.utils.addListener(w.document, "keydown", onKeyDown, true);

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors mouse movement
	 */
	var MouseMonitor = function(w, t, i) {
		// register the mouse movements and overall percentage moved
		t.register("mouse", COMPRESS_MODE_SMALL_NUMBERS);
		t.register("mousepct", COMPRESS_MODE_PERCENT);

		//
		// Constants
		//

		/**
		 * Minimum number of pixels that change from last before logging
		 */
		var MIN_LOG_PIXEL_CHANGE = 10;

		/**
		 * Mouse log interval
		 */
		var REPORT_LOG_INTERVAL = 250;

		//
		// Local members
		//

		// last movement coordinates
		var lastX = 0;
		var lastY = 0;

		// last reported X/Y
		var lastLogX = 0;
		var lastLogY = 0;

		// mouse move screen percent this interval
		var intervalMousePct = 0;

		// total mouse move percent
		var totalMousePct = 0;

		// total mouse move pixels
		var totalMousePixels = 0;

		// interval ids
		var reportMousePctInterval = false;
		var reportMouseLogInterval = false;

		// screen pixel count
		var screenPixels = Math.round(Math.sqrt(
			Math.pow(BOOMR.utils.windowHeight(), 2) +
			Math.pow(BOOMR.utils.windowWidth(), 2)));

		/**
		 * Fired when a `mousemove` event happens.
		 *
		 * @param {Event} e Event
		 */
		function onMouseMove(e) {
			var newX = e.clientX;
			var newY = e.clientY;

			// calculate number of pixels moved
			var pixels = Math.round(Math.sqrt(Math.pow(lastY - newY, 2) +
			                        Math.pow(lastX - newX, 2)));

			// calculate percentage of screen moved (upper-left to lower-right = 100%)
			var newPct = Math.round(pixels / screenPixels * 100);
			intervalMousePct += newPct;
			totalMousePct += newPct;
			totalMousePixels += pixels;

			lastX = newX;
			lastY = newY;

			// Note: don't mark a mouse movement as an interaction (i.interact)

			t.increment("mouse", pixels);
		}

		/**
		 * Reports on the mouse percentage change
		 */
		function reportMousePct() {
			var pct = Math.min(intervalMousePct, 100);

			if (pct !== 0) {
				t.set("mousepct", pct);
			}

			// reset count
			intervalMousePct = 0;
		}

		/**
		 * Updates the log if the mouse has moved enough
		 */
		function reportMouseLog() {
			// Only log if X,Y have changed and have changed over the specified
			// minimum theshold.
			if (lastLogX !== lastX ||
			    lastLogY !== lastY) {
				var pixels = Math.round(Math.sqrt(Math.pow(lastLogY - lastY, 2) +
										Math.pow(lastLogX - lastX, 2)));

				if (pixels >= MIN_LOG_PIXEL_CHANGE) {
					// add to the log
					t.log(LOG_TYPE_MOUSE, BOOMR.now(), {
						x: lastX,
						y: lastY
					});

					lastLogX = lastX;
					lastLogY = lastY;
				}
			}
		}

		/**
		 * Analyzes Mouse events
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.m.p", externalMetrics.mousePct());
			impl.addToBeacon("c.m.n", externalMetrics.mousePixels());
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			if (reportMousePctInterval) {
				clearInterval(reportMousePctInterval);

				reportMousePctInterval = false;
			}

			if (reportMouseLogInterval) {
				clearInterval(reportMouseLogInterval);

				reportMouseLogInterval = false;
			}

			BOOMR.utils.removeListener(w.document, "mousemove", onMouseMove);
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			totalMousePct = 0;
			totalMousePixels = 0;
		}

		//
		// External metrics
		//

		/**
		 * Percentage the mouse moved
		 */
		externalMetrics.mousePct = function() {
			return totalMousePct;
		};

		/**
		 * Pixels the mouse moved
		 */
		externalMetrics.mousePixels = function() {
			return totalMousePixels;
		};

		reportMousePctInterval = setInterval(reportMousePct, COLLECTION_INTERVAL);
		reportMouseLogInterval = setInterval(reportMouseLog, REPORT_LOG_INTERVAL);

		// start
		BOOMR.utils.addListener(w.document, "mousemove", onMouseMove, true);

		return {
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Interaction monitor
	 */
	var InteractionMonitor = function(w, t, afterOnloadMinWait) {
		// register this type
		t.register("inter", COMPRESS_MODE_SMALL_NUMBERS);
		t.register("interdly", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Constants
		//

		/**
		 * Interaction maximum delay (ms)
		 */
		var INTERACTION_MAX_DELAY = 50;

		/**
		 * How long after an interaction to wait before sending a beacon (ms).
		 */
		var INTERACTION_MIN_WAIT_FOR_BEACON = afterOnloadMinWait;

		/**
		 * Maximum amount of time after the first interaction before sending
		 * a beacon (ms).
		 */
		var INTERACTION_MAX_WAIT_FOR_BEACON = 30000;

		//
		// Local Members
		//

		// Time of first interaction
		var timeToFirstInteraction = 0;

		// First Input Delay
		var firstInputDelay = null;

		// Interaction count
		var interactions = 0;

		// Interaction delay total
		var interactionsDelay = 0;

		// Delayed interactions
		var delayedInteractions = 0;

		// Delayed interaction time
		var delayedInteractionTime = 0;

		// whether or not we're enabled
		var enabled = true;

		// interaction beacon start time
		var beaconStartTime = 0;

		// interaction beacon end time
		var beaconEndTime = 0;

		// interaction beacon timers
		var beaconMinTimeout = false;
		var beaconMaxTimeout = false;

		// whether or not a SPA nav is happening
		var isSpaNav = false;

		/**
		 * Logs an interaction
		 *
		 * @param {string} type Interaction type
		 * @param {number} now Time of callback
		 * @param {Event} e Event
		 */
		function interact(type, now, e) {
			var delay = 0;

			now = now || BOOMR.now();

			if (!enabled) {
				return;
			}

			interactions++;

			if (!timeToFirstInteraction) {
				timeToFirstInteraction = now;
			}

			// check for interaction delay.
			// Don't use the event timeStamp in Safari if we were not loaded in the same window as the base page.
			// The timeStamp's time origin will not be that of the base page and our timings will be skewed.
			// See https://bugs.webkit.org/show_bug.cgi?id=200355
			if (e && e.timeStamp && !(impl.isSafari && w !== window)) {
				if (e.timeStamp > 1400000000000) {
					delay = now - e.timeStamp;
				}
				else {
					// if timeStamp is a DOMHighResTimeStamp, convert BOOMR.now() to same
					delay = (now - epoch) - e.timeStamp;
				}

				interactionsDelay += delay;

				// log first input delay
				if (firstInputDelay === null) {
					firstInputDelay = Math.ceil(delay);
				}

				// log as a delayed interaction
				if (delay > INTERACTION_MAX_DELAY) {
					t.increment("interdly");

					delayedInteractions++;
					delayedInteractionTime += delay;
				}
			}

			// increment the FPS
			t.increment("inter");

			//
			// If we're doing after-page-load monitoring, start a timer to report
			// on this interaction.  We will wait up to INTERACTION_MIN_WAIT_FOR_BEACON
			// ms before sending the beacon, sliding the window if there are
			// more interactions, up to a max of INTERACTION_MAX_WAIT_FOR_BEACON ms.
			//
			if (!isSpaNav && impl.afterOnloadMonitoring) {
				// mark now as the latest interaction
				beaconEndTime = BOOMR.now();

				if (!beaconStartTime) {
					debug("Interaction detected, sending a beacon after " +
						INTERACTION_MIN_WAIT_FOR_BEACON + " ms");

					// first interaction for this beacon
					beaconStartTime = beaconEndTime;

					// set a timer for the max timeout
					beaconMaxTimeout = setTimeout(sendInteractionBeacon,
						INTERACTION_MAX_WAIT_FOR_BEACON);
				}

				// if there was a timer for the min timeout, clear it first
				if (beaconMinTimeout) {
					debug("Clearing previous interaction timeout");

					clearTimeout(beaconMinTimeout);
					beaconMinTimeout = false;
				}

				// set a timer for the min timeout
				beaconMinTimeout = setTimeout(sendInteractionBeacon,
					INTERACTION_MIN_WAIT_FOR_BEACON);
			}
		}

		/**
		 * Fired on spa_init
		 */
		function onSpaInit() {
			// note we're in a SPA nav right now
			isSpaNav = true;

			// clear any interaction beacon timers
			clearBeaconTimers();
		}

		/**
		 * Clears interaction beacon timers.
		 */
		function clearBeaconTimers() {
			if (beaconMinTimeout) {
				clearTimeout(beaconMinTimeout);
				beaconMinTimeout = false;
			}

			if (beaconMaxTimeout) {
				clearTimeout(beaconMaxTimeout);
				beaconMaxTimeout = false;
			}
		}

		/**
		 * Fired when an interaction beacon timed-out
		 */
		function sendInteractionBeacon() {
			debug("Sending interaction beacon");

			// Queue a beacon whenever there isn't another one ongoing
			BOOMR.sendBeaconWhenReady(
				{
					// change this to an 'interaction' beacon
					"rt.start": "manual",
					"http.initiator": "interaction",

					// when
					"rt.tstart": beaconStartTime,
					"rt.end": beaconEndTime
				},
				function() {
					clearBeaconTimers();

					// notify anyone listening for an interaction event
					BOOMR.fireEvent("interaction");
				},
				impl);
		}

		/**
		 * Analyzes Interactions
		 */
		function analyze(startTime) {
			impl.addToBeacon("c.ttfi", externalMetrics.timeToFirstInteraction());
			impl.addToBeacon("c.i.dc", externalMetrics.interactionDelayed());
			impl.addToBeacon("c.i.dt", externalMetrics.interactionDelayedTime());
			impl.addToBeacon("c.i.a", externalMetrics.interactionAvgDelay());

			if (firstInputDelay !== null) {
				impl.addToBeacon("c.fid", externalMetrics.firstInputDelay(), true);
			}
		}

		/**
		 * Disables the monitor
		 */
		function stop() {
			enabled = false;
		}

		/**
		 * Resets on beacon
		 */
		function onBeacon() {
			delayedInteractionTime = 0;
			delayedInteractions = 0;
			interactions = 0;
			interactionsDelay = 0;

			beaconStartTime = 0;
			beaconEndTime = 0;

			// no longer in a SPA nav
			isSpaNav = false;

			// if we had queued an interaction beacon, but something else is
			// firing instead, use that data
			clearBeaconTimers();
		}

		//
		// External metrics
		//
		externalMetrics.interactionDelayed = function() {
			return delayedInteractions;
		};

		externalMetrics.interactionDelayedTime = function() {
			return Math.ceil(delayedInteractionTime);
		};

		externalMetrics.interactionAvgDelay = function() {
			if (interactions > 0) {
				return Math.ceil(interactionsDelay / interactions);
			}
		};

		externalMetrics.timeToFirstInteraction = function() {
			if (timeToFirstInteraction) {
				// milliseconds since nav start
				return timeToFirstInteraction - epoch;
			}

			// no data
			return;
		};

		externalMetrics.firstInputDelay = function() {
			if (firstInputDelay !== null) {
				return firstInputDelay;
			}

			// no data
			return;
		};

		//
		// Setup
		//

		// clear interaction beacon timer if a SPA is starting
		BOOMR.subscribe("spa_init", onSpaInit, null, impl);

		return {
			interact: interact,
			analyze: analyze,
			stop: stop,
			onBeacon: onBeacon
		};
	};

	/**
	 * Monitors for visibility state changes
	 */
	var VisibilityMonitor = function(w, t, i) {
		// register this type
		t.register("vis", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Constants
		//

		/**
		 * Maps visibilityState from a string to a number
		 */
		var VIS_MAP = {
			"visible": 0,
			"hidden": 1,
			"prerender": 2,
			"unloaded": 3
		};

		//
		// Locals
		//
		var enabled = true;

		BOOMR.subscribe("visibility_changed", function(e) {
			var now = BOOMR.now();

			if (!enabled) {
				return;
			}

			// update the timeline
			t.increment("vis");

			// add to the log (don't track the actual keys)
			t.log(LOG_TYPE_VIS, now, {
				s: VIS_MAP[BOOMR.visibilityState()]
			});

			// update the interaction monitor
			i.interact("vis", now, e);
		});

		/**
		 * Stops this monitor
		 */
		function stop() {
			enabled = false;
		}

		return {
			stop: stop
		};
	};

	/**
	 * Monitors for orientation changes
	 */
	var OrientationMonitor = function(w, t, i) {
		// register this type
		t.register("orn", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Locals
		//
		var enabled = true;

		/**
		 * Fired when the orientation changes
		 *
		 * @param {Event} e Event
		 */
		function onOrientationChange(e) {
			var now = BOOMR.now(), angle = window.orientation;

			if (!enabled) {
				return;
			}

			// update the timeline
			t.increment("orn");

			var orientation = window.screen && (screen.orientation || screen.msOrientation || screen.mozOrientation || {});

			// override with Screen Orientation API if available
			if (orientation && typeof orientation.angle === "number") {
				angle = screen.orientation.angle;
			}

			if (typeof angle === "number") {
				// add to the log (don't track the actual keys)
				t.log(LOG_TYPE_ORIENTATION, now, {
					a: angle
				});
			}

			// update the interaction monitor
			i.interact("orn", now, e);
		}

		/**
		 * Stops this monitor
		 */
		function stop() {
			enabled = false;

			BOOMR.utils.removeListener(w, "orientationchange", onOrientationChange);
		}

		//
		// Setup
		//
		BOOMR.utils.addListener(w, "orientationchange", onOrientationChange, true);

		return {
			stop: stop
		};
	};

	/**
	 * Monitors for misc stats such as memory usage, battery level, etc.
	 *
	 * Note: Not reporting on ResourceTiming entries or Errors since those
	 * will be captured by the respective plugins.
	 */
	var StatsMonitor = function(w, t) {
		// register types
		t.register("mem", COMPRESS_MODE_LARGE_NUMBERS, true);
		t.register("bat", COMPRESS_MODE_PERCENT, true);
		t.register("domsz", COMPRESS_MODE_LARGE_NUMBERS, true);
		t.register("domln", COMPRESS_MODE_LARGE_NUMBERS, true);
		t.register("mut", COMPRESS_MODE_SMALL_NUMBERS);

		//
		// Constants
		//

		/**
		 * Report stats every second
		 */
		var REPORT_INTERVAL = 1000;

		//
		// Locals
		//
		var d = w.document;

		/**
		 * Whether or not we're enabled
		 */
		var enabled = true;

		/**
		 * Report interval ID
		 */
		var reportInterval = false;

		/**
		 * navigator.getBattery() object
		 */
		var battery = null;

		/**
		 * Number of mutations since last reset
		 */
		var mutationCount = 0;

		/**
		 * DOM length
		 */
		var domLength = 0;

		/**
		 * Live HTMLCollection of found elements
		 *
		 * Keep this live collection around as it's cheaper to call
		 * .length on it over time than re-running getElementsByTagName()
		 * each time
		 */
		var domAllNodes = d.getElementsByTagName("*");

		/**
		 * MutationObserver
		 */
		var observer;

		/**
		 * Fired on an interval to report stats such as memory usage
		 */
		function reportStats() {
			//
			// Memory
			//
			var mem = p &&
			    p.memory &&
			    p.memory.usedJSHeapSize;

			if (mem) {
				t.set("mem", mem);
			}

			//
			// DOM sizes (bytes) and length (node count)
			//
			domLength = domAllNodes.length;

			t.set("domsz", d.documentElement.innerHTML.length);
			t.set("domln", domLength);

			//
			// DOM mutations
			//
			if (mutationCount > 0) {
				// report as % of DOM size
				var deltaPct = Math.min(Math.round(mutationCount / domLength * 100), 100);

				t.set("mut", deltaPct);

				mutationCount = 0;
			}
		}

		/**
		 * Fired when the battery level changes
		 */
		function onBatteryLevelChange() {
			if (!enabled || !battery) {
				return;
			}

			t.set("bat", battery.level);
		}

		/**
		 * Fired on MutationObserver callback
		 */
		function onMutationObserver(mutations) {
			mutations.forEach(function(mutation) {
				// only listen for childList changes
				if (mutation.type !== "childList") {
					return true;
				}

				for (var i = 0; i < mutation.addedNodes.length; i++) {
					var node = mutation.addedNodes[i];

					// add mutations for this node and all sub-nodes
					mutationCount++;
					mutationCount += node.getElementsByTagName ?
						node.getElementsByTagName("*").length : 0;
				}
			});
			return true;
		}

		/**
		 * Stops this monitor
		 */
		function stop() {
			enabled = false;

			// stop reporting on metrics
			if (reportInterval) {
				clearInterval(reportInterval);
				reportInterval = false;
			}

			// disconnect MO
			if (observer && observer.observer) {
				observer.observer.disconnect();
				observer = null;
			}

			// stop listening for battery info
			if (battery && battery.onlevelchange) {
				battery.onlevelchange = null;
			}

			domAllNodes = null;
		}

		//
		// Setup
		//

		// misc stats
		reportInterval = setInterval(reportStats, REPORT_INTERVAL);

		// Battery
		if (w.navigator && typeof w.navigator.getBattery === "function") {
			w.navigator.getBattery().then(function(b) {
				battery = b;

				if (battery.onlevelchange) {
					battery.onlevelchange = onBatteryLevelChange;
				}
			});
		}

		// MutationObserver
		if (BOOMR.utils.isMutationObserverSupported()) {
			// setup the observer
			observer = BOOMR.utils.addObserver(
				d,
				{ childList: true, subtree: true },
				null, // no timeout
				onMutationObserver, // will always return true
				null, // no callback data
				this
			);
		}

		return {
			stop: stop
		};
	};

	//
	// Continuity implementation
	//
	impl = {
		//
		// Config
		//
		/**
		 * Whether or not to monitor longTasks
		 */
		monitorLongTasks: true,

		/**
		 * Whether or not to monitor Page Busy
		 */
		monitorPageBusy: true,

		/**
		 * Whether or not to monitor FPS
		 */
		monitorFrameRate: true,

		/**
		 * Whether or not to monitor interactions
		 */
		monitorInteractions: true,

		/**
		 * Whether or not to monitor page stats
		 */
		monitorStats: false,

		/**
		 * Whether to monitor for interactions after onload
		 */
		afterOnload: false,

		/**
		 * Max recording length after onload (if not a SPA) (ms)
		 */
		afterOnloadMaxLength: DEFAULT_AFTER_ONLOAD_MAX_LENGTH,

		/**
		 * Minium number of ms after an interaction to wait before sending
		 * an interaction beacon
		 */
		afterOnloadMinWait: 5000,

		/**
		 * Number of milliseconds after onload to wait for TTI, or,
		 * false if not configured.
		 */
		waitAfterOnload: false,

		/**
		 * Whether or not to wait for a call to
		 * frameworkReady() before starting TTI calculations
		 */
		ttiWaitForFrameworkReady: false,

		/**
		 * If set, wait for the specified CSS selector of hero images to have
		 * loaded before starting TTI calculations
		 */
		ttiWaitForHeroImages: false,

		/**
		 * Whether or not to send a detailed log of all events.
		 */
		sendLog: true,

		/**
		 * Whether or not to send a compressed timeline of events
		 */
		sendTimeline: true,

		/**
		 * Maximum number of long entries to keep
		 */
		logMaxEntries: 100,

		//
		// State
		//
		/**
		 * Whether or not we're initialized
		 */
		initialized: false,

		/**
		 * Whether we're ready to send a beacon
		 */
		complete: false,

		/**
		 * Whether or not this is an SPA app
		 */
		isSpa: false,

		/**
		 * Whether Page Ready has fired or not
		 */
		firedPageReady: false,

		/**
		 * Whether or not we're currently monitoring for interactions
		 * after the Page Load beacon
		 */
		afterOnloadMonitoring: false,

		/**
		 * Framework Ready time, if configured
		 */
		frameworkReady: null,

		/**
		 * Timeline
		 */
		timeline: null,

		/**
		 * TTI method used (highest accuracy):
		 * * `lt` (LongTasks)
		 * * `raf` (requestAnimationFrame)
		 * * `b` (Page Busy polling)
		 */
		ttiMethod: null,

		/**
		 * LongTaskMonitor
		 */
		longTaskMonitor: null,

		/**
		 * PageBusyMonitor
		 */
		pageBusyMonitor: null,

		/**
		 * FrameRateMonitor
		 */
		frameRateMonitor: null,

		/**
		 * InteractionMonitor
		 */
		interactionMonitor: null,

		/**
		 * ScrollMontior
		 */
		scrollMonitor: null,

		/**
		 * ClickMonitor
		 */
		clickMonitor: null,

		/**
		 * KeyMonitor
		 */
		keyMonitor: null,

		/**
		 * MouseMonitor
		 */
		mouseMonitor: null,

		/**
		 * VisibilityMonitor
		 */
		visibilityMonitor: null,

		/**
		 * OrientationMonitor
		 */
		orientationMonitor: null,

		/**
		 * StatsMonitor
		 */
		statsMonitor: null,

		/**
		 * All possible monitors
		 */
		monitors: [
			"timeline",
			"longTaskMonitor",
			"pageBusyMonitor",
			"frameRateMonitor",
			"scrollMonitor",
			"keyMonitor",
			"clickMonitor",
			"mouseMonitor",
			"interactionMonitor",
			"visibilityMonitor",
			"orientationMonitor",
			"statsMonitor"
		],

		/**
		 * When we last sent a beacon
		 */
		timeOfLastBeacon: 0,

		/**
		 * Whether or not we've added data to this beacon
		 */
		hasAddedDataToBeacon: false,

		/*
		 * Safari check, desktop and iOS
		 */
		 isSafari: (window && window.navigator && window.navigator.vendor && window.navigator.vendor.indexOf("Apple") !== -1),

		//
		// Callbacks
		//
		/**
		 * Callback before the beacon is going to be sent
		 */
		onBeforeBeacon: function() {
			impl.runAllAnalyzers();
		},

		/**
		 * Runs all analyzers
		 */
		runAllAnalyzers: function() {
			var i, mon;

			if (impl.hasAddedDataToBeacon) {
				// don't add data twice
				return;
			}

			for (i = 0; i < impl.monitors.length; i++) {
				mon = impl[impl.monitors[i]];

				if (mon && typeof mon.analyze === "function") {
					mon.analyze(impl.timeOfLastBeacon);
				}
			}

			// add last time the data was reset, if ever
			impl.addToBeacon("c.lb", impl.timeOfLastBeacon ? impl.timeOfLastBeacon.toString(36) : 0);

			// keep track of when we last added data
			impl.timeOfLastBeacon = BOOMR.now();

			// note we've added data
			impl.hasAddedDataToBeacon = true;
		},

		/**
		 * Callback after the beacon is ready to send, so we can clear
		 * our added vars and do other cleanup.
		 */
		onBeacon: function(edata) {
			var i;

			// Three types of beacons can go out before the Page Load beacon: Early Beacon, Custom Metric and Custom Timer.
			// For those beacon types, we want to keep the vars for the next beacon.
			if (edata &&
				(
					(typeof edata.early !== "undefined") ||
					(edata["http.initiator"] && edata["http.initiator"].indexOf("api_custom_") === 0)
				)) {

				return;
			}

			// let any other monitors know that a beacon was sent
			for (i = 0; i < impl.monitors.length; i++) {
				var monitor = impl[impl.monitors[i]];

				if (monitor) {
					// disable ourselves if we're not doing anything after the first beacon
					if (!impl.afterOnload) {
						if (typeof monitor.stop === "function") {
							monitor.stop();
						}
					}

					// notify all plugins that there's been a beacon
					if (typeof monitor.onBeacon === "function") {
						monitor.onBeacon();
					}
				}
			}

			// we haven't added data any more
			impl.hasAddedDataToBeacon = false;
		},

		/**
		 * Callback when an XHR load happens
		 *
		 * @param {object} data XHR data
		 */
		onXhrLoad: function(data) {
			// note this is an SPA for later
			if (data && BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
				impl.isSpa = true;
			}

			if (data && data.initiator === "spa_hard") {
				impl.onPageReady();
			}
		},

		/**
		 * Callback when the page is ready
		 */
		onPageReady: function() {
			impl.firedPageReady = true;

			//
			// If we're monitoring interactions after onload, set a timer to
			// disable them if configured
			//
			if (impl.afterOnload &&
			    impl.monitorInteractions) {
				impl.afterOnloadMonitoring = true;

				// disable after the specified amount if not a SPA
				if (!impl.isSpa && typeof impl.afterOnloadMaxLength === "number") {
					setTimeout(function() {
						impl.afterOnloadMonitoring = false;
					}, impl.afterOnloadMaxLength);
				}
			}

			if (impl.waitAfterOnload) {
				var start = BOOMR.now();

				setTimeout(function checkTti() {
					// wait for up to the defined time after onload
					if (BOOMR.now() - start > impl.waitAfterOnload) {
						// couldn't calculate TTI, send the beacon anyways
						impl.complete = true;
						BOOMR.sendBeacon();
					}
					else {
						// run the TTI calculation
						impl.timeline.analyze();

						// if we got something, mark as complete and send
						if (externalMetrics.timeToInteractive()) {
							impl.complete = true;
							BOOMR.sendBeacon();
						}
						else {
							// poll again
							setTimeout(checkTti, TIME_TO_INTERACTIVE_WAIT_POLL_PERIOD);
						}
					}
				}, TIME_TO_INTERACTIVE_WAIT_POLL_PERIOD);
			}
			else {
				impl.complete = true;
			}
		},

		//
		// Misc
		//
		/**
		 * Adds a variable to the beacon, tracking the names so we can
		 * remove them later.
		 *
		 * @param {string} name Name
		 * @param {string} val Value.  If 0 or undefined, the value is removed from the beacon.
		 * @param {number} force Force adding the variable, even if 0
		 */
		addToBeacon: function(name, val, force) {
			if ((val === 0 || typeof val === "undefined") && !force) {
				BOOMR.removeVar(name);
				return;
			}

			BOOMR.addVar(name, val, true);
		}
	};

	//
	// External Plugin
	//
	BOOMR.plugins.Continuity = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} [config.Continuity.monitorLongTasks=true] Whether or not to
		 * monitor Long Tasks.
		 * @param {boolean} [config.Continuity.monitorPageBusy=true] Whether or not to
		 * monitor Page Busy.
		 * @param {boolean} [config.Continuity.monitorFrameRate=true] Whether or not to
		 * monitor Frame Rate.
		 * @param {boolean} [config.Continuity.monitorInteractions=true] Whether or not to
		 * monitor Interactions.
		 * @param {boolean} [config.Continuity.monitorStats=true] Whether or not to
		 * monitor Page Statistics.
		 * @param {boolean} [config.Continuity.afterOnload=false] Whether or not to
		 * monitor Long Tasks, Page Busy, Frame Rate, interactions and Page Statistics
		 * after `onload` (up to `afterOnloadMaxLength`).
		 * @param {number} [config.Continuity.afterOnloadMaxLength=60000] Maximum time
		 * (milliseconds) after `onload` to monitor.
		 * @param {boolean} [config.Continuity.afterOnloadMinWait=5000] Minimum
		 * time after an interaction to wait for more interactions before batching
		 * the interactions into a beacon.
		 * @param {boolean|number} [config.Continuity.waitAfterOnload=false] If set
		 * to a `number`, how long after `onload` to wait for Time to Interactive to
		 * happen before sending a beacon (without TTI).
		 * @param {boolean} [config.Continuity.ttiWaitForFrameworkReady=false] Whether
		 * or not to wait for {@link BOOMR.plugins.Continuity.frameworkReady} before
		 * Visually Ready (and thus Time to Interactive) can happen.
		 * @param {boolean|string} [config.Continuity.ttiWaitForHeroImages=false] If
		 * set to a `string`, the CSS selector will wait until the specified images
		 * have been loaded before Visually Ready (and thus Time to Interactive) can happen.
		 * @param {boolean} [config.Continuity.sendLog=true] Whether or not to
		 * send the event log with each beacon.
		 * @param {boolean} [config.Continuity.logMaxEntries=100] How many log
		 * entries to keep.
		 * @param {boolean} [config.Continuity.sendTimeline=true] Whether or not to
		 * send the timeline with each beacon.
		 *
		 * @returns {@link BOOMR.plugins.Continuity} The Continuity plugin for chaining
		 * @memberof BOOMR.plugins.Continuity
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "Continuity",
				["monitorLongTasks", "monitorPageBusy", "monitorFrameRate", "monitorInteractions",
					"monitorStats", "afterOnload", "afterOnloadMaxLength", "afterOnloadMinWait",
					"waitAfterOnload", "ttiWaitForFrameworkReady", "ttiWaitForHeroImages",
					"sendLog", "logMaxEntries", "sendTimeline"]);

			if (impl.initialized) {
				return this;
			}

			impl.initialized = true;

			// create the timeline
			impl.timeline = new Timeline(BOOMR.now());

			//
			// Setup
			//
			if (BOOMR.window) {
				//
				// LongTasks
				//
				if (impl.monitorLongTasks &&
				    BOOMR.window.PerformanceObserver &&
				    BOOMR.window.PerformanceLongTaskTiming) {
					impl.longTaskMonitor = new LongTaskMonitor(BOOMR.window, impl.timeline);

					impl.ttiMethod = "lt";
				}

				//
				// FPS
				//
				if (impl.monitorFrameRate &&
				    typeof BOOMR.window.requestAnimationFrame === "function") {
					impl.frameRateMonitor = new FrameRateMonitor(BOOMR.window, impl.timeline);

					if (!impl.ttiMethod) {
						impl.ttiMethod = "raf";
					}
				}

				//
				// Page Busy (if LongTasks aren't supported or aren't enabled)
				//
				if (impl.monitorPageBusy &&
					(!BOOMR.window.PerformanceObserver || !BOOMR.window.PerformanceLongTaskTiming || !impl.monitorLongTasks)) {
					impl.pageBusyMonitor = new PageBusyMonitor(BOOMR.window, impl.timeline);

					if (!impl.ttiMethod) {
						impl.ttiMethod = "b";
					}
				}

				//
				// Interactions
				//
				if (impl.monitorInteractions) {
					impl.interactionMonitor = new InteractionMonitor(BOOMR.window, impl.timeline, impl.afterOnloadMinWait);
					impl.scrollMonitor = new ScrollMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
					impl.keyMonitor = new KeyMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
					impl.clickMonitor = new ClickMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
					impl.mouseMonitor = new MouseMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
					impl.visibilityMonitor = new VisibilityMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
					impl.orientationMonitor = new OrientationMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
				}

				//
				// Stats
				//
				if (impl.monitorStats) {
					impl.statsMonitor = new StatsMonitor(BOOMR.window, impl.timeline, impl.interactionMonitor);
				}
			}

			// add epoch and polling method to every beacon
			BOOMR.addVar("c.e", epoch.toString(36));
			BOOMR.addVar("c.tti.m", impl.ttiMethod);

			// event handlers
			BOOMR.subscribe("before_beacon", impl.onBeforeBeacon, null, impl);
			BOOMR.subscribe("beacon", impl.onBeacon, null, impl);
			BOOMR.subscribe("page_ready", impl.onPageReady, null, impl);
			BOOMR.subscribe("xhr_load", impl.onXhrLoad, null, impl);

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.Continuity
		 */
		is_complete: function(vars) {
			// allow error and early beacons to go through even if we're not complete
			return impl.complete || (vars && (vars["http.initiator"] === "error" || typeof vars.early !== "undefined"));
		},

		/**
		 * Signal that the framework is ready
		 *
		 * @memberof BOOMR.plugins.Continuity
		 */
		frameworkReady: function() {
			impl.frameworkReady = BOOMR.now();
		},

		// external metrics
		metrics: externalMetrics

	};
}());

/**
 * This plugin delays the Page Load beacon until all specified IFRAMEs have
 * also signalled they are also fully loaded.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Usage
 * In the parent page the following configuration should be used:
 *
 *     BOOMR.init({
 *       ...
 *       autorun: false,
 *       IFrameDelay: {
 *         enabled: true,
 *         monitoredCount: 1
 *       }
 *     });
 *
 * And in the child IFRAME:
 *
 *     BOOMR.init({
 *       ...
 *       IFrameDelay: {
 *         enabled: true,
 *         registerParent: true
 *       }
 *     });
 *
 * See the {@link BOOMR.plugins.IFrameDelay.init init()} function for more
 * details on each parameter.
 *
 * Once all registered IFRAMEs have finished loading, the Page Load time
 * is set with the load time of the final IFRAME.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `ifdl.done`: When all of the IFRAMEs have finished loading
 * * `ifdl.ct`: Number of finished IFRAMEs
 * * `ifdl.r`: Number of still-running IFRAMEs
 * * `ifdl.mon`: Total number of monitored IFRAMEs
 *
 * @class BOOMR.plugins.IFrameDelay
 */
(function() {
	var w,
	    MSG_RETRY_DELAY = 250;  // postMessage retry delay in ms

	
	

	if (BOOMR.plugins.IFrameDelay) {
		return;
	}

	w = BOOMR.window;


	var impl = {
		initialized: false,

		/**
		 * If true, send postMessage `boomrIframeLoading` and wait for the current
		 * frame to send the beacon. When Boomerang sends a beacon, it will
		 * also postMessage `boomrIframeLoaded`.
		 */
		registerParent: false,

		/**
		 * If set, count down the amount of times `boomrIframeLoaded` has been sent
		 */
		monitoredCount: 0,

		/**
		 * Number of frames that went from `boomrIframeLoading` to `boomrIframeLoaded`
		 */
		finishedCount: 0,

		/**
		 * Number of registered child IFRAMEs currently waiting to finish
		 */
		runningCount: 0,

		/**
		 * Array of child frame Page IDs
		 */
		runningFrames: {},

		loadingIntervalID: undefined,
		loadedIntervalID: undefined,

		loadEnd: 0,  // load timestamp of slowest frame

		/**
		 * postMessage names
		 */
		messages: {
			start: "boomrIframeLoading",
			done: "boomrIframeLoaded",
			startACK: "boomrIframeLoadingACK",
			doneACK: "boomrIframeLoadedACK"
		},

		/**
		 * Parent window postMessage `onmessage` callback listening for messages
		 * from the child IFRAMEs
		 *
		 * @param {Event} event postMessage Event
		 */
		onIFrameMessageAsParent: function(event) {
			var data;
			if (event &&
			    event.data && typeof event.data === "string" && event.data.charAt(0) === "{" &&
			    event.source) {
				try {
					data = JSON.parse(event.data);
				}
				catch (e) {
					return;
				}

				if (data.msg === impl.messages.start) {
					

					if (impl.runningFrames[data.pid]) {
						// already got a start message from this frame
						return;
					}

					// respond to the frame
					event.source.postMessage(JSON.stringify({"msg": impl.messages.startACK}), event.origin);

					// track that we're monitoring this frame
					impl.runningCount += 1;
					impl.runningFrames[data.pid] = 1;
				}
				else if (data.msg === impl.messages.done) {
					

					// respond to the frame
					event.source.postMessage(JSON.stringify({"msg": impl.messages.doneACK}), event.origin);

					// book-keeping
					impl.runningCount -= 1;
					impl.finishedCount += 1;

					// increment our loadEnd if this is larger
					if (data.loadEnd > impl.loadEnd) {
						impl.loadEnd = data.loadEnd;
					}

					// check if we're done!
					impl.checkCompleteness();
				}
			}
		},

		/**
		 * Child IFRAME postMessage `onmessage` callback listening for messages
		 * from parent window
		 *
		 * @param {Event} event postMessage Event
		 */
		onIFrameMessageAsChild: function(event) {
			var data;
			if (event &&
			    event.data && typeof event.data === "string" && event.data.charAt(0) === "{" &&
			    event.source) {
				try {
					data = JSON.parse(event.data);
				}
				catch (e) {
					return;
				}

				if (data.msg === impl.messages.startACK) {
					
					clearInterval(impl.loadingIntervalID);
					impl.loadingIntervalID = undefined;
				}
				else if (data.msg === impl.messages.doneACK) {
					
					clearInterval(impl.loadedIntervalID);
					impl.loadedIntervalID = undefined;
				}
			}
		},

		/**
		 * If we are done with all our monitored frames we will tell
		 * Boomerang that the page is ready and send out a beacon with
		 * our information.
		 */
		checkCompleteness: function() {
			if (impl.is_complete()) {
				// Add time IFrameDelay was done running.
				BOOMR.addVar("ifdl.done", BOOMR.now());

				// Add number for finished/beaconed IFRAMEs.
				BOOMR.addVar("ifdl.ct", impl.finishedCount);

				// Add number of "still" running IFRAMEs - used for diagnostics
				// if we canceled waiting too long for the child page to send a
				// beacon.
				BOOMR.addVar("ifdl.r", impl.runningCount);

				// Add number of monitored IFRAMEs - if configuration did not
				// dictate number of monitored IFRAMEs we should give this
				// number here to tell how many boomerang saw.
				BOOMR.addVar("ifdl.mon", impl.monitoredCount);

				if (BOOMR.hasBrowserOnloadFired()) {
					// if the iframe load time is later than the parent then use it
					BOOMR.page_ready(impl.loadEnd > 0 ? impl.loadEnd : undefined);
				}
				else {
					// if the parent onload hasn't fired yet, then we'll wait for
					// it instead
					BOOMR.attach_page_ready(function() {
						BOOMR.page_ready(undefined, true);
					});
				}
			}
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} True when the plugin is complete
		 */
		is_complete: function() {
			return impl.enabled && !impl.registerParent ?
				impl.finishedCount >= impl.monitoredCount && impl.runningCount === 0 :
				true;
		}
	};

	BOOMR.plugins.IFrameDelay = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} [config.IFrameDelay.registerParent] Should be set to
		 * `true` for child IFRAMEs.  If `true`, the parent frame will wait on
		 * this child IFRAME.
		 * @param {number} [config.IFrameDelay.monitoredCount] Should be set by
		 * the parent frame to indiciate the number of child IFRAMEs it expects
		 * to wait on.
		 * @returns {@link BOOMR.plugins.IFrameDelay} The IFrameDelay plugin for chaining
		 * @memberof BOOMR.plugins.IFrameDelay
		 */

		init: function(config) {
			BOOMR.utils.pluginConfig(
				impl,
				config,
				"IFrameDelay",
				["enabled", "registerParent", "monitoredCount"]);

			if (impl.initialized) {
				return this;
			}
			impl.initialized = true;

			// only run important bits if we're getting the actual configuration
			if (this.is_supported()) {
				if (impl.registerParent) {
					
					// listen on this window since it will be the source of postMessage calls
					BOOMR.utils.addListener(window, "message", impl.onIFrameMessageAsChild);
					function postStart() {
						
						w.parent.postMessage(JSON.stringify({"msg": impl.messages.start, "pid": BOOMR.pageId}), "*");
					}
					postStart();
					// keep retrying until we get an ACK
					impl.loadingIntervalID = setInterval(postStart, MSG_RETRY_DELAY);
					BOOMR.subscribe("page_load_beacon", function(vars) {
						var loadEnd;
						if (vars && vars["rt.end"]) {
							loadEnd = vars["rt.end"];
						}
						else {
							loadEnd = BOOMR.now();
						}
						function postEnd() {
							// make sure start message was sent first
							if (!impl.loadingIntervalID) {
								
								w.parent.postMessage(JSON.stringify({"msg": impl.messages.done, "pid": BOOMR.pageId, "loadEnd": loadEnd}), "*");
							}
						}
						postEnd();
						// keep retrying until we get an ACK
						impl.loadedIntervalID = setInterval(postEnd, MSG_RETRY_DELAY);
					});
				}
				else if (!impl.registerParent && impl.monitoredCount && impl.monitoredCount > 0) {
					
					BOOMR.utils.addListener(w, "message", impl.onIFrameMessageAsParent);
				}
				else {
					
					impl.finishedCount = impl.monitoredCount = impl.runningCount = 0;
					impl.enabled = false;
				}
			}
			else {
				impl.enabled = false;
			}
			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.IFrameDelay
		 */
		is_complete: function() {
			return impl.is_complete();
		},

		/**
		 * Whether or not this plugin is supported
		 *
		 * @returns {boolean} `true` if the plugin has postMessage and JSON support.
		 * @memberof BOOMR.plugins.IFrameDelay
		 */
		is_supported: function() {
			return BOOMR.utils.hasPostMessageSupport() && window.JSON;
		}
	};
}());

/**
 * Instrument and measure `XMLHttpRequest` (AJAX) requests.
 *
 * With this plugin, sites can measure the performance of `XMLHttpRequests`
 * (XHRs) and other in-page interactions after the page has been loaded.
 *
 * This plugin also monitors DOM manipulations following a XHR to filter out
 * "background" XHRs.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## What is Measured
 *
 * When `AutoXHR` is enabled, this plugin will monitor several events:
 *
 * - `XMLHttpRequest` requests
 * - `Fetch` API requests
 * - Clicks
 * - `window.History` changes indirectly through SPA plugins (History, Angular, etc.)
 *
 * When any of these events occur, `AutoXHR` will start monitoring the page for
 * other events, DOM manipulations and other networking activity.
 *
 * As long as the event isn't determined to be background activity (i.e an XHR
 * that didn't change the DOM at all), the event will be measured until all networking
 * activity has completed.
 *
 * This means if your click generated an XHR that triggered an updated view to fetch
 * more HTML that added images to the page, the entire event will be measured
 * from the click to the last image completing.
 *
 * ## Usage
 *
 * To enable AutoXHR, you should set {@link BOOMR.plugins.AutoXHR.init|instrument_xhr} to `true`:
 *
 *     BOOMR.init({
 *       instrument_xhr: true
 *     });
 *
 * Once enabled and initialized, the `window.XMLHttpRequest` object will be
 * replaced with a "proxy" object that instruments all XHRs.
 *
 * ## Monitoring XHRs
 *
 * After `AutoXHR` is enabled, any `XMLHttpRequest.send` will be monitored:
 *
 *     xhr = new XMLHttpRequest();
 *     xhr.open("GET", "/api/foo");
 *     xhr.send(null);
 *
 * If this XHR triggers DOM changes, a beacon will eventually be sent.
 *
 * This beacon will have `http.initiator=xhr` and the beacon parameters will differ
 * from a Page Load beacon.  See {@link BOOMR.plugins.RT} and
 * {@link BOOMR.plugins.NavigationTiming} for details.
 *
 * ## Combining XHR Beacons
 *
 * By default `AutoXHR` groups all XHR activity that happens in the same event together.
 *
 * If you have one XHR that immediately triggers a second XHR, you will get a single
 * XHR beacon.  The `u` (URL) will be of the first XHR.
 *
 * If you don't want this behavior, and want to measure *every* XHR on the page, you
 * can enable {@link BOOMR.plugins.AutoXHR.init|alwaysSendXhr=true}.  When set, every
 * distinct XHR will get its own XHR beacon.
 * {@link BOOMR.plugins.AutoXHR.init|alwaysSendXhr} can also be a list of strings
 * (matching URLs), regular expressions (matching URLs), or a function which returns
 * true for URLs to always send XHRs for.
 *
 * ### Compatibility and Browser Support
 *
 * Currently supported Browsers and platforms that AutoXHR will work on:
 *
 * - IE 9+ (not in quirks mode)
 * - Chrome 38+
 * - Firefox 25+
 *
 * In general we support all browsers that support
 * [MutationObserver]{@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver}
 * and [XMLHttpRequest]{@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest}.
 *
 * We will not use MutationObserver in IE 11 due to several browser bugs.
 * See {@link BOOMR.utils.isMutationObserverSupported} for details.
 *
 * ## Excluding Certain Requests From Instrumentation
 *
 * Whenever Boomerang intercepts an `XMLHttpRequest`, it will check if that request
 * matches anything in the XHR exclude list. If it does, Boomerang will not
 * instrument, time, send a beacon for that request, or include it in the
 * {@link BOOMR.plugins.SPA} calculations.
 *
 * The XHR exclude list is defined by creating an `BOOMR.xhr_excludes` map, and
 * adding URL parts that you would like to exclude from instrumentation. You
 * can put any of the following in `BOOMR.xhr_excludes`:
 *
 * 1. A full HREF
 * 2. A hostname
 * 3. A path
 *
 * Example:
 *
 * ```
 * 
 *
 * BOOMR.xhr_excludes = {
 *   "www.mydomain.com":  true,
 *   "a.anotherdomain.net": true,
 *   "/api/v1/foobar":  true,
 *   "https://mydomain.com/dashboard/": true
 * };
 * ```
 *
 * ## Beacon Parameters
 *
 * XHR beacons have different parameters in general than Page Load beacons.
 *
 * - Many of the timestamps will differ, see {@link BOOMR.plugins.RT}
 * - All of the `nt_*` parameters are ResourceTiming, see {@link BOOMR.plugins.NavigationTiming}
 * - `u`: the URL of the resource that was fetched
 * - `pgu`: The URL of the page the resource was fetched on
 * - `http.initiator`: `xhr` for both XHR and Fetch requests
 *
 * ## Interesting Nodes
 *
 * MutationObserver is used to detect "interesting" nodes. Interesting nodes are
 * new IMG/IMAGE/IFRAME/LINK (rel=stylesheet) nodes or existing nodes that are
 * changing their source URL.
 * We consider the following "uninteresting" nodes:
 *   - Nodes that have either a width or height <= 1px.
 *   - Nodes that have display:none.
 *   - Nodes that have visibility:hidden.
 *   - Nodes that update their source URL to the same value.
 *   - Nodes that have a blank source URL.
 *   - Nodes that have a source URL starting with `about:`, `javascript:` or `data:`.
 *   - SCRIPT nodes because there is no consistent way to detect when they have loaded.
 *   - Existing IFRAME nodes that are changing their source URL because is no consistent
 *     way to detect when they have loaded.
 *   - Nodes that have a source URL that matches a AutoXHR exclude filter rule.
 *
 * ## Algorithm
 *
 * Here's how the general AutoXHR algorithm works:
 *
 * - `0.0` SPA hard route change (page navigation)
 *
 *   - Monitor for XHR resource requests and interesting Mutation resource requests
 *     for 1s or at least until page onload. We extend our 1s timeout after all
 *     interesting resource requests have completed.
 *
 * - `0.1` SPA soft route change from a synchronous call (eg. History changes as a
 *         result of a pushState or replaceState call)
 *
 *   - In this case we get the new URL when the developer calls pushState or
 *     replaceState.
 *   - We create a pending event with the start time and the new URL.
 *   - We do not know if they plan to make an XHR call or use a dynamic script
 *     node, or do nothing interesting (eg: just make a div visible/invisible).
 *   - We also do not know if they will do this before or after they've called
 *     pushState/replaceState.
 *   - Our best bet is to monitor if either a XHR resource requests or interesting
 *     Mutation resource requests will happen in the next 1s.
 *   - When interesting resources are detected, we wait until they complete.
 *   - We restart our 1s timeout after all interesting resources have completed.
  *  - If something uninteresting happens, we set the timeout for 1 second if
 *     it wasn't already started.
 *       - We'll only do this once per event since we don't want to continuously
 *         extend the timeout with each uninteresting event.
 *   - If nothing happens during the additional timeout, we stop watching and fire the
 *     event. The event end time will be end time of the last tracked resource.
 *   - If nothing interesting was detected during the first timeout and the URL has not
 *     changed then we drop the event.
 *
 * - `0.2` SPA soft route change from an asynchronous call (eg. History changes as a
 *         result of the user hitting Back/Forward and we get a window.popstate event)
 *
 *   - In this case we get the new URL from location.href when our event listener
 *     runs.
 *   - We do not know if this event change will result in some interesting network
 *     activity or not.
 *   - We do not know if the developer's event listener has already run before
 *     ours or if it will run in the future or even if they do have an event listener.
 *   - Our best bet is the same as 0.1 above.
 *
 * - `1` Click initiated (Only available when no SPA plugins are enabled)
 *
 *   - User clicks on something.
 *   - We create a pending event with the start time and no URL.
 *   - We turn on DOM observer, and wait up to 50 milliseconds for activity.
 *     - If nothing happens during the first timeout, we stop watching and clear the
 *       event without firing it.
 *     - Else if something uninteresting happens, we set the timeout for 1s
 *       if it wasn't already started.
 *       - We'll only do this once per event since we don't want to continuously
 *         extend the timeout with each uninteresting event.
 *     - Else if an interesting node is added, we add load and error listeners
 *       and turn off the timeout but keep watching.
 *       - Once all listeners have fired, we start waiting again up to 50ms for activity.
 *     - If nothing happens during the additional timeout, we stop watching and fire the event.
 *
 * - `2` XHR/Fetch initiated
 *
 *   - XHR or Fetch request is sent.
 *   - We create a pending event with the start time and the request URL.
 *   - We watch for all changes in XHR state (for async requests) and for load (for
 *     all requests).
 *   - We turn on DOM observer at XHR Onload or when the Fetch Promise resolves.
 *     We then wait up to 50 milliseconds for activity.
 *     - If nothing happens during the first timeout, we stop watching and clear the
 *       event without firing it.
 *     - If something uninteresting happens, we set the timeout for 1 second if
 *       it wasn't already started.
 *       - We'll only do this once per event since we don't want to continuously
 *         extend the timeout with each uninteresting event.
 *     - Else if an interesting node is added, we add load and error listeners
 *       and turn off the timeout.
 *       - Once all listeners have fired, we start waiting again up to 50ms for activity.
 *     - If nothing happens during the additional timeout, we stop watching and fire the event.
 *
 * What about overlap?
 *
 * - `3.1` XHR/Fetch initiated while a click event is pending
 *
 *   - If first click watcher has not detected anything interesting or does not
 *     have a URL, abort it
 *   - If the click watcher has detected something interesting and has a URL, then
 *     - Proceed with 2 above.
 *     - Concurrently, click stops watching for new resources
 *       - Once all resources click is waiting for have completed then fire the event.
 *
 * - `3.2` Click initiated while XHR/Fetch event is pending
 *
 *   - Ignore click
 *
 * - `3.3` Click initiated while a click event is pending
 *
 *   - If first click watcher has not detected anything interesting or does not
 *     have a URL, abort it.
 *   - Else proceed with parallel event steps from 3.1 above.
 *
 * - `3.4` XHR/Fetch initiated while an XHR/Fetch event is pending
 *
 *   - Add the second XHR/Fetch as an interesting resource to be tracked by the
 *     XHR pending event in progress.
 *
 * - `3.5` XHR/Fetch initiated while SPA event is pending
 *
 *   - Add the second XHR/Fetch as an interesting resource to be tracked by the
 *     XHR pending event in progress.
 *
 * - `3.6` SPA event initiated while an XHR event is pending
 *     - Proceed with 0 above.
 *     - Concurrently, XHR event stops watching for new resources. Once all resources
 *       the XHR event is waiting for have completed, fire the event.
 *
 * - `3.7` SPA event initiated while a SPA event is pending
 *     - If the pending SPA event had detected something interesting then send an aborted
 *       SPA beacon. If not, drop the pending event.
 *     - Proceed with 0 above.
 *
 * @class BOOMR.plugins.AutoXHR
 */
(function() {
	var w, d, handler, a, impl,
	    readyStateMap = ["uninitialized", "open", "responseStart", "domInteractive", "responseEnd"];

	/**
	 * Single Page Applications get an additional timeout for all XHR Requests to settle in.
	 * This is used after collecting resources for a SPA routechange.
	 * Default is 1000ms, overridable with spaIdleTimeout
	 * @type {number}
	 * @constant
	 * @default
	 */
	var SPA_TIMEOUT = 1000;

	/**
	 * @constant
	 * @desc
	 * For early beacons.
	 * Single Page Applications get an additional timeout after the resource requests in
	 * flight reaches 0 for the first time.
	 * We want to allow some time for the SPA to fill in any custom dimensions that we
	 * capture on the early beacon.
	 * @type {number}
	 * @default
	 */
	var SPA_EARLY_TIMEOUT = 100;

	/**
	 * Clicks and XHR events get 50ms for an interesting thing to happen before
	 * being cancelled.
	 * Default is 50ms, overridable with xhrIdleTimeout
	 * @type {number}
	 * @constant
	 * @default
	 */
	var CLICK_XHR_TIMEOUT = 50;


	/**
	 * Fetch events that don't read the body of the response get an extra wait time before
	 * we look for it's corresponding ResourceTiming entry.
	 * Default is 200ms, overridable with fetchBodyUsedWait
	 * @type {number}
	 * @constant
	 * @default
	 */
	var FETCH_BODY_USED_WAIT_DEFAULT = 200;

	/**
	 * If we get a Mutation event that doesn't have any interesting nodes after
	 * a Click or XHR event started, wait up to 1,000ms for an interesting one
	 * to happen before cancelling the event.
	 * @type {number}
	 * @constant
	 * @default
	 */
	var UNINTERESTING_MUTATION_TIMEOUT = 1000;

	/**
	 * How long to wait if we're not ready to send a beacon to try again.
	 * @constant
	 * @type {number}
	 * @default
	 */
	var READY_TO_SEND_WAIT = 500;

	/**
	 * Timeout event fired for XMLHttpRequest resource
	 * @constant
	 * @type {number}
	 * @default
	 */
	var XHR_STATUS_TIMEOUT        = -1001;

	/**
	 * XMLHttpRequest was aborted
	 * @constant
	 * @type {number}
	 * @default
	 */
	var XHR_STATUS_ABORT          = -999;

	/**
	 * An error occured fetching XMLHttpRequest/Fetch resource
	 * @constant
	 * @type {number}
	 * @default
	 */
	var XHR_STATUS_ERROR          = -998;

	/**
	 * An exception occured as we tried to request resource
	 * @constant
	 * @type {number}
	 * @default
	 */
	var XHR_STATUS_OPEN_EXCEPTION = -997;

	// Default resources to count as Back-End during a SPA nav
	var SPA_RESOURCES_BACK_END = ["xmlhttprequest", "script", "fetch"];

	
	

	if (BOOMR.plugins.AutoXHR) {
		return;
	}

	w = BOOMR.window;

	// If this browser cannot support XHR, we'll just skip this plugin which will
	// save us some execution time.

	// XHR not supported or XHR so old that it doesn't support addEventListener
	// (IE 6, 7, 8, as well as newer running in quirks mode.)
	if (!w || !w.XMLHttpRequest || !(new w.XMLHttpRequest()).addEventListener) {
		// Nothing to instrument
		return;
	}


	/**
	 * Tries to resolve `href` links from relative URLs.
	 *
	 * This implementation takes into account a bug in the way IE handles relative
	 * paths on anchors and resolves this by assigning `a.href` to itself which
	 * triggers the URL resolution in IE and will fix missing leading slashes if
	 * necessary.
	 *
	 * @param {string} anchor The anchor object to resolve
	 *
	 * @returns {string} The unrelativized URL href
	 * @memberof BOOMR.plugins.AutoXHR
	 */
	function getPathName(anchor) {
		if (!anchor) {
			return null;
		}

		/*
		 correct relativism in IE
		 anchor.href = "./path/file";
		 anchor.pathname == "./path/file"; //should be "/path/file"
		 */
		anchor.href = anchor.href;

		/*
		 correct missing leading slash in IE
		 anchor.href = "path/file";
		 anchor.pathname === "path/file"; //should be "/path/file"
		 */
		var pathName = anchor.pathname;
		if (pathName.charAt(0) !== "/") {
			pathName = "/" + pathName;
		}

		return pathName;
	}

	/**
	 * Based on the contents of BOOMR.xhr_excludes check if the URL that we instrumented as XHR request
	 * matches any of the URLs we are supposed to not send a beacon about.
	 *
	 * @param {HTMLAnchorElement} anchor HTML anchor element with URL of the element
	 * checked against `BOOMR.xhr_excludes`
	 *
	 * @returns {boolean} `true` if intended to be excluded, `false` if it is not in the list of excludables
	 * @memberof BOOMR.plugins.AutoXHR
	 */
	function shouldExcludeXhr(anchor) {
		var urlIdx;

		if (anchor.href) {
			if (anchor.href.match(/^(about:|javascript:|data:)/i)) {
				return true;
			}

			// don't track our own beacons (allow for protocol-relative URLs)
			if (typeof BOOMR.getBeaconURL === "function" && BOOMR.getBeaconURL()) {
				urlIdx = anchor.href.indexOf(BOOMR.getBeaconURL());
				if (urlIdx === 0 || urlIdx === 5 || urlIdx === 6) {
					return true;
				}
			}
		}

		return BOOMR.xhr_excludes.hasOwnProperty(anchor.href) ||
			BOOMR.xhr_excludes.hasOwnProperty(anchor.hostname) ||
			BOOMR.xhr_excludes.hasOwnProperty(getPathName(anchor));
	}

	/**
	 * Handles the MutationObserver for {@link BOOMR.plugins.AutoXHR}.
	 *
	 * @class MutationHandler
	 */
	function MutationHandler() {
		this.watch = 0;
		this.timer = null;
		this.timerEarlyBeacon = null;

		this.pending_events = [];
		this.lastSpaLocation = null;
	}

	/**
	 * Disable internal MutationObserver instance. Use this when uninstrumenting the site we're on.
	 *
	 * @method
	 * @memberof MutationHandler
	 * @static
	 */
	MutationHandler.stop = function() {
		MutationHandler.pause();
		MutationHandler.observer = null;
	};

	/**
	 * Pauses the MutationObserver.  Call [resume]{@link handler#resume} to start it back up.
	 *
	 * @method
	 * @memberof MutationHandler
	 * @static
	 */
	MutationHandler.pause = function() {
		if (MutationHandler.observer &&
		    MutationHandler.observer.observer &&
		    !MutationHandler.isPaused) {
			MutationHandler.isPaused = true;
			MutationHandler.observer.observer.disconnect();
		}
	};

	/**
	 * Resumes the MutationObserver after a [pause]{@link handler#pause}.
	 *
	 * @method
	 * @memberof MutationHandler
	 * @static
	 */
	MutationHandler.resume = function() {
		if (MutationHandler.observer &&
		    MutationHandler.observer.observer &&
		    MutationHandler.isPaused) {
			MutationHandler.isPaused = false;
			MutationHandler.observer.observer.observe(d, MutationHandler.observer.config);
		}
	};

	/**
	 * Initiate {@link MutationHandler.observer} on the
	 * [outer parent document]{@link BOOMR.window.document}.
	 *
	 * Uses [addObserver]{@link BOOMR.utils.addObserver} to instrument.
	 *
	 * [Our internal handler]{@link handler#mutation_cb} will be called if
	 * something happens.
	 *
	 * @method
	 * @memberof MutationHandler
	 * @static
	 */
	MutationHandler.start = function() {
		if (MutationHandler.observer) {
			// don't start twice
			return;
		}

		var config = {
			childList: true,
			attributes: true,
			subtree: true,
			attributeFilter: ["src", "href"]
		};

		// Add a perpetual observer
		MutationHandler.observer = BOOMR.utils.addObserver(
			d,
			config,
			null, // no timeout
			handler.mutation_cb, // will always return true
			null, // no callback data
			handler
		);

		if (MutationHandler.observer) {
			MutationHandler.observer.config = config;

			BOOMR.subscribe("page_unload", MutationHandler.stop, null, MutationHandler);
		}
	};

	/**
	 * If an event has triggered a resource to be fetched we add it to the list of pending events
	 * here and wait for it to eventually resolve.
	 *
	 * @param {object} resource - [Resource]{@link AutoXHR#Resource} object we are waiting for
	 *
	 * @returns {?index} If we are already waiting for an event of this type null
	 * otherwise index in the [queue]{@link MutationHandler#pending_event}.
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.addEvent = function(resource) {
		var ev = {
			type: resource.initiator,
			resource: resource,
			nodes_to_wait: 0,  // MO resources + xhrs currently outstanding + wait filter (max: 1)
			total_nodes: 0,  // total MO resources + xhrs + wait filter (max: 1)
			resources: [],  // resources reported to MO handler (no xhrs)
			complete: false,
			aborted: false,  // this event was aborted
			firedEarlyBeacon: false
		},
		    i,
		    last_ev,
		    last_ev_index,
		    index = this.pending_events.length,
		    self = this;

		for (i = index - 1; i >= 0; i--) {
			if (this.pending_events[i] && !this.pending_events[i].complete) {
				last_ev = this.pending_events[i];
				last_ev_index = i;
				break;
			}
		}

		if (last_ev) {
			if (last_ev.type === "click") {
				// 3.1 & 3.3
				if (last_ev.nodes_to_wait === 0 || !last_ev.resource.url) {
					this.pending_events[last_ev_index] = undefined;
					this.watch--;
					// continue with new event
				}
				// last_ev will no longer receive watches as ev will receive them
				// last_ev will wait for all interesting nodes and then send event
			}
			else if (last_ev.type === "xhr") {
				// 3.2
				if (ev.type === "click") {
					return null;
				}

				// 3.4
				// add this resource to the current event
				else if (ev.type === "xhr") {
					handler.add_event_resource(resource);
					return null;
				}

			}
			else if (BOOMR.utils.inArray(last_ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
				// add this resource to the current event
				if (ev.type === "xhr") {
					handler.add_event_resource(resource);
					return null;
				}

				// if we have a pending SPA event, send an aborted load beacon before
				// adding the new SPA event
				if (BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
					

					// mark the end of this navigation as now
					last_ev.resource.timing.loadEventEnd = BOOMR.now();
					last_ev.aborted = true;

					// send the previous SPA
					this.sendEvent(last_ev_index);
				}
			}
		}

		if (ev.type === "click") {
			// if we don't have a MutationObserver then we just abort.
			// If an XHR starts later then it will be tracked as its own new event
			if (!MutationHandler.observer) {
				return null;
			}

			// give Click events 50ms to see if they resulted
			// in DOM mutations (and thus it is an 'interesting event').
			this.setTimeout(impl.xhrIdleTimeout, index);
		}
		else if (ev.type === "xhr") {
			// XHR events will not set a timeout yet.
			// The XHR's load finished callback will start the timer.
			// Increase node count since we are waiting for the XHR that started this event
			ev.nodes_to_wait++;
			ev.total_nodes++;
			// we won't track mutations yet, we'll monitor only when at least one of the
			// tracked xhr nodes has had a response
			ev.ignoreMO = true;
		}
		else if (BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
			// try to start the MO, in case we haven't had the chance to yet
			MutationHandler.start();

			if (!resource.wait) {
				// give SPAs a bit more time to do something since we know this was
				// an interesting event.
				this.setTimeout(impl.spaIdleTimeout, index);
			}
			else {
				// a wait filter isn't a node, but we'll use the same logic.
				// Increase node count since we are waiting for the waitComplete call.
				ev.nodes_to_wait++;
				ev.total_nodes++;
				// waitComplete() should be called once the held beacon is complete.
				// The caller is responsible for clearing the .wait flag
				resource.waitComplete = function() {
					self.load_finished(index);
					resource.waitComplete = undefined;
				};
			}
		}

		this.watch++;
		this.pending_events.push(ev);
		resource.index = index;

		return index;
	};

	/**
	 * If called with an event in the [pending events list]{@link MutationHandler#pending_events}
	 * trigger a beacon for this event.
	 *
	 * When the beacon is sent for this event is depending on either having a crumb, in which case this
	 * beacon will be sent immediately. If that is not the case we wait 5 seconds and attempt to send the
	 * event again.
	 *
	 * @param {number} index Index in event list to send
	 *
	 * @returns {undefined} Returns early if the event already completed
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.sendEvent = function(index) {
		var ev = this.pending_events[index], self = this, now = BOOMR.now();

		if (!ev || ev.complete) {
			return;
		}

		this.clearTimeout(index);
		if (BOOMR.readyToSend()) {
			ev.complete = true;

			this.watch--;

			ev.resource.resources = ev.resources;

			// for SPA events, the resource's URL may be set to the previous navigation's URL.
			// reset it to the current document URL
			if (BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
				ev.resource.url = d.URL;
			}

			// if this was a SPA soft nav with no URL change and did not trigger additional resources
			// then we will not send a beacon
			if (ev.type === "spa" && ev.total_nodes === 0 && ev.resource.url === self.lastSpaLocation) {
				
				BOOMR.fireEvent("spa_cancel");
				this.pending_events[index] = undefined;
				return;
			}

			if (BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
				// save the last SPA location
				self.lastSpaLocation = ev.resource.url;

				if (!ev.forced) {
					// if this was a SPA nav that triggered no additional resources, substract the
					// SPA_TIMEOUT from now to determine the end time
					if (ev.total_nodes === 0) {
						ev.resource.timing.loadEventEnd = now - impl.spaIdleTimeout;
					}

					// if the event wasn't forced then the SPA hard nav should have the page's
					// onload end as its minimum load end time
					if (ev.type === "spa_hard") {
						var p = BOOMR.getPerformance();
						if (p && p.timing && p.timing.loadEventEnd && ev.resource.timing.loadEventEnd &&
						    ev.resource.timing.loadEventEnd < p.timing.loadEventEnd) {
							ev.resource.timing.loadEventEnd = p.timing.loadEventEnd;
						}
					}
				}
			}

			this.sendResource(ev.resource, index);
		}
		else {
			// No crumb, so try again after 500ms seconds
			setTimeout(function() { self.sendEvent(index); }, READY_TO_SEND_WAIT);
		}
	};

	/**
	 * Creates and triggers sending a beacon for a Resource that has finished loading.
	 *
	 * @param {Resource} resource The Resource to send a beacon on
	 * @param {number} eventIndex index of the event in the pending_events array
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.sendResource = function(resource, eventIndex) {
		var self = this, ev = self.pending_events[eventIndex];

		// Use 'requestStart' as the startTime of the resource, if given
		var startTime = resource.timing ? resource.timing.requestStart : undefined;

		/**
		  * Called once the resource can be sent
		  * @param {boolean} [markEnd] Sets loadEventEnd once the function is run
		  * @param {number} [endTimestamp] End timestamp
		 */
		var sendResponseEnd = function(markEnd, endTimestamp) {
			if (markEnd) {
				resource.timing.loadEventEnd = endTimestamp || BOOMR.now();
			}

			// send any queued beacons first
			BOOMR.real_sendBeacon();

			// If the resource has an onComplete event, trigger it.
			if (resource.onComplete) {
				resource.onComplete(resource);
			}

			// Add ResourceTiming data to the beacon, starting at when 'requestStart'
			// was for this resource.
			if (BOOMR.plugins.ResourceTiming &&
			    BOOMR.plugins.ResourceTiming.is_enabled() &&
			    resource.timing &&
			    resource.timing.requestStart) {
				var r = BOOMR.plugins.ResourceTiming.getCompressedResourceTiming(
						resource.timing.requestStart,
						resource.timing.loadEventEnd
					);

				BOOMR.plugins.ResourceTiming.addToBeacon(r);
			}

			// For SPAs, calculate Back-End and Front-End timings
			if (BOOMR.utils.inArray(resource.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
				self.calculateSpaTimings(resource);

				// If the SPA load was aborted, set the rt.quit and rt.abld flags
				if (typeof eventIndex === "number" && self.pending_events[eventIndex].aborted) {
					// Save the URL otherwise it might change before we have a chance to put it on the beacon
					BOOMR.addVar("pgu", d.URL, true);
					BOOMR.addVar("rt.quit", "", true);
					BOOMR.addVar("rt.abld", "", true);
				}
			}

			BOOMR.responseEnd(resource, startTime, resource);

			if (typeof eventIndex === "number") {
				self.pending_events[eventIndex] = undefined;
			}
		};

		// if this is a SPA Hard navigation, make sure it doesn't fire until onload
		if (resource.initiator === "spa_hard") {
			// don't wait for onload if this was an aborted SPA navigation
			if ((!ev || !ev.aborted) && !BOOMR.hasBrowserOnloadFired()) {
				BOOMR.utils.addListener(w, "load", function() {
					var loadTimestamp = BOOMR.now();

					// run after the 'load' event handlers so loadEventEnd is captured
					BOOMR.setImmediate(function() {
						sendResponseEnd(true, loadTimestamp);
					});
				});

				return;
			}
		}

		sendResponseEnd(false);
	};

	/**
	 * Calculates SPA Back-End and Front-End timings for Hard and Soft
	 * SPA navigations.
	 *
	 * @param {object} resource Resouce to calculate for
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.calculateSpaTimings = function(resource) {
		var p = BOOMR.getPerformance();
		if (!p || !p.timing) {
			return;
		}

		//
		// Hard Navigation:
		// Use same timers as a traditional navigation, where the root HTML's
		// timestamps are used for Back-End calculation.
		//
		if (resource.initiator === "spa_hard") {
			// ensure RT picks up the correct timestamps
			resource.timing.responseEnd = p.timing.responseStart;

			// use navigationStart instead of fetchStart to ensure Back-End time
			// includes any redirects
			resource.timing.fetchStart = p.timing.navigationStart;
		}
		else {
			//
			// Soft Navigation:
			// We need to overwrite two timers: Back-End (t_resp) and Front-End (t_page).
			//
			// For Single Page Apps, we're defining these as:
			// Back-End: Any timeslice where a XHR or JavaScript was outstanding
			// Front-End: Total Time - Back-End
			//
			if (!BOOMR.plugins.ResourceTiming ||
			    !BOOMR.plugins.ResourceTiming.is_supported()) {
				return;
			}

			// first, gather all Resources that were outstanding during this SPA nav
			var resources = BOOMR.plugins.ResourceTiming.getFilteredResourceTiming(
				resource.timing.requestStart,
				resource.timing.loadEventEnd,
				impl.spaBackEndResources).entries;

			// determine the total time based on the SPA logic
			var totalTime = Math.round(resource.timing.loadEventEnd - resource.timing.requestStart);

			if (!resources || !resources.length) {
				// If ResourceTiming is supported, but there were no entries,
				// this was all Front-End time
				resource.timers = {
					t_resp: 0,
					t_page: totalTime,
					t_done: totalTime
				};

				return;
			}

			// we currently can't reliably tell when a SCRIPT has loaded
			// set an upper bound on responseStart/responseEnd for the resources to the SPA's loadEventEnd
			var maxResponseEnd = resource.timing.loadEventEnd - p.timing.navigationStart;
			for (var i = 0; i < resources.length; i++) {
				if (resources[i].responseStart > maxResponseEnd) {
					resources[i].responseStart = maxResponseEnd;
					resources[i].responseEnd = maxResponseEnd;
				}
				else if (resources[i].responseEnd > maxResponseEnd) {
					resources[i].responseEnd = maxResponseEnd;
				}
			}

			// calculate the Back-End time based on any time those resources were active
			var backEndTime = Math.round(BOOMR.plugins.ResourceTiming.calculateResourceTimingUnion(resources));

			// front-end time is anything left over
			var frontEndTime = totalTime - backEndTime;

			if (backEndTime < 0 || totalTime < 0 || frontEndTime < 0) {
				// some sort of error, don't put on the beacon
				BOOMR.addError("Incorrect SPA time calculation");
				return;
			}

			// set timers on the resource so RT knows to use them
			resource.timers = {
				t_resp: backEndTime,
				t_page: frontEndTime,
				t_done: totalTime
			};
		}
	};

	/**
	 * Will create a new timer waiting for `timeout` milliseconds to wait until a
	 * resources load time has ended or should have ended. If the timeout expires
	 * the Resource at `index` will be marked as timedout and result in an error Resource marked with
	 * [XHR_STATUS_TIMEOUT]{@link AutoXHR#XHR_STATUS_TIMEOUT} as status information.
	 *
	 * @param {number} timeout - time ot wait for the resource to be loaded
	 * @param {number} index - Index of the {@link Resource} in our {@link MutationHandler#pending_events}
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.setTimeout = function(timeout, index) {
		var self = this;
		// we don't need to check if this is the latest pending event, the check is
		// already done by all callers of this function
		if (!timeout) {
			return;
		}

		this.clearTimeout(index);

		this.timer = setTimeout(function() { self.timedout(index); }, timeout);
	};

	/**
	 * Sends a Beacon for the [Resource]{@link AutoXHR#Resource} at `index` with the status
	 * [XHR_STATUS_TIMEOUT]{@link AutoXHR#XHR_STATUS_TIMEOUT} code, If there are multiple resources attached to the
	 * `pending_events` array at `index`.
	 *
	 * @param {number} index - Index of the event in pending_events array
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.timedout = function(index) {
		var ev;
		this.clearTimeout(index);

		ev = this.pending_events[index];

		if (ev) {
			// SPA page loads

			if (BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS) && !BOOMR.hasBrowserOnloadFired()) {
				// browser onload hasn't fired yet, lets wait because there might be more interesting
				// things on the way
				this.setTimeout(SPA_TIMEOUT, index);
				return;
			}

			if (ev.nodes_to_wait === 0) {
				// TODO, if xhr event did not trigger additional resources then do not
				// send a beacon unless it matches alwaysSendXhr. See !868

				// if click event did not trigger additional resources or doesn't have
				// a url then do not send a beacon
				if (ev.type === "click" && (ev.total_nodes === 0 || !ev.resource.url)) {
					this.watch--;
					this.pending_events[index] = undefined;
				}
				// send event if there are no outstanding downloads
				this.sendEvent(index);
			}

			// if there are outstanding downloads left, they will trigger a
			// sendEvent for the SPA/XHR pending event once complete
		}
	};

	/**
	 * If this instance of the {@link MutationHandler} has a `timer` set, clear it
	 *
	 * @param {number} index - Index of the event in pending_events array
	 *
	 * @memberof MutationHandler
	 * @method
	 */
	MutationHandler.prototype.clearTimeout = function(index) {
		// only clear timeout if this is the latest pending event.
		// If it is not the latest, then allow the timer to timeout. This can
		// happen in cases of concurrency, eg. an xhr event is waiting in timeout and
		// a spa event is triggered.
		if (this.timer && index === (this.pending_events.length - 1)) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	};

	/**
	 * Once an asset has been loaded and the resource appeared in the page we
	 * check if it was part of the interesting events on the page and mark it as finished.
	 *
	 * @callback load_cb
	 * @param {Event} ev - Load event Object
	 *
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.load_cb = function(ev, resourceNum) {
		var target, index, now = BOOMR.now();

		target = ev.target || ev.srcElement;
		if (!target || !target._bmr) {
			return;
		}

		index = target._bmr.idx;
		resourceNum = typeof resourceNum !== "undefined" ? resourceNum : (target._bmr.res || 0);

		if (target._bmr.end[resourceNum]) {
			// If we've already set the end value, don't call load_finished
			// again.  This might occur on IMGs that are 404s, which fire
			// 'error' then 'load' events
			return;
		}

		target._bmr.end[resourceNum] = now;

		this.load_finished(index, now);
	};

	/**
	 * Clear the flag preventing DOM mutation monitoring
	 *
	 * @param {number} index - Index of the event in pending_events array
	 *
	 * @memberof MutationHandler
	 * @method
	 */
	MutationHandler.prototype.monitorMO = function(index) {
		var current_event = this.pending_events[index];

		// event aborted
		if (!current_event) {
			return;
		}

		delete current_event.ignoreMO;
	};

	/**
	 * Decrement the number of [nodes_to_wait]{@link AutoXHR#.PendingEvent} for the
	 * [PendingEvent Object]{@link AutoXHR#.PendingEvent}.
	 *
	 * If the nodes_to_wait is decremented to 0 and the event type was SPA:
	 *
	 * When we're finished waiting on the last node,
	 * the MVC engine (eg AngularJS) might still be doing some processing (eg
	 * on an XHR) before it adds some additional content (eg IMGs) to the page.
	 * We should wait a while (1 second) longer to see if this happens.  If
	 * something else is added, we'll continue to wait for that content to
	 * complete.  If nothing else is added, the end event will be the
	 * timestamp for when this load_finished(), not 1 second from now.
	 *
	 * @param {number} index - Index of the event found in the pending_events array
	 * @param {TimeStamp} loadEventEnd - TimeStamp at which the resource was finished loading
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.load_finished = function(index, loadEventEnd) {
		var current_event = this.pending_events[index];

		// event aborted
		if (!current_event) {
			return;
		}

		current_event.nodes_to_wait--;

		if (current_event.nodes_to_wait === 0) {
			// mark the end timestamp with what was given to us, or, now
			current_event.resource.timing.loadEventEnd = loadEventEnd || BOOMR.now();

			// For Single Page Apps, when we're finished waiting on the last node,
			// the MVC engine (eg AngularJS) might still be doing some processing (eg
			// on an XHR) before it adds some additional content (eg IMGs) to the page.
			// We should wait a while (1 second) longer to see if this happens.  If
			// something else is added, we'll continue to wait for that content to
			// complete.  If nothing else is added, the end event will be the
			// timestamp for when this load_finished(), not 1 second from now.

			// We use the same behavior for XHR and click events but with a smaller timeout

			if (index === (this.pending_events.length - 1)) {
				// if we're the latest pending event then extend the timeout
				if (BOOMR.utils.inArray(current_event.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
					// if we reached here then at least one resource was fetched.
					// Send our SPA early beacon
					if (!current_event.firedEarlyBeacon && BOOMR.plugins.Early && BOOMR.plugins.Early.is_supported()) {
						if (this.timerEarlyBeacon) {
							clearTimeout(this.timerEarlyBeacon);
							this.timerEarlyBeacon = null;
						}
						this.timerEarlyBeacon = setTimeout(function() {
							handler.timerEarlyBeacon = null;
							// don't send an early beacon now if we are waiting for a new resource that started during our timeout
							if (current_event.firedEarlyBeacon || current_event.nodes_to_wait !== 0) {
								return;
							}
							current_event.firedEarlyBeacon = true;
							BOOMR.plugins.Early.sendEarlyBeacon(current_event.resource, current_event.type);
						}, SPA_EARLY_TIMEOUT);  // give the SPA framework a bit of time to load the resource
					}

					this.setTimeout(impl.spaIdleTimeout, index);
				}
				else {
					this.setTimeout(impl.xhrIdleTimeout, index);
				}
			}
			else {
				// this should never happen for SPA events, they should always be the latest
				// pending event.
				this.sendEvent(index);
			}
		}
	};

	/**
	 * Determines if we should wait for resources that would be fetched by the
	 * specified node.
	 *
	 * @param {Element} node DOM node
	 * @param {number} index Event index
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.wait_for_node = function(node, index) {
		var self = this, current_event, els, interesting = false, i, l, url,
		    exisitingNodeSrcUrlChanged = false, resourceNum, domHeight, domWidth, listener;

		// only images, iframes and links if stylesheet
		// nodeName for SVG:IMAGE returns `image` in lowercase
		// scripts would be nice to track but their onload event is not reliable
		if (node && node.nodeName &&
		    (node.nodeName.toUpperCase().match(/^(IMG|IFRAME|IMAGE)$/) ||
		    (node.nodeName.toUpperCase() === "LINK" && node.rel && node.rel.match(/\bstylesheet\b/i)))) {

			// if the attribute change affected the src attributes we want to know that
			// as that means we need to fetch a new Resource from the server
			// We don't look at currentSrc here because that isn't set until after the resource fetch has started,
			// which will be after the MO observer completes.
			if (node._bmr && typeof node._bmr.res === "number" && node._bmr.end[node._bmr.res]) {
				exisitingNodeSrcUrlChanged = true;
			}

			// we put xlink:href before href because node.href works for <SVG:IMAGE> elements,
			// but does not return a string
			url = node.src ||
				(typeof node.getAttribute === "function" && node.getAttribute("xlink:href")) ||
				node.href;

			// we get called from src/href attribute changes but also from nodes being added
			// which may or may not have been seen here before.
			// Check that if we've seen this node before, that the src/href in this case is
			// different which means we need to fetch a new Resource from the server
			if (node._bmr && node._bmr.url !== url) {
				exisitingNodeSrcUrlChanged = true;
			}

			if (exisitingNodeSrcUrlChanged) {
				if (typeof node._bmr.listener === "function") {
					self.load_cb({target: node, type: "changed"});
					//remove listeners
					node.removeEventListener("load", node._bmr.listener);
					node.removeEventListener("error", node._bmr.listener);
					delete node._bmr.listener;
				}
				
			}

			// no URL or javascript: or about: or data: URL, so no network activity
			if (!url || url.match(/^(about:|javascript:|data:)/i)) {
				return false;
			}

			if (node.nodeName === "IMG") {
				if (node.naturalWidth && !exisitingNodeSrcUrlChanged) {
					// img already loaded
					return false;
				}
				else if (typeof node.getAttribute === "function" && node.getAttribute("src") === "") {
					// placeholder IMG
					return false;
				}
			}

			// IFRAMEs whose SRC has changed will not fire a load event again
			if (node.nodeName === "IFRAME" && exisitingNodeSrcUrlChanged) {
				return false;
			}

			//
			// Don't track pixels: <= 1px, display:none or visibility:hidden.
			// Only use attributes, not computed styles, to avoid forcing layout
			//

			// First try to get the number of pixels from width or height attributes
			if (typeof node.getAttribute === "function") {
				domHeight = parseInt(node.getAttribute("height"), 10);
				domWidth = parseInt(node.getAttribute("width"), 10);
			}

			// If not specified, we can look at the style height/width.  We can
			// only be confident about "0", "0px" or "1px" that it's small -- things
			// like "0em" or "0in" would be relative.  Some things that are actually
			// small might not match this list, but it's safer to only check against
			// a known list.
			if (isNaN(domHeight)) {
				domHeight = (node.style &&
				   (node.style.height === "0" ||
					node.style.height === "0px" ||
					node.style.height === "1px")) ? 0 : undefined;
			}

			if (isNaN(domWidth)) {
				domWidth = (node.style &&
				   (node.style.width === "0" ||
					node.style.width === "0px" ||
					node.style.width === "1px")) ? 0 : undefined;
			}

			if (!isNaN(domHeight) && domHeight <= 1 && !isNaN(domWidth) && domWidth <= 1) {
				return false;
			}

			// Check against display:none
			if (node.style && node.style.display === "none") {
				return false;
			}

			// Check against visibility:hidden
			if (node.style && node.style.visibility === "hidden") {
				return false;
			}

			current_event = this.pending_events[index];

			if (!current_event) {
				return false;
			}

			// determine the resource number for this request
			resourceNum = current_event.resources.length;

			// keep track of all resources (URLs) seen for the root resource
			if (!current_event.urls) {
				current_event.urls = {};
			}

			if (current_event.urls[url]) {
				// we've already seen this URL, no point in waiting on it twice
				return false;
			}

			// if we don't have a URL yet (i.e. a click started this), use
			// this element's URL
			if (!current_event.resource.url) {
				a.href = url;

				if (impl.excludeFilter(a)) {
					
					// excluded resource, so abort
					return false;
				}

				current_event.resource.url = a.href;
			}

			// create a bookkeeping ._bmr attribute
			if (!node._bmr) {
				node._bmr = {
					end: {}
				};
			}

			// update _bmr with details about this resource
			node._bmr.res = resourceNum;
			node._bmr.idx = index;
			delete node._bmr.end[resourceNum];
			node._bmr.url = url;

			listener = function(ev) {
				self.load_cb(ev, resourceNum);
				// if either event fires then cleanup both listeners
				node.removeEventListener("load", listener);
				node.removeEventListener("error", listener);
				delete node._bmr.listener;
				
			};
			
			node._bmr.listener = listener;
			node.addEventListener("load", listener);
			node.addEventListener("error", listener);

			// increase the number of outstanding resources by one
			current_event.nodes_to_wait++;

			// ensure the timeout is cleared
			this.clearTimeout(index);

			// increase the number of total resources by one
			current_event.total_nodes++;

			current_event.resources.push(node);

			// Note that we're tracking this URL
			current_event.urls[url] = 1;

			interesting = true;
		}
		// if it's an Element node such as <p> or <div>, find all the images contained in it
		else if (node.nodeType === Node.ELEMENT_NODE) {
			["IMAGE", "IMG"].forEach(function(tagName) {
				els = node.getElementsByTagName(tagName);
				if (els && els.length) {
					for (i = 0, l = els.length; i < l; i++) {
						interesting |= this.wait_for_node(els[i], index);
					}
				}
			}, this);
		}

		return interesting;
	};

	/**
	 * Adds a resource to the current event.
	 *
	 * Might fail (return -1) if:
	 * a) There are no pending events
	 * b) The current event is complete
	 * c) There's no passed-in resource
	 *
	 * @param resource Resource
	 *
	 * @return Event index, or -1 on failure
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.add_event_resource = function(resource) {
		var index = this.pending_events.length - 1, current_event;
		if (index < 0) {
			return -1;
		}

		current_event = this.pending_events[index];
		if (!current_event) {
			return -1;
		}

		if (!resource) {
			return -1;
		}

		

		// increase the number of outstanding resources by one
		current_event.nodes_to_wait++;
		// increase the number of total resources by one
		current_event.total_nodes++;

		resource.index = index;
		resource.node = true;  // this resource is a node being tracked by an existing pending event

		return index;
	};

	/**
	 * Callback called once [Mutation Observer instance]{@link MutationObserver#observer}
	 * noticed a mutation on the page. This method will determine if a mutation on
	 * the page is interesting or not.
	 *
	 * @callback mutation_cb
	 * @param {Mutation[]} mutations - Mutation array describing changes to the DOM
	 *
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.mutation_cb = function(mutations) {
		var self, index, evt;

		if (!this.watch) {
			return true;
		}

		self = this;
		index = this.pending_events.length - 1;

		if (index < 0 || !this.pending_events[index]) {
			// Nothing waiting for mutations
			return true;
		}

		evt = this.pending_events[index];

		// for xhr events, only track mutations if at least one of the tracked xhr nodes has
		// had a response
		if (evt.ignoreMO) {
			return true;
		}

		if (typeof evt.interesting === "undefined") {
			evt.interesting = false;
		}

		if (mutations && mutations.length) {
			evt.resource.timing.domComplete = BOOMR.now();

			mutations.forEach(function(mutation) {
				var i, l, node;
				if (mutation.type === "attributes") {
					evt.interesting |= self.wait_for_node(mutation.target, index);
				}
				else if (mutation.type === "childList") {
					// Go through any new nodes and see if we should wait for them
					l = mutation.addedNodes.length;
					for (i = 0; i < l; i++) {
						evt.interesting |= self.wait_for_node(mutation.addedNodes[i], index);
					}

					// Go through any removed nodes, and for IFRAMEs, see if we were
					// waiting for them.  If so, stop waiting, as removed IFRAMEs
					// don't trigger load or error events.
					l = mutation.removedNodes.length;
					for (i = 0; i < l; i++) {
						node = mutation.removedNodes[i];
						if (node.nodeName === "IFRAME" && node._bmr) {
							self.load_cb({target: node, type: "removed"});
						}
					}
				}
			});
		}

		if (!evt.interesting && !evt.timeoutExtended) {
			// timeout the event if we haven't already created a timer and
			// we didn't have any interesting nodes for this MO callback or
			// any prior callbacks
			this.setTimeout(UNINTERESTING_MUTATION_TIMEOUT, index);

			// only extend the timeout for an interesting thing to happen once
			evt.timeoutExtended = true;
		}

		return true;
	};

	/**
	 * Determines if the resources queue is empty
	 *
	 * @return {boolean} True if there are no outstanding resources
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.queue_is_empty = function() {
		return this.nodesWaitingFor() === 0;
	};

	/**
	 * Determines how many nodes are being waited on
	 * @param {number} [index] Optional Event index, defaults to last event
	 *
	 * @return {number} Number of nodes being waited on
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.nodesWaitingFor = function(index) {
		var ev;

		if (this.pending_events.length === 0) {
			return 0;
		}

		if (typeof index === "undefined") {
			index = this.pending_events.length - 1;
		}

		ev = this.pending_events[index];
		if (!ev) {
			return 0;
		}

		return ev.nodes_to_wait;
	};

	/**
	 * Completes the current event, marking the end time as 'now'.
	 * @param {number} [index] Optional Event index, defaults to last event
	 *
	 * @method
	 * @memberof MutationHandler
	 */
	MutationHandler.prototype.completeEvent = function(index) {
		var now = BOOMR.now(), ev;

		if (this.pending_events.length === 0) {
			// no active events
			return;
		}

		if (typeof index === "undefined") {
			index = this.pending_events.length - 1;
		}

		ev = this.pending_events[index];
		if (!ev) {
			// unknown event
			return;
		}

		// set the end timestamp to now
		ev.resource.timing.loadEventEnd = now;

		// note that this end was forced
		ev.forced = true;

		// complete this event
		this.sendEvent(index);
	};

	handler = new MutationHandler();

	/**
	 * Subscribe to click events on the page and see if they are triggering new
	 * resources fetched from the network in which case they are interesting
	 * to us!
	 */
	function instrumentClick() {
		// Capture clicks and wait 50ms to see if they result in DOM mutations
		BOOMR.subscribe("click", function() {
			if (impl.singlePageApp) {
				// In a SPA scenario, only route changes (or events from the SPA
				// framework) trigger an interesting event.
				return;
			}

			var resource = { timing: {}, initiator: "click" };

			if (!BOOMR.orig_XMLHttpRequest ||
			    BOOMR.orig_XMLHttpRequest === w.XMLHttpRequest) {
				// do nothing if we have un-instrumented XHR
				return;
			}

			resource.timing.requestStart = BOOMR.now();
			handler.addEvent(resource);
		});
	}

	/**
	 * Determines whether or not the specified url matches the
	 * {@link BOOMR.plugins.AutoXHR.init|alwaysSendXhr} list.
	 *
	 * `alwaysSendXhr` can be:
	 * * a `boolean`, if `true` meaning every XHR will send a beacon
	 * * a `function` which returns `true` for XHRs that should send a beacon
	 * * an array of `strings` or regular expressions which match to XHRs
	 *   that should send a beacon
	 *
	 * @param {string} url URL to match
	 * @param {string[]|RegExp[]|function|boolean} alwaysSendXhr Configuration
	 *
	 * @returns {boolean} True if the URL should always send a beacon
	 */
	function matchesAlwaysSendXhr(url, alwaysSendXhr) {
		var i, rule;

		if (!alwaysSendXhr || !url) {
			return false;
		}

		// alwaysSendXhr is a boolean
		if (typeof alwaysSendXhr === "boolean") {
			return alwaysSendXhr === true;
		}

		// alwaysSendXhr is a function
		if (typeof alwaysSendXhr === "function") {
			try {
				return alwaysSendXhr(url) === true;
			}
			catch (e) {
				return false;
			}
		}

		// alwaysSendXhr is a list of strings or regular expressions
		if (BOOMR.utils.isArray(alwaysSendXhr)) {
			for (i = 0; i < alwaysSendXhr.length; i++) {
				rule = alwaysSendXhr[i];

				if (typeof rule === "string" && rule === url) {
					return true;
				}
				else if (rule instanceof RegExp) {
					if (rule.test(url)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Replace original window.fetch with our implementation instrumenting
	 * any fetch requests happening afterwards
	 */
	function instrumentFetch() {
		if (!impl.monitorFetch ||
		    // we don't check that fetch is a native function in case it was already wrapped
		    // by another vendor
		    typeof w.fetch !== "function" ||
		    // native fetch support will define these, some polyfills like `unfetch` will not
		    typeof w.Request !== "function" ||
		    typeof w.Response !== "function" ||
		    // native fetch needs Promise support
		    typeof w.Promise !== "function" ||
		    // if our window doesn't have fetch then it was probably polyfilled in the top window
		    typeof window.fetch !== "function" ||
		    // Github's `whatwg-fetch` polyfill sets this flag
		    w.fetch.polyfill) {
			return;
		}

		if (BOOMR.proxy_fetch &&
		    BOOMR.proxy_fetch === w.fetch) {
			// already instrumented
			return;
		}

		if (BOOMR.proxy_fetch &&
		    BOOMR.orig_fetch &&
		    BOOMR.orig_fetch === w.fetch) {

			// was once instrumented and then uninstrumented, so just reapply the old instrumented object
			w.fetch = BOOMR.proxy_fetch;

			return;
		}

		// if there's a orig_fetch on the window, use that first (if another lib is overwriting fetch)
		BOOMR.orig_fetch = w.orig_fetch || w.fetch;

		BOOMR.proxy_fetch = function(input, init) {
			var url, method, payload,
			    // we want to keep initiator type as `xhr` for backwards compatibility.
			    // We'll differentiate fetch by `http.type=f` beacon param
			    resource = { timing: {}, initiator: "xhr" };

			// case where fetch() is called with a Request object
			if (typeof input === "object" && input instanceof w.Request) {
				url = input.url;

				// init overrides input
				method = (init && init.method) || input.method || "GET";
				if (impl.captureXhrRequestResponse) {
					payload = (init && init.body) || input.body || undefined;
				}
			}
			// case where fetch() is called with a string url (or anything else)
			else {
				url = input;
				method = (init && init.method) || "GET";
				if (impl.captureXhrRequestResponse) {
					payload = (init && init.body) || undefined;
				}
			}

			a.href = url;
			if (impl.excludeFilter(a)) {
				// this fetch should be excluded from instrumentation
				
				// call the original open method
				return BOOMR.orig_fetch.apply(w, arguments);
			}
			BOOMR.fireEvent("xhr_init", "fetch");

			resource.url = a.href;
			resource.method = method;
			resource.type = "fetch";  // pending event type will still be "xhr"
			if (payload) {
				resource.requestPayload = payload;
			}

			BOOMR.fireEvent("xhr_send", {resource: resource});

			handler.addEvent(resource);

			try {
				resource.timing.requestStart = BOOMR.now();
				var promise = BOOMR.orig_fetch.apply(this, arguments);

				/**
				 * wraps a onFulfilled or onRejection function that is passed to
				 * a promise's `.then` method. Will attempt to detect when there
				 * are no other promises in the chain that need to be executed and
				 * then mark the resource as finished. For simplicity, we only track
				 * the first `.then` call of each promise.
				 *
				 * @param {Promise} Promise that the callback is attached to
				 * @param {function} onFulfilled or onRejection callback function
				 * @param {Object} Fetch resource that we're handling in this promise
				 *
				 * @returns {function} Wrapped callback function
				 */
				function wrapCallback(_promise, _fn, _resource) {
					function done() {
						var now;
						// check if the response body was used, if not then we'll
						// wait a little bit longer. Hopefully it is a short response
						// (posibly only containing headers and status) and the entry
						// will be available in RT if we wait.
						// We don't detect if the response was consumed from a cloned object
						if (_resource.fetchResponse && !_resource.fetchResponse.bodyUsed && impl.fetchBodyUsedWait) {
							now = BOOMR.now();
							_resource.responseBodyNotUsed = true;
							setTimeout(function() {
								impl.loadFinished(_resource, now);
							}, impl.fetchBodyUsedWait);
						}
						else {
							impl.loadFinished(_resource);
						}
					}

					/**
					 * @returns {Promise} Promise result of callback or rethrows exception from callback
					 */
					return function() {
						var p, np = _promise._bmrNextP;
						try {
							p = _fn.apply((this === window ? w : this), arguments);

							// no exception thrown, check if there's a onFulfilled
							// callback in the chain
							while (np && !np._bmrHasOnFulfilled) {
								np = np._bmrNextP;  // next promise in the chain
							}
							if (!np) {
								// we didn't find one, if the callback result is a promise
								// then we'll wait for it to complete, if not mark this
								// resource as finished now
								if (p instanceof w.Promise) {
									p.then = wrapThen(p, p.then, _resource);
								}
								else {
									done();
								}
							}
							return p;
						}
						catch (e) {
							// exception thrown, check if there's a onRejected
							// callback in the chain
							while (np && !np._bmrHasOnRejected) {
								np = np._bmrNextP;  // next promise in the chain
							}
							if (!np) {
								// we didn't find one, mark the resource as complete
								done();
							}
							throw e;  // rethrow exception
						}
					};
				};

				/**
				 * wraps `.then` so that we can in turn wrap onFulfilled or onRejection that
				 * are passed to it. Wrapping `.then` will also trap calls from `.catch` and `.finally`
				 *
				 * @param {Promise} Promise that we're wrapping `.then` method for
				 * @param {function} `.then` function that will be wrapped
				 * @param {Object} Fetch resource that we're handling in this promise
				 *
				 * @returns {function} Wrapped `.then` function or original `.then` function
				 * if `.then` was already called on this promise
				 */
				function wrapThen(_promise, _then, _resource) {
					// only track the first `.then` call
					if (_promise._bmrNextP) {
						return _then;  // return unwrapped `.then`
					}
					/**
					 * @returns {Promise} Result of `.then` call
					 */
					return function(/* onFulfilled, onRejection */) {
						var args = Array.prototype.slice.call(arguments);
						if (args.length > 0) {
							if (typeof args[0] === "function") {
								args[0] = wrapCallback(_promise, args[0], _resource);
								_promise._bmrHasOnFulfilled = true;
							}
							if (args.length > 1) {
								if (typeof args[1] === "function") {
									args[1] = wrapCallback(_promise, args[1], _resource);
									_promise._bmrHasOnRejected = true;
								}
							}
						}
						var p = _then.apply(_promise, args);
						_promise._bmrNextP = p; // next promise in the chain
						// p should always be a Promise
						p.then = wrapThen(p, p.then, _resource);
						return p;
					};
				};

				// we can't just wrap functions that read the response (e.g.`.text`, `json`, etc.) or
				// instrument `.body.getReader`'s stream because they might never be called.
				// We'll wrap `.then` and all the callback handlers to figure out which
				// is the last handler to execute. Once the last handler runs, we'll mark the resource
				// as finished. For simplicity, we only track the first `.then` call of each promise
				promise.then = wrapThen(promise, promise.then, resource);

				return promise.then(function(response) {
					var i, res, ct, parseJson = false, parseXML = false;

					if (response.status < 200 || response.status >= 400) {
						// put the HTTP error code on the resource if it's not a success
						resource.status = response.status;
					}

					resource.fetchResponse = response;

					if (resource.index >= 0) {
						// response is starting to come in, we'll start monitoring for
						// DOM mutations
						handler.monitorMO(resource.index);
					}

					if (impl.captureXhrRequestResponse) {
						// clone not supported in Safari yet
						if (typeof response.clone === "function") {
							// content-type detection to determine if we should parse json or xml
							ct = response.headers.get("content-type");
							if (ct) {
								parseJson = ct.indexOf("json") !== -1;
								parseXML = ct.indexOf("xml") !== -1;
							}

							resource.response = {};
							try {
								res = response.clone();
								res.text().then(function(text) {
									resource.response.text = text;
									resource.response.raw = text;  // for fetch, we'll set raw to text value
									if (parseXML && typeof w.DOMParser === "function") {
										resource.response.xml = (new w.DOMParser()).parseFromString(text, "text/xml");
									}
								}).then(null, function(reason) {  // `.catch` will cause parse errors in old browsers
									// empty (avoid unhandled rejection)
								});
							}
							catch (e) {
								// empty
							}

							if (parseJson) {
								try {
									res = response.clone();
									res.json().then(function(json) {
										resource.response.json = json;
									}).then(null, function(reason) {  // `.catch` will cause parse errors in old browsers
										// empty (avoid unhandled rejection)
									});
								}
								catch (e) {
									// empty
								}
							}
						}
					}
					return response;
				}, function(reason) {
					// fetch() request failed (eg. cross-origin error, aborted, connection dropped, etc.)
					// we'll let the `.then` wrapper call finished for this resource

					// check if the fetch was aborted otherwise mark it as an error
					if (reason && (reason.name === "AbortError" || reason.code === 20)) {
						resource.status = XHR_STATUS_ABORT;
					}
					else {
						resource.status = XHR_STATUS_ERROR;
					}

					// rethrow the native method's exception
					throw reason;
				});
			}
			catch (e) {
				// there was an exception during fetch()
				resource.status = XHR_STATUS_OPEN_EXCEPTION;
				impl.loadFinished(resource);

				// rethrow the native method's exception
				throw e;
			}
		};

		// Overwrite window.fetch, ensuring the original is swapped back in
		// if the Boomerang IFRAME is unloaded.  uninstrumentFetch() may also
		// be used to swap the original back in.
		BOOMR.utils.overwriteNative(w, "fetch", BOOMR.proxy_fetch);
	}

	/**
	 * Put original fetch function back into place
	 */
	function uninstrumentFetch() {
		if (typeof w.fetch === "function" &&
		    BOOMR.orig_fetch && BOOMR.orig_fetch !== w.fetch) {
			w.fetch = BOOMR.orig_fetch;
		}
	}

	/**
	 * Replace original window.XMLHttpRequest with our implementation instrumenting
	 * any AJAX Requests happening afterwards. This will also enable instrumentation
	 * of mouse events (clicks) and start the {@link MutationHandler}
	 */
	function instrumentXHR() {
		if (BOOMR.proxy_XMLHttpRequest &&
			BOOMR.proxy_XMLHttpRequest === w.XMLHttpRequest) {
			// already instrumented
			return;
		}

		if (BOOMR.proxy_XMLHttpRequest &&
			BOOMR.orig_XMLHttpRequest &&
			BOOMR.orig_XMLHttpRequest === w.XMLHttpRequest) {
			// was once instrumented and then uninstrumented, so just reapply the old instrumented object

			w.XMLHttpRequest = BOOMR.proxy_XMLHttpRequest;
			MutationHandler.start();

			return;
		}

		// if there's a orig_XMLHttpRequest on the window, use that first (if another lib is overwriting XHR)
		BOOMR.orig_XMLHttpRequest = w.orig_XMLHttpRequest || w.XMLHttpRequest;

		MutationHandler.start();

		instrumentClick();

		/**
		 * Proxy `XMLHttpRequest` object
		 * @class ProxyXHRImplementation
		 */

		/**
		 * Open an XMLHttpRequest.
		 * If the URL passed as a second argument is in the BOOMR.xhr_exclude list ignore it and move on to request it
		 * Otherwise add it to our list of resources to monitor and later beacon on.
		 *
		 * If an exception is caught will call loadFinished and set resource.status to {@link XHR_STATUS_OPEN_EXCEPTION}
		 * Should the resource fail to load for any of the following reasons resource.stat status code will be set to:
		 *
		 * - timeout {Event} {@link XHR_STATUS_TIMEOUT}
		 * - error {Event} {@link XHR_STATUS_ERROR}
		 * - abort {Event} {@link XHR_STATUS_ABORT}
		 *
		 * @param {string} method HTTP request method
		 * @param {string} url URL to request on
		 * @param {boolean} [async] If `true` will setup the EventListeners for XHR events otherwise will set the resource
		 * to synchronous. If `true` or `undefined` will be automatically set to asynchronous
		 *
		 * @memberof ProxyXHRImplementation
		 */
		BOOMR.proxy_XMLHttpRequest = function() {
			var req, resource = { timing: {}, initiator: "xhr" }, orig_open, orig_send,
			    opened = false, excluded = false;

			req = new BOOMR.orig_XMLHttpRequest();

			orig_open = req.open;
			orig_send = req.send;

			req.open = function(method, url, async) {
				a.href = url;

				if (impl.excludeFilter(a)) {
					// this xhr should be excluded from instrumentation
					excluded = true;
					
					// call the original open method
					return orig_open.apply(req, arguments);
				}
				excluded = false;

				// Default value of async is true
				if (typeof async === "undefined") {
					async = true;
				}

				BOOMR.fireEvent("xhr_init", "xhr");

				/**
				 * Setup an {EventListener} for Event @param{ename}. This function will
				 * make sure the timestamp for the resources request is set and calls
				 * loadFinished should the resource have finished.
				 *
				 * See {@link open()} for it's usage
				 *
				 * @param ename {String} Eventname to listen on via addEventListener
				 * @param stat {String} if that {@link ename} is reached set this
				 * as the status of the resource
				 *
				 * @memberof ProxyXHRImplementation
				 */
				function addListener(ename, stat) {
					req.addEventListener(
						ename,
						function() {
							if (ename === "readystatechange") {
								resource.timing[readyStateMap[req.readyState]] = BOOMR.now();

								// Listen here as well, as DOM changes might happen on other listeners
								// of readyState = 4 (complete), and we want to make sure we've
								// started the addEvent() if so.  Only listen if the status is non-zero,
								// meaning the request wasn't aborted.  Aborted requests will fire the
								// next handler.
								if (req.readyState === 4 && req.status !== 0) {
									if (req.status < 200 || req.status >= 400) {
										// put the HTTP error code on the resource if it's not a success
										resource.status = req.status;
									}

									if (impl.captureXhrRequestResponse) {
										resource.response = {
											text: (req.responseType === "" || req.responseType === "text") ? req.responseText : null,
											xml: (req.responseType === "" || req.responseType === "document") ? req.responseXML : null,
											raw: req.response,
											json: req.responseJSON
										};

										//
										// Work around browser bugs where our Boomerang frame's Object is not equal
										// to the main frame's Object.  This affects "isPlainObj()"-like checks that
										// validate the .constructor is equal to the main frame's Object.
										// e.g.
										// https://github.com/facebook/immutable-js/blob/master/src/utils/isPlainObj.js
										// This seems to mostly affect Safari 11.1.
										//
										if (req.response &&
										    req.response.constructor &&
										    req.response.constructor === BOOMR.boomerang_frame.Object &&
										    BOOMR.boomerang_frame.Object !== w.Object) {
											try {
												// try to switch the constructor to the main window
												req.response.constructor = w.Object;
											}
											catch (e) {
												// NOP
											}
										}
									}

									impl.loadFinished(resource);
								}
								else if (req.readyState === 0 && typeof resource.timing.open === "number") {
									// something called .abort() after the request was started
									resource.status = XHR_STATUS_ABORT;
									impl.loadFinished(resource);
								}
							}
							else {
								// load, timeout, error, abort
								if (ename === "load") {
									if (req.status !== 0 && (req.status < 200 || req.status >= 400)) {
										// put the HTTP error code on the resource if it's not a success
										resource.status = req.status;
									}
								}
								else {
									// this is a timeout/error/abort, so add the status code
									resource.status = (typeof stat === "undefined" ? req.status : stat);
								}

								impl.loadFinished(resource);
							}
						},
						false
					);
				}

				// .open() can be called multiple times (before .send()) - just make
				// sure that we don't track this as a new request, or add additional
				// event listeners
				if (!opened) {
					if (async) {
						addListener("readystatechange");
					}

					addListener("load");
					addListener("timeout", XHR_STATUS_TIMEOUT);
					addListener("error",   XHR_STATUS_ERROR);
					addListener("abort",   XHR_STATUS_ABORT);
				}

				resource.url = a.href;
				resource.method = method;
				resource.type = "xhr";

				// reset any statuses from previous calls to .open()
				delete resource.status;

				if (!async) {
					resource.synchronous = true;
				}

				// note we've called .open
				opened = true;

				// call the original open method
				try {
					return orig_open.apply(req, arguments);
				}
				catch (e) {
					// if there was an exception during .open(), .send() won't work either,
					// so let's fire loadFinished now
					resource.status = XHR_STATUS_OPEN_EXCEPTION;
					impl.loadFinished(resource);

					// rethrow the native method's exception
					throw e;
				}
			};

			/**
			 * Mark requestStart timestamp and start the request unless the resource
			 * has already been marked as having an error code or a result to itself.
			 *
			 * @returns {Object} The data normal XHR.send() would return
			 *
			 * @memberof ProxyXHRImplementation
			 */
			req.send = function(data) {
				if (excluded) {
					// this xhr is excluded from instrumentation, call the original send method
					return orig_send.apply(req, arguments);
				}

				if (impl.captureXhrRequestResponse) {
					req.resource.requestPayload = data;
				}

				BOOMR.fireEvent("xhr_send", req);

				handler.addEvent(resource);

				resource.timing.requestStart = BOOMR.now();
				// call the original send method unless there was an error
				// during .open
				if (typeof resource.status === "undefined" ||
				    resource.status !== XHR_STATUS_OPEN_EXCEPTION) {
					return orig_send.apply(req, arguments);
				}
			};

			req.resource = resource;

			return req;
		};

		BOOMR.proxy_XMLHttpRequest.UNSENT = 0;
		BOOMR.proxy_XMLHttpRequest.OPENED = 1;
		BOOMR.proxy_XMLHttpRequest.HEADERS_RECEIVED = 2;
		BOOMR.proxy_XMLHttpRequest.LOADING = 3;
		BOOMR.proxy_XMLHttpRequest.DONE = 4;
		// set our proxy's prototype to the original XHR prototype, in case anyone
		// is using it to save state
		BOOMR.proxy_XMLHttpRequest.prototype = BOOMR.orig_XMLHttpRequest.prototype;

		// Overwrite window.XMLHttpRequest, ensuring the original is swapped back in
		// if the Boomerang IFRAME is unloaded.  uninstrumentXHR() may also
		// be used to swap the original back in.
		BOOMR.utils.overwriteNative(w, "XMLHttpRequest", BOOMR.proxy_XMLHttpRequest);
	}

	/**
	 * Put original XMLHttpRequest Configuration back into place
	 */
	function uninstrumentXHR() {
		if (BOOMR.orig_XMLHttpRequest && BOOMR.orig_XMLHttpRequest !== w.XMLHttpRequest) {
			w.XMLHttpRequest = BOOMR.orig_XMLHttpRequest;
		}
	}

	/**
	 * Sends an XHR resource
	 */
	function sendResource(resource) {
		resource.initiator = "xhr";

		BOOMR.responseEnd(resource);
	}

	/**
	 * Container for AutoXHR plugin Closure specific state configuration data
	 *
	 * @property {string[]} spaBackendResources Default resources to count as Back-End during a SPA nav
	 * @property {FilterObject[]} filters Array of {@link FilterObject} that is used to apply filters on XHR Requests
	 * @property {boolean} initialized Set to true after the first run of
	 * {@link BOOMR.plugins.AutoXHR#init}
	 */
	impl = {
		spaBackEndResources: SPA_RESOURCES_BACK_END,
		alwaysSendXhr: false,
		excludeFilters: [],
		initialized: false,
		captureXhrRequestResponse: false,
		singlePageApp: false,
		autoXhrEnabled: false,
		monitorFetch: false,  // new feature, off by default
		fetchBodyUsedWait: FETCH_BODY_USED_WAIT_DEFAULT,
		spaIdleTimeout: SPA_TIMEOUT,
		xhrIdleTimeout: CLICK_XHR_TIMEOUT,

		/**
		 * Filter function iterating over all available {@link FilterObject}s if
		 * returns true will not instrument an XHR
		 *
		 * @param {HTMLAnchorElement} anchor - HTMLAnchorElement node created with
		 * the XHRs URL as `href` to evaluate by {@link FilterObject}s and passed
		 * to {@link FilterObject#cb} callbacks.
		 *
		 * NOTE: The anchor needs to be created from the host document
		 * (ie. `BOOMR.window.document`) to enable us to resolve relative URLs to
		 * a full valid path and BASE HREF mechanics can take effect.
		 *
		 * @return {boolean} true if the XHR should not be instrumented false if it should be instrumented
		 */
		excludeFilter: function(anchor) {
			var idx, ret, ctx;

			// If anchor is null we just throw it out period
			if (!anchor || !anchor.href) {
				return false;
			}

			for (idx = 0; idx < impl.excludeFilters.length; idx++) {
				if (typeof impl.excludeFilters[idx].cb === "function") {
					ctx = impl.excludeFilters[idx].ctx;
					if (impl.excludeFilters[idx].name) {
						
					}

					try {
						ret = impl.excludeFilters[idx].cb.call(ctx, anchor);
						if (ret) {

							return true;
						}
					}
					catch (exception) {
						BOOMR.addError(exception, "BOOMR.plugins.AutoXHR.impl.excludeFilter()");
					}
				}
			}
			return false;
		},

		/**
		 * Mark this as the time load ended via resources loadEventEnd property, if this resource has been added
		 * to the {@link MutationHandler} already notify that the resource has finished.
		 * Otherwise add this call to the lise of Events that occured.
		 *
		 * @param {object} resource Resource
		 *
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		loadFinished: function(resource, now) {
			var entry, navSt, useRT = false, entryStartTime, entryResponseEnd, p;

			now = now || BOOMR.now();

			// if we already finished via readystatechange or an error event,
			// don't do work again
			if (resource.timing.loadEventEnd) {
				return;
			}

			// fire an event for anyone listening
			if (resource.status) {
				BOOMR.fireEvent("xhr_error", resource);
			}

			// set the loadEventEnd timestamp to when this callback fired
			resource.timing.loadEventEnd = now;

			p = BOOMR.getPerformance();
			if (p && p.timing) {
				navSt = p.timing.navigationStart;

				// if ResourceTiming is available, fix-up the .timings with ResourceTiming
				// data, as it will be more accurate
				entry = BOOMR.getResourceTiming(resource.url,
					function(rt1, rt2) {
						// sort by desc responseEnd so that we'll get the one that finished closest to now
						return rt1.responseEnd - rt2.responseEnd;
					},
					function(rt) {
						// filter out requests that started before our tracked resource.
						// We set `requestStart` right before calling the original xhr.send or fetch call.
						// If the ResourceTiming startTime is more than 2ms earlier
						// than when we thought the XHR/fetch started then this is probably
						// an entry for a different resource.
						// The RT entry's startTime needs to be converted to an Epoch
						return ((Math.ceil(navSt + rt.startTime + 2) >= resource.timing.requestStart)) &&
						    (rt.responseEnd !== 0);
					}
				);

				if (entry) {
					// convert the start time to Epoch
					entryStartTime = Math.floor(navSt + entry.startTime);

					// set responseEnd, convert to Epoch
					entryResponseEnd = Math.floor(navSt + entry.responseEnd);

					// sanity check to see if the entry should be used for this resource
					if (entryResponseEnd <= BOOMR.now()) {  // this check could be moved into the fiter above
						resource.timing.responseEnd = entryResponseEnd;

						// make sure loadEventEnd is greater or equal to the RT
						// entry's responseEnd.
						// This will happen when fetch API is used without consuming the
						// response body
						if (resource.timing.loadEventEnd < entryResponseEnd) {
							resource.timing.loadEventEnd = entryResponseEnd;
						}

						// use the startTime from ResourceTiming instead
						resource.timing.requestStart = entryStartTime;

						// also track it as the fetchStart time
						resource.timing.fetchStart = entryStartTime;

						// use responseStart if it's valid
						if (entry.responseStart !== 0) {
							resource.timing.responseStart = Math.floor(navSt + entry.responseStart);
						}

						// save the entry for later use
						resource.restiming = entry;
					}
				}
			}

			// if there's an active XHR event happening, and alwaysSendXhr is true, make sure this
			// XHR goes out on its own beacon too
			if (resource.node && matchesAlwaysSendXhr(resource.url, impl.alwaysSendXhr)) {
				handler.sendResource(resource);
			}

			if (resource.index >= 0) {
				handler.monitorMO(resource.index);

				// fire the load_finished handler for the corresponding event.
				handler.load_finished(resource.index, resource.timing.responseEnd);
			}
		}
	};

	BOOMR.plugins.AutoXHR = {
		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} [config.instrument_xhr] Whether or not to instrument XHR
		 * @param {string[]} [config.AutoXHR.spaBackEndResources] Default resources to count as
		 * Back-End during a SPA nav
		 * @param {boolean} [config.AutoXHR.monitorFetch] Whether or not to instrument fetch()
		 * @param {number} [config.AuthXHR.fetchBodyUsedWait] If the fetch response's bodyUsed flag is false,
		 * we'll wait this amount of ms before checking RT for an entry. Setting to 0 will disable this feature
		 * @param {boolean} [config.AutoXHR.alwaysSendXhr] Whether or not to send XHR
		 * beacons for every XHR.
		 * @param {boolean} [config.captureXhrRequestResponse] Whether or not to capture an XHR's
		 * request and response bodies on for the {@link event:BOOMR#xhr_load xhr_load} event.
		 *
		 * @returns {@link BOOMR.plugins.AutoXHR} The AutoXHR plugin for chaining
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		init: function(config) {
			var i, idx;

			d = w.document;

			// if we don't have window, abort
			if (!w || !d) {
				return;
			}

			a = d.createElement("A");

			// gather config and config overrides
			BOOMR.utils.pluginConfig(impl, config, "AutoXHR",
			    ["spaBackEndResources", "alwaysSendXhr", "monitorFetch", "fetchBodyUsedWait",
			    "spaIdleTimeout", "xhrIdleTimeout"]);

			BOOMR.instrumentXHR = instrumentXHR;
			BOOMR.uninstrumentXHR = uninstrumentXHR;
			BOOMR.instrumentFetch = instrumentFetch;
			BOOMR.uninstrumentFetch = uninstrumentFetch;

			// Ensure we're only once adding the shouldExcludeXhr
			if (!impl.initialized) {
				this.addExcludeFilter(shouldExcludeXhr, null, "shouldExcludeXhr");

				impl.initialized = true;
			}

			// Add filters from config
			if (config && config.AutoXHR && config.AutoXHR.excludeFilters && config.AutoXHR.excludeFilters.length > 0) {
				for (idx = 0; idx < config.AutoXHR.excludeFilters.length; idx++) {
					impl.excludeFilters.push(config.AutoXHR.excludeFilters[idx]);
				}
			}

			impl.autoXhrEnabled = config.instrument_xhr;

			// check to see if any of the SPAs were enabled
			impl.singlePageApp = BOOMR.plugins.SPA && BOOMR.plugins.SPA.isSinglePageApp(config);

			// Whether or not to always send XHRs.  If a SPA is enabled, this means it will
			// send XHRs during the hard and soft navs.  If enabled, it will also disable
			// listening for MutationObserver events after an XHR is complete.
			if (impl.alwaysSendXhr && impl.autoXhrEnabled && BOOMR.xhr && typeof BOOMR.xhr.stop === "function") {
				function sendXhrs(resources) {
					if (resources.length) {
						for (i = 0; i < resources.length; i++) {
							sendResource(resources[i]);
						}
					}
					else {
						// single resource
						sendResource(resources);
					}
				};

				var resources = BOOMR.xhr.stop(sendXhrs);

				if (resources && resources.length) {
					BOOMR.setImmediate(sendXhrs, resources);
				}
			}

			if (impl.singlePageApp) {
				if (!impl.alwaysSendXhr) {
					// Disable auto-xhr until the SPA has fired its first beacon.  The
					// plugin will re-enable after it's ready.
					impl.autoXhrEnabled = false;
				}

				if (impl.autoXhrEnabled) {
					BOOMR.instrumentXHR();
					BOOMR.instrumentFetch();
				}
			}
			else {
				if (impl.autoXhrEnabled) {
					BOOMR.instrumentXHR();
					BOOMR.instrumentFetch();
				}
				else if (impl.autoXhrEnabled === false) {
					BOOMR.uninstrumentXHR();
					BOOMR.uninstrumentFetch();
				}
			}

			BOOMR.registerEvent("xhr_error");
		},

		/**
		 * Gets the {@link MutationHandler}
		 *
		 * @returns {MutationHandler} Handler
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		getMutationHandler: function() {
			return handler;
		},

		getPathname: getPathName,

		/**
		 * Enables AutoXHR if not already enabled.
		 *
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		enableAutoXhr: function() {
			if (!impl.autoXhrEnabled) {
				BOOMR.instrumentXHR();
				BOOMR.instrumentFetch();
			}

			impl.autoXhrEnabled = true;
		},

		/**
		 * A callback with a HTML element.
		 * @callback htmlElementCallback
		 * @param {HTMLAnchorElement} elem HTML a element
		 * @memberof BOOMR.plugins.AutoXHR
		 */

		/**
		 * Add a filter function to the list of functions to run to validate if an
		 * XHR should be instrumented.
		 *
		 * @example
		 * BOOMR.plugins.AutoXHR.addExcludeFilter(function(anchor) {
		 *   var m = anchor.href.match(/some-page\.html/g);
		 *
		 *   // If matching flag to not instrument
		 *   if (m && m.length > 0) {
		 *     return true;
		 *   }
		 *   return false;
		 * }, null, "exampleFilter");
		 * @param {BOOMR.plugins.AutoXHR.htmlElementCallback} cb Callback to run to validate filtering of an XHR Request
		 * @param {Object} ctx Context to run {@param cb} in
		 * @param {string} [name] Optional name for the filter, called out when running exclude filters for debugging purposes
		 *
		 * @memberof BOOMR.plugins.AutoXHR
		 */
		addExcludeFilter: function(cb, ctx, name) {
			impl.excludeFilters.push({cb: cb, ctx: ctx, name: name});
		},

		/**
		 * Enables or disables XHR request and response capturing for
		 * the {@link event:BOOMR#xhr_load xhr_load} event.
		 *
		 * @param {boolean} enabled Whether or not to enable capturing
		 */
		setXhrRequestResponseCapturing: function(enabled) {
			impl.captureXhrRequestResponse = enabled;
		}

	};

	/**
	 * Hook called once a resource is found to be loaded and timers have been set.
	 * @callback ResourceOnComplete
	 * @memberof BOOMR.plugins.AutoXHR
	 */

	/**
	 * @typedef {Object} Resource
	 * @memberof BOOMR.plugins.AutoXHR
	 *
	 * @desc
	 * Resource objects define properties of a page element or resource monitored by {@link AutoXHR}.
	 *
	 * @property {string} initiator Type of source that initiated the resource to be fetched:
	 * `click`, `xhr` or SPA initiated
	 * @property {string} url Path to the resource fetched from either the HTMLElement or XHR request that triggered it
	 * @property {object} timing Resource timing information gathered from internal timers or ResourceTiming if supported
	 * @property {ResourceTiming} timing Object containing start and end timings of the resource if set
	 * @property {ResourceOnComplete} [onComplete] Called once the resource has been fetched
	 */

	/**
	 * An event on a page instrumented by {@link MutationHandler} and monitored by AutoXHR
	 *
	 * @typedef PendingEvent
	 *
	 * @property {string} type The type of event that we are watching (`xhr`, `click`,
	 *   [SPAs]{@link BOOMR.constants.BEACON_TYPE_SPAS})
	 * @property {number} nodes_to_wait Number of nodes to wait for before event completes
	 * @property {number} total_nodes Total number of resources
	 * @property {Resource} resource The resource this event is attached to
	 * @property {boolean} complete `true` if event completed `false` if not
	 * @property {Resource[]} [resources] multiple resources that are attached to this event
	 *
	 * @memberof BOOMR.plugins.AutoXHR
	 */

	/**
	 * Timestamps for start of a request and end of loading
	 *
	 * @typedef ResourceTiming
	 *
	 * @property {TimeStamp} loadEventEnd Timestamp when the resource arrived in the browser
	 * @property {TimeStamp} requestStart High resolution timestamp when the resource was started to be loaded
	 *
	 * @memberof BOOMR.plugins.AutoXHR
	 */

	/**
	 * Filter object with data on the callback, context and name.
	 *
	 * @typedef FilterObject
	 *
	 * @property {BOOMR.plugins.AutoXHR.htmlElementCallback} cb Callback
	 * @property {Object} ctx Execution context to use when running `cb`
	 * @property {string} [name] Name of the filter used for logging and debugging purposes (This is an entirely optional property)
	 *
	 * @memberof BOOMR.plugins.AutoXHR
	 */
})();

/**
 * Enables Single Page App (SPA) performance monitoring.
 *
 * **Note**: The `SPA` plugin requires the {@link BOOMR.plugins.AutoXHR} plugin
 * to be loaded before `SPA`, and one of the following SPA plugins to work:
 *
 * * {@link BOOMR.plugins.Angular}
 * * {@link BOOMR.plugins.Backbone}
 * * {@link BOOMR.plugins.Ember}
 * * {@link BOOMR.plugins.History} (React and all other SPA support)
 *
 * You also need to disable {@link BOOMR.init|autorun} when enabling SPA support.
 *
 * If you are not using a SPA framework but rely mostly on `XMLHttpRequests` to
 * build your site, you might be able to skip the SPA plugins and just enable
 * the {@link BOOMR.plugins.AutoXHR} plugin to measure your site.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Approach
 *
 * Boomerang monitors Single Page App (SPA) navigations differently than how it
 * monitors navigations on traditional websites.
 *
 * On traditional websites, the browser completes a full navigation for every page.
 * During this navigation, the browser requests the page's HTML, JavaScript,
 * CSS, etc., from the server, and builds the page from these components. Boomerang
 * monitors this entire process.
 *
 * On SPA websites, only the first page that the visitor loads is a full
 * navigation. All subsequent navigations are handled by the SPA framework
 * itself (i.e. AngularJS), where they dynamically pull in the content they
 * need to render the new page. This is done without executing a full navigation
 * from the browser's point of view.
 *
 * Boomerang was designed for traditional websites, where a full navigation
 * occurs on each page load. During the navigation, Boomerang tracks the
 * performance characteristics of the entire page load experience. However, for
 * SPA websites, only the first page triggers a full navigation. Thus, without
 * any additional help, Boomerang will not track any subsequent interactions
 * on SPA websites.
 *
 * To give visibility into SPA website navigations, there are several Boomerang
 * plugins available for SPA frameworks, such as AngularJS, Ember.js and Backbone.js.
 * When these plugins are enabled, Boomerang is able to track all of the SPA
 * navigations beyond the first, initial navigation.
 *
 * To do so, the Boomerang SPA plugins listen for several life cycle events from
 * the framework, such as AngularJS's `$routeChangeStart`. Once it gets notified
 * of these events, the Boomerang SPA plugins start monitoring the page's markup
 * (DOM) for changes. If any of these changes trigger a download, such as a
 * XHR, image, CSS, or JavaScript, then the Boomerang SPA plugins monitor those
 * resources as well. Only once all of these new resources have been fetched do
 * the Boomerang SPA plugins consider the SPA navigation complete.
 *
 * For a further explanation of the challenges of measuring SPAs, see our
 * {@link https://www.slideshare.net/nicjansma/measuring-the-performance-of-single-page-applications|slides}
 * or our {@link https://www.youtube.com/watch?v=CYEYtQPofhQ&t=10s|talk}.
 *
 * ## Hard and Soft Navigations
 *
 * * A **SPA Hard Navigation** is always the first navigation to the site, plus
 *   any of the work required to build the initial view.
 *    * The Hard Navigation will track at least the length of `onload`, but may also include the additional
 *      time required to load the framework (for example, Angular) and the first view.
 *    * A SPA site will only have a single SPA Hard Navigation, no "Page Load" beacons.
 *    * The `http.initiator` type is `spa_hard`
 * * A **SPA Soft Navigation** is any navigation after the Hard Navigation.
 *    * A soft navigation is an "in-page" navigation where the view changes, but
 *      the browser does not actually fully navigate.
 *    * A SPA site could have zero through many Soft Navigations
 *    * The `http.initiator` type is `spa`
 *
 * ## Navigation Timestamps
 *
 * ### Hard Navigations
 *
 * The length of a Hard Navigation is calculated from the beginning of the browser
 * navigation (e.g. `navigationStart` from NavigationTiming) through when the
 * last critical resource has been fetched for the page.
 *
 * Critical resources include Images, IFRAMEs, CSS and Scripts.
 *
 * ### Soft Navigations
 *
 * The length of a Soft Navigation is calculated from the beginning of the route
 * change event (e.g. when the user clicked somewhere to change the view) through
 * when the last critical resource has been fetched for the page.
 *
 * ## Front-End vs. Back-End Time
 *
 * For SPA navigations, the _Back End_ time (`t_resp`) is calculated as any period
 * where a XHR or Script tag was being fetched.
 *
 * The _Front End_ time (`t_page`) is calculated by taking the total SPA Page
 * Load time (`t_done`) minus _Back End_ time (`t_resp`).
 *
 * ## Beacon Parameters
 *
 * * `http.initiator`
 *     * `spa_hard` for Hard Navigations
 *     * `spa` for Soft Navigations
 *
 * @class BOOMR.plugins.SPA
 */
(function() {
	var hooked = false,
	    initialized = false,
	    initialRouteChangeStarted = false,
	    initialRouteChangeCompleted = false,
	    autoXhrEnabled = false,
	    firstSpaNav = true,
	    routeFilter = false,
	    routeChangeWaitFilter = false,
	    disableHardNav = false,
	    supported = [],
	    latestResource,
	    waitingOnHardMissedComplete = false;

	
	

	if (BOOMR.plugins.SPA || !BOOMR.plugins.AutoXHR) {
		return;
	}


	var impl = {
		/**
		 * Called after a SPA Hard navigation that missed the route change
		 * completes.
		 *
		 * We may want to fix-up the timings of the SPA navigation if there was
		 * any other activity after onload.
		 *
		 * If there was not activity after onload, using the timings for
		 * onload from NavigationTiming.
		 *
		 * If there was activity after onload, use the end time of the latest
		 * resource.
		 *
		 * @param {BOOMR.plugins.AutoXHR.Resource} resource Resource
		 */
		spaHardMissedOnComplete: function(resource) {
			var p, navigationStart = (BOOMR.plugins.RT && BOOMR.plugins.RT.navigationStart());

			waitingOnHardMissedComplete = false;

			// note that we missed the route change on the beacon for debugging
			BOOMR.addVar("spa.missed", "1", true);

			// ensure t_done is the time we've specified
			if (BOOMR.plugins.RT) {
				BOOMR.plugins.RT.clearTimer("t_done");
			}

			// always use the start time of navigationStart
			resource.timing.requestStart = navigationStart;

			if (resource.resources.length === 0) {
				// No other resources were fetched, so set the end time
				// to NavigationTiming's performance.loadEventEnd if available (instead of 'now')
				p = BOOMR.getPerformance();
				if (p && p.timing && p.timing.navigationStart && p.timing.loadEventEnd) {
					resource.timing.loadEventEnd = p.timing.loadEventEnd;
				}
			}
		},

		/**
		 * Fired on a non-spa page load
		 */
		pageReady: function() {
			// a non-spa page load fired, disableHardNav might be enabled
			initialRouteChangeCompleted = true;
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.SPA = {
		/**
		 * Determines if the plugin is complete
		 *
		 * @returns {boolean} True if the plugin is complete
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		is_complete: function() {
			return !waitingOnHardMissedComplete;
		},

		/**
		 * Called to initialize the plugin via BOOMR.init()
		 *
		 * @param {object} config Configuration
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		init: function(config) {
			if (config && config.instrument_xhr) {
				autoXhrEnabled = config.instrument_xhr;

				// if AutoXHR is enabled, and we've already had
				// a route change, make sure to turn AutoXHR back on
				if (initialRouteChangeStarted && autoXhrEnabled) {
					BOOMR.plugins.AutoXHR.enableAutoXhr();
				}
			}

			if (initialized) {
				return;
			}

			initialized = true;
			BOOMR.subscribe("page_ready", impl.pageReady, null, impl);
		},

		/**
		 * Registers a framework with the SPA plugin
		 *
		 * @param {string} pluginName Plugin name
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		register: function(pluginName) {
			supported.push(pluginName);
		},

		/**
		 * Gets a list of supported SPA frameworks
		 *
		 * @returns {string[]} List of supported frameworks
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		supported_frameworks: function() {
			return supported;
		},

		/**
		 * Fired when onload happens (or immediately if onload has already fired)
		 * to monitor for additional resources for a SPA Hard navigation
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		onLoadSpaHardMissed: function() {
			if (initialRouteChangeStarted) {
				// we were told the History event was missed, but it happened anyways
				// before onload
				return;
			}

			// We missed the initial route change (we loaded too slowly), so we're too
			// late to monitor for new DOM elements.  Don't hold the initial page load beacon.
			initialRouteChangeCompleted = true;

			if (autoXhrEnabled) {
				// re-enable AutoXHR if it's enabled
				BOOMR.plugins.AutoXHR.enableAutoXhr();
			}

			// ensure the beacon is held until this SPA hard beacon is ready
			waitingOnHardMissedComplete = true;

			if (!disableHardNav) {
				// Trigger a route change
				BOOMR.plugins.SPA.route_change(impl.spaHardMissedOnComplete);
			}
			else {
				waitingOnHardMissedComplete = false;
			}
		},

		/**
		 * Callback to let the SPA plugin know whether or not to monitor the current
		 * SPA soft route.
		 *
		 * Any time a route is changed, if set, this callback will be executed
		 * with the current framework's route data.
		 *
		 * If the callback returns `false`, the route will not be monitored.
		 *
		 * @callback spaRouteFilter
		 * @param {object} data Route data
		 *
		 * @returns {boolean} `true` to monitor the current route
		 * @memberof BOOMR.plugins.SPA
		 */

		/**
		 * Callback to let the SPA plugin know whether or not the end of monitoring
		 * of the current SPA soft route should be delayed until {@link BOOMR.plugins.SPA.wait_complete}
		 * is called.
		 *
		 * If the callback returns `false`, the route will be monitored as normal.
		 *
		 * @callback spaRouteChangeWaitFilter
		 * @param {object} data Route data
		 *
		 * @returns {boolean} `true` to wait until {@link BOOMR.plugins.SPA.wait_complete} is called.
		 * @memberof BOOMR.plugins.SPA
		 */

		/**
		 * Called by a framework when it has hooked into the target SPA
		 *
		 * @param {boolean} hadRouteChange True if a route change has already fired
		 * @param {object} [options] Additional options
		 * @param {BOOMR.plugins.SPA.spaRouteFilter} [options.routeFilter] Route filter
		 * @param {BOOMR.plugins.SPA.spaRouteChangeWaitFilter} [options.routeChangeWaitFilter] Route change wait filter
		 * @param {boolean} [options.disableHardNav] Disable sending SPA hard beacons
		 *
		 * @returns {@link BOOMR.plugins.SPA} The SPA plugin for chaining
		 * @memberof BOOMR.plugins.SPA
		 */
		hook: function(hadRouteChange, options) {
			options = options || {};

			

			// allow to set options each call in case they change

			if (typeof options.routeFilter === "function") {
				routeFilter = options.routeFilter;
			}

			if (typeof options.routeChangeWaitFilter === "function") {
				routeChangeWaitFilter = options.routeChangeWaitFilter;
			}

			if (options.disableHardNav) {
				disableHardNav = options.disableHardNav;
			}

			if (hooked) {
				return this;
			}

			if (hadRouteChange) {
				// kick off onLoadSpaHardMissed once onload has fired, or immediately
				// if onload has already fired
				BOOMR.attach_page_ready(this.onLoadSpaHardMissed);
			}

			hooked = true;

			return this;
		},

		/**
		 * Called by a framework when a route change has started.  The SPA plugin will
		 * begin monitoring downloadable resources to measure the SPA soft navigation.
		 *
		 * @param {function} onComplete Called on completion
		 * @param {object[]} routeFilterArgs Route Filter arguments
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		route_change: function(onComplete, routeFilterArgs) {
			

			var firedEvent = false;
			var initiator = firstSpaNav && !disableHardNav ? "spa_hard" : "spa";

			if (latestResource && latestResource.wait) {
				
				return;
			}

			// if we have a routeFilter, see if we want to track this SPA soft route
			if (initiator === "spa" && routeFilter) {
				try {
					if (!routeFilter.apply(null, routeFilterArgs)) {
						
						return;
					}
					else {
						
					}
				}
				catch (e) {
					BOOMR.addError(e, "SPA.route_change.routeFilter");
				}
			}

			// note we've had at least one route change
			initialRouteChangeStarted = true;

			// If this was the first request, use navStart as the begin timestamp.  Otherwise, use
			// "now" as the begin timestamp.
			var navigationStart = (BOOMR.plugins.RT && BOOMR.plugins.RT.navigationStart());
			var requestStart = initialRouteChangeCompleted ? BOOMR.now() : navigationStart;

			// use the document.URL even though it may be the URL of the previous nav. We will updated
			// it in AutoXHR sendEvent
			var url = BOOMR.window.document.URL;

			// `this` is unbound, use BOOMR.plugins.SPA
			BOOMR.fireEvent("spa_init", [BOOMR.plugins.SPA.current_spa_nav(), url]);

			// construct the resource we'll be waiting for
			var resource = {
				timing: {
					requestStart: requestStart
				},
				initiator: initiator,
				url: url
			};

			firstSpaNav = false;

			if (!initialRouteChangeCompleted || typeof onComplete === "function") {
				initialRouteChangeCompleted = true;

				// if we haven't completed our initial SPA navigation yet (this is a hard nav), wait
				// for all of the resources to be downloaded
				resource.onComplete = function(onCompleteResource) {
					if (!firedEvent) {
						firedEvent = true;

						// fire a SPA navigation completed event so that other plugins can act on it
						BOOMR.fireEvent("spa_navigation");
					}

					if (typeof onComplete === "function") {
						onComplete(onCompleteResource);
					}
				};
			}

			// if we have a routeChangeWaitFilter, make sure AutoXHR waits on the custom event
			// for this SPA soft route
			if (initiator === "spa" && routeChangeWaitFilter) {
				
				try {
					if (routeChangeWaitFilter.apply(null, arguments)) {
						
						resource.wait = true;

						latestResource = resource;
					}
					else {
						
					}
				}
				catch (e) {
					BOOMR.addError(e, "SPA.route_change.routeChangeWaitFilter");
				}
			}

			// start listening for changes
			resource.index = BOOMR.plugins.AutoXHR.getMutationHandler().addEvent(resource);

			// re-enable AutoXHR if it's enabled
			if (autoXhrEnabled) {
				BOOMR.plugins.AutoXHR.enableAutoXhr();
			}
		},

		/**
		 * Called by a framework when the location has changed to the specified URL.
		 * This should be called prior to route_change() to use the specified URL.
		 *
		 * @param {string} url URL
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		last_location: function(url) {
			lastLocationChange = url;
		},

		/**
		 * Determine the current SPA navigation type (`spa` or `spa_hard`)
		 *
		 * @returns {string} SPA beacon type
		 * @memberof BOOMR.plugins.SPA
		 */
		current_spa_nav: function() {
			return !initialRouteChangeCompleted ? "spa_hard" : "spa";
		},

		/**
		 * Called by the SPA consumer if we have a `routeChangeWaitFilter` and are manually
		 * waiting for a custom event. The spa soft navigation will continue waiting for
		 * other nodes in progress
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		wait_complete: function() {
			
			if (latestResource) {
				latestResource.wait = false;

				if (latestResource.waitComplete) {
					
					latestResource.waitComplete();
				}

				latestResource = null;
			}
		},

		/**
		 * Marks the current navigation as complete and sends a beacon.
		 * The spa soft navigation will not wait for other nodes in progress
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		markNavigationComplete: function() {
			var i, ev, waiting, mh = BOOMR.plugins.AutoXHR.getMutationHandler();

			// if we're waiting due to a `routeChangeWaitFilter` then mark it complete
			if (latestResource && latestResource.wait) {
				BOOMR.plugins.SPA.wait_complete();
			}

			if (mh && mh.pending_events.length > 0) {
				for (i = mh.pending_events.length - 1; i >= 0; i--) {
					ev = mh.pending_events[i];
					if (ev && BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
						if (ev.complete) {
							// latest spa is not in progress
							break;
						}

						waiting = mh.nodesWaitingFor(i);

						

						// note that the navigation was forced complete
						BOOMR.addVar("spa.forced", "1", true);

						// add the count of nodes we were waiting for
						BOOMR.addVar("spa.waiting", mh.nodesWaitingFor(), true);

						// finalize this navigation
						mh.completeEvent(i);
						return;
					}
				}
			}
			
		},

		/**
		 * Determines if a SPA navigation is in progress
		 *
		 * @memberof BOOMR.plugins.SPA
		 */
		isSpaNavInProgress: function() {
			var i, ev, waiting, mh = BOOMR.plugins.AutoXHR.getMutationHandler();
			if (mh && mh.pending_events.length > 0) {
				for (i = mh.pending_events.length - 1; i >= 0; i--) {
					ev = mh.pending_events[i];
					if (ev && BOOMR.utils.inArray(ev.type, BOOMR.constants.BEACON_TYPE_SPAS)) {
						return !ev.complete;  // true if the latest spa nav is not complete
					}
				}
			}
			return false;
		},

		/**
		 * Check to see if any of the SPAs are enabled.
		 * Takes a config object so that it can be called from other plugins' init without
		 * worrying about plugin order
		 *
		 * @param {object} config
		 *
		 * @returns {boolean} true if one of the SPA frameworks is enabled
		 */
		isSinglePageApp: function(config) {
			var singlePageApp = false, frameworks = this.supported_frameworks();
			for (i = 0; i < frameworks.length; i++) {
				var spa = frameworks[i];
				if (config[spa] && config[spa].enabled) {
					singlePageApp = true;
					break;
				}
			}
			return singlePageApp;
		}

	};
	BOOMR.plugins.SPA.waitComplete = BOOMR.plugins.SPA.wait_complete;

}());

/**
 * The History plugin allows you to automatically monitor Single Page
 * App (SPA) navigations that change their routes via the
 * [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history)
 * object.
 *
 * The History plugin can be used for any SPA (eg. Angular, Backbone, Ember, React, Vue, etc.)
 * and replaces the deprecated Angular, Backbone and Ember plugins.
 *
 * **Note**: This plugin requires the {@link BOOMR.plugins.AutoXHR} and
 * {@link BOOMR.plugins.SPA} plugins to be loaded first (in that order).
 *
 * For details on how Boomerang Single Page App instrumentation works, see the
 * {@link BOOMR.plugins.SPA} documentation.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Compatibility
 *
 * This plugin should work with any Single Page App, by instrumenting the
 * [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history)
 * object to monitor for route changes.
 *
 * The SPA app needs to change the history state or hash before doing the work required to
 * change the route (eg. XHRs, DOM node changes). With frameworks where the history events
 * happen after the route change has completed (e.g. Ember.js 1.x), we can configure the
 * plugin with `monitorHistory: false` and call `BOOMR.plugins.SPA.route_change()` manually
 * when the route change begins.
 *
 * ## Beacon Parameters
 *
 * This plugin does not add any additional beacon parameters beyond the
 * {@link BOOMR.plugins.SPA} plugin.
 *
 * ## Usage
 *
 * Include the {@link BOOMR.plugins.AutoXHR}, {@link BOOMR.plugins.SPA}
 * and {@link BOOMR.plugins.History} plugins.  See {@tutorial building} for details.
 *
 * @class BOOMR.plugins.History
 */
(function() {
	var impl = {
		monitorHistory: true,  // if monitorHistory is false then the History object will not be hooked
		enabled: true,
		hooked: false,
		routeChangeInProgress: false,  // will store the setTimeout id when set
		disableHardNav: false,  // whether or not to disable SPA hard beacons
		routeFilter: undefined,  // route change filter callback function
		routeChangeWaitFilter: undefined,  // route change wait filter callback function
		monitorReplaceState: true,  // whether or not to hook history.replaceState
		a: undefined,  // helper anchor object used to cleanup urls
		browserOnloadBeforeSetup: false,  // browser onload happened before our setup

		DEPRECATED_PLUGINS: ["Angular", "Backbone", "Ember"],

		/**
		 * Clears routeChangeInProgress flag
		 */
		resetRouteChangeInProgress: function(edata) {
			// Three types of beacons can go out before the Page Load beacon: Early Beacon, Custom Metric and Custom Timer.
			// For those beacon types, we want to keep the state unchanged.
			if (edata &&
				(
					(typeof edata.early !== "undefined") ||
					(edata["http.initiator"] && edata["http.initiator"].indexOf("api_custom_") === 0)
				)) {

				return;
			}

			

			if (impl.routeChangeInProgress) {
				clearTimeout(impl.routeChangeInProgress);
			}

			impl.routeChangeInProgress = false;
		},

		/**
		 * Sets routeChangeInProgress flag and sets up timer to clear it later
		 */
		setRouteChangeInProgress: function() {
			if (impl.routeChangeInProgress) {
				clearTimeout(impl.routeChangeInProgress);
			}
			// reset our routeChangeInProgress flag as soon as the browser is free.
			// Current browser behavior favors sending internal events over calling
			// timeout callbacks. If for example the back button is clicked and a replaceState
			// is called then the popstate event should be triggered to extend this timeout before
			// the callback is called.
			impl.routeChangeInProgress = setTimeout(impl.resetRouteChangeInProgress, 50);
		},

		/**
		 * Called on route change
		 */
		routeChange: function(event) {
			if (!impl.enabled) {
				
				impl.resetRouteChangeInProgress();
			}
			else {
				// don't track the SPA route change until the onload (page_ready)
				// has fired
				if (impl.disableHardNav && !BOOMR.onloadFired()) {
					
					return;
				}

				if (!impl.routeChangeInProgress) {
					
					if (event.toUrl) {
						impl.a.href = event.toUrl;
						event.toUrl = impl.a.href;
					}
					BOOMR.plugins.SPA.route_change(null, event);
				}
				else {
					
				}
			}
		}
	};

	
	

	// Checking for Plugins required and if already integrated
	if (BOOMR.plugins.History ||
	    typeof BOOMR.plugins.SPA === "undefined" ||
	    typeof BOOMR.plugins.AutoXHR === "undefined") {
		return;
	}

	// check that window and document available
	if (!BOOMR.window || !BOOMR.window.document) {
		return;
	}

	// register as a SPA plugin
	BOOMR.plugins.SPA.register("History");

	impl.a = BOOMR.window.document.createElement("A");


	/**
	 * Hook into `window.history` Object
	 *
	 * This function will override the following functions if available:
	 *   - pushState
	 *   - replaceState
	 *   - go
	 *   - back
	 *   - forward
	 * And listen to event:
	 *   - hashchange
	 *   - popstate
	 */
	function setup() {
		var history = BOOMR.window.history;

		//
		// History API overrides
		//

		if (typeof history.pushState === "function") {
			history.pushState = (function(_pushState) {
				return function(state, title, url) {
					
					impl.routeChange({type: "pushState", fromUrl: BOOMR.window.document.URL, toUrl: url});
					return _pushState.apply(this, arguments);
				};
			})(history.pushState);
		}

		if (impl.monitorReplaceState && typeof history.replaceState === "function") {
			history.replaceState = (function(_replaceState) {
				return function(state, title, url) {
					var fromUrl = BOOMR.window.document.URL, toUrl = fromUrl;

					// url is an optional param
					if (arguments.length >= 3 && typeof url !== "undefined" && url !== null) {
						impl.a.href = url;  // normalize url
						toUrl = impl.a.href;
					}

					// only issue route change if a nav is not in progress or the URL is changing
					if (!BOOMR.plugins.SPA.isSpaNavInProgress() || toUrl !== fromUrl) {
						
						impl.routeChange({type: "pushState", fromUrl: BOOMR.window.document.URL, toUrl: url});
					}
					else {
						
					}
					return _replaceState.apply(this, arguments);
				};
			})(history.replaceState);
		}

		// we instrument go, back and forward because they are called earlier than the
		// popstate event which gives AutoXHR a chance to setup the MO
		if (typeof history.go === "function") {
			history.go = (function(_go) {
				return function(index) {
					
					impl.routeChange({type: "go", fromUrl: BOOMR.window.document.URL});  // spa_init url will be the url before `go` runs .. for routefilter also
					return _go.apply(this, arguments);
				};
			})(history.go);
		}

		if (typeof history.back === "function") {
			history.back = (function(_back) {
				return function() {
					
					impl.routeChange({type: "back", fromUrl: BOOMR.window.document.URL});  // spa_init url will be the url before `back` runs
					return _back.apply(this, arguments);
				};
			})(history.back);
		}

		if (typeof history.forward === "function") {
			history.forward = (function(_forward) {
				return function() {
					
					impl.routeChange({type: "forward", fromUrl: BOOMR.window.document.URL});  // spa_init url will be the url before `forward` runs
					return _forward.apply(this, arguments);
				};
			})(history.forward);
		}

		// listen for hash changes.
		// hashchange events may be available even if the browser does not support the History API
		BOOMR.window.addEventListener("hashchange", function(event) {
			var url = (event || {}).newURL;
			
			impl.routeChange({type: "hashchange", toUrl: url});
		});

		/**
		 * Add event listener for `popstate`
		 */
		function aelPopstate() {
			// popstate events may be available even if the browser does not support the History API
			BOOMR.window.addEventListener("popstate", function(event) {
				
				impl.routeChange({type: "popstate", toUrl: BOOMR.window.document.URL});
			});
		}

		// add listener for popstate after page load has occured so that we don't receive an unwanted popstate
		// event at onload
		if (BOOMR.hasBrowserOnloadFired()) {
			aelPopstate();
		}
		else {
			// the event listener will be registered early enough to get an unwanted event if we don't use setTimeout
			BOOMR.window.addEventListener("load", function() { setTimeout(aelPopstate, 0); });
		}

		// listen for a beacon
		BOOMR.subscribe("beacon", impl.resetRouteChangeInProgress);

		// listen for spa cancellations
		BOOMR.subscribe("spa_cancel", impl.resetRouteChangeInProgress);

		// listen for spa inits. We're adding this to catch the event sent by the SPA plugin
		BOOMR.subscribe("spa_init", impl.setRouteChangeInProgress);

		// if browser onload event has happened, assume we missed the route change
		impl.browserOnloadBeforeSetup = BOOMR.hasBrowserOnloadFired();

		return true;
	};

	//
	// Exports
	//
	BOOMR.plugins.History = {
		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.History
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Hooks Boomerang into the History events.
		 *
		 * @param {object} history Deprecated
		 * @param {boolean} [hadRouteChange] Deprecated
		 * event prior to this `hook()` call
		 * @param {object} [options] Optional options. Can contain `routeFilter` and/or `routeChangeWaitFilter`
		 *
		 * @returns {@link BOOMR.plugins.History} The History plugin for chaining
		 * @memberof BOOMR.plugins.History
		 */
		hook: function(history, hadRouteChange, options) {
			try {
				
			}
			catch (e) {
				
			}

			options = options || {};
			options.disableHardNav = impl.disableHardNav;

			if (impl.routeFilter) {
				options.routeFilter = impl.routeFilter;
			}

			if (impl.routeChangeWaitFilter) {
				options.routeChangeWaitFilter = impl.routeChangeWaitFilter;
			}

			if (!impl.hooked && impl.monitorHistory) {
				setup();
			}

			// allow to call again in case options changed
			hadRouteChange = impl.browserOnloadBeforeSetup;
			BOOMR.plugins.SPA.hook(hadRouteChange, options);

			if (!impl.hooked && !impl.browserOnloadBeforeSetup && (!impl.disableHardNav || BOOMR.onloadFired())) {
				// fire our route change asap so that we can listen for mutatations, etc
				BOOMR.plugins.SPA.route_change();
				impl.setRouteChangeInProgress();
			}

			impl.hooked = true;
			return this;
		},

		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} [config.History.auto] Whether or not to automatically
		 * instrument the `window.history` object.
		 * If set to `false`, the React snippet should be used.
		 * @param {boolean} [config.History.disableHardNav] Whether or not to disable SPA hard beacons
		 * @param {function} [config.History.routeFilter] Route change filter callback function
		 * @param {function} [config.History.routeChangeWaitFilter] Route change wait filter callback function
		 * @param {boolean} [config.History.monitorReplaceState] Whether or not to hook History.replaceState
		 *
		 * @returns {@link BOOMR.plugins.History} The History plugin for chaining
		 * @example
		 * BOOMR.init({
		 *   History: {
		 *     enabled: true
		 *   });
		 * });
		 * @memberof BOOMR.plugins.History
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "History",
				["enabled", "monitorHistory", "disableHardNav",
				 "routeFilter", "routeChangeWaitFilter",
				 "monitorReplaceState"]);

			if (impl.enabled) {
				this.hook();
			}

			return this;
		},

		/**
		 * Disables the History plugin
		 *
		 * @returns {@link BOOMR.plugins.History} The History plugin for chaining
		 * @memberof BOOMR.plugins.History
		 */
		disable: function() {
			impl.enabled = false;
			return this;
		},

		/**
		 * Enables the History plugin
		 *
		 * @returns {@link BOOMR.plugins.History} The History plugin for chaining
		 * @memberof BOOMR.plugins.History
		 */
		enable: function() {
			impl.enabled = true;
			return this;
		}
	};

	/* eslint-disable no-loop-func */
	// create backwards compatible plugins that now use History
	for (var i = 0; i < impl.DEPRECATED_PLUGINS.length; i++) {
		var plugin_name = impl.DEPRECATED_PLUGINS[i];
		BOOMR.plugins[plugin_name] = BOOMR.plugins.History;

		BOOMR.plugins[plugin_name] = {
			init: (function(_plugin_name) {
				return function(config) {
					BOOMR.utils.pluginConfig(impl, config, _plugin_name, ["enabled"]);

					if (impl.enabled) {
						
						BOOMR.plugins.History.hook(undefined, undefined, {});
					}

					return BOOMR.plugins[_plugin_name];
				};
			})(plugin_name),
			enable: BOOMR.plugins.History.enable,
			// we don't want these plugins to have a `disable` function otherwise they will disable the History plugin
			hook: BOOMR.plugins.History.hook,
			is_complete: BOOMR.plugins.History.is_complete
		};

		// register as a SPA plugin (need this because the SPA plugin will look at each plugin config)
		BOOMR.plugins.SPA.register(plugin_name);
	}
	/* eslint-enable no-loop-func */
}());

/**
 * The roundtrip (RT) plugin measures page load time, or other timers associated with the page.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `t_done`: Perceived load time of the page.
 * * `t_page`: Time taken from the head of the page to {@link BOOMR#event:page_ready}.
 * * `t_page.inv`: If there was a problem detected with the start/end times of `t_page`.
 *    This can happen due to bugs in NavigationTiming clients, where `responseEnd`
 *    happens after all other NavigationTiming events.
 * * `t_resp`: Time taken from the user initiating the request to the first byte of the response.
 * * `t_other`: Comma separated list of additional timers set by page developer.
 *   Each timer is of the format `name|value`
 * * `t_load`: If the page were prerendered, this is the time to fetch and prerender the page.
 * * `t_prerender`: If the page were prerendered, this is the time from start of
 *   prefetch to the actual page display. It may only be useful for debugging.
 * * `t_postrender`: If the page were prerendered, this is the time from prerender
 *   finish to actual page display. It may only be useful for debugging.
 * * `vis.pre`: `1` if the page transitioned from prerender to visible
 * * `r`: URL of page that set the start time of the beacon.
 * * `nu`: URL of next page if the user clicked a link or submitted a form
 * * `rt.start`: Specifies where the start time came from. May be one of:
 *   - `cookie` for the start cookie
 *   - `navigation` for the W3C NavigationTiming API,
 *   - `csi` for older versions of Chrome or gtb for the Google Toolbar.
 *   - `manual` for XHR beacons
 *   - `none` if the start could not be detected
 * * `rt.tstart`: The start time timestamp.
 * * `rt.nstart`: The `navigationStart` timestamp, if different from `rt.tstart.  This could
 *    happen for XHR beacons, where `rt.tstart` is the start of the XHR fetch, and `nt_nav_st`
 *    won't be on the beacon.  It could also happen for SPA Soft beacons, where `rt.tstart`
 *    is the start of the Soft Navigation.
 * * `rt.cstart`: The start time stored in the cookie if different from rt.tstart.
 * * `rt.bstart`: The timestamp when boomerang started executing.
 * * `rt.blstart`: The timestamp when the boomerang was added to the host page.
 * * `rt.end`: The timestamp when the `t_done` timer ended
 *   (`rt.end - rt.tstart === t_done`)
 * * `rt.bmr`: Several parameters that include resource timing information for
 *   boomerang itself, ie, how long did boomerang take to load
 * * `rt.subres`: Set to `1` if this beacon is for a sub-resource of a primary
 *    page beacon. This is typically set by XHR beacons, and you will need to
 *    use a separate identifier to tie the primary beacon and the subresource
 *    beacon together on the server-side.
 * * `rt.quit`: This parameter will exist (but have no value) if the beacon was
 *    fired as part of the `onbeforeunload` event. This is typically used to
 *    find out how much time the user spent on the page before leaving, and is
 *    not guaranteed to fire.
 * * `rt.abld`: This parameter will exist (but have no value) if the `onbeforeunload`
 *    event fires before the `onload` event fires. This can happen, for example,
 *    if the user left the page before it completed loading.
 * * `rt.ntvu`: This parameter will exist (but have no value) if the `onbeforeunload`
 *    event fires before the page ever became visible. This can happen if the
 *    user opened the page in a background tab, and closed it without viewing it,
 *    and also if the page was pre-rendered, but never made visible. Use this
 *    to check your pre-render success ratio.
 * * `http.method`: For XHR beacons, the HTTP method if not `GET`.
 * * `http.errno`: For XHR beacons, the HTTP result code if not 200.
 * * `http.hdr`: For XHR beacons, headers if available.
 * * `http.type`: For XHR beacons, value of `f` for fetch API requests. Not set for XHRs.
 * * `xhr.sync`: For XHR beacons, `1` if it was sent synchronously.
 * * `http.initiator`: The initiator of the beacon:
 *   - (empty/missing) for the page load beacon
 *   - `xhr` for XHR beacons
 *   - `spa` for SPA Soft Navigations
 *   - `spa_hard` for SPA Hard Navigations
 * * `fetch.bnu`: For XHR beacons from fetch API requests, `1` if fetch response body was not used.
 * * `rt.tt`: Sum of load times across session
 * * `rt.obo`: Number of pages in session that did not have a load time
 *
 * ## Cookie
 *
 * The session information is stored within a cookie.
 *
 * You can customise the name of the cookie where the session information
 * will be stored via the {@link BOOMR.plugins.RT.init RT.cookie} option.
 *
 * By default this is set to `RT`.
 *
 * This cookie is set to expire in 7 days. You can change its lifetime using
 * the {@link BOOMR.plugins.RT.init RT.cookie_exp} option.
 *
 * During that time, you can also read the value of the cookie on the server
 * side. Its format is as follows:
 *
 * ```
 * RT="ss=nnnnnnn&si=abc-123...";
 * ```
 *
 * The parameters are defined as:
 *
 * * `ss` [string] [timestamp] Session Start (Base36)
 * * `si` [string] [guid] Session ID
 * * `sl` [string] [count] Session Length (Base36)
 * * `tt` [string] [ms] Sum of Load Times across the session (Base36)
 * * `obo` [string] [count] Number of pages in the session that had no load time (Base36)
 * * `dm` [string] [domain] Cookie domain
 * * `bcn` [string] [URL] Beacon URL
 * * `rl` [number] [boolean] Whether or not the session is Rate Limited
 * * `se` [string] [s] Session expiry (Base36)
 * * `ld` [string] [timestamp] Last load time (Base36, offset by ss)
 * * `ul` [string] [timestamp] Last beforeunload time (Base36, offset by ss)
 * * `hd` [string] [timestamp] Last unload time (Base36, offset by ss)
 * * `cl` [string] [timestamp] Last click time (Base36, offset by ss)
 * * `r` [string] [URL] Referrer URL (hashed, only if NavigationTiming isn't
 * *   supported and if strict_referrer is enabled)
 * * `nu` [string] [URL] Clicked URL (hashed)
 * * `z` [number] [flags] Compression flags
 *
 * @class BOOMR.plugins.RT
 */

// This is the Round Trip Time plugin.  Abbreviated to RT
// the parameter is the window
(function(w) {
	var d, impl,
	    COOKIE_EXP = 60 * 60 * 24 * 7;

	var SESSION_EXP = 60 * 30;

	/**
	 * Whether or not the cookie has compressed timestamps
	 */
	var COOKIE_COMPRESSED_TIMESTAMPS = 0x1;

	
	

	if (BOOMR.plugins.RT) {
		return;
	}

	// private object
	impl = {
		// Set when the page_ready event fires.
		// Use this to determine if unload fires before onload.
		onloadfired: false,

		// Set when the first unload event fires.
		// Use this to make sure we don't beacon twice for beforeunload and
		// unload.
		unloadfired: false,

		// Set when page becomes visible (for browsers that support it).
		// Use this to determine if user bailed without opening the tab.
		visiblefired: false,

		// Set when init has completed to prevent double initialization.
		initialized: false,

		// Set when this plugin has completed.
		complete: false,

		// Whether or not Boomerang is set to run at onload.
		autorun: true,

		// Custom timers that the developer can use.
		// Format for each timer is { start: XXX, end: YYY, delta: YYY-XXX }
		timers: {},

		// Name of the cookie that stores the start time and referrer.
		cookie: "RT",

		// Cookie expiry in seconds (7 days)
		cookie_exp: COOKIE_EXP,

		// Session expiry in seconds (30 minutes)
		session_exp: SESSION_EXP,

		// By default, don't beacon if referrers don't match.
		// If set to false, beacon both referrer values and let the back-end decide.
		strict_referrer: true,

		// Navigation Type from the NavTiming API.  We mainly care if this was
		// BACK_FORWARD since cookie time will be incorrect in that case.
		navigationType: 0,

		// Navigation Start time.
		navigationStart: undefined,

		// Response Start time.
		responseStart: undefined,

		// Total load time for the user session.
		loadTime: 0,

		// Number of pages in the session that had no load time.
		oboError: 0,

		// t_start that came off the cookie.
		t_start: undefined,

		// Cached value of t_start once we know its real value.
		cached_t_start: undefined,

		// Cached value of xhr t_start once we know its real value.
		cached_xhr_start: undefined,

		// Approximate first byte time for browsers that don't support NavigationTiming.
		t_fb_approx: undefined,

		// Referrer (hash) from the cookie.
		r: undefined,

		// Beacon server for the current session.
		// This could get reset at the end of the session.
		beacon_url: undefined,

		// beacon_url to use when session expires.
		next_beacon_url: undefined,

		// These timers are added directly as beacon variables.
		basic_timers: {
			t_done: 1,
			t_resp: 1,
			t_page: 1
		},

		// Whether or not this is a Cross-Domain load and we're sending session
		// details.
		crossdomain_sending: false,

		// navigationStart source: navigation, csi, gtb
		navigationStartSource: "",

		/**
		 * Merge new cookie `params` onto current cookie, and set `timer` param on cookie to current timestamp
		 *
		 * @param {object} params Object containing keys & values to merge onto current cookie.  A value of `undefined`
		 *     will remove the key from the cookie
		 * @param {string} timer String key name that will be set to the current timestamp on the cookie
		 *
		 * @returns {boolean} true if the cookie was updated, false if the cookie could not be set for any reason
		 */
		updateCookie: function(params, timer) {
			var t_end, t_start, subcookies, k;

			// Disable use of RT cookie by setting its name to a falsy value
			if (!this.cookie) {
				return false;
			}

			// Get the cookie (don't decompress the values)
			subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(this.cookie)) || {};

			// Numeric indices were a bug, we need to clean it up
			for (k in subcookies) {
				if (subcookies.hasOwnProperty(k)) {
					if (!isNaN(parseInt(k, 10))) {
						delete subcookies[k];
					}
				}
			}

			if (typeof params === "object") {
				for (k in params) {
					if (params.hasOwnProperty(k)) {
						if (params[k] === undefined) {
							if (subcookies.hasOwnProperty(k)) {
								delete subcookies[k];
							}
						}
						else {
							subcookies[k] = params[k];
						}
					}
				}
			}

			// compresion level
			subcookies.z = COOKIE_COMPRESSED_TIMESTAMPS;

			// domain
			subcookies.dm = BOOMR.session.domain;

			// session ID
			subcookies.si = BOOMR.session.ID;

			// session start
			subcookies.ss = BOOMR.session.start.toString(36);

			// session length
			subcookies.sl = BOOMR.session.length.toString(36);

			// session expiry
			if (impl.session_exp !== SESSION_EXP) {
				subcookies.se = impl.session_exp.toString(36);
			}

			// rate limited
			if (BOOMR.session.rate_limited) {
				subcookies.rl = 1;
			}

			// total time
			subcookies.tt = this.loadTime.toString(36);

			// off-by-one
			if (this.oboError > 0) {
				subcookies.obo = this.oboError.toString(36);
			}
			else {
				delete subcookies.obo;
			}

			t_start = BOOMR.now();

			// sub-timer
			if (timer) {
				subcookies[timer] = (t_start - BOOMR.session.start).toString(36);
				impl.lastActionTime = t_start;
			}

			// If we got a beacon_url from config, set it into the cookie
			if (this.beacon_url) {
				subcookies.bcn = this.beacon_url;
			}

			
			if (!BOOMR.utils.setCookie(this.cookie, subcookies, this.cookie_exp)) {
				BOOMR.error("cannot set start cookie", "rt");
				return false;
			}

			t_end = BOOMR.now();
			if (t_end - t_start > 50) {
				// It took > 50ms to set the cookie
				// The user Most likely has cookie prompting turned on so
				// t_start won't be the actual unload time
				// We bail at this point since we can't reliably tell t_done
				BOOMR.utils.removeCookie(this.cookie);

				// at some point we may want to log this info on the server side
				BOOMR.error("took more than 50ms to set cookie... aborting: " +
					t_start + " -> " + t_end, "rt");
			}

			return true;
		},

		/**
		 * Update in memory session with values from the cookie.
		 *
		 * For server-driven Boomerang, many of these values might come through
		 * a configuration file (config.json), but we need them before config.json comes through,
		 * or in cases where we're rate limited, or the server is down, config.json may never
		 * come through, so we hold them in a cookie.
		 *
		 * @param subcookies  [optional] object containing cookie keys & values. If not set, will use current cookie value.
		 * Recognised keys:
		 * - ss: sesion start
		 * - si: session ID
		 * - sl: session length
		 * - tt: sum of load times across session
		 * - obo: pages in session that did not have a load time
		 * - dm: domain to use when setting cookies
		 * - se: session expiry time
		 * - bcn: URL that beacons should be sent to
		 * - rl: rate limited flag. 1 if rate limited
		 */
		refreshSession: function(subcookies) {
			if (!subcookies) {
				subcookies = BOOMR.plugins.RT.getCookie();
			}

			if (!subcookies) {
				return;
			}

			if (subcookies.ss) {
				BOOMR.session.start = subcookies.ss;
			}
			else {
				// If the cookie didn't have a good session start time, we'll use the earliest
				// time that we know about... either when the boomerang loader showed up on page
				// or when the first bytes of boomerang loaded up.
				BOOMR.session.start = BOOMR.plugins.RT.navigationStart() || BOOMR.t_lstart || BOOMR.t_start;
			}

			if (subcookies.si && subcookies.si.match(/-/)) {
				BOOMR.session.ID = subcookies.si;
			}

			if (subcookies.sl) {
				BOOMR.session.length = subcookies.sl;
			}

			if (subcookies.tt) {
				this.loadTime = subcookies.tt;
			}

			if (subcookies.obo) {
				this.oboError = subcookies.obo;
			}

			if (subcookies.dm && !BOOMR.session.domain) {
				BOOMR.session.domain = subcookies.dm;
			}

			if (subcookies.se) {
				impl.session_exp = subcookies.se;
			}

			if (subcookies.bcn) {
				this.beacon_url = subcookies.bcn;
			}

			if (subcookies.rl && subcookies.rl === "1") {
				BOOMR.session.rate_limited = true;
			}
		},

		/**
		 * Determine if session has expired or not, and if so, reset session values to a new session.
		 *
		 * @param t_done  The timestamp right now.  Used to determine if the session is too old
		 * @param t_start The timestamp when this page was requested (or undefined if unknown).  Used to reset session start time
		 *
		 */
		maybeResetSession: function(t_done, t_start) {
			
			

			// determine the average page session length, which is the session length over # of pages
			var avgSessionLength = 0;
			if (BOOMR.session.start && BOOMR.session.length) {
				avgSessionLength = (BOOMR.now() - BOOMR.session.start) / BOOMR.session.length;
			}

			var sessionExp = impl.session_exp * 1000;

			// if session hasn't started yet, or if it's been more than thirty minutes since the last beacon,
			// reset the session (note 30 minutes is an industry standard limit on idle time for session expiry)

			// no start time
			if (!BOOMR.session.start ||
			    // or we have a better start time
			    (t_start && BOOMR.session.start > t_start) ||
			    // or it's been more than session_exp since the last action
			    t_done - (impl.lastActionTime || BOOMR.t_start) > sessionExp ||
			    // or the average page session length is longer than the session exp
			    (avgSessionLength > sessionExp)
			) {
				// Now we reset the session
				BOOMR.session.start = t_start || BOOMR.plugins.RT.navigationStart() || BOOMR.t_lstart || BOOMR.t_start;
				BOOMR.session.length = 0;
				BOOMR.session.rate_limited = false;
				impl.loadTime = 0;
				impl.oboError = 0;
				impl.beacon_url = impl.next_beacon_url;
				impl.lastActionTime = t_done;

				// Update the cookie with these new values
				// we also reset the rate limited flag since
				// new sessions do not inherit the rate limited
				// state of old sessions
				impl.updateCookie({
					"rl": undefined,
					"sl": BOOMR.session.length,
					"ss": BOOMR.session.start,
					"tt": impl.loadTime,
					"obo": undefined, // since it's 0
					"bcn": impl.beacon_url
				});
			}

			
			
		},

		/**
		 * Read initial values from cookie and clear out cookie values it cares about after reading.
		 * This makes sure that other pages (eg: loaded in new tabs) do not get an invalid cookie time.
		 * This method should only be called from init, and may be called more than once.
		 *
		 * Request start time is the greater of last page beforeunload or last click time
		 * If start time came from a click, we check that the clicked URL matches the current URL
		 * If it came from a beforeunload, we check that cookie referrer matches document.referrer
		 *
		 * If we had a pageHide time or unload time, we use that as a proxy for first byte on non-navtiming
		 * browsers.
		 */
		initFromCookie: function() {
			var urlHash, docReferrerHash, subcookies;

			subcookies = BOOMR.plugins.RT.getCookie();

			if (!this.cookie) {
				BOOMR.session.enabled = false;
			}
			if (!subcookies) {
				return;
			}

			subcookies.s = Math.max(+subcookies.ld || 0, Math.max(+subcookies.ul || 0, +subcookies.cl || 0));

			

			// If we have a start time, and either a referrer, or a clicked on URL,
			// we check if the start time is usable.
			if (subcookies.s && (subcookies.r || subcookies.nu)) {
				this.r = subcookies.r;
				urlHash = BOOMR.utils.hashString(d.URL);
				docReferrerHash = BOOMR.utils.hashString((d && d.referrer) || "");

				// Either the URL of the page setting the cookie needs to match document.referrer
				

				// Or the start timer was no more than 15ms after a click or form submit
				// and the URL clicked or submitted to matches the current page's URL
				// (note the start timer may be later than click if both click and beforeunload fired
				// on the previous page)
				if (subcookies.cl) {
					
				}
				if (subcookies.nu) {
					
				}

				if (!this.strict_referrer ||
					(subcookies.cl && subcookies.nu && subcookies.nu === urlHash && subcookies.s < +subcookies.cl + 15) ||
					(subcookies.s === +subcookies.ul && this.r === docReferrerHash)
				) {
					this.t_start = subcookies.s;

					// additionally, if we have a pagehide, or unload event, that's a proxy
					// for the first byte of the current page, so use that wisely
					if (+subcookies.hd > subcookies.s) {
						this.t_fb_approx = subcookies.hd;
					}
				}
				else {
					this.t_start = this.t_fb_approx = undefined;
				}
			}

			// regardless of whether the start time was usable or not, it's the last action that
			// we measured, so use that for the session
			if (subcookies.s) {
				this.lastActionTime = subcookies.s;
			}

			this.refreshSession(subcookies);

			// Now that we've pulled out the timers, we'll clear them so they don't pollute future calls
			this.updateCookie({
				// timers
				s: undefined,  // start timer
				ul: undefined, // onbeforeunload time
				cl: undefined, // onclick time
				hd: undefined, // onunload or onpagehide time
				ld: undefined, // last load time

				// session info
				rl: undefined, // rate limited

				// URLs
				r: undefined,  // referrer
				nu: undefined, // clicked url

				// deprecated
				sh: undefined  // session history
			});

			this.maybeResetSession(BOOMR.now());
		},

		/**
		 * Increment session length, and either session.obo or session.loadTime whichever is appropriate for this page
		 */
		incrementSessionDetails: function() {
			
			BOOMR.session.length++;

			if (!impl.timers.t_done || isNaN(impl.timers.t_done.delta)) {
				impl.oboError++;
			}
			else {
				impl.loadTime += impl.timers.t_done.delta;
			}
		},

		/**
		 * Figure out how long boomerang and other URLs took to load using
		 * ResourceTiming if available, or built in timestamps.
		 */
		getBoomerangTimings: function() {
			var res, urls, url, startTime, data;

			function trimTiming(time, st) {
				// strip from microseconds to milliseconds only
				var timeMs = Math.round(time ? time : 0),
				    startTimeMs = Math.round(st ? st : 0);

				timeMs = (timeMs === 0 ? 0 : (timeMs - startTimeMs));

				return timeMs ? timeMs : "";
			}

			if (BOOMR.t_start) {
				// How long does it take Boomerang to load up and execute (fb to lb)?
				BOOMR.plugins.RT.startTimer("boomerang", BOOMR.t_start);
				BOOMR.plugins.RT.endTimer("boomerang", BOOMR.t_end);	// t_end === null defaults to current time

				// How long did it take from page request to boomerang fb?
				BOOMR.plugins.RT.endTimer("boomr_fb", BOOMR.t_start);

				if (BOOMR.t_lstart) {
					// when did the boomerang loader start loading boomerang on the page?
					BOOMR.plugins.RT.endTimer("boomr_ld", BOOMR.t_lstart);
					// What was the network latency for boomerang (request to first byte)?
					BOOMR.plugins.RT.setTimer("boomr_lat", BOOMR.t_start - BOOMR.t_lstart);
				}
			}

			// use window and not w because we want the inner iframe
			try {
				if (window &&
				    "performance" in window &&
				    window.performance &&
				    typeof window.performance.getEntriesByName === "function") {
					urls = { "rt.bmr": BOOMR.url };

					if (BOOMR.config_url) {
						urls["rt.cnf"] = BOOMR.config_url;
					}

					for (url in urls) {
						if (urls.hasOwnProperty(url) && urls[url]) {
							res = window.performance.getEntriesByName(urls[url]);
							if (!res || res.length === 0 || !res[0]) {
								continue;
							}

							res = res[0];

							startTime = trimTiming(res.startTime, 0);
							data = [
								startTime,
								trimTiming(res.responseEnd, startTime),
								trimTiming(res.responseStart, startTime),
								trimTiming(res.requestStart, startTime),
								trimTiming(res.connectEnd, startTime),
								trimTiming(res.secureConnectionStart, startTime),
								trimTiming(res.connectStart, startTime),
								trimTiming(res.domainLookupEnd, startTime),
								trimTiming(res.domainLookupStart, startTime),
								trimTiming(res.redirectEnd, startTime),
								trimTiming(res.redirectStart, startTime)
							].join(",").replace(/,+$/, "");

							BOOMR.addVar(url, data, true);
						}
					}
				}
			}
			catch (e) {
				/**
				 * We wrap specific Firefox 31 and 32 when we get Error when inspecting window.performance
				 * Details: https://bugzilla.mozilla.org/show_bug.cgi?id=1045096
				 */
				if (e && e.name && e.name.hasOwnProperty("length") && e.name.indexOf("NS_ERROR_FAILURE") === -1) {
					BOOMR.addError(e, "rt.getBoomerangTimings");
				}
			}
		},

		/**
		 * Check if we're in a prerender state, and if we are, set additional timers.
		 * In Chrome/IE, a prerender state is when a page is completely rendered in an in-memory buffer, before
		 * a user requests that page.  We do not beacon at this point because the user has not shown intent
		 * to view the page.  If the user opens the page, the visibility state changes to visible, and we
		 * fire the beacon at that point, including any timing details for prerendering.
		 *
		 * Sets the `t_load` timer to the actual value of page load time (request initiated by browser to onload)
		 *
		 * @returns true if this is a prerender state, false if not (or not supported)
		 */
		checkPreRender: function() {
			if (BOOMR.visibilityState() !== "prerender") {
				return false;
			}

			// This means that onload fired through a pre-render.  We'll capture this
			// time, but wait for t_done until after the page has become either visible
			// or hidden (ie, it moved out of the pre-render state)
			// http://code.google.com/chrome/whitepapers/pagevisibility.html
			// http://www.w3.org/TR/2011/WD-page-visibility-20110602/
			// http://code.google.com/chrome/whitepapers/prerender.html

			BOOMR.plugins.RT.startTimer("t_load", this.navigationStart);
			BOOMR.plugins.RT.endTimer("t_load"); // this will measure actual onload time for a prerendered page
			BOOMR.plugins.RT.startTimer("t_prerender", this.navigationStart);
			BOOMR.plugins.RT.startTimer("t_postrender"); // time from prerender to visible or hidden

			return true;
		},

		/**
		 * Initialise timers from the NavigationTiming API.  This method looks at various sources for
		 * Navigation Timing, and also patches around bugs in various browser implementations.
		 * It sets the beacon parameter `rt.start` to the source of the timer
		 */
		initFromNavTiming: function() {
			var ti, p;

			if (this.navigationStart) {
				return;
			}

			// Get start time from WebTiming API see:
			// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html
			// http://blogs.msdn.com/b/ie/archive/2010/06/28/measuring-web-page-performance.aspx
			// http://blog.chromium.org/2010/07/do-you-know-how-slow-your-web-page-is.html
			p = BOOMR.getPerformance();

			if (p && p.navigation) {
				this.navigationType = p.navigation.type;
			}

			if (p && p.timing) {
				ti = p.timing;

				this.navigationStartSource = "navigation";
			}
			else if (w.chrome && w.chrome.csi && w.chrome.csi().startE) {
				// Older versions of chrome also have a timing API that's sort of documented here:
				// http://ecmanaut.blogspot.com/2010/06/google-bom-feature-ms-since-pageload.html
				// source here:
				// http://src.chromium.org/viewvc/chrome/trunk/src/chrome/renderer/loadtimes_extension_bindings.cc?view=markup
				ti = {
					navigationStart: w.chrome.csi().startE
				};

				this.navigationStartSource = "csi";
			}
			else if (w.gtbExternal && w.gtbExternal.startE()) {
				// The Google Toolbar exposes navigation start time similar to old versions of chrome
				// This would work for any browser that has the google toolbar installed
				ti = {
					navigationStart: w.gtbExternal.startE()
				};

				this.navigationStartSource = "gtb";
			}

			if (ti) {
				// Always use navigationStart since it falls back to fetchStart (not with redirects)
				// If not set, we leave t_start alone so that timers that depend
				// on it don't get sent back.  Never use requestStart since if
				// the first request fails and the browser retries, it will contain
				// the value for the new request.
				this.navigationStart = ti.navigationStart || ti.fetchStart || undefined;
				this.fetchStart = ti.fetchStart || undefined;
				this.responseStart = ti.responseStart || undefined;

				// bug in Firefox 7 & 8 https://bugzilla.mozilla.org/show_bug.cgi?id=691547
				if (navigator.userAgent.match(/Firefox\/[78]\./)) {
					this.navigationStart = ti.unloadEventStart || ti.fetchStart || undefined;
				}
			}
			else {
				BOOMR.warn("This browser doesn't support the WebTiming API", "rt");
			}

			return;
		},

		/**
		 * Validate that the time we think is the load time is correct.  This can be wrong if boomerang was loaded
		 * after onload, so in that case, if navigation timing is available, we use that instead.
		 */
		validateLoadTimestamp: function(t_now, data, ename) {
			var p;

			// beacon with detailed timing information
			if (data && data.timing && data.timing.loadEventEnd) {
				return data.timing.loadEventEnd;
			}
			else if (ename === "xhr" && (!data || !BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS))) {
				// if this is an XHR event, trust the input end "now" timestamp
				return t_now;
			}
			else {
				// use loadEventEnd from NavigationTiming
				p = BOOMR.getPerformance();

				// We have navigation timing,
				if (p && p.timing) {
					// and the loadEventEnd timestamp
					if (p.timing.loadEventEnd) {
						return p.timing.loadEventEnd;
					}
				}
				// We don't have navigation timing,
				else {
					// So we'll just use the time when boomerang was added to the page
					// Assuming that this means boomerang was added in onload.  If we logged the
					// onload timestamp (via loader snippet), use that first.
					return BOOMR.t_onload || BOOMR.t_lstart || BOOMR.t_start || t_now;
				}
			}

			// default to now
			return t_now;
		},

		/**
		 * Set timers appropriate at page load time.  This method should be called from done() only when
		 * the page_ready event fires.  It sets the following timer values:
		 *		- t_resp:	time from request start to first byte
		 *		- t_page:	time from first byte to load
		 *		- t_postrender	time from prerender state to visible state
		 *		- t_prerender	time from navigation start to visible state
		 *
		 * @param ename  The Event name that initiated this control flow
		 * @param t_done The timestamp when the done() method was called
		 * @param data   Event data passed in from the caller.  For xhr beacons, this may contain detailed timing information
		 *
		 * @returns true if timers were set, false if we're in a prerender state, caller should abort on false.
		 */
		setPageLoadTimers: function(ename, t_done, data) {
			var t_resp_start, t_fetch_start, p, navSt;

			if (ename !== "xhr" && !(ename === "early" && data && BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS))) {
				impl.initFromCookie();
				impl.initFromNavTiming();

				// add rt.start for the source
				BOOMR.addVar("rt.start", this.navigationStartSource);

				if (impl.checkPreRender()) {
					return false;
				}
			}

			if (ename === "xhr") {
				if (data.timers) {
					// If we were given a list of timers, set those first
					for (var timerName in data.timers) {
						if (data.timers.hasOwnProperty(timerName)) {
							BOOMR.plugins.RT.setTimer(timerName, data.timers[timerName]);
						}
					}
				}
				else if (data && data.timing) {
					// Use details from XHR object to figure out responce latency and page time. Use
					// responseEnd (instead of responseStart) since it's not until responseEnd
					// that the browser can consume the data, and responseEnd is the only guarateed
					// timestamp with cross-origin XHRs if ResourceTiming is enabled.

					t_fetch_start = data.timing.fetchStart;

					if (typeof t_fetch_start === "undefined" || data.timing.responseEnd >= t_fetch_start) {
						t_resp_start = data.timing.responseEnd;
					}
				}
			}
			else if (impl.responseStart) {
				// Use NavTiming API to figure out resp latency and page time
				// t_resp will use the cookie if available or fallback to NavTiming

				// only use if the time looks legit (after navigationStart/fetchStart)
				if (impl.responseStart >= impl.navigationStart &&
				    impl.responseStart >= impl.fetchStart) {
					t_resp_start = impl.responseStart;
				}
			}
			else if (impl.timers.hasOwnProperty("t_page")) {
				// If the dev has already started t_page timer, we can end it now as well
				BOOMR.plugins.RT.endTimer("t_page");
			}
			else if (impl.t_fb_approx) {
				// If we have an approximate first byte time from the cookie, use it
				t_resp_start = impl.t_fb_approx;
			}

			// early beacons should not have t_resp and t_page since the load hasn't occurred yet
			if (t_resp_start && ename !== "early") {
				// if we have a fetch start as well, set the specific timestamps instead of from rt.start
				if (t_fetch_start) {
					BOOMR.plugins.RT.setTimer("t_resp", t_fetch_start, t_resp_start);
				}
				else {
					BOOMR.plugins.RT.endTimer("t_resp", t_resp_start);
				}

				// t_load is the actual time load completed if using prerender
				if (ename === "load" && impl.timers.t_load) {
					BOOMR.plugins.RT.setTimer("t_page", impl.timers.t_load.end - t_resp_start);
				}
				else {
					//
					// Ensure that t_done is after t_resp_start.  If not, set a var so we
					// knew there was an inversion.  This can happen due to bugs in NavTiming
					// clients, where responseEnd happens after all other NavTiming events.
					//
					if (t_done < t_resp_start) {
						BOOMR.addVar("t_page.inv", 1, true);
					}
					else {
						BOOMR.plugins.RT.setTimer("t_page", t_done - t_resp_start);
					}
				}
			}

			// If a prerender timer was started, we can end it now as well
			if (ename === "load" && impl.timers.hasOwnProperty("t_postrender")) {
				BOOMR.plugins.RT.endTimer("t_postrender");
				BOOMR.plugins.RT.endTimer("t_prerender");
			}

			return true;
		},

		/**
		 * Writes a bunch of timestamps onto the beacon that help in request tracing on the server
		 * - rt.tstart: The value of t_start that we determined was appropriate
		 * - rt.nstart: The value of navigationStart if different from rt.tstart
		 * - rt.cstart: The value of t_start from the cookie if different from rt.tstart
		 * - rt.bstart: The timestamp when boomerang started
		 * - rt.blstart:The timestamp when boomerang was added to the host page
		 * - rt.end:    The timestamp when the t_done timer ended
		 *
		 * @param t_start The value of t_start that we plan to use
		 * @param ename The event name that resulted in this call
		 */
		setSupportingTimestamps: function(t_start, ename) {
			if (t_start) {
				BOOMR.addVar("rt.tstart", t_start, true);
			}

			if (typeof impl.navigationStart === "number" && impl.navigationStart !== t_start) {
				BOOMR.addVar("rt.nstart", impl.navigationStart, true);
			}

			if (typeof impl.t_start === "number" && impl.t_start !== t_start) {
				BOOMR.addVar("rt.cstart", impl.t_start, true);
			}

			BOOMR.addVar("rt.bstart", BOOMR.t_start, true);

			if (BOOMR.t_lstart) {
				BOOMR.addVar("rt.blstart", BOOMR.t_lstart, true);
			}

			// early beacons don't have t_done, send t_start (or now) as rt.end
			if (ename === "early") {
				BOOMR.addVar("rt.end", t_start ? t_start : BOOMR.now(), true);
			}
			else {
				if (impl.timers.t_done) {
					// don't just use t_done because dev may have called endTimer before we did
					BOOMR.addVar("rt.end", impl.timers.t_done.end, true);
				}
			}
		},

		/**
		 * Determines the best value to use for t_start.
		 * If called from an xhr call, then use the start time for that call
		 * Else, If we have navigation timing, use that
		 * Else, If we have a cookie time, and this isn't the result of a BACK button, use the cookie time
		 * Else, if we have a cached timestamp from an earlier call, use that
		 * Else, give up
		 *
		 * @param ename The event name that resulted in this call. Special consideration for "xhr"
		 * @param data  Data passed in from the event caller. If the event name is "xhr",
		 *              this should contain the page group name for the xhr call in an attribute called `name`
		 *              and optionally, detailed timing information in a sub-object called `timing`
		 *              and resource information in a sub-object called `resource`
		 *
		 * @returns the determined value of t_start or undefined if unknown
		 */
		determineTStart: function(ename, data) {
			var t_start;
			if (ename === "xhr" || (ename === "early" && data && data.initiator === "spa")) {
				if (data && data.name && impl.timers[data.name]) {
					// For xhr timers, t_start is stored in impl.timers.xhr_{page group name}
					// and xhr.pg is set to {page group name}
					t_start = impl.timers[data.name].start;
				}
				else if (data && data.timing && data.timing.requestStart) {
					// For automatically instrumented xhr timers, we have detailed timing information
					t_start = data.timing.requestStart;
				}

				if (typeof t_start === "undefined" && data && BOOMR.utils.inArray(data.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
					// if we don't have a start time, set to none so it can possibly be fixed up
					BOOMR.addVar("rt.start", "none");
				}
				else {
					BOOMR.addVar("rt.start", "manual");
				}

				impl.cached_xhr_start = t_start;
			}
			else {
				if (impl.navigationStart) {
					t_start = impl.navigationStart;
				}
				else if (impl.t_start && impl.navigationType !== 2) {
					// 2 is TYPE_BACK_FORWARD but the constant may not be defined across browsers
					t_start = impl.t_start;

					// if the user hit the back button, referrer will match, and cookie will match
					BOOMR.addVar("rt.start", "cookie");
				}
				else if (impl.cached_t_start) {
					// but will have time of previous page start, so t_done will be wrong
					t_start = impl.cached_t_start;
				}
				else {
					// force all timers to NaN state
					BOOMR.addVar("rt.start", "none");

					t_start = undefined;
				}

				impl.cached_t_start = t_start;
			}

			
			return t_start;
		},

		page_ready: function() {
			// we need onloadfired because it's possible to reset "impl.complete"
			// if you're measuring multiple xhr loads, but not possible to reset
			// impl.onloadfired
			this.onloadfired = true;
		},

		check_visibility: function() {
			// we care if the page became visible at some point
			if (BOOMR.visibilityState() === "visible") {
				impl.visiblefired = true;
			}
		},

		prerenderToVisible: function() {
			if (impl.onloadfired &&
			    impl.autorun) {
				

				// note that we transitioned from prerender on the beacon for debugging
				BOOMR.addVar("vis.pre", "1", true);

				// send a beacon
				BOOMR.plugins.RT.done(null, "visible");
			}
		},

		page_unload: function(edata) {
			
			if (!this.unloadfired) {
				// run done on abort or on page_unload to measure session length
				BOOMR.plugins.RT.done(edata, "unload");
			}

			//
			// Set cookie with r (the referrer) of this page, but only if the
			// browser doesn't support NavigationTiming.  The referrer is used
			// in non-NT browsers to decide if the "ul" or "hd" timestamps can
			// be used as the start of the navigation.  Don't set if strict_referrer
			// is disabled either.
			//
			// We use document.URL instead of location.href because of a bug in safari 4
			// where location.href is URL decoded
			//
			this.updateCookie(
				(!impl.navigationStart && impl.strict_referrer) ? {
					"r": BOOMR.utils.hashString(d.URL)
				} : null,
				edata.type === "beforeunload" ? "ul" : "hd"
			);

			this.unloadfired = true;
		},

		_iterable_click: function(name, element, etarget, value_cb) {
			var value;
			if (!etarget) {
				return;
			}
			
			while (etarget && etarget.nodeName && etarget.nodeName.toUpperCase() !== element) {
				etarget = etarget.parentNode;
			}
			if (etarget && etarget.nodeName && etarget.nodeName.toUpperCase() === element) {
				

				// we might need to reset the session first, as updateCookie()
				// below sets the lastActionTime
				this.refreshSession();
				this.maybeResetSession(BOOMR.now());

				// user event, they may be going to another page
				// if this page is being opened in a different tab, then
				// our unload handler won't fire, so we need to set our
				// cookie on click or submit
				value = value_cb(etarget);

				this.updateCookie(
					{
						"nu": BOOMR.utils.hashString(value)
					},
					"cl");

				BOOMR.addVar("nu", BOOMR.utils.cleanupURL(value), true);
			}
		},

		onclick: function(etarget) {
			impl._iterable_click("Click", "A", etarget, function(t) { return t.href; });
		},

		markComplete: function() {
			if (this.onloadfired) {
				// allow error beacons to send outside of page load without adding
				// RT variables to the beacon
				impl.complete = true;
			}
		},

		onsubmit: function(etarget) {
			impl._iterable_click("Submit", "FORM", etarget, function(t) {
				var v = (typeof t.getAttribute === "function" && t.getAttribute("action")) || d.URL || "";
				return v.match(/\?/) ? v : v + "?";
			});
		},

		onconfig: function(config) {
			if (config.beacon_url) {
				impl.beacon_url = config.beacon_url;
			}

			if (config.RT) {
				if (config.RT.oboError && !isNaN(config.RT.oboError) && config.RT.oboError > impl.oboError) {
					impl.oboError = config.RT.oboError;
				}

				if (config.RT.loadTime && !isNaN(config.RT.loadTime) && config.RT.loadTime > impl.loadTime) {
					impl.loadTime = config.RT.loadTime;

					if (impl.timers.t_done && !isNaN(impl.timers.t_done.delta)) {
						impl.loadTime += impl.timers.t_done.delta;
					}
				}
			}
		},

		domloaded: function() {
			if (BOOMR.plugins.RT) {
				BOOMR.plugins.RT.endTimer("t_domloaded");
			}
		},

		clear: function(edata) {
			// if it's an early beacon we want to keep rt.start for the next beacon
			if (!edata || typeof edata.early === "undefined") {
				BOOMR.removeVar("rt.start");
			}
		},

		spaNavigation: function() {
			// a SPA navigation occured, force onloadfired to true
			impl.onloadfired = true;
		}
	};

	BOOMR.plugins.RT = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} [config.RT.cookie] The name of the cookie in which to store
		 * the start time for measuring page load time.
		 *
		 * The default name is `RT`.
		 *
		 * Set this to a falsy value to ignore cookies and depend completely on
		 * the NavigationTiming API for the start time.
		 * @param {string} [config.RT.cookie_exp] The lifetime in seconds of the roundtrip cookie.
		 *
		 * This only needs to live for as long as it takes for a single page to load.
		 *
		 * Something like 10 seconds or so should be good for most cases, but to be safe,
		 * and to cover people with really slow connections, or users that are geographically
		 * far away from you, keep it to a few minutes.
		 *
		 * The default is set to 10 minutes.
		 * @param {string} [config.RT.strict_referrer] By default, boomerang will not measure a
		 * page's roundtrip time if the URL in the RT cookie doesn't match the
		 * current page's `document.referrer`.
		 *
		 * This is because it generally means that the user visited a third page
		 * while their RT cookie was still valid, and this could render the page
		 * load time invalid.
		 *
		 * There may be cases, though, when this is a valid flow - for example,
		 * you have an SSL page in between and the referrer isn't passed through.
		 *
		 * In this case, you'll want to set `strict_referrer` to `false`.
		 *
		 * The default is `true.`
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		init: function(config) {
			
			if (w !== BOOMR.window) {
				w = BOOMR.window;
			}

			if (config && config.CrossDomain && config.CrossDomain.sending) {
				impl.crossdomain_sending = true;
			}

			// protect against undefined window/document
			if (!w || !w.document) {
				return;
			}

			d = w.document;

			BOOMR.utils.pluginConfig(impl, config, "RT",
						["cookie", "cookie_exp", "session_exp", "strict_referrer"]);

			if (config && typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			// If we received a beacon URL from the server, we'll use it, unless of course
			// we already had a beacon URL, in which case we'll hold on to it until our session
			// expires, and then use it.
			// It's possible that a beacon collector dies while a session is active, and in that
			// case we might end up sending beacons to a blackhole until the next config.js
			// request tells us to force the new beacon url
			if (config && config.beacon_url) {
				if (!impl.beacon_url || config.force_beacon_url) {
					impl.beacon_url = config.beacon_url;
				}
				impl.next_beacon_url = config.beacon_url;
			}

			// A beacon may be fired automatically on page load or if the page dev fires
			// it manually with their own timers.  It may not always contain a referrer
			// (eg: XHR calls).  We set default values for these cases.
			// This is done before reading from the cookie because the cookie overwrites
			// impl.r
			if (typeof d !== "undefined") {
				impl.r = BOOMR.utils.hashQueryString(d.referrer, true);
			}

			// Now pull out start time information and session information from the cookie
			// We'll do this every time init is called, and every time we call it, it will
			// overwrite values already set (provided there are values to read out)
			impl.initFromCookie();

			// only initialize once.  we still collect config and check/set cookies
			// every time init is called, but we attach event handlers only once
			if (impl.initialized) {
				return this;
			}

			impl.complete = false;
			impl.timers = {};

			impl.check_visibility();

			BOOMR.subscribe("page_ready", impl.page_ready, null, impl);
			BOOMR.subscribe("visibility_changed", impl.check_visibility, null, impl);
			BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
			BOOMR.subscribe("page_ready", this.done, "load", this);
			BOOMR.subscribe("xhr_load", this.done, "xhr", this);
			BOOMR.subscribe("before_early_beacon", this.done, "early", this);
			BOOMR.subscribe("dom_loaded", impl.domloaded, null, impl);
			BOOMR.subscribe("page_unload", impl.page_unload, null, impl);
			BOOMR.subscribe("click", impl.onclick, null, impl);
			BOOMR.subscribe("form_submit", impl.onsubmit, null, impl);
			BOOMR.subscribe("before_beacon", this.addTimersToBeacon, "beacon", this);
			BOOMR.subscribe("beacon", impl.clear, null, impl);
			BOOMR.subscribe("error", impl.markComplete, null, impl);
			BOOMR.subscribe("config", impl.onconfig, null, impl);
			BOOMR.subscribe("spa_navigation", impl.spaNavigation, null, impl);
			BOOMR.subscribe("interaction", impl.markComplete, null, impl);

			// Override any getBeaconURL method to make sure we return the one from the
			// cookie and not the one hardcoded into boomerang
			BOOMR.getBeaconURL = function() { return impl.beacon_url; };

			impl.initialized = true;
			return this;
		},

		/**
		 * Starts the timer named `timer_name`.
		 *
		 * Timers count in milliseconds.
		 *
		 * You must call {@link BOOMR.plugins.RT.endTimer} when this timer has
		 * completed for the measurement to be recorded in the beacon.
		 *
		 * If passed in, the optional second parameter `time_value` is the timestamp
		 * in milliseconds to set the timer's start time to. This is useful if you
		 * need to record a timer that started before boomerang was loaded.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {TimeStamp} [time_value] If set, the timer's start time will be
		 * set explicitly to this value. If not set, the current timestamp is used.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		startTimer: function(timer_name, time_value) {
			if (timer_name) {
				if (timer_name === "t_page") {
					this.endTimer("t_resp", time_value);
				}
				impl.timers[timer_name] = {start: (typeof time_value === "number" ? time_value : BOOMR.now())};
			}

			return this;
		},

		/**
		 * Stops the timer named `timer_name`.
		 *
		 * It is not necessary for the timer to have been started before you call `endTimer()`.
		 *
		 * If a timer with this name was not started, then the unload time of the
		 * previous page is used instead. This allows you to measure the time across pages.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {TimeStamp} [time_value] If set, the timer's stop time will be
		 * set explicitly to this value. If not set, the current timestamp is used.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		endTimer: function(timer_name, time_value) {
			if (timer_name) {
				impl.timers[timer_name] = impl.timers[timer_name] || {};
				if (impl.timers[timer_name].end === undefined) {
					impl.timers[timer_name].end =
							(typeof time_value === "number" ? time_value : BOOMR.now());
				}
			}

			return this;
		},

		/**
		 * Clears (removes) the specified timer
		 *
		 * @param {string} timer_name Timer name
		 * @memberof BOOMR.plugins.RT
		 */
		clearTimer: function(timer_name) {
			if (timer_name) {
				delete impl.timers[timer_name];
			}

			return this;
		},

		/**
		 * Sets the timer named `timer_name` to an explicit time measurement `time_value`.
		 *
		 * You'd use this method if you measured time values within your page before
		 * boomerang was loaded and now need to pass those values to the {@link BOOMR.plugins.RT}
		 * plugin for inclusion in the beacon.
		 *
		 * It is not necessary to call `startTimer()` or `endTimer()` before
		 * calling `setTimer()`.
		 *
		 * If you do, the old values will be ignored and the value passed in to
		 * this function will be used.
		 *
		 * @param {string} timer_name The name of the timer to start
		 * @param {number} time_value The value in milliseconds to set this timer to.
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 * @memberof BOOMR.plugins.RT
		 */
		setTimer: function(timer_name, time_delta_or_start, timer_end) {
			if (timer_name) {
				if (typeof timer_end !== "undefined") {
					// in this case, we were given three args, the name, start, and end,
					// so time_delta_or_start is the start time
					impl.timers[timer_name] = {
						start: time_delta_or_start,
						end: timer_end,
						delta: timer_end - time_delta_or_start
					};
				}
				else {
					// in this case, we were just given two args, the name and delta
					impl.timers[timer_name] = { delta: time_delta_or_start };
				}
			}

			return this;
		},

		/**
		 * Adds all known timers to the beacon
		 *
		 * @param {object} vars (unused)
		 * @param {string} source Source
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		addTimersToBeacon: function(vars, source) {
			var t_name, timer,
			    t_other = [];

			for (t_name in impl.timers) {
				if (impl.timers.hasOwnProperty(t_name)) {
					timer = impl.timers[t_name];

					// if delta is a number, then it was set using setTimer
					// if not, then we have to calculate it using start & end
					if (typeof timer.delta !== "number") {
						if (typeof timer.start !== "number") {
							timer.start = source === "xhr" ? impl.cached_xhr_start : impl.cached_t_start;
						}
						timer.delta = timer.end - timer.start;
					}

					// If the caller did not set a start time, and if there was no start cookie
					// Or if there was no end time for this timer,
					// then timer.delta will be NaN, in which case we discard it.
					if (isNaN(timer.delta)) {
						continue;
					}

					if (impl.basic_timers.hasOwnProperty(t_name)) {
						BOOMR.addVar(t_name, timer.delta, true);
					}
					else {
						t_other.push(t_name + "|" + timer.delta);
					}
				}
			}

			if (t_other.length) {
				BOOMR.addVar("t_other", t_other.join(","), true);
			}

			if (source === "beacon" && (!vars || typeof vars.early === "undefined")) {
				impl.timers = {};
				impl.complete = false;  // reset this state for the next call
			}
		},

		/**
		 * Called when the page has reached a "usable" state.  This may be when the
		 * `onload` event fires, or it could be at some other moment during/after page
		 * load when the page is usable by the user
		 *
		 * @param {object} edata Event data
		 * @param {string} ename Event name
		 *
		 * @returns {@link BOOMR.plugins.RT} The RT plugin for chaining
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		done: function(edata, ename) {
			

			if (!BOOMR.plugins.RT) {
				// something removed us
				return;
			}

			var t_start, t_done, t_now = BOOMR.now(),
			    subresource = false;

			// We may have to rerun if this was a pre-rendered page, so set complete to false, and only set to true when we're done
			impl.complete = false;

			t_done = impl.validateLoadTimestamp(t_now, edata, ename);

			if (ename === "load" || ename === "visible" || ename === "xhr" || ename === "early") {
				if (!impl.setPageLoadTimers(ename, t_done, edata)) {
					return this;
				}
			}

			if (ename === "load" ||
			    ename === "visible" ||
			    (ename === "early" &&
			        (!edata /* dom_loaded */ ||
			        typeof edata.initiator === "undefined" /* onconfig */ ||
			        edata.initiator === "spa_hard")) ||
			    (ename === "xhr" && edata && edata.initiator === "spa_hard")) {
				// Only add Boomerang timings to normal or early page load and SPA hard beacons
				impl.getBoomerangTimings();
			}

			t_start = impl.determineTStart(ename, edata);

			impl.refreshSession();

			impl.maybeResetSession(t_done, t_start);

			// If the dev has already called endTimer, then this call will do nothing
			// else, it will stop the page load timer
			if (ename !== "early") {
				this.endTimer("t_done", t_done);
			}

			// For XHR events, ensure t_done is set with the proper start, end, and
			// delta timestamps.  Until Issue #195 is fixed, if this XHR is firing
			// a beacon very quickly after a previous XHR, the previous XHR might
			// not yet have had time to fire a beacon and clear its own t_done,
			// so the preceeding endTimer() wouldn't have set this XHR's timestamps.
			if (edata && edata.initiator === "xhr") {
				this.setTimer("t_done", edata.timing.requestStart, edata.timing.loadEventEnd);
			}

			impl.setSupportingTimestamps(t_start, ename);

			this.addTimersToBeacon(null, ename);

			BOOMR.setReferrer(impl.r);

			if (ename === "xhr" && edata) {
				if (edata && edata.data) {
					edata = edata.data;
				}
			}

			if (ename === "xhr" && edata) {
				subresource = edata.subresource;

				if (edata.url) {
					BOOMR.addVar("u", BOOMR.utils.cleanupURL(edata.url.replace(/#.*/, "")), true);
				}

				if (edata.status && (edata.status < -1 || edata.status >= 400)) {
					BOOMR.addVar("http.errno", edata.status, true);
				}

				if (edata.method && edata.method !== "GET") {
					BOOMR.addVar("http.method", edata.method, true);
				}

				if (edata.type && edata.type !== "xhr") {
					// just send first char
					BOOMR.addVar("http.type", edata.type[0], true);
				}

				if (edata.headers) {
					BOOMR.addVar("http.hdr", edata.headers, true);
				}

				if (edata.synchronous) {
					BOOMR.addVar("xhr.sync", 1, true);
				}

				if (edata.initiator) {
					BOOMR.addVar("http.initiator", edata.initiator, true);
				}

				if (edata.responseBodyNotUsed) {
					BOOMR.addVar("fetch.bnu", 1, true);
				}
			}

			// This is an explicit subresource
			if (subresource && subresource !== "passive") {
				BOOMR.addVar("rt.subres", 1, true);
			}

			// we're in onload
			if (ename === "load" || ename === "visible" ||
			    // xhr beacon and this is not a subresource
			    (ename === "xhr" && !subresource) ||
			    // unload fired before onload
			    (ename === "unload" && !impl.onloadfired && impl.autorun) && !impl.crossdomain_sending) {
				impl.incrementSessionDetails();

				// save a last-loaded timestamp in the cookie
				impl.updateCookie(null, "ld");
			}

			BOOMR.addVar({
				"rt.tt": impl.loadTime,
				"rt.obo": impl.oboError
			}, undefined, true);

			impl.updateCookie();

			if (ename === "unload") {
				BOOMR.addVar("rt.quit", "", true);

				if (!impl.onloadfired) {
					BOOMR.addVar("rt.abld", "", true);
				}

				if (!impl.visiblefired) {
					BOOMR.addVar("rt.ntvu", "", true);
				}
			}

			// mark complete if not an early beacon.
			// We want load beacons to re-run this after an early beacon
			if (ename !== "early") {
				impl.complete = true;
			}

			BOOMR.sendBeacon(impl.beacon_url);

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.RT
		 */
		is_complete: function(vars) {
			// allow error and early beacons to go through even if we're not complete
			return impl.complete ||
			    (vars && vars["http.initiator"] === "error") ||
			    (vars && typeof vars.early !== "undefined");
		},

		/**
		 * Updates the RT cookie.
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		updateCookie: function() {
			impl.updateCookie();
		},

		/**
		 * Gets RT cookie data from the cookie and returns it as an object.
		 *
		 * Also decompresses the cookie if it has been compressed.
		 *
		 * @returns {(RTCookie|false)} an object containing RT Cookie data or false if no cookie is available
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		getCookie: function() {
			var subcookies, base, epoch;

			// Disable use of RT cookie by setting its name to a falsy value
			if (!impl.cookie) {
				return false;
			}

			subcookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie)) || {};

			// decompress or parse cookie
			if (subcookies) {
				if (subcookies.z & COOKIE_COMPRESSED_TIMESTAMPS) {
					// Timestamps and durations are compressed
					base = 36;
					epoch = parseInt(subcookies.ss || 0, 36);
				}
				else {
					// Not compressed
					base = 10;
					epoch = 0;
				}

				// ss (Session Start)
				subcookies.ss = parseInt(subcookies.ss || 0, base);

				// tt (Total Time), sl (Session Length) and obo (Off By One)
				subcookies.tt = parseInt(subcookies.tt || 0, base);
				subcookies.obo = parseInt(subcookies.obo || 0, base);
				subcookies.sl = parseInt(subcookies.sl || 0, base);

				// session expiry
				if (subcookies.se) {
					subcookies.se = parseInt(subcookies.se, base) || SESSION_EXP;
				}

				// ld, ul, cl, hd (timestamps)
				if (subcookies.ld) {
					subcookies.ld = epoch + parseInt(subcookies.ld, base);
				}

				if (subcookies.ul) {
					subcookies.ul = epoch + parseInt(subcookies.ul, base);
				}

				if (subcookies.cl) {
					subcookies.cl = epoch + parseInt(subcookies.cl, base);
				}

				if (subcookies.hd) {
					subcookies.hd = epoch + parseInt(subcookies.hd, base);
				}
			}

			return subcookies;
		},

		incrementSessionDetails: function() {
			impl.incrementSessionDetails();
		},

		/**
		 * Gets the Navigation Start time
		 *
		 * @returns {TimeStamp} Navigation start
		 *
		 * @memberof BOOMR.plugins.RT
		 */
		navigationStart: function() {
			if (!impl.navigationStart) {
				impl.initFromNavTiming();
			}

			return impl.navigationStart;
		}

	};

}(window));

// End of RT plugin

/**
 * The bandwidth plugin measures the bandwidth and latency of the user's network
 * connection to your server.
 *
 * Please note that bandwidth detection through JavaScript is not accurate. If
 * the user's network is lossy or is shared with other users, or network traffic
 * is bursty, real bandwidth can vary over time.
 *
 * The measurement Boomerang takes is based over a short period of time, and this may not
 * be representative of the best or worst cases. Boomerang tries to account for that by
 * measuring not just the bandwidth, but also the error value in that measurement.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Setup
 *
 * The bandwidth images are located in the `images/` folder. You need to copy all
 * of these images to a location on your HTTP server.
 *
 * You may put these images on your CDN, but be aware that this could result in
 * increased CDN charges.  You will need to configure your CDN to ignore the
 * query string when caching these images.
 *
 * ## Usage
 *
 * Once Boomerang has been added to your page and {@link BOOMR.init} has been called,
 * the bandwidth test will start once the page loads.
 *
 * See the list of {@link BOOMR.plugins.BW.init BW options} for required {@link BOOMR.init}
 * configuration, e.g. {@link BOOMR.plugins.BW.init BW.base_url}.
 *
 * If you want the page load beacon to include the results of the bandwidth test,
 * setting {@link BOOMR.plugins.BW.init BW.block_beacon} to `true` will force boomerang
 * to wait for the test to complete before sending the beacon.
 *
 * If you do not turn on the {@link BOOMR.plugins.BW.init BW.block_beacon} option,
 * you will only receive bandwidth results if they were cached in a cookie by a
 * previous test run.
 *
 * ## IPv4 optimisations
 *
 * While visitor's IP address information isn't available to JavaScript, if your server
 * can communicate the IP address to JavaScript (e.g. via HTML injection), Boomerang
 * will use it to detect if the visitor has changed networks.  See
 * {@link BOOMR.plugins.BW.init BW.user_ip} for details.
 *
 * If your visitor has an IPv4 address, then Boomerang will also strip out the last
 * part of the IP and use that rather than the entire IP address.  This helps if
 * visitors use DHCP on the same ISP where their IP address changes frequently,
 * but they stay within the same subnet.
 *
 * If the visitor has an IPv6 address, we use the entire address.
 *
 * ## Cookie
 *
 * The bandwidth results are stored within a cookie.  This helps ensure the bandwidth
 * test isn't repeated for the same user repeatedly (slowing down their experience).
 *
 * You can customise the name of the cookie where the bandwidth will be stored via
 * the {@link BOOMR.plugins.BW.init BW.cookie} option.
 *
 * By default this is set to `BA`.
 *
 * This cookie is set to expire in 7 days. You can change its lifetime using
 * the {@link BOOMR.plugins.BW.init BW.cookie_exp} option.
 *
 * During that time, you can also read the value of the cookie on the server
 * side. Its format is as follows:
 *
 * ```
 * BA=ba=nnnnnnn&be=nnn.nn&l=nnnn&le=nn.nn&ip=iiiiii&t=sssssss;
 * ```
 *
 * The parameters are defined as:
 *
 * * `ba` [integer] [bytes/s] The user's bandwidth to your server
 * * `be` [float] [bytes/s] The 95% confidence interval margin of error in measuring the user's bandwidth
 * * `l` [float] [ms] The HTTP latency between the user's computer and your server
 * * `le` [float] [ms] The 95% confidence interval margin of error in measuring the user's latency
 * * `ip` [ip address] The user's IPv4 or IPv6 address that was passed as the user_ip parameter to the init() method
 * * `t` [timestamp] The browser time (in seconds since the epoch) when the cookie was set
 *
 * ## Disabling the bandwidth check
 *
 * Finally, there may be cases when you want to completely disable the bandwidth test --
 * perhaps you know that your user is on a slow network, or pays by the byte (the
 * andwidth test uses a lot of bandwidth), or is on a mobile device that cannot
 * handle the load.
 *
 * In such cases you have two options:
 *
 * * Delete the bandwdith plugin (`delete BOOMR.plugins.BW`)
 * * Set the {@link BOOMR.plugins.BW.init BW.enabled} parameter to `false`
 *
 * ## Methodology
 * Bandwidth and latency are measured by downloading fixed-size images from a server
 * and measuring the time it took to download them.  We run it in the following order:
 *
 * * First, download a 32 byte gif 10 times serially.  This is used to measure latency.
 *   * We discard the first measurement because that pays the price for the TCP
 *     handshake (3 packets) and TCP slow-start (4 more packets).  All other
 *     image requests take two TCP packets (one for the request and one for the
 *     response).  This gives us a good idea of how much time it takes to
 *     make a HTTP request from the browser to our server.
 *   * Once done, we calculate the arithmetic mean, standard deviation and standard
 *     error at 95% confidence for the 9 download times that we have.  This is
 *     the latency number (`lat`) and confidence intervl (`lat_err`) that we
 *     beacon back to our server.
 * * Next, download images of increasing size until one of the times out
 *   * We choose image sizes so that we can narrow down on a bandwidth range as
 *     soon as possible.
 *   * Image timeouts are set at between 1.2 and 1.5 seconds.  If an image times
 *     out, we stop downloading larger images, and retry the largest image 4
 *     more times.  We then calculate the bandwidth for the largest 3 images
 *     that we downloaded.  This should result in 7 readings unless the test
 *     timed out before that. We calculate the median, standard deviation and
 *     standard error from these values and this is the bandwidth (`bw`) and
 *     confidence interval (`bw_err`) that we beacon back to our server.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `bw`: User's measured bandwidth in bytes per second
 * * `bw_err`: 95% confidence interval margin of error in measuring user's bandwidth
 * * `lat`: User's measured HTTP latency in milliseconds
 * * `lat_err`: 95% confidence interval margin of error in measuring user's latency
 * * `bw_time` Timestamp (seconds since the epoch) on the user's browser when
 *   the bandwidth and latency was measured
 * * `bw_debug` Debug information
 *
 * @class BOOMR.plugins.BW
 */
(function() {
	var impl, images;

	
	

	if (BOOMR.plugins.BW) {
		return;
	}

	// We choose image sizes so that we can narrow down on a bandwidth range as
	// soon as possible the sizes chosen correspond to bandwidth values of
	// 14-64kbps, 64-256kbps, 256-1024kbps, 1-2Mbps, 2-8Mbps, 8-30Mbps & 30Mbps+
	// Anything below 14kbps will probably timeout before the test completes
	// Anything over 60Mbps will probably be unreliable since latency will make up
	// the largest part of download time. If you want to extend this further to
	// cover 100Mbps & 1Gbps networks, use image sizes of 19,200,000 & 153,600,000
	// bytes respectively
	// See https://spreadsheets.google.com/ccc?key=0AplxPyCzmQi6dDRBN2JEd190N1hhV1N5cHQtUVdBMUE&hl=en_GB
	// for a spreadsheet with the details
	//
	// The images were generated with ImageMagic, using random uncompressed data.
	// As input data (image-3.bin) I used the original images that were encrypted using AES256.
	// The IM command used was : convert -size 618x618 -depth 8 gray:image-3.bin image-3.png
	// Vary the image dimensions to change the filesize. The image dimensions are more or less the square of the desired filesize.
	images = [
		{ name: "image-0.png", size: 11773, timeout: 1400 },
		{ name: "image-1.png", size: 40836, timeout: 1200 },
		{ name: "image-2.png", size: 165544, timeout: 1300 },
		{ name: "image-3.png", size: 382946, timeout: 1500 },
		{ name: "image-4.png", size: 1236278, timeout: 1200 },
		{ name: "image-5.png", size: 4511798, timeout: 1200 },
		{ name: "image-6.png", size: 9092136, timeout: 1200 }
	];

	images.end = images.length;
	images.start = 0;

	// abuse arrays to do the latency test simply because it avoids a bunch of
	// branches in the rest of the code.
	// I'm sorry Douglas
	images.l = { name: "image-l.gif", size: 35, timeout: 1000 };

	// private object
	impl = {
		// properties
		base_url: "",
		timeout: 15000,
		nruns: 5,
		latency_runs: 10,
		user_ip: "",
		block_beacon: false,
		test_https: false,
		cookie_exp: 7 * 86400,
		cookie: "BA",

		// state
		results: [],
		latencies: [],
		latency: null,
		runs_left: 0,
		aborted: false,
		complete: true,		// defaults to true so we don't block other plugins if this cannot start.
					// init sets it to false
		running: false,
		initialized: false,

		// methods

		// numeric comparator.  Returns negative number if a < b, positive if a > b and 0 if they're equal
		// used to sort an array numerically
		ncmp: function(a, b) { return (a - b); },

		// Calculate the interquartile range of an array of data points
		iqr: function(a) {
			var l = a.length - 1, q1, q3, fw, b = [], i;

			q1 = (a[Math.floor(l * 0.25)] + a[Math.ceil(l * 0.25)]) / 2;
			q3 = (a[Math.floor(l * 0.75)] + a[Math.ceil(l * 0.75)]) / 2;

			fw = (q3 - q1) * 1.5;

			// fw === 0 => all items are identical, so no need to filter
			if (fw === 0) {
				return a;
			}

			l++;

			for (i = 0; i < l && a[i] < q3 + fw; i++) {
				if (a[i] > q1 - fw) {
					b.push(a[i]);
				}
			}

			return b;
		},

		calc_latency: function() {
			var i, n,
			    sum = 0, sumsq = 0,
			    amean, median,
			    std_dev, std_err,
			    lat_filtered;

			// We ignore the first since it paid the price of DNS lookup, TCP connect
			// and slow start
			this.latencies.shift();

			// We first do IQR filtering and use the resulting data set
			// for all calculations
			lat_filtered = this.iqr(this.latencies.sort(this.ncmp));
			n = lat_filtered.length;

			
			

			// First we get the arithmetic mean, standard deviation and standard error
			for (i = 0; i < n; i++) {
				sum += lat_filtered[i];
				sumsq += lat_filtered[i] * lat_filtered[i];
			}

			amean = Math.round(sum / n);

			std_dev = Math.sqrt(sumsq / n - sum * sum / (n * n));

			// See http://en.wikipedia.org/wiki/1.96 and http://en.wikipedia.org/wiki/Standard_error_%28statistics%29
			std_err = (1.96 * std_dev / Math.sqrt(n)).toFixed(2);

			std_dev = std_dev.toFixed(2);


			median = Math.round(
					(lat_filtered[Math.floor(n / 2)] + lat_filtered[Math.ceil(n / 2)]) / 2
				);

			return { mean: amean, median: median, stddev: std_dev, stderr: std_err };
		},

		calc_bw: function() {
			var i, j, n = 0,
			    r, bandwidths = [], bandwidths_corrected = [],
			    sum = 0, sumsq = 0, sum_corrected = 0, sumsq_corrected = 0,
			    amean, std_dev, std_err, median,
			    amean_corrected, std_dev_corrected, std_err_corrected, median_corrected,
			    nimgs, bw, bw_c, debug_info = [];

			for (i = 0; i < this.nruns; i++) {
				if (!this.results[i] || !this.results[i].r) {
					continue;
				}

				r = this.results[i].r;

				// the next loop we iterate through backwards and only consider the largest
				// 3 images that succeeded that way we don't consider small images that
				// downloaded fast without really saturating the network
				nimgs = 0;
				for (j = r.length - 1; j >= 0 && nimgs < 3; j--) {
					// if we hit an undefined image time, we skipped everything before this
					if (!r[j]) {
						break;
					}
					if (r[j].t === null) {
						continue;
					}

					n++;
					nimgs++;

					// multiply by 1000 since t is in milliseconds and not seconds
					bw = images[j].size * 1000 / r[j].t;
					bandwidths.push(bw);

					if (r[j].t > this.latency.mean) {
						bw_c = images[j].size * 1000 / (r[j].t - this.latency.mean);
						bandwidths_corrected.push(bw_c);
					}
					else {
						debug_info.push(j + "_" + r[j].t);
					}
				}
			}

			

			
			

			// First do IQR filtering since we use the median here
			// and should use the stddev after filtering.
			if (bandwidths.length > 3) {
				bandwidths = this.iqr(bandwidths.sort(this.ncmp));
				bandwidths_corrected = this.iqr(bandwidths_corrected.sort(this.ncmp));
			}
			else {
				bandwidths = bandwidths.sort(this.ncmp);
				bandwidths_corrected = bandwidths_corrected.sort(this.ncmp);
			}

			
			

			// Now get the mean & median.
			// Also get corrected values that eliminate latency
			n = Math.max(bandwidths.length, bandwidths_corrected.length);
			for (i = 0; i < n; i++) {
				if (i < bandwidths.length) {
					sum += bandwidths[i];
					sumsq += Math.pow(bandwidths[i], 2);
				}
				if (i < bandwidths_corrected.length) {
					sum_corrected += bandwidths_corrected[i];
					sumsq_corrected += Math.pow(bandwidths_corrected[i], 2);
				}
			}

			n = bandwidths.length;
			amean = Math.round(sum / n);
			std_dev = Math.sqrt(sumsq / n - Math.pow(sum / n, 2));
			std_err = Math.round(1.96 * std_dev / Math.sqrt(n));
			std_dev = Math.round(std_dev);

			n = bandwidths.length - 1;
			median = Math.round(
					(bandwidths[Math.floor(n / 2)] + bandwidths[Math.ceil(n / 2)]) / 2
				);

			if (bandwidths_corrected.length < 1) {
				
				debug_info.push("l==" + bandwidths_corrected.length);

				amean_corrected = amean;
				std_dev_corrected = std_dev;
				std_err_corrected = std_err;
				median_corrected = median;
			}
			else {
				n = bandwidths_corrected.length;
				amean_corrected = Math.round(sum_corrected / n);
				std_dev_corrected = Math.sqrt(sumsq_corrected / n - Math.pow(sum_corrected / n, 2));
				std_err_corrected = (1.96 * std_dev_corrected / Math.sqrt(n)).toFixed(2);
				std_dev_corrected = std_dev_corrected.toFixed(2);

				n = bandwidths_corrected.length - 1;
				median_corrected = Math.round(
							(
								bandwidths_corrected[Math.floor(n / 2)] +
								bandwidths_corrected[Math.ceil(n / 2)]
							) / 2
						);
			}

			
			

			return {
				mean: amean,
				stddev: std_dev,
				stderr: std_err,
				median: median,
				mean_corrected: amean_corrected,
				stddev_corrected: std_dev_corrected,
				stderr_corrected: std_err_corrected,
				median_corrected: median_corrected,
				debug_info: debug_info
			};
		},

		load_img: function(i, run, callback) {
			var url = this.base_url + images[i].name +
			    "?t=" + BOOMR.utils.generateId(10),
			    timer = 0, tstart = 0,
			    img = new Image(),
			    that = this;

			function handler(value) {
				return function() {
					if (callback) {
						callback.call(that, i, tstart, run, value);
					}

					if (value !== null) {
						img.onload = img.onerror = null;
						img = null;
						clearTimeout(timer);
						that = callback = null;
					}
				};
			}

			img.onload = handler(true);
			img.onerror = handler(false);

			// the timeout does not abort download of the current image, it just sets an
			// end of loop flag so we don't attempt download of the next image we still
			// need to wait until onload or onerror fire to be sure that the image
			// download isn't using up bandwidth.  This also saves us if the timeout
			// happens on the first image.  If it didn't, we'd have nothing to measure.
			timer = setTimeout(handler(null), images[i].timeout + Math.min(400, this.latency ? this.latency.mean : 400));

			tstart = BOOMR.now();
			img.src = url;
		},

		lat_loaded: function(i, tstart, run, success) {
			if (run !== this.latency_runs + 1) {
				return;
			}

			if (success !== null) {
				var lat = BOOMR.now() - tstart;
				this.latencies.push(lat);
			}
			// we've got all the latency images at this point,
			// so we can calculate latency
			if (this.latency_runs === 0) {
				this.latency = this.calc_latency();
			}

			BOOMR.setImmediate(this.iterate, null, null, this);
		},

		img_loaded: function(i, tstart, run, success) {
			if (run !== this.runs_left + 1) {
				return;
			}

			if (this.results[this.nruns - run].r[i])	{	// already called on this image
				return;
			}

			// if timeout, then we set the next image to the end of loop marker
			if (success === null) {
				this.results[this.nruns - run].r[i + 1] = {t: null, state: null, run: run};
				return;
			}

			var result = {
				start: tstart,
				end: BOOMR.now(),
				t: null,
				state: success,
				run: run
			};
			if (success) {
				result.t = result.end - result.start;
			}
			this.results[this.nruns - run].r[i] = result;

			// we terminate if an image timed out because that means the connection is
			// too slow to go to the next image
			if (i >= images.end - 1 || this.results[this.nruns - run].r[i + 1] !== undefined) {
				
				// First run is a pilot test to decide what the largest image
				// that we can download is. All following runs only try to
				// download this image
				if (run === this.nruns) {
					images.start = i;
				}
				BOOMR.setImmediate(this.iterate, null, null, this);
			}
			else {
				this.load_img(i + 1, run, this.img_loaded);
			}
		},

		finish: function() {
			if (!this.latency) {
				this.latency = this.calc_latency();
			}

			var bw = this.calc_bw(),
			    o = {
				    bw:         bw.median_corrected,
				    bw_err:     parseFloat(bw.stderr_corrected, 10),
				    lat:        this.latency.mean,
				    lat_err:    parseFloat(this.latency.stderr, 10),
				    bw_time:    Math.round(BOOMR.now() / 1000)
			    };

			BOOMR.addVar(o);
			if (bw.debug_info.length > 0) {
				BOOMR.addVar("bw_debug", bw.debug_info.join(","));
			}

			// If we have an IP address we can make the BA cookie persistent for a while
			// because we'll recalculate it if necessary (when the user's IP changes).
			if (!isNaN(o.bw) && o.bw > 0) {
				BOOMR.utils.setCookie(this.cookie,
					{
						ba: Math.round(o.bw),
						be: o.bw_err,
						l:  o.lat,
						le: o.lat_err,
						ip: this.user_ip,
						t:  o.bw_time
					},
					(this.user_ip ? this.cookie_exp : 0)
				);
			}

			this.complete = true;

			if (this.block_beacon === true) {
				BOOMR.sendBeacon();
			}

			this.running = false;
		},

		iterate: function() {
			if (!this.aborted) {
				if (!this.runs_left) {
					this.finish();
				}
				else if (this.latency_runs) {
					this.load_img("l", this.latency_runs--, this.lat_loaded);
				}
				else {
					this.results.push({r: []});
					this.load_img(images.start, this.runs_left--, this.img_loaded);
				}
			}
		},

		setVarsFromCookie: function() {
			var cookies, ba, bw_e, lat, lat_e, c_sn, t, p_sn, t_now;

			cookies = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie(impl.cookie));

			if (cookies && cookies.ba) {

				ba = parseInt(cookies.ba, 10);
				bw_e = parseFloat(cookies.be, 10);
				lat = parseInt(cookies.l, 10) || 0;
				lat_e = parseFloat(cookies.le, 10) || 0;
				c_sn = cookies.ip.replace(/\.\d+$/, "0");	// Note this is IPv4 only
				t = parseInt(cookies.t, 10);
				p_sn = this.user_ip.replace(/\.\d+$/, "0");

				// We use the subnet instead of the IP address because some people
				// on DHCP with the same ISP may get different IPs on the same subnet
				// every time they log in

				t_now = Math.round(BOOMR.now() / 1000);	// seconds

				// If the subnet changes or the cookie is more than 7 days old,
				// then we recheck the bandwidth, else we just use what's in the cookie
				if (c_sn === p_sn && t >= t_now - this.cookie_exp && ba > 0) {
					this.complete = true;
					BOOMR.addVar({
						bw:      ba,
						lat:     lat,
						bw_err:  bw_e,
						lat_err: lat_e,
						bw_time: t
					});

					return true;
				}
			}

			return false;
		}

	};

	BOOMR.plugins.BW = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} [config.BW.base_url] By default, this is set to the empty string,
		 * which has the effect of disabling the bandwidth plugin. Set the
		 * `base_url` parameter to the HTTP path of the directory that contains
		 * the bandwidth images to enable this test.
		 *
		 * This can be an absolute or a relative URL.
		 *
		 * If it's relative, remember that it's relative to the page that boomerang is included
		 * in and not to the javascript file.
		 *
		 * The trailing / is required.
		 * @param {boolean} [config.BW.cookie] The name of the cookie in which to store
		 * the measured bandwidth and latency of the user's network connection.
		 *
		 * The default name is `BA`.
		 * @param {boolean} [config.BW.cookie_exp] The lifetime in seconds of the bandwidth cookie.
		 *
		 * The default is set to 7 days. This specifies how long it will be before
		 * we run the bandwidth test again for a user, assuming their IP address
		 * doesn't change within this time.
		 *
		 * You probably do not need to change this setting at all since the bandwidth
		 * of a given network connection typically does not change by an order
		 * of magnitude on a regular basis.
		 *
		 * Note that if you're doing some kind of real-time streaming, then
		 * chances are that this bandwidth test isn't right for you, so
		 * setting this cookie to a shorter value isn't the right solution.
		 * @param {boolean} [config.BW.timeout] The timeout in seconds for the entire bandwidth test.
		 *
		 * The default is set to 15 seconds.
		 *
		 * The bandwidth test can run for a long time, and sometimes, due to
		 * network errors, it might never complete. The timeout forces the test
		 * to complete at that time. This is a hard limit.
		 *
		 * If the timeout fires, we stop further iterations of the test and
		 * attempt to calculate bandwidth with the data that we've collected at that point.
		 *
		 * Increasing the timeout can get you more data and increase the accuracy
		 * of the test, but at the same time increases the risk of the test not
		 * completing before the user leaves the page.
		 * @param {boolean} [config.BW.nruns] The number of times the bandwidth test should run.
		 *
		 * The default is set to 5.
		 *
		 * The first test is always a pilot to figure out the best way to proceed
		 * with the remaining tests. Increasing this number will increase the
		 * tests accuracy, but at the same time increases the risk that the test will timeout.
		 *
		 * It should take about 2-4 seconds per run, so consider this value along with the timeout value above.
		 * @param {boolean} [config.BW.test_https] By default, boomerang will skip the bandwidth
		 * test over an HTTPS connection.
		 *
		 * Establishing an SSL connection takes time, which could skew the
		 * bandwidth results. If all your traffic is sent over SSL, then running
		 * the test over SSL probably gets you what you want.
		 *
		 * If you set `test_https` to `true`, boomerang will run the test instead of skipping.
		 * @param {boolean} [config.BW.block_beacon] By default, the bandwidth plugin
		 * will not block boomerang from sending a beacon, so the results will
		 * not be included in the broadcast with default settings.
		 *
		 * If you set `block_beacon` to true, boomerang will wait for the
		 * results of the test before sending the beacon.
		 * @param {string} [config.BW.user_ip] The user's IP address, for detecting
		 * if networks change.
		 *
		 * @returns {@link BOOMR.plugins.BW} The BW plugin for chaining
		 * @memberof BOOMR.plugins.BW
		 */
		init: function(config) {
			if (impl.initialized) {
				return this;
			}

			BOOMR.utils.pluginConfig(impl, config, "BW",
							["base_url", "timeout", "nruns", "cookie", "cookie_exp", "test_https", "block_beacon"]);

			if (config && config.user_ip) {
				impl.user_ip = config.user_ip;
			}

			if (!impl.base_url) {
				return this;
			}

			images.start = 0;
			impl.runs_left = impl.nruns;
			impl.latency_runs = 10;
			impl.results = [];
			impl.latencies = [];
			impl.latency = null;
			impl.complete = impl.aborted = false;

			BOOMR.removeVar("ba", "ba_err", "lat", "lat_err");

			if (!impl.setVarsFromCookie()) {
				BOOMR.subscribe("page_ready", this.run, null, this);
			}

			impl.initialized = true;

			return this;
		},

		/**
		 * Starts the bandwidth test. This method is called automatically when
		 * boomerang's {@link BOOMR#event:page_ready} event fires, so you won't need
		 * to call it yourself.
		 *
		 * @returns {@link BOOMR.plugins.BW} The BW plugin for chaining
		 * @memberof BOOMR.plugins.BW
		 */
		run: function() {
			var a;
			if (impl.running || impl.complete) {
				return this;
			}

			// Turn image url into an absolute url if it isn't already
			a = BOOMR.window.document.createElement("a");
			a.href = impl.base_url;

			if (!impl.test_https && a.protocol === "https:") {
				// we don't run the test for https because SSL stuff will mess up b/w
				// calculations we could run the test itself over HTTP, but then IE
				// will complain about insecure resources, so the best is to just bail
				// and hope that the user gets the cookie from some other page

				BOOMR.info("HTTPS detected, skipping bandwidth test", "bw");
				impl.complete = true;

				if (impl.block_beacon === true) {
					BOOMR.sendBeacon();
				}

				return this;
			}

			impl.base_url = a.href;
			impl.running = true;

			setTimeout(this.abort, impl.timeout);

			impl.iterate();

			return this;
		},

		/**
		 * Stops the bandwidth test immediately and attempts to calculate bandwidth
		 * and latency from values that it has already gathered.
		 *
		 * This method is called automatically if the bandwidth test times out.
		 *
		 * It is better to set the timeout value appropriately when calling the
		 * {@link BOOMR.init} method.
		 * @memberof BOOMR.plugins.BW
		 */
		abort: function() {
			impl.aborted = true;
			if (impl.running) {
				impl.finish();	// we don't defer this call because it might be called from
						// onunload and we want the entire chain to complete
						// before we return
			}
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.BW
		 */
		is_complete: function() {
			if (impl.block_beacon === true) {
				return impl.complete;
			}
			else {
				return true;
			}
		}
	};

}());
// End of BW plugin

/**
 * The PaintTiming plugin collects paint metrics exposed by the W3C
 * [Paint Timing]{@link https://www.w3.org/TR/paint-timing/} specification.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * All beacon parameters are prefixed with `pt.`.
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `pt.fp`: `first-paint` in `DOMHighResTimestamp`
 * * `pt.fcp`: `first-contentful-paint` in `DOMHighResTimestamp`
 * * `pt.hid`: The document was loaded hidden (at some point), so FP and FCP are
 *             user-driven events, and thus won't be added to the beacon.
 *
 * @see {@link https://www.w3.org/TR/paint-timing/}
 * @class BOOMR.plugins.PaintTiming
 */
(function() {
	
	

	if (BOOMR.plugins.PaintTiming) {
		return;
	}

	/**
	 * Map of Paint Timing API names to `pt.*` beacon parameters
	 *
	 * https://www.w3.org/TR/paint-timing/
	 */
	var PAINT_TIMING_MAP = {
		"first-paint": "fp",
		"first-contentful-paint": "fcp"
	};

	/**
	 * Private implementation
	 */
	var impl = {
		/**
		 * Whether or not we've initialized yet
		 */
		initialized: false,

		/**
		 * Whether or not we've added data to the beacon
		 */
		complete: false,

		/**
		 * Whether or not the browser supports PaintTiming (cached value)
		 */
		supported: null,

		/**
		 * Cached PaintTiming values
		 */
		timingCache: {},

		/**
		 * Executed on `page_ready`, `xhr_load` and `before_unload`
		 */
		done: function(edata, ename) {
			var p, paintTimings, i;

			if (this.complete) {
				// we've already added data to the beacon
				return this;
			}

			//
			// Don't add PaintTimings to SPA Soft or XHR beacons --
			// Only add to Page Load (ename: load) and SPA Hard (ename: xhr
			// and initiator: spa_hard) beacons.
			//
			if (ename !== "load" && (!edata || edata.initiator !== "spa_hard")) {
				this.complete = true;

				return this;
			}

			p = BOOMR.getPerformance();
			if (!p || typeof p.getEntriesByType !== "function") {
				// can't do anything if window.performance isn't available
				this.complete = true;

				return;
			}

			//
			// Get First Paint, First Contentful Paint, etc from Paint Timing API
			// https://www.w3.org/TR/paint-timing/
			//
			paintTimings = p.getEntriesByType("paint");

			if (paintTimings && paintTimings.length) {
				BOOMR.info("This user agent supports PaintTiming", "pt");

				for (i = 0; i < paintTimings.length; i++) {
					// cache it for others who want to use it
					impl.timingCache[paintTimings[i].name] = paintTimings[i].startTime;

					if (PAINT_TIMING_MAP[paintTimings[i].name]) {
						// add pt.* to a single beacon
						BOOMR.addVar(
							"pt." + PAINT_TIMING_MAP[paintTimings[i].name],
							Math.floor(paintTimings[i].startTime),
							true);
					}
				}

				this.complete = true;

				BOOMR.sendBeacon();
			}
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.PaintTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * This plugin does not have any configuration.
		 *
		 * @returns {@link BOOMR.plugins.PaintTiming} The PaintTiming plugin for chaining
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		init: function() {
			// skip initialization if not supported
			if (!this.is_supported()) {
				impl.complete = true;
				impl.initialized = true;
			}

			// If we haven't added PaintTiming data and the page is currently
			// hidden, don't add anything to the beacon as the paint might
			// happen only when the visitor makes the document visible.
			if (!impl.complete && BOOMR.visibilityState() === "hidden") {
				BOOMR.addVar("pt.hid", 1, true);

				impl.complete = true;
			}

			if (!impl.initialized) {
				// we'll add data to the beacon on whichever happens first
				BOOMR.subscribe("page_ready", impl.done, "load", impl);
				BOOMR.subscribe("xhr_load", impl.done, "xhr", impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);

				impl.initialized = true;
			}

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Whether or not this plugin is enabled and PaintTiming is supported.
		 *
		 * @returns {boolean} `true` if PaintTiming plugin is enabled and supported.
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_enabled: function() {
			return impl.initialized && this.is_supported();
		},

		/**
		 * Whether or not PaintTiming is supported in this browser.
		 *
		 * @returns {boolean} `true` if PaintTiming is supported.
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		is_supported: function() {
			var p;

			if (impl.supported !== null) {
				return impl.supported;
			}

			// check for getEntriesByType and the entry type existing
			var p = BOOMR.getPerformance();
			impl.supported = p &&
				typeof window.PerformancePaintTiming !== "undefined" &&
				typeof p.getEntriesByType === "function";

			return impl.supported;
		},

		/**
		 * Gets the PaintTiming timestamp for the specified name
		 *
		 * @param {string} timingName PaintTiming name
		 *
		 * @returns {DOMHighResTimestamp} Timestamp
		 * @memberof BOOMR.plugins.PaintTiming
		 */
		getTimingFor: function(timingName) {
			var p, paintTimings, i;

			// look in our cache first
			if (impl.timingCache[timingName]) {
				return impl.timingCache[timingName];
			}

			// skip if not supported
			if (!this.is_supported()) {
				return;
			}

			// need to get the window.performance interface
			var p = BOOMR.getPerformance();
			if (!p || typeof p.getEntriesByType !== "function") {
				return;
			}

			// get all Paint Timings
			paintTimings = p.getEntriesByType("paint");

			if (paintTimings && paintTimings.length) {
				for (i = 0; i < paintTimings.length; i++) {
					if (paintTimings[i].name === timingName) {
						// cache the value since it'll never change
						impl.timingCache[timingName] = paintTimings[i].startTime;

						return impl.timingCache[timingName];
					}
				}
			}
		}
	};

}());

/*
 * Copyright (c), Buddy Brewer.
 */
/**
 * The Navigation Timing plugin collects performance metrics collected by modern
 * user agents that support the W3C [NavigationTiming]{@link http://www.w3.org/TR/navigation-timing/}
 * specification.
 *
 * This plugin also adds similar [ResourceTiming]{@link https://www.w3.org/TR/resource-timing-1/}
 * metrics for any XHR beacons.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * All beacon parameters are prefixed with `nt_`.
 *
 * This plugin adds the following parameters to the beacon for Page Loads:
 *
 * * `nt_red_cnt`: `performance.navigation.redirectCount`
 * * `nt_nav_type`: `performance.navigation.type`
 * * `nt_nav_st`: `performance.timing.navigationStart`
 * * `nt_red_st`: `performance.timing.redirectStart`
 * * `nt_red_end`: `performance.timing.redirectEnd`
 * * `nt_fet_st`: `performance.timing.fetchStart`
 * * `nt_dns_st`: `performance.timing.domainLookupStart`
 * * `nt_dns_end`: `performance.timing.domainLookupEnd`
 * * `nt_con_st`: `performance.timing.connectStart`
 * * `nt_con_end`: `performance.timing.connectEnd`
 * * `nt_req_st`: `performance.timing.requestStart`
 * * `nt_res_st`: `performance.timing.responseStart`
 * * `nt_res_end`: `performance.timing.responseEnd`
 * * `nt_domloading`: `performance.timing.domLoading`
 * * `nt_domint`: `performance.timing.domInteractive`
 * * `nt_domcontloaded_st`: `performance.timing.domContentLoadedEventStart`
 * * `nt_domcontloaded_end`: `performance.timing.domContentLoadedEventEnd`
 * * `nt_domcomp`: `performance.timing.domComplete`
 * * `nt_load_st`: `performance.timing.loadEventStart`
 * * `nt_load_end`: `performance.timing.loadEventEnd`
 * * `nt_unload_st`: `performance.timing.unloadEventStart`
 * * `nt_unload_end`: `performance.timing.unloadEventEnd`
 * * `nt_ssl_st`: `performance.timing.secureConnectionStart`
 * * `nt_spdy`: `1` if page was loaded over SPDY, `0` otherwise.  Only available
 *   in Chrome when it _doesn't_ support NavigationTiming2.  If NavigationTiming2
 *   is supported, `nt_protocol` will be added instead.
 * * `nt_first_paint`: The time when the first paint happened. If the browser
 *   supports the Paint Timing API, this is the `first-paint` time in milliseconds
 *   since the epoch. Else, on Internet Explorer, this is the `msFirstPaint`
 *   value, in milliseconds since the epoch. On Chrome, this is using
 *   `loadTimes().firstPaintTime` and is converted from seconds.microseconds
 *   into milliseconds since the epoch.
 * * `nt_cinf`: Chrome `chrome.loadTimes().connectionInfo`.  Only available
 *   in Chrome when it _doesn't_ support NavigationTiming2.  If NavigationTiming2
 *   is supported, `nt_protocol` will be added instead.
 * * `nt_protocol`: NavigationTiming2's `nextHopProtocol`
 * * `nt_bad`: If we detected that any NavigationTiming metrics looked odd,
 *   such as `responseEnd` in the far future or `fetchStart` before `navigationStart`.
 * * `nt_worker_start`: NavigationTiming2 `workerStart`
 * * `nt_enc_size`: NavigationTiming2 `encodedBodySize`
 * * `nt_dec_size`: NavigationTiming2 `decodedBodySize`
 * * `nt_trn_size`: NavigationTiming2 `transferSize`
 *
 * For XHR beacons, the following parameters are added (via ResourceTiming):
 *
 * * `nt_red_st`: `redirectStart`
 * * `nt_red_end`: `redirectEnd`
 * * `nt_fet_st`: `fetchStart`
 * * `nt_dns_st`: `domainLookupStart`
 * * `nt_dns_end`: `domainLookupEnd`
 * * `nt_con_st`: `connectStart`
 * * `nt_con_end`: `connectEnd`
 * * `nt_req_st`: `requestStart`
 * * `nt_res_st`: `responseStart`
 * * `nt_res_end`: `responseEnd`
 * * `nt_load_st`: `loadEventStart`
 * * `nt_load_end`: `loadEventEnd`
 * * `nt_ssl_st`: `secureConnectionStart`
 *
 * @see {@link http://www.w3.org/TR/navigation-timing/}
 * @see {@link https://www.w3.org/TR/resource-timing-1/}
 * @class BOOMR.plugins.NavigationTiming
 */
(function() {
	
	

	if (BOOMR.plugins.NavigationTiming) {
		return;
	}

	/**
	 * Calculates a NavigationTiming timestamp for the beacon, in milliseconds
	 * since the Unix Epoch.
	 *
	 * The offset should be 0 if using a timestamp from performance.timing (which
	 * are already in milliseconds since Unix Epoch), or the value of navigationStart
	 * if using getEntriesByType("navigation") (which are DOMHighResTimestamps).
	 *
	 * The number is stripped of any decimals.
	 *
	 * @param {number} offset navigationStart offset (0 if using NavTiming1)
	 * @param {number} val DOMHighResTimestamp
	 *
	 * @returns {number} Timestamp for beacon
	 */
	function calcNavTimingTimestamp(offset, val) {
		if (typeof val !== "number" || val === 0) {
			return undefined;
		}

		return Math.floor((offset || 0) + val);
	}

	// A private object to encapsulate all your implementation details
	var impl = {
		complete: false,
		fullySent: false,
		sendBeacon: function() {
			this.complete = true;
			BOOMR.sendBeacon();
		},
		xhr_done: function(edata) {
			var p;

			if (edata && edata.initiator === "spa_hard") {
				// Single Page App - Hard refresh: Send page's NavigationTiming data, if
				// available.
				impl.done(edata);
				return;
			}
			else if (edata && edata.initiator === "spa") {
				// Single Page App - Soft refresh: The original hard navigation is no longer
				// relevant for this soft refresh, nor is the "URL" for this page, so don't
				// add NavigationTiming or ResourceTiming metrics.
				impl.sendBeacon();
				return;
			}

			var w = BOOMR.window, res, data = {}, k;

			if (!edata) {
				return;
			}

			if (edata.data) {
				edata = edata.data;
			}

			p = BOOMR.getPerformance();

			// if we previously saved the correct ResourceTiming entry, use it
			if (p && edata.restiming) {
				data = {
					nt_red_st: edata.restiming.redirectStart,
					nt_red_end: edata.restiming.redirectEnd,
					nt_fet_st: edata.restiming.fetchStart,
					nt_dns_st: edata.restiming.domainLookupStart,
					nt_dns_end: edata.restiming.domainLookupEnd,
					nt_con_st: edata.restiming.connectStart,
					nt_con_end: edata.restiming.connectEnd,
					nt_req_st: edata.restiming.requestStart,
					nt_res_st: edata.restiming.responseStart,
					nt_res_end: edata.restiming.responseEnd
				};

				if (edata.restiming.secureConnectionStart) {
					// secureConnectionStart is OPTIONAL in the spec
					data.nt_ssl_st = edata.restiming.secureConnectionStart;
				}

				for (k in data) {
					if (data.hasOwnProperty(k) && data[k]) {
						data[k] += p.timing.navigationStart;

						// don't need to send microseconds
						data[k] = Math.floor(data[k]);
					}
				}
			}

			if (edata.timing) {
				res = edata.timing;
				if (!data.nt_req_st) {
					// requestStart will be 0 if Timing-Allow-Origin header isn't set on the xhr response
					data.nt_req_st = res.requestStart;
				}
				if (!data.nt_res_st) {
					// responseStart will be 0 if Timing-Allow-Origin header isn't set on the xhr response
					data.nt_res_st = res.responseStart;
				}
				if (!data.nt_res_end) {
					data.nt_res_end = res.responseEnd;
				}
				data.nt_domint = res.domInteractive;
				data.nt_domcomp = res.domComplete;
				data.nt_load_st = res.loadEventEnd;
				data.nt_load_end = res.loadEventEnd;
			}

			for (k in data) {
				if (data.hasOwnProperty(k) && !data[k]) {
					delete data[k];
				}
			}

			BOOMR.addVar(data, undefined, true);

			impl.sendBeacon();
		},

		done: function() {
			var w = BOOMR.window, p, pn, chromeTimes, pt, data = {}, offset = 0, i,
			    paintTiming, paintTimingSupported = false, k;

			if (this.complete) {
				return this;
			}

			p = BOOMR.getPerformance();

			if (p) {
				if (typeof p.getEntriesByType === "function") {
					pt = p.getEntriesByType("navigation");
					if (pt && pt.length) {
						BOOMR.info("This user agent supports NavigationTiming2", "nt");

						pt = pt[0];

						// ensure DOMHighResTimestamps are added to navigationStart
						offset = p.timing ? p.timing.navigationStart : 0;
					}
					else {
						pt = undefined;
					}
				}

				if (!pt && p.timing) {
					BOOMR.info("This user agent supports NavigationTiming", "nt");
					pt = p.timing;
				}

				if (pt) {
					data = {
						// start is `navigationStart` on .timing, `startTime` is always 0 on timeline entry
						nt_nav_st: p.timing ? p.timing.navigationStart : 0,

						// all other entries have the same name on .timing vs timeline entry
						nt_red_st: calcNavTimingTimestamp(offset, pt.redirectStart),
						nt_red_end: calcNavTimingTimestamp(offset, pt.redirectEnd),
						nt_fet_st: calcNavTimingTimestamp(offset, pt.fetchStart),
						nt_dns_st: calcNavTimingTimestamp(offset, pt.domainLookupStart),
						nt_dns_end: calcNavTimingTimestamp(offset, pt.domainLookupEnd),
						nt_con_st: calcNavTimingTimestamp(offset, pt.connectStart),
						nt_con_end: calcNavTimingTimestamp(offset, pt.connectEnd),
						nt_req_st: calcNavTimingTimestamp(offset, pt.requestStart),
						nt_res_st: calcNavTimingTimestamp(offset, pt.responseStart),
						nt_res_end: calcNavTimingTimestamp(offset, pt.responseEnd),
						nt_domloading: calcNavTimingTimestamp(offset, pt.domLoading),
						nt_domint: calcNavTimingTimestamp(offset, pt.domInteractive),
						nt_domcontloaded_st: calcNavTimingTimestamp(offset, pt.domContentLoadedEventStart),
						nt_domcontloaded_end: calcNavTimingTimestamp(offset, pt.domContentLoadedEventEnd),
						nt_domcomp: calcNavTimingTimestamp(offset, pt.domComplete),
						nt_load_st: calcNavTimingTimestamp(offset, pt.loadEventStart),
						nt_load_end: calcNavTimingTimestamp(offset, pt.loadEventEnd),
						nt_unload_st: calcNavTimingTimestamp(offset, pt.unloadEventStart),
						nt_unload_end: calcNavTimingTimestamp(offset, pt.unloadEventEnd)
					};

					// domLoading doesn't exist on NavigationTiming2, so fetch it
					// from performance.timing if available.
					if (!data.nt_domloading && p && p.timing && p.timing.domLoading) {
						// value on performance.timing will be in Unix Epoch milliseconds
						data.nt_domloading = p.timing.domLoading;
					}

					if (pt.secureConnectionStart) {
						// secureConnectionStart is OPTIONAL in the spec
						data.nt_ssl_st = calcNavTimingTimestamp(offset, pt.secureConnectionStart);
					}

					if (p.timing && p.timing.msFirstPaint) {
						// msFirstPaint is IE9+ http://msdn.microsoft.com/en-us/library/ff974719
						// and is in Unix Epoch format
						data.nt_first_paint = p.timing.msFirstPaint;
					}

					if (pt.workerStart) {
						// ServiceWorker time
						data.nt_worker_start = calcNavTimingTimestamp(offset, pt.workerStart);
					}

					// Need to check both decodedSize and transferSize as
					// transferSize is 0 for cached responses and
					// decodedSize is 0 for empty responses (eg: beacons, 204s, etc.)
					if (pt.decodedBodySize || pt.transferSize) {
						data.nt_enc_size = pt.encodedBodySize;
						data.nt_dec_size = pt.decodedBodySize;
						data.nt_trn_size = pt.transferSize;
					}

					if (pt.nextHopProtocol) {
						data.nt_protocol = pt.nextHopProtocol;
					}
				}

				//
				// Get First Paint from Paint Timing API
				// https://www.w3.org/TR/paint-timing/
				//
				if (!data.nt_first_paint && BOOMR.plugins.PaintTiming) {
					paintTimingSupported = BOOMR.plugins.PaintTiming.is_supported();

					paintTiming = BOOMR.plugins.PaintTiming.getTimingFor("first-paint");

					if (paintTiming) {
						data.nt_first_paint = calcNavTimingTimestamp(offset, paintTiming);
					}
				}

				//
				// Chrome provides window.chrome.loadTimes(), but this is deprecated
				// in Chrome 64+ and will be removed at some point.  The data it
				// provides may be available in more modern performance APIs:
				//
				// * .connectionInfo (nt_cinf): Navigation Timing 2 nextHopProtocol
				// * .wasFetchedViaSpdy (nt_spdy): Could be calculated via above,
				//       so we don't need to add if it's not available directly
				// * .firstPaintTime (nt_first_paint): Paint Timing's first-paint
				//
				// If we've already queried that data, don't also query
				// loadTimes() as it will generate a console warning.
				//
				if ((!data.nt_protocol || !data.nt_first_paint) &&
				    (!pt || pt.nextHopProtocol !== "") &&
				    !paintTimingSupported &&
				    w.chrome &&
				    typeof w.chrome.loadTimes === "function") {
					chromeTimes = w.chrome.loadTimes();
					if (chromeTimes) {
						data.nt_spdy = (chromeTimes.wasFetchedViaSpdy ? 1 : 0);
						data.nt_cinf = chromeTimes.connectionInfo;

						// Chrome firstPaintTime is in seconds.microseconds, so
						// we need to multiply it by 1000 to be consistent with
						// msFirstPaint and other NavigationTiming timestamps that
						// are in milliseconds.microseconds.
						if (typeof chromeTimes.firstPaintTime === "number" && chromeTimes.firstPaintTime !== 0) {
							data.nt_first_paint = Math.round(chromeTimes.firstPaintTime * 1000);
						}
					}
				}

				//
				// Navigation Type and Redirect Count
				//
				if (p.navigation) {
					pn = p.navigation;

					data.nt_red_cnt  = pn.redirectCount;
					data.nt_nav_type = pn.type;
				}

				// Remove any properties that are undefined
				for (k in data) {
					if (data.hasOwnProperty(k) && data[k] === undefined) {
						delete data[k];
					}
				}

				BOOMR.addVar(data, undefined, true);

				//
				// Basic browser bug detection for known cases where NavigationTiming
				// timestamps might not be trusted.
				//
				if (pt && (
				    (pt.requestStart && pt.navigationStart && pt.requestStart < pt.navigationStart) ||
				    (pt.responseStart && pt.navigationStart && pt.responseStart < pt.navigationStart) ||
				    (pt.responseStart && pt.fetchStart && pt.responseStart < pt.fetchStart) ||
				    (pt.navigationStart && pt.fetchStart < pt.navigationStart) ||
				    (pt.responseEnd && pt.responseEnd > BOOMR.now() + 8.64e+7)
				)) {
					BOOMR.addVar("nt_bad", 1, true);
				}

				if (data.nt_load_end > 0) {
					this.fullySent = true;
				}
			}

			impl.sendBeacon();
		},

		clear: function(edata) {
			// Allow the data to go out on both an Early beacon and the regular Page Load beacon,
			// but after that, if we ever sent the full data, we're complete for all times.
			this.complete = !(edata && edata.early) && this.fullySent;
		},

		prerenderToVisible: function() {
			// ensure we add our data to the beacon even if we had added it
			// during prerender (in case another beacon went out in between)
			this.complete = false;

			// add our data to the beacon
			this.done();
		},

		onBeforeEarlyBeacon: function(edata) {
			// Add our data to the early beacon
			if (!edata /* dom_loaded */ ||
			    typeof edata.initiator === "undefined" /* onconfig */ ||
			    edata.initiator === "spa_hard") {
				this.done();
			}
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.NavigationTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * This plugin does not have any configuration.
		 * @returns {@link BOOMR.plugins.NavigationTiming} The NavigationTiming plugin for chaining
		 * @memberof BOOMR.plugins.NavigationTiming
		 */
		init: function() {
			if (!impl.initialized) {
				// we'll fire on whichever happens first
				BOOMR.subscribe("page_ready", impl.done, null, impl);
				BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
				BOOMR.subscribe("before_early_beacon", impl.onBeforeEarlyBeacon, null, impl);
				BOOMR.subscribe("xhr_load", impl.xhr_done, null, impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);
				BOOMR.subscribe("beacon", impl.clear, null, impl);

				impl.initialized = true;
			}
			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.NavigationTiming
		 */
		is_complete: function() {
			return true;
		}
	};

}());

/**
 * Plugin to collect metrics from the W3C [ResourceTiming]{@link http://www.w3.org/TR/resource-timing/}
 * API.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon for Page Loads:
 *
 * * `restiming`: Compressed ResourceTiming data
 *
 * The ResourceTiming plugin adds an object named `restiming` to the beacon data.
 *
 *  `restiming` is an optimized [Trie]{@link http://en.wikipedia.org/wiki/Trie} structure,
 * where the keys are the ResourceTiming URLs, and the values correspond to those URLs'
 * [PerformanceResourceTiming]{@link http://www.w3.org/TR/resource-timing/#performanceresourcetiming}
 * timestamps:
 *
 *     { "[url]": "[data]"}
 *
 * The Trie structure is used to minimize the data transmitted from the ResourceTimings.
 *
 * Keys in the Trie are the ResourceTiming URLs. For example, with a root page and three resources:
 *
 * * http://abc.com/
 * * http://abc.com/js/foo.js
 * * http://abc.com/css/foo.css
 * * http://abc.com/css/foo.png (downloaded twice)
 *
 * Then the Trie might look like this:
 *
 *     // Example 1
 *     {
 *       "http://abc.com/":
 *       {
 *         "|": "0,2",
 *         "js/foo.js": "3a,1",
 *         "css/": {
 *           "foo.css": "2b,2",
 *           "foo.png": "1c,3|1d,a"
 *         }
 *       }
 *     }
 *
 * If a resource's URL is a prefix of another resource, then it terminates with a
 * pipe symbol (`|`). In Example 1, `http://abc.com` (the root page) is a
 * prefix of `http://abc.com/js/foo.js`, so it is listed as `http://abc.com|` in
 * the Trie.
 *
 * If there is more than one ResourceTiming entry for a URL, each entry is
 * separated by a pipe symbol (`|`) in the `data`. In Example 1 above, `foo.png`
 * has been downloaded twice, so it is listed with two separate page loads, `1c,3` and `1d,a`.
 *
 * The value of each key is a string, which contains the following components:
 *
 *     data = "[initiatorType][timings]"
 *
 * `initiatorType` is a simple map from the PerformanceResourceTiming
 * `initiatorType` (which is a string) to an integer, according to the
 * {@link BOOMR.plugins.ResourceTiming.INITAITOR_TYPES} enum.
 *
 * `timings` is a string of [Base-36]{@link http://en.wikipedia.org/wiki/Base_36}
 * encoded timestamps from the PerformanceResourceTiming interface. The values in
 * the string are separated by commas:
 *
 *     timings = "[startTime],[responseEnd],[responseStart],[requestStart],[connectEnd],[secureConnectionStart],[connectStart],[domainLookupEnd],[domainLookupStart],[redirectEnd],[redirectStart]"
 *
 * `startTime` is a [DOMHighResTimeStamp]{@link http://www.w3.org/TR/hr-time/#domhighrestimestamp}
 * from when the resource started (Base 36).
 *
 * All other timestamps are offsets (rounded to milliseconds) from `startTime`
 * (Base 36). For example, `responseEnd` is calculated as:
 *
 *     responseEnd: base36(round(responseEnd - startTime))
 *
 * If the resulting timestamp is `0`, it is replaced with an empty string (`""`).
 *
 * All trailing commas are removed from the final string. This compresses the timing
 * string from timestamps that are often `0`. For example, here is what a fully-redirected
 * resource might look like:
 *
 *     { "http://abc.com/this-resource-was-redirected": "01,1,1,1,1,1,1,1,1,1,1" }
 *
 * While a resource that was loaded from the cache (and thus only has `startTime`
 * and `responseEnd` timestamps) might look like this:
 *
 *     { "http://abc.com/this-resource-was-redirected": "01,1" }
 *
 * Note that some of the metrics are restricted and will not be provided cross-origin
 * unless the Timing-Allow-Origin header permits.
 *
 * Putting this all together, let's look at `http://abc.com/css/foo.png` in Example 1.
 * We find it was downloaded twice `"1c,3|1d,a"`:
 *
 * * 1c,3:
 *     * `1`: `initiatorType` = `1` (IMG)
 *     * `c`: `startTime` = `c` (12ms)
 *     * `3`: `responseEnd` = `3` (3ms from startTime, or at 15ms)
 * * 1d,a:
 *     * `1`: `initiatorType` = `1` (IMG)
 *     * `d`: `startTime` = `d` (13ms)
 *     * `a`: `responseEnd` = `a` (10ms from startTime, or at 23ms)
 *
 * @see {@link http://www.w3.org/TR/resource-timing/}
 * @class BOOMR.plugins.ResourceTiming
 */
(function() {
	var impl;

	
	

	if (BOOMR.plugins.ResourceTiming) {
		return;
	}

	//
	// Constants
	//

	/**
	 * @enum {number}
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	var INITIATOR_TYPES = {
		/** Unknown type */
		"other": 0,
		/** IMG element (or IMAGE element inside a SVG for IE, Edge and Firefox) */
		"img": 1,
		/** LINK element (i.e. CSS) */
		"link": 2,
		/** SCRIPT element */
		"script": 3,
		/** Resource referenced in CSS */
		"css": 4,
		/** XMLHttpRequest */
		"xmlhttprequest": 5,
		/** The root HTML page itself */
		"html": 6,
		/** IMAGE element inside a SVG */
		"image": 7,
		/** [sendBeacon]{@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon} */
		"beacon": 8,
		/** [Fetch API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} */
		"fetch": 9,
		/** An IFRAME */
		"iframe": "a",
		/** IE11 and Edge (some versions) send "subdocument" instead of "iframe" */
		"subdocument": "a",
		/** BODY element */
		"body": "b",
		/** INPUT element */
		"input": "c",
		/** FRAME element */
		"frame": "a",
		/** OBJECT element */
		"object": "d",
		/** VIDEO element */
		"video": "e",
		/** AUDIO element */
		"audio": "f",
		/** SOURCE element */
		"source": "g",
		/** TRACK element */
		"track": "h",
		/** EMBED element */
		"embed": "i",
		/** EventSource */
		"eventsource": "j",
		/** The root HTML page itself */
		"navigation": 6
	};

	/**
	 * These are the only `rel` types that might be reference-able from
	 * ResourceTiming.
	 *
	 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
	 *
	 * @enum {number}
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	var REL_TYPES = {
		"prefetch": 1,
		"preload": 2,
		"prerender": 3,
		"stylesheet": 4
	};

	var RT_FIELDS_TIMESTAMPS = [
		"startTime",
		"redirectStart",
		"redirectEnd",
		"fetchStart",
		"domainLookupStart",
		"domainLookupEnd",
		"connectStart",
		"secureConnectionStart",
		"connectEnd",
		"requestStart",
		"responseStart",
		"responseEnd",
		"workerStart"
	];

	// Words that will be broken (by ensuring the optimized trie doesn't contain
	// the whole string) in URLs, to ensure NoScript doesn't think this is an XSS attack
	var DEFAULT_XSS_BREAK_WORDS = [
		/(h)(ref)/gi,
		/(s)(rc)/gi,
		/(a)(ction)/gi
	];

	// Delimiter to use to break a XSS word
	var XSS_BREAK_DELIM = "\n";

	// Maximum number of characters in a URL
	var DEFAULT_URL_LIMIT = 500;

	// Any ResourceTiming data time that starts with this character is not a time,
	// but something else (like dimension data)
	var SPECIAL_DATA_PREFIX = "*";

	// Dimension data special type
	var SPECIAL_DATA_DIMENSION_TYPE = "0";

	// Dimension data special type
	var SPECIAL_DATA_SIZE_TYPE = "1";

	// Script attributes
	var SPECIAL_DATA_SCRIPT_ATTR_TYPE = "2";
	// The following make up a bitmask
	var ASYNC_ATTR = 0x1;
	var DEFER_ATTR = 0x2;
	var LOCAT_ATTR = 0x4;	// 0 => HEAD, 1 => BODY

	// Dimension data special type
	var SPECIAL_DATA_SERVERTIMING_TYPE = "3";

	// Link attributes
	var SPECIAL_DATA_LINK_ATTR_TYPE = "4";

	// Namespaced data
	var SPECIAL_DATA_NAMESPACED_TYPE = "5";

	/**
	 * Converts entries to a Trie (`splitAtPath=true`) or Radix
	 * Trie (`splitAtPath=false`):
	 * https://en.wikipedia.org/wiki/Trie
	 * https://en.wikipedia.org/wiki/Radix_tree
	 *
	 * Assumptions:
	 * 1) All entries have unique keys
	 * 2) Keys cannot have "|" in their name.
	 * 3) All key's values are strings
	 *
	 * Leaf nodes in the tree are the key's values.
	 *
	 * If key A is a prefix to key B, key A will be suffixed with "|".
	 *
	 * By default, the Trie is constructed "perfectly" (a Radix Trie) by looking
	 * at every letter of each URL.  If `splitAtPath` is specified, the URL is
	 * split up into groups based on the path separator. This will create a
	 * non-optimal Trie but will speed up the Trie construction significantly
	 * (taking less than a half or third of the time on large data sets).
	 *
	 * @param {object} entries Performance entries
	 * @param {boolean} [splitAtPath] Whether to split at path separator vs every character
	 *
	 * @returns {object} A trie
	 */
	function convertToTrie(entries, splitAtPath) {
		var trie = {}, url, urlFixed, i, value, letters, letter, cur, node;

		/**
		 * Builds an array of path components.
		 *
		 * @param {number} addSlashUntil Length of path components
		 */
		function splitUrlPaths(addSlashUntil) {
			return function(accumulator, currentValue, currentIndex) {
				var parts, j;

				// if this component has the XSS_BREAK_DELIM character in it, we need
				// to break it up
				if (currentValue.indexOf(XSS_BREAK_DELIM) !== -1) {
					// break at that character
					parts = currentValue.split(XSS_BREAK_DELIM);

					// add everything but the last one with special XSS_BREAK_DELIM nodes
					for (j = 0; j < parts.length - 1; j++) {
						// add this component
						accumulator.push(parts[j]);

						// add back in the XSS_BREAK_DELIM
						accumulator.push(XSS_BREAK_DELIM);
					}

					// add the last part
					currentValue = parts.slice(-1);
				}

				// add a '/' for everything but the last one
				if (typeof addSlashUntil === "number" && currentIndex < addSlashUntil) {
					currentValue += "/";
				}

				return accumulator.concat(currentValue);
			};
		}

		for (url in entries) {
			urlFixed = url;

			// find any strings to break
			for (i = 0; i < impl.xssBreakWords.length; i++) {
				// Add a XSS_BREAK_DELIM character after the first letter.  optimizeTrie will
				// ensure this sequence doesn't get combined.
				urlFixed = urlFixed.replace(impl.xssBreakWords[i], "$1" + XSS_BREAK_DELIM + "$2");
			}

			if (!entries.hasOwnProperty(url)) {
				continue;
			}

			value = entries[url];

			if (splitAtPath) {
				//
				// Split the Trie based on the path (less CPU, less optimial result)
				//
				letters = urlFixed.split("/");

				letters = [
					// protocol
					letters[0] + "//",

					// hostname and optional slash
					letters[2] + (letters.length > 3 ? "/" : "")

				// all of the path parts
				].concat(letters.slice(3).reduce(splitUrlPaths(letters.length - 4), []));
			}
			else {
				//
				// Split at every letter (more CPU, perfect result)
				//
				letters = urlFixed.split("");
			}

			// start at the top of the Trie
			cur = trie;

			for (i = 0; i < letters.length; i++) {
				letter = letters[i];
				node = cur[letter];

				if (typeof node === "undefined") {
					// nothing exists yet, create either a leaf if this is the end of the word,
					// or a branch if there are letters to go
					cur = cur[letter] = (i === (letters.length - 1) ? value : {});
				}
				else if (typeof node === "string") {
					// this is a leaf, but we need to go further, so convert it into a branch
					cur = cur[letter] = { "|": node };
				}
				else {
					if (i === (letters.length - 1)) {
						// this is the end of our key, and we've hit an existing node.  Add our timings.
						cur[letter]["|"] = value;
					}
					else {
						// continue onwards
						cur = cur[letter];
					}
				}
			}
		}

		return trie;
	}

	/**
	 * Optimize the Trie by combining branches with no leaf
	 *
	 * @param {object} cur Current Trie branch
	 * @param {boolean} top Whether or not this is the root node
	 *
	 * @returns {object} Optimized Trie
	 */
	function optimizeTrie(cur, top) {
		var num = 0, node, ret, topNode;

		// capture trie keys first as we'll be modifying it
		var keys = [];

		for (node in cur) {
			if (cur.hasOwnProperty(node)) {
				keys.push(node);
			}
		}

		for (var i = 0; i < keys.length; i++) {
			node = keys[i];
			if (typeof cur[node] === "object") {
				// optimize children
				ret = optimizeTrie(cur[node], false);
				if (ret) {
					// swap the current leaf with compressed one
					delete cur[node];

					if (node === XSS_BREAK_DELIM) {
						// If this node is a newline, which can't be in a regular URL,
						// it's due to the XSS patch.  Remove the placeholder character,
						// and make sure this node isn't compressed by incrementing
						// num to be greater than one.
						node = ret.name;
						num++;
					}
					else {
						node = node + ret.name;
					}
					cur[node] = ret.value;
				}
			}
			num++;
		}

		if (num === 1) {
			// compress single leafs
			if (top) {
				// top node gets special treatment so we're not left with a {node:,value:} at top
				topNode = {};
				topNode[node] = cur[node];
				return topNode;
			}
			else {
				// other nodes we return name and value separately
				return { name: node, value: cur[node] };
			}
		}
		else if (top) {
			// top node with more than 1 child, return it as-is
			return cur;
		}
		else {
			// more than two nodes and not the top, we can't compress any more
			return false;
		}
	}

	/**
	 * Trims the timing, returning an offset from the startTime in ms
	 *
	 * @param {number} time Time
	 * @param {number} startTime Start time
	 * @returns {number} Number of ms from start time
	 */
	function trimTiming(time, startTime) {
		if (typeof time !== "number") {
			time = 0;
		}

		if (typeof startTime !== "number") {
			startTime = 0;
		}

		// strip from microseconds to milliseconds only
		var timeMs = Math.round(time ? time : 0),
		    startTimeMs = Math.round(startTime ? startTime : 0);

		return timeMs === 0 ? 0 : (timeMs - startTimeMs);
	}

	/**
	 * Checks if the current execution context can access the specified frame.
	 *
	 * Note: In Safari, this will still produce a console error message, even
	 * though the exception is caught.

	 * @param {Window} frame The frame to check if access can haz
	 * @returns {boolean} true if true, false otherwise
	 */
	function isFrameAccessible(frame) {
		var dummy;

		try {
			// Try to access location.href first to trigger any Cross-Origin
			// warnings.  There's also a bug in Chrome ~48 that might cause
			// the browser to crash if accessing X-O frame.performance.
			// https://code.google.com/p/chromium/issues/detail?id=585871
			// This variable is not otherwise used.
			dummy = frame.location && frame.location.href;

			// Try to access frame.document to trigger X-O exceptions with that
			dummy = frame.document;

			if (("performance" in frame) && frame.performance) {
				return true;
			}
		}
		catch (e) {
			// empty
		}

		return false;
	}

	/**
	 * Attempts to get the navigationStart time for a frame.
	 * @returns navigationStart time, or 0 if not accessible
	 */
	function getNavStartTime(frame) {
		var navStart = 0;

		if (isFrameAccessible(frame) && frame.performance.timing && frame.performance.timing.navigationStart) {
			navStart = frame.performance.timing.navigationStart;
		}

		return navStart;
	}

	/**
	 * Gets all of the performance entries for a frame and its subframes
	 *
	 * @param {Frame} frame Frame
	 * @param {boolean} top This is the top window
	 * @param {string} offset Offset in timing from root IFRAME
	 * @param {number} depth Recursion depth
	 * @param {number[]} [frameDims] position and size of the frame if it is visible as returned by getVisibleEntries
	 * @returns {PerformanceEntry[]} Performance entries
	 */
	function findPerformanceEntriesForFrame(frame, isTopWindow, offset, depth, frameDims) {
		var entries = [], i, navEntries, navStart, frameNavStart, frameOffset, subFrames, subFrameDims,
		    navEntry, t, rtEntry, visibleEntries, scripts = {}, links = {}, a;

		if (typeof isTopWindow === "undefined") {
			isTopWindow = true;
		}

		if (typeof offset === "undefined") {
			offset = 0;
		}

		if (typeof depth === "undefined") {
			depth = 0;
		}

		if (depth > 10) {
			return entries;
		}

		try {
			if (!isFrameAccessible(frame)) {
				return entries;
			}

			navStart = getNavStartTime(frame);

			// gather visible entries on the page
			visibleEntries = getVisibleEntries(frame, frameDims);

			a = frame.document.createElement("a");

			// get all scripts as an object keyed on script.src
			collectResources(a, scripts, "script");
			collectResources(a, links, "link");

			subFrames = frame.document.getElementsByTagName("iframe");

			// get sub-frames' entries first
			if (subFrames && subFrames.length) {
				for (i = 0; i < subFrames.length; i++) {
					frameNavStart = getNavStartTime(subFrames[i].contentWindow);
					frameOffset = 0;
					if (frameNavStart > navStart) {
						frameOffset = offset + (frameNavStart - navStart);
					}

					a.href = subFrames[i].src;	// Get canonical URL

					entries = entries.concat(findPerformanceEntriesForFrame(subFrames[i].contentWindow, false, frameOffset, depth + 1, visibleEntries[a.href]));
				}
			}

			if (typeof frame.performance.getEntriesByType !== "function") {
				return entries;
			}

			function readServerTiming(entry) {
				return (impl.serverTiming && entry.serverTiming) || [];
			}

			// add an entry for the top page
			if (isTopWindow) {
				navEntries = frame.performance.getEntriesByType("navigation");
				if (navEntries && navEntries.length === 1) {
					navEntry = navEntries[0];

					// replace document with the actual URL
					entries.push({
						name: frame.location.href,
						startTime: 0,
						initiatorType: "html",
						redirectStart: navEntry.redirectStart,
						redirectEnd: navEntry.redirectEnd,
						fetchStart: navEntry.fetchStart,
						domainLookupStart: navEntry.domainLookupStart,
						domainLookupEnd: navEntry.domainLookupEnd,
						connectStart: navEntry.connectStart,
						secureConnectionStart: navEntry.secureConnectionStart,
						connectEnd: navEntry.connectEnd,
						requestStart: navEntry.requestStart,
						responseStart: navEntry.responseStart,
						responseEnd: navEntry.responseEnd,
						workerStart: navEntry.workerStart,
						encodedBodySize: navEntry.encodedBodySize,
						decodedBodySize: navEntry.decodedBodySize,
						transferSize: navEntry.transferSize,
						serverTiming: readServerTiming(navEntry)
					});
				}
				else if (frame.performance.timing) {
					// add a fake entry from the timing object
					t = frame.performance.timing;

					//
					// Avoid browser bugs:
					// 1. navigationStart being 0 in some cases
					// 2. responseEnd being ~2x what navigationStart is
					//    (ensure the end is within 60 minutes of start)
					//
					if (t.navigationStart !== 0 &&
						t.responseEnd <= (t.navigationStart + (60 * 60 * 1000))) {
						entries.push({
							name: frame.location.href,
							startTime: 0,
							initiatorType: "html",
							redirectStart: t.redirectStart ? (t.redirectStart - t.navigationStart) : 0,
							redirectEnd: t.redirectEnd ? (t.redirectEnd - t.navigationStart) : 0,
							fetchStart: t.fetchStart ? (t.fetchStart - t.navigationStart) : 0,
							domainLookupStart: t.domainLookupStart ? (t.domainLookupStart - t.navigationStart) : 0,
							domainLookupEnd: t.domainLookupEnd ? (t.domainLookupEnd - t.navigationStart) : 0,
							connectStart: t.connectStart ? (t.connectStart - t.navigationStart) : 0,
							secureConnectionStart: t.secureConnectionStart ? (t.secureConnectionStart - t.navigationStart) : 0,
							connectEnd: t.connectEnd ? (t.connectEnd - t.navigationStart) : 0,
							requestStart: t.requestStart ? (t.requestStart - t.navigationStart) : 0,
							responseStart: t.responseStart ? (t.responseStart - t.navigationStart) : 0,
							responseEnd: t.responseEnd ? (t.responseEnd - t.navigationStart) : 0
						});
					}
				}
			}

			// offset all of the entries by the specified offset for this frame
			var frameEntries = frame.performance.getEntriesByType("resource"),
			    frameFixedEntries = [];
			if (frame === BOOMR.window && impl.collectedEntries) {
				Array.prototype.push.apply(frameEntries, impl.collectedEntries);
				impl.collectedEntries = [];
			}

			for (i = 0; frameEntries && i < frameEntries.length; i++) {
				t = frameEntries[i];
				rtEntry = {
					name: t.name,
					initiatorType: t.initiatorType,
					encodedBodySize: t.encodedBodySize,
					decodedBodySize: t.decodedBodySize,
					transferSize: t.transferSize,
					serverTiming: readServerTiming(t),
					visibleDimensions: visibleEntries[t.name],
					latestTime: getResourceLatestTime(t)
				};
				for (var field = 0; field < RT_FIELDS_TIMESTAMPS.length; field++) {
					var key = RT_FIELDS_TIMESTAMPS[field];
					rtEntry[key] = ((key === "startTime") || t[key]) ? (t[key] + offset) : 0;
				}

				if (t.hasOwnProperty("_data")) {
					rtEntry._data = t._data;
				}

				// If this is a script, set its flags
				if ((t.initiatorType === "script" || t.initiatorType === "link") && scripts[t.name]) {
					var s = scripts[t.name];

					// Add async & defer based on attribute values
					rtEntry.scriptAttrs = (s.async ? ASYNC_ATTR : 0) | (s.defer ? DEFER_ATTR : 0);

					while (s.nodeType === 1 && s.nodeName !== "BODY") {
						s = s.parentNode;
					}

					// Add location by traversing up the tree until we either hit BODY or document
					rtEntry.scriptAttrs |= (s.nodeName === "BODY" ? LOCAT_ATTR : 0);
				}

				// If this is a link, set its flags
				if (t.initiatorType === "link" && links[t.name]) {
					// split on ASCII whitespace
					BOOMR.utils.arrayFind(links[t.name].rel.split(/[\u0009\u000A\u000C\u000D\u0020]+/), function(rel) { //eslint-disable-line no-loop-func
						// `rel`s are case insensitive
						rel = rel.toLowerCase();

						// only report the `rel` if it's from the known list
						if (REL_TYPES[rel]) {
							rtEntry.linkAttrs = REL_TYPES[rel];
							return true;
						}
					});
				}

				frameFixedEntries.push(rtEntry);
			}

			entries = entries.concat(frameFixedEntries);
		}
		catch (e) {
			return entries;
		}

		return entries;
	}

	/**
	 * Collect external resources by tagName
	 *
	 * @param {Element} a an anchor element
	 * @param {Object} obj object of resources where the key is the url
	 * @param {string} tagName tag name to collect
	 */
	function collectResources(a, obj, tagName) {
		Array.prototype
			.forEach
			.call(a.ownerDocument.getElementsByTagName(tagName), function(r) {
				// Get canonical URL
				a.href = r.currentSrc ||
					r.src ||
					(typeof r.getAttribute === "function" && r.getAttribute("xlink:href")) ||
					r.href;

				// only get external resource
				if (a.href.match(/^https?:\/\//)) {
					obj[a.href] = r;
				}
			});
	}

	/**
	 * Converts a number to base-36.
	 *
	 * If not a number or a string, or === 0, return "". This is to facilitate
	 * compression in the timing array, where "blanks" or 0s show as a series
	 * of trailing ",,,," that can be trimmed.
	 *
	 * If a string, return a string.
	 *
	 * @param {number} n Number
	 * @returns {string} Base-36 number, empty string, or string
	 */
	function toBase36(n) {
		return (typeof n === "number" && n !== 0) ?
			n.toString(36) :
			(typeof n === "string" ? n : "");
	}

	/**
	 * Finds all remote resources in the selected window that are visible, and returns an object
	 * keyed by the url with an array of height,width,top,left as the value
	 *
	 * @param {Window} win Window to search
	 * @param {number[]} [winDims] position and size of the window if it is an embedded iframe in the format returned by this function
	 * @returns {Object} Object with URLs of visible assets as keys, and Array[height, width, top, left, naturalHeight, naturalWidth] as value
	 */
	function getVisibleEntries(win, winDims) {
		// lower-case tag names should be used: https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
		var els = ["img", "iframe", "image"], entries = {}, x, y, doc = win.document, a = doc.createElement("A");

		winDims = winDims || [0, 0, 0, 0];

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
		x = winDims[3] + (win.pageXOffset !== undefined) ? win.pageXOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollLeft;
		y = winDims[2] + (win.pageYOffset !== undefined) ? win.pageYOffset : (doc.documentElement || doc.body.parentNode || doc.body).scrollTop;

		// look at each IMG and IFRAME
		els.forEach(function(elname) {
			var elements = doc.getElementsByTagName(elname), el, i, rect, src, realImg, nH, nW;

			for (i = 0; i < elements.length; i++) {
				el = elements[i];

				if (!el) {
					continue;
				}

				// look at this element if it has a src attribute or xlink:href, and we haven't already looked at it
				// currentSrc = IMG inside a PICTURE element or IMG srcset
				// src = IMG, IFRAME
				// xlink:href = svg:IMAGE
				src = el.currentSrc ||
					el.src ||
					(typeof el.getAttribute === "function" &&
						(el.getAttribute("src")) || el.getAttribute("xlink:href"));

				// make src absolute
				a.href = src;
				src = a.href;

				if (!src || entries[src]) {
					continue;
				}

				rect = el.getBoundingClientRect();

				// Require both height & width to be non-zero
				// IE <= 8 does not report rect.height/rect.width so we need offsetHeight & width
				if ((rect.height || el.offsetHeight) && (rect.width || el.offsetWidth)) {
					entries[src] = [
						rect.height || el.offsetHeight,
						rect.width || el.offsetWidth,
						Math.round(rect.top + y),
						Math.round(rect.left + x)
					];

					// If this is an image, it has a naturalHeight & naturalWidth
					// if these are different from its display height and width, we should report that
					// because it indicates scaling in HTML
					if (!el.naturalHeight && !el.naturalWidth) {
						continue;
					}

					// If the image came from a srcset, then the naturalHeight/Width will be density corrected.
					// We get the actual physical dimensions by assigning the image to an uncorrected Image object.
					// In most cases, this should load from in-memory cache, so there should be no extra load.
					// When the original image's caching is disabled, this will cause the image to be
					// re-downloaded which can cause issues with capchas.
					if (impl.getSrcsetDimensions && el.currentSrc && (el.srcset || (el.parentNode && el.parentNode.nodeName && el.parentNode.nodeName.toUpperCase() === "PICTURE"))) {
						// We need to create this Image in the window that contains the element, and not
						// the boomerang window.
						realImg = el.isConnected ? el.ownerDocument.createElement("IMG") : new BOOMR.window.Image();
						realImg.src = src;
					}
					else {
						realImg = el;
					}

					nH = realImg.naturalHeight || el.naturalHeight;
					nW = realImg.naturalWidth  || el.naturalWidth;

					if ((nH || nW) && (entries[src][0] !== nH || entries[src][1] !== nW)) {
						entries[src].push(nH, nW);
					}
				}
			}
		});

		return entries;
	}

	/**
	 * Gathers a filtered list of performance entries.
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 * @param {string[]} initiatorTypes Array of initiator types
	 *
	 * @returns {ResourceTiming[]} Matching ResourceTiming entries
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function getFilteredResourceTiming(from, to, initiatorTypes) {
		var entries = findPerformanceEntriesForFrame(BOOMR.window, true, 0, 0),
		    i, e,
		    navStart = getNavStartTime(BOOMR.window), countCollector = {};

		if (!entries || !entries.length) {
			return {
				entries: []
			};
		}

		// sort entries by start time
		entries.sort(function(a, b) {
			return a.startTime - b.startTime;
		});

		var filteredEntries = [];
		for (i = 0; i < entries.length; i++) {
			e = entries[i];

			// skip non-resource URLs
			if (e.name.indexOf("http:") !== 0 &&
			    e.name.indexOf("https:") !== 0) {
				continue;
			}

			// skip boomerang.js and config URLs
			if (e.name.indexOf(BOOMR.url) > -1 ||
			    e.name.indexOf(BOOMR.config_url) > -1 ||
			    (typeof BOOMR.getBeaconURL === "function" && BOOMR.getBeaconURL() && e.name.indexOf(BOOMR.getBeaconURL()) > -1)) {
				continue;
			}

			// if the user specified a "from" time, skip resources that started before then
			if (from && (navStart + e.startTime) < from) {
				continue;
			}

			// if we were given a final timestamp, don't add any resources that started after it
			if (to && (navStart + e.startTime) > to) {
				// We can also break at this point since the array is time sorted
				break;
			}

			// if given an array of initiatorTypes to include, skip anything else
			if (typeof initiatorTypes !== "undefined" && initiatorTypes !== "*" && initiatorTypes.length) {
				if (!e.initiatorType || !BOOMR.utils.inArray(e.initiatorType, initiatorTypes)) {
					continue;
				}
			}

			accumulateServerTimingEntries(countCollector, e.serverTiming);
			filteredEntries.push(e);
		}

		var lookup = compressServerTiming(countCollector);
		return {
			entries: filteredEntries,
			serverTiming: {
				lookup: lookup,
				indexed: indexServerTiming(lookup)
			}
		};
	}

	/**
	 * Gets compressed content and transfer size information, if available
	 *
	 * @param {ResourceTiming} resource ResourceTiming object
	 *
	 * @returns {string} Compressed data (or empty string, if not available)
	 */
	function compressSize(resource) {
		var sTrans, sEnc, sDec, sizes;

		// check to see if we can add content sizes
		if (resource.encodedBodySize ||
			resource.decodedBodySize ||
			resource.transferSize) {
			//
			// transferSize: how many bytes were over the wire. It can be 0 in the case of X-O,
			// or if it was fetched from a cache.
			//
			// encodedBodySize: the size after applying encoding (e.g. gzipped size).  It is 0 if X-O or no content (eg: beacon).
			//
			// decodedBodySize: the size after removing encoding (e.g. the original content size).  It is 0 if X-O or no content (eg: beacon).
			//
			// Here are the possible combinations of values: [encodedBodySize, transferSize, decodedBodySize]
			//
			// Cross-Origin resources w/out Timing-Allow-Origin set: [0, 0, 0] -> [0, 0, 0] -> [empty]
			// 204: [0, t, 0] -> [0, t, 0] -> [e, t-e] -> [, t]
			// 304: [e, t: t <=> e, d: d>=e] -> [e, t-e, d-e]
			// 200 non-gzipped: [e, t: t>=e, d: d=e] -> [e, t-e]
			// 200 gzipped: [e, t: t>=e, d: d>=e] -> [e, t-e, d-e]
			// retrieved from cache non-gzipped: [e, 0, d: d=e] -> [e]
			// retrieved from cache gzipped: [e, 0, d: d>=e] -> [e, _, d-e]
			//
			sTrans = resource.transferSize;
			sEnc = resource.encodedBodySize;
			sDec = resource.decodedBodySize;

			// convert to an array
			sizes = [sEnc, sTrans ? sTrans - sEnc : "_", sDec ? sDec - sEnc : 0];

			// change everything to base36 and remove any trailing ,s
			return sizes.map(toBase36).join(",").replace(/,+$/, "");
		}
		else {
			return "";
		}
	}


	/**
	 * Trims the URL according to the specified URL trim patterns,
	 * then applies a length limit.
	 *
	 * @param {string} url URL to trim
	 * @param {string} urlsToTrim List of URLs (strings or regexs) to trim
	 * @returns {string} Trimmed URL
	 */
	function trimUrl(url, urlsToTrim) {
		var i, urlIdx, trim;

		if (url && urlsToTrim) {
			// trim the payload from any of the specified URLs
			for (i = 0; i < urlsToTrim.length; i++) {
				trim = urlsToTrim[i];

				if (typeof trim === "string") {
					urlIdx = url.indexOf(trim);
					if (urlIdx !== -1) {
						url = url.substr(0, urlIdx + trim.length) + "...";
						break;
					}
				}
				else if (trim instanceof RegExp) {
					if (trim.test(url)) {
						// replace the URL with the first capture group
						url = url.replace(trim, "$1") + "...";
					}
				}
			}
		}

		// apply limits
		return BOOMR.utils.cleanupURL(url, impl.urlLimit);
	}

	/**
	 * Get the latest timepoint for this resource from ResourceTiming. If the resource hasn't started downloading yet, return Infinity
	 * @param {PerformanceResourceEntry} res The resource entry to get the latest time for
	 * @returns {number} latest timepoint for the resource or now if the resource is still in progress
	 */
	function getResourceLatestTime(res) {
		// If responseEnd is non zero, return it
		if (res.responseEnd) {
			return res.responseEnd;
		}

		// If responseStart is non zero, assume it accounts for 80% of the load time, and bump it by 20%
		if (res.responseStart && res.startTime) {
			return res.responseStart + (res.responseStart - res.startTime) * 0.2;
		}

		// If the resource hasn't even started loading, assume it will come at some point in the distant future (after the beacon)
		// we'll let the server determine what to do
		return Infinity;
	}

	/**
	 * Given a 2D array representing the screen and a list of rectangular dimension tuples, turn on the screen pixels that match the dimensions.
	 * Previously set pixels that are also set with the current call will be overwritten with the new value of pixelValue
	 * @param {number[][]} currentPixels A 2D sparse array of numbers representing set pixels or undefined if no pixels are currently set.
	 * @param {number[][]} dimList A list of rectangular dimension tuples in the form [height, width, top, left] for resources to be painted on the virtual screen
	 * @param {number} pixelValue The numeric value to set all new pixels to
	 * @returns {number[][]} An updated version of currentPixels.
	 */
	function mergePixels(currentPixels, dimList, pixelValue) {
		var s = BOOMR.window.screen,
		    h = s.height, w = s.width;

		return dimList.reduce(
			function(acc, val) {
				var x_min, x_max,
				    y_min, y_max,
				    x, y;

				x_min = Math.max(0, val[3]);
				y_min = Math.max(0, val[2]);
				x_max = Math.min(val[3] + val[1], w);
				y_max = Math.min(val[2] + val[0], h);

				// Object is off-screen
				if (x_min >= x_max || y_min >= y_max) {
					return acc;
				}

				// We fill all pixels of this resource with a true
				// this is needed to correctly account for overlapping resources
				for (y = y_min; y < y_max; y++) {
					if (!acc[y]) {
						acc[y] = [];
					}

					for (x = x_min; x < x_max; x++) {
						acc[y][x] = pixelValue;
					}
				}

				return acc;
			},
			currentPixels || []
		);
	}

	/**
	 * Counts the number of pixels that are set in the given 2D array representing the screen
	 * @param {number[][]} pixels A 2D boolean array representing the screen with painted pixels set to true
	 * @param {number} [rangeMin] If included, will only count pixels >= this value
	 * @param {number} [rangeMax] If included, will only count pixels <= this value
	 * @returns {number} The number of pixels set in the passed in array
	 */
	function countPixels(pixels, rangeMin, rangeMax) {
		rangeMin = rangeMin || 0;
		rangeMax = rangeMax || Infinity;

		return pixels
			.reduce(function(acc, val) {
				return acc +
					val.filter(function(v) {
						return rangeMin <= v && v <= rangeMax;
					}).length;
			},
			0
		);
	}

	/**
	 * Returns a compressed string representation of a hash of timepoints to painted pixel count and finalized pixel count.
	 * - Timepoints are reduced to milliseconds relative to the previous timepoint while pixel count is reduced to pixels relative to the previous timepoint. Finalized pixels are reduced to be relative (negated) to full pixels for that timepoint
	 * - The relative timepoint and relative pixels are then each Base36 encoded and combined with a ~
	 * - Finally, the list of timepoints is merged, separated by ! and returned
	 * @param {object} timePoints An object in the form { "<timePoint>" : [ <object dimensions>, <object dimensions>, ...], <timePoint>: [...], ...}, where <object dimensions> is [height, width, top, left]
	 * @returns {string} The serialized compressed timepoint object with ! separating individual triads and ~ separating timepoint and pixels within the triad. The elements of the triad are the timePoint, number of pixels painted at that point, and the number of pixels finalized at that point (ie, no further paints). If the third part of the triad is 0, it is omitted, if the second part of the triad is 0, it is omitted and the repeated ~~ is replaced with a -
	 */
	function getOptimizedTimepoints(timePoints) {
		var i, roundedTimePoints = {}, timeSequence, tPixels,
		    t_prev, t, p_prev, p, f_prev, f,
		    comp, result = [];

		// Round timepoints to the nearest integral ms
		timeSequence = Object.keys(timePoints);

		for (i = 0; i < timeSequence.length; i++) {
			t = Math.round(Number(timeSequence[i]));
			if (typeof roundedTimePoints[t] === "undefined") {
				roundedTimePoints[t] = [];
			}

			// Merge
			Array.prototype.push.apply(roundedTimePoints[t], timePoints[timeSequence[i]]);
		}

		// Get all unique timepoints nearest ms sorted in ascending order
		timeSequence = Object.keys(roundedTimePoints).map(Number).sort(function(a, b) { return a - b; });

		if (timeSequence.length === 0) {
			return {};
		}

		// First loop identifies pixel first paints
		for (i = 0; i < timeSequence.length; i++) {
			t = timeSequence[i];
			tPixels = mergePixels(tPixels, roundedTimePoints[t], t);

			p = countPixels(tPixels);
			timeSequence[i] = [t, p];
		}

		// We'll make all times and pixel counts relative to the previous ones
		t_prev = 0;
		p_prev = 0;
		f_prev = 0;

		// Second loop identifies pixel final paints
		for (i = 0; i < timeSequence.length; i++) {
			t = timeSequence[i][0];
			p = timeSequence[i][1];
			f = countPixels(tPixels, 0, t);

			if (p > p_prev || f > f_prev) {
				comp = (t === Infinity ? "" : toBase36(Math.round(t - t_prev))) + "~" + toBase36(p - p_prev) + "~" + toBase36(p - f);

				comp = comp.replace(/~~/, "-").replace(/~$/, "");

				result.push(comp);

				t_prev = t;
				p_prev = p;
				f_prev = f;
			}
		}

		return result.join("!").replace(/!+$/, "");
	}

	/**
	 * Gathers performance entries and compresses the result.
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 *
	 * @returns {object} An object containing the Optimized performance entries trie and
	 * the optimized server timing lookup
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function getCompressedResourceTiming(from, to) {
		/*eslint no-script-url:0*/
		var i, e, results = {}, initiatorType, url, data, timePoints = {};

		var ret = getFilteredResourceTiming(from, to, impl.trackedResourceTypes);
		var entries = ret.entries, serverTiming = ret.serverTiming;

		if (!entries || !entries.length) {
			return {
				restiming: {},
				servertiming: []
			};
		}

		for (i = 0; i < entries.length; i++) {
			e = entries[i];

			//
			// Compress the RT data into a string:
			//
			// 1. Start with the initiator type, which is mapped to a number.
			// 2. Put the timestamps into an array in a set order (reverse chronological order),
			//    which pushes timestamps that are more likely to be zero (duration since
			//    startTime) towards the end of the array (eg redirect* and domainLookup*).
			// 3. Convert these timestamps to Base36, with empty or zero times being an empty string
			// 4. Join the array on commas
			// 5. Trim all trailing empty commas (eg ",,,")
			//

			// prefix initiatorType to the string
			initiatorType = INITIATOR_TYPES[e.initiatorType];
			if (typeof initiatorType === "undefined") {
				initiatorType = 0;
			}

			data = initiatorType + [
				trimTiming(e.startTime, 0),
				trimTiming(e.responseEnd, e.startTime),
				trimTiming(e.responseStart, e.startTime),
				trimTiming(e.requestStart, e.startTime),
				trimTiming(e.connectEnd, e.startTime),
				trimTiming(e.secureConnectionStart, e.startTime),
				trimTiming(e.connectStart, e.startTime),
				trimTiming(e.domainLookupEnd, e.startTime),
				trimTiming(e.domainLookupStart, e.startTime),
				trimTiming(e.redirectEnd, e.startTime),
				trimTiming(e.redirectStart, e.startTime)
			].map(toBase36).join(",").replace(/,+$/, ""); // this `replace()` removes any trailing commas

			// add content and transfer size info
			var compSize = compressSize(e);
			if (compSize !== "") {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SIZE_TYPE + compSize;
			}

			if (e.hasOwnProperty("scriptAttrs")) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SCRIPT_ATTR_TYPE + e.scriptAttrs;
			}

			if (e.serverTiming && e.serverTiming.length) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_SERVERTIMING_TYPE +
					e.serverTiming.reduce(function(stData, entry, entryIndex) {
						// The numeric of the entry is `value` for Chrome 61, `duration` after that
						var duration = String(typeof entry.duration !== "undefined" ? entry.duration : entry.value);
						if (duration.substring(0, 2) === "0.") {
							// lop off the leading 0
							duration = duration.substring(1);
						}
						// The name of the entry is `metric` for Chrome 61, `name` after that
						var name = entry.name || entry.metric;
						var lookupKey = identifyServerTimingEntry(serverTiming.indexed[name].index,
							serverTiming.indexed[name].descriptions[entry.description]);
						stData += (entryIndex > 0 ? "," : "") + duration + lookupKey;
						return stData;
					}, "");
			}

			if (e.hasOwnProperty("linkAttrs")) {
				data += SPECIAL_DATA_PREFIX + SPECIAL_DATA_LINK_ATTR_TYPE + e.linkAttrs;
			}

			url = trimUrl(e.name, impl.trimUrls);

			if (!e.hasOwnProperty("_data")) {
				// if this entry already exists, add a pipe as a separator
				if (results[url] !== undefined) {
					results[url] += "|" + data;
				}
				else if (e.visibleDimensions) {
					// We use * as an additional separator to indicate it is not a new resource entry
					// The following characters will not be URL encoded:
					// *!-.()~_ but - and . are special to number representation so we don't use them
					// After the *, the type of special data (ResourceTiming = 0) is added
					results[url] =
						SPECIAL_DATA_PREFIX +
						SPECIAL_DATA_DIMENSION_TYPE +
						e.visibleDimensions.map(Math.round).map(toBase36).join(",").replace(/,+$/, "") +
						"|" +
						data;
				}
				else {
					results[url] = data;
				}
			}
			else {
				var namespacedData = "";
				for (var key in e._data) {
					if (e._data.hasOwnProperty(key)) {
						namespacedData += SPECIAL_DATA_PREFIX + SPECIAL_DATA_NAMESPACED_TYPE + key + ":" + e._data[key];
					}
				}

				if (typeof results[url] === "undefined") {
					// we haven't seen this resource yet, treat this potential stub as the canonical version
					results[url] = data + namespacedData;
				}
				else {
					// we have seen this resource before
					// forget the timing data of `e`, just supplement the previous entry with the new `namespacedData`
					results[url] += namespacedData;
				}
			}

			if (e.visibleDimensions) {
				if (!timePoints[e.latestTime]) {
					timePoints[e.latestTime] = [];
				}
				timePoints[e.latestTime].push(e.visibleDimensions);
			}
		}

		return {
			restiming: optimizeTrie(convertToTrie(results, impl.splitAtPath), true),
			servertiming: serverTiming.lookup
		};
	}

	/**
	 * Compresses an array of ResourceTiming-like objects (those with a fetchStart
	 * and a responseStart/responseEnd) by reducing multiple objects with the same
	 * fetchStart down to a single object with the longest duration.
	 *
	 * Array must be pre-sorted by fetchStart, then by responseStart||responseEnd
	 *
	 * @param {ResourceTiming[]} resources ResourceTiming-like resources, with just
	 *  a fetchStart and responseEnd
	 *
	 * @returns Duration, in milliseconds
	 */
	function reduceFetchStarts(resources) {
		var times = [];

		if (!resources || !resources.length) {
			return times;
		}

		for (var i = 0; i < resources.length; i++) {
			var res = resources[i];

			// if there is a subsequent resource with the same fetchStart, use
			// its value instead (since pre-sort guarantee is that it's end
			// will be >= this one)
			if (i !== resources.length - 1 &&
				res.fetchStart === resources[i + 1].fetchStart) {
				continue;
			}

			// track just the minimum fetchStart and responseEnd
			times.push({
				fetchStart: res.fetchStart,
				responseEnd: res.responseStart || res.responseEnd
			});
		}

		return times;
	}

	/**
	 * Calculates the union of durations of the specified resources.  If
	 * any resources overlap, those timeslices are not double-counted.
	 *
	 * @param {ResourceTiming[]} resources Resources
	 *
	 * @returns Duration, in milliseconds
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function calculateResourceTimingUnion(resources) {
		var i;

		if (!resources || !resources.length) {
			return 0;
		}

		// First, sort by start time, then end time
		resources.sort(function(a, b) {
			if (a.fetchStart !== b.fetchStart) {
				return a.fetchStart - b.fetchStart;
			}
			else {
				var ae = a.responseStart || a.responseEnd;
				var be = b.responseStart || b.responseEnd;

				return ae - be;
			}
		});

		// Next, find all resources with the same start time, and reduce
		// them to the largest end time.
		var times = reduceFetchStarts(resources);

		// Third, for every resource, if the start is less than the end of
		// any previous resource, change its start to the end.  If the new start
		// time is more than the end time, we can discard this one.
		var times2 = [];
		var furthestEnd = 0;

		for (i = 0; i < times.length; i++) {
			var res = times[i];

			if (res.fetchStart < furthestEnd) {
				res.fetchStart = furthestEnd;
			}

			// as long as this resource has > 0 duration, add it to our next list
			if (res.fetchStart < res.responseEnd) {
				times2.push(res);

				// keep track of the furthest end point
				furthestEnd = res.responseEnd;
			}
		}

		// Reduce down again to same start times again, and now we should
		// have no overlapping regions
		var times3 = reduceFetchStarts(times2);

		// Finally, calculate the overall time from our non-overlapping regions
		var totalTime = 0;
		for (i = 0; i < times3.length; i++) {
			totalTime += times3[i].responseEnd - times3[i].fetchStart;
		}

		return totalTime;
	}

	/**
	 * Adds 'restiming' and 'servertiming' to the beacon
	 *
	 * @param {number} from Only get timings from
	 * @param {number} to Only get timings up to
	 *
	 * @memberof BOOMR.plugins.ResourceTiming
	 */
	function addResourceTimingToBeacon(from, to) {
		var r;

		// Can't send if we don't support JSON
		if (typeof JSON === "undefined") {
			return;
		}


		r = getCompressedResourceTiming(from, to);


		if (r) {
			BOOMR.info("Client supports Resource Timing API", "restiming");
			addToBeacon(r);
		}
	}

	/**
	 * Given an array of server timing entries (from the resource timing entry),
	 * [initialize and] increment our count collector of the following format: {
	 *   "metric-one": {
	 *     count: 3,
	 *     counts: {
	 *       "description-one": 2,
	 *       "description-two": 1,
	 *     }
	 *   }
	 * }
	 *
	 * @param {Object} countCollector Per-beacon collection of counts
	 * @param {Array} serverTimingEntries Server Timing Entries from a Resource Timing Entry
	 * @returns nothing
	 */
	function accumulateServerTimingEntries(countCollector, serverTimingEntries) {
		(serverTimingEntries || []).forEach(function(entry) {
			var name = entry.name || entry.metric;
			if (typeof countCollector[name] === "undefined") {
				countCollector[name] = {
					count: 0,
					counts: {}
				};
			}
			var metric = countCollector[name];
			metric.counts[entry.description] = metric.counts[entry.description] || 0;
			metric.counts[entry.description]++;
			metric.count++;
		});
	}

	/**
	 * Given our count collector of the format: {
	 *   "metric-two": {
	 *     count: 1,
	 *     counts: {
	 *       "description-three": 1,
	 *     }
	 *   },
	 *   "metric-one": {
	 *     count: 3,
	 *     counts: {
	 *       "description-one": 1,
	 *       "description-two": 2,
	 *     }
	 *   }
	 * }
	 *
	 * , return the lookup of the following format: [
	 *   ["metric-one", "description-two", "description-one"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * Note: The order of these arrays of arrays matters: there are more server timing entries with
	 * name === "metric-one" than "metric-two", and more "metric-one"/"description-two" than
	 * "metric-one"/"description-one".
	 *
	 * @param {Object} countCollector Per-beacon collection of counts
	 * @returns {Array} compressed lookup array
	 */
	function compressServerTiming(countCollector) {
		return Object.keys(countCollector).sort(function(metric1, metric2) {
			return countCollector[metric2].count - countCollector[metric1].count;
		}).reduce(function(array, name) {
			var sorted = Object.keys(countCollector[name].counts).sort(function(description1, description2) {
				return countCollector[name].counts[description2] -
					countCollector[name].counts[description1];
			});

			array.push(sorted.length === 1 && sorted[0] === "" ?
				name : // special case: no non-empty descriptions
				[name].concat(sorted));
			return array;
		}, []);
	}

	/**
	 * Given our lookup of the format: [
	 *   ["metric-one", "description-one", "description-two"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * , create a O(1) name/description to index values lookup dictionary of the format: {
	 *   metric-one: {
	 *     index: 0,
	 *     descriptions: {
	 *       "description-one": 0,
	 *       "description-two": 1,
	 *     }
	 *   }
	 *   metric-two: {
	 *     index: 1,
	 *     descriptions: {
	 *       "description-three": 0,
	 *     }
	 *   }
	 * }
	 *
	 * @param {Array} lookup compressed lookup array
	 * @returns {Object} indexed version of the compressed lookup array
	 */
	function indexServerTiming(lookup) {
		return lookup.reduce(function(serverTimingIndex, compressedEntry, entryIndex) {
			var name, descriptions;
			if (Array.isArray(compressedEntry)) {
				name = compressedEntry[0];
				descriptions = compressedEntry.slice(1).reduce(function(descriptionCollector, description, descriptionIndex) {
					descriptionCollector[description] = descriptionIndex;
					return descriptionCollector;
				}, {});
			}
			else {
				name = compressedEntry;
				descriptions = {
					"": 0
				};
			}

			serverTimingIndex[name] = {
				index: entryIndex,
				descriptions: descriptions
			};
			return serverTimingIndex;
		}, {});
	}

	/**
	 * Given entryIndex and descriptionIndex, create the shorthand key into the lookup
	 * response format is ":<entryIndex>.<descriptionIndex>"
	 * either/both entryIndex or/and descriptionIndex can be omitted if equal to 0
	 * the "." can be ommited if descriptionIndex is 0
	 * the ":" can be ommited if entryIndex and descriptionIndex are 0
	 *
	 * @param {Integer} entryIndex index of the entry
	 * @param {Integer} descriptionIndex index of the description
	 * @returns {String} key into the compressed lookup
	 */
	function identifyServerTimingEntry(entryIndex, descriptionIndex) {
		var s = "";
		if (entryIndex) {
			s += entryIndex;
		}
		if (descriptionIndex) {
			s += "." + descriptionIndex;
		}
		if (s.length) {
			s = ":" + s;
		}
		return s;
	}

	/**
	 * Adds optimized performance entries trie and (conditionally) the optimized server timing lookup to the beacon
	 *
	 * @param {Object} r An object containing the optimized performance entries trie and the optimized server timing
	 *  lookup
	 */
	function addToBeacon(r) {
		BOOMR.addVar("restiming", JSON.stringify(r.restiming), true);

		if (r.servertiming.length) {
			BOOMR.addVar("servertiming", BOOMR.utils.serializeForUrl(r.servertiming), true);
		}
	}

	/**
	 * Given our lookup of the format: [
	 *   ["metric-one", "description-one", "description-two"],
	 *   ["metric-two", "description-three"],
	 * ]
	 *
	 * , and a key of the format: duration:entryIndex.descriptionIndex,
	 * return the decompressed server timing entry (name, duration, description)
	 *
	 * Note: code only included as POC
	 *
	 * @param {Array} lookup compressed lookup array
	 * @param {Integer} key key into the compressed lookup
	 * @returns {Object} decompressed resource timing entry (name, duration, description)
	 */

	impl = {
		complete: false,
		sentNavBeacon: false,
		initialized: false,
		supported: null,
		xhr_load: function() {
			if (this.complete) {
				return;
			}

			// page load might not have happened, or will happen later, so
			// set us as complete so we don't hold the page load
			this.complete = true;
			BOOMR.sendBeacon();
		},
		xssBreakWords: DEFAULT_XSS_BREAK_WORDS,
		urlLimit: DEFAULT_URL_LIMIT,

		// overridable
		clearOnBeacon: false,
		trimUrls: [],
		serverTiming: true,
		monitorClearResourceTimings: false,
		splitAtPath: false,
		getSrcsetDimensions: false,
		// overridable

		/**
		 * Array of resource types to track, or "*" for all.
		 *  @type {string[]|string}
		 */
		trackedResourceTypes: "*",
		done: function() {
			// Stop if we've already sent a nav beacon (both xhr and spa* beacons
			// add restiming manually).
			if (this.sentNavBeacon) {
				return;
			}

			addResourceTimingToBeacon();

			this.complete = true;
			this.sentNavBeacon = true;

			BOOMR.sendBeacon();
		},

		onBeacon: function(vars) {
			var p = BOOMR.getPerformance();

			if (impl.clearOnBeacon && p) {
				var clearResourceTimings = p.clearResourceTimings || p.webkitClearResourceTimings;
				if (clearResourceTimings && typeof clearResourceTimings === "function") {
					clearResourceTimings.call(p);
				}
			}
		},

		prerenderToVisible: function() {
			// ensure we add our data to the beacon even if we had added it
			// during prerender (in case another beacon went out in between)
			this.sentNavBeacon = false;

			// add our data to the beacon
			this.done();
		}
	};

	BOOMR.plugins.ResourceTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string[]} [config.ResourceTiming.xssBreakWorks] Words that will be broken (by
		 * ensuring the optimized trie doesn't contain the whole string) in URLs,
		 * to ensure NoScript doesn't think this is an XSS attack.
		 *
		 * Defaults to `DEFAULT_XSS_BREAK_WORDS`.
		 * @param {boolean} [config.ResourceTiming.clearOnBeacon] Whether or not to clear ResourceTiming
		 * data on each beacon.
		 * @param {number} [config.ResourceTiming.urlLimit] URL length limit, after which `...` will be used
		 * @param {string[]|RegExp[]} [config.ResourceTiming.trimUrls] List of strings of RegExps
		 * to trim from URLs.
		 * @param {boolean} [config.ResourceTiming.monitorClearResourceTimings] Whether or not to instrument
		 * `performance.clearResourceTimings`.
		 * @param {boolean} [config.ResourceTiming.splitAtPath] Whether or not to split the ResourceTiming
		 * compressed Trie at the path separator (faster processing, but larger result).
		 * @param {boolean} [config.ResourceTiming.getSrcsetDimensions] Whether or not to collect physical
		 * dimensions of srcset images. Setting this will cause uncacheable images to be re-downloaded.
		 *
		 * @returns {@link BOOMR.plugins.ResourceTiming} The ResourceTiming plugin for chaining
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "ResourceTiming",
				["xssBreakWords", "clearOnBeacon", "urlLimit", "trimUrls", "trackedResourceTypes", "serverTiming",
					"monitorClearResourceTimings", "splitAtPath", "getSrcsetDimensions"]);

			if (impl.initialized) {
				return this;
			}

			if (this.is_supported()) {
				BOOMR.subscribe("page_ready", impl.done, null, impl);
				BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, null, impl);
				BOOMR.subscribe("xhr_load", impl.xhr_load, null, impl);
				BOOMR.subscribe("beacon", impl.onBeacon, null, impl);
				BOOMR.subscribe("before_unload", impl.done, null, impl);

				if (impl.monitorClearResourceTimings) {
					var self = this;
					BOOMR.window.performance.clearResourceTimings = (function(_){
						return function() {
							self.addResources(BOOMR.window.performance.getEntriesByType("resource"));
							_.apply(BOOMR.window.performance, arguments);
						};
					})(BOOMR.window.performance.clearResourceTimings);
				}
			}
			else {
				impl.complete = true;
			}

			impl.initialized = true;

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Whether or not this ResourceTiming is enabled and supported.
		 *
		 * @returns {boolean} `true` if ResourceTiming plugin is enabled.
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_enabled: function() {
			return impl.initialized && this.is_supported();
		},

		/**
		 * Whether or not ResourceTiming is supported in this browser.
		 *
		 * @returns {boolean} `true` if ResourceTiming is supported.
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		is_supported: function() {
			var p;

			if (impl.supported !== null) {
				return impl.supported;
			}

			// check for getEntriesByType and the entry type existing
			var p = BOOMR.getPerformance();
			impl.supported = p &&
			    typeof p.getEntriesByType === "function" &&
			    typeof window.PerformanceResourceTiming !== "undefined";

			return impl.supported;
		},

		/**
		 * Saves an array of `PerformanceResourceTiming`-shaped objects which we will later insert into the trie.
		 *
		 * @param {array<object>} resources Array of objects that are shaped like `PerformanceResourceTiming`s
		 * @param {high-resolution-timestamp} epoch Optional epoch for all of the timestamps of all of the resources
		 *
		 * @memberof BOOMR.plugins.ResourceTiming
		 */
		addResources: function(resources, epoch) {
			if (!this.is_supported() || !BOOMR.utils.isArray(resources)) {
				return;
			}

			impl.collectedEntries = impl.collectedEntries || [];
			if (typeof epoch === "number") {
				var topEpoch = BOOMR.window.performance.timeOrigin || BOOMR.window.performance.timing.navigationStart;
				var offset = epoch - topEpoch;
				resources = BOOMR.utils.arrayFilter(resources, function(entry) {
					for (var field = 0; field < RT_FIELDS_TIMESTAMPS.length; field++) {
						var key = RT_FIELDS_TIMESTAMPS[field];
						if (entry.hasOwnProperty(key)) {
							entry[key] += offset;
						}
					}
					return true;
				});
			}
			Array.prototype.push.apply(impl.collectedEntries, resources);
		},

		//
		// Public Exports
		//
		getCompressedResourceTiming: getCompressedResourceTiming,
		getFilteredResourceTiming: getFilteredResourceTiming,
		calculateResourceTimingUnion: calculateResourceTimingUnion,
		addResourceTimingToBeacon: addResourceTimingToBeacon,
		addToBeacon: addToBeacon

		//
		// Test Exports (only for debug)
		//
	};

}());

/**
 * Plugin to capture
 * [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
 * on browsers that support it.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `mob.ct`: [`navigator.connection.type`](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/type)
 * * `mob.bw`: [`navigator.connection.bandwidth`](https://developer.mozilla.org/en-US/docs/Web/API/Connection/bandwidth)
 * * `mob.mt`: [`navigator.connection.metered`](https://developer.mozilla.org/en-US/docs/Web/API/Connection/metered)
 * * `mob.lm`: [`navigator.connection.downlinkMax`](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/downlinkMax)
 *
 * @class BOOMR.plugins.Mobile
 */
(function() {
	var connection, param_map = {
		"type": "ct",
		"bandwidth": "bw",
		"metered": "mt",
		"effectiveType": "etype",
		"downlinkMax": "lm",
		"downlink": "dl",
		"rtt": "rtt",
		"saveData": "sd"
	};

	

	if (typeof BOOMR.addVar !== "function") {
		return;
	}

	if (typeof navigator === "object") {
		connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || navigator.msConnection;
	}

	if (!connection) {
		return;
	}

	function setVars() {
		var k;

		for (k in param_map) {
			if (typeof connection[k] !== "undefined") {
				// Remove old parameter value from the beacon because new value might be falsy which won't overwrite old value
				BOOMR.removeVar("mob." + param_map[k]);
				if (connection[k]) {
					BOOMR.addVar("mob." + param_map[k], connection[k]);
				}
			}
		}
	}

	// If connection information changes, we collect the latest values
	if (connection.addEventListener) {
		connection.addEventListener("change", function() {
			setVars();
			BOOMR.fireEvent("netinfo", connection);
		});
	}

	setVars();
}());

/**
 * Plugin to collect memory, page construction (DOM), screen, CPU and battery metrics (when available).
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * * Resources:
 *   * `dom.res`: Number of resources fetched in the main frame (via ResourceTiming)
 *   * `dom.doms`: Number of unique domains in the main page (via ResourceTiming)
 * * Memory
 *   * `mem.total`: [`memory.totalJSHeapSize`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.limit`: [`memory.jsHeapSizeLimit`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.used`: [`m.usedJSHeapSize`](https://webplatform.github.io/docs/apis/timing/properties/memory/)
 *   * `mem.lssz`: Number of localStorage bytes used
 *   * `mem.lsln`: Number of localStorage keys used
 *   * `mem.sssz`: Number of sessionStorage bytes used
 *   * `mem.ssln`: Number of sessionStorage keys used
 * * Screen
 *   * `scr.xy`: [`screen.width`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width)
 *     and [`screen.height`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height) (e.g. `100x200`)
 *   * `scr.bpp`: [`screen.colorDepth`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/colorDepth)
 *     and [`screen.pixelDepth`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/pixelDepth) (e.g. `32/24`)
 *   * `scr.dpx`: [`screen.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
 *   * `scr.orn`: [`screen.orientation.angle`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation) and
 *     [`screen.orientation.type`](https://developer.mozilla.org/en-US/docs/Web/API/Screen/type) (e.g. `90/landscape-primary`)
 *   * `scr.sxy`: [`window.scrollX`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX) and
 *     [`window.scrollY`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY) (e.g. `0x1000`)
 * * Hardware
 *   * `scr.mtp`: [`navigator.maxTouchPoints`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints)
 *   * `cpu.cnc`: [`navigator.hardwareConcurrency`](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency)
 * * DOM
 *   * `dom.ln`: Number of DOM nodes in the main frame
 *   * `dom.sz`: Number of HTML bytes of of the main frame
 *   * `dom.ck`: Number of bytes stored as cookies available to JavaScript on the current domain
 *   * `dom.img`: Number of `IMG` nodes in the main frame
 *   * `dom.img.ext`: Number of external (e.g. not `data:` URI) `IMG` nodes in the main frame
 *   * `dom.img.uniq`: Number of unique `IMG src` nodes in the main frame
 *   * `dom.script`: Number of `SCRIPT` nodes in the main frame
 *   * `dom.script.ext`: Number of external (e.g. not inline or `data:` URI) `SCRIPT` nodes in the main frame
 *   * `dom.script.uniq`: Number of unique `SCRIPT src` nodes in the main frame
 *   * `dom.iframe`: Number of `IFRAME` nodes in the main frame
 *   * `dom.iframe.ext`: Number of external (e.g. not `javascript:` or `about:` URI) `IFRAME` nodes in the main frame
 *   * `dom.iframe.uniq`: Number of unique `IFRAME src` nodes in the main frame
 *   * `dom.link`: Number of `LINK` nodes in the main frame
 *   * `dom.link.css`: Number of `rel="stylesheet"` `LINK` nodes in the main frame
 *   * `dom.link.css.uniq`: Number of unique `rel="stylesheet"` `LINK` nodes in the main frame
 * * Net
 *   * `net.sd`: Boolean stating whether the user has data saver turned on or not
 *
 * @class BOOMR.plugins.Memory
 */
(function() {
	var w, p = {}, d, m, s, n, b, ls, ss, impl;

	
	

	if (BOOMR.plugins.Memory) {
		return;
	}

	/**
	 * Count elements of a given type and return the count or an object with the
	 * `key` mapped to the `count` if a `key` is specified. If one or more filters
	 * are included, apply them incrementally to the `element` array, assigning
	 * each intermediate count to the corresponding `key` in the return object
	 *
	 * @param {string} type Element type to search DOM for
	 * @param {string[]} [keys] List of keys for return object.
	 * If not included, just the tag count is returned.
	 *
	 * If included then an object is returned with each element in this array as
	 * a key, and the element count as the value.
	 *
	 * For keys[1] onwards, the element count is the number of elements returned
	 * from each corresponding filter function.
	 * @param {function} [filter] List of filters to apply incrementally to element array.
	 * This is NOT an array.
	 *
	 * The input to each function in the argument list is the array returned by the previous function
	 *
	 * The first function receives the array returned by the `getElementsByTagName` function
	 *
	 * Each function MUST return a NodeList or an Array with a `length` property
	 *
	 * @returns {number|object}
	 * If only one argument is passed in, returns a nodeCount matching that element type.
	 * If multiple arguments are passed in, returns an object with key to count
	 * mapping based on the rules above.
	 */
	function nodeCount(type, keys /*, filter...*/) {
		var tags, r, o, i, filter;
		try {
			tags = d.getElementsByTagName(type);
			r = tags.length;

			if (keys && keys.length) {
				o = {};
				o[keys[0]] = r;

				// Iterate through all remaining arguments checking for filters
				// Remember that keys.length will be at least 1 and arguments.length will be at least 2
				// so the first key we use is keys[1] for arguments[2]
				for (i = 2; r > 0 && i < arguments.length && i - 1 < keys.length; i++) {
					filter = arguments[i];

					if (typeof filter !== "function") {
						continue;
					}

					try {
						tags = BOOMR.utils.arrayFilter(tags, filter);
						// Only add this if different from the previous
						if (tags.length !== r) {
							r = tags.length;
							o[keys[i - 1]] = r;
						}
					}
					catch (err) {
						BOOMR.addError(err, "Memory.nodeList." + type + ".filter[" + (i - 2) + "]");
					}
				}

			}
			return o || r;
		}
		catch (err) {
			BOOMR.addError(err, "Memory.nodeList." + type);
			return 0;
		}
	}

	/**
	 * Wraps a callback for error reporting
	 *
	 * @param {boolean} condition Condition
	 * @param {function} callback Callback
	 * @param {string} component Component name
	 */
	function errorWrap(condition, callback, component) {
		if (condition) {
			try {
				callback();
			}
			catch (err) {
				BOOMR.addError(err, "Memory.done." + component);
			}
		}
	}

	// A private object to encapsulate all your implementation details
	impl = {
		done: function() {
			if (!w) {
				// this can happen for an unload beacon
				return;
			}

			// If we have resource timing, get number of resources
			BOOMR.removeVar("dom.res");
			errorWrap(true,
				function() {
					var res, doms = {}, a;

					if (!p || typeof p.getEntriesByType !== "function") {
						return;
					}

					res = p.getEntriesByType("resource");
					if (!res || !res.length) {
						return;
					}

					BOOMR.addVar("dom.res", res.length);

					a = BOOMR.window.document.createElement("a");

					[].forEach.call(res, function(r) {
						a.href = r.name;
						doms[a.hostname] = true;
					});

					BOOMR.addVar("dom.doms", Object.keys(doms).length);
				},
				"resources"
			);

			if (m) {
				BOOMR.addVar({
					"mem.total": m.totalJSHeapSize,
					"mem.limit": m.jsHeapSizeLimit,
					"mem.used": m.usedJSHeapSize
				});
			}

			errorWrap(ls && ss,
				function() {
					BOOMR.addVar({
						"mem.lsln": ls.length,
						"mem.ssln": ss.length
					});

					if (window.JSON && typeof JSON.stringify === "function") {
						BOOMR.addVar({
							"mem.lssz": JSON.stringify(ls).length,
							"mem.sssz": JSON.stringify(ss).length
						});
					}
				},
				"localStorage"
			);

			errorWrap(s,
				function() {
					var sx, sy;
					BOOMR.addVar({
						"scr.xy": s.width + "x" + s.height,
						"scr.bpp": s.colorDepth + "/" + (s.pixelDepth || "")
					});
					if (s.orientation) {
						BOOMR.addVar("scr.orn", s.orientation.angle + "/" + s.orientation.type);
					}
					if (w.devicePixelRatio > 1) {
						BOOMR.addVar("scr.dpx", w.devicePixelRatio);
					}

					var scroll = BOOMR.utils.scroll();
					if (scroll.x || scroll.y) {
						BOOMR.addVar("scr.sxy", scroll.x + "x" + scroll.y);
					}
				},
				"screen"
			);

			errorWrap(n,
				function() {
					if (n.hardwareConcurrency) {
						BOOMR.addVar("cpu.cnc", n.hardwareConcurrency);
					}
					if (n.maxTouchPoints) {
						BOOMR.addVar("scr.mtp", n.maxTouchPoints);
					}
					if (n.connection && n.connection.hasOwnProperty("saveData")) {
						BOOMR.addVar("net.sd", n.connection.saveData ? 1 : 0);
					}
				},
				"navigator"
			);

			errorWrap(true,
				function() {
					var uniqUrls;

					BOOMR.addVar({
						"dom.ln": nodeCount("*"),
						"dom.sz": d.documentElement.innerHTML.length,
						"dom.ck": d.cookie.length
					});

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"img",
						["dom.img", "dom.img.ext", "dom.img.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|data:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.currentSrc || el.src] = uniqUrls.hasOwnProperty(el.currentSrc || el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"script",
						["dom.script", "dom.script.ext", "dom.script.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.src] = uniqUrls.hasOwnProperty(el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"iframe",
						["dom.iframe", "dom.iframe.ext", "dom.iframe.uniq"],
						function(el) {
							return el.src && !el.src.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(el) {
							return !(uniqUrls[el.src] = uniqUrls.hasOwnProperty(el.src));
						}
					));

					uniqUrls = {};
					BOOMR.addVar(nodeCount(
						"link",
						["dom.link", "dom.link.css", "dom.link.css.uniq"],
						function(link) {
							return link.rel && link.rel.toLowerCase() === "stylesheet" &&
								link.href && !link.href.toLowerCase().match(/^(?:about:|javascript:|#)/);
						},
						function(link) {
							return !(uniqUrls[link.href] = uniqUrls.hasOwnProperty(link.href));
						}
					));
				},
				"dom"
			);

			// no need to call BOOMR.sendBeacon because we're called when the beacon is being sent
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.Memory = {
		/**
		 * Initializes the plugin.
		 *
		 * @memberof BOOMR.plugins.Memory
		 */
		init: function() {
			var c;

			try {
				w = BOOMR.window;
				d = w.document;
				p = BOOMR.getPerformance();
				c = w.console;
				s = w.screen;
				n = w.navigator;

				try {
					ls = w.localStorage;
					ss = w.sessionStorage;
				}
				catch (e) {
					// NOP - some browsers will throw on access to var
				}

				if (n && n.battery) {
					b = n.battery;
				}
				// There are cases where getBattery exists but is not a function
				// No need to check for existence because typeof will return undefined anyway
				else if (n && typeof n.getBattery === "function") {
					var batPromise = n.getBattery();

					// some UAs implement getBattery without a promise
					if (batPromise && typeof batPromise.then === "function") {
						batPromise.then(function(battery) {
							b = battery;
						});
					}
					// If batPromise is an object and it has a `level` property, then it's probably the battery object
					else if (typeof batPromise === "object" && batPromise.hasOwnProperty("level")) {
						b = batPromise;
					}
					// else do nothing
				}
			}
			catch (err) {
				BOOMR.addError(err, "Memory.init");
			}

			m = (p && p.memory ? p.memory : (c && c.memory ? c.memory : null));

			if (impl.initialized) {
				return this;
			}

			impl.initialized = true;

			// we do this before sending a beacon to get the snapshot when the beacon is sent
			BOOMR.subscribe("before_beacon", impl.done, null, impl);
			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.Memory
		 */
		is_complete: function() {
			// Always true since we run on before_beacon, which happens after the check
			return true;
		}
	};

}());

/**
 * The cache reload plugin forces the browser to update its cached copy of boomerang.
 *
 * The file at `url` should look like the sample below.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * @example
 * <!doctype html>
 * <html>
 * <head>
 *   <script src="boomerang.js"></script>
 * </head>
 * <body>
 *   <script>
 *   // required version needs to be passed in as a query string parameter
 *   // like v=0.9.123456789
 *   var boom_ver = BOOMR.version.split('.'),
 *   var reqd_ver = location.search.replace(/.*v=([0-9\.]+)/, '$1').split('.');
 *   if ((boom_ver[0] < reqd_ver[0])
 *     || (boom_ver[0] == reqd_ver[0] && boom_ver[1] < reqd_ver[1])
 *     || (boom_ver[0] == reqd_ver[0] && boom_ver[1] == reqd_ver[1] && boom_ver[2] < reqd_ver[2])
 *   ) {
 *     location.reload(true);
 *   }
 *   </script>
 * </body>
 * </html>
 * @see {@link http://www.lognormal.com/blog/2012/06/05/updating-cached-boomerang/}
 * @see {@link http://www.lognormal.com/blog/2012/06/17/more-on-updating-boomerang/}
 *
 * @class BOOMR.plugins.CACHE_RELOAD
 */
(function() {
	
	

	if (BOOMR.plugins.CACHE_RELOAD) {
		return;
	}

	var impl = {
		url: ""
	};

	BOOMR.plugins.CACHE_RELOAD = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} [config.CACHE_RELOAD.url] By default, this is set to the empty string,
		 * which has the effect of disabling the Cache Reload plugin.
		 *
		 * Set the `url` parameter to the URL that will do handle forcing the reload.
		 *
		 * See the example for what this URL's output should look like.
		 * @returns {@link BOOMR.plugins.CACHE_RELOAD} The CACHE_RELOAD plugin for chaining
		 * @memberof BOOMR.plugins.CACHE_RELOAD
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "CACHE_RELOAD", ["url"]);

			if (!impl.url) {
				return this;
			}

			// we use document and not BOOMR.window.document since
			// we can run inside the boomerang iframe if any
			var i = document.createElement("iframe");
			i.style.display = "none";
			i.src = impl.url;
			document.body.appendChild(i);

			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.CACHE_RELOAD
		 */
		is_complete: function() {
			// we always return true since this plugin never adds anything to the beacon
			return true;
		}
	};

}());

/**
 * The `Compression` plugin adds common compression code that other plugins can use.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * @class BOOMR.utils.Compression
 */
(function() {
	
	BOOMR.utils = BOOMR.utils || {};

	if (BOOMR.utils && BOOMR.utils.Compression) {
		return;
	}

	var self = BOOMR.utils.Compression = {};

	/**
	 * Converts an object to URL-friendly JSON
	 *
	 * Adapted from https://github.com/Sage/jsurl
	 *
	 * Changes:
	 *  Formatting
	 *  Removal of Array.map and Object.map for compat with IE 6-8
	 *  Change of str[i] syntax to str.charAt(i) for compat with IE 6-7
	 *
	 * @param {object} v Object to convert
	 *
	 * @returns {string} URL-friendly JSON
	 * @memberof BOOMR.utils.Compression
	 */
	self.jsUrl = function jsUrl(v) {
		/**
		 * Encodes the specified string
		 *
		 * @param {string} s String
		 *
		 * @returns {string} Encoded string
		 */
		function encode(s) {
			if (!/[^\w-.]/.test(s)) {
				// if the string is only made up of alpha-numeric, underscore,
				// dash or period, we can use it directly.
				return s;
			}

			// we need to escape other characters
			s = s.replace(/[^\w-.]/g, function(ch) {
				if (ch === "$") {
					return "!";
				}

				// use the character code for this one
				ch = ch.charCodeAt(0);

				if (ch < 0x100) {
					// if less than 256, use "*[2-char code]"
					return "*" + ("00" + ch.toString(16)).slice(-2);
				}
				else {
					// use "**[4-char code]"
					return "**" + ("0000" + ch.toString(16)).slice(-4);
				}
			});

			return s;
		}

		var tmpAry = [];

		switch (typeof v) {
		case "number":
			// for finite numbers, return "~[number]"
			return isFinite(v) ? "~" + v : "~null";

		case "string":
			// "~'[encoded string]"
			return "~'" + encode(v);

		case "boolean":
			// "~true" or "~false"
			return "~" + v;

		case "object":
			if (!v) {
				return "~null";
			}

			if (BOOMR.utils.isArray(v)) {
				// iterate instead of Array.map for compat
				for (var i = 0; i < v.length; i++) {
					if (i in v) {
						tmpAry[i] = self.jsUrl(v[i]) || "~null";
					}
				}

				return "~(" + (tmpAry.join("") || "~") + ")";
			}
			else {
				// iterate instead of Object.map for compat
				for (var key in v) {
					if (v.hasOwnProperty(key)) {
						var val = self.jsUrl(v[key]);
						// skip undefined and functions

						if (val) {
							tmpAry.push(encode(key) + val);
						}
					}
				}

				return "~(" + tmpAry.sort().join("~") + ")";
			}

		default:
			// function, undefined
			return undefined;
		}
	};

}());

/**
 * The `Errors` plugin automatically captures JavaScript and other errors from
 * your web application.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Sources of Errors
 *
 * When the `Errors` plugin is enabled, the following sources of errors are captured:
 *
 * * JavaScript runtime errors captured via the
 *   [`onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror)
 *   global event handler
 * * [``XMLHttpRequest``](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 *   responses that were not successful.  Note {@link BOOMR.plugins.AutOXHR} is required
 *   if using this.
 * * Any calls to [``window.console.error``](https://developer.mozilla.org/en-US/docs/Web/API/Console/error)
 * * JavaScript runtime errors that happen during a callback for
 *   [``addEventListener``](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
 * * JavaScript runtime errors that happen during a callback for
 *   [``setTimeout``](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout)
 *   and [``setInterval``](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval)
 * * Manually sent errors via {@link BOOMR.plugins.Errors.send}
 * * Functions that threw an exception that were wrapped via {@link BOOMR.plugins.Errors.wrap}
 * * Functions that threw an exception that were run via {@link BOOMR.plugins.Errors.test}
 * * JavaScript runtime errors captured via the
 *   [`unhandledrejection`](https://developer.mozilla.org/en-US/docs/Web/Events/unhandledrejection)
 *   global event handler. Disabled by default.
 * * JavaScript runtime warnings captured via the
 *   [`Reporting API`](https://www.w3.org/TR/reporting/#reporting-observer). Disabled by default.
 *
 * These are all enabled by default, and can be
 * {@link BOOMR.plugins.Errors.init manually turned off}.
 *
 * ## Supported Browsers
 *
 * The `Errors` plugin can be enabled for all browsers, though some older browsers
 * may not be able to capture the full breadth of sources of errors. Due to the lack
 * of error detail on some older browsers, some errors may be reported more than once.
 *
 * Notable browsers:
 *
 * * Internet Explorer <= 8: Does not support capturing `XMLHttpRequest` errors.
 *
 * ## Manually Sending Errors
 *
 * Besides automatically capturing errors from `onerror`, `XMLHttpRequest`,
 * `console.error` or event handlers such as `setTimeout`, you can also manually
 * send errors.
 *
 * There are three ways of doing this as follows:
 *
 * * {@link BOOMR.plugins.Errors.send}: Immediately sends an error.
 * * {@link BOOMR.plugins.Errors.wrap}: Wraps a function with error tracking
 * * {@link BOOMR.plugins.Errors.test}: Runs the function and captures any errors.
 *
 * ## Error callback
 *
 * You can specify an {@link BOOMR.plugins.Errors.init `onError`} function that
 * the Errors plugin will call any time an error is captured on the page.
 *
 * If your `onError` function returns `true`, the error will be captured.
 *
 * If your `onError` function does not return `true`, the error will be ignored.
 *
 * Example:
 *
 * ```
 * BOOMR.init({
 *   Errors: {
 *     onError: function(err) {
 *       if (err.message && err.message.indexOf("internally handled")) {
 *         return false;
 *       }
 *       return true;
 *     }
 *   }
 * });
 * ```
 *
 * ## When to Send Errors
 *
 * By default, errors captured during the page load will be sent along with the
 * page load beacon.
 *
 * Errors that happen after the page load will not be captured or sent.
 *
 * To enable capturing of errors after page load, you need to set
 * {@link BOOMR.plugins.Errors.init `sendAfterOnload`} to `true`. If set,
 * errors that happen after the page load will be sent at most once every
 * {@link BOOMR.plugins.Errors.init `sendInterval`} (which defaults to 1 second)
 * on a new beacon.
 *
 * Example:
 *
 * ```
 * BOOMR.init({
 *   Errors: {
 *     sendAfterOnload: true,
 *     sendInterval: 5000
 *   }
 * });
 * ```
 *
 * ## How Many Errors to Capture
 *
 * The `Errors` plugin will only capture up to
 * {@link BOOMR.plugins.Errors.init `maxErrors`} (defaults to 10) distinct
 * errors on the page.
 *
 * Please note that duplicate errors (those with the same function name, stack,
 * and so on) are tracked as single distinct error, with a `count` of how many
 * times it was seen.
 *
 * You can increase (or decrease) `maxErrors`. For example:
 * ```
 * BOOMR.init({
 *   Errors: {
 *     maxErrors: 20
 *   }
 * });
 * ```
 *
 * ## Dealing with Script Error
 *
 * When looking at JavaScript errors, you will likely come across the generic error
 * message: `Script error.`
 *
 * `Script Error.` is the message that browsers send to the
 * [`window.onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror)
 * global exception handler when the error was triggered by a script loaded from a different (cross)
 * [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin).  `window.onerror`
 * is used by Boomerang so that it gets notified of all unhandled exceptions.
 *
 * The `Script Error.` string is given _instead_ of the real error message
 * and does not contain any useful information about what caused the error. In addition,
 * there is no stack associated with the message, so it's impossible to know where
 * or why the error occurred.
 *
 * Browsers mask the real error message for cross-origin scripts due to security and
 * privacy concerns - they don't want to leak sensitive information in the message
 * or stack.  The only thing that `window.onerror` knows for cross-origin scripts
 * is that an error occurred, not where or why.
 *
 * ### Example
 *
 * For an example of where you'd see `Script Error.`, consider the following code
 * that lives on `website.com`:
 *
 * ```html
 * <html>
 *     <head>
 *         <title>website.com</title>
 *     </head>
 *     <body>
 *         <script>
 *             window.onerror = function(message, url, line, column, error) {
 *                 console.log("window.onerror: " + message);
 *                 console.log((error && error.stack) ? error.stack : "(no stack)");
 *             };
 *         </script>
 *         <script src="my-script.js"></script>
 *         <script src="https://anothersite.com/my-script.js"></script>
 *     </body>
 * </html>
 * ```
 *
 * Assume `my-script.js` is the same file being served from both `website.com` and
 * `anothersite.com`:
 *
 * ```js
 * function runCode() {
 *     a = b + 1;
 * }
 *
 * runCode();
 * ```
 *
 * When `my-script.js` is loaded from `website.com`, it will be executed twice:
 *
 * 1. First on the same-origin, where we'll see the full error message followed by
 *     the stack:
 *
 *     ```
 *     window.onerror: Uncaught ReferenceError: b is not defined
 *
 *     ReferenceError: b is not defined
 *         at runCode (my-script.js:2)
 *         at my-script.js:5
 *     ```
 *
 * 2. Then, it will be loaded from `https://anothersite.com/my-script.js`, which
 *     will be considered cross-origin and only `Script Error.` will be logged:
 *
 *     ```
 *     window.onerror: Script error.
 *
 *     (no stack)
 *     ```
 *
 * As you can see, browser shares the full details of the exception when it's served
 * from the same origin as the website, but if it's served from any other origin,
 * it will be considered cross-origin and no details will be shared.
 *
 * Note that while the browser only shares `Script Error.` to `window.onerror`
 * for cross-origin scripts, if _you_ have browser developer tools open,
 * the browser will show _you_ the full error message in the Console.  This is
 * because there aren't any security or privacy concerns for a developer looking at
 * their own machine's information.
 *
 * ### When You'll See Script Error
 *
 * Unfortunately `Script Error.` will be shown in many legitimate use-cases,
 * such as:
 *
 * 1. When serving your website's JavaScript from a CDN (since it will be coming
 *     from a different origin)
 *
 * 2. When loading a library such as jQuery or Angular from their CDN, i.e.
 *     [Google's Hosted Libraries](https://developers.google.com/speed/libraries/)
 *     or [cdnjs](https://cdnjs.com/)
 *
 * 3. When a third-party script loads from another domain
 *
 * The good news is that in many of these cases, there are changes you can make to
 * ensure the full error message and stack are shared with `window.onerror`.
 *
 * ### Fixing Script Error
 *
 * To ensure a cross-origin script shares full error details with `window.onerror`,
 * you'll need to do **two** things:
 *
 * 1. Add `crossorigin="anonymous"` to the `<script>` tag
 *
 *     The [`crossorigin="anonymous"` attribute](https://www.w3.org/TR/html5/infrastructure.html#cors-settings-attribute)
 *     tells the browser that the script should be fetched without sending
 *     any cookies or HTTP authentication
 *
 * 2. Add the `Access-Control-Allow-Origin` (ACAO) header to the JavaScript file's response.
 *
 *     The `Access-Control-Allow-Origin` header is part of the
 *     [Cross Origin Resource Sharing](https://www.w3.org/TR/cors/) (CORS) standard.
 *
 *     The ACAO header **must** be set in the JavaScript's HTTP response headers.
 *
 *     An example header that sets ACAO for all calling origins would be:
 *
 *     `Access-Control-Allow-Origin: *`
 *
 * If both conditions are true, cross-origin JavaScript files will report errors
 * to `window.onerror` with the correct error message and full stack.
 *
 * The biggest challenge to getting this working is that (1) is within the _site's_
 * control while (2) can only be configured by the _owner_ of the JavaScript.  If you're
 * loading JavaScript from a third-party, you will need to encourage them to add the
 * ACAO header if it's not already set.  The good news is that many CDNs and
 * third-parties set the ACAO header already.
 *
 * ### Workarounds for Third Parties that aren't sending ACAO
 *
 * One way to help monitor for errors coming from third-party scripts that aren't
 * setting ACAO (and aren't within your control) is by manually wrapping calls
 * to any of the third-party script's functions in a `try {} catch {}`.
 *
 * ```js
 * try {
 *     // calls a cross-origin script that doesn't have ACAO
 *     runThirdPartyCode();
 * } catch (e) {
 *     // report on error with e.message and e.stack
 * }
 * ```
 *
 * If `runThirdPartyCode()` causes any errors, the `catch {}` handler will get the full
 * details of the exception.
 *
 * Unfortunately this won't work for functions that are executed in the third-party
 * script as a result of browser events or callbacks (since you're not wrapping them).
 *
 * When using Boomerang to monitor JavaScript errors, Boomerang automatically wraps some
 * of the built-in browser APIs such as `setTimeout`, `setInterval` and `addEventListener`
 * with a minimal-overhead wrapper.  It does this to help ensure as many cross-origin
 * exceptions as possible have full stack details. You may also do this manually via
 * [`` BOOMR.plugin.Errors.wrap(function)``](#BOOMR_plugin_Errors_wrap).
 *
 * ## Why is Boomerang in my Error Stack?
 *
 * When looking at error reports, you may find errors that have a function in
 * `boomerang.js` (or `/boomerang/`) on the stack.  Why is that?  Is Boomerang
 * causing errors on your site?
 *
 * One of the ways that Boomerang is able to monitor and measure your site's performance
 * is by _wrapping_ itself around some of the core browser APIs.  Boomerang only does
 * this in a few places, if absolutely necessary -- namely, when the browser doesn't
 * provide a native "monitoring" interface for something that needs to be tracked.
 *
 * One example is for `XMLHttpRequests`, as there are no browser APIs to monitor when
 * XHRs load.  To monitor XHRs, Boomerang swaps in its own `window.XMLHttpRequest`
 * object, wrapping around the native methods.  When an XHR is created (via `.open()`),
 * the lightweight Boomerang wrapper is executed first so it can log a start timestamp.
 * When the XHR finishes (via a `readyState` change), Boomerang can log the end
 * timestamp and report on the XHR's performance.
 *
 * Examples of Boomerang wrapping native methods include:
 *
 * * `XMLHttpRequest` if the XHR instrumentation is turned on
 * * `setTimeout` and `setInterval` if error tracking is turned on
 * * `console.error` if error tracking is turned on
 * * `addEventListener` and `removeEventListener` if error tracking is turned on
 *
 * All of these wrapped functions come into play when you see an error stack with
 * a `boomerang.js` function in it.
 *
 * Often, the `boomerang.js` function will be at the _bottom_ of the stack (the first
 * function called).  This does not mean Boomerang caused the error, merely that
 * the monitoring code was running before the error occurred.  The actual
 * error happens towards the _top_ of the stack -- the function that ran and threw
 * the exception.
 *
 * Let's look at some examples:
 *
 * ```
 * Cannot read property 'foo' of undefined at thirdPartyTwo (https://thirdparty.com/core.js:1:100)
 * at thirdPartyOne (https://thirdparty.com/core.js:1:101)
 * at runThirdParty (https://thirdparty.com/core.js:1:102)
 * at xhrCallback (http://website.com/site.js:2:200)
 * at XMLHttpRequest.send (https://mysite.com/boomerang.js:3:300)
 * ```
 *
 * In the above example, Boomerang is monitoring `XMLHttpRequests`.  An XHR was
 * loaded on the site, and during the XHR callback, an exception was thrown.  Even
 * though `/boomerang/` is listed here, the error was caused by code in the XHR
 * callback (`xhrCallback` eventually calling `thirdPartyTwo`).
 *
 * Here's a second example:
 *
 * ```
 * Reference error: a is not defined at setTimeout (http://website.com/site.js:1:200)
 * at BOOMR_plugins_errors_wrap (http://mysite.com/boomerang.js:3:300)
 * at onclick (http://website.com/site.js:1:100)
 * ```
 *
 * In the above example, JavaScript Error Reporting is enabled and an exception was
 * thrown in a `setTimeout()` on the website.  You can see the `BOOMR_plugins_errors_wrap`
 * function is near the top of the stack, but this is merely the error tracking code.
 * All it did was wrap `setTimeout` to help ensure that cross-origin exceptions are
 * caught.  It was not the actual cause of the site's error.
 *
 * Here's a third example:
 *
 * ```
 * Error: missing argument 1 at BOOMR.window.console.error (https://mysite.com/boomerang.js:3:300)
 * at u/< (https://website.com/site.js:1:100)
 * at tp/this.$get</< (https://website.com/site.js:1:200)
 * at $digest (https://website.com/site.js:1:300)
 * at $apply (https://website.com/site.js:1:400)
 * at ut (https://website.com/site.js:1:500)
 * at it (https://website.com/site.js:1:600)
 * at vp/</k.onload (https://website.com/site.js:1:700)
 * ```
 *
 * In the above example, JavaScript Error Reporting is enabled and has wrapped
 * `console.error`.  The minified function `u/<` must be logging a `console.error`,
 * which executes the Boomerang wrapper code, reporting the error.
 *
 * In summary, if you see Boomerang functions in error stacks similar to any of the
 * ones listed below, it's probable that you're just seeing a side-effect of the
 * monitoring code:
 *
 * * `BOOMR_addError`
 * * `BOOMR_plugins_errors_onerror`
 * * `BOOMR_plugins_errors_onxhrerror`
 * * `BOOMR_plugins_errors_console_error`
 * * `BOOMR_plugins_errors_wrap`
 * * `BOOMR.window.console.error`
 * * `BOOMR_plugins_errors_onrejection`
 *
 * ## Beacon Parameters
 *
 * * `err`: The compressed error data structure
 * * `http.initiator = error` (if not part of a Page Load beacon)
 *
 * The compressed error data structure is a [JSURL](https://github.com/Sage/jsurl)
 * encoded JSON object.
 *
 * Each element in the array is a compressed representation of a JavaScript error:
 *
 * * `n`: Count (if the error was seen more than once)
 * * `f[]`: An array of frames
 *   * `f[].l`: Line number
 *   * `f[].c`: Colum number
 *   * `f[].f`: Function name
 *   * `f[].w`: File name (if origin differs from root page)
 *   * `f[].wo`: File name without origin (if same as root page)
 * * `s`: Source:
 *   * `1`: Error was triggered by the application
 *   * `2`: Error was triggered by Boomerang
 * * `v`: Via
 *   * `1`: Application ({@link BOOMR.plugins.Errors.send})
 *   * `2`: Global exception handler (`window.onerror`)
 *   * `3`: Network (XHR) error
 *   * `4`: Console (`console.error`)
 *   * `5`: Event handler (`addEventListener`)
 *   * `6`: `setTimeout` or `setInterval`
 * * `t`: Type (e.g. `SyntaxError` or `ReferenceError`)
 * * `c`: Code (for network errors)
 * * `m`: Error messag
 * * `x`: Extra data
 * * `d`: Timestamp (base 36)
 *
 * @class BOOMR.plugins.Errors
 */

/*eslint-disable*/
//
// Via https://github.com/stacktracejs/error-stack-parser
// Modifications:
// * Removed UMD
// * Return anonymous objects, not StackFrames
//
(function (root, factory) {
	'use strict';
	root.ErrorStackParser = factory();
}(this, function ErrorStackParser() {
	'use strict';

	var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
	var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
	var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

	function _map(array, fn, thisArg) {
		if (typeof Array.prototype.map === 'function') {
			return array.map(fn, thisArg);
		} else {
			var output = new Array(array.length);
			for (var i = 0; i < array.length; i++) {
				output[i] = fn.call(thisArg, array[i]);
			}
			return output;
		}
	}

	function _filter(array, fn, thisArg) {
		if (typeof Array.prototype.filter === 'function') {
			return array.filter(fn, thisArg);
		} else {
			var output = [];
			for (var i = 0; i < array.length; i++) {
				if (fn.call(thisArg, array[i])) {
					output.push(array[i]);
				}
			}
			return output;
		}
	}

	return {
		/**
		 * Given an Error object, extract the most information from it.
		 * @param error {Error}
		 * @return Array[]
		 * @ignore
		 */
		parse: function ErrorStackParser$$parse(error) {
			if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
				return this.parseOpera(error);
			} else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
				return this.parseV8OrIE(error);
			} else if (error.stack) {
				return this.parseFFOrSafari(error);
			} else {
				throw new Error('Cannot parse given Error object');
			}
		},

		/**
		 * Separate line and column numbers from a URL-like string.
		 * @param urlLike String
		 * @return Array[String]
		 * @ignore
		 */
		extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
			// Fail-fast but return locations like "(native)"
			if (urlLike.indexOf(':') === -1) {
				return [urlLike];
			}

			var locationParts = urlLike.replace(/[\(\)\s]/g, '').split(':');
			var lastNumber = locationParts.pop();
			var possibleNumber = locationParts[locationParts.length - 1];
			if (!isNaN(parseFloat(possibleNumber)) && isFinite(possibleNumber)) {
				var lineNumber = locationParts.pop();
				return [locationParts.join(':'), lineNumber, lastNumber];
			} else {
				return [locationParts.join(':'), lastNumber, undefined];
			}
		},

		parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
			var filtered = _filter(error.stack.split('\n'), function (line) {
				return !!line.match(CHROME_IE_STACK_REGEXP);
			}, this);

			return _map(filtered, function (line) {
				if (line.indexOf('(eval ') > -1) {
					// Throw away eval information until we implement stacktrace.js/stackframe#8
					line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
				}
				var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
				var locationParts = this.extractLocation(tokens.pop());
				var functionName = tokens.join(' ') || undefined;
				var fileName = locationParts[0] === 'eval' ? undefined : locationParts[0];

				return {
					functionName: functionName,
					fileName: fileName,
					lineNumber: locationParts[1],
					columnNumber: locationParts[2],
					source: line
				};
			}, this);
		},

		parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
			var filtered = _filter(error.stack.split('\n'), function (line) {
				return !line.match(SAFARI_NATIVE_CODE_REGEXP);
			}, this);

			return _map(filtered, function (line) {
				// Throw away eval information until we implement stacktrace.js/stackframe#8
				if (line.indexOf(' > eval') > -1) {
					line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
				}

				if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
					// Safari eval frames only have function names and nothing else
					return { functionName: line };
				} else {
					var tokens = line.split('@');
					var locationParts = this.extractLocation(tokens.pop());
					var functionName = tokens.join('@') || undefined;
					return {
						functionName: functionName,
						fileName: locationParts[0],
						lineNumber: locationParts[1],
						columnNumber: locationParts[2],
						source: line
					};
				}
			}, this);
		},

		parseOpera: function ErrorStackParser$$parseOpera(e) {
			if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
				e.message.split('\n').length > e.stacktrace.split('\n').length)) {
				return this.parseOpera9(e);
			} else if (!e.stack) {
				return this.parseOpera10(e);
			} else {
				return this.parseOpera11(e);
			}
		},

		parseOpera9: function ErrorStackParser$$parseOpera9(e) {
			var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
			var lines = e.message.split('\n');
			var result = [];

			for (var i = 2, len = lines.length; i < len; i += 2) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					result.push({
						fileName: match[2],
						lineNumber: match[1],
						source: lines[i]
					});
				}
			}

			return result;
		},

		parseOpera10: function ErrorStackParser$$parseOpera10(e) {
			var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
			var lines = e.stacktrace.split('\n');
			var result = [];

			for (var i = 0, len = lines.length; i < len; i += 2) {
				var match = lineRE.exec(lines[i]);
				if (match) {
					result.push({
						functionName: match[3] || undefined,
						fileName: match[2],
						lineNumber: match[1],
						source: lines[i]
					});
				}
			}

			return result;
		},

		// Opera 10.65+ Error.stack very similar to FF/Safari
		parseOpera11: function ErrorStackParser$$parseOpera11(error) {
			var filtered = _filter(error.stack.split('\n'), function (line) {
				return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
					!line.match(/^Error created at/);
			}, this);

			return _map(filtered, function (line) {
				var tokens = line.split('@');
				var locationParts = this.extractLocation(tokens.pop());
				var functionCall = (tokens.shift() || '');
				var functionName = functionCall
						.replace(/<anonymous function(: (\w+))?>/, '$2')
						.replace(/\([^\)]*\)/g, '') || undefined;
				var argsRaw;
				if (functionCall.match(/\(([^\)]*)\)/)) {
					argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
				}
				var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ? undefined : argsRaw.split(',');
				return {
					functionName: functionName,
					args: args,
					fileName: locationParts[0],
					lineNumber: locationParts[1],
					columnNumber: locationParts[2],
					source: line
				};
			}, this);
		}
	};
}));
/*eslint-enable*/

/**
 * Boomerang Error plugin
 */
(function() {
	var impl;

	
	

	if (BOOMR.plugins.Errors) {
		return;
	}

	//
	// Constants
	//

	/**
	 * Functions to strip from any stack (internal functions)
	 */
	var STACK_FUNCTIONS_REMOVE = [
		"BOOMR_addError",
		"createStackForSend",
		"BOOMR.window.console.error",
		"BOOMR.plugins.Errors.init",
		"BOOMR.window.onerror",
		// below matches multiple functions:
		"BOOMR_plugins_errors_"
	];

	// functions to strip if they match a STACK_FILENAME_MATCH
	var STACK_FUNCTIONS_REMOVE_IF_FILENAME_MATCH = [
		"Object.send",
		"b.send",
		"wrap",
		"Anonymous function"
	];

	// files that will match for STACK_FUNCTIONS_REMOVE_IF_FILENAME_MATCH
	var STACK_FILENAME_MATCH = [
		"/boomerang"
	];

	/**
	 * Maximum size, in characters, of stack to capture
	 */
	var MAX_STACK_SIZE = 5000;

	/**
	 * BoomerangError object
	 *
	 * @param {object} config Configuration
	 */
	function BoomerangError(config) {
		config = config || {};

		// how many times we've seen this error
		if (typeof config.count === "number" || typeof config.count === "string") {
			this.count = parseInt(config.count, 10);
		}
		else {
			this.count = 1;
		}

		if (typeof config.timestamp === "number") {
			this.timestamp = config.timestamp;
		}
		else {
			 this.timestamp = BOOMR.now();
		}

		// merge in properties from config
		if (typeof config.code === "number" || typeof config.code === "string") {
			this.code = parseInt(config.code, 10);
		}

		if (typeof config.message === "string") {
			this.message = config.message;
		}

		if (typeof config.functionName === "string") {
			this.functionName = config.functionName;
		}

		if (typeof config.fileName === "string") {
			this.fileName = config.fileName;
		}

		if (typeof config.lineNumber === "number" || typeof config.lineNumber === "string") {
			this.lineNumber = parseInt(config.lineNumber, 10);
		}

		if (typeof config.columnNumber === "number" || typeof config.columnNumber === "string") {
			this.columnNumber = parseInt(config.columnNumber, 10);
		}

		if (typeof config.stack === "string") {
			this.stack = config.stack;
		}

		if (typeof config.type === "string") {
			this.type = config.type;
		}

		if (typeof config.extra !== "undefined") {
			this.extra = config.extra;
		}

		this.source = (typeof config.source === "number" || typeof config.source === "string") ?
			parseInt(config.source, 10) :
			BOOMR.plugins.Errors.SOURCE_APP;

		if (typeof config.via === "number" || typeof config.via === "string") {
			this.via = parseInt(config.via, 10);
		}

		if (BOOMR.utils.isArray(config.frames)) {
			this.frames = config.frames;
		}
		else {
			this.frames = [];
		}

		if (BOOMR.utils.isArray(config.events)) {
			this.events = config.events;
		}
		else {
			this.events = [];
		}
	}

	/**
	 * Determines if one BoomerangError object is equal to another
	 *
	 * @param {object} other Object to compare to
	 *
	 * @returns {boolean} True if the two objects are logically equal errors
	 */
	BoomerangError.prototype.equals = function(other) {
		if (typeof other !== "object") {
			return false;
		}
		else if (this.code !== other.code) {
			return false;
		}
		else if (this.message !== other.message) {
			return false;
		}
		else if (this.functionName !== other.functionName) {
			return false;
		}
		else if (this.fileName !== other.fileName) {
			return false;
		}
		else if (this.lineNumber !== other.lineNumber) {
			return false;
		}
		else if (this.columnNumber !== other.columnNumber) {
			return false;
		}
		else if (this.stack !== other.stack) {
			return false;
		}
		else if (this.type !== other.type) {
			return false;
		}
		else if (this.source !== other.source) {
			return false;
		}
		else {
			// same!
			return true;
		}
	};

	/**
	 * Creates a BoomerangError from an Error
	 *
	 * @param {Error} error Error object
	 * @param {number} via How the Error was found (VIA_* enum)
	 * @param {number} source Source of the error (SOURCE_* enum)
	 *
	 * @returns {BoomerangError} Error
	 */
	BoomerangError.fromError = function(error, via, source) {
		var frame, frames, lastFrame, forceUpdate = false, i, j, k,
		    now = BOOMR.now(), skipThis, thisFrame, thisFn;

		if (!error) {
			return null;
		}

		// parse the stack
		if (error.stack) {
			if (error.stack.length > MAX_STACK_SIZE) {
				error.stack = error.stack.substr(0, MAX_STACK_SIZE);
			}

			frames = ErrorStackParser.parse(error);
			if (frames && frames.length) {
				if (error.generatedStack) {
					// if we generated the stack (we were only given a message),
					// we should remove our stack-generation function from it

					// fix-up stack generation on Chrome
					if (frames.length >= 4 &&
						frames[1].functionName &&
						frames[1].functionName.indexOf("createStackForSend") !== -1) {
						// remove the top 3 frames
						frames = frames.slice(3);
						forceUpdate = true;
					}

					// fix-up stack generation on Firefox
					if (frames.length >= 3 &&
						frames[0].functionName &&
						frames[0].functionName.indexOf("createStackForSend") !== -1) {
						// check to see if the filename of frames two and 3 are the same (boomerang),
						// if so, remove both
						if (frames[1].fileName === frames[2].fileName) {
							// remove the top 3 frames
							frames = frames.slice(3);
						}
						else {
							// remove the top 2 frames
							frames = frames.slice(2);
						}

						forceUpdate = true;
					}

					// strip other stack generators
					if (frames.length >= 1 &&
						frames[0].functionName &&
						frames[0].functionName.indexOf("BOOMR_plugins_errors") !== -1) {
						frames = frames.slice(1);
						forceUpdate = true;
					}
				}

				// remove our error wrappers from the stack
				for (i = 0; i < frames.length; i++) {
					thisFrame = frames[i];
					thisFn = thisFrame.functionName;
					skipThis = false;

					// strip boomerang function names
					if (thisFn) {
						for (j = 0; j < STACK_FUNCTIONS_REMOVE.length; j++) {
							if (thisFn.indexOf(STACK_FUNCTIONS_REMOVE[j]) !== -1) {
								frames.splice(i, 1);
								forceUpdate = true;

								// outloop continues with the next element
								i--;
								skipThis = true;
								break;
							}
						}

						// strip additional functions if they also match a file
						if (!skipThis && thisFrame.fileName) {
							for (j = 0; j < STACK_FILENAME_MATCH.length; j++) {
								if (thisFrame.fileName.indexOf(STACK_FILENAME_MATCH[j]) !== -1) {
									// this file name matches, see if any of the matching functions also do
									for (k = 0; k < STACK_FUNCTIONS_REMOVE_IF_FILENAME_MATCH.length; k++) {
										if (thisFn.indexOf(STACK_FUNCTIONS_REMOVE_IF_FILENAME_MATCH[k]) !== -1) {
											frames.splice(i, 1);
											forceUpdate = true;

											// outloop continues with the next element
											i--;
											skipThis = true;
											break;
										}
									}
								}
							}
						}
					}
				}

				if (frames.length) {
					// get the top frame
					frame = frames[0];

					// fill in our error with the top frame, if not already specified
					if (forceUpdate || typeof error.lineNumber === "undefined") {
						error.lineNumber = frame.lineNumber;
					}

					if (forceUpdate || typeof error.columnNumber === "undefined") {
						error.columnNumber = frame.columnNumber;
					}

					if (forceUpdate || typeof error.functionName === "undefined") {
						error.functionName = frame.functionName;
					}

					if (forceUpdate || typeof error.fileName === "undefined") {
						error.fileName = frame.fileName;
					}
				}

				// trim stack down
				if (error.stack) {
					// remove double-spaces
					error.stack = error.stack.replace(/\s\s+/g, " ");
				}
			}
		}
		else if (error.functionName ||
			error.fileName ||
			error.lineNumber ||
			error.columnNumber) {
			// reconstruct a single frame if given fileName, etc
			frames = [{
				lineNumber: error.lineNumber,
				columnNumber: error.columnNumber,
				fileName: error.fileName,
				functionName: error.functionName
			}];
		}

		// fixup some old browser types
		if (typeof error.message === "string" &&
		    typeof error.message.indexOf === "function" &&
		    error.message.indexOf("ReferenceError:") !== -1 &&
		    error.name === "Error") {
			error.name = "ReferenceError";
		}

		// create our final object
		var err = new BoomerangError({
			code: error.code ? error.code : undefined,
			message: error.message ? error.message : undefined,
			functionName: error.functionName ? error.functionName : undefined,
			fileName: error.fileName ? error.fileName : undefined,
			lineNumber: error.lineNumber ? error.lineNumber : undefined,
			columnNumber: error.columnNumber ? error.columnNumber : undefined,
			stack: error.stack ? error.stack : undefined,
			type: error.name ? error.name : undefined,
			source: source,
			via: via,
			frames: frames,
			extra: error.extra ? error.extra : undefined,
			timestamp: error.timestamp ? error.timestamp : now
		});

		return err;
	};

	//
	// Internal config
	//
	impl = {
		//
		// Configuration
		//

		// overridable
		onError: undefined,
		monitorGlobal: true,
		monitorNetwork: true,
		monitorConsole: true,
		monitorEvents: true,
		monitorTimeout: true,
		monitorRejections: false,  // new feature, off by default
		monitorReporting: false,  // new feature, off by default
		sendAfterOnload: false,
		maxErrors: 10,
		// How often to send an error beacon after onload
		sendInterval: 1000,
		// How often to send a beacon during onload if autorun=false
		sendIntervalDuringLoad: 2500,
		sendIntervalId: -1,
		maxEvents: 10,

		// state
		isDuringLoad: true,
		initialized: false,
		autorun: true,

		/**
		 * All errors
		 */
		errors: [],

		/**
		 * Errors queued up for the next batch
		 */
		q: [],

		/**
		 * Circular event buffer
		 */
		events: [],

		// Reporting API observer
		reportingObserver: undefined,

		//
		// Public Functions
		//
		/**
		 * Sends an error
		 *
		 * @param {Error|String} error Error object or message
		 *
		 * @memberof BOOMR.plugins.Errors
		 */
		send: function(error, via, source) {
			var now = BOOMR.now();

			if (!error) {
				return;
			}

			// check if this error was already sent.
			// This could happen if an event handler caught it and then the global
			// error handler caught it again.
			if (error.reported === true) {
				return;
			}
			error.reported = true;

			// defaults, if not specified
			via = via || BOOMR.plugins.Errors.VIA_APP;
			source = source ||  BOOMR.plugins.Errors.SOURCE_APP;

			// if we weren't given a stack, try to create one
			if (!error.stack && !error.noStack) {
				// run this in a function so we can detect it easier by the name,
				// and remove it from any stack frames we send
				function createStackForSend() {
					try {
						throw Error(error);
					}
					catch (ex) {
						error = ex;

						// note we generated this stack for later
						error.generatedStack = true;

						// set the time when it was created
						error.timestamp = error.timestamp || now;

						impl.addError(error, via, source);
					}
				}

				createStackForSend();
			}
			else {
				// add the timestamp
				error.timestamp = error.timestamp || now;

				// send (or queue) the error
				impl.addError(error, via, source);
			}
		},

		//
		// Private Functions
		//

		/**
		 * Sends (or queues) errors
		 *
		 * @param {Error} error Error
		 * @param {number} via VIA_* constant
		 * @param {number} source SOURCE_* constant
		 */
		addError: function(error, via, source) {
			var onErrorResult, err, dup = false, now = BOOMR.now();

			// only track post-load errors if configured
			if (!impl.isDuringLoad && !impl.sendAfterOnload) {
				return;
			}

			// allow the user to filter out the error
			if (impl.onError) {
				try {
					onErrorResult = impl.onError(error);
				}
				catch (exc) {
					onErrorResult = false;
				}

				if (!onErrorResult) {
					return;
				}
			}

			// obey the errors limit
			if (impl.errors.length >= impl.maxErrors) {
				return;
			}

			// convert into our object
			err = BoomerangError.fromError(error, via, source);

			// add to our list of errors seen for all time
			dup = impl.mergeDuplicateErrors(impl.errors, err, false);

			// fire an error event with the duped or new error
			BOOMR.fireEvent("error", dup || err);

			// add to our current queue
			impl.mergeDuplicateErrors(impl.q, err, true);

			//
			// There are a few reasons we'll send an error beacon on its own:
			// 1. If this is after onload, and sendAfterOnload is set.
			// 2. If this is during onload, but autorun is false.  In that case,
			//    we want to send out errors (after a small delay) in case the
			//    page never loads (e.g. due to the error).
			//
			if ((BOOMR.hasSentPageLoadBeacon() || !impl.autorun) && impl.sendIntervalId === -1) {
				if (dup) {
					// If this is not during a load, and it's a duplicate of
					// a previous error, don't send a beacon just for itself
					return;
				}

				// errors outside of a load will be sent at the next interval
				impl.sendIntervalId = setTimeout(function() {
					impl.sendIntervalId = -1;

					// Don't send a beacon if we've already flushed the queue.  This
					// might happen for pre-onload becaons if the onload beacon was
					// sent after queueing
					if (impl.q.length === 0) {
						return;
					}

					// Queue a beacon whenever there isn't another one ongoing
					BOOMR.sendBeaconWhenReady(
						{
							// change this to an 'error' beacon
							"rt.start": "manual",
							"http.initiator": "error",

							// set it as an API beacon, which means it won't have any timing data
							"api": 1,

							// when
							"rt.tstart": now,
							"rt.end": now
						},
						function() {
							// add our errors to the beacon when ready
							impl.addErrorsToBeacon();
						},
						this);
				}, impl.isDuringLoad ? impl.sendIntervalDuringLoad : impl.sendInterval);
			}
		},

		/**
		 * Finds a duplicate BoomerangErrors in the specified array
		 *
		 * @param {Array[]} errors Array of BoomerangErrors
		 * @param {BoomerangError} err BoomerangError to check
		 *
		 * @returns {BoomerangError} BoomerangErrors that was duped against, if any
		 */
		findDuplicateError: function(errors, err) {
			if (!BOOMR.utils.isArray(errors) || typeof err === "undefined") {
				return undefined;
			}

			for (var i = 0; i < errors.length; i++) {
				if (errors[i].equals(err)) {
					return errors[i];
				}
			}

			return undefined;
		},

		/**
		 * Merges duplicate BoomerangErrors
		 *
		 * @param {Array[]} errors Array of BoomerangErrors
		 * @param {BoomerangError} err BoomerangError to check
		 * @param {boolean} bumpCount Increment the count of any found duplicates
		 *
		 * @returns {BoomerangError} BoomerangErrors that was duped against, if any
		 */
		mergeDuplicateErrors: function(errors, err, bumpCount) {
			if (!BOOMR.utils.isArray(errors) || typeof err === "undefined") {
				return undefined;
			}

			var dup = impl.findDuplicateError(errors, err);
			if (dup) {
				if (bumpCount) {
					dup.count += err.count;
				}

				return dup;
			}
			else {
				errors.push(err);
				return undefined;
			}
		},

		/**
		 * Fired on 'page_ready'
		 */
		pageReady: function() {
			impl.isDuringLoad = false;
		},

		/**
		 * Retrieves the current errors
		 *
		 * @returns {BoomerangError[]}
		 */
		getErrors: function() {
			if (impl.errors.length === 0) {
				return false;
			}

			return impl.errors;
		},

		/**
		 * Gets errors suitable for transmission in a URL
		 *
		 * @param {BoomerangError[]} errors BoomerangErrors array
		 *
		 * @returns {string} String for URL
		 */
		getErrorsForUrl: function(errors) {
			errors = impl.compressErrors(errors);
			return BOOMR.utils.serializeForUrl(errors);
		},

		/**
		 * Adds any queue'd errors to the beacon
		 */
		addErrorsToBeacon: function() {
			if (impl.q.length) {
				var err = this.getErrorsForUrl(impl.q);
				if (err) {
					BOOMR.addVar("err", err, true);
				}

				impl.q = [];
			}
		},

		/**
		 * Fired 'before_beacon'
		 */
		beforeBeacon: function(vars) {
			// Add errors to all beacon types except early beacons
			if (!vars || typeof vars.early === "undefined") {
				impl.addErrorsToBeacon();
			}
		},

		/**
		 * Wraps calls to functionName in an exception handler that will
		 * automatically report exceptions.
		 *
		 * @param {string} functionName Function name
		 * @param {object} that Target object
		 * @param {boolean} useCallingObject Whether or not to use the calling object for 'this'
		 * @param {number} callbackIndex Which argument is the callback
		 * @param {number} via Via
		 */
		wrapFn: function(functionName, that, useCallingObject, callbackIndex, via) {
			var origFn = that[functionName];

			if (typeof origFn !== "function") {
				return;
			}

			var rEL;
			if (functionName === "addEventListener") {
				// grab the native
				rEL = that.removeEventListener;
			}

			BOOMR.utils.overwriteNative(that, functionName, function BOOMR_plugins_errors_wrapped_function() {
				try {
					var args = Array.prototype.slice.call(arguments);
					var callbackFn = args[callbackIndex];

					// Determine the calling object: if 'this' is the Boomerang frame, we should swap it
					// to the correct top level window context.  If Boomerang isn't running in a frame,
					// BOOMR.window will still point to the top-level window.
					var targetObj = useCallingObject ? (this === window ? BOOMR.window : this) : that;
					var wrappedFn = impl.wrap(callbackFn, targetObj, via);

					args[callbackIndex] = wrappedFn;

					if (functionName === "addEventListener") {
						// For removeEventListener we need to keep track of this
						// unique tuple of target object, event name (arg0), original function
						// and capture (arg2)
						// Since we wrap the origFn with a new anonymous function we can't rely on
						// the browser's addEventListener to dedup multiple additions of the same
						// callback.
						if (!impl.trackFn(targetObj, args[0], callbackFn, args[2], wrappedFn)) {
							// if the callback is already tracked, we won't call addEventListener
							return;
						}

						if (rEL) {
							// Remove the listener before adding it back in.
							// This takes care of the (pathological) case where code is relying on the native
							// de-dupping that the browser provides and BOOMR instruments `addEventListener` between
							// their redundant calls to `addEventListener`.
							// We detach with the native because there's no point in calling our wrapped version.
							rEL.apply(targetObj, arguments);
						}
					}

					return origFn.apply(targetObj, args);
				}
				catch (e) {
					// error during original callback setup
					impl.send(e, via);

					// re-throw
					throw e;
				}
			});
		},

		/**
		 * Tracks the specified function for removeEventListener.
		 *
		 * @param {object} target Target element (window, element, etc)
		 * @param {string} type Event type (name)
		 * @param {function} listener Original listener
		 * @param {boolean|object} useCapture|options Use capture flag or options object
		 * @param {function} wrapped Wrapped function
		 *
		 * @returns {boolean} `true` if function is not already tracked, false otherwise
		 */
		trackFn: function(target, type, listener, useCapture, wrapped) {
			if (!target) {
				return false;
			}

			if (impl.trackedFnIdx(target, type, listener, useCapture) !== -1) {
				// already tracked
				return false;
			}

			if (!target._bmrEvents) {
				target._bmrEvents = [];
			}

			// 3rd argment can be useCapture flag or options object that may contain a `capture` key.
			// Default is false in both cases
			useCapture = (useCapture && useCapture.capture || useCapture) === true;

			target._bmrEvents.push([type, listener, useCapture, wrapped]);
			return true;
		},

		/**
		 * Gets the index of the tracked function.
		 *
		 * @param {object} target Target element (window, element, etc)
		 * @param {string} type Event type (name)
		 * @param {function} listener Original listener
		 * @param {boolean|object} useCapture|options Use capture flag or options object
		 *
		 * @returns {number} Index of already tracked function, or -1 if it doesn't exist
		 */
		trackedFnIdx: function(target, type, listener, useCapture) {
			var i, f;

			if (!target) {
				return;
			}

			if (!target._bmrEvents) {
				target._bmrEvents = [];
			}

			// 3rd argment can be useCapture flag or options object that may contain a `capture` key.
			// Default is false in both cases
			useCapture = (useCapture && useCapture.capture || useCapture) === true;

			for (i = 0; i < target._bmrEvents.length; i++) {
				f = target._bmrEvents[i];
				if (f[0] === type &&
				    f[1] === listener &&
				    f[2] === useCapture) {
					return i;
				}
			}

			return -1;
		},

		/**
		 * Wraps removeEventListener to work with our wrapFn
		 *
		 * @param {object} that Target object
		 */
		wrapRemoveEventListener: function(that) {
			var fn = "removeEventListener", origFn = that[fn], idx, wrappedFn;

			if (typeof origFn !== "function") {
				return;
			}

			BOOMR.utils.overwriteNative(that, fn, function BOOMR_plugins_errors_wrapped_removeEventListener(type, listener, useCapture) {
				var targetObj = this === window ? BOOMR.window : this;

				idx = impl.trackedFnIdx(targetObj, type, listener, useCapture);

				if (idx !== -1) {
					wrappedFn = targetObj._bmrEvents[idx][3];

					// remove our wrapped function instead
					origFn.call(targetObj, type, wrappedFn, useCapture);

					// remove bookkeeping
					targetObj._bmrEvents.splice(idx, 1);
				}
				else {
					// unknown, pass original args
					origFn.call(targetObj, type, listener, useCapture);
				}
			});
		},

		/**
		 * Wraps the function in an exception handler that will
		 * automatically report exceptions.
		 *
		 * @param {function} fn Function
		 * @param {object} that Target object
		 * @param {number} via Via (optional)
		 *
		 * @returns {function} Wrapped function
		 *
		 * @memberof BOOMR.plugins.Errors
		 */
		wrap: function(fn, that, via) {
			if (typeof fn !== "function") {
				// Return the input argument as-is.  This might happen if the argument
				// to setTimeout/setInterval is a string, which is deprecated but supported
				// by all browsers, however it isn't something we can wrap (we don't want to have
				// eval statements in the code).
				return fn;
			}

			via = via || BOOMR.plugins.Errors.VIA_APP;

			// ensure the document.domain is OK before we wrap the function
			BOOMR_check_doc_domain();

			return function BOOMR_plugins_errors_wrap() {
				try {
					return fn.apply(that, arguments);
				}
				catch (e) {
					// Check for IE/Edge error "Can't execute code from freed script"
					if (e.number === -2146823277 &&
						(via === BOOMR.plugins.Errors.VIA_EVENTHANDLER || via === BOOMR.plugins.Errors.VIA_TIMEOUT)) {
						// Event listeners that reference freed scripts don't generate errors in IE
						// Our call to a freed script does though, don't report the error
						return;
					}

					if (!BOOMR.isUnloaded) {
						// Report error during callback
						impl.send(e, via);
					}

					// re-throw
					throw e;
				}
			};
		},

		/**
		 * Runs the function, watching for exceptions
		 *
		 * @param {function} fn Function
		 * @param {object} that Target object
		 * @param {object[]} args Arguments
		 *
		 * @memberof BOOMR.plugins.Errors
		 */
		test: function() {
			var fn, that, args;
			if (arguments.length === 0) {
				return undefined;
			}

			// the function to run is the first argument
			fn = arguments[0];
			if (typeof fn !== "function") {
				return undefined;
			}

			// the object is the second
			that = arguments.length > 1 ? arguments[1] : BOOMR.window;

			// additional arguments after
			var args = Array.prototype.slice.call(arguments, 2);

			// run the fn
			return impl.wrap(fn, that).apply(that, args);
		},

		/**
		 * Normalizes an object to a string
		 *
		 * @param {object} obj Object
		 * @returns {string} String version of the object
		 */
		normalizeToString: function(obj) {
			if (typeof obj === "undefined") {
				return "undefined";
			}
			else if (obj === null) {
				return "null";
			}
			else if (typeof obj === "number" && isNaN(obj)) {
				return "NaN";
			}
			else if (obj === "") {
				return "(empty string)";
			}
			else if (obj === 0) {
				return "0";
			}
			else if (!obj) {
				return "false";
			}
			else if (typeof obj === "function") {
				return "(function)";
			}
			else if (obj && typeof obj.toString === "function") {
				return obj.toString();
			}
			else {
				return "(unknown)";
			}
		},

		/**
		 * Compresses BoomerangErrors to a smaller properties for transmission
		 *
		 * count -> n if > 1
		 * frames -> f
		 * frames[].lineNumber -> f[].l
		 * frames[].columnNumber -> f[].c
		 * frames[].functionName -> f[].f
		 * frames[].fileName -> f[].w or .wo (stripped of root origin)
		 * events -> e
		 * events[].type -> e[].t
		 * events[].timestamp -> e[].d
		 * events[].[other] -> each type has its own data
		 * source -> s
		 * via -> v
		 * type -> t
		 * code -> c
		 * message -> m
		 * extra -> x
		 * events -> e
		 * timestamp -> d (base 36)
		 *
		 * stack, fileName, functionName, lineNumber and columnNumber are dropped
		 * since they're frame[0]
		 *
		 * @params {BoomerangError[]} errors Errors array
		 *
		 * @returns {BoomerangError[]} Compressed errors array
		 */
		compressErrors: function(errors) {
			var i, j, err, frame, evt, minFrame, minEvent, o, obj, timestamp = 0;

			// get the origin
			o = BOOMR.window.location.origin;

			// minimize the contents of each error
			for (i = 0; i < errors.length; i++) {
				err = errors[i];

				// we're going to create a new object with minimized property
				// names and values to reduce byte size
				obj = {};

				// 1-count is assumed
				if (err.count !== 1) {
					obj.n = err.count;
				}

				if (typeof err.timestamp === "number") {
					timestamp = err.timestamp;
					obj.d = err.timestamp.toString(36);
				}

				// frames
				if (err.frames.length) {
					obj.f = [];

					// compress all frames
					for (j = 0; j < err.frames.length; j++) {
						frame = err.frames[j];

						// encode numeric properties
						if (frame.lineNumber) {
							frame.lineNumber = parseInt(frame.lineNumber, 10);
						}

						if (frame.columnNumber) {
							frame.columnNumber = parseInt(frame.columnNumber, 10);
						}

						minFrame = {
							l: frame.lineNumber,
							c: frame.columnNumber
						};

						// drop origin from filename
						if (typeof frame.fileName === "string") {
							if (frame.fileName.indexOf(o) !== -1) {
								minFrame.wo = frame.fileName.replace(o, "");
							}
							else {
								minFrame.w = frame.fileName;
							}
						}

						if (typeof frame.functionName === "string") {
							minFrame.f = frame.functionName;
						}

						obj.f.push(minFrame);
					}
				}

				// don't copy events if there aren't any
				if (err.events.length) {
					obj.e = [];

					// compress all events
					for (j = 0; j < err.events.length; j++) {
						evt = err.events[j];

						minEvent = {
							t: evt.type,
							d: timestamp ? (timestamp - evt.timestamp) : evt.timestamp
						};

						// type-specific compression
						if (evt.type === BOOMR.plugins.Errors.EVENT_CLICK) {
							if (evt.id) {
								minEvent.i = evt.id;
							}

							if (evt.name) {
								minEvent.n = evt.name;
							}

							if (evt.tagName) {
								minEvent.g = evt.tagName;
							}
						}
						else if (evt.type === BOOMR.plugins.Errors.EVENT_NETWORK) {
							if (evt.url) {
								minEvent.u = evt.url;
							}

							if (evt.method) {
								minEvent.m = evt.method;
							}

							if (evt.result) {
								minEvent.r = evt.result;
							}
						}
						else if (evt.type === BOOMR.plugins.Errors.EVENT_LOG) {
							if (evt.severity) {
								minEvent.s = evt.severity;
							}

							if (evt.message) {
								minEvent.m = evt.message;
							}
						}

						obj.e.push(minEvent);
					}
				}

				// don't need to add these properties as they're in the first frame:
				// lineNumber
				// columnNumber
				// functionName
				// fileName

				//
				// Only copy non-default values
				//
				if (err.source !== BOOMR.plugins.Errors.SOURCE_APP) {
					obj.s = err.source;
				}

				if (typeof err.via !== "undefined" && err.via !== BOOMR.plugins.Errors.VIA_APP) {
					obj.v = err.via;
				}

				if (typeof err.type !== "undefined" && err.type !== "Error") {
					obj.t = err.type;
				}

				if (err.code) {
					obj.c = err.code;
				}

				if (err.message) {
					obj.m = err.message;
				}

				if (err.extra) {
					obj.x = err.extra;
				}

				// send minimized object
				errors[i] = obj;
			}

			return errors;
		}

	};

	//
	// Exports
	//
	var E = BOOMR.plugins.Errors = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {function} [config.Errors.onError] Callback to fire when
		 * an error occurs
		 *
		 * @param {boolean} [config.Errors.monitorGlobal] Monitor `window.onerror`
		 * @param {boolean} [config.Errors.monitorNetwork] Monitor XHR errors
		 * @param {boolean} [config.Errors.monitorConsole] Monitor `console.error`
		 * @param {boolean} [config.Errors.monitorEvents] Monitor event callbacks
		 * (from `addEventListener`).
		 * @param {boolean} [config.Errors.monitorTimeout] Monitor `setTimout`
		 * and `setInterval`.
		 * @param {boolean} [config.Errors.monitorRejections] Monitor unhandled
		 * promise rejections.
		 * @param {boolean} [config.Errors.monitorReporting] Monitor Reporting API
		 * warnings.
		 * @param {boolean} [config.Errors.sendAfterOnload] Whether or not to
		 * send errors after the page load beacon.  If set to false, only errors
		 * that happened up to the page load beacon will be captured.
		 * @param {boolean} [config.Errors.sendInterval] If `sendAfterOnload` is
		 * true, how often to send the latest batch of errors.
		 * @param {number} [config.Errors.maxErrors] Maximum number of errors
		 * to track per page.
		 *
		 * @returns {@link BOOMR.plugins.Errors} The Errors plugin for chaining
		 * @memberof BOOMR.plugins.Errors
		 */

		init: function(config) {
			var i, report, msg;

			BOOMR.utils.pluginConfig(impl, config, "Errors",
				["onError", "monitorGlobal", "monitorNetwork", "monitorConsole",
				 "monitorEvents", "monitorTimeout", "monitorReporting", "monitorRejections",
				 "sendAfterOnload", "sendInterval", "maxErrors"]);

			if (impl.initialized) {
				return this;
			}

			if (config && typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			impl.initialized = true;

			// subscribe to events
			BOOMR.subscribe("before_beacon", impl.beforeBeacon, null, impl);
			BOOMR.subscribe("page_ready", impl.pageReady, null, impl);

			// register an event
			BOOMR.registerEvent("error");

			// hook into window.onError if configured
			if (impl.monitorGlobal) {
				try {
					// globalOnError might be set by loader snippet
					if (!BOOMR.globalOnError) {
						BOOMR.globalOnError = BOOMR.window.onerror;
					}
					else {
						// Another error wrapper came in after us - call this new onerror first.  Since
						// it presumably wrapped our original handler, that will likely be called but
						// will detect Boomerang has loaded and will call *its* original onerror handler.
						if (BOOMR.window.onerror && !BOOMR.window.onerror._bmr) {
							BOOMR.globalOnError = BOOMR.window.onerror;
						}
					}

					BOOMR.utils.overwriteNative(BOOMR.window, "onerror", function BOOMR_plugins_errors_onerror(message, fileName, lineNumber, columnNumber, error) {
						// onerror may be called with an `ErrorEvent` object (eg. https://github.com/angular/zone.js/issues/1108)
						if (typeof error === "undefined" &&
						    typeof message === "object" && typeof message.error === "object" && message.error !== null) {
							error = message.error;
						}

						// a SyntaxError can produce a null error
						if (typeof error !== "undefined" && error !== null) {
							impl.send(error, E.VIA_GLOBAL_EXCEPTION_HANDLER);
						}
						else {
							// older browsers will not send an error object to the global error handler making deduplication difficult.
							// If an error is caught and reported (eg. in an error wrapper of addEventListener or setTimeout) then it will
							// also be reported here.
							// We could possibly check that the last error in our queue did not arrive via the global error handler
							// and assume it was the same error but more testing will be required. We cannot compare the error message,
							// since the message of the original error and the one that is provided here will be different in some cases.
							impl.send({
								message: message,
								fileName: fileName,
								lineNumber: lineNumber,
								columnNumber: columnNumber,
								noStack: true
							}, E.VIA_GLOBAL_EXCEPTION_HANDLER);
						}

						if (typeof BOOMR.globalOnError === "function") {
							return BOOMR.globalOnError.apply(BOOMR.window, arguments);
						}

						return false; // don't prevent the firing of the default event handler
					});

					// send any errors from the loader snippet
					if (BOOMR.globalErrors) {
						for (var i = 0; i < BOOMR.globalErrors.length; i++) {
							impl.send(BOOMR.globalErrors[i], E.VIA_GLOBAL_EXCEPTION_HANDLER);
						}

						delete BOOMR.globalErrors;
					}
				}
				catch (e) {
					
				}
			}

			// listen for XHR errors
			if (impl.monitorNetwork) {
				BOOMR.subscribe("xhr_error", function BOOMR_plugins_errors_onxhrerror(resource) {
					impl.send({
						code: resource.status,
						message: resource.url,
						noStack: true
					}, E.VIA_NETWORK);
				});
			}


			// listen for unhandled promise rejections
			if (impl.monitorRejections && BOOMR.window.PromiseRejectionEvent) {
				// add event listener instead of window.onunhandledrejection
				BOOMR.utils.addListener(BOOMR.window, "unhandledrejection", function BOOMR_plugins_errors_onrejection(event) {
					var stack, message = "Unhandled Promise Rejection";
					if (event && event.reason) {
						if (typeof event.reason === "string") {
							message = event.reason;
						}
						else {
							if (typeof event.reason.stack === "string") {
								stack = event.reason.stack;
							}
							if (typeof event.reason.message === "undefined") {
								message = impl.normalizeToString(event.reason);
							}
							else {
								message = impl.normalizeToString(event.reason.message);
							}
						}

						impl.send({
							message: message,
							stack: stack,
							noStack: stack ? false : true
						}, E.VIA_REJECTION);
					}
				}, true);
			}

			// listen for calls to console.error
			if (impl.monitorConsole) {
				if (!BOOMR.window.console) {
					BOOMR.window.console = {};
				}

				BOOMR.globalConsole = BOOMR.window.console.error;

				try {
					BOOMR.utils.overwriteNative(BOOMR.window.console, "error", function BOOMR_plugins_errors_console_error() {
						// get a copy of the args
						var args = Array.prototype.slice.call(arguments);

						if (args.length === 1) {
							// send just the first argument
							impl.send(impl.normalizeToString(args[0]), E.VIA_CONSOLE);
						}
						else {
							// get the array of arguments
							impl.send(impl.normalizeToString(args), E.VIA_CONSOLE);
						}

						if (typeof BOOMR.globalConsole === "function") {
							if (typeof BOOMR.globalConsole.apply === "function") {
								BOOMR.globalConsole.apply(this, args);
							}
							else {
								BOOMR.globalConsole(args[0], args[1], args[2]);
							}
						}
					});
				}
				catch (h) {
					
				}
			}

			// listen for errors in addEventListener callbacks
			if (impl.monitorEvents) {
				// EventTarget's addEventListener will catch events from window, document, Element and XHR in modern browsers.
				// We want to instrument addEventListener at the end of the protocol chain in order to avoid conflicts with
				// other libraries that might be wrapping AEL at a different level.
				// This pattern is safer since other libraries' wrappers will get called. The downside is that our wrapper
				// will not be called and any error in the AEL callback will be caught by the global error handler instead.
				if (BOOMR.window.EventTarget) {
					impl.wrapFn("addEventListener", BOOMR.window.EventTarget.prototype, true, 1, E.VIA_EVENTHANDLER);
					impl.wrapRemoveEventListener(BOOMR.window.EventTarget.prototype);
				}
				else {
					if (BOOMR.window) {
						impl.wrapFn("addEventListener", BOOMR.window, false, 1, E.VIA_EVENTHANDLER);
						impl.wrapRemoveEventListener(BOOMR.window);
					}

					if (BOOMR.window.Node) {
						impl.wrapFn("addEventListener", BOOMR.window.Node.prototype, true, 1, E.VIA_EVENTHANDLER);
						impl.wrapRemoveEventListener(BOOMR.window.Node.prototype);
					}

					if (BOOMR.window.XMLHttpRequest) {
						impl.wrapFn("addEventListener", BOOMR.window.XMLHttpRequest.prototype, true, 1, E.VIA_EVENTHANDLER);
						impl.wrapRemoveEventListener(BOOMR.window.XMLHttpRequest.prototype);
					}
				}
			}

			// listen for errors in timeout callbacks
			if (impl.monitorTimeout) {
				impl.wrapFn("setTimeout", BOOMR.window, false, 0, E.VIA_TIMEOUT);
				impl.wrapFn("setInterval", BOOMR.window, false, 0, E.VIA_TIMEOUT);
			}

			// listen for Reporting API warnings
			if (impl.monitorReporting && BOOMR.window.ReportingObserver) {
				impl.reportingObserver = new BOOMR.window.ReportingObserver(function(reports, observer) {
					if (BOOMR.utils.isArray(reports)) {
						for (i = 0; i < reports.length; i++) {
							report = reports[i];
							msg = report && report.body && (report.body.message || report.body.reason);
							if (msg) {
								impl.send({
									message: msg,
									fileName: report.body.sourceFile || report.url,
									lineNumber: report.body.lineNumber,
									columnNumber: report.body.columnNumber,
									noStack: true
								}, E.VIA_REPORTING_API);
							}
						}
					}
				}, {buffered: true});

				impl.reportingObserver.observe();
			}


			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.Errors
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Determines if Error tracking is initialized.
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.Errors
		 */
		is_supported: function() {
			return impl.initialized;
		},

		//
		// Public Exports
		//
		// constants
		/**
		 * This error came from the app
		 */
		SOURCE_APP: 1,

		/**
		 * This error came from Boomerang
		 */
		SOURCE_BOOMERANG: 2,

		//
		// Via: Where the error came from
		//
		/**
		 * This error was generated by {@link BOOMR.plugins.Errors.wrap},
		 * {@link BOOMR.plugins.Errors.test} or {@link BOOMR.plugins.Errors.send}
		 */
		VIA_APP: 1,

		/**
		 * This error was caught by the Global Exception handler (e.g.
		 * `window.onerror`).
		 */
		VIA_GLOBAL_EXCEPTION_HANDLER: 2,

		/**
		 * This was a network error caught by XMLHttpRequest instrumentation.
		 */
		VIA_NETWORK: 3,

		/**
		 * This was caught by `console.error()`
		 */
		VIA_CONSOLE: 4,

		/**
		 * This was caught by monitoring `addEventListener()`
		 */
		VIA_EVENTHANDLER: 5,

		/**
		 * This was caught by monitoring `setTimeout()` or `setInterval()`
		 */
		VIA_TIMEOUT: 6,

		/**
		 * This was caught by monitoring unhandled promise rejection events
		 */
		VIA_REJECTION: 7,

		/**
		 * Observed with the Reporting API
		 */
		VIA_REPORTING_API: 8,

		//
		// Events
		//
		/**
		 * A click event
		 */
		EVENT_CLICK: 1,

		/**
		 * A network event
		 */
		EVENT_NETWORK: 2,

		/**
		 * A console.log event
		 */
		EVENT_LOG: 3,

		// functions
		send: impl.send,
		wrap: impl.wrap,
		test: impl.test,

		// objects
		BoomerangError: BoomerangError

		//
		// Test Exports (only for debug)
		//
	};

}());

/**
 * Captures session IDs and campaign information from third party analytic vendors
 * installed on the same page.
 *
 * Third party analytics vendors currently supported:
 *
 * * Google Analytics
 * * Adobe Analytics (formerly Omniture Sitecatalyst)
 * * IBM Digital Analytics (formerly Coremetrics)
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `tp.ga.clientid`: Google Analytics [clientID](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id) (unique id per visitor)
 * * `tp.ga.utm_source`: Google Analytics [Campaign source](https://support.google.com/analytics/answer/1033863?hl=en)
 * * `tp.ga.utm_medium`: Google Analytics [Campaign medium](https://support.google.com/analytics/answer/1033863?hl=en)
 * * `tp.ga.utm_term`: Google Analytics [Campaign term](https://support.google.com/analytics/answer/1033863?hl=en)
 * * `tp.ga.utm_content`: Google Analytics [Campaign content](https://support.google.com/analytics/answer/1033863?hl=en)
 * * `tp.ga.utm_campaign`: Google Analytics [Campaign ID](https://support.google.com/analytics/answer/1033863?hl=en)
 * * `tp.aa.aid`: Adobe Analytics [Analytics ID (AID)](https://marketing.adobe.com/resources/help/en_US/reference/)
 * * `tp.aa.mid`: Adobe Analytics [Marketing ID (MID)](https://marketing.adobe.com/resources/help/en_US/reference/)
 * * `tp.aa.campaign`: Adobe Analytics [Campaign ID](https://marketing.adobe.com/resources/help/en_US/reference/)
 * * `tp.aa.purchaseid`: Adobe Analytics [Purchase ID](https://marketing.adobe.com/resources/help/en_US/reference/)
 * * `tp.ia.coreid`: IBM Analytics [Core ID (unique id per visitor)](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.mmc_vendor`: IBM Analytics [Campaign vendor](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.mmc_category`: IBM Analytics [Campaign category](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.mmc_placement`: IBM Analytics [Campaign placement](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.mmc_item`: IBM Analytics [Campaign item](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.sp_type`: IBM Analytics [Site promotion type](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.sp_promotion`: IBM Analytics [Site promotion](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.sp_link`: IBM Analytics [Site promotion link](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.re_version`: IBM Analytics [Real estate version](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.re_pagearea`: IBM Analytics [Real estate page area](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html)
 * * `tp.ia.re_link`: IBM Analytics [Real estate link](https://www.ibm.com/support/knowledgecenter/en/SSPG9M/Analytics/kc_welcome_analytics.html) *
 *
 * @class BOOMR.plugins.TPAnalytics
 */
/*eslint dot-notation:0*/
(function() {
	"use strict";

	
	

	if (BOOMR.plugins.TPAnalytics) {
		return;
	}

	/**
	 * Warning logging
	 *
	 * @param {string} msg Message
	 */
	function warn(msg) {
		BOOMR.warn(msg, "TPAnalytics");
	}

	var impl = {
		complete: false,

		// collect client IDs, default to false
		// overridable by config
		clientids: false,

		// list of params we won't beacon
		// overridable by config
		dropParams: [],

		/**
		 * Google Analytics
		 * For Universal Analytics there is a function named "ga" which is used to retreive the clientid
		 * ref: https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference
		 * By default the clientid is stored in a cookie named "_ga" for 2 years
		 * ref: https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id
		 * For Classic GA, we'll parse the "__utma" cookie
		 *
		 * @return {Object} captured metrics
		 */
		googleAnalytics: function() {
			var data = {};
			var w = BOOMR.window;
			var i, param, value, cid, trackers;

			// list of query params that we want to capture
			// ref: https://support.google.com/analytics/answer/1033863
			var QUERY_PARAMS = ["utm_source", "utm_medium", "utm_term", "utm_content", "utm_campaign"];

			if (impl.clientids) {
				// check for google's global "ga" function then get the clientId
				if (typeof w.ga === "function") {
					try {
						w.ga(function(tracker) {
							// tracker may be undefined if using GTM or named trackers
							if (tracker) {
								data["clientid"] = tracker.get("clientId");
							}
						});
						if (!data["clientid"] && typeof w.ga.getAll === "function") {
							// we may have named trackers, the clientid should be the same for all of them
							trackers = w.ga.getAll();
							if (trackers && trackers.length > 0) {
								data["clientid"] = trackers[0].get("clientId");
							}
						}
					}
					catch (err) {
						// "ga" wasn't google analytics?
						warn("googleAnalytics: " + err);
					}
				}
				// if we still don't have the clientid then fallback to cookie parsing
				if (!data["clientid"]) {
					// cookie parsing for "Universal" GA
					// _ga cookie format : GA1.2.XXXXXXXXXX.YYYYYYYYYY
					// where XXXXXXXXXX.YYYYYYYYYY is the clientid
					cid = BOOMR.utils.getCookie("_ga");
					if (cid) {
						cid = cid.split(".");
						if (cid && cid.length === 4) {
							data["clientid"] = cid[2] + "." + cid[3];
						}
					}
					else {
						// cookie parsing for "Classic" GA
						// __utma #########.XXXXXXXXXX.YYYYYYYYYY.##########.##########.#
						// where XXXXXXXXXX.YYYYYYYYYY is the clientid
						cid = BOOMR.utils.getCookie("__utma");
						if (cid) {
							cid = cid.split(".");
							if (cid && cid.length === 6) {
								data["clientid"] = cid[1] + "." + cid[2];
							}
						}
					}
				}
			}

			// capture paramters from the url that are relevant to google analytics
			for (i = 0; i < QUERY_PARAMS.length; i++) {
				param = QUERY_PARAMS[i];
				value = BOOMR.utils.getQueryParamValue(param);
				if (value) {
					data[param] = value;
				}
			}

			return data;
		},

		/**
		 * Adobe Analytics
		 *
		 * AID: Analytics ID
		 * MID: Marketing ID
		 * Adobe's Marketing Cloud ID service uses a cookie named AMVC_#####@AdobeOrg,
		 * where ##### is the site owner's "client id". It stores the valud of MID and optionally AID
		 * If the site is not using Marketing Cloud, Analytics uses a legacy cookie named s_vi (AID)
		 * If the s_vi cookie is unable to be set due to 3rd party cookie restrictions,
		 * there is a fallback to a 1st party cookie named s_fid (AID).
		 *
		 * ref: https://marketing.adobe.com/resources/help/en_US/mcvid/mcvid_cookies.html
		 * ref: https://marketing.adobe.com/resources/help/en_US/mcvid/mcvid_idvars.html
		 * ref: https://marketing.adobe.com/resources/help/en_US/mcvid/mcvid_getmcvid.html
		 * ref: https://marketing.adobe.com/resources/help/en_US/mcvid/mcvid_getanalyticsvisitorid.html
		 *
		 * eVars and props aren't captured
		 *
		 * @return {Object} captured metrics
		 */
		adobeAnalytics: function() {
			var data = {};
			var aid, mid, amcv, visitor, m;
			var w = BOOMR.window;

			// regex that extracts the "organization id" from the AMCV_ cookie
			var AMCV_REGEX = /AMCV_([A-Z0-9]+)%40AdobeOrg/;

			// regex that extracts the id from the s_vi cookie (data between | and [)
			var SVI_REGEX = /\|([^\[]+)/;

			// check a few global vars to see if any Adobe products are installed
			// Adobe/Omniture's Data Tag Management global "_satellite" function
			// or Adobe/Omniture's Test&Target global "mboxCreate" function
			// or Adobe's Marketing Cloud ID Service's (AMCV) global "Visitor" function
			if (typeof w._satellite !== "undefined" || typeof w.mboxCreate === "function" || typeof w.Visitor === "function" || typeof w.s === "object") {
				if (impl.clientids) {
					// We'll try to fetch the "organization id" by using the global "s.visitor" object
					// "s" isn't reliably Adobe's SiteCatalyst object, the site owner might have renamed it
					if (typeof w.s === "object" &&
					    typeof w.s.visitor === "object" &&
					    typeof w.s.visitor.getAnalyticsVisitorID === "function" &&
					    typeof w.s.visitor.getMarketingCloudVisitorID === "function") {
						try {
							mid = w.s.visitor.getMarketingCloudVisitorID();
							if (mid) {
								data["mid"] = mid;
							}
							aid = w.s.visitor.getAnalyticsVisitorID();
							if (aid) {
								data["aid"] = w.s.visitor.getAnalyticsVisitorID();
							}
						}
						catch (err) {
							warn("adobeAnalytics: " + err);
						}
					}
					else {
						// Try extracting the "organization id" from the AMCV_ cookie instead
						// the result of Vistor.getInstance should be the same as if we did have "s.visitor"
						amcv = AMCV_REGEX.exec(w.document.cookie);
						if (amcv && typeof w.Visitor === "function" && typeof w.Visitor.getInstance === "function") {
							// we might have more than one AMCV_ cookie but we just take the first match for now
							try {
								visitor = w.Visitor.getInstance(amcv[1] + "@AdobeOrg");
								if (visitor && typeof visitor.getAnalyticsVisitorID === "function" && typeof visitor.getMarketingCloudVisitorID === "function") {
									mid = visitor.getMarketingCloudVisitorID();
									if (mid) {
										data["mid"] = mid;
									}
									aid = visitor.getAnalyticsVisitorID();
									if (aid) {
										data["aid"] = visitor.getAnalyticsVisitorID();
									}
								}
							}
							catch (err) {
								warn("adobeAnalytics: " + err);
							}
						}
						else {
							// AMCV doesn't seem to be installed
							// the legacy session id is in a cookie named s_vi if the publisher is using a cname to collect metrics
							// ie. third party cookie but on the same root domain name
							aid = BOOMR.utils.getCookie("s_vi");
							if (aid) {
								// s_vi will be in a format like this "[CS]v1|2B8147DA850785C4-6000010E2006DC28[CE]"
								// we need to extract the text between the pipe and the [CE]
								m = SVI_REGEX.exec(aid);
								if (m && m.length > 0) {
									aid = m[1];
								}
								else {
									aid = "";
								}
							}
							else {
								// fallback session id is a first party cookie named s_fid
								// eg. 6B280792FE0CFE56-162DA99B1988A2F8
								aid = BOOMR.utils.getCookie("s_fid");
							}
							if (aid) {
								data["aid"] = aid;
							}
						}
					}
				}

				if (typeof w.s === "object") {
					// get adobe campaign id
					// ref: https://marketing.adobe.com/resources/help/en_US/sc/implement/campaign.html
					if (typeof w.s.campaign === "string" && w.s.campaign) {
						data["campaign"] = w.s.campaign;
					}
					// get adobe purchase id
					// ref: https://marketing.adobe.com/resources/help/en_US/sc/implement/purchaseID.html
					if (typeof w.s.purchaseID === "string" && w.s.purchaseID) {
						data["purchaseid"] = w.s.purchaseID;
					}
				}
			}

			return data;
		},

		/**
		 * IBM Digital Analytics (CoreMetrics)
		 * IBM provides a global cmRetrieveUserID function to get the "Core ID" ("Visitor ID")
		 * The value is stored in a cookie named "CoreID6". Expiration: 15 years from date set.
		 * ref: https://www.ibm.com/support/knowledgecenter/SSPG9M/Implementation/AccessingIBMVisitorCookie.html
		 *
		 * off-site campaign information for "Marketing Management Center" (MMC), if available, is stored in a query parameter named "cm_mmc"
		 * ref: https://www.ibm.com/support/knowledgecenter/SSPG9M/Analytics/MarketingReports/cm_mmcparameter.html
		 *
		 * on-site "Site Promotions Analysis", if available, is stored in a query paramter named "cm_sp"
		 * ref: https://www.ibm.com/support/knowledgecenter/SSPG9M/Implementation/impl_sitepromo.html
		 *
		 * on-site "Real Estate Analysis", if available, is stored in a query parameter named "cm_re"
		 * ref: https://www.ibm.com/support/knowledgecenter/SSPG9M/Implementation/impl_realestate.html
		 *
		 * @return {Object} captured metrics
		 */
		ibmAnalytics: function() {
			var data = {};
			var w = BOOMR.window;
			var param, m, i, k, regex, fieldnames;

			// regexs to parse the query parameters into their fields
			var metrics = {
				"cm_mmc": [/([^&#]+?)-_-([^&#]+?)-_-([^&#]+?)-_-([^&#]+)/, ["mmc_vendor", "mmc_category", "mmc_placement", "mmc_item"]],
				"cm_sp": [/([^&#]+?)-_-([^&#]+?)-_-([^&#]+)/, ["sp_type", "sp_promotion", "sp_link"]],
				"cm_re": [/([^&#]+?)-_-([^&#]+?)-_-([^&#]+)/, ["re_version", "re_pagearea", "re_link"]]
			};

			if (impl.clientids && typeof w.cmRetrieveUserID === "function") {
				try {
					// in the current implementation of cmRetreiveUserID, the callback is called immediately (ie, not on a timer)
					w.cmRetrieveUserID(function(userid) {
						data["coreid"] = userid;
					});
				}
				catch (err) {
					// not coremetrics or not properly setup
					warn("ibmAnalytics: " + err);
				}
			}

			// capture analytics data from url query params
			for (k in metrics) {
				if (metrics.hasOwnProperty(k)) {
					param = BOOMR.utils.getQueryParamValue(k);
					if (param) {
						regex = metrics[k][0];
						fieldnames = metrics[k][1];
						m = regex.exec(param);
						if (m && m.length > fieldnames.length) {
							for (i = 0; i < fieldnames.length; i++) {
								if (m[i + 1]) {
									// value might be "null" or "na" but send it anyways
									data[fieldnames[i]] = decodeURIComponent(m[i + 1]);
								}
							}
						}
					}
				}
			}

			return data;
		},

		/**
		 * Executed on `page_ready` and `xhr_load`
		 */
		done: function(edata, ename) {
			var vendor, data, key, beaconParam;
			var vendors = {
				"ga": this.googleAnalytics,
				"aa": this.adobeAnalytics,
				"ia": this.ibmAnalytics
			};

			if (this.complete) {
				// we've already added data to the beacon
				return;
			}

			//
			// Don't add TPAnalytics to SPA Soft or XHR beacons --
			// Only add to Page Load (ename: load) and SPA Hard (ename: xhr
			// and initiator: spa_hard) beacons.
			//
			if (ename !== "load" && (!edata || edata.initiator !== "spa_hard")) {
				return;
			}

			for (vendor in vendors) {
				data = vendors[vendor]();
				for (var key in data) {
					var beaconParam = "tp." + vendor + "." + key;
					if (!BOOMR.utils.inArray(beaconParam, this.dropParams)) {
						BOOMR.addVar(beaconParam, data[key], true);
					}
				}
			}

			this.complete = true;

			BOOMR.sendBeacon();
		},

		/*
		 * Fired when the state changes from pre-render to visible
		 */
		prerenderToVisible: function() {
			// ensure we add our data to the beacon even if we had added it
			// during prerender (in case another beacon went out in between)
			this.complete = false;

			// add our data to the beacon
			this.done({}, "load");
		}
	};

	//
	// Exports
	//
	BOOMR.plugins.TPAnalytics = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} config.TPAnalytics.clientids Whether or not to include
		 * client IDs.
		 * @param {string[]} config.TPAnalytics.dropParams Parameters to not include
		 * on the beacon.
		 *
		 * @returns {@link BOOMR.plugins.TPAnalytics} The TPAnalytics plugin for chaining
		 * @example
		 * BOOMR.init({
		 *   TPAnalytics: {
		 *     clientids: false
		 *   }
		 * });
		 * @memberof BOOMR.plugins.TPAnalytics
		 */
		init: function(config) {
			BOOMR.utils.pluginConfig(impl, config, "TPAnalytics", ["clientids", "dropParams"]);

			if (!impl.initialized) {
				if (!BOOMR.utils.isArray(impl.dropParams)) {
					impl.dropParams = [];
				}
				// we'll add data to the beacon on whichever happens first
				BOOMR.subscribe("page_ready", impl.done, "load", impl);
				BOOMR.subscribe("xhr_load", impl.done, "xhr", impl);
				BOOMR.subscribe("prerender_to_visible", impl.prerenderToVisible, "load", impl);
				impl.initialized = true;
			}

			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof BOOMR.plugins.TPAnalytics
		 */
		is_complete: function() {
			return true;
		}
	};

}());

// TODO:
// 1. Options to only filter for specific marks / measures
// 2. Change values that are only ints into ints, not strings

//
// usertiming-compression.js
//
// Compresses UserTiming data.
//
// See http://nicj.net/compressing-usertiming/
//
// https://github.com/nicjansma/usertiming-compression.js
//
(function(window) {
    "use strict";

    // save old UserTimingCompression object for noConflict()
    var root;
    var previousObj;
    if (typeof window !== "undefined") {
        root = window;
        previousObj = root.UserTimingCompression;
    } else {
        root = {};
    }

    // model
    var self, UserTimingCompression = self = {};

    //
    // Functions
    //
    /**
     * Changes the value of UserTimingCompression back to its original value, returning
     * a reference to the UserTimingCompression object.
     *
     * @returns {object} Original UserTimingCompression object
     */
    UserTimingCompression.noConflict = function() {
        root.UserTimingCompression = previousObj;
        return UserTimingCompression;
    };

    /**
     * Trims the timing, returning an offset from the startTime in ms
     *
     * @param {number} time Time
     * @param {number} startTime Start time
     *
     * @returns {number} Number of ms from start time
     */
    UserTimingCompression.trimTiming = function(time, startTime) {
        if (typeof time !== "number") {
            time = 0;
        }

        if (typeof startTime !== "number") {
            startTime = 0;
        }

        // strip from microseconds to milliseconds only
        var timeMs = Math.round(time),
            startTimeMs = Math.round(startTime);

        return timeMs === 0 ? 0 : (timeMs - startTimeMs);
    };

    /**
     * Converts a number to base-36
     *
     * @param {number} n Number
     * @returns {number|string} Base-36 number, or empty string if undefined.
     */
    UserTimingCompression.toBase36 = function(n) {
        return (typeof n === "number") ? n.toString(36) : "";
    };

    /**
     * Gets all of the UserTiming entries for a frame

     * @param {object} frame Window or frame DOM object
     *
     * @returns {PerformanceEntry[]} UserTiming entries
     */
    UserTimingCompression.findUserTimingForFrame = function(frame) {
        var entries;

        if (!frame) {
            return [];
        }

        try {
            // Try to access location.href first to trigger any Cross-Origin
            // warnings.  There's also a bug in Chrome ~48 that might cause
            // the browser to crash if accessing X-O frame.performance.
            // https://code.google.com/p/chromium/issues/detail?id=585871
            // This variable is not otherwise used.
            /* eslint-disable no-unused-vars */
            var frameLoc = frame.location && frame.location.href;
            /* eslint-enable no-unused-vars */

            if (!("performance" in frame) ||
                !frame.performance ||
                !frame.performance.getEntriesByType) {
                return entries;
            }

            // gather marks and measures for this frame
            // TODO do we need to offset startTime?
            entries = frame.performance.getEntriesByType("mark");
            entries = entries.concat(frame.performance.getEntriesByType("measure"));
        } catch (e) {
            return entries;
        }

        return entries;
    };

    /**
     * Compresses UserTiming entry values
     *
     * @param {PerformanceEntry[]} entries Marks and measures
     * @param {object} options Options
     *
     * @returns {object} Compressed UserTiming values
     */
    UserTimingCompression.compressUserTiming = function(entries, options) {
        var i, e, time, latestTime = 0, entryNames = {};

        options = options || {};

        if (!entries || !entries.length) {
            return [];
        }

        // Gather entries into a lookup based on the name
        for (i = 0; i < entries.length; i++) {
            e = entries[i];

            // add an entry in the lookup if it doesn't already exist
            if (typeof entryNames[e.name] === "undefined") {
                entryNames[e.name] = [];
            }

            // add the relevant values for each type
            if (e.entryType === "mark") {
                entryNames[e.name].push({
                    startTime: e.startTime
                });
            } else if (e.entryType === "measure") {
                entryNames[e.name].push({
                    startTime: e.startTime,
                    duration: e.duration
                });
            }
        }

        //
        // Now, look through each named entry, compressing it's values.  The values
        // are sequential, and each startTime is offset by the previous start time.
        //
        for (var name in entryNames) {
            if (entryNames.hasOwnProperty(name)) {

                // if we were given a map of names, and this name doesn't exist in
                // the map, don't process this entry
                if (options.map && typeof options.map[name] === "undefined") {
                    continue;
                }

                var nameValues = entryNames[name];

                // change to the index in the map
                if (options.map && typeof options.map[name] !== "undefined") {
                    delete entryNames[name];
                    name = options.map[name];
                }

                // keep track of the last timestamp
                latestTime = 0;

                // iterate over all of this name's times
                for (i = 0; i < nameValues.length; i++) {

                    // the value will contain a startTime, and optionally, a duration
                    var value = nameValues[i];

                    // convert to base36, offset by the previous timestamp
                    time = self.toBase36(
                        self.trimTiming(value.startTime, latestTime));

                    // we can change the value of 0 to an empty string to save a byte
                    if (time === "0") {
                        time = "";
                    }

                    var finalValue = time;

                    // if this is a measure (with a duration), tack on "_[duration]"
                    if (typeof value.duration === "number") {
                        // round duration to nearest ms
                        var duration = self.toBase36(Math.round(value.duration));

                        finalValue += "_";

                        // 0-value durations get left off
                        if (duration !== "0") {
                            finalValue += duration;
                        }
                    }

                    // keep track of the latest time for the next value
                    latestTime = value.startTime;

                    // store this value back in the array
                    nameValues[i] = finalValue;
                }

                // join
                entryNames[name] = self.compressArray(nameValues);
            }
        }

        return entryNames;
    };

    /**
     * Converts entries to a Trie:
     * http://en.wikipedia.org/wiki/Trie
     *
     * Assumptions:
     * 1) All entries have unique keys
     * 2) Keys cannot have "!" in their name.
     * 3) All key's values are strings
     *
     * Leaf nodes in the tree are the key's values.
     *
     * If key A is a prefix to key B, key A will be suffixed with "!"
     *
     * @param {object} entries Performance entries
     * @returns {object} A trie
     */
    UserTimingCompression.convertToTrie = function(entries) {
        var trie = {}, name, i, value, letters, letter, cur, node;

        if (!entries) {
            return {};
        }

        for (name in entries) {
            if (!entries.hasOwnProperty(name)) {
                continue;
            }

            value = entries[name];
            letters = name.split("");
            cur = trie;

            for (i = 0; i < letters.length; i++) {
                letter = letters[i];
                node = cur[letter];

                if (typeof node === "undefined") {
                    // nothing exists yet, create either a leaf if this is the end of the word,
                    // or a branch if there are letters to go
                    cur = cur[letter] = (i === (letters.length - 1) ? value : {});
                } else if (typeof node === "string" || typeof node === "number") {
                    // this is a leaf, but we need to go further, so convert it into a branch
                    cur = cur[letter] = { "!": node };
                } else if (i === (letters.length - 1)) {
                    // this is the end of our key, and we've hit an existing node.  Add our timings.
                    cur[letter]["!"] = value;
                } else {
                    // continue onwards
                    cur = cur[letter];
                }
            }
        }

        return trie;
    };

    /**
     * Optimize the Trie by combining branches with no leaf
     *
     * @param {object} cur Current Trie branch
     * @param {boolean} top Whether or not this is the root node
     *
     * @returns {object} Optimized Trie
     */
    UserTimingCompression.optimizeTrie = function(cur, top) {
        var num = 0, node, ret, topNode;

        if (!cur) {
            return {};
        }

        for (node in cur) {
            if (typeof cur[node] === "object") {
                // optimize children
                ret = this.optimizeTrie(cur[node], false);
                if (ret) {
                    // swap the current leaf with compressed one
                    delete cur[node];
                    node = node + ret.name;
                    cur[node] = ret.value;
                }
            }
            num++;
        }

        if (num === 1) {
            // compress single leafs
            if (top) {
                // top node gets special treatment so we're not left with a {node:,value:} at top
                topNode = {};
                topNode[node] = cur[node];
                return topNode;
            } else {
                // other nodes we return name and value separately
                return { name: node, value: cur[node] };
            }
        } else if (top) {
            // top node with more than 1 child, return it as-is
            return cur;
        } else {
            // more than two nodes and not the top, we can't compress any more
            return false;
        }
    };

    /**
     * Compresses an Array of values
     *
     * @param {Array} entries Array of numbers
     *
     * @returns {string} Compressed array in string form
     */
    UserTimingCompression.compressArray = function(entries) {
        var dupeCount = 0, result = "";

        if (!entries || entries.length === 0 || entries.constructor !== Array) {
            return "";
        }

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];

            if (i < entries.length - 1 && entry === entries[i + 1]) {
                dupeCount++;
            } else if (dupeCount > 0) {
                result += (result !== "" ? "." : "") + entry + "*";
                if (dupeCount >= 2) {
                    result += (dupeCount + 1);
                }

                dupeCount = 0;
            } else {
                result += (result !== "" ? "." : "") + entry;
            }
        }

        // if it's just numeric, leave as a number so JSURL compresses it better
        if (/^\d+$/.test(result)) {
            return parseInt(result, 10);
        }

        return result;
    };

    /**
     * Gathers UserTiming entries and compresses the result.
     *
     * @param {object} options Options
     *
     * @returns {object} Compressed UserTiming entries
     */
    UserTimingCompression.getCompressedUserTiming = function(options) {
        var frame, entries;

        options = options || {};
        frame = options.window || window;
        entries = this.findUserTimingForFrame(frame);

        // 'from' minimum time
        if (options.from) {
            entries = entries.filter(function(e) {
                return e.startTime + e.duration >= options.from;
            });
        }

        // 'to' maximum time
        if (options.to) {
            entries = entries.filter(function(e) {
                return e.startTime <= options.to;
            });
        }

        return self.compressUserTiming(entries, options);
    };

    /**
     * Optimizes compressed UserTiming data for URI transmission.
     *
     * @param {object} data data
     *
     * @returns {string} String suitable for encodeURIComponent()
     */
    UserTimingCompression.compressForUri = function(data) {
        if (typeof data !== "object") {
            return "";
        }

        //
        // Determine if the data is for a map, which is the most efficient
        // structure we can use.
        //
        var isMap = false;
        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                if (isNaN(name)) {
                    isMap = false;
                    break;
                } else {
                    isMap = true;
                }
            }
        }

        // if we only had numbers in the map, we can flatten it more efficiently
        if (isMap) {
            return "1" + self.flattenMap(data);
        }

        //
        // We're going to convert the data to both a Trie (JSURL-encoded),
        // as well as an array of values flattened by ~, to see which one
        // is more efficient
        //

        //
        // Method #1: Trie
        //
        // convert to a Trie
        var unOptTrie = self.convertToTrie(data);

        // optimize the Trie
        var trie = self.optimizeTrie(unOptTrie, true);

        var trieJsURL = self.jsUrl(trie);

        //
        // Method #2: Flattened array
        //
        var ary = self.flattenArray(data);

        if (typeof ary !== "string" || ary.length === 0) {
            return "";
        }

        // encode the URI components to see which one is smaller
        var trieEnc = encodeURIComponent(trieJsURL);
        var aryEnc = encodeURIComponent(ary);

        // return the smaller one
        if (trieEnc.length < aryEnc.length) {
            return trieJsURL;
        } else {
            return "0" + ary;
        }
    };

    /**
     * Flattens an array from key:value pairs to a string separated by ~s
     *
     * Example: [name1]~[value1]~[name2]~[value2]
     *
     * @param {object} data Data in key;value form
     *
     * @returns {string} String representing the array
     */
    UserTimingCompression.flattenArray = function(data) {
        var ary = [];

        if (typeof data !== "object") {
            return "";
        }

        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                var val = (data[name] + "").replace("~", "%7E");
                name = name.replace("~", "%7E");

                ary.push(name + "~" + val);
            }
        }

        ary = ary.join("~");

        return ary;
    };

    /**
     * Flattens an array from numeric key:value pairs to a string separated by ~s
     *
     * Example: [idx1][value1]~[idx2][value2]
     *
     * @param {object} data Data in key;value form
     *
     * @returns {string} String representing the array
     */
    UserTimingCompression.flattenMap = function(data) {
        var ary = [];

        if (typeof data !== "object") {
            return "";
        }

        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                var nameInt = parseInt(name, 10);
                var nameBase36 = self.toBase36(nameInt);

                // maximum index of (1331 - 36).toString(36) = "-zz"
                if (nameInt > 1331) {
                    continue;
                }

                //
                // We'll try to fit the map index in a single (base 36) character.
                // If we can't, we'll use another character to denote (-), subtract
                // 36 from it, and append the new base36.
                //
                if (nameBase36.length > 1) {
                    // if the name is greater than 1 character, use expanded notation
                    nameBase36 = self.toBase36(nameInt - 36);

                    // ensure we fill 3 characters
                    nameBase36 = "-" + (nameBase36.length === 1 ? "0" : "") + nameBase36;
                }

                ary.push(nameBase36 + data[name]);
            }
        }

        // sort by map order
        ary.sort();

        // join into a string
        ary = ary.join("~");

        return ary;
    };

    /**
     * Converts the structure to URL-friendly JSON
     * Adapted from https://github.com/Sage/jsurl
     *
     * @param {object} v Object to convert
     *
     * @returns {string} URL-friendly JSON
     */
    UserTimingCompression.jsUrl = function(v) {
        /**
         * Encodes the specified string
         *
         * @param {string} s String
         *
         * @returns {string} Encoded string
         */
        function encode(s) {
            if (!/[^\w-.]/.test(s)) {
                // if the string is only made up of alpha-numeric, underscore,
                // dash or period, we can use it directly.
                return s;
            }

            // we need to escape other characters
            s = s.replace(/[^\w-.]/g, function(ch) {
                if (ch === "$") {
                    return "!";
                }

                // use the character code for this one
                ch = ch.charCodeAt(0);

                if (ch < 0x100) {
                    // if less than 256, use "*[2-char code]"
                    return "*" + ("00" + ch.toString(16)).slice(-2);
                } else {
                    // use "**[4-char code]"
                    return "**" + ("0000" + ch.toString(16)).slice(-4);
                }
            });

            return s;
        }

        switch (typeof v) {
            case "number":
                // for finite numbers, return "~[number]"
                return isFinite(v) ? "~" + v : "~null";

            case "string":
                // "~'[encoded string]"
                return "~'" + encode(v);

            case "boolean":
                // "~true" or "~false"
                return "~" + v;

            case "object":
                if (!v) {
                    return "~null";
                }

                if (Array.isArray(v)) {
                    // an array "~([array])"
                    return "~(" + (v.map(function(elt) {
                        return self.jsUrl(elt) || "~null";
                    }).join("") || "~") + ")";
                } else {
                    return "~(" + Object.keys(v).map(function(key) {
                        var val = self.jsUrl(v[key]);
                        // skip undefined and functions
                        return val && (encode(key) + val);
                    }).filter(function(str) {
                        return str;
                    }).sort().join("~") + ")";
                }

            default:
                // function, undefined
                return undefined;
        }
    };

    if (typeof root !== "undefined") {
        //
        // Browser Global
        //
        root.UserTimingCompression = UserTimingCompression; // eslint-disable-line no-undef, no-underscore-dangle
    }

}(typeof window !== "undefined" ? window : undefined));

/*global UserTimingCompression*/
/**
 * The UserTiming plugin to collect metrics from the W3C
 * [UserTiming]{@link http://www.w3.org/TR/user-timing/} API.
 *
 * This plugin can make use of the
 * [UserTimingCompression library]{@link https://github.com/nicjansma/usertiming-compression.js}.
 * In order to use compression, `UserTimingCompression` must be loaded before this plugin's `init()` is called.
 *
 * This plugin collects all marks and measures that were added since
 * navigation start or since the last beacon fired for the current navigation.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds the following parameters to the beacon:
 *
 * * `usertiming`: UserTiming data
 *
 * The value is either plain json or a compressed string using
 * [UserTimingCompression library]{@link https://github.com/nicjansma/usertiming-compression.js}.
 * A decompression function is also available in the library.
 *
 * Timing data is rounded to the nearest millisecond.
 *
 * ## Example
 *
 *     // mark current timestamp as mark1
 *     performance.mark('mark1');
 *     // mark current timestamp as mark2
 *     performance.mark('mark2');
 *     // measure1 will be the delta between mark1 and mark2 timestamps
 *     performance.measure('measure1', 'mark1', 'mark2');
 *     //measure2 will be the delta between the mark2 timestamp and the current time
 *     performance.measure('measure2', 'mark2');
 *
 * When not using compression, data added to the beacon will look similar to the following:
 *
 *     usertiming={"mark":{"mark1":100,"mark2":200},"measure":{"measure1":100,"measure2":200}}
 *
 * When using compression, data added to the beacon will look similar to the following:
 *
 *     usertiming=~(m~(ark~(1~'2s~2~'5k)~easure~(1~'2s_2s~2~'5k_5k)))
 *
 * Decompressing the above value will give us the original data for the marks
 * and measures collected:
 *
 *     [{"name":"mark1","startTime":100,"duration":0,"entryType":"mark"},
 *     {"name":"measure1","startTime":100,"duration":100,"entryType":"measure"},
 *     {"name":"mark2","startTime":200,"duration":0,"entryType":"mark"},
 *     {"name":"measure2","startTime":200,"duration":200,"entryType":"measure"}]
 *
 * Uncompressed measures only send their duration in contrast to compressed measures, which also send their startTime.
 *
 * ## Compatibility
 *
 * Many browsers [support](http://caniuse.com/#feat=user-timing) the UserTiming
 * API, e.g.:
 *
 * * Chrome 25+
 * * Edge
 * * Firefox 38+
 * * IE 10+
 * * Opera 15+
 *
 * See Nic Jansma's [usertiming.js]{@link https://github.com/nicjansma/usertiming.js}
 * polyfill library to add UserTiming API support for browsers that don't
 * implement it natively.
 *
 * @see {@link http://www.w3.org/TR/user-timing/}
 * @class BOOMR.plugins.UserTiming
 */
(function() {
	
	

	if (BOOMR.plugins.UserTiming) {
		return;
	}

	var impl = {
		// Whether or not this plugin is complete.
		complete: false,

		// Whether or not this plugin is initialized
		initialized: false,

		// Whether or not UserTiming is supported by this browser
		supported: false,

		// Options
		options: {"from": 0, "window": BOOMR.window},

		/*
		 * Gets the user timings, filters out those that have already been sent.
		 * Calls the UserTimingCompression library to get the compressed UserTiming
		 * data that occurred since the last call.
		 *
		 * @returns {string} UserTiming data
		 */
		getUserTiming: function() {
			var entries = this.findUserTimingForFrame(impl.options.window);

			// 'from' minimum time
			if (impl.options.from) {
				entries = entries.filter(function(e) {
					return e.startTime + e.duration >= impl.options.from;
				});
			}

			var utc = window.UserTimingCompression || BOOMR.window.UserTimingCompression;

			if (typeof utc === "undefined") {
				if (entries.length === 0) {
					return null;
				}
				else {
					var res = {};
					for (var i = 0, l = entries.length; i < l; i++) {
						var entry = entries[i];
						res[entry.entryType] = res[entry.entryType] || {};
						if (entry.entryType === "mark") {
							res[entry.entryType][entry.name] = entry.startTime;
						}
						else if (entry.entryType === "measure") {
							res[entry.entryType][entry.name] = entry.duration;
						}
					}
					return JSON.stringify(res);
				}
			}
			else {
				var timings, res;
				timings = utc.compressUserTiming(entries);
				return utc.compressForUri(timings);
			}
		},

		/**
		 * Callback for `before_beacon` boomerang event.
		 *
		 * Adds the `usertiming` param to the beacon.
		 */
		addEntriesToBeacon: function(vars) {
			var r, now = BOOMR.hrNow();

			// Add entries to all beacon types except early beacons
			if (this.complete || (vars && typeof vars.early !== "undefined")) {
				return;
			}

			r = this.getUserTiming();
			if (r) {
				BOOMR.addVar("usertiming", r, true);
			}

			this.options.from = now;

			this.complete = true;
		},

		/**
		 * Gets all of the UserTiming entries for a frame

		 * @param {object} frame Window or frame DOM object
		 *
		 * @returns {PerformanceEntry[]} UserTiming entries
		 */
		findUserTimingForFrame: function(frame) {
			var entries;

			if (!frame) {
				return [];
			}

			try {
				// Try to access location.href first to trigger any Cross-Origin
				// warnings.  There's also a bug in Chrome ~48 that might cause
				// the browser to crash if accessing X-O frame.performance.
				// https://code.google.com/p/chromium/issues/detail?id=585871
				// This variable is not otherwise used.
				/* eslint-disable no-unused-vars */
				var frameLoc = frame.location && frame.location.href;
				/* eslint-enable no-unused-vars */

				if (!("performance" in frame) ||
					!frame.performance ||
					!frame.performance.getEntriesByType) {
					return entries;
				}

				// gather marks and measures for this frame
				// TODO do we need to offset startTime?
				entries = frame.performance.getEntriesByType("mark");
				entries = entries.concat(frame.performance.getEntriesByType("measure"));
			}
			catch (e) {
				return entries;
			}

			return entries;
		},

		/**
		 * Callback for `beacon` boomerang event.
		 *
		 * Clears the `usertiming` beacon param.
		 */
		clearMetrics: function(vars) {
			this.complete = false;
		},

		/**
		 * Subscribe to boomerang events that will handle the `usertiming`
		 * beacon param.
		 */
		subscribe: function() {
			BOOMR.subscribe("before_beacon", this.addEntriesToBeacon, null, this);
			BOOMR.subscribe("beacon", this.clearMetrics, null, this);
		},

		/**
		 * Callback for boomerang page_ready event.
		 *
		 * At page_ready, all javascript should be loaded. We'll call `checkSupport`
		 * again to see if a polyfill for UserTiming is available.
		 */
		pageReady: function() {
			if (this.checkSupport()) {
				this.subscribe();
			}
		},

		/**
		 * Checks if the browser supports the UserTiming API and that the
		 * UserTimingCompression library is available.
		 *
		 * @returns {boolean} true if supported, false if not
		 */
		checkSupport: function() {
			if (this.supported) {
				return true;
			}

			var p = BOOMR.getPerformance();

			// Check that we have getEntriesByType
			if (p && typeof p.getEntriesByType === "function") {
				var marks = p.getEntriesByType("mark");
				var measures = p.getEntriesByType("measure");

				// Check that the results of getEntriesByType for marks and measures are Arrays
				// Some polyfill libraries may incorrectly implement this
				if (BOOMR.utils.isArray(marks) && BOOMR.utils.isArray(measures)) {
					BOOMR.info("Client supports UserTiming API", "usertiming");
					this.supported = true;
					return true;
				}
			}

			return false;
		}
	};

	BOOMR.plugins.UserTiming = {
		/**
		 * Initializes the plugin.
		 *
		 * @returns {@link BOOMR.plugins.UserTiming} The UserTiming plugin for chaining
		 * @memberof BOOMR.plugins.UserTiming
		 */
		init: function(config) {
			if (impl.initialized) {
				return this;
			}

			if (impl.checkSupport()) {
				impl.subscribe();
			}
			else {
				// UserTiming isn't supported by the browser or the UserTimingCompression
				// library isn't loaded. Let's check again when the page is
				// ready to see if a polyfill was loaded.
				BOOMR.subscribe("page_ready", impl.pageReady, null, impl);
			}

			impl.initialized = true;
			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof BOOMR.plugins.UserTiming
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Whether or not UserTiming is supported in this browser.
		 *
		 * @returns {boolean} `true` if UserTiming is supported.
		 * @memberof BOOMR.plugins.UserTiming
		 */
		is_supported: function() {
			return impl.initialized && impl.supported;
		}
	};
}());

/**
 * Plugin to implement the method queue pattern for Boomerang:
 *
 * {@link http://www.lognormal.com/blog/2012/12/12/the-script-loader-pattern/#the_method_queue_pattern}
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * ## Usage
 *
 * The `BOOMR_mq` plugin can be used to call {@link BOOMR} methods before boomerang.js
 * has fully loaded on the page.
 *
 * If Boomerang is already on the page when `BOOMR_mq.push()` is used, the
 * specified function will be called immediatley.
 *
 * Otherwise, the specified function will be called as soon as Boomerang has
 * loaded.
 *
 * ## Example
 *
 * `BOOMR_mq` is a global array that lives on the `window` object.  If it doesn't
 * exist, you should create it.
 *
 * To queue {@link BOOMR} methods, simply `push()` arrays onto the object.
 *
 * The first parameter in the array is the {@link BOOMR} method name.
 *
 * The rest of the parameters will be passed to that method.
 *
 * @example
 * window.BOOMR_mq = window.BOOMR_mq || [];
 *
 * // add two variables to the beacon once Boomerang has loaded
 * window.BOOMR_mq.push(
 *   ["addVar", "var1", "value1"],
 *   ["addVar", "var2", "value2"]
 * );
 *
 * @class BOOMR_mq
 */
(function() {
	

	/**
	 * Process a single `BOOMR_mq` entry.
	 *
	 * @param {string[]} args Entry arguments
	 * @param {function} callback Callback function
	 * @param {object} thisArg The 'this'
	 */
	function processEntry(args, callback, thisArg) {
		var methodName = args.shift();
		if (typeof methodName !== "string") {
			return;
		}

		var split = methodName.split("."), method = BOOMR, _this = BOOMR;
		if (split[0] === "BOOMR") {
			// the BOOMR namespace is inferred, remove it if it was specified
			split.shift();
		}

		// loop through all of `split`, stepping into only objects and functions
		while (split.length &&
			method && // `null` is an object, skip it
			(typeof method === "object" || typeof method === "function")) {
			var word = split.shift();
			method = method[word];
			if (split.length) {
				_this = _this[word]; // the `this` is everything up until the method name
			}
		}

		// if we've used all of `split`, and have resolved to a function, call it
		if (!split.length && typeof method === "function") {
			var returnValue = method.apply(_this, args);

			// pass the return value of the resolved function as the only argument to the
			// optional `callback`
			if (typeof callback === "function") {
				callback.call(thisArg, returnValue);
			}
		}
	}

	/**
	 * Processes a list of `BOOMR_mq` entries
	 *
	 * @param {string[][]} entries Entries
	 */
	function processEntries(entries) {
		for (var i = 0; i < entries.length; i++) {
			var params = entries[i];
			if (!params) {
				continue;
			}

			if (BOOMR.utils.isArray(params)) {
				processEntry(params);
			}
			else if (typeof params === "object" && BOOMR.utils.isArray(params.arguments)) {
				processEntry(params.arguments, params.callback, params.thisArg);
			}
		}
	}

	// process the window's current queue'd entries
	var mq = BOOMR.window.BOOMR_mq;
	if (BOOMR.utils.isArray(mq)) {
		processEntries(mq);
	}

	// replace the queue with an immediate processor now that we're loaded
	BOOMR.window.BOOMR_mq = {
		push: function() {
			processEntries(arguments);
		}
	};
})();

/**
 * Plugin to send early beacons
 * Non-SPA:
 *    Send when config is loaded (onconfig event) if:
 *    - after DOMContentLoaded
 *    - before onload
 *    - not in prerender
 *    - autorun is true
 *    - not a reload or back/forward navigation
 *
 *    If we were in prerender, send when visible (prerender_to_visible event) if
 *    config was received and the conditions above are met.
 *    If onconfig fired before DOMContentLoaded, try again when DOMContentLoaded fires.
 *
 * SPA:
 *    Send when the count of resources we're waiting for drops to 0 for the first
 *    time + SPA_EARLY_TIMEOUT (controlled by AutoXHR plugin) and if:
 *    - not in prerender
 *    - not a reload or back/forward navigation
 *    Current limitations:
 *    - Does not check if before DOMContentLoaded.
 *    - Does not retry sending at prerender_to_visible event.
 *
 * @class BOOMR.plugins.Early
 */

(function() {
	
	
	if (BOOMR.plugins.Early) {
		return;
	}


	var impl = {
		initialized: false,
		autorun: true,
		earlyBeaconSent: false,  // early beacon has been sent
		singlePageApp: false,
		onConfigFired: false,

		/**
		 * Fired on spa_init event
		 */
		onSpaInit: function() {
			// a new SPA route is starting, reset to allow an early beacon for this new navigation
			this.earlyBeaconSent = false;
		},

		/**
		 * Fired on beacon event. Used to clear the vars we set on the beacon
		 */
		clearMetrics: function() {
			BOOMR.removeVar("early");
		},

		/**
		 * Send an early beacon
		 *
		 * @param {object} config
		 * @param {string} edata Event data
		 * @param {string} ename Event name: spa, spa_hard, onconfig or prerender_to_visible
		 */
		sendEarlyBeacon: function(edata, ename) {
			var navigationType = 0,  // default to TYPE_NAVIGATE if it is not available
			    d, p = BOOMR.getPerformance();

			d = BOOMR.window && BOOMR.window.document;
			// protect against undefined window/document
			if (!d) {
				return;
			}

			if (ename === "onconfig") {
				this.onConfigFired = true;
			}

			if (p && p.navigation) {
				navigationType = p.navigation.type;
			}

			if (this.earlyBeaconSent ||
			    // don't send if in prerender state
			    BOOMR.visibilityState() === "prerender" ||
			    // don't send if this navigation is TYPE_RELOAD or TYPE_BACK_FORWARD
			    (navigationType === 1 || navigationType === 2) ||
			    // for non-SPA, don't send if:
			    (!this.singlePageApp &&
			        // autorun is false
			        (!this.autorun ||
			        // prerender_to_visible fired but we don't have config yet
			        (!this.onConfigFired && ename === "prerender_to_visible") ||
			        // DOMContentLoaded hasn't occurred yet
			        d.readyState === "loading" ||
			        // onload has already fired
			        BOOMR.hasBrowserOnloadFired())) ||
			    // for SPA, only send on spa hard and soft events
			    (this.singlePageApp && !BOOMR.utils.inArray(ename, BOOMR.constants.BEACON_TYPE_SPAS))) {
				
				return;
			}

			this.earlyBeaconSent = true;

			// NOTE: Early beacons (and the early flag) don't support singleBeacon
			BOOMR.addVar("early", "1");

			if (edata && BOOMR.utils.inArray(edata.initiator, BOOMR.constants.BEACON_TYPE_SPAS)) {
				BOOMR.addVar("http.initiator", edata.initiator);
				BOOMR.addVar("rt.start", "manual");
			}

			// let other plugins add data to the early beacon
			BOOMR.fireEvent("before_early_beacon", edata);

			// send it!
			
			BOOMR.sendBeacon();
		}
	};

	BOOMR.plugins.Early = {
		init: function(config) {
			if (config.primary || impl.initialized) {
				return this;
			}

			if (typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			// Check to see if any of the SPAs were enabled
			impl.singlePageApp = BOOMR.plugins.SPA && BOOMR.plugins.SPA.isSinglePageApp(config);

			BOOMR.registerEvent("before_early_beacon");

			// Hook onconfig to trigger early beacon logic for non-SPA.
			BOOMR.subscribe("config", impl.sendEarlyBeacon, "onconfig", impl, true);

			// Hook dom_loaded to trigger early beacon logic for non-SPA.
			BOOMR.subscribe("dom_loaded", impl.sendEarlyBeacon, "dom_loaded", impl, true);

			// Hook spa_init to trigger early beacon logic for SPA.
			BOOMR.subscribe("spa_init", impl.onSpaInit, null, impl);

			// If we were previously in prerender, the early beacon wouldn't have been sent.
			// Hook prerender_to_visible to trigger early beacon logic, if onload already happened this will be a noop
			BOOMR.subscribe("prerender_to_visible", impl.sendEarlyBeacon, "prerender_to_visible", impl, true);

			BOOMR.subscribe("beacon", impl.clearMetrics, null, impl);

			// don't send early flag on unload beacons
			BOOMR.subscribe("before_beacon", function(vars) {
				if (typeof vars["rt.quit"] !== "undefined") {
					impl.clearMetrics();
				}
			}, null, impl);

			impl.initialized = true;
			return this;
		},

		is_complete: function() {
			return true;
		},

		// This plugin doesn't require any special browser functionality
		is_supported: function() {
			return impl.initialized;
		},

		sendEarlyBeacon: function(edata, ename) {
			impl.sendEarlyBeacon(edata, ename);
		}
	};
}());

// This code is run after all plugins have initialized
BOOMR.t_end = new Date().getTime();
