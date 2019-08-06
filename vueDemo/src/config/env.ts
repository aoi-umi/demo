import { TestApiConfigType } from "../api";

const host = 'umi-aoi.xyz';
const env = location.hostname.includes(host) ? 'prod' : 'dev';
const envConfig = {
    prod: {
        host: `//api.${host}`
    },
    dev: {
        host: `//${location.hostname}:8000`
    }
};
const config = {
    title: '开发',
    socket: {
        test: {
            host: `${envConfig[env].host}`,
            path: '/devMgt/socket.io'
        }
    },
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
                userUpdate: {
                    url: '/user/update',
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
                userMgtDisable: {
                    url: '/user/mgt/disable',
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


                articleQuery: {
                    url: '/article/query',
                    method: 'GET',
                },
                articleDetailQuery: {
                    url: '/article/detailQuery',
                    method: 'GET',
                },
                commentQuery: {
                    url: '/comment/query',
                    method: 'GET',
                },
                commentSubmit: {
                    url: '/comment/submit',
                },
                articleMgtQuery: {
                    url: '/article/mgt/query',
                    method: 'GET',
                },
                articleMgtDetailQuery: {
                    url: '/article/mgt/detailQuery',
                    method: 'GET',
                },
                articleMgtSave: {
                    url: '/article/mgt/save',
                },
                articleMgtDel: {
                    url: '/article/mgt/del',
                },
                articleMgtAudit: {
                    url: '/article/mgt/audit',
                },

                //file

                imgUpload: {
                    url: '/img/upload'
                },
                imgGet: {
                    url: '/img'
                }
            },
        } as TestApiConfigType
    }
};
export default config;