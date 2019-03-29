
import authorityConfig from './authority';

export const dateFormat = 'YYYY-MM-DD HH:mm:ss';
export type RouteConfigType = {
    path: string;
    authority?: string[]
};
export const routeConfig = {
    index: { path: '/' },
    //个人中心
    userAccount: {
        path: '/user/account',
        authority: [authorityConfig.Login],
    },
    userSignUp: { path: '/user/signUp' },
    //管理
    adminUser: {
        path: '/user',
        authority: [authorityConfig.Login],
    },
    bookmark: { path: '/bookmark' },
    authority: {
        path: '/authority',
        authority: [authorityConfig.Login],
    },
    role: {
        path: '/role',
        authority: [authorityConfig.Login],
    },
    test: { path: '/test' },
};

export const cacheKey = {
    testUser: 'userCacheKey',
};