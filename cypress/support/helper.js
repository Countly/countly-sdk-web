var Countly = require("../../lib/countly");

const appKey = "YOUR_APP_KEY";
const sWait = 100;
const sWait2 = 550;
const mWait = 4000;
const lWait = 10000;
/**
 * resets Countly
 * @param {Function} callback - callback function that includes the Countly init and the tests
 */
function haltAndClearStorage(callback) {
    if (Countly.halt !== undefined) {
        Countly.halt();
    }
    cy.wait(sWait).then(() => {
        cy.clearAllLocalStorage();
        cy.clearAllCookies();
        cy.wait(sWait).then(() => {
            callback();
        });
    });
}

/**
 * user details object for user details tests (used in user_details.js and storage_change.js)
 * @type {Object}
 */
const userDetailObj = {
    name: "Barturiana Sosinsiava",
    username: "bar2rawwen",
    email: "test@test.com",
    organization: "Dukely",
    phone: "+123456789",
    picture: "https://ps.timg.com/profile_images/52237/011_n_400x400.jpg",
    gender: "Non-binary",
    byear: 1987,
    custom: {
        "key1 segment": "value1 segment",
        "key2 segment": "value2 segment"
    }
};

/**
 * get timestamp
 * @returns {number} -timestamp
 */
function getTimestampMs() {
    return new Date().getTime();
}

/**
 * Fine tuner for flaky tests. Retries test for  a certain amount
 * @param {number} startTime - starting time, timestamp
 * @param {number} waitTime - real wait time for tests you want to test
 * @param {number} waitIncrement -  time increment to retry the tests
 * @param {Function} continueCallback - callback function with tests
 */
var waitFunction = function (startTime, waitTime, waitIncrement, continueCallback) {
    if (waitTime <= getTimestampMs() - startTime) {
        // we have waited enough
        continueCallback();
    }
    else {
        // we need to wait more
        cy.wait(waitIncrement).then(() => {
            waitFunction(startTime, waitTime, waitIncrement, continueCallback);
        });
    }
};

/**
 * Intercepts SDK requests and returns request parameters to the callback function.
 * @param {String} requestType - GET or POST
 * @param {String} requestUrl - base URL (e.g., https://your.domain.count.ly)
 * @param {String} endPoint - endpoint (e.g., /i)
 * @param {String} aliasParam - parameter to match in requests (e.g., "hc", "begin_session")
 * @param {String} alias - alias for the request
 * @param {Function} callback - callback function for parsed parameters
 */
function interceptAndCheckRequests(requestType, requestUrl, endPoint, aliasParam, alias, callback) {
    requestType = requestType || "GET";
    requestUrl = requestUrl || "https://your.domain.count.ly";
    endPoint = endPoint || "/i";
    alias = alias || "getXhr";

    // Intercept requests
    cy.intercept(requestType, requestUrl + endPoint + "*", (req) => {
        if (requestType === "POST" && req.body) {
            // Parse URL-encoded body for POST requests
            const params = new URLSearchParams(req.body);
            callback(params);
        } else {
            // Parse URL parameters for GET requests
            const url = new URL(req.url);
            const params = url.searchParams;
            callback(params);
        }
        req.reply(200, { result: "Success" }, {
            "x-countly-rr": "2"
        });
    }).as(alias);

    // Wait for the request alias to be triggered
    cy.wait("@" + alias).then((xhr) => {
        const params = requestType === "POST" && xhr.request.body
            ? new URLSearchParams(xhr.request.body)
            : new URL(xhr.request.url).searchParams;
        callback(params);
    });
}

// gathered events. count and segmentation key/values must be consistent
const eventArray = [
    // first event must be custom event
    {
        key: "a",
        count: 1,
        segmentation: {
            1: "1"
        }
    },
    // rest can be internal events
    {
        key: "[CLY]_view",
        count: 2,
        segmentation: {
            2: "2"
        }
    },
    {
        key: "[CLY]_nps",
        count: 3,
        segmentation: {
            3: "3"
        }
    },
    {
        key: "[CLY]_survey",
        count: 4,
        segmentation: {
            4: "4"
        }
    },
    {
        key: "[CLY]_star_rating",
        count: 5,
        segmentation: {
            5: "5"
        }
    },
    {
        key: "[CLY]_orientation",
        count: 6,
        segmentation: {
            6: "6"
        }
    },
    {
        key: "[CLY]_action",
        count: 7,
        segmentation: {
            7: "7"
        }
    }

];
// event adding loop
/**
 * adds events to the queue
 * @param {Array} omitList - events to omit from the queue. If not provided, all events will be added. Must be an array of string key values
 */
function events(omitList) {
    for (var i = 0, len = eventArray.length; i < len; i++) {
        if (omitList) {
            if (omitList.indexOf(eventArray[i].key) === -1) {
                Countly.add_event(eventArray[i]);
            }
        }
        else {
            Countly.add_event(eventArray[i]);
        }
    }
}

// TODO: this validator is so rigid. Must be modified to be more flexible (accepting more variables)
/**
 *  Validates requests in the request queue for normal flow test
 * @param {Array} rq - request queue
 * @param {string} viewName - name of the view
 * @param {string} countlyAppKey - app key
*/
function testNormalFlowInt(rq, viewName, countlyAppKey) {
    cy.log(JSON.stringify(rq));
    expect(rq.length).to.equal(14);
    const idType = rq[0].t;
    const id = rq[0].device_id;

    // 1 - 2
    expect(rq[0].campaign_id).to.equal("camp_id");
    expect(rq[0].campaign_user).to.equal("camp_user_id");
    expect(rq[1].campaign_id).to.equal("camp_id");
    expect(rq[1].campaign_user).to.equal("camp_user_id");

    // 3
    const thirdRequest = JSON.parse(rq[2].events);
    expect(thirdRequest.length).to.equal(2);
    cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } }, undefined, "");
    cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: {} }, undefined, "");

    // 4
    const fourthRequest = JSON.parse(rq[3].user_details);
    expect(fourthRequest.name).to.equal("Test User");
    expect(fourthRequest.custom).to.eql({});

    // 5
    const fifthRequest = JSON.parse(rq[4].user_details);
    // Instead of expecting a simple object, check for the presence of all the properties
    expect(fifthRequest).to.have.property('custom');
    expect(fifthRequest.custom).to.have.property('custom-property');
    expect(fifthRequest.custom).to.have.property('unique-property');
    expect(fifthRequest.custom['unique-property']).to.have.property('$setOnce', 'unique-value');
    expect(fifthRequest.custom).to.have.property('counter');
    expect(fifthRequest.custom.counter).to.have.property('$inc', 5);
    expect(fifthRequest.custom).to.have.property('value');
    expect(fifthRequest.custom.value).to.have.property('$mul', 2);
    expect(fifthRequest.custom).to.have.property('max-value');
    expect(fifthRequest.custom['max-value']).to.have.property('$max', 100);
    expect(fifthRequest.custom).to.have.property('min-value');
    expect(fifthRequest.custom['min-value']).to.have.property('$min', 1);
    expect(fifthRequest.custom).to.have.property('array-property');
    expect(fifthRequest.custom['array-property']).to.have.property('$push').to.be.an('array').that.includes('new-value');
    expect(fifthRequest.custom['array-property']).to.have.property('$pull').to.be.an('array').that.includes('value-to-remove');
    expect(fifthRequest.custom).to.have.property('unique-array');
    expect(fifthRequest.custom['unique-array']).to.have.property('$addToSet').to.be.an('array').that.includes('unique-item');

    // 6
    const sixthRequest = JSON.parse(rq[5].crash);
    expect(sixthRequest._error).to.equal("stack");

    // 7
    expect(rq[6].begin_session).to.equal(1);

    // 8
    const eighthRequest = JSON.parse(rq[7].events);
    expect(eighthRequest.length).to.equal(2);
    cy.check_event(eighthRequest[0], { key: "[CLY]_orientation" }, undefined, "");
    cy.check_view_event(eighthRequest[1], viewName, undefined, false);

    // 9 - Session duration check
    expect(rq[8].session_duration).to.equal(30);

    // 10 - End session duration check
    expect(rq[9].session_duration).to.equal(0);

    // 11 - View event end
    const eleventhRequest = JSON.parse(rq[10].events);
    expect(eleventhRequest.length).to.equal(1);
    cy.check_view_event(eleventhRequest[0], viewName, 0, false);

    // 12 - Device ID change
    expect(rq[11].old_device_id).to.equal(id);
    expect(rq[11].device_id).to.equal("new-device-id");

    // 13 - New session with custom device ID
    expect(rq[12].begin_session).to.equal(1);
    expect(rq[12].device_id).to.equal("custom-device-id");

    // 14 - Star rating events
    const fourteenthRequest = JSON.parse(rq[13].events);
    expect(fourteenthRequest.length).to.equal(3);
    cy.check_event(fourteenthRequest[0], { key: "[CLY]_orientation" }, undefined, true);
    cy.check_event(fourteenthRequest[1], { key: "[CLY]_star_rating", segmentation: { widget_id: "test-id", rating: 5 } }, undefined, true);
    cy.check_event(fourteenthRequest[2], { key: "[CLY]_star_rating", segmentation: { widget_id: "test-id", rating: 5 } }, undefined, true);

    // each request should have same device id, device id type and app key
    rq.forEach((element, index) => {
        expect(element.app_key).to.equal(countlyAppKey);
        expect(element.metrics).to.be.ok;
        expect(element.dow).to.exist;
        expect(element.hour).to.exist;
        expect(element.sdk_name).to.be.ok;
        expect(element.sdk_version).to.be.ok;
        expect(element.timestamp).to.be.ok;

        // Device ID and type checks (accounting for ID changes)
        if (index < 11) {
            expect(element.device_id).to.equal(id);
            expect(element.t).to.equal(idType);
        } else if (index === 11) {
            expect(element.device_id).to.equal("new-device-id");
            expect(element.t).to.equal(0);
        } else {
            expect(element.device_id).to.equal("custom-device-id");
            expect(element.t).to.equal(0);
        }
    });
}

// TODO: this validator is so rigid. Must be modified to be more flexible (accepting more variables)
/**
 *  Validates requests in the request queue for normal flow test
 * @param {Array} rq - request queue
 * @param {string} viewName - name of the view
 * @param {string} countlyAppKey - app key
*/
function testNormalFlow(rq, viewName, countlyAppKey) {
    cy.log(rq);
    expect(rq.length).to.equal(8);
    const idType = rq[0].t;
    const id = rq[0].device_id;

    // 1 - 2
    expect(rq[0].campaign_id).to.equal("camp_id");
    expect(rq[0].campaign_user).to.equal("camp_user_id");
    expect(rq[1].campaign_id).to.equal("camp_id");
    expect(rq[1].campaign_user).to.equal("camp_user_id");

    // 3
    const thirdRequest = JSON.parse(rq[2].events);
    expect(thirdRequest.length).to.equal(2);
    cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } }, undefined, "");
    cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: {} }, undefined, "");

    // 4
    const fourthRequest = JSON.parse(rq[3].user_details);
    expect(fourthRequest.name).to.equal("name");
    expect(fourthRequest.custom).to.eql({});

    // 5
    const fifthRequest = JSON.parse(rq[4].user_details);
    expect(fifthRequest).to.eql({ custom: { set: "set" } });

    // 6
    const sixthRequest = JSON.parse(rq[5].crash);
    expect(sixthRequest._error).to.equal("stack");

    // 7
    expect(rq[6].begin_session).to.equal(1);

    // 8
    const eighthRequest = JSON.parse(rq[7].events);
    expect(eighthRequest.length).to.equal(2);
    cy.check_event(eighthRequest[0], { key: "[CLY]_orientation" }, undefined, "");
    cy.check_view_event(eighthRequest[1], viewName, undefined, false);

    // each request should have same device id, device id type and app key
    rq.forEach(element => {
        expect(element.device_id).to.equal(id);
        expect(element.t).to.equal(idType);
        expect(element.app_key).to.equal(countlyAppKey);
        expect(element.metrics).to.be.ok;
        expect(element.dow).to.exist;
        expect(element.hour).to.exist;
        expect(element.sdk_name).to.be.ok;
        expect(element.sdk_version).to.be.ok;
        expect(element.timestamp).to.be.ok;
    });
}

/**
 * Validates utm tags in the request queue/given object
 * You can pass undefined if you want to check if utm tags do not exist
 * 
 * @param {*} aq - object to check
 * @param {*} source - utm_source
 * @param {*} medium - utm_medium
 * @param {*} campaign - utm_campaign
 * @param {*} term - utm_term
 * @param {*} content - utm_content
 */
function validateDefaultUtmTags(aq, source, medium, campaign, term, content) {
    if (typeof source === "string") {
        expect(aq.utm_source).to.eq(source);
    }
    else {
        expect(aq.utm_source).to.not.exist;
    }
    if (typeof medium === "string") {
        expect(aq.utm_medium).to.eq(medium);
    }
    else {
        expect(aq.utm_medium).to.not.exist;
    }
    if (typeof campaign === "string") {
        expect(aq.utm_campaign).to.eq(campaign);
    }
    else {
        expect(aq.utm_campaign).to.not.exist;
    }
    if (typeof term === "string") {
        expect(aq.utm_term).to.eq(term);
    }
    else {
        expect(aq.utm_term).to.not.exist;
    }
    if (typeof content === "string") {
        expect(aq.utm_content).to.eq(content);
    }
    else {
        expect(aq.utm_content).to.not.exist;
    }
}

/**
 *  Check common params for all requests
 * @param {Object} paramsObject - object from search string
 */
function check_commons(paramsObject) {
    expect(paramsObject.timestamp).to.be.ok;
    expect(paramsObject.timestamp.toString().length).to.equal(13);
    expect(paramsObject.hour).to.be.within(0, 23);
    expect(paramsObject.dow).to.be.within(0, 7);
    expect(paramsObject.app_key).to.equal(appKey);
    expect(paramsObject.device_id).to.be.ok;
    expect(paramsObject.sdk_name).to.equal("javascript_native_web");
    expect(paramsObject.sdk_version).to.be.ok;
    expect(paramsObject.t).to.be.within(0, 3);
    expect(paramsObject.av).to.equal(0); // av is 0 as we parsed parsable things
    if (!paramsObject.hc) { // hc is direct request
        expect(paramsObject.rr).to.be.above(-1);
    }
    expect(paramsObject.metrics._ua).to.be.ok;
}

/**
 *  Turn search string into object with values parsed
 * @param {String} searchString - search string
 * @returns {object} - object from search string
 */
function turnSearchStringToObject(searchString) {
    const searchParams = new URLSearchParams(searchString);
    const paramsObject = {};
    for (const [key, value] of searchParams.entries()) {
        try {
            paramsObject[key] = JSON.parse(decodeURIComponent(value)); // try to parse value
        }
        catch (e) {
            paramsObject[key] = decodeURIComponent(value);
        }
    }
    return paramsObject;
}

function integrationMethods() {
    const idType = Countly.get_device_id_type();
    const id = Countly.get_device_id();
    Countly.add_consent("events");
    Countly.check_any_consent();
    Countly.check_consent("events");
    Countly.group_features({ all_features: ["events", "views", "crashes"] });
    Countly.remove_consent("events");
    Countly.disable_offline_mode();
    Countly.add_event({ key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } });
    Countly.start_event("test");
    Countly.cancel_event("gobbledygook");
    Countly.end_event("test");
    Countly.report_conversion("camp_id", "camp_user_id");
    Countly.recordDirectAttribution("camp_id", "camp_user_id");
    Countly.user_details({ name: "Test User", email: "test@example.com" });
    Countly.userData.set("custom-property", "custom-value");
    Countly.userData.unset("custom-property");
    Countly.userData.set_once("unique-property", "unique-value");
    Countly.userData.increment("counter");
    Countly.userData.increment_by("counter", 5);
    Countly.userData.multiply("value", 2);
    Countly.userData.max("max-value", 100);
    Countly.userData.min("min-value", 1);
    Countly.userData.push("array-property", "new-value");
    Countly.userData.push_unique("unique-array", "unique-item");
    Countly.userData.pull("array-property", "value-to-remove");
    Countly.userData.save();
    Countly.report_trace({ name: "name", stz: 1, type: "type" });
    Countly.log_error({ error: "error", stack: "stack" });
    Countly.add_log("error");
    Countly.enrollUserToAb(["test-key"]);
    Countly.fetch_remote_config(["test-key"], [], (err, config) => console.log(config));
    const remote = Countly.get_remote_config();
    Countly.track_sessions();
    Countly.track_pageview();
    Countly.track_errors();
    Countly.track_clicks();
    Countly.track_scrolls();
    Countly.track_links();
    Countly.track_forms();
    Countly.collect_from_forms();
    Countly.collect_from_facebook();
    Countly.opt_in();
    Countly.begin_session();
    Countly.session_duration(30);
    Countly.end_session();
    Countly.content.enterContentZone();
    Countly.content.refreshContentZone();
    Countly.content.exitContentZone();
    Countly.change_id("new-device-id", true);
    Countly.set_id("custom-device-id");
    Countly.feedback.showRating();
    Countly.feedback.showNPS();
    Countly.feedback.showSurvey();
    Countly.recordRatingWidgetWithID({ widget_id: "test-id", rating: 5 });
    Countly.reportFeedbackWidgetManually({ _id: "test-id", type: "rating" }, {}, { rating: 5 });
    Countly.get_available_feedback_widgets((widgets) => console.log(widgets));
}

module.exports = {
    haltAndClearStorage,
    sWait,
    sWait2,
    mWait,
    lWait,
    appKey,
    getTimestampMs,
    waitFunction,
    events,
    eventArray,
    testNormalFlow,
    interceptAndCheckRequests,
    validateDefaultUtmTags,
    userDetailObj,
    check_commons,
    turnSearchStringToObject,
    integrationMethods,
    testNormalFlowInt,
};