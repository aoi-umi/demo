import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ListQueryRequest, ApiMethod } from '.';
import { error } from '../../helpers/util';
import { cacheKey } from '../main/components/App';

type TestApiMethod = ApiMethod<ApiMethodConfigType, {
    userSignUp,
    userSignIn,
    userSignOut,
    userInfo,
    userAccountExists,
    bookmarkQuery,
    bookmarkSave,
    bookmarkDel,
}>;
export type TestApiConfigType = ApiConfigModel<TestApiMethod>;
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
            afterResponse: async (res) => {
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
    //#endregion

    //#region bookmark 
    async bookmarkQuery(data?: { name?, url?, anyKey?} & ListQueryRequest) {
        return this.requestByConfig(this.apiConfig.method.bookmarkQuery, { data });
    }
    async bookmarkSave(data) {
        return this.requestByConfig(this.apiConfig.method.bookmarkSave, { data });
    }
    async bookmarkDel(_id: string) {
        return this.requestByConfig(this.apiConfig.method.bookmarkDel, { data: { _id } });
    }
    //#endregion
}

