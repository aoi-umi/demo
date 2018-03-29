/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var auth = require('../_system/auth');
var autoBll = require('../bll/_auto');
var errorConfig = require('../_system/errorConfig');

//接口
exports.post = function (req, res, next) {
    common.promise().then(function () {
        req.params = {
            module: req.params[0],
            method: req.params[1]
        };
        return getBll(req, res, next);
    }).then(function (t) {
        res.mySend(null, t);
    }).fail(function (e) {
        res.mySend(e);
    });
};

function getBll(req, res, next) {
    var params = req.params;
    var args = req.body;
    var module = params.module;
    var method = params.method;
    console.log(`[module:${module}][method:${method}]`);
    var opt = {
        isCustom: isCustom(module, method)
    };

    if (!opt.isCustom)
        checkArgs({method: method, module: module, args: args});

    //不记录日志
    if (common.isInArray(module, ['log'])) {
        req.myData.noLog = true;
    }

    var reqModule = module;
    //转换为小写下划线;
    //module = common.stringToLowerCaseWithUnderscore(module);
    return common.promise().then(function () {
        if (opt.isCustom) {
            var exOpt = {
                user: req.myData.user,
                req: req
            };
            return autoBll.custom(module, method, args, exOpt);
        } else {
            var modulePath = path.resolve(__dirname + '/../dal/_auto/' + module + '.js');
            var isExist = fs.existsSync(modulePath);
            if (!isExist)
                throw common.error('file is not exist', errorConfig.BAD_REQUEST.code);
            if (!autoBll[method])
                throw common.error(`method[${method}] is not exist`, errorConfig.BAD_REQUEST.code);
            return autoBll[method](module, args);
        }
    }).then(function (t) {
        updateValue({
            t: t,
            module: reqModule,
            method: method,
            user: req.myData.user
        });
        return t;
    });
}

var isCustom = function (module, method) {
    //使用custom
    if (!common.isInArray(method, ['query', 'save', 'detailQuery', 'del'])
        || (module == 'onlineUser')
        || (module == 'log' && common.isInArray(method, ['query']))
        || (module == 'role' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (module == 'authority' && common.isInArray(method, ['query', 'save']))
        || (module == 'userInfo' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (module == 'mainContentType' && common.isInArray(method, ['save']))
        || (module == 'mainContent' && common.isInArray(method, ['query', 'save']))
    ) {
        return true;
    }
    return false;
};

var checkArgs = function (opt) {
    var method = opt.method;
    var module = opt.module;
    var args = opt.args;
    if (common.isInArray(method, ['query'])) {
        if (!args.pageIndex) args.pageIndex = 1;
        if (!args.pageSize) args.pageSize = 10;
    }
    if (common.isInArray(method, ['detailQuery'])) {
        var argsError = false;
        if (module == 'role') {
            if (!args.code)
                argsError = true;
        }
        else if (!args || !args.id)
            argsError = true;
        if (argsError)
            throw common.error('args error');
    }
};

var updateValue = function (opt) {
    var module = opt.module;
    var method = opt.method;
    var t = opt.t;

    var setDefault = true;
    if ((module == 'mainContent' && common.isInArray(method, ['query']))) {
        setDefault = false;
    }
    if (setDefault) {
        if (common.isInArray(method, ['query']) && t.list) {
            t.list.forEach(function (item) {
                setOperationDefault({item: item, user: opt.user});
            });
        } else if (common.isInArray(method, ['detailQuery']) && t) {
            setOperationDefault({item: t, user: opt.user});
        }
    }
};

var setOperationDefault = function (opt) {
    var item = opt.item;
    item.operation = [];
    if (auth.isHadAuthority(opt.user, 'login')) {
        item.operation.push('save');
    }
    if (auth.isHadAuthority(opt.user, 'admin')) {
        item.operation.push('del');
    }
}