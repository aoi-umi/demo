/**
 * Created by umi on 2017-5-29.
 */
var common = require('../_system/common');
var config = require('../../config');
var getOption = function () {
    var opt = {
        serviceName: 'testService',
        beforeRequest: function (option, args) {
        },
        afterResponse:function (t) {
            if(t.result)
                return t.detail;
            else
                throw common.error(t.desc);
        }
    };
    return opt;
};

exports.test = function (data) {
    var opt = getOption();
    opt.methodName = 'test';
    opt.data = data;
    return common.requestServiceByConfigPromise(opt);
};

exports.test1 = function (data, cb) {
    var opt = getOption();
    opt.methodName = 'test1';
    opt.data = data;
    return common.requestServiceByConfigPromise(opt);
};

exports.test2 = function (data, cb) {
    var opt = getOption();
    opt.methodName = 'test2';
    opt.data = data;
    return common.requestServiceByConfigPromise(opt);
};