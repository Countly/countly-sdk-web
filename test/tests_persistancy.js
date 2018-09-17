var fs = require("fs");
function exists(value){
    return (typeof value != "undefined") ? true : false;
}

casper.test.begin("Testing example_persistancy.html", 8, function(test) {
    var tests = [];
    
    /*
    * Print console logs from casper
    */
    casper.on('remote.message', function(message) {
        this.echo(message);
    });

    casper.start(fs.workingDirectory + "/examples/example_persistancy.html", function() {
        
        casper.evaluate(function() {
            // define temporary values into localStorage
            Countly._internals.store('temp_cly_id', Countly._internals.store('cly_id'));
            Countly._internals.store('temp_cly_queue', Countly._internals.store('cly_queue'));
            Countly._internals.store('temp_cly_event', Countly._internals.store('cly_event'));
            Countly._internals.store('temp_cly_token', Countly._internals.store('cly_token'));
            Countly._internals.store('temp_cly_old_token', Countly._internals.store('cly_old_token'));
            Countly._internals.store('temp_cly_ignore', Countly._internals.store('cly_ignore'));
            Countly._internals.store('temp_cly_cmp_id', Countly._internals.store('cly_cmp_id'));
            Countly._internals.store('temp_cly_cmp_uid', Countly._internals.store('cly_cmp_uid'));
        })

        this.reload(function() {
            // get stored and current values of sdk variables
            var values = this.evaluate(function() {
                var stored = {};
                var current = {};
                
                stored.cly_id = Countly._internals.store('temp_cly_id');
                stored.cly_queue = Countly._internals.store('temp_cly_queue');
                stored.cly_event = Countly._internals.store('temp_cly_event');
                stored.cly_token = Countly._internals.store('temp_cly_token');
                stored.cly_old_token = Countly._internals.store('temp_cly_old_token');
                stored.cly_ignore = Countly._internals.store('temp_cly_ignore');
                stored.cly_cmp_id = Countly._internals.store('temp_cly_cmp_id');
                stored.cly_cmp_uid = Countly._internals.store('temp_cly_cmp_uid');

                current.cly_id = Countly._internals.store('cly_id');
                current.cly_queue = Countly._internals.store('cly_queue');
                current.cly_event = Countly._internals.store('cly_event');
                current.cly_token = Countly._internals.store('cly_token');
                current.cly_old_token = Countly._internals.store('cly_old_token');
                current.cly_ignore = Countly._internals.store('cly_ignore');
                current.cly_cmp_id = Countly._internals.store('cly_cmp_id');
                current.cly_cmp_uid = Countly._internals.store('cly_cmp_uid');

                return {
                    stored: stored,
                    current: current
                };
            });
            
            
            test.assertEquals(values.current.cly_token, values.stored.cly_token);     
            test.assertEquals(values.current.cly_old_token, values.stored.cly_old_token);
            test.assertEquals(values.current.cly_ignore, values.stored.cly_ignore);
            test.assertEquals(values.current.cly_cmp_uid, values.stored.cly_cmp_uid);
            test.assertEquals(values.current.cly_cmp_id, values.stored.cly_cmp_id);
            test.assertEquals(values.current.cly_id, values.stored.cly_id);
            // should be added one more event too cly_event array
            test.assertEquals(values.current.cly_event.length, values.stored.cly_event.length + 1);
            // should be added 5 more request too cly_queue array
            test.assertEquals(values.current.cly_queue.length, values.stored.cly_queue.length + 5);
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