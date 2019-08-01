import { RequestHandler } from "express";
import * as cache from '../_system/cache';
import { auth } from '../_main';
import * as config from '../config';
import { UserMapper } from "../models/mongo/user";

export const normal: RequestHandler = async (req, res, next) => {
    try {
        req.myData = {
            user: {
                _id: '',
                nickname: '',
                account: '',
                authority: {}
            },
            startTime: new Date().getTime(),
            accessableUrl: {},
            ip: req.realIp,
        };
        let userKey = req.header(config.dev.cacheKey.user);
        if (userKey) {
            let userKey2 = config.dev.cacheKey.user + userKey;
            let user: Express.MyDataUser = await cache.get(userKey2);
            if (user) {
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
        let pathname = req.baseUrl + req._parsedUrl.pathname;
        let { accessableUrl } = auth.check(user, pathname);
        req.myData.accessableUrl = accessableUrl;
        next();
    } catch (e) {
        next(e);
    }
};