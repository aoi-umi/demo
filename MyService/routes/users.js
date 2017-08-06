var exports = module.exports;
var common = require('./_system/common');
var errorConfig = require('./_system/errorConfig');
var autoBll = require('./_bll/auto');

exports.signUp = function (req, res) {
    var args = req.body;
    common.promise().then(function (e) {
        if (!args.userName)
            throw common.error('', errorConfig.CAN_NOT_BE_EMPTY);
        return autoBll.query('user_info', {account: args.userName});
    }).then(function (t) {
        if (t.list.length)
            throw common.error('account is exist!');
        return autoBll.save('user_info', {
            account: args.userName,
            password: args.pwd,
            create_datetime: new Date()
        });
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};
