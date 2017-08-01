/**
 * Created by umi on 2017-5-29.
 */
var testService = require('./_service/testService');
var common = require('./_system/common');
exports.get = function (req, res) {
    testService.test({}, function (err, data) {
        res.send(common.formatRes(err, data));
    });
};

exports.getPromise = function (req, res) {
    var query = req.query;
    testService.testPromise().then(function (t) {
        if (query.code != 'success')
            throw common.error('promise error', query.code, {message: 'opt_promise error', code: 'opt_' + query.code});
        res.send(common.formatRes(null, t, 'promise success'));
    }).catch(function (e) {
        res.send(common.formatRes(e, {err_code: '400'}));
    }).finally(function(){
        console.log('finally')
    });
};

exports.testGet = function (req, res) {
    testService.test1({}, function (err, data) {
        res.send(common.formatRes(err, data));
    });
};

exports.get2 = function (req, res) {
    testService.test2({}, function (err, data) {
        res.send(common.formatRes(err, data));
    });
};

exports.getReg = function (req, res) {
    res.send(common.formatRes(null, req.url));
};