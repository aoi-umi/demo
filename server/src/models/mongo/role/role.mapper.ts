import { Types } from 'mongoose';
import { myEnum, getEnumValueByStr } from '../../../config/enum';
import { escapeRegExp } from '../../../_system/common';
import * as VaildSchema from '../../../vaild-schema/class-valid';

import { AuthorityModel } from '../authority';
import { UserMapper } from '../user';
import { RoleModel } from ".";

export class RoleMapper {
    static async codeExists(code: string, _id?: any) {
        let cond: any = { code };
        if (_id) {
            cond._id = { $ne: Types.ObjectId(_id) };
        }
        let rs = await RoleModel.findOne(cond);
        return rs;
    }

    static async query(data: VaildSchema.RoleQuery) {
        let query: any = {};
        let noTotal = false;
        if (data._id) {
            query._id = Types.ObjectId(data._id);
            noTotal = true;
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

        let query2: any = {};
        let and2 = [];
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            and2 = [...and2, {
                $or: [
                    { code: anykey },
                    { name: anykey },
                    { 'authorityList': anykey },
                    { 'newAuthorityList.code': anykey },
                    { 'newAuthorityList.name': anykey },
                ]
            }]
        }
        if (data.authority) {
            let authority = new RegExp(escapeRegExp(data.authority), 'i');
            and2 = [...and2, {
                $or: [
                    { 'authorityList': authority },
                    { 'newAuthorityList.code': authority },
                    { 'newAuthorityList.name': authority },
                ]
            }];
        }
        if (and2.length)
            query2.$and = and2;

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
                    as: 'newAuthorityList'
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
            sortOrder: data.sortOrder,
            orderBy: data.orderBy
        });
        rs.rows.forEach(ele => {
            let authorityList = ele.newAuthorityList;
            delete ele.newAuthorityList;
            if (data.includeDelAuth) {
                UserMapper.setDelAuthOrRole(authorityList, ele.authorityList);
            }
            ele.authorityList = authorityList;
        });
        return rs;
    }
}