/**
 * Created by umi on 2017-8-7.
 */
import * as q from 'q';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as cache from '../_system/cache';
import * as autoBll from './_auto';
import { SaveOptions } from './_auto';
import * as main from '../_main';
import { UserInfoWithStruct } from '../dal/models/dbModel/UserInfoWithStruct';
import { UserInfo, UserInfoCustomDetailType, UserInfoDataType, UserInfoRoleAuthorityType, UserInfoCustomDetailQueryOptions, UserInfoCustomQueryOptions } from '../dal/models/dbModel/UserInfo';
import { InterfaceExOpt } from '../module/_interface';
import { StructModel } from '../dal/models/dbModel';
type StructDataType = StructModel.StructDataType;

export let isAccountExist = function (account) {
    return common.promise(async function () {
        if (!account)
            throw common.error(null, errorConfig.ARGS_ERROR);
        let t = await autoBll.modules.userInfo.query({ account: account });
        if (t.list.length > 1)
            throw common.error('数据库中存在重复账号');
        return t.list.length ? true : false;
    });
};

export let save = function (opt: SaveOptions<UserInfoDataType> & {
    newPassword?: string;
}, exOpt: InterfaceExOpt) {
    var user = exOpt.user;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var userInfoLog = createLog();
    userInfoLog.userInfoId = user.id;
    return common.promise(async function () {
        let t = await autoBll.modules.userInfo.detailQuery({ id: user.id })
        if (!t || !t.id)
            throw common.error('查询用户信息为空');
        var isChanged = false;
        if (opt.newPassword && opt.newPassword != t.password) {
            if (!opt.password)
                throw common.error('原密码不能为空', errorConfig.ARGS_ERROR);
            if (t.password != opt.password)
                throw common.error('密码不正确');
            isChanged = true;
            userInfoLog.content += '[修改了密码]';
        } else {
            opt.newPassword = null;
        }
        if (!opt.nickname || opt.nickname == t.nickname)
            opt.nickname = null;
        else {
            isChanged = true;
            userInfoLog.content += `[修改了昵称: ${t.nickname} -> ${opt.nickname} ]`;
        }

        if (!isChanged) {
            throw common.error('没有变更的信息');
        }
    }).then(function () {
        var saveOpt = {
            id: user.id,
            nickname: opt.nickname,
            password: opt.newPassword,
            editDate: now,
        };
        return autoBll.tran(async function (conn) {
            await autoBll.modules.userInfo.save(saveOpt, conn);
            await autoBll.modules.userInfoLog.save(userInfoLog, conn);
        });
    }).then(function () {
        if (user.key) {
            if (opt.newPassword)
                return cache.del(user.key);
            else if (opt.nickname) {
                user.nickname = opt.nickname;
                return cache.set(user.key, user, main.cacheTime.userInfo);
            }
        }
    });
};

export let detailQuery = function (opt: UserInfoCustomDetailQueryOptions) {
    return UserInfo.customDetailQuery({ id: opt.id }).then(function (t) {
        var detail = {
            ...t,
            auth: {}
        };
        if (!detail.userInfo)
            return null;
        let weight = { company: 9, department: 8, group: 7 };
        detail.structList.sort(function (a, b) {
            return (weight[b.type] || 0) - (weight[a.type] || 0);
        });
        updateUserInfo(detail);
        return detail;
    });
};

export let query = function (opt: UserInfoCustomQueryOptions) {
    return UserInfo.customQuery(opt).then(function (t) {
        type returnType = UserInfoDataType & { roleList?: any[], authorityList?: any, auth?: {} };
        var data = {
            list: t.list as returnType[],
            count: t.count
        };
        let {
            userInfoWithAuthorityList, authorityList, userInfoWithRoleList,
            roleList, roleAuthorityList
        } = t;

        data.list.forEach(function (item) {
            var detail: UserInfoUpdateType = {
                auth: {},
                roleList: [],
                authorityList: [],
                roleAuthorityList: [],
            };
            userInfoWithAuthorityList.forEach(function (uWithAuth) {
                if (uWithAuth.userInfoId == item.id) {
                    var matchAuth = authorityList.filter(function (auth) {
                        return uWithAuth.authorityCode == auth.code;
                    });
                    if (matchAuth)
                        detail.authorityList = detail.authorityList.concat(matchAuth);
                }
            });

            userInfoWithRoleList.forEach(function (uWithRole) {
                if (uWithRole.userInfoId == item.id) {
                    var matchAuth = roleAuthorityList.filter(function (roleAuth) {
                        return uWithRole.roleCode == roleAuth.roleCode;
                    });
                    if (matchAuth)
                        detail.roleAuthorityList = detail.roleAuthorityList.concat(matchAuth);
                    var matchRole = roleList.filter(function (role) {
                        return uWithRole.roleCode == role.code;
                    });
                    if (matchRole)
                        detail.roleList = detail.roleList.concat(matchRole);
                }
            });
            updateUserInfo(detail);
            item.roleList = detail.roleList;
            item.authorityList = detail.authorityList;
            item.auth = detail.auth;
        });
        return data;
    });
};

export let adminSave = function (opt: {
    id: number,
    addAuthorityList?: string[],
    delAuthorityList?: string[],
    addRoleList?: string[],
    delRoleList?: string[],
    structList?: StructDataType[],

}, exOpt: InterfaceExOpt) {
    var delUserRoleList, addUserRoleList;
    var delUserAuthList, addUserAuthList;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var id = opt.id;
    var user = exOpt.user;
    var userInfoLog = createLog();
    userInfoLog.userInfoId = id;
    userInfoLog.type = 1;
    userInfoLog.content = `${user.account}(${user.nickname}#${user.id})`;
    return common.promise(function () {
        if (!id)
            throw common.error('id为空', errorConfig.CAN_NOT_BE_EMPTY);
        return autoBll.modules.userInfoWithAuthority.query({ userInfoId: id });
    }).then(function (t) {
        //权限
        delUserAuthList = t.list.filter((dbAuth) => {
            return opt.delAuthorityList.findIndex((delAuth) => {
                return dbAuth.authorityCode == delAuth;
            }) >= 0;
        });
        addUserAuthList = opt.addAuthorityList.filter((addAuth) => {
            return t.list.findIndex((dbAuth) => {
                return dbAuth.authorityCode == addAuth;
            }) < 0;
        });
        return autoBll.modules.userInfoWithRole.query({ userInfoId: id });
    }).then(function (t) {
        //角色
        delUserRoleList = t.list.filter((dbAuth) => {
            return opt.delRoleList.findIndex((delAuth) => {
                return dbAuth.roleCode == delAuth;
            }) >= 0;
        });
        addUserRoleList = opt.addRoleList.filter((addAuth) => {
            return t.list.findIndex((dbAuth) => {
                return dbAuth.roleCode == addAuth;
            }) < 0;
        });

        return UserInfoWithStruct.customQuery({ userInfoId: id });
    }).then(function (t) {
        let structList = [];
        let structTypeList = ['company', 'department', 'group'];
        structTypeList.forEach(structType => {
            let matchStruct = opt.structList.find(ele => ele.type == structType);
            let dbMatchStruct = t.list.find(ele => ele.type == structType);
            if (matchStruct) {
                structList.push({
                    id: dbMatchStruct ? dbMatchStruct.id : 0,
                    userInfoId: id,
                    struct: matchStruct.struct
                })
            }
        });
        // console.log(structList);
        // console.log(delUserRoleList)
        // console.log(addUserRoleList)
        // console.log(delUserAuthList)
        // console.log(addUserAuthList)
        // throw 'debug'
        var isChanged = false;
        if (delUserRoleList.length || addUserRoleList.length) {
            userInfoLog.content += '[修改了角色]';
            isChanged = true;
        }
        if (delUserAuthList.length || addUserAuthList.length) {
            userInfoLog.content += '[修改了权限]';
            isChanged = true;
        }
        if (structList.length) {
            userInfoLog.content += '[修改了架构]';
            isChanged = true;
        }
        if (!isChanged)
            throw common.error('没有变更的信息');
        return autoBll.tran(async function (conn) {
            await autoBll.modules.userInfo.save({ id: id, editDate: now }, conn);
            var list = [];
            //删除权限
            if (delUserAuthList.length) {
                delUserAuthList.forEach(function (item) {
                    list.push(autoBll.modules.userInfoWithAuthority.del({ id: item.id }, conn));
                })
            }
            //保存权限
            if (addUserAuthList.length) {
                addUserAuthList.forEach(function (item) {
                    list.push(autoBll.modules.userInfoWithAuthority.save({ userInfoId: id, authorityCode: item }, conn));
                });
            }

            //删除角色
            if (delUserRoleList.length) {
                delUserRoleList.forEach(function (item) {
                    list.push(autoBll.modules.userInfoWithRole.del({ id: item.id }, conn));
                })
            }
            //保存角色
            if (addUserRoleList.length) {
                addUserRoleList.forEach(function (item) {
                    list.push(autoBll.modules.userInfoWithRole.save({ userInfoId: id, roleCode: item }, conn));
                });
            }

            //修改架构
            if (structList.length) {
                structList.forEach(function (item) {
                    list.push(autoBll.modules.userInfoWithStruct.save(item, conn));
                });
            }

            await q.all(list);
            //日志
            await autoBll.modules.userInfoLog.save(userInfoLog, conn);
        });
    }).then(function (t) {
        return id;
    });
};
type UserInfoUpdateType = UserInfoCustomDetailType & { auth: any };
var updateUserInfo = function (detail: UserInfoUpdateType) {
    var authorityList = [];
    var auth = {};
    detail.authorityList.forEach(function (t) {
        if (t.status == 1) {
            if (!auth[t.code]) authorityList.push(t);
            auth[t.code] = true;
        }
    });
    detail.roleAuthorityList.forEach(function (t) {
        if (t.status == 1 && t.roleStatus == 1) {
            if (!auth[t.code]) authorityList.push(t);
            auth[t.code] = true;
        }
    });
    let compare = function (a: UserInfoRoleAuthorityType, b: UserInfoRoleAuthorityType) {
        if (a.code < b.code)
            return -1;
        if (a.code > b.code)
            return 1;
        return 0;
    };
    detail.roleList.forEach(function (ele) {
        let role = ele as (typeof ele) & { authorityList: UserInfoRoleAuthorityType[] };
        role.authorityList = detail.roleAuthorityList.filter(function (roleAuthority) {
            return roleAuthority.roleCode == role.code;
        });
        role.authorityList = role.authorityList.sort(compare);
    });
    detail.authorityList = detail.authorityList.sort(compare);
    detail.roleList = detail.roleList.sort(compare);
    authorityList = authorityList.sort(compare);
    if (!detail.auth)
        detail.auth = {};
    authorityList.forEach(function (t) {
        detail.auth[t.code] = true;
    });
};

export let createLog = function () {
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var model = {
        userInfoId: 0,
        type: 0,
        content: '',
        createDate: now,
    };
    return model;
};