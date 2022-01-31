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
Cypress.Commands.add('check_begin_session', (clyQueue, appKey) => {
    let queue = JSON.parse(clyQueue)[0];
    let metrics = JSON.parse(queue.metrics);
    expect(queue.begin_session).to.equal(1);
    expect(metrics._app_version).to.be.ok;
    expect(metrics._ua).to.be.ok;
    expect(metrics._resolution).to.be.ok;
    expect(metrics._density).to.be.ok;
    expect(metrics._locale).to.be.ok;
    expect(queue.app_key).to.equal(appKey);
    expect(queue.device_id).to.equal("[CLY]_temp_id");
    expect(queue.sdk_name).to.equal("javascript_native_web");
    expect(queue.sdk_version).to.be.ok;
    expect(queue.timestamp).to.be.ok;
    expect(queue.hour).to.be.within(0, 23);
    expect(queue.dow).to.be.within(1, 7);
})