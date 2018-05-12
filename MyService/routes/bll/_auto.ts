import * as path from 'path';
import * as fs from 'fs';

import * as db from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';

function getRequire(name, custom?) {
    var filepath = '';
    if (!custom)
        filepath = '../dal/_auto/' + name;
    else {
        if (custom == 'dal')
            filepath = '../dal/' + name;
        else if (custom == 'bll')
            filepath = './' + name;
    }
    if (!filepath)
        throw common.error('path is null', errorConfig.CODE_ERROR);

    var resolvePath = path.resolve(__dirname + '/' + filepath + '.js');
    var isExist = fs.existsSync(resolvePath);
    if (!isExist) {
        console.error(resolvePath);
        throw common.error('file is not exist', errorConfig.CODE_ERROR);
    }

    return require(filepath);
}

export let save = function (name, params, conn?) {
    return getRequire(name).save(params, conn).then(function (t) {
        return t[0][0].id;
    });
};
export let del = function (name, params, conn?) {
    return getRequire(name).del(params, conn);
};
export let detailQuery = function (name, params, conn?) {
    return getRequire(name).detailQuery(params, conn).then(function (t) {
        return t[0][0];
    });
};
export let query = function (name, params, conn?) {
    return getRequire(name).query(params, conn).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        };
    });
};
export let tran = function (fn) {
    return common.promise((def) => {
        db.tranConnect(function (conn) {
            return common.promise(function () {
                return fn(conn);
            }).then(def.resolve).fail(function (e) {
                throw e;
            });
        }).then(function () {
            //console.log(arguments)
        }).fail(def.reject);
        return def.promise;
    });
};
export let custom = function (name, method, params, exOpt?, conn?) {
    var bll = getRequire(name, 'bll');
    if (!bll[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR);
    return bll[method](params, exOpt, conn);
};
export let customDal = function (name, method, params?, conn?) {
    var dal = getRequire(name, 'dal');
    if (!dal[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR);
    return dal[method](params, conn);
};
