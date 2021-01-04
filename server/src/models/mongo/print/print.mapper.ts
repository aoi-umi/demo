import { LoginUser } from '@/models/login-user';
import * as ValidSchema from '@/valid-schema/class-valid';
import { escapeRegExp } from '@/_system/common';
import { BaseMapper } from '../_base';

import { PrintInstanceType, PrintModel, } from './print';
export class PrintMapper {
    static async query(data: ValidSchema.PrintQuery, opt: {
        user: LoginUser
    }) {
        let query: any = {};

        if (data.name)
            query.name = new RegExp(escapeRegExp(data.name), 'i');
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
            detail = new PrintModel(data);
            await detail.save();
        } else {
            detail = await PrintModel.findOne({ _id: data._id });
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