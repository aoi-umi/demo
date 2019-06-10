/**
 * Created by umi on 2017-5-29.
 */
import { Request, Response } from 'express';
import * as common from './common';
import errorConfig from '../config/errorConfig';
import { authConfig, AuthConfigType } from '../config/authConfig';

export type AccessUrlConfigType = {
    url: string;
    auth?: AuthorityType | AuthorityType[] | AuthorityType[][];
}

type AuthorityType = string | AuthConfigType;

export let accessUrlConfig: AccessUrlConfigType[] = [];
let accessableIfNotExists = false;
export let init = function (opt: {
    accessUrlConfig: AccessUrlConfigType[],
    //accessUrlConfig中不存在时能否访问
    accessableIfNotExists?: boolean,
}) {
    opt = common.extend({ accessableIfNoExists: false }, opt);
    accessUrlConfig = opt.accessUrlConfig;
    accessableIfNotExists = opt.accessableIfNotExists;
};

export let check = function (req: Request, res: Response, next) {
    //url权限认证
    var user = req.myData.user;
    var pathname = req.originalUrl;
    req.myData.accessableUrl = getAccessableUrl(user, pathname);
    next();
};

export let hasAuthority = function (user: Express.MyDataUser, authData: AuthorityType | AuthorityType[] | AuthorityType[][], opt?: IsExistAuthorityOption) {
    if (!Array.isArray(authData))
        authData = [authData];
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (!isExistAuthority(user, item, opt)) {
            return false;
        }
    }
    return true;
};
type IsExistAuthorityOption = {
    //output
    notExistAuthority?: string;
    throwError?: boolean;
}
export let isExistAuthority = function (user: Express.MyDataUser, authData: AuthorityType | AuthorityType[], opt: IsExistAuthorityOption) {
    let au = authData as AuthConfigType;
    if (!Array.isArray(authData) && typeof authData != 'string')
        authData = authData.code;
    if (typeof authData == 'string')
        authData = authData.split(',');
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (typeof item != 'string')
            item = item.code;
        if (user.authority[item]) {
            if (opt) opt.notExistAuthority = null;
            return true;
        }
        if (opt) {
            opt.notExistAuthority = item;
        }
    }
    if (opt && opt.throwError) {
        throw common.error('', getErrorCode(opt.notExistAuthority));
    }
    return false;
};

//获取可访问的url，如传入pathname，该路径不可访问时抛出错误
export let getAccessableUrl = function (user: Express.MyDataUser, pathname?: string) {
    var url = {};
    var accessable = false;
    var isUrlExist = false;
    accessUrlConfig.forEach(function (item) {
        var opt = { notExistAuthority: null };
        var result = !item.auth
            || (Array.isArray(item.auth) && !item.auth.length)
            || hasAuthority(user, item.auth, opt);
        var isExist = item.url == pathname;
        if (isExist) isUrlExist = true;
        if (result) {
            url[item.url] = true;
            if (isExist)
                accessable = true;
        } else if (isExist) {
            var errCode = getErrorCode(opt.notExistAuthority);
            throw common.error('', errCode);
        }
    });
    if (pathname) {
        if (!accessableIfNotExists) {
            if (!isUrlExist)
                throw common.error('', errorConfig.NOT_FOUND, {
                    format: function (msg) {
                        return msg + ':' + pathname;
                    }
                });
        } else
            accessable = true;
        if (!accessable)
            throw common.error('', authConfig.accessable.errCode);
    }
    return url;
};

export let getErrorCode = function (authData) {
    if (authData && authConfig[authData] && authConfig[authData].errCode)
        return authConfig[authData].errCode;
    return errorConfig.NO_PERMISSIONS;
};

export function isEqual(code: string, authConfig: AuthConfigType) {
    return code === authConfig.code;
}