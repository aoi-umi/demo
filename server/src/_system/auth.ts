/**
 * Created by umi on 2017-5-29.
 */
import { Request, Response } from 'express';
import * as common from './common';
import errorConfig from './errorConfig';

type AuthConfigType = {
    code: string;
    errCode?: ErrorConfigType;
}
export const authConfig = {
    dev: {
        code: 'dev',
        errCode: errorConfig.DEV,
    },
    local: {
        code: 'local',
        errCode: errorConfig.NO_PERMISSIONS,
    },
    login: {
        code: 'login',
        errCode: errorConfig.NO_LOGIN,
    },
    accessable: {
        code: 'accessable',
        errCode: errorConfig.NO_PERMISSIONS,
    },
    admin: {
        code: 'admin',
        errCode: errorConfig.NO_PERMISSIONS,
    },

    mainContentQuery: {
        code: 'mainContentQuery'
    },
    mainContentDetailQuery: {
        code: 'mainContentDetailQuery'
    },
    mainContentSave: {
        code: 'mainContentSave'
    },
    mainContentDel: {
        code: 'mainContentDel'
    },
    mainContentAudit: {
        code: 'mainContentAudit'
    },
    mainContentPass: {
        code: 'mainContentPass'
    },
    mainContentNotPass: {
        code: 'mainContentNotPass'
    },
    mainContentRecovery: {
        code: 'mainContentRecovery'
    },
    mainContentUntread: {
        code: 'mainContentUntread'
    },

    mainContentTypeQuery: {
        code: 'mainContentTypeQuery'
    },
    mainContentTypeDetailQuery: {
        code: 'mainContentTypeDetailQuery'
    },
    mainContentTypeSave: {
        code: 'mainContentTypeSave'
    },
    mainContentTypeDel: {
        code: 'mainContentTypeDel'
    }
};

export type AccessableUrlConfigType = {
    url: string;
    auth?: AuthorityType | AuthorityType[] | AuthorityType[][];
}

type AuthorityType = string | AuthConfigType;

export let accessableUrlConfig: AccessableUrlConfigType[] = [];

export let init = function (opt: {
    accessableUrlConfig: AccessableUrlConfigType[]
}) {
    accessableUrlConfig = opt.accessableUrlConfig;
};

export let check = function (req: Request, res: Response, next) {
    //url权限认证
    var user = req.myData.user;
    var pathname = req._parsedUrl.pathname;
    req.myData.accessableUrl = getAccessableUrl(user, pathname);
    next();
};

export let isHadAuthority = function (user: Express.MyDataUser, authData: AuthorityType | AuthorityType[] | AuthorityType[][], opt?: IsExistAuthorityOption) {
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
    accessableUrlConfig.forEach(function (item) {
        var opt = { notExistAuthority: null };
        var result = !item.auth
            || (Array.isArray(item.auth) && !item.auth.length)
            || isHadAuthority(user, item.auth, opt);
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
        if (!isUrlExist)
            throw common.error('', errorConfig.NOT_FOUND, {
                format: function (msg) {
                    return msg + ':' + pathname;
                }
            });
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