## NEXT RELEASE

- Mitigated an issue where importing the SDK as an ES module (Vite 8 and other `"type": "module"` projects, Node.js, jsDelivr's `+esm`) or with `require()` gave a wrapper object instead of the SDK, so `Countly.init` was undefined. `Countly.default` keeps working.
- Mitigated an issue where building a site with Parcel required the `buffer` package.

## 26.8.0

- ! Minor Breaking Change ! Form tracking (`track_forms`) and form data collection (`collect_from_forms`) now leave out sensitive data:
  - password fields (also ones revealed as text), fields whose `autocomplete` marks a payment card or one-time code, and card numbers are never recorded
  - fields named or labelled like secrets, payment card, bank or identity data are read only with the new `cly_form_allow` class in `track_forms`, or with a `cly_user_{key}` class in `collect_from_forms`
  - `track_forms` skips values shaped like a social security number unless the field has the `cly_form_allow` class
  - `collect_from_forms` reads hidden fields only with a `cly_user_{key}` class, takes an email or phone number only from a field holding one, and no longer takes a field named like `number` as the phone (use the `cly_user_phone` class)
  - the `cly_user_ignore` class now also works on an element containing fields
- ! Minor Breaking Change ! Added `content` consent for content zone. When consent is required, content now needs the new `content` consent; the content zone waits until it is given.
- ! Minor Breaking Change ! `change_id` and `set_id` without merge now start a session for the new device ID only with `track_sessions`; with manual session calls, call `begin_session` for the new user yourself.
- ! Minor Breaking Change ! While a page is open and sending works, its unsent events and requests are now kept in the tab's sessionStorage instead of localStorage (events instead of a cookie with `storage: "cookie"`). Requests that cannot be sent for now, such as in offline mode, and those of a page being left still wait in localStorage. This does not apply with `storage: "none"` or a custom storage object.

- Added `track_form_values` init option for turning off the field values in the events of `track_forms` (default `true`).
- Added web push notification support (requires a Countly server with web push support):
  - `push` consent feature for gating push notifications behind user consent
  - `enable_push_notifications` method for asking the visitor's permission and subscribing them to push notifications
  - `disable_push_notifications` method for unsubscribing the visitor from push notifications
  - `set_push_notification_listener` method and `push_notification_listener` init option for getting notified when a notification is received, clicked or closed
  - `record_push_action` method for recording a notification click manually
  - `push_vapid_public_key` init option for providing your application's VAPID public key (required)
  - `push_service_worker_path` init option for providing the path of the service worker file (default `/countly_sw.js`)
  - `push_service_worker_scope` init option for registering the service worker under a different scope (default `countly-push/` next to the service worker file)
  - `push_service_worker_registration` init option for providing your own service worker registration that imports `countly_sw.js`, or the promise `register()` returns for it
  - `push_auto_register` init option for turning off the silent registration of visitors who already allowed notifications (default `true`)
  - `push_subscribe_timeout` init option for setting how long `enable_push_notifications` waits for the browser, in milliseconds (default `30000`)
  - `countly_sw.js` service worker file, to be served from your site or imported into your own service worker
  - `opt_out` also unsubscribes the visitor from push notifications; after `opt_in`, call `enable_push_notifications` to subscribe them again
- Added support for server-initiated connection tests, which report which Countly endpoints the browser can reach (requires a Countly server with connection test support).
- Added support for server-requested SDK log gathering, which uploads the SDK's own log lines for the devices the server asks for (requires a Countly server with SDK log gathering support).
- Added `content.setGlobalContentSegmentation` method and `global_content_segmentation` init option for adding a segmentation to every content and feedback widget event, apart from the rating popups of `presentRatingWidgetWithID`, `initializeRatingWidgets` and `enableRatingWidgets`. Keys the server reads on these events, such as `rating`, `closed` or `campaign_id`, are left out.
- Added passing the site's light or dark theme (the `color-scheme` the page declares, otherwise the visitor's browser setting) to content and feedback widgets; content uses it when dark mode is enabled for it in the content builder:
  - `content.setTheme` method and `content_theme` init option for setting the theme instead: `"dark"`, `"light"`, `false` for none, or `null` to follow the site (default `null`)
- Added TypeScript definitions for `attempt_to_send_stored_requests`, `check_any_consent`, `opt_in`, `opt_out`, `recordError`, `recordRatingWidgetWithID` and `track_view`.

- Mitigated an issue where content could open links that run code on the site, such as `javascript:` links, and a page opened from content could redirect the site's tab. Content now opens only web, relative, contact (such as `mailto:` or `tel:`) and `scheme://` app links.
- Mitigated an issue where, with `debug` enabled, methods such as `add_event` or `user_details` threw an error when given an object that cannot be turned into JSON.
- Mitigated an issue where the deprecated `show_feedback_popup` method threw an error instead of showing the widget.
- Mitigated an issue where withdrawing a consent with `remove_consent` was not reported to the server until another consent was given.
- Mitigated an issue where event and segmentation filters of the server configuration could effect the internal events.
- Mitigated an issue where content and feedback widgets on iPhones and iPads were laid out for a screen two to three times its size.
- Mitigated an issue where `add_log` froze the page when the breadcrumb limit (`max_breadcrumb_count` or the server configuration) was 0.
- Mitigated an issue where a `device_id` given as `null` or an empty string left the SDK without a device ID, so nothing was sent.
- Mitigated an issue where a device ID (`cly_device_id`), campaign or UTM value given in the page URL was not percent-decoded or was cut at an `=`, so for example `john%40mail.com` was recorded instead of `john@mail.com`.
- Mitigated an issue where a call in the `Countly.q` queue that threw an error stopped the SDK for the rest of the page.
- Mitigated an issue where sending did not resume on the same page after networking was switched back on in the server configuration.
- Mitigated an issue where a request that could not be made, for example because of an invalid custom header, was never treated as failed, so the callbacks waiting for it were not called and queued requests were not tried again for the rest of the page.
- Mitigated an issue where, with `storage: "cookie"`, unsent requests were lost on every page change.
- Mitigated an issue where, with `storage: "cookie"`, an event key or segmentation value containing `;` could break event recording on the next page.
- Mitigated an issue where an NPS score of 0 reported with `reportFeedbackWidgetManually` was dropped.
- Mitigated an issue where a device ID, app version or segmentation holding characters such as `+`, `&` or `#` reached feedback widgets altered, so answers could be stored for another user.
- Mitigated an issue where `uploadUserProfilePicture` stored the picture for a different user when the device ID held characters such as `@`.
- Mitigated an issue where `uploadUserProfilePicture` uploaded the picture without the `users` consent when consent was required.
- Mitigated an issue where a callback, such as the one of `get_available_feedback_widgets`, could be called twice when its request timed out.
- Mitigated an issue where the remote config callback was not called when fetching failed. It now gets an error and the stored values.
- Mitigated an issue where requests recorded in offline mode were sent with the temporary device ID instead of the real one when a later page, in the same tab or another one, started with a real device ID.
- Mitigated an issue where, with `namespace`, `storage: "cookie"` or a custom `storage` object, the server configuration saved on an earlier page was not applied when the next page started, and with `storage: "none"` it was still saved in localStorage.
- Mitigated an issue where, with `track_sessions`, time the page spent in the background, out of focus or inactive was counted in the session when the page was closed in that state.
- Mitigated an issue where, with `track_sessions`, a view that started while the page was in the background was credited with the previous view's duration.
- Mitigated an issue where `exitContentZone` called in the first seconds after init or right after `refreshContentZone` was undone shortly after.
- Mitigated an issue where `exitContentZone` left the content on screen, or content that arrived after it was still shown. Content, journey content included, now waits for the next `enterContentZone`.
- Mitigated an issue where content messages were handled once for every content shown before on the page, so a click could open a link or record an event several times.
- Mitigated an issue where journey content could stop being requested for the rest of the page after a journey event was sent with the regular event requests.
- Mitigated an issue where a call queued in `Countly.q` for the main instance could run on another instance, for example during that instance's `user_details` call.
- Mitigated an issue where a visitor ignored at init (`ignore_visitor`, an earlier `opt_out` or a detected bot) still sent the health check and remote config, feedback widget or content requests with "undefined" as the device ID, which created such a user on the server. Their callbacks now get an error.
- Mitigated an issue where `set_id` merged a device ID given in the page URL (`cly_device_id`) into the new one, instead of changing it without merge as for any device ID set by the developer.
- Mitigated an issue where, when no session was running, user profile changes not saved yet at a `change_id` without merge, such as those made with `userData.set`, were saved for the new device ID instead of the previous one.
- Mitigated an issue where `change_id` without merge kept the content zone entered and the previous user's content on screen. Call `content.enterContentZone` again to show content to the new user.
- Mitigated an issue where `change_id` without merge sent the duration of the page's last view for the new device ID instead of the previous one.
- Mitigated an issue where a content message carrying a single event instead of a list threw an error, so the event was not recorded.
- Mitigated an issue where, after a device ID change with merge, the health check and the server configuration, remote config, A/B testing, feedback widget and content requests could reach the server under the new device ID before the merge request. The server then combined two users instead of moving the history to the new device ID, which lost some profile totals, and remote config could return the values of a new, empty user.
- Mitigated an issue where, with `storage: "cookie"`, the health check did not report the errors, warnings and failed requests counted on earlier pages.
- Mitigated an issue where, with `storage: "cookie"`, the site's other open tabs kept using the previous device ID after a device ID change until they were reloaded.
- Mitigated an issue where, with several tabs of a site open, events and other requests could be sent more than once or lost.
- Mitigated an issue where, with several tabs of a site open, events one tab recorded right before a device ID change without merge or a profile change in another tab could be sent for the new device ID or stored with the new profile.
- Mitigated an issue where namespaces sharing an app key took over each other's device ID and queued data while open in several tabs.
- Mitigated an issue where, on a page using the quick async loader, calling methods such as `add_consent`, `opt_out` or `track_view` before the SDK loaded threw an error. Replace the loader snippet on your pages to get the fix.

## 26.1.3

- Added support for Feedback Widgets and Content working with certain proxy configurations.

## 26.1.2

- Delayed remote config refresh after merged device ID changes to reduce request ordering races.

## 26.1.1

- Improved device metric detection capabilities.

## 26.1.0

- Added support for SBS flags:
  - Event whitelisting / blacklisting
  - Segmentation whitelisting / blacklisting (global and per-event)
  - User property whitelisting / blacklisting
  - Journey trigger events
- Added support for Feedback Widget resizing logic (will need server update to benefit.)
- Improved testing consistency of queuing system

- Mitigated an issue where an unintended URL was opened when closing a feedback widget after a content block was closed.

## 25.4.5

- Added SDK info methods:
  - `Countly.sdk_version()` for retrieving current SDK version
  - `Countly.sdk_name()` for retrieving the SDK name

## 25.4.4

- Improved user property recording order with respect to sessions and events.

## 25.4.3

- Added filtering capability to `content` interface through `enterContentZone(contentFilterCallback)`.

## 25.4.2

- Mitigated an issue where manual feedback reporting could have failed
- Mitigated a possible issue with request timeouts in IE11
- Non window contexts also now uses POST requests by default
- Added a new method `uploadUserProfilePicture` for uploading user profile images to server

## 25.4.1

- Added automatic backoff mechanism which delays sending requests if server seems busy
- Added `disable_sdk_behavior_settings_updates` init method for disabling Server Configuration sync requests
- Added `disable_backoff_mechanism` init method for disabling backoff mechanism
- Added timezone support for server

## 25.4.0

- ! Minor Breaking Change ! SDK now has Server Configuration feature and it is enabled by default. Changes made on SDK Manager > SDK Configuration on your server will affect SDK behavior directly.

- Mitigated an issue about orientation detection in Safari

- Improved init time Content Zone logic
- Improved error handler to include script loading issues
- Improved the wrapper of Feedback Widgets

- Added `refreshContentZone` method to Content interface for refreshing Content Zone requests
- Added `behavior_settings` init time method for providing server configuration during first initialization
- Added `content_whitelist` init time method that lets you whitelist your other domains for displaying Content

- `max_logs` config option value will not be used anymore (use `max_breadcrumb_count` instead)

## 25.1.0

- Improved orientation reporting precision.
- Reduced log verbosity.
- Added a new init time config option `crash_filter_callback` for filtering crashes.

- Mitigated an issue where content resizing did not work in certain orientations.

## 24.11.4

- Mitigated an issue where `content` and `feedback` interface methods would not have worked if async methods were used when multi instancing the SDK. 

## 24.11.3

- Added support for content resizing (Experimental!)
- Mitigated an issue where device ID type was assigned wrongly when SDK was generating an ID after stored device ID was cleared.
- Mitigated an issue where device ID type of initially generated requests were not correctly reassigned after offline mode.

## 24.11.2
- Added a new init method to set the interval of Content Zone's timer (Experimental!):
  - `content_zone_timer_interval` to set the timer interval in `seconds`
- Mitigated an issue about Content's positioning (Experimental!)

## 24.11.1
- Deprecated `initializeRatingWidgets` method, use `feedback.showRating` instead.
- Deprecated `enableRatingWidgets` method, use `feedback.showRating` instead.
- Added an interface `content` for Content feature methods:
  - `enterContentZone`, to start Content checks (Experimental!)
  - `exitContentZone`, to stop Content checks (Experimental!)

## 24.11.0
- Mitigated an issue where SDK could try to send old stored offline mode data during init if `clear_stored_id` was true
- Mitigated an issue where the SDK could stayed on offline mode after the first init with `offline_mode` set to true
- Mitigated an issue where old Rating widget stickers were not cleared when a new one was presented

- Improved view tracking logic
- Default request method is now set to "POST"
- Healtchecks won't be sent in offline mode anymore
- Added a new interface 'feedback' which includes convenience methods to show feedback widgets:
  - showNPS([String nameIDorTag]) - for displaying the first available NPS widget or one with the given name, Tag or ID value
  - showSurvey([String nameIDorTag]) - for displaying the first available Survey widget or one with the given name, Tag or ID value
  - showRating([String nameIDorTag]) - for displaying the first available Rating widget or one with the given name, Tag or ID value

## 24.4.1
- Added types for the SDK
- Added a new method `set_id(newDeviceId)` for managing device ID changes according to the device ID Type

- Mitigated an issue that could have prevented automatic Device Traces to not show up in server

## 24.4.0
! Minor breaking change ! For implementations using `salt` the browser compatability is tied to SubtleCrypto's `digest` method support

- Added the `salt` init config flag to add checksums to requests (for secure contexts only)
- Improved Health Check feature stability
- Added support for Feedback Widget terms and conditions

## 23.12.6
- Mitigated an issue where error tracking could prevent SDK initialization in async mode

## 23.12.5
- Mitigated an issue where the SDK was not emptying the async queue explicity when closing a browser

## 23.12.4
- Enhanced userAgentData detection for bot filtering

## 23.12.3
- Added bot detection for workers
- Added the ability to clear stored device IDs in the workers
- Mitigated an issue where utm naming could have been affected if 'searchQuery' did not return '?'

## 23.12.2
- Improved bot detection capabilities

## 23.12.1
- Added methods for bridged SDK usage

## 23.12.0
- You can now provide custom storage methods to the SDK
- You can now use the SDK in web workers
- From this version on the SDK is bundled from the Countly JavaScript SDK

## 23.6.3
- You can now add segmentation while presenting a widget with 'present_feedback_widget'

## 23.6.2
- Adding app version information to every request

- Mitigated an issue where if a long numerical device ID was changed while SDK was running at multiple tabs, it was parsed

## 23.6.1
- Mitigated an issue where numerical device IDs were parsed at the initialization

## 23.6.0
- Added a new flag, 'loadAPMScriptsAsync', which can load the APM related scripts automatically for Async implementations
- Adding SDK health check requests after init
- Adding remaining request queue size information to every request
- Fixed a bug where unnecessary device ID merge information was sent to the server

## 23.2.2
- Default max segmentation value count changed from 30 to 100

## 23.02.1
- Mitigated an issue that could have caused view IDs to be terminated prematurely when using manual sessions and end_session was called abruptly 

## 23.02.0
- Events are now recorded with an internal ID.
- Mitigated an issue where users could have truncate an internal event key
- Mitigated an issue where SDK was reporting empty scroll values
- Mitigated an issue that caused the device changes, after init, to not reflect on memory
- Fixed a bug where previous session cookie persisted even when the 'clear_stored_id' flag was set to true

## 22.06.5
- SDK now adds userAgent string to each request to prevent proxy related issues
- Added a method to cancel timed events manually
- Fixed a race condition bug where a recorded event would have the wrong user properties in the drill database on the server. Now event queue is emptied (formed into a request) before recording any user profile changes

## 22.06.4
- Fixed an issue with remote configs not working without a parameter

## 22.06.3
- Fixed an issue that arose when sending crashes through a gateway. User agent information is now sent as part of the request.

## 22.06.2
- ! Minor breaking change ! If no domain whitelist is provided for the heatmaps the SDK will fallback to your server url
- Fixed a bug where heatmap files were susceptible to DOM XSS
- Users can now input their domain whitelist for heatmaps feature during init
- Implementing new Remote Config/AB testing API:
  - Added an init time flag to enable/disable new remote config API (default: disabled)
  - Added a new call to opt in users to the A/B testing for the given keys
  - Added an init time flag to enable/disable automatically opting in users for A/B testing while fetching remote config (with new RC API)(default: enabled)

## 22.06.1
- Added SDK calls to report Feedback widgets manually

## 22.06.0
- Updated BoomerangJS to the latest version (1.737.0)
- Implemented static code analysis recommendations from Codacy, Snyk and Deep Scan
- Added an Angular integration example

## 22.02.4
- Fixed logs that did not obey to the 'debug' flag

## 22.02.3
- Added support for userAgentData
- Now heatmap scroll event is recorded when leaving a view

## 22.02.2
- Fixed a bug where the minified version had issues with the heatmap feature

## 22.02.1
- Fixed a bug where heatmap files were not loading

## 22.02.0
- !! Major breaking change !! Device ID provided during the init will be ignored if a device ID was provided previously
- Added a new init time flag which erases the previously stored device ID. This allows to set new device ID during init
- Added a new functionality with which it is possible to check the device ID type
- Now it appends the device ID type with each request
- Fixed a bug where custom utm tags were being overridden
- Added a safety check preventing the user from changing the device ID at offline

## 21.11.4
- Fixed a bug where some server response formats were rejected
- Fixed a bug where some widgets' text color was not displayed correctly

## 21.11.3
- Fixed a bug with `recordRatingWidgetWithID` where it would not record ratings

## 21.11.2
- Fixed a bug where request queue was not processing

## 21.11.1
- Fixed feedback widget bug related to the 'close events' origin check
- When consent is changed it will now send the full consent state instead of just the changed consents
- Rating widgets will now also be used through the feedback widgets API (in case the server supports it)
- When overriding 'getViewName' it is now possible to return 'null' to indicate that the page name should not be recorded
- Logs are now rearranged to include log levels

## 21.11.0
- !! Major breaking change !! Rating and Feedback widgets now require 'star-rating' or 'feedback' consent exclusively, according to their type, instead of both:
  - `present_feedback_widget` needs 'feedback' consent only
  - `get_available_feedback_widgets` needs 'feedback' consent only
  - `enable_feedback` needs 'star-rating' consent only
  - `show_feedback_popup` needs 'star-rating' consent only
  - `initialize_feedback_popups` needs 'star-rating' consent only
  - `report_feedback` needs 'star-rating' consent only
- !! Major breaking change !! Enabling offline mode or changing device ID without merging will now clear the current consent. Consent has to be given again after performing this action.
- ! Minor breaking change ! 'change_id' will now not accept invalid device ID values. It will now reject null, undefined, values that are not of the type string and empty string values.
- ! Minor breaking change ! Multiple values now have a default limit adjustable at initialization:
  - Maximum size of all string keys is now 128 characters by default.
  - Maximum size of all values in key-value pairs is now 256 characters by default.
  - Maximum amount of segmentation in one event is mow 30 key-value pairs by default.
  - Maximum amount of breadcrumbs that can be recorded at once is now 100 by default.
  - Maximum stack trace lines per thread is now 30 by default.
  - Maximum stack trace line length is now 200 by default.
- Bug Fix - Fixed a bug where duration counter/timer was not paused even when the browser was out of focus
- Deprecating `report_feedback`, now it redirects to `recordRatingWidgetWithID`
- Deprecating `show_feedback_popup`, now it redirects to `presentRatingWidgetWithID`
- Deprecating `initialize_feedback_popups`, now it redirects to `initializeRatingWidgets`
- Deprecating `enable_feedback`, now it redirects to `enableRatingWidgets`
- Deprecating `report_conversion`, now it redirects to `recordDirectAttribution`
- When recording internal events with 'add_event', the respective feature consent will now be checked instead of the 'events' consent.
- Increased the default max event batch size to 100.
- Automatic orientation tracking is now enabled by default. It can be turned off during init.
- Device ID can now be changed when no consent is given

## 20.11.3
- Surveys ie bugfix for the undefined origin
- Remove unload handlers
- Don't use closest polyfill

## 20.11.2
- [example] Crashes for react apps
- [fix] Fetch remote config on init bug fix
- [fix] Make sure code is running in a browser
- [improvement] Add url to passed data from server for heatmaps (allowing to use separate servers for SDK and Heatmap)
- [improvement] New landing page logic when session cookie is used (landing happens on every session start)
- [update] Example dependency updates

## 20.11.1
- Added new sample app to demo js symbolication
- Added option to control storage (localstorage, cookie, none)
- Bumped dependencies
- Fixed bug when "enable_feedback" called multiple times
- Provided an option to disable domain tracking

## 20.11
- Add javascript flag to reported errors
- Added React JS sample
- Added explicit remote-config consent
- Added support for Surveys and NPS
- Added wildcard support for feedback target
- Allow creating multiple instances to track different servers and/or apps
- Allow users provide custom metrics
- App prefixed storage, so changing new app key would not continue using old queue
- Boomerang fixes for APM tracking
- Fixed getting attributes of form correctly
- Improved comments and documentation
- Prevent widget duplication and reusing
- Stricter Eslint rules

## 20.04
- Add APM plugin which uses boomerang js for reporting performance
- Add basic performance trace reporting option
- Add device orientation reporting
- Add feedback button size support
- Add method to report feedback directly without dialog (for custom UI)
- Allow adding and enriching metrics data
- Allow providing custom headers in requests
- Allow providing custom segments for view tracking
- Crashes use a new way to record view name correctly
- Fixed bug of removing feedback sticker in some cases
- Fixed cross tab syncing when using namespaces
- Limited array modification amount when syncing requests for performance
- More error-prone storage clearing (in case of multi-tab data syncing)
- Removed unsafe innerHTML assignments

## 19.08
- Allow overwriting serialize and deserialize functions
- Allow overwriting a way to provide view name and url
- Allow namespacing shared storage for multiple separate trackers on same domain
- Fixed issue adding feedback widget in some cases
- Fixed expiring session on inactivity and cookie timeout
- Fixed using same ignore CSS class when tracking forms data too
- Allow passing device_id through url parameters for cross domain tracking
- Added internal method to clear queues
- Fixed to always notify loaders, even if tracking is disabled
- Added isUUID method to check if it is Countly generated id
- Implemented proper storage syncing between tabs
- Implement offline mode support with option to delay passing device_id

## 19.02.1
- Fixed feedback if disabled widgets on panel widgets are still enable.
- Fixed feedback if set “all pages” as target, sticker not appear on all pages.

## 19.02
- Add remote config support
- Fixed loader for Google Analytics adapter
- Use Array.isArray instead of === Array to avoid context problems
- Added more bots to block
- Remove x, y coordinates from link clicks
- Track hidden inputs only if explicitly enabled
- Allow redefining getters to get view name and url for views and clicks
- Report unhandled promise rejections as handled crashes

## 18.11
- Added persistence tests to test suite
- Fixed views overreporting duration in some cases
- Added session cookie support
- Google Analytics adapter (reuse implemented Google Analytics code to send data to Countly servers)

## 18.08.2
- Important Fix for regenerated device_id
  - Update to this version if you use 18.08 or 18.08.1.
- Fixed storing none json data
- Widgets params changed as popups and back-compatibility provided.

## 18.08
- Add crash log breadcrumb limit
- Allow unsetting custom property
- Block Google security scanner
- Empty event queue (into request queue) on device_id change (if user is not merged on server)
- Feedback dialog support
- Fixed bugs on consent checks
- More error handling
- Remove predictive session ends and rely on normal flow
- Removing code duplication to reduce library size
- Track UTM params as custom user properties
- Webpack packaging wrapper

## 18.04
- Add GDPR compliant consent management
- Add internal method for creating consents and expose it
- Notify loader listeners for sdk plugins on init too
- Fix opt out functionality to keep event queue empty

## 18.01
- Improved documentation and code clean up
- Added track_scrolls to visualize in scroll heat map (Enterprise version)
- Added resolution segmenting to heat/scroll map (Enterprise version)
- Fixed scoping in form data collection

## 17.09
- Improved documentation
- Added view segment to autogenerated helper events
- Added optin/optout functionality
- Fixed race condition in tests
- Fixed crashing when storage is not allowed by browser (cookies blocked)

## 17.05
- Improved documentation
- Expose internal methods for plugins
- Allow loading pluggable code
- Improved heat maps injecting them into website through SDK
- Add option to ignore visitor
- Fix possible recursion loop when using queued method calls

## 16.12.1
- Some minor changes

## 16.12
- Add ignore list for tracking views to ignore specific urls/view names
- Fix logging message with undefined key for debug output
- Added new configuration options, as session_update and max_events, force_post, ignore_prefetch
- Automatic switch to POST if amount of data can't be handled by GET
- Correctly handle ending session on device_id change without merge
- Additional checks preventing possible crashes
- Allow providing list of referrers to ignore
- By default ignore data from prefetching/prerendering
- Parse user agent on server
- User unique millisecond timestamp for reporting
- Fixed listening to forms and clicks logic
- Properly handling iOS dips resolution and Android's orientation specific resolution
- Using device pixels ratio as density metric

## 16.06
- Improved the way to detect browsers
- Updated searchbot ignore list
- Improved efficiency (less writes and reads)
- Less intrusive with DOM actions
- Method to collect user data from forms
- More commented code and docs
- Attribution campaigns report organic conversions too, if campaign data was not provided
- Exclude idle time from session duration
- Added queue size limitation

## 16.02
- Added page referrer metric for sources
- More accurate session and time tracking
- Tracking pages, pageviews and clicks, view frequency, landing pages, exits and bounces
- And page and browser values to error reports
- Added duration property to events and ability to measure timed events
- Allow changing device_id property (with data merge option on server)
- Allow atomic modifications and storing multiple values on custom user properties
- Ignoring data from bots by default
- Fix crashes with storage, when it is used too early, or has no permission
- New configuration options, like processing interval, ignoring bots, failing timeout
- Updated list detecting browsers
- Allow pushing functions with synchronous code to async queue
- More correct processing of the queue
- Added storing and reporting conversions for Attribution Analytics

## 15.08
- First official release compatible with Countly Server 15.08 functionalities
