/**
 * Created by umi on 2017-5-29.
 */

var restList = [
    {
        url: '/',
        method: {
            name: 'post',
            functionName: '',
            exampleRequest:{"arg":"123"},
            methodName:'index-post',//用于记录日志
        },
        path: 'index',
        auth: [],
    },
    {
        url:'/login',
        method:{
            name: 'post',
            functionName: 'loginPost',
            exampleRequest:{"userName":"user", "pwd":"123456"}
        },
        path:'index',
        auth:[]
    },
    {
        url:'/loginOut',
        method:{
            name: 'post',
            functionName: 'loginOut',
        },
        path:'index',
        auth:[]
    },
    {
        url:'/signUp',
        method:{
            name: 'post',
            functionName: 'signUp',
            exampleRequest:{"userName":"user", "pwd":"123456"}
        },
        path:'index',
    },
    {
        url:'/help',
        method:{
            name: 'get',
            functionName: ''
        },
        path:'',
        auth:['dev'],
    },

    {
        url: '/tranTest',
        method: {
            name: 'post',
            functionName: 'tranTest',
            exampleRequest: {error: false}
        },
        path: 'index',
    },
    {
        url: '/upload',
        method: {
            name: 'post',
            functionName: 'upload',
        },
        path: 'index',
    },
    {
        url: '/main_content_type/del',
        method: {
            checkAuthOnly: true,//仅检查权限，功能由后面路由实现
        },
        auth:['login']
    },
];

//默认接口
restList.push({
    url: '/:module/:method',
    method: {
        name: 'post',
        functionName: '',
        exampleRequest:'',
    },
    path: '/module/_default',
    auth: [],
});
//module-get放在最后
restList.push({
    url: '*',
    method: {
        name: 'get',
        functionName: '',
        exampleRequest:'',
    },
    path: '/module/_view',
    auth: [],
});

module.exports = restList;