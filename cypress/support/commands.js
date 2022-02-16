// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --

import './index'


// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Checks a queue object for valid timestamp, hour and dow values
 * @param {Object} testObject - object to be checked
 */
Cypress.Commands.add('check_commons', (testObject) => {
    expect(testObject.timestamp).to.be.ok;
    expect(testObject.timestamp.toString().length).to.equal(13);
    expect(testObject.hour).to.be.within(0, 23);
    expect(testObject.dow).to.be.within(0, 7);
})

/**
 * Checks a queue object for valid/correct begin session, end session and session extension values 
 * @param {Object} queue - queue object to check
 * @param {Number} duration - session extension or end session duration to validate
 * @param {Boolean} isSessionEnd - a boolean to mark this check is intended for end_session validation
 */
Cypress.Commands.add('check_session', (queue, duration, isSessionEnd) => {
    cy.fixture('variables').then((ob) => {
                if(!duration){
                    expect(queue.begin_session).to.equal(1);
                    let metrics = JSON.parse(queue.metrics);
                    expect(metrics._app_version).to.be.ok;
                    expect(metrics._ua).to.be.ok;
                    expect(metrics._resolution).to.be.ok;
                    expect(metrics._density).to.be.ok;
                    expect(metrics._locale).to.be.ok;
                } else if (!isSessionEnd) {
                    expect(queue.session_duration).to.equal(duration);
                } else {
                    expect(queue.end_session).to.equal(1);
                    expect(queue.session_duration).to.equal(duration);
                }
                expect(queue.app_key).to.equal(ob.appKey);
                expect(queue.device_id).to.be.ok;
                expect(queue.sdk_name).to.equal("javascript_native_web");
                expect(queue.sdk_version).to.be.ok;
                cy.check_commons(queue);
            })
})


/**
 * Checks a queue object for valid/correct event values 
 * @param {Object} queue - queue object to check
 * @param {Object} eventObject - an event object to compare with queue values
 * @param {Number} duration - timed event duration to validate
 */
Cypress.Commands.add('check_event', (queue, eventObject, duration) => {
                expect(queue.key).to.equal(eventObject.key);
                if (eventObject.count === undefined) {
                    expect(queue.count).to.equal(1);
                } else {
                    expect(queue.count).to.equal(eventObject.count);
                }
                if (eventObject.sum !== undefined) {
                    expect(queue.sum).to.equal(eventObject.sum);
                }
                if (eventObject.dur !== undefined || duration !== undefined) {
                    if (duration !== undefined) {
                        eventObject.dur = duration;
                    }
                    expect(queue.dur).to.equal(eventObject.dur);
                }
                if ( eventObject.segmentation !== undefined) {
                    for (var key in eventObject.segmentation) {
                    expect(queue.segmentation[key]).to.equal(eventObject.segmentation[key]);
                    }
                }
                cy.check_commons(queue);
})


/**
 * Checks a queue object for valid/correct view event values 
 * @param {Object} queue - queue object to check
 * @param {string} name - a view name
 * @param {Number} duration - view event duration to validate
 */
Cypress.Commands.add('check_view_event', (queue, name, duration) => {
                expect(queue.key).to.equal('[CLY]_view');
                expect(queue.count).to.equal(1);
                if (duration === undefined) {
                    expect(queue.segmentation.visit).to.equal(1);
                    expect(queue.segmentation.view).to.be.ok;
                    expect(queue.segmentation.domain).to.be.ok;
                    expect(queue.segmentation.start).to.be.ok;
                } else {
                    expect(queue.dur).to.be.within(duration, duration+1);
                }
                expect(queue.segmentation.name).to.equal(name);
                cy.check_commons(queue);
})

/**
 * Checks a queue object for valid/correct user details values/limits 
 * @param {Object} details - queue object to check
 * @param {Object} userDetails - user details object to compare queue values with
 * @param {Object} limits - optional, if internal limits are going to be checked this should be provided as an object like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add('check_user_details', (details, userDetails, limits) => {
    cy.fixture('variables').then((ob) => {
                let obj = details;
                cy.check_commons(obj);
                expect(obj.app_key).to.equal(ob.appKey);
                expect(obj.device_id).to.be.exist;
                expect(obj.sdk_name).to.be.exist;
                expect(obj.sdk_version).to.be.exist;
                let queue = JSON.parse(obj.user_details);
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
                        let truncatedKeyLen = Object.keys(queue.custom).length;
                        let keyList = Object.keys(userDetails.custom).map(e=> e.substring(0, limits.key));
                        //check segments are truncated
                        expect(truncatedKeyLen).to.be.within(0, limits.segment);
                        for (var key in userDetails.custom) {
                            expect(queue.custom[key]).to.equal(userDetails.custom[key].substring(0, limits.value));
                            //check keys truncated
                            expect(keyList).to.include(key);
                        }
                    }    
                }
                else {
                    expect(queue.name).to.equal(userDetails.name);
                    expect(queue.username).to.equal(userDetails.username);
                    expect(queue.email).to.equal(userDetails.email);
                    expect(queue.organization).to.equal(userDetails.organization);
                    expect(queue.phone).to.equal(userDetails.phone);
                    expect(queue.picture).to.equal(userDetails.picture);
                    expect(queue.gender).to.equal(userDetails.gender);
                    expect(queue.byear).to.equal(userDetails.byear);
                    if (userDetails.custom !== undefined) {
                        for (var key in userDetails.custom) {
                            expect(queue.custom[key]).to.equal(userDetails.custom[key]);
                        }
                    }
                }
    });
})


/**
 * Checks a queue object for valid/correct custom event values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} customEvent - custom event object to compare queue values with
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add('check_custom_event_limit', (queue, customEvent, limits) => {
    cy.fixture('variables').then((ob) => {
                let obj = queue;
                cy.check_commons(obj);
                //check key
                expect(obj.key).to.equal((customEvent.key).substring(0, limits.key));
                expect(obj.count).to.equal(1);
                if (obj.segmentation !== undefined) {
                    let truncatedKeyLen = Object.keys(obj.segmentation).length;
                    let keyList = Object.keys(customEvent.segmentation).map(e=> e.substring(0, limits.key));
                    //check segments are truncated
                    expect(truncatedKeyLen).to.be.within(0, limits.segment);
                    for (var key in obj.segmentation) {
                        //check values truncated
                        expect(obj.segmentation[key]).to.equal(customEvent.segmentation[key].substring(0, limits.value));
                        //check keys truncated
                        expect(keyList).to.include(key);
                    }
                }
    });
})


/**
 * Checks a queue object for valid/correct view event values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} viewName - view name to compare queue values with
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add('check_view_event_limit', (queue, viewName, limits) => {
                let obj = queue;
                cy.check_commons(obj);
                //check key
                expect(obj.key).to.equal(("[CLY]_view").substring(0, limits.key));
                expect(obj.segmentation.name).to.equal(viewName.substring(0, limits.value));
                expect(obj.segmentation.visit).to.equal(1);
                expect(obj.segmentation.view.length).to.be.within(0, limits.value);
})



/**
 * Checks a queue object for valid/correct error logging values/limits 
 * @param {Object} queue - queue object to check
 * @param {Object} limits - a limits object that has internal limits like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
Cypress.Commands.add('check_error_limit', (queue, limits) => {
    cy.fixture('variables').then((ob) => {
                let obj = queue;
                let crash = JSON.parse(obj.crash);
                cy.check_commons(obj);
                expect(obj.app_key).to.equal(ob.appKey);
                expect(obj.device_id).to.be.exist;
                expect(obj.sdk_name).to.be.exist;
                expect(obj.sdk_version).to.be.exist;
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
                const err = crash._error.split('\n');
                for (var i=0, len=err.length; i<len;i++) {
                    expect(err[i].length).to.be.within(0, limits.line_length);
                    expect(err.length).to.be.within(0, limits.line_thread);
                }
                const log = crash._logs.split('\n');
                for (var i=0, len=log.length; i<len;i++) {
                    expect(log[i].length).to.be.within(0, limits.line_length);
                    expect(log.length).to.be.within(0, limits.line_thread);
                }
    });
})

/**
 * Checks a queue object for valid/correct custom property values/limits 
 * @param {Object} properties - queue object to check
 * @param {Object} customProperties - custom properties object to compare queue values with
 * @param {Object} limits - optional, if internal limits are going to be checked this should be provided as an object like this (values can change):
 * {key: 8, value: 8, segment: 3, breadcrumb: 2, line_thread: 3, line_length: 10};
 */
 Cypress.Commands.add('check_custom_properties', (properties, customProperties, limits) => {
    cy.fixture('variables').then((ob) => {
                let obj = properties;
                cy.check_commons(obj);
                expect(obj.app_key).to.equal(ob.appKey);
                expect(obj.device_id).to.be.exist;
                expect(obj.sdk_name).to.be.exist;
                expect(obj.sdk_version).to.be.exist;
                let queue = JSON.parse(obj.user_details).custom;
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
})


/**
 * fetches request queue from the local storage 
 */
Cypress.Commands.add('fetch_local_request_queue', () => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`)
    });
})

/**
 * fetches event queue from the local storage 
 */
Cypress.Commands.add('fetch_local_event_queue', () => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_event`)
    });
})