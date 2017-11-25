/**
 * Created by umi on 2017-5-29.
 */

var restList = [
    {
        url: '/sign/:method',
        method: 'post',
        functionName: 'sign',
        methodName: 'sign',//用于记录日志
        path: 'module/sign',
        auth: [],
    },
    {
        url: '/help',
        method: 'get',
        functionName: '',
        path: '',
        auth: ['dev'],
    },
    {
        url: '/upload',
        method: 'post',
        functionName: 'upload',
        path: 'index',
    },
    {
        url: '/:module/save',
        checkAuthOnly: true,//仅检查权限，功能由后面路由实现
        auth: ['login']
    },
    {
        url: '/:module/del',
        checkAuthOnly: true,//仅检查权限，功能由后面路由实现
        auth: ['admin']
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