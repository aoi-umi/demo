/**
 * Created by bang on 2017-9-5.
 */
import * as autoBll from './_auto';
import * as common from '../_system/common';

export let query = function (opt) {
    return autoBll.customDal('log', 'query', opt).then(function (t) {
        var resData: any = {};
        resData.list = t[0];
        resData.count = t[1][0].count;
        return resData;
    });
};