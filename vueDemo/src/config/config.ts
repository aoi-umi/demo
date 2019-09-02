
import authorityConfig from './authority';

export const dateFormat = 'YYYY-MM-DD HH:mm:ss';
export type RouteConfigType = {
    path: string;
    authority?: string[]
};
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
        path: '/userMgt',
        authority: [authorityConfig.login],
    },
    bookmark: { path: '/bookmark' },
    authority: {
        path: '/authority',
        authority: [authorityConfig.login],
    },
    role: {
        path: '/role',
        authority: [authorityConfig.login],
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
    test: { path: '/test' },
    error: { path: '/error' },
};

export const cacheKey = {
    testUser: 'userCacheKey',
};

export const defaultProfile = '这个人很懒,什么都没写';
export const defaultArticleProfile = defaultProfile;