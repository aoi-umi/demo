/**
 * Created by umi on 2017-5-29.
 */
var testService = require('./_service/testService');
var common = require('./_system/common');
exports.get = function (req, res) {
    testService.test({}, function (err, data) {
        res.send(common.formatRes(err, data));
    });
}

exports.getPromise = function (req, res) {
    testService.testPromise({}).then(function (t) {
        res.send(common.formatRes(null, t));
    }).catch(function (e) {
        res.send(common.formatRes(e));
    })
}