import {Request} from 'express'
import * as common from '../_system/common';
import * as cache from '../_system/cache';
import * as auth from '../_system/auth';
import * as main from '../_main';
import errorConfig from '../_system/errorConfig';
import * as autoBll from './_auto';
import * as userInfoBll from './userInfo';

export let signUp = function (opt, exOpt) {
    var userInfoId = 0;
    return common.promise(async function () {
        if (!opt.account)
            throw common.error('', errorConfig.CAN_NOT_BE_EMPTY, {
                format: function (msg) {
                    return common.stringFormat(msg, '用户名');
                }
            });
        let exist = await userInfoBll.isAccountExist(opt.account);
        if (exist)
            throw common.error('account is exist!');
        return autoBll.tran(async function (conn) {
            userInfoId = await autoBll.modules.userInfo.save({
                account: opt.account,
                password: opt.password,
                nickname: opt.nickname,
                createDate: new Date()
            }, conn) as number;

            //默认角色
            await autoBll.modules.userInfoWithRole.save({
                userInfoId: userInfoId,
                roleCode: 'default'
            }, conn);

            //日志
            var userInfoLog = userInfoBll.createLog();
            userInfoLog.userInfoId = userInfoId;
            userInfoLog.content = '[创建账号]';
            await autoBll.modules.userInfoLog.save(userInfoLog, conn);
        });
    }).then(function (t) {
        return userInfoId;
    });
};

export let signOut = function (opt, exOpt) {
    var user = exOpt.user;
    return common.promise(function () {
        if (user.key) {
            return cache.del(user.key);
        }
    }).then(function () {
        return 'success'
    });
};

export let signIn = function (opt, exOpt) {
    let captcha = opt.captcha;
    let cacheKey = main.cacheKey.captcha + opt.captchaKey;
    return common.promise(async () => {
        if (!captcha)
            throw common.error('请输入验证码');
        let captchaCache = await cache.get(cacheKey);
        if (!captchaCache)
            throw common.error('验证码已失效', errorConfig.CAPTCHA_EXPIRE);
        if (captchaCache.toLowerCase() != captcha.toLowerCase())
            throw common.error('验证码不正确');
        cache.del(cacheKey);
        let userInfoDetail = await signInInside(exOpt.req);
        return {
            id: userInfoDetail.userInfo.id,
            nickname: userInfoDetail.userInfo.nickname
        };
    });
};

//内部调用
export let signInInside = function (req: Request) {
    var account = req.header('account');
    var token = req.header('token');
    var reqBody = req.body;
    var user = req.myData.user;
    if (req.myData.autoSignIn) {
        account = user.account;
        token = user.token;
        reqBody = user.reqBody;
    }
    return common.promise(async function () {
        if (!account) {
            throw common.error(null, errorConfig.CAN_NOT_BE_EMPTY, {
                format: function (msg) {
                    return common.stringFormat(msg, 'account');
                }
            });
        }
        if (!reqBody)
            reqBody = '';
        if (typeof reqBody != 'string')
            reqBody = JSON.stringify(reqBody);
        let t = await autoBll.modules.userInfo.query({account: account});
        if (!t.count)
            throw common.error('no account!');
        if (t.count > 1)
            throw common.error('system error: data wrong', errorConfig.DB_DATA_ERROR);
        var userInfo = t.list[0];
        var pwd = userInfo.password;
        var checkToken = common.createToken(account + pwd + reqBody);
        if (token != checkToken)
            throw common.error(null, errorConfig.TOKEN_WRONG);
        return userInfoBll.detailQuery({id: userInfo.id});
    }).then(async function (t) {
        //console.log(t);
        var userInfo = t.userInfo;
        user.id = userInfo.id;
        user.nickname = userInfo.nickname;
        user.account = userInfo.account;
        user.authority[auth.authConfig.login.code] = true;
        user.reqBody = reqBody;
        user.token = token;
        for (var key in t.auth) {
            user.authority[key] = true;
        }
        user.cacheDatetime = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');

        var userInfoKey = req.cookies[main.cacheKey.userInfo];
        if (userInfoKey) {
            userInfoKey = main.cacheKey.userInfo + userInfoKey;
            user.key = userInfoKey;
            var seconds = main.cacheTime.userInfo;
            await cache.set(userInfoKey, user, seconds);
        }
        return t;
    });
};