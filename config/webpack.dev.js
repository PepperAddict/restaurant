var path = require('path');

module.exports = {
    entry: {
        main: ["./src/js/index.js"]
    },
    mode: "development",
    output: {
        filename: '[name]-bundle.js',
        path: path.resolve(__dirname, '../build/js/'),
        publicPath: "../build"
    },
    devServer: {
        contentBase: "./",
        overlay: true,
    },

    module: {
        rules: [{
                test: /\.css$/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }

                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].html"
                        },
                        
                    },
                    {
                        loader: "extract-loader"
                    },
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    }

}