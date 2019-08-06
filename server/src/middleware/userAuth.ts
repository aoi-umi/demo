import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";

import * as config from '../config';
import * as cache from '../_system/cache';
import { AuthType } from "../_system/auth";
import { auth, logger } from '../_main';
import { UserMapper } from "../models/mongo/user";
import { LoginUser } from "../models/login-user";

export class UserAuthMid {
    static normal(authData?: AuthType) {
        let fn: RequestHandler = async function (req, res, next) {
            try {

                req.myData = {
                    user: plainToClass(LoginUser, {
                        _id: '',
                        nickname: '',
                        account: '',
                        authority: {}
                    }),
                    startTime: new Date().getTime(),
                    accessableUrl: {},
                    ip: req.realIp,
                };
                let token = req.header(config.dev.cacheKey.user);
                if (token) {
                    let userCacheKey = config.dev.cacheKey.user + token;
                    let userData = await cache.get(userCacheKey);
                    if (userData) {
                        let user = plainToClass(LoginUser, userData);

                        let { disableResult, user: dbUser } = await UserMapper.accountCheck(user.account, user);
                        if (disableResult.disabled) {
                            user.authority = {};
                        }
                        //自动重新登录
                        if (user.lastLoginAt && user.lastLoginAt.getTime() < new Date().getTime() - 1000 * 3600 * 2) {
                            try {
                                let returnUser = await UserMapper.login(token, dbUser, user.loginData, disableResult.disabled);
                                await cache.set(userCacheKey, returnUser, config.dev.cacheTime.user);
                                user = plainToClass(LoginUser, returnUser);
                                req.myData.user = user;
                            } catch (e) {
                                logger.error(e);
                                cache.del(userCacheKey);
                            }
                        } else {
                            req.myData.user = user;
                        }
                    } else {
                        req.myData.user.key = token;
                    }
                }

                //url权限认证
                let user = req.myData.user;
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