import * as path from 'path';
import * as fs from 'fs';
import {PoolConnection} from 'mysql';

import * as db from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';

type autoBllFun = (name, params, conn?: PoolConnection) => Q.Promise<any>;
type autoBllModuleFun = (params, conn?: PoolConnection) => Q.Promise<any>;

export let getRequire = function (name, option?) {
    var filepath = '';
    let opt = {
        notThrowError: false,
        type: null
    };
    if (option)
        opt = common.extend(opt, option);
    if (!opt.type)
        filepath = '../dal/_auto/' + name;
    else {
        if (opt.type == 'dal')
            filepath = '../dal/' + name;
        else if (opt.type == 'bll')
            filepath = './' + name;
    }
    if (!filepath)
        throw common.error('path is null', errorConfig.CODE_ERROR);

    var resolvePath = path.resolve(__dirname + '/' + filepath + '.js');
    var isExist = fs.existsSync(resolvePath);
    if (!isExist) {
        if (opt.notThrowError)
            return;
        console.error(resolvePath);
        throw common.error('file is not exist', errorConfig.CODE_ERROR);
    }

    return require(filepath);
}

export let save: autoBllFun = function (name, params, conn?) {
    return getRequire(name).save(params, conn).then(function (t) {
        return t[0][0].id;
    });
};
export let del: autoBllFun = function (name, params, conn?) {
    return getRequire(name).del(params, conn);
};
export let detailQuery: autoBllFun = function (name, params, conn?) {
    return getRequire(name).detailQuery(params, conn).then(function (t) {
        return t[0][0];
    });
};
export let query: autoBllFun = function (name, params, conn?) {
    return getRequire(name).query(params, conn).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        };
    });
};
export let tran = function (fn: (conn: PoolConnection) => any): Q.Promise<any> {
    return db.tranConnect(fn);
};
export let custom = function (name, method, ...args) {
    var bll = getRequire(name, {type: 'bll'});
    if (!bll[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR);
    return bll[method].apply(void 0, args);
};
export let customDal = function (name, method, ...args) {
    var dal = getRequire(name, {type: 'dal'});
    if (!dal[method])
        throw common.error(`method[${method}] is not exist`, errorConfig.CODE_ERROR);
    return dal[method].apply(void 0, args);
};


let moduleList = ['authority', 'log', 
    'mainContent', 'mainContentChild', 'mainContentLog', 'mainContentTag', 'mainContentType', 'mainContentTypeId',
    'role', 'roleWithAuthority', 'struct', 
    'userInfo', 'userInfoLog', 'userInfoWithAuthority', 'userInfoWithRole', 'userInfoWithStruct'];
let methodList = ['save', 'query', 'detailQuery', 'del'];

interface autoBllModules {
    authoritySave?: autoBllModuleFun;
    authorityQuery?: autoBllModuleFun;
    authorityDetailQuery?: autoBllModuleFun;
    authorityDel?: autoBllModuleFun;

    logSave?: autoBllModuleFun;
    logQuery?: autoBllModuleFun;
    logDetailQuery?: autoBllModuleFun;
    logDel?: autoBllModuleFun;

    mainContentSave?: autoBllModuleFun;
    mainContentQuery?: autoBllModuleFun;
    mainContentDetailQuery?: autoBllModuleFun;
    mainContentDel?: autoBllModuleFun;

    mainContentChildSave?: autoBllModuleFun;
    mainContentChildQuery?: autoBllModuleFun;
    mainContentChildDetailQuery?: autoBllModuleFun;
    mainContentChildDel?: autoBllModuleFun;

    mainContentLogSave?: autoBllModuleFun;
    mainContentLogQuery?: autoBllModuleFun;
    mainContentLogDetailQuery?: autoBllModuleFun;
    mainContentLogDel?: autoBllModuleFun;

    mainContentTagSave?: autoBllModuleFun;
    mainContentTagQuery?: autoBllModuleFun;
    mainContentTagDetailQuery?: autoBllModuleFun;
    mainContentTagDel?: autoBllModuleFun;

    mainContentTypeSave?: autoBllModuleFun;
    mainContentTypeQuery?: autoBllModuleFun;
    mainContentTypeDetailQuery?: autoBllModuleFun;
    mainContentTypeDel?: autoBllModuleFun;

    mainContentTypeIdSave?: autoBllModuleFun;
    mainContentTypeIdQuery?: autoBllModuleFun;
    mainContentTypeIdDetailQuery?: autoBllModuleFun;
    mainContentTypeIdDel?: autoBllModuleFun;

    roleSave?: autoBllModuleFun;
    roleQuery?: autoBllModuleFun;
    roleDetailQuery?: autoBllModuleFun;
    roleDel?: autoBllModuleFun;

    roleWithAuthoritySave?: autoBllModuleFun;
    roleWithAuthorityQuery?: autoBllModuleFun;
    roleWithAuthorityDetailQuery?: autoBllModuleFun;
    roleWithAuthorityDel?: autoBllModuleFun;

    structSave?: autoBllModuleFun;
    structQuery?: autoBllModuleFun;
    structDetailQuery?: autoBllModuleFun;
    structDel?: autoBllModuleFun;

    userInfoSave?: autoBllModuleFun;
    userInfoQuery?: autoBllModuleFun;
    userInfoDetailQuery?: autoBllModuleFun;
    userInfoDel?: autoBllModuleFun;

    userInfoLogSave?: autoBllModuleFun;
    userInfoLogQuery?: autoBllModuleFun;
    userInfoLogDetailQuery?: autoBllModuleFun;
    userInfoLogDel?: autoBllModuleFun;

    userInfoWithAuthoritySave?: autoBllModuleFun;
    userInfoWithAuthorityQuery?: autoBllModuleFun;
    userInfoWithAuthorityDetailQuery?: autoBllModuleFun;
    userInfoWithAuthorityDel?: autoBllModuleFun;

    userInfoWithRoleSave?: autoBllModuleFun;
    userInfoWithRoleQuery?: autoBllModuleFun;
    userInfoWithRoleDetailQuery?: autoBllModuleFun;
    userInfoWithRoleDel?: autoBllModuleFun;

    userInfoWithStructSave?: autoBllModuleFun;
    userInfoWithStructQuery?: autoBllModuleFun;
    userInfoWithStructDetailQuery?: autoBllModuleFun;
    userInfoWithStructDel?: autoBllModuleFun;
}

export let modules: autoBllModules = {};
moduleList.forEach(ele => {
    methodList.forEach(method => {
        modules[ele + common.stringToPascal(method)] = (...args) => {
            args.splice(0, 0, ele);
            return exports[method].apply(void 0, args);
        }
    });
});