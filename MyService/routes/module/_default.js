/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var auth = require('../_system/auth');
var myEnum = require('../_system/enum');
var main = require('../_system/_main');
var autoBll = require('../bll/auto');
var errorConfig = require('../_system/errorConfig');

//module post 接口
exports.default = function (req, res, next) {
    common.promise().then(function () {
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
        isCustom: false
    };

    //使用custom
    if (!common.isInArray(method, ['query', 'save', 'detailQuery', 'del'])
        || (module == 'log' && common.isInArray(method, ['query']))
        || (module == 'role' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (module == 'authority' && common.isInArray(method, ['query', 'save']))
        || (module == 'userInfo' && common.isInArray(method, ['query', 'save', 'detailQuery']))
        || (module == 'mainContentType' && common.isInArray(method, ['save']))
        || (module == 'mainContent' && common.isInArray(method, ['query', 'save']))
    ) {
        opt.isCustom = true;
    }
    checkArgs({method: method, module: module, args: args});

    //不记录日志
    if (common.isInArray(module, ['log'])) {
        req.myData.noLog = true;
    }

    var reqModule = module;
    //转换为小写下划线;
    module = common.stringToLowerCaseWithUnderscore(module);
    return common.promise().then(function () {
        if (opt.isCustom) {
            var exOpt = {
                user: req.myData.user
            };
            return autoBll.custom(module, method, args, exOpt);
        } else {
            var modulePath = path.resolve(__dirname + '/../dal/' + module + '_auto.js');
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

//页面 get
exports.view = function (req, res, next) {
    var pathname = req._parsedUrl.pathname;
    var opt = {
        view: pathname,
        user: req.myData.user,
    }
    //console.log(req.originalUrl, req._parsedUrl.pathname)
    switch (pathname) {
        case '/':
            opt.view = '/index';
            break;
    }

    var moduleViewPath = path.join(req.myData.viewPath, 'module', opt.view + '.ejs');
    var isExist = fs.existsSync(moduleViewPath);
    if (!isExist)
        return next();

    var query = req.query;
    var user = req.myData.user;
    common.promise().then(function () {
        switch (opt.view) {
            case '/status':
                opt.enumDict = main.enumDict;
                opt.enumChangeDict = main.enumChangeDict;
                break;

            case '/userInfo/detail':
                var userInfoId = user.id;
                if (query.id && query.id != userInfoId) {
                    auth.isHadAuthority(user, 'admin', {throwError: true});
                    userInfoId = query.id;
                }
                return autoBll.custom('user_info', 'detailQuery', {id: userInfoId}).then(function (t) {
                    opt.userInfoDetail = t;
                });
                break;

            case '/mainContent/list':
                opt.mainContentStatusEnum = myEnum.getEnum('main_content_status_enum');
                opt.mainContentTypeEnum = myEnum.getEnum('main_content_type_enum');
                break;
            case '/mainContent/detail':
                return require('./mainContent').detailQuery({id: query.id}, opt);
                break;
        }
    }).then(function () {
        res.myRender('view', opt);
    }).fail(function (e) {
        next(e);
    });
};

var checkArgs = function (opt) {
    var method = opt.method;
    var module = opt.module;
    var args = opt.args;
    if (common.isInArray(method, ['query'])) {
        if (!args.page_index) args.page_index = 1;
        if (!args.page_size) args.page_size = 10;
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
    if (module == 'role' && method == 'detailQuery') {
        delete t.role_authority_id_list;
    }
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