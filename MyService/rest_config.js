/**
 * Created by umi on 2017-5-29.
 */
var auth = {
    'login': {
        key: 'login',
        errCode: 'NO_LOGIN',
    },
    'admin': {
        key: 'admin',
        errCode: 'NO_PERMISSIONS',
    },
    'dev': {
        key: 'dev',
        errCode: 'DEV',
    }
};

module.exports = [
    {
        url: '/',
        method: [{
            name: 'use',
            methodName:'index-use',//用于记录日志
        }, {
            name: 'get',
            functionName: '',
            exampleRequest:'',
        }, {
            name: 'post',
            functionName: '',
            exampleRequest:{"arg":"123"},
            methodName:'index-post',//用于记录日志
        }],
        path: 'index',
        auth: [],
    },
    {
        url: '/status',
        method: [{
            name: 'get',
            functionName: 'status',
            exampleRequest:'',
        }],
        path: 'index',
        auth: [],
    },
    {
        url:'/login',
        method:[{
            name: 'post',
            functionName: 'loginPost',
            exampleRequest:{"userName":"user", "pwd":"123456"}
        },{
            name: 'get',
            functionName: 'loginGet'
        }],
        path:'index',
        auth:[]
    },
    {
        url:'/loginOut',
        method:[{
            name: 'post',
            functionName: 'loginOut',
        }],
        path:'index',
        auth:[]
    },
    {
        url:'/:p1/:p2',
        method:[{
            name: 'get',
            functionName: 'params',
            exampleRequest: '/test/test'
        }],
        path:'index',
        auth:[]
    },
    {
        url:'/signUp',
        method:[{
            name: 'post',
            functionName: 'signUp',
            exampleRequest:{"userName":"user", "pwd":"123456"}
        }],
        path:'index',
    },
    {
        url:'/admin',
        method:[{
            name: 'get',
            functionName: 'admin'
        }],
        path:'index',
        auth:[auth['login'],auth['admin']]
    },
    {
        url:'/test',
        method:[{
            name: 'get',
            functionName: 'testGet',
            exampleRequest: '/test?code=success&test=0'
        },{
            name: 'post',
            functionName: 'testPost',
            exampleRequest: {code:'success'}
        }],
        path:'/index',
        auth:[],
    },
    {
        url:/\/test.+/,
        method:[{
            name: 'get',
            functionName: 'getReg',
            exampleRequest: '/test99'
        }],
        path:'/test',
        auth:[],
    },
    {
        url:'/help',
        method:[{
            name: 'get',
            functionName: ''
        }],
        path:'',
        auth:[auth['dev']],
    },
    {
        url:'/log',
        method:[{
            name: 'get',
            functionName: 'view'
        }],
        path:'log',
    },
    {
        url:'/log/query',
        method:[{
            name: 'post',
            functionName: 'query'
        }],
        path:'log',
    },
    {
        url:'/log/save',
        method:[{
            name: 'post',
            functionName: 'save'
        }],
        path:'log',
    },
    {
        url: '/tranTest',
        method: [{
            name: 'post',
            functionName: 'tranTest',
            exampleRequest: {error: false}
        }],
        path: 'index',
    },
];