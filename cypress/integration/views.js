/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://try.count.ly",
        max_events: -1,
        test_mode: true
    });
}

var pageNameOne = "test view page name1";
var pageNameTwo = "test view page name2";

describe("View ID tests ", () => {
    it("Checks if UUID and secureRandom works as intended", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            const uuid = Countly._internals.generateUUID();
            const id = Countly._internals.secureRandom();
            assert.equal(uuid.length, 36);
            assert.equal(id.length, 21);
            const uuid2 = Countly._internals.generateUUID();
            const id2 = Countly._internals.secureRandom();
            assert.equal(uuid2.length, 36);
            assert.equal(id2.length, 21);
            assert.notEqual(uuid, uuid2);
            assert.notEqual(id, id2);
        });
    });
    it("Checks if recording page view works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(1);
                cy.check_view_event(eq[0], pageNameOne, undefined, false);
            });
        });
    });
    it("Checks if recording timed page views with same name works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            cy.wait(3000).then(() => {
                Countly.track_view(pageNameOne);
                cy.fetch_local_event_queue().then((eq) => {
                    cy.log(eq);
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne, undefined, false);
                    const id1 = eq[0].id;

                    cy.check_view_event(eq[1], pageNameOne, 3, false);
                    const id2 = eq[1].id;
                    assert.equal(id1, id2);

                    cy.check_view_event(eq[2], pageNameOne, undefined, true);
                    const id3 = eq[2].id;
                    const pvid = eq[2].pvid;
                    assert.equal(id1, pvid);
                    assert.notEqual(id3, pvid);
                });
            });
        });
    });
    it("Checks if recording timed page views with different name works", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view(pageNameOne);
            hp.waitFunction(hp.getTimestampMs(), 4000, 500, ()=>{
                Countly.track_view(pageNameTwo);
                cy.fetch_local_event_queue().then((eq) => {
                    expect(eq.length).to.equal(3);
                    cy.check_view_event(eq[0], pageNameOne, undefined, false);
                    const id1 = eq[0].id;

                    // this test is flaky we are expecting 3 and +1 (4) to make test more reliable 
                    cy.check_view_event(eq[1], pageNameOne, 4, false);
                    const id2 = eq[1].id;
                    assert.equal(id1, id2);

                    cy.check_view_event(eq[2], pageNameTwo, undefined, true);
                    const id3 = eq[2].id;
                    const pvid = eq[2].pvid;
                    assert.equal(id1, pvid);
                    assert.notEqual(id3, pvid);
                });
            });
        });
    });
});