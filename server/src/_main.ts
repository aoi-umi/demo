import { Request, Response, Express } from 'express';

import * as mongo from './_system/dbMongo';
import * as auth from './_system/auth';
import * as cache from './_system/cache';
import config from './config/config';


//#region 访问权限配置
export let accessableUrlConfig: auth.AccessableUrlConfigType[] = [
    { url: '/devMgt/user/signUp' },
    { url: '/devMgt/user/signIn' },
    { url: '/devMgt/user/signOut' },
    { url: '/devMgt/user/accountExists' },
    { url: '/devMgt/bookmark/query' },
];
//#endregion

//#region 缓存 
export let cacheKey = {
    user: 'userCacheKey',
    captcha: 'captchaKey'
};

/**缓存时间 秒 */
export let cacheTime = {
    user: 7 * 24 * 3600,
    captcha: 10 * 60
};
//#endregion

export async function init() {
    await mongo.connect();
    auth.init({
        accessableUrlConfig,
        accessableIfNoExists: true
    });
}

import routes from './routes';
export let register = function (app: Express) {
    app.use(async function (req, res, next) {
        try {
            req.myData = {
                method: {},
                user: {
                    _id: '',
                    nickname: '',
                    account: '',
                    authority: {}
                },
                startTime: new Date().getTime(),
                accessableUrl: {},
                ip: req.ip,
            };
            var userKey = req.header(cacheKey.user);
            if (userKey) {
                userKey = cacheKey.user + userKey;
                let user = await cache.get(userKey);
                if (user)
                    req.myData.user = user;
            }

            next();
        } catch (e) {
            next(e);
        }
    });

    //检查路由权限
    // app.use(auth.check);

    app.use(config.urlPrefix, routes);
}

