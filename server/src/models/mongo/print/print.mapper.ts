import { LoginUser } from '@/models/login-user';
import * as ValidSchema from '@/valid-schema/class-valid';
import { escapeRegExp } from '@/_system/common';
import { BaseMapper } from '../_base';

import { PrintInstanceType, PrintModel, } from './print';
export class PrintMapper {
    static async query(data: ValidSchema.PrintQuery, opt: {
        user: LoginUser
    }) {
        let query: any = {}, $and = [];

        if (data.name)
            query.name = new RegExp(escapeRegExp(data.name), 'i');
        if (opt.user.isLogin) {
            $and.push({
                $or: [{ userId: null }, { userId: opt.user._id }]
            });
        } else {
            $and.push({
                $or: [{ userId: null }, ]
            });
        }
        if ($and.length)
            query.$and = $and;
        let rs = await PrintModel.findAndCountAll({
            ...BaseMapper.getListOptions(data),
            conditions: query,
            projection: { data: 0 },
        });
        return rs;
    }

    static async detailQuery(data: ValidSchema.PrintDetailQuery, opt: {
        user: LoginUser
    }) {
        let rs = await PrintModel.findById(data._id);
        return rs;
    }

    static async save(data: any, opt: {
        user: LoginUser
    }) {
        let detail: PrintInstanceType;
        if (!data._id) {
            delete data._id;
            if (opt.user.isLogin)
                data.userId = opt.user._id;
            detail = new PrintModel(data);
            await detail.save();
        } else {
            detail = await PrintModel.findOne({ _id: data._id });
            if (detail.userId && !opt.user.equalsId(detail.userId))
                throw new Error('无权限修改');
            let update: any = {};
            ['name', 'data'].forEach(key => {
                console.log(key);
                update[key] = data[key];
            });
            await detail.update(update);
        }
        return detail;
    }
}