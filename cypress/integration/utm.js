describe("UTM tests ", () => {
    it("Checks if a single default utm tag works", () => {
        // adding default utm_source
        cy.visit("../cypress/support/utm_1.html?utm_source=hehe");
        cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((rq)=>{
            const queue = JSON.parse(rq)[0].user_details;
            const custom = JSON.parse(queue).custom;
            expect(custom.utm_source).to.eq("hehe");
            expect(custom.utm_medium).to.eq("");
            expect(custom.utm_campaign).to.eq("");
            expect(custom.utm_term).to.eq("");
            expect(custom.utm_content).to.eq("");
        });
    });
    it("Checks if default utm tags works", () => {
        // adding other default tags
        cy.visit("../cypress/support/utm_1.html?utm_source=hehe&utm_medium=hehe&utm_campaign=hehe&utm_term=hehe&utm_content=hehe");
        cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((rq)=>{
            const queue = JSON.parse(rq)[0].user_details;
            const custom = JSON.parse(queue).custom;
            expect(custom.utm_source).to.eq("hehe");
            expect(custom.utm_medium).to.eq("hehe");
            expect(custom.utm_campaign).to.eq("hehe");
            expect(custom.utm_term).to.eq("hehe");
            expect(custom.utm_content).to.eq("hehe");
        });
    });
    it("Checks if a single custom utm tag works", () => {
        //  add custom utm tag utm_aa
        cy.visit("../cypress/support/utm_2.html?utm_aa=hehe");
        cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((rq)=>{
            const queue = JSON.parse(rq)[0].user_details;
            const custom = JSON.parse(queue).custom;
            expect(custom.utm_source).to.not.exist;
            expect(custom.utm_medium).to.not.exist;
            expect(custom.utm_campaign).to.not.exist;
            expect(custom.utm_term).to.not.exist;
            expect(custom.utm_content).to.not.exist;
            expect(custom.utm_aa).to.eq("hehe");
            expect(custom.utm_bb).to.eq("");
        });
    });
    it("Checks if custom utm tags works", () => {
        //  add custom utm tags utm_aa and utm_bb
        cy.visit("../cypress/support/utm_2.html?utm_aa=hehe&utm_bb=hoho");
        cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((rq)=>{
            const queue = JSON.parse(rq)[0].user_details;
            const custom = JSON.parse(queue).custom;
            expect(custom.utm_source).to.not.exist;
            expect(custom.utm_medium).to.not.exist;
            expect(custom.utm_campaign).to.not.exist;
            expect(custom.utm_term).to.not.exist;
            expect(custom.utm_content).to.not.exist;
            expect(custom.utm_aa).to.eq("hehe");
            expect(custom.utm_bb).to.eq("hoho");
        });
    });
});
