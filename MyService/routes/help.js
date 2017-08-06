var common = require('./_system/common');

var exports = module.exports;
var restConfig = require('../rest_config');
exports.get = function (req, res) {
    var restList = [];
    for (var i = 0; i < restConfig.length; i++) {
        var rest = restConfig[i];
        for (var imethod = 0; imethod < rest.method.length; imethod++) {
            var isRouter = true;
            var method = rest.method[imethod];
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
    }
    res.render('help', common.formatViewtRes({title: 'help', restList: restList}));
};
