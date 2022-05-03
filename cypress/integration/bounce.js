/**
// app_key: "6382ac78c3ec207d8a10c8c8f7c4051cb393f5c1",
// url: "https://master.count.ly",
const waitTime = 5000;
const testWaitTime = 30000;

describe("Bounce tests 1", () => {
    it("Single bounce test page 1", () => {
        cy.visit("https://test-deniz.count.ly/first_page.html?clear_data=1");
        cy.contains("End Button").wait(waitTime).click().wait(waitTime);
        cy.contains("Back").click().wait(testWaitTime);
    });
});
describe("Bounce tests 2", () => {
    it("Single bounce test page 2", () => {
        cy.visit("https://test-deniz.count.ly/second_page.html");
        cy.contains("Back").wait(waitTime).click().wait(testWaitTime);
    });
});
describe("Bounce tests 3", () => {
    it("Single bounce test page 3", () => {
        cy.visit("https://test-deniz.count.ly/third_page.html");
        cy.contains("Back").wait(waitTime).click().wait(testWaitTime);
    });
});
describe("Bounce tests 4", () => {
    it("Single bounce test page 4", () => {
        cy.visit("https://test-deniz.count.ly/456.html#four");
        cy.contains("End Session").wait(waitTime).click().wait(waitTime);
        cy.contains("Back").click().wait(testWaitTime);
    });
});
describe("Bounce tests 5", () => {
    it("Single bounce test page 5", () => {
        cy.visit("https://test-deniz.count.ly/456.html#five");
        cy.contains("Back").wait(waitTime).click({ force: true }).wait(testWaitTime);
    });
});
describe("Bounce tests 6", () => {
    it("Single bounce test page 6", () => {
        cy.visit("https://test-deniz.count.ly/456.html#six");
        cy.contains("Back").wait(waitTime).click({ force: true }).wait(testWaitTime);
    });
});
*/