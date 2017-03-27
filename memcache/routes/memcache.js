var Memcached = require('memcached');

var memcached;
exports.link = function(host){
    memcached = new Memcached(host);
};

exports.set = function (key, value, seconds, cb) {
    memcached.set(key, value, seconds, cb);
};

exports.get = function (key, cb) {
    memcached.get(key, cb);
};

exports.delete = function(key, cb){
    memcached.del(key, cb);
}

exports.getItems = function(args, cb) {
    memcached.items(function (err, result) {
        if (err) return cb(err);
        //console.log(JSON.stringify((result)))
        // for each server...
        var list = [];
        var totalCount = 0, finishedCount = 0;
        result.forEach(function (itemSet) {
            var keys = Object.keys(itemSet);
            totalCount += keys.length - 1;
        });
        result.forEach(function (itemSet) {
            var keys = Object.keys(itemSet);
            keys.pop(); // we don't need the "server" key, but the other indicate the slab id's

            if(!keys.length) return cb(null, list);
            keys.forEach(function (stats) {

                // get a cachedump for each slabid and slab.number
                memcached.cachedump(itemSet.server, parseInt(stats), parseInt(itemSet[stats].number), function (err, response) {
                    // dump the shizzle
                    if (err) {
                        list.push({success: 0, data: err});
                    } else if(response){
                        if(isArray(response)){
                            response.forEach(function(eachRes){
                                if(eachRes.key && (!args || !args.key || eachRes.key.indexOf(args.key) >= 0))
                                    list.push({success: 1, data: {
                                        slabid: stats,
                                        number: itemSet[stats].number,
                                        key: eachRes.key
                                    }});
                            });
                        }else if(response.key && (!args || !args.key || response.key.indexOf(args.key) >= 0)) {
                            //console.log(response)
                            list.push({
                                success: 1, data: {
                                    slabid: stats,
                                    number: itemSet[stats].number,
                                    key: response.key
                                }
                            });
                        }
                    }
                    ++finishedCount;
                    if(finishedCount == totalCount){
                        cb(null, list);
                    }
                });
            })
        });
    });
}

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}