import { Types } from 'mongoose';

import { escapeRegExp } from '../../../_system/common';
import * as common from '../../../_system/common';
import { myEnum } from '../../../config/enum';
import * as config from '../../../config';
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { LoginUser } from '../../login-user';

import { AuthorityModel } from '../authority';
import { RoleModel } from '../role';
import { BaseMapper } from '../_base';
import { UserLogModel } from './user-log';
import { UserModel, UserInstanceType } from ".";
import { FileMapper } from '../file';

export class UserMapper {
    static createToken(data, user: UserInstanceType) {
        let dataStr = JSON.stringify(data);
        let checkToken = common.md5(user.account + user.password + dataStr);
        return { dataStr, checkToken };
    }

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
            noTotal,
            ...BaseMapper.getListOptions(data),
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
        if (userDetail && userDetail.roleList.find(r => r.code == config.dev.rootRole)) {
            let authList = await AuthorityModel.find({ status: myEnum.authorityStatus.启用 });
            authList.forEach(ele => {
                userDetail.auth[ele.code] = ele;
            });
        }
        return userDetail;
    }

    static async accountCheck(account: string, loginUser?: LoginUser) {
        let user = await UserMapper.accountExists(account);
        if (!user)
            throw common.error('账号不存在');
        let disRs = user.checkDisabled();
        if (loginUser && loginUser.loginData) {
            let { checkToken } = UserMapper.createToken(loginUser.loginData, user);
            if (checkToken !== loginUser.key) {
                throw common.error('账号的密码已变更, 请重新登录');
            }
        }
        return {
            user,
            disableResult: disRs
        };
    }

    static async login(token, user: UserInstanceType, data: VaildSchema.UserSignIn, disabled: boolean) {
        let { checkToken } = UserMapper.createToken(data, user);
        if (token !== checkToken)
            throw common.error('', config.error.TOKEN_WRONG);
        let userAuth = {
            [config.auth.login.code]: 1
        };
        if (!disabled) {
            let userDetail = await UserMapper.detail(user._id);
            for (let key in userDetail.auth) {
                userAuth[key] = 1;
            }
        }

        return {
            _id: user._id, account: user.account, nickname: user.nickname, avatar: user.avatar,
            key: token, authority: userAuth,
            loginData: data,
            lastLoginAt: new Date()
        };
    }

    static resetDetail(detail, opt: {
        imgHost?: string;
    }) {
        detail.avatarUrl = FileMapper.getImgUrl(detail.avatar, opt.imgHost);
    }
}

export class UserLogMapper {
    static create(user: UserInstanceType, operator: LoginUser, opt: {
        remark?: string;
        update?: object;
    }) {
        let log = new UserLogModel({
            userId: user._id,
            operatorId: operator._id,
            operator: operator.nameToString()
        });
        let remark = opt.remark || '';
        if (!remark) {
            if (opt.update) {
                let updateKey = Object.keys(opt.update);
                remark += `[修改了:${updateKey}]`;
                log.oldData = {};
                updateKey.forEach(key => {
                    log.oldData[key] = user[key];
                });
            }
        }
        log.remark = remark;
        return log;
    }
}