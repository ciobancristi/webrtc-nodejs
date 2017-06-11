var webpack = require('webpack');
var path = require('path');

module.exports = function (env) {
    return {
        entry: {
            main: './index.js',
            vendor: ''
        },
        output: {
            filename: '',
            path: path.resolve(__dirname, 'public')
        }
    }
}
