var fs = require("fs");
casper.test.begin("Testing example_sync.html", 353, function(test) {
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
        test.assertEquals(params.key, "[CLY]_view");
        test.assertEquals(params.count, 1);
        test.assert((params.segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "linkClick");
        test.assertEquals(params.count, 1);
        test.assert((params.segmentation) ? true : false);
        test.assert((params.segmentation.href) ? true : false);
        test.assertEquals(params.segmentation.text, "Dummy link");
        test.assertEquals(params.segmentation.id, "track_link");
        test.assert((params.segmentation.x) ? true : false);
        test.assert((params.segmentation.y) ? true : false);
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
        test.assertEquals(params.events[0].key, '[CLY]_view');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
        test.assertEquals(params.events[0].count, 1);
        
        test.assertEquals(params.events[1].key, 'linkClick');
        test.assert((params.events[1].segmentation) ? true : false);
        test.assert((params.events[1].segmentation.href) ? true : false);
        test.assertEquals(params.events[1].segmentation.text, "Dummy link");
        test.assertEquals(params.events[1].segmentation.id, "track_link");
        test.assert((params.events[1].segmentation.x) ? true : false);
        test.assert((params.events[1].segmentation.y) ? true : false);
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
        test.assertEquals(params.events[0].key, '[CLY]_view');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
        test.assertEquals(params.events[0].count, 1);
        
        test.assertEquals(params.events[1].key, 'linkClick');
        test.assert((params.events[1].segmentation) ? true : false);
        test.assert((params.events[1].segmentation.href) ? true : false);
        test.assertEquals(params.events[1].segmentation.text, "Dummy link");
        test.assertEquals(params.events[1].segmentation.id, "track_link");
        test.assert((params.events[1].segmentation.x) ? true : false);
        test.assert((params.events[1].segmentation.y) ? true : false);
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Adding event: ');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.key, "formSubmit");
        test.assertEquals(params.count, 1);
        test.assert((params.segmentation) ? true : false);
        test.assertEquals(params.segmentation.id, "");
        test.assertEquals(params.segmentation.name, "comments");
        test.assertEquals(params.segmentation.action, "");
        test.assertEquals(params.segmentation.method, "post");
        test.assertEquals(params.segmentation["input:message"], "Message Name");
        test.assertEquals(params.segmentation["input:textarea"], "Message");
        test.assertEquals(params.segmentation["input:select-one"], "option1");
        test.assertEquals(params.segmentation["input:submit-form"], "Submit");
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Ending session');
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.end_session, 1);
        test.assertEquals(params.session_duration, 30);
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
        test.assertEquals(params.end_session, 1);
        test.assertEquals(params.session_duration, 30);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
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
        test.assertEquals(params.events[0].key, 'formSubmit');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assertEquals(params.events[0].segmentation.id, "");
        test.assertEquals(params.events[0].segmentation.name, "comments");
        test.assertEquals(params.events[0].segmentation.action, "");
        test.assertEquals(params.events[0].segmentation.method, "post");
        test.assertEquals(params.events[0].segmentation["input:message"], "Message Name");
        test.assertEquals(params.events[0].segmentation["input:textarea"], "Message");
        test.assertEquals(params.events[0].segmentation["input:select-one"], "option1");
        test.assertEquals(params.events[0].segmentation["input:submit-form"], "Submit");
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
        test.assertEquals(params.events[0].key, 'formSubmit');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assertEquals(params.events[0].segmentation.id, "");
        test.assertEquals(params.events[0].segmentation.name, "comments");
        test.assertEquals(params.events[0].segmentation.action, "");
        test.assertEquals(params.events[0].segmentation.method, "post");
        test.assertEquals(params.events[0].segmentation["input:message"], "Message Name");
        test.assertEquals(params.events[0].segmentation["input:textarea"], "Message");
        test.assertEquals(params.events[0].segmentation["input:select-one"], "option1");
        test.assertEquals(params.events[0].segmentation["input:submit-form"], "Submit");
    });
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
        test.assertEquals(params.key, "[CLY]_view");
        test.assertEquals(params.count, 1);
        test.assert((params.segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
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
        test.assertEquals(params.events[0].key, '[CLY]_view');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
        test.assertEquals(params.events[0].count, 1);
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
        test.assertEquals(params.events[0].key, '[CLY]_view');
        test.assert((params.events[0].segmentation) ? true : false);
        test.assert((params.segmentation.name) ? true : false);
        test.assertEquals(params.events[0].count, 1);
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
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
        
        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._os, 'Linux');
        test.assertEquals(params.crash._os_version, 'unknown');
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._manufacture, 'Safari');
        test.assertEquals(params.crash._online, false);
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, false);
        test.assertEquals(params.crash._logs, "Pressed unhandled button");
        test.assert((params.crash._error) ? true : false);
        test.assert((params.crash._run) ? true : false);
        test.assert((params.crash._custom) ? true : false);
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
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
        
        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._os, 'Linux');
        test.assertEquals(params.crash._os_version, 'unknown');
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._manufacture, 'Safari');
        test.assertEquals(params.crash._online, false);
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, false);
        test.assertEquals(params.crash._logs, "Pressed unhandled button");
        test.assert((params.crash._error) ? true : false);
        test.assert((params.crash._run) ? true : false);
        test.assert((params.crash._custom) ? true : false);
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
    });
    tests.push(function (message){
        test.assertEquals(message[0], 'Processing request');
        var params = JSON.parse(message[1]);
        test.assertEquals(params.app_key, "YOUR_API_KEY");
        test.assert((params.device_id) ? true : false);
        test.assert((params.timestamp) ? true : false);
        test.assert((params.hour) ? true : false);
        test.assert((params.dow) ? true : false);
        
        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._os, 'Linux');
        test.assertEquals(params.crash._os_version, 'unknown');
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._manufacture, 'Safari');
        test.assertEquals(params.crash._online, false);
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, true);
        test.assertEquals(params.crash._logs, "Pressed handled button");
        test.assert((params.crash._error) ? true : false);
        test.assert((params.crash._run) ? true : false);
        test.assert((params.crash._custom) ? true : false);
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
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
        
        params.crash = JSON.parse(params.crash);
        test.assertEquals(params.crash._os, 'Linux');
        test.assertEquals(params.crash._os_version, 'unknown');
        test.assertEquals(params.crash._resolution, '1024x768');
        test.assertEquals(params.crash._app_version, '0.0');
        test.assertEquals(params.crash._manufacture, 'Safari');
        test.assertEquals(params.crash._online, false);
        test.assertEquals(params.crash._background, true);
        test.assertEquals(params.crash._nonfatal, true);
        test.assertEquals(params.crash._logs, "Pressed handled button");
        test.assert((params.crash._error) ? true : false);
        test.assert((params.crash._run) ? true : false);
        test.assert((params.crash._custom) ? true : false);
        test.assertEquals(params.crash._custom.jquery, "1.10");
        test.assertEquals(params.crash._custom.jqueryui, "1.10");
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
    casper.start(fs.workingDirectory+"/examples/example_helpers.html", function() {
        this.click('#track_link');
        var ob = this;
        setTimeout(function(){
            ob.click('#submit-form');
        }, 30000);
        setTimeout(function(){
            ob.click('#unhandled_error');
            ob.click('#handled_error');
        }, 70000);
    }).run(function() {
        setTimeout(function(){
            casper.evaluate(function() {
                localStorage.clear();
            }, {});
            test.done();
        }, 95000);
    });
});