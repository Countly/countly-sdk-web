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
Cypress.Commands.add('check_commons', (queue) => {
    expect(queue.timestamp).to.be.ok;
    expect(queue.timestamp.toString().length).to.equal(13);
    expect(queue.hour).to.be.within(0, 23);
    expect(queue.dow).to.be.within(0, 7);
})

Cypress.Commands.add('check_session', (pos, time, end) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`).then(
            (e) => {
                let queue = JSON.parse(e);
                if(!time){
                    queue = queue[pos-1];
                    expect(queue.begin_session).to.equal(1);
                    let metrics = JSON.parse(queue.metrics);
                    expect(metrics._app_version).to.be.ok;
                    expect(metrics._ua).to.be.ok;
                    expect(metrics._resolution).to.be.ok;
                    expect(metrics._density).to.be.ok;
                    expect(metrics._locale).to.be.ok;
                } else if (!end) {
                    queue = queue[pos];
                    expect(queue.session_duration).to.equal(time);
                } else {
                    queue = queue[pos];
                    expect(queue.end_session).to.equal(1);
                    expect(queue.session_duration).to.equal(time);
                }
                expect(queue.app_key).to.equal(ob.appKey);
                expect(queue.device_id).to.be.ok;
                expect(queue.sdk_name).to.equal("javascript_native_web");
                expect(queue.sdk_version).to.be.ok;
                cy.check_commons(queue);
            }
        );
    });
})
Cypress.Commands.add('check_event', (eventObject, time) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_event`).then(
            (e) => {
                let queue = JSON.parse(e)[0];
                expect(queue.key).to.equal(eventObject.key);
                if (typeof eventObject.count === 'undefined') {
                    expect(queue.count).to.equal(1);
                } else {
                    expect(queue.count).to.equal(eventObject.count);
                }
                if (typeof eventObject.sum !== 'undefined') {
                    expect(queue.sum).to.equal(eventObject.sum);
                }
                if (typeof eventObject.dur !== 'undefined' || typeof time !== 'undefined') {
                    if (typeof time !== 'undefined') {
                        eventObject.dur = time;
                    }
                    expect(queue.dur).to.equal(eventObject.dur);
                }
                if (typeof eventObject.segmentation !== 'undefined') {
                    for (var key in eventObject.segmentation) {
                    expect(queue.segmentation[key]).to.equal(eventObject.segmentation[key]);
                    }
                }
                cy.check_commons(queue);
            }
        );
    });
})

Cypress.Commands.add('check_view_event', (name, pos=0, time) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_event`).then(
            (e) => {
                let queue = JSON.parse(e)[pos];
                cy.log(e);
                expect(queue.key).to.equal('[CLY]_view');
                    expect(queue.count).to.equal(1);
                if (time === undefined) {
                    expect(queue.segmentation.visit).to.equal(1);
                    expect(queue.segmentation.view).to.be.ok;
                    expect(queue.segmentation.domain).to.be.ok;
                    expect(queue.segmentation.start).to.be.ok;
                } else {
                    expect(queue.dur).to.equal(time);
                }
                expect(queue.segmentation.name).to.equal(name);
                cy.check_commons(queue);
            }
        );
    });
})

Cypress.Commands.add('check_user_details', (userDetails, limits) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`).then(
            (e) => {
                cy.log(e);
                let obj = JSON.parse(e)[0];
                cy.check_commons(obj);
                expect(obj.app_key).to.equal(ob.appKey);
                expect(obj.device_id).to.be.exist;
                expect(obj.sdk_name).to.be.exist;
                expect(obj.sdk_version).to.be.exist;
                let queue = JSON.parse(obj.user_details);
                if (limits !== undefined) {
                    cy.log(queue);
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
            }
        );
    });
})

Cypress.Commands.add('check_custom_event_limit', (customEvent, limits) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_event`).then(
            (e) => {
                let obj = JSON.parse(e)[0];
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
            }
        );
    });
})

Cypress.Commands.add('check_view_event_limit', (viewName, limits) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_event`).then(
            (e) => {
                let obj = JSON.parse(e)[0];
                cy.check_commons(obj);
                //check key
                expect(obj.key).to.equal(("[CLY]_view").substring(0, limits.key));
                expect(obj.segmentation.name).to.equal(viewName.substring(0, limits.value));
                expect(obj.segmentation.visit).to.equal(1);
                expect(obj.segmentation.view.length).to.be.within(0, limits.value);
            }
        );
    });
})

Cypress.Commands.add('check_error_limit', (limits) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`).then(
            (e) => {
                cy.log(e);
                let obj = JSON.parse(e)[0];
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
            }
        );
    });
})

Cypress.Commands.add('check_error_limit', (limits) => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`).then(
            (e) => {
                cy.log(e);
                let obj = JSON.parse(e)[0];
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
            }
        );
    });
})