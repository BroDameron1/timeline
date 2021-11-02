const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, 'public/js/editSource.js')
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: '[name].bundle.js'
    },
    devtool: 'cheap-module-source-map' //this needs to be added so eval() isn't used in source mapping which triggers the CSP.
}