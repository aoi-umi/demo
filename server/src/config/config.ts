
import * as path from 'path';
import { ConnectionOptions } from 'mongoose';

let config = {
    name: 'devMgt',
    port: process.env.PORT || 8000,
    version: '0.0.1',
    errorDir: path.resolve(__dirname + '/../file/error'),
    cachePrefix: 'myService',
    redis: {
        uri: process.env.RedisUri || 'redis://localhost',
    },
    mongoose: {
        uri: process.env.MongoUri || "mongodb://dev:123456@127.0.0.1:27017/admin",
        options: {
            useNewUrlParser: true,
            autoReconnect: true,
            useFindAndModify: false,
            dbName: 'devMgt',
            useCreateIndex: true,
        } as ConnectionOptions
    },
    api: {},
    urlPrefix: '/devMgt',
    logger: {
        name: 'devMgt',
        appenders: { type: 'stdout' }
    }
};

export default config;