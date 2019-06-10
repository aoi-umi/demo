
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
    test: { path: '/test' },
    error: { path: '/error' },
};

export const cacheKey = {
    testUser: 'userCacheKey',
};