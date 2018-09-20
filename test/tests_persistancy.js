var fs = require("fs");
function exists(value){
    return (typeof value !== "undefined") ? true : false;
}
function notEmpty(value){
    return (value.length > 0) ? true : false;
}

/*
* Web SDK Persistancy Test
* Purpose: Be sure store() method works correctly and related variables has perceives right values from storage. 
* Method: Load page. Define variables into storage, then reload and check variables and storage values.
*/
casper.test.begin("Testing example_persistancy.html", 14, function(test) {
    var tests = [];
    
    // Print console logs from casper
    casper.on('remote.message', function(message) {
        this.echo(message);
    });

    casper.start(fs.workingDirectory + "/examples/example_persistancy.html", function() {
        
        // load page first time
        casper.evaluate(function() {
            // for test: cly_event
            Countly.add_event({'key':'homepage'});

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

            // get stored and current values of sdk variables
            var values = this.evaluate(function() {

                var stored = {};
                var current = {};
                
                // expose values 
                stored.cly_id = Countly._internals.store('cly_id');
                current.cly_id = Countly.device_id;
                stored.cly_queue = Countly._internals.store('cly_queue');
                current.cly_queue = Countly._internals.getRequestQueue();
                stored.cly_event = Countly._internals.store('cly_event');
                current.cly_event = Countly._internals.getEventQueue();
                stored.cly_token = Countly._internals.store('cly_token');
                current.cly_token = Countly._internals.getToken();
                stored.cly_ignore = Countly._internals.store('cly_ignore');
                current.cly_ignore = Countly.ignore_visitor;
                current.cly_cmp_id = Countly._internals.store('cly_cmp_id');
                current.cly_cmp_uid = Countly._internals.store('cly_cmp_uid');
                
                return {
                    stored: stored,
                    current: current
                };
            });

            // these values should not be empty
            test.assert(notEmpty(values.current.cly_id));
            test.assert(notEmpty(values.stored.cly_id));
            test.assert(notEmpty(values.current.cly_token));
            test.assert(notEmpty(values.stored.cly_token));
            test.assert(notEmpty(values.current.cly_cmp_uid));
            test.assert(notEmpty(values.current.cly_cmp_id));
            

            // check for exist non-string values
            test.assert(exists(values.current.cly_ignore));
            test.assert(exists(values.stored.cly_ignore));
            // check for equality
            test.assertEquals(values.current.cly_id, values.stored.cly_id);
            test.assertEquals(values.current.cly_ignore, values.stored.cly_ignore);
            test.assertEquals(values.current.cly_cmp_uid, 'test_campaign_uid');
            test.assertEquals(values.current.cly_cmp_id, 'test_campaign_id');

            test.assertEquals(JSON.stringify(values.current.cly_event), JSON.stringify(values.stored.cly_event));
            test.assertEquals(JSON.stringify(values.current.cly_queue), JSON.stringify(values.stored.cly_queue));
        });
    })
    .run(function() {
        setTimeout(function(){
            casper.evaluate(function(){
                localStorage.clear();
            });
            test.done();
        }, 3000);
    });
});