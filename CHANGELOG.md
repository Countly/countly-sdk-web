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
