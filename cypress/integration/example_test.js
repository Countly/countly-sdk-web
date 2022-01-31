/* eslint-disable cypress/no-unnecessary-waiting */
// cypress/support/commands.js
import 'cypress-localstorage-commands';

const appKey = "YOUR_APP_KEY";

describe('Synchronous Countly initialization ', () => {
    it('Checks localStorage for correct initialization', () => {
        cy.visit("examples/example_sync.html");
        cy.getLocalStorage(`${appKey}/cly_queue`).then(
            (e) => {
                cy.check_begin_session(e, appKey);
            }
        );
    });
});

