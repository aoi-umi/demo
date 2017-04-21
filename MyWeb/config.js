module.exports = {
    port:3009,
    cachePrefix: 'MyWeb',
    cookies: {
        user: 'MyWebUserCacheKey'
    },
    cacheTime: {
        user: 7200  //2h
    },
    mysql: {
        host: 'localhost',
        user: 'dev',
        password: 'dev#1234',
        database: 'myweb',
        port: 3306
    },
    memcache: {
        hostname: 'localhost:11211'
    },
    api:{

    }
}
