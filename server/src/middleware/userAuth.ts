import { RequestHandler } from "express";
import * as cache from '../_system/cache';
import * as auth from '../_system/auth';
import * as config from '../config';

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
        var userKey = req.header(config.dev.cacheKey.user);
        if (userKey) {
            userKey = config.dev.cacheKey.user + userKey;
            let user = await cache.get(userKey);
            if (user)
                req.myData.user = user;
        }

        auth.check(req, res, next);
    } catch (e) {
        next(e);
    }
};