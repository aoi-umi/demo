import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import * as common from '../_system/common';
import * as cache from '../_system/cache';
import { transaction } from '../_system/dbMongo';
import { responseHandler, paramsValidV2, } from '../helpers';
import { dev, error, auth } from '../config';
import { UserModel, UserMapper } from '../models/mongo/user';
import * as VaildSchema from '../vaild-schema/class-valid';

export let accountExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserAccountExists, req.body);
        paramsValidV2(data);
        let rs = await UserMapper.accountExists(data.account);
        return rs && { _id: rs._id };
    }, req, res);
};

export let signUp: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserSignUp, req.body);
        paramsValidV2(data);
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
        let data = plainToClass(VaildSchema.UserSignIn, req.body);
        paramsValidV2(data);
        let token = req.header(dev.cacheKey.user);
        let user = await UserMapper.accountExists(data.account);
        if (!user)
            throw common.error('账号不存在');

        let reqBody = JSON.stringify(data);
        let checkToken = common.createToken(data.account + user.password + reqBody);
        if (token !== checkToken)
            throw common.error('', error.TOKEN_WRONG);
        let userInfoKey = dev.cacheKey.user + token;
        let userAuth = {
            [auth.login.code]: 1
        };
        let userDetail = await UserMapper.detail(user._id);
        for (let key in userDetail.auth) {
            userAuth[key] = 1;
        }

        let returnUser = { _id: user._id, account: user.account, nickname: user.nickname, key: token, authority: userAuth };
        await cache.set(userInfoKey, returnUser, dev.cacheTime.user);
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
        return user.key ? user : null;
    }, req, res);
};

export let detail: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let userDetail = await UserMapper.detail(user._id);
        return userDetail;
    }, req, res);
};

export let mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserMgtQuery, req.query);
        paramsValidV2(data);
        let { rows, total } = await UserMapper.query({
            ...data, includeDelAuth: true
        });
        return {
            rows,
            total
        };
    }, req, res);
}

export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserMgtSave, req.body);
        paramsValidV2(data);
        let detail = await UserModel.findById(data._id);
        let update: any = {};

        let pull: any = {};
        if (data.delAuthList && data.delAuthList.length) {
            pull.authorityList = { $in: data.delAuthList };
        }
        if (data.delRoleList && data.delRoleList.length) {
            pull.roleList = { $in: data.delRoleList };
        }
        if (!common.isObjectEmpty(pull))
            update.$pull = pull;

        let push: any = {};
        if (data.addAuthList && data.addAuthList.length) {
            push.authorityList = { $each: data.addAuthList };
        }
        if (data.addRoleList && data.addRoleList.length) {
            push.roleList = { $each: data.addRoleList };
        }
        await transaction(async (session) => {
            await detail.update(update, { session });
            if (!common.isObjectEmpty(push))
                await detail.update({ $push: push }, { session });
        });
        return {
            _id: detail._id,
        };
    }, req, res);
}