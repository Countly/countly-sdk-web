module.exports = function clearStorage(domain) {
    var fs = require('fs');
    var system = require('system');
    var myDomain = domain || "file://";
    
    if(system.os.name === 'windows') {
        var userName = system.env['USERPROFILE'].split('\\')[2];
        var localstoragePath = 'C:/Users/' + userName + '/AppData/Local/Ofi Labs/PhantomJS/';
        var localStorageFilename = myDomain.replace('://', '_').replace('/', '') + '_0.localstorage';
    } else {
        var userName = system.env['USER'];
        if(system.os.name === 'mac') {
            var localstoragePath = '/Users/' + userName + '/Library/Application Support/Ofi Labs/PhantomJS/';
        }
        else if(userName === "root"){
            var localstoragePath = '/root/.local/share/Ofi Labs/PhantomJS/';
        }
        else{
            var localstoragePath = '/home/' + userName + '/.local/share/Ofi Labs/PhantomJS/';
        }
        var localStorageFilename = myDomain.replace('://', '_') + '_0.localstorage'; //Linux does not have the last "/" so no replace needed for that
    }
    
    if(fs.exists(localstoragePath + localStorageFilename)) {
        fs.remove(localstoragePath + localStorageFilename, function(err) {
            if (err) {
                casper.echo(err);
            }
            casper.echo("File deleted successfully!");
        });
    }
}