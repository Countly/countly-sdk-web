const eventObj = {
    key: "buttonClick",
    "segmentation": {
        "id": "id"
    }
};

describe('Synchronous Countly initialization ', () => {
    it('Checks localStorage for correct initialization', () => {
        cy.visit("examples/example_sync.html");
        cy.check_begin_session();
    });
    it('Checks if event button works', () => {
        cy.get('input').click();
        cy.check_event(eventObj);
    });
});

