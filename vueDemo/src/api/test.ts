
import { error } from '../helpers/utils';
import { dev } from '../config';

import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ApiListQueryArgs, ApiMethod } from '.';

type TestApiMethod = ApiMethod<ApiMethodConfigType, {
    userSignUp,
    userSignIn,
    userSignOut,
    userInfo,
    userAccountExists,
    userDetail,
    userMgtQuery,
    userMgtSave,
    userMgtDisable,

    bookmarkQuery,
    bookmarkSave,
    bookmarkDel,

    authorityQuery,
    authorityCodeExists,
    authoritySave,
    authorityUpdate,
    authorityDel,

    roleQuery,
    roleCodeExists,
    roleSave,
    roleUpdate,
    roleDel,

    articleQuery,
    articleDetailQuery,
    articleSave,
    articleDel,
    articleMgtDel,
    articleMgtAudit,
}>;
export type TestApiConfigType = ApiConfigModel<TestApiMethod>;

export type Result<T = any> = {
    result: boolean;
    msg?: string;
    data: T;
};

export type ListResult<T = any> = {
    total: number;
    rows: T[];
};
export class TestApi extends ApiModel<TestApiMethod> {
    constructor(apiConfig: TestApiConfigType) {
        super(apiConfig, {
            beforeRequest: (req) => {
                let token = localStorage.getItem(dev.cacheKey.testUser);
                if (!req.headers)
                    req.headers = {};
                if (token)
                    req.headers[dev.cacheKey.testUser] = token;
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
    async userDetail() {
        return this.requestByConfig(this.apiConfig.method.userDetail);
    }
    async userAccountExists(account: string) {
        return this.requestByConfig(this.apiConfig.method.userAccountExists, { data: { account } });
    }

    async userMgtQuery(data?) {
        return this.requestByConfig(this.apiConfig.method.userMgtQuery, { data });
    }
    async userMgtSave(data) {
        return this.requestByConfig(this.apiConfig.method.userMgtSave, { data });
    }
    async userMgtDisable(data) {
        return this.requestByConfig(this.apiConfig.method.userMgtDisable, { data });
    }
    //#endregion

    //#region bookmark 
    async bookmarkQuery(data?: { name?, url?, anyKey?} & ApiListQueryArgs) {
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
    async authorityQuery(data?: { name?, code?, status?, anyKey?, getAll?: boolean } & ApiListQueryArgs) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.authorityQuery, { data });
    }
    async authoritySave(data) {
        return this.requestByConfig(this.apiConfig.method.authoritySave, { data });
    }
    async authorityCodeExists(data) {
        return this.requestByConfig(this.apiConfig.method.authorityCodeExists, { data });
    }
    async authorityUpdate(data) {
        return this.requestByConfig(this.apiConfig.method.authorityUpdate, { data });
    }
    async authorityDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.authorityDel, { data: { idList } });
    }
    //#endregion

    //#region role 
    async roleQuery(data?: { name?, code?, status?, anyKey?, getAll?: boolean } & ApiListQueryArgs) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.roleQuery, { data });
    }
    async roleSave(data) {
        return this.requestByConfig(this.apiConfig.method.roleSave, { data });
    }
    async roleCodeExists(data) {
        return this.requestByConfig(this.apiConfig.method.roleCodeExists, { data });
    }
    async roleUpdate(data) {
        return this.requestByConfig(this.apiConfig.method.roleUpdate, { data });
    }
    async roleDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.roleDel, { data: { idList } });
    }
    //#endregion

    //#region article 
    async articleQuery(data?: { anyKey?} & ApiListQueryArgs) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.articleQuery, { data });
    }
    async articleDetailQuery(data) {
        return this.requestByConfig(this.apiConfig.method.articleDetailQuery, { data });
    }
    async articleSave(data) {
        return this.requestByConfig(this.apiConfig.method.articleSave, { data });
    }
    async articleDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.articleDel, { data: { idList } });
    }
    async articleMgtDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.articleMgtDel, { data: { idList } });
    }
    async articleMgtAudit(data: { idList: string[], status }) {
        return this.requestByConfig(this.apiConfig.method.articleMgtAudit, { data });
    }
    //#endregion
}

