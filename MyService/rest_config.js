/**
 * Created by umi on 2017-5-29.
 */
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
        url:'/users',
        method:[{
            name: 'get',
            functionName: 'testGet'
        }],
        path:'',
        auth:['login']
    },
    {
        url:'/admin',
        method:[{
            name: 'get',
            functionName: ''
        }],
        path:'',
        auth:['login', 'admin']
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
        url:'/test1',
        method:[{
            name: 'get',
            functionName: 'testGet'
        }],
        path:'',
        auth:[],
    },
    {
        url:'/test2',
        method:[{
            name: 'get',
            functionName: ''
        }],
        path:'',
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