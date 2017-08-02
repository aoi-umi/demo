/**
 * Created by bang on 2017-8-1.
 */
var config = require('../../config');

var pool = require('mysql').createPool({
    host: config.datebase.host,
    user: config.datebase.user,
    password: config.datebase.password,
    database: config.datebase.database,
    port: config.datebase.port
});

//事务处理
module.exports.TransExec = function (sql, params, conn, callback) {
    if (typeof  params === 'function') {
        callback = params;
        params = [];
    }

    conn.query(sql, params, function (err, results) {
        if (err) {
            callback(err);
        }
        callback(null, results);
    });
}