/**
 * Created by bang on 2017-9-7.
 */
import { Request, Response } from 'express';
import * as common from '../_system/common';
import * as auth from '../_system/auth';
import * as autoBll from '../bll/_auto';

//接口
export let post = function (req: Request, res: Response, next) {
    req.myData.method.methodName = 'module-interface';
    common.promise(function () {
        req.params = {
            module: req.params[0],
            method: req.params[1]
        };
        return getBll(req, res, next);
    }).fail(function (e) {
        res.mySend(e);
    });
};

function getBll(req: Request, res: Response, next) {
    var params = req.params;
    var args = req.body;
    var moduleName = params.module;
    var method = params.method;
    console.log(`[module:${moduleName}][method:${method}]`);
    var opt = {
        isCustom: isCustom(moduleName, method)
    };

    if (!opt.isCustom)
        checkArgs({method: method, module: moduleName, args: args});

    //不记录日志
    if (common.isInArray(moduleName, ['log'])) {
        req.myData.noLog = true;
    }

    let toNext = false;
    return common.promise(function () {
        if (opt.isCustom) {
            var exOpt = {
                user: req.myData.user,
                req: req
            };
            let bll = autoBll.getRequire(moduleName, {type: 'bll', notThrowError: true});
            if (!bll || !bll[method]) {
                toNext = true;
                return;
            }
            return bll[method](args, exOpt);
        } else {
            let bll = autoBll.getRequire(moduleName, {notThrowError: true});
            if (!bll || !bll[method]) {
                toNext = true;
                return;
            }
            return autoBll[method](moduleName, args);
        }
    }).then(function (t) {
        if (!toNext) {
            updateValue({
                t: t,
                module: moduleName,
                method: method,
                myData: req.myData,
                noOperation: args.noOperation,
            });
            res.mySend(null, t);
        } else {
            next();
        }
    });
}

var isCustom = function (moduleName, method) {
    //使用custom
    if (!common.isInArray(method, ['query', 'save', 'detailQuery', 'del'])
        || (moduleName == 'onlineUser')
        || (moduleName == 'log' && common.isInArray(method, ['query']))
        || (moduleName == 'role' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (moduleName == 'authority' && common.isInArray(method, ['query', 'save']))
        || (moduleName == 'userInfo' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (moduleName == 'mainContentType' && common.isInArray(method, ['save']))
        || (moduleName == 'mainContent' && common.isInArray(method, ['query', 'save']))
        || (moduleName == 'struct' && common.isInArray(method, ['save']))
    ) {
        return true;
    }
    return false;
};

var checkArgs = function (opt) {
    var method = opt.method;
    var moduleName = opt.module;
    var args = opt.args;
    if (!(
            (moduleName == 'mainContentType' && common.isInArray(method, ['query']))
            || (moduleName == 'struct' && common.isInArray(method, ['query']))
        )) {
        if (!args.pageIndex)
            args.pageIndex = 1;
        if (!args.pageSize)
            args.pageSize = 10;
        if (args.pageSize > 50)
            args.pageSize = 50;
    }
    if (common.isInArray(method, ['detailQuery'])) {
        var argsError = false;
        if (moduleName == 'role') {
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

    if(!opt.noOperation) {
        if (common.isInArray(method, ['query']) && t.list) {
            t.list.forEach(function (item) {
                setOperationDefault({item: item, user: opt.myData.user});
            });
        } else if (common.isInArray(method, ['detailQuery']) && t) {
            setOperationDefault({item: t, user: opt.myData.user});
        }
    }
};

var setOperationDefault = function (opt) {
    var item = opt.item;
    if (!item.operation) {
        item.operation = [];
        if (auth.isHadAuthority(opt.user, 'login')) {
            item.operation.push('save');
        }
        if (auth.isHadAuthority(opt.user, 'admin')) {
            item.operation.push('del');
        }
    }
};