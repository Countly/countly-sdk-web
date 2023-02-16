import "./index";
import "cypress-localstorage-commands";

var hp = require("./helper");

// // uncomment for stopping uncaught:exception fail
// Cypress.on("uncaught:exception", (err, runnable) => {
//     // returning false here prevents Cypress from
//     // failing the test
//     return false;
// });

/**
 * Checks a queue object for valid timestamp, hour and dow values
 * @param {Object} testObject - object to be checked
 */
Cypress.Commands.add("check_commons", (testObject) => {
    expect(testObject.timestamp).to.be.ok;
    expect(testObject.timestamp.toString().length).to.equal(13);
    expect(testObject.hour).to.be.within(0, 23);
    expect(testObject.dow).to.be.within(0, 7);
});

/**
 * Checks a queue object for valid app key, device id, sdk name and sdk version
 * @param {Object} testObject - object to be checked
*/
Cypress.Commands.add("check_request_commons", (testObject, appKey, isSessionTest) => {
    appKey = appKey || hp.appKey;
    expect(testObject.app_key).to.equal(appKey);
    expect(testObject.device_id).to.be.ok;
    expect(testObject.sdk_name).to.be.exist;
    expect(testObject.sdk_version).to.be.ok;
    if (!isSessionTest) {
        const metrics = JSON.parse(testObject.metrics);
        expect(metrics._ua).to.be.ok;
    }
});

/**
 * Checks a crash request for valid/correct formation
 * @param {Object} testObject - crash object to be checked
 */
Cypress.Commands.add("check_crash", (testObject, appKey) => {
    appKey = appKey || hp.appKey;
    const metrics = JSON.parse(testObject.metrics);
    const crash = JSON.parse(testObject.crash);
    const metricKeys = Object.keys(metrics);
    cy.check_request_commons(testObject, appKey);
    cy.check_commons(testObject);
    expect(metrics._ua).to.be.exist;
    expect(metricKeys.length).to.equal(1);
    expect(crash._app_version).to.be.exist;
    expect(crash._background).to.be.exist;
    expect(crash._error).to.be.exist;
    expect(crash._javascript).to.be.exist;
    expect(crash._nonfatal).to.be.exist;
    expect(crash._not_os_specific).to.be.exist;
    expect(crash._online).to.be.exist;
    expect(crash._opengl).to.be.exist;
    expect(crash._resolution).to.be.exist;
    expect(crash._run).to.be.exist;
    expect(crash._view).to.be.exist;
});

/**
 * Checks a queue object for valid/correct begin session, end session and session extension values 
 * @param {Object} queue - queue object to check
 * @param {Number} duration - session extension or end session duration to validate
 * @param {Boolean} isSessionEnd - a boolean to mark this check is intended for end_session validation
 */
Cypress.Commands.add("check_session", (queue, duration, isSessionEnd, appKey) => {
    if (!duration) {
        expect(queue.begin_session).to.equal(1);
        const metrics = JSON.parse(queue.metrics);
        expect(metrics._app_version).to.be.ok;
        expect(metrics._ua).to.be.ok;
        expect(metrics._resolution).to.be.ok;
        expect(metrics._density).to.be.ok;
        expect(metrics._locale).to.be.ok;
    }
    else if (!isSessionEnd) {
        expect(queue.session_duration).to.be.within(duration, duration + 1);
    }
    else {
        expect(queue.end_session).to.equal(1);
        expect(queue.session_duration).to.be.within(duration, duration + 1);
    }
    cy.check_request_commons(queue, appKey, true);
    cy.check_commons(queue);
});

/**
 * Checks a queue object for valid/correct event values 
 * @param {Object} queue - queue object to check
 * @param {Object} eventObject - an event object to compare with queue values
 * @param {Number} duration - timed event duration to validate
 */
Cypress.Commands.add("check_event", (queue, eventObject, duration) => {
    expect(queue.key).to.equal(eventObject.key);
    if (eventObject.count === undefined) {
        expect(queue.count).to.equal(1);
    }
    else {
        expect(queue.count).to.equal(eventObject.count);
    }
    if (eventObject.sum !== undefined) {
        expect(queue.sum).to.equal(eventObject.sum);
    }
    if (eventObject.dur !== undefined || duration !== undefined) {
        if (duration !== undefined) {
            eventObject.dur = duration;
        }
        expect(queue.dur).to.be.within(eventObject.dur, eventObject.dur + 1);
    }
    if (eventObject.segmentation !== undefined) {
        for (var key in eventObject.segmentation) {
            expect(queue.segmentation[key]).to.equal(eventObject.segmentation[key]);
        }
    }
    cy.check_commons(queue);
});

/**
 * Checks a queue object for valid/correct view event values 
 * @param {Object} queue - queue object to check
 * @param {string} name - a view name
 * @param {Number} duration - view event duration to validate
 */
Cypress.Commands.add("check_view_event", (queue, name, duration) => {
    expect(queue.key).to.equal("[CLY]_view");
    expect(queue.count).to.equal(1);
    if (duration === undefined) {
        expect(queue.segmentation.visit).to.equal(1);
        expect(queue.segmentation.view).to.be.ok;
        expect(queue.segmentation.domain).to.be.ok;
        // expect(queue.segmentation.start).to.be.ok; // TODO: this is only for manual tracking?
    }
    else {
        expect(queue.dur).to.be.within(duration, duration + 1);
    }
    expect(queue.segmentation.name).to.equal(name);
    cy.check_commons(queue);
});

// TODO: make scroll tests better
/**
 * Checks a queue object for valid/correct scroll event values 
 * @param {Object} queue - queue object to check
 */
Cypress.Commands.add("check_scroll_event", (queue) => {
    expect(queue.key).to.equal("[CLY]_action");
    expect(queue.segmentation.domain).to.be.ok;
    expect(queue.segmentation.height).to.be.ok;
    expect(queue.segmentation.type).to.equal("scroll");
    expect(queue.segmentation.view).to.be.ok;
    expect(queue.segmentation.width).to.be.ok;
    expect(queue.segmentation.y).to.be.ok;
    cy.check_commons(queue);
});

/**
 * Checks a queue object for valid/correct user details values/limits 
 * @param {Object} details - queue object to check
 * @param {Object} userDetails - user details object to compare queue values with
 * @param {Object} limits - optional, if internal limits are going to be checked this should be provided as an object like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add("check_user_details", (details, userDetails, limits) => {
    const obj = details;
    cy.check_commons(obj);
    cy.check_request_commons(obj);
    const queue = JSON.parse(obj.user_details);
    if (limits !== undefined) {
        expect(queue.name).to.equal(userDetails.name.substring(0, limits.value));
        expect(queue.username).to.equal(userDetails.username.substring(0, limits.value));
        expect(queue.email).to.equal(userDetails.email.substring(0, limits.value));
        expect(queue.organization).to.equal(userDetails.organization.substring(0, limits.value));
        expect(queue.phone).to.equal(userDetails.phone.substring(0, limits.value));
        expect(queue.picture).to.equal(userDetails.picture);
        expect(queue.gender).to.equal(userDetails.gender.substring(0, limits.value));
        expect(queue.byear.toString()).to.equal(userDetails.byear.toString().substring(0, limits.value));
        if (userDetails.custom !== undefined) {
            const truncatedKeyLen = Object.keys(queue.custom).length;
            const keyList = Object.keys(userDetails.custom).map((e) => e.substring(0, limits.key));
            // check segments are truncated
            expect(truncatedKeyLen).to.be.within(0, limits.segment);
            for (const key in userDetails.custom) {
                expect(queue.custom[key]).to.equal(userDetails.custom[key].substring(0, limits.value));
                // check keys truncated
                expect(keyList).to.include(key);
            }
        }
        return;
    }
    expect(queue.name).to.equal(userDetails.name);
    expect(queue.username).to.equal(userDetails.username);
    expect(queue.email).to.equal(userDetails.email);
    expect(queue.organization).to.equal(userDetails.organization);
    expect(queue.phone).to.equal(userDetails.phone);
    expect(queue.picture).to.equal(userDetails.picture);
    expect(queue.gender).to.equal(userDetails.gender);
    expect(queue.byear).to.equal(userDetails.byear);
    if (userDetails.custom !== undefined) {
        for (const key in userDetails.custom) {
            expect(queue.custom[key]).to.equal(userDetails.custom[key]);
        }
    }
});

/**
 * Checks a queue object for valid/correct custom event values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} customEvent - custom event object to compare queue values with
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add("check_custom_event_limit", (queue, customEvent, limits) => {
    const obj = queue;
    cy.check_commons(obj);
    // check key
    expect(obj.key).to.equal((customEvent.key).substring(0, limits.key));
    expect(obj.count).to.equal(1);
    if (obj.segmentation !== undefined) {
        const truncatedKeyLen = Object.keys(obj.segmentation).length;
        const keyList = Object.keys(customEvent.segmentation).map((e) => e.substring(0, limits.key));
        // check segments are truncated
        expect(truncatedKeyLen).to.be.within(0, limits.segment);
        for (var key in obj.segmentation) {
            // check values truncated
            expect(obj.segmentation[key]).to.equal(customEvent.segmentation[key].substring(0, limits.value));
            // check keys truncated
            expect(keyList).to.include(key);
        }
    }
});

/**
 * Checks a queue object for valid/correct view event values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} viewName - view name to compare queue values with
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add("check_view_event_limit", (queue, viewName, limits) => {
    const obj = queue;
    cy.check_commons(obj);
    // check key
    expect(obj.key).to.equal(("[CLY]_view").substring(0, limits.key));
    expect(obj.segmentation.name).to.equal(viewName.substring(0, limits.value));
    expect(obj.segmentation.visit).to.equal(1);
    expect(obj.segmentation.view.length).to.be.within(0, limits.value);
});

/**
 * Checks a queue object for valid/correct error logging values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add("check_error_limit", (queue, limits) => {
    const obj = queue;
    const crash = JSON.parse(obj.crash);
    cy.check_commons(obj);
    cy.check_request_commons(obj);
    expect(crash._resolution).to.be.exist;
    expect(crash._app_version).to.be.exist;
    expect(crash._run).to.be.exist;
    expect(crash._not_os_specific).to.be.exist;
    expect(crash._javascript).to.be.exist;
    expect(crash._online).to.be.exist;
    expect(crash._background).to.be.exist;
    expect(crash._nonfatal).to.be.exist;
    expect(crash._view).to.be.exist;
    expect(crash._custom).to.be.exist;
    expect(crash._opengl).to.be.exist;
    expect(crash._logs).to.be.exist;
    const err = crash._error.split("\n");
    for (let i = 0, len = err.length; i < len; i++) {
        expect(err[i].length).to.be.within(0, limits.line_length);
        expect(err.length).to.be.within(0, limits.line_thread);
    }
    const log = crash._logs.split("\n");
    for (let i = 0, len = log.length; i < len; i++) {
        expect(log[i].length).to.be.within(0, limits.line_length);
        expect(log.length).to.be.within(0, limits.line_thread);
    }
});

/**
 * Checks a queue object for valid/correct custom property values/limits 
 * @param {Object} properties - queue object to check
 * @param {Object} customProperties - custom properties object to compare queue values with
 * @param {Object} limits - optional, if internal limits are going to be checked this should be provided as an object like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add("check_custom_properties", (properties, customProperties, limits) => {
    const obj = properties;
    cy.check_commons(obj);
    cy.check_request_commons(obj);
    const queue = JSON.parse(obj.user_details).custom;
    expect(queue[customProperties.set[0].substring(0, limits.key)]).to.equal(customProperties.set[1].substring(0, limits.value));
    expect(queue[customProperties.set_once[0].substring(0, limits.key)].$setOnce).to.equal(customProperties.set_once[1].substring(0, limits.value));
    expect(queue[customProperties.increment_by[0].substring(0, limits.key)].$inc).to.equal(customProperties.increment_by[1].toString().substring(0, limits.value));
    expect(queue[customProperties.multiply[0].substring(0, limits.key)].$mul).to.equal(customProperties.multiply[1].toString().substring(0, limits.value));
    expect(queue[customProperties.max[0].substring(0, limits.key)].$max).to.equal(customProperties.max[1].toString().substring(0, limits.value));
    expect(queue[customProperties.min[0].substring(0, limits.key)].$min).to.equal(customProperties.min[1].toString().substring(0, limits.value));
    expect(queue[customProperties.push[0].substring(0, limits.key)].$push[0]).to.equal(customProperties.push[1].substring(0, limits.value));
    expect(queue[customProperties.push_unique[0].substring(0, limits.key)].$addToSet[0]).to.equal(customProperties.push_unique[1].substring(0, limits.value));
    expect(queue[customProperties.pull[0].substring(0, limits.key)].$pull[0]).to.equal(customProperties.pull[1]);
});

/**
 * fetches request queue from the local storage 
 */
Cypress.Commands.add("fetch_local_request_queue", (appKey) => {
    cy.wait(hp.sWait).then(() => {
        appKey = appKey || hp.appKey;
        cy.getLocalStorage(`${appKey}/cly_queue`).then((e) => {
            if (e === undefined) {
                expect.fail("request queue inside the local storage should not be undefined");
            }
            if (e === null) {
                // assume the queue is empty
                return [];
            }
            const queue = JSON.parse(e);
            return queue;
        });
    });
});

/**
 * fetches event queue from the local storage 
 */
Cypress.Commands.add("fetch_local_event_queue", (appKey) => {
    cy.wait(hp.sWait).then(() => {
        appKey = appKey || hp.appKey;
        cy.getLocalStorage(`${hp.appKey}/cly_event`).then((e) => {
            if (e === undefined) {
                expect.fail("event queue inside the local storage should not be undefined");
            }
            if (e === null) {
                // assume the queue is empty
                return [];
            }
            const queue = JSON.parse(e);
            return queue;
        });
    });
});
