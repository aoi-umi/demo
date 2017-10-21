/**
 * Created by bang on 2017-9-11.
 */
namespace('my.interface');
my.interface = {
    opt: {
        interfaceConfig: {
            login: {
                url: '/login'
            },
            logQuery: {
                url: '/log/query'
            },
            mainContentTypeQuery: {
                url: '/main_content_type/query'
            },
            mainContentTypeSave: {
                url: '/main_content_type/save'
            },
            mainContentTypeDetailQuery: {
                url: '/main_content_type/detailQuery'
            },
            mainContentTypeDel: {
                url: '/main_content_type/del'
            }
        }
    },
    init: function () {
        var self = this;
        var interfaceConfig = this.opt.interfaceConfig;
        for (var key in interfaceConfig) {
            if (self[key])
                throw new Error('interface [' + key + '] is exist!');
            eval(`self['${key}'] = function(data, option) {
                var url = '${interfaceConfig[key].url}';
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