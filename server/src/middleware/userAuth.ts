import { RequestHandler } from "express";
import { plainToClass } from "class-transformer";

import * as config from '../config';
import * as cache from '../_system/cache';
import { AuthType } from "../_system/auth";
import { auth } from '../_main';
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
                let userKey = req.header(config.dev.cacheKey.user);
                if (userKey) {
                    let userKey2 = config.dev.cacheKey.user + userKey;
                    let userData: LoginUser = await cache.get(userKey2);
                    if (userData) {
                        let user = plainToClass(LoginUser, userData);
                        let { disableResult } = await UserMapper.accountCheck(user.account, user);
                        if (disableResult.disabled) {
                            user.authority = {};
                        }
                        req.myData.user = user;
                    } else {
                        req.myData.user.key = userKey;
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