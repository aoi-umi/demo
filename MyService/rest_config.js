/**
 * Created by umi on 2017-5-29.
 */

var restList = [
    {
        url: '/',
        method: 'post',
        functionName: '',
        exampleRequest: {"arg": "123"},
        methodName: 'index-post',//用于记录日志
        path: 'index',
        auth: [],
    },
    {
        url: '/login',
        method: 'post',
        functionName: 'loginPost',
        exampleRequest: {"userName": "user", "pwd": "123456"},
        path: 'index',
        auth: []
    },
    {
        url: '/loginOut',
        method: 'post',
        functionName: 'loginOut',
        path: 'index',
        auth: []
    },
    {
        url: '/signUp',
        method: 'post',
        functionName: 'signUp',
        exampleRequest: {"userName": "user", "pwd": "123456"},
        path: 'index',
    },
    {
        url: '/help',
        method: 'get',
        functionName: '',
        path: '',
        auth: ['dev'],
    },

    {
        url: '/tranTest',
        method: 'post',
        functionName: 'tranTest',
        exampleRequest: {error: false},
        path: 'index',
    },
    {
        url: '/upload',
        method: 'post',
        functionName: 'upload',
        path: 'index',
    },
    {
        url: '/:module/del',
        checkAuthOnly: true,//仅检查权限，功能由后面路由实现
        auth: ['login']
    },
];

//默认接口
restList.push({
    url: '/:module/:method',
    method: 'post',
    functionName: 'default',
    methodName: 'module-method',
    path: '/module/_default',
    auth: [],
});
//module-get放在最后
restList.push({
    url: '*',
    method: 'get',
    functionName: 'view',
    methodName: 'module-view',
    path: '/module/_default',
    auth: [],
});

module.exports = restList;