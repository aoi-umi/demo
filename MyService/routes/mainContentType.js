/**
 * Created by bang on 2017-9-7.
 */
var exports = module.exports;
var common = require('./_system/common');
var autoBll = require('./_bll/auto');

exports.save = function (req, res) {
    var args = req.body;
    common.promise().then(function (e) {
        return autoBll.save('main_content_type', args);
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};

exports.query = function(req, res){
    var args = req.body;
    common.promise().then(function (e) {
        return autoBll.query('main_content_type', args);
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};