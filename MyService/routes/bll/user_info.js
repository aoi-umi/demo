/**
 * Created by umi on 2017-8-7.
 */
var q = require('q');
var _ = require('underscore');
var autoBll = require('./auto');
var common = require('../_system/common');
var cache = require('../_system/cache');
var userInfo = exports;
exports.isAccountExist = function (account) {
    return common.promise().then(function () {
        if (!account)
            throw common.error(null, 'ARGS_ERROR');
        return autoBll.query('user_info', {account: account}).then(function (t) {
            if (t.list.length > 1)
                throw common.error('数据库中存在重复账号');
            return t.list.length ? true : false;
        });
    });
};

exports.save = function (opt, exOpt) {
    var user = exOpt.user;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var userInfoLog = userInfo.createLog();
    userInfoLog.userInfoId = user.id;
    return common.promise().then(function () {
        return autoBll.detailQuery('user_info', {id: user.id}).then(function (t) {
            if (!t || !t.id)
                throw common.error('查询用户信息为空');
            var isChanged = false;
            if (opt.newPassword && opt.newPassword != t.password) {
                if (!opt.password)
                    throw common.error('原密码不能为空', 'ARGS_ERROR');
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
            return autoBll.save('user_info', saveOpt, conn).then(function () {
                return autoBll.save('user_info_log', userInfoLog, conn);
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

exports.detailQuery = function (opt) {
    return autoBll.customDal('user_info', 'detailQuery', {id: opt.id}).then(function (t) {
        var detail = {
            userInfo: t[0][0],
            userInfoLog: t[1],
            authorityList: t[2],
            roleList: t[3],
            roleAuthorityList: t[4],
            auth: {}
        };
        updateUserInfo(detail);
        return detail;
    });
};

exports.query = function (opt) {
    return autoBll.customDal('user_info', 'query', opt).then(function (t) {
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
                    var matchAuth = _.filter(authorityList, function (auth) {
                        return uWithAuth.authorityCode == auth.code;
                    });
                    if (matchAuth)
                        detail.authorityList = detail.authorityList.concat(matchAuth);
                }
            });

            userInfoWithRoleList.forEach(function (uWithRole) {
                if (uWithRole.userInfoId == item.id) {
                    var matchAuth = _.filter(roleAuthorityList, function (roleAuth) {
                        return uWithRole.roleCode == roleAuth.roleCode;
                    });
                    if (matchAuth)
                        detail.roleAuthorityList = detail.roleAuthorityList.concat(matchAuth);
                    var matchRole = _.filter(roleList, function (role) {
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

exports.adminSave = function (opt, exOpt) {
    var delUserRoleIdList = [];
    var userRoleIdList = [];
    var delUserAuthIdList = [];
    var userAuthIdList = [];
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var id = opt.id;
    var user = exOpt.user;
    var userInfoLog = userInfo.createLog();
    userInfoLog.userInfoId = id;
    userInfoLog.type = 1;
    userInfoLog.content = `${user.account}(${user.nickname}#${user.id})`;
    return common.promise().then(function () {
        if (!id)
            throw common.error('id为空', 'CAN_NOT_BE_EMPTY');
        return autoBll.query('user_info_with_authority', {userInfoId: id});
    }).then(function (t) {
        var diffOpt = {
            list: t.list,
            newList: opt.authorityList,
            compare: function (item, item2) {
                return item.authorityCode == item2;
            },
            delReturnValue: function (item) {
                return item.id;
            }
        };
        var diffRes = common.getListDiff(diffOpt);
        userAuthIdList = diffRes.addList;
        delUserAuthIdList = diffRes.delList;
        return autoBll.query('user_info_with_role', {userInfoId: id});
    }).then(function (t) {
        var diffOpt = {
            list: t.list,
            newList: opt.roleList,
            compare: function (item, item2) {
                return item.roleCode == item2;
            },
            delReturnValue: function (item) {
                return item.id;
            }
        };
        var diffRes = common.getListDiff(diffOpt);
        userRoleIdList = diffRes.addList;
        delUserRoleIdList = diffRes.delList;
        // console.log(delUserRoleIdList)
        // console.log(userRoleIdList)
        // console.log(delUserAuthIdList)
        // console.log(userAuthIdList)
        var isChanged = false;
        if (delUserRoleIdList.length || userRoleIdList.length) {
            userInfoLog.content += '[修改了角色]';
            isChanged = true;
        }
        if (delUserAuthIdList.length || userAuthIdList.length) {
            userInfoLog.content += '[修改了权限]';
            isChanged = true;
        }
        if (!isChanged)
            throw common.error('没有变更的信息');
        return autoBll.tran(function (conn) {
            return autoBll.save('user_info', {id: id, editDate: now}, conn).then(function (t) {
                var list = [];
                //删除权限
                if (delUserAuthIdList.length) {
                    delUserAuthIdList.forEach(function (item) {
                        list.push(autoBll.del('user_info_with_authority', {id: item}, conn));
                    })
                }
                //保存权限
                if (userAuthIdList.length) {
                    userAuthIdList.forEach(function (item) {
                        list.push(autoBll.save('user_info_with_authority', {userInfoId: id, authorityCode: item}));
                    });
                }

                //删除角色
                if (delUserRoleIdList.length) {
                    delUserRoleIdList.forEach(function (item) {
                        list.push(autoBll.del('user_info_with_role', {id: item}, conn));
                    })
                }
                //保存角色
                if (userRoleIdList.length) {
                    userRoleIdList.forEach(function (item) {
                        list.push(autoBll.save('user_info_with_role', {userInfoId: id, roleCode: item}));
                    });
                }

                return q.all(list);
            }).then(function () {
                //日志
                autoBll.save('user_info_log', userInfoLog, conn);
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

    detail.roleList.forEach(function (role) {
        role.authorityList = _.filter(detail.roleAuthorityList, function (roleAuthority) {
            return roleAuthority.roleCode == role.code;
        }) || [];
        role.authorityList = _.sortBy(role.authorityList, function (t) {
            return t.code;
        });
    });
    detail.authorityList = _.sortBy(detail.authorityList, function (t) {
        return t.code;
    });
    detail.roleList = _.sortBy(detail.roleList, function (t) {
        return t.code;
    });
    authorityList = _.sortBy(authorityList, function (t) {
        return t.code;
    });
    if (!detail.auth)
        detail.auth = {};
    authorityList.forEach(function (t) {
        detail.auth[t.code] = true;
    });
};

exports.createLog = function () {
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var model = {
        userInfoId: 0,
        type: 0,
        content: '',
        createDate: now,
    };
    return model;
};