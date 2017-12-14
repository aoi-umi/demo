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
    var userInfoLog = {
        user_info_id: user.id,
        type: 0,
        content: '',
        create_date: now,
    };
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
            edit_datetime: now,
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
            user_info: t[0][0],
            user_info_log: t[1],
            authority_list: t[2],
            role_list: t[3],
            role_authority_list: t[4],
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
        var user_info_with_authority_list = t[2];
        var authority_list = t[3];
        var user_info_with_role_list = t[4];
        var role_list = t[5];
        var role_authority_list = t[6];
        // for (var i = 2; i <= 6; i++) {
        //     console.log(t[i]);
        // }
        data.list.forEach(function (item) {
            var detail = {
                auth: {},
                role_list: [],
                authority_list: [],
                role_authority_list: [],
            };
            user_info_with_authority_list.forEach(function (u_with_auth) {
                if (u_with_auth.user_info_id == item.id) {
                    var matchAuth = _.filter(authority_list, function (auth) {
                        return u_with_auth.authority_code == auth.code;
                    });
                    if (matchAuth)
                        detail.authority_list = detail.authority_list.concat(matchAuth);
                }
            });

            user_info_with_role_list.forEach(function (u_with_role) {
                if (u_with_role.user_info_id == item.id) {
                    var matchAuth = _.filter(role_authority_list, function (role_auth) {
                        return u_with_role.role_code == role_auth.role_code;
                    });
                    if (matchAuth)
                        detail.role_authority_list = detail.role_authority_list.concat(matchAuth);
                    var matchRole = _.filter(role_list, function (role) {
                        return u_with_role.role_code == role.code;
                    });
                    if (matchRole)
                        detail.role_list = detail.role_list.concat(matchRole);
                }
            });
            updateUserInfo(detail);
            item.role_list = detail.role_list;
            item.authority_list = detail.authority_list;
        });
        return data;
    });
};

exports.adminSave = function (opt) {
    var delUserRoleIdList = [];
    var userRoleIdList = [];
    var delUserAuthIdList = [];
    var userAuthIdList = [];
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var id = opt.id;
    var userInfoLog = {
        user_info_id: id,
        type: 1,
        content: '',
        create_date: now,
    };
    return common.promise().then(function () {
        if (!id)
            throw common.error('id为空', 'CAN_NOT_BE_EMPTY');
        return autoBll.query('user_info_with_authority', {user_info_id: id});
    }).then(function (t) {
        var diffOpt = {
            list: t.list,
            newList: opt.authorityList,
            compare: function (item, item2) {
                return item.authority_code == item2;
            },
            delReturnValue: function (item) {
                return item.id;
            }
        };
        var diffRes = common.getListDiff(diffOpt);
        userAuthIdList = diffRes.addList;
        delUserAuthIdList = diffRes.delList;
        return autoBll.query('user_info_with_role', {user_info_id: id});
    }).then(function (t) {
        var diffOpt = {
            list: t.list,
            newList: opt.roleList,
            compare: function (item, item2) {
                return item.role_code == item2;
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
            return autoBll.save('user_info', {id: id, edit_datetime: now}, conn).then(function (t) {
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
                        list.push(autoBll.save('user_info_with_authority', {user_info_id: id, authority_code: item}));
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
                        list.push(autoBll.save('user_info_with_role', {user_info_id: id, role_code: item}));
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
    var authority_list = [];
    var auth = {};
    detail.authority_list.forEach(function (t) {
        if (t.status == 1) {
            if (!auth[t.code]) authority_list.push(t);
            auth[t.code] = true;
        }
    });
    detail.role_authority_list.forEach(function (t) {
        if (t.status == 1 && t.role_status == 1) {
            if (!auth[t.code]) authority_list.push(t);
            auth[t.code] = true;
        }
    });

    detail.role_list.forEach(function (role) {
        role.authority_list = _.filter(detail.role_authority_list, function (role_authority) {
                return role_authority.role_code == role.code;
            }) || [];
        role.authority_list = _.sortBy(role.authority_list, function (t) {
            return t.code;
        });
    });
    detail.authority_list = _.sortBy(detail.authority_list, function (t) {
        return t.code;
    });
    detail.role_list = _.sortBy(detail.role_list, function (t) {
        return t.code;
    });
    authority_list = _.sortBy(authority_list, function (t) {
        return t.code;
    });
    if (!detail.auth)
        detail.auth = {};
    authority_list.forEach(function (t) {
        detail.auth[t.code] = true;
    });
}