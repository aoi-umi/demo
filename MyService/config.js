/**
 * Created by umi on 2017-5-29.
 */
module.exports = {
    name: 'MyService',
    port: 3010,
    deploy: '20170529',
    version: '0.0.1',
    env: '_dev',
    api: {
        testService: {
            host: 'http://localhost:3010',
            test: {
                url: '/',
                isUseHost: true,//default true
                method: 'post',//default post
            },
            test1: {
                url: 'http://localhost:3010',
                isUseHost: false,
                method: 'get'
            },
            test2: {
                url: 'http://localhost:3010',
                isUseHost: true,
                method: 'get'
            },
        }
    }
};