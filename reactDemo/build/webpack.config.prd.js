const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./webpack.config');
config.mode = 'production';
config.plugins = [
    ...config.plugins,
    new CleanWebpackPlugin(config.output.path, {
        root: path.resolve(__dirname, '../'),
    })
];
module.exports = config;