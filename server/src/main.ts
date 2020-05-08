import * as Koa from 'koa';
import * as Router from '@koa/router';
import { ConfirmChannel } from 'amqplib';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import { MQ } from 'amqplib-delay';

import * as config from '@/config';
import { myEnum } from '@/config';
import { MySocket } from '@/_system/socket';
import { Auth } from '@/_system/auth';
import { Cache } from '@/_system/cache';
import routes from '@/routes';
import { ThirdPartyPayMapper } from '@/3rd-party';
import * as helpers from '@/helpers';

import { PayMapper } from './models/mongo/asset';

export const auth = new Auth();
export const mq = new MQ();
export const cache = new Cache(config.env.redis.uri, config.env.cachePrefix || '');
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

export let register = function (app: Koa) {
    app.use(async (ctx, next) => {
        await helpers.myRequestHandler(async (opt) => {
            opt.noSend = true;
            let ip = ctx.request.get('X-Real-IP') || ctx.ip;
            ctx.myData = {
                startTime: new Date().getTime(),
                ip,
                imgHost: ctx.headers.host,
                videoHost: ctx.headers.host,
            };
            await next();
            return ctx.body;
        }, ctx);
    });

    let router = new Router();
    router.get('/', async (ctx) => {
        return {
            name: config.env.name,
            version: config.env.version,
        };
    });
    app.use(router.routes()).use(router.allowedMethods());
    app.use(routes.routes()).use(routes.allowedMethods());

    app.use(async (ctx, next) => {
        let err = new Error('Not Found');
        err['status'] = 404;
        ctx.status = 404;
        throw err;
    });
};

export var mySocket: MySocket = null;
export let initSocket = function (server: Server) {
    const io = SocketIO(server, { path: config.env.urlPrefix + '/socket.io' });
    mySocket = new MySocket(io, (socket, mySocket) => {
        let { socketUser } = mySocket;

        let sessionId = mySocket.connect(socket, socket.request._query);

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

        socket.on(myEnum.socket.授权, (msg) => {
            cache.setByCfg({
                ...config.dev.cache.wxAuth,
                key: msg.token
            }, sessionId);
        });

        socket.on(myEnum.socket.支付, (msg) => {
            cache.setByCfg({
                ...config.dev.cache.pay,
                key: msg.orderNo
            }, sessionId);
        });

        socket.on('disconnect', function () {
            mySocket.disconnect(socket);
        });
    });
};

