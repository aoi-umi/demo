/**
 * Created by bang on 2017-9-5.
 */
import * as autoBll from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';

export let save = function (opt) {
    return common.promise(async () => {
        let t = await isExist(opt);
        if (t) {
            throw common.error('type [' + opt.type + '] is exist');
        }
        return autoBll.modules.mainContentType.save(opt);
    });
};

export let isExist = function (opt) {
    return common.promise(async function () {
        if (!opt || !opt.type)
            throw common.error(null, errorConfig.ARGS_ERROR);
        let t = await autoBll.modules.mainContentType.query({type: opt.type});
        let result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复类型', errorConfig.DB_DATA_ERROR);
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};