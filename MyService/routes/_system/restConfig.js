/**
 * Created by umi on 2017-5-29.
 */
//路由配置
var restList = [
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

module.exports = restList;