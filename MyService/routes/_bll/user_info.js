/**
 * Created by umi on 2017-8-7.
 */
var autoBll = require('./auto');
var exports = module.exports;

exports.isAccountExist = function (account) {
    return autoBll.query('user_info', {account: account}).then(function (t) {
        return t.list.length;
    });
};