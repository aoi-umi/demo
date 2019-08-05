import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import * as common from '../_system/common';
import * as cache from '../_system/cache';
import { responseHandler, paramsValid, } from '../helpers';
import { dev, error, auth, myEnum } from '../config';
import { UserModel, UserMapper, UserLogMapper } from '../models/mongo/user';
import * as VaildSchema from '../vaild-schema/class-valid';
import { transaction } from '../_system/dbMongo';

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
        let log = UserLogMapper.create(dbUser, user, { update });
        await transaction(async (session) => {
            await dbUser.update(update, { session });
            await log.save({ session });
        });
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
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.UserMgtSave, req.body);
        paramsValid(data);
        let detail = await UserModel.findById(data._id);
        if (!detail.canEdit)
            throw common.error('不可修改此账号');
        let update: any = {};

        let remark = '';
        if (data.delAuthList && data.delAuthList.length) {
            detail.authorityList = detail.authorityList.filter(ele => !data.delAuthList.includes(ele));
            remark += `[删除了权限:${data.delAuthList.join(',')}]`;
        }
        if (data.delRoleList && data.delRoleList.length) {
            detail.roleList = detail.roleList.filter(ele => !data.delRoleList.includes(ele));
            remark += `[删除了角色:${data.delRoleList.join(',')}]`;
        }

        if (data.addAuthList && data.addAuthList.length) {
            detail.authorityList = [...detail.authorityList, ...data.addAuthList];
            remark += `[增加了权限:${data.addAuthList.join(',')}]`;
        }
        if (data.addRoleList && data.addRoleList.length) {
            detail.roleList = [...detail.roleList, ...data.addRoleList];
            remark += `[增加了角色:${data.addRoleList.join(',')}]`;
        }
        update.authorityList = detail.authorityList;
        update.roleList = detail.roleList;

        let log = UserLogMapper.create(detail, user, { remark });
        await transaction(async (session) => {
            await detail.update(update, { session });
            await log.save({ session });
        });
        return {
            _id: detail._id,
        };
    }, req, res);
};

export let mgtDisable: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.UserMgtDisable, req.body);
        paramsValid(data);
        let detail = await UserModel.findById(data._id);
        if (!detail.canEdit)
            throw common.error('不可禁用此账号');
        let update: any = {};
        let remark = '封禁';
        if (data.disabled) {
            if (data.disabledTo) {
                update.disabledTo = data.disabledTo;
                remark += '至' + data.disabledTo;
            } else {
                update.status = myEnum.userStatus.禁用;
                remark += '永久';
            }
        } else {
            remark = '解封';
            update.$unset = {
                disabledTo: 1
            };
            update.status = myEnum.userStatus.正常;
        }

        let log = UserLogMapper.create(detail, user, { remark });
        await transaction(async (session) => {
            await detail.update(update, { session });
            await log.save({ session });
        });
        return {
            _id: detail._id,
        };
    }, req, res);
};