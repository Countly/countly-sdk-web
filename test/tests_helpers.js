/* global casper*/
var fs = require("fs");
function exists(value) {
    return (typeof value !== "undefined") ? true : false;
}
casper.test.begin("Testing example_helpers.html", 235, function(test) {
    var tests = [];
    var cnt = 0;
    tests.push(function(message) {
        test.assertEquals(message[0], 'Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_orientation");
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.mode, "landscape");
        test.assertEquals(params.count, 1);
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
        test.assertEquals(params.events.length, 2);

        test.assertEquals(params.events[0].key, '[CLY]_orientation');
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.mode, "landscape");
        test.assertEquals(params.events[0].count, 1);

        test.assertEquals(params.events[1].key, '[CLY]_view');
        test.assert(exists(params.events[1].segmentation));
        test.assert(exists(params.events[1].segmentation.name));
        test.assertEquals(params.events[1].count, 1);
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
        if (message[0] === "Processing request") {
            return true;
        }
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
        if (message[0] === "Processing request") {
            return true;
        }
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_view");
        test.assertEquals(params.count, 1);
        test.assert(params.dur >= 29 && params.dur <= 31);
        test.assert(exists(params.segmentation));
        test.assert(exists(params.segmentation.name));
    });
    tests.push(function(message) {
        if (message[0] === "Processing request") {
            return true;
        }
        test.assertEquals(message[0], 'Session extended');
    });
    tests.push(function(message) {
        if (message[0] === "Processing request") {
            return true;
        }
        test.assertEquals(message[0], 'Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_orientation");
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.mode, "landscape");
        test.assertEquals(params.count, 1);
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
        test.assert(params.session_duration >= 29 && params.session_duration <= 31);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
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
        test.assertEquals(params.events.length, 5);

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

        test.assertEquals(params.events[2].key, "[CLY]_view");
        test.assertEquals(params.events[2].count, 1);
        test.assert(params.events[2].dur >= 29 && params.events[2].dur <= 31);
        test.assert(exists(params.events[2].segmentation));
        test.assert(exists(params.events[2].segmentation.name));

        test.assertEquals(params.events[3].key, '[CLY]_orientation');
        test.assert(exists(params.events[3].segmentation));
        test.assertEquals(params.events[3].segmentation.mode, "landscape");
        test.assertEquals(params.events[3].count, 1);

        test.assertEquals(params.events[4].key, '[CLY]_view');
        test.assert(exists(params.events[4].segmentation));
        test.assert(exists(params.events[4].segmentation.name));
        test.assertEquals(params.events[4].count, 1);
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
        test.assertEquals(params.crash._logs, "Pressed unhandled button");
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

        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, true);
        test.assertEquals(params.crash._logs, "Pressed handled button");
        test.assert(exists(params.crash._error));
        test.assert(exists(params.crash._run));
        test.assert(exists(params.crash._custom));
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
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
        test.assertEquals(message[0], 'Session extended');
        test.assertEquals(message[1], '61');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assert(params.session_duration >= 59 && params.session_duration <= 61);
        test.assertEquals(params.app_key, "YOUR_APP_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "[CLY]_view");
        test.assert(params.dur >= 64 && params.dur <= 66);
        test.assert(exists(params.segmentation));
        test.assert(exists(params.segmentation.name));
        test.assert(!exists(params.segmentation.visit));
        test.assertEquals(params.count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Session extended');
        test.assert(message[1] >= 3 && message[1] <= 4);
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
    casper.start(fs.workingDirectory + "/examples/example_helpers.html", function() {
        var ob = this;
        setTimeout(function() {
            ob.click('#track_link');
        }, 1000);
        setTimeout(function() {
            ob.click('#submit-form');
        }, 30000);
        setTimeout(function() {
            ob.click('#unhandled_error');
            ob.click('#handled_error');
        }, 70000);
    }).run(function() {
        setTimeout(function() {
            casper.clear();
            casper.clearCache();
            casper.clearMemoryCache();
            casper.removeAllListeners('remote.message');
            casper.open(fs.workingDirectory + "/test/files/clear.html", function() {});
            test.done();
        }, 95000);
    });
});