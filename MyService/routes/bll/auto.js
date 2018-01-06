var path = require('path');
var fs = require('fs');

var db = require('../_system/db');
var common = require('../_system/common');
var errorConfig = require('../_system/errorConfig');

function getRequire(name, custom) {
    var filepath = '';
    if (!custom)
        filepath = '../dal/' + name + '_auto';
    else {
        if (custom == 'dal')
            filepath = '../dal/' + name;
        else if (custom == 'bll')
            filepath = './' + name;
    }
    if (!filepath)
        throw common.error('path is null', errorConfig.CODE_ERROR.code);

    var resolvePath = path.resolve(__dirname + '/' + filepath + '.js');
    var isExist = fs.existsSync(resolvePath);
    if (!isExist) {
        console.error(resolvePath);
        throw common.error('file is not exist', errorConfig.CODE_ERROR.code);
    }

    return require(filepath);
}

exports.save = function (name, params, conn) {
    return getRequire(name).save(params, conn).then(function (t) {
        return t[0][0].id;
    });
};
exports.del = function (name, params, conn) {
    return getRequire(name).del(params, conn);
};
exports.detailQuery = function (name, params, conn) {
    return getRequire(name).detailQuery(params, conn).then(function (t) {
        return t[0][0];
    });
};
exports.query = function (name, params, conn) {
    return getRequire(name).query(params, conn).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        };
    });
};
exports.tran = function (fn) {
    var res = common.defer();
    db.tranConnect(function (conn) {
        var resData = [];
        return common.promise().then(function () {
            return fn(conn, res);
        }).then(res.resolve).fail(function (e) {
            throw e;
        });
    }).then(function () {
        //console.log(arguments)
    }).fail(res.reject);
    return res.promise;
};
exports.custom = function (name, method, params, exOpt, conn) {
    var bll = getRequire(name, 'bll');
    if (!bll[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR.code);
    return bll[method](params, exOpt, conn);
};
exports.customDal = function (name, method, params, conn) {
    var dal = getRequire(name, 'dal');
    if (!dal[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR.code);
    return dal[method](params, conn);
};
