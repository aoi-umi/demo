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
            //默认参数
            defaultArgs: {
                host: 'http://localhost:3010',
                username: '',
            },
            test: {
                url: '/',
                isUseDefault: true,//default true
                method: 'post',//default post
            },
            test1: {
                url: '/',
                isUseDefault: false,
                method: 'get',
                args: {
                    host: 'http://localhost:3010',
                    username: 'user1',
                }
            },
            test2: {
                url: '1',
                method: 'get'
            },
        }
    }
};