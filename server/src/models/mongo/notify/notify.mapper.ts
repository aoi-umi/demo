import { myEnum } from "../../../config";
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { escapeRegExp } from "../../../_system/common";
import { BaseMapper } from "../_base";
import { NotifyModel } from "./notify";
import { AssetLogModel } from "../asset";

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

    static async query(data: VaildSchema.AssetNotifyQuery) {
        let match: any = {};
        if (data.orderNo)
            match.orderNo = new RegExp(escapeRegExp(data.orderNo), 'i');
        if (data.outOrderNo)
            match.outOrderNo = new RegExp(escapeRegExp(data.outOrderNo), 'i');
        let rs = await NotifyModel.aggregatePaginate([
            { $match: match },
            {
                $lookup: {
                    from: AssetLogModel.collection.collectionName,
                    localField: 'orderNo',
                    foreignField: 'orderNo',
                    as: 'assetLog'
                }
            },
            { $unwind: { path: '$assetLog', preserveNullAndEmptyArrays: true } }
        ], {
            ...BaseMapper.getListOptions(data)
        });
        rs.rows = rs.rows.map(ele => {
            let obj = new NotifyModel(ele).toJSON();
            if (ele.assetLog) {
                obj.assetLog = {
                    status: ele.assetLog.status,
                    statusText: myEnum.assetLogStatus.getKey(ele.assetLog.status)
                };
            }
            return obj;
        });
        return rs;
    }
}