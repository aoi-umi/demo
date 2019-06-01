
import { AccessableUrlConfigType } from '../_system/auth';

//#region 访问权限配置
export let accessableUrlConfig: AccessableUrlConfigType[] = [
    { url: '/devMgt/user/signUp' },
    { url: '/devMgt/user/signIn' },
    { url: '/devMgt/user/signOut' },
    { url: '/devMgt/user/accountExists' },
    { url: '/devMgt/bookmark/query' },
];
//#endregion

//#region 缓存 
export let cacheKey = {
    user: 'userCacheKey',
    captcha: 'captchaKey'
};

/**缓存时间 秒 */
export let cacheTime = {
    user: 7 * 24 * 3600,
    captcha: 10 * 60
};
//#endregion