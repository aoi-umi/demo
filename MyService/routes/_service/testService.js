/**
 * Created by umi on 2017-5-29.
 */
var common = require('../_system/common');
var config = require('../../config');
var getOption = function () {
    var opt = {
        serviceName: 'testService'
    };
    return opt;
};

exports.test = function (data, cb) {
    var opt = getOption();
    opt.method = 'test';
    opt.data = data;
    common.requestServiceFromConfig(opt, cb);
};

exports.test1 = function (data, cb) {
    var opt = getOption();
    opt.serviceName += 'test1';
    opt.method = 'test1';
    opt.data = data;
    common.requestServiceByConfig(opt, cb);
};