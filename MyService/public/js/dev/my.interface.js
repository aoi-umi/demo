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

            mainContentQuery: {
                url: '/main_content/query'
            },
            mainContentSave: {
                url: '/main_content/save'
            },
            mainContentDetailQuery: {
                url: '/main_content/detailQuery'
            },
            mainContentDel: {
                url: '/main_content/del'
            },

            mainContentChildQuery: {
                url: '/main_content_child/query'
            },
            mainContentChildSave: {
                url: '/main_content_child/save'
            },
            mainContentChildDetailQuery: {
                url: '/main_content_child/detailQuery'
            },
            mainContentChildDel: {
                url: '/main_content_child/del'
            },

            mainContentLogQuery: {
                url: '/main_content_log/query'
            },
            mainContentLogSave: {
                url: '/main_content_log/save'
            },
            mainContentLogDetailQuery: {
                url: '/main_content_log/detailQuery'
            },
            mainContentLogDel: {
                url: '/main_content_log/del'
            },

            mainContentTypeIdQuery: {
                url: '/main_content_type_id/query'
            },
            mainContentTypeIdSave: {
                url: '/main_content_type_id/save'
            },
            mainContentTypeIdDetailQuery: {
                url: '/main_content_type_id/detailQuery'
            },
            mainContentTypeIdDel: {
                url: '/main_content_type_id/del'
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
                return common.ajax(opt);
            }`);
        }
    }
};