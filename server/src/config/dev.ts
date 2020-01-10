import { MQ, defaultDelayTime } from "amqplib-delay";

export default {
    //#region 缓存
    /**缓存时间 秒 */
    cache: {
        user: {
            prefix: 'userCacheKey',
            time: 3600 * 24 * 7,
        },
        captcha: {
            prefix: 'captchaKey',
            time: 60 * 10,
        },
        wxAuthCode: {
            prefix: 'wxAuthCode',
            time: 3600 * 24,
        }
    },
    //自动重新登录时间 秒
    autoLoginTime: 3600 * 2,
    //#endregion
    rootRole: 'root',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',

    mq: {
        //处理支付通知
        payNotifyHandler: {
            ...MQ.createQueueKey('payNotifyHandler'),
            delay: 1,
            retryExpire: [
                defaultDelayTime["15s"],
                defaultDelayTime["30s"],
                defaultDelayTime["1m"],
            ],
        },
        payAutoCancel: {
            ...MQ.createQueueKey('payAutoCancel'),
            delay: 1000 * 60 * 16,
        },
    }
};