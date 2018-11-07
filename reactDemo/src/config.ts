import { TestApiConfigType } from "./modules/api";

let config = {
    api: {
        test: {
            defaultArgs: {
                host: 'http://localhost:8000',
            },
            method: {
                bookmarkQuery: {
                    url: '/bookmark/query',
                    method: 'GET',
                },
                bookmarkSave: {
                    url: '/bookmark/save',
                },
                bookmarkDel: {
                    url: '/bookmark/del',
                },
            }
        } as TestApiConfigType
    }
}
export default config;