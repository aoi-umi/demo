/**
 * Created by umi on 2017-5-29.
 */
var auth = {
    'login':{
        key:'login',
        desc:'请先登录'
    },
    'admin': {
        key: 'admin',
        desc: '',
    }
};
module.exports = [
    {
        url: '/',
        method: [{
            name: 'get',
            functionName: '',
            exampleRequest:''
        }, {
            name: 'post',
            functionName: '',
            exampleRequest:''
        }],
        path: 'index',
        auth: [],
    },
    {
        url:'/index',
        method:[{
            name: 'get',
            functionName: 'index'
        }],
        path:'',
        auth:[]
    },
    {
        url:'/:p1/:p2',
        method:[{
            name: 'get',
            functionName: 'params'
        }],
        path:'index',
        auth:[]
    },
    {
        url:'/users',
        method:[{
            name: 'get',
            functionName: 'testGet'
        }],
        path:'',
        auth:[auth['login']]
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
            functionName: 'getReg'
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