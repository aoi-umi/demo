

import * as VaildSchema from '../../../vaild-schema/class-valid';
import { Auth } from '../../../_system/auth';
import * as config from '../../../config';
import { myEnum } from '../../../config';
import { LoginUser } from '../../login-user';
import { BaseMapper } from "../_base";
import { UserMapper } from '../user';
import { AssetLogMapper } from './asset-log.mapper';
import { PayModel } from "./pay";
import { escapeRegExp } from '../../../_system/common';

export class PayMapper {
    static async query(data: VaildSchema.PayQuery, opt: {
        user: LoginUser
        imgHost?: string;
    }) {
        opt = {
            ...opt
        };
        let match: any = {};

        if (!Auth.includes(opt.user, config.auth.payMgt)) {
            match.userId = opt.user._id;
        }

        if (data.status)
            match.status = { $in: data.status.split(',').map(ele => parseInt(ele)) };
        if (data.type)
            match.type = { $in: data.type.split(',').map(ele => parseInt(ele)) };
        if (data.anyKey) {
            let reg = new RegExp(escapeRegExp(data.anyKey), 'i');
            match.$or = [{
                title: reg,
            }, {
                content: reg,
            }];
        }

        let match2: any = {};
        if (data.orderNo)
            match2['assetLog.orderNo'] = new RegExp(escapeRegExp(data.orderNo), 'i');
        if (data.outOrderNo)
            match2['assetLog.outOrderNo'] = new RegExp(escapeRegExp(data.outOrderNo), 'i');

        let rs = await PayModel.aggregatePaginate([
            { $match: match },
            ...UserMapper.lookupPipeline(),
            ...AssetLogMapper.lookupPipeline(),
            { $match: match2 },
        ], {
            ...BaseMapper.getListOptions(data)
        });
        rs.rows = rs.rows.map(ele => {
            let obj = new PayModel(ele).toJSON();
            UserMapper.resetDetail(ele.user, { imgHost: opt.imgHost });
            obj.user = ele.user;
            obj.orderNo = ele.assetLog.orderNo;
            obj.outOrderNo = ele.assetLog.outOrderNo || '';
            PayMapper.resetDetail(obj, { user: opt.user });
            return obj;
        });
        return rs;
    }

    static resetDetail(detail, opt: { user: LoginUser }) {
        detail.canPay = detail.canCancel = false;
        if (opt.user.equalsId(detail.userId)) {
            detail.canPay = [myEnum.payStatus.未支付].includes(detail.status);
            detail.canCancel = [myEnum.payStatus.未支付].includes(detail.status);
        }
    }
}