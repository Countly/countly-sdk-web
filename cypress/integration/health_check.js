/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.countly",
        test_mode: true
    });
}

describe("Health Check tests ", () => {
    it("Check if health check is sent at the beginning", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.intercept("https://your.domain.countly/i?*").as("getXhr");
            cy.wait("@getXhr").then((xhr) => {
                const url = new URL(xhr.request.url);

                // Test the 'hc' parameter
                const hcParam = url.searchParams.get("hc");
                const hcParamObj = JSON.parse(hcParam);
                expect(hcParamObj).to.eql({ el: 0, wl: 0, sc: -1, em: "\"\"" });

                // Test the 'metrics' parameter
                const metricsParam = url.searchParams.get("metrics");
                expect(metricsParam).to.equal("{\"_app_version\":\"0.0\",\"_ua\":\"abcd\"}");

                // check nothing in the request queue
                cy.fetch_local_request_queue().then((rq) => {
                    expect(rq.length).to.equal(0);
                });
            });
        });
    });
});
