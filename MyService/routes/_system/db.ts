/**
 * Created by bang on 2017-8-1.
 */
import * as path from 'path';
import { Sequelize, Model, IFindOptions } from 'sequelize-typescript';
import * as seq from 'sequelize';
import { Utils } from 'sequelize';
import * as common from './common';
import errorConfig from './errorConfig';
import config from '../../config';

export type Transaction = seq.Transaction;
export type ListQueryOption<T> = T & {pageIndex?: number, pageSize?: number, nullList?: string[], orderBy?: any};

let sequelize = new Sequelize({
    database: config.datebase.database,
    dialect: 'mysql',
    username: config.datebase.user,
    password: config.datebase.password,

    modelPaths: [path.resolve(__dirname + '/../dal/models/_auto')],
    operatorsAliases: false,
    logging: false,
});

export let query = function (sql, params, conn?: Transaction): Q.Promise<any[]> {
    return common.promise(async () => {
        sql = sql.replace(/\:(\w+)/g, function (txt, key) {
            if (!params || !params.hasOwnProperty(key) || params[key] === undefined)
                return null;
            return txt;
        });
        let result: any[] = await sequelize.query(sql, {
            replacements: params,
            transaction: conn,
            type: sequelize.QueryTypes.SELECT,
            raw: true,
        });
        result = result.map((v, i) => {
            if (i < result.length - 1) {
                let list = [];
                for (let key in v) {
                    list.push(v[key]);
                }
                return list;
            }
            return v;
        });

        return result;
    }).fail(e => {
        common.writeError(e);
        throw common.error(null, errorConfig.DB_ERROR);
    });
}

//事务连接
export let tranConnect = function (queryFunction: Function) {
    return sequelize.transaction(async (t) => {
        let result = await queryFunction(t);
        return result;
    });
}

export let replaceSpCharLike = function (str: string) {
    str = str.replace(/\\/g, '\\\\');
    str = str.replace(/_/g, '\\_');
    str = str.replace(/%/g, '\\%');
    return str;
}

export class QueryGenerator {
    static selectQuery<T>(t: typeof Model, option: IFindOptions<T> = {}) {
        option = Utils.mapOptionFieldNames(option, t as any);       
        let sql = sequelize.getQueryInterface().QueryGenerator.selectQuery(t.getTableName(), option, t);
        return sql;
    }
}