/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

const c1 = ['sessions', 'events', 'views', 'users', 'scrolls', 'clicks'];
const c2 = ['events', 'users', 'location'];

describe("-", () => {
    it("-", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY1",
                url: "https://your.domain.count.ly",
                namespace: "namespace1",
                clear_stored_id: true,
                device_id: "test-device-id1",
                require_consent: true,
                enable_orientation_tracking: false,
            });
            Countly.add_consent(c1);
            Countly.user_details({organization: "Test Organization1", custom: {"Test User1": "Test User1"}});
            Countly.track_sessions();
            Countly.track_pageview();
            Countly.track_clicks();
            Countly.track_scrolls();
            Countly.add_event({
                key: "test_event1",
                count: 1,
                segmentation: {test: "test1"},
            });

            Countly.q.push(["init", {
                app_key: "YOUR_APP_KEY2", //must have different APP key
                url: "https://your.domain.count.ly",
                namespace: "namespace2",
                clear_stored_id: true,
                device_id: "test-device-id2",
                require_consent: true,
                enable_orientation_tracking: false,
            }])
            Countly.q.push(["YOUR_APP_KEY2", "add_consent", c2]);
            Countly.q.push(["YOUR_APP_KEY2", "user_details", {organization: "Test Organization2", custom: {"Test User2": "Test User2"}}]);
            Countly.q.push(["YOUR_APP_KEY2", "track_sessions"]);
            Countly.q.push(["YOUR_APP_KEY2", "track_pageview", undefined, undefined, {test: "test2"}]);
            Countly.q.push(["YOUR_APP_KEY2", "track_clicks"]);
            Countly.q.push(["YOUR_APP_KEY2", "track_scrolls"]); 
            Countly.q.push(["YOUR_APP_KEY2", "add_event", {
                key: "test_event2",
                count: 1,
                segmentation: {test: "test2"},
            }]);

            cy.wait(1000).then(() => {
                var queues = Countly._internals.getLocalQueues();
                var requests = Countly._internals.testingGetRequests();
                cy.log(queues);
                cy.log(requests);
            });
        });
    });
});