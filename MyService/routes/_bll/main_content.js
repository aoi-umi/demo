/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var common = require('../_system/common');
var main_content = exports;

exports.query= function(opt) {
    return common.promise().then(function () {
        return autoBll.query('main_content', opt).then(function (t) {
            return t;
        });
    });
};

exports.detailQuery = function(opt) {
    return common.promise().then(function () {
        return autoBll.detailQuery('main_content', opt).then(function (t) {
            if(!t)
                throw common.error('', 'DB_NO_DATA');
            return t;
        });
    });
};