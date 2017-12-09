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
        return role.detailQuery({id: opt.role.id});
    }).then(function (roleDetail) {
        var authorityIdList = [];
        var delRoleAuthIdList = [];
        if (opt.authorityIdList && opt.authorityIdList.length) {
            roleDetail.role_authority_id_list.forEach(function (item) {
                var match = _.find(opt.authorityIdList, function (optId) {
                    return item.authority_id == optId;
                });
                if (!match)
                    delRoleAuthIdList.push(item.id);
            });
            opt.authorityIdList.forEach(function (optId) {
                var match = _.find(roleDetail.role_authority_id_list, function (item) {
                    return item.authority_id == optId;
                });
                if (!match)
                    authorityIdList.push(optId);
            });
        } else {
            roleDetail.role_authority_id_list.forEach(function (item) {
                delRoleAuthIdList.push(item.id);
            });
        }
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
                if (authorityIdList.length) {
                    authorityIdList.forEach(function (item) {
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
            role_authority_id_list: t[1],
            authority_list: t[2],
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