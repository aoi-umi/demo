/**
 * Created by umi on 2017-5-29.
 */

var restList = [
    {
        url: '/interface/sign/:method',
        method: 'post',
        functionName: 'sign',
        methodName: 'sign',//用于记录日志
        path: 'module/sign',
    },
    {
        url: '/help',
        method: 'get',
        functionName: '',
        path: '',
    },
    {
        url: '/interface/upload',
        method: 'post',
        functionName: 'upload',
        path: 'index',
    },
    {
        url: '/msg',
        method: 'get',
        functionName: 'msg',
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