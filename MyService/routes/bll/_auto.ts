import * as path from 'path';
import * as fs from 'fs';

import * as db from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import { Transaction, Model } from 'sequelize';


type AutoBllFun = (name, params, conn?: Transaction) => Q.Promise<any>;
type AutoBllModuleFun = (params, conn?: Transaction) => Q.Promise<any>;

export let getRequire = function (name, option?) {
    var filepath = '';
    let opt = {
        notThrowError: false,
        type: null
    };
    if (option)
        opt = common.extend(opt, option);
    if (!opt.type)
        filepath = '../dal/models/_auto/_auto.' + name + '.model';
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
    let model = getRequire(name).default as Model<any, any>;
    return common.promise(async () => {
        let id = 0;
        if (!params.id || params.id == 0) {
            delete params.id;
            let t = await model.create(params, { transaction: conn });
            id = t.id;
        } else {
            let t = await model.update(params, { where: { id: params.id }, transaction: conn });
            id = params.id;
        }
        return id;
    });
};
export let del: AutoBllFun = function (name, params, conn?) {
    return common.promise(() => {
        let model = getRequire(name).default as Model<any, any>;
        let options = {
            where: { id: params.id },
            transaction: conn
        } as any;
        return model.destroy(options);
    });
};
export let detailQuery: AutoBllFun = function (name, params, conn?) {
    return common.promise(() => {
        let model = getRequire(name).default as Model<any, any>;
        let options = {
            where: { id: params.id },
            transaction: conn
        } as any;
        return model.find(options).then(t => {
            if (t != null)
                return t.dataValues;
        });
    });
};
export let query: AutoBllFun = function (name, params, conn?) {
    return common.promise(() => {
        let model = getRequire(name).default as Model<any, any>;
        
        let options = {
            transaction: conn
        } as any;
        if (params.pageSize && params.pageIndex) {
            options.limit = params.pageSize;
            options.offset = (params.pageIndex - 1) * params.pageSize;
        }
        let attributes:string[] = model.build(params)._modelOptions.instanceMethods.attributes;
        for(let key in params){
            if(!attributes.includes(key))
                delete params[key];
        }
        options.where = params;
        return model.findAndCountAll(options).then(t => {
            return {
                list: t.rows.map(r => r.dataValues),
                count: t.count
            }
        });
    });
};
export let tran = function (fn: (conn: Transaction) => any): Q.Promise<any> {
    return common.promise(() => {
        return db.tranConnect(fn);
    });
};

let moduleList = ['authority', 'log',
    'mainContent', 'mainContentChild', 'mainContentLog', 'mainContentTag', 'mainContentWithType', 'mainContentType',
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
    mainContentWithType?: AutoBllModule;
    mainContentType?: AutoBllModule;
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
moduleList.forEach(moduleName => {
    let autoModule = modules[moduleName] = {};
    methodList.forEach(method => {
        autoModule[method] = (...args) => {
            args.unshift(moduleName);
            return exports[method].apply(void 0, args);
        }
    });
});