/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var Utils = require("../support/sdk-modules/Utils.js");
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
                cy.fetch_local_request_queue().then((queue) => {
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

    it("sends the device ID of an upload as it is, whatever characters it holds", () => {
        var uploads = [];
        cy.intercept("https://your.domain.count.ly/**", (req) => {
            var body = typeof req.body === "string" ? req.body : new TextDecoder("latin1").decode(req.body);
            if (body.indexOf("user_details[picture]") !== -1) {
                uploads.push(body);
            }
            req.reply({ statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", device_id: "john+test@mail.com&x 100%", debug: true });
            const binary = Cypress.Blob.base64StringToBlob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "image/png");
            binary.name = "avatar.png";
            Countly.uploadUserProfilePicture(binary);
            cy.wait(3000).then(() => {
                expect(uploads.length, "the upload reached the server").to.equal(1);
                var field = /name="device_id"\r\n\r\n([^\r]*)\r\n/.exec(uploads[0]);
                expect(field && field[1]).to.equal("john+test@mail.com&x 100%");
            });
        });
    });

    it("uploads the picture's bytes unchanged", () => {
        var pictures = [];
        var append = FormData.prototype.append;
        cy.stub(FormData.prototype, "append").callsFake(function (name, value) {
            if (name === "user_details[picture]") {
                pictures.push(value);
            }
            return append.apply(this, arguments);
        });
        cy.intercept("https://your.domain.count.ly/**", (req) => {
            req.reply({ statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", debug: true });
            const binary = Cypress.Blob.base64StringToBlob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "image/png");
            binary.name = "avatar.png";
            Countly.uploadUserProfilePicture(binary);
            cy.wait(3000).then(() => {
                expect(pictures.length, "the picture went into an upload").to.equal(1);
                expect(pictures[0].type).to.equal("image/png");
                return Promise.all([pictures[0].arrayBuffer(), binary.arrayBuffer()]);
            }).then(([sent, original]) => {
                expect(Array.from(new Uint8Array(sent))).to.deep.equal(Array.from(new Uint8Array(original)));
            });
        });
    });

    it("signs an upload the way the server checks it when a salt is set", () => {
        var uploads = [];
        cy.intercept("https://your.domain.count.ly/**", (req) => {
            var body = typeof req.body === "string" ? req.body : new TextDecoder("latin1").decode(req.body);
            if (body.indexOf("user_details[picture]") !== -1) {
                uploads.push(body);
            }
            req.reply({ statusCode: 200, body: { result: "Success" } });
        });
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", device_id: "john+test@mail.com&x 100%", salt: "salt", debug: true });
            const binary = Cypress.Blob.base64StringToBlob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "image/png");
            binary.name = "avatar.png";
            Countly.uploadUserProfilePicture(binary);
            cy.wait(3000).then(() => {
                expect(uploads.length, "the upload reached the server").to.equal(1);
                // the server signs the form fields again in their order, as key=value pairs joined with "&"
                var fields = [];
                var fieldPattern = /name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g;
                var match = fieldPattern.exec(uploads[0]);
                while (match) {
                    fields.push(match);
                    match = fieldPattern.exec(uploads[0]);
                }
                var sent = fields.filter((f) => f[1] === "checksum256");
                expect(sent.length, "the upload carries a checksum").to.equal(1);
                var signed = fields.filter((f) => f[1] !== "checksum256").map((f) => f[1] + "=" + f[2]).join("&");
                return Utils.calculateChecksum(signed, "salt").then((expected) => {
                    expect(sent[0][2]).to.equal(expected);
                });
            });
        });
    });

    it("uploads nothing without users consent when consent is required", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", require_consent: true, test_mode: true, test_mode_eq: true, debug: true });
            const binary = Cypress.Blob.base64StringToBlob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "image/png");
            binary.name = "avatar.png";
            Countly.uploadUserProfilePicture(binary);
            cy.wait(500).then(() => {
                expect(Countly._internals.getLocalQueues().requestQ.filter((r) => r.imageData).length, "nothing without consent").to.equal(0);
                Countly.add_consent("users");
                Countly.uploadUserProfilePicture(binary);
                cy.wait(500).then(() => {
                    expect(Countly._internals.getLocalQueues().requestQ.filter((r) => r.imageData).length, "uploaded with consent").to.equal(1);
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
                cy.fetch_local_request_queue().then((queue) => {
                    const imgReq = queue.find(r => r.__imageUpload === true || r.imageData);
                    expect(imgReq).to.not.exist;
                });
            });
        });
    });
});
