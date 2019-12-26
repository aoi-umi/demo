import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";

import * as config from '@/config';
import { AuthType } from "@/_system/auth";
import { auth, cache } from '@/main';
import { logger } from '@/helpers';
import { UserMapper } from "@/models/mongo/user";
import { LoginUser } from "@/models/login-user";

export class UserAuthMid {
    static async  getUser(token, opt?: {
        resetOpt?;
        autoLogin?: boolean;
    }) {
        opt = { ...opt };
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
                if (opt.autoLogin && user.cacheAt && user.cacheAt.getTime() < new Date().getTime() - 1000 * config.dev.autoLoginTime) {
                    try {
                        let cacheUser = user = await UserMapper.login(user.loginData, {
                            disabled: disableResult.disabled,
                            resetOpt: opt.resetOpt,
                            token,
                            user: dbUser,
                            oldData: user,
                        });
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
                let user = await UserAuthMid.getUser(token, {
                    autoLogin: true,
                    resetOpt: { imgHost: req.myData.imgHost }
                });
                req.myData.user = user;

                //url权限认证
                if (authData)
                    auth.checkAccessable(user, authData);
                next();
            } catch (e) {
                next(e);
            }
        };
        return fn;
    }
}