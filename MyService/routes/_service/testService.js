/**
 * Created by umi on 2017-5-29.
 */
var common = require('../_system/common');
var config = require('../../config');
var getOption = function () {
    var opt = {
        serviceName: 'testService',
        beforeSend: function (option, args) {
        }
    };
    return opt;
};

exports.test = function (data, cb) {
    var opt = getOption();
    opt.methodName = 'test';
    opt.data = data;
    common.requestServiceByConfig(opt, cb);
};

exports.test1 = function (data, cb) {
    var opt = getOption();
    opt.methodName = 'test1';
    opt.data = data;
    common.requestServiceByConfig(opt, cb);
};
exports.test2 = function (data, cb) {
    var opt = getOption();
    opt.methodName = 'test2';
    opt.data = data;
    common.requestServiceByConfig(opt, cb);
};