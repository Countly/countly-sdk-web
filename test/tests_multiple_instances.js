/* global casper*/
var fs = require("fs");
function exists(value) {
    return (typeof value !== "undefined") ? true : false;
}
casper.test.begin("Testing example_multiple_instances.html", 48, function(test) {
    var tests = [];
    var cnt = 0;
    tests.push(function(message) {
        test.assertEquals(message[0], 'Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "first_app");
        test.assertEquals(params.count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY2] Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY2] Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "second_app");
        test.assertEquals(params.count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing queued call');
        var params = JSON.parse(message[1]);
        test.assertEquals(params[0], "init");
        test.assertEquals(params[1].app_key, "YOUR_APP_KEY3");
        test.assertEquals(params[1].url, "https://try.count.ly");
        test.assertEquals(params[1].debug, true);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY3] Countly initialized');
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing queued call');
        var params = JSON.parse(message[1]);
        test.assertEquals(params[0], "YOUR_APP_KEY3");
        test.assertEquals(params[1], "add_event");
        test.assertEquals(params[2].key, "third_app");
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY3] Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "third_app");
        test.assertEquals(params.count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);

        test.assertEquals(params.app_key, "YOUR_APP_KEY1");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 1);

        test.assertEquals(params.events[0].key, 'first_app');
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY2] Processing request');
        var params = JSON.parse(message[1]);

        test.assertEquals(params.app_key, "YOUR_APP_KEY2");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 1);

        test.assertEquals(params.events[0].key, 'second_app');
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function(message) {
        test.assertEquals(message[0], '[YOUR_APP_KEY3] Processing request');
        var params = JSON.parse(message[1]);

        test.assertEquals(params.app_key, "YOUR_APP_KEY3");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));

        params.events = JSON.parse(params.events);
        test.assertEquals(params.events.length, 1);

        test.assertEquals(params.events[0].key, 'third_app');
        test.assertEquals(params.events[0].count, 1);
    });
    casper.removeAllListeners('remote.message');
    var ignore = ["Sending XML HTTP request", "Request Finished", "Failed Server XML HTTP request"];
    casper.on('remote.message', function(message) {
        this.echo(message);
        if (ignore.indexOf(message.split("\n")[0].split("]").pop().trim()) === -1) {
            if (!tests[cnt](message.split("\n"))) {
                cnt++;
            }
        }
    });
    casper.start(fs.workingDirectory + "/examples/example_multiple_instances.html", function() {
    }).run(function() {
        setTimeout(function() {
            casper.clear();
            casper.clearCache();
            casper.clearMemoryCache();
            casper.removeAllListeners('remote.message');
            casper.open(fs.workingDirectory + "/test/files/clear.html", function() {});
            test.done();
        }, 1000);
    });
});