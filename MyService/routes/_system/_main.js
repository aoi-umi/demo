var common = require('./common');
var main = exports;
exports.init = function () {
    Date.prototype.toJSON = function () {
        return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
    };
    Date.prototype.toString = function () {
        return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
    };
}

//路由配置
exports.restConfig = [
    {
        url: '/',
        method: 'get',
        functionName: 'view',//为空时按method
        methodName: 'index',//用于记录日志
        path: '/module/_default',//为空时则按url
    },
    {
        url: '/help',
        method: 'get',
        functionName: '',
        path: '',
    },
    {
        url: '/msg',
        method: 'get',
        functionName: 'msg',
        path: 'index',
    },
    {
        url: '/interface/onlineUser/query',
        method: 'post',
        functionName: 'onlineUserQuery',
        path: 'index',
    },
    {
        url: '/interface/onlineUser/detailQuery',
        method: 'post',
        functionName: 'onlineUserDetailQuery',
        path: 'index',
    },
    {
        url: '/interface/sign/:method',
        method: 'post',
        functionName: 'sign',
        methodName: 'sign',
        path: 'module/sign',
    },
    {
        url: '/interface/upload',
        method: 'post',
        functionName: 'upload',
        path: 'index',
    },

    {
        url: '/interface/:module/:method',
        method: 'post',
        functionName: 'default',
        methodName: 'module-method',
        path: '/module/_default',
    },
    {
        url: '*',
        method: 'get',
        functionName: 'view',
        methodName: 'module-view',
        path: '/module/_default',
    }
];

//访问权限配置
exports.accessableUrlConfig = [
    {url: '/'},
    {url: '/msg'},
    {url: '/onlineUser', auth: ['admin']},
    {url: '/interface/onlineUser/query', auth: ['admin']},
    {url: '/interface/onlineUser/detailQuery', auth: ['admin']},
    {url: '/interface/upload', auth: ['login']},
    {url: '/help', auth: ['dev']},
    {url: '/status', auth: ['dev']},
    {url: '/color', auth: ['dev']},

    {url: '/log', auth: ['dev']},
    {url: '/interface/log/query', auth: ['dev']},
    {url: '/interface/log/save', auth: ['local']},

    {url: '/sign/up'},
    {url: '/sign/in'},
    {url: '/interface/sign/up'},
    {url: '/interface/sign/in'},
    {url: '/interface/sign/out'},

    //角色
    {url: '/role/list', auth: ['admin']},
    {url: '/interface/role/query', auth: ['admin']},
    {url: '/interface/role/save', auth: ['admin']},
    {url: '/interface/role/detailQuery', auth: ['admin']},

    //权限
    {url: '/authority/list', auth: ['admin']},
    {url: '/interface/authority/query', auth: ['admin']},
    {url: '/interface/authority/save', auth: ['admin']},
    {url: '/interface/authority/detailQuery', auth: ['admin']},

    //用户信息
    {url: '/userInfo/detail', auth: ['login']},
    {url: '/userInfo/list', auth: ['admin']},
    {url: '/interface/userInfo/query', auth: ['admin']},
    {url: '/interface/userInfo/detailQuery', auth: ['admin']},
    {url: '/interface/userInfo/save', auth: ['login']},
    {url: '/interface/userInfo/adminSave', auth: ['admin']},

    {url: '/mainContent/list', auth: ['mainContentQuery']},
    {url: '/mainContent/detail', auth: ['mainContentQuery']},
    {url: '/interface/mainContent/query', auth: ['mainContentQuery']},
    {url: '/interface/mainContent/save', auth: ['mainContentSave']},
    {url: '/interface/mainContent/statusUpdate', auth: ['mainContentSave']},
    //{url: '/interface/mainContent/del', auth: ['admin']},

    {url: '/mainContentType/list', auth: ['mainContentTypeQuery']},
    {url: '/interface/mainContentType/query', auth: ['mainContentTypeQuery']},
    {url: '/interface/mainContentType/detailQuery', auth: ['mainContentTypeDetailQuery']},
    {url: '/interface/mainContentType/save', auth: ['mainContentTypeSave']},
    {url: '/interface/mainContentType/del', auth: ['mainContentTypeDel']},
];

//枚举
exports.enumDict = {
    main_content_type_enum: {'0': '文章',},
    main_content_status_enum: {'-1': '已删除', '0': '草稿', '1': '待审核', '2': '审核中', '3': '通过', '4': '退回'},
    //添加 _operate 后缀
    main_content_status_enum_operate: {'recovery': '恢复'},
    main_content_log_type_enum: {
        //main_conetnt
        '0': '主内容保存', '1': '主内容提交', '2': '主内容审核', '3': '主内容审核通过', '4': '主内容审核不通过', '5': '主内容删除', '6': '主内容恢复',
    },
};

//枚举变更权限
exports.enumChangeDict = {
    main_content_status_enum: {
        //初始状态
        '0': {'0': '保存', '1': '提交', '-1': '删除'},
        '1': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '2': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '3': {'-1': '删除'},
        '4': {'0': '保存', '1': '提交', '-1': '删除'},
        '-1': {'recovery': '恢复'},
    }
};