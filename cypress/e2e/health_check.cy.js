/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true
    });
}

describe("Health Check tests", () => {
    it("Check if health check is sent at the beginning", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.intercept("POST", "https://your.domain.count.ly/i").as("postXhr");
            cy.wait("@postXhr").then((xhr) => {
                const body = xhr.request.body;
                const params = new URLSearchParams(body);

                const hcParam = params.get("hc");
                const hcParamObj = JSON.parse(decodeURIComponent(hcParam));
                expect(hcParamObj).to.eql({ el: 0, wl: 0, sc: -1, em: "" });

                const metricsParam = params.get("metrics");
                expect(metricsParam).to.equal("{\"_app_version\":\"0.0\",\"_ua\":\"abcd\"}");

                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
            });
        });
    });
    it("Check no health check is sent in offline mode", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                offline_mode: true
            });

            cy.intercept("POST", "https://your.domain.count.ly/i").as("postXhr");
            cy.get('@postXhr').should('not.exist');
            cy.fetch_local_request_queue().then((rq) => {
                expect(rq.length).to.equal(0);
            });
        });
    });
});
