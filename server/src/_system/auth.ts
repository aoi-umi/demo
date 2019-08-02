/**
 * Created by umi on 2017-5-29.
 */
import * as common from './common';
import * as config from '../config';
import { AuthConfigType } from '../config/authConfig';

export type AuthType = AuthorityType | AuthorityType[] | AuthorityType[][];
export type AccessUrlConfigType = {
    url: string;
    auth?: AuthType;
}

type AuthorityType = string | AuthConfigType;
type UserType = {
    authority: { [key: string]: boolean }
};
export class Auth {
    accessUrlConfig: AccessUrlConfigType[] = [];
    accessableIfNotExists = false;
    init(opt: {
        accessUrlConfig: AccessUrlConfigType[],
        //accessUrlConfig中不存在时能否访问
        accessableIfNotExists?: boolean,
    }) {
        opt = common.extend({ accessableIfNoExists: false }, opt);
        this.accessUrlConfig = opt.accessUrlConfig;
        this.accessableIfNotExists = opt.accessableIfNotExists;
    };

    check(user: UserType, pathname: string) {
        //url权限认证
        let accessableUrl = this.getAccessableUrl(user, pathname);
        return {
            accessableUrl
        };
    }

    //获取可访问的url，如传入pathname，该路径不可访问时抛出错误
    getAccessableUrl(user: UserType, pathname?: string) {
        let url = {};
        let accessable = false;
        let isUrlExist = false;
        this.accessUrlConfig.forEach((item) => {
            let opt = { notExistAuthority: null };
            let result = this.isAccessable(user, item.auth, opt);
            let isExist = item.url == pathname;
            if (isExist) isUrlExist = true;
            if (result) {
                url[item.url] = true;
                if (isExist)
                    accessable = true;
            } else if (isExist) {
                let errCode = Auth.getErrorCode(opt.notExistAuthority);
                throw common.error('', errCode);
            }
        });
        if (pathname) {
            if (!this.accessableIfNotExists) {
                if (!isUrlExist)
                    throw common.error('', config.error.NOT_FOUND, {
                        format: function (msg) {
                            return msg + ':' + pathname;
                        }
                    });
            } else
                accessable = true;
            if (!accessable)
                throw common.error('', config.auth.accessable.errCode);
        }
        return url;
    }

    isAccessable(user: UserType, auth: AuthType, opt?: IsExistAuthorityOption) {
        let result = !auth
            || (Array.isArray(auth) && !auth.length)
            || Auth.includes(user, auth, opt);
        return result;
    }

    checkAccessable(user: UserType, auth: AuthType) {
        let opt = { notExistAuthority: null };
        let result = this.isAccessable(user, auth, opt);
        if (!result) {
            let errCode = Auth.getErrorCode(opt.notExistAuthority);
            throw common.error('', errCode);
        }
    }

    static includes(user: UserType, authData: AuthType, opt?: IsExistAuthorityOption) {
        if (!Array.isArray(authData))
            authData = [authData];
        for (let i = 0; i < authData.length; i++) {
            let item = authData[i];
            if (!Auth.contains(user, item, opt)) {
                return false;
            }
        }
        return true;
    }

    static contains(user: UserType, authData: AuthorityType | AuthorityType[], opt?: IsExistAuthorityOption) {
        if (!Array.isArray(authData) && typeof authData != 'string')
            authData = authData.code;
        if (typeof authData == 'string')
            authData = authData.split(',');
        for (let i = 0; i < authData.length; i++) {
            let item = authData[i];
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
            throw common.error('', Auth.getErrorCode(opt.notExistAuthority));
        }
        return false;
    }

    static getErrorCode(authData) {
        if (authData && config.auth[authData] && config.auth[authData].errCode)
            return config.auth[authData].errCode;
        return config.error.NO_PERMISSIONS;
    }
}

type IsExistAuthorityOption = {
    //output
    notExistAuthority?: string;
    throwError?: boolean;
}