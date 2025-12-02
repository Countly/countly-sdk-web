/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
// import * as Countly from "../../dist/countly_umd.js";
var hp = require("../support/helper.js");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "http://localhost:9000",
        debug: true
    });
}

describe("Content Filter Tests", () => {
    beforeEach(() => {
        cy.wait(1000);
    });

    afterEach(() => {
        cy.task("stopServer");
    });

    it("Correctly provides params", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            const filterParams = [];
            initMain();

            function filter(params) {
                filterParams.push(params);
                return false;
            }

            Countly.content.enterContentZone(filter);

            cy.wait(5000).then(() => {
                expect(filterParams.length).to.be.greaterThan(0);
                expect(filterParams[0]).to.have.property("id");
                expect(filterParams[0]["id"]).to.equal("111");
                expect(filterParams[0]).to.have.property("uid");
                expect(filterParams[0]["uid"]).to.equal("tester");
                expect(filterParams[0]).to.have.property("app_id");
                expect(filterParams[0]["app_id"]).to.equal("222");
                cy.task("stopServer");
            });
        });
    });
    it("Correctly provides params_async", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            const filterParams = [];
            Countly.q = Countly.q || [];
            initMain();

            function filter(params) {
                filterParams.push(params);
                return false;
            }

            Countly.q.push(["content.enterContentZone", filter]);

            cy.wait(5000).then(() => {
                expect(filterParams.length).to.be.greaterThan(0);
                expect(filterParams[0]).to.have.property("id");
                expect(filterParams[0]["id"]).to.equal("111");
                expect(filterParams[0]).to.have.property("uid");
                expect(filterParams[0]["uid"]).to.equal("tester");
                expect(filterParams[0]).to.have.property("app_id");
                expect(filterParams[0]["app_id"]).to.equal("222");
                cy.task("stopServer");
            });
        });
    });
});
