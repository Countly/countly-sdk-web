/* eslint-disable no-unused-vars */

/**
 *  Extracts the query from url and returns an object with config values
 * @param {string} query - url query
 * @returns {Object} config object
 */
function queryExtractor(query) {
    // split the values
    var returnVal = {};
    if (query) {
        var parts = query.substring(1).split("&");
        for (var i = 0; i < parts.length; i++) {
            var conf = parts[i].split("=");
            returnVal[conf[0]] = conf[1];
        }
    }
    return returnVal;
}

/**
 * Sets a value to local storage and triggers a storage event
 * @param {*} key - storage key
 * @param {*} value - storage value
 */
function triggerStorageChange(key, value) {
    localStorage.setItem(key, value);
    const storageEvent = new StorageEvent("storage", {
        key: key,
        newValue: value
    });

    window.dispatchEvent(storageEvent);
}

export { queryExtractor, triggerStorageChange };