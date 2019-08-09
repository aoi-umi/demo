
import * as path from 'path';
import { ConnectionOptions } from 'mongoose';

const urlPrefix = '/devMgt';
let env = {
    name: 'devMgt',
    port: process.env.PORT || 8000,
    version: '0.0.1',
    errorDir: path.resolve(__dirname + '/../file/error'),
    cachePrefix: 'myService',
    redis: {
        uri: process.env.RedisUri || 'redis://localhost',
    },
    mongoose: {
        uri: process.env.MongoUri || "mongodb://localhost",
        options: {
            useNewUrlParser: true,
            autoReconnect: true,
            useFindAndModify: false,
            dbName: 'devMgt',
            useCreateIndex: true,
        } as ConnectionOptions
    },
    api: {},
    urlPrefix,
    logger: {
        name: 'devMgt',
        appenders: { type: 'stdout' }
    },
    imgPrefix: `${urlPrefix}/img`
};

export default env;