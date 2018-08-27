import * as path from 'path';
import * as fs from 'fs';

import * as db from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import { Transaction, Model } from 'sequelize';
import { FilteredModelAttributes } from 'sequelize-typescript/lib/models/Model';
import * as dbModel from '../dal/models/dbModel';


type AutoBllFun = (name, params, conn?: Transaction) => Q.Promise<any>;
type AutoBllModuleFun<T> = (params, conn?: Transaction) => Q.Promise<T>;
let dalModelsPath = '../dal/models/_auto';
export let getRequire = function (name, option?) {
    var filepath = '';
    let opt = {
        notThrowError: false,
        type: null
    };
    if (option)
        opt = common.extend(opt, option);
    if (!opt.type)
        filepath = `${dalModelsPath}/_auto.${name}.model`;
    else {
        if (opt.type == 'dal')
            filepath = `../dal/${name}`;
        else if (opt.type == 'bll')
            filepath = `./${name}`;
    }
    if (!filepath)
        throw common.error('path is null', errorConfig.CODE_ERROR);

    var resolvePath = path.resolve(`${__dirname}/${filepath}.js`);
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
        let options = createQueryOption(model, params);
        options.transaction = conn;
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

export let createQueryOption = function(model, params){
    let options = {
        where: {}
    } as any;
    if (params.pageSize && params.pageIndex) {
        options.limit = params.pageSize;
        options.offset = (params.pageIndex - 1) * params.pageSize;
    }
    let attributes:string[] = model.build(params)._modelOptions.instanceMethods.attributes;
    for (let key in params) {
        if (attributes.includes(key))
            options.where[key] = params[key];
    }
    return options;
}

let methodList = ['save', 'query', 'detailQuery', 'del'];

interface AutoBllModule<T> {
    save?: AutoBllModuleFun<string | number>;
    query?: AutoBllModuleFun<{list: Array<T>, count: number}>;
    detailQuery?: AutoBllModuleFun<T>;
    del?: AutoBllModuleFun<number>;
}

interface AutoBllModules {
    authority?: AutoBllModule<FilteredModelAttributes<dbModel.Authority>>;
    log?: AutoBllModule<FilteredModelAttributes<dbModel.Log>>;
    mainContent?: AutoBllModule<FilteredModelAttributes<dbModel.MainContent>>;
    mainContentChild?: AutoBllModule<FilteredModelAttributes<dbModel.MainContentChild>>;
    mainContentLog?: AutoBllModule<FilteredModelAttributes<dbModel.MainContentLog>>;
    mainContentTag?: AutoBllModule<FilteredModelAttributes<dbModel.MainContentTag>>;
    mainContentWithType?: AutoBllModule<FilteredModelAttributes<dbModel.MainContentWithType>>;
    mainContentType?: AutoBllModule<FilteredModelAttributes<dbModel.MainContentType>>;
    role?: AutoBllModule<FilteredModelAttributes<dbModel.Role>>;
    roleWithAuthority?: AutoBllModule<FilteredModelAttributes<dbModel.RoleWithAuthority>>;
    struct?: AutoBllModule<FilteredModelAttributes<dbModel.Struct>>;
    userInfo?: AutoBllModule<FilteredModelAttributes<dbModel.UserInfo>>;
    userInfoLog?: AutoBllModule<FilteredModelAttributes<dbModel.UserInfoLog>>;
    userInfoWithAuthority?: AutoBllModule<FilteredModelAttributes<dbModel.UserInfoWithAuthority>>;
    userInfoWithRole?: AutoBllModule<FilteredModelAttributes<dbModel.UserInfoWithRole>>;
    userInfoWithStruct?: AutoBllModule<FilteredModelAttributes<dbModel.UserInfoWithStruct>>;
}

export let modules: AutoBllModules = {};
let files = fs.readdirSync(path.resolve(`${__dirname}/${dalModelsPath}`));

files.forEach(filename => {
    let match =  /_auto\.([\S]+)\.model/.exec(filename);
    if(!match)
        throw common.error(`error dal model: ${filename}`);
    let moduleName = match[1];
    let autoModule = modules[moduleName] = {};
    methodList.forEach(method => {
        autoModule[method] = (...args) => {
            args.unshift(moduleName);
            return exports[method].apply(void 0, args);
        }
    });
});