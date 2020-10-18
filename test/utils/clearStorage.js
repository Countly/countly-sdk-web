module.exports = function clearStorage(domain) {
    var fs = require('fs');
    var system = require('system');
    var myDomain = domain || "file://";
    var userName, localstoragePath, localStorageFilename;
    if (system.os.name === 'windows') {
        userName = system.env.USERPROFILE.split('\\')[2];
        localstoragePath = 'C:/Users/' + userName + '/AppData/Local/Ofi Labs/PhantomJS/';
        localStorageFilename = myDomain.replace('://', '_').replace('/', '') + '_0.localstorage';
    }
    else {
        userName = system.env.USER;
        if (system.os.name === 'mac') {
            localstoragePath = '/Users/' + userName + '/Library/Application Support/Ofi Labs/PhantomJS/';
        }
        else if (userName === "root") {
            localstoragePath = '/root/.local/share/Ofi Labs/PhantomJS/';
        }
        else {
            localstoragePath = '/home/' + userName + '/.local/share/Ofi Labs/PhantomJS/';
        }
        localStorageFilename = myDomain.replace('://', '_') + '_0.localstorage'; //Linux does not have the last "/" so no replace needed for that
    }

    if (fs.exists(localstoragePath + localStorageFilename)) {
        fs.remove(localstoragePath + localStorageFilename, function() {});
    }
};