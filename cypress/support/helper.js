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
    turnSearchStringToObject
};