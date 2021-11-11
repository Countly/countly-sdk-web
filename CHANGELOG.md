## 21.11
- !! Consent change !! Rating and Feedback widgets now require 'star-rating' or 'feedback' consent exclusively, according to their type, instead of both:
    - `present_feedback_widget` needs 'feedback' consent only
    - `get_available_feedback_widgets` needs 'feedback' consent only
    - `enable_feedback` needs 'star-rating' consent only
    - `show_feedback_popup` needs 'star-rating' consent only
    - `initialize_feedback_popups` needs 'star-rating' consent only
    - `report_feedback` needs 'star-rating' consent only
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