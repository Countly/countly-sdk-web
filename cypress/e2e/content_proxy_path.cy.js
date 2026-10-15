/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");
var utils = require("../support/sdk-modules/Utils.js");

// The Cypress test server (see cypress.config.js) answers /o/sdk/content with:
//   { html: "http://test/_external/content?id=111&uid=tester&app_id=222", geo: {...} }
// i.e. a full URL on a foreign origin/path, exactly like a server that doesn't know it is
// behind a reverse proxy. #displayContent must rebase it onto the SDK's configured url.

describe("Content proxy path rebasing", () => {
    afterEach(() => {
        cy.task("stopServer");
    });

    it("rebases the iframe src onto the SDK url and appends the encoded provided_url path", () => {
        hp.haltAndClearStorage(() => {
            cy.task("setResponseDelay", 0);
            cy.task("startServer");
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "http://localhost:9000/countly", // proxied: Countly reached under a /countly prefix
                debug: true
            });
            Countly.content.enterContentZone();
            // enterContentZone waits ~4s after init before firing the first request
            cy.wait(6000).then(() => {
                var iframe = document.getElementById("cly-content-iframe");
                expect(iframe, "content iframe should be created").to.exist;
                // server returned http://test/_external/content?...; rebased onto this.url with
                // provided_url appended (path only, encoded) so the content page's assets resolve;
                // the theme the SDK adds last follows the test browser's setting
                expect(iframe.getAttribute("src").replace(/&th=[dl]$/, "")).to.eq(
                    "http://localhost:9000/countly/_external/content?id=111&uid=tester&app_id=222&provided_url=%2Fcountly"
                );
            });
        });
    });
});

describe("parseUrlParts helper", () => {
    beforeEach(() => {
        hp.haltAndClearStorage(() => {
            Countly.init({ app_key: "YOUR_APP_KEY", url: "https://your.domain.count.ly", test_mode: true });
        });
    });

    it("splits an absolute URL into origin/path/query/hash", () => {
        var parts = Countly._internals.parseUrlParts("http://localhost:9000/reverse-proxy/countly/feedback/rating?a=1#frag");
        expect(parts.origin).to.eq("http://localhost:9000");
        expect(parts.pathname).to.eq("/reverse-proxy/countly/feedback/rating");
        expect(parts.search).to.eq("?a=1");
        expect(parts.hash).to.eq("#frag");
    });

    it("treats a scheme-less (relative) URL as an empty origin and a full path", () => {
        var parts = Countly._internals.parseUrlParts("/reverse-proxy/countly");
        expect(parts.origin).to.eq("");
        expect(parts.pathname).to.eq("/reverse-proxy/countly");
    });

    it("returns an empty path for an origin with no path", () => {
        var parts = Countly._internals.parseUrlParts("https://main.count.ly");
        expect(parts.origin).to.eq("https://main.count.ly");
        expect(parts.pathname).to.eq("");
    });

    it("is safe for non-string input", () => {
        var parts = Countly._internals.parseUrlParts(undefined);
        expect(parts).to.eql({ origin: "", pathname: "", search: "", hash: "" });
    });
});

describe("Content request size on an iPhone", () => {
    it("sends the visible area in CSS pixels and keeps the resolution metric in device pixels", () => {
        var savedPlatform = Object.getOwnPropertyDescriptor(navigator, "platform");
        var savedRatio = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
        Object.defineProperty(navigator, "platform", { configurable: true, get: () => "iPhone" });
        Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => 3 });
        var contentRequests = [];
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        contentRequests.push(req.params);
                    }
                    return { status: 200, responseText: "{}" };
                }
            });
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                var metricResolution = Countly._internals.getMetrics()._resolution;
                if (savedPlatform) {
                    Object.defineProperty(navigator, "platform", savedPlatform);
                }
                else {
                    delete navigator.platform;
                }
                if (savedRatio) {
                    Object.defineProperty(window, "devicePixelRatio", savedRatio);
                }
                else {
                    delete window.devicePixelRatio;
                }
                // the spec frame can have no layout size, in which case the SDK falls back to the screen size
                var visibleWidth = Math.min(window.innerWidth, document.documentElement.clientWidth) || screen.width;
                var visibleHeight = Math.min(window.innerHeight, document.documentElement.clientHeight) || screen.height;
                expect(contentRequests.length, "a content request was made").to.be.greaterThan(0);
                var sent = JSON.parse(contentRequests[0].resolution);
                expect(sent.p.w).to.equal(Math.min(visibleWidth, visibleHeight));
                expect(sent.p.h).to.equal(Math.max(visibleWidth, visibleHeight));
                expect(metricResolution).to.equal((screen.width * 3) + "x" + (screen.height * 3));
            });
        });
    });
});

describe("Content link safety", () => {
    it("allows web links, contact links, app deep links and relative links", () => {
        ["https://shop.example/sale", "http://shop.example", "  https://padded.example  ", "mailto:a@b.example", "tel:+123456", "sms:+123456", "myapp://open?id=42", "/relative/path", "//other.example/page"].forEach((link) => {
            expect(utils.isSafeActionUrl(link), link).to.equal(true);
        });
    });

    it("refuses links that would run script, load a document or reach the machine", () => {
        ["javascript:alert(1)", "JavaScript:alert(1)", " javascript:alert(1)", "java\tscript:alert(1)", "javascript://%0aalert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)", "file:///etc/passwd", "intent://scan/#Intent;scheme=zxing;end", "ms-msdt:id=x", "myapp:/\t/open", "", "   ", null, 42].forEach((link) => {
            expect(utils.isSafeActionUrl(link), String(link)).to.equal(false);
        });
    });

    it("opens a safe content link without access to this page and refuses an executable one", () => {
        hp.haltAndClearStorage(() => {
            Countly.init({
                app_key: "YOUR_APP_KEY",
                url: "https://your.domain.count.ly",
                debug: true,
                fake_request_handler: (req) => {
                    if (req.params && req.params.method === "queue") {
                        return { status: 200, responseText: JSON.stringify({ html: "https://your.domain.count.ly/_external/content?id=1", geo: { l: { x: 0, y: 0, w: 100, h: 100 }, p: { x: 0, y: 0, w: 100, h: 100 } } }) };
                    }
                    return { status: 200, responseText: "{\"result\":\"Success\"}" };
                }
            });
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                var iframe = document.getElementById("cly-content-iframe");
                expect(iframe, "content is shown").to.exist;
                var opened = [];
                cy.stub(window, "open").callsFake((url, target, features) => {
                    opened.push([url, target, features]);
                    return null;
                });
                var send = (link) => window.dispatchEvent(new MessageEvent("message", { data: { link: link }, origin: "https://your.domain.count.ly", source: iframe.contentWindow }));
                send("javascript:alert(document.domain)");
                send("https://shop.example/sale");
                expect(opened).to.deep.equal([["https://shop.example/sale", "_blank", "noopener"]]);
                Countly._internals.closeContent();
            });
        });
    });
});

describe("Content consent", () => {
    var contentAnswer = JSON.stringify({ html: "https://your.domain.count.ly/_external/content?id=1", geo: { l: { x: 0, y: 0, w: 100, h: 100 }, p: { x: 0, y: 0, w: 100, h: 100 } } });

    function initWithContent(onContentRequest) {
        Countly.init({
            app_key: "YOUR_APP_KEY",
            url: "https://your.domain.count.ly",
            debug: true,
            require_consent: true,
            fake_request_handler: (req) => {
                if (req.params && req.params.method === "queue") {
                    return onContentRequest(req);
                }
                return { status: 200, responseText: "{\"result\":\"Success\"}" };
            }
        });
    }

    it("fetches no content without content consent and enters the zone once it is given", () => {
        var contentRequests = 0;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                contentRequests++;
                return { status: 200, responseText: "{}" };
            });
            Countly.add_consent(["events", "views"]);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentRequests, "no content request without consent").to.equal(0);
                Countly.add_consent("content");
                cy.wait(1000).then(() => {
                    expect(contentRequests, "the remembered enter call runs once consent is given").to.be.greaterThan(0);
                });
            });
        });
    });

    it("closes the shown content and stops fetching when content consent is removed", () => {
        var contentRequests = 0;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                contentRequests++;
                return { status: 200, responseText: contentAnswer };
            });
            Countly.add_consent(["content"]);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(document.getElementById("cly-content-iframe"), "content is shown").to.exist;
                Countly.remove_consent("content");
                expect(document.getElementById("cly-content-iframe"), "content is closed").to.not.exist;
                var countAtRemoval = contentRequests;
                cy.wait(1500).then(() => {
                    expect(contentRequests).to.equal(countAtRemoval);
                });
            });
        });
    });

    it("does not enter the zone for the next user after a device ID change without merge", () => {
        var contentRequests = 0;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                contentRequests++;
                return { status: 200, responseText: "{}" };
            });
            Countly.add_consent(["content"]);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(contentRequests, "the zone was entered for the first user").to.be.greaterThan(0);
                Countly.change_id("next user", false);
                var countAtChange = contentRequests;
                Countly.add_consent("content");
                cy.wait(1500).then(() => {
                    expect(contentRequests, "the next user's consent does not enter the zone by itself").to.equal(countAtChange);
                });
            });
        });
    });

    it("does not enter the zone remembered before offline mode for the user who ends it", () => {
        var contentRequests = 0;
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                contentRequests++;
                return { status: 200, responseText: "{}" };
            });
            Countly.content.enterContentZone();
            Countly.enable_offline_mode();
            Countly.disable_offline_mode("next user");
            Countly.add_consent("content");
            cy.wait(5500).then(() => {
                expect(contentRequests).to.equal(0);
            });
        });
    });

    it("does not show content that arrives after content consent was removed", () => {
        hp.haltAndClearStorage(() => {
            initWithContent(() => {
                Countly.remove_consent("content");
                return { status: 200, responseText: contentAnswer };
            });
            Countly.add_consent(["content"]);
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(document.getElementById("cly-content-iframe")).to.not.exist;
            });
        });
    });
});
