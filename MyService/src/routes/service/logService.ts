/**
 * Created by umi on 2017-5-29.
 */
import * as common from '../_system/common';
import { RequestServiceByConfigOption } from '../_system/common';

var getOption = function () {
    var opt: RequestServiceByConfigOption = {
        noLog: true,
        serviceName: 'logService',
        beforeRequest: function (option, args) {
        },
        afterResponse: function (t) {
            if (!t)
                throw common.error('null response');
            if (!t.result) {
                throw common.error(t.desc);
            }
        }
    };
    return opt;
};

export let save = function (data) {
    var opt = getOption();
    opt.methodName = 'save';
    opt.data = data;
    return common.requestServiceByConfig(opt);
};