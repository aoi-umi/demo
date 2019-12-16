
const { DynamicImportCdnFactoryPlugin } = require('./dynamic-import-cdn-pugin');
let env = process.env;

let cdnOpt = {
    js: {
        vue: {
            moduleName: 'Vue',
            url: 'https://unpkg.com/vue@2.6.10/dist/vue.min.js'
        },
        'vue-router': {
            moduleName: 'VueRouter',
            url: 'https://unpkg.com/vue-router@3.0.2/dist/vue-router.min.js',
        },
        vuex: {
            moduleName: 'Vuex',
            url: 'https://unpkg.com/vuex@3.1.0/dist/vuex.min.js'
        },
        axios: {
            moduleName: 'axios',
            url: 'https://unpkg.com/axios@0.19.0/dist/axios.min.js'
        },
        iview: {
            moduleName: 'iview',
            url: 'https://unpkg.com/iview@3.5.4/dist/iview.min.js',
        },

        'video.js': {
            moduleName: 'videojs',
            url: 'https://unpkg.com/video.js@7.6.6/dist/video.min.js'
        },
        quill: {
            moduleName: 'Quill',
            url: 'https://unpkg.com/quill@1.3.7/dist/quill.min.js'
        }
    }
};
let plugins = [
    new DynamicImportCdnFactoryPlugin(cdnOpt),
];
if (env.report) {
    let { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    plugins.push(new BundleAnalyzerPlugin());
}

let link = [
    "https://unpkg.com/iview@3.5.4/dist/styles/iview.css"
];
module.exports = {
    productionSourceMap: false,
    pages: {
        index: {
            // entry for the page
            entry: 'src/main.ts',
            link,
        }
    },
    configureWebpack: {
        plugins,
        externals: [],
        module: {
            rules: []
        },
    },
};