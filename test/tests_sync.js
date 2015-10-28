var fs = require("fs");
casper.test.begin("Testing example_sync.html", 92, function(test) {
    var tests = [];
    var cnt = 0;
    tests.push(function (message){
        test.assertEquals(message[0], 'Countly initialized');
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
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "pageView");
        test.assert((params.segmentation) ? true : false);
        test.assert((params.segmentation.url) ? true : false);
        test.assertEquals(params.count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "buttonClick");
        test.assert((params.segmentation) ? true : false);
        test.assertEquals(params.segmentation.id, "testButton");
        test.assertEquals(params.count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.begin_session, 1);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
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
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
        
        params.metrics = JSON.parse(params.metrics);
        test.assertEquals(params.metrics._app_version, '0.0');
        test.assertEquals(params.metrics._resolution, '1024x768');
        test.assertEquals(params.metrics._browser, 'Safari');
        test.assertEquals(params.metrics._os, 'Linux');
        test.assertEquals(params.metrics._os_version, 'unknown');
        test.assertEquals(params.metrics._locale, 'en-US');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
        
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'pageView');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.events[0].segmentation.url) ? true : false);
        test.assertEquals(params.events[0].count, 1);
        
        test.assertEquals(params.events[1].key, 'buttonClick');
        test.assert((params.events[1].segmentation) ? true : false);
        test.assertEquals(params.events[1].segmentation.id, "testButton");
        test.assertEquals(params.events[1].count, 1);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
        
        params.events = JSON.parse(params.events);
        test.assertEquals(params.events[0].key, 'pageView');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.events[0].segmentation.url) ? true : false);
        test.assertEquals(params.events[0].count, 1);
        
        test.assertEquals(params.events[1].key, 'buttonClick');
        test.assert((params.events[1].segmentation) ? true : false);
        test.assertEquals(params.events[1].segmentation.id, "testButton");
        test.assertEquals(params.events[1].count, 1);
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
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Sending XML HTTP request');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Request Finished');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.session_duration, 61);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
    });
    casper.on('remote.message', function(message) {
        this.echo(message);
        tests[cnt](message.split("\n"));
        cnt++;
    });
    casper.start(fs.workingDirectory+"/examples/example_sync.html", function() {
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