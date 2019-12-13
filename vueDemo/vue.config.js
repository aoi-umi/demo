const path = require('path');

const { MyPugin } = require('./dynamic-import-cdn-pugin');
let env = process.env;

let cdnOpt = {
    'video.js': {
        moduleName: 'VideoJs',
        url: 'https://unpkg.com/video.js@7.6.6/dist/video.cjs.js'
    }
};
let plugins = [
    new MyPugin(cdnOpt),
];
if (env.report) {
    let { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    plugins.push(new BundleAnalyzerPlugin());
}

let link = [
    "https://unpkg.com/iview@3.5.4/dist/styles/iview.css"
];
let script = [
    "https://unpkg.com/vue@2.6.10/dist/vue.js",
    "https://unpkg.com/vue-router@3.0.2/dist/vue-router.min.js",
    "https://unpkg.com/vuex@3.1.0/dist/vuex.min.js",
    "https://unpkg.com/axios@0.19.0/dist/axios.min.js",
    "https://unpkg.com/iview@3.5.4/dist/iview.js",
];
module.exports = {
    productionSourceMap: false,
    pages: {
        index: {
            // entry for the page
            entry: 'src/main.ts',
            link,
            script,
        }
    },
    configureWebpack: {
        plugins,
        externals: [{
            'vue': 'Vue',
            'vue-router': 'VueRouter',
            'vuex': 'Vuex',
            'axios': 'axios',
            iview: 'iview',
        },
        ],
        module: {
            rules: []
        },
    },
};