let lang = {
    Global: {
        dialog: {
            continue: '继续',
            close: '关闭',
            refresh: '刷新',
        },
        list: {
            operate: '操作',
        },
        operate: {
            add: '添加',
            edit: '修改',

            del: '删除',
            delMulti: '批量删除',
            delConfirm: '确认删除{0}项?',
            delSuccess: '删除成功',
            deleting: '删除中',
            delFail: '删除失败:',

            save: '保存',
            saveSuccess: '保存成功',
            saving: '保存中',
            saveFail: '保存失败:',

            enable: '启用',
            disable: '禁用',
            updating: '修改中',
            updateFail: '修改失败',
        },
    },
    //#region module 
    App: {
        routes: {
            bookmark: '书签',
            userSignUp: '注册',
            userAccount: '个人中心',
            adminUser: '用户管理',
            authority: '权限管理',
            role: '角色管理',
            notFound: 'Not Found',
        },
        menu: {
            home: 'Home',
            user: 'User',
            authority: 'Authority',
            role: 'Role',
        }
    },
    User: {
        account: '账号',
        nickname: '昵称',
        password: '密码',
        confirmPassword: '确认密码',
        createdAt: '创建时间',

        accountExists: '账号已存在',
        operate: {
            signIn: '登录',

            signUp: '注册',
            signUpSuccess: '注册成功',
            passwordNotSame: '密码不一致',

            signOut: '退出',
            myAccount: '个人中心',
        }
    },
    UserMgt: {
        role: '角色',
        authority: '权限',
        enableAuthority: '可用权限',
    },
    Bookmark: {
        name: '名字',
        url: 'url',
        tag: '标签',
        anyKey: 'anyKey',
        operate: {
            tagAdd: '添加',
            tagPlaceholder: '按下回车添加标签',
        },
    },
    Authority: {
        name: '名字',
        code: '编码',
        status: '状态',
        anyKey: 'anyKey',

        codeExists: '编码已存在',
    },
    Role: {
        name: '名字',
        code: '编码',
        status: '状态',
        authority: '权限',
        anyKey: 'anyKey',

        codeExists: '编码已存在',
    },
    //#endregion
    //#region component 
    MyDialog: {
        title: '提示',
        accept: '确认',
        cancel: '取消',
    },
    MyList: {
        noData: 'No Data',
        noQuery: 'No Query',
        queryFail: 'Query Fail',

        //btn
        reset: '重置',
        query: '查询',
    },
    MyPagination: {
        rowsPerPage: '每页大小:',
        totalCount: '共{0}条',
        toPage: 'Go',
    }
    //#endregion
};

export default lang;