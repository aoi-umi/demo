/**
 * Created by bang on 2017-9-5.
 */
import * as customBll from './_custom';
import * as common from '../_system/common';

export let query = function (opt) {
    return customBll.log.query(opt);
};

export let statistics = function (opt) {
    return customBll.log.statistics(opt);
}