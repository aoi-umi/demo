
import { RequestHandler } from 'express';

import { myEnum } from '@/config';
import { alipayInst, wxpayInst } from '@/3rd-party';
import { NotifyMapper } from '@/models/mongo/notify';
import { SendQueue } from '@/task';

export let alipayNotify: RequestHandler = async (req, res) => {
    let data = req.body;
    let rs = await alipayInst.payNotifyHandler({ ...data }, async (notify) => {
        let notifyType = myEnum.notifyType.支付宝;
        let notifyObj = await NotifyMapper.create({ type: notifyType, value: notify, raw: data });
        await notifyObj.notify.save();

        SendQueue.payNotify({ notifyId: notifyObj.notify._id });
    });
    res.send(rs);
};

export let wxpayNotify: RequestHandler = async (req, res) => {
    let data = req.body;
    let rs = await wxpayInst.payNotifyHandler({ ...data.xml }, async (notify) => {
        let notifyType = myEnum.notifyType.微信;
        let notifyObj = await NotifyMapper.create({ type: notifyType, value: notify, raw: data });
        await notifyObj.notify.save();

        SendQueue.payNotify({ notifyId: notifyObj.notify._id });
    });
    res.send(rs);
};