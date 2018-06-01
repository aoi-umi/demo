/**
 * Created by umi on 2017-8-7.
 */
import * as q from 'q';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import * as roleDal from '../dal/role';

export let save = function (opt) {
    var id;
    var dataRole = opt.role;
    return common.promise(function () {
        if (opt.statusUpdateOnly) {
            if (!dataRole.id || dataRole.id == 0)
                throw common.error('id不能为空');
            return autoBll.save('role', {id: dataRole.id, status: dataRole.status}).then(function (t) {
                id = t;
            });
        } else {
            return isExist(dataRole).then(function (t) {
                if (t)
                    throw common.error(`code[${dataRole.code}]已存在`);

                return autoBll.query('roleWithAuthority', {roleCode: dataRole.code});
            }).then(function (t) {
                var delRoleAuthList = t.list.filter((dbAuth) => {
                    return opt.delAuthorityList.findIndex((delAuth) => {
                        return dbAuth.authorityCode == delAuth;
                    }) >= 0;
                });
                var addRoleAuthList = opt.addAuthorityList.filter((addAuth) => {
                    return t.list.findIndex((dbAuth) => {
                        return dbAuth.authorityCode == addAuth;
                    }) < 0;
                });
                // console.log(delRoleAuthList);
                // console.log(addRoleAuthList);
                return autoBll.tran(function (conn) {
                    return autoBll.save('role', dataRole, conn).then(function (t) {
                        id = t;
                        var list = [];
                        //删除权限
                        if (delRoleAuthList.length) {
                            delRoleAuthList.forEach(function (item) {
                                list.push(autoBll.del('roleWithAuthority', {id: item.id}, conn));
                            })
                        }
                        //保存权限
                        if (addRoleAuthList.length) {
                            addRoleAuthList.forEach(function (item) {
                                list.push(autoBll.save('roleWithAuthority', {
                                    roleCode: dataRole.code,
                                    authorityCode: item
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

export let detailQuery = function (opt) {
    return roleDal.detailQuery(opt).then(function (t) {
        var data = {
            role: t[0][0],
            authorityList: t[1],
        };
        return data;
    });
};

export let query = function (opt) {
    if (opt.id || opt.anyKey) {
        delete opt.code;
        delete opt.name;
        if (opt.id) {
            delete opt.anyKey;
        }
    }
    opt.orderBy = 'code';
    return roleDal.query(opt).then(function (t) {
        var data: any = {
            list: t[0],
            count: t[1][0].count,
        };
        var roleAuthority = {};
        var authorityList = t[3];
        t[2].forEach(ele => {
            if (!roleAuthority[ele.roleCode])
                roleAuthority[ele.roleCode] = [];
            roleAuthority[ele.roleCode].push(ele.authorityCode);
        });
        //处理权限数据
        //if (opt.friendly) {
        data.list.forEach(function (item) {
            item.authorityList = [];
            if (roleAuthority[item.code]) {
                item.authorityList = authorityList.filter(function (ele) {
                    return roleAuthority[item.code].find(authority => authority === ele.code);
                });
            }
        });
        // } else {
        //     data.roleAuthority = roleAuthority;
        //     data.authorityList = authorityList;
        // }
        return data;
    });
};

export let isExist = function (opt) {
    var code = opt.code;
    return common.promise(function () {
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