var redis = require('redis');
var config = require('../../config');

var client  = redis.createClient(config.redis.port, config.redis.host);
var cachePrefix = config.cachePrefix ? config.cachePrefix + '_' : '';

client.on('error', function (err) {
    console.error('Cache Error [' + err + ']');
});

exports.get = function(key, cb){
    client.get(cachePrefix + key, function(err, result){
        if(result && typeof result == 'string') {
            try {
                result = JSON.parse(result);
            }
            catch (e) {
            }
        }
        cb(err, result);
    });
}
//timeout seconds
exports.set = function(key, value, expire, cb){
    if(typeof expire == 'function') {
        cb = expire;
        expire = 0;
    }
    if(typeof value == 'object') value = JSON.stringify(value);
    client.set(cachePrefix + key, value, cb);
    if(expire)
        client.expire(cachePrefix + key, expire)
}

exports.del = function(key, cb){
    client.del(cachePrefix + key, cb);
}

exports.keys = function(key, cb){
    client.keys(key, cb);
}

//exports.set('foo', {bar:'bar'}, 1, function(err, result) {
//    console.log(err, result)
//});
//
//exports.keys('*', function(err, result) {
//    console.log(err, result)
//});
//
//exports.get('foo', function(err, result) {
//    console.log(err, result)
//});
////setTimeout(function(){
////    exports.del('foo', function(err, result) {
////        console.log('del', err, result)
////    });
////},1000);
//setTimeout(function(){
//    exports.get('foo', function(err, result) {
//        console.log(err, result)
//    });
//},2000);