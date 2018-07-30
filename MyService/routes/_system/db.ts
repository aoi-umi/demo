/**
 * Created by bang on 2017-8-1.
 */
import * as mysql from 'mysql';
import * as common from './common';
import errorConfig from './errorConfig';
import config from '../../config';

let pool = mysql.createPool({
    host: config.datebase.host,
    user: config.datebase.user,
    password: config.datebase.password,
    database: config.datebase.database,
    port: config.datebase.port
});

export let query = function (sql, params, conn?) {
    return common.promise(() => {
        if (!conn)
            return myQuery(sql, params);
        else
            return myTranQuery(sql, params, conn);
    }).fail(e => {
        common.writeError(e);
        throw common.error(null, errorConfig.DB_ERROR);
    });
};

//事务连接
export let tranConnect = function (queryFunction) {
    var connection = null;
    return common.promise(async function () {
        connection = await getConnectionPromise();
        await beginTransactionPromise(connection);
        let result = await queryFunction(connection);
        await commitPromise(connection);
        return result;
    }).fail(async function (e) {
        common.writeError(e);
        if (connection)
            await rollbackPromise(connection);
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
    return common.promise(async function () {
        connection = await getConnectionPromise();
        return queryPromise(connection, sql, params);
    }).fail(function (e) {
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
    let escape = this.escape.bind(this);
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if(!values.hasOwnProperty(key))
            return null;
        var val = values[key];
        if (val) {
            if (val instanceof Date)
                val = common.dateFormat(val, 'yyyy-MM-dd HH:mm:ss');
            if (typeof val == 'object')
                val = JSON.stringify(val);
        }
        return escape(val);        
    });
}

function getConnectionPromise() {
    return common.promise(pool.getConnection, pool, true);
}

function releasePromise(conn: mysql.PoolConnection) {
    return common.promise(()=>{
        if (conn && pool['_freeConnections'].indexOf(conn) == -1) {
            conn.release();
        }
    });
}

function queryPromise(conn: mysql.PoolConnection, sql, params) {
    conn.config.queryFormat = queryFormat;
    return common.promise(conn.query, conn, true, [sql, params]).spread(t => {
        return t;
    });
}

function beginTransactionPromise(conn: mysql.PoolConnection) {
    return common.promise(conn.beginTransaction, conn, true);
}

function commitPromise(conn: mysql.PoolConnection) {
    console.log('commit');
    return common.promise(conn.commit, conn, true);
}

function rollbackPromise(conn: mysql.PoolConnection) {
    console.log('rollback');
    return common.promise(conn.rollback, conn, true);
}