import { Request, Response, Express } from 'express';
import { configure, getLogger } from 'log4js';
import { ConfirmChannel } from 'amqplib';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import { MQ } from 'amqplib-delay';

import * as config from './config';
import { myEnum } from './config';
import * as helpers from './helpers';
import { MySocket } from './_system/socket';
import { Auth } from './_system/auth';
import { Cache } from './_system/cache';
import routes from './routes';
import { ThirdPartyPayMapper } from './3rd-party';

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
export const mq = new MQ();
export const cache = new Cache(config.env.redis.uri, config.env.cachePrefix ? config.env.cachePrefix + ':' : '');
export async function init() {

    await mq.connect(config.env.mq.mqUri);

    //创建重试延时队列
    await mq.ch.addSetup(async (ch: ConfirmChannel) => {
        return Promise.all([
            mq.createDelayQueue(ch)
        ]);
    });

    await mq.ch.addSetup(async (ch: ConfirmChannel) => {
        let pnhCfg = config.dev.mq.payNotifyHandler;
        let payNotifyHandler = await MQ.delayTask(ch, pnhCfg);
        return Promise.all([
            ...payNotifyHandler,
            mq.consumeRetry(ch, pnhCfg.deadLetterQueue, async (content) => {
                await ThirdPartyPayMapper.notifyHandler(content);
            }),
        ] as any);
    });
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
    app.use(config.env.urlPrefix, routes);
}

export let errorHandler = function (err, req: Request, res: Response, next) {
    helpers.responseHandler(() => {
        throw err;
    }, req, res);
};

export var mySocket: MySocket = null;
export let initSocket = function (server: Server) {
    const io = SocketIO(server, { path: config.env.urlPrefix + '/socket.io' });
    mySocket = new MySocket(io, (socket, mySocket) => {
        let { socketUser } = mySocket;
        socket.myData = {};
        socket.on(myEnum.socket.弹幕发送, (msg) => {
            socket.broadcast.emit(config.myEnum.socket.弹幕接收, msg);
        });
        socket.on(myEnum.socket.登录, (msg) => {
            socketUser.addUser(msg, socket);
        });
        socket.on(myEnum.socket.登出, (msg) => {
            socketUser.delUserBySocket(socket);
        });

        socket.on('disconnect', function () {
            socketUser.delUserBySocket(socket);
        });
    });
};

