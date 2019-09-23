
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
let hostWithPrefix = host + urlPrefix;
let name = 'devMgt';
export default {
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
        payNotifyUrl: hostWithPrefix + '/alipay/notify',
        refundNotifyUrl: hostWithPrefix + '/alipay/refund/notify',
        rsaPublicPath: path.join(envDir, '/alipay/pub.txt'),
        rsaPrivatePath: path.join(envDir, '/alipay/pri.txt'),
    },
    wx: {
        sandbox: true,
        payNotifyUrl: hostWithPrefix + '/wxpay/notify',
        mch_id: '',
        pay: {
            key: '',
            certPath: path.join(envDir, 'wxpay/apiclient_cert.p12'),
        },
        app: {
            appId: '',
        },
    }
};