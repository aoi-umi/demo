import { Types } from 'mongoose';
import { RoleModel } from ".";
import { AuthorityModel } from '../authority';
import { myEnum, getEnumValueByStr } from '../../../config/enum';
import { escapeRegExp } from '../../../_system/common';

export class RoleMapper {
    static async codeExists(code: string, _id?: any) {
        let cond: any = { code };
        if (_id) {
            cond._id = { $ne: Types.ObjectId(_id) };
        }
        let rs = await RoleModel.findOne(cond);
        return rs;
    }

    static async query(data: RoleQueryArgs) {
        let query: any = {};
        let query2: any = {};
        let noTotal = false;
        if (data._id) {
            query._id = Types.ObjectId(data._id);
            noTotal = true;
        }
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            query2.$or = [
                { code: anykey },
                { name: anykey },
                { 'authorityList.code': anykey },
                { 'authorityList.name': anykey },
            ]
        }

        if (data.name)
            query.name = new RegExp(escapeRegExp(data.name), 'i');
        if (data.code)
            query.code = new RegExp(escapeRegExp(data.code), 'i');
        if (data.status) {
            let status = getEnumValueByStr(myEnum.roleStatus, data.status);
            if (status.length) {
                query.status = { $in: status };
            }
        }

        let pipeline: any[] = [
            {
                $match: query,
            },
            {
                $lookup: {
                    from: AuthorityModel.collection.collectionName,
                    let: {
                        authorityList: '$authorityList'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$code', '$$authorityList'] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                code: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'authorityList'
                }
            },
            {
                $match: query2,
            },
        ];
        let rs = await RoleModel.aggregatePaginate(pipeline, {
            page: data.page,
            rows: data.rows,
            noTotal,
        });
        return rs;
    }
}

export type RoleQueryArgs = {
    _id?: string;
    code?: string;
    name?: string;
    status?: string;
    anyKey?: string;
} & ApiListQueryArgs;