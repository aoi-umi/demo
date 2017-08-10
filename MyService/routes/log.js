/**
 * Created by bang on 2017-8-10.
 */
var exports = module.exports;
var common = require('./_system/common');
var autoBll = require('./_bll/auto');

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
