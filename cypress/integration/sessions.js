/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        session_update: 3,
        tests: true
    });
}


describe('Session tests ', () => {
    it('Checks if session start, extension and ending works', () => {
        initMain();
        Countly.begin_session();
        cy.check_session(1);
        cy.wait(4500).then(()=>{
            cy.check_session(2, 4);
            Countly.end_session(10, true);
            cy.check_session(3, 10, true);
        });
    });
});

