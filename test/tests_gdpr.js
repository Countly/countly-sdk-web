/*global Countly, casper*/
var fs = require("fs");
function exists(value) {
    return (typeof value !== "undefined") ? true : false;
}
casper.test.begin("Testing example_gdpr.html", 240, function(test) {
    var tests = [];
    var cnt = 0;
    tests.push(function(message) {
        test.assertEquals(message[0], 'Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for crashes');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.consent = JSON.parse(params.consent);
        test.assertEquals(params.consent.crashes, true);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Got metrics');
        var params = JSON.parse(message[1]);
        test.assertEquals(params._app_version, '0.0');
        test.assertEquals(params._resolution, '1024x768');
        test.assertEquals(params._locale, 'en-US');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, false);
        test.assert(exists(params.crash._error));
        test.assert(exists(params.crash._run));
        test.assert(exists(params.crash._custom));
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for interaction');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for scrolls,clicks,forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for scrolls');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for clicks');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_action");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.type, "click");
        test.assert(exists(params.segmentation.x));
        test.assert(exists(params.segmentation.y));
        test.assert(exists(params.segmentation.width));
        test.assert(exists(params.segmentation.height));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "linkClick");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assert(exists(params.segmentation.href));
        test.assert(exists(params.segmentation.text));
        test.assert(exists(params.segmentation.id));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);

        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.consent = JSON.parse(params.consent);
        test.assertEquals(params.consent.scrolls, true);
        test.assertEquals(params.consent.clicks, true);
        test.assertEquals(params.consent.forms, true);

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 2);

        test.assertEquals(params.events[0].key, "[CLY]_action");
        test.assertEquals(params.events[0].count, 1);
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.type, "click");
        test.assert(exists(params.events[0].segmentation.x));
        test.assert(exists(params.events[0].segmentation.y));
        test.assert(exists(params.events[0].segmentation.width));
        test.assert(exists(params.events[0].segmentation.height));

        test.assertEquals(params.events[1].key, "linkClick");
        test.assertEquals(params.events[1].count, 1);
        test.assert(exists(params.events[1].segmentation));
        test.assert(exists(params.events[1].segmentation.href));
        test.assert(exists(params.events[1].segmentation.text));
        test.assert(exists(params.events[1].segmentation.id));

    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_action");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.type, "click");
        test.assert(exists(params.segmentation.x));
        test.assert(exists(params.segmentation.y));
        test.assert(exists(params.segmentation.width));
        test.assert(exists(params.segmentation.height));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "formSubmit");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.name, "comments");
        test.assertEquals(params.segmentation.method, "post");
        test.assertEquals(params.segmentation["input:message"], "Message Name");
        test.assertEquals(params.segmentation["input:textarea"], "Message");
        test.assertEquals(params.segmentation["input:select-one"], "option1");
        test.assertEquals(params.segmentation["input:submit-form"], "Submit");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 2);

        test.assertEquals(params.events[0].key, "[CLY]_action");
        test.assertEquals(params.events[0].count, 1);
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.type, "click");
        test.assert(exists(params.events[0].segmentation.x));
        test.assert(exists(params.events[0].segmentation.y));
        test.assert(exists(params.events[0].segmentation.width));
        test.assert(exists(params.events[0].segmentation.height));

        test.assertEquals(params.events[1].key, 'formSubmit');
        test.assert(exists(params.events[1].segmentation));
        test.assertEquals(params.events[1].segmentation.name, "comments");
        test.assertEquals(params.events[1].segmentation.method, "post");
        test.assertEquals(params.events[1].segmentation["input:message"], "Message Name");
        test.assertEquals(params.events[1].segmentation["input:textarea"], "Message");
        test.assertEquals(params.events[1].segmentation["input:select-one"], "option1");
        test.assertEquals(params.events[1].segmentation["input:submit-form"], "Submit");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Got metrics');
        var params = JSON.parse(message[1]);
        test.assertEquals(params._app_version, '0.0');
        test.assertEquals(params._resolution, '1024x768');
        test.assertEquals(params._locale, 'en-US');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_action");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.type, "click");
        test.assert(exists(params.segmentation.x));
        test.assert(exists(params.segmentation.y));
        test.assert(exists(params.segmentation.width));
        test.assert(exists(params.segmentation.height));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, false);
        test.assert(exists(params.crash._error));
        test.assert(exists(params.crash._run));
        test.assert(exists(params.crash._custom));
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 1);

        test.assertEquals(params.events[0].key, "[CLY]_action");
        test.assertEquals(params.events[0].count, 1);
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.type, "click");
        test.assert(exists(params.events[0].segmentation.x));
        test.assert(exists(params.events[0].segmentation.y));
        test.assert(exists(params.events[0].segmentation.width));
        test.assert(exists(params.events[0].segmentation.height));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for interaction');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for scrolls,clicks,forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for scrolls');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for clicks');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for activity');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for sessions,events,views');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for sessions');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for events');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding consent for views');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Session started');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Got metrics');
        var params = JSON.parse(message[1]);
        test.assertEquals(params._app_version, '0.0');
        test.assertEquals(params._resolution, '1024x768');
        test.assertEquals(params._locale, 'en-US');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_view");
        test.assertEquals(params.count, 1);
        test.assert(exists(params.segmentation));
        test.assert(exists(params.segmentation.name));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.begin_session, 1);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.metrics = JSON.parse(params.metrics);
        test.assertEquals(params.metrics._app_version, '0.0');
        test.assertEquals(params.metrics._resolution, '1024x768');
        test.assertEquals(params.metrics._locale, 'en-US');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, '[CLY]_view');
        test.assert(exists(params.events[0].segmentation));
        test.assert(exists(params.events[0].segmentation.name));
        test.assert(exists(params.events[0].segmentation.visit));
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Got metrics');
        var params = JSON.parse(message[1]);
        test.assertEquals(params._app_version, '0.0');
        test.assertEquals(params._resolution, '1024x768');
        test.assertEquals(params._locale, 'en-US');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, false);
        test.assert(exists(params.crash._error));
        test.assert(exists(params.crash._run));
        test.assert(exists(params.crash._custom));
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for activity,interaction,crashes');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for activity');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for sessions,events,views');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for sessions');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for events');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for views');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for interaction');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for scrolls,clicks,forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for scrolls');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for clicks');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for forms');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Removing consent for crashes');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.consent = JSON.parse(params.consent);
        test.assertEquals(params.consent.crashes, false);
        test.assertEquals(params.consent.sessions, false);
        test.assertEquals(params.consent.events, false);
        test.assertEquals(params.consent.views, false);
    });
    casper.removeAllListeners('remote.message');
    var ignore = ["Sending XML HTTP request", "Request Finished", "Failed Server XML HTTP request"];
    casper.on('remote.message', function(message) {
        this.echo(message);
        if (ignore.indexOf(message.split("\n")[0]) === -1) {
            if (!tests[cnt](message.split("\n"))) {
                cnt++;
            }
        }
    });

    function actionSuit(ob, callback) {
        ob.click('#track_link');
        setTimeout(function() {
            ob.click('#submit-form');
        }, 5000);
        setTimeout(function() {
            ob.click('#unhandled_error');
            setTimeout(callback, 5000);
        }, 15000);
    }
    casper.start(fs.workingDirectory + "/examples/example_gdpr.html", function() {
        var ob = this;
        actionSuit(ob, function() {
            casper.evaluate(function() {
                Countly.add_consent("crashes");
            }, {});
            actionSuit(ob, function() {
                casper.evaluate(function() {
                    Countly.add_consent("interaction");
                }, {});
                actionSuit(ob, function() {
                    casper.evaluate(function() {
                        Countly.remove_consent("interaction");
                        Countly.add_consent("activity");
                    }, {});
                    actionSuit(ob, function() {
                        casper.evaluate(function() {
                            Countly.remove_consent(["activity", "interaction", "crashes"]);
                        }, {});
                        actionSuit(ob, function() {
                            casper.clear();
                            casper.clearCache();
                            casper.clearMemoryCache();
                            casper.removeAllListeners('remote.message');
                            casper.open(fs.workingDirectory + "/test/files/clear.html", function() {});
                            test.done();
                        });
                    });
                });
            });
        });
    }).run(function() {});
});