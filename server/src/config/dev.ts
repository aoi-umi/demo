import { MQ, defaultExpTime } from "../_system/mq";

export default {
    //#region 缓存 
    cacheKey: {
        user: 'userCacheKey',
        captcha: 'captchaKey'
    },

    /**缓存时间 秒 */
    cacheTime: {
        user: 3600 * 24 * 7,
        captcha: 60 * 10
    },
    //#endregion
    rootRole: 'root',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',

    mq: {
        //处理支付通知
        payNotifyHandler: {
            ...MQ.createQueueKey('payNotifyHandler'),
            delay: 1,
            retryExpire: [
                defaultExpTime["15s"],
                defaultExpTime["30s"],
                defaultExpTime["1m"],
            ],
        }
    }
};