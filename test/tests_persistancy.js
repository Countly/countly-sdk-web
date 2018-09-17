var fs = require("fs");
function exists(value){
    return (typeof value != "undefined") ? true : false;
}
casper.test.begin("Testing example_persistancy.html", 3, function(test) {
    var tests = [];
    
    /*
    * Print console logs from casper
    */
    casper.on('remote.message', function(message) {
        this.echo(message);
    });

    casper.start(fs.workingDirectory + "/examples/example_persistancy.html", function() {
        
        casper.evaluate(function() {
            Countly._internals.store('temp_cly_id', Countly._internals.store('cly_id'));
            Countly._internals.store('temp_cly_queue', Countly._internals.store('cly_queue'));
            Countly._internals.store('temp_cly_event', Countly._internals.store('cly_event'));
        })

        this.reload(function() {
            var current_device_id = this.evaluate(function() {
                return Countly._internals.store('cly_id');
            });

            var stored_device_id = this.evaluate(function() {
                return Countly._internals.store('temp_cly_id');
            });

            var current_cly_queue = this.evaluate(function() {
                return Countly._internals.store('cly_queue');
            });

            var stored_cly_queue = this.evaluate(function() {
                return Countly._internals.store('temp_cly_queue');
            });

            var current_cly_event = this.evaluate(function() {
                return Countly._internals.store('cly_event');
            });

            var stored_cly_event = this.evaluate(function() {
                return Countly._internals.store('temp_cly_event');
            });

            // remove timestamp fields for equality
            delete stored_cly_event[0].timestamp;
            delete current_cly_event[0].timestamp;

            test.assertEquals(current_device_id, stored_device_id);
            test.assertEquals(JSON.stringify(current_cly_event), JSON.stringify(stored_cly_event));
            test.assertEquals(JSON.stringify(current_cly_queue), JSON.stringify(stored_cly_queue));
        });
    })
    .run(function() {
        setTimeout(function(){
            casper.evaluate(function() {
                localStorage.clear();
            }, {});
            test.done();
        }, 3000);
    });
});