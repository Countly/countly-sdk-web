(function (w, d) {
    var c = w.Countly || (w.Countly = {});
    var bootstrapMeta = {
        version: "1.0.0",
        name: "countly-unified-loader"
    };
    var pendingCalls = [];
    var isLoading = false;
    var isLoaded = false;
    var initConfig = null;

    c.__clyBootstrap = bootstrapMeta;

    function queueCall(methodPath) {
        return function () {
            pendingCalls.push([methodPath].concat(Array.prototype.slice.call(arguments, 0)));
            return c;
        };
    }

    function addStub(target, methodName, methodPath) {
        var stub = queueCall(methodPath || methodName);
        stub.__isCountlyStub = true;
        target[methodName] = stub;
    }

    function invokeMethod(root, methodPath, args) {
        var chunks = methodPath.split(".");
        var context = root;
        for (var idx = 0; idx < chunks.length - 1; idx++) {
            context = context && context[chunks[idx]];
        }
        var methodName = chunks[chunks.length - 1];
        var method = context && context[methodName];
        if (typeof method === "function" && !method.__isCountlyStub) {
            method.apply(context, args || []);
        }
    }

    function flushPendingCalls() {
        var live = w.Countly;
        var queue = pendingCalls.slice();
        pendingCalls = [];
        for (var idx = 0; idx < queue.length; idx++) {
            var call = queue[idx];
            invokeMethod(live, call[0], call.slice(1));
        }
    }

    function loadSdk(scriptUrl) {
        if (isLoaded || isLoading) {
            return;
        }
        isLoading = true;

        var script = d.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = scriptUrl;
        script.crossOrigin = "anonymous";
        script.onload = function () {
            isLoaded = true;
            isLoading = false;

            var live = w.Countly;
            if (live && typeof live.init === "function") {
                live.init(initConfig || {});
            }
            flushPendingCalls();
        };
        script.onerror = function () {
            isLoading = false;
            console.error("Countly loader failed to load SDK from:", scriptUrl);
        };

        var first = d.getElementsByTagName("script")[0];
        first.parentNode.insertBefore(script, first);
    }

    var methods = [
        "track_sessions",
        "track_pageview",
        "track_performance",
        "add_event",
        "user_details",
        "track_errors",
        "track_forms",
        "track_clicks",
        "track_scrolls",
        "track_links",
        "recordError",
        "change_id",
        "set_id",
        "uploadUserProfilePicture",
        "content.enterContentZone",
        "content.refreshContentZone",
        "content.exitContentZone",
        "feedback.showNPS",
        "feedback.showSurvey",
        "feedback.showRating",
        "userData.set",
        "userData.set_once",
        "userData.increment",
        "userData.increment_by",
        "userData.multiply",
        "userData.max",
        "userData.min",
        "userData.push",
        "userData.push_unique",
        "userData.pull",
        "userData.unset",
        "userData.save"
    ];

    for (var i = 0; i < methods.length; i++) {
        var parts = methods[i].split(".");
        if (parts.length === 2) {
            c[parts[0]] = c[parts[0]] || {};
            addStub(c[parts[0]], parts[1], methods[i]);
        }
        else {
            addStub(c, parts[0], methods[i]);
        }
    }

    c.init = function (appKey, config) {
        if (typeof appKey === "object") {
            config = appKey || {};
            appKey = config.app_key;
        }
        config = config || {};

        if (appKey) {
            config.app_key = appKey;
        }

        for (var key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                c[key] = config[key];
            }
        }

        if (c.app_key === "YOUR_APP_KEY" || c.url === "https://your.server.ly") {
            console.warn("Please do not use default set of app key and server url");
        }

        initConfig = config;
        var sdkUrl = c.sdk_url || "https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js";
        loadSdk(sdkUrl);
        return c;
    };
})(window, document);