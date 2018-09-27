const config = require('./webpack.config');
config.mode = 'development';
config.devtool = 'cheap-module-eval-source-map';


module.exports = config;