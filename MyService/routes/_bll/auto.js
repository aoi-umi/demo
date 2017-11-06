var db = require('../_system/db');
var common = require('../_system/common');

function getRequire(name, custom) {
    if(!custom)
	    return require('../_dal/' + name + '_auto');
    else if(custom == 'dal')
        return require('../_dal/' + name);
    else if(custom == 'bll')
        return require('./' + name);

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
exports.custom = function (name, method, opt) {
    return getRequire(name, 'bll')[method](opt);
};
exports.customDal = function (name, method, opt) {
    return getRequire(name, 'dal')[method](opt);
};
