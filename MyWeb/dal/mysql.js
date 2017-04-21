var config = require('../config');

var pool = require('mysql').createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port
});

//事物处理
module.exports.getTransactionConnection = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err);
        }

        //使Json格式传入
        conn.config.queryFormat = function (query, values) {
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
        };

        conn.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            callback(null, conn);
        })
    });
}

//处理sql
module.exports.Sql = function (call, params, callback) {
    if (typeof  params === 'function') {
        callback = params;
        params = [];
    }

    pool.getConnection(function (err, conn) {
        if (err) {
            return callback(err);
        }
        try {
            //使Json格式传入
            conn.config.queryFormat = function (query, values) {
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
            };
            conn.query(call, params, function (err, results) {
                if (err) {
                    return callback(err);
                }
                conn.release();
                callback(null, results);
            });
        }
        catch (err) {
            callback(err);
        }
    });
}

//事物处理sql
module.exports.TransactionQuery = function (call, params, conn, callback) {
    if (typeof  params === 'function') {
        callback = params;
        params = [];
    }

    conn.query(call, params, function (err, results) {
        if (err) {
            callback(err);
        }
        callback(null, results);
    });
}
