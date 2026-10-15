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

// a container of its own per test, so the submit listeners of earlier tests never fire again
function formIn(html) {
    var container = document.createElement("div");
    container.innerHTML = "<form id='checkout' action='/buy' method='post'>" + html + "</form>";
    document.body.appendChild(container);
    return container;
}

function submit(container) {
    var form = container.querySelector("form");
    // Firefox still submits a form for a dispatched submit event, which would unload the test page
    form.addEventListener("submit", (event) => event.preventDefault());
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function formSubmitSegmentation() {
    var events = Countly._internals.getLocalQueues().eventQ.filter((e) => e.key === "formSubmit");
    expect(events.length, "a form submit was recorded").to.be.greaterThan(0);
    return events[events.length - 1].segmentation;
}

function collectedUserDetails() {
    var requests = Countly._internals.getLocalQueues().requestQ.filter((r) => r.user_details);
    expect(requests.length, "user details were collected").to.be.greaterThan(0);
    return JSON.parse(requests[requests.length - 1].user_details);
}

describe("Form tracking", () => {
    it("keeps ordinary fields", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<input name='city' value='Berlin'><select name='size'><option value='m' selected>M</option></select><textarea name='note'>leave at the door</textarea>");
            Countly.track_forms(container);
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(segmentation["input:city"]).to.equal("Berlin");
            expect(segmentation["input:size"]).to.equal("m");
            expect(segmentation["input:note"]).to.equal("leave at the door");
            container.remove();
        });
    });

    it("records only that the form was sent when field values are turned off", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                test_mode: true,
                test_mode_eq: true,
                debug: true,
                track_form_values: false
            });
            var container = formIn("<input name='city' value='Berlin'><select name='size'><option value='m' selected>M</option></select><textarea name='note'>leave at the door</textarea>");
            Countly.track_forms(container);
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(Object.keys(segmentation).filter((key) => key.indexOf("input:") === 0)).to.deep.equal([]);
            expect(segmentation.id).to.equal("checkout");
            expect(segmentation.action).to.equal("/buy");
            container.remove();
        });
    });

    it("never reads a password, also one the visitor revealed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<input id='secret-field' type='password' value='hunter2'><input name='login' autocomplete='current-password' value='hunter3'>");
            Countly.track_forms(container);
            container.querySelector("#secret-field").type = "text";
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(JSON.stringify(segmentation)).to.not.contain("hunter");
            container.remove();
        });
    });

    it("never reads a password field added later and revealed afterwards", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<input name='city' value='Berlin'>");
            Countly.track_forms(container);
            var field = document.createElement("input");
            field.type = "password";
            field.name = "field_7";
            field.value = "hunter4";
            container.querySelector("form").appendChild(field);
            // the reveal happens in a later task than the insertion, as a click on a show-password button would
            cy.wait(50).then(() => {
                field.type = "text";
                cy.wait(50).then(() => {
                    submit(container);
                    var segmentation = formSubmitSegmentation();
                    expect(JSON.stringify(segmentation)).to.not.contain("hunter");
                    expect(segmentation["input:city"]).to.equal("Berlin");
                    container.remove();
                });
            });
        });
    });

    it("never reads card fields, one-time codes or values that look like a card number", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<input name='a' autocomplete='cc-number' value='4111111111111111'>"
                + "<input name='b' autocomplete='cc-csc' value='737' class='cly_form_allow'>"
                + "<input name='c' autocomplete='one-time-code' value='908172'>"
                + "<input name='free' value='my card 4242 4242 4242 4242 thanks'>"
                + "<input name='order' value='1234567890123'>");
            Countly.track_forms(container);
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(JSON.stringify(segmentation)).to.not.contain("4111");
            expect(JSON.stringify(segmentation)).to.not.contain("737");
            expect(JSON.stringify(segmentation)).to.not.contain("908172");
            expect(JSON.stringify(segmentation)).to.not.contain("4242");
            expect(segmentation["input:order"], "a long number that fails the card check is kept").to.equal("1234567890123");
            container.remove();
        });
    });

    it("skips sensitive field names and SSN-like values unless the field is allowed", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<input name='iban' value='DE89370400440532013000'>"
                + "<input name='card_cvv' value='999'>"
                + "<input name='taxNumber' value='12/345/67890'>"
                + "<input name='reference' value='321-54-9876'>"
                + "<input name='zip' value='12345-6789'>"
                + "<input name='pin_code' value='560001' class='cly_form_allow'>"
                + "<input name='business_name' value='Acme'>"
                + "<label for='field-3'>Passport number</label><input id='field-3' name='field_3' value='X1234567'>");
            Countly.track_forms(container);
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(segmentation, "a sensitive label is enough").to.not.have.property("input:field_3");
            expect(segmentation).to.not.have.property("input:iban");
            expect(segmentation).to.not.have.property("input:card_cvv");
            expect(segmentation).to.not.have.property("input:taxNumber");
            expect(segmentation, "an SSN-shaped value is skipped in any field").to.not.have.property("input:reference");
            expect(segmentation["input:zip"], "a ZIP+4 code is no SSN").to.equal("12345-6789");
            expect(segmentation["input:pin_code"], "an allowed field is read").to.equal("560001");
            expect(segmentation["input:business_name"], "ssn inside a longer word is no sensitive name").to.equal("Acme");
            container.remove();
        });
    });

    it("honours cly_user_ignore on a container of fields", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            var container = formIn("<fieldset class='cly_user_ignore'><input name='street' value='Main St 1'></fieldset><input name='city' value='Berlin'>");
            Countly.track_forms(container);
            submit(container);
            var segmentation = formSubmitSegmentation();
            expect(segmentation).to.not.have.property("input:street");
            expect(segmentation["input:city"]).to.equal("Berlin");
            container.remove();
        });
    });
});

describe("Collecting user details from forms", () => {
    it("takes the phone only from phone fields with phone-shaped values", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(hp.sWait2).then(() => {
                var container = formIn("<input name='card_number' value='4111 1111 1111 1111'>"
                    + "<input name='pin_number' value='1234'>"
                    + "<input name='order_number' value='5550123'>"
                    + "<input name='hotel_name' value='Grand'>"
                    + "<input type='tel' name='contact' value='+49 1511 2345678'>");
                Countly.collect_from_forms(container);
                submit(container);
                var details = collectedUserDetails();
                expect(details.phone, "an international number passing the card checksum is still a phone").to.equal("+49 1511 2345678");
                expect(JSON.stringify(details)).to.not.contain("4111");
                expect(JSON.stringify(details)).to.not.contain("1234\"");
                container.remove();
            });
        });
    });

    it("skips hidden fields unless they are mapped, and passwords even when mapped", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(hp.sWait2).then(() => {
                var container = formIn("<input type='hidden' name='email' value='hidden@example.com'>"
                    + "<input type='hidden' name='company_ref' value='Acme' class='cly_user_organization'>"
                    + "<input type='password' name='pass' value='hunter2' class='cly_user_password'>"
                    + "<input name='username' value='jdoe'>");
                Countly.collect_from_forms(container);
                submit(container);
                var details = collectedUserDetails();
                expect(details.email).to.equal(undefined);
                expect(details.organization, "a mapped hidden field is read").to.equal("Acme");
                expect(JSON.stringify(details)).to.not.contain("hunter");
                expect(details.username).to.equal("jdoe");
                container.remove();
            });
        });
    });

    it("takes an email from a value only when the whole input is one address", () => {
        hp.haltAndClearStorage(() => {
            initMain();
            cy.wait(hp.sWait2).then(() => {
                var container = formIn("<textarea name='message'>write to me at me@example.com please</textarea>"
                    + "<input name='contact_value' value='real@example.com'>");
                Countly.collect_from_forms(container);
                submit(container);
                var details = collectedUserDetails();
                expect(details.email).to.equal("real@example.com");
                container.remove();
            });
        });
    });
});
