/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMulti(appKey, searchQuery, utmStuff) {
    Countly.init({
        app_key: appKey,
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        utm: utmStuff,
        getSearchQuery: function() {
            return searchQuery;
        }
    });
}

describe("UTM tests ", () => {
    it("Checks if a single default utm tag works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);
            Countly.q.push(['track_errors']);  // adding this as calling it during init used to cause an error (at v23.12.5)
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });
        });
    });
    it("Checks if default utm tags works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4", undefined);
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
            });
        });
    });
    it("Checks if a single custom utm tag works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "?utm_aa=hehe", { aa: true, bb: true });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("");
            });
        });
    });
    it("Checks if custom utm tags works", () => {
        hp.haltAndClearStorage(() => {
            initMulti("YOUR_APP_KEY", "utm_aa=hehe&utm_bb=hoho", { aa: true, bb: true });
            cy.fetch_local_request_queue().then((rq) => {
                cy.log(rq);
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_aa).to.eq("hehe");
                expect(custom.utm_bb).to.eq("hoho");
            });
        });
    });
    it("Checks if utm tag works in multi instancing", () => {
        hp.haltAndClearStorage(() => {
            // utm object provided with appropriate query
            initMulti("Countly_2", "?utm_ss=hehe2", { ss: true });

            // utm object provided with inappropriate query
            initMulti("Countly_4", "?utm_source=hehe4", { ss: true });

            // utm object not provided with default query
            initMulti("Countly_3", "utm_source=hehe3", undefined);

            // utm object not provided with inappropriate query
            initMulti("Countly_5", "?utm_ss=hehe5", undefined);

            // default (original) init with no custom tags and default query
            initMulti("YOUR_APP_KEY", "utm_source=hehe", undefined);

            // check original
            cy.fetch_local_request_queue().then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });

            // check if custom utm tags works
            cy.fetch_local_request_queue("Countly_2").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_ss).to.eq("hehe2");
            });
            // check if default utm tags works
            cy.fetch_local_request_queue("Countly_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe3", "", "", "", "");
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue("Countly_4").then((rq) => {
                expect(rq.length).to.eq(0);
            });
            // check if no utm tag in request queue if the query is wrong
            cy.fetch_local_request_queue("Countly_5").then((rq) => {
                expect(rq.length).to.eq(0);
            });
        });
    });
    it("Checks if multi instancing works plus", () => {
        hp.haltAndClearStorage(() => {
            // default (original) init with no custom tags and short default query for multi instance base
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);

            // utm object not provided with full +  weird query
            initMulti("Countly_multi_1", "utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4&fdsjhflkjhsdlkfjhsdlkjfhksdjhfkj+dsf;jsdlkjflk+=skdjflksjd=fksdfl;sd=sdkfmk&&&", undefined);

            // utm object given that includes 2 default 1 custom, full plus custom query + gabledeboop
            initMulti("Countly_multi_2", "?utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4&utm_sthelse=hehe5&fdsjhflkjhsdlkfjhsdlkjfhksdjhfkj+dsf;jsdlkjflk+=skdjflksjd=fksdfl;sd=sdkfmk&&&", { source: true, term: true, sthelse: true });

            // empty init, garbage query + 1 default
            initMulti("Countly_multi_3", "dasdashdjkhaslkjdhsakj=dasmndlask=asdkljska&&utm_source=hehe", undefined);

            // full default utm obj + custom 1, full query + 1
            initMulti("Countly_multi_4", "?utm_source=hehe&utm_medium=hehe1&utm_campaign=hehe2&utm_term=hehe3&utm_content=hehe4&utm_next=hehe5", { source: true, medium: true, campaign: true, term: true, content: true, next: true });

            // full default utm obj + custom 1, no query
            initMulti("Countly_multi_5", "", { source: true, medium: true, campaign: true, term: true, content: true, next: true });

            // check original
            cy.fetch_local_request_queue().then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });

            // check if custom utm tags works for multi 1
            cy.fetch_local_request_queue("Countly_multi_1").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
            });

            // check if custom utm tags works for multi 2
            cy.fetch_local_request_queue("Countly_multi_2").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", undefined, undefined, "hehe3", undefined);
                expect(custom.utm_sthelse).to.eq("hehe5");
            });

            // check if custom utm tags works for multi 3
            cy.fetch_local_request_queue("Countly_multi_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });

            // check if custom utm tags works for multi 4
            cy.fetch_local_request_queue("Countly_multi_4").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "hehe1", "hehe2", "hehe3", "hehe4");
                expect(custom.utm_next).to.eq("hehe5");
            });

            // check if custom utm tags works for multi 5
            cy.fetch_local_request_queue("Countly_multi_5").then((rq) => {
                expect(rq.length).to.eq(0);
            });
        });
    });
    it("Checks if multi instancing works plus plus", () => {
        hp.haltAndClearStorage(() => {
            // default (original) init with no custom tags and short default query for multi instance base
            initMulti("YOUR_APP_KEY", "?utm_source=hehe", undefined);

            // utm object empty, custom query + gabledeboop
            initMulti("Countly_multi_next_1", "?utm_sourcer=hehe&utm_mediumr=hehe1&utm_campaignr=hehe2&utm_rterm=hehe3&utm_corntent=hehe4&fdsjhflkjhsdlkfjhsdlkjfhksdjhfkj+dsf;jsdlkjflk+=skdjflksjd=fksdfl;sd=sdkfmk&&&", undefined);

            // utm object default, custom query + gabledeboop
            initMulti("Countly_multi_next_2", "utm_sourcer=hehe&utm_mediumr=hehe1&utm_campaignr=hehe2&utm_rterm=hehe3&utm_corntent=hehe4&fdsjhflkjhsdlkfjhsdlkjfhksdjhfkj+dsf;jsdlkjflk+=skdjflksjd=fksdfl;sd=sdkfmk&&&", { source: true, medium: true, campaign: true, term: true, content: true });

            // custom utm object, custom query + gabledeboop
            initMulti("Countly_multi_next_3", "?utm_sauce=hehe&utm_pan=hehe2&dasdashdjkhaslkjdhsakj=dasmndlask=asdkljska&&utm_source=hehe", { sauce: true, pan: true });

            // check original
            cy.fetch_local_request_queue().then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, "hehe", "", "", "", "");
            });

            // check if custom utm tags works for multi 1
            cy.fetch_local_request_queue("Countly_multi_next_1").then((rq) => {
                expect(rq.length).to.eq(0);
            });

            // check if custom utm tags works for multi 2
            cy.fetch_local_request_queue("Countly_multi_next_2").then((rq) => {
                expect(rq.length).to.eq(0);
            });

            // check if custom utm tags works for multi 3
            cy.fetch_local_request_queue("Countly_multi_next_3").then((rq) => {
                const custom = JSON.parse(rq[0].user_details).custom;
                hp.validateDefaultUtmTags(custom, undefined, undefined, undefined, undefined, undefined);
                expect(custom.utm_sauce).to.eq("hehe");
                expect(custom.utm_pan).to.eq("hehe2");
            });
        });
    });
});
