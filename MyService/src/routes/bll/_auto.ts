import * as path from 'path';
import * as fs from 'fs';
import { Model, FindOptions, Op } from 'sequelize';
import { IFindOptions, Model as ModelTs } from 'sequelize-typescript';
import { Omit, RecursivePartial } from 'sequelize-typescript/lib/utils/types';

import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
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
        let nullList = params.nullList || [];
        delete params.nullList;
        for (let key in params) {
            if (nullList.includes(key))
                params[key] = null;
            else if (params[key] === null)
                delete params[key];
        }
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
        let options = createQueryOption(model, params) as any as FindOptions<any>;
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

export let createQueryOption = function <T>(model: any, params, opt?: { likeKeyList?: string[] }) {
    opt = {
        ...opt,
    }
    let options: IFindOptions<T> = {
        where: {}
    };
    if (params.pageSize && params.pageIndex) {
        options.limit = params.pageSize;
        options.offset = (params.pageIndex - 1) * params.pageSize;
    }
    let m = model as Model<any, any>;
    let attributes: string[] = m.build(params)._modelOptions.instanceMethods.attributes;
    for (let key in params) {
        let val = params[key];
        if (null !== val && attributes.includes(key)) {
            if (opt.likeKeyList && opt.likeKeyList.includes(key))
                options.where[key] = { [Op.like]: `%${db.replaceSpCharLike(val)}%` };
            else
                options.where[key] = val;
        }
    }
    return options;
}

let methodList = ['save', 'query', 'detailQuery', 'del'];

interface AutoBllModule<T> {
    save?: AutoBllModuleFun<string | number>;
    query?: AutoBllModuleFun<{ list: Array<T>, count: number }>;
    detailQuery?: AutoBllModuleFun<T>;
    del?: AutoBllModuleFun<number>;
}

interface AutoBllModules {
    authority?: AutoBllModule<dbModel.AuthorityModel.AuthorityDataType>;
    log?: AutoBllModule<dbModel.LogModel.LogDataType>;
    mainContent?: AutoBllModule<dbModel.MainContentModel.MainContentDataType>;
    mainContentChild?: AutoBllModule<dbModel.MainContentChildModel.MainContentChildDataType>;
    mainContentLog?: AutoBllModule<dbModel.MainContentLogModel.MainContentLogDataType>;
    mainContentTag?: AutoBllModule<dbModel.MainContentTagModel.MainContentTagDataType>;
    mainContentWithType?: AutoBllModule<dbModel.MainContentTypeModel.MainContentTypeDataType>;
    mainContentType?: AutoBllModule<dbModel.MainContentTypeModel.MainContentTypeDataType>;
    role?: AutoBllModule<dbModel.RoleModel.RoleDataType>;
    roleWithAuthority?: AutoBllModule<dbModel.RoleWithAuthorityModel.RoleWithAuthorityDataType>;
    struct?: AutoBllModule<dbModel.StructModel.StructDataType>;
    userInfo?: AutoBllModule<dbModel.UserInfoModel.UserInfoDataType>;
    userInfoLog?: AutoBllModule<dbModel.UserInfoLogModel.UserInfoLogDataType>;
    userInfoWithAuthority?: AutoBllModule<dbModel.UserInfoWithAuthorityModel.UserInfoWithAuthorityDataType>;
    userInfoWithRole?: AutoBllModule<dbModel.UserInfoWithRoleModel.UserInfoWithRoleDataType>;
    userInfoWithStruct?: AutoBllModule<dbModel.UserInfoWithStructModel.UserInfoWithStructDataType>;
}

export let modules: AutoBllModules = {};
let files = fs.readdirSync(path.resolve(`${__dirname}/${dalModelsPath}`));

files.forEach(filename => {
    let match = /_auto\.([\S]+)\.model/.exec(filename);
    if (!match)
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