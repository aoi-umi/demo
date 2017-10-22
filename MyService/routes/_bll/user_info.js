/**
 * Created by umi on 2017-8-7.
 */
var autoBll = require('./auto');
var common = require('../_system/common');

exports.isAccountExist = function (account) {
    return common.promise().then(function () {
        if (!account)
            throw common.error(null, 'ARGS_ERROR');
        return autoBll.query('user_info', {account: account}).then(function (t) {
            return t.list.length;
        });
    });
};