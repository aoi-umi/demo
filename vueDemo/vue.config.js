let env = process.env;
let plugins = [];
if (env.report) {
    let { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    plugins.push(new BundleAnalyzerPlugin());
}
module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        plugins,
        externals: {
            'vue': 'Vue',
            'vue-router': 'VueRouter',
            'vuex': 'Vuex',
            'axios': 'axios',
            iview: 'iview'
        }
    },
};