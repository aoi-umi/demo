/**
 * Created by bang on 2017-9-5.
 */
import * as autoBll from './_auto';
import { SaveOptions } from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import { StructModel } from '../dal/models/dbModel';
type StructDataType = StructModel.StructDataType;

export let save = function (opt: SaveOptions<StructDataType>) {
    return isExist(opt).then(function (t) {
        if (t) {
            throw common.error('struct [' + opt.struct + '] is exist');
        }
        return autoBll.modules.struct.save(opt);
    });
};

export let isExist = function (opt: { id?: number, struct?: string }) {
    return common.promise(async function () {
        if (!opt || !opt.struct)
            throw common.error(null, errorConfig.ARGS_ERROR);
        let t = await autoBll.modules.struct.query({ struct: opt.struct });
        let result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复架构', errorConfig.DB_DATA_ERROR);
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};