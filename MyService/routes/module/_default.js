/**
 * Created by bang on 2017-9-7.
 */
var common = require('../_system/common');
var autoBll = require('../_bll/auto');

module.exports = {
    post: function (req, res) {
        var params = req.params;
        common.promise().then(function (e) {
            switch (params.method){
                case 'save':
                case 'del':
                case 'query':
                case 'detailQuery':
                    break;
                default: throw common.error('no match method[' + params.method + ']');
            }
            return getBll(params.module, params.method, req);
        }).then(function (t) {
            res.mySend(null, t);
        }).fail(function (e) {
            res.mySend(e);
        });
    }
};

function getBll(module, method, req){
    var args = req.body;
    var opt = {
        isUsedCustom: false
    };
    //使用custom
    if((module == 'log' && common.isInList(['query'], method))
    || (module == 'main_content_type' && common.isInList(['save'], method))
    ) {
        opt.isUsedCustom = true;
    }
    if(common.isInList(['detailQuery'], method)){
        if(!args || !args.id)
            throw common.error('args error');
    }

    //不记录日志
    if(module == 'log'){
        req.myData.noLog = true;
    }

    if(opt.isUsedCustom){
        return autoBll.custom(module, method, args);
    }else {
        return autoBll[method](module, args);
    }
}