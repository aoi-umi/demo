import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ListQueryRequest, ApiMethod } from '.';
import { error } from '../../helpers/util';

type TestApiMethod = ApiMethod<ApiMethodConfigType, {
    bookmarkQuery,
    bookmarkSave,
    bookmarkDel,
}>;
export type TestApiConfigType = ApiConfigModel<TestApiMethod>;
export class TestApi extends ApiModel<TestApiMethod> {
    constructor(apiConfig: TestApiConfigType) {
        super(apiConfig, {
            afterResponse: async (response) => {
                if (response.code != 0)
                    throw error(response.msg);
                return response.data;
            }
        });
    }

    //#region bookmark 
    async bookmarkQuery(opt?: { name?, url?, anyKey?} & ListQueryRequest) {
        return this.requestByConfig(this.apiConfig.method.bookmarkQuery, { data: opt });
    }
    async bookmarkSave(data) {
        return this.requestByConfig(this.apiConfig.method.bookmarkSave, { data });
    }
    async bookmarkDel(_id: string) {
        return this.requestByConfig(this.apiConfig.method.bookmarkDel, { data: { _id } });
    }
    //#endregion
}

