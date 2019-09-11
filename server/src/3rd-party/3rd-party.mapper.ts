import { myEnum } from "../config";
import * as config from "../config";
import { logger, mq } from "../_main";
import { AssetLogModel, PayInstanceType, AssetLogInstanceType, PayModel } from "../models/mongo/asset";
import { NotifyMapper, NotifyInstanceType, NotifyModel } from "../models/mongo/notify";
import * as common from "../_system/common";
import { alipayInst } from "./alipay";

type NotifyType = {
    notifyId: any,
};
export class ThirdPartyPayMapper {

    static async create(data: {
        type: number,
        pay: PayInstanceType
    }) {
        let pay = data.pay;
        let assetLog = new AssetLogModel({
            sourceType: data.type,
            orderId: pay._id,
            orderNo: pay._id,
            moneyCent: pay.moneyCent,
        });
        let payRs: {
            url?: string
        } = {};
        switch (data.type) {
            case myEnum.assetSourceType.微信:
                break;
            case myEnum.assetSourceType.支付宝:
                assetLog.req = payRs.url = alipayInst.pagePay({
                    out_trade_no: pay._id,
                    subject: pay.title || '无标题',
                    total_amount: pay.money,
                    body: pay.content || '无内容',
                });
                break;
        }
        return {
            assetLog,
            payResult: payRs
        };
    }

    static sendNotifyQueue(data: NotifyType) {
        return mq.sendToQueueDelayByConfig(config.dev.mq.payNotifyHandler, data);
    }

    static async notifyHandler(data: NotifyType) {
        let notify = await NotifyModel.findById(data.notifyId);
        let assetLog: AssetLogInstanceType;
        try {
            assetLog = await AssetLogModel.findOne({ orderNo: notify.orderNo });
            if (!assetLog)
                throw common.error('无对应资金记录');
            if (!assetLog.notifyId) {
                await assetLog.update({ notifyId: notify._id, outOrderNo: notify.outOrderNo });
            } else if (!assetLog.notifyId.equals(notify._id))
                throw common.error('通知id不一致');
            if (notify.type === myEnum.notifyType.支付宝) {
                let rs = await alipayInst.query({
                    out_trade_no: assetLog.orderNo
                });
                if (parseFloat(rs.total_amount as any) !== assetLog.money) {
                    throw common.error('金额不一致');
                }
            } else {
                throw common.error('未实现');
            }
            if (assetLog.status !== myEnum.assetLogStatus.已完成)
                await assetLog.update({ status: myEnum.assetLogStatus.已完成 });
            await PayModel.updateOne({ assetLogId: assetLog._id, status: { $in: [myEnum.payStatus.待处理, myEnum.payStatus.未支付] } }, { status: myEnum.payStatus.已支付 });
        } catch (e) {
            if (assetLog)
                await assetLog.update({ remark: e.message, $push: { remarkList: { msg: e.message, notifyId: notify._id } } });
            logger.error('处理通知出错');
            logger.error(e);
            throw e;
        }
    }
}