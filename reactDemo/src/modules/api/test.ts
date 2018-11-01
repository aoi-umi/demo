import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ListQueryRequest } from '.';
import { error } from '../../helpers/util';

type TestApiMethod = { bookmarkQuery: ApiMethodConfigType };
export class TestApi extends ApiModel<TestApiMethod> {
    constructor(apiConfig: ApiConfigModel<TestApiMethod>) {
        super(apiConfig, {
            afterResponse: async (response) => {
                if (response.code != 0)
                    throw error(response.msg);
                return response.data;
            }
        });
    }

    async bookmarkQuery(opt?: { name?, url?, anyKey?} & ListQueryRequest) {
        return this.requestByConfig(this.apiConfig.method.bookmarkQuery, { data: opt });
        //test
        let rows = [
            { name: 'github', url: '//github.com' },
            { name: 'stackoverflow', url: '//stackoverflow.com' },
            { name: 'material-ui', url: '//material-ui.com' },
            { name: 'reactjs', url: '//reactjs.org' },
            { name: 'npmjs', url: '//www.npmjs.com' },
        ];
        if (opt) {
            if (opt.anyKey == 'test')
                throw new Error('test');
            if (opt.anyKey == 'request') {
                await this.requestByConfig(this.apiConfig.method.bookmarkQuery, { data: opt });
            }
            rows = rows.filter(ele => {
                return (!opt.name || (opt.name && new RegExp(opt.name, 'i').test(ele.name)))
                    && (!opt.url || (opt.url && new RegExp(opt.url, 'i').test(ele.url)))
                    && (!opt.anyKey || (opt.anyKey && (new RegExp(opt.anyKey, 'i').test(ele.name) || new RegExp(opt.anyKey, 'i').test(ele.url))));
            });
        }
        return { rows, total: 50 };
    }
}

