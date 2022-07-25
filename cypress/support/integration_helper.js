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
