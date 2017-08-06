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
    }
};

module.exports = [
    {
        url: '/',
        method: [{
            name: 'use',
        }, {
            name: 'get',
            functionName: '',
            exampleRequest:''
        }, {
            name: 'post',
            functionName: '',
            exampleRequest:{"arg":"123"}
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
        path:'users',
    },
    {
        url:'/admin',
        method:[{
            name: 'get',
            functionName: ''
        }],
        path:'',
        auth:[auth['login'],auth['admin']]
    },
    {
        url:'/test',
        method:[{
            name: 'get',
            functionName: ''
        }],
        path:'',
        auth:[],
    },
    {
        url:'/testPromise',
        method:[{
            name: 'get',
            functionName: 'getPromise'
        }],
        path:'/test',
        auth:[],
    },
    {
        url:'/test1',
        method:[{
            name: 'get',
            functionName: 'testGet'
        }],
        path:'/test',
        auth:[],
    },
    {
        url:'/test2',
        method:[{
            name: 'get',
            functionName: 'get2'
        }],
        path:'/test',
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
        auth:[],
    },
];