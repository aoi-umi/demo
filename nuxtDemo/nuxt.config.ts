
import { Configuration } from '@nuxt/types';
const config: Configuration = {
  srcDir: 'src/',
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
  ],
  axios: {
    proxy: true,// 可以自动识别服务器的IP，避免提示跨域名
    withCredentials: true,     // 允许携带cookie
    timeout: 10000,
    prefix: '/api',
  },
  // env: {
  //   baseUrl: 'http://127.0.0.1:9999/',
  // },
  // // 代理服务器
  // proxyTable: {
  //   "/api": {
  //     target: "http://127.0.0.1:9999/",  // 前后端分离线上地址，必须写死不能动态配置。打包时要注意
  //     changeOrigin: true,// 如果接口跨域，需要进行这个参数配置
  //     pathRewrite: { "^/api": "/api" }
  //   }
  // },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },
  server: {
    port: 3010
  }
};
export default config;
