"use strict";
/*global Countly */
/*
Countly Adapter Library for Google Analytics
*/
(function() {
    // logs array for tests
    window.cly_ga_test_logs = [];
    Countly.onload = Countly.onload || [];
    // adapter function
    window.CountlyGAAdapter = function() {
        // hold ga instance
        var old_ga = window.ga;
        // array for ga calls which called before ga initialized
        var gaCalls = [];
        // hold calls in array
        window.ga = function() {
            gaCalls.push(arguments);
            return old_ga.apply(this, arguments);
        };
        // ga overrided signature
        window.ga._signature = 1;

        // hold ga_countly calls in array before countly initialized
        var gaCountlyArray = [];
        var ga_countly = function() {
            gaCountlyArray.push(arguments);
        };

        Countly.onload.push(function(cly) {
            // cart for ga:ecommerce plugin
            var cart = cly._internals.store('cly_ecommerce:cart') || [];
            // override ga_countly and map request to countly
            ga_countly = function(c, o, u, n, t, l/*, y*/) {
                if (typeof c === "string") {
                    var customSegments, i, count;
                    switch (c) {
                    case 'send':
                        if (typeof o === 'string') {
                            // ga('send', 'event', ..)
                            if (o === 'event') {

                                customSegments = {};
                                count = 1;
                                // ga('send', 'event', 'category', 'action')
                                if (arguments.length === 4) {
                                    customSegments.category = u;
                                }
                                // ga('send', 'event', 'category', 'action', 'label')
                                else if (arguments.length === 5 && typeof arguments[4] === "string") {
                                    customSegments.category = u;
                                    customSegments.label = t;
                                }
                                // ga('send', 'event', 'category', 'action', {metric:value})
                                else if (arguments.length === 5 && typeof arguments[4] === "object") {
                                    customSegments.category = u;
                                    for (i = 0; i < Object.keys(arguments[4]).length; i++) {
                                        customSegments[Object.keys(arguments[4])[i]] = Object.values(arguments[4])[i];
                                    }
                                }
                                // ga('send', 'event', 'category', 'action', 'label', 1)
                                else if (arguments.length >= 6) {
                                    customSegments.category = u;
                                    customSegments.label = t;
                                    count = l;
                                }

                                // add event by configured values
                                Countly.q.push(['add_event', {
                                    key: n,
                                    count: count,
                                    segmentation: customSegments
                                }]);

                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        key: n,
                                        count: count,
                                        segmentation: customSegments
                                    }]);
                                }
                            }
                            // ga('send', 'pageview')
                            else if (o === 'pageview' && arguments.length === 2) {
                                if (cly._internals.store('cly_ga:page')) {
                                    Countly.q.push(['track_pageview', cly._internals.store('cly_ga:page')]);
                                    if (window.cly_ga_test_mode) {
                                        window.cly_ga_test_logs.push(['track_pageview', cly._internals.store('cly_ga:page')]);
                                    }
                                }
                                else {
                                    Countly.q.push(['track_pageview']);
                                    if (window.cly_ga_test_mode) {
                                        window.cly_ga_test_logs.push(['track_pageview']);
                                    }
                                }
                            }
                            // ga('send', 'pageview', 'page')
                            else if (o === 'pageview' && arguments.length >= 3 && typeof arguments[2] === "string") {
                                Countly.q.push(['track_pageview', arguments[2]]);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['track_pageview', arguments[2]]);
                                }
                            }
                            // ga('send', 'pageview', {'customDimension':'customValue'})
                            else if (o === 'pageview' && arguments.length >= 3 && typeof arguments[2] === "object") {
                                // we are not supported tracking pageview with custom objects for now
                                Countly.q.push(['track_pageview']);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['track_pageview']);
                                }
                            }
                            // ga('send', 'social', 'network', 'action', 'target')
                            else if (o === 'social') {
                                Countly.q.push(['add_event', {
                                    "key": n,
                                    "count": 1,
                                    "segmentation": {
                                        "category": o,
                                        "platform": u,
                                        "target": t
                                    }
                                }]);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        "key": n,
                                        "count": 1,
                                        "segmentation": {"category": o, "platform": u, "target": t}
                                    }]);
                                }
                            }
                            // ga('send', 'screenview', {..})
                            else if (o === 'screenview') {
                                customSegments = {appName: u.appName};

                                if (u.screenName) {
                                    customSegments.screenName = u.screenName;
                                }
                                if (u.appVersion) {
                                    customSegments.appVersion = u.appVersion;
                                }
                                if (u.appInstallerId) {
                                    customSegments.appInstallerId = u.appInstallerId;
                                }
                                if (cly._internals.store('cly_ga:screenname')) {
                                    customSegments.screenName = cly._internals.store('cly_ga:screenname');
                                }

                                Countly.q.push(['add_event', {
                                    "key": "Screen View",
                                    "count": 1,
                                    "segmentation": customSegments
                                }]);

                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        "key": "Screen View",
                                        "count": 1,
                                        "segmentation": customSegments
                                    }]);
                                }
                            }
                            // ga('send', 'exception', {..})
                            else if (o === 'exception') {
                                cly.log_error(u.exDescription);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(u.exDescription);
                                }
                            }
                            // ga('send', 'timing', 'timingCategory', 'timingVar', 'timingValue', 'timingLabel')
                            else if (o === 'timing') {
                                customSegments = {category: u};
                                if (l) {
                                    customSegments.label = l;
                                }
                                Countly.q.push(['add_event', {
                                    "key": n,
                                    "count": 1,
                                    "dur": t,
                                    "segmentation": customSegments
                                }]);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        "key": n,
                                        "count": 1,
                                        "dur": t,
                                        "segmentation": customSegments
                                    }]);
                                }
                            }
                        }
                        // ga('send', {hitType:.., ...})
                        else if (typeof o === 'object') {
                            switch (o.hitType) {
                            // ga('send', {'hitType':'event', ..})
                            case 'event':
                                customSegments = {
                                    'category': o.eventCategory
                                };
                                count = 1;

                                if (o.eventLabel) {
                                    customSegments.label = o.eventLabel;
                                }
                                if (o.eventValue) {
                                    count = o.eventValue;
                                }

                                Countly.q.push(['add_event', {
                                    key: o.eventAction,
                                    count: count,
                                    segmentation: customSegments
                                }]);

                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        key: o.eventAction,
                                        count: count,
                                        segmentation: customSegments
                                    }]);
                                }

                                break;
                                // ga('send', {'hitType':'social', ..})
                            case 'social':
                                Countly.q.push(['add_event', {
                                    "key": o.socialAction,
                                    "count": 1,
                                    "segmentation": {
                                        "category": o.hitType,
                                        "platform": o.socialNetwork,
                                        "target": o.socialTarget
                                    }
                                }]);

                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        "key": o.socialAction,
                                        "count": 1,
                                        "segmentation": {
                                            "category": o.hitType,
                                            "platform": o.socialNetwork,
                                            "target": o.socialTarget
                                        }
                                    }]);
                                }

                                break;
                                // ga('send', {'hitType':'timing', ..})
                            case 'timing':
                                Countly.q.push(['add_event', {
                                    "key": o.timingVar,
                                    "count": 1,
                                    "dur": o.timingValue,
                                    "segmentation": {
                                        "category": o.timingCategory
                                    }
                                }]);

                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['add_event', {
                                        "key": o.timingVar,
                                        "count": 1,
                                        "dur": o.timingValue,
                                        "segmentation": {"category": o.timingCategory}
                                    }]);
                                }
                                break;
                                // ga('send', {'hitType':'pageview', 'page':'page'})
                            case 'pageview':
                                Countly.q.push(['track_pageview', o.page]);
                                if (window.cly_ga_test_mode) {
                                    window.cly_ga_test_logs.push(['track_pageview', o.page]);
                                }
                                break;
                            }
                        }
                        break;
                        // ga('create', '..')
                    case 'create':
                        // ga('create', .., 'auto', '..')
                        if (arguments.length === 4 && arguments[2] === 'auto') {
                            cly._internals.store('cly_ga:id', o);
                            if (window.cly_ga_test_mode) {
                                window.cly_ga_test_logs.push({
                                    'stored': cly._internals.store('cly_ga:id'),
                                    'value': o
                                });
                            }
                            window.ga_adapter_integrated = true;
                            // ga('create', .., callback)
                        }
                        else if (arguments.length === 3) {
                            cly._internals.store('cly_ga:id', o);
                            if (window.cly_ga_test_mode) {
                                window.cly_ga_test_logs.push({
                                    'stored': cly._internals.store('cly_ga:id'),
                                    'value': o
                                });
                            }
                            window.ga_adapter_integrated = true;
                        }
                        break;
                        // ga('set', '..')
                    case 'set':
                        // ga('set', 'page', '/login.html')
                        if (o === 'page') {
                            cly._internals.store('cly_ga:page', u);
                        }
                        // ga('set', 'screenname', 'High scores')
                        else if (o === 'screenname') {
                            cly._internals.store('cly_ga:screenname', u);
                            if (window.cly_ga_test_mode) {
                                window.cly_ga_test_logs.push({
                                    'stored': cly._internals.store('cly_ga:screenname'),
                                    'value': u
                                });
                            }
                        }
                        // ga('set', 'dimension', 'custom data')
                        else if (arguments.length === 3) {
                            Countly.q.push(['userData.set', o, u]);
                            if (window.cly_ga_test_mode) {
                                window.cly_ga_test_logs.push(['userData.set', o, u]);
                            }
                        }
                        // ga('set', {key:val, anotherKey: anotherVal})
                        else if (arguments.length === 2 && typeof o === 'object') {
                            Countly.q.push(['user_details', {custom: o}]);
                            if (window.cly_ga_test_mode) {
                                window.cly_ga_test_logs.push(['user_details', {custom: o}]);
                            }
                        }
                        break;
                        // ga('ecommerce:addTransaction', {..})
                    case 'ecommerce:addTransaction':
                        customSegments = {
                            "id": o.id,
                            "affiliation": o.affiliation,
                            "shipping": o.shipping,
                            "tax": o.tax
                        };

                        if (o.currency) {
                            customSegments.currency = o.currency;
                        }

                        Countly.q.push(['add_event', {
                            "key": c,
                            "count": 1,
                            "sum": o.revenue,
                            "segmentation": customSegments
                        }]);

                        if (window.cly_ga_test_mode) {
                            window.cly_ga_test_logs.push(['add_event', {
                                "key": c,
                                "count": 1,
                                "sum": o.revenue,
                                "segmentation": customSegments
                            }]);
                        }

                        break;
                        // ga('ecommerce:addItem', {..})
                    case 'ecommerce:addItem':
                        customSegments = {
                            "id": o.id,
                            "name": o.name,
                            "sku": o.sku,
                            "category": o.category
                        };

                        if (o.currency) {
                            customSegments.currency = o.currency;
                        }

                        cart.push(['add_event', {
                            "key": c,
                            "count": o.quantity,
                            "sum": o.price,
                            "segmentation": customSegments
                        }]);

                        cly._internals.store('cly_ecommerce:cart', cart);

                        if (window.cly_ga_test_mode) {
                            window.cly_ga_test_logs.push(['add_event', {
                                "key": c,
                                "count": o.quantity,
                                "sum": o.price,
                                "segmentation": customSegments
                            }]);
                        }

                        break;
                        // ga('ecommerce:send')
                    case 'ecommerce:send':
                        var firstLength;
                        if (window.cly_ga_test_mode) {
                            firstLength = cart.length;
                        }
                        for (i = 0; i < cart.length; i++) {
                            Countly.q.push(cart[i]);
                        }
                        cart = [];
                        cly._internals.store('cly_ecommerce:cart', cart);

                        if (window.cly_ga_test_mode) {
                            window.cly_ga_test_logs.push({first: firstLength, last: cart.length});
                        }
                        break;
                        // ga('ecommerce:clear')
                    case 'ecommerce:clear':
                        cart = [];
                        cly._internals.store('cly_ecommerce:cart', cart);

                        if (window.cly_ga_test_mode) {
                            window.cly_ga_test_logs.push(cly._internals.store('cly_ecommerce:cart'));
                        }
                        break;
                    default:
                        break;
                    }
                }
            };
            // apply old countly calls to overrided function
            while (gaCountlyArray.length) {
                var args = gaCountlyArray.shift();
                ga_countly.apply(window, args);
            }
        });

        // check variable for gaAdapter is loaded?
        setTimeout(function check() {
            if (window.ga._signature) {
                return setTimeout(check, 125);
            }
            old_ga = window.ga;

            while (gaCalls.length) {
                var args = gaCalls.shift();
                ga_countly.apply(window, args);
            }

            window.ga = function() {
                ga_countly.apply(window, arguments);
                return old_ga.apply(this, arguments);
            };
        }, 125);
    };
}());