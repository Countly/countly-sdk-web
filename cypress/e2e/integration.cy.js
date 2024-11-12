var Countly = require("../../lib/countly");
var hp = require("../support/helper");

/**
 *  init countly
 */
function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        debug: true,
        test_mode: true
    });
}

describe("Integration test", () => {
    it("int, no consent, no offline_mode", () => {
        initMain();
        const idType = Countly.get_device_id_type();
        const id = Countly.get_device_id();
        const consentStatus = Countly.check_any_consent();
        Countly.remove_consent();
        Countly.disable_offline_mode();
        Countly.add_event({ key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } });
        Countly.start_event("test");
        Countly.cancel_event("gobbledygook");
        Countly.end_event("test");
        Countly.report_conversion("camp_id", "camp_user_id");
        Countly.recordDirectAttribution("camp_id", "camp_user_id");
        Countly.user_details({ name: "name" });
        Countly.userData.set("set", "set");
        Countly.userData.save();
        Countly.report_trace({ name: "name", stz: 1, type: "type" });
        Countly.log_error({ error: "error", stack: "stack" });
        Countly.add_log("error");
        Countly.fetch_remote_config();
        Countly.enrollUserToAb();
        const remote = Countly.get_remote_config();
        Countly.track_sessions();
        Countly.track_pageview();
        Countly.track_errors();
        Countly.track_clicks();
        Countly.track_scrolls();
        Countly.track_links();
        Countly.track_forms();
        Countly.collect_from_forms();
        Countly.collect_from_facebook();
        Countly.opt_in();
        // TODO: widgets
        // TODO: make better
        cy.fetch_local_request_queue().then((rq) => {
            cy.log(rq);
            hp.testNormalFlow(rq, "/__cypress/iframes/cypress%5Ce2e%5Cintegration.cy.js", hp.appKey);
            expect(consentStatus).to.equal(true); // no consent necessary
            expect(remote).to.eql({}); // deepEqual
            expect(rq[0].device_id).to.equal(id);
            expect(rq[0].t).to.equal(idType);
        });
    });
});