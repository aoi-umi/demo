
import { Request } from 'express';

import * as common from '@/_system/common';
import { MyRequestHandler } from '@/middleware';
import { paramsValid, logger, } from '@/helpers';
import * as config from '@/config';
import { myEnum } from '@/config';
import { cache } from '@/main';
import * as ValidSchema from '@/valid-schema/class-valid';
import { ThirdPartyAuthMapper } from '@/3rd-party';

import { UserModel, UserMapper, UserLogMapper } from '@/models/mongo/user';
import { SettingMapper } from '@/models/mongo/setting';
import { FileMapper } from '@/models/mongo/file';

export let accountExists: MyRequestHandler = async (opt, req, res) => {
    let data = paramsValid(req.body, ValidSchema.UserAccountExists);
    let userByRs = await ThirdPartyAuthMapper.userByHandler({ by: data.by, val: data.val });
    let rs = await UserMapper.accountExists(userByRs.val, data.by);
    return rs && {
        _id: rs._id,
        nickname: rs.nickname,
        avatarUrl: FileMapper.getImgUrl(rs.avatar, req.myData.imgHost)
    };
};

export let signUp: MyRequestHandler = async (opt, req, res) => {
    let data = paramsValid(req.body, ValidSchema.UserSignUp);
    let setting = await SettingMapper.detailQuery();
    if (!setting.canSignUp)
        throw common.error('暂不开放注册', config.error.NO_PERMISSIONS);
    let rs = await UserMapper.accountExists(data.account);
    if (rs)
        throw common.error('账号已存在');

    let userByRs = await ThirdPartyAuthMapper.userByHandler({ by: data.by, val: data.byVal }, { checkExists: true });

    let user = new UserModel(data);
    if (data.by) {
        user[userByRs.saveKey] = userByRs.val;
        if (userByRs.avatarUrl) {
            try {
                let rs = await common.requestService({
                    url: userByRs.avatarUrl, method: 'get', raw: true,
                    responseType: 'arraybuffer',
                });
                let uploadRs = await FileMapper.upload({
                    fileType: myEnum.fileType.图片,
                    contentType: rs.response.headers['content-type'],
                    buffer: rs.data,
                    filename: userByRs.avatarUrl,
                    imgHost: req.myData.imgHost,
                    user
                });
                user.avatar = uploadRs.fileId;
            } catch (e) {
                logger.error([`获取头像`, userByRs.avatarUrl, `失败`, `${e.message}`].join('\r\n'));
            }
        }
    }

    user.password = UserMapper.encryptPwd(data.password);
    await user.save();

    return {
        _id: user._id,
        account: user.account
    };
};

export let signUpCheck: MyRequestHandler = async (opt, req, res) => {
    let setting = await SettingMapper.detailQuery();
    if (!setting.canSignUp)
        throw common.error('暂不开放注册', config.error.NO_PERMISSIONS);
};

let signInFn = async (data: ValidSchema.UserSignIn, opt: { noPwd?: boolean, req: Request }) => {
    let { req } = opt;
    let token = req.myData.user.key;
    let { user, disableResult } = await UserMapper.accountCheck(data.account);

    let returnUser = await UserMapper.login(data, {
        resetOpt: { imgHost: req.myData.imgHost },
        token,
        user,
        disabled: disableResult.disabled,
        noPwd: opt.noPwd
    });
    let userInfoCfg = { ...config.dev.cache.user, key: returnUser.key };
    await cache.setByCfg(userInfoCfg, returnUser);
    return returnUser;
};

export let signIn: MyRequestHandler = async (opt, req, res) => {
    let data = paramsValid(req.body, ValidSchema.UserSignIn);
    return signInFn(data, { req });
};

export let signInByAuth: MyRequestHandler = async (opt, req, res) => {
    let data = paramsValid(req.body, ValidSchema.UserSignInByAuth);
    let userByRs = await ThirdPartyAuthMapper.userByHandler({ by: data.by, val: data.val });
    let existsRs = await UserMapper.accountExists(userByRs.val, data.by);
    if (!existsRs)
        throw common.error('账号未绑定');
    let rs = await signInFn({ account: existsRs.account, rand: data.val }, { req, noPwd: true });
    cache.delByCfg({
        ...config.dev.cache.wxAuthCode,
        key: data.val
    });
    return rs;
};

export let signOut: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    if (user) {
        await cache.delByCfg({
            ...config.dev.cache.user,
            key: user.key
        });
    }
};