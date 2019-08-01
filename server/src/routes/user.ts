import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import * as common from '../_system/common';
import * as cache from '../_system/cache';
import { responseHandler, paramsValid, } from '../helpers';
import { dev, error, auth, myEnum } from '../config';
import { UserModel, UserMapper } from '../models/mongo/user';
import * as VaildSchema from '../vaild-schema/class-valid';

export let accountExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserAccountExists, req.body);
        paramsValid(data);
        let rs = await UserMapper.accountExists(data.account);
        return rs && { _id: rs._id };
    }, req, res);
};

export let signUp: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserSignUp, req.body);
        paramsValid(data);
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
        paramsValid(data);
        let token = req.myData.user.key;
        let { user, disableResult } = await UserMapper.accountCheck(data.account);

        let { checkToken } = UserMapper.createToken(data, user);
        if (token !== checkToken)
            throw common.error('', error.TOKEN_WRONG);
        let userInfoKey = dev.cacheKey.user + token;
        let userAuth = {
            [auth.login.code]: 1
        };
        if (!disableResult.disabled) {
            let userDetail = await UserMapper.detail(user._id);
            for (let key in userDetail.auth) {
                userAuth[key] = 1;
            }
        }

        let returnUser = { _id: user._id, account: user.account, nickname: user.nickname, key: token, authority: userAuth, loginData: data };
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
        delete user.loginData;
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

export let update: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserUpdate, req.body);
        paramsValid(data);
        let user = req.myData.user;
        let { token, ...restData } = data;
        let update: any = common.getDataInKey(restData, ['nickname']);
        let dbUser = await UserModel.findById(user._id);
        if (restData.newPassword) {
            let { checkToken } = UserMapper.createToken(restData, dbUser);
            if (token !== checkToken)
                throw common.error('', error.TOKEN_WRONG);
            update.password = common.md5(restData.newPassword);
        }
        await dbUser.update(update);
    }, req, res);
};

export let mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserMgtQuery, req.query);
        paramsValid(data);
        let { rows, total } = await UserMapper.query({
            ...data, includeDelAuth: true
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export let mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserMgtSave, req.body);
        paramsValid(data);
        let detail = await UserModel.findById(data._id);
        if (!detail.canEdit)
            throw common.error('不可修改此账号');
        let update: any = {};

        if (data.delAuthList && data.delAuthList.length) {
            detail.authorityList = detail.authorityList.filter(ele => !data.delAuthList.includes(ele));
        }
        if (data.delRoleList && data.delRoleList.length) {
            detail.roleList = detail.roleList.filter(ele => !data.delRoleList.includes(ele));
        }

        if (data.addAuthList && data.addAuthList.length) {
            detail.authorityList = [...detail.authorityList, ...data.addAuthList];
        }
        if (data.addRoleList && data.addRoleList.length) {
            detail.roleList = [...detail.roleList, ...data.addRoleList];
        }
        update.authorityList = detail.authorityList;
        update.roleList = detail.roleList;

        await detail.update(update);
        return {
            _id: detail._id,
        };
    }, req, res);
};

export let mgtDisable: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.UserMgtDisable, req.body);
        paramsValid(data);
        let detail = await UserModel.findById(data._id);
        if (!detail.canEdit)
            throw common.error('不可禁用此账号');
        let update: any = {};
        if (data.disabled) {
            if (data.disabledTo) {
                update.disabledTo = data.disabledTo;
            } else {
                update.status = myEnum.userStatus.禁用;
            }
        } else {
            update.$unset = {
                disabledTo: 1
            };
            update.status = myEnum.userStatus.正常;
        }
        await detail.update(update);
        return {
            _id: detail._id,
        };
    }, req, res);
};