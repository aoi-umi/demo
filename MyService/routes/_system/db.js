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

module.exports.Exec = function(){

}