const isBrowser = typeof window !== "undefined";
let Countly = globalThis.Countly || {};
export { isBrowser, Countly };