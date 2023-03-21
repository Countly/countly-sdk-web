/* eslint-disable require-jsdoc */
var hp = require("../support/helper");

describe("Multi instancing tests", () => {
    it("Check if request queue has the correct info", () => {
        cy.visit("./cypress/fixtures/multi_instance.html");
        hp.waitFunction(hp.getTimestampMs(), 1000, 100, () => {
            cy.fetch_local_request_queue(hp.appKey + "1").then((rq) => {
                cy.fetch_local_request_queue(hp.appKey + "2").then((rq2) => {
                    cy.fetch_local_request_queue(hp.appKey + "3").then((rq3) => {
                        cy.fetch_local_request_queue(hp.appKey + "4").then((rq4) => {
                            hp.testNormalFlow(rq, "/cypress/fixtures/multi_instance.html", hp.appKey + "1");
                            hp.testNormalFlow(rq2, "/cypress/fixtures/multi_instance.html", hp.appKey + "2");
                            hp.testNormalFlow(rq3, "/cypress/fixtures/multi_instance.html", hp.appKey + "3");
                            hp.testNormalFlow(rq4, "/cypress/fixtures/multi_instance.html", hp.appKey + "4");
                            expect(rq[0].device_id).to.not.equal(rq2[0].device_id);
                            expect(rq3[0].device_id).to.not.equal(rq4[0].device_id);
                            expect(rq[0].device_id).to.not.equal(rq3[0].device_id);
                        });
                    });
                });
            });
        });
    });
});
