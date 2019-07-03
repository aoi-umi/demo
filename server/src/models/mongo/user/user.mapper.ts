import { Types } from 'mongoose';

import { escapeRegExp } from '../../../_system/common';
import * as common from '../../../_system/common';
import { myEnum } from '../../../config/enum';
import { dev } from '../../../config';
import * as VaildSchema from '../../../vaild-schema/class-valid';

import { AuthorityModel } from '../authority';
import { RoleModel } from '../role';
import { UserModel } from ".";

export class UserMapper {
    static async accountExists(account: string) {
        let rs = await UserModel.findOne({ account });
        return rs;
    }

    static async query(data: VaildSchema.UserMgtQuery) {
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
                    { 'authorityList': anykey },
                    { 'newAuthorityList.code': anykey },
                    { 'newAuthorityList.name': anykey },
                    { 'newRoleList.code': anykey },
                    { 'newRoleList.name': anykey },
                ]
            }];
        }
        if (data.role) {
            let role = new RegExp(escapeRegExp(data.role), 'i');
            and2 = [...and2, {
                $or: [
                    { 'roleList': role },
                    { 'newRoleList.code': role },
                    { 'newRoleList.name': role },
                ]
            }];
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
                    as: 'newAuthorityList'
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
                                as: 'newAuthorityList'
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                code: 1,
                                status: 1,
                                authorityList: 1,
                                newAuthorityList: 1,
                            }
                        }
                    ],
                    as: 'newRoleList'
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
            sortOrder: data.sortOrder,
            orderBy: data.orderBy
        });
        rs.rows.forEach((ele) => {
            let model = new UserModel(ele);
            //可用权限
            let auth = {};
            let authorityList = ele.newAuthorityList;
            delete ele.newAuthorityList;
            authorityList.forEach(authority => {
                if (authority.status == myEnum.authorityStatus.启用)
                    auth[authority.code] = authority;
            });
            if (data.includeDelAuth) {
                UserMapper.setDelAuthOrRole(authorityList, ele.authorityList);
            }
            ele.authorityList = authorityList;

            let roleList = ele.newRoleList;
            delete ele.newRoleList;
            roleList.forEach(role => {
                if (role.status == myEnum.roleStatus.启用) {
                    let roleAuthorityList = role.newAuthorityList;
                    delete role.newAuthorityList;
                    roleAuthorityList.forEach(authority => {
                        if (authority.status == myEnum.authorityStatus.启用)
                            auth[authority.code] = authority;
                    });

                    if (data.includeDelAuth) {
                        UserMapper.setDelAuthOrRole(roleAuthorityList, role.authorityList);
                    }
                    role.authorityList = roleAuthorityList;
                }
            });
            if (data.includeDelAuth) {
                UserMapper.setDelAuthOrRole(roleList, ele.roleList);
            }
            ele.roleList = roleList;
            ele.auth = auth;

            ele.canEdit = model.canEdit;
            ele.statusText = model.statusText;
            let disRs = model.checkDisabled();
            ele.disabled = disRs.disabled;
        });
        return rs;
    }

    static setDelAuthOrRole(list, codeList) {
        codeList.forEach(auth => {
            if (!list.find(e => e.code == auth)) {
                list.push({
                    code: auth,
                    isDel: true
                });
            }
        });
    }

    static async detail(_id) {
        let userRs = await UserMapper.query({ _id });
        let userDetail = userRs.rows[0];
        if (userDetail && userDetail.roleList.find(r => r.code == dev.rootRole)) {
            let authList = await AuthorityModel.find({ status: myEnum.authorityStatus.启用 });
            authList.forEach(ele => {
                userDetail.auth[ele.code] = ele;
            });
        }
        return userDetail;
    }

    static async accountCheck(account: string) {
        let user = await UserMapper.accountExists(account);
        if (!user)
            throw common.error('账号不存在');
        let disRs = user.checkDisabled();
        return {
            user,
            disableResult: disRs
        };
    }
}