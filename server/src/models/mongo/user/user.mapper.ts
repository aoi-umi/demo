import { Types } from 'mongoose';

import { escapeRegExp } from '../../../_system/common';
import { AuthorityModel } from '../authority';
import { RoleModel } from '../role';
import { UserModel } from ".";
import { myEnum } from '../../../config/enum';

export class UserMapper {
    static async accountExists(account: string) {
        let rs = await UserModel.findOne({ account });
        return rs;
    }

    static async query(data: UserQueryArgs) {
        let query: any = {};
        let noTotal = false;
        if (data._id) {
            query._id = Types.ObjectId(data._id);
            noTotal = true;
        }

        if (data.nickname)
            query.nickname = new RegExp(escapeRegExp(data.nickname), 'i');
        if (data.account)
            query.account = new RegExp(escapeRegExp(data.account), 'i');

        let query2: any = {};
        let and2 = [];
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            and2 = [...and2, {
                $or: [
                    { nickname: anykey },
                    { account: anykey },
                    { 'authorityList.code': anykey },
                    { 'authorityList.name': anykey },
                    { 'roleList.code': anykey },
                    { 'roleList.name': anykey },
                ]
            }];
        }
        if (data.role) {
            let role = new RegExp(escapeRegExp(data.role), 'i');
            and2 = [...and2, {
                $or: [
                    { 'roleList.code': role },
                    { 'roleList.name': role },
                ]
            }];
        }
        if (data.authority) {
            let authority = new RegExp(escapeRegExp(data.authority), 'i');
            and2 = [...and2, {
                $or: [
                    { 'authorityList.code': authority },
                    { 'authorityList.name': authority },
                ]
            }];
        }
        if (and2.length)
            query2.$and = and2;

        let authProject = {
            name: 1,
            code: 1,
            status: 1,
        };
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
                            $project: authProject
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
                                        $project: authProject
                                    }
                                ],
                                as: 'authorityList'
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                code: 1,
                                status: 1,
                                authorityList: 1,
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
        rs.rows.forEach((ele) => {
            //可用权限
            let auth = {};
            ele.authorityList.forEach(authority => {
                if (authority.status == myEnum.authorityStatus.启用)
                    auth[authority.code] = authority;
            });
            ele.roleList.forEach(role => {
                if (role.status == myEnum.roleStatus.启用) {
                    role.authorityList.forEach(authority => {
                        if (authority.status == myEnum.authorityStatus.启用)
                            auth[authority.code] = authority;
                    });
                }
            });
            ele.auth = auth;
        });
        return rs;
    }

    static async detail(_id) {
        let userRs = await UserMapper.query({ _id });
        let userDetail = userRs.rows[0];
        return userDetail;
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