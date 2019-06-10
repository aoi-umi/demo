
import { AccessUrlConfigType } from '../_system/auth';
import { authConfig as auth } from './authConfig';

//#region 访问权限配置
export let accessUrlConfig: AccessUrlConfigType[] = [
    { url: '/devMgt/user/mgt/query', auth: [auth.userMgtQuery] },
    { url: '/devMgt/user/mgt/save', auth: [auth.userMgtEdit] },

    { url: '/devMgt/role/query', auth: [auth.roleQuery] },
    { url: '/devMgt/role/save', auth: [auth.roleSave] },
    { url: '/devMgt/role/del', auth: [auth.roleDel] },

    { url: '/devMgt/authority/query', auth: [auth.authorityQuery] },
    { url: '/devMgt/authority/save', auth: [auth.authoritySave] },
    { url: '/devMgt/authority/del', auth: [auth.authorityDel] },
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

export let rootRole = 'root';