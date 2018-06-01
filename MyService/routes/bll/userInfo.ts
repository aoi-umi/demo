/**
 * Created by umi on 2017-8-7.
 */
import * as q from 'q';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as cache from '../_system/cache';
import * as autoBll from './_auto';
import * as userInfoDal from '../dal/userInfo';

export let isAccountExist = function (account) {
    return common.promise(function () {
        if (!account)
            throw common.error(null, errorConfig.ARGS_ERROR);
        return autoBll.query('userInfo', {account: account}).then(function (t) {
            if (t.list.length > 1)
                throw common.error('数据库中存在重复账号');
            return t.list.length ? true : false;
        });
    });
};

export let save = function (opt, exOpt) {
    var user = exOpt.user;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var userInfoLog = createLog();
    userInfoLog.userInfoId = user.id;
    return common.promise(function () {
        return autoBll.detailQuery('userInfo', {id: user.id}).then(function (t) {
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
        });
    }).then(function () {
        var saveOpt = {
            id: user.id,
            nickname: opt.nickname,
            password: opt.newPassword,
            editDate: now,
        };
        return autoBll.tran(function (conn) {
            return autoBll.save('userInfo', saveOpt, conn).then(function () {
                return autoBll.save('userInfoLog', userInfoLog, conn);
            });
        });
    }).then(function () {
        if (user.key) {
            if (opt.newPassword)
                return cache.del(user.key);
            else if (opt.nickname) {
                user.nickname = opt.nickname;
                var seconds = 7 * 24 * 3600;
                return cache.set(user.key, user, seconds);
            }
        }
    });
};

export let detailQuery = function (opt) {
    return userInfoDal.detailQuery({id: opt.id}).then(function (t) {
        var detail = {
            userInfo: t[0][0],
            userInfoLog: t[1],
            authorityList: t[2],
            roleList: t[3],
            roleAuthorityList: t[4],
            auth: {}
        };
        if (!detail.userInfo)
            return null;
        updateUserInfo(detail);
        return detail;
    });
};

export let query = function (opt) {
    return userInfoDal.query(opt).then(function (t) {
        var data = {
            list: t[0],
            count: t[1][0].count
        };
        var userInfoWithAuthorityList = t[2];
        var authorityList = t[3];
        var userInfoWithRoleList = t[4];
        var roleList = t[5];
        var roleAuthorityList = t[6];

        data.list.forEach(function (item) {
            var detail = {
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

export let adminSave = function (opt, exOpt) {
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
        return autoBll.query('userInfoWithAuthority', {userInfoId: id});
    }).then(function (t) {
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
        return autoBll.query('userInfoWithRole', {userInfoId: id});
    }).then(function (t) {
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
        if (!isChanged)
            throw common.error('没有变更的信息');
        return autoBll.tran(function (conn) {
            return autoBll.save('userInfo', {id: id, editDate: now}, conn).then(function (t) {
                var list = [];
                //删除权限
                if (delUserAuthList.length) {
                    delUserAuthList.forEach(function (item) {
                        list.push(autoBll.del('userInfoWithAuthority', {id: item.id}, conn));
                    })
                }
                //保存权限
                if (addUserAuthList.length) {
                    addUserAuthList.forEach(function (item) {
                        list.push(autoBll.save('userInfoWithAuthority', {userInfoId: id, authorityCode: item}));
                    });
                }

                //删除角色
                if (delUserRoleList.length) {
                    delUserRoleList.forEach(function (item) {
                        list.push(autoBll.del('userInfoWithRole', {id: item.id}, conn));
                    })
                }
                //保存角色
                if (addUserRoleList.length) {
                    addUserRoleList.forEach(function (item) {
                        list.push(autoBll.save('userInfoWithRole', {userInfoId: id, roleCode: item}));
                    });
                }

                return q.all(list);
            }).then(function () {
                //日志
                autoBll.save('userInfoLog', userInfoLog, conn);
            });
        });
    }).then(function (t) {
        return id;
    });
};

var updateUserInfo = function (detail) {
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
    let compare = function (a, b) {
        if (a.code < b.code)
            return -1;
        if (a.code > b.code)
            return 1;
        return 0;
    };
    detail.roleList.forEach(function (role) {
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