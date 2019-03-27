import { RequestHandler } from 'express';
import * as common from '../_system/common';
import errorConfig from '../config/errorConfig';
import * as cache from '../_system/cache';
import { responseHandler, paramsValid } from '../helpers';
import { cacheKey, cacheTime } from '../_main';
import { UserModel, UserMapper } from '../models/mongo/user';

export let accountExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {
            required: ['account']
        };
        let data: {
            account: string;
        } = req.body;
        paramsValid(schema, data);
        let rs = await UserMapper.accountExists(data.account);
        return rs && { _id: rs._id };
    }, req, res);
};

export let signUp: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {
            required: ['nickname', 'account', 'password']
        };
        let data: {
            nickname: string;
            account: string;
            password: string;
        } = req.body;
        paramsValid(schema, data);
        let rs = await UserMapper.accountExists(data.account);
        if (rs)
            throw common.error('账号已存在');
        data.password = common.md5(data.password);
        let user = await UserModel.create(data);

        return {
            _id: user._id,
            account: user.account
        };
    }, req, res);
};

export let signIn: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {
            required: ['account']
        };
        let data: {
            account: string;
            rand: string;
        } = req.body;
        paramsValid(schema, data);
        let token = req.header(cacheKey.user);
        let user = await UserMapper.accountExists(data.account);
        if (!user)
            throw common.error('账号不存在');

        let reqBody = JSON.stringify(data);
        let checkToken = common.createToken(data.account + user.password + reqBody);
        if (token !== checkToken)
            throw common.error('', errorConfig.TOKEN_WRONG);
        let userInfoKey = cacheKey.user + token;
        let returnUser = { _id: user._id, account: user.account, nickname: user.nickname, key: token };
        await cache.set(userInfoKey, returnUser, cacheTime.user);
        return returnUser;
    }, req, res);
};

export let signOut: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        if (user) {
            await cache.del(user.key);
        }
    }, req, res);
};

export let info: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        return user;
    }, req, res);
};

export let list: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = req.query;
        paramsValid({}, data, { list: true });
        let { rows, total } = await UserModel.findAndCountAll({
            projection: { password: 0 },
            page: data.page, rows: data.rows
        });
        return {
            rows,
            total
        };
    }, req, res);
}