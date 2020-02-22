
const { DynamicImportCdnPlugin } = require('webpack-dynamic-import-cdn-plugin');
let env = process.env;
let isProd = env.NODE_ENV === 'production';
function getCdn(host, cfg) {
    let rs = {};
    for (let key in cfg) {
        rs[key] = host + cfg[key];
    }
    return rs;
}
let cdnOpt = {
    css: {
        'iview/dist/styles/iview.css': 'https://unpkg.com/iview@3.5.4/dist/styles/iview.css',
        'video.js/dist/video-js.min.css': 'https://unpkg.com/video.js@7.6.6/dist/video-js.min.css',
        ...getCdn('https://unpkg.com/quill@1.3.7/dist/', {
            'quill/dist/quill.core.css': 'quill.core.css',
            'quill/dist/quill.snow.css': 'quill.snow.css',
            'quill/dist/quill.bubble.css': 'quill.bubble.css',
        }),
    },
    js: {
        vue: {
            moduleName: 'Vue',
            url: 'https://unpkg.com/vue@2.6.10/dist/vue.min.js',
        },
        'vue-router': {
            moduleName: 'VueRouter',
            url: 'https://unpkg.com/vue-router@3.0.2/dist/vue-router.min.js',
        },
        vuex: {
            moduleName: 'Vuex',
            url: 'https://unpkg.com/vuex@3.1.0/dist/vuex.min.js',
        },
        'vue-lazyload': {
            moduleName: 'VueLazyload',
            url: 'https://unpkg.com/vue-lazyload@1.3.3/vue-lazyload.js',
        },
        axios: {
            moduleName: 'axios',
            url: 'https://unpkg.com/axios@0.19.0/dist/axios.min.js',
        },
        iview: {
            moduleName: 'iview',
            url: 'https://unpkg.com/iview@3.5.4/dist/iview.min.js',
        },

        'video.js': {
            moduleName: 'videojs',
            url: 'https://unpkg.com/video.js@7.6.6/dist/video.min.js',
        },
        quill: {
            moduleName: 'Quill',
            url: 'https://unpkg.com/quill@1.3.7/dist/quill.min.js',
        },
        echarts: {
            moduleName: 'echarts',
            url: 'https://unpkg.com/echarts@4.5.0/dist/echarts.min.js',
        },
    }
};
let plugins = [
    new DynamicImportCdnPlugin(cdnOpt),
];
if (env.report) {
    let { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
    productionSourceMap: false,
    pages: {
        index: {
            // entry for the page
            entry: 'src/main.ts',
        }
    },
    configureWebpack: {
        plugins,
        externals: [],
        module: {
            rules: []
        },
    },
    css: {
        extract: !isProd ? false : {
            ignoreOrder: true
        },
    }
};