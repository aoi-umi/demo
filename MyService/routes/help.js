var common = require('./_system/common');

var exports = module.exports;
var restConfig = require('./_system/restConfig');
exports.get = function (req, res) {
    var restList = [];
    for (var i = 0; i < restConfig.length; i++) {
        var rest = restConfig[i];
        var isRouter = true;
        if(!rest.method)
            rest.method = 'post';
        switch (rest.method.toLowerCase()) {
            case 'get':
            case 'post':
                break;
            default:
                isRouter = false;
                break;
        }
        if (isRouter) {
            var exampleRequest = rest.exampleRequest;
            if (typeof exampleRequest == 'object')
                exampleRequest = JSON.stringify(exampleRequest);
            restList.push({url: rest.url, method: rest.method, exampleRequest: exampleRequest});
        }
    }

    var opt = {
        view: 'help',
        title: 'help',
        restList: restList
    };
    res.myRender('view', opt);
};
