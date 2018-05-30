const path = require('path');

module.exports = {
    entry: './lib/countly.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'countly.min.js',
        library : 'Countly',
        libraryTarget : 'umd'
    }
};

