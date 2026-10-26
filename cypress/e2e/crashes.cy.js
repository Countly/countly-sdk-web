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

function cause_error() {
    // eslint-disable-next-line no-undef
    undefined_function();
}

describe("Crashes tests ", () => {
    it("Checks if a caught crash is reported correctly", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.track_errors();
            try {
                cause_error();
            }
            catch (err) {
                Countly.log_error(err);
            }
            cy.wait(1000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    cy.check_crash(rq[0], hp.appKey);
                });
            });
        });
    });

    it("Keeps no breadcrumbs when the breadcrumb limit is 0", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                max_breadcrumb_count: 0
            });
            Countly.add_log("first breadcrumb");
            Countly.add_log("second breadcrumb");
            Countly.log_error(new Error("reported without breadcrumbs"));
            cy.wait(1000).then(() => {
                cy.fetch_local_request_queue().then((rq) => {
                    var crash = JSON.parse(rq.filter((r) => r.crash)[0].crash);
                    expect(crash._logs || "").to.not.contain("breadcrumb");
                });
            });
        });
    });
});

/**
 * The crash objects waiting in the request queue, in the order they were recorded
 * @param {Array} rq - request queue
 * @returns {Array} crash objects
 */
function crashesIn(rq) {
    return rq.filter((r) => r.crash).map((r) => JSON.parse(r.crash));
}

describe("Crashes from uncaught errors and unhandled rejections", () => {
    beforeEach(() => {
        // the errors the page raises are for the SDK to report, not failures of the tests
        cy.on("uncaught:exception", () => false);
    });

    /**
     * Opens a page that tracks errors, makes it raise an error, and gives the crashes it queued
     * @param {Function} raise - called with the page's window to raise the error there
     * @returns {Cypress.Chainable<Array>} crash objects
     */
    function crashesAfter(raise) {
        hp.haltAndClearStorage(() => {
            cy.visit("./cypress/fixtures/crash_handlers.html");
        });
        cy.window().then((win) => {
            // nothing is returned, so Cypress does not wait on a rejected promise the page leaves unhandled
            raise(win);
        });
        cy.wait(500);
        return cy.fetch_local_request_queue().then(crashesIn);
    }

    it("Reports an uncaught error as a fatal crash with the error's stack", () => {
        crashesAfter((win) => win.eval("setTimeout(function () { throw new Error('uncaught failure'); }, 0);")).then((crashes) => {
            expect(crashes).to.have.length(1);
            expect(crashes[0]._nonfatal).to.equal(false);
            expect(crashes[0]._error).to.contain("Error: uncaught failure");
        });
    });
    it("Reports an error event without an error object, as from older browsers, with its message and place", () => {
        crashesAfter((win) => win.dispatchEvent(new win.ErrorEvent("error", { message: "old browser failure", filename: "https://site.example/app.js", lineno: 12, colno: 34 }))).then((crashes) => {
            expect(crashes).to.have.length(1);
            expect(crashes[0]._nonfatal).to.equal(false);
            expect(crashes[0]._error).to.contain("old browser failure");
            expect(crashes[0]._error).to.contain("at https://site.example/app.js:12:34");
        });
    });
    it("Reports an unhandled promise rejection as a non-fatal crash with the reason's stack", () => {
        crashesAfter((win) => win.eval("Promise.reject(new Error('rejected failure'));")).then((crashes) => {
            expect(crashes).to.have.length(1);
            expect(crashes[0]._nonfatal).to.equal(true);
            expect(crashes[0]._error).to.contain("Unhandled rejection (reason: Error: rejected failure");
        });
    });
    it("Reports an unhandled promise rejection with a reason that is not an error as a non-fatal crash", () => {
        crashesAfter((win) => win.eval("Promise.reject('payment declined');")).then((crashes) => {
            expect(crashes).to.have.length(1);
            expect(crashes[0]._nonfatal).to.equal(true);
            expect(crashes[0]._error).to.contain("Unhandled rejection (reason: payment declined).");
        });
    });
});

describe("Crashes from errors given to the SDK", () => {
    it("Reports an error-like object without a stack by its name, message, file, line and column", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.log_error({ name: "PaymentError", message: "card declined", fileName: "https://site.example/pay.js", lineNumber: 42, columnNumber: 7 });
            cy.fetch_local_request_queue().then((rq) => {
                var crashes = crashesIn(rq);
                expect(crashes).to.have.length(1);
                expect(crashes[0]._nonfatal).to.equal(true);
                ["PaymentError", "card declined", "https://site.example/pay.js", "42:7"].forEach((part) => {
                    expect(crashes[0]._error).to.contain(part);
                });
            });
        });
    });
    it("Puts the error's name and message before a stack that lacks them, as Firefox and Safari give it, and keeps a stack that starts with them", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.log_error({ name: "PaymentError", message: "card declined", stack: "pay@https://site.example/pay.js:42:7" });
            Countly.log_error({ name: "PaymentError", message: "card declined", stack: "PaymentError: card declined\n    at pay (https://site.example/pay.js:42:7)" });
            cy.fetch_local_request_queue().then((rq) => {
                var crashes = crashesIn(rq);
                expect(crashes).to.have.length(2);
                expect(crashes[0]._error).to.equal("PaymentError: card declined\npay@https://site.example/pay.js:42:7");
                expect(crashes[1]._error).to.equal("PaymentError: card declined\n    at pay (https://site.example/pay.js:42:7)");
            });
        });
    });
    it("Reports a text given as the error as it is", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.log_error("checkout failed: timeout");
            cy.fetch_local_request_queue().then((rq) => {
                var crashes = crashesIn(rq);
                expect(crashes).to.have.length(1);
                expect(crashes[0]._error).to.equal("checkout failed: timeout");
            });
        });
    });
    it("Sends each crash with the breadcrumbs recorded since the previous crash, oldest first, and with its custom segments", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            Countly.add_log("opened cart");
            Countly.add_log("applied coupon");
            Countly.log_error(new Error("checkout failure"), { plan: "pro" });
            Countly.add_log("retried payment");
            Countly.log_error(new Error("payment failure"));
            cy.fetch_local_request_queue().then((rq) => {
                var crashes = crashesIn(rq);
                expect(crashes).to.have.length(2);
                expect(crashes[0]._logs).to.equal("opened cart\napplied coupon");
                expect(crashes[0]._custom).to.deep.equal({ plan: "pro" });
                expect(crashes[1]._logs).to.equal("retried payment");
            });
        });
    });
    it("Sends a crash as the crash filter changes it, and drops it when the filter returns nothing", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                crash_filter_callback: (crash) => {
                    if (crash._error.indexOf("ignore me") !== -1) {
                        return null;
                    }
                    crash._custom = { filtered: "yes" };
                    return crash;
                }
            });
            Countly.log_error("ignore me please");
            Countly.log_error("keep me");
            cy.fetch_local_request_queue().then((rq) => {
                var crashes = crashesIn(rq);
                expect(crashes).to.have.length(1);
                expect(crashes[0]._error).to.equal("keep me");
                expect(crashes[0]._custom).to.deep.equal({ filtered: "yes" });
            });
        });
    });
});
