import { Request, Response, Express } from 'express';
import { configure, getLogger } from 'log4js';
import * as mongoose from 'mongoose';
import { ConfirmChannel } from 'amqplib';

import * as config from './config';
import * as helpers from './helpers';
import { MySocket } from './_system/socket';
import { Auth } from './_system/auth';
import { MQ } from './_system/mq';
import { Cache } from './_system/cache';

export const logger = getLogger();

let appenders = {};
appenders[config.env.logger.name] = config.env.logger.appenders;

configure({
    appenders,
    categories: {
        default: {
            appenders: [config.env.logger.name],
            level: 'info'
        }
    }
});

export const auth = new Auth();
export const mq = new MQ({
    exchange: config.env.mq.exchange,
});
export const cache = new Cache(config.env.redis.uri, config.env.cachePrefix ? config.env.cachePrefix + ':' : '');
export async function init() {
    await mongoose.connect(config.env.mongoose.uri, config.env.mongoose.options);

    await mq.connect(config.env.mq.mqUri);
    let queue = 'test';
    let delay = mq.delayConfig;
    let delayCfg = {
        ...MQ.createQueueKey('testDelay'),
        expiration: 5,
        retryExpire: [
            delay.expireTime["15s"],
            delay.expireTime["30s"],
            delay.expireTime["1m"]
        ],
    };
    await mq.ch.addSetup(async (ch: ConfirmChannel) => {
        let delayTest = await MQ.delayTask(ch, delayCfg);
        return Promise.all([
            ch.assertQueue(queue, { durable: true }),
            mq.consume(ch, queue, (msg, content) => {
                console.log(11111111, content)
            }, { noAck: true }),
            ...delayTest,
            mq.consumeRetry(ch, delayCfg.deadLetterQueue, (msg, content) => {
                console.log(content);
                throw new Error('test');
            }),
        ] as any);
    });

    await mq.ch.addSetup(async (ch: ConfirmChannel) => {
        return Promise.all([
            mq.createDelayQueue(ch)
        ]);
    });
    mq.sendToQueue(queue, '11111111111');
    mq.sendToQueueRetryByConfig(delayCfg, 'delay test');
}

export let register = function (app: Express) {
    app.use((req, res, next) => {
        req.realIp = req.header('X-Real-IP') || req.ip;
        req.myData = {
            startTime: new Date().getTime(),
            ip: req.realIp,
            imgHost: req.headers.host,
        }
        next();
    });
    const routes = require('./routes').default;
    app.use(config.env.urlPrefix, routes);
}

export let errorHandler = function (err, req: Request, res: Response, next) {
    helpers.responseHandler(() => {
        throw err;
    }, req, res);
};

export var mySocket: MySocket = null;
export let initSocket = function (io: SocketIO.Server) {
    const { MySocket } = require('./_system/socket');
    mySocket = new MySocket(io, (socket, mySocket) => {
        let { socketUser } = mySocket;
        socket.myData = {};
        socket.on(config.myEnum.socket.弹幕发送, (msg) => {
            socket.broadcast.emit(config.myEnum.socket.弹幕接收, msg);
        });
        socket.on(config.myEnum.socket.登录, (msg) => {
            socketUser.addUser(msg, socket);
        });
        socket.on(config.myEnum.socket.登出, (msg) => {
            socketUser.delUserBySocket(socket);
        });

        socket.on('disconnect', function () {
            socketUser.delUserBySocket(socket);
        });
    });
};

