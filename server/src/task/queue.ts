
import { mq } from '@/_main';
import * as config from '@/config';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { NotifyType } from '@/3rd-party';

export class SendQueue {
    static payAutoCancel(data: VaildSchema.PayCancel) {
        return mq.sendToQueueDelayByConfig(config.dev.mq.payAutoCancel, data);
    }

    static payNotify(data: NotifyType) {
        return mq.sendToQueueDelayByConfig(config.dev.mq.payNotifyHandler, data);
    }
}