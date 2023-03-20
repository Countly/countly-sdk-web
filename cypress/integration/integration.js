var Countly = require("../../lib/countly");
var hp = require("../support/helper");

/**
 *  init countly
 */
function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        debug: true,
        test_mode: true
    });
}

describe("first", () => {
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
            expect(rq.length).to.equal(8);
            expect(consentStatus).to.equal(true); // no consent necessary
            expect(remote).to.eql({}); // deepEqual

            // 1 - 2
            expect(rq[0].campaign_id).to.equal("camp_id");
            expect(rq[0].campaign_user).to.equal("camp_user_id");
            expect(rq[1].campaign_id).to.equal("camp_id");
            expect(rq[1].campaign_user).to.equal("camp_user_id");

            // 3
            const thirdRequest = JSON.parse(rq[2].events);
            expect(thirdRequest.length).to.equal(2);
            cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: { test: "test" } }, undefined, "");
            cy.check_event(thirdRequest[0], { key: "test", count: 1, sum: 1, dur: 1, segmentation: { } }, undefined, "");

            // 4
            const fourthRequest = JSON.parse(rq[3].user_details);
            expect(fourthRequest.name).to.equal("name");
            expect(fourthRequest.custom).to.eql({});

            // 5
            const fifthRequest = JSON.parse(rq[4].user_details);
            expect(fifthRequest).to.eql({ custom: { set: "set" } });

            // 6
            const sixthRequest = JSON.parse(rq[5].crash);
            expect(sixthRequest._error).to.equal("stack");

            // 7
            expect(rq[6].begin_session).to.equal(1);

            // 8
            const eighthRequest = JSON.parse(rq[7].events);
            expect(eighthRequest.length).to.equal(2);
            cy.check_event(eighthRequest[0], { key: "[CLY]_orientation" }, undefined, "");
            cy.check_view_event(eighthRequest[1], "/__cypress/iframes/integration%2Fintegration.js", undefined, false);

            // each request should have same device id, device id type and app key
            rq.forEach(element => {
                expect(element.device_id).to.equal(id);
                expect(element.t).to.equal(idType);
                expect(element.app_key).to.equal(hp.appKey);
                expect(element.metrics).to.be.ok;
                expect(element.dow).to.exist;
                expect(element.hour).to.exist;
                expect(element.sdk_name).to.be.ok;
                expect(element.sdk_version).to.be.ok;
                expect(element.timestamp).to.be.ok;
            });
        });
    });
});