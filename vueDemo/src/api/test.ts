
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
    userUpdate,

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
    commentSubmit,
    commentQuery,
    articleMgtQuery,
    articleMgtDetailQuery,
    articleMgtSave,
    articleMgtDel,
    articleMgtAudit,

    //file
    imgUpload,
    imgGet,
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
                req.headers = {
                    ...this.defaultHeaders(),
                    ...req.headers,
                }
                return req;
            },
            afterResponse: (res: Result) => {
                if (!res.result)
                    throw error(res.msg);
                return res.data;
            }
        });
        this.imgUploadUrl = this.getRequestConfig(this.apiConfig.method.imgUpload).url;
        this.imgUrl = this.getRequestConfig(this.apiConfig.method.imgGet).url;
    }

    defaultHeaders() {
        let headers = {};
        let token = localStorage.getItem(dev.cacheKey.testUser);
        if (token)
            headers[dev.cacheKey.testUser] = token;
        return headers;
    }
    //#region file 
    imgUploadUrl = '';
    imgUplodaHandler(res: Result) {
        return this.afterResponse(res) as FileUploadRes;
    }

    async imgUpload(file) {
        let formData = new FormData();
        formData.append('file', file);
        return this.requestByConfig<FileUploadRes>(this.apiConfig.method.imgUpload, {
            data: formData,
        });
    }

    imgUrl = '';
    getImgUrl(str) {
        return this.imgUrl + '?_id=' + str;
    }
    //#endregion  

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
    async userUpdate(data) {
        return this.requestByConfig(this.apiConfig.method.userUpdate, { data });
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
    async articleMgtQuery(data?: { anyKey?} & ApiListQueryArgs) {
        return this.requestByConfig<ListResult>(this.apiConfig.method.articleMgtQuery, { data });
    }
    async articleMgtDetailQuery(data) {
        return this.requestByConfig(this.apiConfig.method.articleMgtDetailQuery, { data });
    }
    async articleMgtSave(data) {
        return this.requestByConfig(this.apiConfig.method.articleMgtSave, { data });
    }
    async articleMgtDel(idList: string[]) {
        return this.requestByConfig(this.apiConfig.method.articleMgtDel, { data: { idList } });
    }
    async articleMgtAudit(data: { idList: string[], status, remark?}) {
        return this.requestByConfig(this.apiConfig.method.articleMgtAudit, { data });
    }
    //#endregion  

    //#region comment 

    async commentSubmit(data) {
        return this.requestByConfig(this.apiConfig.method.commentSubmit, { data });
    }
    async commentQuery(data) {
        return this.requestByConfig(this.apiConfig.method.commentQuery, { data });
    }
    //#endregion
}

type FileUploadRes = { fileId: string; url: string };
