import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";

import * as config from '../config';
import * as cache from '../_system/cache';
import { AuthType } from "../_system/auth";
import { auth, logger } from '../_main';
import { UserMapper } from "../models/mongo/user";
import { LoginUser } from "../models/login-user";

export class UserAuthMid {
    static async  getUser(token, resetOpt?) {
        let user = plainToClass(LoginUser, {
            _id: undefined,
            nickname: '',
            account: '',
            authority: {},
            isLogin: false,
            key: token || ''
        });
        if (token) {
            let userCacheKey = config.dev.cacheKey.user + token;
            let userData = await cache.get(userCacheKey);
            if (userData) {
                user = plainToClass(LoginUser, userData);
                user.isLogin = true;

                let { disableResult, user: dbUser } = await UserMapper.accountCheck(user.account, user);
                if (disableResult.disabled) {
                    user.authority = {};
                }
                //自动重新登录
                if (user.cacheAt && user.cacheAt.getTime() < new Date().getTime() - 1000 * 3600 * 2) {
                    try {
                        let cacheUser = user = await UserMapper.login(token, dbUser, user.loginData, disableResult.disabled, resetOpt);
                        await cache.set(userCacheKey, cacheUser, config.dev.cacheTime.user);
                    } catch (e) {
                        logger.error(e);
                        cache.del(userCacheKey);
                    }
                }
            }
        }
        return user;
    }

    static normal(authData?: AuthType) {
        let fn: RequestHandler = async (req, res, next) => {
            try {
                let token = req.header(config.dev.cacheKey.user);
                let user = await UserAuthMid.getUser(token, { imgHost: req.headers.host });
                req.myData = {
                    user,
                    startTime: new Date().getTime(),
                    accessableUrl: {},
                    ip: req.realIp,
                };

                //url权限认证
                if (authData)
                    auth.checkAccessable(user, authData);
                next();
            } catch (e) {
                next(e);
            }
        }
        return fn;
    }
}