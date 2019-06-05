import { TestApiConfigType } from "../api";

const env = location.hostname.includes('umi-aoi.xyz') ? 'prod' : 'dev';
const envConfig = {
    prod: {
        host: `//api.${location.hostname}`
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
                    method: 'get',
                },
                userDetail: {
                    url: '/user/detail',
                    method: 'get',
                },
                userAccountExists: {
                    url: '/user/accountExists',
                },

                userMgtQuery: {
                    url: '/user/mgt/query',
                    method: 'get',
                },
                userMgtSave: {
                    url: '/user/mgt/save',
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
                authorityCodeExists: {
                    url: '/authority/codeExists',
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

                roleQuery: {
                    url: '/role/query',
                    method: 'GET',
                },
                roleCodeExists: {
                    url: '/role/codeExists',
                },
                roleSave: {
                    url: '/role/save',
                },
                roleUpdate: {
                    url: '/role/update',
                },
                roleDel: {
                    url: '/role/del',
                },
            }
        } as TestApiConfigType
    }
}
export default config;