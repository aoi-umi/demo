import {
    Model, ModelType, DocType, InstanceType,
    setSchema, setStatic,
} from 'mongoose-ts-ua';
import * as Q from 'q';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { parseBool } from '../../../_system/common';

export type BaseInstanceType = InstanceType<Base>;
export type BaseModelType = ModelType<Base, typeof Base>;
export type BaseDocType = DocType<BaseInstanceType>;
@setSchema()
export class Base extends Model<Base> {
    @setStatic
    static async findAndCountAll<T = BaseInstanceType>(options: {
        conditions?: any,
        projection?: any,
        sort?: any,
        page?: number,
        rows?: number,
        getAll?: boolean | string,
    }) {
        let self = this as BaseModelType;
        let query = self.find(options.conditions, options.projection);
        let getAll = parseBool(options.getAll);
        if (!getAll)
            query.skip((options.page - 1) * options.rows).limit(options.rows);
        let sort = options.sort || {};
        if (!sort._id)
            sort._id = -1;
        query.sort(sort);
        let rs = await Q.all([
            query.exec(),
            getAll ? null : self.find(options.conditions).countDocuments().exec(),
        ]);
        let rows = rs[0] as any as T[];
        let total = getAll ? rows.length : rs[1];
        return {
            docs: rows,
            rows,
            total,
        };
    }

    /**
 	* 分页
 	* @param model
 	* @param pipeline 列表计数共用，过滤条件
 	* @param opt.extraPipeline 仅列表，排序等
     */
    @setStatic
    static async aggregatePaginate<T = any, U = { total: any }>(pipeline: any[], opt?: {
        extraPipeline?: any[];

        //只按其中一个排序
        sortCondition?: Object;
        orderBy?: string;
        sortOrder?: any;

        groupCondition?: U;

        page?: number;
        rows?: number;
        noTotal?: boolean;
        getAll?: boolean;
    }) {
        let model = this as BaseModelType;
        opt = {
            ...opt
        };
        let { noTotal } = opt;
        let extraPipeline = opt.extraPipeline || [];
        //排序
        let sortCondition: any = {};
        if (opt.sortCondition) {
            for (let key in opt.sortCondition) {
                sortCondition[key] = parseInt(opt.sortCondition[key] || -1);
            }
        } else if (opt.orderBy) {
            sortCondition[opt.orderBy] = parseInt(opt.sortOrder || -1);
        }
        if (!sortCondition._id)
            sortCondition._id = -1;
        extraPipeline = [
            ...extraPipeline,
            { $sort: sortCondition }
        ];
        let { getAll } = opt;
        getAll = parseBool(getAll);
        //分页
        if (!opt.page || !opt.rows) {
            getAll = true;
        }
        if (!getAll) {
            opt.page = parseInt(opt.page as any);
            opt.rows = parseInt(opt.rows as any);
            extraPipeline = [
                ...extraPipeline,
                { $skip: (opt.page - 1) * opt.rows },
                { $limit: opt.rows }
            ];
        }
        let group = {
            _id: null,
            total: { $sum: 1 },
        };
        if (opt.groupCondition) {
            group = { ...group, ...opt.groupCondition };
        }
        let [rows, totalRs] = await Promise.all([
            model.aggregate([...pipeline, ...extraPipeline]).exec() as T[],
            !opt.groupCondition && (noTotal || getAll) ?
                [] :
                model.aggregate([...pipeline, {
                    $group: group
                }]).exec()
        ]);
        let groupRs = totalRs[0] || {};
        return {
            rows,
            total: getAll ? rows.length : (groupRs.total as number || 0),
            groupRs: groupRs as { [key in keyof U]: number } & { _id: any, total: number },
        }
    }
}

export class Public {

}