/**
 * Created by umi on 2017-5-29.
 */
export default {
    name: 'MyService',
    port: 3010,
    deploy: '20170529',
    version: '0.0.2',
    env: 'dev',//ides 演示练习、dev 开发、qas 质量保证、prd 生产系统
    errorDir: __dirname + '/error',
    fileDir: __dirname + '/file',
    api: {
        logService: {
            defaultArgs: {
                host: 'http://localhost:3010',
            },
            method: {
                save: {
                    url: '/interface/log/save',
                    method: 'POST',
                    isUseDefault: false,
                    args: {
                        host: 'http://localhost:3010',
                    }
                },
            }
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
};

//npm install --production