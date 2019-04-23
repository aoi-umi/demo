const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./webpack.config');
config.mode = 'production';
config.plugins = [
    new BundleAnalyzerPlugin(),
    ...config.plugins,
    new CleanWebpackPlugin(config.output.path, {
        root: path.resolve(__dirname, '../'),
    })
];
module.exports = config;