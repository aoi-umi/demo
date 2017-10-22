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

exports.query = function (sql, params, conn) {
    if (!conn)
        return myQuery(sql, params);
    else
        return myTranQuery(sql, params, conn);
};

//事务连接
exports.tranConnect = function (queryFunction) {
    var connection = null;
    return common.promise().then(function () {
        return getConnection();
    }).then(function (t) {
        connection = t;
        return beginTransaction(connection);
    }).then(function (t) {
        var res = q.defer();
        queryFunction(connection)
            .then(res.resolve)
            .fail(res.reject);
        return res.promise;
    }).then(function (t) {
        return commit(connection);
    }).fail(function (e) {
        if (connection)
            rollback(connection);
        throw e;
    }).finally(function () {
        if (connection)
            release(connection);
    });
};

function myQuery(sql, params) {
    if (!params)
        params = [];

    var connection = null;
    return common.promise().then(function () {
        return getConnection();
    }).then(function (t) {
        connection = t;
        return query(connection, sql, params);
    }).then(function (t) {
        return (t);
    }).fail(function (e) {
        common.writeError(e);
        throw e;
    }).finally(function () {
        release(connection);
    });
}

function myTranQuery(sql, params, conn) {
    if (!conn) {
        conn = params;
        params = [];
    }
    if (!params)
        params = [];

    var connection = conn;
    return common.promise().then(function (t) {
        return query(connection, sql, params);
    }).then(function (t) {
        return (t);
    }).fail(function (e) {
        throw e;
    });
}

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
}

function release(conn){
    if(conn && pool._freeConnections.indexOf(conn) == -1) {
        conn.release();
    }
}

function query(conn, sql, params){
    conn.config.queryFormat = queryFormat;
    return common.promise(conn, 'query', sql, params);
}

function beginTransaction(conn){
    var res = q.defer();
    return common.promise(conn, 'beginTransaction');
}

function commit(conn){
    console.log('commit');
    return common.promise(conn, 'commit');
}

function rollback(conn){
    console.log('rollback');
    return common.promise(conn, 'rollback');
}