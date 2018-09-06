/**
 * Created by umi on 2017-8-7.
 */
import * as q from 'q';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import { RoleModel } from '../dal/models/dbModel';

export let save = function (opt) {
    var id;
    var dataRole = opt.role;
    return common.promise(async function () {
        if (opt.statusUpdateOnly) {
            if (!dataRole.id || dataRole.id == 0)
                throw common.error('id不能为空');
            id = await autoBll.modules.role.save({id: dataRole.id, status: dataRole.status});
        } else {
            let exist = await isExist(dataRole);
            if (exist)
                throw common.error(`code[${dataRole.code}]已存在`);

            let roleWithAuthority = await autoBll.modules.roleWithAuthority.query({roleCode: dataRole.code});
            var delRoleAuthList = roleWithAuthority.list.filter((dbAuth) => {
                return opt.delAuthorityList.findIndex((delAuth) => {
                    return dbAuth.authorityCode == delAuth;
                }) >= 0;
            });
            var addRoleAuthList = opt.addAuthorityList.filter((addAuth) => {
                return roleWithAuthority.list.findIndex((dbAuth) => {
                    return dbAuth.authorityCode == addAuth;
                }) < 0;
            });
            // console.log(delRoleAuthList);
            // console.log(addRoleAuthList);
            return autoBll.tran(async function (conn) {
                id = await autoBll.modules.role.save(dataRole, conn);
                var list = [];
                //删除权限
                if (delRoleAuthList.length) {
                    delRoleAuthList.forEach(function (item) {
                        list.push(autoBll.modules.roleWithAuthority.del({id: item.id}, conn));
                    })
                }
                //保存权限
                if (addRoleAuthList.length) {
                    addRoleAuthList.forEach(function (item) {
                        list.push(autoBll.modules.roleWithAuthority.save({
                            roleCode: dataRole.code,
                            authorityCode: item
                        }, conn));
                    });
                }
                return q.all(list);
            });
        }
    }).then(() => {
        return id;
    });
};

export let detailQuery = function (opt) {    
    return RoleModel.Role.customDetailQuery(opt);
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

    return RoleModel.Role.customQuery(opt).then(function (t) {
        var data: any = {
            list: t.list,
            count: t.count,
        };
        var roleAuthority = {};
        var authorityList = t.authorityList;
        t.roleWithAuthorityList.forEach(ele => {
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
    return common.promise(async function () {
        if (!code)
            throw common.error('code不能为空');
        let t = await autoBll.modules.role.query({code: code});
        var result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复角色');
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};