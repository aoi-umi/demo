
import { error } from '../helpers/util';
import { cacheKey } from '../config/config';

import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ListQueryRequest, ApiMethod } from '.';

type TestApiMethod = ApiMethod<ApiMethodConfigType, {
    userSignUp,
    userSignIn,
    userSignOut,
    userInfo,
    userAccountExists,
    adminUserList,

    bookmarkQuery,
    bookmarkSave,
    bookmarkDel,

    authorityQuery,
    authoritySave,
    authorityUpdate,
    authorityDel,
}>;
export type TestApiConfigType = ApiConfigModel<TestApiMethod>;

export type Result<T=any> = {
    result: boolean;
    msg?: string;
    data: T;
};

export type ListResult<T=any> = {
    total: number;
    rows: T[];
};
export class TestApi extends ApiModel<TestApiMethod> {
    constructor(apiConfig: TestApiConfigType) {
        super(apiConfig, {
            beforeRequest: (req) => {
                let token = localStorage.getItem(cacheKey.testUser);
                if (!req.headers)
                    req.headers = {};
                if (token)
                    req.headers[cacheKey.testUser] = token;
                return req;
            },
            afterResponse: async (res: Result) => {
                if (!res.result)
                    throw error(res.msg);
                return res.data;
            }
        });
    }
    //#region user 
    async userSignUp(data: { account: string, nickname: string, password: string }) {
        return this.requestByConfig(this.apiConfig.method.userSignUp, { data });
    }
    async userSignIn(data) {
        return this.requestByConfig(this.apiConfig.method.userSignIn, { data });
    }
    async userSignOut() {
        return this.requestByConfig(this.apiConfig.method.userSignOut);
    }
    async userInfo() {
        return this.requestByConfig(this.apiConfig.method.userInfo);
    }
    async userAccountExists(account: string) {
        return this.requestByConfig(this.apiConfig.method.userAccountExists, { data: { account } });
    }

    async adminUserList(data?) {
        return this.requestByConfig(this.apiConfig.method.adminUserList, { data });
    }
    //#endregion

    //#region bookmark 
    async bookmarkQuery(data?: { name?, url?, anyKey?} & ListQueryRequest) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.bookmarkQuery, { data });
    }
    async bookmarkSave(data) {
        return this.requestByConfig(this.apiConfig.method.bookmarkSave, { data });
    }
    async bookmarkDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.bookmarkDel, { data: { idList } });
    }
    //#endregion

    //#region authority 
    async authorityQuery(data?: { name?, code?, anyKey?} & ListQueryRequest) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.authorityQuery, { data });
    }
    async authoritySave(data) {
        return this.requestByConfig(this.apiConfig.method.authoritySave, { data });
    }
    async authorityUpdate(data) {
        return this.requestByConfig(this.apiConfig.method.authorityUpdate, { data });
    }
    async authorityDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.authorityDel, { data: { idList } });
    }
    //#endregion
}

