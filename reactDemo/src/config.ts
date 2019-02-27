import { TestApiConfigType } from "./modules/api";

const env = location.hostname.includes('umi-aoi.xyz') ? 'prod' : 'dev';
const envConfig = {
    prod: {
        host: `//${location.hostname}/api`
    },
    dev: {
        host: '//localhost:8000'
    }
};
const config = {
    title: '开发',
    api: {
        test: {
            defaultArgs: {
                host: `${envConfig[env].host}/devMgt`,
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