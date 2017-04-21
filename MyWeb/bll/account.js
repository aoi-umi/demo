var account = require('../dal/account');

exports.detail_query = function (args, callback) {
    account.detail_query(args, function(err, result){
        //console.log(result)
        var list = result[0];
        var resData = list.length > 0 ? list[0] : null;
        callback(err, resData);
    });
}