/**
 * Created by umi on 2017-5-29.
 */
module.exports = {
    name:'MyService',
    port: 3010,
    deploy:'20170529',
    version:'0.0.1',
    env:'_dev',
    api:{
        testService:{
            host:'http://localhost:3010',
            test:{
                method:'/',
                isUsedHost:true,
            },
            test1:{
                method:'http://localhost:3009',
                isUsedHost:false,
            },
        }
    }
};