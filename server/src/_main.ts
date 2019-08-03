import { Request, Response, Express } from 'express';
import { configure, getLogger } from 'log4js';

import * as mongo from './_system/dbMongo';
import { Auth } from './_system/auth';
import * as config from './config';
import * as helpers from './helpers';

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
    auth.init({
        accessableIfNotExists: true
    });
}

import routes from './routes';
import { SocketOnConnect } from './typings/libs';
export let register = function (app: Express) {
    app.use((req, res, next) => {
        req.realIp = req.header('X-Real-IP') || req.ip;
        next();
    });
    app.use(config.env.urlPrefix, routes);
}

export let errorHandler = function (err, req: Request, res: Response, next) {
    helpers.responseHandler(() => {
        throw err;
    }, req, res);
};

export let initSocket: SocketOnConnect = function (socket) {
    socket.on(config.myEnum.socket.弹幕发送, (msg) => {
        socket.broadcast.emit(config.myEnum.socket.弹幕接收, msg);
    });
};

