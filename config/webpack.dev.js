var path = require('path');

module.exports = {
    entry: {
        main: ["./src/js/dbhelper.js"]
    },
    mode: "development",
    output: {
        path: path.resolve(__dirname, '../build/js/'),
        filename: '[name]-bundle.js',
        publicPath: "/"
    },
    devServer: {
        contentBase: "./"
    },


}