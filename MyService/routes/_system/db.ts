/**
 * Created by bang on 2017-8-1.
 */
import * as mysql from 'mysql';
import * as common from './common';
import config from '../../config';

let pool = mysql.createPool({
    host: config.datebase.host,
    user: config.datebase.user,
    password: config.datebase.password,
    database: config.datebase.database,
    port: config.datebase.port
});

export let query = function (sql, params, conn?) {
    if (!conn)
        return myQuery(sql, params);
    else
        return myTranQuery(sql, params, conn);
};

//事务连接
export let tranConnect = function (queryFunction) {
    var connection = null;
    return common.promise(function () {
        return getConnectionPromise();
    }).then(function (t) {
        connection = t;
        return beginTransactionPromise(connection);
    }).then(function (t) {
        return common.promise((def) => {
            queryFunction(connection)
                .then(def.resolve)
                .fail(def.reject);
            return def.promise;
        });
    }).then(function (t) {
        return commitPromise(connection);
    }).fail(function (e) {
        common.writeError(e);
        if (connection)
            rollbackPromise(connection);
        throw e;
    }).finally(function () {
        if (connection)
            releasePromise(connection);
    });
};

function myQuery(sql, params) {
    if (!params)
        params = [];

    var connection = null;
    return common.promise(function () {
        return getConnectionPromise();
    }).then(function (t) {
        connection = t;
        return queryPromise(connection, sql, params);
    }).then(function (t) {
        return (t);
    }).fail(function (e) {
        common.writeError(e);
        throw e;
    }).finally(function () {
        releasePromise(connection);
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
    return common.promise(function (t) {
        return queryPromise(connection, sql, params);
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
            var val = values[key];
            if (val && typeof val == 'object')
                val = JSON.stringify(val);
            return this.escape(val);
        }
        else {
            return this.escape(null);
        }
    }.bind(this));
}

function getConnectionPromise() {
    return common.promise(pool.getConnection, pool);
}

function releasePromise(conn: mysql.PoolConnection) {
    if (conn && pool['_freeConnections'].indexOf(conn) == -1) {
        conn.release();
    }
}

function queryPromise(conn: mysql.PoolConnection, sql, params) {
    conn.config.queryFormat = queryFormat;
    return common.promise(conn.query, conn, sql, params);
}

function beginTransactionPromise(conn: mysql.PoolConnection) {
    return common.promise(conn.beginTransaction, conn);
}

function commitPromise(conn: mysql.PoolConnection) {
    console.log('commit');
    return common.promise(conn.commit, conn);
}

function rollbackPromise(conn: mysql.PoolConnection) {
    console.log('rollback');
    return common.promise(conn.rollback, conn);
}