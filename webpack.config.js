var path = require('path');

module.exports = {
    entry: './lib/countly.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'countly.pack.js',
        library: 'Countly',
        libraryTarget: 'umd'
    }
};

