/**
 * Created by bang on 2017-8-1.
 */
import * as path from 'path';
import { Sequelize, Model, IFindOptions } from 'sequelize-typescript';
import * as common from './common';
import errorConfig from './errorConfig';
import config from '../../config';

let sequelize = new Sequelize({
    database: config.datebase.database,
    dialect: 'mysql',
    username: config.datebase.user,
    password: config.datebase.password,

    modelPaths: [path.resolve(__dirname + '/../dal/models/_auto')],
    operatorsAliases: false,
    logging: false,
});

export let query = function (sql, params, conn?) {
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
export let tranConnect = function (queryFunction) {
    return sequelize.transaction(async (t) => {
        let result = await queryFunction(t);
        return result;
    });
}

export let replaceSpCharLike = function (str) {
    str = str.replace(/\\/g, '\\\\');
    str = str.replace(/_/g, '\\_');
    str = str.replace(/%/g, '\\%');
    return str;
}

export class QueryGenerator {
    static selectQuery<T>(t: typeof Model, option?: IFindOptions<T>) {
        let attributes = [];
        for (let key in t.attributes) {
            let attribute = t.attributes[key];
            if (!attribute.field || attribute.field == key)
                attributes.push(key);
            else
                attributes.push([attribute.field, key]);
        }
        let sql = sequelize.getQueryInterface().QueryGenerator.selectQuery(t.getTableName(), {
            attributes: attributes,
            ...option
        }, t);
        return sql;
    }
}