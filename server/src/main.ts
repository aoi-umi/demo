import { Request, Response, Express } from 'express';
import { ConfirmChannel } from 'amqplib';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import { MQ } from 'amqplib-delay';

import * as config from '@/config';
import { myEnum } from '@/config';
import * as helpers from '@/helpers';
import { MySocket } from '@/_system/socket';
import { Auth } from '@/_system/auth';
import { Cache } from '@/_system/cache';
import routes from '@/routes';
import { ThirdPartyPayMapper } from '@/3rd-party';

import { PayMapper } from './models/mongo/asset';

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
        //支付通知处理
        let pnhCfg = config.dev.mq.payNotifyHandler;
        let payNotifyHandler = await MQ.delayTask(ch, pnhCfg);

        //自动取消订单
        let pacCfg = config.dev.mq.payAutoCancel;
        let payAutoCancel = await MQ.delayTask(ch, pacCfg);
        return Promise.all([
            ...payNotifyHandler,
            mq.consumeRetry(ch, pnhCfg.deadLetterQueue, async (content) => {
                await ThirdPartyPayMapper.notifyHandler(content);
            }),

            ...payAutoCancel,
            mq.consumeRetry(ch, pacCfg.deadLetterQueue, async (content) => {
                await PayMapper.cancel(content, { auto: true });
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
            videoHost: req.headers.host,
        };
        next();
    });

    app.get('/', function (req, res) {
        res.json({
            name: config.env.name,
            version: config.env.version,
        });
    });
    app.use(config.env.urlPrefix, routes);
};

export let errorHandler = function (err, req: Request, res: Response, next) {
    helpers.myRequestHandler(() => {
        throw err;
    }, req, res);
};

export var mySocket: MySocket = null;
export let initSocket = function (server: Server) {
    const io = SocketIO(server, { path: config.env.urlPrefix + '/socket.io' });
    mySocket = new MySocket(io, (socket, mySocket) => {
        let { socketUser } = mySocket;
        socket.myData = {};
        socket.on(myEnum.socket.登录, (msg) => {
            socketUser.addUser(msg, socket);
        });
        socket.on(myEnum.socket.登出, (msg) => {
            socketUser.delUserBySocket(socket);
        });

        socket.on(myEnum.socket.弹幕池连接, (msg) => {
            socketUser.danmakuConn(msg.videoId, socket);
        });

        socket.on(myEnum.socket.弹幕池断开, (msg) => {
            socketUser.danmakuDisConn(msg.videoId, socket);
        });

        socket.on('disconnect', function () {
            socketUser.delUserBySocket(socket);
        });
    });
};

