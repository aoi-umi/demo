import { paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';
import { MyRequestHandler } from '@/middleware';

import { PrintMapper } from '@/models/mongo/print';

export const mgtQuery: MyRequestHandler = async (opt) => {
    let rs = await PrintMapper.query();
    return { rows: rs.rows, total: rs.total };
};

export const mgtSave: MyRequestHandler = async (opt) => {
    let rs = await PrintMapper.save(opt.reqData, {user: opt.myData.user});
    return { _id: rs._id };
};