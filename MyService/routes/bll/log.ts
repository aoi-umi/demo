/**
 * Created by bang on 2017-9-5.
 */
import * as common from '../_system/common';
import * as logDal from '../dal/log';

export let query = function (opt) {
    return common.promise(async () => {
        let t = await logDal.query(opt);
        return {
            list: t[0],
            count: t[1][0].count
        };
    });
};

export let statistics = function (opt) {
    return common.promise(async () => {
        let t = await logDal.statistics(opt);
        return {
            list: t[0]
        };
    });
}