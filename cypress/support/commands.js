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
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('check_commons', (queue) => {
    expect(queue.timestamp).to.be.ok;
    expect(queue.hour).to.be.within(0, 23);
    expect(queue.dow).to.be.within(1, 7);
})

Cypress.Commands.add('check_begin_session', () => {
    cy.fixture('variables').then((ob) => {
        cy.getLocalStorage(`${ob.appKey}/cly_queue`).then(
            (e) => {
                let queue = JSON.parse(e)[0];
                let metrics = JSON.parse(queue.metrics);
                expect(queue.begin_session).to.equal(1);
                expect(metrics._app_version).to.be.ok;
                expect(metrics._ua).to.be.ok;
                expect(metrics._resolution).to.be.ok;
                expect(metrics._density).to.be.ok;
                expect(metrics._locale).to.be.ok;
                expect(queue.app_key).to.equal(ob.appKey);
                expect(queue.device_id).to.equal("[CLY]_temp_id");
                expect(queue.sdk_name).to.equal("javascript_native_web");
                expect(queue.sdk_version).to.be.ok;
                cy.check_commons(queue);
            }
        );
    });
})
Cypress.Commands.add('check_event', (eventObject) => {
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
                if (typeof eventObject.dur !== 'undefined') {
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
