/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

function initMain() {
    Countly.init({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        test_mode: true,
        test_mode_eq: true,
        debug: true
    });
}

describe("Upload user profile picture", () => {
    it("queues an image upload request when given a File-like object (Blob)", () => {
        hp.haltAndClearStorage(() => {
            initMain();

            // red dot PNG
            const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";
            const binary = Cypress.Blob.base64StringToBlob(base64Png, 'image/png');
            binary.name = "avatar.png";
            Countly.uploadUserProfilePicture(binary);

            cy.wait(500).then(() => {
                cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((val) => {
                    expect(val).to.be.ok;
                    const queue = JSON.parse(val);
                    expect(queue.length).to.be.greaterThan(0);

                    const imgReq = queue.find(r => r.__imageUpload === true || r.imageData);
                    expect(imgReq).to.be.ok;
                    expect(imgReq.imageName).to.be.oneOf(["avatar.png", "avatar"]);
                    expect(imgReq.imageType).to.equal('image/png');
                    expect(imgReq.imageData).to.be.a('string').and.to.have.length.greaterThan(0);

                    expect(imgReq.user_details).to.be.a('string');
                    const ud = JSON.parse(imgReq.user_details);
                    expect(ud).to.be.an('object');
                });
            });
        });
    });

    it("rejects non-image files and does not queue requests", () => {
        hp.haltAndClearStorage(() => {
            initMain();

            const txtBlob = new Blob(["hello world"], { type: 'text/plain' });
            txtBlob.name = "test.txt";
            Countly.uploadUserProfilePicture(txtBlob);

            cy.wait(300).then(() => {
                cy.getLocalStorage("YOUR_APP_KEY/cly_queue").then((val) => {
                    if (!val) {
                        expect(val).to.be.not.ok;
                        return;
                    }
                    const queue = JSON.parse(val || '[]');
                    const imgReq = queue.find(r => r.__imageUpload === true || r.imageData);
                    expect(imgReq).to.not.exist;
                });
            });
        });
    });
});
