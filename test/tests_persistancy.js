/*global Countly, casper */
var fs = require("fs");
function exists(value) {
    return (typeof value !== "undefined") ? true : false;
}

/*
* Web SDK Persistancy Test
* Purpose: Be sure store() method works correctly and related variables has perceives right values from storage. 
* Method: Load page. Define variables into storage, then reload and check variables and storage values.
*/
casper.test.begin("Testing example_persistancy.html", 30, function(test) {

    // Print console logs from casper
    casper.removeAllListeners('remote.message');
    casper.on('remote.message', function(message) {
        this.echo(message);
    });

    casper.start(fs.workingDirectory + "/test/files/example_persistancy.html", function() {

        // load page first time
        casper.evaluate(function() {
            window.location.search = 'cly_id=test_campaign_id&cly_uid=test_campaign_uid';
            // for test: cly_event
            Countly.add_event({'key': 'homepage'});
            // for test: cly_ignore
            Countly.opt_out();
            Countly.opt_in();
            // for test: cly_queue
            Countly.begin_session();
            Countly.session_duration(100);
            Countly.end_session();
            Countly.remove_consent('views');
            // Move into temporary places from stored cmp_id and cmp_uid values.
            // call set token method for define cly_token value in storage.
            Countly._internals.setToken('TOKEN_STRING');
        });

        // reload page
        this.reload(function() {
            var tests = [];
            // get stored and current values of sdk variables
            var values = this.evaluate(function() {
                var current = {};

                // expose values 
                current.cly_id = Countly.device_id;
                current.cly_queue = Countly._internals.getRequestQueue();
                current.cly_event = Countly._internals.getEventQueue();
                current.cly_token = Countly._internals.getToken();
                current.cly_ignore = Countly.ignore_visitor;
                current.cly_cmp_id = Countly._internals.store('cly_cmp_id');
                current.cly_cmp_uid = Countly._internals.store('cly_cmp_uid');

                return current;
            });

            tests.push(function() {
                test.assertEquals(values.cly_id, '8de17dff-1074-452a-8f85-92933482b82e');
            });

            tests.push(function() {
                test.assertEquals(values.cly_token, 'TOKEN_STRING');
            });

            tests.push(function() {
                test.assertEquals(values.cly_cmp_uid, 'test_campaign_uid');
            });

            tests.push(function() {
                test.assertEquals(values.cly_cmp_id, 'test_campaign_id');
            });

            tests.push(function() {
                test.assertEquals(values.cly_ignore, false);
            });

            tests.push(function() {
                test.assertEquals(values.cly_event[0].count, 1);
                test.assertEquals(values.cly_event[0].key, 'homepage');
                test.assert(exists(values.cly_event[0].dow));
                test.assert(exists(values.cly_event[0].hour));
                test.assert(exists(values.cly_event[0].timestamp));
            });

            tests.push(function() {
                var queue = values.cly_queue;
                test.assertEquals(queue[0].app_key, 'YOUR_APP_KEY');
                test.assertEquals(queue[0].begin_session, 1);
                test.assert(exists(queue[0].device_id));
                var q0metrics = JSON.parse(queue[0].metrics);
                test.assertEquals(q0metrics._app_version, '0.0');
                test.assert(exists(q0metrics._ua));
                test.assert(exists(q0metrics._resolution));
                test.assert(exists(q0metrics._density));
                test.assert(exists(q0metrics._locale));
                test.assert(exists(queue[0].sdk_name));
                test.assert(exists(queue[0].sdk_version));
                test.assertEquals(queue[1].app_key, 'YOUR_APP_KEY');
                test.assert(exists(queue[1].device_id));
                test.assert(exists(queue[1].sdk_name));
                test.assert(exists(queue[1].sdk_version));
                test.assertEquals(queue[1].session_duration, 100);
                test.assertEquals(queue[2].app_key, 'YOUR_APP_KEY');
                test.assert(exists(queue[2].device_id));
                test.assert(exists(queue[2].sdk_name));
                test.assert(exists(queue[2].sdk_version));
                test.assertEquals(queue[2].session_duration, 0);
            });

            for (var i = 0; i < tests.length; i++) {
                tests[i]();
            }
        });
    })
        .run(function() {
            setTimeout(function() {
                casper.clear();
                casper.clearCache();
                casper.clearMemoryCache();
                casper.removeAllListeners('remote.message');
                casper.open(fs.workingDirectory + "/test/files/clear.html", function() {});
                test.done();
            }, 3000);
        });
});