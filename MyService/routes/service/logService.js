/**
 * Created by umi on 2017-5-29.
 */
var common = require('../_system/common');
var config = require('../../config');
var getOption = function () {
    var opt = {
        noLog: true,
        serviceName: 'logService',
        beforeRequest: function (option, args) {
        },
        afterResponse: function (t) {
            if(!t)
                throw common.error('null response');
            if(!t.result) {
                throw common.error(t.desc);
            }
        }
    };
    return opt;
};

exports.save = function (data) {
    var opt = getOption();
    opt.methodName = 'save';
    opt.data = data;
    return common.requestServiceByConfigPromise(opt);
};