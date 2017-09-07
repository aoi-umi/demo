/**
 * Created by bang on 2017-9-7.
 */
var exports = module.exports;
var common = require('./_system/common');
var autoBll = require('./_bll/auto');

exports.view = function(req, res){
    res.myRender('log');
}

exports.save = function (req, res) {
    var args = req.body;
    common.promise().then(function (e) {
        return autoBll.save('log', args);
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};

exports.query = function(req, res){
    var args = req.body;
    common.promise().then(function (e) {
        return autoBll.custom('log', 'query', args);
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};