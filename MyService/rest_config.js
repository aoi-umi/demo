/**
 * Created by umi on 2017-5-29.
 */
module.exports = [
    {
        url:'/',
        method:['get', 'post'],
        path:'index',
        auth:[],
    },
    {
        url:'/users',
        method:['get'],
        path:'',
        auth:['login']
    },
    {
        url:'/admin',
        method:['get'],
        path:'',
        auth:['login', 'admin']
    },
    {
        url:'/test',
        method:['get'],
        path:'',
        auth:[],
    },
    {
        url:'/test1',
        method:['get'],
        path:'',
        auth:[],
    },
    {
        url:'/test2',
        method:['get'],
        path:'',
        auth:[],
    },
];