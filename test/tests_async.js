var fs = require("fs");
function exists(value){
    return (typeof value != "undefined") ? true : false;
}
casper.test.begin("Testing example_async.html", 117, function(test) {
    var tests = [];
    var cnt = 0;
    tests.push(function (message){
        test.assertEquals(message[0], 'Countly initialized');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing queued call');
        test.assertEquals(message[1], '["begin_session"]');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Session started');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Got metrics');
        var params = JSON.parse(message[1]);
        test.assertEquals(params._app_version, '0.0');
        test.assertEquals(params._resolution, '1024x768');
        test.assertEquals(params._browser, 'Safari');
        test.assertEquals(params._os, 'Linux');
        test.assertEquals(params._os_version, 'unknown');
        test.assertEquals(params._locale, 'en-US');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing queued call');
        var params = JSON.parse(message[1])
        test.assertEquals(params[0], "add_event");
        test.assertEquals(params[1].key, "pageView");
        test.assert(exists(params[1].segmentation));
        test.assert(exists(params[1].segmentation.url));
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "pageView");
        test.assert(exists(params.segmentation));
        test.assert(exists(params.segmentation.url));
        test.assertEquals(params.count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.begin_session, 1);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.metrics = JSON.parse(params.metrics);
        test.assertEquals(params.metrics._app_version, '0.0');
        test.assertEquals(params.metrics._resolution, '1024x768');
        test.assertEquals(params.metrics._browser, 'Safari');
        test.assertEquals(params.metrics._os, 'Linux');
        test.assertEquals(params.metrics._os_version, 'unknown');
        test.assertEquals(params.metrics._locale, 'en-US');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.begin_session, 1);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.metrics = JSON.parse(params.metrics);
        test.assertEquals(params.metrics._app_version, '0.0');
        test.assertEquals(params.metrics._resolution, '1024x768');
        test.assertEquals(params.metrics._browser, 'Safari');
        test.assertEquals(params.metrics._os, 'Linux');
        test.assertEquals(params.metrics._os_version, 'unknown');
        test.assertEquals(params.metrics._locale, 'en-US');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing queued call');
        var params = JSON.parse(message[1])
        test.assertEquals(params[0], "add_event");
        test.assertEquals(params[1].key, "buttonClick");
        test.assert(exists(params[1].segmentation));
        test.assertEquals(params[1].segmentation.id, "testButton");
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "buttonClick");
        test.assert(exists(params.segmentation));
        test.assertEquals(params.segmentation.id, "testButton");
        test.assertEquals(params.count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'pageView');
        test.assert(exists(params.events[0].segmentation));
        test.assert(exists(params.events[0].segmentation.url));
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'pageView');
        test.assert(exists(params.events[0].segmentation));
        test.assert(exists(params.events[0].segmentation.url));
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'buttonClick');
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.id, "testButton");
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'buttonClick');
        test.assert(exists(params.events[0].segmentation));
        test.assertEquals(params.events[0].segmentation.id, "testButton");
        test.assertEquals(params.events[0].count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Session extended');
        test.assertEquals(message[1], '61');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.session_duration, 61);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.session_duration, 61);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert(exists(params.device_id));
        test.assert(exists(params.timestamp));
        test.assert(exists(params.hour));
        test.assert(exists(params.dow));
    });
    casper.on('remote.message', function(message) {
        this.echo(message);
        tests[cnt](message.split("\n"));
        cnt++;
    });
    casper.start(fs.workingDirectory+"/examples/example_async.html", function() {
        this.click('input');
    }).run(function() {
        setTimeout(function(){
            casper.evaluate(function() {
                localStorage.clear();
            }, {});
            test.done();
        }, 80000);
    });
});