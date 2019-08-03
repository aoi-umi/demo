
//#region 缓存 
export let cacheKey = {
    user: 'userCacheKey',
    captcha: 'captchaKey'
};

/**缓存时间 秒 */
export let cacheTime = {
    user: 3600 * 24 * 7,
    captcha: 60 * 10
};
//#endregion

export let rootRole = 'root';

export const dateFormat = 'YYYY-MM-DD HH:mm:ss';