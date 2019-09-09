
import * as path from 'path';
import { ConnectionOptions } from 'mongoose';

let processEnv: {
    Port?: string;
    RedisUri?: string;
    MongoUri?: string;
    Host?: string;
    MQUri?: string;
} = process.env;
const urlPrefix = '/devMgt';
const envDir = path.resolve(__dirname, '../../env');
let host = processEnv.Host || 'http://localhost';
let name = 'devMgt';
let env = {
    name,
    port: processEnv.Port || 8000,
    version: '0.0.1',
    cachePrefix: name,
    redis: {
        uri: processEnv.RedisUri || 'redis://localhost',
    },
    mongoose: {
        uri: processEnv.MongoUri || "mongodb://localhost",
        options: {
            useNewUrlParser: true,
            autoReconnect: true,
            useFindAndModify: false,
            dbName: 'devMgt',
            useCreateIndex: true,
        } as ConnectionOptions
    },
    mq: {
        exchange: name,
        mqUri: processEnv.MQUri || 'amqp://localhost'
    },
    api: {},
    urlPrefix,
    logger: {
        name,
        appenders: { type: 'stdout' }
    },
    imgPrefix: `${urlPrefix}/img`,
    ali: {
        sandbox: true,
        appId: '2016100100641227',
        payNotifyUrl: host + urlPrefix + '/alipay/notify',
        refundNotifyUrl: host + urlPrefix + '/alipay/refund/notify',
        rsaPublicPath: path.join(envDir, '/alipay/pub.txt'),
        rsaPrivatePath: path.join(envDir, '/alipay/pri.txt'),
    }
};

export default env;