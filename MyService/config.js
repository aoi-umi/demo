/**
 * Created by umi on 2017-5-29.
 */
module.exports = {
    name: 'MyService',
    port: 3010,
    deploy: '20170529',
    version: '0.0.2',
    env: '_dev',
    errorDir: __dirname + '/error',
    api: {
        testService: {
            //默认参数
            defaultArgs: {
                host: 'http://localhost:3010',
                username: '',
            },
            test: {
                url: '/',
                //isUseDefault: true,//default true
                //method: 'post',//default post
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
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
    datebase: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'myweb',
    },
    cachePrefix: 'testService',
    cacheKey: {
        userInfo: 'userInfoCacheKey'
    }
};