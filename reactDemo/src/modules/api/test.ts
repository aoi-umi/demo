import { ApiModel, ApiConfigModel, ApiMethodConfigType } from './model';
import { ListQueryRequest } from '.';

type TestApiMethod = { bookmarkQuery: ApiMethodConfigType };
export class TestApi extends ApiModel<TestApiMethod> {
    constructor(apiConfig: ApiConfigModel<TestApiMethod>) {
        super(apiConfig, {
            afterResponse: async (response) => {
                return response;
            }
        });
    }

    async bookmarkQuery(opt?: { name?, url?, anyKey?} & ListQueryRequest) {
        //test
        let list = [
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
            list = list.filter(ele => {
                return (!opt.name || (opt.name && new RegExp(opt.name, 'i').test(ele.name)))
                    && (!opt.url || (opt.url && new RegExp(opt.url, 'i').test(ele.url)))
                    && (!opt.anyKey || (opt.anyKey && (new RegExp(opt.anyKey, 'i').test(ele.name) || new RegExp(opt.anyKey, 'i').test(ele.url))));
            });
        }
        return { list: list, total: 50 };
    }
}

