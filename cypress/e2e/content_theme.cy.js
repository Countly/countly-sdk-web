/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable require-jsdoc */
var Countly = require("../../lib/countly");
var hp = require("../support/helper");

var npsWidget = { _id: "nps-widget", type: "nps" };
var defaultContentPage = "https://your.domain.count.ly/_external/content?id=1#top";
var contentPage = defaultContentPage;
var originalMatchMedia = window.matchMedia;

function init(config) {
    Countly.init(Object.assign({
        app_key: "YOUR_APP_KEY",
        url: "https://your.domain.count.ly",
        device_id: "theme tester",
        test_mode_eq: true,
        debug: true,
        fake_request_handler: (req) => {
            if (req.params && req.params.method === "queue") {
                return { status: 200, responseText: JSON.stringify({ html: contentPage, geo: { l: { x: 0, y: 0, w: 100, h: 100 }, p: { x: 0, y: 0, w: 100, h: 100 } } }) };
            }
            if (req.url.indexOf("/o/feedback/widget") !== -1) {
                return { status: 200, responseText: JSON.stringify({ _id: "legacy123" }) };
            }
            return { status: 200, responseText: "{\"result\":\"Success\"}" };
        }
    }, config || {}));
}

// what the browser answers for prefers-color-scheme: "dark", "light", or null for no preference
function browserPrefers(scheme) {
    window.matchMedia = (query) => ({
        matches: scheme !== null && query.indexOf("prefers-color-scheme: " + scheme) !== -1,
        media: query,
        addListener() { },
        removeListener() { },
        addEventListener() { },
        removeEventListener() { }
    });
}

// the color-scheme the page itself declares on its root element
function pageDeclares(colorScheme) {
    document.documentElement.style.colorScheme = colorScheme;
}

// the color-scheme the page declares in its color-scheme meta tag, null for no tag
function pageMetaDeclares(colorScheme) {
    var meta = document.querySelector("meta[name='color-scheme']");
    if (colorScheme === null) {
        if (meta) {
            meta.remove();
        }
        return;
    }
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "color-scheme";
        document.head.appendChild(meta);
    }
    meta.content = colorScheme;
}

// the th parameter of a URL as the content and widget pages read it, null when there is none
function themeOf(url) {
    return new URL(url).searchParams.get("th");
}

// the theme a feedback widget the SDK opens now is given
function widgetTheme() {
    Countly.present_feedback_widget(npsWidget);
    return themeOf(document.getElementById("countly-surveys-iframe").getAttribute("src"));
}

describe("Theme for content and feedback widgets", () => {
    afterEach(() => {
        window.matchMedia = originalMatchMedia;
        contentPage = defaultContentPage;
        pageDeclares("");
        pageMetaDeclares(null);
        document.querySelectorAll("#cly-content-iframe, .countly-surveys-wrapper, #csbg, .countly-iframe-wrapper, [id^='countly-feedback-sticker']").forEach((node) => node.remove());
    });

    it("tells the widgets and the content the SDK opens the theme given at init", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("light");
            init({ content_theme: "dark" });
            expect(widgetTheme(), "feedback widget").to.equal("d");
            Countly.presentRatingWidgetWithID("legacy123");
            expect(themeOf(document.getElementById("countly-feedback-iframe").getAttribute("src")), "rating popup").to.equal("d");
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                var src = new URL(document.getElementById("cly-content-iframe").getAttribute("src"));
                expect(src.searchParams.get("th"), "content").to.equal("d");
                expect(src.searchParams.get("id")).to.equal("1");
                expect(src.hash, "the content page's own fragment stays last").to.equal("#top");
            });
        });
    });

    it("starts the query of a content page URL that has none", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("dark");
            contentPage = "https://your.domain.count.ly/_external/content#top";
            init();
            Countly.content.enterContentZone();
            cy.wait(5500).then(() => {
                expect(document.getElementById("cly-content-iframe").getAttribute("src")).to.equal("https://your.domain.count.ly/_external/content?th=d#top");
            });
        });
    });

    it("follows Countly.content.setTheme, where null goes back to the page's own theme", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("light");
            init({ content_theme: "dark" });
            expect(widgetTheme()).to.equal("d");
            Countly.content.setTheme(null);
            expect(widgetTheme()).to.equal("l");
            Countly.content.setTheme("dark");
            expect(widgetTheme()).to.equal("d");
        });
    });

    it("takes the color-scheme the page declares before the browser setting, unless the page declares both", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("dark");
            init();
            pageDeclares("light");
            expect(widgetTheme(), "light declared").to.equal("l");
            pageDeclares("only light");
            expect(widgetTheme(), "only light declared").to.equal("l");
            pageDeclares("light dark");
            expect(widgetTheme(), "both declared, the browser decides").to.equal("d");
        });
    });

    it("takes the color-scheme meta tag of a page whose CSS declares none", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("light");
            init();
            pageMetaDeclares("dark");
            expect(widgetTheme(), "dark in the meta tag").to.equal("d");
            pageMetaDeclares("light, dark");
            expect(widgetTheme(), "both in the meta tag with a comma, the browser decides").to.equal("l");
            browserPrefers("dark");
            pageMetaDeclares("light dark");
            expect(widgetTheme(), "both in the meta tag, the browser decides").to.equal("d");
            pageMetaDeclares("dark");
            pageDeclares("light");
            expect(widgetTheme(), "the CSS color-scheme comes before the meta tag").to.equal("l");
        });
    });

    it("falls back to the browser setting", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("dark");
            init();
            expect(widgetTheme()).to.equal("d");
            browserPrefers("light");
            expect(widgetTheme()).to.equal("l");
        });
    });

    it("sends no theme at all once it is turned off with false, until it is set again", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("dark");
            pageDeclares("dark");
            init({ content_theme: false });
            expect(widgetTheme(), "turned off at init").to.equal(null);
            Countly.presentRatingWidgetWithID("legacy123");
            expect(themeOf(document.getElementById("countly-feedback-iframe").getAttribute("src")), "rating popup").to.equal(null);
            Countly.content.setTheme("light");
            expect(widgetTheme()).to.equal("l");
            Countly.content.setTheme(false);
            expect(widgetTheme(), "turned off again").to.equal(null);
            Countly.content.setTheme(null);
            expect(widgetTheme(), "back to the page's theme").to.equal("d");
        });
    });

    it("sends no theme when none is known", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers(null);
            init();
            expect(widgetTheme()).to.equal(null);
            expect(document.getElementById("countly-surveys-iframe").getAttribute("src")).to.not.contain("th=");
        });
    });

    it("ignores a theme it does not know and keeps the one it had", () => {
        hp.haltAndClearStorage(() => {
            browserPrefers("light");
            init({ content_theme: "blue" });
            expect(widgetTheme(), "an unknown theme at init leaves the page's own").to.equal("l");
            Countly.content.setTheme("dark");
            Countly.content.setTheme("purple");
            expect(widgetTheme()).to.equal("d");
        });
    });
});
