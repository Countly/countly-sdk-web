/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initLanding(searchQuery, extra) {
    var config = {
        app_key: hp.appKey,
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        getSearchQuery: function() {
            return searchQuery;
        }
    };
    for (var key in extra) {
        config[key] = extra[key];
    }
    Countly.init(config);
}

// the address the SDK builds from this page and the query it was given
function landingOf(query) {
    return window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + query;
}

function attributionRequests(rq) {
    return rq.filter((req) => req.attribution !== undefined);
}

function expectLanding(req, query) {
    expect(JSON.parse(req.attribution)).to.deep.equal({ type: "landing", value: landingOf(query) });
}

describe("Landing attribution tests", () => {
    it("Sends the exact landing JSON, URL-encoded, on /i", () => {
        hp.haltAndClearStorage(() => {
            const query = "utm_source=news letter&utm_medium=email&cly_clk=k1";
            const expected = JSON.stringify({ type: "landing", value: landingOf(query) });
            const sentQueries = [];
            cy.intercept("https://your.domain.count.ly/i*", (req) => {
                sentQueries.push(req.method === "GET" ? req.url.split("?")[1] : req.body);
                req.reply({ statusCode: 200, body: { result: "Success" } });
            });
            initLanding("?" + query, { test_mode: false, test_mode_eq: false });
            cy.wait(3000).then(() => {
                const withLanding = sentQueries.filter((q) => typeof q === "string" && q.indexOf("attribution=") !== -1);
                expect(withLanding.length).to.equal(1);
                // the parameter is the JSON string, URL-encoded, and nothing else
                const raw = withLanding[0].split("&").filter((part) => part.indexOf("attribution=") === 0);
                expect(raw).to.deep.equal(["attribution=" + encodeURIComponent(expected)]);
                expect(decodeURIComponent(raw[0].substring("attribution=".length))).to.equal(expected);
            });
        });
    });

    it("Sends the landing address once with utm tags, and still sends custom.utm_*", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?utm_source=hehe&utm_campaign=spring&other=1");
            cy.fetch_local_request_queue().then((rq) => {
                const sent = attributionRequests(rq);
                expect(sent.length).to.equal(1);
                expectLanding(sent[0], "utm_source=hehe&utm_campaign=spring&other=1");
                // older servers read the tags from the user properties, as before
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "spring", "", "");
            });
        });
    });
    it("Sends the landing address for a utm tag outside the utm filter", () => {
        hp.haltAndClearStorage(() => {
            initLanding("utm_aa=hehe", { utm: { bb: true } });
            cy.fetch_local_request_queue().then((rq) => {
                const sent = attributionRequests(rq);
                expect(sent.length).to.equal(1);
                expectLanding(sent[0], "utm_aa=hehe");
            });
        });
    });
    it("Sends the landing address for a Countly click id", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?cly_clk=abc123");
            cy.fetch_local_request_queue().then((rq) => {
                const sent = attributionRequests(rq);
                expect(sent.length).to.equal(1);
                expectLanding(sent[0], "cly_clk=abc123");
                expect(rq.filter((req) => req.user_details !== undefined).length).to.equal(0);
            });
        });
    });
    it("Sends nothing for a landing without campaign parameters", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?foo=bar&gclid=xyz&cly_id=cmp&cly_uid=usr");
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(0);
            });
        });
    });
    it("Sends the landing address for an allow-listed parameter", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?foo=bar&gclid=xyz", { attribution_landing_params: ["gclid"] });
            cy.fetch_local_request_queue().then((rq) => {
                const sent = attributionRequests(rq);
                expect(sent.length).to.equal(1);
                expectLanding(sent[0], "foo=bar&gclid=xyz");
            });
        });
    });
    it("Sends nothing for a parameter that is not on the allow-list", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?foo=bar&fbclid=xyz", { attribution_landing_params: ["gclid"] });
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(0);
            });
        });
    });
    it("Ignores an allow-list that is not an array", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?gclid=xyz", { attribution_landing_params: "gclid" });
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(0);
            });
        });
    });
    it("Does not send the same landing again on reload, but sends a new landing", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?utm_source=hehe");
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(1);
                // reload: the SDK starts again in the same tab with the same address
                Countly.halt();
                initLanding("?utm_source=hehe");
                cy.fetch_local_request_queue().then((rq2) => {
                    expect(attributionRequests(rq2).length).to.equal(1);
                    // a different landing with campaign parameters is a new signal
                    Countly.halt();
                    initLanding("?utm_source=other");
                    cy.fetch_local_request_queue().then((rq3) => {
                        const sent = attributionRequests(rq3);
                        expect(sent.length).to.equal(2);
                        expectLanding(sent[0], "utm_source=hehe");
                        expectLanding(sent[1], "utm_source=other");
                    });
                });
            });
        });
    });
    it("Keeps the stored campaign ids for direct attribution", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?cly_id=cmp&cly_uid=usr&utm_source=hehe");
            Countly.recordDirectAttribution();
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(1);
                const direct = rq.filter((req) => req.campaign_id !== undefined);
                expect(direct.length).to.equal(1);
                expect(direct[0].campaign_id).to.equal("cmp");
                expect(direct[0].campaign_user).to.equal("usr");
            });
        });
    });
    it("Waits for the attribution consent", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?utm_source=hehe", { require_consent: true });
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(0);
                Countly.add_consent("users");
                cy.fetch_local_request_queue().then((rq2) => {
                    expect(attributionRequests(rq2).length).to.equal(0);
                    Countly.add_consent("attribution");
                    cy.fetch_local_request_queue().then((rq3) => {
                        const sent = attributionRequests(rq3);
                        expect(sent.length).to.equal(1);
                        expectLanding(sent[0], "utm_source=hehe");
                        // taking the consent back and giving it again does not send the landing again
                        Countly.remove_consent("attribution");
                        Countly.add_consent("attribution");
                        cy.fetch_local_request_queue().then((rq4) => {
                            expect(attributionRequests(rq4).length).to.equal(1);
                        });
                    });
                });
            });
        });
    });
    it("Sends nothing when the attribution consent is not given", () => {
        hp.haltAndClearStorage(() => {
            initLanding("?utm_source=hehe", { require_consent: true });
            Countly.add_consent(["sessions", "events", "views", "users"]);
            cy.fetch_local_request_queue().then((rq) => {
                expect(attributionRequests(rq).length).to.equal(0);
            });
        });
    });
});
