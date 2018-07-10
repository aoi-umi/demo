import * as common from '../_system/common';
import * as main from '../_main';
export let get = function (opt, viewOpt) {
    var restList = [];
    var urlConfigs = main.accessableUrlConfig;
    for (var i = 0; i < urlConfigs.length; i++) {
        var urlConfig = urlConfigs[i];
        let method = /^\/interface\//.test(urlConfig.url) ? 'post' : 'get';
        restList.push({ url: urlConfig.url, method: method, });
    }
    viewOpt.title = 'help';
    viewOpt.restList = restList;
};
