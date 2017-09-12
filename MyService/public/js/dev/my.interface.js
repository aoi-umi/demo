/**
 * Created by bang on 2017-9-11.
 */
namespace('my.interface');
my.interface = {
    opt: {
        interfaceList: {
            login: {
                url: '/login'
            },
            logQuery: {
                url: '/log/query'
            }
        }
    },
    init: function () {
        var self = this;
        var interfaceList = this.opt.interfaceList;
        for (var key in interfaceList) {
            if (self[key])
                throw new Error('interface [' + key + '] is exist!');
            eval(`self['${key}'] = function(data, option) {
                var url = '${interfaceList[key].url}';
                var opt = {
                    url: url,
                    data: data,
                };
                if (option) opt = $.extend(opt, option);
                return extend.ajax(opt);
            }`);
        }
    }
};
my.interface.init();