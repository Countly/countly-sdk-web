/* global casper*/
var fs = require("fs");

casper.test.begin("Testing example_ga_adapter.html", 127, function(test) {
    var tests = [];
    casper.start(fs.workingDirectory + "/examples/example_ga_adapter.html", function() {
        setTimeout(function() {
            var test_logs = casper.evaluate(function() {
                return window.cly_ga_test_logs;
            });

            // test create with ga-id
            tests.push(function() {
                test.assertEquals(test_logs[0].stored, test_logs[0].value);
            });

            // test create with function
            tests.push(function() {
                test.assertEquals(test_logs[1].stored, test_logs[1].value);
            });

            // test pageview without set
            tests.push(function() {
                test.assertEquals(test_logs[2][0], "track_pageview");
            });

            // test pageview with passed page parameter
            tests.push(function() {
                test.assertEquals(test_logs[3][0], "track_pageview");
                test.assertEquals(test_logs[3][1], "test-page.html");
            });

            // test pageview with custom dimension
            tests.push(function() {
                test.assertEquals(test_logs[4][0], "track_pageview");
                // we don't support custom dimension with trackpageview now
            });

            // test social
            tests.push(function() {
                test.assertEquals(test_logs[5][0], "add_event");
                test.assertEquals(test_logs[5][1].count, 1);
                test.assertEquals(test_logs[5][1].key, "action");
                test.assertEquals(test_logs[5][1].segmentation.category, "social");
                test.assertEquals(test_logs[5][1].segmentation.platform, "network");
                test.assertEquals(test_logs[5][1].segmentation.target, "target");
            });

            // test screenview
            tests.push(function() {
                test.assertEquals(test_logs[6][0], "add_event");
                test.assertEquals(test_logs[6][1].count, 1);
                test.assertEquals(test_logs[6][1].key, "Screen View");
                test.assertEquals(test_logs[6][1].segmentation.appName, "application1");
            });

            // test exception
            tests.push(function() {
                test.assertEquals(test_logs[7], "errorDescription");
            });

            // test event with hitType object, with label and value
            tests.push(function() {
                test.assertEquals(test_logs[8][0], "add_event");
                test.assertEquals(test_logs[8][1].count, 2);
                test.assertEquals(test_logs[8][1].key, "action");
                test.assertEquals(test_logs[8][1].segmentation.category, "category");
                test.assertEquals(test_logs[8][1].segmentation.label, "label");
            });

            // test event with hitType object, without value with label
            tests.push(function() {
                test.assertEquals(test_logs[9][0], "add_event");
                test.assertEquals(test_logs[9][1].count, 1);
                test.assertEquals(test_logs[9][1].key, "action");
                test.assertEquals(test_logs[9][1].segmentation.category, "category");
                test.assertEquals(test_logs[9][1].segmentation.label, "label");
            });

            // test event with hitType object, without label and with value
            tests.push(function() {
                test.assertEquals(test_logs[10][0], "add_event");
                test.assertEquals(test_logs[10][1].count, 2);
                test.assertEquals(test_logs[10][1].key, "action");
                test.assertEquals(test_logs[10][1].segmentation.category, "category");
            });

            // test event with hitType object, without label and value
            tests.push(function() {
                test.assertEquals(test_logs[11][0], "add_event");
                test.assertEquals(test_logs[11][1].count, 1);
                test.assertEquals(test_logs[11][1].key, "action");
                test.assertEquals(test_logs[11][1].segmentation.category, "category");
            });

            // test social with hitType object
            tests.push(function() {
                test.assertEquals(test_logs[12][0], "add_event");
                test.assertEquals(test_logs[12][1].count, 1);
                test.assertEquals(test_logs[12][1].key, "like");
                test.assertEquals(test_logs[12][1].segmentation.category, "social");
                test.assertEquals(test_logs[12][1].segmentation.platform, "network");
                test.assertEquals(test_logs[12][1].segmentation.target, "target");
            });

            // test timing with hitType object
            tests.push(function() {
                test.assertEquals(test_logs[13][0], "add_event");
                test.assertEquals(test_logs[13][1].count, 1);
                test.assertEquals(test_logs[13][1].dur, 3549);
                test.assertEquals(test_logs[13][1].key, "load");
                test.assertEquals(test_logs[13][1].segmentation.category, "category");
            });

            // test timing without hitType object
            tests.push(function() {
                test.assertEquals(test_logs[14][0], "add_event");
                test.assertEquals(test_logs[14][1].count, 1);
                test.assertEquals(test_logs[14][1].dur, 3549);
                test.assertEquals(test_logs[14][1].key, "load");
                test.assertEquals(test_logs[14][1].segmentation.category, "category");
            });

            // test timing without hitType object with label
            tests.push(function() {
                test.assertEquals(test_logs[15][0], "add_event");
                test.assertEquals(test_logs[15][1].count, 1);
                test.assertEquals(test_logs[15][1].dur, 3549);
                test.assertEquals(test_logs[15][1].key, "load");
                test.assertEquals(test_logs[15][1].segmentation.category, "category");
                test.assertEquals(test_logs[15][1].segmentation.label, "timinglabel");
            });

            // test pageview with hitType object
            tests.push(function() {
                test.assertEquals(test_logs[16][0], "track_pageview");
                test.assertEquals(test_logs[16][1], "page.html");
            });

            // test pageview after set page
            tests.push(function() {
                test.assertEquals(test_logs[17][0], "track_pageview");
                test.assertEquals(test_logs[17][1], "randompage.html");
            });

            // test set custom data
            tests.push(function() {
                test.assertEquals(test_logs[18][0], "userData.set");
                test.assertEquals(test_logs[18][1], "dimension");
                test.assertEquals(test_logs[18][2], "customdimension");
            });

            // test set custom data as object
            tests.push(function() {
                test.assertEquals(test_logs[19][0], "user_details");
                test.assertEquals(test_logs[19][1].custom.key, "value");
                test.assertEquals(test_logs[19][1].custom.anotherKey, "anotherValue");
            });

            // test add transaction 
            tests.push(function() {
                test.assertEquals(test_logs[20][0], "add_event");
                test.assertEquals(test_logs[20][1].count, 1);
                test.assertEquals(test_logs[20][1].key, "ecommerce:addTransaction");
                test.assertEquals(test_logs[20][1].segmentation.affiliation, "Acme Clothing");
                test.assertEquals(test_logs[20][1].segmentation.id, "1234");
                test.assertEquals(test_logs[20][1].segmentation.shipping, "5");
                test.assertEquals(test_logs[20][1].segmentation.tax, "1.29");
                test.assertEquals(test_logs[20][1].sum, "11.99");
            });

            // test add transaction with currency
            tests.push(function() {
                test.assertEquals(test_logs[21][0], "add_event");
                test.assertEquals(test_logs[21][1].count, 1);
                test.assertEquals(test_logs[21][1].key, "ecommerce:addTransaction");
                test.assertEquals(test_logs[21][1].segmentation.affiliation, "Acme Clothing");
                test.assertEquals(test_logs[21][1].segmentation.id, "1234");
                test.assertEquals(test_logs[21][1].segmentation.shipping, "5");
                test.assertEquals(test_logs[21][1].segmentation.tax, "1.29");
                test.assertEquals(test_logs[21][1].sum, "11.99");
                test.assertEquals(test_logs[21][1].segmentation.currency, "EUR");
            });

            // test add item without currency
            tests.push(function() {
                test.assertEquals(test_logs[22][0], "add_event");
                test.assertEquals(test_logs[22][1].count, "5");
                test.assertEquals(test_logs[22][1].key, "ecommerce:addItem");
                test.assertEquals(test_logs[22][1].segmentation.category, "Party Toys");
                test.assertEquals(test_logs[22][1].segmentation.id, "1234");
                test.assertEquals(test_logs[22][1].segmentation.name, "Fluffy Pink Bunnies");
                test.assertEquals(test_logs[22][1].segmentation.sku, "DD23444");
                test.assertEquals(test_logs[22][1].sum, "11.99");
            });

            // test add item without currency
            tests.push(function() {
                test.assertEquals(test_logs[23][0], "add_event");
                test.assertEquals(test_logs[23][1].count, "5");
                test.assertEquals(test_logs[23][1].key, "ecommerce:addItem");
                test.assertEquals(test_logs[23][1].segmentation.category, "Party Toys");
                test.assertEquals(test_logs[23][1].segmentation.id, "1234");
                test.assertEquals(test_logs[23][1].segmentation.name, "Fluffy Pink Bunnies");
                test.assertEquals(test_logs[23][1].segmentation.sku, "DD23444");
                test.assertEquals(test_logs[23][1].sum, "11.99");
                test.assertEquals(test_logs[23][1].segmentation.currency, "GBP");
            });

            // test ecommerce:clear
            tests.push(function() {
                test.assertEquals(test_logs[24].length, 0);
            });

            // test add item without currency
            tests.push(function() {
                test.assertEquals(test_logs[25][0], "add_event");
                test.assertEquals(test_logs[25][1].count, "5");
                test.assertEquals(test_logs[25][1].key, "ecommerce:addItem");
                test.assertEquals(test_logs[25][1].segmentation.category, "Party Toys");
                test.assertEquals(test_logs[25][1].segmentation.id, "1234");
                test.assertEquals(test_logs[25][1].segmentation.name, "Fluffy Pink Bunnies");
                test.assertEquals(test_logs[25][1].segmentation.sku, "DD23444");
                test.assertEquals(test_logs[25][1].sum, "11.99");
                test.assertEquals(test_logs[25][1].segmentation.currency, "GBP");
            });

            // test ecommerce:send 
            tests.push(function() {
                test.assertEquals(test_logs[26].first, 1);
                test.assertEquals(test_logs[26].last, 0);
            });

            // test event send without label and value
            tests.push(function() {
                test.assertEquals(test_logs[27][0], "add_event");
                test.assertEquals(test_logs[27][1].count, 1);
                test.assertEquals(test_logs[27][1].key, "action");
                test.assertEquals(test_logs[27][1].segmentation.category, "category");
            });

            // test event send without label and value
            tests.push(function() {
                test.assertEquals(test_logs[28][0], "add_event");
                test.assertEquals(test_logs[28][1].count, 1);
                test.assertEquals(test_logs[28][1].key, "action");
                test.assertEquals(test_logs[28][1].segmentation.category, "category");
                test.assertEquals(test_logs[28][1].segmentation.label, "label");
            });

            // test event send without value with custom object
            tests.push(function() {
                test.assertEquals(test_logs[29][0], "add_event");
                test.assertEquals(test_logs[29][1].count, 3);
                test.assertEquals(test_logs[29][1].key, "action");
                test.assertEquals(test_logs[29][1].segmentation.category, "category");
                test.assertEquals(test_logs[29][1].segmentation.label, "label");
            });

            for (var i = 0; i < tests.length; i++) {
                tests[i]();
            }
        }, 1000);
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