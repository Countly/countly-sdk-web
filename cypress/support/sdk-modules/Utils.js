import { isBrowser, Countly } from "./Platform.js";
import { logLevelEnums, urlParseRE } from "./Constants.js";

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

    return (id + timestamp);
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
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
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
        return calculateChecksum(data, salt).then(checksum => {
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
        var data = fields.map((field) => field[0] + "=" + field[1]).join("&");
        return calculateChecksum(data, salt).then(checksum => {
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
    const msgUint8 = new TextEncoder().encode(data + salt); // encode as (utf-8) Uint8Array
    return crypto.subtle.digest("SHA-256", msgUint8).then((hashBuffer) => { // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string (lowercase)
        return hashHex.toUpperCase();
    }); 
}

/**
 * Decodes standard base64 text into bytes, with atob or, in runtimes without it, Buffer
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
    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(base64, "base64"));
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
};

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
    if (element === null || typeof element === "undefined") { // element can be null so lets check it first
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
};

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
};

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
        ua += (navigator.userAgentData.mobile ? " mobi " : " ");
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

    return uaData.getHighEntropyValues([
        "platform",
        "platformVersion",
        "architecture",
        "bitness",
        "model",
        "uaFullVersion",
        "fullVersionList"
    ]).then((values) => {
        if (!values || typeof values !== "object") {
            return null;
        }

        var browserName = null;
        var browserVersion = null;
        var versionList = Array.isArray(values.fullVersionList) ? values.fullVersionList : [];
        var fallbackList = Array.isArray(uaData.brands) ? uaData.brands : [];

        var normalizeBrand = (brand) => {
            return typeof brand === "string" ? brand.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
        };

        var isGreaseBrand = (brand) => {
            var normalized = normalizeBrand(brand);
            return normalized === "notabrand" || normalized === "notabrand99" || normalized.indexOf("notabrand") === 0;
        };

        var isChromiumBrand = (brand) => normalizeBrand(brand) === "chromium";

        var pickEntry = (list, allowChromiumFallback) => list.find((entry) => {
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

        var browserEntry = pickEntry(versionList, false)
            || pickEntry(fallbackList, false)
            || pickEntry(versionList, true)
            || pickEntry(fallbackList, true);

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
    }).catch(() => null);
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
    }
    else if (navigator.userAgentData && navigator.userAgentData.mobile) {
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
    const searchBotRE = /(CountlySiteBot|nuhk|Googlebot|GoogleSecurityScanner|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver|bingbot|Google Web Preview|Mediapartners-Google|AdsBot-Google|Baiduspider|Ezooms|YahooSeeker|AltaVista|AVSearch|Mercator|Scooter|InfoSeek|Ultraseek|Lycos|Wget|YandexBot|Yandex|YaDirectFetcher|SiteBot|Exabot|AhrefsBot|MJ12bot|TurnitinBot|magpie-crawler|Nutch Crawler|CMS Crawler|rogerbot|Domnutch|ssearch_bot|XoviBot|netseer|digincore|fr-crawler|wesee|AliasIO|contxbot|PingdomBot|BingPreview|HeadlessChrome|Lighthouse)/;

    // check override first
    if (uaOverride) {
        return searchBotRE.test(uaOverride);
    }

    // check both userAgent and userAgentData, as one of them might be containing the information we are looking for
    const ua_bot = searchBotRE.test(currentUserAgentString());
    const uaData_bot = searchBotRE.test(currentUserAgentDataString());

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
    if (typeof e.pageY === "undefined"
        && typeof e.clientX === "number"
        && document.documentElement) {
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
    var callbackFunction = function () {
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
        var css = "#cly-loader {height: 4px; width: 100%; position: absolute; z-index: 99999; overflow: hidden; background-color: #fff; top:0px; left:0px;}"
            + "#cly-loader:before{display: block; position: absolute; content: ''; left: -200px; width: 200px; height: 4px; background-color: #2EB52B; animation: cly-loading 2s linear infinite;}"
            + "@keyframes cly-loading { from {left: -200px; width: 30%;} 50% {width: 30%;} 70% {width: 70%;} 80% { left: 50%;} 95% {left: 120%;} to {left: 100%;}}";
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
        window.addEventListener("load", () => {
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
    var parts = { origin: "", pathname: "", search: "", hash: "" };
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

export {
    isSafeActionUrl,
    isSensitiveFieldName,
    isPhoneFieldName,
    looksLikeCardNumber,
    looksLikeSsn,
    isPhoneShaped,
    isWholeEmail,
    getMultiSelectValues,
    secureRandom,
    generateUUID,
    replacePatternWithRandomValues,
    getTimestamp,
    getMsTimestamp,
    getConfig,
    dispatchErrors,
    prepareParams,
    prepareFormFields,
    stripTrailingSlash,
    createNewObjectFromProperties,
    addNewProperties,
    truncateObject,
    truncateSingleValue,
    get_closest_element,
    add_event_listener,
    get_event_target,
    currentUserAgentString,
    userAgentDeviceDetection,
    userAgentSearchBotDetection,
    get_page_coord,
    getDocHeight,
    getDocWidth,
    getViewportHeight,
    getOrientation,
    loadJS,
    loadCSS,
    showLoader,
    checkIfLoggingIsOn,
    hideLoader,
    currentUserAgentDataString,
    getUserAgentClientHints,
    parseWindowsVersionFromPlatformVersion,
    calculateChecksum,
    base64ToBytes,
    parseUrlParts
};