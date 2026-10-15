/* eslint-disable no-restricted-globals */
/**
 * Example: adding Countly web push to a service worker you already have.
 *
 * By default the SDK registers countly_sw.js under its own scope, countly-push/ next to the file. Do
 * this only to run a single worker, and only if no other push provider subscribes through yours.
 *
 * On the page, hand the SDK your registration so it does not try to register countly_sw.js:
 *
 *   navigator.serviceWorker.register("/sw.js").then(function (registration) {
 *       Countly.init({
 *           app_key: "YOUR_APP_KEY",
 *           url: "https://your.server.ly",
 *           push_vapid_public_key: "YOUR_VAPID_PUBLIC_KEY",
 *           push_service_worker_registration: registration
 *       });
 *   });
 *
 * and call Countly.enable_push_notifications() from a click handler, as usual.
 */

// Optional: keep full control of your worker's install/activate. Without this line Countly's
// import adds skipWaiting() on install and clients.claim() on activate, which most sites want anyway.
self.COUNTLY_PUSH_LIFECYCLE = false;

// Optional, while debugging: log every push, click and close in the worker console and forward the
// lines to the open pages (they show up as "[SW]" in the SDK's console output). Errors and refused
// URLs are logged even without this.
// self.COUNTLY_PUSH_DEBUG = true;

// Only if your pages run the SDK with storage: "none": keep Countly's data out of IndexedDB. A click
// made while your site is closed is then lost if the browser stops the worker before it is recorded.
// self.COUNTLY_PUSH_PERSIST = false;

// Import a copy of countly_sw.js that your own site serves, taken from the SDK version your pages run
// (node_modules/countly-sdk-web/lib/countly_sw.js), and replace it whenever you upgrade the SDK. Any
// name works: one without "countly" or "push" stays clear of ad blocker rules, which also block other
// push providers' worker files, and a new name per version makes browsers fetch the new copy at once.
importScripts("/js/sw-addon-26.8.0.js");

// Or import it from a CDN, pinned to the version you tested with: a floating tag would change your
// users' worker without a deploy, and visitors whose ad blocker blocks the CDN get no push from you.
// importScripts("https://cdn.jsdelivr.net/npm/countly-sdk-web@26.8.0/lib/countly_sw.js");

// ...your own handlers follow. They run alongside Countly's; a `push` without Countly's payload
// or a click on a notification you showed is ignored by the imported handlers.
self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    var payload = event.data ? event.data.json() : {};
    if (payload.c && payload.c.i) {
        return; // Countly's, already handled by the imported worker
    }
    event.waitUntil(self.registration.showNotification(payload.title || "Hello", { body: payload.body || "" }));
});
