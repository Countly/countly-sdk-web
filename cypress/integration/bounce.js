// /**
// const app_key = "6382ac78c3ec207d8a10c8c8f7c4051cb393f5c1";
// // url: "https://master.count.ly",
// const waitTime = 7000;
// // const testWaitTime = 30000;
// const eventObj = {
//     key: "buttonClick222",
//     count: 1,
//     segmentation: {
//         id: "id",
//     },
// };
// describe("Bounce tests 1", () => {
//     it("Single bounce test page 1", () => {
//         cy.visit("https://test-deniz.count.ly/first_page.html?clear_data=1");
//         cy.contains("End Button").wait(waitTime).click().wait(waitTime);
//         cy.contains("Back").click().wait(testWaitTime);
//     });
// });
// describe("Bounce tests 2", () => {
//     it("Single bounce test page 2", () => {
//         cy.visit("https://test-deniz.count.ly/second_page.html");
//         cy.contains("Back").wait(waitTime).click().wait(testWaitTime);
//     });
// });
// describe("Bounce tests 3", () => {
//     it("Single bounce test page 3", () => {
//         cy.visit("https://test-deniz.count.ly/third_page.html");
//         cy.contains("Back").wait(waitTime).click().wait(testWaitTime);
//     });
// });
// describe("Bounce tests 4", () => {
//     it("Single bounce test page 4", () => {
//         cy.visit("https://test-deniz.count.ly/456.html#four");
//         cy.contains("End Session").wait(waitTime).click().wait(waitTime);
//         cy.contains("Back").click().wait(testWaitTime);
//     });
// });
// describe("Bounce tests 5", () => {
//     it("Single bounce test page 5", () => {
//         cy.visit("https://test-deniz.count.ly/456.html#five");
//         cy.contains("Back").wait(waitTime).click({ force: true }).wait(testWaitTime);
//     });
// });
// describe("Bounce tests 6", () => {
//     it("Single bounce test page 6", () => {
//         cy.visit("https://test-deniz.count.ly/456.html#six");
//         cy.contains("Back").wait(waitTime).click({ force: true }).wait(testWaitTime);
//     });
// });
// describe("Bounce test 1", () => {
//     it("Single bounce test auto sessions", () => {
//         cy.visit("./cypress/fixtures/bounce_test_auto.html")
//             .wait(waitTime);
//         cy.contains("Event").click().wait(300);
//         cy.visit("./cypress/fixtures/base.html");
//         cy.fetch_local_request_queue(app_key).then((rq) => {
//             cy.log(rq);
//             // 3 session and 1 orientation 1 event
//             expect(rq.length).to.equal(5);
//             // first object of the queue should be about begin session, second is orientation
//             cy.check_session(rq[0], undefined, undefined, app_key);
//             // third object of the queue should be about session extension, also input the expected duration
//             cy.check_session(rq[2], 5, undefined, app_key);
//             // fourth object of the queue should be about event sent
//             cy.check_event(JSON.parse(rq[3].events)[0], eventObj);
//             // fifth object of the queue should be about session extension, also input the expected duration
//             cy.check_session(rq[4], 1, undefined, app_key);
//         });
//     });
// });
// describe("Bounce test 2", () => {
//     it("Single bounce test manual sessions", () => {
//         cy.visit("./cypress/fixtures/bounce_test_manual.html");
//         cy.contains("Start").click().wait(waitTime);
//         cy.contains("Event").click();
//         cy.contains("End").click().wait(300);
//         cy.visit("./cypress/fixtures/base.html");
//         cy.fetch_local_request_queue(app_key).then((rq) => {
//             cy.log(rq);
//             // 3 session and 1 orientation 1 event
//             expect(rq.length).to.equal(5);
//             // first object of the queue should be about begin session, second is orientation
//             cy.check_session(rq[0], undefined, undefined, app_key);
//             // third object of the queue should be about session extension, also input the expected duration
//             cy.check_session(rq[2], 5, undefined, app_key);
//             // fourth object of the queue should be about session extension, also input the expected duration
//             cy.check_session(rq[3], 1, undefined, app_key);
//             // fifth object of the queue should be about event sent
//             cy.check_event(JSON.parse(rq[4].events)[0], eventObj);
//         });
//     });
// });
// */