import * as path from 'path';
import * as fs from 'fs';
import {PoolConnection} from 'mysql';

import * as db from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';

type AutoBllFun = (name, params, conn?: PoolConnection) => Q.Promise<any>;
type AutoBllModuleFun = (params, conn?: PoolConnection) => Q.Promise<any>;

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

export let save: AutoBllFun = function (name, params, conn?) {
    return getRequire(name).save(params, conn).then(function (t) {
        return t[0][0].id;
    });
};
export let del: AutoBllFun = function (name, params, conn?) {
    return getRequire(name).del(params, conn);
};
export let detailQuery: AutoBllFun = function (name, params, conn?) {
    return getRequire(name).detailQuery(params, conn).then(function (t) {
        return t[0][0];
    });
};
export let query: AutoBllFun = function (name, params, conn?) {
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

interface AutoBllModule {
    save?: AutoBllModuleFun;
    query?: AutoBllModuleFun;
    detailQuery?: AutoBllModuleFun;
    del?: AutoBllModuleFun;
}

interface AutoBllModules {
    authority?: AutoBllModule;
    log?: AutoBllModule;
    mainContent?: AutoBllModule;
    mainContentChild?: AutoBllModule;
    mainContentLog?: AutoBllModule;
    mainContentTag?: AutoBllModule;
    mainContentType?: AutoBllModule;
    mainContentTypeId?: AutoBllModule;
    role?: AutoBllModule;
    roleWithAuthority?: AutoBllModule;
    struct?: AutoBllModule;
    userInfo?: AutoBllModule;
    userInfoLog?: AutoBllModule;
    userInfoWithAuthority?: AutoBllModule;
    userInfoWithRole?: AutoBllModule;
    userInfoWithStruct?: AutoBllModule;
}

export let modules: AutoBllModules = {};
moduleList.forEach(ele => {
    let autoModule = modules[ele] = {};
    methodList.forEach(method => {
        autoModule[method] = (...args) => {
            args.splice(0, 0, ele);
            return exports[method].apply(void 0, args);
        }
    });
});