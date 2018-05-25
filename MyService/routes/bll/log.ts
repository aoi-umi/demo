/**
 * Created by bang on 2017-9-5.
 */
import * as autoBll from './_auto';
import * as common from '../_system/common';
import * as logDal from '../dal/log';

export let query = function (opt) {
    return logDal.query(opt).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count
        };
    });
};