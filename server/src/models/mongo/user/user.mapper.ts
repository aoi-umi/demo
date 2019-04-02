import { Types } from 'mongoose';

import { escapeRegExp } from '../../../_system/common';
import { AuthorityModel } from '../authority';
import { RoleModel } from '../role';
import { UserModel } from ".";

export class UserMapper {
    static async accountExists(account: string) {
        let rs = await UserModel.findOne({ account });
        return rs;
    }

    static async query(data: UserQueryArgs) {
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
                { nickname: anykey },
                { account: anykey },
                { 'authorityList.code': anykey },
                { 'authorityList.name': anykey },
                { 'roleList.code': anykey },
                { 'roleList.name': anykey },
            ]
        }

        if (data.nickname)
            query.nickname = new RegExp(escapeRegExp(data.nickname), 'i');
        if (data.account)
            query.account = new RegExp(escapeRegExp(data.account), 'i');

        let pipeline: any[] = [
            {
                $match: query,
            },
            {
                $project: {
                    password: 0
                }
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
                $lookup: {
                    from: RoleModel.collection.collectionName,
                    let: {
                        roleList: '$roleList'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$code', '$$roleList'] }
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
                    as: 'roleList'
                }
            },
            {
                $match: query2,
            },
        ];
        let rs = await UserModel.aggregatePaginate(pipeline, {
            page: data.page,
            rows: data.rows,
            noTotal,
        });
        return rs;
    }
}

export type UserQueryArgs = {
    _id?: string;
    account?: string;
    nickname?: string;
    authority?: string;
    role?: string;
    anyKey?: string;
} & ApiListQueryArgs;