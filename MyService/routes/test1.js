/**
 * Created by umi on 2017-5-29.
 */
var testService = require('./_service/testService');
var common = require('./_system/common');
exports.testGet = function (req, res) {
    testService.test1({}, function (err, data) {
        res.send(common.formatRes(err, data));
    });
}