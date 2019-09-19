
import authorityConfig from './authority';

export const dateFormat = 'YYYY-MM-DD HH:mm:ss';
export type RouteConfigType = {
    path: string;
    authority?: string[]
};
let adminPath = '/admin';
export const routeConfig = {
    index: { path: '/' },
    //个人中心
    userInfo: {
        path: '/user/info',
        authority: [authorityConfig.login],
    },
    userSignIn: { path: '/user/signIn' },
    userSignUp: { path: '/user/signUp' },
    userChat: {
        path: '/user/chat',
        authority: [authorityConfig.login],
    },
    //管理
    userMgt: {
        path: adminPath + '/userMgt',
        authority: [authorityConfig.login, authorityConfig.userMgtQuery],
    },
    bookmark: { path: '/bookmark' },
    authority: {
        path: adminPath + '/authorityMgt',
        authority: [authorityConfig.login, authorityConfig.authorityQuery],
    },
    role: {
        path: adminPath + '/roleMgt',
        authority: [authorityConfig.login, authorityConfig.roleQuery],
    },
    article: { path: '/article' },
    articleDetail: { path: '/article/detail' },
    articleMgt: {
        path: '/articleMgt',
        authority: [authorityConfig.login],
    },
    articleMgtDetail: {
        path: '/articleMgt/detail',
        authority: [authorityConfig.login],
    },
    articleMgtEdit: {
        path: '/articleMgt/edit',
        authority: [authorityConfig.login],
    },
    payMgt: {
        path: '/payMgt',
        authority: [authorityConfig.login],
    },
    admin: {
        path: adminPath,
        authority: [authorityConfig.login],
    },
    assetMgt: {
        path: adminPath + '/assetMgt',
        authority: [authorityConfig.login, authorityConfig.payMgtQuery],
    },
    assetMgtLog: {
        path: adminPath + '/assetMgt/log',
        authority: [authorityConfig.login, authorityConfig.payMgtQuery],
    },
    assetMgtNotify: {
        path: adminPath + '/assetMgt/notify',
        authority: [authorityConfig.login, authorityConfig.payMgtQuery],
    },
    test: { path: '/test' },
    error: { path: '/error' },
};

export const cacheKey = {
    testUser: 'userCacheKey',
};

export const defaultProfile = '这个人很懒,什么都没写';
export const defaultArticleProfile = defaultProfile;