import { TestApiConfigType } from "../api";

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
                userSignUp: {
                    url: '/user/signUp',
                },
                userSignIn: {
                    url: '/user/signIn',
                },
                userSignOut: {
                    url: '/user/signOut',
                },
                userInfo: {
                    url: '/user/info',
                },
                adminUserList: {
                    url: '/admin/user/list',
                    method: 'get',
                },
                userAccountExists: {
                    url: '/user/accountExists',
                },

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

                authorityQuery: {
                    url: '/authority/query',
                    method: 'GET',
                },
                authoritySave: {
                    url: '/authority/save',
                },
                authorityUpdate: {
                    url: '/authority/update',
                },
                authorityDel: {
                    url: '/authority/del',
                },
            }
        } as TestApiConfigType
    }
}
export default config;