

import * as VaildSchema from '@/vaild-schema/class-valid';
import { Auth } from '@/_system/auth';
import { escapeRegExp, error } from '@/_system/common';
import * as helpers from '@/helpers';
import * as config from '@/config';
import { myEnum } from '@/config';

import { LoginUser } from '../../login-user';
import { BaseMapper } from "../_base";
import { UserMapper } from '../user';
import { AssetLogMapper } from './asset-log.mapper';
import { PayModel } from "./pay";

export class PayMapper {
    static async query(data: VaildSchema.PayQuery, opt: {
        user: LoginUser
        imgHost?: string;
    }) {
        opt = {
            ...opt
        };
        let match: any = {};

        if (!Auth.includes(opt.user, config.auth.payMgtQuery)) {
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
        let createdAt = helpers.dbDateMatch(data.createdAtFrom, data.createdAtTo).mongoDate;
        if (createdAt)
            match.createdAt = createdAt;

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
        if (!opt.user.equalsId(detail.userId)) {
            detail.canPay = detail.canCancel = false;
        }
    }

    static async cancel(data: VaildSchema.PayCancel, opt: { auto?: boolean, user?: LoginUser }) {
        let { user, auto } = opt;
        let match: any = { _id: data._id };
        if (!auto)
            match.userId = user._id;
        let detail = await PayModel.findOne(match);
        if (!detail)
            throw error('', config.error.NO_MATCH_DATA);
        if (detail.status !== myEnum.payStatus.已取消) {
            if (!detail.canCancel) {
                if (auto)
                    return;
                throw error('当前状态无法取消');
            }
            let toStatus = myEnum.payStatus.已取消;
            await detail.update({ status: toStatus });
            detail.status = toStatus;
        }
        if (!auto) {
            let obj = detail.toJSON();
            let rtn = {
                userId: obj.userId,
                status: obj.status,
                statusText: obj.statusText,
                canCancel: obj.canCancel,
                canPay: obj.canPay,
            };
            PayMapper.resetDetail(rtn, { user });
            return rtn;
        }
    }
}