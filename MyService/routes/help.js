var common = require('./_system/common');

var exports = module.exports;
var restConfig = require('../rest_config');
exports.get = function (req, res) {
    var restList = [];
    for (var i = 0; i < restConfig.length; i++) {
        var rest = restConfig[i];
        var isRouter = true;
        var method = rest.method;
        switch (method.name.toLowerCase()) {
            case 'get':
            case 'post':
                break;
            default:
                isRouter = false;
                break;
        }
        if (isRouter) {
            var exampleRequest = method.exampleRequest;
            if (typeof exampleRequest == 'object')
                exampleRequest = JSON.stringify(exampleRequest);
            restList.push({url: rest.url, method: method.name, exampleRequest: exampleRequest});
        }
    }

    var opt = {
        view: 'help',
        title: 'help',
        restList: restList
    };
    res.myRender('view', opt);
};
