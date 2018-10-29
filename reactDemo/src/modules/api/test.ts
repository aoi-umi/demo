import { ApiModel } from './model';

type ListQueryRequest = {
    pageIndex?: number,
    pageSize?: number,
}
export class TestApi extends ApiModel {
    constructor(host: string) {
        super(host);
    }

    protected async request(url: string, method?: string, originResponse?: boolean) {
        let result = await super.request(url, method);
        if (!originResponse) {

        }
        return result;
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
                let url = opt.url, method = 'get';
                await this.request(url, method);
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

