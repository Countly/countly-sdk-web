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

    // ===========================
    //  Confirms:
    // view A's id and event A's cvid are same
    // view B's id and event B's cvid are same. Also view B's pvid and view A's id are same
    // view C's id and event C's cvid are same. Also view C's pvid and view B's id are same
    //
    // request order: view A start -> event A -> view A end -> view B start -> event B -> view B end -> view C start -> event C  
    // ===========================
    it("Checks a sequence of events and page views", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_view("A");
            Countly.add_event({ key: "A" });
            Countly.track_view("B");
            Countly.add_event({ key: "B" });
            Countly.track_view("C");
            Countly.add_event({ key: "C" });

            cy.fetch_local_event_queue().then((eq) => {
                expect(eq.length).to.equal(8);
                cy.log(eq);

                // event A and view A
                cy.check_view_event(eq[0], "A", undefined, false); // no pvid
                const idA = eq[0].id; // idA
                cy.check_event(eq[1], { key: "A" }, undefined, idA); // cvid should be idA
                cy.check_view_event(eq[2], "A", 0, false); // no pvid

                // event B and view B
                cy.check_view_event(eq[3], "B", undefined, idA); // pvid is idA
                const idB = eq[3].id; // idB
                cy.check_event(eq[4], { key: "B" }, undefined, idB); // cvid should be idB
                cy.check_view_event(eq[5], "B", 0, idA); // pvid is idA

                // event C and view C
                cy.check_view_event(eq[6], "C", undefined, idB); // pvid is idB
                const idC = eq[6].id; // idC
                cy.check_event(eq[7], { key: "C" }, undefined, idC); // cvid should be idC  
            });
        });
    });
});