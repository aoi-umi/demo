const path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');
let config = {
    entry: {
        main: path.resolve(__dirname, '../src/index.tsx'),
    },
    output: {
        filename: 'js/[name]-[chunkhash].bundle.js',
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
        }, {
            test: /\.js$/,
            include: [
                ...[
                    'enum-ts', 'node-forge',
                    'query-string', 'strict-uri-encode'
                ].map(node_modules => {
                    return path.resolve(__dirname, "../node_modules/" + node_modules);
                }),
            ],
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['babel-preset-env']
                }
            }
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
        disableHostCheck: true,
        host: '0.0.0.0',
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

config.devServer.public = 'localhost:' + config.devServer.port;
module.exports = config;