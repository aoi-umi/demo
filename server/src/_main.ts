import { Request, Response, Express } from 'express';
import { configure, getLogger } from 'log4js';

import * as mongo from './_system/dbMongo';
import { Auth } from './_system/auth';
import * as config from './config';
import * as helpers from './helpers';
import { SocketOnConnect } from './typings/libs';
import { MySocket } from './_system/socket';

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
export async function init() {
    await mongo.connect();
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

