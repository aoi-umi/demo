/**
 * Created by umi on 2017-8-7.
 */
var q = require('q');
var _ = require('underscore');
var autoBll = require('./auto');
var common = require('../_system/common');
var role = exports;

exports.save = function (opt) {
    var id;
    var dataRole = opt.role;
    return common.promise().then(function () {
        if (opt.statusUpdateOnly) {
            if (!dataRole.id || dataRole.id == 0)
                throw common.error('id不能为空');
            return autoBll.save('role', {id: dataRole.id, status: dataRole.status}).then(function (t) {
                id = t;
            });
        } else {
            return role.isExist(dataRole).then(function (t) {
                if (t)
                    throw common.error(`code[${dataRole.code}]已存在`);

                return autoBll.query('role_with_authority', {role_code: dataRole.code});
            }).then(function (t) {
                var roleAuthList = [];
                var delRoleAuthList = [];
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
                roleAuthList = diffRes.addList;
                delRoleAuthList = diffRes.delList;
                //console.log(diffOpt);
                //console.log(diffRes);
                return autoBll.tran(function (conn) {
                    return autoBll.save('role', dataRole, conn).then(function (t) {
                        id = t;
                        var list = [];
                        //删除权限
                        if (delRoleAuthList.length) {
                            delRoleAuthList.forEach(function (item) {
                                list.push(autoBll.del('role_with_authority', {id: item}, conn));
                            })
                        }
                        //保存权限
                        if (roleAuthList.length) {
                            roleAuthList.forEach(function (item) {
                                list.push(autoBll.save('role_with_authority', {
                                    role_code: dataRole.code,
                                    authority_code: item
                                }, conn));
                            });
                        }
                        return q.all(list);
                    });
                });
            });
        }
    }).then(function (t) {
        return id;
    });
};

exports.detailQuery = function (opt) {
    return autoBll.customDal('role', 'detailQuery', opt).then(function (t) {
        var data = {
            role: t[0][0],
            authority_list: t[1],
        };
        return data;
    });
};

exports.query = function (opt) {
    return autoBll.customDal('role', 'query', opt).then(function (t) {
        var data = {
            list: t[0],
            count: t[1][0].count,
        };
        var role_with_authority_list = t[2];
        var authority_list = t[3];
        data.list.forEach(function (item) {
            item.authority_list = [];
            role_with_authority_list.forEach(function (role_with_authority) {
                if (item.code == role_with_authority.role_code) {
                    var match = _.find(authority_list, function (authority) {
                        return authority.code == role_with_authority.authority_code;
                    });
                    if (match) item.authority_list.push(match);
                }
            });
        });
        return data;
    });
};

exports.isExist = function (opt) {
    var code = opt.code;
    return common.promise().then(function () {
        if (!code)
            throw common.error('code不能为空');
        return autoBll.query('role', {code: code});
    }).then(function (t) {
        var result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复角色');
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};