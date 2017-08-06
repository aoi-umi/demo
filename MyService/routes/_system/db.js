/**
 * Created by bang on 2017-8-1.
 */

var q = require('q');
var common = require('./common');
var config = require('../../config');

var pool = require('mysql').createPool({
    host: config.datebase.host,
    user: config.datebase.user,
    password: config.datebase.password,
    database: config.datebase.database,
    port: config.datebase.port
});


var exports = module.exports;

exports.query = function (sql, params) {
    if(!params)
        params = [];

    var connection = null;
    return common.promise().then(function(){
        return getConnection();
    }).then(function(t){
        connection = t;
        return query(connection, sql, params);
    }).then(function(t){
        return (t);
    }).fail(function(e){
        common.writeError(e);
        throw e;
    }).finally(function(){
        release(connection);
    });
};

//事务处理
exports.tranConnect = function (queryFunction) {
    var connection = null;
    return common.promise().then(function(){
        return getConnection();
    }).then(function(t){
        connection = t;
        return beginTransaction(connection);
    }).then(function(t){
        var res = q.defer();
        queryFunction(connection)
            .then(res.resolve)
            .fail(res.reject);
        return res.promise;
    }).then(function(t){
        return commit(connection);
    }).fail(function(e) {
        rollback(connection);
        throw e;
    }).finally(function(){
        release(connection);
    });
};

exports.tranQuery = function (sql, params, conn) {
    if(!conn) {
        conn = params;
        params = [];
    }
    if(!params)
        params = [];

    var connection = conn;
    return common.promise().then(function(t){
        return query(connection, sql, params);
    }).then(function(t){
        return (t);
    }).fail(function(e){
        throw e;
    });
};

//exports.query('call p_auto_t_user_info_query(:id, :account, :password,:nickname, :auth, :edit_date,:create_date, :remark,:null_list, :page_size, :page_index)').then(function(t){
//    console.log(JSON.stringify(t))
//}).fail(function(e){
//    console.log(e)
//});
//事务处理
//var sql = 'call p_auto_t_user_info_query(:id, :account, :password,:nickname, :auth, :edit_date,:create_date, :remark,:null_list, :page_size, :page_index)';
//var sql = 'call p_auto_t_user_info_save(:id, :account, :password,:nickname, :auth, :edit_date,:create_date, :remark,:null_list)';
//var sqlArgs = {id:12, account:'account41', password:'123456', create_date:new Date()};
//exports.tranConnect(function(conn){
//    return common.promise().then(function(){
//        return exports.tranQuery(sql,sqlArgs, conn);
//    }).then(function(t){
//        console.log(JSON.stringify(t));
//        //throw 'rollback test';
//        return exports.tranQuery(sql,sqlArgs, conn);
//    }).then(function(t){
//        console.log(JSON.stringify(t));
//    });
//}).fail(function(e) {
//    console.log(e);
//});

function queryFormat(query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        else {
            return this.escape(null);
        }
        return txt;
    }.bind(this));
}

function getConnection(){
    return common.promise(pool, 'getConnection');
    // var res = q.defer();
    // pool.getConnection(function(e, t){
    //     if(e)
    //         res.reject(e);
    //     else
    //         res.resolve(t);
    // });
    // return res.promise;
}

function release(conn){
    if(conn && pool._freeConnections.indexOf(conn) == -1) {
        conn.release();
    }
}

function query(conn, sql, params){
    conn.config.queryFormat = queryFormat;
    var res = q.defer();
    conn.query(sql, params, function(e, t){
        if(e)
            res.reject(e);
        else
            res.resolve(t);
    });
    return res.promise;
}

function beginTransaction(conn){
    var res = q.defer();
    conn.beginTransaction(function(e, t){
        if(e)
            res.reject(e);
        else
            res.resolve(t);
    });
    return res.promise;
}

function commit(conn){
    console.log('commit');
    var res = q.defer();
    conn.commit(function(e, t){
        if(e)
            res.reject(e);
        else
            res.resolve(t);
    });
    return res.promise;
}

function rollback(conn){
    console.log('rollback');
    var res = q.defer();
    conn.rollback(function(e, t){
        if(e)
            res.reject(e);
        else
            res.resolve(t);
    });
    return res.promise;
}