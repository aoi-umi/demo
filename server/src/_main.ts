import { Request, Response, Express } from 'express';
import { configure, getLogger } from 'log4js';

import * as mongo from './_system/dbMongo';
import * as auth from './_system/auth';
import * as config from './config';

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


export async function init() {
    await mongo.connect();
    auth.init({
        accessableUrlConfig: config.dev.accessableUrlConfig,
        accessableIfNoExists: true
    });
}

import routes from './routes';
export let register = function (app: Express) {
    //检查路由权限
    // app.use(auth.check);

    app.use(config.env.urlPrefix, routes);
}

