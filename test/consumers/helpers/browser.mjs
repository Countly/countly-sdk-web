// A real Chrome, driven by playwright-core: the installed Google Chrome, or the browser CHROME_PATH names.
import { chromium } from "playwright-core";
import { waitFor } from "./project.mjs";

let browser = null;

/**
 * Start the browser the pages run in.
 * @returns {Promise<Object>} the browser
 */
export async function startBrowser() {
    const options = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" };
    try {
        browser = await chromium.launch(Object.assign({ headless: true }, options));
    }
    catch (error) {
        throw new Error("Google Chrome could not be started. Install it, or set CHROME_PATH to a Chromium-based browser. " + error.message);
    }
    return browser;
}

/**
 * Close the browser.
 */
export async function stopBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

/**
 * Open a page and wait until it sets window.__countlyResult, collecting what the page reported as errors.
 * A page that reloads itself (as a dev server does after optimizing dependencies) is waited for again.
 * @param {string} url - the page
 * @param {Object} [options] - timeout in ms
 * @returns {Promise<Object>} result: the page's value, errors: the page's uncaught errors and console errors
 */
export async function visit(url, options) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
        if (message.type() === "error") {
            errors.push(message.text());
        }
    });
    try {
        await page.goto(url, { waitUntil: "load" });
        const result = await waitFor(() => page.evaluate(() => (window.__countlyResult ? JSON.stringify(window.__countlyResult) : null)), (options && options.timeout) || 20000, "the page at " + url + " to report a result");
        return { result: JSON.parse(result), errors };
    }
    finally {
        await page.close();
    }
}

/**
 * Open a page and return its HTML as the server sent it, before any script ran.
 * @param {string} url - the page
 * @returns {Promise<string>} the HTML
 */
export async function serverHtml(url) {
    const response = await fetch(url);
    return response.text();
}
