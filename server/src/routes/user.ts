import { RequestHandler } from 'express';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as cache from '../_system/cache';
import { responseHandler, paramsValid } from '../helpers';
import { UserModel, UserMapper } from '../models/mongo/user';
import { cacheKey, cacheTime } from '../_main';

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
        return {
            result: true,
            data: rs
        };
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
            result: true,
            data: {
                _id: user._id,
                account: user.account
            }
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
        return {
            result: true,
            data: returnUser
        };
    }, req, res);
};

export let signOut: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        if (user) {
            await cache.del(user.key);
        }
        return {
            result: true,
        };
    }, req, res);
};

export let info: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        return {
            result: true,
            data: user
        };
    }, req, res);
};