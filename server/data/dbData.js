var authority = {
    authorityQuery: {
        name: '权限查询'
    },
    authoritySave: {
        name: '权限修改'
    },
    authorityDel: {
        name: '权限删除'
    },

    roleQuery: {
        name: '角色查询'
    },
    roleSave: {
        name: '角色修改'
    },
    roleDel: {
        name: '角色删除'
    },

    userMgtQuery: {
        name: '用户管理查询'
    },
    userMgtEdit: {
        name: '用户管理修改'
    },
    userMgtDisable: {
        name: '用户管理封禁'
    },

    articleMgtDel: {
        name: '文章管理删除'
    },
    articleMgtAudit: {
        name: '文章管理审核'
    },

    commentMgtDel: {
        name: '评论管理删除'
    },
};

var authList = [];
for (let key in authority) {
    let val = authority[key];
    authList.push({
        status: 1,
        code: key,
        name: val.name,
        createdAt: ISODate(),
        updatedAt: ISODate(),
    });
}
db.getCollection('authorities').insert(authList);

var role = {
    root: {
        name: '系统管理员'
    }
};

var roleList = [];
for (let key in role) {
    let val = role[key];
    roleList.push({
        status: 1,
        code: key,
        name: val.name,
        authorityList: val.authorityList || [],
        createdAt: ISODate(),
        updatedAt: ISODate(),
    });
}
db.getCollection('roles').insert(roleList);
