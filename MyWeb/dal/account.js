var mysql = require('./mysql.js');

exports.detail_query = function (args, callback) {
    //mysql.Sql("call p_account_detail_query(:id)", args, callback);
    mysql.Sql("call p_account_detail_query(:account, :password)", args, callback);
}