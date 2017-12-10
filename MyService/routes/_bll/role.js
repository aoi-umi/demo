/**
 * Created by umi on 2017-8-7.
 */
var q = require('q');
var _ = require('underscore');
var autoBll = require('./auto');
var common = require('../_system/common');
var role = exports;

exports.save = function (opt) {
    var user = opt.user;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var id;
    return common.promise().then(function () {
        return role.isExist(opt.role);
    }).then(function (t) {
        if (t)
            throw common.error(`code[${opt.role.code}]已存在`);
        return autoBll.query('role_authority_id', {role_id: opt.role.id});
    }).then(function (t) {
        var roleAuthIdList = [];
        var delRoleAuthIdList = [];
        var diffOpt = {
            list: t.list,
            newList: opt.authorityIdList,
            compare: function (item, item2) {
                return item.authority_id == item2;
            },
            delReturnValue: function (item) {
                return item.id;
            }
        };
        var diffRes = common.getListDiff(diffOpt);
        roleAuthIdList = diffRes.addList;
        delRoleAuthIdList = diffRes.delList;
        return autoBll.tran(function (conn) {
            return autoBll.save('role', opt.role, conn).then(function (t) {
                id = t;
                var list = [];
                //删除权限
                if (delRoleAuthIdList.length) {
                    delRoleAuthIdList.forEach(function (item) {
                        list.push(autoBll.del('role_authority_id', {id: item}, conn));
                    })
                }
                //保存权限
                if (roleAuthIdList.length) {
                    roleAuthIdList.forEach(function (item) {
                        list.push(autoBll.save('role_authority_id', {role_id: id, authority_id: item}));
                    });
                }
                return q.all(list);
            });
        });
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
        var role_authority_id_list = t[2];
        var authority_list = t[3];
        data.list.forEach(function (item) {
            item.authority_list = [];
            role_authority_id_list.forEach(function (role_authority_id) {
                if (item.id == role_authority_id.role_id) {
                    var match = _.find(authority_list, function (authority) {
                        return authority.id == role_authority_id.authority_id;
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
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
}