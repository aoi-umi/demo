import { myEnum } from "../../../config";
import { NotifyModel } from "./notify";

export class NotifyMapper {
    static async create(data: {
        type,
        value,
        raw
    }) {
        let orderNoRs = NotifyMapper.getOrderNo(data);
        let notify = await NotifyModel.findOne({ orderNo: orderNoRs.outOrderNo });
        let exists = !!notify;
        if (!notify) {
            notify = new NotifyModel({
                type: data.type, value: data.value, raw: data.raw,
                orderNo: orderNoRs.outOrderNo, outOrderNo: orderNoRs.orderNo
            });
        }
        return {
            notify,
            exists
        };
    }

    //获取通知单号
    static getOrderNo(data: { type: number, value: any }) {
        let obj = {
            outOrderNo: '',
            orderNo: '',
        };
        switch (data.type) {
            case myEnum.notifyType.微信: break;
            case myEnum.notifyType.支付宝:
                obj.outOrderNo = data.value.out_trade_no;
                obj.orderNo = data.value.trade_no;
                break;
        }
        return obj;
    }
}