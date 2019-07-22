import { RequestHandler } from "express";
import * as cache from '../_system/cache';
import { auth } from '../_main';
import * as config from '../config';
import { UserMapper } from "../models/mongo/user";

export const normal: RequestHandler = async (req, res, next) => {
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
        let userKey = req.header(config.dev.cacheKey.user);
        if (userKey) {
            userKey = config.dev.cacheKey.user + userKey;
            let user = await cache.get(userKey);
            if (user) {
                let { disableResult } = await UserMapper.accountCheck(user.account);
                if (disableResult.disabled) {
                    user.authority = {};
                }
                req.myData.user = user;
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