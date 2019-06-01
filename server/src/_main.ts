import { Request, Response, Express } from 'express';

import * as mongo from './_system/dbMongo';
import * as auth from './_system/auth';
import * as cache from './_system/cache';
import * as config from './config';

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

