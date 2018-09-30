const path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/index.tsx'),
    },
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, '../dest'),
        //publicPath: '',
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    optimization: {
        splitChunks: {
            maxInitialRequests: 10,
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    name: "vendors",
                    chunks: "all",
                    priority: 10,
                },
                react: {
                    test: /node_modules[\\/]react/,
                    name: "react",
                    chunks: "all",
                    priority: 30,
                },
                materialUI: {
                    test: /node_modules[\\/]@material-ui/,
                    name: "material-ui",
                    chunks: "all",
                    priority: 20,
                }
                // styles: {
                //     name: 'styles',
                //     test: /\.(scss|css)$/,
                //     chunks: 'all',
                //     minChunks: 1,
                //     reuseExistingChunk: true,
                //     enforce: true
                // }
            }
        },
    },
    devServer: {
        port: 9000,
        open: true,
        inline: true,
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
        })
    ],
    performance: {
        hints: false
    },
    devtool: 'cheap-module-source-map',
};